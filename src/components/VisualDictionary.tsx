'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VISUAL_DICT_CATEGORIES } from '@/data/visualDict'
import type { VisualDictWord } from '@/data/visualDict'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Volume2, Gamepad2, RotateCcw, ChevronLeft } from 'lucide-react'
import { useLearningStore } from '@/lib/store'

// ── TTS helper ──────────────────────────────────────────────────────────────
const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.8
    window.speechSynthesis.speak(u)
  }
}

// ── Fisher-Yates shuffle ────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Quiz option type ────────────────────────────────────────────────────────
interface QuizQuestion {
  word: VisualDictWord
  options: VisualDictWord[]
  correctIndex: number
}

// ── Component ───────────────────────────────────────────────────────────────
export default function VisualDictionary() {
  const [activeCategory, setActiveCategory] = useState(
    VISUAL_DICT_CATEGORIES[0].key,
  )
  const [quizMode, setQuizMode] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const incrementStreak = useLearningStore((s) => s.incrementStreak)

  // Current words based on active category
  const currentWords = useMemo(
    () =>
      VISUAL_DICT_CATEGORIES.find((c) => c.key === activeCategory)?.words ?? [],
    [activeCategory],
  )

  // All words across all categories (for quiz wrong answers)
  const allWords = useMemo(
    () => VISUAL_DICT_CATEGORIES.flatMap((c) => c.words),
    [],
  )

  // ── Start quiz ──────────────────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    setQuizMode(true)
    setQuizIndex(0)
    setScore(0)
    setQuizFinished(false)
    setSelectedOption(null)

    // Pick 10 random questions from all categories
    const pool = shuffle(allWords)
    const count = Math.min(10, pool.length)
    const questions: QuizQuestion[] = []

    for (let i = 0; i < count; i++) {
      const correct = pool[i]
      // Pick 3 random wrong answers (different from correct)
      const wrongs = shuffle(
        allWords.filter((w) => w.hanzi !== correct.hanzi),
      ).slice(0, 3)

      const options = shuffle([correct, ...wrongs])
      questions.push({
        word: correct,
        options,
        correctIndex: options.findIndex((o) => o.hanzi === correct.hanzi),
      })
    }

    setQuizQuestions(questions)
    incrementStreak()
  }, [allWords, incrementStreak])

  // ── Handle answer ───────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (optIdx: number) => {
      if (selectedOption !== null) return // already answered
      setSelectedOption(optIdx)

      const current = quizQuestions[quizIndex]
      const isCorrect = optIdx === current.correctIndex
      if (isCorrect) setScore((s) => s + 1)

      // Auto-advance after a short delay
      setTimeout(() => {
        if (quizIndex + 1 >= quizQuestions.length) {
          setQuizFinished(true)
        } else {
          setQuizIndex((i) => i + 1)
          setSelectedOption(null)
        }
      }, 1200)
    },
    [selectedOption, quizQuestions, quizIndex],
  )

  // ── Score feedback ──────────────────────────────────────────────────────
  const scoreEmoji = score >= 8 ? '🏆' : score >= 5 ? '⭐' : '💪'
  const scoreMessage =
    score >= 8
      ? 'ممتاز! أنت رائع'
      : score >= 5
        ? 'جيد! استمر'
        : 'لا تستسلم! حاول مرة أخرى'

  // ── Render quiz ─────────────────────────────────────────────────────────
  const renderQuiz = () => {
    if (quizFinished) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 space-y-6"
        >
          <div className="text-7xl">{scoreEmoji}</div>
          <p className="text-3xl font-bold text-white">{scoreMessage}</p>
          <p className="text-2xl text-gray-300" dir="rtl">
            {score} / {quizQuestions.length}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={startQuiz}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 px-6"
            >
              <RotateCcw className="h-4 w-4" />
              <span dir="rtl">🔄 تمرين جديد</span>
            </Button>
            <Button
              onClick={() => setQuizMode(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span dir="rtl">العودة للقاموس</span>
            </Button>
          </div>
        </motion.div>
      )
    }

    const current = quizQuestions[quizIndex]

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={quizIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span dir="rtl">السؤال {quizIndex + 1} من {quizQuestions.length}</span>
              <span>{score} ✓</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-500 rounded-full"
                animate={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Large emoji prompt */}
          <div className="text-center">
            <div className="text-8xl mb-2 block">{current.word.emoji}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speak(current.word.hanzi)}
              className="text-gray-400 hover:text-amber-400 gap-1"
            >
              <Volume2 className="h-4 w-4" />
              <span className="text-xs">استمع</span>
            </Button>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {current.options.map((opt, idx) => {
              const isCorrect = idx === current.correctIndex
              const isSelected = selectedOption === idx
              let bgClass = 'bg-gray-900 border-gray-800 hover:border-red-500/60'

              if (selectedOption !== null) {
                if (isCorrect) bgClass = 'bg-green-900/50 border-green-500'
                else if (isSelected && !isCorrect)
                  bgClass = 'bg-red-900/50 border-red-500'
                else bgClass = 'bg-gray-900/50 border-gray-800'
              }

              return (
                <motion.button
                  key={`${quizIndex}-${idx}`}
                  whileTap={selectedOption === null ? { scale: 0.97 } : undefined}
                  disabled={selectedOption !== null}
                  onClick={() => handleAnswer(idx)}
                  className={`${bgClass} border rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${selectedOption === null ? 'active:scale-[0.97]' : ''}`}
                >
                  <span className="font-serif text-xl font-bold text-white block mb-1">
                    {opt.hanzi}
                  </span>
                  <span className="text-gray-400 text-sm block" dir="rtl">
                    {opt.arabic}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3" dir="rtl">
            <span className="text-3xl">📖</span>
            القاموس البصري
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm" dir="rtl">
            تعلّم الكلمات الصينية بالصور والرموز التعبيرية. اضغط على أي بطاقة لسماع النطق.
          </p>
        </CardContent>
      </Card>

      {/* Category tabs */}
      {!quizMode && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {VISUAL_DICT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.key
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Quiz / Dictionary toggle */}
      {!quizMode && (
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-semibold text-gray-300"
            dir="rtl"
          >
            {VISUAL_DICT_CATEGORIES.find((c) => c.key === activeCategory)?.label} —{' '}
            {currentWords.length} كلمة
          </h3>
          <Button
            onClick={startQuiz}
            disabled={allWords.length < 4}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <Gamepad2 className="h-4 w-4" />
            <span dir="rtl">🎮 ابدأ تمرين الصور</span>
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {quizMode ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">{renderQuiz()}</CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${activeCategory}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          >
            {currentWords.map((w, i) => (
              <motion.div
                key={w.hanzi}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => speak(w.hanzi)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center cursor-pointer hover:border-red-500 hover:-translate-y-1 transition-all group"
              >
                <span className="text-4xl mb-2 block">{w.emoji}</span>
                <span className="font-serif text-xl font-bold text-white block">
                  {w.hanzi}
                </span>
                <span className="text-amber-400 text-sm block mt-1">{w.pinyin}</span>
                <span className="text-gray-400 text-xs block mt-1" dir="rtl">
                  {w.arabic}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    speak(w.hanzi)
                  }}
                  className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-amber-400"
                  aria-label={`Speak ${w.hanzi}`}
                >
                  <Volume2 className="h-4 w-4 inline" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
