'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { useLearningStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Layers, GraduationCap, PenLine, Zap, ClipboardCheck,
  Volume2, ChevronLeft, ChevronRight, Shuffle, Star,
  Check, X, RotateCcw, ArrowRight, ArrowLeft, Clock,
  Trophy, Target, BookOpen, Sparkles, Heart, Brain,
  FlipHorizontal, Send, CircleDot, SkipForward, BarChart3,
  Mic, MicOff, Lightbulb
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── TTS Helper ─────────────────────────────────────────────
const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.8
    window.speechSynthesis.speak(u)
  }
}

// ─── Types ──────────────────────────────────────────────────
type StudyMode = 'flashcards' | 'learn' | 'write' | 'match' | 'test' | 'pronunciation'

// ─── Modes Config ───────────────────────────────────────────
const studyModes: { id: StudyMode; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'flashcards', label: 'البطاقات', icon: Layers, color: 'text-sky-500' },
  { id: 'learn', label: 'تعلّم', icon: GraduationCap, color: 'text-purple-500' },
  { id: 'write', label: 'اكتب', icon: PenLine, color: 'text-amber-500' },
  { id: 'match', label: 'طابق', icon: Zap, color: 'text-lime-500' },
  { id: 'test', label: 'اختبر', icon: ClipboardCheck, color: 'text-rose-500' },
  { id: 'pronunciation', label: 'النطق', icon: Mic, color: 'text-emerald-500' },
]

// ─── Shuffled vocabulary for modes ─────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function FlashcardSystem() {
  const store = useLearningStore()
  const [activeMode, setActiveMode] = useState<StudyMode>('flashcards')
  const [wordSet, setWordSet] = useState<VocabWord[]>(() => vocabulary.slice(0, 20))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-500" />
            نظام البطاقات الذكي
          </h2>
          <p className="text-gray-500 mt-1 text-sm">تعلّم المفردات بـ 6 طرق مختلفة مثل Quizlet</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {vocabulary.length} كلمة متاحة
        </Badge>
      </div>

      {/* Study Modes Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5 overflow-x-auto scroll-x-fade">
        {studyModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
              activeMode === mode.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <mode.icon className={`w-4 h-4 ${activeMode === mode.id ? mode.color : ''}`} />
            <span className="hidden sm:inline">{mode.label}</span>
            <span className="sm:hidden">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Mode Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeMode === 'flashcards' && <FlashcardsMode />}
          {activeMode === 'learn' && <LearnMode />}
          {activeMode === 'write' && <WriteMode />}
          {activeMode === 'match' && <MatchMode />}
          {activeMode === 'test' && <TestMode />}
          {activeMode === 'pronunciation' && <PronunciationMode />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 1. FLASHCARDS MODE
// ═══════════════════════════════════════════════════════════
function FlashcardsMode() {
  const store = useLearningStore()
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const words = useMemo(() => {
    const unlearned = vocabulary.filter(w => {
      const card = store.srsCards[w.id]
      return !card || card.reviewCount < 3
    })
    return shuffled ? shuffleArray(unlearned) : unlearned
  }, [shuffled, vocabulary, store.srsCards])
  const word = words[store.flashcardIndex]

  // Reset flip when card index changes
  const prevIndexRef = useRef(store.flashcardIndex)
  useEffect(() => {
    if (prevIndexRef.current !== store.flashcardIndex) {
      prevIndexRef.current = store.flashcardIndex
      setTimeout(() => setIsFlipped(false), 0)
    }
  }, [store.flashcardIndex])

  const sentences = useMemo(() => {
    if (!word) return []
    const s: { zh: string; pinyin: string; ar: string }[] = [
      { zh: word.exZh, pinyin: word.exPinyin, ar: word.exEn },
    ]
    if (word.s2) s.push({ zh: word.s2.zh, pinyin: word.s2.py, ar: word.s2.ar })
    if (word.s3) s.push({ zh: word.s3.zh, pinyin: word.s3.py, ar: word.s3.ar })
    return s.filter(x => x.zh)
  }, [word])

  if (!word) return null

  const nextCard = () => {
    if (store.flashcardIndex < words.length - 1) {
      store.setFlashcardIndex(store.flashcardIndex + 1)
    }
  }

  const prevCard = () => {
    if (store.flashcardIndex > 0) {
      store.setFlashcardIndex(store.flashcardIndex - 1)
    }
  }

  const handleKnowIt = () => {
    store.toggleLearned(word.id)
    store.incrementStreak()
    store.rateWord(word.id, 5)
    nextCard()
  }

  const handleDontKnow = () => {
    store.rateWord(word.id, 1)
    nextCard()
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={shuffled ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setShuffled(!shuffled); store.setFlashcardIndex(0) }}
            className="gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خليط</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => store.setFlashcardIndex(0)} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إعادة</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { localStorage.removeItem('srs'); location.reload() }}
            className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إعادة تعيين الحفظ</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {store.flashcardIndex + 1} / {words.length}
          </span>
          <Input
            type="number"
            min={1}
            max={words.length}
            value={store.flashcardIndex + 1}
            onChange={(e) => {
              const v = parseInt(e.target.value)
              if (v >= 1 && v <= words.length) store.setFlashcardIndex(v - 1)
            }}
            className="w-16 h-8 text-center text-sm"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={((store.flashcardIndex + 1) / words.length) * 100} className="h-1.5" />

      {/* Flashcard */}
      <div className="perspective-1000">
        <div
          className={`relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ minHeight: '340px' }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden">
            <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-sky-50 hover:shadow-xl transition-shadow">
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                  <FlipHorizontal className="w-3 h-3" />
                  انقر للقلب
                </div>
                <div
                  className="font-chinese-serif text-7xl sm:text-8xl mb-4 text-gray-900 cursor-pointer hover:text-sky-500 transition-colors active:scale-95"
                  onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                >
                  {word.zh}
                </div>
                <div className="text-lg text-gray-500 font-chinese-sans mb-2">{word.pinyin}</div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                  <Volume2 className="w-3 h-3" />
                  <span>اضغط للحروف للنطق</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="outline" className="text-xs">{word.pos}</Badge>
                  <Badge variant="outline" className="text-xs">{word.difficulty === 'easy' ? 'سهل' : word.difficulty === 'medium' ? 'متوسط' : 'صعب'}</Badge>
                </div>
                {store.isLearned(word.id) && (
                  <div className="mt-3 flex items-center gap-1 text-lime-600 text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    <span>تم الحفظ</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 overflow-y-auto custom-scrollbar">
              <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                <div className="text-3xl font-bold text-gray-900">{word.meaning}</div>
                <div className="font-chinese-serif text-4xl text-sky-700">{word.zh}</div>
                <div className="text-sm text-gray-500 font-chinese-sans">{word.pinyin}</div>
                {word.english && (
                  <div className="text-xs text-gray-400">({word.english})</div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                  className="mt-1 flex items-center gap-1 text-sky-500 text-sm hover:text-sky-600 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  استمع للنطق
                </button>

                {/* Sentences */}
                <div className="w-full border-t border-gray-200 pt-3 mt-2 space-y-2">
                  <div className="text-xs font-medium text-gray-500">📝 أمثلة:</div>
                  {sentences.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg bg-white/60 hover:bg-white cursor-pointer transition-colors text-right"
                      onClick={(e) => { e.stopPropagation(); speak(s.zh) }}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-chinese-serif text-sm text-gray-900">{s.zh}</div>
                        <div className="text-xs text-gray-500 font-chinese-sans">{s.pinyin}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.ar}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Know it / Don't know it (Quizlet-style) */}
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <Button
          variant="outline"
          className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 text-sm"
          onClick={handleDontKnow}
        >
          <X className="w-4 h-4" />
          لا أعرف
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0"
          onClick={() => speak(word.zh)}
        >
          <Volume2 className="w-4 h-4" />
        </Button>
        <Button
          className="flex-1 h-12 bg-lime-500 hover:bg-lime-600 text-white gap-2 text-sm"
          onClick={handleKnowIt}
        >
          <Check className="w-4 h-4" />
          أعرفها
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <Button variant="ghost" size="sm" onClick={prevCard} disabled={store.flashcardIndex === 0} className="gap-1">
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>
        <Button
          size="sm"
          variant={store.isLearned(word.id) ? 'default' : 'outline'}
          onClick={() => { store.toggleLearned(word.id); store.incrementStreak() }}
          className={store.isLearned(word.id) ? 'bg-lime-500 hover:bg-lime-600 gap-1' : 'gap-1'}
        >
          {store.isLearned(word.id) ? <><Star className="w-3.5 h-3.5 fill-current" /> محفوظة</> : <><Star className="w-3.5 h-3.5" /> حفظ</>}
        </Button>
        <Button variant="ghost" size="sm" onClick={nextCard} disabled={store.flashcardIndex >= words.length - 1} className="gap-1">
          التالي
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 2. LEARN MODE (Adaptive Quizlet Learn)
// ═══════════════════════════════════════════════════════════
function LearnMode() {
  const store = useLearningStore()
  const [questionCount] = useState(15)
  const [questions, setQuestions] = useState<Array<{
    word: VocabWord;
    type: 'zh-to-ar' | 'ar-to-zh' | 'pinyin-to-zh';
    options: string[];
    correctIndex: number;
  }>>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [finished, setFinished] = useState(false)
  const [incorrectWords, setIncorrectWords] = useState<number[]>([])
  const [showAnswer, setShowAnswer] = useState(false)

  const generateQuestions = useCallback((count: number, weakIds: number[] = []) => {
    const unlearned = vocabulary.filter(w => {
      const card = store.srsCards[w.id]
      return !card || card.reviewCount < 3
    })
    let pool = [...unlearned]
    // Prioritize weak words
    if (weakIds.length > 0) {
      const weakWords = pool.filter(w => weakIds.includes(w.id))
      const otherWords = pool.filter(w => !weakIds.includes(w.id))
      pool = [...shuffleArray(weakWords), ...shuffleArray(otherWords)]
    } else {
      pool = shuffleArray(pool)
    }
    pool = pool.slice(0, count)

    const qs = pool.map(word => {
      const typeRoll = Math.random()
      let type: 'zh-to-ar' | 'ar-to-zh' | 'pinyin-to-zh' = 'zh-to-ar'
      if (typeRoll < 0.4) type = 'zh-to-ar'
      else if (typeRoll < 0.7) type = 'ar-to-zh'
      else type = 'pinyin-to-zh'

      let question: string, correctAnswer: string
      if (type === 'zh-to-ar') {
        question = word.zh
        correctAnswer = word.meaning
      } else if (type === 'ar-to-zh') {
        question = word.meaning
        correctAnswer = word.zh
      } else {
        question = word.pinyin
        correctAnswer = word.zh
      }

      // Generate wrong options
      const wrongOptions = vocabulary
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => type === 'zh-to-ar' ? w.meaning : w.zh)

      const options = shuffleArray([...wrongOptions, correctAnswer])
      return {
        word,
        type,
        options,
        correctIndex: options.indexOf(correctAnswer),
      }
    })
    return qs
  }, [store.srsCards])

  const startRound = useCallback((weakIds: number[] = []) => {
    const qs = generateQuestions(questionCount, weakIds)
    setQuestions(qs)
    setCurrentQ(0)
    setSelected(null)
    setIsCorrect(null)
    setScore(0)
    setFinished(false)
    setShowAnswer(false)
  }, [generateQuestions, questionCount])

  useEffect(() => {
    const t = setTimeout(() => startRound(), 0)
    return () => clearTimeout(t)
  }, [startRound])

  const handleAnswer = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    const q = questions[currentQ]
    const correct = index === q.correctIndex
    setIsCorrect(correct)
    if (correct) {
      setScore(s => s + 1)
      store.rateWord(q.word.id, 4)
    } else {
      store.rateWord(q.word.id, 1)
      setIncorrectWords(prev => [...prev, q.word.id])
    }
  }

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrentQ(prev => prev + 1)
      setSelected(null)
      setIsCorrect(null)
      setShowAnswer(false)
    }
  }

  if (questions.length === 0) return null

  const q = questions[currentQ]
  const progress = ((currentQ + (selected !== null ? 1 : 0)) / questions.length) * 100

  // Finished Screen
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-sky-50">
          <CardContent className="p-8 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <Trophy className={`w-16 h-16 mx-auto ${percentage >= 80 ? 'text-yellow-500' : percentage >= 50 ? 'text-sky-500' : 'text-gray-400'}`} />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900">
              {percentage >= 90 ? '🎉 ممتاز!' : percentage >= 70 ? '👏 أحسنت!' : percentage >= 50 ? '💪 جيد!' : '📚 استمر في التعلم!'}
            </h3>
            <div className="text-4xl font-bold text-sky-600">{score} / {questions.length}</div>
            <Progress value={percentage} className="h-3" />
            <p className="text-sm text-gray-500">الجولة {round} • {percentage}% صحيح</p>

            {incorrectWords.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 text-right">
                <p className="text-sm font-medium text-amber-700 mb-2">⚠️ كلمات تحتاج مراجعة ({incorrectWords.length}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {incorrectWords.slice(0, 8).map(id => {
                    const w = vocabulary.find(v => v.id === id)
                    return w ? (
                      <Badge key={id} variant="outline" className="text-xs font-chinese-serif">
                        {w.zh} ({w.meaning.split('/')[0].trim()})
                      </Badge>
                    ) : null
                  })}
                  {incorrectWords.length > 8 && (
                    <Badge variant="outline" className="text-xs">+{incorrectWords.length - 8}</Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => { setRound(r => r + 1); startRound(incorrectWords) }} className="flex-1 gap-2">
                <RotateCcw className="w-4 h-4" />
                {incorrectWords.length > 0 ? 'راجع الأخطاء' : 'جولة جديدة'}
              </Button>
              <Button variant="outline" onClick={() => startRound()} className="gap-2">
                <Sparkles className="w-4 h-4" />
                كلمات جديدة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>الجولة {round}</span>
        <span>{currentQ + 1} من {questions.length}</span>
        <span className="flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-sky-500" />
          {score} صحيح
        </span>
      </div>
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Question Type Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {q.type === 'zh-to-ar' ? '🔤 الصينية → العربية' : q.type === 'ar-to-zh' ? '🔤 العربية → الصينية' : '🎵 البينين → الصينية'}
            </Badge>
            {!showAnswer && selected === null && (
              <Button variant="ghost" size="sm" onClick={() => setShowAnswer(true)} className="text-xs text-gray-400 gap-1">
                <Eye className="w-3 h-3" />
                كشف الإجابة
              </Button>
            )}
          </div>

          {/* Question */}
          <div className="text-center space-y-2">
            {q.type === 'zh-to-ar' && (
              <>
                <div
                  className="font-chinese-serif text-6xl sm:text-7xl text-gray-900 cursor-pointer hover:text-sky-500 transition-colors active:scale-95"
                  onClick={() => speak(q.word.zh)}
                >
                  {q.word.zh}
                </div>
                <div className="text-sm text-gray-400 font-chinese-sans">{q.word.pinyin}</div>
              </>
            )}
            {q.type === 'ar-to-zh' && (
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{q.word.meaning}</div>
            )}
            {q.type === 'pinyin-to-zh' && (
              <>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 font-chinese-sans">{q.word.pinyin}</div>
                <button onClick={() => speak(q.word.zh)} className="flex items-center gap-1 mx-auto text-sky-500 text-sm mt-1">
                  <Volume2 className="w-4 h-4" />
                  استمع
                </button>
              </>
            )}
            <p className="text-sm text-gray-400">ما هو/هي {q.type === 'zh-to-ar' ? 'المعنى بالعربية' : 'الحرف الصيني'}؟</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((option, i) => {
              let btnClass = 'w-full text-right px-4 py-3 rounded-xl border-2 transition-all text-sm min-h-[44px] '
              if (selected !== null) {
                if (i === q.correctIndex) {
                  btnClass += 'border-green-400 bg-green-50 text-green-800'
                } else if (i === selected && !isCorrect) {
                  btnClass += 'border-red-400 bg-red-50 text-red-800'
                } else {
                  btnClass += 'border-gray-200 bg-gray-50 text-gray-400'
                }
              } else {
                btnClass += 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50 text-gray-700 active:scale-[0.98]'
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={btnClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-chinese-serif text-base">{option}</span>
                    {selected !== null && i === q.correctIndex && <Check className="w-4 h-4 text-green-500" />}
                    {selected === i && !isCorrect && <X className="w-4 h-4 text-red-500" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback & Next */}
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {isCorrect ? (
                <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">إجابة صحيحة! 🎉</span>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="flex items-center gap-2 text-amber-600 text-sm justify-center mb-1">
                    <X className="w-4 h-4" />
                    <span>إجابة خاطئة</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    الإجابة الصحيحة: <span className="font-bold font-chinese-serif text-sky-600">{q.options[q.correctIndex]}</span>
                  </div>
                </div>
              )}
              <Button onClick={nextQuestion} className="w-full gap-2">
                {currentQ + 1 >= questions.length ? 'عرض النتيجة' : 'التالي'}
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Eye icon inline since we don't import it above
function Eye({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════
// 3. WRITE MODE (Type the answer)
// ═══════════════════════════════════════════════════════════
function WriteMode() {
  const store = useLearningStore()
  const [questionCount] = useState(12)
  const [questions, setQuestions] = useState<Array<{
    word: VocabWord;
    prompt: string;
    promptType: 'meaning' | 'pinyin' | 'zh';
    answer: string;
    answerType: 'zh' | 'meaning' | 'pinyin';
    hint: string;
  }>>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Generate questions — skip learned words
    const unlearned = vocabulary.filter(w => {
      const card = store.srsCards[w.id]
      return !card || card.reviewCount < 3
    })
    const pool = shuffleArray(unlearned).slice(0, questionCount)
    const qs = pool.map(word => {
      const types: Array<{ prompt: string; promptType: 'meaning' | 'pinyin' | 'zh'; answer: string; answerType: 'zh' | 'meaning' | 'pinyin'; hint: string }> = [
        { prompt: word.meaning, promptType: 'meaning', answer: word.zh, answerType: 'zh', hint: word.pinyin },
        { prompt: word.zh, promptType: 'zh', answer: word.pinyin, answerType: 'pinyin', hint: word.meaning.split('/')[0].trim() },
        { prompt: word.pinyin, promptType: 'pinyin', answer: word.zh, answerType: 'zh', hint: word.meaning.split('/')[0].trim() },
      ]
      const chosen = types[Math.floor(Math.random() * types.length)]
      return { word, ...chosen }
    })
    setTimeout(() => setQuestions(qs), 0)
  }, [questionCount])

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentQ])

  if (questions.length === 0) return null

  const q = questions[currentQ]
  const progress = ((currentQ + (isSubmitted ? 1 : 0)) / questions.length) * 100

  const handleSubmit = () => {
    if (!userInput.trim()) return
    const correct = userInput.trim() === q.answer.trim() ||
      userInput.trim().toLowerCase() === q.answer.trim().toLowerCase()
    setIsCorrect(correct)
    setIsSubmitted(true)
    if (correct) {
      setScore(s => s + 1)
      setStreak(s => {
        const ns = s + 1
        setBestStreak(b => Math.max(b, ns))
        return ns
      })
      store.rateWord(q.word.id, 5)
    } else {
      setStreak(0)
      store.rateWord(q.word.id, 1)
    }
  }

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrentQ(prev => prev + 1)
      setUserInput('')
      setIsSubmitted(false)
      setIsCorrect(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSubmitted) nextQuestion()
      else handleSubmit()
    }
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50">
          <CardContent className="p-8 text-center space-y-4">
            <PenLine className="w-14 h-14 mx-auto text-amber-500" />
            <h3 className="text-2xl font-bold text-gray-900">✍️ نتيجة الكتابة</h3>
            <div className="text-4xl font-bold text-amber-600">{score} / {questions.length}</div>
            <Progress value={percentage} className="h-3" />
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {percentage}%</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> أفضل سلسلة: {bestStreak}</span>
            </div>
            <Button onClick={() => {
              const pool = shuffleArray(vocabulary).slice(0, questionCount)
              const qs = pool.map(word => {
                const types: Array<{ prompt: string; promptType: 'meaning' | 'pinyin' | 'zh'; answer: string; answerType: 'zh' | 'meaning' | 'pinyin'; hint: string }> = [
                  { prompt: word.meaning, promptType: 'meaning', answer: word.zh, answerType: 'zh', hint: word.pinyin },
                  { prompt: word.zh, promptType: 'zh', answer: word.pinyin, answerType: 'pinyin', hint: word.meaning.split('/')[0].trim() },
                  { prompt: word.pinyin, promptType: 'pinyin', answer: word.zh, answerType: 'zh', hint: word.meaning.split('/')[0].trim() },
                ]
                const chosen = types[Math.floor(Math.random() * types.length)]
                return { word, ...chosen }
              })
              setQuestions(qs)
              setCurrentQ(0)
              setUserInput('')
              setIsSubmitted(false)
              setIsCorrect(false)
              setScore(0)
              setFinished(false)
              setStreak(0)
            }} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              جولة جديدة
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{currentQ + 1} من {questions.length}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            سلسلة: {streak}
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-green-500" />
            {score}
          </span>
        </div>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Prompt */}
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs">
              {q.promptType === 'meaning' ? '📝 اكتب الحرف الصيني' : q.promptType === 'pinyin' ? '🎵 اكتب الحرف الصيني' : '🔤 اكتب البينين'}
            </Badge>
            {q.promptType === 'zh' && (
              <div
                className="font-chinese-serif text-6xl text-gray-900 cursor-pointer hover:text-sky-500 transition-colors"
                onClick={() => speak(q.word.zh)}
              >
                {q.word.zh}
              </div>
            )}
            <div className="text-2xl font-bold text-gray-900">{q.prompt}</div>
            {!isSubmitted && (
              <p className="text-sm text-gray-400">
                💡 تلميح: {q.hint}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={q.answerType === 'zh' ? 'اكتب الحرف الصيني...' : 'اكتب الإجابة...'}
                disabled={isSubmitted}
                className={`text-center text-lg h-14 font-chinese-serif ${
                  isSubmitted
                    ? isCorrect
                      ? 'border-green-400 bg-green-50'
                      : 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                }`}
                dir="ltr"
              />
            </div>

            {/* Submit / Feedback */}
            {!isSubmitted ? (
              <Button onClick={handleSubmit} disabled={!userInput.trim()} className="w-full h-12 gap-2">
                <Send className="w-4 h-4" />
                تحقق
              </Button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium py-2">
                    <Check className="w-5 h-5" />
                    صحيح! {streak > 1 && `🔥 سلسلة ${streak}`}
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-xl p-3 text-center space-y-1">
                    <div className="text-sm text-amber-600">الإجابة الصحيحة:</div>
                    <div className="text-xl font-bold font-chinese-serif text-sky-600">{q.answer}</div>
                  </div>
                )}
                <Button onClick={nextQuestion} className="w-full h-12 gap-2">
                  {currentQ + 1 >= questions.length ? 'عرض النتيجة' : 'التالي'}
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 4. MATCH MODE (Timed Matching Game - Quizlet Style)
// ═══════════════════════════════════════════════════════════
interface MatchCard {
  id: string;
  text: string;
  pairId: number;
  type: 'zh' | 'meaning';
  matched: boolean;
  selected: boolean;
  wrong: boolean;
}

function MatchMode() {
  const [matchCards, setMatchCards] = useState<MatchCard[]>([])
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [totalPairs, setTotalPairs] = useState(6)
  const [timer, setTimer] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startGame = useCallback((pairs = 6) => {
    const srsCards = useLearningStore.getState().srsCards
    const unlearned = vocabulary.filter(w => {
      const card = srsCards[w.id]
      return !card || card.reviewCount < 3
    })
    const pool = shuffleArray(unlearned).slice(0, pairs)
    const cards: MatchCard[] = []
    pool.forEach((w, i) => {
      cards.push({
        id: `zh-${i}`,
        text: w.zh,
        pairId: i,
        type: 'zh',
        matched: false,
        selected: false,
        wrong: false,
      })
      cards.push({
        id: `ar-${i}`,
        text: w.meaning.split('/')[0].trim(),
        pairId: i,
        type: 'meaning',
        matched: false,
        selected: false,
        wrong: false,
      })
    })
    setMatchCards(shuffleArray(cards))
    setSelectedCard(null)
    setMatchedPairs(0)
    setTotalPairs(pairs)
    setTimer(0)
    setGameStarted(true)
    setGameFinished(false)
    setWrongAttempts(0)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => startGame(), 0)
    return () => clearTimeout(t)
  }, [startGame])

  useEffect(() => {
    if (gameStarted && !gameFinished) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gameStarted, gameFinished])

  const handleCardClick = (cardId: string) => {
    if (gameFinished) return
    const card = matchCards.find(c => c.id === cardId)
    if (!card || card.matched || card.selected) return

    if (selectedCard === null) {
      setSelectedCard(cardId)
      setMatchCards(prev => prev.map(c => c.id === cardId ? { ...c, selected: true } : c))
    } else {
      const firstCard = matchCards.find(c => c.id === selectedCard)
      if (!firstCard) return

      // Check match
      if (firstCard.pairId === card.pairId && firstCard.type !== card.type) {
        // Correct match!
        const newMatched = matchedPairs + 1
        setMatchedPairs(newMatched)
        setMatchCards(prev => prev.map(c =>
          c.pairId === card.pairId ? { ...c, matched: true, selected: false } : c
        ))
        setSelectedCard(null)

        if (newMatched >= totalPairs) {
          setGameFinished(true)
          if (bestTime === null || timer < bestTime) {
            setBestTime(timer)
          }
        }
      } else {
        // Wrong match
        setWrongAttempts(w => w + 1)
        setMatchCards(prev => prev.map(c =>
          c.id === cardId || c.id === selectedCard
            ? { ...c, wrong: true }
            : c
        ))
        setTimeout(() => {
          setMatchCards(prev => prev.map(c =>
            c.id === cardId || c.id === selectedCard
              ? { ...c, wrong: false, selected: false }
              : c
          ))
          setSelectedCard(null)
        }, 600)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Start screen
  if (!gameStarted) return null

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(timer)}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Target className="w-3 h-3" />
            {matchedPairs}/{totalPairs}
          </Badge>
          {wrongAttempts > 0 && (
            <Badge variant="outline" className="gap-1 text-amber-600">
              <X className="w-3 h-3" />
              {wrongAttempts}
            </Badge>
          )}
          {bestTime !== null && (
            <Badge variant="outline" className="gap-1 text-green-600">
              <Trophy className="w-3 h-3" />
              أفضل: {formatTime(bestTime)}
            </Badge>
          )}
        </div>
        <div className="flex gap-1.5">
          {[4, 6, 8].map(n => (
            <Button
              key={n}
              variant={totalPairs === n ? 'default' : 'outline'}
              size="sm"
              onClick={() => startGame(n)}
              className="text-xs h-8"
            >
              {n} أزواج
            </Button>
          ))}
        </div>
      </div>

      <Progress value={(matchedPairs / totalPairs) * 100} className="h-2" />

      {/* Game Finished */}
      {gameFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardContent className="p-6 text-center space-y-3">
              <Trophy className="w-12 h-12 mx-auto text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900">🎉 أحسنت!</h3>
              <div className="text-3xl font-bold text-green-600">{formatTime(timer)}</div>
              <p className="text-sm text-gray-500">
                طابقت {totalPairs} أزواج {wrongAttempts === 0 ? 'بدون أخطاء! 🌟' : `بـ ${wrongAttempts} أخطاء`}
              </p>
              <Button onClick={() => startGame(totalPairs)} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                العب مرة أخرى
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        <AnimatePresence>
          {matchCards.map(card => (
            <motion.button
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: card.matched ? 0.3 : 1,
                scale: card.matched ? 0.9 : 1,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleCardClick(card.id)}
              disabled={card.matched}
              className={`relative p-3 rounded-xl border-2 transition-all text-center min-h-[60px] flex items-center justify-center ${
                card.matched
                  ? 'border-green-300 bg-green-50 text-green-300 cursor-default'
                  : card.selected
                    ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-md scale-[1.02]'
                    : card.wrong
                      ? 'border-red-400 bg-red-50 text-red-700 animate-pulse'
                      : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50 text-gray-700 active:scale-95'
              }`}
            >
              <span className={`text-sm font-medium break-all ${card.type === 'zh' ? 'font-chinese-serif text-base' : ''}`}>
                {card.text}
              </span>
              {card.matched && (
                <Check className="absolute top-1 left-1 w-3 h-3 text-green-400" />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 5. TEST MODE (Comprehensive Quizlet Test)
// ═══════════════════════════════════════════════════════════
type TestQuestionType = 'mcq' | 'truefalse' | 'written' | 'matching'

interface TestQuestion {
  type: TestQuestionType
  word: VocabWord;
  question: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer: string;
}

function TestMode() {
  const store = useLearningStore()
  const [configuring, setConfiguring] = useState(true)
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [writingAnswers, setWritingAnswers] = useState<Record<number, string>>({})
  const [mcqCount] = useState(10)
  const [tfCount] = useState(5)
  const [writtenCount] = useState(3)

  const generateTest = useCallback(() => {
    const unlearned = vocabulary.filter(w => {
      const card = store.srsCards[w.id]
      return !card || card.reviewCount < 3
    })
    const pool = shuffleArray(unlearned)
    let usedIds = new Set<number>()
    const qs: TestQuestion[] = []

    // MCQ
    const mcqPool = pool.filter(w => !usedIds.has(w.id)).slice(0, mcqCount)
    mcqPool.forEach(w => {
      usedIds.add(w.id)
      const wrongOpts = vocabulary.filter(v => v.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.meaning)
      const opts = shuffleArray([...wrongOpts, w.meaning])
      qs.push({
        type: 'mcq',
        word: w,
        question: w.zh,
        options: opts,
        correctIndex: opts.indexOf(w.meaning),
        correctAnswer: w.meaning,
      })
    })

    // True/False
    const tfPool = pool.filter(w => !usedIds.has(w.id)).slice(0, tfCount)
    tfPool.forEach(w => {
      usedIds.add(w.id)
      const isTrue = Math.random() > 0.5
      let shownMeaning: string
      if (isTrue) {
        shownMeaning = w.meaning
      } else {
        const wrongWord = vocabulary.filter(v => v.id !== w.id).sort(() => Math.random() - 0.5)[0]
        shownMeaning = wrongWord ? wrongWord.meaning : w.meaning
      }
      qs.push({
        type: 'truefalse',
        word: w,
        question: `${w.zh} = ${shownMeaning}`,
        correctAnswer: isTrue ? 'صحيح' : 'خطأ',
      })
    })

    // Written
    const writtenPool = pool.filter(w => !usedIds.has(w.id)).slice(0, writtenCount)
    writtenPool.forEach(w => {
      usedIds.add(w.id)
      qs.push({
        type: 'written',
        word: w,
        question: w.meaning,
        correctAnswer: w.zh,
      })
    })

    setTestQuestions(shuffleArray(qs))
    setAnswers({})
    setWritingAnswers({})
    setShowResults(false)
    setConfiguring(false)
  }, [mcqCount, tfCount, writtenCount, store.srsCards])

  const handleSubmitTest = () => {
    // Merge writing answers into answers
    const allAnswers = { ...answers, ...writingAnswers }
    setAnswers(allAnswers)
    setShowResults(true)

    // Rate words based on answers
    testQuestions.forEach((q, i) => {
      const userAnswer = allAnswers[i]
      const isCorrect = userAnswer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
        userAnswer?.trim() === q.correctAnswer.trim()
      store.rateWord(q.word.id, isCorrect ? 4 : 1)
    })
  }

  // Config Screen
  if (configuring) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-rose-50">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <ClipboardCheck className="w-14 h-14 mx-auto text-rose-500" />
              <h3 className="text-xl font-bold text-gray-900">اختبار شامل</h3>
              <p className="text-sm text-gray-500">اختبر معرفتك بأسئلة متنوعة</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-sky-500" />
                  <span>اختيار من متعدد</span>
                </div>
                <Badge variant="secondary">{mcqCount} سؤال</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>صح أو خطأ</span>
                </div>
                <Badge variant="secondary">{tfCount} سؤال</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2 text-sm">
                  <PenLine className="w-4 h-4 text-amber-500" />
                  <span>كتابة</span>
                </div>
                <Badge variant="secondary">{writtenCount} سؤال</Badge>
              </div>
            </div>

            <div className="text-center text-sm text-gray-400">
              المجموع: {mcqCount + tfCount + writtenCount} سؤال
            </div>

            <Button onClick={generateTest} className="w-full h-12 gap-2 text-base">
              <Sparkles className="w-5 h-5" />
              ابدأ الاختبار
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    const correctCount = testQuestions.reduce((count, q, i) => {
      const userAnswer = answers[i]
      if (q.type === 'mcq') {
        return userAnswer === String(q.correctIndex) ? count + 1 : count
      }
      if (q.type === 'truefalse') {
        return userAnswer === q.correctAnswer ? count + 1 : count
      }
      if (q.type === 'written') {
        return userAnswer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
          userAnswer?.trim() === q.correctAnswer.trim() ? count + 1 : count
      }
      return count
    }, 0)
    const percentage = Math.round((correctCount / testQuestions.length) * 100)

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Score Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-sky-50">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-6">
              <div>
                <div className="text-4xl font-bold text-gray-900">{correctCount}/{testQuestions.length}</div>
                <div className="text-sm text-gray-500">إجابات صحيحة</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className={`text-4xl font-bold ${percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                  {percentage}%
                </div>
                <div className="text-sm text-gray-500">الدرجة</div>
              </div>
            </div>
            <Progress value={percentage} className="h-3" />

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setConfiguring(true)} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                اختبار جديد
              </Button>
              <Button onClick={() => setShowResults(false)} variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                راجع الإجابات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answer Review */}
        <div className="space-y-2">
          {testQuestions.map((q, i) => {
            const userAnswer = answers[i]
            let isCorrect = false
            if (q.type === 'mcq') isCorrect = userAnswer === String(q.correctIndex)
            else if (q.type === 'truefalse') isCorrect = userAnswer === q.correctAnswer
            else isCorrect = userAnswer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() || userAnswer?.trim() === q.correctAnswer.trim()

            return (
              <Card key={i} className={`border-0 shadow-sm ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-chinese-serif text-base">{q.word.zh}</span>
                      <span className="text-gray-500 mx-2">—</span>
                      <span>{q.question}</span>
                    </div>
                    {!isCorrect && (
                      <div className="text-xs mt-1 text-green-700">
                        الإجابة الصحيحة: <span className="font-bold font-chinese-serif">{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Test Questions
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{testQuestions.length} سؤال</Badge>
        <Button onClick={handleSubmitTest} className="gap-2">
          <ClipboardCheck className="w-4 h-4" />
          تسليم الاختبار
        </Button>
      </div>

      <Progress value={(Object.keys(answers).length / testQuestions.length) * 100} className="h-2" />

      <div className="space-y-4">
        {testQuestions.map((q, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0 text-xs">{i + 1}</Badge>
                <div className="flex-1">
                  {q.type === 'mcq' && (
                    <div className="space-y-2">
                      <div
                        className="font-chinese-serif text-2xl cursor-pointer hover:text-sky-500 transition-colors"
                        onClick={() => speak(q.word.zh)}
                      >
                        {q.question}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => setAnswers(prev => ({ ...prev, [i]: String(oi) }))}
                            className={`text-right px-3 py-2.5 rounded-xl border-2 text-sm transition-all min-h-[44px] ${
                              answers[i] === String(oi)
                                ? 'border-sky-400 bg-sky-50 text-sky-700'
                                : 'border-gray-200 hover:border-sky-300 hover:bg-sky-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {q.type === 'truefalse' && (
                    <div className="space-y-2">
                      <div className="text-lg font-chinese-serif">{q.word.zh} <span className="text-gray-500 mx-2">=</span> {q.question.split(' = ')[1]}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAnswers(prev => ({ ...prev, [i]: 'صحيح' }))}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-sm transition-all min-h-[44px] ${
                            answers[i] === 'صحيح'
                              ? 'border-green-400 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          ✓ صحيح
                        </button>
                        <button
                          onClick={() => setAnswers(prev => ({ ...prev, [i]: 'خطأ' }))}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-sm transition-all min-h-[44px] ${
                            answers[i] === 'خطأ'
                              ? 'border-red-400 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          ✗ خطأ
                        </button>
                      </div>
                    </div>
                  )}

                  {q.type === 'written' && (
                    <div className="space-y-2">
                      <div className="text-lg font-medium">{q.question}</div>
                      <p className="text-xs text-gray-400">اكتب الحرف الصيني:</p>
                      <Input
                        value={writingAnswers[i] || ''}
                        onChange={(e) => {
                          setWritingAnswers(prev => ({ ...prev, [i]: e.target.value }))
                          setAnswers(prev => ({ ...prev, [i]: e.target.value }))
                        }}
                        placeholder="اكتب هنا..."
                        className="font-chinese-serif text-lg"
                        dir="ltr"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button (bottom) */}
      <div className="sticky bottom-20 lg:bottom-4 z-10">
        <Button onClick={handleSubmitTest} className="w-full h-12 gap-2 text-base shadow-lg">
          <ClipboardCheck className="w-5 h-5" />
          تسليم الاختبار
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 6. PRONUNCIATION MODE (Speech Recognition with ALL words)
// ═══════════════════════════════════════════════════════════

// ─── Levenshtein Distance ───────────────────────────────────
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function calculateSimilarity(spoken: string, expected: string): number {
  if (!spoken || !expected) return 0
  const cleanSpoken = spoken.trim().toLowerCase()
  const cleanExpected = expected.trim().toLowerCase()
  if (cleanSpoken === cleanExpected) return 100
  const distance = levenshteinDistance(cleanSpoken, cleanExpected)
  const maxLen = Math.max(cleanSpoken.length, cleanExpected.length)
  if (maxLen === 0) return 100
  return Math.round(((maxLen - distance) / maxLen) * 100)
}

function scorePronunciation(spoken: string, expected: string, confidence: number) {
  const similarity = calculateSimilarity(spoken, expected)
  const weightedScore = Math.round(similarity * 0.6 + confidence * 100 * 0.4)
  if (weightedScore >= 85) return { score: weightedScore, color: '#22c55e', feedbackAr: 'ممتاز! نطقك رائع! 🎉' }
  if (weightedScore >= 65) return { score: weightedScore, color: '#f97316', feedbackAr: 'جيد! لكن استمر في التدريب 💪' }
  if (weightedScore >= 40) return { score: weightedScore, color: '#eab308', feedbackAr: 'يحتاج مزيد من التمرين 📝' }
  return { score: weightedScore, color: '#ef4444', feedbackAr: 'حاول مرة أخرى، استمع جيداً 🎧' }
}

function PronunciationMode() {
  const store = useLearningStore()
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [result, setResult] = useState<{
    spoken: string
    confidence: number
    score: number
    color: string
    feedbackAr: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Record<number, { scores: number[]; best: number }>>({})
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  // Filtered words from the FULL vocabulary
  const filteredWords = useMemo(() => {
    if (difficultyFilter === 'all') return shuffleArray(vocabulary)
    return shuffleArray(vocabulary.filter(w => w.difficulty === difficultyFilter))
  }, [difficultyFilter])

  const currentWord = filteredWords[currentIndex]

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SR)
    }
  }, [])

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('المتصفح لا يدعم التعرف على الصوت. يرجى استخدام Chrome أو Edge.')
      setIsSupported(false)
      return
    }
    setError(null)
    setResult(null)
    setIsRecording(true)

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 5
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const results = event.results
      let bestScore = 0
      let bestSpoken = ''
      let bestConfidence = 0
      const resultCount = results[0].length
      for (let i = 0; i < resultCount; i++) {
        const alt = results[0][i]
        const similarity = calculateSimilarity(alt.transcript, currentWord.zh)
        if (similarity > bestScore) {
          bestScore = similarity
          bestSpoken = alt.transcript
          bestConfidence = alt.confidence
        }
      }
      const pronResult = scorePronunciation(bestSpoken, currentWord.zh, bestConfidence)
      setResult({
        spoken: bestSpoken,
        confidence: bestConfidence,
        score: pronResult.score,
        color: pronResult.color,
        feedbackAr: pronResult.feedbackAr,
      })
      setAttempts(prev => ({
        ...prev,
        [currentIndex]: {
          scores: [...(prev[currentIndex]?.scores || []), pronResult.score],
          best: Math.max(prev[currentIndex]?.best || 0, pronResult.score),
        },
      }))
      setIsRecording(false)
    }

    recognition.onerror = (event: any) => {
      setIsRecording(false)
      switch (event.error) {
        case 'no-speech': setError('لم يتم الكشف عن أي صوت. حاول مرة أخرى.'); break
        case 'audio-capture': setError('لا يمكن الوصول إلى الميكروفون.'); break
        case 'not-allowed': setError('تم رفض إذن الميكروفون.'); break
        default: setError(`حدث خطأ: ${event.error}`); break
      }
    }
    recognition.onend = () => setIsRecording(false)
    recognitionRef.current = recognition
    recognition.start()
  }, [currentWord, currentIndex])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsRecording(false)
  }, [])

  const goNext = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(i => i + 1)
      setResult(null)
      setError(null)
    }
  }
  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
      setResult(null)
      setError(null)
    }
  }
  const goRandom = () => {
    const idx = Math.floor(Math.random() * filteredWords.length)
    setCurrentIndex(idx)
    setResult(null)
    setError(null)
  }

  const overallStats = useMemo(() => {
    const allScores = Object.values(attempts).flatMap(a => a.scores)
    const avg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0
    return { avg, total: allScores.length, excellent: allScores.filter(s => s >= 85).length }
  }, [attempts])

  if (!currentWord) return null

  const wordAttempts = attempts[currentIndex]
  const difficultyLabel = { all: 'الكل', easy: 'سهل', medium: 'متوسط', hard: 'صعب' }[difficultyFilter]

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setDifficultyFilter(f); setCurrentIndex(0); setResult(null); setError(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              difficultyFilter === f
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {{ all: 'جميع الكلمات', easy: 'سهل', medium: 'متوسط', hard: 'صعب' }[f]}
            <span className="mr-1.5 text-xs opacity-80">
              ({f === 'all' ? vocabulary.length : vocabulary.filter(w => w.difficulty === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-sky-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-sky-700">{overallStats.total}</div>
          <div className="text-xs text-gray-500">محاولات</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-green-700">{overallStats.excellent}</div>
          <div className="text-xs text-gray-500">ممتاز</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-purple-700">{overallStats.avg}%</div>
          <div className="text-xs text-gray-500">المتوسط</div>
        </div>
      </div>

      {/* Word card */}
      <Card className="border-2 border-emerald-100 overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{currentIndex + 1} / {filteredWords.length}</span>
            <span>{difficultyLabel}</span>
          </div>
          <Progress value={((currentIndex + 1) / filteredWords.length) * 100} className="h-1.5" />

          {/* Word display */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">{currentWord.pos}</Badge>
              <Badge variant="outline" className="text-xs">
                {currentWord.difficulty === 'easy' ? 'سهل' : currentWord.difficulty === 'medium' ? 'متوسط' : 'صعب'}
              </Badge>
            </div>

            <div
              className="font-chinese-serif text-6xl sm:text-7xl text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors active:scale-95"
              onClick={() => speak(currentWord.zh)}
            >
              {currentWord.zh}
            </div>
            <div className="text-lg text-gray-500 font-chinese-sans">{currentWord.pinyin}</div>
            <div className="text-xl font-bold text-gray-800">{currentWord.meaning}</div>
            {currentWord.english && (
              <div className="text-sm text-gray-400">({currentWord.english})</div>
            )}

            {/* Listen button */}
            <Button
              variant="outline"
              onClick={() => speak(currentWord.zh)}
              className="mx-auto gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Volume2 className="w-4 h-4" />
              استمع للنطق الصحيح
            </Button>
          </motion.div>

          {/* Mic button */}
          {!isSupported ? (
            <div className="bg-red-50 rounded-xl p-4 text-center text-sm text-red-600">
              المتصفح لا يدعم التعرف على الصوت. يرجى استخدام Chrome أو Edge.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-emerald-500 shadow-xl shadow-emerald-200'
                    : 'bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100'
                }`}
              >
                {isRecording && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-emerald-400"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <motion.div key="rec" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              <p className="text-sm text-gray-500">
                {isRecording ? 'جاري التسجيل... اضغط للإيقاف' : 'سجّل نطقك'}
              </p>
            </div>
          )}

          {/* Waveform */}
          {isRecording && (
            <div className="flex items-center justify-center gap-[3px] h-8">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full"
                  animate={{ height: [4, Math.random() * 28 + 4, 4] }}
                  transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.04 }}
                />
              ))}
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 text-red-700 text-sm p-3 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Score circle */}
                <div className="flex justify-center">
                  <div
                    className="w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center"
                    style={{ borderColor: result.color }}
                  >
                    <span className="text-2xl font-bold" style={{ color: result.color }}>{result.score}</span>
                    <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                </div>

                {/* Feedback */}
                <div
                  className="text-center p-3 rounded-xl text-base font-medium"
                  style={{ backgroundColor: result.color + '15', color: result.color }}
                >
                  {result.feedbackAr}
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ما قلته:</span>
                    <span className="font-chinese-sans">{result.spoken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الصحيح:</span>
                    <span className="font-chinese-sans font-bold text-emerald-700">{currentWord.zh}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ثقة المحرك:</span>
                    <span>{Math.round(result.confidence * 100)}%</span>
                  </div>
                  {wordAttempts && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">أفضل نتيجة:</span>
                      <span style={{ color: wordAttempts.best >= 85 ? '#22c55e' : wordAttempts.best >= 60 ? '#f97316' : '#ef4444' }}>
                        {wordAttempts.best}/100
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setResult(null); setError(null) }}
                    className="flex-1 gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    حاول مرة أخرى
                  </Button>
                  <Button
                    onClick={goNext}
                    className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600"
                  >
                    التالية
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentIndex <= 0} className="gap-1">
          <ChevronRight className="w-4 h-4" />
          السابقة
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{currentIndex + 1} / {filteredWords.length}</span>
          <Button variant="ghost" size="sm" onClick={goRandom} className="gap-1">
            <Shuffle className="w-3.5 h-3.5" />
            عشوائي
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={goNext} disabled={currentIndex >= filteredWords.length - 1} className="gap-1">
          التالية
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
