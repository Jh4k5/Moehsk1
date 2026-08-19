'use client'
// ─── The active level's progress numbers, computed once ─────────────────────
// The shell used to compute these and hand them down as a `stats` prop; with
// each section on its own route there is no shell to compute them in, so it
// became a hook that any route can call.
import { useMemo } from 'react'
import { categories } from '@/data/categories'
import { useActiveLevel } from '@/lib/levels'
import { useLearningStore } from '@/lib/store'

export interface LevelStats {
  total: number
  learned: number
  progress: number
  byCategory: {
    value: string
    label: string
    labelEn?: string
    count: number
    learned: number
  }[]
}

export function useLevelStats(): LevelStats {
  const { vocabulary } = useActiveLevel()
  const learnedWords = useLearningStore((s) => s.learnedWords)

  return useMemo(() => {
    const total = vocabulary.length
    const idSet = new Set(vocabulary.map((w) => w.id))
    const learned = learnedWords.filter((id) => idSet.has(id)).length
    const progress = total > 0 ? Math.round((learned / total) * 100) : 0
    const byCategory = categories.slice(1).map((cat) => ({
      ...cat,
      count: vocabulary.filter((w) => w.pos === cat.value).length,
      learned: vocabulary.filter((w) => w.pos === cat.value && learnedWords.includes(w.id)).length,
    }))
    return { total, learned, progress, byCategory }
  }, [vocabulary, learnedWords])
}
