// ─── Reading the generated curriculum ───────────────────────────────────────
// `units.generated.ts` is a flat list of 191 units, which is the right shape to
// generate and the wrong shape to query. The indexes below are built once at
// module load; a page that asks for one lesson's units does not scan the list.
//
// Server-safe: no React, no store, no `'use client'` anywhere in the chain, so
// the marketing routes can import it.

import { unitsGenerated } from '@/data/units/units.generated'
import { parseUnitKey, unitKey, type Unit, type UnitRef } from './types'

export type { Unit, UnitRef } from './types'
export { unitsGenerated, UNIT_COUNTS } from '@/data/units/units.generated'

/** Every unit of one lesson, in order. Key is `level:lesson` — the two together,
 *  because lesson ids collide across levels (thirty times). */
export const UNITS_BY_LESSON: Record<string, Unit[]> = (() => {
  const map: Record<string, Unit[]> = {}
  for (const unit of unitsGenerated) {
    const key = `${unit.ref.level}:${unit.ref.lesson}`
    ;(map[key] ??= []).push(unit)
  }
  for (const list of Object.values(map)) list.sort((a, b) => a.ref.unit - b.ref.unit)
  return map
})()

/** Every unit of one level, in curriculum order. */
export const UNITS_BY_LEVEL: Record<number, Unit[]> = (() => {
  const map: Record<number, Unit[]> = {}
  for (const unit of unitsGenerated) (map[unit.ref.level] ??= []).push(unit)
  for (const list of Object.values(map)) {
    list.sort((a, b) => a.ref.lesson - b.ref.lesson || a.ref.unit - b.ref.unit)
  }
  return map
})()

const BY_KEY = new Map(unitsGenerated.map((unit) => [unit.key, unit]))

/** One unit by `level:lesson:unit`, or null. Never throws on a bad URL — the
 *  key is validated by `parseUnitKey` before it is used as one. */
export function unitByKey(key: string): Unit | null {
  const ref = parseUnitKey(key)
  return ref ? (BY_KEY.get(unitKey(ref)) ?? null) : null
}

/** One unit by reference. */
export function unitByRef(ref: UnitRef): Unit | null {
  return BY_KEY.get(unitKey(ref)) ?? null
}

/** The units of one lesson. Empty array, never undefined. */
export function unitsOfLesson(level: number, lesson: number): Unit[] {
  return UNITS_BY_LESSON[`${level}:${lesson}`] ?? []
}

/**
 * The unit that follows this one in the syllabus — across a lesson boundary,
 * and across a level boundary at the end of a level. `null` at the very end.
 */
export function nextUnit(ref: UnitRef): Unit | null {
  const flat = UNITS_BY_LEVEL[ref.level] ?? []
  const at = flat.findIndex((u) => u.ref.lesson === ref.lesson && u.ref.unit === ref.unit)
  if (at === -1) return null
  if (at + 1 < flat.length) return flat[at + 1]
  return (UNITS_BY_LEVEL[ref.level + 1] ?? [])[0] ?? null
}
