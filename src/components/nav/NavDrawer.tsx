'use client'
// ─── The overflow drawer — ONE control, built on the vendored Radix sheet ────
// The old drawer was hand-rolled: no focus trap, no body scroll lock, no
// Escape, no `role="dialog"`, and TWO buttons opening it (a fixed hamburger and
// the bottom bar's «المزيد»). `ui/sheet.tsx` — Radix Dialog — had all of that
// and had never been imported. It is imported now, and there is exactly one
// trigger: the header's menu button.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { DRAWER_GROUPS, NAV, hrefFor, pathAfterLocale } from './nav-model'
import { useI18n } from '@/lib/i18n'
import { useActiveLevel } from '@/lib/levels'
import { Logo } from '@/components/brand/Logo'
import type { Locale } from '@/lib/locale'

export function NavDrawer({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { t, dir } = useI18n()
  const activeLevel = useActiveLevel()
  const here = pathAfterLocale(pathname)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="j-icon-btn"
        aria-label={t('كل الأقسام', 'All sections')}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </SheetTrigger>

      {/* `side` follows the writing direction: the drawer opens from the edge
          the reader's thumb starts at. */}
      <SheetContent
        side={dir === 'rtl' ? 'right' : 'left'}
        className="j-drawer w-[86vw] max-w-[20rem] gap-0 p-0"
      >
        <SheetHeader className="j-drawer-head">
          <SheetTitle className="flex items-center gap-3 text-[15px] font-bold text-[color:var(--brand-ivory)]">
            <Logo variant="icon-white" size={30} />
            {t('جسر إلى الصين', 'Bridge to China')}
          </SheetTitle>
          <SheetDescription className="text-[11px] tracking-[0.14em] text-[color:var(--navy-300)]">
            {activeLevel.label}
          </SheetDescription>
        </SheetHeader>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-6">
          {DRAWER_GROUPS.map((group) => (
            <div key={group.en} className="pt-3">
              <div className="j-nav-divider">{t(group.ar, group.en)}</div>
              <ul className="space-y-0.5">
                {group.sections.map((section) => {
                  const entry = NAV[section]
                  const active = here === entry.path
                  return (
                    <li key={section}>
                      <Link
                        href={hrefFor(locale, section)}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={'j-nav-item' + (active ? ' active' : '')}
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
