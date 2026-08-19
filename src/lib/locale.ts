// ─── Locale primitives — no React, no store, safe on the server ─────────────
// The ROUTE is the source of truth for language: `/ar/...` and `/en/...` are
// two real, crawlable URLs. Nothing here touches the browser, so server
// components and `middleware.ts` can both use it.

export type Locale = 'ar' | 'en'

export const LOCALES = ['ar', 'en'] as const satisfies readonly Locale[]
export const DEFAULT_LOCALE: Locale = 'ar'

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'ar' || value === 'en'
}

/** Writing direction for a locale — used for `<html dir>` on the server. */
export function dirOf(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'en' ? 'ltr' : 'rtl'
}

/**
 * Server-safe translator. Server components have no store, so they build a
 * `t` from the locale their route handed them.
 */
export function makeT(locale: Locale) {
  return (ar: string, en?: string): string => (locale === 'en' && en != null ? en : ar)
}

/** Server-safe data picker by locale. */
export function makePick(locale: Locale) {
  return function pick<T>(arVal: T, enVal: T | undefined | null): T {
    return locale === 'en' && enVal != null ? (enVal as T) : arVal
  }
}

/** Swap the locale segment of a pathname: `/ar/review` → `/en/review`. */
export function withLocale(pathname: string, locale: Locale): string {
  const parts = pathname.split('/').filter(Boolean)
  if (isLocale(parts[0])) parts[0] = locale
  else parts.unshift(locale)
  return '/' + parts.join('/')
}

/** Read the locale out of a pathname, or the default when it carries none. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0]
  return isLocale(first) ? first : DEFAULT_LOCALE
}

/**
 * Pick a locale from an `Accept-Language` header. Arabic wins ties: this is an
 * Arabic-first platform and `ar` is the default segment.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith('q='))
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) || 0 : 1 }
    })
    .sort((a, b) => b.q - a.q)
  for (const { tag } of ranked) {
    if (tag.startsWith('ar')) return 'ar'
    if (tag.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}
