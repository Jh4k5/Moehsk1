import 'server-only'

// ─── عدّاد الاستهلاك اليومي للمعلّم الذكي ───────────────────────────────────
//
// أين يُخزَّن: جدول `public.tutor_usage` (ترحيل 0010)، ويُكتب حصراً عبر دالتين
// من نوع security definer لا يملك المتصفح استدعاءهما — المفتاح المستعمل هنا
// هو مفتاح الخدمة، ولا يصل الرقم من العميل في أي حال. لا يستطيع الطالب أن
// يزوّر رصيده لأنه لا يملك أي مسار كتابة إليه: سياسات RLS على الجدول قراءة فقط.
//
// حين لا يكون الترحيل 0010 قد طُبِّق بعد على القاعدة، تعود الدالتان بخطأ «دالة
// غير موجودة»؛ عندها نهبط إلى العدّ من جدول `events` القديم. ذلك المسار غير
// ذرّي (اقرأ ثم اكتب) فقد يمرّ طلبان متزامنان فوق الحدّ بواحد، ولذلك هو مسار
// طوارئ مُسجَّل في اللوج لا خطة دائمة.
//
// وقاعدة أخيرة: إن تعذّر العدّ أصلاً، نرفض. استدعاء نموذج بلا عدّاد يعني تكلفة
// بلا سقف، وهذا بالضبط ما جاء هذا الملف ليمنعه.

import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'

/** اسم الحدث في `events` — مسار الطوارئ وسجلّ التكلفة معاً. */
export const TUTOR_MODEL_EVENT = 'tutor.model_call'

export interface TutorUsage {
  allowed: boolean
  used: number
  limit: number
  remaining: number
  /** من أين جاء الرقم — يظهر في اللوج لا للطالب. */
  source: 'tutor_usage' | 'events'
}

// `database.types.ts` يملكه طبقة قاعدة البيانات ويُولَّد من الترحيلات؛ جدول
// 0010 ودوالّه ليست فيه بعد. بدل تعديل ملف ليس ملكنا، نمرّ من واجهة ضيّقة
// مكتوبة يدوياً هنا، وتختفي حين يُعاد توليد الأنواع.
interface LooseRpcClient {
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<{
    data: unknown
    error: { message: string; code?: string } | null
  }>
}

function admin(): LooseRpcClient & ReturnType<typeof createAdminClient> {
  return createAdminClient() as unknown as LooseRpcClient & ReturnType<typeof createAdminClient>
}

/** خطأ «الدالة غير موجودة» — أي أن ترحيل 0010 لم يُطبَّق بعد. */
function isMissingFunction(error: { message: string; code?: string } | null): boolean {
  if (!error) return false
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    /could not find the function|does not exist/i.test(error.message)
  )
}

function readCounts(data: unknown, limit: number): TutorUsage | null {
  if (!data || typeof data !== 'object') return null
  const row = data as Record<string, unknown>
  const used = Number(row.used ?? NaN)
  if (!Number.isFinite(used)) return null
  return {
    allowed: row.allowed === true,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    source: 'tutor_usage',
  }
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── العدّ من events (طوارئ) ─────────────────────────────────────────────────

async function countFromEvents(userId: string): Promise<number | null> {
  const { count, error } = await admin()
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('name', TUTOR_MODEL_EVENT)
    .gte('occurred_at', `${utcToday()}T00:00:00Z`)
  if (error) {
    console.error('[tutor] events count failed:', error.message)
    return null
  }
  return count ?? 0
}

// ── الواجهة ────────────────────────────────────────────────────────────────

/**
 * يحجز سؤالاً واحداً من رصيد اليوم. لا يُستدعى إلا بعد اجتياز سلّم الرفض،
 * ولا يُستدعى إطلاقاً لمن لا يملك اشتراكاً.
 *
 * `null` تعني «تعذّر العدّ» — وهي عند المستدعي رفضٌ لا إذن.
 */
export async function consumeTutorCredit(userId: string, limit: number): Promise<TutorUsage | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const { data, error } = await admin().rpc('consume_tutor_credit', {
      uid: userId,
      daily_limit: limit,
    })
    if (!error) {
      const parsed = readCounts(data, limit)
      if (parsed) return parsed
      console.error('[tutor] consume_tutor_credit returned an unreadable row')
      return null
    }
    if (!isMissingFunction(error)) {
      console.error('[tutor] consume_tutor_credit failed:', error.message)
      return null
    }

    // مسار الطوارئ: 0010 لم يُطبَّق. غير ذرّي — مسجَّل عمداً.
    console.warn('[tutor] 0010_tutor.sql is not applied; counting from events (not atomic)')
    const used = await countFromEvents(userId)
    if (used === null) return null
    if (used >= limit) {
      return { allowed: false, used, limit, remaining: 0, source: 'events' }
    }
    return { allowed: true, used: used + 1, limit, remaining: Math.max(limit - used - 1, 0), source: 'events' }
  } catch (err) {
    console.error('[tutor] usage meter unavailable:', (err as Error).message)
    return null
  }
}

/** يعيد السؤال إلى الرصيد حين يفشل الاستدعاء بعد الحجز. لا يرمي أبداً. */
export async function refundTutorCredit(userId: string, source: TutorUsage['source']): Promise<void> {
  if (!isSupabaseConfigured()) return
  // في مسار events لا حجز أصلاً — الحدث يُكتب بعد النجاح فقط، فلا شيء يُعاد.
  if (source === 'events') return
  try {
    const { error } = await admin().rpc('refund_tutor_credit', { uid: userId })
    if (error && !isMissingFunction(error)) {
      console.error('[tutor] refund_tutor_credit failed:', error.message)
    }
  } catch (err) {
    console.error('[tutor] refund unavailable:', (err as Error).message)
  }
}

/** قراءة الرصيد بلا حجز — لعرض «بقي لك N اليوم». `null` = تعذّرت القراءة. */
export async function peekTutorUsage(userId: string, limit: number): Promise<TutorUsage | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const { data, error } = await admin().rpc('peek_tutor_usage', {
      uid: userId,
      daily_limit: limit,
    })
    if (!error) {
      const parsed = readCounts(data, limit)
      if (parsed) return { ...parsed, allowed: parsed.remaining > 0 }
      return null
    }
    if (!isMissingFunction(error)) {
      console.error('[tutor] peek_tutor_usage failed:', error.message)
      return null
    }
    const used = await countFromEvents(userId)
    if (used === null) return null
    return {
      allowed: used < limit,
      used,
      limit,
      remaining: Math.max(limit - used, 0),
      source: 'events',
    }
  } catch (err) {
    console.error('[tutor] usage peek unavailable:', (err as Error).message)
    return null
  }
}

/**
 * أثر تكلفة لكل استدعاء فعلي: يظهر في تقارير لوحة التحكم، وهو أيضاً ما يعتمد
 * عليه مسار الطوارئ في العدّ. أفضل جهد — فشله لا يُفشل الرد.
 */
export async function recordModelCall(
  userId: string,
  props: Record<string, unknown>,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  try {
    const { error } = await admin()
      .from('events')
      .insert({ user_id: userId, name: TUTOR_MODEL_EVENT, props: props as never })
    if (error) console.error('[tutor] event log failed:', error.message)
  } catch (err) {
    console.error('[tutor] event log unavailable:', (err as Error).message)
  }
}
