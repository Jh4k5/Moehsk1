import type { Metadata } from 'next'
import VocabularySection from '@/features/vocabulary/VocabularySection'
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
  return { title: t('مراجعة', 'Review'), robots: { index: false } }
}

export default function ReviewPage() {
  return (
    <SectionErrorBoundary sectionName="المراجعة">
      <VocabularySection />
    </SectionErrorBoundary>
  )
}
