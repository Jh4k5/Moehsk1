// Environment access for the Supabase layer.
//
// Two rules this file exists to enforce:
//   1. The service-role key is read through a function that throws on the
//      client, so it can never be bundled into browser JavaScript by accident.
//   2. A missing variable fails loudly at the call site with the variable's
//      name, instead of producing an "Invalid API key" three layers down.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** True when the public Supabase variables are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export function requirePublicEnv(): { url: string; anonKey: string } {
  if (!SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!SUPABASE_ANON_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY }
}

export function requireServiceRoleKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must never be read in the browser')
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return key
}

/** Emails allowed to self-promote through POST /api/admin/bootstrap, once. */
export function adminBootstrapEmails(): string[] {
  return (process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}
