'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  Volume2, HelpCircle, Play, Check, X, ArrowUpDown,
  GripVertical, RotateCcw, Lightbulb, ChevronDown, Move, Eye, EyeOff,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Accent Color ────────────────────────────────────────────────
const ACCENT = '#1A5FA8'
const ACCENT_BG = '#E8F0FA'

// ─── Practical Q&A Data ─────────────────────────────────────────
const practicalQA = [
  {
    category: "في المتجر 🛒",
    questions: [
      { q: "这个多少钱？", pinyin: "Zhège duōshao qián?", arabic: "بكم هذا؟", answer: "...块钱 / ...kuài qián", answerAr: "...يوان" },
      { q: "有没有...？", pinyin: "Yǒu méiyǒu...?", arabic: "هل يوجد...؟", answer: "有 Yǒu / 没有 Méiyǒu", answerAr: "يوجد / لا يوجد" },
      { q: "可以便宜一点吗？", pinyin: "Kěyǐ piányí yīdiǎn ma?", arabic: "هل يمكن تخفيض السعر؟", answer: "可以 / 不可以", answerAr: "ممكن / مش ممكن" },
    ]
  },
  {
    category: "في المطعم 🍜",
    questions: [
      { q: "菜单在哪里？", pinyin: "Càidān zài nǎlǐ?", arabic: "أين القائمة؟", answer: "在这里 Zài zhèlǐ", answerAr: "هنا" },
      { q: "我要这个", pinyin: "Wǒ yào zhège", arabic: "أريد هذا", answer: "好的 Hǎo de", answerAr: "حسناً" },
      { q: "不辣的，谢谢", pinyin: "Bù là de, xièxie", arabic: "بدون حار، شكراً", answer: "", answerAr: "" },
    ]
  },
  {
    category: "التعريف بالنفس 👋",
    questions: [
      { q: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzì?", arabic: "ما اسمك؟", answer: "我叫... Wǒ jiào...", answerAr: "اسمي..." },
      { q: "你是哪国人？", pinyin: "Nǐ shì nǎ guó rén?", arabic: "من أي بلد أنت؟", answer: "我是...人 Wǒ shì...rén", answerAr: "أنا من..." },
      { q: "你会说中文吗？", pinyin: "Nǐ huì shuō Zhōngwén ma?", arabic: "هل تتكلم الصينية؟", answer: "我在学 Wǒ zài xué", answerAr: "أنا أتعلم" },
    ]
  },
  {
    category: "طلب المساعدة 🆘",
    questions: [
      { q: "请问...在哪里？", pinyin: "Qǐngwèn...zài nǎlǐ?", arabic: "عذراً، أين يوجد...؟", answer: "在.../ 不知道", answerAr: "في... / لا أعرف" },
      { q: "我不明白", pinyin: "Wǒ bù míngbái", arabic: "لم أفهم", answer: "", answerAr: "" },
      { q: "请再说一遍", pinyin: "Qǐng zài shuō yībiàn", arabic: "من فضلك أعد مرة أخرى", answer: "", answerAr: "" },
    ]
  },
  {
    category: "المواصلات 🚌",
    questions: [
      { q: "去...怎么走？", pinyin: "Qù...zěnme zǒu?", arabic: "كيف أذهب إلى...؟", answer: "向左/右转 Turn left/right", answerAr: "اتجه يسار/يمين" },
      { q: "多少站？", pinyin: "Duōshao zhàn?", arabic: "كم محطة؟", answer: "...站 ...zhàn", answerAr: "... محطات" },
    ]
  },
  {
    category: "الصحة 🏥",
    questions: [
      { q: "我不舒服", pinyin: "Wǒ bù shūfu", arabic: "أنا لست بخير", answer: "", answerAr: "" },
      { q: "医院在哪里？", pinyin: "Yīyuàn zài nǎlǐ?", arabic: "أين المستشفى؟", answer: "", answerAr: "" },
    ]
  },
]

// ─── Flat all questions with category reference ──────────────────
const allQuestions = practicalQA.flatMap(cat =>
  cat.questions.map(q => ({ category: cat.category, ...q }))
)

// ─── TTS Helper ───────────────────────────────────────────────────
const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.7
    window.speechSynthesis.speak(u)
  }
}

// ─── Fisher-Yates Shuffle ─────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Split Chinese sentence into words ────────────────────────
function splitChineseWords(sentence: string): string[] {
  const cleaned = sentence.replace(/[？？！!。，、；：""''（）《》【】…—\s]/g, '')
  if (!cleaned) return []
  const words: string[] = []
  let i = 0
  while (i < cleaned.length) {
    if (i + 2 <= cleaned.length) {
      const twoChar = cleaned.substring(i, i + 2)
      words.push(twoChar)
      i += 2
    } else {
      words.push(cleaned[i])
      i += 1
    }
  }
  const particles = ['吗', '呢', '吧', '的', '了', '在', '是', '有', '不', '没', '很', '也', '都', '和', '个', '几', '人']
  const refined: string[] = []
  for (const w of words) {
    if (w.length === 2) {
      const second = w[1]
      if (particles.includes(second)) {
        refined.push(w[0])
        refined.push(second)
      } else {
        refined.push(w)
      }
    } else {
      refined.push(w)
    }
  }
  return refined
}

// ─── Quiz question generator (quizzes over practicalQA categories) ──
function generateQuizQuestions(count: number = 10) {
  const questions: Array<{
    questionZh: string;
    questionPinyin: string;
    questionAr: string;
    correctCategory: string;
    options: string[];
    correctIndex: number;
  }> = []

  const shuffled = shuffleArray(allQuestions).slice(0, count)

  for (const ex of shuffled) {
    const wrongOptions = practicalQA
      .filter(c => c.category !== ex.category)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.category)

    const options = shuffleArray([ex.category, ...wrongOptions])
    questions.push({
      questionZh: ex.q,
      questionPinyin: ex.pinyin,
      questionAr: ex.arabic,
      correctCategory: ex.category,
      options,
      correctIndex: options.indexOf(ex.category),
    })
  }

  return questions
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function QASection() {
  // ─── State ──────────────────────────────────────────────────
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set())

  // Drag & Drop state
  const [dndActive, setDndActive] = useState(false)
  const [dndSentence, setDndSentence] = useState<string | null>(null)
  const [dndCategory, setDndCategory] = useState<string | null>(null)
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [droppedWords, setDroppedWords] = useState<string[]>([])
  const [dndScore, setDndScore] = useState(0)
  const [dndTotal, setDndTotal] = useState(0)
  const [dndChecked, setDndChecked] = useState(false)
  const [dndCorrect, setDndCorrect] = useState(false)
  const [dndDragOverIdx, setDndDragOverIdx] = useState<number | null>(null)
  const dndDropRef = useRef<HTMLDivElement>(null)

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<ReturnType<typeof generateQuizQuestions>>([])
  const [quizCurrent, setQuizCurrent] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizTimer, setQuizTimer] = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Answer reveal toggle ───────────────────────────────────
  const toggleAnswer = (key: string) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // ─── Drag & Drop logic ──────────────────────────────────────
  const initDnDExercise = useCallback(() => {
    const randomQ = allQuestions[Math.floor(Math.random() * allQuestions.length)]
    const words = splitChineseWords(randomQ.q)
    const shuffled = shuffleArray(words)
    setDndSentence(randomQ.q)
    setDndCategory(randomQ.category)
    setShuffledWords(shuffled)
    setDroppedWords([])
    setDndChecked(false)
    setDndCorrect(false)
    setDndDragOverIdx(null)
    setDndActive(true)
  }, [])

  const checkDnDAnswer = useCallback(() => {
    const correct = droppedWords.join('') === (dndSentence?.replace(/[？？！!。，、؛：""''（）《》【】…—\s]/g, '') ?? '')
    setDndChecked(true)
    setDndCorrect(correct)
    setDndTotal(prev => prev + 1)
    if (correct) setDndScore(prev => prev + 1)
  }, [droppedWords, dndSentence])

  const handleDragStartSource = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'pool', index: idx, word: shuffledWords[idx] }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragStartDropped = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'dropped', index: idx, word: droppedWords[idx] }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropOnSlot = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (data.source === 'pool') {
        const newDropped = [...droppedWords]
        newDropped[slotIdx] = data.word
        setDroppedWords(newDropped)
      } else if (data.source === 'dropped') {
        const newDropped = [...droppedWords]
        ;[newDropped[data.index], newDropped[slotIdx]] = [newDropped[slotIdx], newDropped[data.index]]
        setDroppedWords(newDropped)
      }
    } catch { /* ignore */ }
    setDndDragOverIdx(null)
    setDndChecked(false)
  }

  const handleRemoveDropped = (idx: number) => {
    const newDropped = droppedWords.filter((_, i) => i !== idx)
    setDroppedWords(newDropped)
    setDndChecked(false)
  }

  const handleDragOverSlot = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDndDragOverIdx(idx)
  }

  const handleDragLeaveSlot = () => {
    setDndDragOverIdx(null)
  }

  // ─── Quiz logic ─────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    setQuizQuestions(generateQuizQuestions(10))
    setQuizCurrent(0)
    setQuizAnswer(null)
    setQuizScore(0)
    setQuizFinished(false)
    setQuizStarted(true)
    setQuizTimer(30)
  }, [])

  useEffect(() => {
    if (!quizStarted || quizFinished || quizAnswer !== null) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setQuizTimer(prev => {
        if (prev <= 1) {
          setQuizAnswer(-1)
          setTimeout(() => {
            if (quizCurrent < quizQuestions.length - 1) {
              setQuizCurrent(c => c + 1)
              setQuizAnswer(null)
              setQuizTimer(30)
            } else {
              setQuizFinished(true)
            }
          }, 1200)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [quizStarted, quizFinished, quizAnswer, quizCurrent, quizQuestions.length])

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return
    setQuizAnswer(idx)
    const current = quizQuestions[quizCurrent]
    if (idx === current.correctIndex) setQuizScore(prev => prev + 1)
    setTimeout(() => {
      if (quizCurrent < quizQuestions.length - 1) {
        setQuizCurrent(c => c + 1)
        setQuizAnswer(null)
        setQuizTimer(30)
      } else {
        setQuizFinished(true)
      }
    }, 1200)
  }

  useEffect(() => {
    if (quizAnswer !== null && timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [quizAnswer])

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div dir="rtl" className="w-full space-y-6">

      {/* ─── Section Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <HelpCircle className="w-7 h-7" style={{ color: ACCENT }} />
          <h2 className="text-2xl font-bold">أسئلة عملية للمحادثة</h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          أسئلة وعبارات صينية شائعة للمواقف اليومية مع الترجمة العربية والنطق
        </p>
      </motion.div>

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="patterns" className="text-xs sm:text-sm">
            <HelpCircle className="w-4 h-4 ml-1 hidden sm:inline" />
            الأسئلة العملية
          </TabsTrigger>
          <TabsTrigger value="exercise" className="text-xs sm:text-sm">
            <Move className="w-4 h-4 ml-1 hidden sm:inline" />
            ترتيب الكلمات
          </TabsTrigger>
          <TabsTrigger value="quiz" className="text-xs sm:text-sm">
            <Lightbulb className="w-4 h-4 ml-1 hidden sm:inline" />
            اختبار سريع
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════════════
            TAB 1: Practical Q&A Accordion
            ══════════════════════════════════════════════════════ */}
        <TabsContent value="patterns">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden shadow-md">
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {practicalQA.map((cat, catIdx) => (
                    <AccordionItem
                      key={cat.category}
                      value={cat.category}
                      className="border-b last:border-b-0"
                    >
                      <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-lg sm:text-xl font-bold" style={{ color: ACCENT }}>
                            {cat.category}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: ACCENT_BG, color: ACCENT }}
                          >
                            {cat.questions.length} {cat.questions.length === 1 ? 'سؤال' : 'أسئلة'}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-6 pb-4">
                        <div className="space-y-3">
                          {cat.questions.map((question, qIdx) => {
                            const answerKey = `${catIdx}-${qIdx}`
                            const isRevealed = revealedAnswers.has(answerKey)
                            const hasAnswer = question.answer !== ''

                            return (
                              <motion.div
                                key={answerKey}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: qIdx * 0.05, duration: 0.3 }}
                                className="rounded-xl border p-4 transition-shadow hover:shadow-md"
                                style={{
                                  borderColor: isRevealed ? ACCENT + '40' : undefined,
                                  backgroundColor: isRevealed ? ACCENT_BG + '40' : undefined,
                                }}
                              >
                                {/* Question row */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1 flex-1">
                                    <p className="font-chinese-serif text-xl sm:text-2xl font-bold leading-relaxed">
                                      {question.q}
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-chinese-sans">
                                      {question.pinyin}
                                    </p>
                                    <p className="text-sm font-bold" style={{ color: ACCENT }}>
                                      {question.arabic}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 mt-1"
                                    onClick={() => speak(question.q)}
                                  >
                                    <Volume2 className="w-4 h-4" style={{ color: ACCENT }} />
                                  </Button>
                                </div>

                                {/* Answer toggle button */}
                                {hasAnswer && (
                                  <div className="mt-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2 text-xs"
                                      style={{
                                        borderColor: ACCENT + '40',
                                        color: ACCENT,
                                      }}
                                      onClick={() => toggleAnswer(answerKey)}
                                    >
                                      {isRevealed ? (
                                        <>
                                          <EyeOff className="w-3.5 h-3.5" />
                                          إخفاء الجواب
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="w-3.5 h-3.5" />
                                          أظهر الجواب
                                        </>
                                      )}
                                    </Button>

                                    <AnimatePresence>
                                      {isRevealed && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="overflow-hidden"
                                        >
                                          <div
                                            className="rounded-lg p-3 space-y-1 border-r-4"
                                            style={{
                                              backgroundColor: ACCENT_BG + '60',
                                              borderRightColor: ACCENT,
                                            }}
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                الإجابة
                                              </span>
                                              {question.answer && (
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => speak(question.answer)}
                                                >
                                                  <Volume2 className="w-3 h-3" />
                                                </Button>
                                              )}
                                            </div>
                                            <p className="font-chinese-serif text-base font-bold leading-relaxed">
                                              {question.answer}
                                            </p>
                                            <p className="text-sm text-green-700">
                                              {question.answerAr}
                                            </p>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════
            TAB 2: Drag & Drop Exercise
            ══════════════════════════════════════════════════════ */}
        <TabsContent value="exercise">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Exercise header */}
            <Card className="shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Move className="w-5 h-5" style={{ color: ACCENT }} />
                    <span className="font-bold">تمرين ترتيب الكلمات</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      {dndScore}
                    </Badge>
                    <span className="text-sm text-muted-foreground">/</span>
                    <Badge variant="outline" className="gap-1">
                      <ArrowUpDown className="w-3 h-3" />
                      {dndTotal}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={initDnDExercise}
                      className="gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      سؤال جديد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            {!dndActive && (
              <Card className="text-center shadow-md">
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: ACCENT_BG }}
                    >
                      <Move className="w-8 h-8" style={{ color: ACCENT }} />
                    </div>
                  </div>
                  <p className="font-bold text-lg">تمرين ترتيب الكلمات</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    سيظهر لك سؤال صيني مقسّم لكلمات. اسحب الكلمات وأفلتها بالترتيب الصحيح
                    لتكوين الجملة الكاملة.
                  </p>
                  <Button onClick={initDnDExercise} className="gap-2">
                    <Play className="w-4 h-4" />
                    ابدأ التمرين
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Active exercise */}
            {dndActive && dndSentence && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Category info */}
                <div className="flex items-center gap-2">
                  <Badge
                    className="text-sm px-3 py-1"
                    style={{
                      backgroundColor: ACCENT_BG,
                      color: ACCENT,
                      borderColor: ACCENT + '40',
                    }}
                  >
                    {dndCategory}
                  </Badge>
                </div>

                {/* Target sentence (shown after check if wrong) */}
                {dndChecked && !dndCorrect && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-1"
                  >
                    <p className="text-xs text-red-500 font-bold">الجملة الصحيحة:</p>
                    <p className="font-chinese-serif text-lg">{dndSentence}</p>
                  </motion.div>
                )}

                {/* Drop zone */}
                <Card
                  className={`min-h-[80px] transition-all shadow-sm ${
                    dndChecked
                      ? dndCorrect
                        ? 'border-green-500 border-2 bg-green-50'
                        : 'border-red-500 border-2'
                      : 'border-dashed border-2 border-muted-foreground/30'
                  }`}
                >
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      <GripVertical className="w-3 h-3 inline ml-1" />
                      اسحب الكلمات هنا بالترتيب الصحيح
                    </p>
                    <div
                      ref={dndDropRef}
                      className="flex flex-wrap gap-2 min-h-[44px] items-center"
                    >
                      {droppedWords.length === 0 && !dndChecked && (
                        <p className="text-sm text-muted-foreground/50 italic m-auto">
                          المنطقة فارغة...
                        </p>
                      )}
                      {droppedWords.map((word, idx) => (
                        <motion.div
                          key={`dropped-${idx}`}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            borderColor: dndDragOverIdx === idx
                              ? ACCENT
                              : dndChecked
                                ? dndCorrect
                                  ? '#22c55e'
                                  : '#ef4444'
                                : ACCENT + '50',
                          }}
                          transition={{ duration: 0.2 }}
                          draggable
                          onDragStart={(e) => handleDragStartDropped(e, idx)}
                          onDragOver={(e) => handleDragOverSlot(e, idx)}
                          onDragLeave={handleDragLeaveSlot}
                          onDrop={(e) => handleDropOnSlot(e, idx)}
                          className={`
                            relative cursor-grab active:cursor-grabbing
                            px-3 py-2 rounded-lg border-2 text-base font-chinese-serif
                            select-none transition-colors
                            ${dndChecked ? 'pointer-events-none' : ''}
                          `}
                        >
                          <span>{word}</span>
                          {!dndChecked && (
                            <button
                              className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs hover:bg-red-200 transition-colors"
                              onClick={() => handleRemoveDropped(idx)}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                      {droppedWords.length < shuffledWords.length && !dndChecked && (
                        <div
                          className="w-16 h-10 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center"
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            try {
                              const data = JSON.parse(e.dataTransfer.getData('text/plain'))
                              if (data.source === 'pool') {
                                setDroppedWords(prev => [...prev, data.word])
                              }
                            } catch { /* ignore */ }
                          }}
                        >
                          <span className="text-xs text-muted-foreground/30">+</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Source words pool */}
                <Card className="shadow-sm">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-2">الكلمات المتاحة:</p>
                    <div className="flex flex-wrap gap-2">
                      {shuffledWords.map((word, idx) => {
                        const wordIndexInPool = shuffledWords
                          .slice(0, idx + 1)
                          .filter(w => w === word).length
                        const wordIndexInDropped = droppedWords.filter(w => w === word).length
                        const isUsedInPool = wordIndexInDropped >= wordIndexInPool

                        return (
                          <motion.div
                            key={`source-${idx}`}
                            layout
                            animate={{
                              opacity: isUsedInPool ? 0.3 : 1,
                              scale: isUsedInPool ? 0.95 : 1,
                            }}
                            whileHover={!isUsedInPool ? { scale: 1.05 } : {}}
                            whileTap={!isUsedInPool ? { scale: 0.95 } : {}}
                            draggable={!isUsedInPool}
                            onDragStart={(e) => !isUsedInPool && handleDragStartSource(e, idx)}
                            className={`
                              px-3 py-2 rounded-lg border-2 text-base font-chinese-serif
                              select-none transition-colors
                              ${isUsedInPool ? 'opacity-30 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
                            `}
                            style={{
                              borderColor: ACCENT + '50',
                              backgroundColor: ACCENT + '08',
                            }}
                          >
                            {word}
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {!dndChecked ? (
                    <Button
                      className="flex-1 gap-2"
                      disabled={droppedWords.length < shuffledWords.length}
                      onClick={checkDnDAnswer}
                    >
                      <Check className="w-4 h-4" />
                      تحقق من الإجابة
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 gap-2"
                      onClick={initDnDExercise}
                    >
                      <RotateCcw className="w-4 h-4" />
                      السؤال التالي
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setDndScore(0)
                      setDndTotal(0)
                      initDnDExercise()
                    }}
                    title="إعادة تعيين النتيجة"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Success feedback */}
                <AnimatePresence>
                  {dndChecked && dndCorrect && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-lg bg-green-50 border border-green-200 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Check className="w-5 h-5" />
                        <span className="font-bold">أحسنت! إجابة صحيحة! 🎉</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 gap-1"
                        onClick={() => speak(dndSentence ?? '')}
                      >
                        <Volume2 className="w-3 h-3" />
                        استمع للجملة
                      </Button>
                    </motion.div>
                  )}
                  {dndChecked && !dndCorrect && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-lg bg-red-50 border border-red-200 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <X className="w-5 h-5" />
                        <span className="font-bold">ليس تماماً... حاول مرة أخرى!</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════
            TAB 3: Practice Quiz
            ══════════════════════════════════════════════════════ */}
        <TabsContent value="quiz">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {!quizStarted ? (
              /* ─── Quiz Start Screen ──────────────────────── */
              <Card className="text-center shadow-md">
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: ACCENT_BG }}
                    >
                      <Lightbulb className="w-8 h-8" style={{ color: ACCENT }} />
                    </div>
                  </div>
                  <p className="font-bold text-lg">اختبار التصنيف السريع</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    سيظهر لك سؤال بالصينية والترجمة العربية. اختر التصنيف الصحيح
                    من بين الخيارات المتاحة.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• 10 أسئلة عشوائية</p>
                      <p>• 30 ثانية لكل سؤال</p>
                      <p>• تابع نتيجتك في النهاية</p>
                    </div>
                  </div>
                  <Button onClick={startQuiz} className="gap-2">
                    <Play className="w-4 h-4" />
                    ابدأ الاختبار
                  </Button>
                </CardContent>
              </Card>
            ) : quizFinished ? (
              /* ─── Quiz Results ───────────────────────────── */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="text-center shadow-md">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex justify-center">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                          quizScore >= 8
                            ? 'bg-green-500'
                            : quizScore >= 5
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      >
                        {quizScore}
                      </div>
                    </div>
                    <p className="font-bold text-xl">نتيجتك</p>
                    <p className="text-2xl font-bold">
                      {quizScore} / {quizQuestions.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {quizScore >= 8
                        ? 'ممتاز! أنت متمكّن من الأسئلة العملية! 🌟'
                        : quizScore >= 5
                          ? 'جيد! واصل التمرين لتحسين مستواك 💪'
                          : 'لا بأس! راجع الأسئلة وحاول مرة أخرى 📚'}
                    </p>

                    {/* Score bar */}
                    <div className="w-full bg-muted rounded-full h-3 max-w-xs mx-auto">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(quizScore / quizQuestions.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={`h-3 rounded-full ${
                          quizScore >= 8
                            ? 'bg-green-500'
                            : quizScore >= 5
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                    </div>

                    <div className="flex gap-2 justify-center">
                      <Button onClick={startQuiz} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        إعادة الاختبار
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizStarted(false)
                          setQuizFinished(false)
                        }}
                      >
                        رجوع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* ─── Active Quiz ────────────────────────────── */
              <motion.div
                key={quizCurrent}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Quiz progress */}
                <Card className="shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        السؤال {quizCurrent + 1} / {quizQuestions.length}
                      </span>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          {quizScore}
                        </Badge>
                        {/* Timer */}
                        <Badge
                          variant={quizTimer <= 10 ? 'destructive' : 'outline'}
                          className={`gap-1 tabular-nums ${quizTimer <= 5 ? 'animate-pulse' : ''}`}
                        >
                          ⏱ {quizTimer}s
                        </Badge>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${((quizCurrent + 1) / quizQuestions.length) * 100}%`,
                          backgroundColor: ACCENT,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Question */}
                {quizQuestions[quizCurrent] && (
                  <Card className="shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" style={{ color: ACCENT }} />
                        ما التصنيف المناسب لهذا السؤال؟
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 p-3 rounded-lg" style={{ backgroundColor: ACCENT_BG + '50' }}>
                        <p className="font-chinese-serif text-lg font-bold">
                          {quizQuestions[quizCurrent].questionZh}
                        </p>
                        <p className="font-chinese-sans text-sm text-muted-foreground">
                          {quizQuestions[quizCurrent].questionPinyin}
                        </p>
                        <p className="text-sm font-bold" style={{ color: ACCENT }}>
                          {quizQuestions[quizCurrent].questionAr}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {quizQuestions[quizCurrent].options.map((opt, idx) => {
                          const isSelected = quizAnswer === idx
                          const isCorrect = idx === quizQuestions[quizCurrent].correctIndex
                          const showResult = quizAnswer !== null

                          return (
                            <motion.button
                              key={opt}
                              whileHover={!showResult ? { scale: 1.03 } : {}}
                              whileTap={!showResult ? { scale: 0.97 } : {}}
                              onClick={() => handleQuizAnswer(idx)}
                              disabled={showResult}
                              className={`
                                relative p-3 rounded-lg border-2 text-center transition-all
                                text-sm
                                ${showResult
                                  ? isCorrect
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : isSelected
                                      ? 'border-red-500 bg-red-50 text-red-700'
                                      : 'border-muted opacity-50'
                                  : isSelected
                                    ? 'bg-opacity-5'
                                    : 'border-muted hover:bg-muted/50'
                                }
                              `}
                              style={!showResult ? {
                                borderColor: isSelected ? ACCENT : undefined,
                                backgroundColor: isSelected ? ACCENT_BG : undefined,
                              } : undefined}
                            >
                              {opt}
                              {showResult && isCorrect && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"
                                >
                                  <Check className="w-3 h-3" />
                                </motion.div>
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </motion.div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>

                      {/* Feedback */}
                      <AnimatePresence>
                        {quizAnswer !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`p-3 rounded-lg text-center text-sm ${
                              quizAnswer === quizQuestions[quizCurrent].correctIndex
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-500'
                            }`}
                          >
                            {quizAnswer === quizQuestions[quizCurrent].correctIndex
                              ? '✅ إجابة صحيحة! أحسنت!'
                              : `❌ إجابة خاطئة. التصنيف الصحيح هو: ${quizQuestions[quizCurrent].correctCategory}`}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
