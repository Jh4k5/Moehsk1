'use client'
import { useState, useEffect, useCallback } from 'react'
import { ACHIEVEMENTS, type Achievement } from '@/data/achievements'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Medal, Trophy, Lock, Unlock, Star, CheckCircle, Award,
} from 'lucide-react'
import { motion } from 'framer-motion'

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT TIER COLORS
// ═══════════════════════════════════════════════════════════
function getTierColor(points: number): { gradient: string; border: string; bg: string; text: string; badge: string; glow: string } {
  if (points >= 300) return {
    gradient: 'from-amber-400 to-yellow-500',
    border: 'border-amber-300',
    bg: 'from-amber-50 to-yellow-50/50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    glow: 'shadow-amber-200/50',
  }
  if (points >= 100) return {
    gradient: 'from-emerald-400 to-teal-500',
    border: 'border-emerald-300',
    bg: 'from-emerald-50 to-teal-50/50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    glow: 'shadow-emerald-200/50',
  }
  if (points >= 50) return {
    gradient: 'from-blue-400 to-indigo-500',
    border: 'border-blue-300',
    bg: 'from-blue-50 to-indigo-50/50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    glow: 'shadow-blue-200/50',
  }
  return {
    gradient: 'from-gray-400 to-gray-500',
    border: 'border-gray-300',
    bg: 'from-gray-50 to-gray-50/50',
    text: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    glow: 'shadow-gray-200/50',
  }
}

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT CARD COMPONENT
// ═══════════════════════════════════════════════════════════
function AchievementCard({ achievement, unlocked, index }: { achievement: Achievement; unlocked: boolean; index: number }) {
  const tier = getTierColor(achievement.points)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <Card
        className={"border-0 transition-all duration-300 " +
          (unlocked
            ? "shadow-md hover:shadow-lg " + tier.glow
            : "shadow-sm opacity-70 hover:opacity-80")}
      >
        <CardContent className={"p-4 " + (unlocked ? "bg-gradient-to-br " + tier.bg : "bg-gray-50")}>
          <div className="flex items-start gap-3">
            {/* Emoji / Lock icon */}
            <div className={"w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 " +
              (unlocked
                ? "bg-gradient-to-br " + tier.gradient + " shadow-sm"
                : "bg-gray-200")}>
              {unlocked
                ? <span className="text-2xl">{achievement.emoji}</span>
                : <Lock className="w-6 h-6 text-gray-400" />
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={"text-sm font-bold truncate " + (unlocked ? "text-gray-900" : "text-gray-500")}>
                  {achievement.titleAr}
                </h4>
                {unlocked && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>
              <p className={"text-xs mb-2 " + (unlocked ? "text-gray-600" : "text-gray-400")}>
                {achievement.descAr}
              </p>
              <div className="flex items-center gap-2">
                <Badge className={"text-[10px] " + (unlocked ? tier.badge : "bg-gray-200 text-gray-500 border-gray-200")}>
                  <Star className="w-2.5 h-2.5 ml-1" />
                  {achievement.points} نقطة
                </Badge>
                {unlocked && (
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                    <Unlock className="w-2.5 h-2.5 ml-1" />
                    مفتوح
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENTS SECTION
// ═══════════════════════════════════════════════════════════
export function AchievementsSection() {
  const [unlockStatus, setUnlockStatus] = useState<Record<string, boolean>>({})

  // Check all achievement conditions on mount and periodically
  const checkAchievements = useCallback(() => {
    const status: Record<string, boolean> = {}
    ACHIEVEMENTS.forEach(a => {
      try {
        status[a.id] = a.checkCondition()
      } catch {
        status[a.id] = false
      }
    })
    setUnlockStatus(status)
  }, [])

  useEffect(() => {
    // Check on mount via timeout to avoid synchronous setState in effect
    const initTimeout = setTimeout(checkAchievements, 0)
    // Re-check every 5 seconds for live updates
    const interval = setInterval(checkAchievements, 5000)
    return () => { clearTimeout(initTimeout); clearInterval(interval) }
  }, [checkAchievements])

  // Calculate totals
  const unlockedCount = Object.values(unlockStatus).filter(Boolean).length
  const totalPoints = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0)
  const earnedPoints = ACHIEVEMENTS
    .filter(a => unlockStatus[a.id])
    .reduce((sum, a) => sum + a.points, 0)
  const hasChecked = Object.keys(unlockStatus).length > 0
  const progressPct = hasChecked ? Math.round((unlockedCount / ACHIEVEMENTS.length) * 100) : 0

  // Sort: unlocked first, then by points descending
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockStatus[a.id] ? 0 : 1
    const bUnlocked = unlockStatus[b.id] ? 0 : 1
    if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked
    return b.points - a.points
  })

  // Tier stats
  const tierStats = {
    legendary: ACHIEVEMENTS.filter(a => a.points >= 300 && unlockStatus[a.id]).length,
    epic: ACHIEVEMENTS.filter(a => a.points >= 100 && a.points < 300 && unlockStatus[a.id]).length,
    rare: ACHIEVEMENTS.filter(a => a.points >= 50 && a.points < 100 && unlockStatus[a.id]).length,
    common: ACHIEVEMENTS.filter(a => a.points < 50 && unlockStatus[a.id]).length,
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
            <Medal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">الإنجازات</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Award className="w-3 h-3 ml-1" />
            {unlockedCount}/{ACHIEVEMENTS.length}
          </Badge>
        </div>
      </div>

      {/* Summary card */}
      <Card className="border-0 shadow-sm bg-gradient-to-l from-amber-50 via-orange-50/50 to-yellow-50">
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{earnedPoints}</div>
              <div className="text-[10px] text-gray-500">نقطة مكتسبة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{unlockedCount}/{ACHIEVEMENTS.length}</div>
              <div className="text-[10px] text-gray-500">إنجاز مفتوح</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">{totalPoints - earnedPoints}</div>
              <div className="text-[10px] text-gray-500">نقطة متبقية</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium">التقدم العام</span>
              <span className="font-bold">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-3" />
          </div>

          {/* Tier breakdown */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-[10px] text-gray-600">أسطوري ({tierStats.legendary})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-gray-600">ملحمي ({tierStats.epic})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-[10px] text-gray-600">نادر ({tierStats.rare})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-[10px] text-gray-600">عادي ({tierStats.common})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational message */}
      {unlockedCount === 0 && hasChecked && (
        <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-3xl mb-2">🌟</div>
          <p className="text-sm text-gray-600">ابدأ رحلتك في تعلم الصينية لفتح أول إنجاز!</p>
          <p className="text-xs text-gray-400 mt-1">تعلم كلمة واحدة على الأقل للحصول على إنجاز "البداية الحقيقية"</p>
        </div>
      )}

      {unlockedCount > 0 && unlockedCount < ACHIEVEMENTS.length && (
        <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-sm text-emerald-700">
            🎉 أحسنت! لقد فتحت {unlockedCount} إنجاز. واصل التعلم لفتح المزيد!
          </p>
        </div>
      )}

      {unlockedCount === ACHIEVEMENTS.length && (
        <div className="text-center p-4 rounded-xl bg-gradient-to-l from-amber-50 to-yellow-50 border border-amber-200">
          <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-amber-800">🏆 لقد فتحت جميع الإنجازات! أنت بطل حقيقي!</p>
          <p className="text-xs text-amber-600 mt-1">مجموع نقاطك: {earnedPoints} نقطة</p>
        </div>
      )}

      {/* Achievement cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedAchievements.map((achievement, i) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockStatus[achievement.id] || false}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
