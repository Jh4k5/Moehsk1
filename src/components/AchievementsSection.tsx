'use client'

import { useState, useEffect, useCallback } from 'react'
import { ACHIEVEMENTS, type Achievement } from '@/data/achievements'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Lock,
  Star,
  Flame,
  Mic,
  Scroll,
  PenTool,
  MessageCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLearningStore } from '@/lib/store'
import { Analytics } from '@/lib/analytics'

// ─── localStorage helpers ─────────────────────────────────────────────
const STORAGE_KEY = 'achievements'

function getUnlockedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveUnlockedIds(ids: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

// ─── Icon map for achievements ────────────────────────────────────────
const achievementIcons: Record<string, React.ReactNode> = {
  first_word: <Star className="h-5 w-5 text-[var(--clr-warning)]" />,
  fifty_words: <Star className="h-5 w-5 text-[var(--clr-warning)]" />,
  hundred_words: <Star className="h-5 w-5 text-[var(--clr-warning)]" />,
  all_words: <Trophy className="h-5 w-5 text-[var(--clr-warning)]" />,
  streak_7: <Flame className="h-5 w-5 text-[var(--clr-energy)]" />,
  streak_30: <Flame className="h-5 w-5 text-[var(--clr-danger)]" />,
  perfect_pron: <Mic className="h-5 w-5 text-[var(--clr-warning)]" />,
  first_exam_pass: <Scroll className="h-5 w-5 text-[var(--clr-warning)]" />,
  hanzi_writer: <PenTool className="h-5 w-5 text-[var(--clr-warning)]" />,
  conv_master: <MessageCircle className="h-5 w-5 text-[var(--clr-warning)]" />,
}

// ─── Component ────────────────────────────────────────────────────────
export default function AchievementsSection() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [toastQueue, setToastQueue] = useState<Achievement[]>([])

  // Subscribe to store changes so we can re-check conditions. The conditions
  // are pure functions of this state now — they used to read `localStorage`
  // keys the app never wrote, which is why every badge stayed locked forever.
  const learnedWordsLength = useLearningStore((s) => s.learnedWords.length)
  const dailyStreak = useLearningStore((s) => s.dailyStreak)
  const unitsDoneCount = useLearningStore((s) => Object.keys(s.unitProgress).length)
  const srsCount = useLearningStore((s) => Object.keys(s.srsCards).length)

  // ── Check achievements and detect newly unlocked ones ───────────
  const checkAchievements = useCallback(() => {
    const current = getUnlockedIds()
    const newlyUnlocked: Achievement[] = []

    ACHIEVEMENTS.forEach((a) => {
      if (!current.includes(a.id) && a.checkCondition(useLearningStore.getState())) {
        newlyUnlocked.push(a)
        current.push(a.id)
      }
    })

    if (newlyUnlocked.length > 0) {
      saveUnlockedIds(current)
      setUnlockedIds([...current])

      // Track via analytics
      newlyUnlocked.forEach((a) => {
        Analytics.recordActivity()
      })

      // Show celebration toasts (stagger them)
      newlyUnlocked.forEach((a, i) => {
        setTimeout(() => {
          setToastQueue((prev) => [...prev, a])
        }, i * 600)
      })
    } else {
      setUnlockedIds(current)
    }
  }, [])

  // ── Auto-check on mount and after learning activity changes ──────
  // Uses microtask to avoid synchronous setState in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAchievements()
    }, 0)
    return () => clearTimeout(timer)
  }, [checkAchievements])

  // Re-check when store values change (learning activity)
  useEffect(() => {
    // Small debounce to let localStorage settle
    const timer = setTimeout(() => {
      checkAchievements()
    }, 500)
    return () => clearTimeout(timer)
  }, [learnedWordsLength, dailyStreak, unitsDoneCount, srsCount, checkAchievements])

  // ── Auto-dismiss toast ──────────────────────────────────────────
  const dismissToast = useCallback((id: string) => {
    setToastQueue((prev) => prev.filter((a) => a.id !== id))
  }, [])

  useEffect(() => {
    if (toastQueue.length === 0) return
    const latest = toastQueue[toastQueue.length - 1]
    const timer = setTimeout(() => {
      dismissToast(latest.id)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toastQueue, dismissToast])

  // ── Computed values ─────────────────────────────────────────────
  const totalAchievements = ACHIEVEMENTS.length
  const unlockedCount = unlockedIds.length
  const totalPoints = ACHIEVEMENTS.reduce((sum, a) => {
    return sum + (unlockedIds.includes(a.id) ? a.points : 0)
  }, 0)
  const progressPercent =
    totalAchievements > 0
      ? Math.round((unlockedCount / totalAchievements) * 100)
      : 0

  return (
    <section className="w-full">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--clr-warning)]/20 to-[var(--gold-700)]/20 border border-[var(--clr-warning)]/30">
            <Trophy className="h-6 w-6 text-[var(--clr-warning)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              🏅 الإنجازات
            </h2>
            <p className="text-sm text-muted-foreground">
              تتبع تقدمك وحقق المزيد
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--clr-warning)]/20 to-[var(--gold-700)]/10 border border-[var(--clr-warning)]/20 px-4 py-2">
          <Star className="h-5 w-5 text-[var(--clr-warning)]" />
          <span className="text-2xl font-bold text-[var(--clr-warning)] sm:text-3xl">
            {totalPoints}
          </span>
          <span className="text-sm text-[var(--clr-warning)]/70">نقطة</span>
        </div>
      </div>

      {/* ── Progress Bar ───────────────────────────────────────── */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {unlockedCount} من {totalAchievements} إنجاز مفتوح
          </span>
          <Badge
            variant="outline"
            className="border-[var(--clr-warning)]/30 text-[var(--clr-warning)] text-xs"
          >
            {progressPercent}%
          </Badge>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--surface-card)]/50 border border-[var(--line-medium)]/50">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-[var(--clr-warning)] to-[var(--clr-warning)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Achievement Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id)

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={isUnlocked ? { scale: 1.05 } : undefined}
            >
              <div
                className={`rounded-xl p-4 text-center transition-all duration-300 border ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-[var(--clr-warning)]/30 to-[var(--gold-700)]/20 border-[var(--clr-warning)]/50 hover:shadow-lg hover:shadow-[var(--gold-500)]/10 cursor-default'
                    : 'bg-[var(--surface-card)]/50 border-[var(--line-medium)] opacity-50 cursor-default'
                }`}
              >
                {/* Emoji / Lock Icon */}
                <div
                  className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-[var(--clr-warning)]/20 to-[var(--gold-700)]/10'
                      : 'bg-[var(--surface-card)]/80'
                  }`}
                >
                  {isUnlocked ? (
                    <span className="text-3xl">{achievement.emoji}</span>
                  ) : (
                    <Lock className="h-5 w-5 text-[var(--text-muted)]" />
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`mb-1 text-sm font-semibold leading-tight ${
                    isUnlocked ? 'text-[var(--clr-warning)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {isUnlocked ? achievement.titleAr : '???'}
                </h3>

                {/* Description (only for unlocked) */}
                {isUnlocked && (
                  <p className="mb-2 text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                    {achievement.descAr}
                  </p>
                )}

                {/* Points Badge */}
                {isUnlocked ? (
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-[var(--clr-warning)]/10 border border-[var(--clr-warning)]/20"
                  >
                    <span className="text-[var(--clr-warning)] font-bold text-sm">
                      +{achievement.points} نقطة
                    </span>
                  </Badge>
                ) : (
                  <div className="mt-2 text-xs text-[var(--text-tertiary)]">
                    <Star className="inline h-3 w-3 ml-1" />
                    {achievement.points} نقطة
                  </div>
                )}

                {/* Category icon for unlocked */}
                {isUnlocked && achievementIcons[achievement.id] && (
                  <div className="mt-2 flex justify-center opacity-50">
                    {achievementIcons[achievement.id]}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Celebration Toast ──────────────────────────────────── */}
      <AnimatePresence>
        {toastQueue.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-xl border-2 border-[var(--clr-warning)]/60 bg-gradient-to-r from-[var(--gold-700)]/90 via-gray-900/95 to-[var(--gold-700)]/90 px-5 py-4 shadow-2xl shadow-[var(--gold-500)]/10 backdrop-blur-sm min-w-[280px] sm:min-w-[340px]">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--clr-warning)]/30 to-[var(--gold-700)]/20 border border-[var(--clr-warning)]/30">
                <span className="text-2xl">{achievement.emoji}</span>
              </div>
              <div className="flex-1 text-right min-w-0">
                <p className="text-xs font-medium text-[var(--clr-warning)]/70 mb-0.5">
                  🎉 إنجاز جديد!
                </p>
                <p className="text-sm font-bold text-[var(--clr-warning)] truncate">
                  {achievement.titleAr}
                </p>
                <p className="text-[var(--clr-warning)] font-bold text-sm mt-0.5">
                  +{achievement.points} نقطة
                </p>
              </div>
              <button
                onClick={() => dismissToast(achievement.id)}
                className="flex-shrink-0 rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-card)] hover:text-[var(--text-primary)]"
                aria-label="إغلاق"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  )
}
