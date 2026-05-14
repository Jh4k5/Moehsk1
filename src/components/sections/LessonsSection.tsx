'use client'
import React from 'react'
import { vocabulary } from '@/data/vocabulary'
import { useLearningStore } from '@/lib/store'
import { speak } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Lock, ChevronLeft } from 'lucide-react'
import type { Section } from '@/types'

// ─── Lesson Configuration ─────────────────────────────────────
const LESSONS_CONFIG = [
  { id: 1,  title: "التحيات والتعارف",       icon: "👋", color: "#E84C4C" },
  { id: 2,  title: "الضمائر والهوية",         icon: "👤", color: "#F5A623" },
  { id: 3,  title: "الأرقام والمقادير",        icon: "🔢", color: "#4A90D9" },
  { id: 4,  title: "الزمان والتاريخ",          icon: "📅", color: "#7B68EE" },
  { id: 5,  title: "العائلة والعلاقات",        icon: "👨‍👩‍👧", color: "#E84C4C" },
  { id: 6,  title: "الطعام والشراب",           icon: "🍜", color: "#F5A623" },
  { id: 7,  title: "الأماكن والاتجاهات",       icon: "📍", color: "#27AE60" },
  { id: 8,  title: "المواصلات والسفر",         icon: "✈️", color: "#4A90D9" },
  { id: 9,  title: "الطقس والفصول",            icon: "🌤️", color: "#7B68EE" },
  { id: 10, title: "الصحة والجسم",             icon: "🏥", color: "#E84C4C" },
  { id: 11, title: "الدراسة والعمل",           icon: "📖", color: "#F5A623" },
  { id: 12, title: "الترفيه والهوايات",        icon: "🎮", color: "#27AE60" },
  { id: 13, title: "المشاعر والأحوال",         icon: "😊", color: "#4A90D9" },
  { id: 14, title: "المنزل واليوميات",          icon: "🏠", color: "#7B68EE" },
  { id: 15, title: "المراجعة الشاملة",         icon: "🏆", color: "#E84C4C" }
]

interface LessonsSectionProps {
  onNavigate: (s: Section) => void
}

export function LessonsSection({ onNavigate }: LessonsSectionProps) {
  const store = useLearningStore()
  const [selectedLesson, setSelectedLesson] = React.useState<number | null>(null)

  const getLessonProgress = (lessonId: number) => {
    const lessonWords = vocabulary.filter(w => w.lesson === lessonId)
    if (lessonWords.length === 0) return 100
    const learned = lessonWords.filter(w => store.learnedWords.includes(w.id)).length
    return Math.round((learned / lessonWords.length) * 100)
  }

  // If a lesson is selected, show its words as flashcard-style cards
  if (selectedLesson !== null) {
    const lesson = LESSONS_CONFIG.find(l => l.id === selectedLesson)
    const lessonWords = vocabulary.filter(w => w.lesson === selectedLesson)
    const learnedCount = lessonWords.filter(w => store.learnedWords.includes(w.id)).length

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedLesson(null)}>
            <ChevronLeft className="w-4 h-4 ml-1" /> العودة للدروس
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: lesson?.color + '20' }}>
            {lesson?.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">الدرس {selectedLesson}: {lesson?.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">{lessonWords.length} كلمة</span>
              <Badge variant="secondary" className="text-xs">{learnedCount} محفوظة</Badge>
            </div>
          </div>
        </div>
        <Progress value={(learnedCount / lessonWords.length) * 100} className="h-2" />
        {/* Word cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {lessonWords.map(word => {
            const isLearned = store.learnedWords.includes(word.id)
            return (
              <Card key={word.id} className={`border-0 shadow-sm transition-all hover:shadow-md ${isLearned ? 'ring-2 ring-emerald-200' : ''}`}>
                <CardContent className="p-4 text-center space-y-2" onClick={() => speak(word.zh)}>
                  <div className="font-chinese-serif text-3xl font-bold text-gray-900 dark:text-gray-100">{word.zh}</div>
                  <div className="font-chinese-sans text-xs text-gray-500">{word.pinyin}</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{word.meaning}</div>
                  {isLearned && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">✓ متعلمة</Badge>
                  )}
                  <Button size="sm" variant={isLearned ? 'ghost' : 'outline'} className="w-full text-xs mt-1"
                    onClick={(e) => { e.stopPropagation(); store.toggleLearned(word.id); store.incrementStreak(); }}>
                    {isLearned ? 'إلغاء الحفظ' : 'حفظ'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Lessons grid view
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-red-600" />
          الدروس
          <span className="text-gradient">(15 درساً)</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        <p className="text-gray-500 mt-1 text-sm">تعلّم خطوة بخطوة حسب المنهج الرسمي</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LESSONS_CONFIG.map(lesson => {
          const lessonWords = vocabulary.filter(w => w.lesson === lesson.id)
          const learnedCount = lessonWords.filter(w => store.learnedWords.includes(w.id)).length
          const totalCount = lessonWords.length
          const progress = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0
          const isUnlocked = lesson.id === 1 || getLessonProgress(lesson.id - 1) >= 50

          return (
            <Card
              key={lesson.id}
              className={`border-0 shadow-sm transition-all overflow-hidden ${
                isUnlocked
                  ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer group'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => isUnlocked && setSelectedLesson(lesson.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {/* Lesson icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: lesson.color + '18' }}>
                  {isUnlocked ? lesson.icon : '🔒'}
                </div>
                {/* Lesson info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 font-medium">الدرس {lesson.id}</div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{lesson.title}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">{totalCount} كلمة</div>
                  {totalCount > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: lesson.color }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* Progress circle */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                    <circle
                      cx="24" cy="24" r="20" fill="none"
                      stroke={lesson.color}
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={String(2 * Math.PI * 20)}
                      strokeDashoffset={String(2 * Math.PI * 20 * (1 - progress / 100))}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
