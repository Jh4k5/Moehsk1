// ─── The shapes content takes, with no content in them ──────────────────────
//
// Split out of `content-source.ts` so that a module can describe content
// without importing any.
//
// `content-source` is `server-only` — it holds all three levels' vocabulary,
// and a client component that imports it drags the entire paid curriculum into
// a public bundle. But the activity engine, the session screen and the tests
// all need the TYPES, and one of them needs `hanziOf`. Leaving those in the
// same file meant every consumer inherited the data too.
//
// Nothing in this file imports a data module. That is the whole point, and it
// is worth checking before adding anything here.

import type { VocabWord } from '@/data/vocabulary'
import type { GrammarRule } from '@/data/grammar'
import type { Lesson } from '@/data/lessons'
import type { HskLevelNo } from './types'

export type { VocabWord, GrammarRule, Lesson }

// ── Normalised shapes the engine consumes ───────────────────────────────────

export interface StoryLine {
  zh: string
  pinyin: string
  ar: string
}

export interface StoryRecord {
  id: number
  titleAr: string
  lines: StoryLine[]
  questions: { zh: string; options: string[]; correct: number }[]
}

export interface PictureWord {
  zh: string
  pinyin: string
  ar: string
  emoji: string
  category: string
}

export interface QaItem {
  question: StoryLine
  answer: StoryLine
  categoryAr: string
}

export interface ExamItem {
  /** HSK section this item imitates. */
  section: string
  promptAr: string
  stimulus: string
  stimulusPinyin: string
  options: string[]
  correct: number
  explanationAr: string
}

export interface LevelContent {
  level: HskLevelNo
  vocabulary: VocabWord[]
  /** Word lookup, built once. The engine resolves ids through this. */
  byId: Map<number, VocabWord>
  lessons: Lesson[]
  grammar: GrammarRule[]
  stories: StoryRecord[]
  pictures: PictureWord[]
  qa: QaItem[]
  exam: ExamItem[]
}


/**
 * A string's Chinese characters, minus punctuation and Latin.
 *
 * Pure, and here rather than in `content-source` because the engine needs it
 * and must not import a `server-only` module to get it.
 */
export function hanziOf(text: string): string[] {
  return [...text].filter((ch) => /[一-鿿]/.test(ch))
}

// ── Shared normalisation ────────────────────────────────────────────────────
//
// `content-source.ts` (server) and `SessionRunner.tsx` (client) both build a
// `LevelContent` — the server from the raw data modules, the client from
// `useActiveLevel()`'s bundle, which for the free level (HSK1) IS one of those
// raw data modules. Both must turn the SAME raw story shape into `StoryRecord`,
// and until this function was shared they did not: the client passed the raw
// shape through untouched, `{ id, title, content, questions }`, where the
// activity engine's `story-excerpt` builder reads `s.lines` — a field that
// exists only after normalisation. The result was `Cannot read properties of
// undefined (reading 'reduce')`, a hard crash on every unit session that drew
// a story-excerpt card, on both `/ar/path/*` and `/en/path/*`.
//
// One function, importable from either side, makes that mismatch impossible
// to reintroduce: there is no second implementation left to drift.

interface RawStoryLike {
  id: number
  title: string
  content: { zh: string; pinyin: string; ar: string }[]
  questions?: { zh: string; options: string[]; correct: number }[]
}

export function toStoryRecords(raw: unknown): StoryRecord[] {
  if (!Array.isArray(raw)) return []
  return (raw as RawStoryLike[])
    .filter((s) => Array.isArray(s?.content) && s.content.length > 0)
    .map((s) => ({
      id: s.id,
      titleAr: s.title,
      lines: s.content,
      questions: Array.isArray(s.questions) ? s.questions : [],
    }))
}
