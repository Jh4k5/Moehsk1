import 'server-only'
// ─── The "no gateway" gateway ───────────────────────────────────────────────
//
// The default, and today the only one that is live. It refuses checkout and
// accepts no webhooks.
//
// This is not a stub to be replaced later — it is the shipping configuration.
// The platform sells through activation codes from day one, which need no
// provider, no merchant review and no waiting. When a gateway is added, this
// one stays as the state the platform falls back to if the provider's keys are
// removed or its review fails, so losing a gateway degrades to "codes only"
// rather than to a broken checkout button.

import { GatewayError, type CheckoutRequest, type CheckoutResult, type GatewayEvent, type PaymentGateway } from './types'

export const noneGateway: PaymentGateway = {
  id: 'none',
  label: 'بلا بوابة — أكواد التفعيل فقط',

  isConfigured: () => true,

  async createCheckout(_request: CheckoutRequest): Promise<CheckoutResult> {
    throw new GatewayError('لا توجد بوابة دفع مفعّلة. استخدم كود التفعيل.', 503)
  },

  async parseWebhook(_rawBody: string, _headers: Headers): Promise<GatewayEvent> {
    throw new GatewayError('لا توجد بوابة دفع مفعّلة.', 404)
  },
}
