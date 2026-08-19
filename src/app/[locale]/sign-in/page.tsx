import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SignInForm } from './SignInForm'
import { BridgeArchWide, HanziWatermark } from '@/components/nav/BridgeArt'
import { Logo } from '@/components/brand/Logo'
import { getCurrentUser } from '@/lib/supabase/auth'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { LOCALES, isLocale, makeT, type Locale } from '@/lib/locale'

// ─── Sign in ────────────────────────────────────────────────────────────────
//
// Outside the `(app)` group on purpose: no bottom bar, no sidebar, no streak
// pill. A reader who is not signed in has no progress for those to show, and a
// shell full of empty widgets around a login form is noise.

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const t = makeT(locale)
  return { title: t('تسجيل الدخول', 'Sign in'), robots: { index: false } }
}

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = makeT(locale)
  const { error, next } = await searchParams

  // Already signed in — this page has nothing to offer.
  const user = await getCurrentUser()
  if (user) redirect(`/${locale}/home`)

  const configured = isSupabaseConfigured()

  return (
    <main className="j-auth">
      <div className="j-auth-hero">
        <BridgeArchWide />
        <HanziWatermark size={150} style={{ top: '10px', insetInlineEnd: '-20px' }} />
        <div className="j-auth-brand">
          <span className="j-auth-mark"><Logo variant="icon" size={26} /></span>
          <span className="j-auth-brand-text">
            <span className="j-auth-brand-ar">{t('جسر إلى الصين', 'Bridge to China')}</span>
            <span className="j-auth-brand-en">BRIDGE TO CHINA</span>
          </span>
        </div>
        <h1>{t('أكمل من حيث توقّفت', 'Pick up where you left off')}</h1>
        <p>
          {t(
            'حسابك يحفظ تقدّمك ويزامنه بين هاتفك وحاسوبك. تقدّمك الحالي على هذا الجهاز لن يضيع — سيُنقل إلى حسابك عند أول دخول.',
            'An account saves your progress and syncs it between your phone and your computer. What you have done on this device is not lost — it moves into your account the first time you sign in.',
          )}
        </p>
      </div>

      <div className="j-auth-panel">
        {configured ? (
          <SignInForm locale={locale} initialError={error ?? null} next={next ?? null} />
        ) : (
          <div className="j-auth-unconfigured">
            <p>
              {t(
                'تسجيل الدخول غير مفعّل بعد. المنصة تعمل بالكامل بلا حساب — تقدّمك محفوظ على هذا الجهاز.',
                'Sign-in is not switched on yet. The platform works fully without an account — your progress is saved on this device.',
              )}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
