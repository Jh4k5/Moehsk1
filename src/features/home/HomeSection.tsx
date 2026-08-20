'use client'
// ─── The home screen ────────────────────────────────────────────────────────
//
// Follows `design/Main.dc.html`. The subject of this screen is ONE thing: the
// unit to open now. Everything else — the daily goal, the review queue, the
// streak — sits below it and reports, it does not compete.
//
// The screen it replaces opened on three rows of statistics. Those told a
// learner how they were doing and never what to do, and "I don't know where to
// start" is the complaint this whole rebuild exists to answer. So the next unit
// is the first thing on the page, it is the largest thing on the page, and its
// button is the only filled button above the fold.

import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import { ChevronLeft, Flame } from 'lucide-react'
import { BridgeArch, HanziWatermark } from '@/components/nav/BridgeArt'
import { Logo } from '@/components/brand/Logo'
import { useLocale } from '@/components/nav/use-locale'
import { useLearningStore } from '@/lib/store'
import { levelProgress, nextUnitFor } from '@/lib/curriculum/progress'
import { publicLevel } from '@/data/public-index.generated'
import { useActiveLevel } from '@/lib/levels'
import { hrefFor } from '@/components/nav/nav-model'
import { isDueForReview } from '@/lib/srs'
import { makeT, type Locale } from '@/lib/locale'
import type { HskLevelNo } from '@/lib/curriculum/types'

// `ar-EG` renders Arabic-Indic digits (٧). An English reader needs Latin ones,
// so the formatter follows the route's locale like everything else here.
const NUM = { ar: new Intl.NumberFormat('ar-EG'), en: new Intl.NumberFormat('en-US') } as const
const LEVEL_LABEL: Record<Locale, Record<HskLevelNo, string>> = {
  ar: {
    1: 'HSK 1 · المستوى الأول',
    2: 'HSK 2 · المستوى الثاني',
    3: 'HSK 3 · المستوى الثالث',
  },
  en: {
    1: 'HSK 1 · Level one',
    2: 'HSK 2 · Level two',
    3: 'HSK 3 · Level three',
  },
}

/** Rough minutes for a unit: ~15s per activity, and a unit runs 34–42. */
const MINUTES_PER_UNIT = 9

function greeting(locale: Locale): string {
  const h = new Date().getHours()
  if (locale === 'en') return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'طاب يومك'
  return 'مساء الخير'
}

export default function HomeSection() {
  const locale = useLocale()
  const t = makeT(locale)
  const AR = NUM[locale]
  const store = useLearningStore()
  const level = store.currentLevel as HskLevelNo

  // No `mounted` guards in this component. `HomeBody` renders it only after the
  // persisted store has been read back AND the first client render has passed,
  // so every value below is the learner's real one. Scattering `mounted ? x : 0`
  // through here is what hid the actual mismatch: three reads slipped past the
  // guards, and the guards that were there could not fix a mismatch that
  // happened one component higher up.
  const progress = store.unitProgress
  const stats = levelProgress(level, progress)
  const next = nextUnitFor(level, progress)
  const primerDone = store.primerDone

  // Words come from the level bundle, which for a paid level is fetched from
  // `/api/content/[level]` and already filtered by entitlement. Importing the
  // content source directly — as this did — put every HSK2 and HSK3 word into
  // the public bundle.
  const active = useActiveLevel()
  const byId = useMemo(() => new Map(active.vocabulary.map((w) => [w.id, w])), [active.vocabulary])
  const pick = useCallback(
    (ids: readonly number[]) => ids.map((id) => byId.get(id)).filter((w): w is NonNullable<typeof w> => Boolean(w)),
    [byId],
  )

  const dueWords = useMemo(() => {
    const due = Object.values(store.srsCards).filter((card) => isDueForReview(card)).slice(0, 6)
    return pick(due.map((c) => c.wordId))
  }, [store.srsCards, pick])

  const nextWords = next ? pick(next.wordIds) : []
  // The rule's Arabic name. An earlier version took `title.slice(0, 1)` hoping
  // for a Chinese character; `title` is the ENGLISH name, so the card showed a
  // stray Latin letter next to «قاعدة».
  const grammarName = next?.grammarIds?.length
    // From the GATED bundle: a rule's Arabic name often glosses its Chinese
    // («因为…所以… (لأنّ… لذلك…)»), which makes it paid content, not a label.
    ? active.grammarRules.find((g) => g.id === next.grammarIds[0])?.titleAr
    : null

  const todayKey = new Date().toDateString()
  const todayWords = store.dailyActivity[todayKey]?.wordsLearned ?? 0
  const goal = store.profile?.dailyGoal ?? 10
  const goalPct = Math.min(100, Math.round((todayWords / goal) * 100))

  // The level's total word count is public — it is printed on the landing page
  // — so it comes from the index, not from holding the words themselves.
  const levelWordCount = publicLevel(level).wordCount
  const range = level === 1 ? [1, 1999] : level === 2 ? [2000, 2999] : [3000, 3999]
  const learned = store.learnedWords.filter((id) => id >= range[0] && id <= range[1]).length

  const minutes = (next ? MINUTES_PER_UNIT : 0) + Math.ceil(dueWords.length / 3)

  return (
    <div className="j-home">
      {/* ═══ Identity header ═══ */}
      <header className="j-home-head">
        <BridgeArch />
        <HanziWatermark size={140} style={{ top: '-14px', insetInlineEnd: '-24px' }} />

        <div className="j-home-brandrow">
          <span className="j-home-mark"><Logo variant="icon" size={22} /></span>
          <span className="j-home-brand">
            <span className="j-home-brand-ar">{t('جسر إلى الصين', 'Bridge to China')}</span>
            <span className="j-home-brand-level">{LEVEL_LABEL[locale][level]}</span>
          </span>
          <span className="j-home-streak">
            <Flame size={15} aria-hidden />
            <bdi>{AR.format(store.dailyStreak)}</bdi>
          </span>
        </div>

        <div className="j-home-greeting">
          <h1>
            {greeting(locale)}
            {store.profile?.name ? t(` يا ${store.profile.name}`, `, ${store.profile.name}`) : ''}
          </h1>
          <p>
            {next
              ? t(
                  `وحدة واحدة${dueWords.length > 0 ? ` و${AR.format(dueWords.length)} مراجعة` : ''} — نحو ${AR.format(minutes)} دقيقة.`,
                  `One unit${dueWords.length > 0 ? ` and ${AR.format(dueWords.length)} to review` : ''} — about ${AR.format(minutes)} minutes.`,
                )
              : t(
                  'أنهيت هذا المستوى — اختر مستوى آخر من صفحة مسارك.',
                  'You have finished this level — pick another one from your path.',
                )}
          </p>
        </div>
      </header>

      {/* ═══ The next thing — the subject of this screen ═══ */}
      {/* Before anything is finished, "what's next" is the primer, not lesson
          one. Sending someone who has never seen a character straight into 你好
          is the drop-off this whole rebuild exists to prevent. */}
      {!primerDone && stats.doneUnits === 0 ? (
        <section className="j-next-card" aria-labelledby="j-next-title">
          <span className="j-next-eyebrow">{t('ابدأ من هنا', 'Start here')}</span>
          <h2 id="j-next-title">{t('تمهيد المبتدئ', 'Beginner primer')}</h2>
          <p className="j-next-goal">
            {t(
              'ما هي الصينية ولماذا لا أبجدية لها، وكيف تُبنى الرموز من جذورها، والنبرات الأربع، وقراءة البينين. عشر دقائق قبل الدرس الأول — مجانية بالكامل.',
              'What Chinese is and why it has no alphabet, how characters are built from their radicals, the four tones, and how to read pinyin. Ten minutes before lesson one — free, all of it.',
            )}
          </p>
          <Link href={`/${locale}/primer`} className="j-next-cta">
            <span>{t('ابدأ التمهيد', 'Start the primer')}</span>
            <ChevronLeft size={17} aria-hidden />
          </Link>
        </section>
      ) : next ? (
        <section className="j-next-card" aria-labelledby="j-next-title">
          <span className="j-next-eyebrow">{t('التالي في مسارك', 'Next on your path')}</span>
          <h2 id="j-next-title">{next.title}</h2>
          {/*
            Chips, not a "·"-separated line.

            Two things went wrong with the separated line, and only one of them
            was bidi. The Arabic-Indic zero IS a dot — ٠ — so a middle dot
            sitting between two Arabic-Indic numbers reads as a digit: «الدرس ١
            · ٨ كلمات» renders as «الدرس ٨٠١ كلمات», one meaningless number
            instead of two real ones. No amount of `<bdi>` fixes that, because
            the ordering was only half the problem; the separator itself was
            unreadable. Separate boxes carry the same meaning with no glyph
            between the numbers at all.
          */}
          <ul className="j-next-facts">
            <li>{t(`الدرس ${AR.format(next.ref.lesson)}`, `Lesson ${AR.format(next.ref.lesson)}`)}</li>
            <li>{t(`${AR.format(next.wordIds.length)} كلمات`, `${AR.format(next.wordIds.length)} words`)}</li>
            {grammarName && <li className="j-next-fact-wide">{grammarName}</li>}
          </ul>

          {/* What this unit actually teaches, in the learner's own language.
              A title alone tells you the subject; the goal tells you what you
              will be able to do after nine minutes. */}
          <p className="j-next-goal">{next.goal}</p>

          <ul className="j-next-words">
            {nextWords.slice(0, 5).map((w) => (
              <li key={w.id} className="font-chinese" lang="zh-Hans">{w.zh}</li>
            ))}
            {nextWords.length > 5 && <li className="j-next-more">+{AR.format(nextWords.length - 5)}</li>}
          </ul>

          <Link
            href={`/${locale}/path/${next.ref.level}/${next.ref.lesson}/${next.ref.unit}`}
            className="j-next-cta"
          >
            <span>
              {stats.doneUnits === 0
                ? t('ابدأ الوحدة الأولى', 'Start the first unit')
                : t('تابع الوحدة', 'Continue the unit')}
            </span>
            <ChevronLeft size={17} aria-hidden />
          </Link>
        </section>
      ) : (
        <section className="j-next-card j-next-done">
          <h2>{t('أتممت المستوى', 'Level complete')}</h2>
          <Link href={hrefFor(locale, 'lessons')} className="j-next-cta">
            <span>{t('اختر مستوى آخر', 'Pick another level')}</span>
          </Link>
        </section>
      )}

      {/* ═══ Today, and the level ═══ */}
      <section className="j-home-row">
        <div className="j-goal">
          <Ring percent={goalPct} colour="var(--brand-gold)" size={46} label={AR.format(todayWords)} />
          <div className="j-goal-text">
            <span className="j-goal-title">{t('هدف اليوم', "Today's goal")}</span>
            <span className="j-goal-sub">
              <bdi>{AR.format(todayWords)}</bdi> {t('من', 'of')} <bdi>{t(`${AR.format(goal)} كلمات`, `${AR.format(goal)} words`)}</bdi>
            </span>
          </div>
        </div>
        <div className="j-level-meter">
          <span className="j-level-num" dir="ltr">{AR.format(learned)}<span>/{AR.format(levelWordCount)}</span></span>
          <span className="j-level-label">{t('كلمة محفوظة', 'words learned')}</span>
          <div className="j-level-track"><div className="j-level-fill" style={{ width: `${stats.percent}%` }} /></div>
        </div>
      </section>

      {/* ═══ Due review ═══ */}
      {dueWords.length > 0 && (
        <section className="j-due">
          <div className="j-due-head">
            <h3>
              {t('مراجعة مستحقة', 'Due for review')} <span className="j-due-count">{AR.format(dueWords.length)}</span>
            </h3>
            <Link href={hrefFor(locale, 'vocabulary')} className="j-due-all">{t('راجع الكل', 'Review all')}</Link>
          </div>
          <ul className="j-due-list">
            {dueWords.map((w) => (
              <li key={w.id} className="j-due-word">
                <span className="font-chinese j-due-zh" lang="zh-Hans">{w.zh}</span>
                <span className="j-due-pinyin" dir="ltr">{w.pinyin}</span>
                <span className="j-due-ar">{w.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ═══ Streak ═══ */}
      <section className="j-streak-card">
        <h3>
          {t(
            `سلسلتك — ${AR.format(store.dailyStreak)} ${store.dailyStreak === 1 ? 'يوم' : 'أيام'}`,
            `Your streak — ${AR.format(store.dailyStreak)} ${store.dailyStreak === 1 ? 'day' : 'days'}`,
          )}
        </h3>
        <WeekDots activity={store.dailyActivity} locale={locale} />
        <p>
          {t(
            `أنهِ وحدة اليوم قبل منتصف الليل لتصل إلى ${AR.format(store.dailyStreak + 1)}.`,
            `Finish today's unit before midnight to reach ${AR.format(store.dailyStreak + 1)}.`,
          )}
        </p>
      </section>
    </div>
  )
}

// ── Small parts ─────────────────────────────────────────────────────────────

function Ring({ percent, colour, size, label }: { percent: number; colour: string; size: number; label: string }) {
  const r = size / 2 - 4
  const circ = 2 * Math.PI * r
  return (
    <div className="j-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-default)" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - percent / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="j-ring-label">{label}</span>
    </div>
  )
}

const DAY_LETTERS: Record<Locale, string[]> = {
  ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}

/** The last seven days, filled where something was actually studied. */
function WeekDots({
  activity,
  locale,
}: {
  activity: Record<string, { wordsLearned: number; questionsAnswered: number }>
  locale: Locale
}) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const entry = activity[d.toDateString()]
    return {
      key: d.toDateString(),
      letter: DAY_LETTERS[locale][d.getDay()],
      active: Boolean(entry && (entry.questionsAnswered > 0 || entry.wordsLearned > 0)),
    }
  })
  return (
    <div className="j-week">
      {days.map((d) => (
        <div key={d.key} className="j-week-day">
          <span className={'j-week-dot' + (d.active ? ' is-on' : '')} aria-hidden />
          <span className="j-week-letter">{d.letter}</span>
        </div>
      ))}
    </div>
  )
}
