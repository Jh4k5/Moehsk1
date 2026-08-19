import 'server-only'

// checkEntitlement — the single server-side answer to "may this person have
// the paid product?".
//
// WHAT REPLACED WHAT. Entitlement used to be `localStorage.pw_ok === '1'`,
// which any visitor could set from the console in about four seconds. Nothing
// in this module reads the browser. The answer comes from
// `public.get_entitlement(uid)` in Postgres, which is also what a future edge
// function or a SQL report would call, so there is exactly one definition of
// "entitled" in the system.
//
// THREE RULES THIS FILE ENFORCES
//   1. `server-only`. Importing this from a Client Component is a build error,
//      not a runtime surprise.
//   2. FAIL CLOSED. Every error path — Supabase unconfigured, network down,
//      malformed RPC result — returns "not entitled". An outage must lock the
//      paid content, never unlock it.
//   3. The user id is never taken from the request body. Callers pass an id
//      the route has already authenticated, or use `getViewerEntitlement()`,
//      which reads it from the verified session.

import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getAppConfig } from '@/lib/config/server'
import type { EntitlementRow } from '@/lib/supabase/database.types'
import { anonymousEntitlement, type Entitlement, type FreeAccessPolicy } from './types'

/**
 * Resolve entitlement for a user id.
 *
 * Pass an id you have already authenticated. Passing null/undefined yields the
 * anonymous (not entitled) answer rather than throwing, so callers that handle
 * both signed-in and anonymous visitors stay branch-free.
 *
 * Memoised per request: a page that gates twelve units still makes one call.
 */
export const checkEntitlement = cache(
  async (userId: string | null | undefined): Promise<Entitlement> => {
    if (!userId) return anonymousEntitlement(null)
    if (!isSupabaseConfigured()) return anonymousEntitlement(userId)

    try {
      const admin = createAdminClient()
      const { data, error } = await admin.rpc('get_entitlement', { uid: userId })

      if (error) {
        // Fail closed and say so loudly — a silent false here looks exactly
        // like an honest non-subscriber and would be impossible to debug.
        console.error('[entitlement] get_entitlement failed:', error.message)
        return anonymousEntitlement(userId)
      }

      // The function is `returns table (...)`, so PostgREST hands back an
      // array of one row. Anything else is treated as "not entitled".
      const row: EntitlementRow | undefined = Array.isArray(data)
        ? (data[0] as EntitlementRow | undefined)
        : undefined
      if (!row) return anonymousEntitlement(userId)

      return {
        userId,
        isEntitled: row.is_entitled === true,
        isLifetime: row.is_lifetime === true,
        activeUntil: row.active_until ?? null,
        source: row.source ?? null,
        plan: row.plan ?? null,
        status: row.status ?? null,
      }
    } catch (err) {
      console.error('[entitlement] unavailable:', (err as Error).message)
      return anonymousEntitlement(userId)
    }
  },
)

/** Entitlement of whoever is making the current request. */
export const getViewerEntitlement = cache(async (): Promise<Entitlement> => {
  const user = await getCurrentUser()
  return checkEntitlement(user?.id ?? null)
})

/** The free-tier rule as configured right now. */
export const getFreeAccessPolicy = cache(async (): Promise<FreeAccessPolicy> => {
  const config = await getAppConfig()
  return {
    freePrimer: config.access.freePrimer,
    freeLessonCount: config.access.freeLessonCount,
    freeLevels: config.access.freeLevels,
  }
})

/**
 * Everything a gate needs, in one round trip.
 * Both halves are individually memoised, so calling this repeatedly is free.
 */
export async function getAccessContext(): Promise<{
  entitlement: Entitlement
  policy: FreeAccessPolicy
}> {
  const [entitlement, policy] = await Promise.all([
    getViewerEntitlement(),
    getFreeAccessPolicy(),
  ])
  return { entitlement, policy }
}
