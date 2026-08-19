'use client'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CornerUpLeft } from 'lucide-react'
import { LIBRARY_COMPONENTS } from '../registry'
import { AppHeader } from '@/components/nav/AppHeader'
import { SectionErrorBoundary } from '@/features/shared/SectionErrorBoundary'
import { NAV, hrefFor, libraryHref, type Section } from '@/components/nav/nav-model'
import { makeT, type Locale } from '@/lib/locale'

export function LibrarySectionView({ locale, section }: { locale: Locale; section: Section }) {
  const t = makeT(locale)
  const entry = NAV[section]
  const Body = LIBRARY_COMPONENTS[section as keyof typeof LIBRARY_COMPONENTS]
  const Back = locale === 'ar' ? ArrowRight : ArrowLeft

  return (
    <>
      <AppHeader locale={locale} />
      <div className="j-library-section">
      <nav className="j-library-crumbs" aria-label={t('مسار التصفّح', 'Breadcrumb')}>
        <Link href={libraryHref(locale)} className="j-crumb">
          <Back size={16} aria-hidden />
          {t('المكتبة', 'Library')}
        </Link>
        <span className="j-crumb-current">{t(entry.ar, entry.en)}</span>
      </nav>

      <SectionErrorBoundary sectionName={entry.ar}>
        <Body />
      </SectionErrorBoundary>

      {/* The library is a detour, so every section says where the path is. A
          learner who wandered in here is one tap from the thing that is
          actually next, instead of having to remember it. */}
      <Link href={hrefFor(locale, 'lessons')} className="j-back-to-path">
        <CornerUpLeft size={18} aria-hidden />
        <span>{t('مسارك هنا', 'Your path is this way')}</span>
      </Link>
      </div>
    </>
  )
}
