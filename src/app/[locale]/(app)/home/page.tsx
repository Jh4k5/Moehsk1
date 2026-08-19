import type { Metadata } from 'next'
import { HomeBody } from './HomeBody'
import { SectionErrorBoundary } from '@/features/shared/SectionErrorBoundary'
import { isLocale, makeT, type Locale } from '@/lib/locale'

// The learner's home. A route now, not `currentSection === 'dashboard'` inside
// a 3673-line switch, so the browser's back button and a shared link both work.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const t = makeT(locale)
  return { title: t('الرئيسية', 'Home'), robots: { index: false } }
}

export default function HomePage() {
  return (
    <SectionErrorBoundary sectionName="الرئيسية">
      <HomeBody />
    </SectionErrorBoundary>
  )
}
