'use client'
import React from 'react'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { categories } from '@/data/content'
import { useLearningStore } from '@/lib/store'
import { speak } from '@/lib/helpers'
import type { Section } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen, GraduationCap, Gamepad2, BookMarked, Map, LayoutDashboard,
  Volume2, RotateCcw, Star, Flame, Sparkles, MessageCircle, Bot,
  Download, Lightbulb, RefreshCw, Play, Pause, Timer, Zap, Brain, Trophy,
  Target, Clock, Goal, History, TimerReset, BarChart3, Layers
} from 'lucide-react'
import QuickReviewWidget from './QuickReviewWidget'

function DashboardSection({ stats, onNavigate, timerMinutes, timerSeconds, timerRunning, timerMode, totalStudyMinutes, setTimerRunning, setTimerMinutes, setTimerSeconds, setTimerMode, dailyGoal, setDailyGoal, dailyProgress, dailyComplete }: {
  stats: { total: number; learned: number; progress: number; byCategory: { value: string; label: string; count: number; learned: number }[] }
  onNavigate: (s: Section) => void
  timerMinutes: number; timerSeconds: number; timerRunning: boolean; timerMode: 'focus' | 'break'; totalStudyMinutes: number
  setTimerRunning: (r: boolean) => void; setTimerMinutes: (m: number) => void; setTimerSeconds: (s: number) => void; setTimerMode: (m: 'focus' | 'break') => void
  dailyGoal: number; setDailyGoal: (g: number) => void; dailyProgress: number; dailyComplete: boolean
}) {
  const store = useLearningStore()
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-red-600" />
              لوحة التحكم
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
            <p className="text-gray-500 mt-1">مرحباً بك في رحلة تعلم اللغة الصينية!</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => {
              const summary = `📊 تقدمي في HSK 1\n${'═'.repeat(20)}\nالمفردات المحفوظة: ${stats.learned}/${stats.total} (${stats.progress}%)\nالأيام المتتالية: ${store.dailyStreak}\nالقواعد: 26 قاعدة\n\n${'═'.repeat(20)}\nتطبيق تعلم الصينية HSK 1 - 穆安`
              navigator.clipboard.writeText(summary)
            }}
          >
            <Download className="w-4 h-4" />
            مشاركة التقدم
          </Button>
        </div>
      </div>
      {/* Stats Cards with gradient mesh */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children bg-gradient-mesh rounded-2xl p-3 -m-3">
        {[
          { label: 'كلمة محفوظة', value: stats.learned, total: stats.total, icon: BookOpen, color: 'from-red-500 to-red-600' },
          { label: 'قاعدة نحوية', value: 26, total: 26, icon: GraduationCap, color: 'from-amber-500 to-amber-600' },
          { label: 'أيام متتالية', value: store.dailyStreak, icon: Flame, color: 'from-orange-500 to-orange-600' },
          { label: 'مستوى التقدم', value: stats.progress + "%", icon: Trophy, color: 'from-emerald-500 to-emerald-600' },
        ].map((stat, i) => (
          <Card key={i} className="action-card-hover border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={"w-10 h-10 rounded-lg bg-gradient-to-br " + stat.color + " flex items-center justify-center mb-3 shadow-lg shadow-black/10"}>
                {React.createElement(stat.icon, { className: "w-5 h-5 text-white" })}
              </div>
              <div className="text-2xl font-bold text-gray-900 animate-count">{stat.value}</div>
              {stat.total && <div className="text-xs text-gray-500">من {stat.total}</div>}
              <div className="text-xs text-gray-600 font-medium mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* ─── Daily Plan Card ─────────────────────────────── */}
      {(() => {
        const allWords = vocabulary
        const newWords = allWords.filter(w => !store.learnedWords.includes(w.id)).slice(0, 20)
        const dueCards = store.getDueCardIds()
        const reviewCount = dueCards.length
        return (
          <Card className="j-card border-0 shadow-sm bg-gradient-to-l from-red-50 via-orange-50/50 to-amber-50 dark:from-red-950/30 dark:via-orange-950/20 dark:to-amber-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-600" />
                خطة اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 text-center p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-red-100 dark:border-red-900/50">
                  <div className="text-2xl font-bold text-red-600">{newWords.length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">كلمة جديدة</div>
                </div>
                <div className="flex-1 text-center p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-amber-100 dark:border-amber-900/50">
                  <div className="text-2xl font-bold text-amber-600">{reviewCount}</div>
                  <div className="text-xs text-gray-500 mt-0.5">للمراجعة</div>
                </div>
              </div>
              <Button onClick={() => onNavigate('vocabulary')} className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white shadow-md">
                <Zap className="w-4 h-4 ml-2" /> ابدأ جلسة اليوم 🚀
              </Button>
            </CardContent>
          </Card>
        )
      })()}
      {/* Word of the Day */}
      {(() => {
        const today = new Date()
        const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % vocabulary.length
        const wordOfDay = vocabulary[dayIndex]
        return (
          <Card className="animated-border-wotd border-0 shadow-sm bg-gradient-to-l from-red-500 to-red-700 text-white overflow-hidden relative">
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold">كلمة اليوم</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  {wordOfDay.pos}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-chinese-serif text-4xl font-bold mb-1">{wordOfDay.zh}</div>
                  <div className="font-chinese-sans text-lg opacity-90">{wordOfDay.pinyin}</div>
                  <div className="text-white/80 mt-2 text-sm">{wordOfDay.meaning}</div>
                  {wordOfDay.mnemonic && (
                    <div className="text-white/60 text-xs mt-1">💡 {wordOfDay.mnemonic}</div>
                  )}
                </div>
                <button 
                  onClick={() => speak(wordOfDay.zh)}
                  className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <Volume2 className="w-7 h-7" />
                </button>
              </div>
            </CardContent>
            {/* Decorative Chinese characters */}
            <span className="absolute top-1 left-2 font-chinese-serif text-[120px] text-white/5 animate-float select-none pointer-events-none">学</span>
            <span className="absolute bottom-0 right-4 font-chinese-serif text-[80px] text-white/5 animate-float select-none pointer-events-none" style={{animationDelay:'1s'}}>语</span>
            <span className="absolute top-1/2 left-1/3 font-chinese-serif text-[60px] text-white/5 animate-float select-none pointer-events-none" style={{animationDelay:'2s'}}>文</span>
          </Card>
        )
      })()}
      {/* SRS Review Widget — Due Cards */}
      {(() => {
        const dueCards = store.getDueCardIds()
        const weakWords = store.getWeakWordIds(5)
        const dueWords = dueCards.slice(0, 5).map(id => vocabulary.find(w => w.id === id)).filter(Boolean) as VocabWord[]
        const weakVocab = weakWords.slice(0, 5).map(id => vocabulary.find(w => w.id === id)).filter(Boolean) as VocabWord[]
        if (dueWords.length === 0 && weakVocab.length === 0) return null
        return (
          <Card className="j-card border-0 shadow-sm bg-gradient-to-l from-purple-50 to-indigo-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                مراجعة ذكية (SRS)
                <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700 border-purple-200">
                  {dueCards.length} كلمة مستحقة
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dueWords.length > 0 && (
                <div>
                  <div className="text-xs text-purple-600 font-medium mb-2">📅 كلمات تحتاج مراجعة:</div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {dueWords.map(w => (
                      <button key={w.id} onClick={() => { store.setFlashcardIndex(vocabulary.findIndex(v => v.id === w.id)); onNavigate('vocabulary') }}
                        className="flex-shrink-0 px-3 py-2 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-center min-w-[70px]">
                        <div className="font-chinese-serif text-xl text-purple-800">{w.zh}</div>
                        <div className="text-[9px] text-purple-400 mt-0.5">{w.pinyin}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {weakVocab.length > 0 && (
                <div>
                  <div className="text-xs text-amber-600 font-medium mb-2">⚠️ كلمات تحتاج تركيز:</div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {weakVocab.map(w => (
                      <button key={w.id} onClick={() => { store.setFlashcardIndex(vocabulary.findIndex(v => v.id === w.id)); onNavigate('vocabulary') }}
                        className="flex-shrink-0 px-3 py-2 rounded-xl bg-white border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all text-center min-w-[70px]">
                        <div className="font-chinese-serif text-xl text-amber-800">{w.zh}</div>
                        <div className="text-[9px] text-amber-400 mt-0.5">{w.meaning}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={() => onNavigate('vocabulary')} variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                <RotateCcw className="w-3.5 h-3.5 ml-1" /> ابدأ المراجعة الذكية
              </Button>
            </CardContent>
          </Card>
        )
      })()}
      {/* Quick Review Mini-Flashcard */}
      <QuickReviewWidget />
      {/* Achievements / Badges */}
      {(() => {
        const achievements = [
          { id: 'first10', title: 'البداية', desc: 'حفظ 10 كلمات', icon: '🌱', condition: stats.learned >= 10, unlocked: stats.learned >= 10 },
          { id: 'first50', title: 'نصف الطريق', desc: 'حفظ 50 كلمة', icon: '🌿', condition: stats.learned >= 50, unlocked: stats.learned >= 50 },
          { id: 'word100', title: 'متعلم نشيط', desc: 'حفظ 100 كلمة', icon: '📖', condition: stats.learned >= 100, unlocked: stats.learned >= 100 },
          { id: 'word200', title: 'محترف المفردات', desc: 'حفظ 200 كلمة', icon: '📚', condition: stats.learned >= 200, unlocked: stats.learned >= 200 },
          { id: 'streak3', title: 'مثابر', desc: '3 أيام متتالية', icon: '🔥', condition: store.dailyStreak >= 3, unlocked: store.dailyStreak >= 3 },
          { id: 'streak7', title: 'أسبوع كامل', desc: '7 أيام متتالية', icon: '⚡', condition: store.dailyStreak >= 7, unlocked: store.dailyStreak >= 7 },
          { id: 'streak30', title: 'بطل الاستمرارية', desc: '30 يوم متتالي', icon: '🏆', condition: store.dailyStreak >= 30, unlocked: store.dailyStreak >= 30 },
          { id: 'master', title: 'إتقان HSK 1', desc: 'حفظ كل الكلمات', icon: '🎓', condition: stats.learned >= stats.total, unlocked: stats.learned >= stats.total },
        ]
        const unlockedCount = achievements.filter(a => a.unlocked).length
        return (
          <Card className="j-card border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                الإنجازات
                <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">{unlockedCount}/{achievements.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {achievements.map(a => (
                  <div key={a.id}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      a.unlocked 
                        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 badge-glow' 
                        : 'bg-gray-50 border border-gray-100 opacity-50'
                    }`}>
                    <span className={`text-2xl ${a.unlocked ? '' : 'grayscale'}`}>{a.icon}</span>
                    <span className={`text-[10px] font-medium text-center leading-tight ${a.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{a.title}</span>
                    <span className="text-[8px] text-gray-400 text-center">{a.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })()}
      {/* Study Tip of the Day */}
      <Card className="j-card border-0 shadow-sm bg-gradient-to-l from-amber-50 to-orange-50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-amber-600 font-medium mb-0.5">نصيحة اليوم</div>
            <div className="text-sm text-gray-700">
              {['千里之行，始于足下 — رحلة الألف ميل تبدأ بخطوة', '温故而知新 — المراجعة تفتح آفاقاً جديدة', '学而不思则罔 — التعلم بدون تفكير لا فائدة منه', '不怕慢，就怕停 — لا تخف من البطء، بل خف من التوقف', '熟能生巧 — الممارسة تصنع المعجزات'][new Date().getDate() % 5]}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Study Timer (Pomodoro) */}
      <Card className={`border-0 shadow-sm overflow-hidden relative ${timerRunning ? (timerMode === 'focus' ? 'ring-2 ring-red-300' : 'ring-2 ring-emerald-300') : ''}`}>
        <div className={`absolute inset-x-0 top-0 h-1 ${timerMode === 'focus' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'} ${timerRunning ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Timer className={`w-4 h-4 ${timerMode === 'focus' ? 'text-red-600' : 'text-emerald-600'}`} />
            مؤقت الدراسة
            <Badge variant="secondary" className={`text-[10px] ${timerMode === 'focus' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {timerMode === 'focus' ? '🔥 تركيز' : '☕ استراحة'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Timer Circle */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={timerMode === 'focus' ? 'var(--clr-danger)' : '#10b981'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={String(2 * Math.PI * 42)}
                  strokeDashoffset={String(2 * Math.PI * 42 * (1 - (timerMinutes * 60 + timerSeconds) / ((timerMode === 'focus' ? 25 : 5) * 60)))}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono text-gray-900">{String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}</span>
                <span className="text-[9px] text-gray-400">{timerMode === 'focus' ? 'تركيز' : 'استراحة'}</span>
              </div>
            </div>
            {/* Controls */}
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={timerRunning ? 'outline' : 'default'}
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={timerRunning ? '' : (timerMode === 'focus' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700')}
                >
                  {timerRunning ? <><Pause className="w-3.5 h-3.5 ml-1" /> إيقاف</> : <><Play className="w-3.5 h-3.5 ml-1" /> ابدأ</>}
                </Button>
                <Button
                  size="sm" variant="outline"
                  onClick={() => {
                    setTimerRunning(false)
                    setTimerMinutes(timerMode === 'focus' ? 25 : 5)
                    setTimerSeconds(0)
                  }}
                >
                  <TimerReset className="w-3.5 h-3.5 ml-1" /> إعادة
                </Button>
                <Button
                  size="sm" variant="outline"
                  onClick={() => {
                    setTimerRunning(false)
                    setTimerMode(timerMode === 'focus' ? 'break' : 'focus')
                    setTimerMinutes(timerMode === 'focus' ? 5 : 25)
                    setTimerSeconds(0)
                  }}
                  className="gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> تبديل
                </Button>
              </div>
              {/* Duration options */}
              <div className="flex gap-1">
                {timerMode === 'focus' ? [15, 25, 45].map(m => (
                  <button key={m} onClick={() => { setTimerMinutes(m); setTimerSeconds(0); setTimerRunning(false) }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${timerMinutes === m && !timerRunning ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {m} د
                  </button>
                )) : [3, 5, 10].map(m => (
                  <button key={m} onClick={() => { setTimerMinutes(m); setTimerSeconds(0); setTimerRunning(false) }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${timerMinutes === m && !timerRunning ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {m} د
                  </button>
                ))}
              </div>
            </div>
          </div>
          {totalStudyMinutes > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <History className="w-3 h-3" />
              <span>إجمالي وقت الدراسة اليوم: <span className="font-bold text-gray-700">{totalStudyMinutes} دقيقة</span></span>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Daily Goal Tracker */}
      <Card className={`border-0 shadow-sm ${dailyComplete ? 'ring-2 ring-emerald-200 bg-gradient-to-l from-emerald-50/50 to-transparent' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Goal className={`w-4 h-4 ${dailyComplete ? 'text-emerald-600' : 'text-amber-600'}`} />
              هدف اليوم
            </div>
            {dailyComplete && <span className="text-xs text-emerald-600 font-bold">✓ مكتمل!</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Progress value={(dailyProgress / dailyGoal) * 100} className="h-3" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{dailyProgress} كلمة محفوظة</span>
                  <span className="text-xs text-gray-500">الهدف: {dailyGoal}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                dailyComplete ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {dailyProgress}/{dailyGoal}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">الهدف اليومي:</span>
              {[5, 10, 15, 20, 30].map(g => (
                <button key={g} onClick={() => setDailyGoal(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    dailyGoal === g
                      ? 'bg-red-100 text-red-700 shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Daily Activity */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600" />
            نشاط اليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'كلمات مراجعة', target: 20, current: Math.min(store.learnedWords.length, 20), icon: BookOpen, color: 'text-red-600' },
              { label: 'أسئلة محلولة', target: 10, current: store.quizTotal > 0 ? Math.min(store.quizScore + (store.quizTotal - store.quizScore), 10) : 0, icon: Target, color: 'text-amber-600' },
              { label: 'ألعاب لعبها', target: 3, current: store.memoryPairs > 0 ? 1 : 0, icon: Gamepad2, color: 'text-emerald-600' },
              { label: 'قصص قرأها', target: 1, current: 0, icon: BookMarked, color: 'text-blue-600' },
             ].map((activity, i) => (
               <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                 {React.createElement(activity.icon, { className: "w-5 h-5 " + activity.color })}
                 <div className="flex-1">
                   <div className="text-xs text-gray-600">{activity.label}</div>
                   <Progress value={(activity.current / activity.target) * 100} className="h-1.5 mt-1" />
                 </div>
                 <span className="text-xs font-medium text-gray-500">{activity.current}/{activity.target}</span>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>

      {/* HSK Level Ring with animation */}
      <Card className="j-card border-0 shadow-sm">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative w-24 h-24 animate-progress-ring">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle 
                className="progress-ring-fill"
                cx="50" cy="50" r="42" fill="none" 
                stroke="url(#progress-gradient)" 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={String(2 * Math.PI * 42)}
                strokeDashoffset={String(2 * Math.PI * 42 * (1 - stats.progress / 100))}
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--clr-danger)" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{stats.progress}%</span>
              <span className="text-[10px] text-gray-500">HSK 1</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">مستوى HSK 1</h3>
            <p className="text-sm text-gray-500 mb-2">المستوى الأول - مبتدئ</p>
            <div className="text-xs text-gray-600">
              <div className="flex justify-between mb-1">
                <span>المفردات: {stats.learned}/{stats.total}</span>
                <span>{stats.progress}%</span>
              </div>
              <Progress value={stats.progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Progress */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">التقدم حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.byCategory.map((cat) => (
            <div key={cat.value} className="flex items-center gap-3">
              <span className="text-sm w-20 text-gray-600 text-left">{cat.label}</span>
              <div className="flex-1">
                <Progress value={cat.count > 0 ? (cat.learned / cat.count) * 100 : 0} className="h-2" />
              </div>
              <span className="text-xs text-gray-500 w-16 text-left">{cat.learned}/{cat.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Word Categories Overview */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-600" />
            فئات المفردات
            <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700">{categories.length - 1} فئة</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(() => {
              const categoryColors: Record<string, { bg: string; border: string; text: string; bar: string; icon: string }> = {
                noun:      { bg: 'bg-red-50',       border: 'border-red-200',       text: 'text-red-700',     bar: 'bg-red-500',     icon: '🔴' },
                verb:      { bg: 'bg-teal-50',      border: 'border-teal-200',      text: 'text-teal-700',    bar: 'bg-teal-500',    icon: '🟢' },
                adjective: { bg: 'bg-emerald-50',   border: 'border-emerald-200',   text: 'text-emerald-700', bar: 'bg-emerald-500', icon: '🟩' },
                pronoun:   { bg: 'bg-orange-50',    border: 'border-orange-200',    text: 'text-orange-700',  bar: 'bg-orange-500',  icon: '🟠' },
                numeral:   { bg: 'bg-amber-50',     border: 'border-amber-200',     text: 'text-amber-700',   bar: 'bg-amber-500',   icon: '🟡' },
                particle:  { bg: 'bg-rose-50',      border: 'border-rose-200',      text: 'text-rose-700',    bar: 'bg-rose-500',    icon: '🩷' },
                adverb:    { bg: 'bg-cyan-50',      border: 'border-cyan-200',      text: 'text-cyan-700',    bar: 'bg-cyan-500',    icon: '🩵' },
                fixed:     { bg: 'bg-pink-50',      border: 'border-pink-200',      text: 'text-pink-700',    bar: 'bg-pink-500',    icon: '🩲' },
              }
              const catData = categories.filter(c => c.value !== 'all').map(cat => {
                const words = vocabulary.filter(w => w.pos === cat.value)
                const learned = words.filter(w => store.learnedWords.includes(w.id)).length
                const colors = categoryColors[cat.value] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', bar: 'bg-gray-500', icon: '⚪' }
                return { ...cat, count: words.length, learned, ...colors }
              })
              return catData.map(cat => (
                <div key={cat.value} className={`rounded-xl border ${cat.border} ${cat.bg} p-3 transition-all hover:shadow-md hover:scale-[1.02] cursor-default`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold ${cat.text}`}>{cat.label}</span>
                    <span className="text-lg">{cat.icon}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>{cat.learned} محفوظة</span>
                    <span>{cat.count} كلمة</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`${cat.bar} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${cat.count > 0 ? (cat.learned / cat.count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            })()}
          </div>
        </CardContent>
      </Card>
      {/* Weekly Activity Chart */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            نشاط الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const dayNamesAr = ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد']
            const today = new Date()
            const days: { label: string; key: string; wordsLearned: number; questionsAnswered: number }[] = []
            for (let i = 6; i >= 0; i--) {
              const d = new Date(today)
              d.setDate(d.getDate() - i)
              const dayKey = d.toISOString().split('T')[0]
              const act = store.dailyActivity[dayKey]
              // Get day of week: 0=Sun, 1=Mon, ..., 6=Sat → map to our labels
              const dow = d.getDay()
              const labelIndex = dow === 0 ? 6 : dow - 1 // Mon=0, Tue=1, ..., Sun=6
              days.push({
                label: dayNamesAr[labelIndex],
                key: dayKey,
                wordsLearned: act?.wordsLearned || 0,
                questionsAnswered: act?.questionsAnswered || 0,
              })
            }
            const maxWords = Math.max(...days.map(d => d.wordsLearned), 1)
            return (
              <div>
                <div className="flex items-end justify-between gap-2 h-32 mb-2">
                  {days.map((day, i) => (
                    <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium text-gray-600">{day.wordsLearned > 0 ? day.wordsLearned : ''}</span>
                      <div className="w-full flex flex-col items-center gap-0.5">
                        <div className="w-full flex gap-0.5" style={{ height: '80px', alignItems: 'flex-end' }}>
                          <div
                            className="flex-1 bg-gradient-to-t from-red-500 to-red-400 rounded-t-md transition-all duration-500 min-h-[4px]"
                            style={{ height: `${Math.max((day.wordsLearned / maxWords) * 100, day.wordsLearned > 0 ? 8 : 2)}%` }}
                          />
                          <div
                            className="flex-1 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md transition-all duration-500 min-h-[4px]"
                            style={{ height: `${Math.max((day.questionsAnswered / maxWords) * 100, day.questionsAnswered > 0 ? 8 : 2)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  {days.map(day => (
                    <span key={day.key} className={`flex-1 text-center text-[10px] font-medium ${day.key === today.toISOString().split('T')[0] ? 'text-red-600' : 'text-gray-400'}`}>
                      {day.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <div className="w-3 h-3 rounded bg-gradient-to-t from-red-500 to-red-400" />
                    كلمات محفوظة
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <div className="w-3 h-3 rounded bg-gradient-to-t from-amber-500 to-amber-400" />
                    أسئلة محلولة
                  </div>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>
      {/* Streak Calendar Heatmap */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            تقويم الاستمرارية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {(() => {
              const dayNames = ['أحد','إثن','ثلا','أرب','خمي','جمع','سبت']
              const today = new Date()
              const streak = store.dailyStreak
              const cells: { day: number; active: boolean; today: boolean }[] = []
              for (let i = 27; i >= 0; i--) {
                const d = new Date(today)
                d.setDate(d.getDate() - i)
                const dayAgo = Math.floor((today.getTime() - d.getTime()) / 86400000)
                cells.push({ day: d.getDate(), active: dayAgo < streak && streak > 0, today: i === 0 })
              }
              return (
                <>
                  {dayNames.map(d => <div key={d} className="text-[9px] text-gray-400 text-center font-medium">{d}</div>)}
                  {Array.from({length: (today.getDay()) % 7}).map((_,i) => <div key={`pad-${i}`} />)}
                  {cells.map((c, i) => (
                    <div key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all
                        ${c.active ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm shadow-red-200' : 'bg-gray-100 text-gray-400'}
                        ${c.today ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}>
                      {c.day}
                    </div>
                  ))}
                </>
              )
            })()}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {store.dailyStreak} يوم متتالي</span>
            <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-500" /> هدف: 30 يوم</span>
          </div>
        </CardContent>
      </Card>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { section: 'vocabulary' as Section, label: 'مراجعة المفردات', desc: `${stats.total} كلمة بالبطاقات`, icon: BookOpen, color: 'from-red-500 to-red-600', bgLight: 'bg-red-50' },
          { section: 'sentences' as Section, label: 'إتقان الجمل', desc: 'تدرب على الجمل اليومية', icon: MessageCircle, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50' },
          { section: 'chat' as Section, label: 'المساعد الذكي', desc: 'اسأل وسأجيبك', icon: Bot, color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50' },
          { section: 'practice' as Section, label: 'تمارين اليوم', desc: 'اختبر معلوماتك', icon: Target, color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50' },
          { section: 'games' as Section, label: 'العب وتعلم', desc: 'ألعاب تعليمية ممتعة', icon: Gamepad2, color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50' },
          { section: 'stories' as Section, label: 'اقرأ قصة', desc: '7 قصص بالمفردات الأساسية', icon: BookMarked, color: 'from-cyan-500 to-cyan-600', bgLight: 'bg-cyan-50' },
          { section: 'grammar' as Section, label: 'تعلم القواعد', desc: '26 قاعدة نحوية', icon: GraduationCap, color: 'from-indigo-500 to-indigo-600', bgLight: 'bg-indigo-50' },
          { section: 'roadmap' as Section, label: 'خريطة الطريق', desc: 'خطة 10 ساعات', icon: Map, color: 'from-rose-500 to-rose-600', bgLight: 'bg-rose-50' },
         ].map((action) => (
           <Card
             key={action.section}
             className="action-card-hover border-0 shadow-sm cursor-pointer group overflow-hidden"
             onClick={() => onNavigate(action.section)}
           >
             <CardContent className="p-4 flex items-start gap-3 relative z-10">
               <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                 {React.createElement(action.icon, { className: "w-5 h-5 text-white" })}
               </div>
               <div>
                 <div className="font-medium text-gray-900 text-sm">{action.label}</div>
                 <div className="text-xs text-gray-500">{action.desc}</div>
               </div>
             </CardContent>
             {/* Hover gradient overlay */}
             <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
           </Card>
         ))}
      </div>
    </div>
  )
}

export default DashboardSection
