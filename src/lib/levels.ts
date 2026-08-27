'use client'
// ─── Level dimension: which level's content this browser is allowed to hold ──
//
// HSK1 IS BUNDLED. HSK2 AND HSK3 ARE NOT, AND MUST NEVER BE.
//
// This file used to import all three levels statically. It is a client module,
// and the navigation shell imports it, so every page — including the landing
// page a stranger loads — shipped a 918 KB chunk containing every HSK2 and
// HSK3 word together with its Arabic meaning. That is the entire paid product,
// downloadable with "save as", with no account, no payment and no record.
//
// The rule now:
//   * HSK1 stays a static import. It is the free level and the trial; an
//     anonymous visitor legitimately uses it, and it must be there instantly.
//   * HSK2 and HSK3 are fetched from `/api/content/[level]`, which returns only
//     what the viewer is entitled to and a COUNT of what it withheld.
//
// `useActiveLevel()` stays SYNCHRONOUS on purpose: twenty components call it
// during render, and making it async would have meant rewriting all of them to
// close a hole that this shape closes on its own. While a paid level is in
// flight it returns an empty bundle with `loading: true`, which every list in
// the app already renders as "nothing yet".
//
// `scripts/check-paywall.js` scans the built chunks for exactly this
// regression, so a future static import of `vocabulary2` or `vocabulary3` from
// a client module fails the build gate rather than quietly reopening it.
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { grammarRules, type GrammarRule } from '@/data/grammar'
import { grammarPracticeQuestions } from '@/data/grammarPracticeQuestions'
import { lessons } from '@/data/lessons'
import { conversations } from '@/data/conversations'
import { VISUAL_DICT_CATEGORIES } from '@/data/visualDict'
import { roadmapUnits, stories, tonePairs } from '@/data/hsk1/extras'

import { useSyncExternalStore } from 'react'
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
  /** True while a paid level's content is still being fetched. */
  loading: boolean
  /** How many words this viewer may not see. A number, never the words. */
  lockedCount: number
  /**
   * The same count for the SUPPORTING material.
   *
   * A screen that shows five pictures out of thirty-three and says nothing is
   * indistinguishable from a screen showing all five pictures that exist. The
   * owner read exactly that and reported the content as deleted. Every section
   * that renders a sliced collection must be able to say so, and this is what
   * it reads to know.
   */
  lockedExtras: { qa: number; stories: number; pictures: number; grammar: number }
  /** Daily questions. Paid content above HSK1, so it arrives with the rest. */
  dailyQA: unknown[]
}

/** The free level, in full. The only one that may sit in the bundle. */
const HSK1_BUNDLE: LevelBundle = {
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
  loading: false,
  lockedCount: 0,
  lockedExtras: { qa: 0, stories: 0, pictures: 0, grammar: 0 },
  dailyQA: [],
}

/** What a paid level looks like before its content has arrived. */
function pendingBundle(level: HskLevel, loading: boolean): LevelBundle {
  return {
    level,
    label: `HSK ${level}`,
    vocabulary: [],
    grammarRules: [],
    grammarPractice: {},
    lessons: [] as unknown as typeof lessons,
    conversations: [] as unknown as typeof conversations,
    roadmapUnits: [] as unknown as typeof roadmapUnits,
    stories: [],
    tonePairs,
    visualDict: [],
    hanziChars: [],
    vocabIdRange: level === 2 ? [2000, 3000] : [3000, 4000],
    loading,
    lockedCount: 0,
    lockedExtras: { qa: 0, stories: 0, pictures: 0, grammar: 0 },
    dailyQA: [],
  }
}

// ── The fetched-level cache ─────────────────────────────────────────────────
// A tiny external store so `useActiveLevel` can stay synchronous while the
// content arrives asynchronously.

const CACHE = new Map<HskLevel, LevelBundle>([[1, HSK1_BUNDLE]])
const INFLIGHT = new Set<HskLevel>()
const LISTENERS = new Set<() => void>()

function emit() {
  for (const listener of LISTENERS) listener()
}

function subscribe(listener: () => void): () => void {
  LISTENERS.add(listener)
  return () => LISTENERS.delete(listener)
}

interface ContentResponse {
  level: number
  entitled: boolean
  words: VocabWord[]
  lockedCount: number
  qa: unknown[]
  stories: unknown[]
  pictures: { zh: string; pinyin: string; ar: string; emoji: string; category: string }[]
  grammar: GrammarRule[]
  /** How many items of each kind the free tier withheld. Counts, not items. */
  lockedExtras?: { qa: number; stories: number; pictures: number; grammar: number }
}

function request(level: HskLevel): void {
  if (level === 1 || CACHE.has(level) || INFLIGHT.has(level)) return
  INFLIGHT.add(level)
  void fetch(`/api/content/${level}`, { credentials: 'same-origin' })
    .then((res) => (res.ok ? (res.json() as Promise<ContentResponse>) : null))
    .then((data) => {
      const bundle = pendingBundle(level, false)
      if (data) {
        bundle.vocabulary = data.words ?? []
        bundle.hanziChars = uniqueChars(bundle.vocabulary)
        bundle.lockedCount = data.lockedCount ?? 0
        bundle.lockedExtras = data.lockedExtras ?? { qa: 0, stories: 0, pictures: 0, grammar: 0 }
        bundle.grammarRules = data.grammar ?? []
        bundle.stories = data.stories ?? []
        bundle.dailyQA = data.qa ?? []
        // Back into the category shape the picture screens expect.
        const byCategory = new Map<string, { label: string; icon: string; words: unknown[] }>()
        for (const p of data.pictures ?? []) {
          const cat = byCategory.get(p.category) ?? { label: p.category, icon: '', words: [] }
          cat.words.push({ hanzi: p.zh, pinyin: p.pinyin, arabic: p.ar, emoji: p.emoji })
          byCategory.set(p.category, cat)
        }
        bundle.visualDict = [...byCategory.values()]
      }
      CACHE.set(level, bundle)
    })
    .catch(() => {
      // A failed fetch must not wedge the level in "loading" forever; an empty
      // bundle renders the same empty state, and a later visit retries.
      CACHE.set(level, pendingBundle(level, false))
    })
    .finally(() => {
      INFLIGHT.delete(level)
      emit()
    })
}

/**
 * The pending bundle for a level, built ONCE and reused.
 *
 * This map is load-bearing, and its absence was a platform-wide crash.
 * `useSyncExternalStore` calls `getSnapshot` on every render and compares the
 * result with `Object.is`; anything unequal means "the store changed, render
 * again". `pendingBundle()` builds a fresh object literal, so returning it
 * directly made every render report a change — an infinite loop, React error
 * #185, on any level whose content had not arrived yet.
 *
 * HSK1 hid the bug completely: it is seeded into `CACHE` above, so it always
 * returned the same reference and never looped. Only HSK2 and HSK3 took the
 * pending path — so the very act of choosing a level, the thing the platform
 * exists to let a learner do, was what broke it. And because the chosen level
 * is persisted to localStorage, the loop came back on every later page load
 * until the user cleared their site data.
 *
 * Memoising per level keeps the reference stable, so an unresolved level is
 * simply "the same empty bundle" until the fetch lands and `CACHE` takes over.
 */
const PENDING = new Map<HskLevel, LevelBundle>()

function pendingFor(level: HskLevel): LevelBundle {
  const existing = PENDING.get(level)
  if (existing) return existing
  const created = pendingBundle(level, true)
  PENDING.set(level, created)
  return created
}

function snapshot(level: HskLevel): LevelBundle {
  const cached = CACHE.get(level)
  if (cached) return cached
  request(level)
  return pendingFor(level)
}

/** Non-hook accessor (tutor engine and other non-React code). */
export function getLevelBundle(level: HskLevel): LevelBundle {
  return CACHE.get(level) ?? (level === 1 ? HSK1_BUNDLE : pendingFor(level))
}

/**
 * One NAMED level's content, whoever is asking.
 *
 * Use this wherever the level is known from the route rather than from the
 * learner's current selection — a unit session is the case that matters. It
 * used to read `store.currentLevel`, so opening a link to an HSK2 unit while
 * the store still said HSK1 handed the activity engine HSK1's word list. None
 * of the unit's ids matched, the stream came out empty, and the learner was
 * told «لا يوجد محتوى لهذه الوحدة بعد» — "there is no content for this unit
 * yet" — over 195 authored words. Not a paywall, not an upsell: a flat lie
 * about the product being empty.
 */
export function useLevel(level: HskLevel): LevelBundle {
  return useSyncExternalStore(
    subscribe,
    () => snapshot(level),
    // The server has no cache and must not start a fetch: it renders the
    // pending shape, and the browser fills it in on the next render. Same
    // memoised reference as the client path, or hydration would see a change.
    () => (level === 1 ? HSK1_BUNDLE : pendingFor(level)),
  )
}

/**
 * The active level's content, reactive to `store.currentLevel`.
 *
 * Synchronous by design — see the note at the top of this file. Check
 * `.loading` before treating an empty `vocabulary` as "this level is empty".
 */
export function useActiveLevel(): LevelBundle {
  const level = useLearningStore((s) => s.currentLevel) as HskLevel
  return useLevel(level)
}
