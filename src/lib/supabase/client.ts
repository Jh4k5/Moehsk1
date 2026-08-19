'use client'

// Browser Supabase client. Carries only the publishable anon key; every
// privileged operation goes through an API route, never from here.

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { requirePublicEnv } from './env'

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (cached) return cached
  const { url, anonKey } = requirePublicEnv()
  cached = createBrowserClient<Database>(url, anonKey)
  return cached
}
