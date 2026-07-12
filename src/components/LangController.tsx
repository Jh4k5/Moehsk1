'use client'
// ─── يضبط اتجاه/لغة الصفحة حسب اللغة المختارة (rtl للعربية، ltr للإنجليزية) ──
import { useEffect } from 'react'
import { useLearningStore } from '@/lib/store'

export function LangController() {
  const lang = useLearningStore((s) => s.lang)
  useEffect(() => {
    const el = document.documentElement
    el.lang = lang
    el.dir = lang === 'en' ? 'ltr' : 'rtl'
    el.classList.toggle('lang-en', lang === 'en')
    el.classList.toggle('lang-ar', lang !== 'en')
  }, [lang])
  return null
}
