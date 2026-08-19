import 'server-only'

// Server-side identity. Everything that needs to know "who is asking" comes
// through here.
//
// getUser() is used rather than getSession() throughout: getSession() returns
// whatever the cookie claims without verifying it, so it is not an
// authorisation primitive.

import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from './server'
import { isSupabaseConfigured } from './env'
import type { ProfileRow } from './database.types'

/** The signed-in user, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ?? null
})

export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  return data ?? null
})

export class UnauthorizedError extends Error {
  readonly status = 401
  constructor(message = 'يلزم تسجيل الدخول') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  readonly status = 403
  constructor(message = 'هذا الإجراء يحتاج صلاحية مدير') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/** The signed-in user, or throws UnauthorizedError. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  return user
}

/** The signed-in admin's profile, or throws. */
export async function requireAdmin(): Promise<ProfileRow> {
  const profile = await getCurrentProfile()
  if (!profile) throw new UnauthorizedError()
  if (profile.role !== 'admin') throw new ForbiddenError()
  return profile
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile()
  return profile?.role === 'admin'
}
