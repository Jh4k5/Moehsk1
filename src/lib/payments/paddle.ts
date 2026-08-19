import 'server-only'
// ─── Paddle (Billing v2) ────────────────────────────────────────────────────
//
// The second merchant-of-record option, kept alongside Lemon Squeezy for one
// reason: neither has approved this seller yet. Whichever accepts the Egyptian
// account first is the one that gets switched on, from the admin panel, with no
// code change. Writing only one of them would have meant a rewrite on rejection.
//
// NOT ENABLED until `PADDLE_API_KEY` and `PADDLE_WEBHOOK_SECRET` are set and
// the admin panel selects it.

import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  GatewayError,
  SignatureError,
  type CheckoutRequest,
  type CheckoutResult,
  type GatewayEvent,
  type PaymentGateway,
} from './types'
import type { SubscriptionStatus } from '@/lib/supabase/database.types'

function env(name: string): string | null {
  const v = process.env[name]
  return v && v.length > 0 ? v : null
}

/** Sandbox and live are different hosts; the key prefix says which. */
function apiBase(): string {
  const key = env('PADDLE_API_KEY') ?? ''
  return key.startsWith('pdl_sdbx_') ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com'
}

function toStatus(raw: string): SubscriptionStatus {
  switch (raw) {
    case 'active': return 'active'
    case 'trialing': return 'trialing'
    case 'past_due': return 'past_due'
    case 'canceled': return 'canceled'
    case 'paused': return 'expired'
    default: return 'expired'
  }
}

function priceFor(plan: CheckoutRequest['plan']): string | null {
  switch (plan) {
    case 'monthly': return env('PADDLE_PRICE_MONTHLY')
    case 'annual': return env('PADDLE_PRICE_ANNUAL')
    case 'lifetime': return env('PADDLE_PRICE_LIFETIME')
  }
}

interface PaddleTransactionResponse {
  data?: { id?: string; checkout?: { url?: string } }
  error?: { detail?: string }
}

interface PaddleWebhookBody {
  event_id?: string
  event_type?: string
  data?: Record<string, unknown>
}

/**
 * Paddle signs `ts:body` and sends `ts=…;h1=…`.
 */
function verify(rawBody: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(';').map((piece) => {
      const at = piece.indexOf('=')
      return [piece.slice(0, at), piece.slice(at + 1)]
    }),
  )
  const ts = parts.ts
  const h1 = parts.h1
  if (!ts || !h1) return false

  // Reject a delivery older than five minutes: a signature stays valid forever
  // otherwise, so a captured request could be replayed to re-grant access.
  const age = Math.abs(Date.now() / 1000 - Number(ts))
  if (!Number.isFinite(age) || age > 300) return false

  const expected = createHmac('sha256', secret).update(`${ts}:${rawBody}`, 'utf8').digest('hex')
  const a = Buffer.from(h1, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

export const paddleGateway: PaymentGateway = {
  id: 'paddle',
  label: 'Paddle',

  isConfigured: () => Boolean(env('PADDLE_API_KEY') && env('PADDLE_WEBHOOK_SECRET')),

  async createCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
    const key = env('PADDLE_API_KEY')
    const price = priceFor(request.plan)
    if (!key) throw new GatewayError('بوابة الدفع غير مهيّأة.', 503)
    if (!price) throw new GatewayError(`لا يوجد سعر مضبوط للخطة: ${request.plan}`, 503)

    const response = await fetch(`${apiBase()}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        items: [{ price_id: price, quantity: 1 }],
        // Echoed on every webhook for this purchase — how a payment finds its
        // user when the buyer pays with a different email than they signed up
        // with, which they routinely do.
        custom_data: { reference: request.reference, user_id: request.userId },
        customer: request.email ? { email: request.email } : undefined,
        checkout: { url: request.successUrl },
      }),
    })

    const body = (await response.json()) as PaddleTransactionResponse
    if (!response.ok || !body.data?.checkout?.url) {
      throw new GatewayError(body.error?.detail ?? 'تعذّر إنشاء صفحة الدفع.', 502)
    }
    return { url: body.data.checkout.url, externalId: body.data.id }
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<GatewayEvent> {
    const secret = env('PADDLE_WEBHOOK_SECRET')
    if (!secret) throw new GatewayError('بوابة الدفع غير مهيّأة.', 503)
    if (!verify(rawBody, headers.get('paddle-signature') ?? '', secret)) throw new SignatureError()

    const body = JSON.parse(rawBody) as PaddleWebhookBody
    const eventType = body.event_type ?? 'unknown'
    const data = body.data ?? {}
    const isSubscription = eventType.startsWith('subscription.')

    const billing = data.current_billing_period as { starts_at?: string; ends_at?: string } | undefined
    const items = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : []
    const firstPrice = items[0]?.price as { description?: string } | undefined
    const custom = data.custom_data as Record<string, string> | undefined

    return {
      provider: 'paddle',
      eventId: body.event_id ?? `${eventType}:${String(data.id ?? '')}`,
      eventType,
      raw: body,
      subscription: isSubscription && data.id
        ? {
            externalSubscriptionId: String(data.id),
            externalCustomerId: data.customer_id != null ? String(data.customer_id) : null,
            email: null, // Paddle sends the customer id; the email needs a second call.
            plan: firstPrice?.description ?? 'monthly',
            status: toStatus(String(data.status ?? '')),
            periodStart: billing?.starts_at ?? null,
            periodEnd: billing?.ends_at ?? null,
            cancelAtPeriodEnd: data.scheduled_change != null,
            reference: custom?.reference ?? null,
          }
        : undefined,
    }
  },
}
