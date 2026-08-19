import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BridgeArch, HanziWatermark } from '@/components/nav/BridgeArt'
import { LEVEL_CONTENT, levelSummary, type HskLevel } from '@/features/marketing/level-summary'
import { LOCALES, isLocale, makeT, type Locale } from '@/lib/locale'

// Server-rendered, fully static: the crawler gets every lesson title, every
// grammar rule name and a sample of the vocabulary — thousands of characters
// of the thing the page is actually about.

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => ['1', '2', '3'].map((level) => ({ locale, level })))
}

function parseLevel(raw: string): HskLevel | null {
  return raw === '1' || raw === '2' || raw === '3' ? (Number(raw) as HskLevel) : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; level: string }>
}): Promise<Metadata> {
  const { locale: rawLocale, level: rawLevel } = await params
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'ar'
  const level = parseLevel(rawLevel)
  if (!level) return {}
  const t = makeT(locale)
  const s = levelSummary(level)
  return {
    title: t(`${s.label} — ${s.ar}`, `${s.label} — ${s.en}`),
    description: t(s.descAr, s.descEn),
    alternates: {
      canonical: `/${locale}/hsk/${level}`,
      languages: { ar: `/ar/hsk/${level}`, en: `/en/hsk/${level}`, 'x-default': `/ar/hsk/${level}` },
    },
  }
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ locale: string; level: string }>
}) {
  const { locale: rawLocale, level: rawLevel } = await params
  const level = parseLevel(rawLevel)
  if (!isLocale(rawLocale) || !level) notFound()
  const locale: Locale = rawLocale
  const t = makeT(locale)
  const summary = levelSummary(level)
  const content = LEVEL_CONTENT[level]
  const lessonSlugPrefix = `hsk${level}`

  return (
    <main className="j-landing">
      <section className="j-landing-hero j-landing-hero-short">
        <BridgeArch />
        <HanziWatermark char="路" size={120} style={{ top: '-30px', insetInlineStart: '-10px' }} />
        <div className="relative mx-auto flex w-full max-w-[64rem] flex-col gap-3">
          <Link href={`/${locale}`} className="text-[12px] text-[color:var(--navy-200)] hover:underline">
            {t('← جسر إلى الصين', '← Bridge to China')}
          </Link>
          <h1 className="font-display text-3xl font-black text-[color:var(--brand-ivory)] sm:text-4xl">
            {summary.label} — {t(summary.ar, summary.en)}
          </h1>
          <p className="max-w-[46rem] text-[14.5px] leading-[1.85] text-[color:var(--navy-200)]">
            {t(summary.descAr, summary.descEn)}
          </p>
          <p className="text-[13px] text-[color:var(--navy-300)]" dir="ltr">
            {summary.wordCount} {t('كلمة', 'words')} · {summary.lessonCount} {t('درساً', 'lessons')} ·{' '}
            {summary.grammarCount} {t('قاعدة نحوية', 'grammar rules')}
          </p>
          <Link href={`/${locale}/path`} className="j-cta-gold self-start px-6">
            {t('ادخل المسار', 'Enter the path')}
          </Link>
        </div>
      </section>

      <section className="j-landing-section">
        <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
          {t('الدروس', 'The lessons')}
        </h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {content.lessons.map((lesson, i) => (
            <li key={lesson.id}>
              <Link href={`/${locale}/lesson/${lessonSlugPrefix}-${lesson.id}`} className="j-lesson-row">
                <span className="j-lesson-num" aria-hidden="true">{i + 1}</span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13.5px] font-bold">{lesson.title}</span>
                  <span className="font-chinese truncate text-[12px] text-[color:var(--text-tertiary)]">
                    {lesson.titleZh}
                  </span>
                </span>
                <span className="ms-auto flex-none text-[11px] text-[color:var(--text-tertiary)]">
                  {lesson.vocabularyIds.length} {t('كلمة', 'words')}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="j-landing-section">
        <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
          {t('القواعد التي يغطيها هذا المستوى', 'The grammar this level covers')}
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          {content.grammarRules.map((rule) => (
            <li key={rule.id} className="j-lesson-row">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13.5px] font-bold">{t(rule.titleAr, rule.title)}</span>
                <span className="text-[12px] leading-[1.7] text-[color:var(--text-secondary)]">
                  {t(rule.description, rule.descriptionEn)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="j-landing-section">
        <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
          {t('من مفردات المستوى', 'A sample of the vocabulary')}
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {content.vocabulary.slice(0, 60).map((word) => (
            <li key={word.id} className="j-word-row">
              <span className="font-chinese text-lg font-bold">{word.zh}</span>
              <span className="text-[12px] text-[color:var(--text-tertiary)]" dir="ltr">
                {word.pinyin}
              </span>
              <span className="ms-auto text-[12.5px]">{t(word.meaning, word.english || word.meaning)}</span>
            </li>
          ))}
        </ul>
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
