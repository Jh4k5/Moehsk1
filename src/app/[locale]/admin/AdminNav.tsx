'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/locale'

const TABS = [
  { slug: '', label: 'الإعدادات والسعر' },
  { slug: 'codes', label: 'أكواد التفعيل' },
  { slug: 'subscribers', label: 'المشتركون' },
  { slug: 'metrics', label: 'الإحصاءات' },
]

export function AdminNav({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const base = `/${locale}/admin`
  return (
    <nav className="j-admin-tabs" aria-label="أقسام لوحة التحكم">
      {TABS.map((tab) => {
        const href = tab.slug ? `${base}/${tab.slug}` : base
        const active = tab.slug ? pathname.startsWith(href) : pathname === base
        return (
          <Link key={tab.slug} href={href} className={'j-admin-tab' + (active ? ' is-active' : '')}>
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
