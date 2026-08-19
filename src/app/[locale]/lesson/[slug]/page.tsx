import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BridgeArch, HanziWatermark } from '@/components/nav/BridgeArt'
import { LessonStructuredData } from '@/features/marketing/structured-data'
import { LEVEL_CONTENT, levelSummary, type HskLevel } from '@/features/marketing/level-summary'
import { LOCALES, isLocale, makeT, type Locale } from '@/lib/locale'
import { unitsOfLesson } from '@/lib/curriculum'
import type { Lesson } from '@/data/lessons'
import type { VocabWord } from '@/data/vocabulary'

// ─── One page per lesson: the deepest crawlable layer ───────────────────────
//
// The landing page links all fifteen HSK1 lessons and each level page links its
// own; without this route every one of those was a 404 — broken links on the
// only pages that carry indexing weight.
//
// These pages are SERVER-rendered and they name real content: the lesson's
// Chinese title, its topic, its words with pinyin and Arabic, and its key
// sentences. That is what someone searching «تعلم الصينية التحيات» is actually
// looking for, and it is the reason a landing page alone never ranks.
//
// The free/paid line is drawn here in what is SENT, not in what is hidden with
// CSS: a paid lesson's page renders its title, topic and word COUNT, and stops.
// The words themselves are never serialised into the HTML, so "view source"
// is not a way around the subscription.

const FREE_LESSON_COUNT = 2
const FREE_LEVEL: HskLevel = 1

interface Parsed {
  level: HskLevel
  lesson: Lesson
  index: number
}

/** `hsk2-7` → level 2, lesson id 7. Anything else is a 404, not a guess. */
function parseSlug(slug: string): Parsed | null {
  const match = /^hsk([123])-(\d+)$/.exec(slug)
  if (!match) return null
  const level = Number(match[1]) as HskLevel
  const id = Number(match[2])
  const list = LEVEL_CONTENT[level].lessons
  const index = list.findIndex((l) => l.id === id)
  if (index === -1) return null
  return { level, lesson: list[index], index }
}

function isFree(level: HskLevel, index: number): boolean {
  return level === FREE_LEVEL && index < FREE_LESSON_COUNT
}

export const dynamicParams = false

export function generateStaticParams() {
  const slugs = ([1, 2, 3] as const).flatMap((level) =>
    LEVEL_CONTENT[level].lessons.map((lesson) => `hsk${level}-${lesson.id}`),
  )
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const t = makeT(locale)
  const parsed = parseSlug(slug)
  if (!parsed) return {}
  const { level, lesson, index } = parsed
  const summary = levelSummary(level)

  return {
    title: t(
      `${lesson.title} — ${lesson.titleZh} — HSK ${level}`,
      `${lesson.title} — ${lesson.titleZh} — HSK ${level}`,
    ),
    description: t(
      `الدرس ${index + 1} من ${summary.lessonCount} في ${summary.label}: ${lesson.title} (${lesson.titleZh}). ${lesson.vocabularyIds.length} كلمة بالبينين والمعنى العربي وجمل كاملة.`,
      `Lesson ${index + 1} of ${summary.lessonCount} in ${summary.label}: ${lesson.title} (${lesson.titleZh}). ${lesson.vocabularyIds.length} words with pinyin, Arabic meanings and full sentences.`,
    ),
    alternates: {
      canonical: `/${locale}/lesson/${slug}`,
      languages: { ar: `/ar/lesson/${slug}`, en: `/en/lesson/${slug}`, 'x-default': `/ar/lesson/${slug}` },
    },
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = makeT(locale)

  const parsed = parseSlug(slug)
  if (!parsed) notFound()
  const { level, lesson, index } = parsed

  const content = LEVEL_CONTENT[level]
  const summary = levelSummary(level)
  const free = isFree(level, index)
  const units = unitsOfLesson(level, lesson.id)

  // Read the words only on the free path. On a paid lesson this array is never
  // built, so nothing to leak can reach the serialiser by accident later.
  const words: VocabWord[] = free
    ? lesson.vocabularyIds
        .map((id) => content.vocabulary.find((w) => w.id === id))
        .filter((w): w is VocabWord => Boolean(w))
    : []

  const prev = content.lessons[index - 1]
  const next = content.lessons[index + 1]

  return (
    <main className="j-landing">
      <LessonStructuredData
        locale={locale}
        level={level}
        lessonId={lesson.id}
        title={lesson.title}
        titleZh={lesson.titleZh}
        wordCount={lesson.vocabularyIds.length}
      />

      <section className="j-landing-hero j-landing-hero-short">
        <BridgeArch />
        <HanziWatermark char={lesson.titleZh.slice(0, 1)} size={150} style={{ top: '18px', insetInlineEnd: '-18px' }} />

        <div className="relative mx-auto flex w-full max-w-[64rem] flex-col gap-3">
          <Link href={`/${locale}/hsk/${level}`} className="j-landing-ghost-btn self-start">
            {t(`→ ${summary.label}`, `→ ${summary.label}`)}
          </Link>
          <span className="j-landing-pill">
            {free
              ? t('درس مجاني بالكامل', 'A fully free lesson')
              : t(`الدرس ${index + 1} من ${summary.lessonCount}`, `Lesson ${index + 1} of ${summary.lessonCount}`)}
          </span>
          <h1 className="font-display text-[27px] font-black leading-[1.3] text-[color:var(--brand-ivory)] sm:text-[36px]">
            {lesson.title}
          </h1>
          <p className="font-chinese text-[22px] font-bold text-[color:var(--gold-400)]" lang="zh-Hans">
            {lesson.titleZh}
          </p>
          <p className="text-[13.5px] leading-[1.8] text-[color:var(--navy-200)]" dir="ltr">
            {lesson.vocabularyIds.length} {t('كلمة', 'words')} · {lesson.grammarIds.length}{' '}
            {t('قاعدة', 'rules')} · {units.length} {t('وحدة', 'units')}
          </p>
          <Link href={`/${locale}/path`} className="j-cta-gold">
            {free ? t('ابدأ هذا الدرس', 'Start this lesson') : t('افتح المسار الكامل', 'Open the full path')}
          </Link>
        </div>
      </section>

      {/* The units: what a learner actually sits down and finishes. Their
          titles and goals are content, not the words inside them, so they are
          crawlable on paid lessons too. */}
      {units.length > 0 && (
        <section className="j-landing-section">
          <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
            {t('وحدات هذا الدرس', 'The units in this lesson')}
          </h2>
          <p className="mt-1.5 max-w-[46rem] text-sm leading-[1.8] text-[color:var(--text-secondary)]">
            {t(
              'الدرس ليس جلسة واحدة طويلة. هو وحدات قصيرة، كل واحدة موضوع واحد وخمس إلى ثماني كلمات، تُنهيها في جلسة واحدة.',
              'A lesson is not one long sitting. It is short units — one subject and five to eight words each — that you finish in a single session.',
            )}
          </p>
          <ol className="mt-4 flex flex-col gap-2.5">
            {units.map((unit, i) => (
              <li key={unit.key} className="j-stage-row">
                <span className="j-stage-num" aria-hidden="true">{i + 1}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13.5px] font-bold">{unit.title}</span>
                  <span className="text-[12.5px] leading-[1.7] text-[color:var(--text-secondary)]">{unit.goal}</span>
                </span>
                <span className="ms-auto flex-none text-[11px] text-[color:var(--text-tertiary)]">
                  {unit.wordIds.length} {t('كلمة', 'words')}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {free ? (
        <>
          <section className="j-landing-section">
            <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
              {t('مفردات الدرس', 'The lesson’s vocabulary')}
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {words.map((word) => (
                <li key={word.id} className="j-word-row">
                  <span className="font-chinese flex-none text-[22px] font-bold" lang="zh-Hans">
                    {word.zh}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[12.5px] text-[color:var(--text-tertiary)]" dir="ltr">
                      {word.pinyin}
                    </span>
                    <span className="text-[13.5px] font-bold">{t(word.meaning, word.english)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {lesson.keySentences.length > 0 && (
            <section className="j-landing-section">
              <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
                {t('جمل الدرس المفتاحية', 'The lesson’s key sentences')}
              </h2>
              <ul className="mt-4 flex flex-col gap-2">
                {lesson.keySentences.map((sentence) => (
                  <li key={sentence.zh} className="j-word-row">
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-chinese text-[17px] font-bold" lang="zh-Hans">
                        {sentence.zh}
                      </span>
                      <span className="text-[12px] text-[color:var(--text-tertiary)]" dir="ltr">
                        {sentence.pinyin}
                      </span>
                      <span className="text-[13px]">{sentence.arabic}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <section className="j-landing-section">
          <div className="j-price-card j-price-card-paid">
            <span className="font-display text-[13.5px] font-bold text-[color:var(--gold-500)]">
              {t('درس ضمن الاشتراك', 'Part of the subscription')}
            </span>
            <p className="text-[13px] leading-[1.8] text-[color:var(--navy-100)]">
              {t(
                `هذا الدرس فيه ${lesson.vocabularyIds.length} كلمة و${lesson.grammarIds.length} قاعدة. الدرسان الأول والثاني من المستوى الأول مفتوحان بالكامل — جرّبهما أولاً.`,
                `This lesson holds ${lesson.vocabularyIds.length} words and ${lesson.grammarIds.length} grammar rules. Lessons one and two of level one are fully open — try those first.`,
              )}
            </p>
            <Link href={`/${locale}/lesson/hsk1-${LEVEL_CONTENT[1].lessons[0].id}`} className="j-cta-gold">
              {t('ابدأ بالدرس المجاني', 'Start with the free lesson')}
            </Link>
          </div>
        </section>
      )}

      {/* Previous / next: the crawler finds every lesson from any one of them,
          and a reader can walk the syllabus without going back to the index. */}
      <section className="j-landing-section">
        <nav className="grid gap-2 sm:grid-cols-2" aria-label={t('تنقّل بين الدروس', 'Lesson navigation')}>
          {prev && (
            <Link href={`/${locale}/lesson/hsk${level}-${prev.id}`} className="j-lesson-row">
              <span className="j-lesson-num" aria-hidden="true">←</span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[11px] text-[color:var(--text-tertiary)]">{t('الدرس السابق', 'Previous lesson')}</span>
                <span className="truncate text-[13.5px] font-bold">{prev.title}</span>
              </span>
            </Link>
          )}
          {next && (
            <Link href={`/${locale}/lesson/hsk${level}-${next.id}`} className="j-lesson-row">
              <span className="j-lesson-num" aria-hidden="true">→</span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[11px] text-[color:var(--text-tertiary)]">{t('الدرس التالي', 'Next lesson')}</span>
                <span className="truncate text-[13.5px] font-bold">{next.title}</span>
              </span>
            </Link>
          )}
        </nav>
      </section>

      <footer className="j-landing-footer">
        <p className="text-[12.5px] leading-[1.7] text-[color:var(--navy-200)]">
          {t(
            'منصة تعليمية من «جسر إلى الصين» — الاستشارات الدراسية والقبول الجامعي',
            'A learning platform by Bridge to China — study consulting and university admissions',
          )}
        </p>
      </footer>
    </main>
  )
}
