'use client'
// ─── The primer, walked ─────────────────────────────────────────────────────
//
// Four chapters, each a few cards and a couple of checks. Deliberately NOT the
// activity engine: that engine is built around vocabulary a learner is
// acquiring, and the primer teaches things that are not words — what a tone is,
// why a character has parts. Forcing it through the same machinery would have
// meant inventing fake "words" to hang the explanations on.
//
// It is also the one place in the platform where being told something is the
// point. Everything else asks the learner to do; here they need the ground
// rules first, and four screens of reading is the whole cost.

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Volume2, X } from 'lucide-react'
import { PRIMER, type PrimerChapter } from '@/data/primer'
import { useLearningStore } from '@/lib/store'
import { useLocale } from '@/components/nav/use-locale'
import { hrefFor } from '@/components/nav/nav-model'
import { speak } from '@/lib/tts'

const AR = new Intl.NumberFormat('ar-EG')

type Step = { chapter: number; index: number; kind: 'card' | 'check' }

/** The flat walk order: a chapter's cards, then its checks, then the next. */
function buildSteps(): Step[] {
  const steps: Step[] = []
  PRIMER.forEach((chapter, c) => {
    chapter.cards.forEach((_, i) => steps.push({ chapter: c, index: i, kind: 'card' }))
    chapter.checks.forEach((_, i) => steps.push({ chapter: c, index: i, kind: 'check' }))
  })
  return steps
}

const STEPS = buildSteps()

export default function PrimerSection() {
  const locale = useLocale()
  const completePrimer = useLearningStore((s) => s.completePrimer)
  const [at, setAt] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const step = STEPS[at]
  const chapter: PrimerChapter = PRIMER[step.chapter]
  const progress = Math.round((at / STEPS.length) * 100)

  const advance = () => {
    setPicked(null)
    if (at + 1 >= STEPS.length) {
      completePrimer()
      setDone(true)
      return
    }
    setAt(at + 1)
  }

  if (done) {
    return (
      <div className="j-primer-done">
        <span className="j-medal"><Check size={40} aria-hidden /></span>
        <h1>أنت جاهز للدرس الأول</h1>
        <p>
          تعرف الآن لماذا لا توجد أبجدية صينية، وكيف تُبنى الرموز من جذورها، وما تفعله النبرات
          الأربع، وكيف يُقرأ البينين. الباقي تمرين.
        </p>
        <Link href={hrefFor(locale, 'lessons')} className="j-next-cta">ابدأ الدرس الأول</Link>
      </div>
    )
  }

  return (
    <div className="j-primer">
      <header className="j-session-bar">
        <Link href={hrefFor(locale, 'lessons')} className="j-session-close" aria-label="أغلق التمهيد">
          <X size={20} aria-hidden />
        </Link>
        <div className="j-session-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="j-session-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="j-primer-count">{AR.format(step.chapter + 1)}/{AR.format(PRIMER.length)}</span>
      </header>

      <div className="j-primer-body">
        <div className="j-kind-pill"><span>{chapter.title}</span></div>

        {step.kind === 'card' ? (
          <Card card={chapter.cards[step.index]} onNext={advance} />
        ) : (
          <CheckCard
            check={chapter.checks[step.index]}
            picked={picked}
            onPick={setPicked}
            onNext={advance}
          />
        )}
      </div>
    </div>
  )
}

function Card({ card, onNext }: { card: PrimerChapter['cards'][number]; onNext: () => void }) {
  return (
    <>
      <h1 className="j-primer-title">{card.title}</h1>
      {card.hanzi && (
        <div className="j-primer-hero">
          <span className="font-chinese j-primer-hanzi" lang="zh-Hans">{card.hanzi}</span>
          {card.pinyin && <span className="j-primer-pinyin" dir="ltr">{card.pinyin}</span>}
          {card.gloss && <span className="j-primer-gloss">{card.gloss}</span>}
          <button type="button" className="j-listen" onClick={() => speak(card.hanzi!)}>
            <Volume2 size={14} aria-hidden /> <span>استمع</span>
          </button>
        </div>
      )}
      <p className="j-primer-text">{card.body}</p>
      <button type="button" className="j-ready" onClick={onNext}>
        متابعة <ArrowLeft size={16} aria-hidden />
      </button>
    </>
  )
}

function CheckCard({
  check,
  picked,
  onPick,
  onNext,
}: {
  check: PrimerChapter['checks'][number]
  picked: number | null
  onPick: (i: number) => void
  onNext: () => void
}) {
  const answered = picked !== null
  const right = picked === check.correct
  return (
    <>
      <h1 className="j-primer-title">{check.question}</h1>
      <ul className="j-choices">
        {check.options.map((option, i) => {
          const state = !answered ? '' : i === check.correct ? ' is-right' : i === picked ? ' is-wrong' : ' is-dim'
          return (
            <li key={option}>
              <button type="button" className={'j-choice' + state} disabled={answered} onClick={() => onPick(i)}>
                <span className="j-choice-num" aria-hidden>
                  {answered && i === check.correct ? '✓' : answered && i === picked ? '✗' : i + 1}
                </span>
                <span className="j-choice-body"><span className="j-choice-label">{option}</span></span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* The explanation shows whether they were right or wrong. Getting it
          right and being told why is how the rule sticks; only explaining
          mistakes teaches that a correct guess needs no understanding. */}
      {answered && (
        <div className={'j-verdict' + (right ? ' is-right' : ' is-wrong')}>
          <div className="j-verdict-head">
            <span className="j-verdict-icon" aria-hidden>{right ? <Check size={15} /> : <X size={15} />}</span>
            <div>
              <span className="j-verdict-title">{right ? 'صحيح' : 'ليست الإجابة الصحيحة'}</span>
              <p className="j-verdict-why">{check.because}</p>
            </div>
          </div>
          <div className="j-verdict-actions">
            <button type="button" className="j-verdict-next" onClick={onNext}>تابع</button>
          </div>
        </div>
      )}
    </>
  )
}
