'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { grammarRules } from '@/data/grammar'
import { useLearningStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  BookOpen, GraduationCap, Gamepad2, BookMarked, Map, LayoutDashboard,
  Volume2, ChevronLeft, ChevronRight, RotateCcw, Star, Check, X,
  Brain, Trophy, Target, Sparkles, Search, Filter, Eye, Heart,
  Clock, Flame, Languages, MessageCircle, ArrowLeftRight
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

// ─── Categories ─────────────────────────────────────────────
const categories = [
  { value: 'all', label: 'الكل' },
  { value: 'noun', label: 'أسماء' },
  { value: 'verb', label: 'أفعال' },
  { value: 'adjective', label: 'صفات' },
  { value: 'pronoun', label: 'ضمائر' },
  { value: 'numeral', label: 'أعداد' },
  { value: 'particle', label: 'أدوات' },
  { value: 'adverb', label: 'ظروف' },
  { value: 'fixed', label: 'تعبيرات ثابتة' },
]

// ─── Roadmap Data ───────────────────────────────────────────
const roadmapUnits = [
  { id: 1, title: 'التحيات والتعارف', hours: 1, words: [1,2,3,4,5,6,7,8,9,10,11,12,13,14], desc: 'تعلم التحيات الأساسية والتعرف على الآخرين', grammarIds: [1,5,11] },
  { id: 2, title: 'المعلومات الشخصية', hours: 1, words: [15,16,17,18,19,20,21,27,28,29,30], desc: 'التحدث عن نفسك والأسئلة الشخصية', grammarIds: [2,5,6,7] },
  { id: 3, title: 'العائلة والأصدقاء', hours: 1, words: [36,39,42,49,50,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71], desc: 'وصف العائلة والعلاقات الاجتماعية', grammarIds: [3,4,8,9,10] },
  { id: 4, title: 'الأرقام والعدّ', hours: 0.5, words: [51,52,53,74,75,77,109,154,155,156,162,184,185,188,195,204,217,234], desc: 'الأرقام من 0 إلى 1000 والمعدّات', grammarIds: [10,19] },
  { id: 5, title: 'الوقت والتواريخ', hours: 0.5, words: [72,73,76,93,94,96,98,99,115,116,163,177,192,193,196,197,200,206,207,208,214,235,249,253,254,261,275,280,293,302], desc: 'التعبير عن الوقت والتواريخ والأيام', grammarIds: [17,18] },
  { id: 6, title: 'المكان والاتجاهات', hours: 1, words: [81,97,103,133,164,165,166,167,168,169,277,284,285,286,289,296,297], desc: 'السؤال عن الأماكن والتعبير عن الموقع', grammarIds: [13,9] },
  { id: 7, title: 'الطعام والشراب', hours: 1, words: [78,79,84,85,89,90,105,111,119,126,136,159,160,161,178,259], desc: 'الطعام الصيني والمطاعم والطهي', grammarIds: [1,14] },
  { id: 8, title: 'المواصلات والتسوق', hours: 1, words: [87,88,91,92,107,118,130,131,143,157,158,182,197,198,216,218,219,220,240,241,245,246,260,262,274,275,276], desc: 'التنقل والتسوق والأسعار', grammarIds: [15,16,20,21,22,23] },
  { id: 9, title: 'الحياة اليومية', hours: 1.5, words: [44,45,46,47,48,82,83,106,113,114,121,122,123,124,125,137,141,142,144,145,146,147,148,149,150,152,170,171,172,173,174,175,176,179,180,181,189,190,191,202,203,205,209,210,211,212,213,215,216,217,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,241,242,243,244,247,248,249,250,251,252,255,256,257,258,259,260,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,294,295,296,297,298,299,300,301,302,303,304], desc: 'الأنشطة اليومية والحياة الاجتماعية', grammarIds: [12,14,18,22,23] },
  { id: 10, title: 'مراجعة شاملة', hours: 1, words: [1,2,3,19,20,21,25,26,27,28,30,31,32,33,34,35,37,38,39,40,41,43,48,49,50,51,55,68,69,70,71,106,150,156,170,190,193,204,223,241,244,256,258,259,261,280,281,292,298,300,304], desc: 'مراجعة المفردات والقواعد الأساسية', grammarIds: [24,25,26] },
]

// ─── Stories Data ────────────────────────────────────────────
const stories = [
  {
    id: 1,
    title: 'يوم لي مينغ',
    titleZh: '李明的一天',
    content: [
      { zh: '我叫李明。', pinyin: 'Wǒ jiào Lǐ Míng.', ar: 'اسمي لي مينغ.' },
      { zh: '我是中国学生。', pinyin: 'Wǒ shì Zhōngguó xuéshēng.', ar: 'أنا طالب صيني.' },
      { zh: '我早上七点起床。', pinyin: 'Wǒ zǎoshang qī diǎn qǐchuáng.', ar: 'أستيقظ السابعة صباحاً.' },
      { zh: '我吃早饭，然后去学校。', pinyin: 'Wǒ chī zǎofàn, ránhòu qù xuéxiào.', ar: 'آكل الفطور ثم أذهب للمدرسة.' },
      { zh: '八点上课。', pinyin: 'Bā diǎn shàngkè.', ar: 'الدرس يبدأ الساعة الثامنة.' },
      { zh: '我的老师很好。', pinyin: 'Wǒ de lǎoshī hěn hǎo.', ar: 'معلمي جيد جداً.' },
      { zh: '我学习中文和英语。', pinyin: 'Wǒ xuéxí Zhōngwén hé Yīngyǔ.', ar: 'أدرس الصينية والإنجليزية.' },
      { zh: '中午我吃午饭。', pinyin: 'Zhōngwǔ wǒ chī wǔfàn.', ar: 'في الظهيرة آكل الغداء.' },
      { zh: '下午三点下课。', pinyin: 'Xiàwǔ sān diǎn xiàkè.', ar: 'الدروس تنتهي الساعة الثالثة.' },
      { zh: '我和朋友去公园玩。', pinyin: 'Wǒ hé péngyou qù gōngyuán wán.', ar: 'أنا وأصدقائي نذهب للحديقة للعب.' },
      { zh: '晚上我在家吃饭。', pinyin: 'Wǎnshang wǒ zài jiā chī fàn.', ar: 'في المساء آكل في البيت.' },
      { zh: '十点睡觉。', pinyin: 'Shí diǎn shuìjiào.', ar: 'أنام في العاشرة.' },
      { zh: '今天很开心！', pinyin: 'Jīntiān hěn kāixīn!', ar: 'اليوم سعيد جداً!' },
    ],
    questions: [
      { zh: '李明几点起床？', options: ['六点', '七点', '八点', '九点'], correct: 1 },
      { zh: '李明学习什么？', options: ['中文和法语', '中文和英语', '英语和日语', '只学中文'], correct: 1 },
      { zh: '下午李明去哪里？', options: ['商店', '图书馆', '公园', '学校'], correct: 2 },
    ],
  },
  {
    id: 2,
    title: 'عائلة وانغ',
    titleZh: '王芳的家庭',
    content: [
      { zh: '这是王芳。', pinyin: 'Zhè shì Wáng Fāng.', ar: 'هذه وانغ فانغ.' },
      { zh: '她有一个大家庭。', pinyin: 'Tā yǒu yí gè dà jiātíng.', ar: 'لديها عائلة كبيرة.' },
      { zh: '爸爸是医生。', pinyin: 'Bàba shì yīshēng.', ar: 'أبي طبيب.' },
      { zh: '妈妈是老师。', pinyin: 'Māma shì lǎoshī.', ar: 'أمي معلمة.' },
      { zh: '她有一个哥哥。', pinyin: 'Tā yǒu yí gè gēge.', ar: 'لديها أخ أكبر.' },
      { zh: '哥哥在北京工作。', pinyin: 'Gēge zài Běijīng gōngzuò.', ar: 'أخوها الأكبر يعمل في بكين.' },
      { zh: '她还有一个妹妹。', pinyin: 'Tā hái yǒu yí gè mèimei.', ar: 'لديها أيضاً أخت صغرى.' },
      { zh: '妹妹七岁。', pinyin: 'Mèimei qī suì.', ar: 'أختها الصغرى عمرها سبع سنوات.' },
      { zh: '她们一家都很喜欢中国菜。', pinyin: 'Tāmen yì jiā dōu hěn xǐhuan Zhōngguó cài.', ar: 'عائلتها كلها تحب الطعام الصيني.' },
      { zh: '妈妈做的饺子最好吃。', pinyin: 'Māma zuò de jiǎozi zuì hǎochī.', ar: 'زلابية أمي هي الألذ.' },
    ],
    questions: [
      { zh: '王芳的爸爸做什么工作？', options: ['老师', '医生', '学生', '工人'], correct: 1 },
      { zh: '她有几个兄弟姊妹？', options: ['一个', '两个', '三个', '没有'], correct: 1 },
      { zh: '谁做的饺子最好吃？', options: ['爸爸', '哥哥', '妈妈', '王芳'], correct: 2 },
    ],
  },
  {
    id: 3,
    title: 'في المطعم',
    titleZh: '在饭店',
    content: [
      { zh: '今天我和朋友去饭店。', pinyin: 'Jīntiān wǒ hé péngyou qù fàndiàn.', ar: 'اليوم أنا وصديقي ذهبنا للمطعم.' },
      { zh: '这个饭店很大。', pinyin: 'Zhège fàndiàn hěn dà.', ar: 'هذا المطعم كبير.' },
      { zh: '我们坐下看菜单。', pinyin: 'Wǒmen zuòxià kàn càidān.', ar: 'جلسنا ونظرنا في قائمة الطعام.' },
      { zh: '我要一碗面条。', pinyin: 'Wǒ yào yì wǎn miàntiáo.', ar: 'أريد طبق نودلز.' },
      { zh: '我的朋友要米饭和菜。', pinyin: 'Wǒ de péngyou yào mǐfàn hé cài.', ar: 'صديقي يريد أرز وخضار.' },
      { zh: '我们也点了包子和茶。', pinyin: 'Wǒmen yě diǎn le bāozi hé chá.', ar: 'طلبنا أيضاً باوزي وشاي.' },
      { zh: '菜很好吃，不太贵。', pinyin: 'Cài hěn hǎochī, bú tài guì.', ar: 'الطعام لذيذ وغير غالي.' },
      { zh: '一共五十元。', pinyin: 'Yīgòng wǔshí yuán.', ar: 'المجموع خمسون يواناً.' },
      { zh: '我们很高兴。', pinyin: 'Wǒmen hěn gāoxìng.', ar: 'نحن سعداء جداً.' },
    ],
    questions: [
      { zh: '他们点了什么喝的？', options: ['水', '咖啡', '茶', '牛奶'], correct: 2 },
      { zh: '一共多少钱？', options: ['三十元', '四十元', '五十元', '六十元'], correct: 2 },
      { zh: '菜怎么样？', options: ['很贵', '不好吃', '很好吃，不太贵', '很便宜'], correct: 2 },
    ],
  },
]

// ─── Tone Practice Data ──────────────────────────────────────
const tonePairs = [
  { syllable: 'ma', tones: [
    { tone: 1, char: '妈', pinyin: 'mā', meaning: 'أم' },
    { tone: 2, char: '麻', pinyin: 'má', meaning: 'قنب' },
    { tone: 3, char: '马', pinyin: 'mǎ', meaning: 'حصان' },
    { tone: 4, char: '骂', pinyin: 'mà', meaning: 'يشتم' },
  ]},
  { syllable: 'shi', tones: [
    { tone: 1, char: '师', pinyin: 'shī', meaning: 'معلم' },
    { tone: 2, char: '十', pinyin: 'shí', meaning: 'عشرة' },
    { tone: 3, char: '水', pinyin: 'shuǐ', meaning: 'ماء' },
    { tone: 4, char: '是', pinyin: 'shì', meaning: 'يكون' },
  ]},
  { syllable: 'ren', tones: [
    { tone: 1, char: '人', pinyin: 'rén', meaning: 'شخص' },
    { tone: 2, char: '认', pinyin: 'rèn', meaning: 'يعترف' },
    { tone: 3, char: '忍', pinyin: 'rěn', meaning: 'يتحمل' },
    { tone: 4, char: '日', pinyin: 'rì', meaning: 'يوم' },
  ]},
]

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function Home() {
  const store = useLearningStore()
  const { currentSection, setCurrentSection, learnedWords, toggleLearned, incrementStreak } = store
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizFinished, setQuizFinished] = useState(false)
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([])
  const [toneAnswer, setToneAnswer] = useState<number | null>(null)
  const [toneScore, setToneScore] = useState(0)
  const [toneRound, setToneRound] = useState(0)
  const [storyAnswers, setStoryAnswers] = useState<Record<number, number>>({})
  const [activeStory, setActiveStory] = useState(0)

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (currentSection === 'vocabulary') {
        if (e.key === 'ArrowLeft') store.setFlashcardIndex(Math.max(0, store.flashcardIndex - 1))
        if (e.key === 'ArrowRight') store.setFlashcardIndex(Math.min(vocabulary.length - 1, store.flashcardIndex + 1))
        if (e.key === ' ') { e.preventDefault(); store.flip() }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentSection, store.flashcardIndex])

  // ─── Navigation Items ──────────────────────────────────────
  const navItems = [
    { id: 'dashboard' as const, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'vocabulary' as const, label: 'المفردات', icon: BookOpen },
    { id: 'grammar' as const, label: 'القواعد', icon: GraduationCap },
    { id: 'practice' as const, label: 'التمارين', icon: Target },
    { id: 'games' as const, label: 'الألعاب', icon: Gamepad2 },
    { id: 'stories' as const, label: 'القصص', icon: BookMarked },
    { id: 'roadmap' as const, label: 'خريطة الطريق', icon: Map },
  ]

  // ─── Filtered Vocab ────────────────────────────────────────
  const filteredVocab = useMemo(() => {
    return vocabulary.filter(w => {
      const matchSearch = searchQuery === '' ||
        w.zh.includes(searchQuery) ||
        w.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.meaning.includes(searchQuery)
      const matchCat = selectedCategory === 'all' || w.pos === selectedCategory
      return matchSearch && matchCat
    })
  }, [searchQuery, selectedCategory])

  // ─── Quiz Generation ──────────────────────────────────────
  const generateQuiz = useCallback(() => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 10)
    const questions = shuffled.map(word => {
      const wrongOptions = vocabulary
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning)
      const options = [...wrongOptions, word.meaning].sort(() => Math.random() - 0.5)
      return {
        wordId: word.id,
        question: word.zh,
        options,
        correctIndex: options.indexOf(word.meaning),
      }
    })
    store.startQuiz(questions)
    setQuizAnswer(null)
    setQuizFinished(false)
  }, [store])

  // ─── Memory Game ──────────────────────────────────────────
  const startMemoryGame = useCallback(() => {
    const selected = vocabulary.sort(() => Math.random() - 0.5).slice(0, 8)
    const cards = selected.flatMap(w => [
      { id: w.id * 2, zh: w.zh, ar: w.meaning, pinyin: w.pinyin, matched: false },
      { id: w.id * 2 + 1, zh: w.zh, ar: w.meaning, pinyin: w.pinyin, matched: false },
    ]).sort(() => Math.random() - 0.5)
    store.startMemoryGame(cards)
    setMemoryFlipped([])
  }, [store])

  const handleMemoryClick = (id: number) => {
    if (memoryFlipped.length === 2) return
    const card = store.memoryCards.find(c => c.id === id)
    if (!card || card.matched || memoryFlipped.includes(id)) return

    const newFlipped = [...memoryFlipped, id]
    setMemoryFlipped(newFlipped)

    if (newFlipped.length === 2) {
      store.incrementMemoryMoves()
      const [a, b] = newFlipped
      const cardA = store.memoryCards.find(c => c.id === a)
      const cardB = store.memoryCards.find(c => c.id === b)
      if (cardA && cardB && cardA.zh === cardB.zh) {
        store.matchMemoryPair(a, b)
        setTimeout(() => setMemoryFlipped([]), 500)
      } else {
        setTimeout(() => setMemoryFlipped([]), 1000)
      }
    }
  }

  // ─── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = vocabulary.length
    const learned = learnedWords.length
    const progress = Math.round((learned / total) * 100)
    const byCategory = categories.slice(1).map(cat => ({
      ...cat,
      count: vocabulary.filter(w => w.pos === cat.value).length,
      learned: vocabulary.filter(w => w.pos === cat.value && learnedWords.includes(w.id)).length,
    }))
    return { total, learned, progress, byCategory }
  }, [learnedWords])

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* ─── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="font-chinese-serif text-white text-xl font-bold">汉</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">تعلم الصينية — HSK 1</h1>
              <p className="text-xs text-gray-500">304 كلمة • 26 قاعدة • مستوى مبتدئ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:flex gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>{store.dailyStreak} يوم متتالي</span>
            </Badge>
            <Badge variant="outline" className="hidden sm:flex gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>{stats.learned}/{stats.total}</span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* ─── Sidebar Navigation (Desktop) ──────────────── */}
        <nav className="hidden lg:flex flex-col w-56 border-l border-gray-200 p-3 gap-1 sticky top-[60px] self-start">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentSection === item.id
                  ? 'bg-red-50 text-red-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentSection === item.id ? 'text-red-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-b from-red-50 to-orange-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">التقدم العام</div>
            <Progress value={stats.progress} className="h-2 mb-1" />
            <div className="text-xs text-gray-500 text-center">{stats.progress}%</div>
          </div>
        </nav>

        {/* ─── Mobile Bottom Navigation ──────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around py-2 px-1 safe-area-bottom">
          {navItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentSection(item.id); incrementStreak() }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] ${
                currentSection === item.id ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setCurrentSection(store.currentSection === 'stories' ? 'games' : 'stories')}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-gray-400"
          >
            {store.currentSection === 'stories' || store.currentSection === 'games'
              ? <BookMarked className="w-5 h-5 text-red-600" />
              : <MoreHorizontal className="w-5 h-5" />
            }
            <span className="text-[10px] font-medium">
              {store.currentSection === 'stories' || store.currentSection === 'games'
                ? (store.currentSection === 'stories' ? 'القصص' : 'الألعاب')
                : 'المزيد'}
            </span>
          </button>
        </nav>

        {/* ─── Main Content ──────────────────────────────── */}
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 animate-fade-in" key={currentSection}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentSection === 'dashboard' && <DashboardSection stats={stats} onNavigate={setCurrentSection} />}
              {currentSection === 'vocabulary' && (
                <VocabularySection
                  filteredVocab={filteredVocab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              )}
              {currentSection === 'grammar' && <GrammarSection />}
              {currentSection === 'practice' && (
                <PracticeSection
                  quizAnswer={quizAnswer}
                  setQuizAnswer={setQuizAnswer}
                  quizFinished={quizFinished}
                  setQuizFinished={setQuizFinished}
                  generateQuiz={generateQuiz}
                />
              )}
              {currentSection === 'games' && (
                <GamesSection
                  memoryFlipped={memoryFlipped}
                  handleMemoryClick={handleMemoryClick}
                  startMemoryGame={startMemoryGame}
                  toneAnswer={toneAnswer}
                  setToneAnswer={setToneAnswer}
                  toneScore={toneScore}
                  setToneScore={setToneScore}
                  toneRound={toneRound}
                  setToneRound={setToneRound}
                />
              )}
              {currentSection === 'stories' && (
                <StoriesSection
                  activeStory={activeStory}
                  setActiveStory={setActiveStory}
                  storyAnswers={storyAnswers}
                  setStoryAnswers={setStoryAnswers}
                />
              )}
              {currentSection === 'roadmap' && <RoadmapSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="hidden lg:block border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          تعلم اللغة الصينية — HSK المستوى الأول • {stats.learned} من {stats.total} كلمة تم حفظها
        </div>
      </footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD SECTION
// ═══════════════════════════════════════════════════════════
function DashboardSection({ stats, onNavigate }: {
  stats: { total: number; learned: number; progress: number; byCategory: { value: string; label: string; count: number; learned: number }[] }
  onNavigate: (s: 'dashboard' | 'vocabulary' | 'grammar' | 'practice' | 'games' | 'stories' | 'roadmap') => void
}) {
  const store = useLearningStore()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-red-600" />
          لوحة التحكم
        </h2>
        <p className="text-gray-500 mt-1">مرحباً بك في رحلة تعلم اللغة الصينية!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'كلمة محفوظة', value: stats.learned, total: stats.total, icon: BookOpen, color: 'from-red-500 to-red-600' },
          { label: 'قاعدة نحوية', value: 26, total: 26, icon: GraduationCap, color: 'from-amber-500 to-amber-600' },
          { label: 'أيام متتالية', value: store.dailyStreak, icon: Flame, color: 'from-orange-500 to-orange-600' },
          { label: 'مستوى التقدم', value: `${stats.progress}%`, icon: Trophy, color: 'from-emerald-500 to-emerald-600' },
        ].map((stat, i) => (
          <Card key={i} className="card-hover border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              {stat.total && <div className="text-xs text-gray-500">من {stat.total}</div>}
              <div className="text-xs text-gray-600 font-medium mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">التقدم حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.byCategory.map((cat) => (
            <div key={cat.value} className="flex items-center gap-3">
              <span className="text-sm w-20 text-gray-600 text-left">{cat.label}</span>
              <div className="flex-1">
                <Progress value={cat.count > 0 ? (cat.learned / cat.count) * 100 : 0} className="h-2" />
              </div>
              <span className="text-xs text-gray-500 w-16 text-left">{cat.learned}/{cat.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'مراجعة المفردات', desc: '304 كلمة بالبطاقات', section: 'vocabulary' as const, icon: BookOpen },
          { label: 'تمارين اليوم', desc: 'اختبر معلوماتك', section: 'practice' as const, icon: Target },
          { label: 'العب وتعلم', desc: 'ألعاب تعليمية ممتعة', section: 'games' as const, icon: Gamepad2 },
          { label: 'اقرأ قصة', desc: 'قصص بالمفردات الأساسية', section: 'stories' as const, icon: BookMarked },
          { label: 'تعلم القواعد', desc: '26 قاعدة نحوية', section: 'grammar' as const, icon: GraduationCap },
          { label: 'خريطة الطريق', desc: 'خطة 10 ساعات', section: 'roadmap' as const, icon: Map },
        ].map((action) => (
          <Card
            key={action.section}
            className="card-hover border-0 shadow-sm cursor-pointer group"
            onClick={() => onNavigate(action.section)}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                <action.icon className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{action.label}</div>
                <div className="text-xs text-gray-500">{action.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// VOCABULARY SECTION
// ═══════════════════════════════════════════════════════════
function VocabularySection({ filteredVocab, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }: {
  filteredVocab: VocabWord[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
}) {
  const store = useLearningStore()
  const word = filteredVocab[store.flashcardIndex]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-red-600" />
          المفردات
        </h2>
        <Badge variant="secondary">{filteredVocab.length} كلمة</Badge>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ابحث بالصينية أو البنيني أو العربية..."
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
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Flashcard */}
      {word && (
        <div className="space-y-4">
          <div className="perspective-1000">
            <div
              className={`relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d ${store.isFlipped ? 'rotate-y-180' : ''}`}
              onClick={store.flip}
              style={{ minHeight: '280px' }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden">
                <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
                  <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div
                      className="font-chinese-serif text-7xl mb-4 text-gray-900 cursor-pointer hover:text-red-600 transition-colors"
                      onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                    >
                      {word.zh}
                    </div>
                    <div className="text-lg text-gray-500 font-chinese-sans">{word.pinyin}</div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                      <Volume2 className="w-3 h-3" />
                      <span>اضغط للنطق • مسافة أو انقر للقلب</span>
                    </div>
                    <Badge className="mt-4" variant="outline">{word.pos}</Badge>
                  </CardContent>
                </Card>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180">
                <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-amber-50">
                  <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                    <div className="text-3xl font-bold text-gray-900">{word.meaning}</div>
                    <div className="font-chinese-serif text-4xl text-red-700">{word.zh}</div>
                    <div className="text-sm text-gray-500 font-chinese-sans">{word.pinyin}</div>
                    <div className="w-full border-t border-gray-200 pt-3 mt-2">
                      <div className="text-sm text-gray-700 font-chinese-sans">{word.exZh}</div>
                      <div className="text-xs text-gray-500">{word.exPinyin}</div>
                      <div className="text-xs text-gray-400 mt-1">{word.exEn}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.setFlashcardIndex(store.flashcardIndex - 1)}
              disabled={store.flashcardIndex === 0}
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={store.isLearned(word.id) ? 'default' : 'outline'}
                onClick={() => { toggleLearned(word.id); incrementStreak() }}
                className={store.isLearned(word.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {store.isLearned(word.id) ? <><Check className="w-4 h-4 ml-1" /> تم الحفظ</> : <><Star className="w-4 h-4 ml-1" /> حفظ</>}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => speak(word.zh)}>
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.setFlashcardIndex(store.flashcardIndex + 1)}
              disabled={store.flashcardIndex >= filteredVocab.length - 1}
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            {store.flashcardIndex + 1} / {filteredVocab.length}
          </div>
        </div>
      )}

      {/* Word List (collapsed) */}
      <Card className="border-0 shadow-sm">
        <Accordion type="single" collapsible>
          <AccordionItem value="list" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium text-gray-700">
              قائمة الكلمات ({filteredVocab.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
                {filteredVocab.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => store.setFlashcardIndex(filteredVocab.findIndex(v => v.id === w.id))}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors hover:bg-gray-50 ${
                      store.isLearned(w.id) ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <span className="font-chinese-serif text-lg w-20 text-gray-900">{w.zh}</span>
                    <span className="text-xs text-gray-500 font-chinese-sans w-28">{w.pinyin}</span>
                    <span className="text-sm text-gray-700 flex-1">{w.meaning}</span>
                    {store.isLearned(w.id) && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// GRAMMAR SECTION
// ═══════════════════════════════════════════════════════════
function GrammarSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-red-600" />
          القواعد النحوية
        </h2>
        <Badge variant="secondary">26 قاعدة</Badge>
      </div>
      <p className="text-gray-500 text-sm">جميع القواعد النحوية المطلوبة للمستوى الأول (HSK 1)</p>

      <Accordion type="multiple" className="space-y-2">
        {grammarRules.map((rule) => (
          <AccordionItem key={rule.id} value={String(rule.id)} className="border rounded-xl shadow-sm px-4">
            <AccordionTrigger className="text-right hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {rule.id}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{rule.titleAr}</div>
                  <div className="text-xs text-gray-500 font-ltr">{rule.title}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 space-y-4">
              <p className="text-sm text-gray-700">{rule.description}</p>

              {/* Pattern */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 mb-1">الصيغة</div>
                <div className="text-sm font-medium text-red-700 font-chinese-sans">{rule.pattern}</div>
              </div>

              {/* Examples */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500">أمثلة:</div>
                {rule.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => speak(ex.zh)}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-chinese-serif text-gray-900">{ex.zh}</div>
                      <div className="text-xs text-gray-500 font-chinese-sans">{ex.pinyin}</div>
                      <div className="text-sm text-gray-700">{ex.ar}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              {rule.tips && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    نصيحة
                  </div>
                  <div className="text-sm text-amber-900 mt-1">{rule.tips}</div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PRACTICE SECTION
// ═══════════════════════════════════════════════════════════
function PracticeSection({ quizAnswer, setQuizAnswer, quizFinished, setQuizFinished, generateQuiz }: {
  quizAnswer: number | null
  setQuizAnswer: (a: number | null) => void
  quizFinished: boolean
  setQuizFinished: (f: boolean) => void
  generateQuiz: () => void
}) {
  const store = useLearningStore()
  const { quizQuestions, quizScore, quizTotal, currentQuizQuestion, answerQuiz, nextQuizQuestion, resetQuiz } = store
  const [fillBlankWord, setFillBlankWord] = useState<VocabWord | null>(null)
  const [fillAnswer, setFillAnswer] = useState('')
  const [fillResult, setFillResult] = useState<'correct' | 'wrong' | null>(null)
  const [matchPairs, setMatchPairs] = useState<{ zh: string; ar: string }[]>([])
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set())
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)

  const startFillBlank = () => {
    const random = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    setFillBlankWord(random)
    setFillAnswer('')
    setFillResult(null)
  }

  const checkFillAnswer = () => {
    if (!fillBlankWord) return
    const correct = fillAnswer.trim() === fillBlankWord.zh ||
      fillAnswer.trim() === fillBlankWord.pinyin
    setFillResult(correct ? 'correct' : 'wrong')
    if (correct) incrementStreak()
  }

  const startMatchGame = () => {
    const selected = vocabulary.sort(() => Math.random() - 0.5).slice(0, 6)
    setMatchPairs(selected.map(w => ({ zh: w.zh, ar: w.meaning })))
    setMatchedItems(new Set())
    setSelectedMatch(null)
  }

  const handleMatchClick = (item: string, side: 'zh' | 'ar') => {
    if (matchedItems.has(item)) return
    if (!selectedMatch) {
      setSelectedMatch(item)
    } else {
      const zhItem = side === 'zh' ? item : selectedMatch
      const arItem = side === 'ar' ? item : selectedMatch
      const pair = matchPairs.find(p => p.zh === zhItem && p.ar === arItem)
      if (pair) {
        setMatchedItems(prev => new Set([...prev, zhItem, arItem]))
      }
      setSelectedMatch(null)
    }
  }

  const currentQuestion = quizQuestions[currentQuizQuestion]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-red-600" />
          التمارين
        </h2>
      </div>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quiz">اختيار من متعدد</TabsTrigger>
          <TabsTrigger value="fill">اكمل الفراغ</TabsTrigger>
          <TabsTrigger value="match">طابق الأزواج</TabsTrigger>
        </TabsList>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4">
          {!quizQuestions.length ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Brain className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">اختبار المفردات</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  10 أسئلة عشوائية لاختبار معرفتك بالمفردات الصينية. اختر الترجمة الصحيحة لكل كلمة.
                </p>
                <Button onClick={() => { generateQuiz(); incrementStreak() }} className="bg-red-600 hover:bg-red-700">
                  ابدأ الاختبار
                </Button>
              </CardContent>
            </Card>
          ) : !quizFinished ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>السؤال {currentQuizQuestion + 1} من {quizTotal}</span>
                  <span>النتيجة: {quizScore}/{quizTotal}</span>
                </div>
                <Progress value={(currentQuizQuestion / quizTotal) * 100} className="h-1.5" />

                <div className="text-center space-y-4">
                  <div
                    className="font-chinese-serif text-6xl text-gray-900 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={() => speak(currentQuestion.question)}
                  >
                    {currentQuestion.question}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => speak(currentQuestion.question)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt, i) => {
                    let btnClass = 'border-gray-200 hover:bg-gray-50 text-gray-900'
                    if (quizAnswer !== null) {
                      if (i === currentQuestion.correctIndex) btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      else if (i === quizAnswer) btnClass = 'border-red-500 bg-red-50 text-red-800'
                    }
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={`h-auto py-3 text-sm ${btnClass} transition-all`}
                        onClick={() => {
                          if (quizAnswer !== null) return
                          setQuizAnswer(i)
                          answerQuiz(i === currentQuestion.correctIndex)
                          setTimeout(() => {
                            if (currentQuizQuestion < quizTotal - 1) {
                              nextQuizQuestion()
                              setQuizAnswer(null)
                            } else {
                              setQuizFinished(true)
                            }
                          }, 1200)
                        }}
                      >
                        {opt}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
                <Trophy className={`w-20 h-20 ${quizScore >= 7 ? 'text-yellow-500' : 'text-gray-400'}`} />
                <h3 className="text-2xl font-bold text-gray-900">
                  {quizScore >= 9 ? 'ممتاز! 🎉' : quizScore >= 7 ? 'أحسنت! 👏' : quizScore >= 5 ? 'جيد، واصل! 💪' : 'حاول مرة أخرى! 📚'}
                </h3>
                <div className="text-4xl font-bold text-red-600">{quizScore} / {quizTotal}</div>
                <Progress value={(quizScore / quizTotal) * 100} className="w-64 h-3" />
                <Button onClick={() => { resetQuiz(); setQuizFinished(false); generateQuiz() }} className="bg-red-600 hover:bg-red-700">
                  <RotateCcw className="w-4 h-4 ml-2" /> حاول مرة أخرى
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fill Blank Tab */}
        <TabsContent value="fill" className="space-y-4">
          {!fillBlankWord ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Languages className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">اكتب الكلمة الصينية</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  سيظهر لك المعنى بالعربية والجملة المثال. اكتب الكلمة الصينية أو البينيين.
                </p>
                <Button onClick={() => { startFillBlank(); incrementStreak() }} className="bg-red-600 hover:bg-red-700">
                  ابدأ التمرين
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-xl font-bold text-gray-900">{fillBlankWord.meaning}</div>
                  <div className="text-sm text-gray-500 font-chinese-sans">{fillBlankWord.pinyin}</div>
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <div className="font-chinese-serif text-gray-800">{fillBlankWord.exZh}</div>
                    <div className="text-xs text-gray-500 mt-1">{fillBlankWord.exPinyin}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب الكلمة الصينية أو البينيين..."
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkFillAnswer()}
                    className="text-lg font-chinese-serif"
                  />
                  <Button onClick={checkFillAnswer} className="bg-red-600 hover:bg-red-700">تحقق</Button>
                </div>
                {fillResult && (
                  <div className={`p-3 rounded-lg text-center font-medium ${fillResult === 'correct' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    {fillResult === 'correct' ? '✓ إجابة صحيحة!' : `✗ الإجابة الصحيحة: ${fillBlankWord.zh}`}
                  </div>
                )}
                <div className="text-center">
                  <Button variant="outline" onClick={startFillBlank} className="gap-1">
                    <RotateCcw className="w-3 h-3" /> كلمة أخرى
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Match Tab */}
        <TabsContent value="match" className="space-y-4">
          {!matchPairs.length ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <ArrowLeftRight className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">طابق الأزواج</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  اختر الكلمة الصينية ثم اختر ترجمتها العربية لإنشاء الأزواج المتطابقة.
                </p>
                <Button onClick={() => { startMatchGame(); incrementStreak() }} className="bg-red-600 hover:bg-red-700">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matchedItems.size < matchPairs.length * 2 && (
                <div className="text-sm text-gray-500 text-center">
                  الأزواج المتطابقة: {matchedItems.size / 2} / {matchPairs.length}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {matchPairs.map(p => (
                    <Button
                      key={p.zh}
                      variant={matchedItems.has(p.zh) ? 'secondary' : selectedMatch === p.zh ? 'default' : 'outline'}
                      className={`w-full justify-center font-chinese-serif text-lg h-12 ${matchedItems.has(p.zh) ? 'opacity-50' : ''}`}
                      onClick={() => handleMatchClick(p.zh, 'zh')}
                      disabled={matchedItems.has(p.zh)}
                    >
                      {p.zh}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  {matchPairs.map(p => (
                    <Button
                      key={p.ar}
                      variant={matchedItems.has(p.ar) ? 'secondary' : selectedMatch === p.ar ? 'default' : 'outline'}
                      className={`w-full justify-center text-sm h-12 ${matchedItems.has(p.ar) ? 'opacity-50' : ''}`}
                      onClick={() => handleMatchClick(p.ar, 'ar')}
                      disabled={matchedItems.has(p.ar)}
                    >
                      {p.ar}
                    </Button>
                  ))}
                </div>
              </div>
              {matchedItems.size === matchPairs.length * 2 && (
                <div className="text-center space-y-3 p-6 bg-emerald-50 rounded-xl">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
                  <div className="text-xl font-bold text-emerald-800">أحسنت! طابقت جميع الأزواج! 🎉</div>
                  <Button onClick={startMatchGame} variant="outline">العب مرة أخرى</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// GAMES SECTION
// ═══════════════════════════════════════════════════════════
function GamesSection({ memoryFlipped, handleMemoryClick, startMemoryGame, toneAnswer, setToneAnswer, toneScore, setToneScore, toneRound, setToneRound }: {
  memoryFlipped: number[]
  handleMemoryClick: (id: number) => void
  startMemoryGame: () => void
  toneAnswer: number | null
  setToneAnswer: (a: number | null) => void
  toneScore: number
  setToneScore: (s: number) => void
  toneRound: number
  setToneRound: (r: number) => void
}) {
  const store = useLearningStore()
  const { memoryCards, memoryMoves, memoryPairs, incrementStreak } = store

  const startToneGame = () => {
    setToneRound(0)
    setToneScore(0)
    setToneAnswer(null)
  }

  const currentToneSet = tonePairs[toneRound % tonePairs.length]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-red-600" />
          الألعاب التعليمية
        </h2>
      </div>

      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="memory">لعبة الذاكرة</TabsTrigger>
          <TabsTrigger value="tone">تمييز النبرات</TabsTrigger>
        </TabsList>

        {/* Memory Game */}
        <TabsContent value="memory" className="space-y-4">
          {!memoryCards.length ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🧠</div>
                <h3 className="text-lg font-bold text-gray-700">لعبة الذاكرة</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  اقلب البطاقات واعثر على الأزواج المتطابقة (الكلمة الصينية وترجمتها). اختبار ممتع لذاكرتك!
                </p>
                <Button onClick={() => { startMemoryGame(); incrementStreak() }} className="bg-red-600 hover:bg-red-700">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>المحاولات: {memoryMoves}</span>
                <span>الأزواج: {memoryPairs}/8</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {memoryCards.map(card => {
                  const isFlipped = memoryFlipped.includes(card.id) || card.matched
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleMemoryClick(card.id)}
                      className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 ${
                        isFlipped
                          ? card.matched
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      {isFlipped ? (
                        <div>
                          <div className="font-chinese-serif text-lg text-gray-900">{card.zh}</div>
                          <div className="text-[8px] text-gray-500 leading-tight">{card.ar}</div>
                        </div>
                      ) : (
                        <MessageCircle className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                  )
                })}
              </div>
              {memoryPairs === 8 && (
                <div className="text-center space-y-3 p-6 bg-emerald-50 rounded-xl">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
                  <div className="text-xl font-bold text-emerald-800">فزت! 🎉</div>
                  <div className="text-sm text-emerald-700">أكملت اللعبة في {memoryMoves} محاولة</div>
                  <Button onClick={startMemoryGame} variant="outline">العب مرة أخرى</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tone Game */}
        <TabsContent value="tone" className="space-y-4">
          {toneRound >= tonePairs.length && toneAnswer !== null ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <Trophy className={`w-16 h-16 ${toneScore >= 8 ? 'text-yellow-500' : 'text-gray-400'}`} />
                <h3 className="text-xl font-bold text-gray-900">انتهت اللعبة!</h3>
                <div className="text-3xl font-bold text-red-600">{toneScore}/{tonePairs.length}</div>
                <Button onClick={startToneGame} className="bg-red-600 hover:bg-red-700">
                  <RotateCcw className="w-4 h-4 ml-2" /> العب مرة أخرى
                </Button>
              </CardContent>
            </Card>
          ) : toneRound < tonePairs.length ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>الجولة {toneRound + 1}/{tonePairs.length}</span>
                  <span>النتيجة: {toneScore}</span>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-sm text-gray-500">اختر النبرة الصحيحة للكلمة:</div>
                  <Button variant="ghost" size="sm" onClick={() => speak(currentToneSet.tones[0].char)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع للنبرات
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {currentToneSet.tones.map((t, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className={`h-auto py-4 flex flex-col items-center gap-1 transition-all ${
                        toneAnswer === i
                          ? i === 0 ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (toneAnswer !== null) return
                        setToneAnswer(i)
                        if (i === 0) {
                          setToneScore(s => s + 1)
                        }
                        setTimeout(() => {
                          setToneRound(r => r + 1)
                          setToneAnswer(null)
                        }, 1500)
                      }}
                    >
                      <span className="font-chinese-serif text-3xl">{t.char}</span>
                      <span className="text-xs text-gray-600">{t.pinyin} — النبرة {t.tone}</span>
                      <span className="text-xs text-gray-400">{t.meaning}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🎵</div>
                <h3 className="text-lg font-bold text-gray-700">لعبة تمييز النبرات</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  اختبر قدرتك على تمييز النبرات الأربع في اللغة الصينية. ستحتاج للاستماع للكلمات وتحديد النبرة الصحيحة.
                </p>
                <Button onClick={() => { startToneGame(); incrementStreak() }} className="bg-red-600 hover:bg-red-700">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STORIES SECTION
// ═══════════════════════════════════════════════════════════
function StoriesSection({ activeStory, setActiveStory, storyAnswers, setStoryAnswers }: {
  activeStory: number
  setActiveStory: (s: number) => void
  storyAnswers: Record<number, number>
  setStoryAnswers: (a: Record<number, number>) => void
}) {
  const story = stories[activeStory]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-red-600" />
          القصص القصيرة
        </h2>
      </div>

      {/* Story Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stories.map((s, i) => (
          <Button
            key={s.id}
            variant={activeStory === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveStory(i); setStoryAnswers({}); incrementStreak() }}
            className={activeStory === i ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {s.title}
          </Button>
        ))}
      </div>

      {/* Story Content */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="text-lg">{story.title}</div>
              <div className="font-chinese-serif text-sm text-gray-500">{story.titleZh}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => speak(story.content[0].zh)}>
              <Volume2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {story.content.map((line, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => speak(line.zh)}
            >
              <div className="font-chinese-serif text-gray-900">{line.zh}</div>
              <div className="text-xs text-gray-500 font-chinese-sans mt-1">{line.pinyin}</div>
              <div className="text-sm text-gray-700 mt-1">{line.ar}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comprehension Questions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-500" />
            أسئلة الفهم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {story.questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <div className="font-chinese-serif text-sm text-gray-800 font-medium">{q.zh}</div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = storyAnswers[qi] === oi
                  const isCorrect = oi === q.correct
                  const answered = storyAnswers[qi] !== undefined
                  let cls = 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  if (answered) {
                    if (isCorrect) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    else if (selected) cls = 'border-red-400 bg-red-50 text-red-800'
                  } else if (selected) {
                    cls = 'border-red-300 bg-red-50 text-red-700'
                  }
                  return (
                    <Button
                      key={oi}
                      variant="outline"
                      size="sm"
                      className={`h-auto py-2 text-xs ${cls}`}
                      onClick={() => {
                        if (answered) return
                        setStoryAnswers({ ...storyAnswers, [qi]: oi })
                      }}
                    >
                      {opt}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
          {Object.keys(storyAnswers).length === story.questions.length && (
            <div className="text-center pt-2">
              {Object.entries(storyAnswers).every(([qi, oi]) => story.questions[Number(qi)].correct === oi) ? (
                <div className="text-emerald-700 font-bold">🎉 ممتاز! جميع الإجابات صحيحة!</div>
              ) : (
                <div className="text-amber-700 font-medium">حاول مرة أخرى! بعض الإجابات خاطئة.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ROADMAP SECTION
// ═══════════════════════════════════════════════════════════
function RoadmapSection() {
  const store = useLearningStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Map className="w-6 h-6 text-red-600" />
          خريطة الطريق
        </h2>
        <Badge variant="secondary">10 ساعات</Badge>
      </div>
      <p className="text-gray-500 text-sm">خطة دراسية مقترحة لإنهاء المستوى الأول خلال 10 ساعات</p>

      <div className="space-y-3">
        {roadmapUnits.map((unit) => {
          const totalWords = unit.words.length
          const learnedWords = unit.words.filter(id => store.isLearned(id)).length
          const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0
          const isComplete = progress === 100

          return (
            <Card key={unit.id} className={`border-0 shadow-sm card-hover transition-all ${isComplete ? 'ring-2 ring-emerald-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isComplete ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{unit.id}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{unit.title}</h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {unit.hours} ساعة
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{unit.desc}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-gray-500">{learnedWords}/{totalWords}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{totalWords} كلمة</Badge>
                      {unit.grammarIds.map(gid => {
                        const rule = grammarRules.find(r => r.id === gid)
                        return rule ? (
                          <Badge key={gid} variant="outline" className="text-[10px]">{rule.titleAr}</Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Total Time Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-red-50 to-amber-50">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">الإجمالي: 10 ساعات</h3>
          <p className="text-sm text-gray-600">
            بإمكانك إنهاء المستوى الأول خلال أسبوعين إذا تابعت الدراسة يومياً
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{roadmapUnits.reduce((a, u) => a + u.words.length, 0)}</div>
              <div className="text-gray-500">كلمة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{roadmapUnits.reduce((a, u) => a + new Set(u.grammarIds).size, 0)}</div>
              <div className="text-gray-500">قاعدة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">10</div>
              <div className="text-gray-500">وحدة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Helper for MoreHorizontal icon in mobile nav ───────────
function MoreHorizontal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  )
}
