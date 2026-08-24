import type { Metadata } from 'next'
import SettingsSection from '@/components/SettingsSection'
import { AppHeader } from '@/components/nav/AppHeader'
import { AccountPanel } from '@/features/account/AccountPanel'
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
  return { title: t('حسابي', 'Account'), robots: { index: false } }
}

export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  return (
    <>
      <AppHeader locale={locale} />
      <AccountPanel locale={locale} />
      <SectionErrorBoundary sectionName="حسابي">
      <SettingsSection />
      </SectionErrorBoundary>
    </>
  )
}
