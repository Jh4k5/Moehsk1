'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Volume2, HelpCircle, Play, Check, X, ArrowUpDown,
  GripVertical, RotateCcw, Lightbulb, ChevronLeft, ChevronRight, Move,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Question Pattern Data ────────────────────────────────────
const QA_PATTERNS: Record<string, {
  label_ar: string;
  label_zh: string;
  pattern: string;
  pattern_ar: string;
  color: string;
  examples: Array<{
    question_zh: string;
    question_pinyin: string;
    question_ar: string;
    answer_zh: string;
    answer_pinyin: string;
    answer_ar: string;
  }>;
}> = {
  "吗": {
    label_ar: "أسئلة نعم/لا",
    label_zh: "是非疑问句",
    pattern: "... + 吗？",
    pattern_ar: "أضف 吧 في نهاية الجملة لتحويلها لسؤال نعم/لا",
    color: "#E84C4C",
    examples: [
      { question_zh: "你是中国人吗？", question_pinyin: "Nǐ shì Zhōngguó rén ma?", question_ar: "هل أنت صيني؟", answer_zh: "是的，我是中国人。", answer_pinyin: "Shì de, wǒ shì Zhōngguó rén.", answer_ar: "نعم، أنا صيني." },
      { question_zh: "你有时间吗？", question_pinyin: "Nǐ yǒu shíjiān ma?", question_ar: "هل لديك وقت؟", answer_zh: "有，我有时间。", answer_pinyin: "Yǒu, wǒ yǒu shíjiān.", answer_ar: "نعم، لدي وقت." },
      { question_zh: "他是你的老师吗？", question_pinyin: "Tā shì nǐ de lǎoshī ma?", question_ar: "هل هو معلمك؟", answer_zh: "不是，他是我的同学。", answer_pinyin: "Bú shì, tā shì wǒ de tóngxué.", answer_ar: "لا، هو زميلي." },
    ]
  },
  "什么": {
    label_ar: "أسئلة ماذا/ما",
    label_zh: "询问事物",
    pattern: "什么 + 名词 / 动词 + 什么",
    pattern_ar: "ماذا تستخدم للسؤال عن الأشياء والأفعال",
    color: "#F5A623",
    examples: [
      { question_zh: "这是什么？", question_pinyin: "Zhè shì shénme?", question_ar: "ما هذا؟", answer_zh: "这是书。", answer_pinyin: "Zhè shì shū.", answer_ar: "هذا كتاب." },
      { question_zh: "你叫什么名字？", question_pinyin: "Nǐ jiào shénme míngzi?", question_ar: "ما اسمك؟", answer_zh: "我叫王明。", answer_pinyin: "Wǒ jiào Wáng Míng.", answer_ar: "اسمي وانغ مينغ." },
      { question_zh: "你想吃什么？", question_pinyin: "Nǐ xiǎng chī shénme?", question_ar: "ماذا تريد أن تأكل؟", answer_zh: "我想吃米饭。", answer_pinyin: "Wǒ xiǎng chī mǐfàn.", answer_ar: "أريد أن آكل الأرز." },
    ]
  },
  "几": {
    label_ar: "أسئلة كم (الأرقام الصغيرة)",
    label_zh: "询问数量（小数）",
    pattern: "几 + 量词 + 名词 / 几 + 点",
    pattern_ar: "كم تستخدم للأرقام الصغيرة (عادة أقل من 10)",
    color: "#27AE60",
    examples: [
      { question_zh: "现在几点？", question_pinyin: "Xiànzài jǐ diǎn?", question_ar: "كم الساعة الآن؟", answer_zh: "现在三点半。", answer_pinyin: "Xiànzài sān diǎn bàn.", answer_ar: "الآن الثالثة والنصف." },
      { question_zh: "你家有几口人？", question_pinyin: "Nǐ jiā yǒu jǐ kǒu rén?", question_ar: "كم عدد أفراد عائلتك؟", answer_zh: "我家有五口人。", answer_pinyin: "Wǒ jiā yǒu wǔ kǒu rén.", answer_ar: "عائلتي من خمسة أشخاص." },
    ]
  },
  "多少": {
    label_ar: "أسئلة كم (الأرقام الكبيرة + الأسعار)",
    label_zh: "询问数量（大数）和价格",
    pattern: "多少 + 名词 / 多少 + 钱",
    pattern_ar: "كم تستخدم للأرقام الكبيرة والأسعار",
    color: "#9B59B6",
    examples: [
      { question_zh: "这个多少钱？", question_pinyin: "Zhège duōshao qián?", question_ar: "بكم هذا؟", answer_zh: "这个五十块。", answer_pinyin: "Zhège wǔshí kuài.", answer_ar: "هذا بخمسين يوان." },
      { question_zh: "你有多少本书？", question_pinyin: "Nǐ yǒu duōshao běn shū?", question_ar: "كم كتاباً لديك؟", answer_zh: "我有一百多本书。", answer_pinyin: "Wǒ yǒu yì bǎi duō běn shū.", answer_ar: "لدي أكثر من مئة كتاب." },
    ]
  },
  "哪儿/哪里": {
    label_ar: "أسئلة أين",
    label_zh: "询问地点",
    pattern: "在 + 哪儿/哪里",
    pattern_ar: "أين/أينما تستخدم للسؤال عن المكان",
    color: "#3498DB",
    examples: [
      { question_zh: "你住在哪儿？", question_pinyin: "Nǐ zhù zài nǎr?", question_ar: "أين تسكن؟", answer_zh: "我住在北京。", answer_pinyin: "Wǒ zhù zài Běijīng.", answer_ar: "أسكن في بكين." },
      { question_zh: "超市在哪里？", question_pinyin: "Chāoshì zài nǎlǐ?", question_ar: "أين السوبرماركت؟", answer_zh: "超市在前边。", answer_pinyin: "Chāoshì zài qiánbiān.", answer_ar: "السوبرماركت في الأمام." },
    ]
  },
  "怎么": {
    label_ar: "أسئلة كيف",
    label_zh: "询问方式",
    pattern: "怎么 + 动词",
    pattern_ar: "كيف تستخدم للسؤال عن الطريقة",
    color: "#E67E22",
    examples: [
      { question_zh: "你怎么来学校的？", question_pinyin: "Nǐ zěnme lái xuéxiào de?", question_ar: "كيف أتيت إلى المدرسة؟", answer_zh: "我坐公共汽车来的。", answer_pinyin: "Wǒ zuò gōnggòng qìchē lái de.", answer_ar: "أتيت بالحافلة." },
      { question_zh: "这个字怎么读？", question_pinyin: "Zhège zì zěnme dú?", question_ar: "كيف يُنطق هذا الحرف؟", answer_zh: "这个字读'好'，hǎo。", answer_pinyin: "Zhège zì dú 'hǎo'.", answer_ar: "هذا الحرف يُنطق 'هاو'." },
    ]
  },
  "حياة": {
    label_ar: "أسئلة الحياة اليومية",
    label_zh: "日常用语",
    pattern: "تحيات / مطاعم / تسوق / صحة",
    pattern_ar: "أسئلة شائعة في الحياة اليومية مع الإجابات",
    color: "#1CB0F6",
    examples: [
      { question_zh: "你好吗？", question_pinyin: "Nǐ hǎo ma?", question_ar: "كيف حالك؟", answer_zh: "我很好，谢谢。你呢？", answer_pinyin: "Wǒ hěn hǎo, xièxie. Nǐ ne?", answer_ar: "أنا بخير، شكراً. وأنت؟" },
      { question_zh: "请问，这个多少钱？", question_pinyin: "Qǐngwèn, zhège duōshao qián?", question_ar: "عفواً، بكم هذا؟", answer_zh: "这个二十块钱。", answer_pinyin: "Zhège èrshí kuài qián.", answer_ar: "هذا بعشرين يوان." },
      { question_zh: "你想吃什么？", question_pinyin: "Nǐ xiǎng chī shénme?", question_ar: "ماذا تريد أن تأكل؟", answer_zh: "我想吃米饭和菜。", answer_pinyin: "Wǒ xiǎng chī mǐfàn hé cài.", answer_ar: "أريد أن آكل أرز وخضار." },
      { question_zh: "请问，洗手间在哪儿？", question_pinyin: "Qǐngwèn, xǐshǒujiān zài nǎr?", question_ar: "عفواً، أين الحمام؟", answer_zh: "洗手间在那边。", answer_pinyin: "Xǐshǒujiān zài nà biān.", answer_ar: "الحمام هناك." },
      { question_zh: "今天天气怎么样？", question_pinyin: "Jīntiān tiānqì zěnmeyàng?", question_ar: "كيف الطقس اليوم؟", answer_zh: "今天天气很好，不下雨。", answer_pinyin: "Jīntiān tiānqì hěn hǎo, bú xiàyǔ.", answer_ar: "الطقس اليوم جيد، لا تمطر." },
      { question_zh: "你几点起床？", question_pinyin: "Nǐ jǐ diǎn qǐchuáng?", question_ar: "متى تستيقظ؟", answer_zh: "我早上七点起床。", answer_pinyin: "Wǒ zǎoshang qī diǎn qǐchuáng.", answer_ar: "أستيقظ السابعة صباحاً." },
      { question_zh: "这件衣服有没有大号的？", question_pinyin: "Zhè jiàn yīfu yǒu méiyǒu dà hào de?", question_ar: "هل هذا الملابس متوفر بمقاس كبير؟", answer_zh: "有，这件有大号的。", answer_pinyin: "Yǒu, zhè jiàn yǒu dà hào de.", answer_ar: "نعم، هذا متوفر بمقاس كبير." },
      { question_zh: "对不起，我迟到了。", question_pinyin: "Duìbuqǐ, wǒ chídào le.", question_ar: "آسف، أنا متأخر.", answer_zh: "没关系，请坐。", answer_pinyin: "Méi guānxi, qǐng zuò.", answer_ar: "لا بأس، تفضل بالجلوس." },
    ]
  },
}

// ─── Pattern keys for iteration ───────────────────────────────
const PATTERN_KEYS = Object.keys(QA_PATTERNS)

// ─── TTS Helper ───────────────────────────────────────────────
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
  // Remove punctuation for splitting, then re-add
  const cleaned = sentence.replace(/[？？！!。，、；：""''（）《》【】…—\s]/g, '')
  // Common HSK1 word segments
  if (!cleaned) return []
  const words: string[] = []
  let i = 0
  while (i < cleaned.length) {
    // Try to match 2-character words first, then 1
    if (i + 2 <= cleaned.length) {
      const twoChar = cleaned.substring(i, i + 2)
      words.push(twoChar)
      i += 2
    } else {
      words.push(cleaned[i])
      i += 1
    }
  }
  // If all 2-char splits, try to be smarter about common 1-char particles
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

// ─── Quiz question generator ──────────────────────────────────
function generateQuizQuestions(count: number = 10) {
  const questions: Array<{
    question_pinyin: string;
    question_ar: string;
    correctWord: string;
    options: string[];
    correctIndex: number;
  }> = []

  const allExamples = PATTERN_KEYS.flatMap(key => {
    const p = QA_PATTERNS[key]
    return p.examples.map(ex => ({ patternKey: key, ...ex }))
  })

  const shuffled = shuffleArray(allExamples).slice(0, count)

  for (const ex of shuffled) {
    const wrongOptions = PATTERN_KEYS
      .filter(k => k !== ex.patternKey)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = shuffleArray([ex.patternKey, ...wrongOptions])
    questions.push({
      question_pinyin: ex.question_pinyin,
      question_ar: ex.question_ar,
      correctWord: ex.patternKey,
      options,
      correctIndex: options.indexOf(ex.patternKey),
    })
  }

  return questions
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function QASection() {
  // ─── State ──────────────────────────────────────────────────
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [exampleIndex, setExampleIndex] = useState(0)

  // Drag & Drop state
  const [dndPatternKey, setDndPatternKey] = useState<string | null>(null)
  const [dndSentence, setDndSentence] = useState<string | null>(null)
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [droppedWords, setDroppedWords] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
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

  // ─── Pattern detail helpers ─────────────────────────────────
  const currentPattern = selectedPattern ? QA_PATTERNS[selectedPattern] : null
  const currentExamples = currentPattern?.examples ?? []
  const currentExample = currentExamples[exampleIndex]

  const handleFlip = (idx: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  // ─── Drag & Drop logic ──────────────────────────────────────
  const initDnDExercise = useCallback(() => {
    const patternKey = PATTERN_KEYS[Math.floor(Math.random() * PATTERN_KEYS.length)]
    const pattern = QA_PATTERNS[patternKey]
    const example = pattern.examples[Math.floor(Math.random() * pattern.examples.length)]
    const words = splitChineseWords(example.question_zh)
    const shuffled = shuffleArray(words)
    setDndPatternKey(patternKey)
    setDndSentence(example.question_zh)
    setShuffledWords(shuffled)
    setDroppedWords([])
    setDndChecked(false)
    setDndCorrect(false)
    setDraggedIndex(null)
    setDndDragOverIdx(null)
  }, [])

  const checkDnDAnswer = useCallback(() => {
    const correct = droppedWords.join('') === (dndSentence?.replace(/[？？！!。，、；：""''（）《》【】…—\s]/g, '') ?? '')
    setDndChecked(true)
    setDndCorrect(correct)
    setDndTotal(prev => prev + 1)
    if (correct) setDndScore(prev => prev + 1)
  }, [droppedWords, dndSentence])

  // Drag handlers for source words (shuffled pool)
  const handleDragStartSource = (e: React.DragEvent, idx: number) => {
    setDraggedIndex(idx)
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'pool', index: idx, word: shuffledWords[idx] }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragStartDropped = (e: React.DragEvent, idx: number) => {
    setDraggedIndex(idx)
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
        // Swap dropped words
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

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizFinished || quizAnswer !== null) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setQuizTimer(prev => {
        if (prev <= 1) {
          // Time's up
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

  // Reset quiz timer when answer changes
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
          <HelpCircle className="w-7 h-7 text-primary" />
          <h2 className="text-2xl font-bold">أنماط الأسئلة الصينية</h2>
          <span className="font-chinese-serif text-2xl text-muted-foreground">疑问句</span>
        </div>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          تعلّم كيف تطرح الأسئلة في الصينية من خلال ستة أنماط أساسية مع أمثلة وتمارين تفاعلية
        </p>
      </motion.div>

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="patterns" className="text-xs sm:text-sm">
            <HelpCircle className="w-4 h-4 ml-1 hidden sm:inline" />
            الأنماط
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
            TAB 1: Pattern Grid / Detail
            ══════════════════════════════════════════════════════ */}
        <TabsContent value="patterns">
          <AnimatePresence mode="wait">
            {!selectedPattern ? (
              /* ─── Pattern Grid ───────────────────────────── */
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {PATTERN_KEYS.map((key, i) => {
                  const p = QA_PATTERNS[key]
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                    >
                      <Card
                        className="cursor-pointer card-hover overflow-hidden"
                        style={{ borderRight: `4px solid ${p.color}` }}
                        onClick={() => {
                          setSelectedPattern(key)
                          setExampleIndex(0)
                          setFlippedCards(new Set())
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle
                              className="font-chinese-serif text-3xl"
                              style={{ color: p.color }}
                            >
                              {key}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {p.examples.length} {p.examples.length === 1 ? 'مثال' : 'أمثلة'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="font-bold text-sm">{p.label_ar}</p>
                          <p className="text-xs text-muted-foreground font-chinese-sans">
                            {p.label_zh}
                          </p>
                          <div
                            className="text-sm font-chinese-sans px-2 py-1 rounded"
                            style={{ backgroundColor: p.color + '15' }}
                          >
                            {p.pattern}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {p.pattern_ar}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              /* ─── Pattern Detail View ────────────────────── */
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Back button + header */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPattern(null)
                      setFlippedCards(new Set())
                    }}
                    className="gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    رجوع
                  </Button>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-chinese-serif text-2xl font-bold"
                      style={{ color: currentPattern?.color }}
                    >
                      {selectedPattern}
                    </span>
                    <span className="text-sm font-bold">{currentPattern?.label_ar}</span>
                    <span className="text-xs text-muted-foreground font-chinese-sans">
                      ({currentPattern?.label_zh})
                    </span>
                  </div>
                </div>

                {/* Pattern explanation card */}
                <Card
                  className="overflow-hidden"
                  style={{ borderRight: `4px solid ${currentPattern?.color}` }}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4" style={{ color: currentPattern?.color }} />
                      <span className="text-sm font-bold">القاعدة</span>
                    </div>
                    <div
                      className="text-lg font-chinese-sans px-3 py-2 rounded"
                      style={{ backgroundColor: currentPattern!.color + '15' }}
                    >
                      {currentPattern?.pattern}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentPattern?.pattern_ar}
                    </p>
                  </CardContent>
                </Card>

                {/* Example navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exampleIndex === 0}
                    onClick={() => {
                      setExampleIndex(prev => prev - 1)
                      setFlippedCards(new Set())
                    }}
                    className="gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {exampleIndex + 1} / {currentExamples.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exampleIndex === currentExamples.length - 1}
                    onClick={() => {
                      setExampleIndex(prev => prev + 1)
                      setFlippedCards(new Set())
                    }}
                    className="gap-1"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>

                {/* Example card with flip */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={exampleIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" style={{ color: currentPattern?.color }} />
                          السؤال
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Question */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-chinese-serif text-xl font-bold leading-relaxed">
                              {currentExample?.question_zh}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => speak(currentExample?.question_zh ?? '')}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground font-chinese-sans">
                            {currentExample?.question_pinyin}
                          </p>
                          <p className="text-sm font-bold" style={{ color: currentPattern?.color }}>
                            {currentExample?.question_ar}
                          </p>
                        </div>

                        {/* Answer flip card */}
                        <div
                          className="perspective-1000 cursor-pointer"
                          onClick={() => handleFlip(exampleIndex)}
                        >
                          <div
                            className={`relative w-full transition-transform duration-500 preserve-3d ${flippedCards.has(exampleIndex) ? 'rotate-y-180' : ''}`}
                          >
                            {/* Front - hidden answer */}
                            <div className="backface-hidden rounded-lg border-2 border-dashed p-4 text-center space-y-2"
                              style={{ borderColor: currentPattern?.color + '60' }}>
                              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Play className="w-5 h-5" />
                                <span className="text-sm">اضغط لكشف الإجابة</span>
                              </div>
                              <p className="text-xs text-muted-foreground">انقر هنا لرؤية الإجابة</p>
                            </div>
                            {/* Back - revealed answer */}
                            <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-lg border-2 p-4 space-y-2 bg-card"
                              style={{ borderColor: currentPattern?.color }}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-bold text-green-600">الإجابة</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    speak(currentExample?.answer_zh ?? '')
                                  }}
                                >
                                  <Volume2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="font-chinese-serif text-lg font-bold leading-relaxed">
                                {currentExample?.answer_zh}
                              </p>
                              <p className="text-sm text-muted-foreground font-chinese-sans">
                                {currentExample?.answer_pinyin}
                              </p>
                              <p className="text-sm text-green-600">
                                {currentExample?.answer_ar}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>

                {/* Example dots */}
                <div className="flex justify-center gap-2">
                  {currentExamples.map((_, i) => (
                    <button
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === exampleIndex ? 'scale-125' : ''
                      }`}
                      style={{
                        backgroundColor: i === exampleIndex
                          ? currentPattern?.color
                          : currentPattern?.color + '30'
                      }}
                      onClick={() => {
                        setExampleIndex(i)
                        setFlippedCards(new Set())
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Move className="w-5 h-5 text-primary" />
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
                      onClick={() => {
                        initDnDExercise()
                      }}
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
            {!dndPatternKey && (
              <Card className="text-center">
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Move className="w-8 h-8 text-primary" />
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
            {dndPatternKey && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Pattern info */}
                <div className="flex items-center gap-2">
                  <Badge
                    className="font-chinese-serif text-base px-3 py-1"
                    style={{
                      backgroundColor: QA_PATTERNS[dndPatternKey].color + '20',
                      color: QA_PATTERNS[dndPatternKey].color,
                      borderColor: QA_PATTERNS[dndPatternKey].color,
                    }}
                  >
                    {dndPatternKey}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {QA_PATTERNS[dndPatternKey].label_ar}
                  </span>
                </div>

                {/* Target sentence (hidden, shown after check if wrong) */}
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
                  className={`min-h-[80px] transition-all ${
                    dndChecked
                      ? dndCorrect
                        ? 'border-green-500 border-2 bg-green-50'
                        : 'border-red-500 border-2 animate-pulse-wrong'
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
                              ? QA_PATTERNS[dndPatternKey].color
                              : dndChecked
                                ? dndCorrect
                                  ? '#22c55e'
                                  : '#ef4444'
                                : QA_PATTERNS[dndPatternKey].color + '50',
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
                          style={{ borderColor: undefined }}
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
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-2">الكلمات المتاحة:</p>
                    <div className="flex flex-wrap gap-2">
                      {shuffledWords.map((word, idx) => {
                        const isUsed = droppedWords.includes(word) &&
                          droppedWords.filter(w => w === word).length >
                          shuffledWords.slice(0, idx).filter(w => w === word && droppedWords.includes(w)).length

                        // Better "isUsed" check: count occurrences in dropped vs pool up to this index
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
                              borderColor: QA_PATTERNS[dndPatternKey].color + '50',
                              backgroundColor: QA_PATTERNS[dndPatternKey].color + '08',
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
              <Card className="text-center">
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <p className="font-bold text-lg">اختبار الأنماط السريع</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    سيظهر لك سؤال بالبينيين والترجمة العربية. اختر كلمة السؤال الصحيحة
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
                <Card className="text-center">
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
                        ? 'ممتاز! أنت متمكّن من أنماط الأسئلة! 🌟'
                        : quizScore >= 5
                          ? 'جيد! واصل التمرين لتحسين مستواك 💪'
                          : 'لا بأس! راجع الأنماط وحاول مرة أخرى 📚'}
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
                <Card>
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
                        className="h-1.5 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${((quizCurrent + 1) / quizQuestions.length) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Question */}
                {quizQuestions[quizCurrent] && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        ما كلمة السؤال المناسبة؟
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                        <p className="font-chinese-sans text-sm">
                          {quizQuestions[quizCurrent].question_pinyin}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quizQuestions[quizCurrent].question_ar}
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
                                font-chinese-serif text-lg
                                ${showResult
                                  ? isCorrect
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : isSelected
                                      ? 'border-red-500 bg-red-50 text-red-700'
                                      : 'border-muted opacity-50'
                                  : isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                                }
                              `}
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
                              : `❌ إجابة خاطئة. الإجابة الصحيحة هي: ${quizQuestions[quizCurrent].correctWord}`}
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
