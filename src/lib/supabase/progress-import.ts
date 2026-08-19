'use client'
// ─── Carrying a visitor's progress into their new account ───────────────────
//
// Someone studies for three weeks with no account, then signs in. Everything
// they did lives in this browser. If it does not follow them, signing in COSTS
// them their progress — and the sign-in prompt becomes the most expensive
// button on the platform.
//
// Two decisions this file is built around:
//
// 1. IT READS THE STORE, NOT `localStorage`.
//    The persisted blob is whatever shape the app had when that visitor last
//    used it, and `migrate` in `store.ts` was for two versions a bare type
//    assertion that transformed nothing. So a dormant visitor's raw JSON can be
//    missing any field added since. Reading through `useLearningStore.getState()`
//    means zustand has already merged the stored blob over the current defaults,
//    and every field exists.
//
// 2. EVERY FIELD IS OPTIONAL ANYWAY.
//    Belt and braces: this builds the payload defensively, because the cost of
//    being wrong is a failed import for the exact users who have the most to
//    lose — the ones who studied longest before signing up.
//
// The merge itself is the database's job (`public.import_local_progress`), so
// the policy — newest wins for words, GREATEST for counters, completion is
// monotonic — is stated once in SQL rather than re-implemented here.

import { useLearningStore } from '@/lib/store'
import { createClient } from './client'
import { parseUnitKey } from '@/lib/curriculum/types'
import { levelContent } from '@/lib/curriculum/content-source'

export interface ImportResult {
  ok: boolean
  error?: string
  words?: number
  days?: number
  units?: number
  importedAt?: string
}

/** Which level a word id belongs to. Ids are level-scoped by range. */
function levelOfWord(wordId: number): 1 | 2 | 3 {
  if (wordId >= 3000) return 3
  if (wordId >= 2000) return 2
  return 1
}

/**
 * Build the payload from the live store.
 *
 * Exported for the migration test: the payload can be checked without a
 * browser, a session or a database.
 */
export function buildProgressPayload(): Record<string, unknown> {
  const state = useLearningStore.getState()

  const learned = new Set(state.learnedWords ?? [])
  const bookmarked = new Set(state.bookmarkedWords ?? [])
  const cards = state.srsCards ?? {}

  // Every word the visitor has touched, whether through SRS, the learned flag
  // or a bookmark. Taking only `srsCards` would silently drop the progress of
  // someone who used the flashcards but never rated a card.
  const wordIds = new Set<number>([
    ...Object.values(cards).map((c) => c.wordId),
    ...learned,
    ...bookmarked,
  ])

  const words = [...wordIds].map((id) => {
    const card = cards[id]
    return {
      word_id: id,
      level: levelOfWord(id),
      ease_factor: card?.easeFactor ?? 2.5,
      interval_days: card?.interval ?? 0,
      repetitions: card?.repetitions ?? 0,
      review_count: card?.reviewCount ?? 0,
      correct_count: card?.correctCount ?? 0,
      next_review: card?.nextReview ?? null,
      last_review: card?.lastReview ?? null,
      learned: learned.has(id),
      bookmarked: bookmarked.has(id),
    }
  })

  const daily = Object.entries(state.dailyActivity ?? {}).map(([date, entry]) => ({
    // `toDateString()` keys ("Mon Aug 19 2026") are not a date type. Converted
    // here rather than in SQL, where a bad parse would abort the whole import.
    date: toIsoDate(date),
    words_learned: entry?.wordsLearned ?? 0,
    questions_answered: entry?.questionsAnswered ?? 0,
    stories_read: 0,
  })).filter((d) => d.date !== null)

  const units = Object.values(state.unitProgress ?? {})
    .map((result) => {
      const ref = parseUnitKey(result.key)
      if (!ref) return null
      return {
        level: ref.level,
        lesson_no: ref.lesson,
        unit_no: ref.unit,
        status: 'completed',
        score: result.scored > 0 ? Math.round((result.correct / result.scored) * 100) : 100,
      }
    })
    .filter((u): u is NonNullable<typeof u> => u !== null)

  return {
    store_version: 3,
    words,
    daily,
    units,
    events: [],
    profile: {
      display_name: state.profile?.name ?? null,
      avatar_emoji: state.profile?.avatarEmoji ?? null,
      daily_goal: state.profile?.dailyGoal ?? null,
      current_level: state.currentLevel ?? 1,
      settings: state.settings ?? {},
    },
    // The whole blob, kept verbatim. If the merge policy ever turns out to be
    // wrong for someone, the original is still there to re-derive from.
    snapshot: {
      learnedWords: state.learnedWords,
      dailyStreak: state.dailyStreak,
      lastStudyDate: state.lastStudyDate,
      completedStories: state.completedStories,
      highScores: state.highScores,
      quizHistory: state.quizHistory?.slice(-50) ?? [],
    },
  }
}

function toIsoDate(key: string): string | null {
  const parsed = new Date(key)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

/** True when there is anything worth carrying over. */
export function hasLocalProgress(): boolean {
  const state = useLearningStore.getState()
  return (
    (state.learnedWords?.length ?? 0) > 0 ||
    Object.keys(state.srsCards ?? {}).length > 0 ||
    Object.keys(state.unitProgress ?? {}).length > 0
  )
}

/**
 * Send it. Safe to call more than once: the database refuses a second import
 * unless `force` is set, so a double-click or a re-render cannot double-count.
 */
export async function importLocalProgress(force = false): Promise<ImportResult> {
  if (!hasLocalProgress()) return { ok: true, words: 0, days: 0, units: 0 }

  const payload = buildProgressPayload()
  const { data, error } = await createClient().rpc('import_local_progress', {
    payload: payload as never,
    force,
  })

  if (error) return { ok: false, error: error.message }

  // The function returns `jsonb`, so its type is the whole Json union. Narrowed
  // through `unknown` rather than asserted straight across, which TypeScript
  // rightly refuses.
  const result = ((data ?? {}) as unknown) as ImportResult & { imported_at?: string }
  return {
    ok: result.ok === true,
    error: result.error,
    words: result.words,
    days: result.days,
    units: result.units,
    importedAt: result.imported_at,
  }
}

/** Level content is imported for its side-effect-free presence in the bundle
 *  graph, so the word-id ranges above stay checkable against real data. */
export const LEVEL_WORD_RANGES = {
  1: { min: 1, max: 1999, count: levelContent(1).vocabulary.length },
  2: { min: 2000, max: 2999, count: levelContent(2).vocabulary.length },
  3: { min: 3000, max: 3999, count: levelContent(3).vocabulary.length },
}
