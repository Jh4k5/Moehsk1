'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

// ─── Configuration ──────────────────────────────────────────
const CONFIG = {
  TRIAL_MS: 24 * 60 * 60 * 1000, // 1 day trial
  PRICE: '$9',
  GUMROAD_URL: 'https://gumroad.com/l/YOUR_PRODUCT',
  STORAGE_KEY_OK: 'pw_ok',
  STORAGE_KEY_TRIAL_START: 'pw_t',
}

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
function getInitialState(): PaywallState {
  if (typeof window === 'undefined') {
    return { status: 'active', trialRemaining: 0, isPaid: false }
  }

  // Check if already paid
  if (localStorage.getItem(CONFIG.STORAGE_KEY_OK) === '1') {
    return { status: 'active', trialRemaining: 0, isPaid: true }
  }

  // Get or create trial start time
  let startTime = localStorage.getItem(CONFIG.STORAGE_KEY_TRIAL_START)
  if (!startTime) {
    startTime = Date.now().toString()
    localStorage.setItem(CONFIG.STORAGE_KEY_TRIAL_START, startTime)
  }

  const remaining = CONFIG.TRIAL_MS - (Date.now() - Number(startTime))
  return {
    status: remaining <= 0 ? 'expired' : 'trial',
    trialRemaining: Math.max(0, remaining),
    isPaid: false,
  }
}

// ─── Provider ───────────────────────────────────────────────
export function PaywallProvider({ children }: { children: ReactNode }) {
  // Use lazy initializer to avoid effect-based state setting
  const [state, setState] = useState<PaywallState>(getInitialState)
  const [isActivated, setIsActivated] = useState(false)
  const mountedRef = useRef(false)

  // Tick timer every second during trial
  useEffect(() => {
    if (state.status !== 'trial') return

    const interval = setInterval(() => {
      const startTime = Number(localStorage.getItem(CONFIG.STORAGE_KEY_TRIAL_START) || Date.now())
      const remaining = CONFIG.TRIAL_MS - (Date.now() - startTime)

      if (remaining <= 0) {
        setState(prev => ({ ...prev, trialRemaining: 0, status: 'expired' }))
        clearInterval(interval)
        return
      }

      setState(prev => ({ ...prev, trialRemaining: remaining }))
    }, 1000)

    return () => clearInterval(interval)
  }, [state.status])

  // Activate license key
  const activateLicense = useCallback(async (key: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/validate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key }),
      })

      if (!res.ok) {
        return { success: false, error: 'خطأ بالاتصال، حاول مجدداً' }
      }

      const data = await res.json()

      if (data.valid) {
        localStorage.setItem(CONFIG.STORAGE_KEY_OK, '1')
        setState({ status: 'active', trialRemaining: 0, isPaid: true })
        setIsActivated(true)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'مفتاح خاطئ — تحقق من بريدك الإلكتروني' }
      }
    } catch {
      return { success: false, error: 'خطأ بالاتصال، حاول مجدداً' }
    }
  }, [])

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
