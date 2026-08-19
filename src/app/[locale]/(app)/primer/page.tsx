import type { Metadata } from 'next'
import PrimerSection from '@/features/primer/PrimerSection'
import { SectionErrorBoundary } from '@/features/shared/SectionErrorBoundary'
import { isLocale, makeT, type Locale } from '@/lib/locale'

// ─── تمهيد المبتدئ ──────────────────────────────────────────────────────────
// Free for everyone, always — no entitlement check and none wanted. It is what
// convinces a visitor the platform can teach them, and it costs nothing to give.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const t = makeT(locale)
  return { title: t('تمهيد المبتدئ', 'Beginner primer'), robots: { index: false } }
}

export default function PrimerPage() {
  return (
    <SectionErrorBoundary sectionName="تمهيد المبتدئ">
      <PrimerSection />
    </SectionErrorBoundary>
  )
}
