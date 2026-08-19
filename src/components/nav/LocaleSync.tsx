'use client'
// ─── Route → store, and store → route, for the UI language ──────────────────
// The URL is the source of truth. This keeps `store.lang` equal to the route's
// locale so the non-hook `ts()` helper inside deep components stays right, and
// sends the browser to the other locale when something (the onboarding screen's
// switcher, say) sets `lang` directly instead of navigating.
//
// It replaces `LangController`, which mutated `document.documentElement.lang`
// after hydration from localStorage — invisible to a crawler, and the reason
// the English site could never be indexed.
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLearningStore } from '@/lib/store'
import { withLocale, type Locale } from '@/lib/locale'

export function LocaleSync({ locale }: { locale: Locale }) {
  const router = useRouter()
  const pathname = usePathname()
  const lang = useLearningStore((s) => s.lang)
  // `null` until the first run, so the first pass always adopts the route
  // rather than mistaking a default store value for a user choice.
  const seenRouteLocale = useRef<Locale | null>(null)

  useEffect(() => {
    if (seenRouteLocale.current !== locale) {
      // The route is new to us — it wins.
      seenRouteLocale.current = locale
      if (useLearningStore.getState().lang !== locale) {
        useLearningStore.setState({ lang: locale })
      }
      return
    }
    // Same route, different `lang`: something set the store directly. Follow it,
    // so the URL never disagrees with what the reader is looking at.
    if (lang !== locale) {
      router.replace(withLocale(pathname, lang))
    }
  }, [locale, lang, pathname, router])

  return null
}
