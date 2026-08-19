'use client'
// ─── Language switch — a LINK, not a state toggle ───────────────────────────
// It used to set `store.lang`, which mutated `<html lang>` after hydration.
// Google never saw it. Now it points at the same page under the other locale,
// so the English site is a URL a crawler can follow and index.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, withLocale, type Locale } from '@/lib/locale'

const LABEL: Record<Locale, string> = { ar: 'ع', en: 'EN' }
const NAME: Record<Locale, string> = { ar: 'العربية', en: 'English' }

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-white/10 p-0.5">
      {LOCALES.map((l) => {
        const active = l === locale
        return (
          <Link
            key={l}
            href={withLocale(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-current={active ? 'true' : undefined}
            title={NAME[l]}
            className={
              'grid min-h-[32px] min-w-[32px] place-items-center rounded-full px-2 text-[11px] font-bold transition-colors ' +
              (active
                ? 'bg-[color:var(--brand-ivory)] text-[color:var(--navy-700)]'
                : 'text-[color:var(--navy-200)] hover:text-[color:var(--brand-ivory)]')
            }
          >
            {LABEL[l]}
            <span className="sr-only">{NAME[l]}</span>
          </Link>
        )
      })}
    </div>
  )
}
