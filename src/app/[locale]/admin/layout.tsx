import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminNav } from './AdminNav'
import { BootstrapPanel } from './BootstrapPanel'
import { getCurrentProfile } from '@/lib/supabase/auth'
import { adminBootstrapEmails, isSupabaseConfigured } from '@/lib/supabase/env'
import { isLocale, type Locale } from '@/lib/locale'

// ─── The owner's panel ──────────────────────────────────────────────────────
//
// Outside the `(app)` group: no bottom bar, no streak, no learning shell. The
// owner here is not a learner.
//
// The guard is on the SERVER and runs before anything renders. A client-side
// `if (!isAdmin) return null` would still have sent the panel's markup and its
// data-fetching code to whoever asked for the URL.
//
// It also gates on `profiles.role`, not on an email list: the list is for the
// one-time bootstrap, and leaving authorisation there would mean anyone who
// ever appeared in `ADMIN_BOOTSTRAP_EMAILS` keeps the keys forever.

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  if (!isSupabaseConfigured()) {
    return (
      <main className="j-admin j-admin-unconfigured">
        <h1>لوحة التحكم</h1>
        <p>
          لوحة التحكم تحتاج اتصالاً بقاعدة البيانات. اضبط متغيّرات Supabase في
          <code> .env.local </code> ثم أعد التشغيل — الملف <code>.env.example</code> يشرح كلّاً منها.
        </p>
        <Link href={`/${locale}`} className="j-admin-back">العودة إلى المنصة</Link>
      </main>
    )
  }

  const profile = await getCurrentProfile()
  if (!profile) redirect(`/${locale}/sign-in?next=/${locale}/admin`)

  if (profile.role !== 'admin') {
    // The one exception to the 404 below: a signed-in owner whose email is
    // already in `ADMIN_BOOTSTRAP_EMAILS` gets the activation button instead
    // of a dead end. This reveals nothing — the address had to be on the
    // server's list before we got here, and the route it calls re-checks that
    // list against the verified session email rather than trusting this page.
    const email = (profile.email ?? '').toLowerCase()
    if (email && adminBootstrapEmails().includes(email)) {
      return <BootstrapPanel email={profile.email ?? email} />
    }
    // 404, not 403: a non-admin learns nothing about whether this path exists.
    notFound()
  }

  return (
    <div className="j-admin">
      <header className="j-admin-head">
        <div>
          <h1>لوحة التحكم</h1>
          <p>{profile.email}</p>
        </div>
        <Link href={`/${locale}/home`} className="j-admin-back">المنصة ←</Link>
      </header>
      <AdminNav locale={locale} />
      <main className="j-admin-body">{children}</main>
    </div>
  )
}
