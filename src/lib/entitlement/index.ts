import 'server-only'

// The entitlement layer's public surface.
//
// `server-only` sits here as well as on the individual modules so that the
// convenient barrel import cannot become the accidental route into client
// code. If you need the free-tier RULE in a Client Component — to grey out a
// card, say — import `@/lib/entitlement/policy` directly: that file is pure
// and carries no content and no database access. Never import this barrel.

export {
  checkEntitlement,
  getViewerEntitlement,
  getFreeAccessPolicy,
  getAccessContext,
} from './check'

export {
  getUnitForViewer,
  getLevelPathForViewer,
  getVocabularyForViewer,
  getLessonForViewer,
  canViewUnit,
  type UnitAccessResult,
  type UnlockedUnit,
  type LockedUnit,
} from './gate'

export {
  isPrimer,
  isUnitFree,
  isLessonFree,
  levelHasFreeContent,
  decideUnitAccess,
  decideLessonAccess,
  ACCESS_REASON_AR,
} from './policy'

export {
  anonymousEntitlement,
  EntitlementError,
  type Entitlement,
  type AccessDecision,
  type AccessReason,
  type FreeAccessPolicy,
  type LockedUnitPreview,
} from './types'
