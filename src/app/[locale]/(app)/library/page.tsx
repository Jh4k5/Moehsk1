import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/nav/AppHeader'
import { DRAWER_GROUPS, NAV, hrefFor } from '@/components/nav/nav-model'
import { isLocale, makeT, type Locale } from '@/lib/locale'

// The library index. Server-rendered: it is a list of links, and a list of
// links has no business waiting on hydration.
//
// Grouped rather than dumped as nineteen equal tiles — the flat grid was the
// original complaint, a student opening the app and not knowing where to start.
// Here the grouping is honest, because none of it is required: the mandatory
// path is elsewhere, and this page says so at the top.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const t = makeT(locale)
  return { title: t('المكتبة', 'Library'), robots: { index: false } }
}

export default async function LibraryIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = makeT(locale)

  return (
    <>
      <AppHeader locale={locale} />
      <div className="j-library-index">
      <header className="j-library-head">
        <h1>{t('المكتبة', 'Library')}</h1>
        <p>
          {t(
            'مادّة للمراجعة، لا واجب. مسارك المتدرّج يمشي وحده — وهذه الأقسام تفتح متى شئت.',
            'Review material, not homework. Your graded path runs on its own — these open whenever you want them.',
          )}
        </p>
        <Link href={hrefFor(locale, 'lessons')} className="j-library-path-link">
          {t('اذهب إلى مسارك ←', 'Go to your path →')}
        </Link>
      </header>

      {DRAWER_GROUPS.map((group) => (
        <section key={group.en} className="j-library-group">
          <h2>{t(group.ar, group.en)}</h2>
          <ul className="j-library-grid">
            {group.sections
              .filter((section) => NAV[section].inLibrary)
              .map((section) => {
                const entry = NAV[section]
                const Icon = entry.icon
                return (
                  <li key={section}>
                    <Link href={hrefFor(locale, section)} className="j-library-tile">
                      <Icon size={22} aria-hidden />
                      <span>{t(entry.ar, entry.en)}</span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </section>
      ))}
      </div>
    </>
  )
}
