import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isLocale, DEFAULT_LOCALE } from '@/lib/locale'

// ─── GET /auth/callback ─────────────────────────────────────────────────────
//
// Where Google (and the email magic link) come back to.
//
// The URL is unlocalised on purpose. It is registered with the identity
// provider and stored in their console, so it must never move — a locale prefix
// would mean re-registering it, and a middleware redirect to `/ar/auth/callback`
// would drop the `code` parameter and break every sign-in. The middleware skips
// `/auth` for exactly this reason.
//
// The language is carried in `next` instead, so the reader lands back where
// they were, in the language they were reading.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ''
  const providerError = searchParams.get('error_description') ?? searchParams.get('error')

  const locale = isLocale(searchParams.get('locale')) ? searchParams.get('locale')! : DEFAULT_LOCALE

  // The provider refused, or the reader cancelled at the consent screen. Back
  // to sign-in with the reason, not a blank page.
  if (providerError) {
    const url = new URL(`/${locale}/sign-in`, origin)
    url.searchParams.set('error', providerError)
    return NextResponse.redirect(url)
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in?error=missing_code`, origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const url = new URL(`/${locale}/sign-in`, origin)
    url.searchParams.set('error', error.message)
    return NextResponse.redirect(url)
  }

  // `next` is attacker-controllable, so only a same-site PATH is honoured —
  // never a full URL. Otherwise this endpoint is an open redirect that borrows
  // the platform's domain to send people anywhere.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : `/${locale}/home`

  // `migrated=0` tells the client that this session has just begun, so the
  // progress-migration prompt runs once rather than on every visit.
  const destination = new URL(safeNext, origin)
  destination.searchParams.set('signed_in', '1')
  return NextResponse.redirect(destination)
}
