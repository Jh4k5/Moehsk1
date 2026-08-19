import 'server-only'

// Service-role client. BYPASSES ROW LEVEL SECURITY.
//
// Use it only where the request has already been authorised in application
// code, and never to read a row on behalf of a user without checking that the
// user owns it. Everything a learner touches should go through ./server.ts so
// the database enforces ownership rather than this file's caller remembering to.
//
// Legitimate uses in this codebase:
//   * reading app_config including private keys (config layer cache)
//   * resolving entitlement for a user id the route already authenticated
//   * payment webhooks, which arrive with no session at all
//   * the one-time admin bootstrap

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { SUPABASE_URL, requireServiceRoleKey } from './env'

let cached: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createAdminClient() {
  if (cached) return cached
  if (!SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  cached = createSupabaseClient<Database>(SUPABASE_URL, requireServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cached
}
