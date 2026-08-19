'use client'
// The locale as the URL states it — exact from the first render, unlike the
// store mirror, which `LocaleSync` only catches up on after an effect.
import { usePathname } from 'next/navigation'
import { localeFromPath, type Locale } from '@/lib/locale'

export function useLocale(): Locale {
  return localeFromPath(usePathname())
}
