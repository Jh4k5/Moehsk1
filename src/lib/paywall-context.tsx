'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { useMounted } from '@/hooks/use-mounted'

// ─── Configuration ──────────────────────────────────────────
//
// THERE IS NO PRICE HERE, AND THERE MUST NEVER BE ONE.
//
// The price is an owner-editable setting living in `app_config` (see
// `src/lib/config/schema.ts`), not a literal in the source. A hardcoded '$9'
// used to sit on this line and render on two screens; changing it meant editing
// code and redeploying, and any stale copy of it quietly lied to a customer.
// `usePricing()` below reads the configured amount and returns `null` until one
// is set — so an unpriced platform shows a call to action with no number,
// loudly, instead of a plausible wrong number, silently.
const CONFIG = {
  TRIAL_MS: 24 * 60 * 60 * 1000, // 1 day trial
  STORAGE_KEY_OK: 'pw_ok',
  STORAGE_KEY_TRIAL_START: 'pw_t',
}

/** What the server renders, and what the client renders on its FIRST pass.
 *  The real state depends on `localStorage` and `Date.now()`, neither of which
 *  exists during prerender — reading them in the initial render is what threw
 *  hydration error #418 on the account screen. */
const SERVER_STATE: PaywallState = { status: 'active', trialRemaining: 0, isPaid: false }

// ─── Types ──────────────────────────────────────────────────
type PaywallStatus = 'active' | 'trial' | 'expired'

interface PaywallState {
  status: PaywallStatus
  trialRemaining: number
  isPaid: boolean
}

interface PaywallContextType {
  status: PaywallStatus
  trialRemaining: number
  trialRemainingFormatted: string
  isPaid: boolean
  activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>
  isActivated: boolean
  setIsActivated: (v: boolean) => void
}

const PaywallContext = createContext<PaywallContextType | null>(null)

// ─── Helper ─────────────────────────────────────────────────
function formatTime(ms: number): string {
  if (ms <= 0) return '0:00:00'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Initial state from localStorage (client-side only) ────
function readState(): PaywallState {
  if (typeof window === 'undefined') return SERVER_STATE

  if (localStorage.getItem(CONFIG.STORAGE_KEY_OK) === '1') {
    return { status: 'active', trialRemaining: 0, isPaid: true }
  }

  // Starting the clock is a write, so it belongs in an effect, not in render.
  // A missing start time means "the trial has not begun" — it is begun by
  // `beginTrial()` once, after mount.
  const startTime = localStorage.getItem(CONFIG.STORAGE_KEY_TRIAL_START)
  if (!startTime) return SERVER_STATE

  const remaining = CONFIG.TRIAL_MS - (Date.now() - Number(startTime))
  return {
    status: remaining <= 0 ? 'expired' : 'trial',
    trialRemaining: Math.max(0, remaining),
    isPaid: false,
  }
}

function beginTrial(): void {
  if (localStorage.getItem(CONFIG.STORAGE_KEY_OK) === '1') return
  if (!localStorage.getItem(CONFIG.STORAGE_KEY_TRIAL_START)) {
    localStorage.setItem(CONFIG.STORAGE_KEY_TRIAL_START, Date.now().toString())
  }
}

// ─── Provider ───────────────────────────────────────────────
export function PaywallProvider({ children }: { children: ReactNode }) {
  const [isActivated, setIsActivated] = useState(false)

  // `false` on the server and on the first client render, so the first pass
  // renders exactly the prerendered HTML. The browser's real answer lands one
  // render later, which is what keeps hydration silent.
  const mounted = useMounted()

  // A clock, not a copy of the state. The trial's remaining time is DERIVED
  // from `localStorage` on every render rather than mirrored into state and
  // kept in sync — mirroring is what forced a `setState` inside an effect, and
  // it meant two sources of truth for one number. This bumps once a second and
  // once on activation, and the derivation below does the rest.
  const [clock, setClock] = useState(0)
  const advance = useCallback(() => setClock((n) => n + 1), [])

  useEffect(() => {
    // Writing the trial's start time is a side effect, so it happens here and
    // never during render.
    beginTrial()
    // No `advance()` here: `useMounted` already causes the re-render that
    // re-derives the state. The interval only keeps the countdown counting.
    const interval = setInterval(advance, 1000)
    return () => clearInterval(interval)
  }, [advance])

  // Reading `localStorage` here is a pure read: `beginTrial` above owns the one
  // write. `clock` is in the dependency list so the countdown actually counts.
  const state: PaywallState = useMemo(
    () => (mounted ? readState() : SERVER_STATE),
    [mounted, clock],
  )

  // Activate license key
  const activateLicense = useCallback(async (key: string): Promise<{ success: boolean; error?: string }> => {
    // POSTs to /api/redeem, which checks the code against the `redemption_codes`
    // table through a SECURITY DEFINER function.
    //
    // It used to POST to /api/validate-license, which compared the input against
    // SIX KEYS HARDCODED IN THIS REPOSITORY — 'JISR-BETA-LAUNCH' among them.
    // The repository is on GitHub, so anyone who read it had the paid version
    // for free, permanently, with no record that they had taken it. That route
    // is deleted.
    //
    // The real path needs an account, because a code grants a subscription and a
    // subscription belongs to someone. Saying so plainly is better than the old
    // behaviour of granting access to a browser.
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: key }),
      })

      if (res.status === 401) {
        return { success: false, error: 'سجّل الدخول أولاً لتفعيل الكود.' }
      }
      if (res.status === 429) {
        return { success: false, error: 'محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة.' }
      }
      if (!res.ok && res.status !== 200) {
        return { success: false, error: 'تعذّر تفعيل الكود الآن.' }
      }

      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (data.ok === true) {
        // The grant lives in the database now, not in this flag. The flag stays
        // so the current session stops showing the paywall without a reload.
        localStorage.setItem(CONFIG.STORAGE_KEY_OK, '1')
        advance()
        setIsActivated(true)
        return { success: true }
      }
      return { success: false, error: data.error ?? 'هذا الكود غير صحيح.' }
    } catch {
      return { success: false, error: 'خطأ بالاتصال، حاول مجدداً' }
    }
  }, [advance])

  return (
    <PaywallContext.Provider
      value={{
        status: state.status,
        trialRemaining: state.trialRemaining,
        trialRemainingFormatted: formatTime(state.trialRemaining),
        isPaid: state.isPaid,
        activateLicense,
        isActivated,
        setIsActivated,
      }}
    >
      {children}
    </PaywallContext.Provider>
  )
}

// ─── Hook ───────────────────────────────────────────────────
export function usePaywall() {
  const ctx = useContext(PaywallContext)
  if (!ctx) throw new Error('usePaywall must be used within PaywallProvider')
  return ctx
}

export { CONFIG }
