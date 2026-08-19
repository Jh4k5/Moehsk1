import 'server-only'
// ─── Choosing the gateway ───────────────────────────────────────────────────
//
// One function decides which provider is live, and it reads that decision from
// `app_config` — the table the admin panel writes — not from an import, an env
// var alone, or a constant. So switching provider is something the owner does
// from a screen, and losing a provider's keys degrades to codes-only rather
// than to a checkout button that leads nowhere.
//
// TWO conditions, and both are required:
//   1. the admin panel selected the provider, AND
//   2. that provider's secrets are actually present in the environment.
//
// Selecting a provider whose keys are missing must not half-enable checkout —
// that is the state where a customer clicks "subscribe" and gets a 500.

import { getAppConfig } from '@/lib/config/server'
import { noneGateway } from './none'
import { paddleGateway } from './paddle'
import { lemonSqueezyGateway } from './lemonsqueezy'
import type { PaymentGateway, ProviderId } from './types'

export * from './types'

const REGISTRY: Record<ProviderId, PaymentGateway> = {
  none: noneGateway,
  paddle: paddleGateway,
  lemonsqueezy: lemonSqueezyGateway,
  // Stripe is in the schema's enum and has no adapter: it does not onboard
  // sellers in either of the owner's countries. The entry exists so the record
  // is exhaustive and a future adapter has an obvious home.
  stripe: noneGateway,
}

/** The provider the owner selected, whether or not its keys are present. */
export async function selectedProvider(): Promise<ProviderId> {
  const config = await getAppConfig()
  return config.gateway.provider
}

/** The live gateway. `noneGateway` whenever checkout cannot actually work. */
export async function activeGateway(): Promise<PaymentGateway> {
  const config = await getAppConfig()
  if (!config.features.checkoutEnabled) return noneGateway
  const gateway = REGISTRY[config.gateway.provider] ?? noneGateway
  return gateway.isConfigured() ? gateway : noneGateway
}

/**
 * Which provider a webhook path belongs to.
 *
 * Deliveries are routed by URL — `/api/webhook/paddle` — rather than sniffed
 * from the body, so a request can only ever be verified against the secret of
 * the provider it claims to be. Sniffing would let an attacker pick the
 * verifier by shaping the payload.
 */
export function gatewayForPath(slug: string): PaymentGateway | null {
  const gateway = REGISTRY[slug as ProviderId]
  if (!gateway || gateway.id === 'none') return null
  return gateway.isConfigured() ? gateway : null
}

/** Every provider with an adapter, for the admin panel's picker. */
export function availableProviders(): { id: ProviderId; label: string; configured: boolean }[] {
  return (['none', 'paddle', 'lemonsqueezy'] as ProviderId[]).map((id) => ({
    id,
    label: REGISTRY[id].label,
    configured: REGISTRY[id].isConfigured(),
  }))
}
