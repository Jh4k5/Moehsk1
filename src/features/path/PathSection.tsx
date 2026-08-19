'use client'
// ─── The path ───────────────────────────────────────────────────────────────
//
// Follows `design/Path.dc.html`: a vertical spine of lessons, the current one
// expanded into its units, everything after it shut.
//
// The one question this screen must answer in a second is «ما التالي؟». The old
// lesson list answered a different question — "here are fifteen lessons, all
// equally available, good luck" — which is the complaint that started this
// rebuild. Here exactly one unit has the gold ring, and it is the next one.

import Link from 'next/link'
import { useMemo } from 'react'
import { BookOpen, Check, Lock, Play } from 'lucide-react'
import { HanziWatermark } from '@/components/nav/BridgeArt'
import { useMounted } from '@/hooks/use-mounted'
import { useLearningStore } from '@/lib/store'
import { UNITS_BY_LEVEL } from '@/lib/curriculum'
import { isUnitUnlocked, levelProgress, nextUnitFor } from '@/lib/curriculum/progress'
import { publicLevel } from '@/data/public-index.generated'
import { useLocale } from '@/components/nav/use-locale'
import { makeT, type Locale } from '@/lib/locale'
import type { HskLevelNo, Unit } from '@/lib/curriculum/types'

// `ar-EG` gives Arabic-Indic digits — ٧, not 7. The formatter follows the
// route's locale so an English reader gets numerals they can read.
const NUM = { ar: new Intl.NumberFormat('ar-EG'), en: new Intl.NumberFormat('en-US') } as const
const LEVELS: HskLevelNo[] = [1, 2, 3]

export default function PathSection() {
  const locale = useLocale()
  const t = makeT(locale)
  const AR = NUM[locale]
  const mounted = useMounted()
  const level = useLearningStore((s) => s.currentLevel) as HskLevelNo
  const setLevel = useLearningStore((s) => s.setLevel)
  const progress = useLearningStore((s) => s.unitProgress)
  const primerDone = useLearningStore((s) => s.primerDone)

  const lessons = useMemo(() => groupByLesson(level), [level])
  const stats = levelProgress(level, mounted ? progress : {})
  const next = nextUnitFor(level, mounted ? progress : {})

  return (
    <div className="j-path">
      <header className="j-path-head">
        <HanziWatermark char="路" size={92} style={{ top: '-8px', insetInlineEnd: '-6px' }} />
        <div className="j-path-title">
          <h1>{t('مساري', 'My path')}</h1>
          <div className="j-level-switch" role="tablist" aria-label={t('المستوى', 'Level')}>
            {LEVELS.map((lv) => (
              <button
                key={lv}
                role="tab"
                aria-selected={lv === level}
                className={'j-level-tab' + (lv === level ? ' is-active' : '')}
                onClick={() => setLevel(lv)}
              >
                {lv === level ? `HSK ${lv}` : AR.format(lv)}
              </button>
            ))}
          </div>
        </div>
        <div className="j-path-meter">
          <div className="j-path-meter-row">
            <span>
              {t(
                `${AR.format(stats.doneUnits)} من ${AR.format(stats.totalUnits)} وحدة`,
                `${AR.format(stats.doneUnits)} of ${AR.format(stats.totalUnits)} units`,
              )}
            </span>
            <span>{AR.format(stats.percent)}{locale === 'en' ? '%' : '٪'}</span>
          </div>
          <div className="j-path-track"><div className="j-path-fill" style={{ width: `${stats.percent}%` }} /></div>
        </div>
      </header>

      {/* The primer sits at the head of the path, not beside it. Someone who
          has never seen a character needs it before lesson one, and burying it
          in the library is how it goes unread. It stays visible after it is
          done — as a finished step, revisitable — because tones are the thing
          learners come back to. */}
      <Link href={`/${locale}/primer`} className={'j-primer-entry' + (primerDone ? ' is-done' : '')}>
        <span className="j-primer-entry-mark" aria-hidden>
          {primerDone ? <Check size={17} /> : <BookOpen size={17} />}
        </span>
        <span className="j-primer-entry-body">
          <span className="j-primer-entry-title">{t('تمهيد المبتدئ', 'Beginner primer')}</span>
          <span className="j-primer-entry-sub">
            {primerDone
              ? t('أتممته — عُد إليه متى شئت.', 'Finished — come back to it whenever you like.')
              : t(
                  'ابدأ من هنا: ما هي الصينية، الجذور، النبرات الأربع، والبينين. مجاني بالكامل.',
                  'Start here: what Chinese is, radicals, the four tones, and pinyin. Free, all of it.',
                )}
          </span>
        </span>
      </Link>

      <ol className="j-spine">
        {lessons.map(({ lesson, title, titleZh, units }) => {
          const done = units.filter((u) => Boolean(progress[u.key])).length
          const complete = mounted && done === units.length
          const isCurrent = mounted && next != null && units.some((u) => u.key === next.key)
          return (
            <li key={lesson} className={'j-spine-node' + (complete ? ' is-done' : isCurrent ? ' is-current' : '')}>
              <div className="j-spine-rail" aria-hidden>
                <span className="j-spine-dot">
                  {complete ? <Check size={17} /> : isCurrent ? AR.format(lesson) : <Lock size={14} />}
                </span>
                <span className="j-spine-line" />
              </div>

              <div className="j-spine-card">
                <div className="j-spine-header">
                  <div className="j-spine-name">
                    {/* The lesson number is a badge, not "١ · العنوان". A dot
                        directly after an Arabic-Indic digit reads as the zero
                        — ٠ is a dot — so «١ · التحيّة» can be read as «١٠». */}
                    <span className="j-spine-label">
                      <span className="j-spine-no">{AR.format(lesson)}</span>
                      {title}
                    </span>
                    <span className="font-chinese j-spine-zh" lang="zh-Hans">{titleZh}</span>
                  </div>
                  <span className="j-spine-count">{AR.format(done)}/{AR.format(units.length)}</span>
                </div>

                {/* Only the lesson in play opens. Everything else is a closed
                    line on the spine — the point of a path is that most of it
                    is not a decision you have to make today. */}
                {isCurrent && (
                  <ul className="j-unit-list">
                    {units.map((unit) => {
                      const unitDone = Boolean(progress[unit.key])
                      const open = isUnitUnlocked(unit.ref, progress)
                      const isNext = next?.key === unit.key
                      const href = `/${locale}/path/${unit.ref.level}/${unit.ref.lesson}/${unit.ref.unit}`
                      const body = (
                        <>
                          <span className="j-unit-mark" aria-hidden>
                            {unitDone ? <Check size={15} /> : open ? <Play size={14} /> : <Lock size={13} />}
                          </span>
                          <span className="j-unit-body">
                            <span className="j-unit-title">{unit.title}</span>
                            <span className="j-unit-goal">{unit.goal}</span>
                          </span>
                          <span className="j-unit-words">{AR.format(unit.wordIds.length)}</span>
                        </>
                      )
                      return (
                        <li key={unit.key}>
                          {open ? (
                            <Link
                              href={href}
                              className={'j-unit' + (unitDone ? ' is-done' : '') + (isNext ? ' is-next' : '')}
                            >
                              {body}
                            </Link>
                          ) : (
                            <span className="j-unit is-locked" aria-disabled="true">{body}</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

interface LessonNode {
  lesson: number
  title: string
  titleZh: string
  units: Unit[]
}

function groupByLesson(level: HskLevelNo): LessonNode[] {
  // The fallback title is the bare number: the lesson number is already
  // rendered as its own badge beside it, and «الدرس ٣» in an English column
  // would be the only Arabic on the row.
  // The PUBLIC index: titles and counts, no vocabulary. Importing the content
  // source here is what put every HSK2 and HSK3 word into the shared bundle.
  const content = publicLevel(level)
  const order = UNITS_BY_LEVEL[level] ?? []
  const seen: number[] = []
  for (const u of order) if (!seen.includes(u.ref.lesson)) seen.push(u.ref.lesson)
  return seen.map((lesson) => {
    const meta = content.lessons.find((l) => l.id === lesson)
    return {
      lesson,
      title: meta?.title ?? `${lesson}`,
      titleZh: meta?.titleZh ?? '',
      units: order.filter((u) => u.ref.lesson === lesson),
    }
  })
}
