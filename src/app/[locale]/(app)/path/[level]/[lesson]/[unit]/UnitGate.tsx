'use client'
// ─── May this learner open this unit? ───────────────────────────────────────
//
// TWO LOCKS, NOT ONE. They answer different questions and a unit opens only
// when both say yes:
//
//   1. Progress  — "have you finished the unit before it?"  (pedagogy)
//   2. Access    — "does the free tier or your subscription cover it?" (money)
//
// This file used to ask only the first. `lib/entitlement/gate.ts` was written
// for the second and NOTHING CALLED IT — so the padlock a learner saw always
// meant "come back later", never "this is paid", and the whole paid tier had
// no gate at the page level at all. The words themselves were still withheld
// by `/api/content/[level]`, so nobody could read HSK2 for free; but a
// subscriber and a stranger saw the identical screen, and the stranger was
// never told there was anything to buy.
//
// The access half is fetched from `/api/entitlement`, the server's single
// verdict, rather than derived here: a lock a browser can compute is a lock a
// browser can skip.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, ShoppingCart } from 'lucide-react'
import { SessionRunner } from '@/features/session/SessionRunner'
import { useMounted } from '@/hooks/use-mounted'
import { useLearningStore } from '@/lib/store'
import { isUnitUnlocked, nextUnitFor } from '@/lib/curriculum/progress'
import { isUnitFree } from '@/lib/entitlement/policy'
import { hrefFor } from '@/components/nav/nav-model'
import { makeT, type Locale } from '@/lib/locale'
import { unitTitle, unitGoal, type Unit } from '@/lib/curriculum/types'

interface Verdict {
  signedIn: boolean
  isEntitled: boolean
  policy: { freePrimer: boolean; freeLessonCount: number; freeLevels: number[] }
}

export function UnitGate({ unit, locale }: { unit: Unit; locale: Locale }) {
  const t = makeT(locale)
  const mounted = useMounted()
  const progress = useLearningStore((s) => s.unitProgress)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [asked, setAsked] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/entitlement', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: Verdict | null) => {
        if (!cancelled) {
          setVerdict(body)
          setAsked(true)
        }
      })
      .catch(() => { if (!cancelled) setAsked(true) })
    return () => { cancelled = true }
  }, [])

  // Before the persisted store is read back and the server has answered,
  // nothing is known. Rendering a lock first would flash "locked" at a
  // subscriber who finished this yesterday.
  if (!mounted || !asked) return <div className="j-section-skeleton" aria-busy="true" />

  // ── Lock 2: money ─────────────────────────────────────────────────────────
  // Checked FIRST because it is the one the learner can act on right now. A
  // missing verdict is treated as "not entitled": failing closed is the same
  // rule the server follows.
  const policy = verdict?.policy ?? { freePrimer: true, freeLessonCount: 0, freeLevels: [] }
  const covered = verdict?.isEntitled === true || isUnitFree(unit.ref, policy)

  if (!covered) {
    return (
      <div className="j-locked">
        <span className="j-locked-icon j-locked-icon-paid" aria-hidden><ShoppingCart size={26} /></span>
        <h1>{unitTitle(unit, locale)}</h1>
        <p>{unitGoal(unit, locale)}</p>
        <p className="j-locked-why">
          {verdict?.signedIn
            ? t(
                `هذه الوحدة ضمن الاشتراك. الدرسان الأولان من كل مستوى مفتوحان بالكامل — جرّبهما، ثم اشترك لتكمل.`,
                `This unit is part of the subscription. The first two lessons of every level are fully open — try them, then subscribe to continue.`,
              )
            : t(
                `هذه الوحدة ضمن الاشتراك. سجّل الدخول لتفتح الدرسين المجانيين في مستواك، أو فعّل كودك.`,
                `This unit is part of the subscription. Sign in to open the two free lessons at your level, or redeem your code.`,
              )}
        </p>
        <Link href={verdict?.signedIn ? `/${locale}/me` : `/${locale}/sign-in`} className="j-ready">
          {verdict?.signedIn ? t('اشترك أو فعّل كوداً', 'Subscribe or redeem a code') : t('تسجيل الدخول', 'Sign in')}
        </Link>
        <Link href={hrefFor(locale, 'lessons')} className="j-locked-back">
          {t('العودة إلى المسار', 'Back to my path')}
        </Link>
      </div>
    )
  }

  // ── Lock 1: pedagogy ──────────────────────────────────────────────────────
  if (!isUnitUnlocked(unit.ref, progress)) {
    const next = nextUnitFor(unit.ref.level, progress)
    return (
      <div className="j-locked">
        <span className="j-locked-icon" aria-hidden><Lock size={26} /></span>
        <h1>{unitTitle(unit, locale)}</h1>
        <p>{unitGoal(unit, locale)}</p>
        <p className="j-locked-why">
          {t(
            'هذه الوحدة تُفتح حين تُنهي التي قبلها. المسار متدرّج: كل وحدة تبني على ما قبلها.',
            'This unit opens once you finish the one before it. The path is graded — each unit builds on the last.',
          )}
        </p>
        {next && (
          <Link
            href={`/${locale}/path/${next.ref.level}/${next.ref.lesson}/${next.ref.unit}`}
            className="j-ready"
          >
            {t('ابدأ من:', 'Start with:')} {unitTitle(next, locale)}
          </Link>
        )}
        <Link href={hrefFor(locale, 'lessons')} className="j-locked-back">
          {t('العودة إلى المسار', 'Back to my path')}
        </Link>
      </div>
    )
  }

  return <SessionRunner unit={unit} locale={locale} />
}
