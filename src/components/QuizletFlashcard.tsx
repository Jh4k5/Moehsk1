'use client'

import React, { useState, useCallback, useRef, useMemo } from 'react'
import type { VocabWord } from '@/data/vocabulary'
import { useLearningStore } from '@/lib/store'
import { speak } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChevronLeft, ChevronRight, RotateCcw, Volume2, Mic, MicOff,
  Check, X, Bookmark, BookmarkCheck, Star, Trophy, RotateCcwIcon,
  Lightbulb, Loader2, ArrowLeft, ArrowRight, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────
interface QuizletFlashcardProps {
  vocabulary: VocabWord[]
}

type Mode = 'flashcard' | 'sort' | 'pronunciation'

interface SortWord {
  word: VocabWord
  known: boolean | null
  round: number
}

interface PronResult {
  spoken: string
  confidence: number
  score: number
  color: string
  feedbackAr: string
}

// ─── Helper: Levenshtein distance ─────────────────────────────
function levenshtein(a: string, b: string): number {
  const m: number[][] = []
  for (let i = 0; i <= b.length; i++) m[i] = [i]
  for (let j = 0; j <= a.length; j++) m[0][j] = j
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      m[i][j] = b[i - 1] === a[j - 1]
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1)
  return m[b.length][a.length]
}

function calcSimilarity(spoken: string, expected: string): number {
  if (!spoken || !expected) return 0
  const s = spoken.trim().toLowerCase()
  const e = expected.trim().toLowerCase()
  if (s === e) return 100
  const d = levenshtein(s, e)
  const mx = Math.max(s.length, e.length)
  return mx === 0 ? 100 : Math.round(((mx - d) / mx) * 100)
}

function pronScore(spoken: string, expected: string, confidence: number): PronResult {
  const sim = calcSimilarity(spoken, expected)
  const ws = Math.round(sim * 0.6 + confidence * 100 * 0.4)
  if (ws >= 85) return { score: ws, color: '#22c55e', spoken, confidence, feedbackAr: 'ممتاز! 🎉' }
  if (ws >= 65) return { score: ws, color: '#f97316', spoken, confidence, feedbackAr: 'جيد! 💪' }
  if (ws >= 40) return { score: ws, color: '#eab308', spoken, confidence, feedbackAr: 'يحتاج تحسين 📝' }
  return { score: ws, color: '#ef4444', spoken, confidence, feedbackAr: 'حاول مرة أخرى 🎧' }
}

// ─── Helper: build sentences from word ────────────────────────
function getSentences(w: VocabWord) {
  const s = [{ zh: w.exZh, pinyin: w.exPinyin, ar: w.exEn }]
  if (w.s2) s.push({ zh: w.s2.zh, pinyin: w.s2.py, ar: w.s2.ar })
  if (w.s3) s.push({ zh: w.s3.zh, pinyin: w.s3.py, ar: w.s3.ar })
  return s.filter(x => x.zh)
}

// ─── Main Component ───────────────────────────────────────────
export default function QuizletFlashcard({ vocabulary }: QuizletFlashcardProps) {
  const [mode, setMode] = useState<Mode>('flashcard')
  const store = useLearningStore()

  return (
    <div dir="rtl" className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-700 flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7" />
          بطاقات كويزلت
        </h2>
        <p className="text-gray-500 text-sm">تعلّم المفردات بثلاث طرق فعّالة</p>
      </div>

      {/* Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} dir="rtl">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-gray-100 rounded-xl">
          <TabsTrigger value="flashcard" className="text-xs sm:text-sm py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm">
            البطاقات
          </TabsTrigger>
          <TabsTrigger value="sort" className="text-xs sm:text-sm py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm">
            ترتيب كويزلت
          </TabsTrigger>
          <TabsTrigger value="pronunciation" className="text-xs sm:text-sm py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm">
            نطق
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Mode Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {mode === 'flashcard' && <FlashcardMode words={vocabulary} />}
          {mode === 'sort' && <SortMode words={vocabulary} />}
          {mode === 'pronunciation' && <PronunciationMode words={vocabulary} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MODE 1: Flashcard
// ═══════════════════════════════════════════════════════════════
function FlashcardMode({ words }: { words: VocabWord[] }) {
  const store = useLearningStore()
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [retryPile, setRetryPile] = useState<number[]>([])
  const word = words[idx]

  const goNext = useCallback(() => {
    if (idx < words.length - 1) { setIdx(i => i + 1); setFlipped(false) }
  }, [idx, words.length])
  const goPrev = useCallback(() => {
    if (idx > 0) { setIdx(i => i - 1); setFlipped(false) }
  }, [idx])

  const handleKnow = useCallback(() => {
    if (!word) return
    store.rateWord(word.id, 4)
    store.incrementStreak()
    goNext()
  }, [word, store, goNext])

  const handleDontKnow = useCallback(() => {
    if (!word) return
    store.rateWord(word.id, 1)
    setRetryPile(p => p.includes(word.id) ? p : [...p, word.id])
    goNext()
  }, [word, store, goNext])

  if (!word) return <p className="text-center text-gray-400 py-12">لا توجد بطاقات</p>
  const sentences = getSentences(word)
  const progress = Math.round(((idx + 1) / words.length) * 100)

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>التقدم</span>
          <span>{idx + 1} / {words.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card */}
      <div className="perspective-1000 w-full cursor-pointer" onClick={() => setFlipped(f => !f)}>
        <div
          className="relative w-full min-h-[280px] sm:min-h-[320px] transition-transform duration-500 preserve-3d"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white via-red-50/40 to-white rounded-2xl shadow-md border border-red-100 flex flex-col items-center justify-center p-6 gap-3">
            <div className="absolute top-3 right-3 flex gap-1">
              <Badge variant="outline" className="text-xs font-chinese-sans bg-white/80">{word.pos}</Badge>
              {store.isLearned(word.id) && (
                <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">✓ محفوظ</Badge>
              )}
            </div>
            <div className="font-chinese-serif text-6xl sm:text-7xl text-gray-900 drop-shadow-sm"
              onClick={(e) => { e.stopPropagation(); speak(word.zh) }}>
              {word.zh}
            </div>
            <div className="font-chinese-sans text-xl text-gray-500">{word.pinyin}</div>
            <p className="text-xs text-gray-400 mt-2">اضغط لقلب البطاقة • اضغط الحرف للاستماع</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white via-amber-50/40 to-white rounded-2xl shadow-md border border-amber-100 flex flex-col items-center justify-center p-5 overflow-y-auto custom-scrollbar"
            style={{ transform: 'rotateY(180deg)' }}>
            <div className="text-center mb-2">
              <div className="font-chinese-serif text-4xl font-bold text-gray-900">{word.zh}</div>
              <div className="font-chinese-sans text-sm text-gray-500">{word.pinyin}</div>
              <div className="text-lg font-bold text-red-600 mt-1">{word.meaning}</div>
            </div>
            {word.mnemonic && (
              <div className="bg-blue-50 rounded-lg px-3 py-1.5 mb-2 text-center">
                <span className="text-xs text-blue-600">💡 {word.mnemonic}</span>
              </div>
            )}
            <div className="w-full space-y-1.5 mt-1">
              <div className="text-xs font-medium text-gray-500 text-center">📝 أمثلة:</div>
              {sentences.slice(0, 2).map((s, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); speak(s.zh) }}
                  className="w-full text-right bg-white/70 hover:bg-white rounded-lg px-3 py-1.5 transition-colors">
                  <div className="font-chinese-sans text-sm text-gray-800">{s.zh}</div>
                  <div className="font-chinese-sans text-xs text-gray-400">{s.pinyin}</div>
                  <div className="text-xs text-gray-500">{s.ar}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Know / Don't Know */}
      <div className="flex gap-3 max-w-md mx-auto">
        <Button onClick={handleDontKnow} variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 py-5 text-sm">
          <X className="w-4 h-4 ml-1" />
          لا أعرفها
        </Button>
        <Button onClick={handleKnow}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-5 text-sm">
          <Check className="w-4 h-4 ml-1" />
          أعرفها
        </Button>
      </div>

      {/* Nav & Actions */}
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={idx === 0}>
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => speak(word.zh)}>
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button size="sm"
            variant={store.isLearned(word.id) ? 'default' : 'outline'}
            onClick={() => store.toggleLearned(word.id)}
            className={store.isLearned(word.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
            <Star className="w-4 h-4 ml-1" />
            حفظ
          </Button>
          <Button size="sm"
            variant={store.isBookmarked(word.id) ? 'default' : 'ghost'}
            onClick={() => store.toggleBookmark(word.id)}
            className={store.isBookmarked(word.id) ? 'bg-amber-500 hover:bg-amber-600' : 'text-gray-400 hover:text-amber-500'}>
            {store.isBookmarked(word.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={goNext} disabled={idx >= words.length - 1}>
          التالي
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Retry pile indicator */}
      {retryPile.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-3 flex items-center gap-2">
            <RotateCcwIcon className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{retryPile.length} كلمة تحتاج مراجعة</span>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MODE 2: Sort (كويزلت ترتيب)
// ═══════════════════════════════════════════════════════════════
function SortMode({ words }: { words: VocabWord[] }) {
  const store = useLearningStore()
  const [round, setRound] = useState(1)
  const [sortWords, setSortWords] = useState<SortWord[]>(() =>
    shuffle([...words]).map(w => ({ word: w, known: null, round: 0 }))
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)

  // Stats
  const knownThisRound = useMemo(() =>
    sortWords.filter(w => w.round === round && w.known === true).length, [sortWords, round])
  const unknownThisRound = useMemo(() =>
    sortWords.filter(w => w.round === round && w.known === false).length, [sortWords, round])
  const totalInRound = useMemo(() =>
    sortWords.filter(w => w.round === round).length, [sortWords, round])
  const allKnown = useMemo(() =>
    sortWords.every(w => w.known === true), [sortWords])

  const current = sortWords[currentIdx]

  const markKnown = useCallback(() => {
    if (!current) return
    store.rateWord(current.word.id, 5)
    store.incrementStreak()
    setSortWords(prev => prev.map((w, i) => i === currentIdx ? { ...w, known: true, round } : w))
    if (currentIdx < sortWords.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      setDone(true)
    }
  }, [current, currentIdx, sortWords.length, round, store])

  const markUnknown = useCallback(() => {
    if (!current) return
    store.rateWord(current.word.id, 1)
    setSortWords(prev => prev.map((w, i) => i === currentIdx ? { ...w, known: false, round } : w))
    if (currentIdx < sortWords.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      setDone(true)
    }
  }, [current, currentIdx, sortWords.length, round, store])

  const startNextRound = useCallback(() => {
    const unknownWords = sortWords.filter(w => w.known === false)
    if (unknownWords.length === 0) return
    const newRound = round + 1
    const newWords = unknownWords.map(w => ({ ...w, known: null, round: newRound }))
    setSortWords(prev => [...prev.filter(w => w.known === true), ...newWords])
    setCurrentIdx(sortWords.filter(w => w.known === true).length)
    setRound(newRound)
    setDone(false)
  }, [sortWords, round])

  const resetSort = useCallback(() => {
    setSortWords(shuffle([...words]).map(w => ({ word: w, known: null, round: 0 })))
    setCurrentIdx(0)
    setRound(1)
    setDone(false)
  }, [words])

  // ─── Summary screen ────────────────────────────────────
  if (done) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-6 space-y-4 text-center">
          {allKnown ? (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <Trophy className="w-16 h-16 mx-auto text-amber-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900">🎉 أحسنت! أنهيت جميع الكلمات!</h3>
              <p className="text-gray-500">أكملت {round} {round === 1 ? 'جولة' : 'جولات'}</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900">📝 ملخص الجولة {round}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-emerald-700">{knownThisRound}</div>
                  <div className="text-xs text-emerald-600">صحيحة ✓</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-red-700">{unknownThisRound}</div>
                  <div className="text-xs text-red-600">تحتاج مراجعة ✗</div>
                </div>
              </div>
            </>
          )}

          {/* Word lists */}
          <div className="max-h-48 overflow-y-auto space-y-1 text-right">
            {sortWords.map((sw, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${sw.known ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
                <span className="font-chinese-serif text-lg">{sw.word.zh}</span>
                <span className="font-chinese-sans text-xs text-gray-500 flex-1">{sw.word.pinyin}</span>
                <span className="text-xs text-gray-600">{sw.word.meaning}</span>
                {sw.known ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-red-600" />}
              </div>
            ))}
          </div>

          {/* Round indicator */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">الجولة {round}</Badge>
            <Badge variant="secondary">{totalInRound} كلمة</Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            {!allKnown && (
              <Button onClick={startNextRound} className="bg-red-600 hover:bg-red-700">
                <RotateCcw className="w-4 h-4 ml-1" />
                راجع الكلمات الصعبة ({sortWords.filter(w => w.known === false).length})
              </Button>
            )}
            <Button variant="outline" onClick={resetSort}>
              إعادة من البداية
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ─── Active card ───────────────────────────────────────
  if (!current) return null
  const roundProgress = Math.round((knownThisRound + unknownThisRound) / totalInRound * 100)

  return (
    <div className="space-y-4">
      {/* Round & Progress */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <Badge variant="outline">الجولة {round}</Badge>
        <span>{knownThisRound + unknownThisRound} / {totalInRound}</span>
      </div>
      <Progress value={roundProgress} className="h-1.5" />

      {/* Word Card */}
      <motion.div
        key={current.word.id}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="border-2 border-gray-100 hover:border-red-200 transition-colors">
          <CardContent className="p-6 sm:p-8 text-center space-y-3">
            <div className="font-chinese-serif text-5xl sm:text-6xl text-gray-900"
              onClick={() => speak(current.word.zh)}>
              {current.word.zh}
            </div>
            <div className="font-chinese-sans text-lg text-gray-500">{current.word.pinyin}</div>
            <Button variant="ghost" size="sm" onClick={() => speak(current.word.zh)} className="mx-auto">
              <Volume2 className="w-4 h-4 ml-1" />
              استمع
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Know / Don't Know */}
      <div className="flex gap-3 max-w-md mx-auto">
        <Button onClick={markUnknown} variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 py-5 text-sm font-medium">
          <X className="w-5 h-5 ml-1" />
          لا أعرفها
        </Button>
        <Button onClick={markKnown}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-5 text-sm font-medium">
          <Check className="w-5 h-5 ml-1" />
          أعرف هذه
        </Button>
      </div>

      {/* Stats pills */}
      <div className="flex justify-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-emerald-600">
          <Check className="w-3 h-3" /> {knownThisRound} صحيحة
        </span>
        <span className="flex items-center gap-1 text-red-600">
          <X className="w-3 h-3" /> {unknownThisRound} خاطئة
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MODE 3: Pronunciation Practice
// ═══════════════════════════════════════════════════════════════
function PronunciationMode({ words }: { words: VocabWord[] }) {
  const store = useLearningStore()
  const [idx, setIdx] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [result, setResult] = useState<PronResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [bestScores, setBestScores] = useState<Record<number, number>>({})
  const recognitionRef = useRef<any>(null)

  const word = words[idx]
  const sentences = useMemo(() => word ? getSentences(word) : [], [word])

  // Check support
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SR)
    }
  }, [])

  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR || !word) {
      setError('المتصفح لا يدعم التعرف على الصوت. استخدم Chrome أو Edge.')
      setIsSupported(false)
      return
    }
    setError(null)
    setResult(null)
    setIsRecording(true)

    const rec = new SR()
    rec.lang = 'zh-CN'
    rec.interimResults = false
    rec.maxAlternatives = 5
    rec.continuous = false

    rec.onresult = (ev: any) => {
      const results = ev.results
      let bestSim = 0, bestSpoken = '', bestConf = 0
      for (let i = 0; i < results[0].length; i++) {
        const alt = results[0][i]
        const sim = calcSimilarity(alt.transcript, word.zh)
        if (sim > bestSim) { bestSim = sim; bestSpoken = alt.transcript; bestConf = alt.confidence }
      }
      const pr = pronScore(bestSpoken, word.zh, bestConf)
      setResult(pr)
      // Save best
      setBestScores(prev => ({
        ...prev,
        [word.id]: Math.max(prev[word.id] || 0, pr.score)
      }))
      setIsRecording(false)
    }

    rec.onerror = (ev: any) => {
      setIsRecording(false)
      const msgs: Record<string, string> = {
        'no-speech': 'لم يتم الكشف عن صوت. حاول مرة أخرى.',
        'audio-capture': 'لا يمكن الوصول إلى الميكروفون.',
        'not-allowed': 'تم رفض إذن الميكروفون.',
        'network': 'خطأ في الشبكة.',
      }
      setError(msgs[ev.error] || `حدث خطأ: ${ev.error}`)
    }

    rec.onend = () => setIsRecording(false)
    recognitionRef.current = rec
    rec.start()
  }, [word])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  if (!word) return <p className="text-center text-gray-400 py-12">لا توجد كلمات</p>

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>التقدم</span>
          <span>{idx + 1} / {words.length}</span>
        </div>
        <Progress value={Math.round(((idx + 1) / words.length) * 100)} className="h-1.5" />
      </div>

      {/* Word Card */}
      <Card className="border-2 border-gray-100">
        <CardContent className="p-6 sm:p-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">{word.pos}</Badge>
            <Badge variant="secondary">{word.difficulty === 'easy' ? 'سهل' : word.difficulty === 'medium' ? 'متوسط' : 'صعب'}</Badge>
          </div>

          <motion.div key={word.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="font-chinese-serif text-5xl sm:text-6xl text-gray-900"
              onClick={() => speak(word.zh)}>
              {word.zh}
            </div>
            <div className="font-chinese-sans text-lg text-gray-500 mt-1">{word.pinyin}</div>
            <div className="text-base text-gray-700 font-medium">{word.meaning}</div>
          </motion.div>

          {/* Listen button */}
          <Button variant="outline" onClick={() => speak(word.zh)} className="mx-auto">
            <Volume2 className="w-4 h-4 ml-1" />
            استمع للنطق الصحيح
          </Button>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isSupported}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording ? 'bg-red-600 shadow-lg shadow-red-200' : 'bg-red-50 border-2 border-red-300 hover:border-red-500 hover:bg-red-100'
              } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isRecording && (
                <motion.div className="absolute inset-0 rounded-full border-4 border-red-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
              )}
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div key="rec" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <MicOff className="w-8 h-8 text-white" />
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Mic className="w-8 h-8 text-red-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <p className="text-xs text-gray-500">{isRecording ? 'جاري التسجيل... اضغط للإيقاف' : 'سجّل نطقك'}</p>
          </div>

          {/* Waveform */}
          {isRecording && (
            <div className="flex items-center justify-center gap-0.5 h-7">
              {[...Array(16)].map((_, i) => (
                <motion.div key={i} className="w-1 bg-red-400 rounded-full"
                  animate={{ height: [3, Math.random() * 22 + 3, 3] }}
                  transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.04 }} />
              ))}
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* Score circle */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center"
                    style={{ borderColor: result.color }}>
                    <span className="text-2xl font-bold" style={{ color: result.color }}>{result.score}</span>
                    <span className="text-[10px] text-gray-400">/ 100</span>
                  </div>
                </div>
                {/* Feedback */}
                <div className="text-base text-center p-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: result.color + '15', color: result.color }}>
                  {result.feedbackAr}
                </div>
                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ما قلته:</span>
                    <span className="font-chinese-sans">{result.spoken || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الصحيح:</span>
                    <span className="font-chinese-sans font-bold text-red-700">{word.zh}</span>
                  </div>
                  {bestScores[word.id] !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">أفضل نتيجة:</span>
                      <span className="font-bold" style={{ color: bestScores[word.id] >= 85 ? '#22c55e' : bestScores[word.id] >= 65 ? '#f97316' : '#ef4444' }}>
                        {bestScores[word.id]}/100
                      </span>
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => { setResult(null); setError(null) }}>
                    <RotateCcw className="w-3.5 h-3.5 ml-1" />
                    حاول مرة أخرى
                  </Button>
                  {idx < words.length - 1 && (
                    <Button size="sm" onClick={() => { setIdx(i => i + 1); setResult(null); setError(null) }}
                      className="bg-red-600 hover:bg-red-700">
                      التالية <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Example sentences */}
      {sentences.length > 0 && !result && (
        <Card className="border-0 shadow-sm bg-gray-50/50">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              أمثلة للتدريب
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {sentences.slice(0, 2).map((s, i) => (
              <button key={i} onClick={() => speak(s.zh)}
                className="w-full text-right bg-white hover:bg-red-50 rounded-lg px-3 py-2 transition-colors">
                <div className="font-chinese-sans text-sm text-gray-800">{s.zh}</div>
                <div className="font-chinese-sans text-xs text-gray-400">{s.pinyin}</div>
                <div className="text-xs text-gray-500">{s.ar}</div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => { setIdx(i => i - 1); setResult(null) }} disabled={idx === 0}>
          <ArrowRight className="w-4 h-4 ml-1" />
          السابق
        </Button>
        <span className="text-xs text-gray-400">{idx + 1} / {words.length}</span>
        <Button variant="ghost" size="sm" onClick={() => { setIdx(i => i + 1); setResult(null) }} disabled={idx >= words.length - 1}>
          التالي
          <ArrowLeft className="w-4 h-4 mr-1" />
        </Button>
      </div>
    </div>
  )
}

// ─── Utility ──────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
