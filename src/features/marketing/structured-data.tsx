// ─── Structured data ────────────────────────────────────────────────────────
//
// What turns a blue link into a result with a rating, a level and a provider
// beside it. The platform competes for «تعلم الصينية» against sites with far
// more authority; a richer result is one of the few levers that does not
// require authority to pull.
//
// Server components, no client cost — a `<script type="application/ld+json">`
// is inert markup.
//
// EVERY CLAIM HERE IS CHECKABLE against the page it sits on. No rating, because
// there are no reviews yet; no `offers` price, because the owner sets that from
// the admin panel and a number invented here would contradict the page. Google
// drops structured data that disagrees with the visible content, and a site
// that does it repeatedly loses rich results altogether.

import { PUBLIC_INDEX, type PublicLevelIndex } from '@/data/public-index.generated'
import type { Locale } from '@/lib/locale'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moehsk1.vercel.app'

/** The publisher, referenced by id from everything else. */
function organisation(locale: Locale) {
  return {
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: locale === 'en' ? 'Bridge to China' : 'جسر إلى الصين',
    url: SITE,
    logo: `${SITE}/brand/app-icon.svg`,
    description:
      locale === 'en'
        ? 'Study consulting and university admissions for China, and the Arabic-language platform for learning Chinese.'
        : 'الاستشارات الدراسية والقبول الجامعي في الصين، ومنصة تعلّم اللغة الصينية بالعربية.',
  }
}

function Json({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own generated index — no user input
      // reaches it — and `JSON.stringify` escapes the content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** The site itself, plus its search-ability. For the landing page. */
export function SiteStructuredData({ locale }: { locale: Locale }) {
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          organisation(locale),
          {
            '@type': 'WebSite',
            '@id': `${SITE}/#website`,
            url: `${SITE}/${locale}`,
            name: locale === 'en' ? 'Bridge to China — Learn Chinese' : 'جسر إلى الصين — تعلّم الصينية',
            inLanguage: locale === 'en' ? 'en' : 'ar',
            publisher: { '@id': `${SITE}/#organization` },
          },
        ],
      }}
    />
  )
}

/** One HSK level as a Course. */
export function CourseStructuredData({
  locale,
  level,
}: {
  locale: Locale
  level: 1 | 2 | 3
}) {
  const index: PublicLevelIndex = PUBLIC_INDEX[level]
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'Course',
        '@id': `${SITE}/${locale}/hsk/${level}#course`,
        name: `HSK ${level}`,
        url: `${SITE}/${locale}/hsk/${level}`,
        inLanguage: locale === 'en' ? 'en' : 'ar',
        teaches: locale === 'en' ? 'Mandarin Chinese' : 'اللغة الصينية',
        educationalLevel: `HSK ${level}`,
        numberOfCredits: index.lessons.length,
        provider: { '@id': `${SITE}/#organization` },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: `PT${index.lessons.length * 2}H`,
        },
        // Named parts, so a crawler sees a syllabus rather than one opaque page
        // — and the lesson pages it links to already exist and are indexed.
        hasPart: index.lessons.map((lesson) => ({
          '@type': 'Course',
          name: lesson.title,
          url: `${SITE}/${locale}/lesson/hsk${level}-${lesson.id}`,
          provider: { '@id': `${SITE}/#organization` },
        })),
      }}
    />
  )
}

/** One lesson, as a part of its level's course. */
export function LessonStructuredData({
  locale,
  level,
  lessonId,
  title,
  titleZh,
  wordCount,
}: {
  locale: Locale
  level: 1 | 2 | 3
  lessonId: number
  title: string
  titleZh: string
  wordCount: number
}) {
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        '@id': `${SITE}/${locale}/lesson/hsk${level}-${lessonId}#lesson`,
        name: `${title} — ${titleZh}`,
        url: `${SITE}/${locale}/lesson/hsk${level}-${lessonId}`,
        inLanguage: locale === 'en' ? 'en' : 'ar',
        teaches: locale === 'en' ? 'Mandarin Chinese' : 'اللغة الصينية',
        educationalLevel: `HSK ${level}`,
        learningResourceType: 'Lesson',
        provider: { '@id': `${SITE}/#organization` },
        isPartOf: { '@id': `${SITE}/${locale}/hsk/${level}#course` },
        // A count is a fact the page prints; the words themselves are the paid
        // product and never appear in the markup of a locked lesson.
        educationalAlignment: {
          '@type': 'AlignmentObject',
          alignmentType: 'educationalSubject',
          targetName: `${wordCount} ${locale === 'en' ? 'vocabulary items' : 'كلمة'}`,
        },
      }}
    />
  )
}
