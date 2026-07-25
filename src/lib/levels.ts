'use client'
// ─── Level dimension: HSK1 / HSK2 bundles + active-level selection ───────────
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { grammarRules, type GrammarRule } from '@/data/grammar'
import { grammarPracticeQuestions } from '@/data/grammarPracticeQuestions'
import { lessons } from '@/data/lessons'
import { conversations } from '@/data/conversations'
import { VISUAL_DICT_CATEGORIES } from '@/data/visualDict'
import { roadmapUnits, stories, tonePairs } from '@/data/hsk1/extras'

import { vocabulary2 } from '@/data/hsk2/vocabulary2'
import { grammarRules2 } from '@/data/hsk2/grammar2'
import { grammarPracticeQuestions2 } from '@/data/hsk2/grammarPracticeQuestions2'
import { lessons2 } from '@/data/hsk2/lessons2'
import { conversations2 } from '@/data/hsk2/conversations2'
import { VISUAL_DICT_CATEGORIES_2 } from '@/data/hsk2/visualDict2'
import { roadmapUnits2 } from '@/data/hsk2/roadmap2'
import { stories2 } from '@/data/hsk2/stories2'

import { vocabulary3 } from '@/data/hsk3/vocabulary3'
import { grammarRules3 } from '@/data/hsk3/grammar3'
import { grammarPracticeQuestions3 } from '@/data/hsk3/grammarPracticeQuestions3'
import { lessons3 } from '@/data/hsk3/lessons3'
import { conversations3 } from '@/data/hsk3/conversations3'
import { VISUAL_DICT_CATEGORIES_3 } from '@/data/hsk3/visualDict3'
import { roadmapUnits3 } from '@/data/hsk3/roadmap3'
import { stories3 } from '@/data/hsk3/stories3'

import { useLearningStore } from '@/lib/store'

export type HskLevel = 1 | 2 | 3

function uniqueChars(words: VocabWord[]): string[] {
  const set = new Set<string>()
  for (const w of words) for (const ch of w.zh) if (/[一-鿿]/.test(ch)) set.add(ch)
  return [...set]
}

export interface LevelBundle {
  level: HskLevel
  label: string
  vocabulary: VocabWord[]
  grammarRules: GrammarRule[]
  grammarPractice: Record<number, { zh: string; options: string[]; correct: number }[]>
  lessons: typeof lessons
  conversations: typeof conversations
  roadmapUnits: typeof roadmapUnits
  stories: any[]
  tonePairs: typeof tonePairs
  visualDict: any[]
  hanziChars: string[]
  vocabIdRange: [number, number]
}

export const LEVEL_BUNDLES: Record<HskLevel, LevelBundle> = {
  1: {
    level: 1,
    label: 'HSK 1',
    vocabulary,
    grammarRules,
    grammarPractice: grammarPracticeQuestions,
    lessons,
    conversations,
    roadmapUnits,
    stories,
    tonePairs,
    visualDict: VISUAL_DICT_CATEGORIES,
    hanziChars: uniqueChars(vocabulary),
    vocabIdRange: [1, 1000],
  },
  2: {
    level: 2,
    label: 'HSK 2',
    vocabulary: vocabulary2,
    grammarRules: grammarRules2,
    grammarPractice: grammarPracticeQuestions2,
    lessons: lessons2 as unknown as typeof lessons,
    conversations: conversations2,
    roadmapUnits: roadmapUnits2 as unknown as typeof roadmapUnits,
    stories: stories2,
    tonePairs,
    visualDict: VISUAL_DICT_CATEGORIES_2,
    hanziChars: uniqueChars(vocabulary2),
    vocabIdRange: [2000, 3000],
  },
  3: {
    level: 3,
    label: 'HSK 3',
    vocabulary: vocabulary3,
    grammarRules: grammarRules3,
    grammarPractice: grammarPracticeQuestions3,
    lessons: lessons3 as unknown as typeof lessons,
    conversations: conversations3,
    roadmapUnits: roadmapUnits3 as unknown as typeof roadmapUnits,
    stories: stories3,
    tonePairs,
    visualDict: VISUAL_DICT_CATEGORIES_3,
    hanziChars: uniqueChars(vocabulary3),
    vocabIdRange: [3000, 4000],
  },
}

/** Non-hook accessor (for tutor engine / non-React code). */
export function getLevelBundle(level: HskLevel): LevelBundle {
  return LEVEL_BUNDLES[level] || LEVEL_BUNDLES[1]
}

/** Hook: the active level's data, reactive to store.currentLevel. */
export function useActiveLevel(): LevelBundle {
  const level = useLearningStore((s) => s.currentLevel)
  return LEVEL_BUNDLES[level] || LEVEL_BUNDLES[1]
}
