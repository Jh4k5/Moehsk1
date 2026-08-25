import { NextResponse } from 'next/server'

// ─── GET /api/health ────────────────────────────────────────────────────────
//
// Which environment variables actually arrived — as booleans, never values.
//
// This exists because a misconfigured deployment failed silently in the worst
// possible way: the sign-in page rendered (the SERVER could see the variables
// at runtime) while the browser bundle had none (Next.js inlines every
// `NEXT_PUBLIC_*` at BUILD time). So the form looked healthy, and both Google
// and the magic link failed with messages that named nothing.
//
// The distinction below is the whole point:
//   * `server` — read at request time. True means the value is in Vercel.
//   * `browser` — inlined when the bundle was built. False while `server` is
//     true means the variables were added AFTER this deployment was built, or
//     were scoped to Preview instead of Production. The fix is a REDEPLOY, not
//     another edit.
//
// Values are never returned, only presence and length, so this is safe to
// leave in production and safe to send to anyone helping debug.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const server = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ADMIN_BOOTSTRAP_EMAILS: Boolean(process.env.ADMIN_BOOTSTRAP_EMAILS),
  }

  // Read through the same inlining the browser gets, so a mismatch between
  // this and `server` above is exactly the build-time/run-time gap.
  const inlinedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const inlinedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  return NextResponse.json(
    {
      server,
      // Enough to tell a truncated paste from a missing one, without leaking.
      supabaseUrlHost: inlinedUrl ? new URL(inlinedUrl).host : null,
      anonKeyLength: inlinedKey.length,
      anonKeyKind: inlinedKey.startsWith('sb_publishable_')
        ? 'publishable'
        : inlinedKey.startsWith('eyJ')
          ? 'legacy-jwt'
          : inlinedKey
            ? 'unrecognised'
            : 'missing',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
