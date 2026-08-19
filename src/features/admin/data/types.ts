// ─── The admin panel's data contract ────────────────────────────────────────
//
// Every query the four panels need, named and typed in one place. The panels
// depend on `AdminData` only, never on Supabase directly, so a route can hand
// them a live browser client, a server-fetched implementation, or the sample
// source used for isolated rendering.
//
// Anything in here with no database counterpart yet is marked GAP, and the
// Supabase implementation throws rather than returning a plausible lie.

import type {
  AdminUserRow,
  AppConfigHistoryRow,
  AppConfigRow,
  DailyActivityRow,
  Json,
  RedemptionCodeRow,
  RedemptionCodeUsageRow,
  RedemptionKind,
  SubscriptionRow,
} from '@/lib/supabase/database.types'

export type {
  AdminUserRow,
  AppConfigHistoryRow,
  AppConfigRow,
  DailyActivityRow,
  RedemptionCodeRow,
  RedemptionCodeUsageRow,
  RedemptionKind,
  SubscriptionRow,
}

// ── Subscribers ─────────────────────────────────────────────────────────────

/** Matches the `list_filter` argument of public.admin_list_users. */
export type SubscriberFilter = 'all' | 'subscribers' | 'free' | 'admins'

export interface SubscriberQuery {
  search: string
  filter: SubscriberFilter
  pageSize: number
  pageOffset: number
}

export interface SubscriberPage {
  rows: AdminUserRow[]
  /** Total matching the filter, not the page. Every row carries it. */
  total: number
  pageOffset: number
  pageSize: number
}

/** One line of a user's redemption history, with the code text resolved. */
export interface UserRedemption {
  id: string
  codeId: string
  code: string
  kind: RedemptionKind | null
  grantedUntil: string | null
  redeemedAt: string
}

/** Everything the detail drawer shows beyond the row the table already holds. */
export interface SubscriberDetail {
  subscriptions: SubscriptionRow[]
  redemptions: UserRedemption[]
  /** Most recent first, capped by the query. */
  activity: DailyActivityRow[]
}

export interface GrantSubscriptionInput {
  userId: string
  /** null grants lifetime access. */
  days: number | null
  plan: string
  note: string | null
}

// ── Codes ───────────────────────────────────────────────────────────────────

export type CodeState = RedemptionCodeUsageRow['state']

export interface CodeQuery {
  /** Matches the code text or the note. */
  search: string
  state: CodeState | 'all'
  batchId: string | null
  pageSize: number
  pageOffset: number
}

export interface CodePage {
  rows: RedemptionCodeUsageRow[]
  total: number
  pageOffset: number
  pageSize: number
}

export interface GenerateCodesInput {
  quantity: number
  kind: RedemptionKind
  /** Ignored for `lifetime`. */
  days: number
  usesPerCode: number
  /** ISO instant, or null for no expiry. */
  expiresAt: string | null
  /** Who this batch went to — the owner's own record. */
  note: string | null
  batchLabel: string | null
  prefix: string
}

/** One redemption of one code, with the redeemer identified. */
export interface CodeRedemption {
  id: string
  userId: string
  email: string | null
  displayName: string | null
  grantedUntil: string | null
  redeemedAt: string
}

// ── Metrics ─────────────────────────────────────────────────────────────────

export interface SignupPoint {
  date: string
  count: number
}

/** The typed shape of the jsonb returned by public.admin_metrics. */
export interface AdminMetrics {
  windowDays: number
  usersTotal: number
  usersNew: number
  subscribersActive: number
  subscribersLifetime: number
  subscribersExpiring30d: number
  codesTotal: number
  codesAvailable: number
  redemptionsTotal: number
  redemptionsWindow: number
  activeLearnersWindow: number
  unitsCompletedWindow: number
  signupsByDay: SignupPoint[]
  subscribersBySource: Record<string, number>
}

/**
 * Event names the funnel counts.
 *
 * GAP: nothing in the codebase emits these yet and no shared registry of event
 * names exists. This list is the admin panel's proposal. Whoever writes the
 * emitters must use exactly these strings, or this list must move to a module
 * both sides import.
 */
export const FUNNEL_EVENTS = [
  { name: 'signup', labelAr: 'تسجيل حساب' },
  { name: 'activation', labelAr: 'إتمام أول وحدة' },
  { name: 'checkout_started', labelAr: 'فتح صفحة الدفع' },
  { name: 'subscription_started', labelAr: 'بدء اشتراك' },
  { name: 'code_redeemed', labelAr: 'استخدام كود' },
] as const

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number]['name']

export interface EventCount {
  name: string
  labelAr: string
  count: number
}

/** One day on the activity chart, aggregated across all learners. */
export interface ActivityPoint {
  date: string
  /** Distinct learners with any recorded activity that day. */
  learners: number
  wordsLearned: number
  questionsAnswered: number
  unitsCompleted: number
  minutesStudied: number
}

// ── The contract ────────────────────────────────────────────────────────────

export interface AdminData {
  // config
  loadConfig(): Promise<AppConfigRow[]>
  loadConfigHistory(limit: number): Promise<AppConfigHistoryRow[]>
  /** Keys map to their new jsonb value. Only changed keys are sent. */
  saveConfig(entries: Record<string, Json>): Promise<AppConfigRow[]>

  // subscribers
  listSubscribers(query: SubscriberQuery): Promise<SubscriberPage>
  loadSubscriberDetail(userId: string): Promise<SubscriberDetail>
  grantSubscription(input: GrantSubscriptionInput): Promise<SubscriptionRow>
  revokeSubscription(subscriptionId: string): Promise<SubscriptionRow>

  // codes
  listCodes(query: CodeQuery): Promise<CodePage>
  generateCodes(input: GenerateCodesInput): Promise<RedemptionCodeRow[]>
  revokeCode(codeId: string): Promise<RedemptionCodeRow>
  revokeBatch(batchId: string): Promise<number>
  loadCodeRedemptions(codeId: string): Promise<CodeRedemption[]>

  // metrics
  loadMetrics(windowDays: number): Promise<AdminMetrics>
  loadEventCounts(windowDays: number): Promise<EventCount[]>
  loadActivitySeries(windowDays: number): Promise<ActivityPoint[]>
}

/** Thrown when a panel asks for something the database cannot answer yet. */
export class AdminGapError extends Error {
  constructor(what: string) {
    super(`لم تُبنَ بعد نقطة الوصول المطلوبة: ${what}`)
    this.name = 'AdminGapError'
  }
}
