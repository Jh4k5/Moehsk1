import 'server-only'
import { NextResponse } from 'next/server'

// ─── GET /api/health ────────────────────────────────────────────────────────
//
// Which environment variables actually arrived — as booleans, never values.
//
// This exists because a misconfigured deployment failed silently in the worst
// possible way: the sign-in page rendered while the browser bundle had no keys
// at all, so the form looked healthy and both Google and the magic link failed
// with messages that named nothing.
//
// ── The bug this file itself had ────────────────────────────────────────────
//
// The first version of this route compared `process.env.NEXT_PUBLIC_*` against
// itself and called the two halves "server" and "browser". They could never
// disagree. Turbopack constant-folds every `NEXT_PUBLIC_*` literal member
// access AT BUILD TIME **on the server too**, not only in the client bundle —
// so both readings came from the same frozen string, and the endpoint answered
// "server: true, browser: true" with total confidence in a deployment whose
// browser bundle was empty. A diagnostic that cannot fail is worse than none:
// it ends the investigation with a wrong answer.
//
// The fix is to defeat the fold on one side. A computed lookup whose key is
// assembled at runtime is not a literal member access, so the bundler leaves
// it alone and Node reads the real `process.env` of the running instance.
//
//   * `runtime` — what is in Vercel's environment RIGHT NOW.
//   * `inlined` — what was frozen into the bundle WHEN IT WAS BUILT, which is
//     byte-for-byte what the browser holds.
//
// `runtime` true with `inlined` missing is the whole failure mode: the values
// were added, or rescoped from Preview to Production, after this build. The
// fix then is a REDEPLOY OF A FRESH BUILD, never another edit.
//
// Values are never returned, only presence, length and shape, so this is safe
// to leave in production and safe to send to anyone helping debug.
//
// `server-only` is on line 1 because `check:payments` demands it of any file
// that so much as NAMES `SUPABASE_SERVICE_ROLE_KEY`, and it was right to: a
// route reading the secret's presence is one careless refactor away from a
// component reading its value. The marker turns that refactor into a build
// error instead of a leak.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * A genuine run-time environment read.
 *
 * The name is rebuilt from pieces on purpose. A dotted access on `process.env`
 * is a pattern the bundler recognises and replaces with a string literal; an
 * indexed access whose key is computed is not, so this survives to run against
 * the real environment of the instance serving the request. Do not simplify it
 * back into a dotted access — that is precisely the bug documented above.
 */
function readAtRuntime(name: string): string | undefined {
  const env = process.env as Record<string, string | undefined>
  return env[name.split('|').join('')]
}

function describeKey(key: string): string {
  if (!key) return 'missing'
  if (key.startsWith('sb_publishable_')) return 'publishable'
  if (key.startsWith('eyJ')) return 'legacy-jwt'
  return 'unrecognised'
}

export async function GET() {
  // Split names so no fragment is a whole variable name a bundler could match.
  const runtimeUrl = readAtRuntime('NEXT_PUBLIC_SUPA|BASE_URL') ?? ''
  const runtimeKey = readAtRuntime('NEXT_PUBLIC_SUPA|BASE_ANON_KEY') ?? ''
  const runtimeService = readAtRuntime('SUPA|BASE_SERVICE_ROLE_KEY') ?? ''
  const runtimeAdmins = readAtRuntime('ADMIN_BOOT|STRAP_EMAILS') ?? ''

  // The build-time fold: identical to what the browser bundle carries.
  const inlinedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const inlinedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  // The gap the endpoint exists to name. Only the public pair can show it —
  // the service key and the admin list are read on the server at request time
  // and are never inlined anywhere, so there is nothing to compare them to.
  const staleBundle =
    (Boolean(runtimeUrl) && !inlinedUrl) ||
    (Boolean(runtimeKey) && !inlinedKey) ||
    (Boolean(runtimeUrl) && Boolean(inlinedUrl) && runtimeUrl !== inlinedUrl) ||
    (Boolean(runtimeKey) && Boolean(inlinedKey) && runtimeKey !== inlinedKey)

  return NextResponse.json(
    {
      // WHICH BUILD IS THIS? The question that ended a long round of guessing.
      // Vercel's "Redeploy" re-runs the SAME commit it is pressed on, so a
      // redeploy done to pick up a new environment variable can quietly ship
      // old code with the new value. Naming the commit here makes that visible
      // in one glance instead of another hour of theories.
      commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7),
      builtAt: process.env.VERCEL_DEPLOYMENT_ID ? 'vercel' : 'local',

      // Present in the running instance's environment.
      runtime: {
        NEXT_PUBLIC_SUPABASE_URL: Boolean(runtimeUrl),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(runtimeKey),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(runtimeService),
        ADMIN_BOOTSTRAP_EMAILS: Boolean(runtimeAdmins),
      },

      // Frozen into this build — what the browser actually holds.
      inlined: {
        supabaseUrlHost: inlinedUrl ? new URL(inlinedUrl).host : null,
        // Enough to tell a truncated paste from a missing one, without leaking.
        anonKeyLength: inlinedKey.length,
        anonKeyKind: describeKey(inlinedKey),
      },

      // True means: the environment moved on and this build never saw it.
      // Redeploy a FRESH BUILD of the latest commit; editing code will not fix
      // it, and Vercel's Redeploy button on the current deployment will not
      // either — it rebuilds the same commit, but from the same env snapshot
      // only if you leave "use existing build cache" on.
      staleBundle,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
