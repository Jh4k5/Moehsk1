import type { Metadata } from 'next'
import PathSection from '@/features/path/PathSection'
import { SectionErrorBoundary } from '@/features/shared/SectionErrorBoundary'
import { isLocale, makeT, type Locale } from '@/lib/locale'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const t = makeT(locale)
  return { title: t('مساري', 'My path'), robots: { index: false } }
}

export default function PathPage() {
  return (
    <SectionErrorBoundary sectionName="مساري">
      <PathSection />
    </SectionErrorBoundary>
  )
}
