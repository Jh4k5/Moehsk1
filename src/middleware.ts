import { NextResponse, type NextRequest } from 'next/server'
import { isLocale, negotiateLocale } from '@/lib/locale'

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

/** Paths middleware must never touch: API, build output, public files. */
const SKIP =
  /^\/(?:api|_next|_vercel|brand|favicon\.ico|robots\.txt|sitemap\.xml|manifest\.webmanifest)(?:\/|$)/
/** Anything carrying a file extension is a public asset, not a page. */
const HAS_EXTENSION = /\.[a-z0-9]+$/i

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (SKIP.test(pathname) || HAS_EXTENSION.test(pathname)) return NextResponse.next()

  const first = pathname.split('/')[1]

  // Already localised. Keep the cookie in step, so the next bare-path visit —
  // a shared `/`, a bookmark — lands in the language last read in.
  if (isLocale(first)) {
    const response = NextResponse.next()
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
  response.cookies.set(COOKIE, locale, { path: '/', maxAge: COOKIE_MAX_AGE, sameSite: 'lax' })
  // `/` answers in two languages depending on the request, so a cache must vary
  // on what decided it instead of pinning the first answer for everyone.
  response.headers.set('Vary', 'Accept-Language, Cookie')
  return response
}

export const config = {
  // Mirrors SKIP; the runtime check stays because a matcher cannot express
  // "has a file extension" reliably.
  matcher: ['/((?!api|_next|_vercel|brand|.*\\.[a-z0-9]+$).*)'],
}
