'use client'
// Applies the reader's Chinese-character size to the document. It is a browser
// preference written to a CSS custom property, so an effect is the right place
// for it — nothing here is React state.
import { useEffect } from 'react'
import { useLearningStore } from '@/lib/store'

export function HanziScale() {
  const scale = useLearningStore((s) => s.settings.hanziFontScale)
  useEffect(() => {
    document.documentElement.style.setProperty('--hanzi-scale', String(scale))
  }, [scale])
  return null
}
