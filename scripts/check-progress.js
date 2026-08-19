#!/usr/bin/env node
// ─── Can a learner actually finish, unlock and win anything? ────────────────
//
// Simulates a learner walking the path from zero and asserts the promises the
// progress model makes:
//
//   * only the first unit of a level is open at the start, and exactly one more
//     opens per completed unit — nothing further ahead
//   * a level is finishable: walking it end to end reaches 100%
//   * every achievement is reachable — all ten used to be permanently locked
//     because they read localStorage keys nothing wrote
//
// The third check is the point: a badge nobody can ever win is worse than no
// badge, and nothing in a type system catches it.

const { load } = require('./ts-load')

const { UNITS_BY_LEVEL } = load('src/lib/curriculum/index.ts')
const { isUnitUnlocked, nextUnitFor, levelProgress, unitPassed } = load('src/lib/curriculum/progress.ts')
const { ACHIEVEMENTS } = load('src/data/achievements.ts')

const failures = []
const notes = []

// ── Unlocking ───────────────────────────────────────────────────────────────
for (const level of [1, 2, 3]) {
  const order = UNITS_BY_LEVEL[level] ?? []
  if (order.length === 0) { failures.push(`level ${level}: no units`); continue }

  const progress = {}
  if (!isUnitUnlocked(order[0].ref, progress)) failures.push(`level ${level}: first unit is locked at the start`)
  if (order[1] && isUnitUnlocked(order[1].ref, progress)) failures.push(`level ${level}: second unit is open before the first is done`)
  if (order[5] && isUnitUnlocked(order[5].ref, progress)) failures.push(`level ${level}: unit 6 is open at the start — the path is not sequential`)

  // Walk it.
  for (const [i, unit] of order.entries()) {
    if (!isUnitUnlocked(unit.ref, progress)) {
      failures.push(`level ${level}: unit ${unit.key} (#${i + 1}) never unlocked while walking in order`)
      break
    }
    progress[unit.key] = { key: unit.key, correct: 10, scored: 10, completedAt: new Date().toISOString() }
  }
  const done = levelProgress(level, progress)
  if (done.percent !== 100) failures.push(`level ${level}: walking every unit reached ${done.percent}%, not 100%`)
  if (nextUnitFor(level, progress) !== null) failures.push(`level ${level}: still proposes a next unit after finishing`)
}

// ── The pass bar ────────────────────────────────────────────────────────────
if (unitPassed(6, 10)) failures.push('a 60% unit counted as passed (the bar is 70%)')
if (!unitPassed(7, 10)) failures.push('a 70% unit did not count as passed')
if (!unitPassed(0, 0)) failures.push('a unit with nothing to grade did not count as finished')

// ── Achievements ────────────────────────────────────────────────────────────
// The state of someone who has genuinely finished HSK1: every unit done, every
// word carded, a long streak. If a badge is still locked here it cannot be won.
const allUnits = {}
for (const u of UNITS_BY_LEVEL[1] ?? []) {
  allUnits[u.key] = { key: u.key, correct: 10, scored: 10, completedAt: new Date().toISOString() }
}
const srsCards = {}
for (let i = 1; i <= 405; i++) srsCards[i] = { wordId: i }

const finished = {
  srsCards,
  learnedWords: Object.keys(srsCards).map(Number),
  dailyStreak: 40,
  unitProgress: allUnits,
  quizHistory: [],
  completedStories: [],
}
const empty = { srsCards: {}, learnedWords: [], dailyStreak: 0, unitProgress: {}, quizHistory: [], completedStories: [] }

for (const a of ACHIEVEMENTS) {
  let won, atStart
  try { won = a.checkCondition(finished) } catch (e) { failures.push(`achievement "${a.id}" threw: ${e.message}`); continue }
  try { atStart = a.checkCondition(empty) } catch (e) { failures.push(`achievement "${a.id}" threw on empty state: ${e.message}`); continue }
  if (!won) failures.push(`achievement "${a.id}" (${a.titleAr}) is UNWINNABLE — still locked after finishing all of HSK1`)
  if (atStart) failures.push(`achievement "${a.id}" (${a.titleAr}) is granted before studying anything`)
}

// ── The daily-goal counter ──────────────────────────────────────────────────
// The home screen draws its goal ring from `dailyActivity[today].wordsLearned`.
// That number was never incremented by anything, anywhere, so the ring sat at
// 0% for every learner however much they studied — one of the three "systems
// that pretend to work" the plan set out to fix, and the last to be caught.
{
  global.window = undefined
  global.localStorage = {
    _d: {},
    getItem(k) { return this._d[k] ?? null },
    setItem(k, v) { this._d[k] = String(v) },
    removeItem(k) { delete this._d[k] },
  }
  // Quiet: zustand's persist middleware complains about the stub storage on
  // every write. Expected, and it would bury the actual result.
  const { warn, error } = console
  console.warn = () => {}
  console.error = () => {}
  const { useLearningStore } = load('src/lib/store.ts')

  const today = new Date().toDateString()
  const s = useLearningStore.getState()
  s.toggleLearned(901)
  s.toggleLearned(902)
  s.toggleLearned(903)
  const counted = useLearningStore.getState().dailyActivity[today]?.wordsLearned ?? 0
  if (counted !== 3) failures.push(`daily goal: three new words counted as ${counted} — the ring cannot move`)

  useLearningStore.getState().toggleLearned(901)
  const afterUnlearn = useLearningStore.getState().dailyActivity[today]?.wordsLearned ?? 0
  if (afterUnlearn !== 3) failures.push(`daily goal: un-learning a word changed today's count to ${afterUnlearn} — the day's history must not rewrite itself`)

  console.warn = warn
  console.error = error
  notes.push('daily-goal counter moves on a new word and does not rewrite the day')
}

console.log(`levels: 3 | units: ${[1,2,3].reduce((n,l)=>n+(UNITS_BY_LEVEL[l]||[]).length,0)} | achievements: ${ACHIEVEMENTS.length}`)
for (const note of notes) console.log(`  · ${note}`)
if (failures.length) {
  console.log(`\n✗ ${failures.length} failure(s):`)
  for (const f of failures) console.log('   ' + f)
  process.exit(1)
}
console.log('✓ path unlocks one step at a time, every level finishes, every achievement is winnable')
