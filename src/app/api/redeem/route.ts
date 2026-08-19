import { NextResponse, type NextRequest } from 'next/server'
import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getAppConfig } from '@/lib/config/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'

// ─── POST /api/redeem ───────────────────────────────────────────────────────
//
// Activation codes. This is the platform's FIRST revenue path, not a fallback:
// no gateway accepts a Yemeni seller, and merchant review for the Egyptian
// account takes weeks it does not have to wait for. A code needs no provider,
// no review and no card — the owner sells one however they like and the buyer
// types it in.
//
// It also carries the influencer arrangement the owner asked for, which is a
// different thing from a discounted sale: a code batch is issued, tracked, and
// revocable, with no money moving through the platform at all.
//
// The work happens in `public.redeem_code`, a SECURITY DEFINER function, so the
// rules — is the code real, live, unexpired, under its use limit, not already
// used by this person — are enforced in one place that a client cannot reach
// around. This route authenticates, rate-limits, and passes the string through.

export const runtime = 'nodejs'

/**
 * In-memory throttle. Codes are short and guessable by brute force, and the
 * database function cannot see how many times ONE caller has tried.
 *
 * Per-instance, so a multi-instance deployment multiplies the ceiling — it
 * raises the cost of guessing rather than making it impossible. The durable
 * defence is the `redemptions` table's use limits; this stops the cheap attack.
 */
const ATTEMPTS = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 10

function throttle(key: string): boolean {
  const now = Date.now()
  const entry = ATTEMPTS.get(key)
  if (!entry || now > entry.resetAt) {
    ATTEMPTS.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

/** The caller's IP, hashed. Stored for abuse analysis; never in the clear. */
function hashedIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')
  if (!ip) return null
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

const MESSAGES: Record<string, string> = {
  not_authenticated: 'يلزم تسجيل الدخول أولاً.',
  code_required: 'اكتب الكود.',
  code_not_found: 'هذا الكود غير صحيح.',
  code_revoked: 'هذا الكود مُلغى.',
  code_expired: 'انتهت صلاحية هذا الكود.',
  code_exhausted: 'استُهلك هذا الكود بالكامل.',
  already_redeemed: 'استخدمتَ هذا الكود من قبل.',
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'الخدمة غير مهيّأة بعد.' }, { status: 503 })
  }

  const config = await getAppConfig()
  if (!config.features.redemptionEnabled) {
    return NextResponse.json({ ok: false, error: 'أكواد التفعيل موقوفة حالياً.' }, { status: 503 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: MESSAGES.not_authenticated }, { status: 401 })
  }

  if (!throttle(user.id)) {
    return NextResponse.json(
      { ok: false, error: 'محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة.' },
      { status: 429 },
    )
  }

  let code: unknown
  try {
    code = (await request.json())?.code
  } catch {
    return NextResponse.json({ ok: false, error: MESSAGES.code_required }, { status: 400 })
  }
  if (typeof code !== 'string' || code.trim().length === 0) {
    return NextResponse.json({ ok: false, error: MESSAGES.code_required }, { status: 400 })
  }

  // The user's own client, not the admin one: `redeem_code` defaults `uid` to
  // `auth.uid()`, so the session decides who is redeeming and no caller can
  // redeem on someone else's behalf by passing an id.
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('redeem_code', {
    raw_code: code.trim(),
    client_ip_hash: hashedIp(request),
  })

  if (error) {
    console.error('[redeem] rpc failed:', error.message)
    return NextResponse.json({ ok: false, error: 'تعذّر تفعيل الكود الآن.' }, { status: 502 })
  }

  const result = (data ?? {}) as { ok?: boolean; error?: string; kind?: string; until?: string | null }
  if (result.ok !== true) {
    const key = result.error ?? ''
    // A wrong code is a 200 with ok:false, not a 4xx: it is an ordinary answer
    // to an ordinary question, and the UI shows the message either way.
    return NextResponse.json({ ok: false, error: MESSAGES[key] ?? 'هذا الكود غير صحيح.' })
  }

  return NextResponse.json({
    ok: true,
    kind: result.kind ?? 'subscription',
    until: result.until ?? null,
  })
}
