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
      //
      // This is a FLAG, not a link. `/api/checkout` is POST-only and answers a
      // GET with 405, so the buttons that used to `window.location.assign` it
      // would have replaced the app with a raw "405 Method Not Allowed" the
      // moment the owner switched checkout on. Use `startCheckout()` below.
      checkoutHref: config.features.checkoutEnabled ? '/api/checkout' : null,
      currency,
    }
  }, [config, locale])
}

// ── Starting a purchase ─────────────────────────────────────────────────────

export type CheckoutPlan = 'monthly' | 'annual' | 'lifetime'

/**
 * Begin a purchase and go wherever the gateway says.
 *
 * `POST /api/checkout` returns a URL to send the buyer to; it is not a page.
 * Both buy buttons used to navigate to it with a GET, which the route answers
 * with 405 — so enabling checkout would have turned "Buy" into an error page.
 *
 * Returns a message to show the user instead of throwing, because every
 * failure here has a specific thing the reader should do next: sign in first,
 * or use an activation code while no gateway is connected.
 */
export async function startCheckout(
  plan: CheckoutPlan,
  locale: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const ar = locale !== 'en'
  const say = (a: string, e: string) => (ar ? a : e)
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ plan }),
    })
    const body = await res.json().catch(() => null)

    if (res.ok && body?.ok && typeof body.url === 'string') {
      window.location.assign(body.url)
      return { ok: true }
    }

    // A purchase needs an account: the webhook has to know whose subscription
    // it is granting, and the buyer often pays with a different email.
    if (res.status === 401) {
      const next = encodeURIComponent(window.location.pathname)
      window.location.assign(`/${ar ? 'ar' : 'en'}/sign-in?next=${next}`)
      return { ok: true }
    }
    if (res.status === 503) {
      return {
        ok: false,
        message: say(
          'الدفع الإلكتروني غير مفعّل بعد. استعمل كود التفعيل، أو راسلنا للحصول على واحد.',
          'Online payment is not switched on yet. Use an activation code, or contact us for one.',
        ),
      }
    }
    if (res.status === 409) {
      return {
        ok: false,
        message: say('هذه الخطة غير مسعّرة بعد.', 'This plan has no price set yet.'),
      }
    }
    return {
      ok: false,
      message: say('تعذّر بدء عملية الشراء الآن.', 'Could not start the purchase right now.'),
    }
  } catch {
    return {
      ok: false,
      message: say('تعذّر الاتصال بالخادم.', 'Could not reach the server.'),
    }
  }
}
