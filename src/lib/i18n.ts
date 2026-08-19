'use client'
// ─── Bilingual (Arabic / English) helper — client side ──────────────────────
// The route decides the language (see `src/lib/locale.ts`); `store.lang` is a
// runtime mirror of it, kept so the non-hook `ts()` / `tsPick()` helpers keep
// working inside deeply nested components. It is deliberately NOT persisted —
// persisting it is what made English a post-hydration DOM mutation instead of
// an indexable URL.
import { useLearningStore } from '@/lib/store'
import { dirOf, type Locale } from '@/lib/locale'

export type Lang = Locale
export type { Locale }
export {
  LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  dirOf,
  makeT,
  makePick,
  withLocale,
  localeFromPath,
} from '@/lib/locale'

export interface I18n {
  lang: Lang
  dir: 'rtl' | 'ltr'
  /** Return English when lang==='en' (and en provided), else the Arabic text. */
  t: (ar: string, en?: string) => string
  /** Pick a data value by language. */
  pick: <T>(arVal: T, enVal: T | undefined | null) => T
  setLang: (l: Lang) => void
}

export function useI18n(): I18n {
  const lang = useLearningStore((s) => s.lang)
  const setLang = useLearningStore((s) => s.setLang)
  return {
    lang,
    dir: dirOf(lang),
    t: (ar, en) => (lang === 'en' && en != null ? en : ar),
    pick: (arVal, enVal) => (lang === 'en' && enVal != null ? (enVal as any) : arVal),
    setLang,
  }
}

/** Non-hook accessor for the current language (outside React). */
export function currentLang(): Lang {
  return useLearningStore.getState().lang
}

/**
 * Non-hook translation helper. Reads the current language from the store.
 * Reactive in practice because the whole tree re-renders when the language
 * changes (the shell subscribes to `lang` via useI18n).
 */
export function ts(ar: string, en?: string): string {
  return useLearningStore.getState().lang === 'en' && en != null ? en : ar
}

/** Non-hook data picker by language. */
export function tsPick<T>(arVal: T, enVal: T | undefined | null): T {
  return useLearningStore.getState().lang === 'en' && enVal != null ? (enVal as T) : arVal
}
