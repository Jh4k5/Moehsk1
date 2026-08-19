'use client'
// ─── The desktop rail — exists only at ≥ 1024px ─────────────────────────────
// `sidebarOpen` used to mean two different things: "drawer is open" below `lg`
// and "rail is expanded" at `lg`+, with `window.innerWidth < 1024` retyped in
// five places and no resize listener. Those are two states, so they are two
// pieces of state now: the drawer owns its own (`NavDrawer`), and `railExpanded`
// below means only what its name says. Nothing here renders below `lg`.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { BOTTOM_TABS, DRAWER_GROUPS, NAV, hrefFor, pathAfterLocale } from './nav-model'
import { useI18n } from '@/lib/i18n'
import { useActiveLevel } from '@/lib/levels'
import { useLearningStore } from '@/lib/store'
import { Logo } from '@/components/brand/Logo'
import type { Locale } from '@/lib/locale'

export function DesktopSidebar({ locale }: { locale: Locale }) {
  const [railExpanded, setRailExpanded] = useState(true)
  const pathname = usePathname()
  const { t } = useI18n()
  const activeLevel = useActiveLevel()
  const learnedWords = useLearningStore((s) => s.learnedWords)
  const here = pathAfterLocale(pathname)

  const total = activeLevel.vocabulary.length
  const ids = new Set(activeLevel.vocabulary.map((w) => w.id))
  const learned = learnedWords.filter((id) => ids.has(id)).length
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0

  return (
    <aside
      className={'j-sidebar j-rail' + (railExpanded ? '' : ' j-sidebar-collapsed')}
      aria-label={t('التنقل الجانبي', 'Sidebar navigation')}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-4">
        <Logo variant="icon-white" size={32} />
        {railExpanded && (
          <div className="j-logo-text min-w-0 flex-1">
            <span className="j-logo-ar truncate">{t('جسر إلى الصين', 'Bridge to China')}</span>
            <span className="j-logo-en">{activeLevel.label}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setRailExpanded((v) => !v)}
          aria-expanded={railExpanded}
          aria-label={railExpanded ? t('اطوِ الشريط', 'Collapse sidebar') : t('وسّع الشريط', 'Expand sidebar')}
          className="ms-auto rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          {railExpanded ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-1">
          {BOTTOM_TABS.map((tab) => {
            const active = tab.matches(here)
            return (
              <li key={tab.key}>
                <Link
                  href={tab.href(locale)}
                  aria-current={active ? 'page' : undefined}
                  className={'j-nav-item' + (active ? ' active' : '')}
                  title={railExpanded ? undefined : t(tab.ar, tab.en)}
                >
                  <span className="j-nav-icon">
                    <tab.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="j-nav-label">{t(tab.ar, tab.en)}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {DRAWER_GROUPS.map((group) => (
          <div key={group.en} className="pt-3">
            <div className="j-nav-divider">{t(group.ar, group.en)}</div>
            <ul className="space-y-0.5 px-1">
              {group.sections.map((section) => {
                const entry = NAV[section]
                const active = here === entry.path
                return (
                  <li key={section}>
                    <Link
                      href={hrefFor(locale, section)}
                      aria-current={active ? 'page' : undefined}
                      className={'j-nav-item' + (active ? ' active' : '')}
                      title={railExpanded ? undefined : t(entry.ar, entry.en)}
                    >
                      <span className="j-nav-icon">
                        <entry.icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="j-nav-label">{t(entry.ar, entry.en)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {railExpanded && (
        <div className="border-t border-white/10 p-3">
          <div className="rounded-xl bg-white/5 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-medium text-white/50">
                {t('التقدم العام', 'Overall progress')}
              </span>
              <span className="text-xs font-bold text-[color:var(--gold-500)]">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[color:var(--gold-500)] transition-[width] duration-700"
                style={{ width: progress + '%' }}
              />
            </div>
            <div className="mt-1 text-center text-[10px] text-white/40" dir="ltr">
              {learned}/{total}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
