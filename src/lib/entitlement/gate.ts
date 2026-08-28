import 'server-only'

// ─────────────────────────────────────────────────────────────────────────────
// THE CONTENT GATE.
//
// The hard requirement from the plan: for a non-subscriber, the vocabulary and
// lessons of levels 2 and 3 must NOT REACH THE BROWSER AT ALL — not hidden by
// CSS, not skipped in a render, not sitting in a JSON payload the learner can
// read in the network tab.
//
// HOW THAT IS ACHIEVED HERE, mechanically:
//
//   1. `import 'server-only'` at the top. Any Client Component that imports
//      this file — directly or through a chain — fails the build. So the only
//      way to reach the content through this module is on the server.
//
//   2. The content modules are loaded with `await import(...)` INSIDE the
//      functions, never as top-level static imports. A static
//      `import { vocabulary3 } from '@/data/hsk3/vocabulary3'` at module scope
//      puts HSK3 in whatever chunk imports it; a dynamic import inside a
//      server-only function keeps it in a server chunk that is never served.
//
//   3. The functions return a FILTERED payload, not the full corpus with a
//      flag on it. A locked unit comes back as `LockedUnitPreview`, a
//      hand-written type with no room for `wordIds` or `hanzi`. There is no
//      code path in this file that returns a paid word to an unentitled
//      viewer, so there is nothing for a careless component to leak.
//
// WHAT THIS MODULE CANNOT FIX BY ITSELF — read this before trusting the gate:
//
//   `src/lib/levels.ts` is a `'use client'` module that STATICALLY imports the
//   vocabulary, grammar, lessons and stories of all three levels. Every page
//   that renders a component touching `useActiveLevel()` therefore ships the
//   entire paid corpus to the browser, and no server-side gate can undo that.
//   Closing the hole means the level bundles for 2 and 3 must be fetched
//   through this gate (or through `GET /api/content/*`, which wraps it) rather
//   than imported into client code. That file belongs to the routing agent;
//   this comment is the handover note.
// ─────────────────────────────────────────────────────────────────────────────

import { cache } from 'react'
import type { Unit, UnitRef, HskLevelNo } from '@/lib/curriculum/types'
import { unitKey } from '@/lib/curriculum/types'
import type { VocabWord } from '@/data/vocabulary'
import type { GrammarRule } from '@/data/grammar'
import type { Lesson } from '@/data/lessons'
import { getAccessContext } from './check'
import { decideUnitAccess, decideLessonAccess, isUnitFree } from './policy'
import type { AccessDecision, LockedUnitPreview } from './types'

// ── Server-side content loading ─────────────────────────────────────────────
// Every `await import` below is intentional. Do not hoist them.

const loadUnits = cache(async (): Promise<Unit[]> => {
  const mod = await import('@/data/units/units.generated')
  return mod.unitsGenerated
})

const loadVocabulary = cache(async (level: HskLevelNo): Promise<VocabWord[]> => {
  switch (level) {
    case 1:
      return (await import('@/data/vocabulary')).vocabulary
    case 2:
      return (await import('@/data/hsk2/vocabulary2')).vocabulary2 as VocabWord[]
    case 3:
      return (await import('@/data/hsk3/vocabulary3')).vocabulary3 as VocabWord[]
  }
})

const loadGrammar = cache(async (level: HskLevelNo): Promise<GrammarRule[]> => {
  switch (level) {
    case 1:
      return (await import('@/data/grammar')).grammarRules
    case 2:
      return (await import('@/data/hsk2/grammar2')).grammarRules2 as GrammarRule[]
    case 3:
      return (await import('@/data/hsk3/grammar3')).grammarRules3 as GrammarRule[]
  }
})

const loadLessons = cache(async (level: HskLevelNo): Promise<Lesson[]> => {
  switch (level) {
    case 1:
      return (await import('@/data/lessons')).lessons
    case 2:
      return (await import('@/data/hsk2/lessons2')).lessons2 as unknown as Lesson[]
    case 3:
      return (await import('@/data/hsk3/lessons3')).lessons3 as unknown as Lesson[]
  }
})

function isLevelNo(value: number): value is HskLevelNo {
  return value === 1 || value === 2 || value === 3
}

// ── Results ─────────────────────────────────────────────────────────────────

/** The full payload of a unit the viewer is allowed to study. */
export interface UnlockedUnit {
  allowed: true
  decision: AccessDecision
  unit: Unit
  /** Only the words this unit owns — never the whole level. */
  words: VocabWord[]
  /** Only the grammar rules this unit draws on. */
  grammar: GrammarRule[]
  /** Only the key sentences this unit's `keySentenceIndices` point at. */
  keySentences: Lesson['keySentences']
  /** Only the conversations this unit uses. */
  conversations: Lesson['conversations']
}

/** What a viewer without access gets. Carries no product. */
export interface LockedUnit {
  allowed: false
  decision: AccessDecision
  preview: LockedUnitPreview
}

export type UnitAccessResult = UnlockedUnit | LockedUnit | { allowed: false; decision: AccessDecision; preview: null }

function toPreview(unit: Unit): LockedUnitPreview {
  // Built field by field on purpose. Spreading `unit` and deleting keys would
  // start leaking the day someone adds a field to `Unit`.
  return {
    ref: unit.ref,
    key: unit.key,
    title: unit.title,
    titleEn: unit.titleEn,
    goal: unit.goal,
    wordCount: unit.wordIds.length,
    carriesExam: unit.carriesExam,
    locked: true,
  }
}

// ── The gate ────────────────────────────────────────────────────────────────

/**
 * THE FUNCTION THE ROUTING AGENT CALLS.
 *
 * Resolve one unit for whoever is making the current request. Reads the
 * session itself, so the caller cannot pass in a user id and get it wrong.
 *
 *     import { getUnitForViewer } from '@/lib/entitlement'
 *
 *     export default async function UnitPage({ params }) {
 *       const { level, lesson, unit } = await params
 *       const result = await getUnitForViewer({
 *         level: Number(level), lesson: Number(lesson), unit: Number(unit),
 *       })
 *       if (!result.allowed) return <Paywall decision={result.decision} preview={result.preview} />
 *       return <UnitPlayer unit={result.unit} words={result.words} />
 *     }
 *
 * The `allowed: false` branch has no words in it. That is the whole point:
 * the paywall screen cannot leak the lesson because it was never handed one.
 */
export async function getUnitForViewer(ref: {
  level: number
  lesson: number
  unit: number
}): Promise<UnitAccessResult> {
  const { entitlement, policy } = await getAccessContext()

  if (!isLevelNo(ref.level)) {
    return {
      allowed: false,
      decision: { allowed: false, reason: 'not-found', entitlement },
      preview: null,
    }
  }
  const typed: UnitRef = { level: ref.level, lesson: ref.lesson, unit: ref.unit }

  // Decide BEFORE loading anything. An unentitled request for an HSK3 unit
  // never even reads the HSK3 vocabulary file into this process's response.
  const decision = decideUnitAccess(typed, policy, entitlement)

  const units = await loadUnits()
  const unit = units.find((u) => u.key === unitKey(typed))
  if (!unit) {
    return {
      allowed: false,
      decision: { allowed: false, reason: 'not-found', entitlement },
      preview: null,
    }
  }

  if (!decision.allowed) {
    return { allowed: false, decision, preview: toPreview(unit) }
  }

  const [vocab, grammar, lessons] = await Promise.all([
    loadVocabulary(typed.level),
    loadGrammar(typed.level),
    loadLessons(typed.level),
  ])

  const wordSet = new Set(unit.wordIds)
  const grammarSet = new Set(unit.grammarIds)
  const lesson = lessons.find((l) => l.id === typed.lesson)
  const conversationIds = new Set(unit.conversationIds.map(String))

  return {
    allowed: true,
    decision,
    unit,
    // Preserve the unit's own ordering rather than the corpus's.
    words: unit.wordIds
      .map((id) => vocab.find((w) => w.id === id))
      .filter((w): w is VocabWord => Boolean(w) && wordSet.has(w!.id)),
    grammar: grammar.filter((g) => grammarSet.has(g.id)),
    keySentences: (lesson?.keySentences ?? []).filter((_, i) =>
      unit.keySentenceIndices.includes(i),
    ),
    conversations: (lesson?.conversations ?? []).filter((c) =>
      conversationIds.has(String(c.id)),
    ),
  }
}

/**
 * The learning path for one level: every unit, but paid ones reduced to a
 * preview. Safe to serialise straight into a Server Component's props.
 *
 * For a non-subscriber asking for level 2 or 3 this returns 34 or 88 previews
 * and zero words.
 */
export async function getLevelPathForViewer(level: number): Promise<{
  level: number
  entitled: boolean
  units: (Unit | LockedUnitPreview)[]
  freeUnitCount: number
}> {
  const { entitlement, policy } = await getAccessContext()
  if (!isLevelNo(level)) {
    return { level, entitled: entitlement.isEntitled, units: [], freeUnitCount: 0 }
  }

  const all = (await loadUnits()).filter((u) => u.ref.level === level)
  let freeUnitCount = 0

  const units = all.map((u) => {
    const free = isUnitFree(u.ref, policy)
    if (free) freeUnitCount += 1
    return free || entitlement.isEntitled ? u : toPreview(u)
  })

  return { level, entitled: entitlement.isEntitled, units, freeUnitCount }
}

/**
 * Vocabulary for a level, filtered to what the viewer may actually see.
 *
 * This is the replacement for reaching into `LEVEL_BUNDLES[level].vocabulary`
 * from client code. A non-subscriber asking for level 3 gets `[]`.
 */
export async function getVocabularyForViewer(level: number): Promise<{
  level: number
  entitled: boolean
  words: VocabWord[]
  /** How many words exist behind the paywall. A number, not the words. */
  lockedCount: number
}> {
  const { entitlement, policy } = await getAccessContext()
  if (!isLevelNo(level)) {
    return { level, entitled: entitlement.isEntitled, words: [], lockedCount: 0 }
  }

  const vocab = await loadVocabulary(level)
  if (entitlement.isEntitled) {
    return { level, entitled: true, words: vocab, lockedCount: 0 }
  }

  const units = (await loadUnits()).filter((u) => u.ref.level === level)
  const openIds = new Set<number>()
  for (const u of units) {
    if (isUnitFree(u.ref, policy)) for (const id of u.wordIds) openIds.add(id)
  }

  const words = vocab.filter((w) => openIds.has(w.id))
  return {
    level,
    entitled: false,
    words,
    lockedCount: Math.max(vocab.length - words.length, 0),
  }
}

/**
 * The level's SUPPORTING material — stories, picture dictionary, daily
 * questions, grammar — filtered to what the viewer may see.
 *
 * ── The bug this replaces ───────────────────────────────────────────────────
 *
 * `GET /api/content/[level]` used to compute these four as all-or-nothing on
 * `entitled`: a subscriber got everything, everyone else got four empty arrays.
 * The vocabulary beside them was NOT all-or-nothing — the free lessons' words
 * came through — so the free tier ended up in a state nobody designed: 30 real
 * HSK2 words, and then a stories screen, a picture dictionary and a daily-
 * questions screen that were simply blank. The owner reported it exactly as it
 * looks from outside — «المحتوى اختفى ... وان وجد يكون ناقص» — and they were
 * right. A trial that opens six sections and fills one is not a trial; it reads
 * as a broken product, which is the most expensive thing a shop window can do.
 *
 * ── Why a proportional slice, and not "everything whose characters are taught"
 *
 * The obvious rule — an item is free when every character in it has been taught
 * — was measured first, and it returns ZERO stories at every level and zero
 * daily questions. Not because the rule is wrong, but because the authored
 * stories and questions lean heavily on untaught characters. That is a real
 * content defect and it is tracked separately as the prerequisite linter; it
 * must not also be allowed to decide what the free tier contains, or a content
 * bug silently becomes a pricing policy.
 *
 * So the slice is positional: the free lessons are `freeLessonCount` of the
 * level's lessons, and the viewer gets that same fraction of each supporting
 * collection, taken from the front — these files are authored in lesson order —
 * with a floor of one item so no section is ever empty when the collection is
 * not. Grammar is the exception and is exact rather than proportional, because
 * the free units name their own `grammarIds` and there is no need to guess.
 *
 * What is withheld is reported as a COUNT, never as the items.
 */
export async function getLevelExtrasForViewer(level: number): Promise<{
  entitled: boolean
  grammar: GrammarRule[]
  /** Applied to a collection's length. `null` = no limit (subscriber). */
  storyLimit: ((total: number) => number) | null
  pictureLimit: ((total: number) => number) | null
  qaLimit: ((total: number) => number) | null
}> {
  const { entitlement, policy } = await getAccessContext()
  if (!isLevelNo(level)) {
    const none = () => 0
    return { entitled: false, grammar: [], storyLimit: none, pictureLimit: none, qaLimit: none }
  }

  const grammar = await loadGrammar(level)
  if (entitlement.isEntitled) {
    // `null` means "no limit" — distinct from 0, which means "nothing".
    return { entitled: true, grammar, storyLimit: null, pictureLimit: null, qaLimit: null }
  }

  const units = (await loadUnits()).filter((u) => u.ref.level === level)
  const lessonCount = new Set(units.map((u) => u.ref.lesson)).size || 1
  const freeLessons = Math.min(policy.freeLessonCount, lessonCount)

  const grammarIds = new Set<number>()
  for (const u of units) {
    if (isUnitFree(u.ref, policy)) for (const id of u.grammarIds) grammarIds.add(id)
  }

  const fraction = freeLessons / lessonCount
  const limit = (total: number) => (total === 0 ? 0 : Math.max(1, Math.ceil(total * fraction)))

  return {
    entitled: false,
    grammar: grammar.filter((g) => grammarIds.has(g.id)),
    storyLimit: limit,
    pictureLimit: limit,
    qaLimit: limit,
  }
}

/**
 * A single lesson's shell — used by a lesson index page. Locked lessons come
 * back with their title only, so the path still renders.
 */
export async function getLessonForViewer(
  level: number,
  lessonNo: number,
): Promise<
  | { allowed: true; decision: AccessDecision; lesson: Lesson }
  | { allowed: false; decision: AccessDecision; title: string | null }
> {
  const { entitlement, policy } = await getAccessContext()
  const decision = decideLessonAccess(level, lessonNo, policy, entitlement)

  if (!isLevelNo(level)) {
    return { allowed: false, decision, title: null }
  }
  const lessons = await loadLessons(level)
  const lesson = lessons.find((l) => l.id === lessonNo) ?? null

  if (!lesson) {
    return {
      allowed: false,
      decision: { allowed: false, reason: 'not-found', entitlement },
      title: null,
    }
  }
  if (!decision.allowed) return { allowed: false, decision, title: lesson.title }
  return { allowed: true, decision, lesson }
}

/**
 * Cheap yes/no for a route guard, when the caller does not need the payload.
 * Use this in `middleware`-adjacent checks and in `layout.tsx` redirects.
 */
export async function canViewUnit(ref: {
  level: number
  lesson: number
  unit: number
}): Promise<AccessDecision> {
  const { entitlement, policy } = await getAccessContext()
  if (!isLevelNo(ref.level)) {
    return { allowed: false, reason: 'not-found', entitlement }
  }
  return decideUnitAccess(
    { level: ref.level, lesson: ref.lesson, unit: ref.unit },
    policy,
    entitlement,
  )
}
