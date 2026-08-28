import 'server-only'
// ─── One view over three levels of content ──────────────────────────────────
//
// SERVER ONLY, and the `import 'server-only'` above is load-bearing.
//
// This module holds all three levels' vocabulary. A client component that
// imports it pulls the entire paid curriculum into a browser bundle — which is
// exactly what happened: `HomeSection` and `PathSection` imported it, the shell
// imports them, and a 918 KB chunk containing every HSK2 and HSK3 word with its
// Arabic meaning was served to every visitor of every page.
//
// With this line, that mistake is a BUILD ERROR naming the offending file
// instead of a silent giveaway that only a bundle scan would ever find.
//
// The activity engine must not know that HSK1 lives in `@/data/vocabulary` and
// HSK2 in `@/data/hsk2/vocabulary2`. It asks this module for "the words of unit
// 2:7:3" and gets them.
//
// Server-safe on purpose: no React, no store, no `'use client'` anywhere in the
// chain, so a server component can build a stream and a Client Component can
// build the same one.
//
// EVERY accessor returns an empty array rather than throwing when the content
// does not exist. Large parts of HSK2 and HSK3 are still unauthored — no
// conversations on most lessons, no exam bank above HSK1 — and the engine's job
// is to build the best stream from what IS there, not to crash on what is not.

import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { grammarRules, type GrammarRule } from '@/data/grammar'
import { lessons, type Lesson } from '@/data/lessons'
import { vocabulary2 } from '@/data/hsk2/vocabulary2'
import { grammarRules2 } from '@/data/hsk2/grammar2'
import { lessons2 } from '@/data/hsk2/lessons2'
import { vocabulary3 } from '@/data/hsk3/vocabulary3'
import { grammarRules3 } from '@/data/hsk3/grammar3'
import { lessons3 } from '@/data/hsk3/lessons3'
import { stories } from '@/data/stories'
import { stories2 } from '@/data/hsk2/stories2'
import { stories3 } from '@/data/hsk3/stories3'
import { VISUAL_DICT_CATEGORIES } from '@/data/visualDict'
import { VISUAL_DICT_CATEGORIES_2 } from '@/data/hsk2/visualDict2'
import { VISUAL_DICT_CATEGORIES_3 } from '@/data/hsk3/visualDict3'
import { dailyQA2 } from '@/data/hsk2/qa2'
import { dailyQA3 } from '@/data/hsk3/qa3'
import { HSK1_EXAM_BANK } from '@/data/examBank'
import { HSK2_EXAM_BANK } from '@/data/hsk2/examBank2'
import type { HskLevelNo } from './types'

// Shapes and the pure `hanziOf` helper live in ./content-types — a module with
// no data imports — so the engine and the session screen can describe content
// without inheriting it. See the note at the top of that file.
export * from './content-types'
import type {
  ExamItem,
  LevelContent,
  PictureWord,
  QaItem,
  StoryRecord,
} from './content-types'
import { hanziOf, toStoryRecords } from './content-types'

// ── Adapters: each source file has its own shape, none of them the same ─────
//
// Story normalisation lives in `content-types.ts` as `toStoryRecords`, shared
// with `SessionRunner.tsx` — see the comment there for why that sharing is
// load-bearing, not a style choice.

type RawDictCategory = {
  label: string
  words: { hanzi: string; pinyin: string; arabic: string; emoji: string }[]
}

function toPictures(raw: unknown): PictureWord[] {
  if (!Array.isArray(raw)) return []
  return (raw as RawDictCategory[]).flatMap((cat) =>
    (cat.words ?? []).map((w) => ({
      zh: w.hanzi,
      pinyin: w.pinyin,
      ar: w.arabic,
      emoji: w.emoji,
      category: cat.label,
    })),
  )
}

type RawQaCategory = {
  category: string
  questions: {
    q: string
    pinyin: string
    arabic: string
    answers: { zh: string; pinyin: string; arabic: string }[]
  }[]
}

function toQa(raw: unknown): QaItem[] {
  if (!Array.isArray(raw)) return []
  return (raw as RawQaCategory[]).flatMap((cat) =>
    (cat.questions ?? [])
      // A question with no model answer cannot become an activity: the whole
      // drill is "compare your answer with this one". ~35 of them are still
      // unauthored, and they are skipped rather than shown answerless.
      .filter((q) => Array.isArray(q.answers) && q.answers.length > 0)
      .map((q) => ({
        categoryAr: cat.category,
        question: { zh: q.q, pinyin: q.pinyin, ar: q.arabic },
        answer: { zh: q.answers[0].zh, pinyin: q.answers[0].pinyin, ar: q.answers[0].arabic },
      })),
  )
}

// The HSK1 exam bank is six sections with six DIFFERENT shapes — true/false
// against a picture, pick-the-picture, dialogue comprehension, gap-fill. Each
// one is mapped explicitly below rather than guessed at, because a wrong guess
// here shows the learner an exam question with no right answer.

type TfItem = { audio_text?: string; hanzi?: string; image_emoji: string; image_label_ar?: string; image_label?: string; correct: boolean; explanation_ar: string }
type PickItem = { audio_text?: string; hanzi?: string; options: { emoji: string; label: string; correct: boolean }[]; explanation_ar?: string }
type DialogueItem = { dialogue: { speaker: string; text: string }[]; question_ar: string; options: string[]; correct_index: number; explanation_ar: string }
type GapItem = { sentence: string; word_choices: string[]; correct_index: number; full_sentence: string; translation_ar: string }

type ExamBank = {
  listening_part1?: TfItem[]
  listening_part2?: PickItem[]
  listening_part3?: DialogueItem[]
  reading_part1?: PickItem[]
  reading_part2?: TfItem[]
  reading_part3?: GapItem[]
}

/** True/false against a picture → a two-option choice. */
function fromTf(items: TfItem[] | undefined, section: string, promptAr: string, promptEn: string): ExamItem[] {
  return (items ?? []).map((q) => ({
    section,
    promptAr: `${promptAr} ${q.image_emoji} ${q.image_label_ar ?? q.image_label ?? ''}`.trim(),
    promptEn: `${promptEn} ${q.image_emoji} ${q.image_label ?? ''}`.trim(),
    stimulus: q.audio_text ?? q.hanzi ?? '',
    stimulusPinyin: '',
    options: ['✓ صحيح', '✗ خطأ'],
    optionsEn: ['✓ True', '✗ False'],
    correct: q.correct ? 0 : 1,
    explanationAr: q.explanation_ar,
    explanationEn: '',
  }))
}

/** Pick the matching picture. The key lives on the option, not on the item. */
function fromPick(items: PickItem[] | undefined, section: string, promptAr: string, promptEn: string): ExamItem[] {
  return (items ?? [])
    .map((q) => {
      const correct = q.options.findIndex((o) => o.correct)
      if (correct === -1) return null
      return {
        section,
        promptAr,
        promptEn,
        stimulus: q.audio_text ?? q.hanzi ?? '',
        stimulusPinyin: '',
        options: q.options.map((o) => `${o.emoji} ${o.label}`),
        correct,
        explanationAr: q.explanation_ar ?? '',
        explanationEn: '',
      }
    })
    .filter((x): x is ExamItem => x !== null)
}

function fromDialogue(items: DialogueItem[] | undefined): ExamItem[] {
  return (items ?? []).map((q) => ({
    section: 'listening',
    promptAr: q.question_ar,
    // The dialogue bank is Arabic-only; an empty English prompt is honest and
    // the view falls back rather than inventing a translation here.
    promptEn: '',
    stimulus: q.dialogue.map((t) => `${t.speaker}: ${t.text}`).join('\n'),
    stimulusPinyin: '',
    options: q.options,
    correct: q.correct_index,
    explanationAr: q.explanation_ar,
    explanationEn: '',
  }))
}

function fromGap(items: GapItem[] | undefined): ExamItem[] {
  return (items ?? []).map((q) => ({
    section: 'reading',
    promptAr: 'أكمل الجملة بالكلمة المناسبة',
    promptEn: 'Complete the sentence with the right word',
    stimulus: q.sentence,
    stimulusPinyin: '',
    options: q.word_choices,
    correct: q.correct_index,
    explanationAr: `${q.full_sentence} — ${q.translation_ar}`,
    explanationEn: '',
  }))
}

function toExam(raw: unknown): ExamItem[] {
  const bank = (raw ?? {}) as ExamBank
  return [
    ...fromTf(bank.listening_part1, 'listening', 'هل تطابق الجملةُ الصورة؟', 'Does the sentence match the picture?'),
    ...fromPick(bank.listening_part2, 'listening', 'اختر الصورة التي تطابق ما سمعت', 'Choose the picture that matches what you heard'),
    ...fromDialogue(bank.listening_part3),
    ...fromPick(bank.reading_part1, 'reading', 'اختر الصورة التي تطابق الكلمة', 'Choose the picture that matches the word'),
    ...fromTf(bank.reading_part2, 'reading', 'هل تطابق الجملةُ الصورة؟', 'Does the sentence match the picture?'),
    ...fromGap(bank.reading_part3),
  ]
}

// ── The three levels ────────────────────────────────────────────────────────

function indexed(content: Omit<LevelContent, 'byId'>): LevelContent {
  return { ...content, byId: new Map(content.vocabulary.map((w) => [w.id, w])) }
}

const LEVELS: Record<HskLevelNo, LevelContent> = {
  1: indexed({
    level: 1,
    vocabulary,
    lessons,
    grammar: grammarRules,
    stories: toStoryRecords(stories),
    pictures: toPictures(VISUAL_DICT_CATEGORIES),
    qa: [], // HSK1 has no authored daily-Q&A set yet; qa2/qa3 do.
    exam: toExam(HSK1_EXAM_BANK),
  }),
  2: indexed({
    level: 2,
    vocabulary: vocabulary2 as unknown as VocabWord[],
    lessons: lessons2 as unknown as Lesson[],
    grammar: grammarRules2 as unknown as GrammarRule[],
    stories: toStoryRecords(stories2),
    pictures: toPictures(VISUAL_DICT_CATEGORIES_2),
    qa: toQa(dailyQA2),
    exam: toExam(HSK2_EXAM_BANK),
  }),
  3: indexed({
    level: 3,
    vocabulary: vocabulary3 as unknown as VocabWord[],
    lessons: lessons3 as unknown as Lesson[],
    grammar: grammarRules3 as unknown as GrammarRule[],
    stories: toStoryRecords(stories3),
    pictures: toPictures(VISUAL_DICT_CATEGORIES_3),
    qa: toQa(dailyQA3),
    exam: [], // [2.17] HSK3 bank not authored yet — a chapter exam here is
    // reported as 'not ready' rather than rendered as a paper with no questions.
  }),
}

export function levelContent(level: HskLevelNo): LevelContent {
  return LEVELS[level] ?? LEVELS[1]
}

/** Word lookup within a level. Indexed once, not scanned per call. */
const WORD_INDEX: Record<HskLevelNo, Map<number, VocabWord>> = {
  1: new Map(LEVELS[1].vocabulary.map((w) => [w.id, w])),
  2: new Map(LEVELS[2].vocabulary.map((w) => [w.id, w])),
  3: new Map(LEVELS[3].vocabulary.map((w) => [w.id, w])),
}

export function wordById(level: HskLevelNo, id: number): VocabWord | null {
  return WORD_INDEX[level]?.get(id) ?? null
}

/** The words of a unit, in the unit's own order, skipping any that vanished. */
export function wordsByIds(level: HskLevelNo, ids: readonly number[]): VocabWord[] {
  const out: VocabWord[] = []
  for (const id of ids) {
    const word = wordById(level, id)
    if (word) out.push(word)
  }
  return out
}

export function lessonById(level: HskLevelNo, id: number): Lesson | null {
  return levelContent(level).lessons.find((l) => l.id === id) ?? null
}

export function grammarById(level: HskLevelNo, id: number): GrammarRule | null {
  return levelContent(level).grammar.find((g) => g.id === id) ?? null
}

export { hanziOf }
