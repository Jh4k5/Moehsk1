import { NextResponse, type NextRequest } from 'next/server'
import { gatewayForPath, SignatureError, GatewayError } from '@/lib/payments'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'

// ─── POST /api/webhook/[provider] ───────────────────────────────────────────
//
// Where money becomes access.
//
// Four properties this route has to hold, because a payment webhook is the one
// request in the system that cannot be retried by a human:
//
//   1. VERIFIED. The raw bytes are checked against the provider's secret before
//      anything is parsed. An unverified body is not data.
//   2. ROUTED BY URL, not sniffed from the payload — so a request can only be
//      checked against the secret of the provider it claims to be.
//   3. IDEMPOTENT. Every delivery is recorded first, keyed on the provider's
//      own event id. A retry — and every provider retries — finds the row and
//      stops. Granting twice is a bug; granting zero times because a retry
//      raced the original is a worse one.
//   4. LOUD ON FAILURE. An event that cannot be matched to a user is stored
//      unprocessed with its reason, not dropped. Someone paid; the record of
//      that must survive even when the platform cannot act on it yet.
//
// It answers 200 for anything it has durably recorded, including events it
// could not apply. A 500 makes the provider retry, and retrying will not make
// an unknown email known.

export const runtime = 'nodejs'
// Never cached, never prerendered — it reads the raw body of a POST.
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: slug } = await params
  const gateway = gatewayForPath(slug)
  if (!gateway) {
    return NextResponse.json({ ok: false, error: 'unknown_provider' }, { status: 404 })
  }
  if (!isSupabaseConfigured()) {
    // 503, not 200: the database is down, so this delivery was NOT recorded and
    // the provider SHOULD retry it.
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 })
  }

  // The raw text, not a parsed object: providers sign the bytes they sent, and
  // JSON.parse → JSON.stringify does not reproduce them.
  const rawBody = await request.text()

  let event
  try {
    event = await gateway.parseWebhook(rawBody, request.headers)
  } catch (error) {
    if (error instanceof SignatureError) {
      console.warn(`[webhook:${slug}] rejected: bad signature`)
      return NextResponse.json({ ok: false, error: 'bad_signature' }, { status: 401 })
    }
    const status = error instanceof GatewayError ? error.status : 400
    return NextResponse.json({ ok: false, error: 'unparseable' }, { status })
  }

  const admin = createAdminClient()

  const { data: isNew, error: recordError } = await admin.rpc('gateway_record_event', {
    p_provider: event.provider,
    p_event_id: event.eventId,
    p_event_type: event.eventType,
    p_payload: event.raw as never,
  })
  if (recordError) {
    console.error(`[webhook:${slug}] could not record event:`, recordError.message)
    return NextResponse.json({ ok: false, error: 'record_failed' }, { status: 503 })
  }
  if (isNew === false) {
    // Seen before. The work is already done; say so and stop.
    return NextResponse.json({ ok: true, duplicate: true })
  }

  // Events that carry no entitlement change are recorded and done.
  if (!event.subscription) {
    await admin.rpc('gateway_mark_processed', { p_provider: event.provider, p_event_id: event.eventId })
    return NextResponse.json({ ok: true, applied: false })
  }

  const sub = event.subscription
  const { data: result, error: applyError } = await admin.rpc('gateway_apply_subscription', {
    p_provider: event.provider,
    p_external_sub_id: sub.externalSubscriptionId,
    p_external_cust_id: sub.externalCustomerId,
    p_email: sub.email,
    p_plan: sub.plan,
    p_status: sub.status,
    p_period_start: sub.periodStart,
    p_period_end: sub.periodEnd,
    p_cancel_at_end: sub.cancelAtPeriodEnd,
    p_metadata: { reference: sub.reference } as never,
  })

  const applied = (result as { ok?: boolean } | null)?.ok === true
  const reason = applyError?.message ?? (result as { error?: string } | null)?.error ?? null

  await admin.rpc('gateway_mark_processed', {
    p_provider: event.provider,
    p_event_id: event.eventId,
    p_error: applied ? null : reason,
  })

  if (!applied) {
    // 200 on purpose. The delivery is stored with its reason and shows up in the
    // admin panel's pending list; a retry cannot turn an unknown email into a
    // known one, and making the provider retry forever hides the real problem.
    console.warn(`[webhook:${slug}] recorded but not applied: ${reason}`)
    return NextResponse.json({ ok: true, applied: false, reason })
  }

  return NextResponse.json({ ok: true, applied: true })
}
