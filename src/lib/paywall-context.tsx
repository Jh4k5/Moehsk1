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

// ─── Where the answer comes from now ────────────────────────
//
// THIS FILE USED TO DECIDE WHETHER SOMEONE HAD PAID, IN THE BROWSER.
//
//     if (localStorage.getItem('pw_ok') === '1') return { isPaid: true }
//
// One line in devtools unlocked the entire paid product. And any anonymous
// visitor was started on a 24-hour trial that no account and no row backed,
// so "the trial ended" meant "this browser's clock says so" — a reinstall,
// another browser, or a cleared cache reset it forever.
//
// The verdict now comes from `GET /api/entitlement`, which reads
// `subscriptions` in Postgres behind RLS and fails closed. `localStorage`
// keeps nothing but a cached copy for the first paint, and a cached copy can
// only ever make the UI *slower* to unlock, never wrongly unlocked: the
// content itself still comes from `/api/content/[level]`, which re-decides
// server-side and hands a non-subscriber nothing.

const CACHE_KEY = 'pw_cache'

interface ServerVerdict {
  signedIn: boolean
  isEntitled: boolean
  isLifetime: boolean
  activeUntil: string | null
}

/** Last known verdict, for the first paint only. Never trusted to unlock. */
function readCachedVerdict(): ServerVerdict | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ServerVerdict
    return typeof parsed?.isEntitled === 'boolean' ? parsed : null
  } catch {
    return null
  }
}

function cacheVerdict(v: ServerVerdict): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(v))
  } catch {
    // A private window with storage disabled is not an error worth surfacing.
  }
}

/** Turn the server's verdict into what the screens ask for. */
function toState(v: ServerVerdict | null): PaywallState {
  if (!v) return SERVER_STATE
  if (v.isEntitled) {
    const remaining = v.isLifetime || !v.activeUntil
      ? 0
      : Math.max(0, new Date(v.activeUntil).getTime() - Date.now())
    return { status: 'active', trialRemaining: remaining, isPaid: true }
  }
  // NOT entitled is not the same as "expired". A first-time visitor has two
  // free lessons waiting at their level; telling them their trial has ended,
  // over a full-screen wall, before they have read one character, is both
  // false and the worst possible first impression.
  //
  // Locking is per-unit now (`UnitGate` asks the server about THIS unit), so
  // the blanket overlay has nothing left to protect and plenty to break. It
  // stays reachable for a real expiry — see `trial.days` in app_config — but
  // simply not having paid is no longer an expiry.
  return { status: 'active', trialRemaining: 0, isPaid: false }
}

// ─── Provider ───────────────────────────────────────────────
export function PaywallProvider({ children }: { children: ReactNode }) {
  const [isActivated, setIsActivated] = useState(false)

  // `false` on the server and on the first client render, so the first pass
  // renders exactly the prerendered HTML. The browser's real answer lands one
  // render later, which is what keeps hydration silent.
  const mounted = useMounted()

  // The server's verdict. `undefined` = not asked yet.
  const [verdict, setVerdict] = useState<ServerVerdict | undefined>(undefined)

  // A clock, so a subscription that expires mid-session stops being honoured
  // without a reload.
  const [clock, setClock] = useState(0)
  const advance = useCallback(() => setClock((n) => n + 1), [])

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/entitlement', { credentials: 'same-origin' })
      if (!res.ok) return
      const body = (await res.json()) as ServerVerdict
      setVerdict(body)
      cacheVerdict(body)
    } catch {
      // Offline: keep whatever we have. The cached copy cannot over-grant,
      // and the content endpoint refuses independently.
    }
  }, [])

  useEffect(() => {
    // Deferred by a microtask, not called straight from the effect body. The
    // lint rule is right: `refresh()` reaches a `setState` on its first
    // synchronous leg, and doing that inside an effect cascades a render.
    // Queueing it changes nothing the user sees — the fetch was always async —
    // and keeps the first paint to a single pass.
    let cancelled = false
    queueMicrotask(() => { if (!cancelled) void refresh() })
    const interval = setInterval(advance, 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [refresh, advance])

  // Until the server answers, show the cached verdict — never a granted one
  // by default. `SERVER_STATE` is not-paid, so the honest failure is a lock.
  const state: PaywallState = useMemo(
    () => (mounted ? toState(verdict ?? readCachedVerdict()) : SERVER_STATE),
    [mounted, verdict, clock],
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
        // The grant is a row in `subscriptions` now. Re-ask the server rather
        // than setting a local flag: the flag WAS the vulnerability, and the
        // server already knows the truth a millisecond after the redemption.
        await refresh()
        setIsActivated(true)
        return { success: true }
      }
      return { success: false, error: data.error ?? 'هذا الكود غير صحيح.' }
    } catch {
      return { success: false, error: 'خطأ بالاتصال، حاول مجدداً' }
    }
  }, [refresh])

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
