'use client'

// ─── AdminData over the browser Supabase client ─────────────────────────────
//
// Nothing here uses the service-role key. Every call relies on the RPCs and RLS
// policies in supabase/migrations/*.sql, all of which check public.is_admin(),
// so a non-admin session gets a database error rather than data.
//
// Where a query is done client-side that really wants a SQL aggregate, it says
// so and caps the row count instead of pretending the cap does not exist.

import { createClient } from '@/lib/supabase/client'
import type {
  DailyActivityRow,
  Json,
  ProfileRow,
  RedemptionCodeRow,
  RedemptionRow,
  SubscriptionRow,
} from '@/lib/supabase/database.types'
import {
  FUNNEL_EVENTS,
  type ActivityPoint,
  type AdminData,
  type AdminMetrics,
  type AdminUserRow,
  type AppConfigHistoryRow,
  type AppConfigRow,
  type CodePage,
  type CodeQuery,
  type CodeRedemption,
  type EventCount,
  type GenerateCodesInput,
  type GrantSubscriptionInput,
  type SubscriberDetail,
  type SubscriberPage,
  type SubscriberQuery,
  type UserRedemption,
} from './types'

/**
 * Rows pulled for the activity chart before it gives up and aggregates a
 * partial answer. Deliberately explicit: see the GAP note on loadActivitySeries.
 */
const ACTIVITY_ROW_CAP = 20_000

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - Math.max(days, 1) * 86_400_000).toISOString()
}

function dateDaysAgo(days: number): string {
  return isoDaysAgo(days).slice(0, 10)
}

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`${context}: ${error?.message ?? 'خطأ غير معروف'}`)
}

/** admin_metrics returns jsonb; this is the only place that shape is unpacked. */
function toMetrics(raw: Json): AdminMetrics {
  const o = (raw ?? {}) as Record<string, Json>
  const num = (k: string): number => (typeof o[k] === 'number' ? (o[k] as number) : 0)
  const signups = Array.isArray(o.signups_by_day) ? o.signups_by_day : []
  const bySource =
    o.subscribers_by_source && typeof o.subscribers_by_source === 'object'
      ? (o.subscribers_by_source as Record<string, number>)
      : {}
  return {
    windowDays: num('window_days'),
    usersTotal: num('users_total'),
    usersNew: num('users_new'),
    subscribersActive: num('subscribers_active'),
    subscribersLifetime: num('subscribers_lifetime'),
    subscribersExpiring30d: num('subscribers_expiring_30d'),
    codesTotal: num('codes_total'),
    codesAvailable: num('codes_available'),
    redemptionsTotal: num('redemptions_total'),
    redemptionsWindow: num('redemptions_window'),
    activeLearnersWindow: num('active_learners_window'),
    unitsCompletedWindow: num('units_completed_window'),
    signupsByDay: signups.map((p) => {
      const point = (p ?? {}) as Record<string, Json>
      return {
        date: String(point.date ?? ''),
        count: typeof point.count === 'number' ? point.count : 0,
      }
    }),
    subscribersBySource: bySource,
  }
}

export function createSupabaseAdminData(): AdminData {
  const sb = createClient()

  return {
    // ── config ──────────────────────────────────────────────────────────────

    async loadConfig() {
      const { data, error } = await sb
        .from('app_config')
        .select('*')
        .order('group_key', { ascending: true })
        .order('sort_order', { ascending: true })
      if (error) fail('تعذّر تحميل الإعدادات', error)
      return (data ?? []) as AppConfigRow[]
    },

    async loadConfigHistory(limit) {
      const { data, error } = await sb
        .from('app_config_history')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit)
      if (error) fail('تعذّر تحميل سجل التغييرات', error)
      return (data ?? []) as AppConfigHistoryRow[]
    },

    async saveConfig(entries) {
      // admin_set_config rejects unknown keys and stamps updated_by from the
      // session, so a typo cannot create a setting nothing reads.
      const { data, error } = await sb.rpc('admin_set_config', {
        entries: entries as Json,
      })
      if (error) fail('تعذّر حفظ الإعدادات', error)
      return (data ?? []) as AppConfigRow[]
    },

    // ── subscribers ─────────────────────────────────────────────────────────

    async listSubscribers(query: SubscriberQuery): Promise<SubscriberPage> {
      const { data, error } = await sb.rpc('admin_list_users', {
        search: query.search || null,
        list_filter: query.filter,
        page_size: query.pageSize,
        page_offset: query.pageOffset,
      })
      if (error) fail('تعذّر تحميل المشتركين', error)
      const rows = (data ?? []) as AdminUserRow[]
      return {
        rows,
        // total_count rides on every row; an empty page means zero matches.
        total: rows.length > 0 ? Number(rows[0].total_count) : 0,
        pageOffset: query.pageOffset,
        pageSize: query.pageSize,
      }
    },

    async loadSubscriberDetail(userId): Promise<SubscriberDetail> {
      const [subs, reds, acts] = await Promise.all([
        sb
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        sb
          .from('redemptions')
          .select('*')
          .eq('user_id', userId)
          .order('redeemed_at', { ascending: false }),
        sb
          .from('daily_activity')
          .select('*')
          .eq('user_id', userId)
          .order('activity_date', { ascending: false })
          .limit(60),
      ])
      if (subs.error) fail('تعذّر تحميل اشتراكات المستخدم', subs.error)
      if (reds.error) fail('تعذّر تحميل عمليات التفعيل', reds.error)
      if (acts.error) fail('تعذّر تحميل نشاط المستخدم', acts.error)

      // The generated Database type declares no relationships, so the code text
      // is resolved with a second query rather than a PostgREST embed that the
      // types cannot vouch for.
      const redemptionRows = (reds.data ?? []) as RedemptionRow[]
      const codeIds = [...new Set(redemptionRows.map((r) => r.code_id))]
      let codeById = new Map<string, { code: string; kind: RedemptionCodeRow['kind'] }>()
      if (codeIds.length > 0) {
        const { data: codes, error: codeErr } = await sb
          .from('redemption_codes')
          .select('id, code, kind')
          .in('id', codeIds)
        if (codeErr) fail('تعذّر تحميل الأكواد المستخدَمة', codeErr)
        codeById = new Map(
          ((codes ?? []) as Pick<RedemptionCodeRow, 'id' | 'code' | 'kind'>[]).map((c) => [
            c.id,
            { code: c.code, kind: c.kind },
          ]),
        )
      }

      const redemptions: UserRedemption[] = redemptionRows.map((r) => ({
        id: r.id,
        codeId: r.code_id,
        code: codeById.get(r.code_id)?.code ?? '—',
        kind: codeById.get(r.code_id)?.kind ?? null,
        grantedUntil: r.granted_until,
        redeemedAt: r.redeemed_at,
      }))

      return {
        subscriptions: (subs.data ?? []) as SubscriptionRow[],
        redemptions,
        activity: (acts.data ?? []) as DailyActivityRow[],
      }
    },

    async grantSubscription(input: GrantSubscriptionInput) {
      const { data, error } = await sb.rpc('admin_grant_subscription', {
        target_user: input.userId,
        days: input.days,
        plan_name: input.plan,
        grant_note: input.note,
      })
      if (error) fail('تعذّر منح الاشتراك', error)
      return data as unknown as SubscriptionRow
    },

    async revokeSubscription(subscriptionId) {
      const { data, error } = await sb.rpc('admin_revoke_subscription', {
        subscription_id: subscriptionId,
      })
      if (error) fail('تعذّر إلغاء الاشتراك', error)
      return data as unknown as SubscriptionRow
    },

    // ── codes ───────────────────────────────────────────────────────────────

    async listCodes(query: CodeQuery): Promise<CodePage> {
      let q = sb
        .from('redemption_code_usage')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(query.pageOffset, query.pageOffset + query.pageSize - 1)

      if (query.state !== 'all') q = q.eq('state', query.state)
      if (query.batchId) q = q.eq('batch_id', query.batchId)
      if (query.search) {
        const term = query.search.replace(/[%,()]/g, '')
        q = q.or(`code.ilike.%${term}%,note.ilike.%${term}%,batch_label.ilike.%${term}%`)
      }

      const { data, error, count } = await q
      if (error) fail('تعذّر تحميل الأكواد', error)
      return {
        rows: (data ?? []) as CodePage['rows'],
        total: count ?? 0,
        pageOffset: query.pageOffset,
        pageSize: query.pageSize,
      }
    },

    async generateCodes(input: GenerateCodesInput) {
      const { data, error } = await sb.rpc('admin_generate_codes', {
        quantity: input.quantity,
        code_kind: input.kind,
        days: input.kind === 'lifetime' ? null : input.days,
        uses_per_code: input.usesPerCode,
        expires: input.expiresAt,
        code_note: input.note,
        label: input.batchLabel,
        code_prefix: input.prefix,
      })
      if (error) fail('تعذّر توليد الأكواد', error)
      return (data ?? []) as RedemptionCodeRow[]
    },

    async revokeCode(codeId) {
      const { data, error } = await sb.rpc('admin_revoke_code', { target_code_id: codeId })
      if (error) fail('تعذّر إبطال الكود', error)
      return data as unknown as RedemptionCodeRow
    },

    async revokeBatch(batchId) {
      const { data, error } = await sb.rpc('admin_revoke_batch', { target_batch_id: batchId })
      if (error) fail('تعذّر إبطال الدفعة', error)
      return (data as unknown as number) ?? 0
    },

    async loadCodeRedemptions(codeId): Promise<CodeRedemption[]> {
      const { data, error } = await sb
        .from('redemptions')
        .select('*')
        .eq('code_id', codeId)
        .order('redeemed_at', { ascending: false })
      if (error) fail('تعذّر تحميل سجل استخدام الكود', error)

      const rows = (data ?? []) as RedemptionRow[]
      if (rows.length === 0) return []

      const { data: profiles, error: profErr } = await sb
        .from('profiles')
        .select('id, email, display_name')
        .in('id', [...new Set(rows.map((r) => r.user_id))])
      if (profErr) fail('تعذّر تحميل بيانات المستخدمين', profErr)

      const byId = new Map(
        ((profiles ?? []) as Pick<ProfileRow, 'id' | 'email' | 'display_name'>[]).map((p) => [
          p.id,
          p,
        ]),
      )
      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        email: byId.get(r.user_id)?.email ?? null,
        displayName: byId.get(r.user_id)?.display_name ?? null,
        grantedUntil: r.granted_until,
        redeemedAt: r.redeemed_at,
      }))
    },

    // ── metrics ─────────────────────────────────────────────────────────────

    async loadMetrics(windowDays) {
      const { data, error } = await sb.rpc('admin_metrics', { window_days: windowDays })
      if (error) fail('تعذّر تحميل المؤشرات', error)
      return toMetrics(data as Json)
    },

    async loadEventCounts(windowDays): Promise<EventCount[]> {
      // One head-count per name. The set is fixed and small; a GROUP BY would
      // need an RPC that does not exist (see the report).
      const since = isoDaysAgo(windowDays)
      const counts = await Promise.all(
        FUNNEL_EVENTS.map(async (e) => {
          const { count, error } = await sb
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('name', e.name)
            .gte('occurred_at', since)
          if (error) fail(`تعذّر عدّ الحدث ${e.name}`, error)
          return { name: e.name, labelAr: e.labelAr, count: count ?? 0 }
        }),
      )
      return counts
    },

    async loadActivitySeries(windowDays): Promise<ActivityPoint[]> {
      // GAP (performance, not correctness): daily_activity is read row by row
      // and folded here because PostgREST cannot GROUP BY. Correct at this
      // scale, wrong at ten thousand learners. See admin_activity_series in
      // the report.
      const since = dateDaysAgo(windowDays)
      const { data, error } = await sb
        .from('daily_activity')
        .select('user_id, activity_date, words_learned, questions_answered, units_completed, seconds_studied')
        .gte('activity_date', since)
        .limit(ACTIVITY_ROW_CAP)
      if (error) fail('تعذّر تحميل نشاط المتعلمين', error)
      return foldActivity((data ?? []) as DailyActivityRow[], windowDays)
    },
  }
}

/**
 * Folds raw daily_activity rows into one point per day, filling the days
 * nobody studied with zeroes so the chart shows the gaps instead of hiding
 * them by joining two distant points with a straight line.
 */
export function foldActivity(rows: DailyActivityRow[], windowDays: number): ActivityPoint[] {
  const byDate = new Map<string, ActivityPoint & { users: Set<string> }>()
  const days = Math.max(windowDays, 1)

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)
    byDate.set(date, {
      date,
      learners: 0,
      wordsLearned: 0,
      questionsAnswered: 0,
      unitsCompleted: 0,
      minutesStudied: 0,
      users: new Set<string>(),
    })
  }

  for (const row of rows) {
    const date = String(row.activity_date).slice(0, 10)
    const point = byDate.get(date)
    if (!point) continue
    point.users.add(row.user_id)
    point.wordsLearned += row.words_learned
    point.questionsAnswered += row.questions_answered
    point.unitsCompleted += row.units_completed
    point.minutesStudied += Math.round(row.seconds_studied / 60)
  }

  return [...byDate.values()].map(({ users, ...point }) => ({
    ...point,
    learners: users.size,
  }))
}
