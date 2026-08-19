// Shared types for the entitlement layer.
//
// Deliberately free of imports from the Supabase or content layers so that the
// pure policy in ./policy.ts can be unit-tested without a database or a
// 2300-line generated content file.

import type { SubscriptionSource, SubscriptionStatus } from '@/lib/supabase/database.types'
import type { UnitRef } from '@/lib/curriculum/types'

/** What the database's `get_entitlement(uid)` told us, normalised. */
export interface Entitlement {
  /** Null for an anonymous visitor. */
  userId: string | null
  isEntitled: boolean
  /** True when the grant never expires. */
  isLifetime: boolean
  /** ISO timestamp, or null for lifetime / not entitled. */
  activeUntil: string | null
  source: SubscriptionSource | null
  plan: string | null
  status: SubscriptionStatus | null
}

/** The entitlement of someone who has none. Every failure path returns this. */
export function anonymousEntitlement(userId: string | null = null): Entitlement {
  return {
    userId,
    isEntitled: false,
    isLifetime: false,
    activeUntil: null,
    source: null,
    plan: null,
    status: null,
  }
}

/**
 * Why a piece of content was allowed or refused.
 *
 * The refusal reasons are distinct on purpose: an anonymous visitor looking at
 * a paid lesson needs a sign-in prompt, a signed-in visitor needs a purchase
 * prompt, and the two produce different screens.
 */
export type AccessReason =
  /** Free tier: the beginner primer. */
  | 'free-primer'
  /** Free tier: one of the first N lessons of a free level. */
  | 'free-lesson'
  /** The viewer holds an active subscription. */
  | 'entitled'
  /** Paid content, nobody signed in. */
  | 'requires-sign-in'
  /** Paid content, signed in, no active subscription. */
  | 'requires-subscription'
  /** The reference does not name a unit that exists. */
  | 'not-found'

export interface AccessDecision {
  allowed: boolean
  reason: AccessReason
  entitlement: Entitlement
}

/** The free-tier rules, as read from app_config. */
export interface FreeAccessPolicy {
  /** Is the beginner primer open to everyone? */
  freePrimer: boolean
  /** How many lessons of a free level open without a subscription. */
  freeLessonCount: number
  /** Levels that contain any free lesson at all. */
  freeLevels: readonly number[]
}

// ── Gated content payloads ──────────────────────────────────────────────────

/**
 * What a locked unit is allowed to tell the browser.
 *
 * Everything that is the product — `wordIds`, `hanzi`, `grammarIds`,
 * `keySentenceIndices`, `conversationIds` — is absent by construction. This is
 * a separate type rather than a `Partial<Unit>` precisely so that adding a
 * field to `Unit` cannot silently start leaking it through a locked card.
 */
export interface LockedUnitPreview {
  ref: UnitRef
  key: string
  /** Arabic title. Marketing copy for the locked card, not content. */
  title: string
  /** Arabic one-line goal. Also marketing copy. */
  goal: string
  /** How many words are inside — a count, never the words. */
  wordCount: number
  /** True for the last unit of its lesson. Shapes the path, reveals nothing. */
  carriesExam: boolean
  locked: true
}

export class EntitlementError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'EntitlementError'
  }
}
