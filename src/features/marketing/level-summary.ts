// ─── Level facts for the server-rendered marketing pages ────────────────────
// Counted from the real data at build time, so the landing page never quotes a
// number the curriculum has outgrown. No React, no store — importable from a
// server component.
// Imported straight from the data modules, not from `@/lib/levels`: that
// module is `'use client'`, and a server component cannot read plain values out
// of a client module.
import { vocabulary } from '@/data/vocabulary'
import { grammarRules } from '@/data/grammar'
import { lessons } from '@/data/lessons'
import { vocabulary2 } from '@/data/hsk2/vocabulary2'
import { grammarRules2 } from '@/data/hsk2/grammar2'
import { lessons2 } from '@/data/hsk2/lessons2'
import { vocabulary3 } from '@/data/hsk3/vocabulary3'
import { grammarRules3 } from '@/data/hsk3/grammar3'
import { lessons3 } from '@/data/hsk3/lessons3'
import type { Lesson } from '@/data/lessons'
import type { VocabWord } from '@/data/vocabulary'
import type { GrammarRule } from '@/data/grammar'

export type HskLevel = 1 | 2 | 3

/** The three levels' raw content, server-safe. */
export const LEVEL_CONTENT: Record<
  HskLevel,
  { label: string; vocabulary: VocabWord[]; lessons: Lesson[]; grammarRules: GrammarRule[] }
> = {
  1: { label: 'HSK 1', vocabulary, lessons, grammarRules },
  2: { label: 'HSK 2', vocabulary: vocabulary2, lessons: lessons2, grammarRules: grammarRules2 },
  3: { label: 'HSK 3', vocabulary: vocabulary3, lessons: lessons3, grammarRules: grammarRules3 },
}

export interface LevelSummary {
  level: HskLevel
  label: string
  ar: string
  en: string
  descAr: string
  descEn: string
  wordCount: number
  lessonCount: number
  grammarCount: number
}

const COPY: Record<HskLevel, Omit<LevelSummary, 'level' | 'label' | 'wordCount' | 'lessonCount' | 'grammarCount'>> = {
  1: {
    ar: 'المستوى الأول — المبتدئ',
    en: 'Level one — beginner',
    descAr:
      'من الحرف الأول: التحيات، التعارف، العائلة، الأرقام، الوقت والمكان. تنتهي منه قادراً على تعريف نفسك والسؤال عن غيرك بجُمل كاملة.',
    descEn:
      'From the very first character: greetings, introductions, family, numbers, time and place. You finish it able to introduce yourself and ask about someone else in complete sentences.',
  },
  2: {
    ar: 'المستوى الثاني — الابتدائي',
    en: 'Level two — elementary',
    descAr:
      'الحياة اليومية: التسوق، المواصلات، الطعام، الطقس، والمواعيد. الجمل تطول، ويدخل الماضي والمستقبل وأدوات الربط.',
    descEn:
      'Everyday life: shopping, transport, food, weather and appointments. Sentences get longer, and past, future and connectives enter the picture.',
  },
  3: {
    ar: 'المستوى الثالث — المتوسط',
    en: 'Level three — intermediate',
    descAr:
      'الرأي والسبب والمقارنة: تشرح لماذا، وتقارن بين خيارين، وتحكي ما حدث. مفردات الدراسة والعمل والسفر.',
    descEn:
      'Opinion, cause and comparison: you explain why, weigh two options, and recount what happened. Vocabulary for study, work and travel.',
  },
}

export const LEVEL_SUMMARIES: LevelSummary[] = ([1, 2, 3] as const).map((level) => {
  const bundle = LEVEL_CONTENT[level]
  return {
    level,
    label: bundle.label,
    ...COPY[level],
    wordCount: bundle.vocabulary.length,
    lessonCount: bundle.lessons.length,
    grammarCount: bundle.grammarRules.length,
  }
})

export const TOTAL_WORDS = LEVEL_SUMMARIES.reduce((sum, l) => sum + l.wordCount, 0)
export const TOTAL_LESSONS = LEVEL_SUMMARIES.reduce((sum, l) => sum + l.lessonCount, 0)

export function levelSummary(level: HskLevel): LevelSummary {
  return LEVEL_SUMMARIES[level - 1]
}
