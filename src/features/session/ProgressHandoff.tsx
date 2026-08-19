'use client'
// ─── The one-time handoff after signing in ──────────────────────────────────
//
// A learner who studied for weeks without an account has all of it in this
// browser. This is what carries it over, and it runs exactly once per account.
//
// It is a NOTICE, not a dialog. Asking "may we upload your progress?" invites
// the answer "not now", and "not now" means they sign in on their phone next
// week and find nothing. The safe default is to carry it, tell them plainly
// that it happened, and let them dismiss.
//
// It renders nothing at all when there is nothing to carry, which is the common
// case for someone who signs up on their first visit.

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { hasLocalProgress, importLocalProgress } from '@/lib/supabase/progress-import'
import { useMounted } from '@/hooks/use-mounted'

type Phase = 'idle' | 'running' | 'done' | 'skipped' | 'failed'

/** Marked per browser, so a second device does not retry a finished import. */
const FLAG = 'jisr_progress_handoff'

export function ProgressHandoff({ signedIn }: { signedIn: boolean }) {
  const mounted = useMounted()
  const [phase, setPhase] = useState<Phase>('idle')
  const [summary, setSummary] = useState<{ words: number; units: number } | null>(null)

  const run = useCallback(async () => {
    setPhase('running')
    const result = await importLocalProgress()
    if (result.ok) {
      localStorage.setItem(FLAG, new Date().toISOString())
      setSummary({ words: result.words ?? 0, units: result.units ?? 0 })
      setPhase((result.words ?? 0) + (result.units ?? 0) > 0 ? 'done' : 'skipped')
      return
    }
    // `already_imported` is not a failure — this account has been through the
    // handoff on another device, and the server's copy is the authority.
    if (result.error === 'already_imported') {
      localStorage.setItem(FLAG, new Date().toISOString())
      setPhase('skipped')
      return
    }
    setPhase('failed')
  }, [])

  useEffect(() => {
    if (!mounted || !signedIn) return
    if (localStorage.getItem(FLAG)) return
    if (!hasLocalProgress()) {
      localStorage.setItem(FLAG, new Date().toISOString())
      return
    }
    void run()
  }, [mounted, signedIn, run])

  if (!mounted || phase === 'idle' || phase === 'skipped') return null

  return (
    <div className={'j-handoff is-' + phase} role="status" aria-live="polite">
      {phase === 'running' && (
        <>
          <Loader2 size={16} className="j-handoff-spin" aria-hidden />
          <span>ننقل تقدّمك إلى حسابك…</span>
        </>
      )}
      {phase === 'done' && summary && (
        <>
          <Check size={16} aria-hidden />
          <span>
            نُقل تقدّمك: {summary.words} كلمة و{summary.units} وحدة. صار متاحاً على كل أجهزتك.
          </span>
          <button type="button" onClick={() => setPhase('skipped')} aria-label="إغلاق"><X size={15} /></button>
        </>
      )}
      {phase === 'failed' && (
        <>
          <X size={16} aria-hidden />
          <span>تعذّر نقل تقدّمك. تقدّمك على هذا الجهاز سليم — سنحاول لاحقاً.</span>
          <button type="button" onClick={() => void run()}>أعد المحاولة</button>
        </>
      )}
    </div>
  )
}
