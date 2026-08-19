// The free-tier rule, as pure functions.
//
// No database, no `server-only`, no content imports: this file is the rule
// itself, so it must be readable and testable on its own. Everything that
// touches Supabase lives in ./check.ts, everything that touches content lives
// in ./gate.ts.
//
// THE RULE, from the plan and unchanged here:
//   free = the beginner primer + the FIRST TWO LESSONS of level 1.
//   Everything beyond that is paid.
//
// The "two" is not written down in this file. It comes from
// `access.free_lesson_count` in app_config, so the owner can widen or narrow
// the free tier from the admin panel without a deploy.

import type { UnitRef } from '@/lib/curriculum/types'
import type { AccessDecision, AccessReason, Entitlement, FreeAccessPolicy } from './types'

/**
 * Is this reference the beginner primer?
 *
 * NOTE ON THE ADDRESS OF THE PRIMER. The schema comment in
 * `0005_progress.sql` reserves `unit_no = 0` for the primer, while lesson ids
 * in the generated curriculum start at 1. Neither spelling is wrong and both
 * appear in the codebase's history, so both are accepted here. The routing
 * agent should settle on ONE and say so; until then this predicate is
 * deliberately permissive, because the cost of mis-identifying the primer is a
 * free unit shown as locked, not a paid unit given away.
 */
export function isPrimer(ref: UnitRef): boolean {
  return ref.lesson === 0 || ref.unit === 0
}

/**
 * Does the free tier cover this unit?
 *
 * Pure: same inputs, same answer, no I/O. A unit is free when its level is
 * listed in `freeLevels` AND it is either the primer (when the primer is free)
 * or sits in one of the first `freeLessonCount` lessons.
 */
export function isUnitFree(ref: UnitRef, policy: FreeAccessPolicy): boolean {
  if (!policy.freeLevels.includes(ref.level)) return false
  if (isPrimer(ref)) return policy.freePrimer
  return ref.lesson >= 1 && ref.lesson <= policy.freeLessonCount
}

/** Does the free tier cover any part of this lesson? */
export function isLessonFree(
  level: number,
  lesson: number,
  policy: FreeAccessPolicy,
): boolean {
  if (!policy.freeLevels.includes(level)) return false
  if (lesson === 0) return policy.freePrimer
  return lesson >= 1 && lesson <= policy.freeLessonCount
}

/**
 * Does this level contain ANY free content?
 *
 * Levels 2 and 3 answer false under the shipped config, which is what makes
 * "levels 2 and 3 never reach the browser for a non-subscriber" checkable in
 * one call rather than unit by unit.
 */
export function levelHasFreeContent(level: number, policy: FreeAccessPolicy): boolean {
  if (!policy.freeLevels.includes(level)) return false
  return policy.freePrimer || policy.freeLessonCount > 0
}

/**
 * Combine the free-tier rule with the viewer's entitlement.
 *
 * Order matters. Free content is checked FIRST so that an anonymous visitor
 * reading lesson 1 is never told to sign in — the primer and the first lessons
 * are the shop window and must open with no account at all.
 */
export function decideUnitAccess(
  ref: UnitRef,
  policy: FreeAccessPolicy,
  entitlement: Entitlement,
): AccessDecision {
  if (isUnitFree(ref, policy)) {
    return {
      allowed: true,
      reason: isPrimer(ref) ? 'free-primer' : 'free-lesson',
      entitlement,
    }
  }
  if (entitlement.isEntitled) {
    return { allowed: true, reason: 'entitled', entitlement }
  }
  const reason: AccessReason = entitlement.userId
    ? 'requires-subscription'
    : 'requires-sign-in'
  return { allowed: false, reason, entitlement }
}

/** The same decision at lesson granularity, for a lesson index page. */
export function decideLessonAccess(
  level: number,
  lesson: number,
  policy: FreeAccessPolicy,
  entitlement: Entitlement,
): AccessDecision {
  if (isLessonFree(level, lesson, policy)) {
    return {
      allowed: true,
      reason: lesson === 0 ? 'free-primer' : 'free-lesson',
      entitlement,
    }
  }
  if (entitlement.isEntitled) {
    return { allowed: true, reason: 'entitled', entitlement }
  }
  return {
    allowed: false,
    reason: entitlement.userId ? 'requires-subscription' : 'requires-sign-in',
    entitlement,
  }
}

/** Arabic copy for a refusal. Kept beside the rule so the two never drift. */
export const ACCESS_REASON_AR: Record<AccessReason, string> = {
  'free-primer': 'تمهيد المبتدئ متاح للجميع',
  'free-lesson': 'درس مجاني',
  entitled: 'اشتراك فعّال',
  'requires-sign-in': 'سجّل الدخول ثم فعّل اشتراكك لمتابعة هذا الدرس',
  'requires-subscription': 'هذا الدرس ضمن الاشتراك المدفوع',
  'not-found': 'لا يوجد درس بهذا العنوان',
}
