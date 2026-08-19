'use client'
// ─── May this learner open this unit? ───────────────────────────────────────
// Unlocking depends on stored progress, which only exists in the browser, so
// the check happens here rather than on the server. A locked unit shows what it
// would teach and points at the unit that IS next — never a bare 404, because
// the learner did nothing wrong by arriving early.

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { SessionRunner } from '@/features/session/SessionRunner'
import { useMounted } from '@/hooks/use-mounted'
import { useLearningStore } from '@/lib/store'
import { isUnitUnlocked, nextUnitFor } from '@/lib/curriculum/progress'
import { hrefFor } from '@/components/nav/nav-model'
import type { Locale } from '@/lib/locale'
import type { Unit } from '@/lib/curriculum/types'

export function UnitGate({ unit, locale }: { unit: Unit; locale: Locale }) {
  const mounted = useMounted()
  const progress = useLearningStore((s) => s.unitProgress)

  // Before the persisted store is read back, nothing is known. Rendering the
  // lock first would flash "locked" at a learner who finished it yesterday.
  if (!mounted) return <div className="j-section-skeleton" aria-busy="true" />

  if (!isUnitUnlocked(unit.ref, progress)) {
    const next = nextUnitFor(unit.ref.level, progress)
    return (
      <div className="j-locked">
        <span className="j-locked-icon" aria-hidden><Lock size={26} /></span>
        <h1>{unit.title}</h1>
        <p>{unit.goal}</p>
        <p className="j-locked-why">
          هذه الوحدة تُفتح حين تُنهي التي قبلها. المسار متدرّج: كل وحدة تبني على ما قبلها.
        </p>
        {next && (
          <Link
            href={`/${locale}/path/${next.ref.level}/${next.ref.lesson}/${next.ref.unit}`}
            className="j-ready"
          >
            ابدأ من: {next.title}
          </Link>
        )}
        <Link href={hrefFor(locale, 'lessons')} className="j-locked-back">العودة إلى المسار</Link>
      </div>
    )
  }

  return <SessionRunner unit={unit} locale={locale} />
}
