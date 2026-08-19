'use client'
// ─── Vocabulary & review — flashcards, learn, test and match ────────────────
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BookOpen, Brain, Check, ChevronLeft, ChevronRight, Clock, Eye, Filter,
  Gamepad2, Lightbulb, Mic, RotateCcw, Search, Sparkles, Star, Target,
  Trophy, Volume2, X,
} from 'lucide-react'
import { speak } from '@/lib/tts'
import { useActiveLevel } from '@/lib/levels'
import { ts, tsPick } from '@/lib/i18n'
import { useLearningStore } from '@/lib/store'
import { categories } from '@/data/categories'
import { type VocabWord } from '@/data/vocabulary'
import { formatTime, isSelectedCorrect } from '@/features/shared/helpers'

export default function VocabularySection() {
  const store = useLearningStore()
  const { vocabulary } = useActiveLevel()
  const srsCards = store.srsCards

  // The filter used to be lifted into the page shell and threaded back down as
  // seven props. It belongs to this route, so it lives here.
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hideMastered, setHideMastered] = useState(false)

  const isWordMastered = useCallback(
    (wordId: number): boolean => (srsCards[wordId]?.reviewCount ?? 0) >= 3,
    [srsCards],
  )

  const filteredVocab = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return vocabulary.filter((w) => {
      if (hideMastered && isWordMastered(w.id)) return false
      const matchSearch =
        searchQuery === '' ||
        w.zh.includes(searchQuery) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.meaning.includes(searchQuery)
      const matchCat = selectedCategory === 'all' || w.pos === selectedCategory
      return matchSearch && matchCat
    })
  }, [vocabulary, searchQuery, selectedCategory, hideMastered, isWordMastered])
  const [activeMode, setActiveMode] = useState<'cards' | 'learn' | 'test' | 'match'>('cards')
  const [shuffledVocab, setShuffledVocab] = useState<VocabWord[]>([])
  const [sessionSeen, setSessionSeen] = useState<Set<number>>(new Set())
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionIncorrect, setSessionIncorrect] = useState(0)

  // ── Learn mode state ──
  const [learnIndex, setLearnIndex] = useState(0)
  const [learnInput, setLearnInput] = useState('')
  const [learnFeedback, setLearnFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [learnCompleted, setLearnCompleted] = useState(0)

  // ── Test mode state ──
  const [testQuestions, setTestQuestions] = useState<{ word: VocabWord; options: string[]; correctIdx: number }[]>([])
  const [testIndex, setTestIndex] = useState(0)
  const [testAnswer, setTestAnswer] = useState<number | null>(null)
  const [testFinished, setTestFinished] = useState(false)
  const [testScore, setTestScore] = useState(0)

  // ── Match mode state ──
  const [matchPairs, setMatchPairs] = useState<{ id: number; zh: string; ar: string; pinyin: string }[]>([])
  const [matchTiles, setMatchTiles] = useState<{ id: number; text: string; type: 'zh' | 'ar'; matched: boolean }[]>([])
  const [matchSelected, setMatchSelected] = useState<number | null>(null)
  const [matchMoves, setMatchMoves] = useState(0)
  const [matchTimer, setMatchTimer] = useState(0)
  const [matchStarted, setMatchStarted] = useState(false)
  const [matchDone, setMatchDone] = useState(false)

  // ── Swipe state ──
  const swipeStartX = useRef(0)
  const swipeEndX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // ── Pronunciation state ──
  const [isRecording, setIsRecording] = useState(false)
  const [pronResult, setPronResult] = useState<{ score: number; spoken: string; color: string; msg: string } | null>(null)
  const pronRecRef = useRef<any>(null)

  // SRS: Build deck with due cards first, then new cards
  const dueCardIds = store.getDueCardIds()
  const dueCards = filteredVocab.filter(w => dueCardIds.includes(w.id))
  const newCards = filteredVocab.filter(w => !dueCardIds.includes(w.id))
  const srsDeck = [...dueCards, ...newCards]
  const deck = shuffledVocab.length > 0 ? shuffledVocab : srsDeck
  const dueCount = dueCards.length
  const word = deck[store.flashcardIndex] || deck[0]

  // Use word.sentences[] — guaranteed 3 per word
  const wordSentences = useMemo(() => {
    if (!word) return []
    if (word.sentences && word.sentences.length > 0) {
      return word.sentences.slice(0, 3)
    }
    // Fallback: build from exZh + s2 + s3
    const sents: { zh: string; pinyin: string; ar: string }[] = []
    if (word.exZh) sents.push({ zh: word.exZh, pinyin: word.exPinyin, ar: word.exEn })
    if (word.s2) sents.push({ zh: word.s2.zh, pinyin: word.s2.py, ar: word.s2.ar })
    if (word.s3) sents.push({ zh: word.s3.zh, pinyin: word.s3.py, ar: word.s3.ar })
    return sents.filter(s => s.zh)
  }, [word])

  // Shuffle function
  const doShuffle = useCallback(() => {
    const s = [...filteredVocab].sort(() => Math.random() - 0.5)
    setShuffledVocab(s)
    store.setFlashcardIndex(0)
  }, [filteredVocab, store])

  // ── Pronunciation helper ──
  const pronSimilarity = (spoken: string, expected: string): number => {
    if (!spoken || !expected) return 0
    const s = spoken.trim().toLowerCase()
    const e = expected.trim().toLowerCase()
    if (s === e) return 100
    let d = 0
    const sl = s.length, el = e.length
    const matrix: number[][] = Array.from({ length: el + 1 }, (_, i) => [i])
    for (let j = 1; j <= sl; j++) matrix[0][j] = j
    for (let i = 1; i <= el; i++) {
      for (let j = 1; j <= sl; j++) {
        if (e.charAt(i - 1) === s.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
        else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
    d = matrix[el][sl]
    return Math.round(((Math.max(sl, el) - d) / Math.max(sl, el)) * 100)
  }

  const startPronRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    setPronResult(null)
    setIsRecording(true)
    const recognition = new SR()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 5
    recognition.continuous = false
    recognition.onresult = (event: any) => {
      let bestSim = 0
      let bestSpoken = ''
      for (let i = 0; i < event.results[0].length; i++) {
        const alt = event.results[0][i]
        const sim = pronSimilarity(alt.transcript, word?.zh || '')
        if (sim > bestSim) { bestSim = sim; bestSpoken = alt.transcript }
      }
      setPronResult({
        score: bestSim,
        spoken: bestSpoken,
        color: bestSim >= 70 ? 'var(--clr-success)' : 'var(--clr-danger)',
        msg: bestSim >= 70 ? 'نطق ممتاز! 🎉' : 'حاول مرة أخرى 🎧',
      })
      setIsRecording(false)
    }
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)
    pronRecRef.current = recognition
    recognition.start()
  }

  const stopPronRecording = () => {
    if (pronRecRef.current) pronRecRef.current.stop()
    setIsRecording(false)
  }

  // Reset all progress
  const doReset = useCallback(() => {
    setShuffledVocab([])
    store.setFlashcardIndex(0)
    setSessionSeen(new Set())
    setSessionCorrect(0)
    setSessionIncorrect(0)
    setLearnIndex(0)
    setLearnInput('')
    setLearnFeedback(null)
    setLearnCompleted(0)
    setTestQuestions([])
    setTestIndex(0)
    setTestAnswer(null)
    setTestFinished(false)
    setTestScore(0)
    setMatchPairs([])
    setMatchTiles([])
    setMatchSelected(null)
    setMatchMoves(0)
    setMatchTimer(0)
    setMatchStarted(false)
    setMatchDone(false)
  }, [store])

  // Track card seen
  const markSeen = useCallback((wId: number) => {
    setSessionSeen(prev => {
      const n = new Set(prev)
      n.add(wId)
      return n
    })
  }, [])

  // ── Swipe handlers ──
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.changedTouches[0].screenX
  }, [])
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    swipeEndX.current = e.changedTouches[0].screenX
    const diff = swipeStartX.current - swipeEndX.current
    if (Math.abs(diff) > 60) {
      if (diff > 0 && store.flashcardIndex < deck.length - 1) {
        store.setFlashcardIndex(store.flashcardIndex + 1)
      } else if (diff < 0 && store.flashcardIndex > 0) {
        store.setFlashcardIndex(store.flashcardIndex - 1)
      }
    }
  }, [deck.length, store])

  // ── Learn mode ──
  const initLearn = useCallback(() => {
    setLearnIndex(0)
    setLearnInput('')
    setLearnFeedback(null)
    setLearnCompleted(0)
  }, [])

  const checkLearnAnswer = useCallback(() => {
    if (!learnInput.trim()) return
    const w = deck[learnIndex]
    if (!w) return
    const correct = learnInput.trim() === w.meaning.trim() ||
      w.meaning.split('/').some(m => m.trim() === learnInput.trim()) ||
      w.meaning.includes(learnInput.trim())
    setLearnFeedback(correct ? 'correct' : 'incorrect')
    if (correct) {
      store.rateWord(w.id, 4)
      setSessionCorrect(p => p + 1)
      setLearnCompleted(p => p + 1)
    } else {
      store.rateWord(w.id, 1)
      setSessionIncorrect(p => p + 1)
      setLearnCompleted(p => p + 1)
    }
    markSeen(w.id)
    setTimeout(() => {
      if (learnIndex < deck.length - 1) {
        setLearnIndex(p => p + 1)
        setLearnInput('')
        setLearnFeedback(null)
      }
    }, 1200)
  }, [learnInput, deck, learnIndex, markSeen, store])

  // ── Test mode ──
  const initTest = useCallback(() => {
    const count = Math.min(10, deck.length)
    const selected = [...deck].sort(() => Math.random() - 0.5).slice(0, count)
    const qs = selected.map(w => {
      const wrong = deck.filter(d => d.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.meaning)
      const options = [...wrong, w.meaning].sort(() => Math.random() - 0.5)
      return { word: w, options, correctIdx: options.indexOf(w.meaning) }
    })
    setTestQuestions(qs)
    setTestIndex(0)
    setTestAnswer(null)
    setTestFinished(false)
    setTestScore(0)
  }, [deck])

  const handleTestAnswer = useCallback((idx: number) => {
    if (testAnswer !== null) return
    setTestAnswer(idx)
    const q = testQuestions[testIndex]
    const isCorrect = idx === q.correctIdx
    if (isCorrect) {
      store.rateWord(q.word.id, 4)
      setTestScore(p => p + 1)
      setSessionCorrect(p => p + 1)
    } else {
      store.rateWord(q.word.id, 1)
      setSessionIncorrect(p => p + 1)
    }
    markSeen(q.word.id)
    setTimeout(() => {
      if (testIndex < testQuestions.length - 1) {
        setTestIndex(p => p + 1)
        setTestAnswer(null)
      } else {
        setTestFinished(true)
      }
    }, 1000)
  }, [testAnswer, testIndex, testQuestions, markSeen, store])

  // ── Match mode ──
  const initMatch = useCallback(() => {
    const pairCount = Math.min(6, deck.length)
    const selected = [...deck].sort(() => Math.random() - 0.5).slice(0, pairCount)
    const pairs = selected.map(w => ({ id: w.id, zh: w.zh, ar: w.meaning, pinyin: w.pinyin }))
    setMatchPairs(pairs)
    const tiles = selected.flatMap(w => [
      { id: w.id * 2, text: w.zh, type: 'zh' as const, matched: false },
      { id: w.id * 2 + 1, text: w.meaning, type: 'ar' as const, matched: false },
    ]).sort(() => Math.random() - 0.5)
    setMatchTiles(tiles)
    setMatchSelected(null)
    setMatchMoves(0)
    setMatchTimer(0)
    setMatchStarted(false)
    setMatchDone(false)
  }, [deck])

  // Match timer
  useEffect(() => {
    if (!matchStarted || matchDone || matchPairs.length === 0) return
    const t = setTimeout(() => setMatchTimer(p => p + 1), 1000)
    return () => clearTimeout(t)
  }, [matchStarted, matchDone, matchTimer, matchPairs.length])

  const handleMatchTile = useCallback((tileId: number) => {
    if (matchDone) return
    const tile = matchTiles.find(t => t.id === tileId)
    if (!tile || tile.matched) return
    if (!matchStarted) setMatchStarted(true)

    if (matchSelected === null) {
      setMatchSelected(tileId)
      return
    }

    const prevTile = matchTiles.find(t => t.id === matchSelected)
    if (!prevTile) { setMatchSelected(null); return }

    // Same type = ignore
    if (prevTile.type === tile.type) {
      setMatchSelected(tileId)
      return
    }

    // Check match
    const prevWordId = prevTile.type === 'zh' ? matchPairs.find(p => p.zh === prevTile.text) : matchPairs.find(p => p.ar === prevTile.text)
    const currWordId = tile.type === 'zh' ? matchPairs.find(p => p.zh === tile.text) : matchPairs.find(p => p.ar === tile.text)

    setMatchMoves(p => p + 1)

    setMatchTiles(prev => {
      const isMatch = prevWordId && currWordId && prevWordId.id === currWordId.id
      if (isMatch) {
        const updated = prev.map(t =>
          t.id === matchSelected || t.id === tileId ? { ...t, matched: true } : t
        )
        const allMatched = updated.every(t => t.matched)
        if (allMatched) {
          setTimeout(() => setMatchDone(true), 300)
        }
        return updated
      }
      return prev
    })
    setMatchSelected(null)
  }, [matchDone, matchStarted, matchSelected, matchTiles, matchPairs])

  // ── Progress ──
  const progressPercent = deck.length > 0 ? ((store.flashcardIndex + 1) / deck.length) * 100 : 0

  // ── SRS rate handlers ──
  const handleKnowIt = () => {
    if (!word) return
    store.rateWord(word.id, 4)
    store.incrementStreak()
    setPronResult(null)
    if (store.flashcardIndex < deck.length - 1) {
      store.setFlashcardIndex(store.flashcardIndex + 1)
    }
  }
  const handleDontKnow = () => {
    if (!word) return
    store.rateWord(word.id, 1)
    setPronResult(null)
    if (store.flashcardIndex < deck.length - 1) {
      store.setFlashcardIndex(store.flashcardIndex + 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header + Due Counter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {ts('المفردات','Vocabulary')}
          </h2>
          {dueCount > 0 && (
            <Badge className="bg-[var(--clr-warning-bg)] text-[var(--clr-warning)] border-[var(--clr-warning)]/30 hover:bg-[var(--clr-warning)]/10 gap-1 px-3 py-1">
              🎯 {dueCount} بطاقة مستحقة اليوم
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={hideMastered ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setHideMastered(v => !v)}>
            {hideMastered ? ts('✓ إخفاء المحفوظ','✓ Hide mastered') : ts('إخفاء المحفوظ','Hide mastered')}
          </Badge>
          <Badge variant="secondary">{filteredVocab.length} كلمة</Badge>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <Input
            placeholder={ts('ابحث بالصينية أو البنيني أو العربية...','Search Chinese, pinyin, or English...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c.value} value={c.value}>{tsPick(c.label, (c as any).labelEn)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No words message */}
      {deck.length === 0 ? (
        <Card className="j-card border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-muted)]">{ts('لا توجد كلمات في هذا التصنيف','No words in this category')}</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'cards' | 'learn' | 'test' | 'match')}>
          {/* Tab bar + Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-2">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="cards" className="text-xs sm:text-sm gap-1">
                <BookOpen className="w-3.5 h-3.5 hidden sm:inline" />
                {ts('البطاقات','Cards')}
              </TabsTrigger>
              <TabsTrigger value="learn" className="text-xs sm:text-sm gap-1">
                <Brain className="w-3.5 h-3.5 hidden sm:inline" />
                {ts('تعلّم','Learn')}
              </TabsTrigger>
              <TabsTrigger value="test" className="text-xs sm:text-sm gap-1">
                <Target className="w-3.5 h-3.5 hidden sm:inline" />
                {ts('اختبار','Test')}
              </TabsTrigger>
              <TabsTrigger value="match" className="text-xs sm:text-sm gap-1">
                <Gamepad2 className="w-3.5 h-3.5 hidden sm:inline" />
                {ts('مطابقة','Match')}
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={doShuffle} className="text-xs gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                {ts('إعادة ترتيب','Shuffle')}
              </Button>
              <Button size="sm" variant="outline" onClick={doReset} className="text-xs gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                {ts('إعادة تعيين','Reset')}
              </Button>
              {/* Session stats */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)] mr-2">
                {sessionSeen.size > 0 && <Badge variant="outline" className="text-xs">📅 {sessionSeen.size}</Badge>}
                {sessionCorrect > 0 && <Badge className="text-xs bg-[var(--clr-success-bg)] text-[var(--clr-success)] border-0">✓ {sessionCorrect}</Badge>}
                {sessionIncorrect > 0 && <Badge className="text-xs bg-[var(--clr-danger-bg)] text-[var(--clr-danger)] border-0">✗ {sessionIncorrect}</Badge>}
              </div>
            </div>
          </div>

          {/* ═══ CARDS MODE ═══ */}
          <TabsContent value="cards">
            {word && (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>{store.flashcardIndex + 1} {ts('من','of')} {deck.length}</span>
                    <span>{sessionSeen.size > 0 ? 'شوهد ' + sessionSeen.size : ''}</span>
                  </div>
                </div>

                {/* ═══ Flashcard ═══ */}
                <div
                  ref={cardRef}
                  className="j-flashcard"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  style={{ perspective: '1400px' }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {!store.isFlipped ? (
                    <motion.div
                      key={`front-${word.id}`}
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="relative w-full max-w-lg mx-auto cursor-pointer"
                      onClick={() => { store.flip(); markSeen(word.id); setPronResult(null) }}
                    >
                      {/* ── FRONT FACE ── */}
                      <div>
                        <Card className="j-hero-card border-0 shadow-2xl bg-gradient-to-br from-white via-primary/5 to-primary/10 rounded-3xl" style={{ minHeight: '420px' }}>
                          <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center gap-4" style={{ minHeight: '420px' }}>
                            {/* Character — Very Large Serif */}
                            <div
                              className="font-chinese-serif text-8xl sm:text-9xl text-[var(--text-primary)] select-none leading-none"
                            >
                              {word.zh}
                            </div>
                            {/* Pinyin */}
                            <div className="text-xl sm:text-2xl text-[var(--text-muted)] font-chinese-sans tracking-wide">
                              {word.pinyin}
                            </div>
                            {/* TTS Listen Button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--surface-card)]/80 border border-[var(--line-default)] text-[var(--text-tertiary)] hover:bg-[var(--clr-primary)]/10 hover:border-primary hover:text-primary transition-all shadow-sm"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span className="text-sm font-medium">{ts('🔊 استمع','🔊 Listen')}</span>
                            </button>
                            {/* POS badge */}
                            <Badge variant="outline" className="text-xs">{word.pos}</Badge>
                            {/* Hint */}
                            <div className="text-xs text-[var(--text-muted)] mt-2">
                              ─────── {ts('اضغط للقلب','tap to flip')} ──────
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                    ) : (
                    <motion.div
                      key={`back-${word.id}`}
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: -90 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="relative w-full max-w-lg mx-auto"
                    >
                      {/* ── BACK FACE ── */}
                      <div>
                        <Card className="j-flashcard-back border-0 shadow-2xl bg-gradient-to-br from-white via-[var(--surface-card-h)] to-[var(--clr-warning-bg)] rounded-3xl">
                          {/* زر القلب للأمام */}
                          <button
                            onClick={() => { store.flip(); setPronResult(null) }}
                            className="absolute top-3 left-3 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--surface-card)]/80 border border-[var(--line-default)] text-xs text-[var(--text-tertiary)] hover:text-primary hover:border-primary transition-all shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {ts('قلب', 'Flip')}
                          </button>
                          <CardContent className="flex flex-col p-5 sm:p-6 text-center gap-2">
                            {/* Meaning — Large */}
                            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                              {tsPick(word.meaning, word.english)}
                            </div>

                            {/* Chinese character + pinyin (smaller) */}
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-chinese-serif text-3xl text-primary">{word.zh}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--clr-info-bg)] hover:bg-[var(--clr-info)]/20 transition-colors"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-primary" />
                              </button>
                              <span className="text-sm text-[var(--text-muted)] font-chinese-sans">{word.pinyin}</span>
                            </div>

                            {/* Memory Tip */}
                            {word.mnemonic && (
                              <div className="bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30 rounded-xl px-4 py-2 text-sm text-[var(--clr-warning)] flex items-start gap-2">
                                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--clr-warning)]" />
                                <span>{ts('تذكّر', 'Tip')}: {word.mnemonic}</span>
                              </div>
                            )}

                            {/* ── Separator ── */}
                            <div className="border-t border-[var(--line-default)] my-1"></div>

                            {/* ── Sentences ── */}
                            <div className="text-right w-full">
                              <div className="text-xs font-bold text-[var(--text-muted)] mb-2 text-center">{ts('📝 الجمل:','📝 Sentences:')}</div>
                              <div className="space-y-2">
                                {wordSentences.map((s, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--line-subtle)] hover:bg-[var(--surface-card-h)] cursor-pointer transition-colors text-right"
                                    onClick={(e) => { e.stopPropagation(); speak(s.zh) }}
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-chinese-serif text-sm text-[var(--text-primary)]">{s.zh}</div>
                                      <div className="text-xs text-[var(--text-muted)] font-chinese-sans">{s.pinyin}</div>
                                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.ar}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* ── Separator ── */}
                            <div className="border-t border-[var(--line-default)] my-1"></div>

                            {/* ── Pronunciation Button (Prominent) ── */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isRecording) { stopPronRecording() } else { startPronRecording() }
                              }}
                              className={
                                "flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl transition-all duration-200 shadow-lg mx-auto " +
                                (isRecording
                                  ? "bg-[var(--clr-danger-bg)]0 text-white scale-105 animate-pulse"
                                  : "bg-primary text-white hover:brightness-110 hover:shadow-xl")
                              }
                            >
                              <Mic size={20} />
                              <span className="text-sm font-bold">
                                {isRecording ? '🔴 جارٍ التسجيل...' : '🎤 انطق الكلمة'}
                              </span>
                            </button>

                            {/* ── Pronunciation Result ── */}
                            {pronResult && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center text-sm py-2 px-4 rounded-xl"
                                style={{ background: pronResult.color + '12', color: pronResult.color, border: '1px solid ' + pronResult.color + '30' }}
                              >
                                <div className="font-bold">{pronResult.msg}</div>
                                <div className="text-xs mt-0.5 opacity-75">قلت: {pronResult.spoken} • النتيجة: {pronResult.score}%</div>
                              </motion.div>
                            )}

                            {/* ── SRS Buttons ── */}
                            <div className="flex items-center gap-3 mt-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleKnowIt() }}
                                className="j-btn-success flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white font-bold text-sm transition-all shadow-md hover:shadow-lg"
                              >
                                <Check className="w-5 h-5" />
                                أعرفها ✅
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDontKnow() }}
                                className="j-btn-ghost flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-[var(--clr-danger)]/30 text-[var(--clr-danger)] hover:bg-[var(--clr-danger-bg)] font-bold text-sm transition-all"
                              >
                                <X className="w-5 h-5" />
                                لا أعرفها ❌
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center justify-between max-w-lg mx-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => store.setFlashcardIndex(store.flashcardIndex - 1)}
                    disabled={store.flashcardIndex === 0}
                    className="rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {ts('السابق','Previous')}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={store.isLearned(word.id) ? 'default' : 'outline'}
                      onClick={(e) => { e.stopPropagation(); store.toggleLearned(word.id); store.incrementStreak() }}
                      className={store.isLearned(word.id) ? 'bg-[var(--clr-success)] hover:bg-[var(--clr-success-h)] rounded-xl' : 'rounded-xl'}
                    >
                      {store.isLearned(word.id) ? <><Check className="w-4 h-4 ml-1" /> {ts('تم الحفظ','Saved')}</> : <><Star className="w-4 h-4 ml-1" /> حفظ</>}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => store.setFlashcardIndex(store.flashcardIndex + 1)}
                    disabled={store.flashcardIndex >= deck.length - 1}
                    className="rounded-xl"
                  >
                    {ts('التالي','Next')}
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>

                {/* Word List (collapsed) */}
                <Card className="j-card border-0 shadow-sm">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="list" className="border-0">
                      <AccordionTrigger className="py-3 text-sm font-medium text-[var(--text-secondary)]">
                        {ts('قائمة الكلمات','Word list')} ({deck.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
                          {deck.map((w, i) => (
                            <button
                              key={w.id}
                              onClick={() => store.setFlashcardIndex(i)}
                              className={
                                store.isLearned(w.id)
                                  ? "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors hover:bg-[var(--surface-card-h)] bg-[var(--clr-success-bg)]/50"
                                  : "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors hover:bg-[var(--surface-card-h)]"
                              }
                            >
                              <span className="font-chinese-serif text-lg w-20 text-[var(--text-primary)]">{w.zh}</span>
                              <span className="text-xs text-[var(--text-muted)] font-chinese-sans w-28">{w.pinyin}</span>
                              <span className="text-sm text-[var(--text-secondary)] flex-1">{w.meaning}</span>
                              {sessionSeen.has(w.id) && <Eye className="w-3.5 h-3.5 text-[var(--clr-info)]" />}
                              {store.isLearned(w.id) && <Check className="w-4 h-4 text-[var(--clr-success)]" />}
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ═══ LEARN MODE ═══ */}
          <TabsContent value="learn">
            <div className="space-y-4">
              {/* Progress */}
              <div className="space-y-1">
                <Progress value={deck.length > 0 ? (learnCompleted / deck.length) * 100 : 0} className="h-2" />
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>{ts('السؤال','Question')} {learnIndex + 1} {ts('من','of')} {deck.length}</span>
                  <span>✓ {sessionCorrect} | ✗ {sessionIncorrect}</span>
                </div>
              </div>

              {learnIndex < deck.length && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={deck[learnIndex].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card className="j-card border-0 shadow-xl bg-gradient-to-br from-white to-primary/10 rounded-2xl">
                      <CardContent className="p-6 sm:p-8 text-center space-y-6">
                        <div className="text-sm text-[var(--text-muted)]">{ts('ما معنى هذه الكلمة؟','What does this word mean?')}</div>
                        <div
                          className="font-chinese-serif text-7xl sm:text-8xl text-[var(--text-primary)] cursor-pointer hover:text-primary transition-colors mx-auto"
                          onClick={() => speak(deck[learnIndex].zh)}
                        >
                          {deck[learnIndex].zh}
                        </div>
                        <div className="text-lg text-[var(--text-muted)] font-chinese-sans">{deck[learnIndex].pinyin}</div>

                        {/* Memory tip in learn mode */}
                        {deck[learnIndex].mnemonic && (
                          <div className="bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30 rounded-xl px-4 py-2 text-sm text-[var(--clr-warning)] flex items-start gap-2 mx-auto max-w-md">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--clr-warning)]" />
                            <span>{deck[learnIndex].mnemonic}</span>
                          </div>
                        )}

                        {/* Input */}
                        <div className="max-w-md mx-auto space-y-3">
                          <Input
                            placeholder={ts('اكتب المعنى بالعربية...','Type the meaning...')}
                            value={learnInput}
                            onChange={(e) => setLearnInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') checkLearnAnswer() }}
                            className={
                              learnFeedback === 'correct' ? 'border-[var(--clr-success)] bg-[var(--clr-success-bg)]'
                                : learnFeedback === 'incorrect' ? 'border-[var(--clr-danger)] bg-[var(--clr-danger-bg)]'
                                : ''
                            }
                            dir="rtl"
                            disabled={learnFeedback !== null}
                          />
                          <div className="flex gap-2 justify-center">
                            <Button onClick={checkLearnAnswer} disabled={learnFeedback !== null || !learnInput.trim()} className="bg-primary hover:brightness-110 rounded-xl">
                              تحقق
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => speak(deck[learnIndex].zh)} className="rounded-xl">
                              <Volume2 className="w-4 h-4 ml-1" /> استمع
                            </Button>
                          </div>
                        </div>

                        {/* Feedback */}
                        {learnFeedback && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={
                              learnFeedback === 'correct'
                                ? "bg-[var(--clr-success-bg)] border border-[var(--clr-success)]/30 rounded-xl p-4"
                                : "bg-[var(--clr-danger-bg)] border border-[var(--clr-danger)]/30 rounded-xl p-4"
                            }
                          >
                            {learnFeedback === 'correct' ? (
                              <div className="flex items-center justify-center gap-2 text-[var(--clr-success)]">
                                <Check className="w-5 h-5" />
                                <span className="font-bold">{ts('أحسنت! صحيح','Correct! Well done')}</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-2 text-[var(--clr-danger)]">
                                  <X className="w-5 h-5" />
                                  <span className="font-bold">{ts('إجابة خاطئة','Wrong answer')}</span>
                                </div>
                                <div className="text-sm text-[var(--text-tertiary)]">
                                  الإجابة الصحيحة: <span className="font-bold">{deck[learnIndex].meaning}</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Skip */}
                        {learnFeedback === null && (
                          <button
                            className="text-xs j-bottom-nav-item transition-colors"
                            onClick={() => {
                              setLearnIndex(p => p + 1)
                              setLearnInput('')
                            }}
                          >
                            تخطّي →
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Learn Complete */}
              {learnIndex >= deck.length && (
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-[var(--clr-warning)] mx-auto" />
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{ts('انتهى التعلّم! 🎉','Learning complete! 🎉')}</h3>
                    <div className="text-[var(--text-muted)] space-y-1">
                      <p>✓ {ts('صحيح','Correct')}: <span className="text-[var(--clr-success)] font-bold">{sessionCorrect}</span></p>
                      <p>✗ {ts('خاطئ','Wrong')}: <span className="text-[var(--clr-danger)] font-bold">{sessionIncorrect}</span></p>
                      <p>{ts('النسبة','Accuracy')}: <span className="text-primary font-bold">{deck.length > 0 ? Math.round((sessionCorrect / deck.length) * 100) : 0}%</span></p>
                    </div>
                    <Button onClick={initLearn} className="bg-primary hover:brightness-110 rounded-xl">
                      ابدأ من جديد
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ═══ TEST MODE ═══ */}
          <TabsContent value="test">
            <div className="space-y-4">
              {testQuestions.length === 0 ? (
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Target className="w-12 h-12 text-primary mx-auto" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{ts('اختبار سريع','Quick Quiz')}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      10 أسئلة اختيار متعدد من المجموعة الحالية
                    </p>
                    <Button onClick={initTest} className="bg-primary hover:brightness-110 rounded-xl">
                      ابدأ الاختبار
                    </Button>
                  </CardContent>
                </Card>
              ) : testFinished ? (
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-[var(--clr-warning)] mx-auto" />
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{ts('نتيجة الاختبار 🎉','Quiz Result 🎉')}</h3>
                    <div className="text-[var(--text-muted)] space-y-1">
                      <p className="text-3xl font-bold text-primary">{testScore} / {testQuestions.length}</p>
                      <p>{ts('النسبة','Accuracy')}: {Math.round((testScore / testQuestions.length) * 100)}%</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={initTest} className="bg-primary hover:brightness-110 rounded-xl">
                        اختبار جديد
                      </Button>
                      <Button variant="outline" onClick={() => setTestQuestions([])} className="rounded-xl">
                        رجوع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Progress */}
                  <div className="space-y-1">
                    <Progress value={((testIndex + 1) / testQuestions.length) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>السؤال {testIndex + 1} من {testQuestions.length}</span>
                      <span>✓ {testScore}</span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={testIndex}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="j-card border-0 shadow-xl bg-gradient-to-br from-white to-primary/10 rounded-2xl">
                        <CardContent className="p-6 sm:p-8 text-center space-y-6">
                          <div className="text-sm text-[var(--text-muted)]">{ts('اختر المعنى الصحيح','Choose the correct meaning')}</div>
                          <div
                            className="font-chinese-serif text-6xl sm:text-7xl text-[var(--text-primary)] cursor-pointer hover:text-primary transition-colors"
                            onClick={() => speak(testQuestions[testIndex].word.zh)}
                          >
                            {testQuestions[testIndex].word.zh}
                          </div>
                          <div className="text-base text-[var(--text-muted)] font-chinese-sans">{testQuestions[testIndex].word.pinyin}</div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                            {testQuestions[testIndex].options.map((opt, i) => {
                              const isAnswered = testAnswer !== null
                              const isCorrect = i === testQuestions[testIndex].correctIdx
                              const isSelected = i === testAnswer
                              return (
                                <motion.button
                                  key={i}
                                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                  onClick={() => handleTestAnswer(i)}
                                  disabled={isAnswered}
                                  className={
                                    isAnswered && isCorrect
                                      ? "p-3 rounded-xl border-2 border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)] font-medium text-sm transition-all"
                                      : isAnswered && isSelected && !isCorrect
                                        ? "p-3 rounded-xl border-2 border-[var(--clr-danger)] bg-[var(--clr-danger-bg)] text-[var(--clr-danger)] font-medium text-sm transition-all"
                                        : "p-3 rounded-xl border-2 border-[var(--line-default)] bg-[var(--surface-card)] hover:border-primary hover:bg-[var(--clr-primary)]/10 text-[var(--text-secondary)] font-medium text-sm transition-all cursor-pointer"
                                  }
                                >
                                  {isAnswered && isCorrect && <Check className="w-4 h-4 inline ml-1" />}
                                  {isAnswered && isSelected && !isCorrect && <X className="w-4 h-4 inline ml-1" />}
                                  {opt}
                                </motion.button>
                              )
                            })}
                          </div>

                          {/* Feedback after answer */}
                          {testAnswer !== null && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-[var(--text-muted)]"
                            >
                              {!isSelectedCorrect(testAnswer, testQuestions[testIndex].correctIdx) && (
                                <span>
                                  الإجابة الصحيحة: <span className="font-bold text-[var(--clr-success)]">{testQuestions[testIndex].options[testQuestions[testIndex].correctIdx]}</span>
                                </span>
                              )}
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </div>
          </TabsContent>

          {/* ═══ MATCH MODE ═══ */}
          <TabsContent value="match">
            <div className="space-y-4">
              {matchTiles.length === 0 ? (
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Gamepad2 className="w-12 h-12 text-primary mx-auto" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{ts('لعبة المطابقة','Matching Game')}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      طابق بين 6 أزواج من الكلمات الصينية ومعانيها بالعربية في أسرع وقت!
                    </p>
                    <Button onClick={initMatch} className="bg-primary hover:brightness-110 rounded-xl">
                      ابدأ اللعبة
                    </Button>
                  </CardContent>
                </Card>
              ) : matchDone ? (
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-[var(--clr-warning)] mx-auto" />
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{ts('أحسنت! 🎉','Well done! 🎉')}</h3>
                    <div className="text-[var(--text-muted)] space-y-1">
                      <p>⏱ {ts('الوقت','Time')}: <span className="font-bold">{formatTime(matchTimer)}</span></p>
                      <p>🎯 {ts('المحاولات','Moves')}: <span className="font-bold">{matchMoves}</span></p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={initMatch} className="bg-primary hover:brightness-110 rounded-xl">
                        {ts('العب مرة أخرى','Play again')}
                      </Button>
                      <Button variant="outline" onClick={() => setMatchTiles([])} className="rounded-xl">
                        رجوع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Timer & Moves */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-bold">{formatTime(matchTimer)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Target className="w-4 h-4" />
                      <span>{Math.floor(matchTiles.filter(t => t.matched).length / 2)} / {matchPairs.length}</span>
                    </div>
                    <Badge variant="outline">{matchMoves} محاولة</Badge>
                  </div>

                  {/* Tiles Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                    {matchTiles.map((tile) => {
                      const isSelectedTile = matchSelected === tile.id
                      return (
                        <motion.button
                          key={tile.id}
                          whileHover={!tile.matched ? { scale: 1.03 } : {}}
                          whileTap={!tile.matched ? { scale: 0.97 } : {}}
                          onClick={() => handleMatchTile(tile.id)}
                          disabled={tile.matched}
                          className={
                            tile.matched
                              ? "p-3 sm:p-4 rounded-xl bg-[var(--clr-success-bg)] border-2 border-[var(--clr-success)]/40 text-[var(--clr-success)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center transition-all"
                              : isSelectedTile
                                ? tile.type === 'zh'
                                  ? "p-3 sm:p-4 rounded-xl bg-[var(--clr-info-bg)] border-2 border-[var(--clr-primary)] text-[var(--clr-primary)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center font-chinese-serif text-lg sm:text-xl transition-all"
                                  : "p-3 sm:p-4 rounded-xl bg-[var(--clr-info-bg)] border-2 border-[var(--clr-primary)] text-[var(--clr-primary)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center text-sm sm:text-base font-medium transition-all"
                                : tile.type === 'zh'
                                  ? "p-3 sm:p-4 rounded-xl bg-[var(--surface-card)] border-2 border-[var(--line-default)] hover:border-primary text-[var(--text-primary)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center font-chinese-serif text-lg sm:text-xl cursor-pointer transition-all shadow-sm"
                                  : "p-3 sm:p-4 rounded-xl bg-[var(--surface-card)] border-2 border-[var(--line-default)] hover:border-primary text-[var(--text-secondary)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center text-sm sm:text-base cursor-pointer transition-all shadow-sm"
                          }
                        >
                          {tile.matched ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            tile.text
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
