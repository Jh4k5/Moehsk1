'use client'
// ─── The owner's settings, on the client ────────────────────────────────────
//
// One provider, one hook, and NO price literal anywhere below it. The amount
// arrives from `app_config` — the table the admin panel writes — and is `null`
// until the owner sets one. Every consumer must handle `null` by showing a call
// to action WITHOUT a number; that is a deliberate, visible gap, not a bug.
//
// Until the Supabase session layer is wired into the app shell, the provider
// serves `DEFAULT_CONFIG`, whose amounts are all null. So today the platform
// renders "اشترك" with no figure — which is the honest state of a platform
// whose owner has not priced it yet — and the moment the panel writes a price,
// the same components render it. No code change, no redeploy.

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { DEFAULT_CONFIG, type PublicAppConfig } from './schema'

const ConfigContext = createContext<PublicAppConfig>(DEFAULT_CONFIG)

export function AppConfigProvider({
  value,
  children,
}: {
  value?: PublicAppConfig
  children: ReactNode
}) {
  return <ConfigContext.Provider value={value ?? DEFAULT_CONFIG}>{children}</ConfigContext.Provider>
}

/** The owner's settings, minus everything server-only. */
export function useAppConfig(): PublicAppConfig {
  return useContext(ConfigContext)
}

export interface Pricing {
  /** The lifetime price, formatted for display — or `null` when unpriced. */
  lifetime: string | null
  /** The monthly price, formatted — or `null`. */
  monthly: string | null
  /** True when NO amount is configured. Consumers show a number-free CTA. */
  unpriced: boolean
  /** Where "subscribe" goes. Null when checkout is off — render no link. */
  checkoutHref: string | null
  currency: string
}

function formatAmount(amount: number | null, currency: string, locale: string): string | null {
  if (amount == null) return null
  try {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ar-EG', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    // An unknown currency code should not blank the page.
    return `${amount} ${currency}`
  }
}

/**
 * Formatted prices for display.
 *
 * `locale` is passed in rather than read from a store so this stays usable from
 * a component that already knows its locale from the route.
 */
export function usePricing(locale: string = 'ar'): Pricing {
  const config = useAppConfig()
  return useMemo(() => {
    const { lifetimeAmount, monthlyAmount, currency } = config.pricing
    return {
      lifetime: formatAmount(lifetimeAmount, currency, locale),
      monthly: formatAmount(monthlyAmount, currency, locale),
      unpriced: lifetimeAmount == null && monthlyAmount == null && config.pricing.annualAmount == null,
      // Checkout is a feature flag AND a configured destination. Missing either
      // one means the button must not pretend to lead anywhere.
      checkoutHref: config.features.checkoutEnabled ? '/api/checkout' : null,
      currency,
    }
  }, [config, locale])
}
