// ─── Unit progress and unlocking ────────────────────────────────────────────
//
// What "finished a unit" means, and what that opens next.
//
// The old app had neither. `Lock` was imported in `LessonSystem.tsx` and never
// used, there was no record of a completed anything, and "progress" was the
// share of a level's words flagged as learned — a number that went up when you
// pressed a button on a flashcard and had no relationship to whether you could
// use the word. A sequential path needs an answer to "am I done, and what is
// next", and this file is that answer.
//
// Pure functions over plain data: the store holds the record, this decides what
// it means. That keeps the rule testable without a browser.

import { unitsOfLesson, UNITS_BY_LEVEL } from './index'
import { unitKey, type HskLevelNo, type Unit, type UnitKey, type UnitRef } from './types'

/** What the learner did in one unit. Written once, on completion. */
export interface UnitResult {
  key: UnitKey
  /** Activities answered correctly, out of those that HAD a right answer. */
  correct: number
  /** Activities that had a right answer. Presentation cards are not counted. */
  scored: number
  /** ISO timestamp. */
  completedAt: string
}

export type UnitProgress = Record<string, UnitResult>

/**
 * The bar a unit must clear to count as finished.
 *
 * Seventy per cent, not a hundred: a unit you may only leave by getting
 * everything right is a wall, and the words you missed come back through SRS
 * in later units anyway — that is what the interleaving is for. Finishing the
 * stream is the requirement; perfection is not.
 */
export const UNIT_PASS_RATIO = 0.7

export function unitPassed(correct: number, scored: number): boolean {
  if (scored === 0) return true // a stream with nothing to grade is finished by reaching the end
  return correct / scored >= UNIT_PASS_RATIO
}

// ── Unlocking ───────────────────────────────────────────────────────────────

/**
 * Which units are open.
 *
 * The rule is one step ahead: the first unit of a level is always open, and a
 * unit opens when the one before it in the syllabus is done. Nothing further
 * ahead opens, because a path whose every step is available is the flat menu
 * this rebuild exists to replace.
 *
 * Levels are independent — a learner who chose HSK2 at signup starts at its
 * first unit and is not made to finish HSK1 first.
 */
export function isUnitUnlocked(ref: UnitRef, progress: UnitProgress): boolean {
  const order = UNITS_BY_LEVEL[ref.level] ?? []
  const at = order.findIndex((u) => u.ref.lesson === ref.lesson && u.ref.unit === ref.unit)
  if (at <= 0) return at === 0 // first unit of the level, or unknown ref
  return Boolean(progress[order[at - 1].key])
}

/** The unit the learner should open right now: the first one not yet done. */
export function nextUnitFor(level: HskLevelNo, progress: UnitProgress): Unit | null {
  const order = UNITS_BY_LEVEL[level] ?? []
  return order.find((u) => !progress[u.key]) ?? null
}

/** True when every unit of a lesson is done. */
export function lessonComplete(level: HskLevelNo, lesson: number, progress: UnitProgress): boolean {
  const units = unitsOfLesson(level, lesson)
  return units.length > 0 && units.every((u) => Boolean(progress[u.key]))
}

export interface LevelProgress {
  totalUnits: number
  doneUnits: number
  /** 0–100, rounded. */
  percent: number
  /** Lessons with every unit done. */
  doneLessons: number
  totalLessons: number
}

export function levelProgress(level: HskLevelNo, progress: UnitProgress): LevelProgress {
  const order = UNITS_BY_LEVEL[level] ?? []
  const doneUnits = order.filter((u) => Boolean(progress[u.key])).length
  const lessons = [...new Set(order.map((u) => u.ref.lesson))]
  return {
    totalUnits: order.length,
    doneUnits,
    percent: order.length === 0 ? 0 : Math.round((doneUnits / order.length) * 100),
    doneLessons: lessons.filter((l) => lessonComplete(level, l, progress)).length,
    totalLessons: lessons.length,
  }
}

/** Convenience: the key a `UnitRef` records under. */
export { unitKey }
