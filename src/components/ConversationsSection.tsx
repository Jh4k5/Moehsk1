'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { conversations, type Conversation, type ConversationTurn } from '@/data/conversations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Volume2, MessageCircle, Play, Eye, EyeOff, Check, X,
  RotateCcw, ChevronLeft, ChevronRight, Headphones,
} from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

// ─── TTS Helper ─────────────────────────────────────────────
const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.7
    window.speechSynthesis.speak(u)
  }
}

// ─── Helpers ────────────────────────────────────────────────

/** Get a difficulty label + color for a lesson number */
function getDifficulty(lesson: number) {
  if (lesson <= 5) return { label: 'مبتدئ', cls: 'bg-[var(--clr-success-bg)] text-[var(--clr-success)] dark:bg-[var(--clr-success-bg)]/40 dark:text-[var(--clr-success)]' }
  if (lesson <= 10) return { label: 'متوسط', cls: 'bg-[var(--clr-warning-bg)] text-[var(--clr-warning)] dark:bg-[var(--clr-warning-bg)]/40 dark:text-[var(--clr-warning)]' }
  return { label: 'متقدم', cls: 'bg-[var(--clr-danger-bg)] text-[var(--clr-danger)] dark:bg-[var(--clr-danger-bg)]/40 dark:text-[var(--clr-danger)]' }
}

/** Shuffle array in-place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick 2-3 random turn indices from a conversation for quiz */
function pickQuizTurns(turns: ConversationTurn[]): number[] {
  const count = turns.length <= 4 ? 2 : 3
  const indices = turns.map((_, i) => i)
  return shuffle(indices).slice(0, count)
}

/** Build 3 options: correct hanzi + 2 distractors from other conversations */
function buildOptions(
  correctTurn: ConversationTurn,
  correctIdx: number,
  conversationId: number,
): string[] {
  const allOther = conversations
    .filter(c => c.id !== conversationId)
    .flatMap(c => c.turns)
    .map(t => t.hanzi)
    .filter(h => h !== correctTurn.hanzi)

  const distractors = shuffle(allOther).slice(0, 2)
  return shuffle([correctTurn.hanzi, ...distractors])
}

// ─── Quiz Turn State ────────────────────────────────────────
interface QuizState {
  active: boolean
  quizTurnIndices: number[]
  answers: Record<number, number | null>   // turnIdx → selected option idx
  options: Record<number, string[]>        // turnIdx → 3 options
  revealed: Record<number, boolean>        // turnIdx → answered?
  score: number
  total: number
  finished: boolean
}

function createQuizState(conv: Conversation): QuizState {
  const quizTurnIndices = pickQuizTurns(conv.turns)
  const answers: Record<number, number | null> = {}
  const options: Record<number, string[]> = {}
  const revealed: Record<number, boolean> = {}

  for (const idx of quizTurnIndices) {
    answers[idx] = null
    options[idx] = buildOptions(conv.turns[idx], idx, conv.id)
    revealed[idx] = false
  }

  return {
    active: true,
    quizTurnIndices,
    answers,
    options,
    revealed,
    score: 0,
    total: quizTurnIndices.length,
    finished: false,
  }
}

// ─── Framer Variants ────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
}

const bubblePop: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' },
  }),
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: 'easeOut' },
  }),
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function ConversationsSection() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showPinyin, setShowPinyin] = useState(true)
  const [showArabic, setShowArabic] = useState(true)
  const [playingAll, setPlayingAll] = useState(false)
  const [playingTurnIdx, setPlayingTurnIdx] = useState<number | null>(null)

  // Quiz
  const [quiz, setQuiz] = useState<QuizState | null>(null)

  // Refs
  const playAllRef = useRef<NodeJS.Timeout | null>(null)
  const playingAllRef = useRef(false)

  // Derived
  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedId) ?? null,
    [selectedId],
  )

  // ─── Play All ──────────────────────────────────────────────
  const stopPlayAll = useCallback(() => {
    playingAllRef.current = false
    setPlayingAll(false)
    setPlayingTurnIdx(null)
    if (playAllRef.current) clearTimeout(playAllRef.current)
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
  }, [])

  const handlePlayAll = useCallback(() => {
    if (!selectedConversation || playingAll) {
      stopPlayAll()
      return
    }
    playingAllRef.current = true
    setPlayingAll(true)

    let idx = 0
    const speakNext = () => {
      if (!playingAllRef.current || idx >= selectedConversation.turns.length) {
        stopPlayAll()
        return
      }
      setPlayingTurnIdx(idx)
      speak(selectedConversation.turns[idx].hanzi)
      idx++
      playAllRef.current = setTimeout(speakNext, 2200)
    }
    speakNext()
  }, [selectedConversation, playingAll, stopPlayAll])

  // Cleanup on unmount / conversation switch
  useEffect(() => {
    return () => stopPlayAll()
  }, [selectedId, stopPlayAll])

  // ─── Quiz Handlers ─────────────────────────────────────────
  const startQuiz = useCallback(() => {
    if (!selectedConversation) return
    setQuiz(createQuizState(selectedConversation))
  }, [selectedConversation])

  const handleQuizAnswer = useCallback(
    (turnIdx: number, optIdx: number) => {
      if (!quiz || quiz.revealed[turnIdx]) return

      const isCorrect = quiz.options[turnIdx][optIdx] === selectedConversation!.turns[turnIdx].hanzi
      const newScore = quiz.score + (isCorrect ? 1 : 0)

      setQuiz(prev => {
        if (!prev) return null
        const newRevealed = { ...prev.revealed, [turnIdx]: true }
        const allRevealed = Object.values(newRevealed).every(Boolean)
        return {
          ...prev,
          answers: { ...prev.answers, [turnIdx]: optIdx },
          revealed: newRevealed,
          score: newScore,
          finished: allRevealed,
        }
      })
    },
    [quiz, selectedConversation],
  )

  const resetQuiz = useCallback(() => {
    setQuiz(null)
  }, [])

  // ─── Back handler ──────────────────────────────────────────
  const handleBack = useCallback(() => {
    stopPlayAll()
    setQuiz(null)
    setSelectedId(null)
  }, [stopPlayAll])

  // ═══════════════════════════════════════════════════════════
  // RENDER — Conversation List
  // ═══════════════════════════════════════════════════════════
  if (!selectedConversation) {
    return (
      <div dir="rtl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">المحادثات</h2>
            <p className="text-sm text-muted-foreground font-arabic">
              تدرب على المحادثات الصينية اليومية
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[36rem] overflow-y-auto custom-scrollbar pr-1">
          {conversations.map((conv, i) => {
            const diff = getDifficulty(conv.lesson)
            return (
              <motion.div
                key={conv.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card
                  className="card-hover cursor-pointer border hover:border-primary/30 transition-colors"
                  onClick={() => setSelectedId(conv.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-bold leading-snug">
                          <span className="font-arabic">{conv.title}</span>
                          <span className="mx-1.5 text-muted-foreground/50">—</span>
                          <span className="font-chinese-serif">{conv.titleChinese}</span>
                        </CardTitle>
                        <p className="mt-1.5 text-xs text-muted-foreground font-arabic leading-relaxed line-clamp-2">
                          {conv.context}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 text-[10px] font-medium ${diff.cls}`}
                      >
                        {diff.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-arabic">
                        الدرس {conv.lesson}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MessageCircle className="w-3 h-3" />
                        <span>{conv.turns.length} جمل</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — Conversation Detail
  // ═══════════════════════════════════════════════════════════
  const diff = getDifficulty(selectedConversation.lesson)

  return (
    <div dir="rtl">
      {/* ─── Header ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`header-${selectedId}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleBack}
              aria-label="رجوع"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold leading-snug truncate">
                <span className="font-arabic">{selectedConversation.title}</span>
                <span className="mx-1.5 text-muted-foreground/50">—</span>
                <span className="font-chinese-serif">{selectedConversation.titleChinese}</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-arabic">
                {selectedConversation.context}
              </p>
            </div>
            <Badge variant="secondary" className={`shrink-0 text-[10px] ${diff.cls}`}>
              {diff.label}
            </Badge>
          </div>

          {/* ─── Controls ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowPinyin(p => !p)}
            >
              {showPinyin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPinyin ? 'إخفاء البينيين' : 'إظهار البينيين'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowArabic(a => !a)}
            >
              {showArabic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showArabic ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
            </Button>
            <Button
              variant={playingAll ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handlePlayAll}
            >
              {playingAll ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  إيقاف
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  تشغيل الكل
                </>
              )}
            </Button>
            <div className="flex-1" />
            <Button
              variant={quiz?.active ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={quiz?.active ? resetQuiz : startQuiz}
            >
              <Headphones className="w-3.5 h-3.5" />
              {quiz?.active ? 'إنهاء الاختبار' : 'وضع الاختبار'}
            </Button>
          </div>

          {/* ─── Quiz Score Bar ───────────────────────────── */}
          <AnimatePresence>
            {quiz && quiz.active && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-5"
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold font-arabic">وضع الاختبار</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-arabic">
                        أجب عن {quiz.total} أسئلة
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${quiz.total > 0 ? (Object.values(quiz.revealed).filter(Boolean).length / quiz.total) * 100 : 0}%`,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground font-arabic">
                      اسأل نفسك: ما هي الجملة الصينية الصحيحة؟
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Quiz Result ──────────────────────────────── */}
          <AnimatePresence>
            {quiz && quiz.finished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="mb-5"
              >
                <Card className={`border-2 ${quiz.score === quiz.total ? 'border-[var(--clr-success)] bg-[var(--clr-success-bg)] dark:bg-[var(--clr-success-bg)]/30' : quiz.score >= quiz.total / 2 ? 'border-[var(--clr-warning)] bg-[var(--clr-warning-bg)] dark:bg-[var(--clr-warning-bg)]/30' : 'border-[var(--clr-danger)]/50 bg-[var(--clr-danger-bg)] dark:bg-[var(--clr-danger-bg)]/30'}`}>
                  <CardContent className="p-5 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    >
                      {quiz.score === quiz.total ? (
                        <Check className="w-10 h-10 mx-auto mb-2 text-[var(--clr-success)]" />
                      ) : quiz.score >= quiz.total / 2 ? (
                        <Volume2 className="w-10 h-10 mx-auto mb-2 text-[var(--clr-warning)]" />
                      ) : (
                        <RotateCcw className="w-10 h-10 mx-auto mb-2 text-[var(--clr-danger)]" />
                      )}
                    </motion.div>
                    <p className="text-lg font-bold font-arabic">
                      {quiz.score === quiz.total
                        ? 'ممتاز! إجابات صحيحة! 🎉'
                        : quiz.score >= quiz.total / 2
                        ? 'جيد! استمر بالتعلم 💪'
                        : 'حاول مرة أخرى! 🔄'}
                    </p>
                    <p className="text-sm text-muted-foreground font-arabic mt-1">
                      النتيجة: {quiz.score} / {quiz.total}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 gap-1.5 text-xs"
                      onClick={startQuiz}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      إعادة الاختبار
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* ─── Chat Bubbles ─────────────────────────────────── */}
      <div className="space-y-3 max-h-[40rem] overflow-y-auto custom-scrollbar pr-1 pb-4">
        {selectedConversation.turns.map((turn, i) => {
          const isA = turn.speaker === 'A'
          const isQuizTurn = quiz?.active && quiz.quizTurnIndices.includes(i)
          const isRevealed = quiz?.revealed[i] ?? true
          const selectedOption = quiz?.answers[i] ?? null
          const isCorrectAnswer =
            selectedOption !== null &&
            quiz?.options[i]?.[selectedOption] === turn.hanzi

          return (
            <motion.div
              key={`${selectedId}-${i}`}
              custom={i}
              variants={bubblePop}
              initial="hidden"
              animate="visible"
              className={`flex ${isA ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm border transition-colors ${
                  isA
                    ? 'bg-[var(--clr-danger-bg)] border-[var(--clr-danger)]/30 dark:bg-[var(--clr-danger-bg)]/30 dark:border-[var(--clr-danger)]/50 rounded-br-sm'
                    : 'bg-[var(--clr-info-bg)] border-[var(--clr-info)]/30 dark:bg-[var(--clr-info-bg)]/30 dark:border-[var(--clr-info)]/50 rounded-bl-sm'
                } ${playingTurnIdx === i ? 'ring-2 ring-primary/50' : ''}`}
              >
                {/* Speaker label */}
                <div className={`flex items-center gap-2 mb-1.5 ${isA ? 'flex-row-reverse' : ''}`}>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isA
                        ? 'bg-[var(--clr-danger)]/20 text-[var(--clr-danger)] dark:bg-[var(--clr-danger)]/60/60 dark:text-[var(--clr-danger)]'
                        : 'bg-[var(--clr-info)]/20 text-[var(--clr-info)] dark:bg-[var(--clr-info)]/60 dark:text-[var(--clr-info)]'
                    }`}
                  >
                    المتحدث {turn.speaker}
                  </span>
                  <button
                    onClick={() => speak(turn.hanzi)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="استمع"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hanzi */}
                {isQuizTurn && !isRevealed ? (
                  /* ─── Quiz: Hidden hanzi, show options ──── */
                  <div>
                    <div className="h-8 flex items-center justify-center">
                      <span className="text-lg text-muted-foreground/40 font-chinese-serif tracking-widest">
                        ？？？
                      </span>
                    </div>

                    <div className="grid gap-1.5 mt-2">
                      {(quiz?.options[i] ?? []).map((opt, optI) => (
                        <button
                          key={optI}
                          onClick={() => handleQuizAnswer(i, optI)}
                          className="w-full text-right text-sm px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent hover:border-primary/30 transition-all font-chinese-serif text-foreground"
                        >
                          <span className="text-muted-foreground text-[10px] ml-2 font-arabic">
                            {optI === 0 ? 'أ' : optI === 1 ? 'ب' : 'ج'})
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ─── Normal / Revealed hanzi ──────────── */
                  <div>
                    <p
                      className={`text-base sm:text-lg font-bold leading-relaxed font-chinese-serif ${
                        isQuizTurn && isRevealed
                          ? isCorrectAnswer
                            ? 'text-[var(--clr-success)] dark:text-[var(--clr-success)]'
                            : selectedOption !== null
                            ? 'text-[var(--clr-danger)] dark:text-[var(--clr-danger)]'
                            : 'text-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {turn.hanzi}
                    </p>

                    {/* Feedback icon for quiz reveals */}
                    {isQuizTurn && isRevealed && selectedOption !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        {isCorrectAnswer ? (
                          <>
                            <Check className="w-4 h-4 text-[var(--clr-success)]" />
                            <span className="text-[11px] text-[var(--clr-success)] dark:text-[var(--clr-success)] font-arabic">
                              صحيح!
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-[var(--clr-danger)]" />
                            <span className="text-[11px] text-[var(--clr-danger)] dark:text-[var(--clr-danger)] font-arabic">
                              خطأ — الإجابة الصحيحة: {turn.hanzi}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Pinyin */}
                    {showPinyin && (
                      <p className="mt-1 text-xs text-muted-foreground font-chinese-sans leading-relaxed">
                        {turn.pinyin}
                      </p>
                    )}

                    {/* Arabic translation */}
                    {showArabic && (
                      <p className="mt-1 text-sm text-muted-foreground font-arabic leading-relaxed">
                        {turn.arabic}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ─── Bottom Navigation ──────────────────────────────── */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          disabled={!selectedId || selectedId <= 1}
          onClick={() => {
            handleBack()
            setTimeout(() => selectedId && setSelectedId(selectedId - 1), 0)
          }}
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>
        <span className="text-xs text-muted-foreground font-arabic">
          {selectedId} / {conversations.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          disabled={!selectedId || selectedId >= conversations.length}
          onClick={() => {
            handleBack()
            setTimeout(() => selectedId && setSelectedId(selectedId + 1), 0)
          }}
        >
          التالي
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
