'use client'
// ─── The end of a unit ──────────────────────────────────────────────────────
// Follows `design/Complete.dc.html`: navy ground, gold medal ring, the session's
// real numbers, and one obvious way onward.
//
// A unit below the pass bar does NOT get recorded as done. It offers a retry
// instead — quietly recording a failed unit as complete would unlock the next
// one and let a learner walk the whole path having learned nothing.

import { Check, RotateCcw } from 'lucide-react'
import { BridgeArch, HanziWatermark } from '@/components/nav/BridgeArt'
import { UNIT_PASS_RATIO } from '@/lib/curriculum/progress'
import type { Unit } from '@/lib/curriculum/types'

const AR = new Intl.NumberFormat('ar-EG')

export function UnitComplete({
  unit,
  correct,
  scored,
  passed,
  onDone,
  onRetry,
}: {
  unit: Unit
  correct: number
  scored: number
  passed: boolean
  onDone: () => void
  onRetry: () => void
}) {
  const accuracy = scored === 0 ? 100 : Math.round((correct / scored) * 100)
  const needed = Math.round(UNIT_PASS_RATIO * 100)

  return (
    <div className="j-complete">
      <BridgeArch className="j-complete-arch" />
      <HanziWatermark char={passed ? '好' : '再'} size={150} style={{ top: '24px', insetInlineEnd: '-18px' }} />

      <div className="j-complete-body">
        <div className={'j-medal' + (passed ? '' : ' is-short')}>
          {passed ? <Check size={40} aria-hidden /> : <RotateCcw size={36} aria-hidden />}
        </div>

        <div className="j-complete-head">
          <h1>{passed ? 'أتممت الوحدة' : 'قريب — أعِد المحاولة'}</h1>
          <p>{unit.title}</p>
        </div>

        <div className="j-complete-stats">
          <div className="j-complete-stat">
            <span className="j-complete-num">{AR.format(unit.wordIds.length)}</span>
            <span className="j-complete-label">كلمات جديدة</span>
          </div>
          <div className="j-complete-stat">
            <span className="j-complete-num">{AR.format(accuracy)}٪</span>
            <span className="j-complete-label">دقّتك</span>
          </div>
          <div className="j-complete-stat">
            <span className="j-complete-num">{AR.format(scored)}</span>
            <span className="j-complete-label">سؤالاً</span>
          </div>
        </div>

        {!passed && (
          <p className="j-complete-note">
            تحتاج {AR.format(needed)}٪ لفتح الوحدة التالية. ما أخطأت فيه سيعود عليك في المراجعة — أعِد الوحدة الآن أو عُد إليها لاحقاً.
          </p>
        )}
      </div>

      <div className="j-complete-actions">
        {passed ? (
          <button type="button" className="j-complete-cta" onClick={onDone}>تابع المسار</button>
        ) : (
          <>
            <button type="button" className="j-complete-cta" onClick={onRetry}>أعِد الوحدة</button>
            <button type="button" className="j-complete-later" onClick={onDone}>لاحقاً</button>
          </>
        )}
      </div>
    </div>
  )
}
