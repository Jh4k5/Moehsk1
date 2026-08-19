import 'server-only'

// Request-scoped Supabase client for Server Components, Route Handlers and
// Server Actions. It reads the session from cookies, so every query it makes
// runs as the signed-in user and is subject to RLS.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'
import { requirePublicEnv } from './env'

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = requirePublicEnv()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // middleware.ts refreshes the session instead - see ./middleware.ts.
        }
      },
    },
  })
}
