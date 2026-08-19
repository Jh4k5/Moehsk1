'use client'
import { useLearningStore } from '@/lib/store'
import { useMounted } from '@/hooks/use-mounted'
import HomeSection from '@/features/home/HomeSection'
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
  const mounted = useMounted()

  // BOTH conditions, and `mounted` is not redundant.
  //
  // `_hasHydrated` alone was a hydration mismatch: zustand's persist middleware
  // reads `localStorage` synchronously while the store module loads, so the
  // flag is already TRUE on the very first client render and FALSE on the
  // server. The server sent this skeleton and the client immediately rendered
  // the dashboard in its place — a structural mismatch (React #418), which
  // makes React throw the tree away and re-render it.
  //
  // `mounted` is false on that first client render by construction, so the
  // first pass matches what the server sent, and the real screen appears one
  // render later.
  if (!mounted || !hydrated) return <div className="j-section-skeleton" aria-busy="true" />

  return profile ? <HomeSection /> : <OnboardingScreen />
}
