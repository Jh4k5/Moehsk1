#!/usr/bin/env node
// ─── [2.8] Does the lesson actually run in teaching order? ──────────────────
//
// Reads the same stage table the screens read (`lesson-stages.ts`) and asserts
// that no unit's activity stream asks before it teaches — «الشرح قبل التمرين»
// as a build gate rather than as an intention.
//
//   node scripts/check-stages.js

const { load } = require('./ts-load.js')
const { unitsGenerated } = load('src/data/units/units.generated.ts')
const { buildActivityStream } = load('src/lib/curriculum/activity-engine.ts')
const { levelContent } = load('src/lib/curriculum/content-source.ts')
const { emptyLearnerState } = load('src/lib/curriculum/types.ts')
const { validateStages } = load('src/lib/curriculum/lesson-stages.ts')

let bad = 0
let total = 0
let allViolations = 0
const byKind = new Map()
const samples = []

for (const unit of unitsGenerated) {
  let stream
  try {
    stream = buildActivityStream(unit, emptyLearnerState(7), levelContent(unit.ref.level))
  } catch (error) {
    console.log(`  ! ${unit.key} threw: ${error.message}`)
    continue
  }
  total += 1
  const violations = validateStages(stream)
  if (violations.length === 0) continue

  bad += 1
  allViolations += violations.length
  if (samples.length < 3) samples.push({ unit: unit.key, first: violations.slice(0, 2) })
  for (const v of violations) byKind.set(v.kind, (byKind.get(v.kind) ?? 0) + 1)
}

console.log(`\nstages: ${total} units built`)
console.log(`  · ${bad} with a stage-order violation`)
console.log(`  · ${allViolations} violations in total`)
for (const [kind, n] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`      ${String(n).padStart(5)}  ${kind}`)
}
for (const s of samples) {
  console.log(`\n  ${s.unit}`)
  for (const v of s.first) console.log(`      ${v.message}`)
}

if (bad === 0) {
  console.log('\n\u2713 every unit teaches before it asks')
  process.exit(0)
}
console.log(`\n\u2717 ${bad} of ${total} units ask before they teach`)
process.exit(1)
