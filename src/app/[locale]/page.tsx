import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BridgeArchWide, HanziWatermark } from '@/components/nav/BridgeArt'
import { SiteStructuredData } from '@/features/marketing/structured-data'
import { Logo } from '@/components/brand/Logo'
import { LEVEL_SUMMARIES, TOTAL_LESSONS, TOTAL_WORDS } from '@/features/marketing/level-summary'
import { LOCALES, isLocale, makeT, type Locale } from '@/lib/locale'
import { lessons } from '@/data/lessons'

// A SERVER component. No `mounted` gate, no `if (!profile)` redirect to
// onboarding — the two guards that reduced the crawlable page to one character
// (桥). Everything below is in the served HTML.

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const t = makeT(locale)
  return {
    title: {
      absolute: t(
        'تعلّم اللغة الصينية بالعربية — من الصفر إلى HSK 3',
        'Learn Chinese in Arabic — from zero to HSK 3',
      ),
    },
    alternates: { canonical: `/${locale}`, languages: { ar: '/ar', en: '/en', 'x-default': '/ar' } },
  }
}

const STAGES: { ar: string; en: string; accent?: boolean }[] = [
  { ar: 'أرِني الحرف واسمعه بنبراته', en: 'Show me the character, and let me hear its tones' },
  { ar: 'فكّكه إلى جذوره ومعانيها', en: 'Break it into its radicals and what each one means' },
  { ar: 'تعبير حفظ مكتوب بعقل عربي', en: 'A mnemonic written for an Arabic-speaking mind' },
  { ar: 'اكتبه بترتيب ضرباته على لوح التتبّع', en: 'Write it in stroke order on the tracing board', accent: true },
  { ar: 'انطقه فيُقيَّم نطقك ونبراتك', en: 'Say it, and have your pronunciation and tones scored' },
  { ar: 'استعمله في جملة ومحادثة', en: 'Use it in a sentence and in conversation' },
]

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = makeT(locale)

  return (
    <main className="j-landing">
      <SiteStructuredData locale={locale} />

      {/* ═══ Dark hero ═══ */}
      <section className="j-landing-hero">
        <BridgeArchWide />
        <HanziWatermark size={160} style={{ top: '40px', insetInlineEnd: '-22px' }} />

        <div className="relative mx-auto flex w-full max-w-[64rem] items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[color:var(--brand-ivory)]">
              <Logo variant="icon" size={22} />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-[13.5px] font-bold leading-tight text-[color:var(--brand-ivory)]">
                {t('جسر إلى الصين', 'Bridge to China')}
              </span>
              <span className="text-[8.5px] tracking-[0.17em] text-[color:var(--navy-300)]">
                BRIDGE TO CHINA
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale === 'ar' ? 'en' : 'ar'}`}
              hrefLang={locale === 'ar' ? 'en' : 'ar'}
              className="j-landing-ghost-btn"
            >
              {t('English', 'العربية')}
            </Link>
            <Link href={`/${locale}/home`} className="j-landing-ghost-btn">
              {t('دخول', 'Sign in')}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-9 flex w-full max-w-[64rem] flex-col gap-4">
          <span className="j-landing-pill">
            <span className="h-[5px] w-[5px] rounded-full bg-[color:var(--brand-red)]" aria-hidden="true" />
            {t('الدرسان الأولان مجاناً — بلا بطاقة', 'First two lessons free — no card')}
          </span>
          <h1 className="font-display text-[33px] font-black leading-[1.3] text-[color:var(--brand-ivory)] text-balance sm:text-[44px]">
            {t('تعلّم الصينية بالعربية، خطوة خطوة', 'Learn Chinese in Arabic, one step at a time')}
          </h1>
          <p className="max-w-[46rem] text-[14.5px] leading-[1.85] text-[color:var(--navy-200)] sm:text-base">
            {t(
              'لا أقسام تتوه فيها. مسار واحد يبدأ من الحرف الأول: تقرأ، وتكتب الرمز بترتيب ضرباته، وتنطق فيُقيَّم نطقك، وتحاور — داخل الدرس نفسه.',
              'No maze of sections to get lost in. One path that starts at the very first character: you read it, write it in stroke order, say it and have it scored, and use it in conversation — inside the same lesson.',
            )}
          </p>
          <Link href={`/${locale}/home`} className="j-cta-gold">
            {t('ابدأ الدرس الأول', 'Start lesson one')}
          </Link>
        </div>
      </section>

      {/* ═══ The numbers ═══ */}
      <section className="j-landing-stats" aria-label={t('أرقام المنهج', 'Curriculum in numbers')}>
        <div className="j-landing-stat">
          <span className="j-landing-stat-num">{TOTAL_WORDS.toLocaleString(locale === 'en' ? 'en' : 'ar-EG')}</span>
          <span className="j-landing-stat-label">{t('كلمة بجمل وجذور', 'words, with sentences and radicals')}</span>
        </div>
        <div className="j-landing-stat">
          <span className="j-landing-stat-num">{TOTAL_LESSONS.toLocaleString(locale === 'en' ? 'en' : 'ar-EG')}</span>
          <span className="j-landing-stat-label">{t('درساً متدرّجاً', 'graded lessons')}</span>
        </div>
        <div className="j-landing-stat">
          <span className="j-landing-stat-num">HSK 1–3</span>
          <span className="j-landing-stat-label">{t('المنهج الجديد', 'the new syllabus')}</span>
        </div>
      </section>

      {/* ═══ Six stages ═══ */}
      <section className="j-landing-section">
        <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
          {t('الكلمة لا تُعرَض، بل تُبنى', 'A word is not shown to you — it is built')}
        </h2>
        <p className="mt-1.5 max-w-[46rem] text-sm leading-[1.8] text-[color:var(--text-secondary)]">
          {t(
            'كل كلمة جديدة تمرّ بستّ مراحل قبل أن تُحسب محفوظة. الحرف الصيني ليس صورة تُحفظ: هو تركيب من جذور لكل منها معنى، ونبرة تغيّر المعنى إن أخطأتها، وترتيب ضربات يجعل الكتابة ذاكرة لا رسماً.',
            'Every new word passes through six stages before it counts as learned. A Chinese character is not a picture to memorise: it is built from radicals that each carry meaning, it has a tone that changes the meaning when you get it wrong, and it has a stroke order that turns writing into memory rather than drawing.',
          )}
        </p>
        <ol className="mt-4 flex flex-col gap-2.5">
          {STAGES.map((stage, i) => (
            <li key={stage.en} className={'j-stage-row' + (stage.accent ? ' j-stage-row-accent' : '')}>
              <span className="j-stage-num" aria-hidden="true">{i + 1}</span>
              <span className="flex-1 text-[13.5px] sm:text-[15px]">{t(stage.ar, stage.en)}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══ Levels ═══ */}
      <section className="j-landing-section">
        <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
          {t('ثلاثة مستويات، منهج واحد متصل', 'Three levels, one continuous syllabus')}
        </h2>
        <p className="mt-1.5 max-w-[46rem] text-sm leading-[1.8] text-[color:var(--text-secondary)]">
          {t(
            'كل مستوى يبني على الذي قبله: مفرداته تُراجَع داخل دروس المستوى التالي، وقواعده تعود في جمل أطول، فلا تبدأ من الصفر مرتين.',
            'Each level builds on the one before it: its vocabulary comes back for review inside the next level’s lessons, and its grammar returns in longer sentences — so you never start from zero twice.',
          )}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {LEVEL_SUMMARIES.map((lv) => (
            <Link key={lv.level} href={`/${locale}/hsk/${lv.level}`} className="j-level-card">
              <span className="font-display text-lg font-extrabold text-[color:var(--clr-primary)]">
                {lv.label}
              </span>
              <span className="text-sm font-bold">{t(lv.ar, lv.en)}</span>
              <p className="text-[12.5px] leading-[1.75] text-[color:var(--text-secondary)]">
                {t(lv.descAr, lv.descEn)}
              </p>
              <span className="mt-auto text-[12px] text-[color:var(--text-tertiary)]" dir="ltr">
                {lv.wordCount} {t('كلمة', 'words')} · {lv.lessonCount} {t('درساً', 'lessons')} ·{' '}
                {lv.grammarCount} {t('قاعدة', 'rules')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ The free lessons, by name — real crawlable content ═══ */}
      <section className="j-landing-section">
        <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">
          {t('دروس المستوى الأول', 'The first level, lesson by lesson')}
        </h2>
        <p className="mt-1.5 max-w-[46rem] text-sm leading-[1.8] text-[color:var(--text-secondary)]">
          {t(
            'خمسة عشر درساً، لكل منها عنوان صيني وموضوع واحد. الأول والثاني مفتوحان بالكامل بلا حساب ولا بطاقة.',
            'Fifteen lessons, each with a Chinese title and a single subject. The first two are fully open — no account, no card.',
          )}
        </p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {lessons.map((lesson, i) => (
            <li key={lesson.id}>
              <Link href={`/${locale}/lesson/hsk1-${lesson.id}`} className="j-lesson-row">
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

      {/* ═══ Pricing ═══ */}
      <section className="j-landing-section">
        <h2 className="font-display text-[22px] font-extrabold sm:text-3xl">{t('ابدأ مجاناً', 'Start free')}</h2>
        <p className="mt-1.5 text-sm leading-[1.8] text-[color:var(--text-secondary)]">
          {t('جرّب الدرسين الأولين كاملين قبل أي قرار.', 'Try the first two lessons in full before deciding anything.')}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="j-price-card">
            <span className="font-display text-[13.5px] font-bold text-[color:var(--text-tertiary)]">
              {t('للتجربة', 'To try it')}
            </span>
            <span className="font-display text-3xl font-black">{t('مجاناً', 'Free')}</span>
            <p className="text-[13px] leading-[1.8] text-[color:var(--text-secondary)]">
              {t(
                'تمهيد المبتدئ كاملاً، والدرسان الأول والثاني بكل أنشطتهما.',
                'The complete beginner primer, plus lessons one and two with every activity in them.',
              )}
            </p>
            <Link href={`/${locale}/home`} className="j-cta-outline">
              {t('ابدأ الآن', 'Start now')}
            </Link>
          </div>
          <div className="j-price-card j-price-card-paid">
            <span className="font-display text-[13.5px] font-bold text-[color:var(--gold-500)]">
              {t('المسار الكامل', 'The full path')}
            </span>
            <p className="text-[13px] leading-[1.8] text-[color:var(--navy-100)]">
              {t(
                'المستويات الثلاثة، محاكي الامتحان، مزامنة بين أجهزتك، والمعلّم الذكي.',
                'All three levels, the exam simulator, sync across your devices, and the smart tutor.',
              )}
            </p>
            <Link href={`/${locale}/me`} className="j-cta-gold">
              {t('اشترك', 'Subscribe')}
            </Link>
          </div>
        </div>
      </section>

      <footer className="j-landing-footer">
        <p className="text-[12.5px] leading-[1.7] text-[color:var(--navy-200)]">
          {t(
            'منصة تعليمية من «جسر إلى الصين» — الاستشارات الدراسية والقبول الجامعي',
            'A learning platform by Bridge to China — study consulting and university admissions',
          )}
        </p>
        <p className="text-[12.5px] text-[color:var(--gold-500)]">
          {t('معاً نحو مستقبل أوسع', 'Together toward a wider future')}
        </p>
      </footer>
    </main>
  )
}
