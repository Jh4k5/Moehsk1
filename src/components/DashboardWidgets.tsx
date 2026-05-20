'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLearningStore } from '@/lib/store'
import { vocabulary } from '@/data/vocabulary'
import { speak } from '@/lib/helpers'
import { ACHIEVEMENTS } from '@/data/achievements'
import {
  Flame, Star, Target, BookOpen, Brain, Trophy, Clock,
  ChevronLeft, Volume2, Check, Zap, BookOpenText, Play,
} from 'lucide-react'

interface DashboardWidgetsProps {
  onNavigate: (section: string) => void
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
}

export default function DashboardWidgets({ onNavigate }: DashboardWidgetsProps) {
  const learnedWords = useLearningStore((s) => s.learnedWords)
  const dailyStreak = useLearningStore((s) => s.dailyStreak)
  const dailyActivity = useLearningStore((s) => s.dailyActivity)
  const getSRSStats = useLearningStore((s) => s.getSRSStats)
  const getDueCardIds = useLearningStore((s) => s.getDueCardIds)
  const getWeakWordIds = useLearningStore((s) => s.getWeakWordIds)

  const totalWords = vocabulary.length
  const learnedCount = learnedWords.length
  const progressPct = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0

  const todayKey = new Date().toISOString().slice(0, 10)
  const todayActivity = dailyActivity[todayKey] ?? { wordsLearned: 0, questionsAnswered: 0, gamesPlayed: 0 }

  const srsStats = useMemo(() => getSRSStats(), [learnedWords, getSRSStats])
  const dueCards = useMemo(() => getDueCardIds(), [learnedWords, getDueCardIds])
  const weakWordIds = useMemo(() => getWeakWordIds(5), [learnedWords, getWeakWordIds])
  const totalReviews = srsStats.total

  // Word of the day — deterministic based on date
  const wordOfDay = useMemo(() => {
    const idx = new Date().getDate() % vocabulary.length
    return vocabulary[idx]
  }, [])

  // Quick review — 5 random learned words
  const quickReviewWords = useMemo(() => {
    if (learnedWords.length === 0) return vocabulary.slice(0, 5)
    const pool = learnedWords
      .map((id) => vocabulary.find((w) => w.id === id))
      .filter(Boolean)
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5)
  }, [learnedWords])

  // Weak words (fall back to random if none)
  const weakWords = useMemo(() => {
    if (weakWordIds.length > 0) {
      return weakWordIds
        .map((id) => vocabulary.find((w) => w.id === id))
        .filter(Boolean)
    }
    return vocabulary.slice(0, 5)
  }, [weakWordIds])

  // Achievements unlocked count
  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.checkCondition()),
    [],
  )

  // Daily goals
  const dailyGoals = [
    { label: 'تعلم 10 كلمات جديدة', current: todayActivity.wordsLearned, target: 10, icon: BookOpen },
    { label: 'راجع 20 بطاقة', current: totalReviews, target: 20, icon: Brain },
    { label: 'أجب على 10 أسئلة', current: todayActivity.questionsAnswered, target: 10, icon: Target },
    { label: 'العب لعبة واحدة', current: todayActivity.gamesPlayed, target: 1, icon: Zap },
  ]

  return (
    <div dir="rtl" className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      {/* ── Prominent Lessons Hero Card ── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-l from-red-500 via-red-600 to-red-700">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpenText className="h-6 w-6 text-white/90" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">الدروس</h2>
                </div>
                <p className="text-white/80 text-sm sm:text-base mb-4">ابدأ رحلة تعلم الصينية من الصفر مع دروس منظمة ومتدرجة</p>
                <Button
                  onClick={() => onNavigate('lessons')}
                  className="bg-white text-red-600 hover:bg-red-50 font-bold gap-2 shadow-md"
                >
                  <Play className="h-4 w-4" />
                  ابدأ التعلم الآن
                </Button>
              </div>
              <div className="hidden sm:flex flex-col items-center gap-2 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <span className="font-chinese-serif text-5xl text-white/90 font-bold">学</span>
                <span className="text-white/70 text-xs font-medium">HSK 1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Row 1: Progress + Word of Day + SRS Review ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Widget 1: Overall Progress */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Target className="h-5 w-5 text-green-600" />
                التقدم العام
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-4">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="url(#progressGrad)" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progressPct / 100)}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#16a34a" />
                      <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-3xl font-black text-green-700">{progressPct}%</span>
              </div>
              <div className="flex gap-4 text-center text-sm">
                <div>
                  <p className="font-bold text-gray-800">{totalWords}</p>
                  <p className="text-gray-500">إجمالي</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <p className="font-bold text-green-600">{learnedCount}</p>
                  <p className="text-gray-500">متعلمة</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <p className="font-bold text-amber-600">{totalReviews}</p>
                  <p className="text-gray-500">مراجعات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Widget 2: Word of the Day */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Star className="h-5 w-5 text-amber-500" />
                كلمة اليوم
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-4">
              <button
                onClick={() => speak(wordOfDay.zh)}
                className="group flex flex-col items-center gap-1 rounded-xl p-4 transition hover:bg-amber-50"
              >
                <span className="text-5xl font-bold text-red-600 transition group-hover:scale-105 font-chinese-serif">
                  {wordOfDay.zh}
                </span>
                <span className="text-lg text-gray-500 font-chinese-sans">{wordOfDay.pinyin}</span>
                <Volume2 className="mt-1 h-4 w-4 text-amber-400 opacity-0 transition group-hover:opacity-100" />
              </button>
              <p className="text-lg font-semibold text-gray-800">{wordOfDay.meaning}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onNavigate('vocabulary')}
              >
                انتقل للمفردات
                <ChevronLeft className="mr-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Widget 3: Smart Review (SRS) */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Brain className="h-5 w-5 text-red-600" />
                المراجعة الذكية
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-4">
              {dueCards.length > 0 ? (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                    <span className="text-3xl font-black text-red-600">{dueCards.length}</span>
                  </div>
                  <p className="text-sm text-gray-600">بطاقة تحتاج مراجعة</p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    {srsStats.new > 0 && <Badge variant="outline" className="border-blue-300 text-blue-600">جديدة: {srsStats.new}</Badge>}
                    {srsStats.learning > 0 && <Badge variant="outline" className="border-amber-300 text-amber-600">قيد التعلم: {srsStats.learning}</Badge>}
                    {srsStats.mastered > 0 && <Badge variant="outline" className="border-green-300 text-green-600">متقنة: {srsStats.mastered}</Badge>}
                  </div>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => onNavigate('vocabulary')}
                  >
                    ابدأ المراجعة
                    <Zap className="mr-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-green-700">لا توجد مراجعات مستحقة! 🎉</p>
                  <p className="text-sm text-gray-500">أحسنت! أنت على الميعاد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Row 2: Quick Review + Daily Plan + Achievements ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Widget 4: Quick Review */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Clock className="h-5 w-5 text-purple-500" />
                المراجعة السريعة
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {quickReviewWords.map((w) => (
                  <button
                    key={w!.id}
                    onClick={() => speak(w!.zh)}
                    className="flex-shrink-0 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-3 text-center shadow-sm transition hover:shadow-md hover:border-red-200 min-w-[100px]"
                  >
                    <p className="text-2xl font-bold text-red-600 font-chinese-serif">{w!.zh}</p>
                    <p className="mt-1 text-xs text-gray-500 truncate max-w-[90px]">{w!.meaning}</p>
                    <Volume2 className="mx-auto mt-1 h-3 w-3 text-gray-300" />
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onNavigate('practice')}
              >
                عرض المزيد
                <ChevronLeft className="mr-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Widget 5: Daily Plan */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Target className="h-5 w-5 text-amber-500" />
                خطة اليوم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              {dailyGoals.map((g) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100))
                const done = pct >= 100
                const Icon = g.icon
                return (
                  <div key={g.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${done ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={done ? 'text-green-600 line-through' : 'text-gray-700'}>
                          {g.label}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">
                        {g.current}/{g.target}
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-500' : 'bg-gradient-to-l from-amber-400 to-amber-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Widget 6: Achievements Preview */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base font-bold">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  الإنجازات
                </div>
                <Badge variant="secondary" className="text-xs">
                  {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2.5">
                {ACHIEVEMENTS.slice(0, 5).map((a) => {
                  const unlocked = unlockedAchievements.some((u) => u.id === a.id)
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-3 rounded-lg p-2 transition ${unlocked ? 'bg-amber-50' : 'bg-gray-50 opacity-60'}`}
                    >
                      <span className="text-2xl">{a.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                          {a.titleAr}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{a.descAr}</p>
                      </div>
                      {unlocked && <Check className="h-4 w-4 flex-shrink-0 text-green-500" />}
                    </div>
                  )
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-amber-600 hover:bg-amber-50"
                onClick={() => onNavigate('games')}
              >
                عرض الكل
                <ChevronLeft className="mr-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Row 3: Recent Activity + Weak Words ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Widget 7: Recent Activity */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Flame className="h-5 w-5 text-orange-500" />
                الأنشطة الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-l from-orange-500 to-red-500 px-4 py-2 text-white">
                  <Flame className="h-6 w-6" />
                  <span className="text-2xl font-black">{dailyStreak}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">يوم متتالي</p>
                  <p className="text-xs text-gray-500">حافظ على السلسلة!</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-center">
                  <BookOpen className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                  <p className="text-xl font-bold text-blue-700">{todayActivity.wordsLearned}</p>
                  <p className="text-xs text-gray-500">كلمة اليوم</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-center">
                  <Target className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                  <p className="text-xl font-bold text-amber-700">{todayActivity.questionsAnswered}</p>
                  <p className="text-xs text-gray-500">إجابات</p>
                </div>
                <div className="rounded-xl bg-green-50 p-3 text-center">
                  <Zap className="mx-auto mb-1 h-5 w-5 text-green-500" />
                  <p className="text-xl font-bold text-green-700">{todayActivity.gamesPlayed}</p>
                  <p className="text-xs text-gray-500">ألعاب</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Widget 8: Weak Words */}
        <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <BookOpen className="h-5 w-5 text-red-400" />
                الكلمات الضعيفة
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                {weakWords.map((w) => (
                  <button
                    key={w!.id}
                    onClick={() => speak(w!.zh)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white p-2.5 transition hover:bg-red-50 hover:border-red-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-red-600 font-chinese-serif">{w!.zh}</span>
                      <span className="text-sm text-gray-600">{w!.meaning}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-red-200 text-xs text-red-500">
                        تحتاج تمرين
                      </Badge>
                      <Volume2 className="h-3.5 w-3.5 text-gray-300" />
                    </div>
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onNavigate('vocabulary')}
              >
                عرض الكلمات كلها
                <ChevronLeft className="mr-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
