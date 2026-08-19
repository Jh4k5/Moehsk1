'use client'
// ─── Pieces every activity shares ───────────────────────────────────────────
// Nine of the seventeen kinds are "read a prompt, pick one of four". They share
// these so a fix to the answer button is a fix everywhere, and so the verdict
// looks identical whichever drill produced it.

import { Volume2 } from 'lucide-react'
import { speak } from '@/lib/tts'
import {
  ACTIVITY_KIND_LABEL_AR,
  ACTIVITY_KIND_LABEL_EN,
  type ActivityKind,
  type Choice,
} from '@/lib/curriculum/types'
import { ts, tsPick } from '@/lib/i18n'

/** Arabic-Indic digits — the design numbers the options ١ ٢ ٣ ٤. An English
 *  reader gets Latin ones; ٣ is not a numeral they can read at a glance. */
const AR_DIGITS = ['١', '٢', '٣', '٤', '٥', '٦']
const EN_DIGITS = ['1', '2', '3', '4', '5', '6']

export function KindPill({ kind }: { kind: ActivityKind }) {
  return (
    <div className="j-kind-pill">
      <span>{tsPick(ACTIVITY_KIND_LABEL_AR[kind], ACTIVITY_KIND_LABEL_EN[kind])}</span>
    </div>
  )
}

export function Hanzi({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <span className={`font-chinese j-hanzi j-hanzi-${size}`} lang="zh-Hans">
      {text}
    </span>
  )
}

/** Speak-aloud button. Silently inert where the browser has no voice for it. */
export function Listen({ text, label }: { text: string; label?: string }) {
  return (
    <button type="button" className="j-listen" onClick={() => speak(text)}>
      <Volume2 size={14} aria-hidden />
      <span>{label ?? ts('استمع', 'Listen')}</span>
    </button>
  )
}

export interface ChoiceListProps {
  choices: Choice[]
  /** Index the learner picked, or null before they answer. */
  picked: number | null
  /** Revealed only after an answer. */
  correct: number
  onPick: (index: number) => void
  /** Render Chinese choices in the Hanzi face. */
  chinese?: boolean
}

/**
 * The answer list.
 *
 * After an answer it marks BOTH the pick and the right answer — a learner who
 * chose wrongly needs to see what was right, not just that they were wrong.
 * The state is carried by a border and an icon as well as colour, because a
 * red/green-only verdict is invisible to a good share of readers.
 */
export function ChoiceList({ choices, picked, correct, onPick, chinese }: ChoiceListProps) {
  const answered = picked !== null
  return (
    <ul className="j-choices">
      {choices.map((choice, i) => {
        const isPick = picked === i
        const isRight = correct === i
        const state = !answered ? '' : isRight ? ' is-right' : isPick ? ' is-wrong' : ' is-dim'
        return (
          <li key={`${choice.label}-${i}`}>
            <button
              type="button"
              className={'j-choice' + state}
              disabled={answered}
              onClick={() => onPick(i)}
              aria-pressed={isPick}
            >
              <span className="j-choice-num" aria-hidden>
                {answered && isRight
                  ? '✓'
                  : answered && isPick
                    ? '✗'
                    : tsPick(AR_DIGITS[i], EN_DIGITS[i]) ?? i + 1}
              </span>
              <span className="j-choice-body">
                {chinese ? <Hanzi text={choice.label} size="md" /> : <span className="j-choice-label">{choice.label}</span>}
                {choice.sub && <span className="j-choice-sub">{choice.sub}</span>}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function Prompt({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="j-prompt">
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
  )
}

/** A Chinese sentence with its pinyin and its gloss, the shape used everywhere. */
export function SentenceBlock({
  zh,
  pinyin,
  ar,
  listen = true,
}: {
  zh: string
  pinyin?: string
  ar?: string
  listen?: boolean
}) {
  return (
    <div className="j-sentence">
      <Hanzi text={zh} size="lg" />
      {pinyin && <span className="j-sentence-pinyin" dir="ltr">{pinyin}</span>}
      {ar && <span className="j-sentence-ar">{ar}</span>}
      {listen && <Listen text={zh} />}
    </div>
  )
}
