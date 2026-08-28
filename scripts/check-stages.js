#!/usr/bin/env node
// ─── [2.8] Does the lesson actually run in teaching order? ──────────────────
//
// Reads the same stage table the screens read (`lesson-stages.ts`) and asserts
// that no unit's activity stream asks before it teaches.
//
// This is «الشرح قبل التمرين» as a build gate rather than as an intention.
//
// Run it on its own:  node scripts/check-stages.js
//
const { load } = require('./ts-load.js')
const { unitsGenerated } = load('src/data/units/units.generated.ts')
const { buildActivityStream } = load('src/lib/curriculum/activity-engine.ts')
const { levelContent } = load('src/lib/curriculum/content-source.ts')
const { emptyLearnerState } = load('src/lib/curriculum/types.ts')
const { validateStages, stageOfKind } = load('src/lib/curriculum/lesson-stages.ts')

let bad = 0, total = 0, allViol = 0
const byKind = new Map()
const samples = []
for (const u of unitsGenerated) {
  const content = levelContent(u.ref.level)
  let stream
  try { stream = buildActivityStream(u, emptyLearnerState(7), content) }
  catch (e) { console.log("THROW", u.key, e.message); continue }
  const kinds = stream.map((a) => a.kind)
  const v = validateStages(kinds)
  total += 1
  if (v.length) {
    bad += 1; allViol += v.length
    if (samples.length < 4) samples.push({ unit: u.key, first: v.slice(0, 2).map(x => x.message) })
    for (const x of v) byKind.set(x.kind, (byKind.get(x.kind) || 0) + 1)
  }
}
console.log(`\nunits with a stage-order violation: ${bad} of ${total}`)
console.log(`total violations: ${allViol}`)
console.log('by kind:', [...byKind.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8))
for (const s of samples) { console.log('\n' + s.unit); s.first.forEach(m => console.log('   ' + m)) }
const { load } = require('./ts-load.js')
const { unitsGenerated } = load('src/data/units/units.generated.ts')
const { buildActivityStream } = load('src/lib/curriculum/activity-engine.ts')
const { levelContent } = load('src/lib/curriculum/content-source.ts')
const { emptyLearnerState } = load('src/lib/curriculum/types.ts')
const { validateStages, stageOfKind } = load('src/lib/curriculum/lesson-stages.ts')

let bad = 0, total = 0, allViol = 0
const byKind = new Map()
const samples = []
for (const u of unitsGenerated) {
  const content = levelContent(u.ref.level)
  let stream
  try { stream = buildActivityStream(u, emptyLearnerState(7), content) }
  catch (e) { console.log("THROW", u.key, e.message); continue }
  const kinds = stream.map((a) => a.kind)
  const v = validateStages(kinds)
  total += 1
  if (v.length) {
    bad += 1; allViol += v.length
    if (samples.length < 4) samples.push({ unit: u.key, first: v.slice(0, 2).map(x => x.message) })
    for (const x of v) byKind.set(x.kind, (byKind.get(x.kind) || 0) + 1)
  }
}
console.log(`\nunits with a stage-order violation: ${bad} of ${total}`)
console.log(`total violations: ${allViol}`)
console.log('by kind:', [...byKind.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8))
for (const s of samples) { console.log('\n' + s.unit); s.first.forEach(m => console.log('   ' + m)) }
