import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Cairo, Noto_Sans_SC, Tajawal } from 'next/font/google'
import '../globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { PaywallProvider } from '@/lib/paywall-context'
import { AppConfigProvider } from '@/lib/config/client'
import { LocaleSync } from '@/components/nav/LocaleSync'
import { HanziScale } from '@/components/nav/HanziScale'
import { LOCALES, dirOf, isLocale, makeT, type Locale } from '@/lib/locale'

// This is the ROOT layout, and it sits inside `[locale]` on purpose: `lang` and
// `dir` are decided by the URL segment and rendered by the server. Before, the
// served HTML was always `lang="ar" dir="rtl"` and English existed only as a
// post-hydration DOM mutation — a state no crawler ever sees.

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
})

const tajawal = Tajawal({
  variable: '--font-tajawal',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  weight: ['400', '700'],
})

const SITE = 'https://moehsk1.vercel.app'

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

  return {
    metadataBase: new URL(SITE),
    title: {
      default: t('جسر إلى الصين — تعلّم اللغة الصينية', 'Bridge to China — Learn Chinese in Arabic'),
      template: t('%s · جسر إلى الصين', '%s · Bridge to China'),
    },
    description: t(
      'منصة عربية لتعلّم اللغة الصينية من الصفر حتى HSK 3: مفردات وقواعد وكتابة الحروف بترتيب ضرباتها ونطق ومحادثات، بمسار متدرّج يبدأ من أول درس.',
      'An Arabic-language platform for learning Chinese from zero to HSK 3: vocabulary, grammar, stroke-order writing, pronunciation and conversation, on one graded path that starts at lesson one.',
    ),
    // hreflang: the two locales are alternates of one another, so a crawler
    // that finds either finds both.
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: '/ar',
        en: '/en',
        'x-default': '/ar',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'ar_AR',
      alternateLocale: locale === 'en' ? 'ar_AR' : 'en_US',
      url: `${SITE}/${locale}`,
      siteName: t('جسر إلى الصين', 'Bridge to China'),
    },
    icons: {
      icon: [{ url: '/brand/app-icon.svg', type: 'image/svg+xml' }],
      apple: '/brand/app-icon.svg',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  return (
    <html lang={locale} dir={dirOf(locale)} className={locale === 'en' ? 'lang-en' : 'lang-ar'} suppressHydrationWarning>
      <head>
        {/* Theme only. The language block that used to live here read
            localStorage and rewrote `lang`/`dir` after paint — that is what
            made English un-indexable, and the route replaces it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark';document.documentElement.classList.add(d?'dark':'light');document.documentElement.classList.remove(d?'light':'dark')}catch(e){document.documentElement.classList.add('light')}})();`,
          }}
        />
      </head>
      <body
        className={`${cairo.variable} ${tajawal.variable} ${notoSansSC.variable} antialiased bg-background text-foreground font-arabic`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {/* The owner's settings — price, free-tier size, feature flags —
              reach every screen from here. No `value` yet means the built-in
              defaults, whose amounts are all null, so nothing renders a price
              the owner has not set. Wiring Supabase means passing `value` here
              and nowhere else. */}
          <AppConfigProvider>
            <PaywallProvider>
              <LocaleSync locale={locale} />
              <HanziScale />
              {children}
            </PaywallProvider>
          </AppConfigProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
