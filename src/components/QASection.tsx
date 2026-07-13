'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useActiveLevel } from '@/lib/levels'
import { dailyQA2 } from '@/data/hsk2/qa2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  Volume2, HelpCircle, Play, Check, X, ArrowUpDown,
  GripVertical, RotateCcw, Lightbulb, Move, Eye, EyeOff,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Color Map ────────────────────────────────────────────────
// Using object mapping to avoid template literals in className
const colorMap: Record<string, {
  border: string
  bg: string
  bgLight: string
  text: string
  badgeBg: string
  badgeText: string
}> = {
  blue: {
    border: 'border-[var(--clr-info)]/40',
    bg: 'bg-[var(--clr-info-bg)]',
    bgLight: 'bg-[var(--clr-info-bg)]',
    text: 'text-[var(--clr-info)]',
    badgeBg: 'bg-[var(--clr-info-bg)]',
    badgeText: 'text-[var(--clr-info)]',
  },
  green: {
    border: 'border-[var(--clr-success)]/40',
    bg: 'bg-[var(--clr-success-bg)]',
    bgLight: 'bg-[var(--clr-success-bg)]',
    text: 'text-[var(--clr-success)]',
    badgeBg: 'bg-[var(--clr-success-bg)]',
    badgeText: 'text-[var(--clr-success)]',
  },
  purple: {
    border: 'border-[var(--clr-primary)]/40',
    bg: 'bg-[var(--clr-primary)]/10',
    bgLight: 'bg-[var(--clr-primary)]/10',
    text: 'text-[var(--clr-primary)]',
    badgeBg: 'bg-[var(--clr-primary)]/15',
    badgeText: 'text-[var(--clr-primary)]',
  },
  orange: {
    border: 'border-[var(--clr-energy)]/40',
    bg: 'bg-[var(--clr-energy-bg)]',
    bgLight: 'bg-[var(--clr-energy-bg)]',
    text: 'text-[var(--clr-energy)]',
    badgeBg: 'bg-[var(--clr-energy-bg)]',
    badgeText: 'text-[var(--clr-energy)]',
  },
  red: {
    border: 'border-[var(--clr-danger)]/40',
    bg: 'bg-[var(--clr-danger-bg)]',
    bgLight: 'bg-[var(--clr-danger-bg)]',
    text: 'text-[var(--clr-danger)]',
    badgeBg: 'bg-[var(--clr-danger-bg)]',
    badgeText: 'text-[var(--clr-danger)]',
  },
}

// ─── Daily QA Data ────────────────────────────────────────────
interface QAAnswer {
  zh: string
  pinyin: string
  arabic: string
}

interface QAQuestion {
  q: string
  pinyin: string
  arabic: string
  answers: QAAnswer[]
}

interface QACategory {
  category: string
  icon: string
  color: string
  questions: QAQuestion[]
}

const DEFAULT_DAILY_QA: QACategory[] = [
  {
    category: "🛒 في المتجر",
    icon: "🛒",
    color: "blue",
    questions: [
      {
        q: "这个多少钱？",
        pinyin: "Zhège duōshao qián?",
        arabic: "بكم هذا؟",
        answers: [
          { zh: "二十块钱", pinyin: "Èrshí kuài qián", arabic: "عشرون يواناً" },
        ],
      },
      {
        q: "有没有...？",
        pinyin: "Yǒu méiyǒu...?",
        arabic: "هل يوجد...؟",
        answers: [
          { zh: "有/没有", pinyin: "Yǒu/Méiyǒu", arabic: "يوجد/لا يوجد" },
        ],
      },
      {
        q: "可以便宜一点吗？",
        pinyin: "Kěyǐ piányí yīdiǎn ma?",
        arabic: "هل يمكن تخفيض السعر؟",
        answers: [
          { zh: "可以/不行", pinyin: "Kěyǐ/Bùxíng", arabic: "ممكن/لا يمكن" },
        ],
      },
      {
        q: "我要这个",
        pinyin: "Wǒ yào zhège",
        arabic: "أريد هذا",
        answers: [],
      },
      {
        q: "给我看看",
        pinyin: "Gěi wǒ kànkan",
        arabic: "أرني إياه",
        answers: [],
      },
    ],
  },
  {
    category: "🍜 في المطعم",
    icon: "🍜",
    color: "green",
    questions: [
      {
        q: "菜单在哪里？",
        pinyin: "Càidān zài nǎlǐ?",
        arabic: "أين القائمة؟",
        answers: [
          { zh: "在这里", pinyin: "Zài zhèlǐ", arabic: "هنا" },
        ],
      },
      {
        q: "我要一个...",
        pinyin: "Wǒ yào yī gè...",
        arabic: "أريد واحد من...",
        answers: [],
      },
      {
        q: "不辣的，谢谢",
        pinyin: "Bù là de, xièxie",
        arabic: "بدون حار، شكراً",
        answers: [],
      },
      {
        q: "买单！",
        pinyin: "Mǎidān!",
        arabic: "الحساب من فضلك!",
        answers: [],
      },
      {
        q: "好吃！",
        pinyin: "Hǎo chī!",
        arabic: "لذيذ!",
        answers: [],
      },
    ],
  },
  {
    category: "👋 التعارف",
    icon: "👋",
    color: "purple",
    questions: [
      {
        q: "你叫什么名字？",
        pinyin: "Nǐ jiào shénme míngzì?",
        arabic: "ما اسمك؟",
        answers: [
          { zh: "我叫...", pinyin: "Wǒ jiào...", arabic: "اسمي..." },
        ],
      },
      {
        q: "你是哪国人？",
        pinyin: "Nǐ shì nǎ guó rén?",
        arabic: "من أي بلد أنت؟",
        answers: [
          { zh: "我是也门人", pinyin: "Wǒ shì Yěmén rén", arabic: "أنا يمني" },
        ],
      },
      {
        q: "你多大了？",
        pinyin: "Nǐ duō dà le?",
        arabic: "كم عمرك؟",
        answers: [
          { zh: "我...岁", pinyin: "Wǒ...suì", arabic: "عمري ... سنة" },
        ],
      },
      {
        q: "你做什么工作？",
        pinyin: "Nǐ zuò shénme gōngzuò?",
        arabic: "ما عملك؟",
        answers: [
          { zh: "我是学生", pinyin: "Wǒ shì xuéshēng", arabic: "أنا طالب" },
        ],
      },
    ],
  },
  {
    category: "🚌 المواصلات",
    icon: "🚌",
    color: "orange",
    questions: [
      {
        q: "去...怎么走？",
        pinyin: "Qù...zěnme zǒu?",
        arabic: "كيف أذهب إلى...؟",
        answers: [
          { zh: "向左/右转", pinyin: "Xiàng zuǒ/yòu zhuǎn", arabic: "اتجه يساراً/يميناً" },
        ],
      },
      {
        q: "这里是哪里？",
        pinyin: "Zhèlǐ shì nǎlǐ?",
        arabic: "أين هذا المكان؟",
        answers: [],
      },
      {
        q: "多少钱一张票？",
        pinyin: "Duōshao qián yī zhāng piào?",
        arabic: "بكم التذكرة؟",
        answers: [],
      },
    ],
  },
  {
    category: "🆘 طلب المساعدة",
    icon: "🆘",
    color: "red",
    questions: [
      {
        q: "请问...在哪里？",
        pinyin: "Qǐngwèn...zài nǎlǐ?",
        arabic: "عذراً، أين يوجد...؟",
        answers: [],
      },
      {
        q: "我不明白",
        pinyin: "Wǒ bù míngbái",
        arabic: "لم أفهم",
        answers: [],
      },
      {
        q: "请再说一遍",
        pinyin: "Qǐng zài shuō yībiàn",
        arabic: "من فضلك أعد",
        answers: [],
      },
      {
        q: "你会说英语吗？",
        pinyin: "Nǐ huì shuō Yīngyǔ ma?",
        arabic: "هل تتكلم الإنجليزية؟",
        answers: [],
      },
      {
        q: "请写下来",
        pinyin: "Qǐng xiě xia lái",
        arabic: "من فضلك اكتبها",
        answers: [],
      },
    ],
  },
]

import { speak } from '@/lib/tts'

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
  const cleaned = sentence.replace(/[？？！!。，、؛：""''（）《》【】…—\s]/g, '')
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

// ─── Quiz question generator (quizzes over dailyQA categories) ──
function generateQuizQuestions(
  count: number = 10,
  allQ: Array<QAQuestion & { category: string; color: string }>,
  dailyQ: QACategory[],
) {
  const questions: Array<{
    questionZh: string;
    questionPinyin: string;
    questionAr: string;
    correctCategory: string;
    options: string[];
    correctIndex: number;
  }> = []

  const shuffled = shuffleArray(allQ).slice(0, count)

  for (const ex of shuffled) {
    const wrongOptions = dailyQ
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

// ─── Flashcard Practice Component ────────────────────────────
function FlashcardPractice({ question, category }: {
  question: QAQuestion
  category: string
}) {
  const [flipped, setFlipped] = useState(false)
  const hasAnswers = question.answers.length > 0

  return (
    <div className="mt-3 space-y-2">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {/* Flashcard */}
          <div
            className="relative w-full cursor-pointer perspective-1000"
            onClick={() => setFlipped(!flipped)}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front - Question */}
              <div
                className="w-full p-4 rounded-xl border-2 border-[var(--clr-info)]/30 bg-[var(--clr-info-bg)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--clr-info)]">السؤال</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); speak(question.q) }}
                  >
                    <Volume2 className="w-4 h-4 text-[var(--clr-info)]" />
                  </Button>
                </div>
                <p className="font-chinese-serif text-xl font-bold text-center my-3">
                  {question.q}
                </p>
                <p className="font-chinese-sans text-sm text-muted-foreground text-center">
                  {question.pinyin}
                </p>
                <p className="text-sm text-[var(--clr-info)] text-center mt-1 font-bold">
                  {question.arabic}
                </p>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  اضغط لقلب البطاقة {hasAnswers ? 'ورؤية الجواب' : ''}
                </p>
              </div>

              {/* Back - Answer */}
              <div
                className="w-full p-4 rounded-xl border-2 border-[var(--clr-success)]/30 bg-[var(--clr-success-bg)] absolute inset-0"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--clr-success)]">الجواب</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (question.answers.length > 0) speak(question.answers[0].zh)
                    }}
                  >
                    <Volume2 className="w-4 h-4 text-[var(--clr-success)]" />
                  </Button>
                </div>
                {hasAnswers ? (
                  <div className="space-y-2 my-3">
                    {question.answers.map((ans, i) => (
                      <div key={i} className="text-center space-y-1">
                        <p className="font-chinese-serif text-lg font-bold">{ans.zh}</p>
                        <p className="font-chinese-sans text-sm text-muted-foreground">{ans.pinyin}</p>
                        <p className="text-sm text-[var(--clr-success)] font-bold">{ans.arabic}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground my-6">لا يوجد جواب محدد لهذا السؤال</p>
                )}
                <p className="text-xs text-center text-muted-foreground mt-3">
                  اضغط للعودة
                </p>
              </div>
            </motion.div>
          </div>

          {/* Reset button */}
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              onClick={() => setFlipped(false)}
            >
              <RotateCcw className="w-3 h-3" />
              أعد البطاقة
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function QASection() {
  const { level } = useActiveLevel()
  const dailyQA = useMemo<QACategory[]>(
    () => (level === 1 ? DEFAULT_DAILY_QA : (dailyQA2 as unknown as QACategory[])),
    [level],
  )
  const allQuestions = useMemo(
    () => dailyQA.flatMap(cat => cat.questions.map(q => ({ category: cat.category, color: cat.color, ...q }))),
    [dailyQA],
  )
  // ─── State ──────────────────────────────────────────────────
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set())
  const [activeFlashcard, setActiveFlashcard] = useState<string | null>(null)

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

  // ─── Flashcard toggle ──────────────────────────────────────
  const toggleFlashcard = (key: string) => {
    setActiveFlashcard(prev => prev === key ? null : key)
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
    setQuizQuestions(generateQuizQuestions(10, allQuestions, dailyQA))
    setQuizCurrent(0)
    setQuizAnswer(null)
    setQuizScore(0)
    setQuizFinished(false)
    setQuizStarted(true)
    setQuizTimer(30)
  }, [allQuestions, dailyQA])

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

  // ─── Total questions count ──────────────────────────────────
  const totalQ = dailyQA.reduce((sum, cat) => sum + cat.questions.length, 0)

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="w-full space-y-6">

      {/* ─── Section Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <HelpCircle className="w-7 h-7 text-[var(--clr-info)]" />
          <h2 className="text-2xl font-bold">الأسئلة اليومية</h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          {totalQ} سؤالاً وعبارة صينية شائعة للمواقف اليومية مع الترجمة العربية والنطق
        </p>
        <div className="flex justify-center gap-2 flex-wrap mt-3">
          {dailyQA.map(cat => {
            const cm = colorMap[cat.color]
            return (
              <Badge key={cat.category} variant="outline" className={cm.badgeBg + " " + cm.badgeText + " gap-1 text-xs"}>
                <span>{cat.icon}</span>
                <span>{cat.questions.length}</span>
              </Badge>
            )
          })}
        </div>
      </motion.div>

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="patterns" className="text-xs sm:text-sm">
            <HelpCircle className="w-4 h-4 ml-1 hidden sm:inline" />
            الأسئلة اليومية
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
            TAB 1: Daily Q&A Accordion
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
                  {dailyQA.map((cat, catIdx) => {
                    const cm = colorMap[cat.color]

                    return (
                      <AccordionItem
                        key={cat.category}
                        value={cat.category}
                        className="border-b last:border-b-0"
                      >
                        <AccordionTrigger className={"px-4 sm:px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors " + cm.bgLight}>
                          <div className="flex items-center gap-3 text-right">
                            <span className="text-lg sm:text-xl font-bold">
                              {cat.category}
                            </span>
                            <Badge className={"text-xs " + cm.badgeBg + " " + cm.badgeText}>
                              {cat.questions.length} {cat.questions.length === 1 ? 'سؤال' : 'أسئلة'}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 sm:px-6 pb-4">
                          <div className="space-y-3">
                            {cat.questions.map((question, qIdx) => {
                              const answerKey = cat.category + "-" + qIdx
                              const flashcardKey = "fc-" + answerKey
                              const isRevealed = revealedAnswers.has(answerKey)
                              const hasAnswers = question.answers.length > 0
                              const isFlashcard = activeFlashcard === flashcardKey

                              return (
                                <motion.div
                                  key={answerKey}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: qIdx * 0.05, duration: 0.3 }}
                                  className={"rounded-xl border-2 p-4 transition-shadow hover:shadow-md " + cm.border + " " + cm.bg}
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
                                      <p className={"text-sm font-bold " + cm.text}>
                                        {question.arabic}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0 mt-1"
                                      onClick={() => speak(question.q)}
                                    >
                                      <Volume2 className={"w-4 h-4 " + cm.text} />
                                    </Button>
                                  </div>

                                  {/* Action buttons row */}
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {/* Show answer button */}
                                    {hasAnswers && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={"gap-2 text-xs " + cm.border + " " + cm.text}
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
                                    )}

                                    {/* Flashcard practice button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={"gap-2 text-xs border-[var(--clr-primary)]/40 text-[var(--clr-primary)] hover:bg-[var(--clr-primary)]/10"}
                                      onClick={() => toggleFlashcard(flashcardKey)}
                                    >
                                      <Lightbulb className="w-3.5 h-3.5" />
                                      تدرب على هذا السؤال
                                    </Button>
                                  </div>

                                  {/* Answers reveal */}
                                  {hasAnswers && (
                                    <AnimatePresence>
                                      {isRevealed && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="overflow-hidden"
                                        >
                                          <div className={"rounded-lg p-3 space-y-2 border-r-4 border-r-green-500 bg-[var(--clr-success-bg)]"}>
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-bold text-[var(--clr-success)] flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                الإجابة
                                              </span>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => speak(question.answers[0].zh)}
                                              >
                                                <Volume2 className="w-3 h-3 text-[var(--clr-success)]" />
                                              </Button>
                                            </div>
                                            {question.answers.map((ans, aIdx) => (
                                              <div key={aIdx} className="flex items-start justify-between gap-2">
                                                <div className="space-y-0.5">
                                                  <p className="font-chinese-serif text-base font-bold leading-relaxed">
                                                    {ans.zh}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground font-chinese-sans">
                                                    {ans.pinyin}
                                                  </p>
                                                  <p className="text-sm text-[var(--clr-success)]">
                                                    {ans.arabic}
                                                  </p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  )}

                                  {/* Flashcard practice */}
                                  {isFlashcard && (
                                    <FlashcardPractice
                                      question={question}
                                      category={cat.category}
                                    />
                                  )}
                                </motion.div>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
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
                    <Move className="w-5 h-5 text-[var(--clr-info)]" />
                    <span className="font-bold">تمرين ترتيب الكلمات</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">
                      <Check className="w-3 h-3 text-[var(--clr-success)]" />
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
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--clr-info-bg)]">
                      <Move className="w-8 h-8 text-[var(--clr-info)]" />
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
                  <Badge className="text-sm px-3 py-1 bg-[var(--clr-info-bg)] text-[var(--clr-info)] border-[var(--clr-info)]/40">
                    {dndCategory}
                  </Badge>
                </div>

                {/* Target sentence (shown after check if wrong) */}
                {dndChecked && !dndCorrect && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-[var(--clr-danger-bg)] border border-[var(--clr-danger)]/30 space-y-1"
                  >
                    <p className="text-xs text-[var(--clr-danger)] font-bold">الجملة الصحيحة:</p>
                    <p className="font-chinese-serif text-lg">{dndSentence}</p>
                  </motion.div>
                )}

                {/* Drop zone */}
                <Card
                  className={(
                    dndChecked
                      ? dndCorrect
                        ? 'min-h-20 transition-all shadow-sm border-2 border-[var(--clr-success)] bg-[var(--clr-success-bg)]'
                        : 'min-h-20 transition-all shadow-sm border-2 border-[var(--clr-danger)]'
                      : 'min-h-20 transition-all shadow-sm border-2 border-dashed border-muted-foreground/30'
                  )}
                >
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      <GripVertical className="w-3 h-3 inline ml-1" />
                      اسحب الكلمات هنا بالترتيب الصحيح
                    </p>
                    <div
                      ref={dndDropRef}
                      className="flex flex-wrap gap-2 min-h-11 items-center"
                    >
                      {droppedWords.length === 0 && !dndChecked && (
                        <p className="text-sm text-muted-foreground/50 italic m-auto">
                          المنطقة فارغة...
                        </p>
                      )}
                      {droppedWords.map((word, idx) => (
                        <motion.div
                          key={"dropped-" + idx}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{ duration: 0.2 }}
                          draggable
                          onDragStart={(e) => handleDragStartDropped(e as any, idx)}
                          onDragOver={(e) => handleDragOverSlot(e, idx)}
                          onDragLeave={handleDragLeaveSlot}
                          onDrop={(e) => handleDropOnSlot(e, idx)}
                          className={(
                            'relative cursor-grab active:cursor-grabbing ' +
                            'px-3 py-2 rounded-lg border-2 text-base font-chinese-serif ' +
                            'select-none transition-colors ' +
                            (dndChecked ? 'pointer-events-none' : '') +
                            (dndChecked
                              ? dndCorrect
                                ? ' border-[var(--clr-success)] bg-[var(--clr-success-bg)]'
                                : ' border-[var(--clr-danger)] bg-[var(--clr-danger-bg)]'
                              : dndDragOverIdx === idx
                                ? ' border-[var(--clr-info)] bg-[var(--clr-info-bg)]'
                                : ' border-[var(--clr-info)]/30 bg-[var(--surface-card)]'
                            )
                          )}
                        >
                          <span>{word}</span>
                          {!dndChecked && (
                            <button
                              className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[var(--clr-danger-bg)] text-[var(--clr-danger)] flex items-center justify-center text-xs hover:bg-[var(--clr-danger-bg)] transition-colors"
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
                            key={"source-" + idx}
                            layout
                            animate={{
                              opacity: isUsedInPool ? 0.3 : 1,
                              scale: isUsedInPool ? 0.95 : 1,
                            }}
                            whileHover={!isUsedInPool ? { scale: 1.05 } : {}}
                            whileTap={!isUsedInPool ? { scale: 0.95 } : {}}
                            draggable={!isUsedInPool}
                            onDragStart={(e) => !isUsedInPool && handleDragStartSource(e as any, idx)}
                            className={
                              'px-3 py-2 rounded-lg border-2 text-base font-chinese-serif ' +
                              'select-none transition-colors border-[var(--clr-info)]/30 bg-[var(--clr-info-bg)] ' +
                              (isUsedInPool ? 'opacity-30 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing')
                            }
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
                      className="p-3 rounded-lg bg-[var(--clr-success-bg)] border border-[var(--clr-success)]/30 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-[var(--clr-success)]">
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
                      className="p-3 rounded-lg bg-[var(--clr-danger-bg)] border border-[var(--clr-danger)]/30 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-[var(--clr-danger)]">
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
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--clr-info-bg)]">
                      <Lightbulb className="w-8 h-8 text-[var(--clr-info)]" />
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
                      <div className={
                        'w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ' +
                        (quizScore >= 8 ? 'bg-[var(--clr-success)]' : quizScore >= 5 ? 'bg-[var(--clr-warning)]' : 'bg-[var(--clr-danger)]')
                      }>
                        {quizScore}
                      </div>
                    </div>
                    <p className="font-bold text-xl">نتيجتك</p>
                    <p className="text-2xl font-bold">
                      {quizScore} / {quizQuestions.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {quizScore >= 8
                        ? 'ممتاز! أنت متمكّن من الأسئلة اليومية! 🌟'
                        : quizScore >= 5
                          ? 'جيد! واصل التمرين لتحسين مستواك 💪'
                          : 'لا بأس! راجع الأسئلة وحاول مرة أخرى 📚'}
                    </p>

                    {/* Score bar */}
                    <div className="w-full bg-muted rounded-full h-3 max-w-xs mx-auto">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: (quizScore / quizQuestions.length) * 100 + "%" }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={
                          'h-3 rounded-full ' +
                          (quizScore >= 8 ? 'bg-[var(--clr-success)]' : quizScore >= 5 ? 'bg-[var(--clr-warning)]' : 'bg-[var(--clr-danger)]')
                        }
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
                          <Check className="w-3 h-3 text-[var(--clr-success)]" />
                          {quizScore}
                        </Badge>
                        {/* Timer */}
                        <Badge
                          variant={quizTimer <= 10 ? 'destructive' : 'outline'}
                          className={"gap-1 tabular-nums " + (quizTimer <= 5 ? 'animate-pulse' : '')}
                        >
                          ⏱ {quizTimer}s
                        </Badge>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300 bg-[var(--clr-info)]"
                        style={{
                          width: ((quizCurrent + 1) / quizQuestions.length) * 100 + "%",
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
                        <HelpCircle className="w-4 h-4 text-[var(--clr-info)]" />
                        ما التصنيف المناسب لهذا السؤال؟
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 p-3 rounded-lg bg-[var(--clr-info-bg)]">
                        <p className="font-chinese-serif text-lg font-bold">
                          {quizQuestions[quizCurrent].questionZh}
                        </p>
                        <p className="font-chinese-sans text-sm text-muted-foreground">
                          {quizQuestions[quizCurrent].questionPinyin}
                        </p>
                        <p className="text-sm font-bold text-[var(--clr-info)]">
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
                              className={
                                'relative p-3 rounded-lg border-2 text-center transition-all text-sm ' +
                                (showResult
                                  ? isCorrect
                                    ? 'border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)]'
                                    : isSelected
                                      ? 'border-[var(--clr-danger)] bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]'
                                      : 'border-muted opacity-50'
                                  : 'border-muted hover:bg-muted/50'
                                )
                              }
                            >
                              {opt}
                              {showResult && isCorrect && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[var(--clr-success)] text-white flex items-center justify-center"
                                >
                                  <Check className="w-3 h-3" />
                                </motion.div>
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[var(--clr-danger)] text-white flex items-center justify-center"
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
                            className={
                              'p-3 rounded-lg text-center text-sm ' +
                              (quizAnswer === quizQuestions[quizCurrent].correctIndex
                                ? 'bg-[var(--clr-success-bg)] text-[var(--clr-success)]'
                                : 'bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]')
                            }
                          >
                            {quizAnswer === quizQuestions[quizCurrent].correctIndex
                              ? '✅ إجابة صحيحة! أحسنت!'
                              : '❌ إجابة خاطئة. التصنيف الصحيح هو: ' + quizQuestions[quizCurrent].correctCategory}
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
