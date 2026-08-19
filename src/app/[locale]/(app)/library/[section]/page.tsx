import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LibrarySectionView } from './view'
import { LIBRARY_SLUGS, NAV, sectionForSlug } from '@/components/nav/nav-model'
import { LOCALES, isLocale, makeT, type Locale } from '@/lib/locale'

// The free sections. Optional by design: reachable from the library and the
// drawer, never on the mandatory path, and each one its own URL so a learner
// can bookmark "الحروف" without carrying the whole app's state in a query.

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => LIBRARY_SLUGS.map((section) => ({ locale, section })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; section: string }>
}): Promise<Metadata> {
  const { locale: raw, section: slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const t = makeT(locale)
  const section = sectionForSlug(slug)
  if (!section) return {}
  const entry = NAV[section]
  return {
    title: t(entry.ar, entry.en),
    // Review material for a signed-in learner, not a landing page. The
    // marketing routes carry the indexing weight; these would only dilute it.
    robots: { index: false },
  }
}

export default async function LibrarySectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string }>
}) {
  const { locale: raw, section: slug } = await params
  if (!isLocale(raw)) notFound()
  const section = sectionForSlug(slug)
  if (!section) notFound()

  return <LibrarySectionView locale={raw} section={section} />
}
