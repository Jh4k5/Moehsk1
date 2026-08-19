'use client'
// ─── Home — «what is next» above everything else ────────────────────────────
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Flame, GraduationCap, Trophy } from 'lucide-react'
import { getWeakWords } from '@/lib/srs'
import { useActiveLevel } from '@/lib/levels'
import { useLevelStats } from '@/features/shared/use-level-stats'
import { ts, tsPick } from '@/lib/i18n'
import { useLearningStore, type Section } from '@/lib/store'
import { hrefFor } from '@/components/nav/nav-model'
import { useLocale } from '@/components/nav/use-locale'
import PomodoroTimer from '@/components/PomodoroTimer'

export default function DashboardSection() {
  const store = useLearningStore()
  const dashLevel = useActiveLevel()
  const router = useRouter()
  const locale = useLocale()
  // Section switching used to be `setCurrentSection`; each section is a route
  // now, so "navigate" means navigate.
  const onNavigate = useCallback(
    (section: Section) => router.push(hrefFor(locale, section)),
    [router, locale],
  )
  const stats = useLevelStats()
  const todayKey = new Date().toDateString()
  const todayWords = store.dailyActivity[todayKey]?.wordsLearned || 0
  const dailyGoal = store.profile?.dailyGoal || 10
  const goalPct = Math.min(100, Math.round((todayWords / dailyGoal) * 100))
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="text-2xl">{store.profile?.avatarEmoji || '🐼'}</span>
            {ts('أهلاً', 'Welcome,')} {store.profile?.name || ts('بك', 'friend')}!
          </h2>
          <p className="text-[var(--text-muted)] mt-1">
            {goalPct >= 100
              ? ts('🎉 أنجزت هدفك اليومي — استمر إن أردت المزيد!', '🎉 Daily goal reached — keep going if you like!')
              : ts(`هدف اليوم: ${todayWords} من ${dailyGoal} كلمات جديدة`, `Today's goal: ${todayWords} of ${dailyGoal} new words`)}
          </p>
        </div>
        {/* حلقة تقدم الهدف اليومي */}
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line-default)" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--clr-primary)" strokeWidth="3.5"
              strokeLinecap="round" strokeDasharray={`${goalPct * 0.974} 100`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
            {goalPct}%
          </div>
        </div>
      </div>

      {/* Stats Cards — stat tiles: hero number + label in text ink, icon chip carries the hue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: ts('كلمة محفوظة', 'Words learned'), value: stats.learned, total: stats.total, icon: BookOpen, color: 'from-[var(--clr-primary)] to-[var(--clr-primary-h)]' },
          { label: ts('قاعدة نحوية', 'Grammar rules'), value: dashLevel.grammarRules.length, icon: GraduationCap, color: 'from-[var(--clr-warning)] to-[var(--gold-600)]' },
          { label: ts('أيام متتالية', 'Day streak'), value: store.dailyStreak, icon: Flame, color: 'from-[var(--clr-energy)] to-[var(--gold-400)]' },
          { label: ts('مستوى التقدم', 'Progress'), value: `${stats.progress}%`, icon: Trophy, color: 'from-[var(--clr-success)] to-[var(--green-600)]' },
        ].map((stat, i) => (
          <Card key={i} className="j-stat-card card-hover border-0">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
              <div className={"j-stat-icon bg-gradient-to-br " + stat.color}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="j-stat-number leading-none">
                {stat.value}
                {stat.total ? <span className="text-sm font-semibold text-[var(--text-muted)]"> / {stat.total}</span> : null}
              </div>
              <div className="j-stat-label">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{ts('التقدم حسب الفئة','Progress by category')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.byCategory.map((cat) => (
            <div key={cat.value} className="flex items-center gap-3">
              <span className="text-sm w-28 shrink-0 text-[var(--text-secondary)] text-start truncate">{tsPick(cat.label, cat.labelEn)}</span>
              <div className="flex-1">
                <div className="j-progress-bar">
                  <div className="j-progress-fill" style={{ width: `${cat.count > 0 ? (cat.learned / cat.count) * 100 : 0}%` }} />
                </div>
              </div>
              <span className="text-xs text-[var(--text-muted)] w-14 shrink-0 text-end tabular-nums" dir="ltr">{cat.learned}/{cat.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pomodoro Timer */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">🍅</span>
            {ts('مؤقت بومودورو', 'Pomodoro Timer')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PomodoroTimer />
        </CardContent>
      </Card>

      {/* Weak Words — SRS Priority */}
      <WeakWordsSection onNavigate={onNavigate} />

      {/* Daily Plan */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--clr-success-bg)] flex items-center justify-center text-sm">📋</span>
            {ts('خطة اليوم', "Today's Plan")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { label: ts('راجع البطاقات المستحقة', 'Review due flashcards'), icon: '🔄', section: 'vocabulary' as Section, done: false },
              { label: ts('أكمل تمرين واحد', 'Complete one exercise'), icon: '✏️', section: 'practice' as Section, done: false },
              { label: ts('اقرأ قصة قصيرة', 'Read a short story'), icon: '📖', section: 'stories' as Section, done: false },
              { label: ts('تدرّب على المحادثات', 'Practice conversations'), icon: '💬', section: 'conversations' as Section, done: false },
            ].map((task) => (
              <button
                key={task.label}
                onClick={() => onNavigate(task.section)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-card-h)] hover:bg-[var(--clr-primary)]/10 transition-colors text-start"
              >
                <span className="text-lg">{task.icon}</span>
                <span className="text-sm font-medium text-[var(--text-secondary)]">{task.label}</span>
                <span className="ms-auto text-xs text-[var(--text-muted)]">{ts('←', '→')}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Weak Words Component ─────────────────────────────────────
function WeakWordsSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { vocabulary } = useActiveLevel()
  const store = useLearningStore()
  const { srsCards } = store
  const weakWordIds = getWeakWords(
    Object.values(srsCards) as any,
    5
  )
  const weakWords = vocabulary.filter(w => weakWordIds.includes(w.id))

  if (weakWords.length === 0) {
    return (
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--clr-warning-bg)] flex items-center justify-center text-sm">🎯</span>
            {ts('كلمات تحتاج مراجعة','Words to review')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            {ts('لا توجد كلمات ضعيفة بعد! استمر في التعلم 🌟','No weak words yet! Keep learning 🌟')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="j-card border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[var(--clr-warning-bg)] flex items-center justify-center text-sm">🎯</span>
          {ts('كلمات تحتاج انتباهك','Words needing attention')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {weakWords.map(w => (
            <button
              key={w.id}
              onClick={() => onNavigate('vocabulary')}
              className="px-3 py-2 rounded-xl bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30 text-sm hover:bg-[var(--clr-warning)]/20 transition-colors flex items-center gap-2"
            >
              <span className="font-chinese-serif font-bold text-[var(--text-primary)]">{w.zh}</span>
              <span className="text-xs text-[var(--text-muted)]">{tsPick(w.meaning, w.english)}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════
// VOCABULARY SECTION (Quizlet-Style Flashcards)
// ═══════════════════════════════════════════════════════════
