'use client'
// ─── The phone bar — five slots, every target ≥ 44px ────────────────────────
// Mobile-first is not a compromise here: ~90% of use is on a phone, so this is
// the native layout and the desktop rail is the widening. Visible below `lg`;
// `globals.css` hides it at exactly the same 1024px, from the same constant.
//
// Tapping a tab navigates. It does NOT touch the streak — navigation is not
// study, and counting it as study is what made the streak meaningless.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BOTTOM_TABS, pathAfterLocale } from './nav-model'
import { useI18n } from '@/lib/i18n'
import { useLearningStore } from '@/lib/store'
import { usePersisted } from '@/hooks/use-mounted'
import type { Locale } from '@/lib/locale'

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const { t } = useI18n()
  // Held at 0 until after the first client render. The badge is a conditional
  // ELEMENT, so a learner with due cards used to hydrate into a different tree
  // than the server sent and React rebuilt the page on every navigation.
  const dueCount = usePersisted(useLearningStore((s) => s.getDueCardIds().length), 0)
  const here = pathAfterLocale(pathname)

  return (
    <nav
      className="j-bottom-nav"
      aria-label={t('التنقل الرئيسي', 'Primary navigation')}
    >
      {BOTTOM_TABS.map((tab) => {
        const active = tab.matches(here)
        return (
          <Link
            key={tab.key}
            href={tab.href(locale)}
            aria-current={active ? 'page' : undefined}
            className={'j-bottom-nav-item' + (active ? ' active' : '')}
          >
            <span className="relative flex items-center justify-center">
              <tab.icon
                className="h-[21px] w-[21px]"
                strokeWidth={active ? 2.1 : 1.9}
                aria-hidden="true"
              />
              {tab.key === 'review' && dueCount > 0 && (
                <span className="j-bottom-nav-badge">{dueCount > 99 ? '99+' : dueCount}</span>
              )}
            </span>
            <span className="j-bottom-nav-label">{t(tab.ar, tab.en)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
