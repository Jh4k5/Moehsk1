import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, ForbiddenError, UnauthorizedError } from '@/lib/supabase/auth'
import type { Json } from '@/lib/supabase/database.types'

// ─── POST /api/admin/config ─────────────────────────────────────────────────
//
// The price, and every other owner-editable setting.
//
// The write goes through `admin_set_config`, a SECURITY DEFINER function that
// checks `is_admin()` in SQL. So authorisation is enforced by the database, not
// by this route remembering to — and a second caller added later inherits the
// rule instead of having to re-implement it.
//
// It runs on the USER'S client, not the service-role one. The service role
// bypasses row-level security entirely; using it here would mean the only thing
// standing between any signed-in learner and the price of the product is the
// `requireAdmin()` call above.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (error) {
    const status = error instanceof UnauthorizedError || error instanceof ForbiddenError ? error.status : 500
    return NextResponse.json({ ok: false, error: 'غير مصرّح' }, { status })
  }

  let entries: unknown
  try {
    entries = (await request.json())?.entries
  } catch {
    return NextResponse.json({ ok: false, error: 'طلب غير صالح' }, { status: 400 })
  }
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
    return NextResponse.json({ ok: false, error: 'لا تغييرات' }, { status: 400 })
  }
  const keys = Object.keys(entries as Record<string, Json>)
  if (keys.length === 0) {
    return NextResponse.json({ ok: false, error: 'لا تغييرات' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_set_config', { entries: entries as Json })
  if (error) {
    console.error('[admin/config] save failed:', error.message)
    return NextResponse.json({ ok: false, error: 'تعذّر الحفظ' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, saved: keys.length, rows: data })
}
