'use client'
// ─── Google, or an emailed link ─────────────────────────────────────────────
//
// Two ways in and no password. A password means a reset flow, a strength meter,
// a breach list and a support burden — for a learning platform whose entire
// secret is "which lessons you finished". A magic link removes all of it, and
// Google removes even the wait for the email.
//
// The two are the SAME account when the email matches: Supabase links identities
// by verified email, so someone who starts with a link and later uses Google
// does not end up with two half-finished paths.

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SUPABASE_ANON_KEY } from '@/lib/supabase/env'
import { makeT, type Locale } from '@/lib/locale'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/** Supabase's messages are English and terse; these are for the reader. */
const MESSAGES: Record<string, { ar: string; en: string }> = {
  missing_code: { ar: 'لم تكتمل عملية الدخول. حاول مرة أخرى.', en: 'Sign-in did not complete. Try again.' },
  access_denied: { ar: 'أُلغيت عملية الدخول.', en: 'Sign-in was cancelled.' },
  otp_disabled: { ar: 'الدخول بالبريد غير مفعّل بعد.', en: 'Email sign-in is not enabled yet.' },
  over_email_send_rate_limit: {
    ar: 'أُرسلت رسائل كثيرة. انتظر دقيقة ثم أعد المحاولة.',
    en: 'Too many emails sent. Wait a minute and try again.',
  },
}

function humanise(raw: string, locale: Locale): string {
  const key = Object.keys(MESSAGES).find((k) => raw.includes(k))
  if (key) return locale === 'en' ? MESSAGES[key].en : MESSAGES[key].ar

  // A CONFIGURATION fault is not a user's fault, and hiding it behind «حدث
  // خطأ» cost an afternoon: both Google and the magic link failed with that
  // one sentence while the real cause — a missing key in the browser bundle —
  // named itself in the exception and never reached the screen. Anything that
  // says a variable is not set is shown verbatim, because the person reading
  // it is the person who can fix it.
  if (/is not set|Invalid API key|No API key/i.test(raw)) {
    return locale === 'en'
      ? `Configuration problem: ${raw}. Check /api/health, then redeploy.`
      : `مشكلة إعداد: ${raw}. افحص /api/health ثم أعد النشر.`
  }

  return locale === 'en' ? 'Something went wrong. Try again.' : 'حدث خطأ. حاول مرة أخرى.'
}

export function SignInForm({
  locale,
  initialError,
  next,
}: {
  locale: Locale
  initialError: string | null
  next: string | null
}) {
  const t = makeT(locale)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>(initialError ? 'error' : 'idle')
  const [message, setMessage] = useState<string | null>(initialError ? humanise(initialError, locale) : null)

  /** Where the provider returns to. Absolute — the console stores this. */
  const callbackUrl = () => {
    const url = new URL('/auth/callback', window.location.origin)
    url.searchParams.set('locale', locale)
    if (next) url.searchParams.set('next', next)
    return url.toString()
  }

  const withGoogle = async () => {
    setStatus('sending')
    setMessage(null)
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl(),
        queryParams: {
          // `consent` + offline is what actually returns a refresh token on a
          // repeat sign-in; without it a returning reader silently gets a
          // session that cannot be refreshed and is signed out an hour later.
          access_type: 'offline',
          prompt: 'consent',

          // The publishable key, by hand, because supabase-js does not put it
          // there. `signInWithOAuth` NAVIGATES the browser to
          // `/auth/v1/authorize` — it is not a fetch, so the `apikey` header
          // the client sets on every other call cannot ride along, and the
          // library does not add it to the query either. Verified by building
          // the URL locally with both a publishable and a legacy key: neither
          // produced `apikey=`.
          //
          // Projects whose gateway tolerates an unauthenticated `/authorize`
          // never notice. This one does not, and answered every Google click
          // with a raw JSON page: {"message":"No API key found in request"} —
          // the reader's first impression of signing in.
          //
          // Safe to put in a URL: this key is publishable by definition, it is
          // already in the JavaScript bundle, and RLS is what actually guards
          // the data.
          apikey: SUPABASE_ANON_KEY,
        },
      },
    })
    if (error) {
      setStatus('error')
      setMessage(humanise(error.message, locale))
    }
    // On success the browser has already left for Google.
  }

  const withEmail = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setMessage(null)
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl() },
    })
    if (error) {
      setStatus('error')
      setMessage(humanise(error.message, locale))
      return
    }
    setStatus('sent')
    setMessage(
      t(
        `أرسلنا رابط الدخول إلى ${email.trim()}. افتحه من هذا الجهاز.`,
        `We sent a sign-in link to ${email.trim()}. Open it on this device.`,
      ),
    )
  }

  return (
    <div className="j-auth-form">
      <button type="button" className="j-google-btn" onClick={withGoogle} disabled={status === 'sending'}>
        <GoogleMark />
        <span>{t('المتابعة بحساب جوجل', 'Continue with Google')}</span>
      </button>

      <div className="j-auth-or"><span>{t('أو', 'or')}</span></div>

      <form onSubmit={withEmail} className="j-auth-email">
        <label htmlFor="auth-email">{t('بريدك الإلكتروني', 'Your email')}</label>
        <input
          id="auth-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          disabled={status === 'sending' || status === 'sent'}
        />
        <button type="submit" className="j-auth-submit" disabled={status === 'sending' || status === 'sent'}>
          {status === 'sending'
            ? t('جارٍ الإرسال…', 'Sending…')
            : status === 'sent'
              ? t('تم الإرسال', 'Sent')
              : t('أرسل رابط الدخول', 'Email me a link')}
        </button>
      </form>

      {message && (
        <p className={'j-auth-msg' + (status === 'error' ? ' is-error' : ' is-ok')} role="status">
          {message}
        </p>
      )}

      <p className="j-auth-note">
        {t(
          'بلا كلمة مرور. لا نطلب منك شيئاً غير بريدك.',
          'No password. We ask for nothing but your email.',
        )}
      </p>
    </div>
  )
}

/** Google's mark, inline. An external <img> would be blocked by the CSP. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h11.9c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.5-9.5 6.5-16.5Z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.7C8 41.3 15.4 46 24 46Z" />
      <path fill="#FBBC05" d="M11.6 28.2A13.2 13.2 0 0 1 10.9 24c0-1.5.3-2.9.7-4.2v-5.7H4.3A22 22 0 0 0 2 24c0 3.6.9 6.9 2.3 9.9l7.3-5.7Z" />
      <path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8 6.7 4.3 14.1l7.3 5.7c1.7-5.2 6.6-9.1 12.4-9.1Z" />
    </svg>
  )
}
