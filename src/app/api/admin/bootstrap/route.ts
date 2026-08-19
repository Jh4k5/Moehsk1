import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, UnauthorizedError } from '@/lib/supabase/auth'
import { adminBootstrapEmails } from '@/lib/supabase/env'

// ─── POST /api/admin/bootstrap ──────────────────────────────────────────────
//
// The first admin. A chicken-and-egg problem: `admin_set_config` requires an
// admin, and no admin exists until someone is made one.
//
// The door opens for an email listed in `ADMIN_BOOTSTRAP_EMAILS`, once. After
// that, admin is a value in `profiles.role` and this route is not how it is
// granted — which is why the env var should be cleared afterwards, and why
// authorisation everywhere else reads the column and not this list. Leaving
// authorisation on an env list would mean anyone who ever appeared in it keeps
// the keys forever, including after they are removed.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  let user
  try {
    user = await requireUser()
  } catch (error) {
    const status = error instanceof UnauthorizedError ? error.status : 500
    return NextResponse.json({ ok: false, error: 'يلزم تسجيل الدخول' }, { status })
  }

  const allowed = adminBootstrapEmails()
  if (allowed.length === 0) {
    return NextResponse.json({ ok: false, error: 'التهيئة الأولى مغلقة.' }, { status: 403 })
  }

  const email = (user.email ?? '').toLowerCase()
  // The check is on the VERIFIED session email, not on anything the caller
  // sends — a body-supplied address would make this route grant admin to
  // whoever asks for it.
  if (!email || !allowed.includes(email)) {
    return NextResponse.json({ ok: false, error: 'هذا البريد غير مُدرَج.' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('bootstrap_admin', { target_email: email })
  if (error) {
    console.error('[admin/bootstrap] failed:', error.message)
    return NextResponse.json({ ok: false, error: 'تعذّرت الترقية.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, profile: data })
}
