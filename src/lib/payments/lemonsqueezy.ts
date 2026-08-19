import 'server-only'
// ─── Lemon Squeezy ──────────────────────────────────────────────────────────
//
// Merchant of record: it collects the money, handles VAT in every country it
// sells into, and pays out to the seller's bank. That matters here because the
// buyers are in Yemen, Egypt, China and Russia while the seller's usable
// account is Egyptian — the alternative is registering for tax in each of
// those markets.
//
// NOT ENABLED until `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID` and
// `LEMONSQUEEZY_WEBHOOK_SECRET` are set AND the admin panel selects it. Absent
// those, `isConfigured()` is false and the factory serves `noneGateway`, so
// this file being present changes nothing about how the platform behaves.

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

const API = 'https://api.lemonsqueezy.com/v1'

function env(name: string): string | null {
  const v = process.env[name]
  return v && v.length > 0 ? v : null
}

/** Their status vocabulary → ours. Anything unrecognised is treated as expired,
 *  because the safe failure for entitlement is "no access", never "access". */
function toStatus(raw: string): SubscriptionStatus {
  switch (raw) {
    case 'active': return 'active'
    case 'on_trial': return 'trialing'
    case 'past_due': return 'past_due'
    case 'cancelled': return 'canceled'
    case 'paused':
    case 'unpaid':
    case 'expired': return 'expired'
    default: return 'expired'
  }
}

/** The variant id for a plan, from env. One per plan, set in their dashboard. */
function variantFor(plan: CheckoutRequest['plan']): string | null {
  switch (plan) {
    case 'monthly': return env('LEMONSQUEEZY_VARIANT_MONTHLY')
    case 'annual': return env('LEMONSQUEEZY_VARIANT_ANNUAL')
    case 'lifetime': return env('LEMONSQUEEZY_VARIANT_LIFETIME')
  }
}

interface LsCheckoutResponse {
  data?: { id?: string; attributes?: { url?: string } }
  errors?: { detail?: string }[]
}

interface LsWebhookBody {
  meta?: { event_name?: string; webhook_id?: string; custom_data?: Record<string, string> }
  data?: {
    id?: string
    attributes?: Record<string, unknown>
  }
}

export const lemonSqueezyGateway: PaymentGateway = {
  id: 'lemonsqueezy',
  label: 'Lemon Squeezy',

  isConfigured: () =>
    Boolean(env('LEMONSQUEEZY_API_KEY') && env('LEMONSQUEEZY_STORE_ID') && env('LEMONSQUEEZY_WEBHOOK_SECRET')),

  async createCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
    const key = env('LEMONSQUEEZY_API_KEY')
    const store = env('LEMONSQUEEZY_STORE_ID')
    const variant = variantFor(request.plan)
    if (!key || !store) throw new GatewayError('بوابة الدفع غير مهيّأة.', 503)
    if (!variant) throw new GatewayError(`لا يوجد سعر مضبوط للخطة: ${request.plan}`, 503)

    const response = await fetch(`${API}/checkouts`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: request.email ?? undefined,
              // Echoed back on every webhook for this purchase. It is how a
              // payment finds its user when the buyer pays with a different
              // email than they signed up with — which they routinely do.
              custom: { reference: request.reference, user_id: request.userId },
            },
            product_options: {
              redirect_url: request.successUrl,
              receipt_button_text: 'العودة إلى المنصة',
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: store } },
            variant: { data: { type: 'variants', id: variant } },
          },
        },
      }),
    })

    const body = (await response.json()) as LsCheckoutResponse
    if (!response.ok || !body.data?.attributes?.url) {
      throw new GatewayError(body.errors?.[0]?.detail ?? 'تعذّر إنشاء صفحة الدفع.', 502)
    }
    return { url: body.data.attributes.url, externalId: body.data.id }
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<GatewayEvent> {
    const secret = env('LEMONSQUEEZY_WEBHOOK_SECRET')
    if (!secret) throw new GatewayError('بوابة الدفع غير مهيّأة.', 503)

    const signature = headers.get('x-signature') ?? ''
    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
    // Constant-time, and length-checked first: `timingSafeEqual` throws on a
    // length mismatch, which would itself leak the expected length.
    const a = Buffer.from(signature, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new SignatureError()

    const body = JSON.parse(rawBody) as LsWebhookBody
    const eventType = body.meta?.event_name ?? 'unknown'
    // Their `webhook_id` is per delivery; the subscription id plus the event
    // name is what actually identifies the transition, and is stable on retry.
    const attrs = body.data?.attributes ?? {}
    const subId = String(body.data?.id ?? '')
    const eventId = body.meta?.webhook_id ?? `${eventType}:${subId}:${String(attrs.updated_at ?? '')}`

    const isSubscriptionEvent = eventType.startsWith('subscription_')
    return {
      provider: 'lemonsqueezy',
      eventId,
      eventType,
      raw: body,
      subscription: isSubscriptionEvent && subId
        ? {
            externalSubscriptionId: subId,
            externalCustomerId: attrs.customer_id != null ? String(attrs.customer_id) : null,
            email: typeof attrs.user_email === 'string' ? attrs.user_email : null,
            plan: typeof attrs.variant_name === 'string' ? attrs.variant_name : 'monthly',
            status: toStatus(String(attrs.status ?? '')),
            periodStart: typeof attrs.created_at === 'string' ? attrs.created_at : null,
            periodEnd: typeof attrs.renews_at === 'string' ? attrs.renews_at : null,
            cancelAtPeriodEnd: attrs.cancelled === true,
            reference: body.meta?.custom_data?.reference ?? null,
          }
        : undefined,
    }
  },
}
