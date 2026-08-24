import Link from 'next/link'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { makeT, type Locale } from '@/lib/locale'

// ─── The account strip on /me ───────────────────────────────────────────────
//
// Before this existed, the platform had a complete authentication system that
// no user could reach or leave: `/sign-in` was linked from exactly one place —
// an admin redirect — and `POST /auth/sign-out` was referenced by nothing at
// all. A learner could not create the account that code redemption, payment
// and cross-device sync all require, and anyone who did sign in could never
// sign out, which on a shared device leaks their learning history.
//
// A server component on purpose: it reads the verified session directly, so
// the signed-in state is correct in the first paint rather than flickering
// from "signed out" after hydration.
//
// Sign-out is a real <form method="post">, not a fetch. The route is POST-only
// (a GET sign-out fires on any prefetch or link scan), and a plain form keeps
// this component free of client JavaScript.

export async function AccountPanel({ locale }: { locale: Locale }) {
  const t = makeT(locale)

  // No database configured: say so plainly rather than showing a sign-in
  // button that leads to a dead end.
  if (!isSupabaseConfigured()) {
    return (
      <section className="j-account j-account-off">
        <UserRound size={18} aria-hidden />
        <div>
          <h2>{t('الحساب', 'Account')}</h2>
          <p>
            {t(
              'الحسابات غير مفعّلة بعد. تقدّمك محفوظ على هذا المتصفح وحده — بلا مزامنة بين الأجهزة.',
              'Accounts are not switched on yet. Your progress is saved in this browser only — no sync across devices.',
            )}
          </p>
        </div>
      </section>
    )
  }

  const user = await getCurrentUser()

  if (!user) {
    return (
      <section className="j-account">
        <UserRound size={18} aria-hidden />
        <div>
          <h2>{t('لست مسجّل الدخول', 'You are not signed in')}</h2>
          <p>
            {t(
              'سجّل الدخول لتحفظ تقدّمك وتزامنه بين أجهزتك، ولتفعّل كود الاشتراك.',
              'Sign in to save and sync your progress across devices, and to redeem a subscription code.',
            )}
          </p>
        </div>
        <Link href={`/${locale}/sign-in?next=/${locale}/me`} className="j-account-btn">
          <LogIn size={16} aria-hidden />
          <span>{t('تسجيل الدخول', 'Sign in')}</span>
        </Link>
      </section>
    )
  }

  return (
    <section className="j-account">
      <UserRound size={18} aria-hidden />
      <div>
        <h2>{t('مسجّل الدخول', 'Signed in')}</h2>
        <p dir="ltr" className="j-account-email">{user.email}</p>
      </div>
      <form method="post" action="/auth/sign-out">
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="j-account-btn j-account-btn-quiet">
          <LogOut size={16} aria-hidden />
          <span>{t('تسجيل الخروج', 'Sign out')}</span>
        </button>
      </form>
    </section>
  )
}
