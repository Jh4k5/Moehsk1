'use client'
import { useLearningStore } from '@/lib/store'
import DashboardSection from '@/features/dashboard/DashboardSection'
import OnboardingScreen from '@/components/OnboardingScreen'

// Onboarding used to be a wall in front of the entire app: the root component
// returned `<OnboardingScreen/>` whenever `profile` was null, so every route,
// including the ones a crawler reads, resolved to a name prompt.
//
// It is a first-run home screen now. `/path`, `/library` and the marketing
// pages render without it; only this one route asks for a name, because this
// is the one route whose whole content is "how are YOU doing".
export function HomeBody() {
  const profile = useLearningStore((s) => s.profile)
  const hydrated = useLearningStore((s) => s._hasHydrated)

  // Until the persisted store is read back, neither branch is known to be
  // right. Rendering the prompt first would flash a name request at a learner
  // who named themselves months ago.
  if (!hydrated) return <div className="j-section-skeleton" aria-busy="true" />

  return profile ? <DashboardSection /> : <OnboardingScreen />
}
