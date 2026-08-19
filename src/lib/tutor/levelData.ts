// ─── حزمة المستوى، بلا React ────────────────────────────────────────────────
//
// `@/lib/levels` هو حزم المستويات الرسمي، لكنه ملف `'use client'` لأنه يقرأ
// المتجر. ومسار /api/tutor يعمل على الخادم فيحتاج البيانات نفسها بلا حدود
// العميل. هذا الملف يستورد ملفات المحتوى مباشرة: مصدر واحد للمحتوى، وواجهتان.

import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { grammarRules, type GrammarRule } from '@/data/grammar'
import { grammarPracticeQuestions } from '@/data/grammarPracticeQuestions'
import { vocabulary2 } from '@/data/hsk2/vocabulary2'
import { grammarRules2 } from '@/data/hsk2/grammar2'
import { grammarPracticeQuestions2 } from '@/data/hsk2/grammarPracticeQuestions2'
import { vocabulary3 } from '@/data/hsk3/vocabulary3'
import { grammarRules3 } from '@/data/hsk3/grammar3'
import { grammarPracticeQuestions3 } from '@/data/hsk3/grammarPracticeQuestions3'

export type TutorLevel = 1 | 2 | 3

export interface TutorLevelData {
  level: TutorLevel
  vocabulary: VocabWord[]
  grammarRules: GrammarRule[]
  grammarPractice: Record<number, { zh: string; options: string[]; correct: number }[]>
}

const LEVELS: Record<TutorLevel, TutorLevelData> = {
  1: { level: 1, vocabulary, grammarRules, grammarPractice: grammarPracticeQuestions },
  2: { level: 2, vocabulary: vocabulary2, grammarRules: grammarRules2, grammarPractice: grammarPracticeQuestions2 },
  3: { level: 3, vocabulary: vocabulary3, grammarRules: grammarRules3, grammarPractice: grammarPracticeQuestions3 },
}

/** يقبل أي مُدخل ويعيد مستوى صالحاً — الرقم يأتي من العميل فلا يُوثق به. */
export function getTutorLevelData(level: unknown): TutorLevelData {
  const n = Number(level)
  if (n === 2 || n === 3) return LEVELS[n]
  return LEVELS[1]
}
