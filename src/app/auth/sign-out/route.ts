import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isLocale, DEFAULT_LOCALE } from '@/lib/locale'

// ─── POST /auth/sign-out ────────────────────────────────────────────────────
//
// POST, not GET. A GET sign-out is triggered by anything that fetches a URL —
// a link prefetch, an email scanner, an image tag on another site — so a reader
// gets logged out by visiting a page that merely mentions the link.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const form = await request.formData().catch(() => null)
  const raw = form?.get('locale')
  const locale = isLocale(typeof raw === 'string' ? raw : null) ? String(raw) : DEFAULT_LOCALE

  return NextResponse.redirect(new URL(`/${locale}`, request.nextUrl.origin), { status: 303 })
}
