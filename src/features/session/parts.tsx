'use client'
// ─── Pieces every activity shares ───────────────────────────────────────────
// Nine of the seventeen kinds are "read a prompt, pick one of four". They share
// these so a fix to the answer button is a fix everywhere, and so the verdict
// looks identical whichever drill produced it.

import { Volume2 } from 'lucide-react'
import { speak } from '@/lib/tts'
import { activityKindLabel, type ActivityKind, type Choice } from '@/lib/curriculum/types'
import type { Locale } from '@/lib/locale'

// These take `locale` as a prop rather than reading the `ts()` store helper:
// this whole tree renders once per activity with nothing that forces a second
// render on mount (no fetch, no timer), so a value read from the store at
// first paint — before `LocaleSync`'s effect has run — would stick at the
// server's default ('ar') for the activity's entire lifetime. `locale` comes
// down from the route via `SessionRunner`, so it is right from the first frame.

/** Arabic-Indic digits — the design numbers the options ١ ٢ ٣ ٤. An English
 *  reader gets Latin ones; ٣ is not a numeral they can read at a glance. */
const AR_DIGITS = ['١', '٢', '٣', '٤', '٥', '٦']
const EN_DIGITS = ['1', '2', '3', '4', '5', '6']

export function KindPill({ kind, locale }: { kind: ActivityKind; locale: Locale }) {
  return (
    <div className="j-kind-pill">
      <span>{activityKindLabel(kind, locale)}</span>
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
export function Listen({ text, label, locale }: { text: string; label?: string; locale: Locale }) {
  return (
    <button type="button" className="j-listen" onClick={() => speak(text)}>
      <Volume2 size={14} aria-hidden />
      <span>{label ?? (locale === 'en' ? 'Listen' : 'استمع')}</span>
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
  locale: Locale
}

/**
 * The answer list.
 *
 * After an answer it marks BOTH the pick and the right answer — a learner who
 * chose wrongly needs to see what was right, not just that they were wrong.
 * The state is carried by a border and an icon as well as colour, because a
 * red/green-only verdict is invisible to a good share of readers.
 */
export function ChoiceList({ choices, picked, correct, onPick, chinese, locale }: ChoiceListProps) {
  const answered = picked !== null
  const digits = locale === 'en' ? EN_DIGITS : AR_DIGITS
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
                {answered && isRight ? '✓' : answered && isPick ? '✗' : digits[i] ?? i + 1}
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
/**
 * A Chinese sentence with its reading and its gloss.
 *
 * [4.1] The gloss is CHOSEN HERE, not by the caller. Every call site used to
 * pass `ar={...}` unconditionally, so the English route rendered Arabic under
 * every sentence on the platform — the data carried an English field and no
 * screen ever read it. Making the component pick means a new call site cannot
 * reintroduce that by forgetting.
 *
 * When `en` is missing on the English route the Arabic is NOT substituted: the
 * line is dropped. A missing translation should look missing, so it gets
 * authored; silently showing Arabic to an English reader is what let 1,890
 * untranslated sentences sit unnoticed.
 */
export function SentenceBlock({
  zh,
  pinyin,
  ar,
  en,
  listen = true,
  locale,
}: {
  zh: string
  pinyin?: string
  ar?: string
  en?: string
  listen?: boolean
  locale: Locale
}) {
  const gloss = locale === 'en' ? en : ar
  return (
    <div className="j-sentence">
      <Hanzi text={zh} size="lg" />
      {pinyin && <span className="j-sentence-pinyin" dir="ltr">{pinyin}</span>}
      {gloss && <span className="j-sentence-ar">{gloss}</span>}
      {listen && <Listen text={zh} locale={locale} />}
    </div>
  )
}
