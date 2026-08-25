import { NextResponse } from 'next/server'
import { getAccessContext } from '@/lib/entitlement'
import { getCurrentUser } from '@/lib/supabase/auth'

// ─── GET /api/entitlement ───────────────────────────────────────────────────
//
// The ONE answer to "what may this browser open". It exists because the
// question used to be answered in the browser, by a string:
//
//     localStorage.getItem('pw_ok') === '1'   →   isPaid: true
//
// Anyone who opened devtools and typed one line unlocked the entire paid
// product, and every anonymous visitor was handed a 24-hour trial that no
// account and no record backed. The paid tier was decoration.
//
// Now the browser asks and the server answers, from `subscriptions` in
// Postgres, behind RLS. `checkEntitlement` fails CLOSED — an outage locks
// paid content rather than opening it — so a broken database costs a
// subscriber their access for a minute, and never costs the owner a sale.
//
// What is returned is deliberately a VERDICT plus the RULE, not content: the
// numbers here let the UI draw the right lock without a second round trip,
// and `/api/content/[level]` still decides independently what words may
// actually cross. Two gates, same source of truth.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  const { entitlement, policy } = await getAccessContext()

  return NextResponse.json(
    {
      signedIn: Boolean(user),
      isEntitled: entitlement.isEntitled,
      isLifetime: entitlement.isLifetime,
      activeUntil: entitlement.activeUntil,
      source: entitlement.source,
      // The free rule, so the client draws locks that match the server's.
      policy: {
        freePrimer: policy.freePrimer,
        freeLessonCount: policy.freeLessonCount,
        freeLevels: policy.freeLevels,
      },
    },
    {
      // Private and uncached: this is per-user and changes the moment a code
      // is redeemed. A shared cache here would hand one learner another's
      // entitlement.
      headers: { 'Cache-Control': 'private, no-store' },
    },
  )
}
