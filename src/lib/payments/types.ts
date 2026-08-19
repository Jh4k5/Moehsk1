// ─── What a payment gateway must look like from inside this platform ────────
//
// The platform is NOT committed to a provider. The owner banks in Yemen and
// Egypt; no gateway accepts a Yemeni seller, and the Egyptian account opens
// Paddle and Lemon Squeezy — but which one, and whether it survives their
// review, is not known yet. So nothing above this file may name a provider.
//
// Two operations is the whole surface:
//   1. `createCheckout` — turn "this user wants this plan" into a URL to send
//      them to.
//   2. `parseWebhook`   — turn a verified delivery into a normalised grant.
//
// Everything else (which provider, which price, whether checkout is on at all)
// is configuration in `app_config`, editable from the admin panel.

import type { SubscriptionSource, SubscriptionStatus } from '@/lib/supabase/database.types'

/** The providers the schema's enum already knows. `none` = codes only. */
export type ProviderId = 'none' | 'paddle' | 'lemonsqueezy' | 'stripe'

export interface CheckoutRequest {
  /** The signed-in buyer. */
  userId: string
  email: string | null
  /** Which configured price. The amount itself never crosses this boundary. */
  plan: 'monthly' | 'annual' | 'lifetime'
  /** Where to send the buyer afterwards, absolute. */
  successUrl: string
  cancelUrl: string
  /** Echoed back by the gateway so a webhook can find the user with no email. */
  reference: string
}

export interface CheckoutResult {
  /** Where to send the browser. */
  url: string
  /** The gateway's id for this checkout, when it gives one. */
  externalId?: string
}

/** A webhook delivery, normalised. One shape, whichever provider sent it. */
export interface GatewayEvent {
  provider: SubscriptionSource
  /** The provider's event id — the idempotency key. */
  eventId: string
  eventType: string
  /** Present on events that grant or change entitlement. */
  subscription?: {
    externalSubscriptionId: string
    externalCustomerId: string | null
    email: string | null
    plan: string
    status: SubscriptionStatus
    periodStart: string | null
    periodEnd: string | null
    cancelAtPeriodEnd: boolean
    /** The `reference` handed to `createCheckout`, when the provider echoes it. */
    reference: string | null
  }
  /** The verified raw body, stored for reconciliation. */
  raw: unknown
}

export class GatewayError extends Error {
  constructor(message: string, readonly status: number = 400) {
    super(message)
    this.name = 'GatewayError'
  }
}

/** Raised when a delivery fails signature verification. Never retried. */
export class SignatureError extends GatewayError {
  constructor(message = 'signature verification failed') {
    super(message, 401)
    this.name = 'SignatureError'
  }
}

export interface PaymentGateway {
  readonly id: ProviderId
  /** Human name, for the admin panel. */
  readonly label: string
  /** False until the provider's keys are configured. */
  isConfigured(): boolean
  createCheckout(request: CheckoutRequest): Promise<CheckoutResult>
  /**
   * Verify and parse a delivery.
   *
   * Takes the RAW body text, not a parsed object: every provider signs the
   * bytes it sent, and `JSON.parse` followed by `JSON.stringify` does not
   * reproduce them.
   */
  parseWebhook(rawBody: string, headers: Headers): Promise<GatewayEvent>
}
