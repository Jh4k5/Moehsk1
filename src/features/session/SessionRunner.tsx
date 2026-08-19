'use client'
// ─── Running one unit ───────────────────────────────────────────────────────
//
// The screen a learner spends their five minutes in. It owns four things and
// nothing else: which activity is showing, whether it has been answered, the
// running tally, and what happens at the end.
//
// The stream is built ONCE, from the learner's state as it was when the unit
// opened. Rebuilding it on every answer would reshuffle the drills underneath
// someone mid-unit, because SRS state changes with every grade.

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Flame, HelpCircle, X } from 'lucide-react'
import { ActivityView } from './ActivityView'
import { UnitComplete } from './UnitComplete'
import { buildActivityStream } from '@/lib/curriculum/activity-engine'
import { unitPassed } from '@/lib/curriculum/progress'
import { useLearningStore } from '@/lib/store'
import { hrefFor } from '@/components/nav/nav-model'
import type { Locale } from '@/lib/locale'
import type { Activity, Unit } from '@/lib/curriculum/types'

/** Activities that grade nothing — a card the learner reads and moves past. */
const PRESENTATION = new Set(['word-intro', 'grammar-brief', 'daily-qa', 'game-break'])

export function SessionRunner({ unit, locale }: { unit: Unit; locale: Locale }) {
  const router = useRouter()
  const rateWord = useLearningStore((s) => s.rateWord)
  const completeUnit = useLearningStore((s) => s.completeUnit)
  const toggleLearned = useLearningStore((s) => s.toggleLearned)
  const dailyStreak = useLearningStore((s) => s.dailyStreak)

  // Built once, deliberately. `srsCards` is read at mount, not subscribed to.
  const stream = useMemo<Activity[]>(() => {
    const state = useLearningStore.getState()
    return buildActivityStream(unit, {
      srsCards: state.srsCards as never,
      completedUnits: Object.keys(state.unitProgress) as never,
      missedWordIds: state.getWeakWordIds?.(5) ?? [],
      seed: unit.ref.lesson * 100 + unit.ref.unit,
    })
  }, [unit])

  const [at, setAt] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [correct, setCorrect] = useState(0)
  const [scored, setScored] = useState(0)
  const [finished, setFinished] = useState(false)

  const activity = stream[at]
  const progress = stream.length === 0 ? 0 : Math.round((at / stream.length) * 100)

  const advance = useCallback(() => {
    setAnswered(false)
    setLastCorrect(null)
    if (at + 1 >= stream.length) {
      setFinished(true)
      return
    }
    setAt(at + 1)
  }, [at, stream.length])

  const handleAnswer = useCallback(
    (wasCorrect: boolean) => {
      setAnswered(true)
      setLastCorrect(wasCorrect)
      setScored((n) => n + 1)
      if (wasCorrect) setCorrect((n) => n + 1)

      // Grade the words this drill exercised. SM-2 qualities: 4 for a clean
      // recall, 2 for a miss — a miss is "wrong but familiar", not "never seen",
      // which is what schedules it to come back soon instead of tomorrow.
      for (const id of activity?.wordIds ?? []) rateWord(id, wasCorrect ? 4 : 2)
    },
    [activity, rateWord],
  )

  const finish = useCallback(() => {
    // Only a PASSED unit marks its words learned and records completion. The
    // "later" button on a failed unit lands here too, and recording that would
    // unlock the next unit — letting someone walk the entire path having
    // answered a third of it correctly. `completeUnit` refuses a failing score
    // as well, so the rule holds even if this branch is ever missed.
    if (unitPassed(correct, scored)) {
      const learned = useLearningStore.getState().learnedWords
      for (const id of unit.wordIds) if (!learned.includes(id)) toggleLearned(id)
      completeUnit(unit.key, correct, scored)
    }
    router.push(hrefFor(locale, 'lessons'))
  }, [unit, correct, scored, completeUnit, toggleLearned, router, locale])

  if (stream.length === 0) {
    return (
      <div className="j-session j-session-empty">
        <p>لا يوجد محتوى لهذه الوحدة بعد.</p>
        <Link href={hrefFor(locale, 'lessons')} className="j-ready">العودة إلى المسار</Link>
      </div>
    )
  }

  if (finished) {
    return (
      <UnitComplete
        unit={unit}
        correct={correct}
        scored={scored}
        passed={unitPassed(correct, scored)}
        onDone={finish}
        onRetry={() => {
          setAt(0); setCorrect(0); setScored(0)
          setAnswered(false); setLastCorrect(null); setFinished(false)
        }}
      />
    )
  }

  const isPresentation = PRESENTATION.has(activity.kind)

  return (
    <div className="j-session">
      <header className="j-session-bar">
        <Link href={hrefFor(locale, 'lessons')} className="j-session-close" aria-label="أغلق الوحدة">
          <X size={20} aria-hidden />
        </Link>
        <div className="j-session-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="j-session-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="j-session-streak">
          <Flame size={15} aria-hidden />
          {dailyStreak}
        </span>
      </header>

      {/* Keyed on the activity id so every drill mounts fresh: no answer from
          the previous card can survive into the next one. */}
      <div className="j-session-body">
        <ActivityView
          key={activity.id}
          activity={activity}
          answered={answered}
          onAnswer={handleAnswer}
          onReady={advance}
        />
      </div>

      {answered && !isPresentation && (
        <div className={'j-verdict' + (lastCorrect ? ' is-right' : ' is-wrong')}>
          <div className="j-verdict-head">
            <span className="j-verdict-icon" aria-hidden>{lastCorrect ? <Check size={15} /> : <X size={15} />}</span>
            <div>
              <span className="j-verdict-title">{lastCorrect ? 'إجابة صحيحة' : 'ليست الإجابة الصحيحة'}</span>
              {'question' in activity && activity.question && 'explanation' in activity.question && (
                <p className="j-verdict-why">{activity.question.explanation}</p>
              )}
            </div>
          </div>
          <div className="j-verdict-actions">
            <button type="button" className="j-verdict-help" aria-label="اشرح لي أكثر">
              <HelpCircle size={20} aria-hidden />
            </button>
            <button type="button" className="j-verdict-next" onClick={advance}>تابع</button>
          </div>
        </div>
      )}
    </div>
  )
}
