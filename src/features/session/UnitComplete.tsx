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
import { useLocale } from '@/components/nav/use-locale'
import { makeT } from '@/lib/locale'
import { unitTitle, type Unit } from '@/lib/curriculum/types'

// `ar-EG` renders ٧, which an English reader cannot read. The formatter follows
// the route's locale, like every other number on the English side.
const NUM = { ar: new Intl.NumberFormat('ar-EG'), en: new Intl.NumberFormat('en-US') } as const

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
  const locale = useLocale()
  const t = makeT(locale)
  const AR = NUM[locale]
  const pc = locale === 'en' ? '%' : '٪'
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
          <h1>
            {passed
              ? t('أتممت الوحدة', 'Unit complete')
              : t('قريب — أعِد المحاولة', 'So close — give it another go')}
          </h1>
          <p>{unitTitle(unit, locale)}</p>
        </div>

        <div className="j-complete-stats">
          <div className="j-complete-stat">
            <span className="j-complete-num">{AR.format(unit.wordIds.length)}</span>
            <span className="j-complete-label">{t('كلمات جديدة', 'new words')}</span>
          </div>
          <div className="j-complete-stat">
            <span className="j-complete-num">{AR.format(accuracy)}{pc}</span>
            <span className="j-complete-label">{t('دقّتك', 'accuracy')}</span>
          </div>
          <div className="j-complete-stat">
            <span className="j-complete-num">{AR.format(scored)}</span>
            <span className="j-complete-label">{t('سؤالاً', 'questions')}</span>
          </div>
        </div>

        {!passed && (
          <p className="j-complete-note">
            {t(
              `تحتاج ${AR.format(needed)}٪ لفتح الوحدة التالية. ما أخطأت فيه سيعود عليك في المراجعة — أعِد الوحدة الآن أو عُد إليها لاحقاً.`,
              `You need ${AR.format(needed)}% to unlock the next unit. Whatever you missed will come back in review — retake the unit now, or return to it later.`,
            )}
          </p>
        )}
      </div>

      <div className="j-complete-actions">
        {passed ? (
          <button type="button" className="j-complete-cta" onClick={onDone}>
            {t('تابع المسار', 'Back to the path')}
          </button>
        ) : (
          <>
            <button type="button" className="j-complete-cta" onClick={onRetry}>
              {t('أعِد الوحدة', 'Retake the unit')}
            </button>
            <button type="button" className="j-complete-later" onClick={onDone}>
              {t('لاحقاً', 'Later')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
