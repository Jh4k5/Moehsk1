'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useLearningStore, type Section, type UserInfo } from '@/lib/store'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import LessonSystem from '@/components/LessonSystem'
import ConversationsSection from '@/components/sections/ConversationsSection'
import PronunciationSection from '@/components/sections/PronunciationSection'
import { ExamSection } from '@/components/sections/ExamSection'
import { VisualDictSection } from '@/components/sections/VisualDictSection'
import { AchievementsSection } from '@/components/sections/AchievementsSection'
import { grammarRules } from '@/data/grammar'
import { categories, stories, tonePairs, grammarPracticeQuestions, roadmapUnits } from '@/data/content'
import { conversations } from '@/data/conversations'
import { VISUAL_DICT_CATEGORIES } from '@/data/visualDict'
import { ACHIEVEMENTS } from '@/data/achievements'
import { initials, finals, tones as pinyinTones, specialSounds, toneSandhiRules, commonCombinations } from '@/data/pinyin'
import { HSK1_EXAM_BANK } from '@/data/examBank'
import { speak, getChatResponse, allSentences } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen, GraduationCap, Gamepad2, BookMarked, Map, LayoutDashboard,
  Volume2, ChevronLeft, ChevronRight, RotateCcw, Star, Check, X,
  Brain, Trophy, Target, Sparkles, Search, Filter, Eye, Heart,
  Clock, Flame, Languages, MessageCircle, Bot, Send, Lightbulb, PenTool,
  FileText, Medal, Image, BookOpenText, MessageSquare, Mic, Menu,
  LogOut, User, Zap, Play, Pause, Timer, Layers, BarChart3, Goal,
  History, TimerReset, Download, BookmarkPlus, Link, Ear, Music,
  Keyboard, Hash, Award, Lock, Unlock, ArrowLeftRight
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════
function LoginScreen() {
  const { setUser } = useLearningStore()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const body = isRegister ? { name, email, password } : { email, password }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setUser(data)
    } catch { setError('خطأ في الاتصال') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1CB0F6] flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ borderBottom: '4px solid #0A90D4' }}>
            <span className="font-chinese-serif text-white text-3xl font-bold">汉</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">مُضَّن — Mudann</h1>
          <p className="text-gray-500 mt-1">منصة تعلم اللغة الصينية HSK 1</p>
        </div>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-center">{isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">{error}</div>}
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">الاسم</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">البريد الإلكتروني</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="example@email.com" dir="ltr" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">كلمة المرور</label>
              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" dir="ltr" />
            </div>
            <Button onClick={handleSubmit} disabled={loading || !email || !password} className="w-full bg-[#1CB0F6] hover:bg-[#0A90D4] text-white h-11 font-bold">
              {loading ? 'جارٍ...' : isRegister ? 'إنشاء حساب' : 'دخول'}
            </Button>
            <Button onClick={() => setUser({ id: 'guest', name: 'زائر', email: 'guest@mudann.com', dailyStreak: 0, lastStudyDate: null, totalXP: 0, dailyGoal: 10 })} variant="outline" className="w-full h-11">
              متابعة كزائر
            </Button>
            <button onClick={() => { setIsRegister(!isRegister); setError('') }} className="w-full text-center text-sm text-blue-600 hover:underline">
              {isRegister ? 'لديك حساب؟ سجل دخول' : 'ليس لديك حساب؟ أنشئ واحداً'}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION ITEMS
// ═══════════════════════════════════════════════════════════
const mainNavItems: { id: Section; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'lessons', label: 'الدروس', icon: BookOpenText },
]

const sidebarSections = [
  {
    title: 'التعلم',
    items: [
      { id: 'vocabulary' as Section, label: 'المفردات والنطق', icon: BookOpen },
      { id: 'grammar' as Section, label: 'القواعد', icon: GraduationCap },
      { id: 'sentences' as Section, label: 'الجمل', icon: MessageCircle },
      { id: 'stories' as Section, label: 'القصص', icon: BookMarked },
    ],
  },
  {
    title: 'التدريب',
    items: [
      { id: 'practice' as Section, label: 'التمارين', icon: Target },
      { id: 'games' as Section, label: 'الألعاب', icon: Gamepad2 },
      { id: 'exam' as Section, label: 'محاكي الامتحان', icon: FileText },
    ],
  },
  {
    title: 'الأدوات',
    items: [
      { id: 'pinyin' as Section, label: 'البينين', icon: Languages },
      { id: 'hanzi' as Section, label: 'الحروف', icon: PenTool },
      { id: 'visual-dict' as Section, label: 'القاموس البصري', icon: Image },
      { id: 'conversations' as Section, label: 'المحادثات', icon: MessageSquare },
      { id: 'pronunciation' as Section, label: 'تدريب النطق', icon: Mic },
    ],
  },
  {
    title: 'أخرى',
    items: [
      { id: 'roadmap' as Section, label: 'خريطة الطريق', icon: Map },
      { id: 'achievements' as Section, label: 'الإنجازات', icon: Medal },
      { id: 'chat' as Section, label: 'المساعد الذكي', icon: Bot },
    ],
  },
]

const allNavItems = [...mainNavItems, ...sidebarSections.flatMap(s => s.items)]

// ═══════════════════════════════════════════════════════════
// SIDEBAR COMPONENT
// ═══════════════════════════════════════════════════════════
function Sidebar({ stats }: { stats: { total: number; learned: number; progress: number } }) {
  const { currentSection, setCurrentSection, sidebarOpen, setSidebarOpen, user, setUser, dailyStreak } = useLearningStore()

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <aside className={"fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-100 shadow-xl z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto " + (sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0")}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1CB0F6] flex items-center justify-center shadow-sm" style={{ borderBottom: '3px solid #0A90D4' }}>
                  <span className="font-chinese-serif text-white text-xl font-bold">汉</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">مُضَّن</h1>
                  <p className="text-[10px] text-gray-500">HSK 1 — {stats.total} كلمة</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {/* User info */}
            {user && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1CB0F6] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-900">{user.name}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {dailyStreak} يوم</div>
                  </div>
                </div>
                <button onClick={() => setUser(null)} className="p-1 text-gray-400 hover:text-red-500"><LogOut className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Main Nav */}
          <div className="flex gap-1 p-3 border-b border-gray-100">
            {mainNavItems.map(item => (
              <button key={item.id} onClick={() => setCurrentSection(item.id)}
                className={"flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all " + (currentSection === item.id ? "bg-[#E0F6FF] text-[#0A90D4] shadow-sm" : "text-gray-500 hover:bg-gray-50")}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Scrollable sections */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
            {sidebarSections.map(section => (
              <div key={section.title}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{section.title}</div>
                <div className="space-y-0.5">
                  {section.items.map(item => (
                    <button key={item.id} onClick={() => setCurrentSection(item.id)}
                      className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all " + (currentSection === item.id ? "bg-[#E0F6FF] text-[#0A90D4] shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
                      <item.icon className={currentSection === item.id ? "w-4 h-4 text-[#1CB0F6]" : "w-4 h-4 text-gray-400"} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Progress footer */}
          <div className="p-3 border-t border-gray-100">
            <div className="bg-gradient-to-l from-blue-50 to-red-50 rounded-xl p-3">
              <div className="text-xs text-gray-600 mb-1 font-medium">التقدم العام</div>
              <div className="progress-duo mb-1">
                <div className="progress-duo-fill" style={{ width: stats.progress + '%' }} />
              </div>
              <div className="text-[10px] text-gray-500 text-center">{stats.learned}/{stats.total} كلمة ({stats.progress}%)</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD SECTION
// ═══════════════════════════════════════════════════════════
function DashboardSection({ stats, onNavigate }: { stats: { total: number; learned: number; progress: number }; onNavigate: (s: Section) => void }) {
  const store = useLearningStore()
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus')
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(10)

  useEffect(() => {
    if (!timerRunning) return
    const t = setInterval(() => {
      setTimerSeconds(s => {
        if (s === 0) {
          setTimerMinutes(m => {
            if (m <= 1) {
              setTimerRunning(false)
              setTimerMode(prev => prev === 'focus' ? 'break' : 'focus')
              setTimerMinutes(prev => prev === 25 ? 5 : 25)
              setTotalStudyMinutes(st => st + (timerMode === 'focus' ? 25 : 5))
              return timerMode === 'focus' ? 5 : 25
            }
            return m - 1
          })
          return 59
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [timerRunning, timerMode])

  const dailyProgress = stats.learned
  const dailyComplete = dailyProgress >= dailyGoal

  const wordOfDay = useMemo(() => {
    const today = new Date()
    const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % vocabulary.length
    return vocabulary[dayIndex]
  }, [])

  const dueCards = store.getDueCardIds()
  const newWords = vocabulary.filter(w => !store.learnedWords.includes(w.id)).slice(0, 20)
  const dueWords = dueCards.slice(0, 5).map(id => vocabulary.find(w => w.id === id)).filter(Boolean) as VocabWord[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">مرحباً، {store.user?.name || 'متعلم'}! 👋</h2>
          <p className="text-sm text-gray-500">واصل رحلتك في تعلم الصينية</p>
        </div>
        <Badge className="gap-1 bg-amber-50 text-amber-700 border-amber-200"><Flame className="w-3 h-3 text-amber-500" />{store.dailyStreak} يوم</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'كلمة محفوظة', value: stats.learned, icon: BookOpen, color: 'from-red-500 to-red-600' },
          { label: 'قاعدة نحوية', value: grammarRules.length, icon: GraduationCap, color: 'from-amber-500 to-amber-600' },
          { label: 'أيام متتالية', value: store.dailyStreak, icon: Flame, color: 'from-orange-500 to-orange-600' },
          { label: 'مستوى التقدم', value: stats.progress + '%', icon: Trophy, color: 'from-emerald-500 to-emerald-600' },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-default">
            <CardContent className="p-4">
              <div className={"w-9 h-9 rounded-lg bg-gradient-to-br " + stat.color + " flex items-center justify-center mb-2"}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Daily Plan */}
        <Card className="border-0 shadow-sm bg-gradient-to-l from-red-50 via-orange-50/50 to-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-red-600" />خطة اليوم</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 text-center p-2 rounded-xl bg-white border border-red-100">
                <div className="text-xl font-bold text-red-600">{newWords.length}</div>
                <div className="text-[10px] text-gray-500">كلمة جديدة</div>
              </div>
              <div className="flex-1 text-center p-2 rounded-xl bg-white border border-amber-100">
                <div className="text-xl font-bold text-amber-600">{dueCards.length}</div>
                <div className="text-[10px] text-gray-500">للمراجعة</div>
              </div>
            </div>
            <Button onClick={() => onNavigate('vocabulary')} className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white">ابدأ جلسة اليوم</Button>
          </CardContent>
        </Card>

        {/* Word of the Day */}
        <Card className="border-0 shadow-sm bg-gradient-to-l from-red-500 to-red-700 text-white overflow-hidden relative">
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" /><span className="font-bold text-sm">كلمة اليوم</span></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-chinese-serif text-3xl font-bold mb-0.5">{wordOfDay.zh}</div>
                <div className="font-chinese-sans text-sm opacity-90">{wordOfDay.pinyin}</div>
                <div className="text-white/80 text-sm mt-1">{wordOfDay.meaning}</div>
              </div>
              <button onClick={() => speak(wordOfDay.zh)} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
          </CardContent>
          <span className="absolute top-1 left-2 font-chinese-serif text-[100px] text-white/5 select-none pointer-events-none">学</span>
        </Card>
      </div>

      {/* SRS Review */}
      {dueWords.length > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-l from-purple-50 to-indigo-50/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-purple-600" />مراجعة ذكية<Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700">{dueCards.length} كلمة</Badge></CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dueWords.map(w => (
                <button key={w.id} onClick={() => { store.setFlashcardIndex(vocabulary.findIndex(v => v.id === w.id)); onNavigate('vocabulary') }}
                  className="flex-shrink-0 px-3 py-2 rounded-xl bg-white border border-purple-100 hover:border-purple-300 transition-all text-center min-w-[60px]">
                  <div className="font-chinese-serif text-lg text-purple-800">{w.zh}</div>
                  <div className="text-[9px] text-purple-400">{w.pinyin}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer + Goal */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Timer className="w-4 h-4 text-red-600" />مؤقت الدراسة</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold font-mono text-gray-900">{String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}</div>
              <div className="flex gap-2">
                <Button size="sm" variant={timerRunning ? 'outline' : 'default'} onClick={() => setTimerRunning(!timerRunning)}
                  className={timerRunning ? '' : (timerMode === 'focus' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700')}>
                  {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setTimerRunning(false); setTimerMinutes(timerMode === 'focus' ? 25 : 5); setTimerSeconds(0) }}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
              <Badge variant="secondary" className={"text-[10px] " + (timerMode === 'focus' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>
                {timerMode === 'focus' ? 'تركيز' : 'استراحة'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className={"border-0 shadow-sm " + (dailyComplete ? 'ring-2 ring-emerald-200' : '')}>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Goal className="w-4 h-4 text-amber-600" />هدف اليوم {dailyComplete && <span className="text-xs text-emerald-600">✓</span>}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1"><Progress value={(dailyProgress / dailyGoal) * 100} className="h-2.5" /></div>
              <span className="text-xs text-gray-500">{dailyProgress}/{dailyGoal}</span>
            </div>
            <div className="flex gap-1 mt-2">
              {[5, 10, 15, 20].map(g => (
                <button key={g} onClick={() => setDailyGoal(g)} className={"px-2 py-0.5 rounded text-[10px] font-medium " + (dailyGoal === g ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500')}>{g}</button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">الوصول السريع</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { section: 'vocabulary' as Section, label: 'المفردات', desc: '410 كلمة', icon: BookOpen, color: 'from-red-500 to-red-600' },
            { section: 'practice' as Section, label: 'التمارين', desc: 'اختبر معلوماتك', icon: Target, color: 'from-amber-500 to-amber-600' },
            { section: 'games' as Section, label: 'الألعاب', desc: 'تعلم باللعب', icon: Gamepad2, color: 'from-emerald-500 to-emerald-600' },
            { section: 'stories' as Section, label: 'القصص', desc: '7 قصص', icon: BookMarked, color: 'from-cyan-500 to-cyan-600' },
          ].map(a => (
            <Card key={a.section} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(a.section)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={"w-9 h-9 rounded-lg bg-gradient-to-br " + a.color + " flex items-center justify-center"}><a.icon className="w-4 h-4 text-white" /></div>
                <div><div className="text-sm font-medium">{a.label}</div><div className="text-[10px] text-gray-500">{a.desc}</div></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// VOCABULARY SECTION (Quizlet-style + Pronunciation)
// ═══════════════════════════════════════════════════════════
function VocabularySection() {
  const store = useLearningStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [vocabTab, setVocabTab] = useState<'cards' | 'learn' | 'test' | 'list'>('cards')
  const [showPinyin, setShowPinyin] = useState(true)
  const [learnInput, setLearnInput] = useState('')
  const [learnCorrect, setLearnCorrect] = useState(0)
  const [learnRound, setLearnRound] = useState(0)
  const [learnWords, setLearnWords] = useState<VocabWord[]>([])
  const [showPronunciation, setShowPronunciation] = useState(false)
  const [pronScore, setPronScore] = useState<number | null>(null)
  const [pronListening, setPronListening] = useState(false)
  const pronRef = useRef<NodeJS.Timeout | null>(null)

  const filteredVocab = useMemo(() => {
    return vocabulary.filter(w => {
      const matchSearch = !searchQuery || w.zh.includes(searchQuery) || w.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) || w.meaning.includes(searchQuery)
      const matchCat = selectedCategory === 'all' || w.pos === selectedCategory
      return matchSearch && matchCat
    })
  }, [searchQuery, selectedCategory])

  const word = filteredVocab[store.flashcardIndex]

  // Pronunciation recognition
  const startPronunciation = () => {
    if (!word || typeof window === 'undefined' || !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SpeechRec()
    rec.lang = 'zh-CN'
    rec.interimResults = false
    rec.maxAlternatives = 5
    setPronListening(true)
    setPronScore(null)
    rec.onresult = (e: any) => {
      const results = e.results[0]
      let bestMatch = 0
      for (let i = 0; i < results.length; i++) {
        const similarity = results[i].transcript.toLowerCase().includes(word.zh.toLowerCase()) ? 1 :
          (results[i].confidence || 0)
        if (similarity > bestMatch) bestMatch = similarity
      }
      const score = Math.round(bestMatch * 100)
      setPronScore(score)
      setPronListening(false)
      if (score >= 85) store.toggleLearned(word.id)
    }
    rec.onerror = () => { setPronListening(false) }
    rec.onend = () => { setPronListening(false) }
    rec.start()
  }

  // Learn mode
  const startLearn = () => {
    const words = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 20)
    setLearnWords(words)
    setLearnRound(0)
    setLearnCorrect(0)
    setLearnInput('')
    setVocabTab('learn')
  }

  if (vocabTab === 'learn' && learnWords.length > 0) {
    const cw = learnWords[learnRound]
    if (!cw) return <div className="text-center py-12"><h3 className="text-xl font-bold mb-2">أحسنت! 🎉</h3><p className="text-gray-500">حصلت على {learnCorrect}/{learnWords.length}</p><Button onClick={() => setVocabTab('cards')} className="mt-4">عودة</Button></div>
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">وضع التعلم ({learnRound + 1}/{learnWords.length})</h2>
          <Badge>{learnCorrect} صحيح</Badge>
        </div>
        <Progress value={(learnRound / learnWords.length) * 100} className="h-2" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="font-chinese-serif text-5xl">{cw.zh}</div>
            <div className="font-chinese-sans text-lg text-gray-500">{cw.pinyin}</div>
            <button onClick={() => speak(cw.zh)} className="mx-auto p-2 rounded-full bg-blue-50 hover:bg-blue-100"><Volume2 className="w-5 h-5 text-blue-600" /></button>
            <Input value={learnInput} onChange={e => setLearnInput(e.target.value)} placeholder="اكتب المعنى بالعربية..." className="text-center max-w-xs mx-auto" dir="rtl"
              onKeyDown={e => {
                if (e.key === 'Enter' && learnInput.trim()) {
                  const isCorrect = cw.meaning.includes(learnInput.trim()) || learnInput.trim().includes(cw.meaning.split('/')[0].trim())
                  if (isCorrect) setLearnCorrect(c => c + 1)
                  setLearnRound(r => r + 1)
                  setLearnInput('')
                }
              }}
            />
            <Button onClick={() => { setLearnRound(r => r + 1); setLearnInput('') }} variant="outline" className="text-sm">تخطي</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-red-600" />المفردات والنطق</h2>
        <Badge variant="secondary">{filteredVocab.length} كلمة</Badge>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ابحث..." className="pr-10" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {[
          { key: 'cards' as const, label: 'البطاقات' },
          { key: 'learn' as const, label: 'تعلّم' },
          { key: 'list' as const, label: 'القائمة' },
        ].map(tab => (
          <button key={tab.key} onClick={() => tab.key === 'learn' ? startLearn() : setVocabTab(tab.key)}
            className={"flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all " + (vocabTab === tab.key ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {tab.label}
          </button>
        ))}
        <button onClick={() => setShowPronunciation(!showPronunciation)}
          className={"flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all " + (showPronunciation ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
          <Mic className="w-3.5 h-3.5" /> النطق
        </button>
      </div>

      {/* Pronunciation Panel */}
      {showPronunciation && word && (
        <Card className="border-0 shadow-sm bg-gradient-to-l from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2"><Mic className="w-4 h-4 text-purple-600" />تدريب النطق</h3>
              {pronScore !== null && (
                <Badge className={pronScore >= 85 ? 'bg-green-100 text-green-700' : pronScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                  {pronScore >= 85 ? 'ممتاز!' : pronScore >= 60 ? 'جيد' : 'حاول مجدداً'} {pronScore}%
                </Badge>
              )}
            </div>
            <div className="text-center space-y-3">
              <button onClick={() => speak(word.zh)} className="font-chinese-serif text-4xl text-purple-800 hover:text-purple-600 transition-colors">{word.zh}</button>
              <div className="font-chinese-sans text-gray-500">{word.pinyin}</div>
              <Button onClick={startPronunciation} disabled={pronListening}
                className={pronListening ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}>
                <Mic className={"w-4 h-4 ml-2 " + (pronListening ? 'animate-pulse' : '')} />
                {pronListening ? 'جارٍ الاستماع...' : 'انطق الكلمة'}
              </Button>
              <p className="text-xs text-gray-400">انطق الكلمة بالصينية وسيتم تقييم نطقك تلقائياً</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flashcard */}
      {vocabTab === 'cards' && word && (
        <div className="space-y-4">
          <div className="perspective-1000 w-full">
            <div className={"relative w-full min-h-[240px] cursor-pointer transition-transform duration-500 preserve-3d " + (store.isFlipped ? 'rotate-y-180' : '')}
              onClick={() => store.flip()}>
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white via-red-50/30 to-white rounded-2xl flex flex-col items-center justify-center p-6 gap-3 border border-gray-100">
                <div className="absolute top-3 right-3 flex gap-1">
                  <Badge variant="outline" className="text-[10px]">{word.pos}</Badge>
                </div>
                <div className="font-chinese-serif text-6xl text-gray-900" onClick={e => { e.stopPropagation(); speak(word.zh) }}>{word.zh}</div>
                {showPinyin && <div className="font-chinese-sans text-lg text-gray-500">{word.pinyin}</div>}
                <p className="text-xs text-gray-400">اضغط للنطق • انقر للقلب</p>
              </div>
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-white via-amber-50/30 to-white rounded-2xl flex flex-col items-center justify-center p-5 border border-gray-100">
                <div className="text-center mb-2">
                  <div className="font-chinese-serif text-3xl font-bold text-gray-900 mb-1">{word.zh}</div>
                  <div className="font-chinese-sans text-sm text-gray-500">{word.pinyin}</div>
                  <div className="text-lg font-bold text-red-600 mt-1">{word.meaning}</div>
                </div>
                {word.mnemonic && <div className="bg-blue-50 rounded-lg px-3 py-2 text-center"><span className="text-xs text-blue-600">💡 {word.mnemonic}</span></div>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => store.setFlashcardIndex(Math.max(0, store.flashcardIndex - 1))} disabled={store.flashcardIndex === 0}><ChevronRight className="w-4 h-4" />السابق</Button>
            <Button size="sm" variant={store.isLearned(word.id) ? 'default' : 'outline'}
              onClick={() => store.toggleLearned(word.id)}
              className={store.isLearned(word.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
              {store.isLearned(word.id) ? <><Check className="w-4 h-4 ml-1" />تم</> : <><Star className="w-4 h-4 ml-1" />حفظ</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => speak(word.zh)}><Volume2 className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => store.setFlashcardIndex(Math.min(filteredVocab.length - 1, store.flashcardIndex + 1))} disabled={store.flashcardIndex >= filteredVocab.length - 1}>التالي<ChevronLeft className="w-4 h-4" /></Button>
          </div>
          <div className="text-center text-xs text-gray-400">{store.flashcardIndex + 1} / {filteredVocab.length}</div>
        </div>
      )}

      {/* Word List */}
      {vocabTab === 'list' && (
        <Card className="border-0 shadow-sm">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-gray-50">
            {filteredVocab.map(w => (
              <button key={w.id} onClick={() => { store.setFlashcardIndex(filteredVocab.findIndex(v => v.id === w.id)); setVocabTab('cards') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-gray-50 transition-colors">
                <span className="font-chinese-serif text-lg w-16">{w.zh}</span>
                <span className="text-[11px] text-gray-500 font-chinese-sans w-24">{w.pinyin}</span>
                <span className="text-sm text-gray-700 flex-1">{w.meaning}</span>
                {store.isLearned(w.id) && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                {store.isBookmarked(w.id) && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LESSON DETAIL
// ═══════════════════════════════════════════════════════════
function LessonDetail({ lessonNum, words, onBack }: { lessonNum: number; words: VocabWord[]; onBack: () => void }) {
  const [wordIdx, setWordIdx] = useState(0)
  const cw = words[wordIdx]
  if (!cw) return null
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ChevronRight className="w-4 h-4" />العودة للدروس</button>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">الدرس {lessonNum}</h2>
        <Badge>{wordIdx + 1}/{words.length}</Badge>
      </div>
      <Progress value={((wordIdx + 1) / words.length) * 100} className="h-2" />
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center space-y-4">
          <div className="font-chinese-serif text-6xl text-gray-900 cursor-pointer hover:text-red-600 transition-colors" onClick={() => speak(cw.zh)}>{cw.zh}</div>
          <div className="font-chinese-sans text-xl text-gray-500">{cw.pinyin}</div>
          <div className="text-xl font-bold text-red-600">{cw.meaning}</div>
          {cw.mnemonic && <div className="bg-blue-50 rounded-lg px-3 py-2 inline-block"><span className="text-sm text-blue-600">💡 {cw.mnemonic}</span></div>}
          <div className="bg-gray-50 rounded-lg p-3 text-right">
            <div className="text-xs text-gray-500 mb-1">مثال:</div>
            <div className="font-chinese-sans text-sm text-gray-800">{cw.exZh}</div>
            <div className="text-xs text-gray-500">{cw.exPinyin}</div>
            <div className="text-xs text-gray-600">{cw.exEn}</div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setWordIdx(Math.max(0, wordIdx - 1))} disabled={wordIdx === 0}>السابق</Button>
        <Button onClick={() => { if (wordIdx < words.length - 1) setWordIdx(wordIdx + 1); else onBack() }}>
          {wordIdx < words.length - 1 ? 'التالي' : 'إنهاء الدرس'}
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LESSONS SECTION
// ═══════════════════════════════════════════════════════════
function LessonsSection() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const lessonWords = useMemo(() => {
    if (selectedLesson === null) return []
    return vocabulary.filter(w => w.lesson === selectedLesson)
  }, [selectedLesson])
  const lessons = useMemo(() => {
    const lessonMap: Record<number, VocabWord[]> = {}
    vocabulary.forEach(w => {
      if (w.lesson) {
        if (!lessonMap[w.lesson]) lessonMap[w.lesson] = []
        lessonMap[w.lesson].push(w)
      }
    })
    return Object.entries(lessonMap).map(([num, words]) => ({ num: parseInt(num), words, title: ['التحيات والتعارف', 'المعلومات الشخصية', 'المعلومات الشخصية', 'العائلة والأصدقاء', 'العائلة والأصدقاء', 'الأرقام', 'الأرقام', 'الأرقام', 'المكان والاتجاهات', 'المكان والاتجاهات', 'المكان والاتجاهات', 'الوقت والتواريخ', 'الحياة اليومية', 'الحياة اليومية', 'الحياة اليومية', 'المواصلات والتسوق'][parseInt(num) - 1] || 'الدرس ' + num }))
  }, [])

  if (selectedLesson !== null && lessonWords.length > 0) {
    return <LessonDetail lessonNum={selectedLesson} words={lessonWords} onBack={() => setSelectedLesson(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BookOpenText className="w-5 h-5 text-blue-600" />الدروس</h2>
        <Badge variant="secondary">{lessons.length} درس</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {lessons.map(lesson => {
          const learned = lesson.words.filter(w => useLearningStore.getState().isLearned(w.id)).length
          const pct = Math.round((learned / lesson.words.length) * 100)
          return (
            <Card key={lesson.num} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedLesson(lesson.num)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📘</span>
                  <Badge variant="secondary" className="text-[10px]">{pct}%</Badge>
                </div>
                <div className="font-bold text-sm text-gray-900 mb-0.5">الدرس {lesson.num}</div>
                <div className="text-xs text-gray-500 mb-2">{lesson.title}</div>
                <Progress value={pct} className="h-1.5" />
                <div className="text-[10px] text-gray-400 mt-1">{lesson.words.length} كلمة</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// GRAMMAR SECTION
// ═══════════════════════════════════════════════════════════
function GrammarSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-amber-600" />القواعد</h2>
        <Badge variant="secondary">{grammarRules.length} قاعدة</Badge>
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {grammarRules.map((rule, i) => (
          <AccordionItem key={rule.id} value={String(rule.id)} className="border rounded-xl px-4">
            <AccordionTrigger className="text-sm font-medium hover:no-underline text-right">{rule.titleAr}</AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 space-y-3">
              <p className="text-gray-700">{rule.description}</p>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-medium mb-1">النمط:</div>
                <div className="font-chinese-sans text-sm font-medium text-blue-900">{rule.pattern}</div>
              </div>
              <div className="space-y-2">
                {rule.examples.map((ex, ei) => (
                  <div key={ei} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-chinese-sans text-sm text-gray-900">{ex.zh}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{ex.pinyin}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{ex.ar}</div>
                  </div>
                ))}
              </div>
              {rule.tips && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">💡 {rule.tips}</p>}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STORIES SECTION
// ═══════════════════════════════════════════════════════════
function StoriesSection() {
  const [activeStory, setActiveStory] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [currentLine, setCurrentLine] = useState(-1)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const story = stories[activeStory]

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentLine(-1)
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
  }, [])

  const startAutoPlay = useCallback(() => {
    stopAutoPlay()
    setIsAutoPlaying(true)
    let lineIdx = 0
    const playLine = () => {
      if (lineIdx >= story.content.length) {
        setIsAutoPlaying(false)
        setCurrentLine(-1)
        return
      }
      setCurrentLine(lineIdx)
      speak(story.content[lineIdx].zh)
      lineIdx++
      autoPlayRef.current = setTimeout(playLine, 3000)
    }
    playLine()
  }, [story.content, stopAutoPlay])

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    if (activeStory !== undefined) {
      stopAutoPlay()
      setAnswers({})
    }
  }, [activeStory, stopAutoPlay])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BookMarked className="w-5 h-5 text-cyan-600" />القصص</h2>
        <Badge variant="secondary">{stories.length} قصة</Badge>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {stories.map((s, i) => (
          <button key={s.id} onClick={() => { setActiveStory(i); setAnswers({}); stopAutoPlay() }}
            className={"flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all border " + (activeStory === i ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
            {s.title}
          </button>
        ))}
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{story.titleZh}</span>
              <span className="text-gray-400 text-sm">— {story.title}</span>
            </div>
            <Button size="sm" variant={isAutoPlaying ? 'default' : 'outline'} onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
              className={isAutoPlaying ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : ''}>
              {isAutoPlaying ? <><Pause className="w-3.5 h-3.5 ml-1" />إيقاف</> : <><Play className="w-3.5 h-3.5 ml-1" />قراءة تلقائية</>}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAutoPlaying && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">تقدم القراءة</span>
                <span className="text-[10px] text-gray-500">{currentLine + 1}/{story.content.length}</span>
              </div>
              <Progress value={story.content.length > 0 ? ((currentLine + 1) / story.content.length) * 100 : 0} className="h-1.5" />
            </div>
          )}
          {story.content.map((line, i) => (
            <div key={i} className={"flex gap-3 items-start p-2 rounded-lg transition-colors " + (currentLine === i ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-gray-50')}>
              <button onClick={() => speak(line.zh)} className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Volume2 className="w-3.5 h-3.5 text-blue-500" />
              </button>
              <div className="flex-1">
                <div className={"font-chinese-sans text-sm " + (currentLine === i ? 'text-cyan-800 font-medium' : 'text-gray-800')}>{line.zh}</div>
                <div className="text-[11px] text-gray-400 font-chinese-sans">{line.pinyin}</div>
                <div className="text-xs text-gray-600">{line.ar}</div>
              </div>
            </div>
          ))}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-bold mb-3">أسئلة الفهم</h4>
            {story.questions.map((q, qi) => (
              <div key={qi} className="mb-3">
                <p className="text-sm font-medium mb-2">{q.zh}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                      className={"px-3 py-2 rounded-lg text-xs border transition-all " + (answers[qi] === oi ? (oi === q.correct ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700') : 'border-gray-200 hover:border-gray-300 text-gray-600')}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PRACTICE SECTION (Enhanced with 4 types)
// ═══════════════════════════════════════════════════════════
type PracticeType = 'mcq' | 'translation' | 'listening' | 'matching'

function PracticeSection() {
  const store = useLearningStore()
  const [activeType, setActiveType] = useState<PracticeType>('mcq')
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizFinished, setQuizFinished] = useState(false)
  // Translation state
  const [transWords, setTransWords] = useState<VocabWord[]>([])
  const [transIdx, setTransIdx] = useState(0)
  const [transInput, setTransInput] = useState('')
  const [transScore, setTransScore] = useState(0)
  const [transDone, setTransDone] = useState(false)
  // Listening state
  const [listenWords, setListenWords] = useState<VocabWord[]>([])
  const [listenIdx, setListenIdx] = useState(0)
  const [listenAnswer, setListenAnswer] = useState<number | null>(null)
  const [listenScore, setListenScore] = useState(0)
  const [listenDone, setListenDone] = useState(false)
  // Matching state
  const [matchWords, setMatchWords] = useState<VocabWord[]>([])
  const [matchSelected, setMatchSelected] = useState<{ zh: string; ar: string }[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [matchScore, setMatchScore] = useState(0)
  const [matchDone, setMatchDone] = useState(false)

  const practiceTabs: { key: PracticeType; label: string; icon: any }[] = [
    { key: 'mcq', label: 'اختيار من متعدد', icon: Layers },
    { key: 'translation', label: 'ترجمة', icon: Languages },
    { key: 'listening', label: 'استماع', icon: Ear },
    { key: 'matching', label: 'ربط', icon: Link },
  ]

  // MCQ Quiz
  const generateQuiz = useCallback(() => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 20)
    const questions = shuffled.map(word => {
      const wrong = vocabulary.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.meaning)
      const options = [...wrong, word.meaning].sort(() => Math.random() - 0.5)
      return { wordId: word.id, question: word.zh, questionPinyin: word.pinyin, options, correctIndex: options.indexOf(word.meaning) }
    })
    store.startQuiz(questions)
    setQuizAnswer(null)
    setQuizFinished(false)
  }, [store])

  useEffect(() => {
    if (activeType === 'mcq' && store.quizQuestions.length === 0) generateQuiz()
  }, [activeType, store.quizQuestions.length, generateQuiz])

  // Translation
  const startTranslation = () => {
    setTransWords([...vocabulary].sort(() => Math.random() - 0.5).slice(0, 20))
    setTransIdx(0); setTransInput(''); setTransScore(0); setTransDone(false)
  }
  const submitTrans = () => {
    if (!transInput.trim() || !transWords[transIdx]) return
    const w = transWords[transIdx]
    const correct = w.meaning.includes(transInput.trim()) || transInput.trim().includes(w.meaning.split('/')[0].trim())
    if (correct) setTransScore(s => s + 1)
    setTimeout(() => {
      if (transIdx < transWords.length - 1) { setTransIdx(i => i + 1); setTransInput('') }
      else setTransDone(true)
    }, 600)
  }

  // Listening
  const startListening = () => {
    setListenWords([...vocabulary].sort(() => Math.random() - 0.5).slice(0, 20))
    setListenIdx(0); setListenAnswer(null); setListenScore(0); setListenDone(false)
  }

  // Matching
  const startMatching = () => {
    const w = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 4)
    setMatchWords(w); setMatchSelected([]); setMatchedPairs([]); setMatchScore(0); setMatchDone(false)
  }

  // === MCQ Tab ===
  if (activeType === 'mcq') {
    const q = store.quizQuestions[store.currentQuizQuestion]
    if (!q) return <div className="text-center py-12"><Button onClick={generateQuiz}>ابدأ الاختبار</Button></div>
    if (quizFinished) {
      const pct = Math.round((store.quizScore / store.quizTotal) * 100)
      return (
        <div className="text-center py-12 space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-amber-500" />
          <h2 className="text-2xl font-bold">نتيجتك: {store.quizScore}/{store.quizTotal} ({pct}%)</h2>
          <p className="text-gray-500">{pct >= 80 ? 'ممتاز! 🎉' : pct >= 60 ? 'جيد جداً! 👍' : 'حاول مرة أخرى 💪'}</p>
          <Button onClick={generateQuiz} className="bg-[#1CB0F6]">اختبار جديد</Button>
        </div>
      )
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين</h2>
          <Badge>{store.currentQuizQuestion + 1}/{store.quizTotal}</Badge>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-2">
          {practiceTabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveType(tab.key); if (tab.key === 'translation') startTranslation(); if (tab.key === 'listening') startListening(); if (tab.key === 'matching') startMatching() }}
              className={"flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all " + (activeType === tab.key ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
        <Progress value={((store.currentQuizQuestion + 1) / store.quizTotal) * 100} className="h-2" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center space-y-6">
            <div>
              <div className="font-chinese-serif text-4xl mb-1">{q.question}</div>
              <div className="font-chinese-sans text-gray-500">{q.questionPinyin}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => {
                  if (quizAnswer !== null) return
                  setQuizAnswer(i)
                  store.answerQuiz(i === q.correctIndex)
                  store.trackQuestionAnswered()
                  setTimeout(() => {
                    if (store.currentQuizQuestion < store.quizTotal - 1) { store.nextQuizQuestion(); setQuizAnswer(null) }
                    else setQuizFinished(true)
                  }, 800)
                }}
                  className={"p-3 rounded-xl border text-sm font-medium transition-all " + (quizAnswer === null ? 'border-gray-200 hover:border-blue-300 text-gray-700' : i === q.correctIndex ? 'bg-green-50 border-green-300 text-green-700' : i === quizAnswer ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-200 text-gray-400')}>
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // === Translation Tab ===
  if (activeType === 'translation') {
    if (transWords.length === 0) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين</h2></div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {practiceTabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveType(tab.key); if (tab.key === 'translation') startTranslation(); if (tab.key === 'listening') startListening(); if (tab.key === 'matching') startMatching(); if (tab.key === 'mcq') generateQuiz() }}
              className={"flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all " + (activeType === tab.key ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center space-y-4"><div className="text-4xl">✏️</div><h3 className="text-lg font-bold">ترجمة</h3><p className="text-gray-500 text-sm">اكتب المعنى بالعربية للكلمة الصينية</p><Button onClick={startTranslation} className="bg-amber-600 hover:bg-amber-700">ابدأ (20 سؤال)</Button></CardContent></Card>
      </div>
    )
    if (transDone) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين</h2></div>
        <div className="text-center py-12 space-y-4"><Trophy className="w-16 h-16 mx-auto text-amber-500" /><h2 className="text-2xl font-bold">نتيجتك: {transScore}/20</h2><Button onClick={startTranslation}>اختبار جديد</Button></div>
      </div>
    )
    const cw = transWords[transIdx]
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين — ترجمة</h2><Badge>{transIdx + 1}/20</Badge></div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {practiceTabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveType(tab.key); if (tab.key === 'translation') startTranslation(); if (tab.key === 'listening') startListening(); if (tab.key === 'matching') startMatching(); if (tab.key === 'mcq') generateQuiz() }}
              className={"flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all " + (activeType === tab.key ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
        <Progress value={((transIdx + 1) / 20) * 100} className="h-2" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div><div className="font-chinese-serif text-5xl">{cw.zh}</div><div className="font-chinese-sans text-gray-500 mt-1">{cw.pinyin}</div></div>
            <button onClick={() => speak(cw.zh)} className="mx-auto p-2 rounded-full bg-blue-50 hover:bg-blue-100"><Volume2 className="w-5 h-5 text-blue-600" /></button>
            <div className="flex gap-2 max-w-sm mx-auto">
              <Input value={transInput} onChange={e => setTransInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitTrans()} placeholder="اكتب المعنى بالعربية..." className="text-center" dir="rtl" />
              <Button onClick={submitTrans} className="bg-amber-600 hover:bg-amber-700">تحقق</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // === Listening Tab ===
  if (activeType === 'listening') {
    if (listenWords.length === 0) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين</h2></div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {practiceTabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveType(tab.key); if (tab.key === 'translation') startTranslation(); if (tab.key === 'listening') startListening(); if (tab.key === 'matching') startMatching(); if (tab.key === 'mcq') generateQuiz() }}
              className={"flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all " + (activeType === tab.key ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center space-y-4"><div className="text-4xl">🎧</div><h3 className="text-lg font-bold">استماع</h3><p className="text-gray-500 text-sm">استمع للكلمة الصينية واختر المعنى الصحيح</p><Button onClick={startListening} className="bg-amber-600 hover:bg-amber-700">ابدأ (20 سؤال)</Button></CardContent></Card>
      </div>
    )
    if (listenDone) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين</h2></div>
        <div className="text-center py-12 space-y-4"><Trophy className="w-16 h-16 mx-auto text-amber-500" /><h2 className="text-2xl font-bold">نتيجتك: {listenScore}/20</h2><Button onClick={startListening}>اختبار جديد</Button></div>
      </div>
    )
    const lw = listenWords[listenIdx]
    const wrongListen = vocabulary.filter(w => w.id !== lw.id).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.meaning)
    const listenOpts = [...wrongListen, lw.meaning].sort(() => Math.random() - 0.5)
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين — استماع</h2><Badge>{listenIdx + 1}/20</Badge></div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {practiceTabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveType(tab.key); if (tab.key === 'translation') startTranslation(); if (tab.key === 'listening') startListening(); if (tab.key === 'matching') startMatching(); if (tab.key === 'mcq') generateQuiz() }}
              className={"flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all " + (activeType === tab.key ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
        <Progress value={((listenIdx + 1) / 20) * 100} className="h-2" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center space-y-6">
            <button onClick={() => speak(lw.zh)} className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center mx-auto shadow-lg">
              <Volume2 className="w-10 h-10 text-white" />
            </button>
            <p className="text-sm text-gray-500">اضغط للاستماع</p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {listenOpts.map((opt, i) => (
                <button key={i} onClick={() => {
                  if (listenAnswer !== null) return
                  setListenAnswer(i)
                  const correct = opt === lw.meaning
                  if (correct) setListenScore(s => s + 1)
                  setTimeout(() => {
                    if (listenIdx < listenWords.length - 1) { setListenIdx(idx => idx + 1); setListenAnswer(null) }
                    else setListenDone(true)
                  }, 800)
                }}
                  className={"p-3 rounded-xl border text-sm font-medium transition-all " + (listenAnswer === null ? 'border-gray-200 hover:border-blue-300 text-gray-700' : opt === lw.meaning ? 'bg-green-50 border-green-300 text-green-700' : i === listenAnswer ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-200 text-gray-400')}>
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // === Matching Tab ===
  if (activeType === 'matching') {
    if (matchWords.length === 0) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين</h2></div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {practiceTabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveType(tab.key); if (tab.key === 'translation') startTranslation(); if (tab.key === 'listening') startListening(); if (tab.key === 'matching') startMatching(); if (tab.key === 'mcq') generateQuiz() }}
              className={"flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all " + (activeType === tab.key ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center space-y-4"><div className="text-4xl">🔗</div><h3 className="text-lg font-bold">ربط</h3><p className="text-gray-500 text-sm">طابق 4 كلمات صينية مع معانيها العربية</p><Button onClick={startMatching} className="bg-amber-600 hover:bg-amber-700">ابدأ</Button></CardContent></Card>
      </div>
    )
    if (matchDone) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين</h2></div>
        <div className="text-center py-12 space-y-4"><Trophy className="w-16 h-16 mx-auto text-amber-500" /><h2 className="text-2xl font-bold">نتيجتك: {matchScore}/4</h2><Button onClick={startMatching}>مجموعة جديدة</Button></div>
      </div>
    )
    const shuffledAr = [...matchWords.map(w => w.meaning)].sort(() => Math.random() - 0.5)
    const handleMatchClick = (type: 'zh' | 'ar', value: string) => {
      if (matchedPairs.includes(value)) return
      if (type === 'zh') {
        if (matchSelected.length === 1 && matchSelected[0].type === 'zh') return
        const newSel = matchSelected.length === 1 && matchSelected[0].type === 'ar'
          ? [{ zh: value, ar: matchSelected[0].value } as any]
          : matchSelected.length === 0
          ? [{ zh: value, ar: '' } as any]
          : matchSelected
        if (newSel.length === 2 || (matchSelected.length === 1 && matchSelected[0].type === 'ar')) {
          const zhVal = value; const arVal = matchSelected[0].value
          const matched = matchWords.find(w => w.zh === zhVal && w.meaning === arVal)
          if (matched) { setMatchedPairs(p => [...p, zhVal, arVal]); setMatchScore(s => s + 1) }
          setMatchSelected([])
          if (matchedPairs.length / 2 + 1 >= 4) setMatchDone(true)
        } else setMatchSelected([{ zh: value, ar: '' } as any])
      } else {
        if (matchSelected.length === 1 && matchSelected[0].type === 'ar') return
        if (matchSelected.length === 1 && matchSelected[0].type === 'zh') {
          const zhVal = matchSelected[0].value; const arVal = value
          const matched = matchWords.find(w => w.zh === zhVal && w.meaning === arVal)
          if (matched) { setMatchedPairs(p => [...p, zhVal, arVal]); setMatchScore(s => s + 1) }
          setMatchSelected([])
          if (matchedPairs.length / 2 + 1 >= 4) setMatchDone(true)
        } else setMatchSelected([{ zh: '', ar: value, type: 'ar' } as any])
      }
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />التمارين — ربط</h2><Badge>{matchScore}/4</Badge></div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {practiceTabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveType(tab.key); if (tab.key === 'translation') startTranslation(); if (tab.key === 'listening') startListening(); if (tab.key === 'matching') startMatching(); if (tab.key === 'mcq') generateQuiz() }}
              className={"flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all " + (activeType === tab.key ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-center mb-2">الصينية</h3>
            {matchWords.map(w => (
              <button key={w.zh} onClick={() => handleMatchClick('zh', w.zh)} disabled={matchedPairs.includes(w.zh)}
                className={"w-full p-3 rounded-xl border text-center font-chinese-serif text-lg transition-all " + (matchedPairs.includes(w.zh) ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 hover:border-amber-300 text-gray-700')}>
                {w.zh}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-center mb-2">العربية</h3>
            {shuffledAr.map(m => (
              <button key={m} onClick={() => handleMatchClick('ar', m)} disabled={matchedPairs.includes(m)}
                className={"w-full p-3 rounded-xl border text-center text-sm transition-all " + (matchedPairs.includes(m) ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 hover:border-amber-300 text-gray-700')}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════════
// GAMES SECTION (Enhanced with 3 games)
// ═══════════════════════════════════════════════════════════
type GameType = 'memory' | 'tones' | 'speed'

function GamesSection() {
  const store = useLearningStore()
  const [activeGame, setActiveGame] = useState<GameType>('memory')
  const [flipped, setFlipped] = useState<number[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  // Tone game
  const [toneQs, setToneQs] = useState<{ char: string; pinyin: string; meaning: string; correctTone: number }[]>([])
  const [toneIdx, setToneIdx] = useState(0)
  const [toneAnswer, setToneAnswer] = useState<number | null>(null)
  const [toneScore, setToneScore] = useState(0)
  const [toneDone, setToneDone] = useState(false)
  // Speed game
  const [speedQs, setSpeedQs] = useState<{ zh: string; pinyin: string; meaning: string; options: string[]; correctIdx: number }[]>([])
  const [speedIdx, setSpeedIdx] = useState(0)
  const [speedAnswer, setSpeedAnswer] = useState<number | null>(null)
  const [speedScore, setSpeedScore] = useState(0)
  const [speedDone, setSpeedDone] = useState(false)
  const [speedTimer, setSpeedTimer] = useState(0)
  const [speedRunning, setSpeedRunning] = useState(false)
  const speedRef = useRef<NodeJS.Timeout | null>(null)

  const gameTabs: { key: GameType; label: string; icon: any }[] = [
    { key: 'memory', label: 'لعبة الذاكرة', icon: Brain },
    { key: 'tones', label: 'لعبة النبرات', icon: Music },
    { key: 'speed', label: 'لعبة السرعة', icon: Zap },
  ]

  // Memory game
  const startGame = () => {
    const selected = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 8)
    const cards = selected.flatMap(w => [
      { id: w.id * 2, zh: w.zh, ar: w.meaning, pinyin: w.pinyin, matched: false, type: 'hanzi' as const },
      { id: w.id * 2 + 1, zh: w.zh, ar: w.meaning, pinyin: w.pinyin, matched: false, type: 'meaning' as const },
    ]).sort(() => Math.random() - 0.5)
    store.startMemoryGame(cards)
    setFlipped([]); setGameStarted(true)
  }
  const handleClick = (id: number) => {
    if (flipped.length === 2) return
    const card = store.memoryCards.find(c => c.id === id)
    if (!card || card.matched || flipped.includes(id)) return
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)
    if (newFlipped.length === 2) {
      store.incrementMemoryMoves()
      const [a, b] = newFlipped
      const cA = store.memoryCards.find(c => c.id === a)
      const cB = store.memoryCards.find(c => c.id === b)
      if (cA && cB && cA.zh === cB.zh && cA.type !== cB.type) {
        store.matchMemoryPair(a, b); setTimeout(() => setFlipped([]), 500)
      } else setTimeout(() => setFlipped([]), 1000)
    }
  }

  // Tone game
  const startToneGame = () => {
    const toneWords = vocabulary.filter(w => w.tones && w.tones.length > 0 && w.zh.length <= 2).sort(() => Math.random() - 0.5).slice(0, 15)
    const qs = toneWords.map(w => ({
      char: w.zh, pinyin: w.pinyin, meaning: w.meaning,
      correctTone: w.tones[0] === 0 ? 1 : w.tones[0]
    }))
    setToneQs(qs); setToneIdx(0); setToneAnswer(null); setToneScore(0); setToneDone(false)
  }

  // Speed game
  const startSpeedGame = () => {
    const words = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 20)
    const qs = words.map(w => {
      const wrong = vocabulary.filter(v => v.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.meaning)
      const opts = [...wrong, w.meaning].sort(() => Math.random() - 0.5)
      return { zh: w.zh, pinyin: w.pinyin, meaning: w.meaning, options: opts, correctIdx: opts.indexOf(w.meaning) }
    })
    setSpeedQs(qs); setSpeedIdx(0); setSpeedAnswer(null); setSpeedScore(0); setSpeedDone(false)
    setSpeedTimer(0); setSpeedRunning(true)
  }
  useEffect(() => {
    if (speedRunning) {
      speedRef.current = setInterval(() => setSpeedTimer(t => t + 1), 1000)
      return () => { if (speedRef.current) clearInterval(speedRef.current) }
    }
  }, [speedRunning])

  // Tab bar shared
  const GameTabBar = () => (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-2">
      {gameTabs.map(tab => (
        <button key={tab.key} onClick={() => {
          setActiveGame(tab.key)
          if (tab.key === 'memory') { setGameStarted(false) }
          if (tab.key === 'tones') startToneGame()
          if (tab.key === 'speed') startSpeedGame()
        }}
          className={"flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all " + (activeGame === tab.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
          <tab.icon className="w-3.5 h-3.5" />{tab.label}
        </button>
      ))}
    </div>
  )

  // === Memory Game ===
  if (activeGame === 'memory') {
    if (!gameStarted) {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600" />الألعاب</h2>
          <GameTabBar />
          <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center space-y-4"><div className="text-5xl">🎮</div><h3 className="text-lg font-bold">لعبة الذاكرة</h3><p className="text-gray-500 text-sm">طابق 8 أزواج من الكلمات الصينية بمعانيها العربية</p><Button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-700">ابدأ اللعب</Button></CardContent></Card>
        </div>
      )
    }
    const allMatched = store.memoryCards.length > 0 && store.memoryCards.every(c => c.matched)
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600" />لعبة الذاكرة</h2><div className="flex items-center gap-2"><Badge>{store.memoryPairs}/8 أزواج</Badge><Badge variant="secondary">{store.memoryMoves} محاولات</Badge></div></div>
        <GameTabBar />
        {allMatched && <Card className="border-0 shadow-sm bg-gradient-to-l from-emerald-50 to-green-50"><CardContent className="p-6 text-center"><Trophy className="w-12 h-12 mx-auto text-amber-500 mb-2" /><h3 className="font-bold text-lg">أحسنت! 🎉</h3><p className="text-sm text-gray-500">أكملت اللعبة في {store.memoryMoves} محاولة</p><Button onClick={startGame} className="mt-3">العب مرة أخرى</Button></CardContent></Card>}
        <div className="grid grid-cols-4 gap-2">
          {store.memoryCards.map(card => (
            <button key={card.id} onClick={() => handleClick(card.id)} disabled={card.matched}
              className={"aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2 " + (card.matched ? 'bg-green-50 border-green-200 opacity-50' : flipped.includes(card.id) ? 'bg-white border-emerald-300 shadow-md' : 'bg-gray-100 border-gray-200 hover:bg-gray-50')}>
              {flipped.includes(card.id) || card.matched ? (card.type === 'hanzi' ? <span className="font-chinese-serif text-lg">{card.zh}</span> : <span className="text-[10px] text-gray-700 text-center leading-tight">{card.ar}</span>) : <span className="text-gray-400">?</span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // === Tone Game ===
  if (activeGame === 'tones') {
    if (toneQs.length === 0) return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600" />الألعاب</h2>
        <GameTabBar />
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center space-y-4"><div className="text-5xl">🎵</div><h3 className="text-lg font-bold">لعبة النبرات</h3><p className="text-gray-500 text-sm">اختر النبرة الصحيحة للحرف الصيني</p><Button onClick={startToneGame} className="bg-emerald-600 hover:bg-emerald-700">ابدأ (15 سؤال)</Button></CardContent></Card>
      </div>
    )
    if (toneDone) {
      const pct = Math.round((toneScore / 15) * 100)
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600" />الألعاب</h2>
          <div className="text-center py-12 space-y-4"><Trophy className="w-16 h-16 mx-auto text-amber-500" /><h2 className="text-2xl font-bold">نتيجتك: {toneScore}/15 ({pct}%)</h2><Button onClick={startToneGame}>لعب مرة أخرى</Button></div>
        </div>
      )
    }
    const tq = toneQs[toneIdx]
    const toneNames = ['النبرة الأولى ـ', 'النبرة الثانية ↗', 'النبرة الثالثة ↘↗', 'النبرة الرابعة ↘']
    const toneColors = ['from-green-500 to-green-600', 'from-blue-500 to-blue-600', 'from-amber-500 to-amber-600', 'from-red-500 to-red-600']
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600" />لعبة النبرات</h2><Badge>{toneIdx + 1}/15</Badge></div>
        <GameTabBar />
        <Progress value={((toneIdx + 1) / 15) * 100} className="h-2" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center space-y-6">
            <div>
              <div className="font-chinese-serif text-6xl mb-2 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => speak(tq.char)}>{tq.char}</div>
              <div className="font-chinese-sans text-gray-500">{tq.pinyin}</div>
              <button onClick={() => speak(tq.char)} className="mt-2 p-2 rounded-full bg-blue-50 hover:bg-blue-100 mx-auto block"><Volume2 className="w-5 h-5 text-blue-600" /></button>
            </div>
            <p className="text-sm text-gray-500">ما هي النبرة الصحيحة؟</p>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {[1, 2, 3, 4].map(t => (
                <button key={t} onClick={() => {
                  if (toneAnswer !== null) return
                  setToneAnswer(t)
                  if (t === tq.correctTone) setToneScore(s => s + 1)
                  setTimeout(() => {
                    if (toneIdx < toneQs.length - 1) { setToneIdx(i => i + 1); setToneAnswer(null) }
                    else setToneDone(true)
                  }, 800)
                }}
                  className={"p-4 rounded-xl border text-sm font-medium transition-all " + (toneAnswer === null ? 'border-gray-200 hover:border-emerald-300 text-gray-700' : t === tq.correctTone ? 'bg-green-50 border-green-300 text-green-700' : t === toneAnswer ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-200 text-gray-400')}>
                  <div className="text-lg mb-1">{t === 1 ? '─' : t === 2 ? '↗' : t === 3 ? '↘↗' : '↘'}</div>
                  <div className="text-xs">{t}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // === Speed Game ===
  if (activeGame === 'speed') {
    if (speedQs.length === 0) return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600" />الألعاب</h2>
        <GameTabBar />
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center space-y-4"><div className="text-5xl">⚡</div><h3 className="text-lg font-bold">لعبة السرعة</h3><p className="text-gray-500 text-sm">أجب بأسرع وقت ممكن! 20 سؤال</p><Button onClick={startSpeedGame} className="bg-emerald-600 hover:bg-emerald-700">ابدأ</Button></CardContent></Card>
      </div>
    )
    if (speedDone) {
      const avgTime = speedQs.length > 0 ? (speedTimer / speedQs.length).toFixed(1) : '0'
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600" />الألعاب</h2>
          <div className="text-center py-12 space-y-4"><Trophy className="w-16 h-16 mx-auto text-amber-500" /><h2 className="text-2xl font-bold">نتيجتك: {speedScore}/20</h2><p className="text-gray-500">الوقت: {speedTimer} ثانية ({avgTime} ث/سؤال)</p><Button onClick={startSpeedGame}>لعب مرة أخرى</Button></div>
        </div>
      )
    }
    const sq = speedQs[speedIdx]
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600" />لعبة السرعة</h2><div className="flex items-center gap-2"><Badge variant="secondary" className="gap-1"><Timer className="w-3 h-3" />{speedTimer}ث</Badge><Badge>{speedIdx + 1}/20</Badge></div></div>
        <GameTabBar />
        <Progress value={((speedIdx + 1) / 20) * 100} className="h-2" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center space-y-6">
            <div><div className="font-chinese-serif text-4xl mb-1">{sq.zh}</div><div className="font-chinese-sans text-gray-500">{sq.pinyin}</div></div>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {sq.options.map((opt, i) => (
                <button key={i} onClick={() => {
                  if (speedAnswer !== null) return
                  setSpeedAnswer(i)
                  if (i === sq.correctIdx) setSpeedScore(s => s + 1)
                  setTimeout(() => {
                    if (speedIdx < speedQs.length - 1) { setSpeedIdx(idx => idx + 1); setSpeedAnswer(null) }
                    else { setSpeedDone(true); setSpeedRunning(false) }
                  }, 400)
                }}
                  className={"p-3 rounded-xl border text-sm font-medium transition-all " + (speedAnswer === null ? 'border-gray-200 hover:border-emerald-300 text-gray-700' : i === sq.correctIdx ? 'bg-green-50 border-green-300 text-green-700' : i === speedAnswer ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-200 text-gray-400')}>
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════════
// SENTENCES SECTION
// ═══════════════════════════════════════════════════════════
function SentencesSection() {
  const allSents = useMemo(() => allSentences, [])
  const [idx, setIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const s = allSents[idx]
  if (allSents.length === 0) return <div className="text-center py-12"><p className="text-gray-500">لا توجد جمل</p></div>
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-600" />الجمل</h2>
        <Badge variant="secondary">{idx + 1}/{allSents.length}</Badge>
      </div>
      <Progress value={((idx + 1) / allSents.length) * 100} className="h-2" />
      <div className="perspective-1000 w-full">
        <div className={"relative w-full min-h-[220px] cursor-pointer transition-transform duration-500 preserve-3d " + (isFlipped ? 'rotate-y-180' : '')}
          onClick={() => setIsFlipped(!isFlipped)}>
          {/* Front - Chinese + Pinyin */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl flex flex-col items-center justify-center p-6 gap-3 border border-gray-100">
            <div className="absolute top-3 right-3 flex gap-1">
              <Badge variant="outline" className="text-[10px]">{s.wordZh}</Badge>
            </div>
            <div className="font-chinese-sans text-3xl text-gray-900">{s.zh}</div>
            <div className="font-chinese-sans text-base text-gray-500">{s.pinyin}</div>
            <button onClick={e => { e.stopPropagation(); speak(s.zh) }} className="mt-2 p-2 rounded-full bg-blue-50 hover:bg-blue-100"><Volume2 className="w-5 h-5 text-blue-600" /></button>
            <p className="text-xs text-gray-400">اضغط لقلب البطاقة</p>
          </div>
          {/* Back - Arabic + breakdown */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-white via-amber-50/30 to-white rounded-2xl flex flex-col items-center justify-center p-6 gap-3 border border-gray-100">
            <div className="font-chinese-sans text-xl text-gray-900 mb-1">{s.zh}</div>
            <div className="text-lg font-bold text-red-600">{s.ar}</div>
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
              <div className="text-[10px] text-gray-500 mb-1">الكلمة الأساسية</div>
              <div className="font-chinese-serif text-lg text-gray-800">{s.wordZh}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); speak(s.zh) }} className="mt-1 p-2 rounded-full bg-blue-50 hover:bg-blue-100"><Volume2 className="w-5 h-5 text-blue-600" /></button>
            <p className="text-xs text-gray-400">اضغط للعودة</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => { setIdx(Math.max(0, idx - 1)); setIsFlipped(false) }} disabled={idx === 0}><ChevronRight className="w-4 h-4" />السابق</Button>
        <Button size="sm" variant="ghost" onClick={() => speak(s.zh)}><Volume2 className="w-4 h-4" /></Button>
        <Button size="sm" onClick={() => { if (idx < allSents.length - 1) { setIdx(idx + 1); setIsFlipped(false) } }}>التالي<ChevronLeft className="w-4 h-4" /></Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CHAT SECTION
// ═══════════════════════════════════════════════════════════
function ChatSection() {
  const store = useLearningStore()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    const msg = input.trim()
    setInput('')
    store.addChatMessage({ role: 'user', content: msg })
    setSending(true)
    const response = getChatResponse(msg)
    setTimeout(() => {
      store.addChatMessage({ role: 'assistant', content: response })
      setSending(false)
    }, 500)
  }

  return (
    <div className="space-y-4 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      <h2 className="text-xl font-bold flex items-center gap-2"><Bot className="w-5 h-5 text-purple-600" />المساعد الذكي</h2>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {store.chatMessages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">اسألني أي سؤال عن اللغة الصينية!</p>
          </div>
        )}
        {store.chatMessages.map((msg, i) => (
          <div key={i} className={"flex " + (msg.role === 'user' ? 'justify-start' : 'justify-end')}>
            <div className={"max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line " + (msg.role === 'user' ? 'bg-[#E0F6FF] text-gray-800' : 'bg-gray-100 text-gray-700')}>{msg.content}</div>
          </div>
        ))}
        {sending && <div className="flex justify-end"><div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-400">جارٍ الكتابة...</div></div>}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="اكتب سؤالك هنا..." dir="rtl" />
        <Button onClick={send} disabled={!input.trim()} className="bg-[#1CB0F6]"><Send className="w-4 h-4" /></Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ROADMAP SECTION
// ═══════════════════════════════════════════════════════════
function RoadmapSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2"><Map className="w-5 h-5 text-rose-600" />خريطة الطريق</h2>
      <div className="space-y-3">
        {roadmapUnits.map((unit, i) => (
          <Card key={unit.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{unit.id}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-gray-900">{unit.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{unit.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="text-[10px]"><BookOpen className="w-3 h-3 ml-1" />{unit.words.length} كلمة</Badge>
                    <Badge variant="secondary" className="text-[10px]"><Clock className="w-3 h-3 ml-1" />{unit.hours} ساعة</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// HSK EXAM SIMULATOR
// ═══════════════════════════════════════════════════════════
type ExamPhase = 'idle' | 'listening' | 'reading' | 'writing' | 'results'

// ═══════════════════════════════════════════════════════════
// PINYIN SECTION
// ═══════════════════════════════════════════════════════════
function PinyinSection() {
  const [activePinyinTab, setActivePinyinTab] = useState<'tones' | 'initials' | 'finals' | 'rules'>('tones')
  const pinyinTabs = [
    { key: 'tones' as const, label: 'النبرات' },
    { key: 'initials' as const, label: 'الحروف الأولى' },
    { key: 'finals' as const, label: 'الحروف الأخيرة' },
    { key: 'rules' as const, label: 'قواعد خاصة' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Languages className="w-5 h-5 text-indigo-600" />البينين</h2><Badge variant="secondary">نظام النطق</Badge></div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {pinyinTabs.map(tab => (
          <button key={tab.key} onClick={() => setActivePinyinTab(tab.key)}
            className={"flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all " + (activePinyinTab === tab.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {tab.label}
          </button>
        ))}
      </div>

      {activePinyinTab === 'tones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinyinTones.map(t => (
              <Card key={t.tone} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{t.tone}</div>
                      <div><div className="font-bold text-sm">{t.nameAr}</div></div>
                    </div>
                    <Badge variant="outline">{t.symbol}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{t.descriptionAr}</p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <button onClick={() => speak(t.example)} className="font-chinese-serif text-3xl hover:text-indigo-600 transition-colors">{t.example}</button>
                    <div className="text-right"><div className="font-chinese-sans text-sm text-gray-700">{t.examplePinyin}</div><div className="text-xs text-gray-500">{t.exampleAr}</div></div>
                    <button onClick={() => speak(t.example)} className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100"><Volume2 className="w-4 h-4 text-blue-500" /></button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-0 shadow-sm bg-gradient-to-l from-indigo-50 to-purple-50">
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" />أمثلة على اختلاف النبرات</h3>
              <div className="space-y-2">
                {tonePairs.slice(0, 4).map(tp => (
                  <div key={tp.syllable} className="flex flex-wrap gap-2">
                    {tp.tones.map(t => (
                      <button key={t.tone} onClick={() => speak(t.char)} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-center transition-all">
                        <div className="font-chinese-serif text-xl">{t.char}</div>
                        <div className="font-chinese-sans text-[10px] text-gray-500">{t.pinyin}</div>
                        <div className="text-[10px] text-gray-600">{t.meaning}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activePinyinTab === 'initials' && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 divide-y divide-gray-100">
                {initials.map(init => (
                  <button key={init.char} onClick={() => speak(init.example)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-right">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-chinese-sans font-bold flex-shrink-0">{init.char}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-chinese-serif text-lg">{init.example}</div>
                      <div className="font-chinese-sans text-[11px] text-gray-500">{init.examplePinyin} — {init.exampleAr}</div>
                      {init.similarToArabic && <div className="text-[10px] text-indigo-500">≈ {init.similarToArabic}</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activePinyinTab === 'finals' && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 divide-y divide-gray-100">
                {finals.map(f => (
                  <button key={f.char} onClick={() => speak(f.example)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-right">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-chinese-sans font-bold flex-shrink-0">{f.toneVariants.tone1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-chinese-serif text-lg">{f.example}</div>
                      <div className="font-chinese-sans text-[11px] text-gray-500">{f.examplePinyin} — {f.exampleAr}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activePinyinTab === 'rules' && (
        <div className="space-y-4">
          {toneSandhiRules.map((rule, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-2">{rule.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{rule.description}</p>
                <div className="space-y-2">
                  {rule.rules.map((r, ri) => (
                    <div key={ri} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex-1"><span className="text-xs font-medium text-gray-600">{r.before}</span></div>
                      <ArrowLeftRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1"><span className="text-xs font-bold text-indigo-700">{r.result}</span></div>
                      <div className="text-[11px] text-gray-400 font-chinese-sans">{r.example}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border-0 shadow-sm bg-gradient-to-l from-indigo-50 to-purple-50">
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-3">🔊 تدريب على النطق</h3>
              <div className="flex flex-wrap gap-2">
                {commonCombinations.slice(0, 20).map((c, i) => (
                  <button key={i} onClick={() => speak(c.char + ' ' + c.pinyin.split(' ')[0])}
                    className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-center transition-all">
                    <div className="font-chinese-serif text-lg">{c.char}</div>
                    <div className="font-chinese-sans text-[10px] text-gray-500">{c.pinyin}</div>
                    <div className="text-[10px] text-gray-600">{c.meaning}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// HANZI SECTION
// ═══════════════════════════════════════════════════════════
function HanziSection() {
  const [search, setSearch] = useState('')
  const [selectedChar, setSelectedChar] = useState<VocabWord | null>(null)

  const hskChars = useMemo(() => {
    const seen = new Set<string>()
    const chars: VocabWord[] = []
    for (const w of vocabulary) {
      const singleChars = w.zh.split('').filter(c => c.trim() !== '' && !seen.has(c))
      for (const c of singleChars) {
        seen.add(c)
        if (chars.length < 80) chars.push(w)
      }
    }
    return chars
  }, [])

  const filtered = useMemo(() => {
    if (!search) return hskChars
    return hskChars.filter(w => w.zh.includes(search) || w.pinyin.includes(search.toLowerCase()) || w.meaning.includes(search))
  }, [search, hskChars])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><PenTool className="w-5 h-5 text-pink-600" />الحروف الصينية</h2>
        <Badge variant="secondary">{filtered.length} حرف</Badge>
      </div>
      <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن حرف..." className="pr-10" /></div>

      {selectedChar ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedChar(null)} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ChevronRight className="w-4 h-4" />العودة للقائمة</button>
          <Card className="border-0 shadow-sm bg-gradient-to-l from-pink-50 to-rose-50">
            <CardContent className="p-6 text-center space-y-4">
              <button onClick={() => speak(selectedChar.zh)} className="font-chinese-serif text-8xl hover:text-pink-600 transition-colors cursor-pointer">{selectedChar.zh}</button>
              <div className="font-chinese-sans text-xl text-gray-500">{selectedChar.pinyin}</div>
              <div className="text-xl font-bold text-pink-600">{selectedChar.meaning}</div>
              <button onClick={() => speak(selectedChar.zh)} className="mx-auto p-2 rounded-full bg-blue-50 hover:bg-blue-100"><Volume2 className="w-5 h-5 text-blue-600" /></button>
              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="bg-white rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">الجذور</div><div className="font-chinese-serif text-lg">{selectedChar.radicals?.join(' ') || '—'}</div></div>
                <div className="bg-white rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">عدد الخطوط</div><div className="text-lg font-bold">{selectedChar.strokeCount}</div></div>
              </div>
              {selectedChar.mnemonic && <div className="bg-blue-50 rounded-lg p-3"><span className="text-sm text-blue-600">💡 {selectedChar.mnemonic}</span></div>}
              <div className="bg-gray-50 rounded-lg p-3 text-right">
                <div className="text-xs text-gray-500 mb-1">مثال:</div>
                <div className="font-chinese-sans text-sm">{selectedChar.exZh}</div>
                <div className="text-xs text-gray-500">{selectedChar.exPinyin}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
          {filtered.map((w, i) => (
            <button key={i} onClick={() => setSelectedChar(w)} className="aspect-square rounded-xl border border-gray-200 hover:border-pink-300 hover:shadow-md flex flex-col items-center justify-center transition-all bg-white">
              <span className="font-chinese-serif text-2xl">{w.zh}</span>
              <span className="font-chinese-sans text-[8px] text-gray-400 mt-0.5">{w.pinyin}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CONVERSATIONS SECTION

// ═══════════════════════════════════════════════════════════
// PRONUNCIATION SECTION

// ═══════════════════════════════════════════════════════════
// VISUAL DICTIONARY SECTION

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENTS SECTION

// ═══════════════════════════════════════════════════════════
// PLACEHOLDER SECTIONS
// ═══════════════════════════════════════════════════════════
function PlaceholderSection({ title, icon: Icon, color }: { title: string; icon: any; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className={"w-16 h-16 rounded-2xl bg-gradient-to-br " + color + " flex items-center justify-center mb-4"}><Icon className="w-7 h-7 text-white" /></div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">قريباً...</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function Home() {
  const store = useLearningStore()
  const { currentSection, setCurrentSection, isLoggedIn, toggleSidebar } = store

  // Stats (must be before conditional return)
  const stats = useMemo(() => {
    const total = vocabulary.length
    const learned = store.learnedWords.length
    const progress = total > 0 ? Math.round((learned / total) * 100) : 0
    return { total, learned, progress }
  }, [store.learnedWords])

  // Keyboard shortcuts (must be before conditional return)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isLoggedIn) return
      if (e.key === 'ArrowLeft' && currentSection === 'vocabulary') store.setFlashcardIndex(Math.max(0, store.flashcardIndex - 1))
      if (e.key === 'ArrowRight' && currentSection === 'vocabulary') store.setFlashcardIndex(Math.min(vocabulary.length - 1, store.flashcardIndex + 1))
      if (e.key === ' ' && currentSection === 'vocabulary') { e.preventDefault(); store.flip() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentSection, store, isLoggedIn])

  // If not logged in, show login screen
  if (!isLoggedIn) return <LoginScreen />

  // Render section content
  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard': return <DashboardSection stats={stats} onNavigate={setCurrentSection} />
      case 'vocabulary': return <VocabularySection />
      case 'lessons': return <LessonSystem />
      case 'grammar': return <GrammarSection />
      case 'stories': return <StoriesSection />
      case 'practice': return <PracticeSection />
      case 'games': return <GamesSection />
      case 'sentences': return <SentencesSection />
      case 'chat': return <ChatSection />
      case 'roadmap': return <RoadmapSection />
      case 'pinyin': return <PinyinSection />
      case 'hanzi': return <HanziSection />
      case 'visual-dict': return <VisualDictSection />
      case 'conversations': return <ConversationsSection />
      case 'pronunciation': return <PronunciationSection />
      case 'exam': return <ExamSection />
      case 'achievements': return <AchievementsSection />
      default: return <DashboardSection stats={stats} onNavigate={setCurrentSection} />
    }
  }

  // Current section label
  const sectionLabel = allNavItems.find(i => i.id === currentSection)?.label || 'الرئيسية'

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-gray-100"><Menu className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-sm font-bold text-gray-900">{sectionLabel}</h1>
          <div className="flex items-center gap-1">
            <Badge className="gap-1 bg-amber-50 text-amber-700 border-amber-200 text-[10px]"><Flame className="w-3 h-3" />{store.dailyStreak}</Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar stats={stats} />

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 max-w-4xl">
          {renderSection()}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex justify-around py-2 safe-area-bottom">
        {[
          { id: 'dashboard' as Section, label: 'الرئيسية', icon: LayoutDashboard },
          { id: 'lessons' as Section, label: 'الدروس', icon: BookOpenText },
          { id: 'vocabulary' as Section, label: 'المفردات', icon: BookOpen },
          { id: 'practice' as Section, label: 'التمارين', icon: Target },
          { id: 'games' as Section, label: 'الألعاب', icon: Gamepad2 },
        ].map(item => (
          <button key={item.id} onClick={() => setCurrentSection(item.id)}
            className={"flex flex-col items-center gap-0.5 px-2 py-1 min-w-[48px] " + (currentSection === item.id ? 'text-[#1CB0F6]' : 'text-gray-400')}>
            <item.icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
