import { notFound } from 'next/navigation'
import { BottomNav } from '@/components/nav/BottomNav'
import { DesktopSidebar } from '@/components/nav/DesktopSidebar'
import Paywall from '@/components/Paywall'
import { isLocale, type Locale } from '@/lib/locale'

// ─── The app shell ──────────────────────────────────────────────────────────
// Everything a signed-in reader uses hangs off this layout, so the header, the
// bottom bar and the desktop rail mount ONCE and survive navigation instead of
// being re-created by a `currentSection` switch inside one 3673-line component.
//
// Three widths, one breakpoint (1024px, `DESKTOP_BREAKPOINT`): below it the
// bottom bar plus the header's drawer; at and above it the rail, with the
// drawer trigger hidden because the rail already lists every section. The
// 768–1023px band that had neither is gone — both sides now switch on the same
// number, declared once in `use-mobile.ts` and once as `--bp-desktop` in CSS.
//
// This layout is a server component. It renders no gate: no `mounted` splash,
// no `if (!profile) return <OnboardingScreen/>`. Onboarding is a prompt inside
// the page now, not a wall in front of it.

export default async function AppShellLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  return (
    <div className="j-app-shell">
      <DesktopSidebar locale={locale} />
      <div className="j-app-column">
        {/*
          No `AppHeader` here. It used to mount on every route, but `/home` and
          `/path` draw their own identity header — brand, level, streak — so
          those two screens rendered the whole lot twice, stacked. Pages that
          need a plain header import it themselves; the shell owns only what is
          the same on every screen.
        */}
        <Paywall />
        <main id="main" className="j-main-content">
          {children}
        </main>
      </div>
      <BottomNav locale={locale} />
    </div>
  )
}
