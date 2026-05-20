'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { lessons } from '@/data/lessons'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { grammarRules, type GrammarRule } from '@/data/grammar'
import { useLearningStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import {
  BookOpen, CheckCircle, Volume2, MessageCircle, GraduationCap,
  Target, Lock, Play, ArrowLeft, Check, X, ChevronLeft, ChevronRight,
  Trophy, RotateCcw, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

// ─── Lesson color palette ──────────────────────────────────
const lessonColors: Record<number, string> = {
  1: '#1A5FA8',
  2: '#0D7C5F',
  3: '#8B5E3C',
  4: '#9B2335',
  5: '#D4760A',
  6: '#6B2D8B',
  7: '#1A8B8B',
  8: '#3D5A80',
  9: '#6A994E',
  10: '#BC4749',
  11: '#2A6F97',
  12: '#7F5539',
  13: '#588157',
  14: '#9C6644',
  15: '#264653',
}

const getLessonColor = (id: number) => lessonColors[id] || '#1A5FA8'

// ─── Exercise types ─────────────────────────────────────────
type ExerciseAnswer = number | string | null

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function LessonSystem() {
  const store = useLearningStore()
  const { learnedWords, toggleLearned } = store

  // ─── Local State ─────────────────────────────────────────
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('vocab')

  // Exercise state
  const [exIdx, setExIdx] = useState(0)
  const [exAnswer, setExAnswer] = useState<ExerciseAnswer>(null)
  const [exChecked, setExChecked] = useState(false)
  const [exCorrect, setExCorrect] = useState(false)
  const [exScore, setExScore] = useState(0)
  const [exFinished, setExFinished] = useState(false)
  const [exInput, setExInput] = useState('')
  const [exResults, setExResults] = useState<boolean[]>([])

  // ─── Computed ────────────────────────────────────────────
  const currentLesson = useMemo(() => {
    if (selectedLesson === null) return null
    return lessons.find(l => l.id === selectedLesson) || null
  }, [selectedLesson])

  const lessonVocab = useMemo(() => {
    if (!currentLesson) return []
    return currentLesson.vocabularyIds
      .map(id => vocabulary.find(v => v.id === id))
      .filter((v): v is VocabWord => !!v)
  }, [currentLesson])

  const lessonGrammar = useMemo(() => {
    if (!currentLesson) return []
    return currentLesson.grammarIds
      .map(id => grammarRules.find(g => g.id === id))
      .filter((g): g is GrammarRule => !!g)
  }, [currentLesson])

  const getLessonProgress = useCallback((lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return 0
    const total = lesson.vocabularyIds.length
    if (total === 0) return 0
    const learned = lesson.vocabularyIds.filter(id => learnedWords.includes(id)).length
    return Math.round((learned / total) * 100)
  }, [learnedWords])

  const isLessonCompleted = useCallback((lessonId: number) => {
    return getLessonProgress(lessonId) === 100
  }, [getLessonProgress])

  const isLessonActive = useCallback((lessonId: number) => {
    if (isLessonCompleted(lessonId)) return false
    const completed = lessons.filter(l => isLessonCompleted(l.id))
    if (completed.length === 0) return lessonId === 1
    const lastCompletedId = Math.max(...completed.map(l => l.id))
    return lessonId === lastCompletedId + 1
  }, [isLessonCompleted])

  // ─── Exercise Helpers ────────────────────────────────────
  const resetExercise = useCallback(() => {
    setExIdx(0)
    setExAnswer(null)
    setExChecked(false)
    setExCorrect(false)
    setExScore(0)
    setExFinished(false)
    setExInput('')
    setExResults([])
  }, [])

  const checkAnswer = useCallback(() => {
    if (!currentLesson) return
    const exercise = currentLesson.exercises[exIdx]
    if (!exercise) return

    let isCorrect = false

    if (exercise.type === 'multiple_choice' || exercise.type === 'tone') {
      if (typeof exAnswer === 'number' && exAnswer === exercise.correct) {
        isCorrect = true
      }
    } else if (exercise.type === 'fill_blank' || exercise.type === 'translate') {
      if (typeof exAnswer === 'string') {
        const userAns = exAnswer.trim()
        const correctAns = (exercise.answer || '').trim()
        isCorrect = userAns === correctAns
      }
    }

    setExChecked(true)
    setExCorrect(isCorrect)
    setExResults(prev => [...prev, isCorrect])
    if (isCorrect) {
      setExScore(prev => prev + 1)
    }
  }, [currentLesson, exIdx, exAnswer])

  const nextExercise = useCallback(() => {
    if (!currentLesson) return
    if (exIdx < currentLesson.exercises.length - 1) {
      setExIdx(prev => prev + 1)
      setExAnswer(null)
      setExChecked(false)
      setExCorrect(false)
      setExInput('')
    } else {
      setExFinished(true)
    }
  }, [currentLesson, exIdx])

  // ─── Animation Variants ──────────────────────────────────
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    }),
  }

  const pageVariants = {
    enter: { opacity: 0, x: -30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: Lesson Detail View
  // ═══════════════════════════════════════════════════════════
  if (currentLesson) {
    const color = getLessonColor(currentLesson.id)
    const totalWords = currentLesson.vocabularyIds.length
    const learnedCount = currentLesson.vocabularyIds.filter(id => learnedWords.includes(id)).length

    return (
      <motion.div
        dir="rtl"
        initial="enter"
        animate="center"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedLesson(null); resetExercise() }}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 ml-1" />
            العودة
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: color }}
            >
              {currentLesson.id}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                {currentLesson.title}
              </h2>
              <p className="text-sm text-gray-500 font-chinese-sans">
                {currentLesson.titleZh}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3 w-3" />
              {totalWords} كلمة
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {learnedCount} / {totalWords}
            </Badge>
            <div className="w-24">
              <Progress value={(learnedCount / Math.max(totalWords, 1)) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === 'exercises') resetExercise() }}>
          <TabsList className="w-full flex h-auto flex-wrap gap-1 bg-gray-50 p-1 rounded-xl">
            <TabsTrigger
              value="vocab"
              className={"flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm " + (activeTab === 'vocab' ? "bg-white shadow-sm" : "")}
            >
              <BookOpen className="h-4 w-4" />
              المفردات
            </TabsTrigger>
            <TabsTrigger
              value="grammar"
              className={"flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm " + (activeTab === 'grammar' ? "bg-white shadow-sm" : "")}
            >
              <GraduationCap className="h-4 w-4" />
              القواعد
            </TabsTrigger>
            <TabsTrigger
              value="conversation"
              className={"flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm " + (activeTab === 'conversation' ? "bg-white shadow-sm" : "")}
            >
              <MessageCircle className="h-4 w-4" />
              محادثة
            </TabsTrigger>
            <TabsTrigger
              value="sentences"
              className={"flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm " + (activeTab === 'sentences' ? "bg-white shadow-sm" : "")}
            >
              <Sparkles className="h-4 w-4" />
              الجمل
            </TabsTrigger>
            <TabsTrigger
              value="exercises"
              className={"flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm " + (activeTab === 'exercises' ? "bg-white shadow-sm" : "")}
            >
              <Target className="h-4 w-4" />
              التمارين
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Vocabulary ─────────────────────────── */}
          <TabsContent value="vocab" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessonVocab.map((word, idx) => {
                const isLearned = learnedWords.includes(word.id)
                return (
                  <motion.div
                    key={word.id}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card
                      className={"cursor-pointer transition-all duration-200 hover:shadow-md border-2 relative overflow-hidden " + (isLearned ? "border-green-300 bg-green-50/50" : "border-gray-100 hover:border-blue-200")}
                      onClick={() => speak(word.zh)}
                    >
                      {isLearned && (
                        <div className="absolute top-2 left-2 z-10">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div
                              className="text-3xl font-bold mb-1 font-chinese-serif cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                            >
                              {word.zh}
                            </div>
                            <div className="text-sm text-gray-500 font-chinese-sans mb-1">
                              {word.pinyin}
                            </div>
                            <div className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                              {word.meaning}
                            </div>
                            {word.pos && word.pos !== 'fixed' && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {word.pos}
                              </Badge>
                            )}
                          </div>
                          <button
                            className="p-2 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                          <Button
                            size="sm"
                            variant={isLearned ? "outline" : "default"}
                            className={"text-xs " + (isLearned ? "text-green-600 border-green-300 hover:bg-green-50" : "")}
                            onClick={(e) => { e.stopPropagation(); toggleLearned(word.id) }}
                          >
                            {isLearned ? (
                              <><Check className="h-3 w-3 ml-1" /> تم الحفظ</>
                            ) : (
                              <><Play className="h-3 w-3 ml-1" /> تعلّم</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          {/* ─── Tab 2: Grammar ───────────────────────────── */}
          <TabsContent value="grammar" className="mt-6">
            <Accordion type="single" collapsible className="space-y-3">
              {lessonGrammar.map((rule, idx) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-sm">
                    <AccordionItem value={"gr-" + rule.id} className="border-0">
                      <AccordionTrigger className="px-5 py-4 hover:no-underline">
                        <div className="flex items-center gap-3 text-right">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {idx + 1}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800 text-sm" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                              {rule.titleAr}
                            </div>
                            <div className="text-xs text-gray-400 font-chinese-sans">
                              {rule.title}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-4">
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                            {rule.description}
                          </p>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-blue-600 mb-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                              النمط:
                            </div>
                            <div className="text-sm font-medium text-blue-800 font-chinese-sans">
                              {rule.pattern}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-500" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                              أمثلة:
                            </div>
                            {rule.examples.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="bg-gray-50 rounded-lg p-3 flex items-start gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => speak(ex.zh)}
                              >
                                <Volume2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-chinese-serif font-semibold text-gray-800">
                                    {ex.zh}
                                  </div>
                                  <div className="text-xs text-gray-400 font-chinese-sans">
                                    {ex.pinyin}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-0.5" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                                    {ex.ar}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {rule.tips && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-amber-700" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                                {rule.tips}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                </motion.div>
              ))}
            </Accordion>
          </TabsContent>

          {/* ─── Tab 3: Conversation ───────────────────────── */}
          <TabsContent value="conversation" className="mt-6">
            <div className="space-y-6">
              {currentLesson.conversations.map((conv, convIdx) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: convIdx * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-3" style={{ backgroundColor: color + '10' }}>
                      <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                        <MessageCircle className="h-5 w-5" style={{ color }} />
                        {conv.title}
                      </CardTitle>
                      <div className="text-sm text-gray-500 flex items-center gap-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                        {conv.scene}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {conv.turns.map((turn, turnIdx) => {
                        const isA = turn.speaker === 'A'
                        return (
                          <motion.div
                            key={turnIdx}
                            initial={{ opacity: 0, x: isA ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: turnIdx * 0.15 }}
                            className={"flex gap-2 " + (isA ? "flex-row-reverse" : "")}
                          >
                            <div
                              className={"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold " + (isA ? "bg-blue-500" : "bg-emerald-500")}
                            >
                              {turn.name.charAt(0)}
                            </div>
                            <div className={"flex-1 max-w-[85%] " + (isA ? "text-left" : "text-right")}>
                              <div className={"text-xs font-semibold mb-1 " + (isA ? "text-blue-600" : "text-emerald-600")} style={{ fontFamily: 'Tajawal, sans-serif' }}>
                                {turn.name}
                              </div>
                              <div className={"rounded-2xl px-4 py-2.5 cursor-pointer transition-colors hover:opacity-90 " + (isA ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800")}
                                onClick={() => speak(turn.zh)}
                              >
                                <div className="font-chinese-serif text-base font-medium">
                                  {turn.zh}
                                </div>
                                <div className={"text-xs mt-1 opacity-75 font-chinese-sans " + (isA ? "text-blue-100" : "text-gray-400")}>
                                  {turn.pinyin}
                                </div>
                                <div className={"text-xs mt-1 font-chinese-sans " + (isA ? "text-blue-100" : "text-gray-500")} style={{ fontFamily: 'Tajawal, sans-serif' }}>
                                  {turn.arabic}
                                </div>
                              </div>
                              <div className={"flex gap-1 mt-1 " + (isA ? "justify-start" : "justify-end")}>
                                <button
                                  className="p-1 rounded-full hover:bg-gray-100 text-gray-300 hover:text-blue-400 transition-colors"
                                  onClick={() => speak(turn.zh)}
                                >
                                  <Volume2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Tab 4: Key Sentences ──────────────────────── */}
          <TabsContent value="sentences" className="mt-6">
            <div className="space-y-3">
              {currentLesson.keySentences.map((sentence, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-gray-100 hover:border-blue-200"
                    onClick={() => speak(sentence.zh)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <button
                        className="p-2.5 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); speak(sentence.zh) }}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-chinese-serif text-lg font-semibold text-gray-800">
                          {sentence.zh}
                        </div>
                        <div className="text-sm text-gray-400 font-chinese-sans mt-0.5">
                          {sentence.pinyin}
                        </div>
                        <div className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                          {sentence.arabic}
                        </div>
                      </div>
                      {sentence.audioAvailable && (
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">
                          <Play className="h-3 w-3 ml-1" />
                          صوت
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Tab 5: Exercises ──────────────────────────── */}
          <TabsContent value="exercises" className="mt-6">
            {currentLesson.exercises.length === 0 ? (
              <div className="text-center py-12 text-gray-400" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                لا توجد تمارين لهذا الدرس بعد
              </div>
            ) : exFinished ? (
              /* Results Summary */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: exScore >= currentLesson.exercises.length * 0.7 ? '#DCFCE7' : '#FEF3C7' }}>
                  <Trophy className={"h-10 w-10 " + (exScore >= currentLesson.exercises.length * 0.7 ? "text-green-500" : "text-amber-500")} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    {exScore >= currentLesson.exercises.length * 0.7 ? "ممتاز! 🎉" : "استمر بالتدريب 💪"}
                  </h3>
                  <p className="text-gray-500 mt-2 text-lg" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    نتيجتك: <span className="font-bold" style={{ color }}>{exScore}</span> / {currentLesson.exercises.length}
                  </p>
                  <Progress value={(exScore / currentLesson.exercises.length) * 100} className="h-3 mt-4 max-w-xs mx-auto" />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button onClick={resetExercise} variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    إعادة التمارين
                  </Button>
                  <Button onClick={() => setActiveTab('vocab')} className="gap-2" style={{ backgroundColor: color }}>
                    <BookOpen className="h-4 w-4" />
                    مراجعة المفردات
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* Active Exercise */
              <motion.div
                key={exIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Progress bar */}
                <div className="flex items-center gap-3 text-sm text-gray-500" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                  <span>السؤال {exIdx + 1} من {currentLesson.exercises.length}</span>
                  <div className="flex-1">
                    <Progress value={((exIdx) / currentLesson.exercises.length) * 100} className="h-2" />
                  </div>
                  <span className="font-bold" style={{ color }}>
                    {exScore} نقطة
                  </span>
                </div>

                <Card className="border-0 shadow-md">
                  <CardContent className="p-6 space-y-6">
                    {/* Question */}
                    <div className="text-center space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {currentLesson.exercises[exIdx].type === 'multiple_choice' && "اختيار متعدد"}
                        {currentLesson.exercises[exIdx].type === 'fill_blank' && "املأ الفراغ"}
                        {currentLesson.exercises[exIdx].type === 'translate' && "ترجم"}
                        {currentLesson.exercises[exIdx].type === 'tone' && "النبرات"}
                      </Badge>
                      <h3 className="text-xl font-bold text-gray-800 font-chinese-serif leading-relaxed">
                        {currentLesson.exercises[exIdx].q}
                      </h3>
                    </div>

                    {/* Answer Area */}
                    {(currentLesson.exercises[exIdx].type === 'multiple_choice' || currentLesson.exercises[exIdx].type === 'tone') && currentLesson.exercises[exIdx].options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentLesson.exercises[exIdx].options!.map((opt, optIdx) => {
                          const isSelected = exAnswer === optIdx
                          const isCorrectOpt = exChecked && optIdx === currentLesson.exercises[exIdx].correct
                          const isWrongOpt = exChecked && isSelected && !exCorrect

                          let btnClass = "w-full p-4 rounded-xl text-right transition-all duration-200 border-2 text-sm font-medium "
                          if (isCorrectOpt) {
                            btnClass = btnClass + "bg-green-50 border-green-400 text-green-700"
                          } else if (isWrongOpt) {
                            btnClass = btnClass + "bg-red-50 border-red-400 text-red-700"
                          } else if (isSelected) {
                            btnClass = btnClass + "bg-blue-50 border-blue-400 text-blue-700"
                          } else {
                            btnClass = btnClass + "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                          }

                          let circleClass = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold "
                          if (isCorrectOpt) circleClass = circleClass + "bg-green-500 text-white"
                          else if (isWrongOpt) circleClass = circleClass + "bg-red-500 text-white"
                          else if (isSelected) circleClass = circleClass + "bg-blue-500 text-white"
                          else circleClass = circleClass + "bg-gray-200 text-gray-500"

                          let circleContent: React.ReactNode = String.fromCharCode(1571 + optIdx)
                          if (isCorrectOpt) circleContent = <Check className="h-3 w-3" />
                          else if (isWrongOpt) circleContent = <X className="h-3 w-3" />

                          return (
                            <button
                              key={optIdx}
                              className={btnClass}
                              disabled={exChecked}
                              onClick={() => setExAnswer(optIdx)}
                            >
                              <span className="flex items-center gap-2">
                                <span className={circleClass}>
                                  {circleContent}
                                </span>
                                <span className="flex-1 font-chinese-sans">{opt}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {(currentLesson.exercises[exIdx].type === 'fill_blank' || currentLesson.exercises[exIdx].type === 'translate') && (
                      <div className="space-y-3">
                        <Input
                          value={exInput}
                          onChange={(e) => { setExInput(e.target.value); setExAnswer(e.target.value) }}
                          placeholder="اكتب إجابتك هنا..."
                          disabled={exChecked}
                          className={"text-lg text-center font-chinese-sans " + (exChecked ? (exCorrect ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50") : "")}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !exChecked && exInput.trim()) checkAnswer() }}
                        />
                        {exChecked && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={"text-sm text-center p-2 rounded-lg " + (exCorrect ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}
                            style={{ fontFamily: 'Tajawal, sans-serif' }}
                          >
                            {exCorrect ? "إجابة صحيحة! ✓" : ("الإجابة الصحيحة: " + currentLesson.exercises[exIdx].answer)}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-3">
                      {!exChecked ? (
                        <Button
                          onClick={checkAnswer}
                          disabled={
                            (currentLesson.exercises[exIdx].type === 'fill_blank' || currentLesson.exercises[exIdx].type === 'translate')
                              ? !exInput.trim()
                              : exAnswer === null
                          }
                          className="gap-2 min-w-[140px]"
                          style={{ backgroundColor: color }}
                        >
                          <Check className="h-4 w-4" />
                          تحقق
                        </Button>
                      ) : (
                        <Button
                          onClick={nextExercise}
                          className="gap-2 min-w-[140px]"
                          style={{ backgroundColor: color }}
                        >
                          {exIdx < currentLesson.exercises.length - 1 ? (
                            <><ChevronLeft className="h-4 w-4" /> التالي</>
                          ) : (
                            <><Trophy className="h-4 w-4" /> النتيجة</>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: Lesson List View
  // ═══════════════════════════════════════════════════════════
  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length
  const totalVocabLearned = lessons.reduce((sum, l) => sum + l.vocabularyIds.filter(id => learnedWords.includes(id)).length, 0)
  const totalVocab = lessons.reduce((sum, l) => sum + l.vocabularyIds.length, 0)

  return (
    <motion.div
      dir="rtl"
      initial="enter"
      animate="center"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600 text-white">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            الدروس
          </h2>
          <p className="text-sm text-gray-500" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            {lessons.length} درس — {completedCount} مكتمل
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{lessons.length}</div>
            <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>إجمالي الدروس</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>دروس مكتملة</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{totalVocabLearned}</div>
            <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>كلمة تم حفظها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalVocab - totalVocabLearned}</div>
            <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>كلمة متبقية</div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {lessons.map((lesson, idx) => {
          const color = getLessonColor(lesson.id)
          const progress = getLessonProgress(lesson.id)
          const completed = isLessonCompleted(lesson.id)
          const active = isLessonActive(lesson.id)
          const wordCount = lesson.vocabularyIds.length

          let cardBorder = "border-gray-200 hover:border-blue-200"
          if (completed) cardBorder = "border-green-300 hover:border-green-400"
          if (active) cardBorder = "border-blue-400 shadow-md shadow-blue-100"

          return (
            <motion.div
              key={lesson.id}
              custom={idx}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
            >
              <Card
                className={"cursor-pointer transition-all duration-200 border-2 overflow-hidden relative " + cardBorder}
                onClick={() => setSelectedLesson(lesson.id)}
              >
                {/* Top color bar */}
                <div className="h-1.5" style={{ backgroundColor: color }} />

                <CardContent className="p-4">
                  {/* Number badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {lesson.id}
                    </div>
                    {completed && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {active && (
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-chinese-sans line-clamp-1">
                    {lesson.titleZh}
                  </p>

                  {/* Word count */}
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="h-3 w-3" />
                    <span>{wordCount} كلمة</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                        {progress}%
                      </span>
                      {completed && (
                        <span className="text-green-500 font-semibold" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                          مكتمل ✓
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: completed ? '#22C55E' : color }}
                        initial={{ width: 0 }}
                        animate={{ width: progress + '%' }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                      />
                    </div>
                  </div>

                  {/* Active glow effect */}
                  {active && (
                    <div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        boxShadow: "0 0 20px rgba(26, 95, 168, 0.15)",
                        borderRadius: 'inherit',
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
