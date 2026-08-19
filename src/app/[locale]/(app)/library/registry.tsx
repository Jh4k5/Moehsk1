'use client'
// ─── The one place a library slug becomes a component ───────────────────────
//
// Fifteen free sections, each reachable at `/{locale}/library/{slug}`. The
// slugs are not written here: they are derived from `nav-model`, so the nav,
// the library grid and this switch can never drift apart. Adding a section to
// NAV and forgetting this file is a TYPE ERROR, not a blank page — `Record<
// Section, …>` requires an entry for every member of the union.

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { Section } from '@/components/nav/nav-model'

// Loaded on demand. The library is the optional half of the platform, so its
// fifteen sections have no business inflating the bundle of the mandatory path.
const load = <P,>(importer: () => Promise<{ default: ComponentType<P> }>) =>
  dynamic(importer, { ssr: false, loading: () => <SectionSkeleton /> })

function SectionSkeleton() {
  return (
    <div className="j-section-skeleton" aria-busy="true" aria-live="polite">
      <span className="sr-only">…</span>
    </div>
  )
}

type LibrarySection = Exclude<Section, 'dashboard' | 'lessons' | 'vocabulary'>

export const LIBRARY_COMPONENTS: Record<LibrarySection, ComponentType> = {
  grammar:       load(() => import('@/features/grammar/GrammarSection')),
  sentences:     load(() => import('@/features/sentences/SentencesSection')),
  stories:       load(() => import('@/features/stories/StoriesSection')),
  conversations: load(() => import('@/components/ConversationsSection')),
  practice:      load(() => import('@/features/practice/PracticeSection')),
  games:         load(() => import('@/features/games/GamesSection')),
  exam:          load(() => import('@/components/ExamSimulator')),
  qa:            load(() => import('@/components/QASection')),
  'visual-dict': load(() => import('@/components/VisualDictionary')),
  pinyin:        load(() => import('@/components/PinyinHub')),
  hanzi:         load(() => import('@/components/HanziSection')),
  pronunciation: load(() => import('@/components/PronunciationPractice')),
  roadmap:       load(() => import('@/features/roadmap/RoadmapSection')),
  achievements:  load(() => import('@/components/AchievementsSection')),
  chat:          load(() => import('@/features/chat/ChatSection')),
  settings:      load(() => import('@/components/SettingsSection')),
}
