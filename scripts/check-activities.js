#!/usr/bin/env node
// ─── Does the engine produce a usable stream for every unit? ────────────────
//
// Runs `buildActivityStream` over all 191 units and asserts the properties the
// engine promises. A unit that produces a broken drill is worse than one that
// produces a short stream, so every check below is a hard failure:
//
//   * every activity has a unique, stable id
//   * every multiple-choice question has ≥2 options and a correct index
//     pointing at a real one, and no two options are identical
//   * no kind runs more than MAX_KIND_RUN times consecutively
//   * every new word of the unit is introduced before it is ever asked for
//   * the stream is deterministic: two builds with one seed are identical
//
// It also reports coverage — which of the 17 kinds each level can actually
// produce — because a kind that never appears means content is missing, and
// that should be visible rather than silently absent.

const { load } = require('./ts-load')

const { unitsGenerated } = load('src/data/units/units.generated.ts')
const { buildActivityStream } = load('src/lib/curriculum/activity-engine.ts')
const { levelContent } = load('src/lib/curriculum/content-source.ts')
const { emptyLearnerState, MAX_KIND_RUN, ACTIVITY_KINDS } = load('src/lib/curriculum/types.ts')

const failures = []
const kindsByLevel = { 1: new Set(), 2: new Set(), 3: new Set() }
const lengths = []
let totalActivities = 0

for (const unit of unitsGenerated) {
  const where = `unit ${unit.key} (${unit.title})`
  const learner = emptyLearnerState(7)
  const stream = buildActivityStream(unit, learner, levelContent(unit.ref.level))

  if (stream.length === 0) { failures.push(`${where}: produced NO activities`); continue }
  lengths.push(stream.length)
  totalActivities += stream.length

  const ids = new Set()
  let introduced = new Set()
  let run = 0
  let prevKind = null

  for (const a of stream) {
    kindsByLevel[unit.ref.level].add(a.kind)

    if (ids.has(a.id)) failures.push(`${where}: duplicate activity id ${a.id}`)
    ids.add(a.id)

    if (a.kind === prevKind) { run++ } else { run = 1; prevKind = a.kind }
    if (run > MAX_KIND_RUN) failures.push(`${where}: ${a.kind} repeats ${run}× in a row at index ${a.index}`)

    const q = a.question
    if (q) {
      if (!Array.isArray(q.choices) || q.choices.length < 2) {
        failures.push(`${where}: ${a.kind} at ${a.index} has ${q.choices?.length ?? 0} choice(s)`)
      } else {
        if (!(q.correct >= 0 && q.correct < q.choices.length)) {
          failures.push(`${where}: ${a.kind} at ${a.index} correct=${q.correct} is out of range`)
        }
        const labels = q.choices.map((c) => c.label)
        if (new Set(labels).size !== labels.length) {
          failures.push(`${where}: ${a.kind} at ${a.index} has duplicate options: ${labels.join(' / ')}`)
        }
        if (labels.some((l) => !l)) {
          failures.push(`${where}: ${a.kind} at ${a.index} has an empty option`)
        }
      }
    }

    // Recognition/production may only ask about a word already presented,
    // or one deliberately pulled in for review/remediation.
    if (a.kind === 'word-intro') introduced.add(a.word.id)
    else if (a.source === 'new' && a.wordIds?.length) {
      for (const id of a.wordIds) {
        if (!introduced.has(id)) {
          failures.push(`${where}: ${a.kind} at ${a.index} asks for word ${id} before introducing it`)
        }
      }
    }
  }

  // Determinism: same seed, same stream.
  const again = buildActivityStream(unit, emptyLearnerState(7), levelContent(unit.ref.level))
  if (JSON.stringify(again) !== JSON.stringify(stream)) {
    failures.push(`${where}: NOT deterministic — two builds with seed 7 differ`)
  }
}

lengths.sort((a, b) => a - b)
const median = lengths[Math.floor(lengths.length / 2)]
console.log(`units: ${unitsGenerated.length} | activities: ${totalActivities} | per unit: min ${lengths[0]}, median ${median}, max ${lengths[lengths.length - 1]}`)

console.log('\nkind coverage per level:')
for (const kind of ACTIVITY_KINDS) {
  const marks = [1, 2, 3].map((l) => (kindsByLevel[l].has(kind) ? '✓' : '·')).join(' ')
  console.log(`  ${marks}   ${kind}`)
}
console.log('  (columns: HSK1 HSK2 HSK3 — "·" means the level has no content for that kind yet)')

if (failures.length) {
  console.log(`\n✗ ${failures.length} failure(s):`)
  for (const f of failures.slice(0, 40)) console.log('   ' + f)
  if (failures.length > 40) console.log(`   … and ${failures.length - 40} more`)
  process.exit(1)
}
console.log('\n✓ every unit builds a valid, deterministic stream')
