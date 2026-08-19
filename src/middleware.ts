import { NextResponse, type NextRequest } from 'next/server'
import { isLocale, negotiateLocale } from '@/lib/locale'
import { updateSession } from '@/lib/supabase/middleware'

// ─── Locale negotiation ─────────────────────────────────────────────────────
// Every page lives under `/ar/...` or `/en/...`. A request that names no locale
// — `/`, `/home`, `/hsk/1` — is redirected to one, so there is never a URL that
// serves content in a language its path does not declare. Serving both from one
// URL, decided after paint, is what made the English site unindexable.
//
// Precedence: an explicit past choice (the `NEXT_LOCALE` cookie, written below)
// beats `Accept-Language`, which beats Arabic as the default.
//
// The file sits in `src/` rather than the repository root because that is where
// Next reads it from in a `src/app` project; at the root it is silently ignored.

const COOKIE = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/**
 * Paths middleware must never LOCALISE: build output, public files, and the
 * OAuth callback — whose URL the identity provider holds, so redirecting it to
 * `/ar/auth/callback` would break every sign-in.
 *
 * `/api` is here too: an API route has no language, and redirecting a webhook
 * POST to `/ar/api/...` would drop its body.
 */
const SKIP =
  /^\/(?:api|auth|_next|_vercel|brand|favicon\.ico|robots\.txt|sitemap\.xml|manifest\.webmanifest)(?:\/|$)/
/** Anything carrying a file extension is a public asset, not a page. */
const HAS_EXTENSION = /\.[a-z0-9]+$/i

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // ── Session first, on every request that is not an asset ──
  //
  // Supabase access tokens are short-lived, and the refreshed pair comes back
  // as Set-Cookie on THIS response. So the response object the session helper
  // built has to be the one that is returned — building a fresh `NextResponse`
  // afterwards discards the new cookies and signs the reader out on their next
  // navigation, intermittently, which is close to undebuggable from a report.
  //
  // Before Supabase is configured this is a no-op that returns a plain
  // `NextResponse.next()`, so the platform runs unauthenticated exactly as it
  // did before.
  if (SKIP.test(pathname) || HAS_EXTENSION.test(pathname)) return NextResponse.next()

  const { response: sessionResponse } = await updateSession(request)

  const first = pathname.split('/')[1]

  // Already localised. Keep the cookie in step, so the next bare-path visit —
  // a shared `/`, a bookmark — lands in the language last read in.
  if (isLocale(first)) {
    const response = sessionResponse
    if (request.cookies.get(COOKIE)?.value !== first) {
      response.cookies.set(COOKIE, first, { path: '/', maxAge: COOKIE_MAX_AGE, sameSite: 'lax' })
    }
    return response
  }

  const cookie = request.cookies.get(COOKIE)?.value
  const locale = isLocale(cookie)
    ? cookie
    : negotiateLocale(request.headers.get('accept-language'))

  // A redirect, not a rewrite: the localised URL is the canonical one, and a
  // crawler landing on `/` has to be told where the real page lives.
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  url.search = search

  const response = NextResponse.redirect(url)
  // Carry over any refreshed auth cookies onto the redirect, or a reader whose
  // token expired on a bare-path visit is signed out by the redirect itself.
  for (const cookie of sessionResponse.cookies.getAll()) response.cookies.set(cookie)
  response.cookies.set(COOKIE, locale, { path: '/', maxAge: COOKIE_MAX_AGE, sameSite: 'lax' })
  // `/` answers in two languages depending on the request, so a cache must vary
  // on what decided it instead of pinning the first answer for everyone.
  response.headers.set('Vary', 'Accept-Language, Cookie')
  return response
}

export const config = {
  // Mirrors SKIP; the runtime check stays because a matcher cannot express
  // "has a file extension" reliably.
  matcher: ['/((?!api|auth|_next|_vercel|brand|.*\\.[a-z0-9]+$).*)'],
}
