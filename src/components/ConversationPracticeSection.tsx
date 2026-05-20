'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Volume2, Mic, MicOff, ChevronLeft, ChevronRight, Play, MessageCircle,
  Star, RotateCcw, BookOpen, CheckCircle2, XCircle, Lightbulb, Users, Phone, MapPin
} from 'lucide-react'

// ─── Conversation Topic Data ─────────────────────────────────────────────────

interface AnswerTemplate {
  zh: string
  pinyin: string
  ar: string
}

interface ConversationTopic {
  id: string
  titleAr: string
  titleZh: string
  icon: React.ReactNode
  emoji: string
  question: string
  questionPinyin: string
  translation: string
  answers: AnswerTemplate[]
  difficulty: 'easy' | 'medium' | 'hard'
  difficultyLabel: string
  lessonRef: number
  gradient: string
  iconBg: string
}

const CONVERSATION_TOPICS: ConversationTopic[] = [
  {
    id: 'name',
    titleAr: 'السؤال عن الاسم',
    titleZh: '你叫什么名字',
    icon: <Users className="w-5 h-5" />,
    emoji: '👤',
    question: '你叫什么名字？',
    questionPinyin: 'Nǐ jiào shénme míngzi?',
    translation: 'ما اسمك؟',
    answers: [
      { zh: '我叫王明。', pinyin: 'Wǒ jiào Wáng Míng.', ar: 'اسمي وانغ مينغ.' },
      { zh: '我的名字是李华。', pinyin: 'Wǒ de míngzi shì Lǐ Huá.', ar: 'اسمي لي هوا.' },
      { zh: '我是阿里。', pinyin: 'Wǒ shì Ālǐ.', ar: 'أنا علي.' },
    ],
    difficulty: 'easy',
    difficultyLabel: 'سهل',
    lessonRef: 1,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'age',
    titleAr: 'السؤال عن العمر',
    titleZh: '你多大了',
    icon: <Star className="w-5 h-5" />,
    emoji: '🎂',
    question: '你多大了？',
    questionPinyin: 'Nǐ duō dà le?',
    translation: 'كم عمرك؟',
    answers: [
      { zh: '我二十岁。', pinyin: 'Wǒ èrshí suì.', ar: 'عمري عشرون سنة.' },
      { zh: '我今年十八岁。', pinyin: 'Wǒ jīnnián shíbā suì.', ar: 'عمري هذا العام ثماني عشرة سنة.' },
      { zh: '我十岁了。', pinyin: 'Wǒ shí suì le.', ar: 'عمري عشر سنوات.' },
    ],
    difficulty: 'easy',
    difficultyLabel: 'سهل',
    lessonRef: 3,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'date',
    titleAr: 'السؤال عن اليوم',
    titleZh: '今天几号',
    icon: <BookOpen className="w-5 h-5" />,
    emoji: '📅',
    question: '今天几号？/ 今天星期几？',
    questionPinyin: 'Jīntiān jǐ hào? / Jīntiān xīngqī jǐ?',
    translation: 'ما تاريخ اليوم؟ / ما يوم الأسبوع؟',
    answers: [
      { zh: '今天是三月十五号。', pinyin: 'Jīntiān shì sānyuè shíwǔ hào.', ar: 'اليوم هو الخامس عشر من مارس.' },
      { zh: '今天是星期一。', pinyin: 'Jīntiān shì xīngqīyī.', ar: 'اليوم هو الاثنين.' },
      { zh: '今天是星期六，不上课。', pinyin: 'Jīntiān shì xīngqīliù, bú shàng kè.', ar: 'اليوم هو السبت، لا يوجد درس.' },
    ],
    difficulty: 'medium',
    difficultyLabel: 'متوسط',
    lessonRef: 4,
    gradient: 'from-blue-500 to-cyan-600',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'time',
    titleAr: 'السؤال عن الوقت',
    titleZh: '现在几点了',
    icon: <Lightbulb className="w-5 h-5" />,
    emoji: '⏰',
    question: '现在几点了？',
    questionPinyin: 'Xiànzài jǐ diǎn le?',
    translation: 'كم الساعة الآن؟',
    answers: [
      { zh: '现在八点半。', pinyin: 'Xiànzài bā diǎn bàn.', ar: 'الآن الثامنة والنصف.' },
      { zh: '现在是下午三点。', pinyin: 'Xiànzài shì xiàwǔ sān diǎn.', ar: 'الآن الثالثة بعد الظهر.' },
      { zh: '快九点了。', pinyin: 'Kuài jiǔ diǎn le.', ar: 'ساعة تقريباً التاسعة.' },
    ],
    difficulty: 'medium',
    difficultyLabel: 'متوسط',
    lessonRef: 6,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    id: 'phone',
    titleAr: 'السؤال عن الهاتف',
    titleZh: '你的手机号是多少',
    icon: <Phone className="w-5 h-5" />,
    emoji: '📱',
    question: '你的手机号是多少？',
    questionPinyin: 'Nǐ de shǒujī hào shì duōshao?',
    translation: 'ما رقم هاتفك؟',
    answers: [
      { zh: '我的手机号是一三八零零一二三四五六。', pinyin: 'Wǒ de shǒujī hào shì yāo sān bā líng líng yāo èr sān sì wǔ liù.', ar: 'رقم هاتفي هو 138-0012-3456.' },
      { zh: '我的号码是一三九零一三八零零零零。', pinyin: 'Wǒ de hàomǎ shì yāo sān jiǔ líng yāo sān bā líng líng líng.', ar: 'رقمي هو 139-0138-0000.' },
    ],
    difficulty: 'hard',
    difficultyLabel: 'صعب',
    lessonRef: 4,
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 text-rose-600',
  },
  {
    id: 'nationality',
    titleAr: 'السؤال عن الجنسية',
    titleZh: '你是哪国人',
    icon: <MapPin className="w-5 h-5" />,
    emoji: '🌍',
    question: '你是哪国人？',
    questionPinyin: 'Nǐ shì nǎ guó rén?',
    translation: 'من أي بلد أنت؟ / ما جنسيتك؟',
    answers: [
      { zh: '我是中国人。', pinyin: 'Wǒ shì Zhōngguó rén.', ar: 'أنا صيني.' },
      { zh: '我是埃及人。', pinyin: 'Wǒ shì Āijí rén.', ar: 'أنا مصري.' },
      { zh: '我是沙特阿拉伯人。', pinyin: 'Wǒ shì Shātè ālābó rén.', ar: 'أنا سعودي.' },
    ],
    difficulty: 'easy',
    difficultyLabel: 'سهل',
    lessonRef: 2,
    gradient: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-100 text-teal-600',
  },
  {
    id: 'work',
    titleAr: 'السؤال عن العمل',
    titleZh: '你做什么工作',
    icon: <BookOpen className="w-5 h-5" />,
    emoji: '💼',
    question: '你做什么工作？',
    questionPinyin: 'Nǐ zuò shénme gōngzuò?',
    translation: 'ما هو عملك؟',
    answers: [
      { zh: '我是老师。', pinyin: 'Wǒ shì lǎoshī.', ar: 'أنا معلم.' },
      { zh: '我在公司工作。', pinyin: 'Wǒ zài gōngsī gōngzuò.', ar: 'أنا أعمل في شركة.' },
      { zh: '我是大学生，还没有工作。', pinyin: 'Wǒ shì dàxuéshēng, hái méiyǒu gōngzuò.', ar: 'أنا طالب جامعي، ليس لدي عمل بعد.' },
    ],
    difficulty: 'medium',
    difficultyLabel: 'متوسط',
    lessonRef: 2,
    gradient: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'location',
    titleAr: 'السؤال عن المكان',
    titleZh: '你家在哪儿',
    icon: <MapPin className="w-5 h-5" />,
    emoji: '📍',
    question: '你在哪儿？/ 你家在哪儿？',
    questionPinyin: 'Nǐ zài nǎr? / Nǐ jiā zài nǎr?',
    translation: 'أين أنت؟ / أين منزلك؟',
    answers: [
      { zh: '我在学校。', pinyin: 'Wǒ zài xuéxiào.', ar: 'أنا في المدرسة.' },
      { zh: '我家在北京。', pinyin: 'Wǒ jiā zài Běijīng.', ar: 'منزلي في بكين.' },
      { zh: '我在家里。', pinyin: 'Wǒ zài jiālǐ.', ar: 'أنا في المنزل.' },
    ],
    difficulty: 'easy',
    difficultyLabel: 'سهل',
    lessonRef: 5,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-100 text-cyan-600',
  },
  {
    id: 'weather',
    titleAr: 'السؤال عن الطقس',
    titleZh: '今天天气怎么样',
    icon: <Lightbulb className="w-5 h-5" />,
    emoji: '🌤️',
    question: '今天天气怎么样？',
    questionPinyin: 'Jīntiān tiānqì zěnmeyàng?',
    translation: 'كيف حال الطقس اليوم؟',
    answers: [
      { zh: '今天很好，不下雨。', pinyin: 'Jīntiān hěn hǎo, bù xiàyǔ.', ar: 'الجو جيد اليوم، لا تمطر.' },
      { zh: '今天很冷，下雪了。', pinyin: 'Jīntiān hěn lěng, xiàxuě le.', ar: 'الجو بارد اليوم، يتساقط الثلج.' },
      { zh: '今天太热了。', pinyin: 'Jīntiān tài rè le.', ar: 'الجو حار جداً اليوم.' },
    ],
    difficulty: 'easy',
    difficultyLabel: 'سهل',
    lessonRef: 10,
    gradient: 'from-sky-500 to-blue-500',
    iconBg: 'bg-sky-100 text-sky-600',
  },
  {
    id: 'price',
    titleAr: 'السؤال عن السعر',
    titleZh: '这个多少钱',
    icon: <Star className="w-5 h-5" />,
    emoji: '💰',
    question: '这个多少钱？',
    questionPinyin: 'Zhège duōshao qián?',
    translation: 'بكم هذا؟ / ما ثمن هذا؟',
    answers: [
      { zh: '这个五十块。', pinyin: 'Zhège wǔshí kuài.', ar: 'هذا بخمسين يوان.' },
      { zh: '这个苹果三块钱一斤。', pinyin: 'Zhège píngguǒ sān kuài qián yī jīn.', ar: 'هذه التفاحة بثلاثة يوان للكيلو.' },
      { zh: '太贵了，可以便宜一点儿吗？', pinyin: 'Tài guì le, kěyǐ piányi yìdiǎnr ma?', ar: 'غالي جداً، هل يمكن أن يكون أرخص قليلاً؟' },
    ],
    difficulty: 'medium',
    difficultyLabel: 'متوسط',
    lessonRef: 8,
    gradient: 'from-amber-500 to-yellow-600',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'family',
    titleAr: 'السؤال عن العائلة',
    titleZh: '你有几口人',
    icon: <Users className="w-5 h-5" />,
    emoji: '👨‍👩‍👧',
    question: '你家有几口人？',
    questionPinyin: 'Nǐ jiā yǒu jǐ kǒu rén?',
    translation: 'كم عدد أفراد عائلتك؟',
    answers: [
      { zh: '我家有五口人：爸爸、妈妈、哥哥、弟弟和我。', pinyin: 'Wǒ jiā yǒu wǔ kǒu rén: bàba, māma, gēge, dìdi hé wǒ.', ar: 'عائلتي من خمسة أشخاص: أبي وأمي وأخي الأكبر وأخي الأصغر وأنا.' },
      { zh: '我家有三口人。', pinyin: 'Wǒ jiā yǒu sān kǒu rén.', ar: 'عائلتي من ثلاثة أشخاص.' },
      { zh: '我有一个哥哥和一个妹妹。', pinyin: 'Wǒ yǒu yí ge gēge hé yí ge mèimei.', ar: 'لدي أخ أكبر وأخت صغرى.' },
    ],
    difficulty: 'medium',
    difficultyLabel: 'متوسط',
    lessonRef: 3,
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'hobbies',
    titleAr: 'السؤال عن الهوايات',
    titleZh: '你喜欢做什么',
    icon: <MessageCircle className="w-5 h-5" />,
    emoji: '🎯',
    question: '你喜欢做什么？',
    questionPinyin: 'Nǐ xǐhuan zuò shénme?',
    translation: 'ماذا تحب أن تفعل؟',
    answers: [
      { zh: '我喜欢看电影。', pinyin: 'Wǒ xǐhuan kàn diànyǐng.', ar: 'أحب مشاهدة الأفلام.' },
      { zh: '我喜欢读书和写字。', pinyin: 'Wǒ xǐhuan dúshū hé xiězì.', ar: 'أحب القراءة والكتابة.' },
      { zh: '我喜欢唱歌和跟朋友玩。', pinyin: 'Wǒ xǐhuan chànggē hé gēn péngyou wán.', ar: 'أحب الغناء واللعب مع الأصدقاء.' },
    ],
    difficulty: 'medium',
    difficultyLabel: 'متوسط',
    lessonRef: 7,
    gradient: 'from-indigo-500 to-violet-600',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
]

// ─── TTS Helper ───────────────────────────────────────────────────────────────

const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = 0.75
  u.pitch = 1
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

// ─── Levenshtein Distance for speech recognition ──────────────────────────────

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

// ─── Difficulty color helper ──────────────────────────────────────────────────

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'hard': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function getDifficultyStars(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 1
    case 'medium': return 2
    case 'hard': return 3
    default: return 1
  }
}

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

type ViewMode = 'browse' | 'detail' | 'practice'

export default function ConversationPracticeSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('browse')
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [expandedAnswer, setExpandedAnswer] = useState<number | null>(null)

  // Practice mode state
  const [practiceTopics, setPracticeTopics] = useState<ConversationTopic[]>([])
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [practiceScore, setPracticeScore] = useState(0)
  const [practiceFinished, setPracticeFinished] = useState(false)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [pronResult, setPronResult] = useState<{ score: number; spoken: string; color: string; msg: string } | null>(null)
  const recognitionRef = useRef<any>(null)

  // Check speech recognition support (lazy initializer to avoid SSR issues)
  const [pronSupported] = useState(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      return !!SR
    }
    return true
  })

  // ─── Start practice ─────────────────────────────────────────────────────
  const startPractice = useCallback((difficulty?: string) => {
    let topics = [...CONVERSATION_TOPICS]
    if (difficulty) {
      topics = topics.filter(t => t.difficulty === difficulty)
    }
    setPracticeTopics(shuffle(topics))
    setPracticeIndex(0)
    setPracticeScore(0)
    setPracticeFinished(false)
    setPracticeStarted(true)
    setShowAnswers(false)
    setPronResult(null)
  }, [])

  // ─── Start recording ────────────────────────────────────────────────────
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
      const current = practiceTopics[practiceIndex]
      const expected = current?.question.replace(/[？?！!。，、]/g, '') ?? ''

      for (let i = 0; i < results[0].length; i++) {
        const alt = results[0][i]
        const sim = similarity(alt.transcript, expected)
        if (sim > bestSim) { bestSim = sim; bestSpoken = alt.transcript }
      }

      setPronResult({
        score: bestSim,
        spoken: bestSpoken,
        color: bestSim >= 75 ? '#22c55e' : bestSim >= 50 ? '#f97316' : '#ef4444',
        msg: bestSim >= 75 ? 'ممتاز! نطقك رائع! 🎉' : bestSim >= 50 ? 'جيد! استمر بالتدريب 💪' : 'حاول مرة أخرى 🎧',
      })
      setIsRecording(false)

      if (bestSim >= 75) {
        setPracticeScore(s => s + 1)
      }
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [practiceTopics, practiceIndex])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsRecording(false)
  }, [])

  // ─── Next practice question ─────────────────────────────────────────────
  const nextPracticeQuestion = useCallback(() => {
    if (practiceIndex + 1 >= practiceTopics.length) {
      setPracticeFinished(true)
    } else {
      setPracticeIndex(i => i + 1)
      setShowAnswers(false)
      setPronResult(null)
    }
  }, [practiceIndex, practiceTopics.length])

  // ─── Open topic detail ──────────────────────────────────────────────────
  const openDetail = useCallback((topic: ConversationTopic) => {
    setSelectedTopic(topic)
    setShowAnswers(false)
    setExpandedAnswer(null)
    setViewMode('detail')
  }, [])

  // ─── Back to browse ─────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    setViewMode('browse')
    setSelectedTopic(null)
    setPracticeStarted(false)
    setPracticeFinished(false)
    setPronResult(null)
  }, [])

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5" dir="rtl">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-l from-rose-600 via-pink-600 to-rose-700 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <span className="text-4xl">💬</span>
              تمارين المحادثة
            </h2>
            <p className="text-rose-100 mt-1 text-sm sm:text-base">
              تدرّب على الأسئلة الشائعة في الحياة اليومية — {CONVERSATION_TOPICS.length} موقف واقعي
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => { setViewMode('browse'); setPracticeStarted(false) }}
              variant={viewMode === 'browse' && !practiceStarted ? 'secondary' : 'ghost'}
              className={viewMode === 'browse' && !practiceStarted
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'text-rose-100 hover:text-white hover:bg-white/10'}
              size="sm"
            >
              <BookOpen className="w-4 h-4 ml-1" />
              تصفّح
            </Button>
            <Button
              onClick={() => startPractice()}
              variant={practiceStarted ? 'secondary' : 'ghost'}
              className={practiceStarted
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'text-rose-100 hover:text-white hover:bg-white/10'}
              size="sm"
              disabled={!pronSupported}
            >
              <Mic className="w-4 h-4 ml-1" />
              تدرّب بالصوت
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BROWSE VIEW                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {viewMode === 'browse' && !practiceStarted && (
        <div className="space-y-4">
          {/* Difficulty filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
            <button
              onClick={() => startPractice()}
              className="whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-rose-600 text-white shadow-md shadow-rose-600/25"
            >
              <Play className="w-4 h-4" />
              ابدأ التدريب الكامل
            </button>
            <button
              onClick={() => startPractice('easy')}
              className="whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
            >
              ⭐ سهل
            </button>
            <button
              onClick={() => startPractice('medium')}
              className="whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 border border-amber-200"
            >
              ⭐⭐ متوسط
            </button>
            <button
              onClick={() => startPractice('hard')}
              className="whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 border border-red-200"
            >
              ⭐⭐⭐ صعب
            </button>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONVERSATION_TOPICS.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden border-0"
                  onClick={() => openDetail(topic)}
                >
                  {/* Gradient top bar */}
                  <div className={`h-2 bg-gradient-to-l ${topic.gradient}`} />
                  <CardContent className="p-5 space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${topic.iconBg}`}>
                          {topic.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{topic.titleAr}</h3>
                          <p className="text-xs text-gray-400 font-chinese-sans">{topic.titleZh}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${getDifficultyColor(topic.difficulty)}`}>
                        {'⭐'.repeat(getDifficultyStars(topic.difficulty))}
                      </Badge>
                    </div>

                    {/* Question preview */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-base font-bold text-gray-900 font-chinese-serif leading-relaxed">
                        {topic.question}
                      </p>
                      <p className="text-xs text-gray-500" dir="rtl">{topic.translation}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-rose-500 hover:bg-rose-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            speak(topic.question)
                          }}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <span className="text-[10px] text-gray-400">الدرس {topic.lessonRef}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400">{topic.answers.length} إجابة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DETAIL VIEW                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {viewMode === 'detail' && selectedTopic && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Back button */}
          <Button variant="outline" size="sm" onClick={goBack} className="gap-1">
            <ChevronRight className="w-4 h-4" />
            العودة للقائمة
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTopic.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Main question card */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className={`h-3 bg-gradient-to-l ${selectedTopic.gradient}`} />
                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${selectedTopic.iconBg}`}>
                        {selectedTopic.emoji}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedTopic.titleAr}</h3>
                        <p className="text-sm text-gray-400 font-chinese-sans">{selectedTopic.titleZh}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getDifficultyColor(selectedTopic.difficulty)}>
                      {selectedTopic.difficultyLabel} {'⭐'.repeat(getDifficultyStars(selectedTopic.difficulty))}
                    </Badge>
                  </div>

                  {/* Question */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 text-center space-y-3">
                    <p className="text-sm text-gray-400 mb-2">❓ السؤال</p>
                    <p className="text-3xl font-bold text-gray-900 font-chinese-serif leading-relaxed">
                      {selectedTopic.question}
                    </p>
                    <p className="text-base text-rose-600 font-medium font-chinese-sans">
                      {selectedTopic.questionPinyin}
                    </p>
                    <div className="w-16 h-0.5 bg-gradient-to-l from-rose-400 to-transparent mx-auto" />
                    <p className="text-sm text-gray-600" dir="rtl">{selectedTopic.translation}</p>
                    <Button
                      variant="outline"
                      className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => speak(selectedTopic.question)}
                    >
                      <Volume2 className="w-4 h-4" />
                      استمع
                    </Button>
                  </div>

                  {/* Toggle answers */}
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed"
                    onClick={() => setShowAnswers(!showAnswers)}
                  >
                    {showAnswers ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        إخفاء الإجابات
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        اعرض {selectedTopic.answers.length} إجابات نموذجية
                      </>
                    )}
                  </Button>

                  {/* Answer templates */}
                  <AnimatePresence>
                    {showAnswers && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {selectedTopic.answers.map((answer, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card
                              className="cursor-pointer hover:shadow-md transition-all border-0 bg-white"
                              onClick={() => setExpandedAnswer(expandedAnswer === idx ? null : idx)}
                            >
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold">
                                      {idx + 1}
                                    </span>
                                    <span className="text-xs text-gray-400">الإجابة {idx + 1}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 text-rose-500 hover:bg-rose-50"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        speak(answer.zh)
                                      }}
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <ChevronLeft
                                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedAnswer === idx ? 'rotate-180' : ''}`}
                                    />
                                  </div>
                                </div>

                                {/* Expanded answer */}
                                <AnimatePresence>
                                  {expandedAnswer === idx && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-1.5 pt-1 border-t border-gray-100 mt-1 overflow-hidden"
                                    >
                                      <p className="text-lg font-bold text-gray-900 font-chinese-serif leading-relaxed mt-2">
                                        {answer.zh}
                                      </p>
                                      <p className="text-sm text-rose-600 font-medium font-chinese-sans">
                                        {answer.pinyin}
                                      </p>
                                      <p className="text-sm text-green-600" dir="rtl">
                                        {answer.ar}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PRACTICE VIEW                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {practiceStarted && !practiceFinished && practiceTopics.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Back button */}
          <Button variant="outline" size="sm" onClick={goBack} className="gap-1">
            <ChevronRight className="w-4 h-4" />
            العودة
          </Button>

          {/* Practice progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              السؤال {practiceIndex + 1} من {practiceTopics.length}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="w-3 h-3 ml-1" />
                {practiceScore} صحيح
              </Badge>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-l from-rose-500 to-pink-500 rounded-full"
              animate={{ width: `${((practiceIndex + 1) / practiceTopics.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={practiceIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {(() => {
                const topic = practiceTopics[practiceIndex]
                return (
                  <Card className="overflow-hidden border-0 shadow-lg">
                    <div className={`h-2 bg-gradient-to-l ${topic.gradient}`} />
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      {/* Topic info */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${topic.iconBg}`}>
                          {topic.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{topic.titleAr}</h3>
                          <Badge variant="outline" className={`text-[10px] ${getDifficultyColor(topic.difficulty)}`}>
                            {topic.difficultyLabel}
                          </Badge>
                        </div>
                      </div>

                      {/* Question card */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 text-center space-y-3">
                        <p className="text-3xl sm:text-4xl font-bold text-gray-900 font-chinese-serif leading-relaxed cursor-pointer hover:text-rose-600 transition-colors"
                          onClick={() => speak(topic.question)}
                        >
                          {topic.question}
                        </p>
                        <p className="text-base text-rose-600 font-medium font-chinese-sans">
                          {topic.questionPinyin}
                        </p>
                        <p className="text-sm text-gray-500" dir="rtl">{topic.translation}</p>
                        <Button
                          variant="outline"
                          className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                          onClick={() => speak(topic.question)}
                        >
                          <Volume2 className="w-4 h-4" />
                          استمع للسؤال
                        </Button>
                      </div>

                      {/* Show answers toggle */}
                      <Button
                        variant="outline"
                        className="w-full gap-2 border-dashed"
                        onClick={() => setShowAnswers(!showAnswers)}
                      >
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        {showAnswers ? 'إخفاء الإجابات' : 'عرض الإجابات النموذجية'}
                      </Button>

                      {/* Answer templates */}
                      <AnimatePresence>
                        {showAnswers && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 overflow-hidden"
                          >
                            {topic.answers.map((answer, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-xl border border-gray-100 p-3 space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400">الإجابة {idx + 1}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7 text-rose-500 hover:bg-rose-50"
                                    onClick={() => speak(answer.zh)}
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                                <p className="text-base font-bold text-gray-900 font-chinese-serif">{answer.zh}</p>
                                <p className="text-xs text-rose-600 font-chinese-sans">{answer.pinyin}</p>
                                <p className="text-xs text-green-600" dir="rtl">{answer.ar}</p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Speech recording section */}
                      {pronSupported && (
                        <div className="space-y-4 pt-2">
                          <p className="text-sm text-center text-gray-500">
                            🎙️ حاول نطق السؤال بصوتك!
                          </p>

                          <div className="flex flex-col items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={isRecording ? stopRecording : startRecording}
                              className={isRecording
                                ? 'relative w-20 h-20 rounded-full flex items-center justify-center transition-all bg-rose-600 shadow-lg shadow-rose-200'
                                : 'relative w-20 h-20 rounded-full flex items-center justify-center transition-all bg-rose-50 border-2 border-rose-300 hover:border-rose-500 hover:bg-rose-100'}
                            >
                              {isRecording && (
                                <motion.div
                                  className="absolute inset-0 rounded-full border-4 border-rose-400"
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                              )}
                              {isRecording
                                ? <MicOff className="w-8 h-8 text-white" />
                                : <Mic className="w-8 h-8 text-rose-600" />
                              }
                            </motion.button>
                            <p className="text-xs text-gray-400">
                              {isRecording ? 'جاري التسجيل... اضغط للإيقاف' : 'اضغط للتسجيل'}
                            </p>
                          </div>

                          {/* Waveform */}
                          {isRecording && (
                            <div className="flex items-center justify-center gap-0.5 h-8">
                              {Array.from({ length: 16 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-rose-400 rounded-full"
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
                                  className="text-base p-3 rounded-xl text-center"
                                  style={{ backgroundColor: pronResult.color + '15', color: pronResult.color }}
                                >
                                  {pronResult.msg}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">ما قلته:</span>
                                    <span className="font-chinese-sans">{pronResult.spoken || '—'}</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Next button */}
                      <Button
                        className="w-full gap-2 bg-rose-600 hover:bg-rose-700"
                        onClick={nextPracticeQuestion}
                      >
                        {practiceIndex + 1 >= practiceTopics.length ? 'إنهاء التمرين' : 'السؤال التالي'}
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PRACTICE FINISHED VIEW                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {practiceStarted && practiceFinished && (
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg border-0 p-8 text-center space-y-6"
          >
            <div className="text-7xl">
              {practiceScore >= practiceTopics.length * 0.8 ? '🏆' : practiceScore >= practiceTopics.length * 0.5 ? '⭐' : '💪'}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {practiceScore >= practiceTopics.length * 0.8
                  ? 'ممتاز! أنت رائع!'
                  : practiceScore >= practiceTopics.length * 0.5
                    ? 'جيد! استمر بالتدريب'
                    : 'لا تستسلم! حاول مرة أخرى'}
              </p>
              <p className="text-xl text-gray-500 mt-2" dir="rtl">
                {practiceScore} / {practiceTopics.length} إجابة صحيحة
              </p>
            </div>

            {/* Score bar */}
            <div className="max-w-xs mx-auto">
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${practiceScore >= practiceTopics.length * 0.8 ? 'bg-gradient-to-l from-emerald-500 to-green-500' : practiceScore >= practiceTopics.length * 0.5 ? 'bg-gradient-to-l from-amber-500 to-yellow-500' : 'bg-gradient-to-l from-rose-500 to-red-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${practiceTopics.length > 0 ? (practiceScore / practiceTopics.length) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {practiceTopics.length > 0 ? Math.round((practiceScore / practiceTopics.length) * 100) : 0}% صحّة
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => startPractice()} className="bg-rose-600 hover:bg-rose-700 gap-2">
                <RotateCcw className="h-4 w-4" />
                تمرين جديد
              </Button>
              <Button onClick={goBack} variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                العودة للقائمة
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Not supported warning */}
      {viewMode === 'browse' && !pronSupported && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-700 font-medium">المتصفح لا يدعم التعرف على الصوت</p>
          <p className="text-amber-600 text-sm mt-1">يرجى استخدام Chrome أو Edge لتمارين النطق الصوتي</p>
        </div>
      )}
    </div>
  )
}
