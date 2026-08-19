// Session refresh for Next.js middleware.
//
// The routing agent owns the root `middleware.ts`; this is the piece it calls.
// Minimal wiring:
//
//   // middleware.ts
//   import { updateSession } from '@/lib/supabase/middleware'
//   export async function middleware(request: NextRequest) {
//     return (await updateSession(request)).response
//   }
//   export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'] }
//
// Two constraints that are easy to get wrong and expensive to debug:
//   1. Return the SAME response object this helper produced. Building a fresh
//      NextResponse throws away the refreshed auth cookies and signs the user
//      out on the next navigation.
//   2. Do not run any logic between creating the client and calling getUser().

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env'
import type { User } from '@supabase/supabase-js'

export interface SessionResult {
  response: NextResponse
  user: User | null
}

export async function updateSession(request: NextRequest): Promise<SessionResult> {
  let response = NextResponse.next({ request })

  // Before Supabase is wired up the app must still serve pages.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { response, user: null }

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
