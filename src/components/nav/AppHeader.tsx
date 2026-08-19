'use client'
// ─── The navy identity header, as the design files draw it ──────────────────
// Navy gradient ground, the bridge arch from the logo as ornament, 桥 as a
// watermark, the streak in gold on the right. One menu button, and it is the
// only control that opens the drawer.
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { BridgeArch, HanziWatermark } from './BridgeArt'
import { NavDrawer } from './NavDrawer'
import { LocaleSwitch } from './LocaleSwitch'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/brand/Logo'
import { useI18n } from '@/lib/i18n'
import { useActiveLevel } from '@/lib/levels'
import { useLearningStore } from '@/lib/store'
import { usePersisted } from '@/hooks/use-mounted'
import type { Locale } from '@/lib/locale'

export function AppHeader({ locale }: { locale: Locale }) {
  const { t } = useI18n()
  const activeLevel = useActiveLevel()
  const setLevel = useLearningStore((s) => s.setLevel)
  const currentLevel = usePersisted(useLearningStore((s) => s.currentLevel), 1)
  const dailyStreak = usePersisted(useLearningStore((s) => s.dailyStreak), 0)

  return (
    <header className="j-app-header">
      <BridgeArch />
      <HanziWatermark size={130} style={{ top: '-18px', insetInlineEnd: '-6px' }} />

      <div className="relative mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <NavDrawer locale={locale} />
          <Link href={`/${locale}/home`} className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] bg-[color:var(--brand-ivory)]">
              <Logo variant="icon" size={24} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-display text-sm font-bold leading-tight text-[color:var(--brand-ivory)]">
                {t('جسر إلى الصين', 'Bridge to China')}
              </span>
              <span className="text-[9px] tracking-[0.16em] text-[color:var(--navy-300)]">
                {activeLevel.label}
              </span>
            </span>
          </Link>
        </div>

        <div className="flex flex-none items-center gap-1.5">
          <div className="hidden items-center gap-0.5 rounded-full bg-white/10 p-0.5 sm:flex">
            {([1, 2, 3] as const).map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => setLevel(lv)}
                aria-pressed={currentLevel === lv}
                className={
                  'min-h-[32px] rounded-full px-2.5 text-[11px] font-bold transition-colors ' +
                  (currentLevel === lv
                    ? 'bg-[color:var(--gold-500)] text-[color:var(--navy-700)]'
                    : 'text-[color:var(--navy-200)] hover:text-[color:var(--brand-ivory)]')
                }
              >
                HSK {lv}
              </button>
            ))}
          </div>

          <LocaleSwitch locale={locale} />
          <ThemeToggle />

          <span className="j-streak-pill" title={t('سلسلة الأيام', 'Day streak')}>
            <Flame className="h-[15px] w-[15px]" aria-hidden="true" />
            <span className="font-display text-sm font-extrabold">{dailyStreak}</span>
            <span className="sr-only">{t('يوم متتالي', 'day streak')}</span>
          </span>
        </div>
      </div>
    </header>
  )
}
