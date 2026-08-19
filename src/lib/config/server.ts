import 'server-only'

// Server-side reader for app_config.
//
// PRICE LIVES IN THE DATABASE. This module is the only way price reaches the
// application, and it never invents one: when `pricing.monthlyAmount` is null
// the caller gets null and must render an "unpriced" state. There is no
// fallback number anywhere in this file — grep for a price literal in src/ and
// you will find nothing.
//
// Two readers, deliberately different:
//   * getAppConfig()    - service role, reads EVERY key including `gateway.*`.
//                         Callable only from route handlers and Server
//                         Components. Never serialise its result to the client.
//   * getPublicConfig() - the same minus `gateway`, safe to hand to the browser.
//
// Both are memoised per request with React `cache`, so a page that asks for the
// price in three places still costs one round trip.

import { cache } from 'react'
import {
  DEFAULT_CONFIG,
  applyConfigRows,
  toPublicConfig,
  type AppConfig,
  type PublicAppConfig,
} from './schema'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'

/**
 * The whole config, private keys included.
 *
 * Falls back to DEFAULT_CONFIG when Supabase is not wired up or the query
 * fails. That fallback is safe by construction: every amount in it is null and
 * `features.checkoutEnabled` is false, so a database outage sells nothing and
 * quotes nothing — it does not accidentally give the app away or invent a price.
 */
export const getAppConfig = cache(async (): Promise<AppConfig> => {
  if (!isSupabaseConfigured()) return DEFAULT_CONFIG

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.from('app_config').select('key, value')
    if (error || !data) {
      console.error('[config] app_config read failed:', error?.message)
      return DEFAULT_CONFIG
    }
    const { config, problems } = applyConfigRows(data)
    if (problems.length > 0) console.warn('[config]', problems.join('; '))
    return config
  } catch (err) {
    console.error('[config] app_config unavailable:', (err as Error).message)
    return DEFAULT_CONFIG
  }
})

/** The config with `gateway` stripped. This is what may cross to the browser. */
export const getPublicConfig = cache(async (): Promise<PublicAppConfig> => {
  return toPublicConfig(await getAppConfig())
})

/**
 * Public config read through the *anon* client rather than the service role.
 *
 * Used by GET /api/config, which is unauthenticated. Going through RLS here
 * means the `app_config_public_read` policy — `using (is_public)` — is what
 * decides which keys are visible, instead of this file remembering to filter.
 * If a future key is marked private in the database it disappears from the
 * public endpoint automatically.
 */
export async function getPublicConfigViaRls(): Promise<PublicAppConfig> {
  if (!isSupabaseConfigured()) return toPublicConfig(DEFAULT_CONFIG)
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('app_config').select('key, value')
    if (error || !data) return toPublicConfig(DEFAULT_CONFIG)
    const { config } = applyConfigRows(data)
    return toPublicConfig(config)
  } catch {
    return toPublicConfig(DEFAULT_CONFIG)
  }
}

// ── Pricing helpers ─────────────────────────────────────────────────────────

export type PlanId = 'monthly' | 'annual' | 'lifetime'

export const PLAN_IDS: readonly PlanId[] = ['monthly', 'annual', 'lifetime'] as const

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && (PLAN_IDS as readonly string[]).includes(value)
}

export interface PlanPrice {
  plan: PlanId
  /** Null means the owner has not set this price. Render "unpriced", not 0. */
  amount: number | null
  currency: string
  /** True only when an amount is present and greater than zero. */
  sellable: boolean
}

/** Reads one plan's price out of config. Never returns a default amount. */
export function planPrice(config: AppConfig, plan: PlanId): PlanPrice {
  const amount =
    plan === 'monthly'
      ? config.pricing.monthlyAmount
      : plan === 'annual'
        ? config.pricing.annualAmount
        : config.pricing.lifetimeAmount

  return {
    plan,
    amount,
    currency: config.pricing.currency,
    sellable: typeof amount === 'number' && amount > 0,
  }
}

/** Every plan the owner has actually priced. Empty until they set one. */
export function sellablePlans(config: AppConfig): PlanPrice[] {
  return PLAN_IDS.map((p) => planPrice(config, p)).filter((p) => p.sellable)
}
