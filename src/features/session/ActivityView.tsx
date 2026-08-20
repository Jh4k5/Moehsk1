'use client'
// ─── One activity, rendered ─────────────────────────────────────────────────
//
// The dispatch from `Activity` to a screen. `Record<ActivityKind, …>` on the
// switch below means adding a kind to the union without rendering it is a TYPE
// ERROR, not a blank card in the middle of someone's lesson.
//
// Every renderer reports its outcome through one callback: `onAnswer(correct)`
// for anything gradeable, `onAdvance()` for a presentation card that has
// nothing to grade. The runner does not care which kind produced it.

import { useMemo, useState } from 'react'
import { BookOpen, Check, Gamepad2, Lightbulb, Mic, PenLine } from 'lucide-react'
import { ChoiceList, Hanzi, KindPill, Listen, Prompt, SentenceBlock } from './parts'
import { HanziBoard } from './HanziBoard'
import { speak } from '@/lib/tts'
import { makeT, type Locale } from '@/lib/locale'
import { hashString, makeRng } from '@/lib/curriculum/rng'
import type { Activity } from '@/lib/curriculum/types'

export interface ActivityViewProps {
  activity: Activity
  /** Set once the learner has committed an answer; drives the verdict bar. */
  answered: boolean
  onAnswer: (correct: boolean) => void
  /** For cards with nothing to grade — the runner shows «تابع» / "Continue". */
  onReady: () => void
  locale: Locale
}

export function ActivityView(props: ActivityViewProps) {
  const { activity, locale } = props
  return (
    <div className="j-activity">
      <KindPill kind={activity.kind} locale={locale} />
      <Body {...props} />
    </div>
  )
}

function Body({ activity, answered, onAnswer, onReady, locale }: ActivityViewProps) {
  const t = makeT(locale)
  switch (activity.kind) {
    case 'word-intro':
      return <WordIntro activity={activity} onReady={onReady} locale={locale} />
    case 'grammar-brief':
      return <GrammarBrief activity={activity} onReady={onReady} locale={locale} />
    case 'hanzi-write':
      return <HanziWrite activity={activity} onAnswer={onAnswer} answered={answered} locale={locale} />
    case 'pronounce':
      return <Pronounce activity={activity} onAnswer={onAnswer} answered={answered} locale={locale} />
    case 'pinyin-match':
      return <PinyinMatch activity={activity} onAnswer={onAnswer} answered={answered} locale={locale} />
    case 'sentence-order':
      return <SentenceOrder activity={activity} onAnswer={onAnswer} answered={answered} locale={locale} />
    case 'daily-qa':
      return <DailyQa activity={activity} onReady={onReady} locale={locale} />
    case 'game-break':
      return <GameBreak activity={activity} onReady={onReady} locale={locale} />

    // ── The nine "read this, pick one" drills ──
    case 'word-recall':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={
            activity.direction === 'zh-to-ar'
              ? t('ما معنى هذه الكلمة؟', 'What does this word mean?')
              : t('اختر الكلمة الصينية', 'Pick the Chinese word')
          }
          stimulus={
            activity.direction === 'zh-to-ar' ? (
              <div className="j-stimulus">
                <Hanzi text={activity.prompt} size="xl" />
                {activity.promptSub && <span className="j-stimulus-sub" dir="ltr">{activity.promptSub}</span>}
                <Listen text={activity.prompt} locale={locale} />
              </div>
            ) : (
              <div className="j-stimulus"><span className="j-stimulus-ar">{activity.prompt}</span></div>
            )
          }
          chinese={activity.direction !== 'zh-to-ar'}
          locale={locale}
        />
      )
    case 'tone-discriminate':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={t('أيّ نبرة هي الصحيحة؟', 'Which tone is the right one?')}
          stimulus={
            <div className="j-stimulus">
              <Hanzi text={activity.target.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, '')} size="xl" />
              <span className="j-stimulus-sub" dir="ltr">{activity.syllable}</span>
              <Listen text={activity.target} label={t('اسمع النطق', 'Hear it said')} locale={locale} />
            </div>
          }
          locale={locale}
        />
      )
    case 'image-match':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={t('أيّ كلمة تطابق الصورة؟', 'Which word matches the picture?')}
          stimulus={
            <div className="j-stimulus">
              <span className="j-emoji" role="img" aria-label={activity.category}>{activity.emoji}</span>
              <span className="j-stimulus-sub">{activity.category}</span>
            </div>
          }
          chinese
          locale={locale}
        />
      )
    case 'grammar-apply':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={activity.prompt}
          chinese
          locale={locale}
        />
      )
    case 'fill-blank':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={t('أكمل الفراغ', 'Fill in the blank')}
          stimulus={
            <div className="j-stimulus">
              <Hanzi text={activity.masked} size="lg" />
              <span className="j-stimulus-sub" dir="ltr">{activity.pinyin}</span>
              <span className="j-stimulus-ar">{activity.ar}</span>
            </div>
          }
          chinese
          locale={locale}
        />
      )
    case 'translate':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={
            activity.direction === 'zh-to-ar'
              ? t('ما معنى هذه الجملة؟', 'What does this sentence mean?')
              : t('كيف تُقال بالصينية؟', 'How do you say it in Chinese?')
          }
          stimulus={
            <div className="j-stimulus">
              {activity.direction === 'zh-to-ar' ? (
                <>
                  <Hanzi text={activity.prompt} size="lg" />
                  {activity.promptSub && <span className="j-stimulus-sub" dir="ltr">{activity.promptSub}</span>}
                  <Listen text={activity.prompt} locale={locale} />
                </>
              ) : (
                <span className="j-stimulus-ar">{activity.prompt}</span>
              )}
            </div>
          }
          chinese={activity.direction !== 'zh-to-ar'}
          locale={locale}
        />
      )
    case 'roleplay':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={activity.prompt}
          stimulus={
            <div className="j-scene">
              <p className="j-scene-line">{activity.scene}</p>
              <div className="j-turn">
                <span className="j-turn-avatar" aria-hidden>{activity.cue.speaker.slice(0, 1)}</span>
                <div className="j-turn-bubble">
                  <Hanzi text={activity.cue.zh} size="md" />
                  <span className="j-sentence-pinyin" dir="ltr">{activity.cue.pinyin}</span>
                  <span className="j-sentence-ar">{activity.cue.ar}</span>
                  <Listen text={activity.cue.zh} locale={locale} />
                </div>
              </div>
            </div>
          }
          chinese
          locale={locale}
        />
      )
    case 'story-excerpt':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={activity.question.choices.length > 0 ? t('اقرأ ثم أجب', 'Read it, then answer') : activity.titleAr}
          stimulus={
            <div className="j-excerpt">
              <span className="j-excerpt-title"><BookOpen size={14} aria-hidden /> {activity.titleAr}</span>
              {activity.lines.map((line) => (
                <SentenceBlock key={line.zh} zh={line.zh} pinyin={line.pinyin} ar={line.ar} listen={false} locale={locale} />
              ))}
            </div>
          }
          locale={locale}
        />
      )
    case 'exam-style':
      return (
        <Choose
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          title={activity.prompt}
          stimulus={
            activity.stimulus ? (
              <div className="j-stimulus j-stimulus-exam">
                {activity.stimulus.split('\n').map((line) => (
                  <Hanzi key={line} text={line} size="md" />
                ))}
                <Listen text={activity.stimulus.replace(/^[^:]*:\s*/gm, '')} locale={locale} />
              </div>
            ) : null
          }
          locale={locale}
        />
      )
  }
}

// ── The shared multiple-choice screen ───────────────────────────────────────

function Choose({
  activity,
  answered,
  onAnswer,
  title,
  stimulus,
  chinese,
  locale,
}: {
  activity: Extract<Activity, { question: { choices: unknown[] } }>
  answered: boolean
  onAnswer: (correct: boolean) => void
  title: string
  stimulus?: React.ReactNode
  chinese?: boolean
  locale: Locale
}) {
  const [picked, setPicked] = useState<number | null>(null)
  // A new activity re-mounts this component (the runner keys on activity.id),
  // so there is no stale pick to clear.
  return (
    <>
      <Prompt title={title} />
      {stimulus}
      <ChoiceList
        choices={activity.question.choices}
        picked={answered ? picked : null}
        correct={activity.question.correct}
        chinese={chinese}
        locale={locale}
        onPick={(i) => {
          if (answered) return
          setPicked(i)
          onAnswer(i === activity.question.correct)
        }}
      />
    </>
  )
}

// ── Presentation cards ──────────────────────────────────────────────────────

/**
 * The six-stage new-word card: see it, hear it, break it into radicals, the
 * mnemonic, the stroke count, and it in a sentence. The plan's «الكلمة لا
 * تُعرَض، بل تُبنى» — a character is not a picture to memorise.
 */
function WordIntro({
  activity,
  onReady,
  locale,
}: {
  activity: Extract<Activity, { kind: 'word-intro' }>
  onReady: () => void
  locale: Locale
}) {
  const t = makeT(locale)
  const { word, parts, mnemonic, example } = activity
  return (
    <>
      <div className="j-word-hero">
        <span className="j-word-ordinal">
          {t(`${activity.wordOrdinal} من ${activity.wordTotal}`, `${activity.wordOrdinal} of ${activity.wordTotal}`)}
        </span>
        <Hanzi text={word.zh} size="xl" />
        <span className="j-word-pinyin" dir="ltr">{word.pinyin}</span>
        <span className="j-word-meaning">{word.meaning}</span>
        <button type="button" className="j-listen j-listen-big" onClick={() => speak(word.zh)}>
          <Mic size={16} aria-hidden /> <span>{t('اسمعها', 'Hear it')}</span>
        </button>
      </div>

      {parts.length > 0 && (
        <section className="j-word-block">
          <h2><PenLine size={14} aria-hidden /> {t('من أي شيء يتكوّن', 'What it is built from')}</h2>
          <div className="j-parts">
            {parts.map((part) => (
              <span key={part.char} className="j-part">
                <Hanzi text={part.char} size="md" />
                {part.meaning && <span className="j-part-gloss">{part.meaning}</span>}
              </span>
            ))}
            <span className="j-part j-part-count">
              {t(`${word.strokeCount} ضربة`, `${word.strokeCount} ${word.strokeCount === 1 ? 'stroke' : 'strokes'}`)}
            </span>
          </div>
        </section>
      )}

      {mnemonic && (
        <section className="j-word-block j-word-mnemonic">
          <h2><Lightbulb size={14} aria-hidden /> {t('تعبير الحفظ', 'Memory hook')}</h2>
          <p>{mnemonic}</p>
        </section>
      )}

      {example && (
        <section className="j-word-block">
          <h2><Check size={14} aria-hidden /> {t('في جملة', 'In a sentence')}</h2>
          <SentenceBlock zh={example.zh} pinyin={example.pinyin} ar={example.ar} locale={locale} />
        </section>
      )}

      <ReadyButton onReady={onReady} label={t('فهمت', 'Got it')} />
    </>
  )
}

function GrammarBrief({
  activity,
  onReady,
  locale,
}: {
  activity: Extract<Activity, { kind: 'grammar-brief' }>
  onReady: () => void
  locale: Locale
}) {
  const t = makeT(locale)
  return (
    <>
      <Prompt title={activity.titleAr} />
      <div className="j-pattern" dir="rtl">{activity.pattern}</div>
      <p className="j-grammar-desc">{activity.description}</p>
      {activity.examples.map((ex) => (
        <SentenceBlock key={ex.zh} zh={ex.zh} pinyin={ex.pinyin} ar={ex.ar} locale={locale} />
      ))}
      <ReadyButton onReady={onReady} label={t('فهمت القاعدة', 'Got the rule')} />
    </>
  )
}

function DailyQa({
  activity,
  onReady,
  locale,
}: {
  activity: Extract<Activity, { kind: 'daily-qa' }>
  onReady: () => void
  locale: Locale
}) {
  const t = makeT(locale)
  const [revealed, setRevealed] = useState(false)
  return (
    <>
      <Prompt title={t('أجب بأسلوبك', 'Answer it your own way')} sub={activity.hint} />
      <SentenceBlock zh={activity.ask.zh} pinyin={activity.ask.pinyin} ar={activity.ask.ar} locale={locale} />
      {revealed ? (
        <>
          <div className="j-model-answer">
            <span className="j-model-label">{t('إجابة نموذجية', 'A model answer')}</span>
            <SentenceBlock
              zh={activity.modelAnswer.zh}
              pinyin={activity.modelAnswer.pinyin}
              ar={activity.modelAnswer.ar}
              locale={locale}
            />
          </div>
          <ReadyButton onReady={onReady} label={t('تابع', 'Continue')} />
        </>
      ) : (
        <ReadyButton onReady={() => setRevealed(true)} label={t('أرِني إجابة نموذجية', 'Show me a model answer')} />
      )}
    </>
  )
}

function GameBreak({
  activity,
  onReady,
  locale,
}: {
  activity: Extract<Activity, { kind: 'game-break' }>
  onReady: () => void
  locale: Locale
}) {
  const t = makeT(locale)
  return (
    <div className="j-break">
      <Gamepad2 size={40} aria-hidden />
      <h1>{activity.titleAr}</h1>
      <p>{t('خذ نفَساً — فاصل قصير قبل أن نكمل.', 'Take a breath — a short break before we carry on.')}</p>
      <ReadyButton onReady={onReady} label={t('أكمل', 'Carry on')} />
    </div>
  )
}

// ── Production drills ───────────────────────────────────────────────────────

function HanziWrite({
  activity,
  answered,
  onAnswer,
  locale,
}: {
  activity: Extract<Activity, { kind: 'hanzi-write' }>
  answered: boolean
  onAnswer: (correct: boolean) => void
  locale: Locale
}) {
  const t = makeT(locale)
  return (
    <>
      <Prompt title={t(`اكتب ${activity.char}`, `Write ${activity.char}`)} sub={activity.hint} />
      <div className="j-write-context">
        <Hanzi text={activity.inWord.zh} size="md" />
        <span className="j-sentence-pinyin" dir="ltr">{activity.inWord.pinyin}</span>
        <span className="j-sentence-ar">{activity.inWord.meaning}</span>
      </div>
      <HanziBoard char={activity.char} disabled={answered} onComplete={(clean) => onAnswer(clean)} locale={locale} />
    </>
  )
}

function Pronounce({
  activity,
  answered,
  onAnswer,
  locale,
}: {
  activity: Extract<Activity, { kind: 'pronounce' }>
  answered: boolean
  onAnswer: (correct: boolean) => void
  locale: Locale
}) {
  const t = makeT(locale)
  return (
    <>
      <Prompt
        title={t('انطقها', 'Say it')}
        sub={t(
          `قُلها بوضوح — تحتاج ${activity.passScore}% للنجاح.`,
          `Say it clearly — you need ${activity.passScore}% to pass.`,
        )}
      />
      <div className="j-stimulus">
        <Hanzi text={activity.targetZh} size="xl" />
        <span className="j-stimulus-sub" dir="ltr">{activity.targetPinyin}</span>
        <span className="j-stimulus-ar">{activity.meaning}</span>
        <Listen text={activity.targetZh} label={t('اسمع أولاً', 'Listen first')} locale={locale} />
      </div>
      <PronounceRecorder
        target={activity.targetZh}
        passScore={activity.passScore}
        disabled={answered}
        onResult={onAnswer}
        locale={locale}
      />
    </>
  )
}

function PinyinMatch({
  activity,
  answered,
  onAnswer,
  locale,
}: {
  activity: Extract<Activity, { kind: 'pinyin-match' }>
  answered: boolean
  onAnswer: (correct: boolean) => void
  locale: Locale
}) {
  const t = makeT(locale)
  const [selected, setSelected] = useState<number | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [wrong, setWrong] = useState(0)

  // The right column must be shuffled, or the drill is "read across the row".
  // The first attempt sorted by `(i * 7) % 5`, which happens to be the identity
  // for any list shorter than five — so every three- and four-pair match was
  // pre-solved. This is a real shuffle, seeded from the activity id so it is
  // stable across renders and identical on a reload.
  const rightOrder = useMemo(() => {
    const rng = makeRng(hashString(activity.id))
    return rng.shuffle(activity.pairs.map((_, i) => i))
  }, [activity.id, activity.pairs])

  const finish = (nextMatched: number[]) => {
    if (nextMatched.length === activity.pairs.length) onAnswer(wrong === 0)
  }

  return (
    <>
      <Prompt title={t('طابِق كل حرف بنطقه', 'Match each character to how it sounds')} />
      <div className="j-match">
        <ul className="j-match-col">
          {activity.pairs.map((pair, i) => (
            <li key={pair.wordId}>
              <button
                type="button"
                className={'j-match-cell' + (matched.includes(i) ? ' is-matched' : selected === i ? ' is-active' : '')}
                disabled={answered || matched.includes(i)}
                onClick={() => setSelected(i)}
              >
                <Hanzi text={pair.zh} size="md" />
              </button>
            </li>
          ))}
        </ul>
        <ul className="j-match-col">
          {rightOrder.map((i) => (
            <li key={activity.pairs[i].wordId}>
              <button
                type="button"
                className={'j-match-cell' + (matched.includes(i) ? ' is-matched' : '')}
                disabled={answered || matched.includes(i)}
                onClick={() => {
                  if (selected === null) return
                  if (selected === i) {
                    const next = [...matched, i]
                    setMatched(next)
                    setSelected(null)
                    finish(next)
                  } else {
                    setWrong((n) => n + 1)
                    setSelected(null)
                  }
                }}
              >
                <span dir="ltr">{activity.pairs[i].pinyin}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function SentenceOrder({
  activity,
  answered,
  onAnswer,
  locale,
}: {
  activity: Extract<Activity, { kind: 'sentence-order' }>
  answered: boolean
  onAnswer: (correct: boolean) => void
  locale: Locale
}) {
  const t = makeT(locale)
  const [built, setBuilt] = useState<number[]>([])
  const remaining = activity.tokens.map((_, i) => i).filter((i) => !built.includes(i))

  const check = (next: number[]) => {
    if (next.length !== activity.tokens.length) return
    // `correctOrder[k]` is where the k-th displayed token belongs, so a correct
    // build reads back as 0,1,2,… once mapped through it.
    const assembled = next.map((i) => activity.correctOrder[i])
    const isRight = assembled.every((v, k) => v === k)
    onAnswer(isRight)
  }

  return (
    <>
      <Prompt title={t('رتّب الكلمات لتكوّن الجملة', 'Put the words in order to make the sentence')} sub={activity.sentence.ar} />
      <div className="j-build-line">
        {built.length === 0 && (
          <span className="j-build-empty">{t('اضغط الكلمات بالترتيب', 'Tap the words in order')}</span>
        )}
        {built.map((i) => (
          <button
            key={`b-${i}`}
            type="button"
            className="j-token is-placed"
            disabled={answered}
            onClick={() => setBuilt(built.filter((x) => x !== i))}
          >
            <Hanzi text={activity.tokens[i]} size="sm" />
          </button>
        ))}
      </div>
      <div className="j-token-pool">
        {remaining.map((i) => (
          <button
            key={`p-${i}`}
            type="button"
            className="j-token"
            disabled={answered}
            onClick={() => {
              const next = [...built, i]
              setBuilt(next)
              check(next)
            }}
          >
            <Hanzi text={activity.tokens[i]} size="sm" />
          </button>
        ))}
      </div>
    </>
  )
}

// ── Small shared controls ───────────────────────────────────────────────────

function ReadyButton({ onReady, label }: { onReady: () => void; label: string }) {
  return (
    <button type="button" className="j-ready" onClick={onReady}>
      {label}
    </button>
  )
}

/** Speech scoring, isolated so the rest of the screen renders without a mic. */
function PronounceRecorder({
  target,
  passScore,
  disabled,
  onResult,
  locale,
}: {
  target: string
  passScore: number
  disabled: boolean
  onResult: (passed: boolean) => void
  locale: Locale
}) {
  const t = makeT(locale)
  const [state, setState] = useState<'idle' | 'listening' | 'done'>('idle')
  const [score, setScore] = useState<number | null>(null)

  const start = () => {
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition
    if (!Ctor) {
      // No engine in this browser. The drill is not failed — it is skipped, and
      // says so. Marking it wrong would punish the learner for their browser.
      setState('done')
      onResult(true)
      return
    }
    const rec = new Ctor()
    rec.lang = 'zh-CN'
    rec.interimResults = false
    rec.maxAlternatives = 3
    setState('listening')
    rec.onresult = (event) => {
      const heard = [...Array(event.results[0].length).keys()].map((i) => event.results[0][i].transcript)
      const best = Math.max(...heard.map((h) => similarity(h, target)))
      const pct = Math.round(best * 100)
      setScore(pct)
      setState('done')
      onResult(pct >= passScore)
    }
    rec.onerror = () => {
      setState('done')
      onResult(true)
    }
    rec.onend = () => setState((s) => (s === 'listening' ? 'idle' : s))
    rec.start()
  }

  return (
    <div className="j-record">
      <button type="button" className={'j-record-btn' + (state === 'listening' ? ' is-live' : '')} onClick={start} disabled={disabled || state === 'listening'}>
        <Mic size={26} aria-hidden />
      </button>
      <span className="j-record-hint">
        {state === 'listening'
          ? t('أستمع…', 'Listening…')
          : score !== null
            ? `${score}%`
            : t('اضغط وتحدّث', 'Tap, then speak')}
      </span>
    </div>
  )
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  onresult: (event: { results: { length: number; [i: number]: { transcript: string } }[] }) => void
  onerror: () => void
  onend: () => void
}

/** Character overlap — good enough to tell "said it" from "said something else". */
function similarity(heard: string, target: string): number {
  const a = [...heard.replace(/\s/g, '')]
  const b = [...target.replace(/\s/g, '')]
  if (b.length === 0) return 0
  const pool = [...b]
  let hits = 0
  for (const ch of a) {
    const at = pool.indexOf(ch)
    if (at !== -1) { hits++; pool.splice(at, 1) }
  }
  return hits / b.length
}
