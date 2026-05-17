'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VISUAL_DICT_CATEGORIES } from '@/data/visualDict'
import type { VisualDictWord } from '@/data/visualDict'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Volume2, Mic, MicOff, RotateCcw, ChevronLeft, ChevronRight,
  Gamepad2, Check, X, Star, Headphones, Languages
} from 'lucide-react'
import { useLearningStore } from '@/lib/store'

// ── TTS helper (high quality) ────────────────────────────────────────────────
const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = 0.75
  u.pitch = 1
  // Try to find a Chinese voice for better quality
  const voices = window.speechSynthesis.getVoices()
  const zhVoice = voices.find(v => v.lang.startsWith('zh-CN'))
    || voices.find(v => v.lang.startsWith('zh'))
  if (zhVoice) u.voice = zhVoice
  window.speechSynthesis.speak(u)
}

// Load voices
if (typeof window !== 'undefined') {
  window.speechSynthesis?.getVoices()
  window.speechSynthesis?.addEventListener('voiceschanged', () => {
    window.speechSynthesis?.getVoices()
  })
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

// ── Levenshtein Distance ────────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const m: number[][] = []
  for (let i = 0; i <= b.length; i++) m[i] = [i]
  for (let j = 0; j <= a.length; j++) m[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b[i - 1] === a[j - 1]
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1)
    }
  }
  return m[b.length][a.length]
}

function similarity(spoken: string, expected: string): number {
  if (!spoken || !expected) return 0
  const s = spoken.trim().toLowerCase()
  const e = expected.trim().toLowerCase()
  if (s === e) return 100
  const d = levenshtein(s, e)
  return Math.round(((Math.max(s.length, e.length) - d) / Math.max(s.length, e.length)) * 100)
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
  const [pronounceMode, setPronounceMode] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const incrementStreak = useLearningStore((s) => s.incrementStreak)

  // Pronunciation practice state
  const [pronounceWordIdx, setPronounceWordIdx] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [pronResult, setPronResult] = useState<{ score: number; spoken: string; color: string; msg: string } | null>(null)
  const [pronSupported, setPronSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

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

  const totalWords = allWords.length

  // Check speech recognition support
  if (typeof window !== 'undefined' && !pronSupported) {
    // already checked
  }
  useMemo(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setPronSupported(!!SR)
    }
  }, [])

  // ── Start quiz ──────────────────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    setQuizMode(true)
    setQuizIndex(0)
    setScore(0)
    setQuizFinished(false)
    setSelectedOption(null)

    const pool = shuffle(allWords)
    const count = Math.min(10, pool.length)
    const questions: QuizQuestion[] = []

    for (let i = 0; i < count; i++) {
      const correct = pool[i]
      const wrongs = shuffle(allWords.filter((w) => w.hanzi !== correct.hanzi)).slice(0, 3)
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
      if (selectedOption !== null) return
      setSelectedOption(optIdx)

      const current = quizQuestions[quizIndex]
      if (optIdx === current.correctIndex) setScore((s) => s + 1)

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

  // ── Pronunciation practice: start recording ─────────────────────────────
  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setPronSupported(false); return }

    setPronResult(null)
    setIsRecording(true)

    const recognition = new SR()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 5
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const results = event.results
      let bestSim = 0
      let bestSpoken = ''
      for (let i = 0; i < results[0].length; i++) {
        const alt = results[0][i]
        const sim = similarity(alt.transcript, currentWords[pronounceWordIdx]?.hanzi || '')
        if (sim > bestSim) { bestSim = sim; bestSpoken = alt.transcript }
      }

      const s = bestSim
      setPronResult({
        score: s,
        spoken: bestSpoken,
        color: s >= 85 ? '#22c55e' : s >= 60 ? '#f97316' : '#ef4444',
        msg: s >= 85 ? 'ممتاز! نطقك رائع! 🎉' : s >= 60 ? 'جيد! استمر بالتدريب 💪' : 'حاول مرة أخرى، استمع أولاً 🎧',
      })
      setIsRecording(false)
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [currentWords, pronounceWordIdx])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsRecording(false)
  }, [])

  // ── Score feedback ──────────────────────────────────────────────────────
  const scoreEmoji = score >= 8 ? '🏆' : score >= 5 ? '⭐' : '💪'
  const scoreMessage =
    score >= 8 ? 'ممتاز! أنت رائع' : score >= 5 ? 'جيد! استمر' : 'لا تستسلم! حاول مرة أخرى'

  // ── Active view: 'browse' | 'quiz' | 'pronounce' ──────────────────────
  const [activeView, setActiveView] = useState<'browse' | 'quiz' | 'pronounce'>('browse')

  const currentCat = VISUAL_DICT_CATEGORIES.find((c) => c.key === activeCategory)

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-l from-red-600 via-rose-600 to-red-700 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <span className="text-4xl">📖</span>
              القاموس المرئي والنطق
            </h2>
            <p className="text-red-100 mt-1 text-sm sm:text-base">
              تعلّم الكلمات الصينية بالصور والنطق الصحيح — {totalWords} كلمة في {VISUAL_DICT_CATEGORIES.length} فئات
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveView('browse')}
              variant={activeView === 'browse' ? 'secondary' : 'ghost'}
              className={`${activeView === 'browse' ? 'bg-white/20 hover:bg-white/30 text-white' : 'text-red-100 hover:text-white hover:bg-white/10'}`}
              size="sm"
            >
              <Languages className="w-4 h-4 ml-1" />
              تصفّح
            </Button>
            <Button
              onClick={() => { setActiveView('pronounce'); setPronounceWordIdx(0); setPronResult(null) }}
              variant={activeView === 'pronounce' ? 'secondary' : 'ghost'}
              className={`${activeView === 'pronounce' ? 'bg-white/20 hover:bg-white/30 text-white' : 'text-red-100 hover:text-white hover:bg-white/10'}`}
              size="sm"
              disabled={!pronSupported}
            >
              <Mic className="w-4 h-4 ml-1" />
              تدرّب على النطق
            </Button>
            <Button
              onClick={() => { startQuiz(); setActiveView('quiz') }}
              variant={activeView === 'quiz' ? 'secondary' : 'ghost'}
              className={`${activeView === 'quiz' ? 'bg-white/20 hover:bg-white/30 text-white' : 'text-red-100 hover:text-white hover:bg-white/10'}`}
              size="sm"
            >
              <Gamepad2 className="w-4 h-4 ml-1" />
              اختبر نفسك
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BROWSE VIEW                                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeView === 'browse' && (
        <div className="space-y-4">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
            {VISUAL_DICT_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeCategory === cat.key
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
                <Badge
                  variant={activeCategory === cat.key ? 'secondary' : 'outline'}
                  className={`text-[10px] px-1.5 py-0 ${
                    activeCategory === cat.key ? 'bg-white/20 text-white border-0' : ''
                  }`}
                >
                  {cat.words.length}
                </Badge>
              </button>
            ))}
          </div>

          {/* Category title */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-xl">{currentCat?.icon}</span>
              {currentCat?.label}
              <Badge variant="secondary" className="font-normal">
                {currentWords.length} كلمة
              </Badge>
            </h3>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                // Speak all words in sequence
                let i = 0
                const speakNext = () => {
                  if (i < currentWords.length) {
                    speak(currentWords[i].hanzi)
                    i++
                    setTimeout(speakNext, 1500)
                  }
                }
                speakNext()
              }}
            >
              <Headphones className="w-4 h-4 ml-1" />
              استمع للكل
            </Button>
          </div>

          {/* Words grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`grid-${activeCategory}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
            >
              {currentWords.map((w, i) => (
                <motion.div
                  key={w.hanzi}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-red-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => speak(w.hanzi)}
                >
                  {/* Emoji background */}
                  <div className="absolute top-2 left-2 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    {w.emoji}
                  </div>

                  <div className="p-4 text-center space-y-2 relative">
                    {/* Emoji */}
                    <span className="text-4xl block drop-shadow-sm">{w.emoji}</span>

                    {/* Hanzi */}
                    <span className="block text-2xl font-bold text-gray-900 font-chinese-serif">
                      {w.hanzi}
                    </span>

                    {/* Pinyin */}
                    <span className="block text-sm text-rose-600 font-medium font-chinese-sans">
                      {w.pinyin}
                    </span>

                    {/* Arabic meaning */}
                    <span className="block text-xs text-gray-500 truncate" dir="rtl">
                      {w.arabic}
                    </span>

                    {/* Play button - always visible */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        speak(w.hanzi)
                      }}
                      className="mx-auto mt-1 w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors group-hover:bg-red-600 group-hover:text-white"
                      aria-label={`نطق ${w.hanzi}`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-red-500 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PRONOUNCE VIEW                                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeView === 'pronounce' && (
        <div className="space-y-4">
          {!pronSupported ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-700 font-medium">المتصفح لا يدعم التعرف على الصوت</p>
              <p className="text-amber-600 text-sm mt-1">يرجى استخدام Chrome أو Edge لهذه الميزة</p>
            </div>
          ) : (
            <>
              {/* Category selector for pronunciation */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => { setActiveCategory('all'); setPronounceWordIdx(0); setPronResult(null) }}
                  className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === 'all'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-red-50 border border-gray-200'
                  }`}
                >
                  الكل ({totalWords})
                </button>
                {VISUAL_DICT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveCategory(cat.key); setPronounceWordIdx(0); setPronResult(null) }}
                    className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeCategory === cat.key
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-500 hover:bg-red-50 border border-gray-200'
                    }`}
                  >
                    {cat.icon} {cat.label} ({cat.words.length})
                  </button>
                ))}
              </div>

              {currentWords.length > 0 && pronounceWordIdx < currentWords.length && (
                <div className="max-w-lg mx-auto">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Progress */}
                    <div className="h-1 bg-gray-100">
                      <div
                        className="h-full bg-gradient-to-l from-red-500 to-rose-500 transition-all duration-300"
                        style={{ width: `${((pronounceWordIdx + 1) / currentWords.length) * 100}%` }}
                      />
                    </div>

                    <div className="p-6 sm:p-8 text-center space-y-6">
                      {/* Counter */}
                      <p className="text-sm text-gray-400">
                        {pronounceWordIdx + 1} / {currentWords.length}
                      </p>

                      {/* Word card */}
                      <motion.div
                        key={`pron-${pronounceWordIdx}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        <span className="text-5xl block">{currentWords[pronounceWordIdx].emoji}</span>
                        <div className="text-5xl font-bold text-gray-900 font-chinese-serif">
                          {currentWords[pronounceWordIdx].hanzi}
                        </div>
                        <div className="text-xl text-rose-600 font-medium font-chinese-sans">
                          {currentWords[pronounceWordIdx].pinyin}
                        </div>
                        <div className="text-base text-gray-600" dir="rtl">
                          {currentWords[pronounceWordIdx].arabic}
                        </div>
                      </motion.div>

                      {/* Listen button */}
                      <Button
                        variant="outline"
                        size="lg"
                        className="mx-auto gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => speak(currentWords[pronounceWordIdx].hanzi)}
                      >
                        <Volume2 className="w-5 h-5" />
                        استمع للنطق الصحيح
                      </Button>

                      {/* Mic button */}
                      <div className="flex flex-col items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                            isRecording
                              ? 'bg-red-600 shadow-lg shadow-red-200'
                              : 'bg-red-50 border-2 border-red-300 hover:border-red-500 hover:bg-red-100'
                          }`}
                        >
                          {isRecording && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-4 border-red-400"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          {isRecording
                            ? <MicOff className="w-8 h-8 text-white" />
                            : <Mic className="w-8 h-8 text-red-600" />
                          }
                        </motion.button>
                        <p className="text-xs text-gray-400">
                          {isRecording ? 'جاري التسجيل... اضغط للإيقاف' : 'سجّل نطقك'}
                        </p>
                      </div>

                      {/* Waveform animation */}
                      {isRecording && (
                        <div className="flex items-center justify-center gap-0.5 h-8">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-red-400 rounded-full"
                              animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                              transition={{
                                duration: 0.4 + Math.random() * 0.4,
                                repeat: Infinity,
                                delay: i * 0.04,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Result */}
                      <AnimatePresence>
                        {pronResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                          >
                            <div
                              className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto"
                              style={{ borderColor: pronResult.color }}
                            >
                              <span className="text-2xl font-bold" style={{ color: pronResult.color }}>
                                {pronResult.score}
                              </span>
                            </div>
                            <div
                              className="text-base p-3 rounded-xl"
                              style={{ backgroundColor: pronResult.color + '15', color: pronResult.color }}
                            >
                              {pronResult.msg}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-400">ما قلته:</span>
                                <span className="font-chinese-sans">{pronResult.spoken}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">الصحيح:</span>
                                <span className="font-chinese-sans font-bold text-red-600">
                                  {currentWords[pronounceWordIdx].hanzi}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Navigation */}
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pronounceWordIdx <= 0}
                          onClick={() => { setPronounceWordIdx(p => p - 1); setPronResult(null) }}
                        >
                          <ChevronRight className="w-4 h-4 ml-1" />
                          السابق
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          disabled={pronounceWordIdx >= currentWords.length - 1}
                          onClick={() => { setPronounceWordIdx(p => p + 1); setPronResult(null) }}
                        >
                          التالي
                          <ChevronLeft className="w-4 h-4 mr-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* QUIZ VIEW                                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeView === 'quiz' && (
        <div className="max-w-lg mx-auto">
          {quizFinished ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6"
            >
              <div className="text-7xl">{scoreEmoji}</div>
              <p className="text-3xl font-bold text-gray-900">{scoreMessage}</p>
              <p className="text-xl text-gray-500" dir="rtl">
                {score} / {quizQuestions.length}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={startQuiz} className="bg-red-600 hover:bg-red-700 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  تمرين جديد
                </Button>
                <Button
                  onClick={() => setActiveView('browse')}
                  variant="outline"
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  العودة للقاموس
                </Button>
              </div>
            </motion.div>
          ) : quizQuestions.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={quizIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-4"
              >
                {/* Progress */}
                <div className="space-y-2 p-4 pb-0">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span dir="rtl">السؤال {quizIndex + 1} من {quizQuestions.length}</span>
                    <span>{score} ✓</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-l from-red-500 to-rose-500 rounded-full"
                      animate={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Emoji + listen */}
                  <div className="text-center">
                    <div className="text-7xl mb-2">{quizQuestions[quizIndex].word.emoji}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speak(quizQuestions[quizIndex].word.hanzi)}
                      className="text-gray-400 hover:text-red-500 gap-1"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="text-xs">استمع</span>
                    </Button>
                  </div>

                  {/* Options grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {quizQuestions[quizIndex].options.map((opt, idx) => {
                      const isCorrect = idx === quizQuestions[quizIndex].correctIndex
                      const isSelected = selectedOption === idx
                      let bgClass = 'bg-gray-50 border-gray-200 hover:border-red-300 hover:bg-red-50'

                      if (selectedOption !== null) {
                        if (isCorrect) bgClass = 'bg-green-50 border-green-400'
                        else if (isSelected && !isCorrect) bgClass = 'bg-red-50 border-red-400'
                        else bgClass = 'bg-gray-50 border-gray-100'
                      }

                      return (
                        <motion.button
                          key={`${quizIndex}-${idx}`}
                          whileTap={selectedOption === null ? { scale: 0.97 } : undefined}
                          disabled={selectedOption !== null}
                          onClick={() => handleAnswer(idx)}
                          className={`${bgClass} border rounded-xl p-4 text-center cursor-pointer transition-all duration-200`}
                        >
                          <span className="font-chinese-serif text-xl font-bold text-gray-900 block mb-1">
                            {opt.hanzi}
                          </span>
                          <span className="text-xs text-gray-400 font-chinese-sans block">
                            {opt.pinyin}
                          </span>
                          <span className="text-sm text-gray-600 block mt-1" dir="rtl">
                            {opt.arabic}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      )}
    </div>
  )
}
