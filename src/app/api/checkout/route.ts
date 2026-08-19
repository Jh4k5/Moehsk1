import { NextResponse, type NextRequest } from 'next/server'
import { activeGateway, GatewayError } from '@/lib/payments'
import { getAppConfig, isPlanId, planPrice } from '@/lib/config/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { randomUUID } from 'node:crypto'

// ─── POST /api/checkout ─────────────────────────────────────────────────────
//
// Turns "this signed-in user wants this plan" into a URL to send them to.
//
// FOUR refusals, in this order, and the order matters:
//   1. not signed in            — a payment with no account cannot be granted
//   2. plan not recognised      — never guess which plan someone meant to buy
//   3. plan has no price set    — the owner has not priced it; selling it at a
//                                 number invented here is the failure this whole
//                                 config layer exists to prevent
//   4. no gateway configured    — codes still work; say so
//
// The AMOUNT is never sent from here. It lives in the provider's own price
// object, and `app_config` holds only what the platform displays. Two places
// holding a price is how a customer gets charged one number and shown another.

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'sign_in_required' }, { status: 401 })
  }

  let plan: unknown
  try {
    plan = (await request.json())?.plan
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  if (!isPlanId(plan)) {
    return NextResponse.json({ ok: false, error: 'unknown_plan' }, { status: 400 })
  }

  const config = await getAppConfig()
  const price = planPrice(config, plan)
  if (!price.sellable) {
    return NextResponse.json({ ok: false, error: 'plan_not_priced' }, { status: 409 })
  }

  const gateway = await activeGateway()
  if (gateway.id === 'none') {
    return NextResponse.json({ ok: false, error: 'no_gateway', redeemAvailable: config.features.redemptionEnabled }, { status: 503 })
  }

  const origin = request.nextUrl.origin
  try {
    const result = await gateway.createCheckout({
      userId: user.id,
      email: user.email ?? null,
      plan,
      successUrl: `${origin}/ar/me?checkout=done`,
      cancelUrl: `${origin}/ar/me?checkout=cancelled`,
      // Opaque, single-use, echoed back by the provider. It is how a webhook
      // finds the buyer when they paid with a different email than they
      // registered with — which is the common case, not the edge case.
      reference: randomUUID(),
    })
    return NextResponse.json({ ok: true, url: result.url })
  } catch (error) {
    if (error instanceof GatewayError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status })
    }
    console.error('[checkout] unexpected failure:', error)
    return NextResponse.json({ ok: false, error: 'checkout_failed' }, { status: 502 })
  }
}
