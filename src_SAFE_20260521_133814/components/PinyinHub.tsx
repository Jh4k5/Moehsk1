'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Volume2, BookOpen, Headphones, Mic, Check, X, Lightbulb, Search, AlertTriangle, Play } from 'lucide-react'
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

// ─── Pinyin Data ────────────────────────────────────────────
interface InitialData {
  letter: string
  ipa: string
  example: string
  exampleMeaning: string
  similarToArabic: boolean
  category: string
}

const initials: InitialData[] = [
  { letter: 'b', ipa: '[p]', example: '爸 bà', exampleMeaning: 'أب', similarToArabic: true, category: 'plosive' },
  { letter: 'p', ipa: "[pʰ]", example: '怕 pà', exampleMeaning: 'يخاف', similarToArabic: true, category: 'plosive' },
  { letter: 'm', ipa: '[m]', example: '妈 mā', exampleMeaning: 'أم', similarToArabic: true, category: 'nasal' },
  { letter: 'f', ipa: '[f]', example: '飞 fēi', exampleMeaning: 'يطير', similarToArabic: true, category: 'fricative' },
  { letter: 'd', ipa: '[t]', example: '大 dà', exampleMeaning: 'كبير', similarToArabic: true, category: 'plosive' },
  { letter: 't', ipa: "[tʰ]", example: '天 tiān', exampleMeaning: 'سماء', similarToArabic: true, category: 'plosive' },
  { letter: 'n', ipa: '[n]', example: '你 nǐ', exampleMeaning: 'أنت', similarToArabic: true, category: 'nasal' },
  { letter: 'l', ipa: '[l]', example: '来 lái', exampleMeaning: 'يأتي', similarToArabic: true, category: 'liquid' },
  { letter: 'g', ipa: '[k]', example: '哥 gē', exampleMeaning: 'أخ أكبر', similarToArabic: true, category: 'plosive' },
  { letter: 'k', ipa: "[kʰ]", example: '看 kàn', exampleMeaning: 'ينظر', similarToArabic: true, category: 'plosive' },
  { letter: 'h', ipa: '[x]', example: '好 hǎo', exampleMeaning: 'جيد', similarToArabic: false, category: 'fricative' },
  { letter: 'j', ipa: "[tɕ]", example: '家 jiā', exampleMeaning: 'بيت', similarToArabic: false, category: 'affricate' },
  { letter: 'q', ipa: "[tɕʰ]", example: '去 qù', exampleMeaning: 'يذهب', similarToArabic: false, category: 'affricate' },
  { letter: 'x', ipa: 'ɕ', example: '小 xiǎo', exampleMeaning: 'صغير', similarToArabic: false, category: 'fricative' },
  { letter: 'zh', ipa: "[ʈʂ]", example: '中 zhōng', exampleMeaning: 'وسط', similarToArabic: false, category: 'affricate' },
  { letter: 'ch', ipa: "[ʈʂʰ]", example: '吃 chī', exampleMeaning: 'يأكل', similarToArabic: false, category: 'affricate' },
  { letter: 'sh', ipa: 'ʂ', example: '是 shì', exampleMeaning: 'يكون', similarToArabic: false, category: 'fricative' },
  { letter: 'r', ipa: 'ʐ', example: '人 rén', exampleMeaning: 'شخص', similarToArabic: false, category: 'fricative' },
  { letter: 'z', ipa: '[ts]', example: '坐 zuò', exampleMeaning: 'يجلس', similarToArabic: false, category: 'affricate' },
  { letter: 'c', ipa: "[tsʰ]", example: '菜 cài', exampleMeaning: 'خضار', similarToArabic: false, category: 'affricate' },
  { letter: 's', ipa: '[s]', example: '三 sān', exampleMeaning: 'ثلاثة', similarToArabic: true, category: 'fricative' },
  { letter: 'y', ipa: '[j]', example: '一 yī', exampleMeaning: 'واحد', similarToArabic: false, category: 'semi-vowel' },
  { letter: 'w', ipa: '[w]', example: '我 wǒ', exampleMeaning: 'أنا', similarToArabic: true, category: 'semi-vowel' },
]

interface FinalData {
  final: string
  ipa: string
  tones: string[]
  examples: string[]
  similarToArabic: boolean
}

const finals: FinalData[] = [
  { final: 'a', ipa: '[a]', tones: ['ā', 'á', 'ǎ', 'à'], examples: ['妈 mā', '麻 má', '马 mǎ', '骂 mà'], similarToArabic: true },
  { final: 'o', ipa: '[o]', tones: ['ō', 'ó', 'ǒ', 'ò'], examples: ['哦 ō', '哦 ó', '哦 ǒ', '哦 ò'], similarToArabic: true },
  { final: 'e', ipa: 'ɤ', tones: ['ē', 'é', 'ě', 'è'], examples: ['鹅 é', '额 é', '恶 ě', '饿 è'], similarToArabic: false },
  { final: 'i', ipa: '[i]', tones: ['ī', 'í', 'ǐ', 'ì'], examples: ['衣 yī', '移 yí', '已 yǐ', '意 yì'], similarToArabic: true },
  { final: 'u', ipa: '[u]', tones: ['ū', 'ú', 'ǔ', 'ù'], examples: ['乌 wū', '无 wú', '五 wǔ', '物 wù'], similarToArabic: true },
  { final: 'ü', ipa: '[y]', tones: ['ǖ', 'ǘ', 'ǚ', 'ǜ'], examples: ['鱼 yú', '雨 yǔ', '玉 yù', '女 nǚ'], similarToArabic: false },
  { final: 'ai', ipa: '[aɪ]', tones: ['āi', 'ái', 'ǎi', 'ài'], examples: ['爱 ài', '矮 ǎi', '艾 ài'], similarToArabic: true },
  { final: 'ei', ipa: '[eɪ]', tones: ['ēi', 'éi', 'ěi', 'èi'], examples: ['飞 fēi', '肥 féi', '非 fēi'], similarToArabic: false },
  { final: 'ao', ipa: '[aʊ]', tones: ['āo', 'áo', 'ǎo', 'ào'], examples: ['熬 áo', '袄 ǎo', '傲 ào'], similarToArabic: true },
  { final: 'ou', ipa: '[oʊ]', tones: ['ōu', 'óu', 'ǒu', 'òu'], examples: ['欧 ōu', '偶 ǒu', '欧 ōu'], similarToArabic: false },
  { final: 'an', ipa: '[an]', tones: ['ān', 'án', 'ǎn', 'àn'], examples: ['安 ān', '暗 àn', '三 sān'], similarToArabic: true },
  { final: 'en', ipa: '[ən]', tones: ['ēn', 'én', 'ěn', 'èn'], examples: ['恩 ēn', '人 rén', '问 wèn'], similarToArabic: false },
  { final: 'ang', ipa: '[aŋ]', tones: ['āng', 'áng', 'ǎng', 'àng'], examples: ['帮 bāng', '忙 máng', '让 ràng'], similarToArabic: false },
  { final: 'eng', ipa: '[əŋ]', tones: ['ēng', 'éng', 'ěng', 'èng'], examples: ['风 fēng', '能 néng', '冷 lěng'], similarToArabic: false },
  { final: 'ong', ipa: '[ʊŋ]', tones: ['ōng', 'óng', 'ǒng', 'òng'], examples: ['中 zhōng', '东 dōng', '红 hóng'], similarToArabic: false },
  { final: 'er', ipa: 'ɚ', tones: ['ēr', 'ér', 'ěr', 'èr'], examples: ['儿 ér', '二 èr', '耳 ěr'], similarToArabic: true },
]

interface ToneData {
  number: number
  nameAr: string
  nameEn: string
  description: string
  example: string
  exampleMeaning: string
  curveType: 'flat' | 'rising' | 'dip' | 'falling' | 'neutral'
  color: string
}

const tones: ToneData[] = [
  { number: 1, nameAr: 'النبرة الأولى', nameEn: 'First Tone', description: 'مسطحة عالية - صوت مستمر عالي', example: '妈', exampleMeaning: 'أم', curveType: 'flat', color: '#ef4444' },
  { number: 2, nameAr: 'النبرة الثانية', nameEn: 'Second Tone', description: 'صاعدة - يرتفع الصوت من منخفض إلى عالي', example: '麻', exampleMeaning: 'قنب', curveType: 'rising', color: '#f97316' },
  { number: 3, nameAr: 'النبرة الثالثة', nameEn: 'Third Tone', description: 'هابطة ثم صاعدة - ينخفض ثم يرتفع', example: '马', exampleMeaning: 'حصان', curveType: 'dip', color: '#22c55e' },
  { number: 4, nameAr: 'النبرة الرابعة', nameEn: 'Fourth Tone', description: 'هابطة حادة - ينخفض الصوت بسرعة', example: '骂', exampleMeaning: 'يشتم', curveType: 'falling', color: '#3b82f6' },
  { number: 0, nameAr: 'النبرة المحايدة', nameEn: 'Neutral Tone', description: 'خفيفة وقصيرة - نطق سريع خفيف', example: '吗', exampleMeaning: 'أداة استفهام', curveType: 'neutral', color: '#8b5cf6' },
]

interface SpecialSound {
  chinese: string
  ipa: string
  arabicClosest: string
  description: string
  practiceExample: string
  practiceMeaning: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const specialSounds: SpecialSound[] = [
  { chinese: 'zh', ipa: 'ʈʂ', arabicClosest: 'ج', description: 'يُنطق من منتصف اللسان مع تقوس أعمق', practiceExample: '中国 Zhōngguó', practiceMeaning: 'الصين', difficulty: 'hard' },
  { chinese: 'ch', ipa: 'ʈʂʰ', arabicClosest: 'تش', description: 'مثل zh لكن مع نفخ هواء', practiceExample: '吃 chī', practiceMeaning: 'يأكل', difficulty: 'hard' },
  { chinese: 'sh', ipa: 'ʂ', arabicClosest: 'ش', description: 'أقرب للعربية لكن مع تقوس اللسان أكثر', practiceExample: '老师 lǎoshī', practiceMeaning: 'معلم', difficulty: 'medium' },
  { chinese: 'r', ipa: 'ʐ', arabicClosest: 'ر/غ', description: 'صوت ممزوج بين الراء والغين المصرية', practiceExample: '人 rén', practiceMeaning: 'شخص', difficulty: 'hard' },
  { chinese: 'x', ipa: 'ɕ', arabicClosest: 'ش', description: 'أرق من الشين العربية، قرب الحنك', practiceExample: '小 xiǎo', practiceMeaning: 'صغير', difficulty: 'medium' },
  { chinese: 'q', ipa: "tɕʰ", arabicClosest: 'تش', description: 'مثل j مع نفخ هواء أقوى', practiceExample: '去 qù', practiceMeaning: 'يذهب', difficulty: 'hard' },
  { chinese: 'j', ipa: 'tɕ', arabicClosest: 'ج', description: 'مثل الجيم المصرية لكن أقرب للحنك', practiceExample: '家 jiā', practiceMeaning: 'بيت', difficulty: 'medium' },
  { chinese: 'ü', ipa: '[y]', arabicClosest: 'ي', description: 'مثل الياء مع شفاه مدورة (لا يوجد في العربية)', practiceExample: '女 nǚ', practiceMeaning: 'امرأة', difficulty: 'hard' },
  { chinese: 'h', ipa: '[x]', arabicClosest: 'ح', description: 'أقرب للحاء لكن من أعمق في الحلق', practiceExample: '好 hǎo', practiceMeaning: 'جيد', difficulty: 'easy' },
  { chinese: 'ng', ipa: '[ŋ]', arabicClosest: 'نغ', description: 'حرف أنفوي لا يوجد في العربية', practiceExample: '中 zhōng', practiceMeaning: 'وسط', difficulty: 'medium' },
]

// ─── Syllable combinations for review table ────────────────
const syllableCombinations = [
  { initial: 'b', final: 'a', syllable: 'ba', example: '八 bā', exampleMeaning: 'ثمانية' },
  { initial: 'b', final: 'ai', syllable: 'bai', example: '白 bái', exampleMeaning: 'أبيض' },
  { initial: 'b', final: 'an', syllable: 'ban', example: '班 bān', exampleMeaning: 'فصل' },
  { initial: 'p', final: 'in', syllable: 'pin', example: '品 pǐn', exampleMeaning: 'منتج' },
  { initial: 'm', final: 'a', syllable: 'ma', example: '妈 mā', exampleMeaning: 'أم' },
  { initial: 'm', final: 'ei', syllable: 'mei', example: '没 méi', exampleMeaning: 'ليس لديه' },
  { initial: 'f', final: 'ei', syllable: 'fei', example: '飞 fēi', exampleMeaning: 'يطير' },
  { initial: 'd', final: 'a', syllable: 'da', example: '大 dà', exampleMeaning: 'كبير' },
  { initial: 'd', final: 'i', syllable: 'di', example: '弟 dì', exampleMeaning: 'أخ أصغر' },
  { initial: 'd', final: 'ao', syllable: 'dao', example: '到 dào', exampleMeaning: 'يصل' },
  { initial: 't', final: 'a', syllable: 'ta', example: '他 tā', exampleMeaning: 'هو' },
  { initial: 't', final: 'ian', syllable: 'tian', example: '天 tiān', exampleMeaning: 'سماء' },
  { initial: 'n', final: 'i', syllable: 'ni', example: '你 nǐ', exampleMeaning: 'أنت' },
  { initial: 'n', final: 'ao', syllable: 'nao', example: '脑 nǎo', exampleMeaning: 'دماغ' },
  { initial: 'l', final: 'i', syllable: 'li', example: '里 lǐ', exampleMeaning: 'داخل' },
  { initial: 'g', final: 'e', syllable: 'ge', example: '哥 gē', exampleMeaning: 'أخ أكبر' },
  { initial: 'g', final: 'ou', syllable: 'gou', example: '狗 gǒu', exampleMeaning: 'كلب' },
  { initial: 'k', final: 'an', syllable: 'kan', example: '看 kàn', exampleMeaning: 'ينظر' },
  { initial: 'h', final: 'ao', syllable: 'hao', example: '好 hǎo', exampleMeaning: 'جيد' },
  { initial: 'h', final: 'ua', syllable: 'hua', example: '花 huā', exampleMeaning: 'زهرة' },
  { initial: 'j', final: 'i', syllable: 'ji', example: '几 jǐ', exampleMeaning: 'كم' },
  { initial: 'j', final: 'ia', syllable: 'jia', example: '家 jiā', exampleMeaning: 'بيت' },
  { initial: 'q', final: 'i', syllable: 'qi', example: '七 qī', exampleMeaning: 'سبعة' },
  { initial: 'x', final: 'i', syllable: 'xi', example: '小 xiǎo', exampleMeaning: 'صغير' },
  { initial: 'zh', final: 'ong', syllable: 'zhong', example: '中 zhōng', exampleMeaning: 'وسط' },
  { initial: 'ch', final: 'i', syllable: 'chi', example: '吃 chī', exampleMeaning: 'يأكل' },
  { initial: 'sh', final: 'i', syllable: 'shi', example: '是 shì', exampleMeaning: 'يكون' },
  { initial: 'r', final: 'en', syllable: 'ren', example: '人 rén', exampleMeaning: 'شخص' },
  { initial: 'z', final: 'i', syllable: 'zi', example: '字 zì', exampleMeaning: 'حرف' },
  { initial: 'c', final: 'ai', syllable: 'cai', example: '菜 cài', exampleMeaning: 'خضار' },
  { initial: 's', final: 'an', syllable: 'san', example: '三 sān', exampleMeaning: 'ثلاثة' },
  { initial: 'y', final: 'i', syllable: 'yi', example: '一 yī', exampleMeaning: 'واحد' },
  { initial: 'w', final: 'o', syllable: 'wo', example: '我 wǒ', exampleMeaning: 'أنا' },
]

// ─── Tone Curve Component ───────────────────────────────────
function ToneCurve({ type, color }: { type: string; color: string }) {
  const pathData = (() => {
    switch (type) {
      case 'flat': return 'M 10 30 L 90 30'
      case 'rising': return 'M 10 50 Q 50 40 90 10'
      case 'dip': return 'M 10 20 Q 30 60 50 50 Q 70 40 90 10'
      case 'falling': return 'M 10 10 Q 50 30 90 55'
      case 'neutral': return 'M 10 40 Q 50 38 90 40'
      default: return ''
    }
  })()

  return (
    <svg viewBox="0 0 100 65" className="w-24 h-16">
      <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="5" y1="5" x2="5" y2="60" stroke="#e5e7eb" strokeWidth="1" />
      <line x1="5" y1="60" x2="95" y2="60" stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function PinyinHub() {
  const [initialFilter, setInitialFilter] = useState<'all' | 'similar' | 'new'>('all')
  const [reviewSearch, setReviewSearch] = useState('')
  const [toneAnswer, setToneAnswer] = useState<number | null>(null)
  const [toneQuestion, setToneQuestion] = useState<{ char: string; pinyin: string; correctTone: number } | null>(null)
  const [toneScore, setToneScore] = useState(0)
  const [toneRound, setToneRound] = useState(0)
  const [soundAnswer, setSoundAnswer] = useState<number | null>(null)
  const [soundQuestion, setSoundQuestion] = useState<{ char: string; pinyin: string; meaning: string; options: string[]; correctIndex: number } | null>(null)

  // Filter initials
  const filteredInitials = useMemo(() => {
    if (initialFilter === 'similar') return initials.filter(i => i.similarToArabic)
    if (initialFilter === 'new') return initials.filter(i => !i.similarToArabic)
    return initials
  }, [initialFilter])

  // Filter syllables for review table
  const filteredSyllables = useMemo(() => {
    if (!reviewSearch.trim()) return syllableCombinations
    const q = reviewSearch.toLowerCase()
    return syllableCombinations.filter(s =>
      s.syllable.includes(q) ||
      s.example.toLowerCase().includes(q) ||
      s.exampleMeaning.includes(q) ||
      s.initial.includes(q) ||
      s.final.includes(q)
    )
  }, [reviewSearch])

  // Tone quiz generation
  const generateToneQuestion = () => {
    const chars = [
      { char: '妈', pinyin: 'mā', correctTone: 1 },
      { char: '麻', pinyin: 'má', correctTone: 2 },
      { char: '马', pinyin: 'mǎ', correctTone: 3 },
      { char: '骂', pinyin: 'mà', correctTone: 4 },
      { char: '八', pinyin: 'bā', correctTone: 1 },
      { char: '拔', pinyin: 'bá', correctTone: 2 },
      { char: '把', pinyin: 'bǎ', correctTone: 3 },
      { char: '爸', pinyin: 'bà', correctTone: 4 },
      { char: '衣', pinyin: 'yī', correctTone: 1 },
      { char: '移', pinyin: 'yí', correctTone: 2 },
      { char: '已', pinyin: 'yǐ', correctTone: 3 },
      { char: '意', pinyin: 'yì', correctTone: 4 },
      { char: '天', pinyin: 'tiān', correctTone: 1 },
      { char: '田', pinyin: 'tián', correctTone: 2 },
      { char: '点', pinyin: 'diǎn', correctTone: 3 },
      { char: '电', pinyin: 'diàn', correctTone: 4 },
    ]
    const q = chars[Math.floor(Math.random() * chars.length)]
    setToneQuestion(q)
    setToneAnswer(null)
    speak(q.char)
  }

  const handleToneAnswer = (tone: number) => {
    setToneAnswer(tone)
    if (toneQuestion && tone === toneQuestion.correctTone) {
      setToneScore(prev => prev + 1)
    }
    setToneRound(prev => prev + 1)
  }

  // Sound quiz generation
  const generateSoundQuestion = () => {
    const allSounds = initials.filter(i => i.example)
    const correct = allSounds[Math.floor(Math.random() * allSounds.length)]
    const wrongOptions = allSounds.filter(i => i.letter !== correct.letter).sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...wrongOptions, correct].sort(() => Math.random() - 0.5)
    setSoundQuestion({
      char: correct.example.split(' ')[0],
      pinyin: correct.example,
      meaning: correct.exampleMeaning,
      options: options.map(o => o.letter),
      correctIndex: options.indexOf(correct),
    })
    setSoundAnswer(null)
    speak(correct.example.split(' ')[0])
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-red-700 flex items-center justify-center gap-3">
          <Headphones className="w-8 h-8" />
          مركز تعلّم البينيين
        </h2>
        <p className="text-gray-600">تعلّم الأصوات والنبرات الصينية بطريقة تفاعلية</p>
      </div>

      <Tabs defaultValue="initials" className="w-full" dir="rtl">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="initials" className="text-xs sm:text-sm">الأصوات الابتدائية</TabsTrigger>
          <TabsTrigger value="finals" className="text-xs sm:text-sm">الأصوات النهائية</TabsTrigger>
          <TabsTrigger value="tones" className="text-xs sm:text-sm">النبرات</TabsTrigger>
          <TabsTrigger value="special" className="text-xs sm:text-sm">أصوات خاصة</TabsTrigger>
          <TabsTrigger value="practice" className="text-xs sm:text-sm">تمارين</TabsTrigger>
          <TabsTrigger value="review" className="text-xs sm:text-sm">جدول المراجعة</TabsTrigger>
        </TabsList>

        {/* ─── Initials Tab ─────────────────────────────────── */}
        <TabsContent value="initials" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all' as const, label: 'جميع' },
              { value: 'similar' as const, label: 'أصوات مألوفة' },
              { value: 'new' as const, label: 'أصوات جديدة' },
            ].map(f => (
              <Button
                key={f.value}
                variant={initialFilter === f.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInitialFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredInitials.map((item, idx) => (
              <motion.div
                key={item.letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 h-full ${
                    item.similarToArabic ? 'border-green-300 hover:border-green-500' : 'border-red-300 hover:border-red-500'
                  }`}
                  onClick={() => speak(item.example.split(' ')[0])}
                >
                  <CardContent className="p-3 text-center space-y-1">
                    <div className="text-3xl font-bold font-chinese-serif text-red-700">{item.letter}</div>
                    <div className="text-xs text-gray-500">{item.ipa}</div>
                    <div className="font-chinese-serif text-lg">{item.example}</div>
                    <div className="text-xs text-gray-600">{item.exampleMeaning}</div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 mx-auto" onClick={(e) => { e.stopPropagation(); speak(item.example.split(' ')[0]) }}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Badge variant={item.similarToArabic ? 'default' : 'destructive'} className="text-[10px]">
                      {item.similarToArabic ? 'مألوف' : 'جديد'}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ─── Finals Tab ───────────────────────────────────── */}
        <TabsContent value="finals" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {finals.map((item, idx) => (
              <motion.div
                key={item.final}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    item.similarToArabic ? 'border-green-300' : 'border-red-300'
                  }`}
                  onClick={() => speak(item.examples[0]?.split(' ')[0] || '')}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="text-3xl font-bold text-red-700">{item.final}</div>
                    <div className="text-xs text-gray-500">{item.ipa}</div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {item.tones.map((t, ti) => (
                        <Badge key={ti} variant="outline" className="text-xs font-chinese-sans">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      {item.examples.map((ex, i) => (
                        <div key={i} className="font-chinese-serif">{ex}</div>
                      ))}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 mx-auto">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ─── Tones Tab ────────────────────────────────────── */}
        <TabsContent value="tones" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tones.map((tone) => (
              <motion.div
                key={tone.number}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all border-2"
                  style={{ borderColor: tone.color }}
                  onClick={() => speak(tone.example)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge style={{ backgroundColor: tone.color, color: 'white' }}>
                        {tone.number === 0 ? 'خفيفة' : `${tone.number}`}
                      </Badge>
                      <h4 className="font-bold text-lg">{tone.nameAr}</h4>
                    </div>
                    <div className="flex justify-center">
                      <ToneCurve type={tone.curveType} color={tone.color} />
                    </div>
                    <p className="text-sm text-gray-600">{tone.description}</p>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <span className="font-chinese-serif text-2xl ml-2">{tone.example}</span>
                        <span className="text-sm text-gray-500">{tone.exampleMeaning}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => speak(tone.example)}>
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tone comparison: ma syllable */}
          <Card className="mt-6 border-2 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg">مقارنة النبرات — ma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { tone: 1, char: '妈', pinyin: 'mā', meaning: 'أم', color: '#ef4444' },
                  { tone: 2, char: '麻', pinyin: 'má', meaning: 'قنب', color: '#f97316' },
                  { tone: 3, char: '马', pinyin: 'mǎ', meaning: 'حصان', color: '#22c55e' },
                  { tone: 4, char: '骂', pinyin: 'mà', meaning: 'يشتم', color: '#3b82f6' },
                ].map(t => (
                  <div
                    key={t.tone}
                    className="text-center cursor-pointer p-3 rounded-xl hover:bg-red-50 transition-colors"
                    onClick={() => speak(t.char)}
                    style={{ borderBottom: `3px solid ${t.color}` }}
                  >
                    <div className="font-chinese-serif text-4xl mb-1">{t.char}</div>
                    <div className="text-sm font-chinese-sans">{t.pinyin}</div>
                    <div className="text-xs text-gray-600">{t.meaning}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Special Sounds Tab ───────────────────────────── */}
        <TabsContent value="special" className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                هذه الأصوات لا توجد في اللغة العربية. ركّز على ممارستها لأنها من أكثر الأصوات التي يخطئ فيها المتحدثون بالعربية.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {specialSounds.map((sound, idx) => (
              <motion.div
                key={sound.chinese}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-2xl font-bold text-red-700 w-12 text-center">{sound.chinese}</div>
                        <Badge variant={sound.difficulty === 'hard' ? 'destructive' : sound.difficulty === 'medium' ? 'default' : 'secondary'}>
                          {sound.difficulty === 'hard' ? 'صعب' : sound.difficulty === 'medium' ? 'متوسط' : 'سهل'}
                        </Badge>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-500">الأقرب بالعربية: </span>
                          <span className="font-bold text-gray-800">{sound.arabicClosest}</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-gray-500">IPA: </span>
                          <span className="font-mono text-gray-700">{sound.ipa}</span>
                        </div>
                        <p className="text-sm text-gray-600">{sound.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-sm">
                          <div className="font-chinese-serif">{sound.practiceExample}</div>
                          <div className="text-xs text-gray-500">{sound.practiceMeaning}</div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => speak(sound.practiceExample.split(' ')[0])}>
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ─── Practice Tab ─────────────────────────────────── */}
        <TabsContent value="practice" className="space-y-6">
          {/* Exercise 1: Listen and Choose Tone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Headphones className="w-5 h-5 text-red-600" />
                تمرين 1: استمع واختر النبرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">النتيجة: {toneScore}/{toneRound}</Badge>
                <Button onClick={generateToneQuestion} size="sm">
                  <Play className="w-4 h-4 ml-1" />
                  سؤال جديد
                </Button>
              </div>

              {toneQuestion ? (
                <div className="space-y-4">
                  <div className="text-center bg-red-50 rounded-xl p-6">
                    <Button variant="ghost" size="lg" className="mb-2" onClick={() => speak(toneQuestion.char)}>
                      <Volume2 className="w-8 h-8 text-red-600" />
                    </Button>
                    <div className="font-chinese-serif text-5xl text-red-700">{toneQuestion.char}</div>
                    <div className="text-sm text-gray-500 mt-2 font-chinese-sans">{toneQuestion.pinyin}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {tones.filter(t => t.number > 0).map(tone => (
                      <Button
                        key={tone.number}
                        variant={toneAnswer === null ? 'outline' : tone.number === toneQuestion.correctTone ? 'default' : 'destructive'}
                        className="h-20 flex-col gap-1"
                        onClick={() => toneAnswer === null && handleToneAnswer(tone.number)}
                        disabled={toneAnswer !== null}
                      >
                        <ToneCurve type={tone.curveType} color={tone.color} />
                        <span className="text-xs">{tone.nameAr}</span>
                      </Button>
                    ))}
                  </div>

                  {toneAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-center p-3 rounded-lg ${toneAnswer === toneQuestion.correctTone ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                    >
                      {toneAnswer === toneQuestion.correctTone ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" /> إجابة صحيحة! 🎉
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-5 h-5" /> النبرة الصحيحة هي {toneQuestion.correctTone}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Mic className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>اضغط &quot;سؤال جديد&quot; للبدء</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercise 2: Choose Correct Sound */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mic className="w-5 h-5 text-red-600" />
                تمرين 2: اختر الصوت الصحيح
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateSoundQuestion} size="sm">
                <Play className="w-4 h-4 ml-1" />
                سؤال جديد
              </Button>

              {soundQuestion ? (
                <div className="space-y-4">
                  <div className="text-center bg-red-50 rounded-xl p-6">
                    <Button variant="ghost" size="lg" className="mb-2" onClick={() => speak(soundQuestion.char)}>
                      <Volume2 className="w-8 h-8 text-red-600" />
                    </Button>
                    <div className="text-sm text-gray-500">{soundQuestion.meaning}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {soundQuestion.options.map((opt, i) => (
                      <Button
                        key={opt}
                        variant={soundAnswer === null ? 'outline' : i === soundQuestion.correctIndex ? 'default' : 'destructive'}
                        className="h-16 text-xl font-bold"
                        onClick={() => { setSoundAnswer(i); speak(opt) }}
                        disabled={soundAnswer !== null}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>

                  {soundAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-center p-3 rounded-lg ${soundAnswer === soundQuestion.correctIndex ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                    >
                      {soundAnswer === soundQuestion.correctIndex ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" /> صحيح! الصوت هو {soundQuestion.options[soundQuestion.correctIndex]}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-5 h-5" /> الصوت الصحيح هو {soundQuestion.options[soundQuestion.correctIndex]}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>اضغط &quot;سؤال جديد&quot; للبدء</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Review Table Tab ─────────────────────────────── */}
        <TabsContent value="review" className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ابحث في الجدول..."
              className="pr-10"
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b text-right">
                      <th className="p-3 text-gray-600">الأول</th>
                      <th className="p-3 text-gray-600">الأخير</th>
                      <th className="p-3 text-gray-600">المقطع</th>
                      <th className="p-3 text-gray-600">مثال</th>
                      <th className="p-3 text-gray-600">المعنى</th>
                      <th className="p-3 text-gray-600">🔊</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSyllables.map((row, idx) => (
                      <motion.tr
                        key={`${row.initial}-${row.final}-${idx}`}
                        className="border-b hover:bg-red-50/50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        <td className="p-3 font-bold text-red-700">{row.initial}</td>
                        <td className="p-3 font-bold text-red-600">{row.final}</td>
                        <td className="p-3 font-mono font-semibold">{row.syllable}</td>
                        <td className="p-3 font-chinese-serif">{row.example}</td>
                        <td className="p-3 text-gray-600">{row.exampleMeaning}</td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => speak(row.example.split(' ')[0])}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-gray-500 text-center">
            عرض {filteredSyllables.length} من {syllableCombinations.length} مقطع
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
