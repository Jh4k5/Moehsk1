import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, ForbiddenError, UnauthorizedError } from '@/lib/supabase/auth'

// ─── POST /api/admin/codes ──────────────────────────────────────────────────
//
// Generates a batch of activation codes.
//
// These are the platform's first revenue path and the influencer arrangement in
// one mechanism: a batch carries a label and a note, so «١٠٠ كود لقناة فلان»
// stays identifiable months later, and a whole batch can be revoked at once if
// the arrangement ends.
//
// The codes themselves are minted in SQL by `admin_generate_codes`, which also
// stores them hashed-and-indexed the way `redeem_code` expects. Generating them
// here would mean two places had to agree on the format forever.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** A ceiling on one request. Ten thousand codes is a mistake, not an order. */
const MAX_BATCH = 1000

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (error) {
    const status = error instanceof UnauthorizedError || error instanceof ForbiddenError ? error.status : 500
    return NextResponse.json({ ok: false, error: 'غير مصرّح' }, { status })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: 'طلب غير صالح' }, { status: 400 })
  }

  const quantity = Number(body.quantity ?? 0)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_BATCH) {
    return NextResponse.json({ ok: false, error: `العدد بين ١ و${MAX_BATCH}` }, { status: 400 })
  }

  const kind = body.kind === 'lifetime' || body.kind === 'trial' ? body.kind : 'subscription'
  const days = kind === 'lifetime' ? null : Math.max(1, Number(body.days ?? 30))

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_generate_codes', {
    quantity,
    code_kind: kind,
    days,
    uses_per_code: Math.max(1, Number(body.usesPerCode ?? 1)),
    expires: typeof body.expiresAt === 'string' && body.expiresAt ? body.expiresAt : null,
    code_note: typeof body.note === 'string' && body.note ? body.note : null,
    label: typeof body.batchLabel === 'string' && body.batchLabel ? body.batchLabel : null,
    code_prefix: typeof body.prefix === 'string' && body.prefix ? body.prefix.toUpperCase() : 'JISR',
  })

  if (error) {
    console.error('[admin/codes] generate failed:', error.message)
    return NextResponse.json({ ok: false, error: 'تعذّر توليد الأكواد' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, codes: data })
}
