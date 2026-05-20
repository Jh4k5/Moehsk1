'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Volume2, Headphones, BookOpen, Info, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

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

// ─── Tone Data ──────────────────────────────────────────────
interface ToneData {
  number: number
  label: string
  nameAr: string
  description: string
  example: string
  pinyin: string
  meaning: string
  color: string
}

const tones: ToneData[] = [
  {
    number: 1,
    label: '١',
    nameAr: 'النبرة الأولى — مسطحة عالية',
    description: 'صوت ثابت ومستمر على ارتفاع عالٍ. النطق مستقر بدون تغيير في الارتفاع.',
    example: '妈',
    pinyin: 'mā',
    meaning: 'أم',
    color: '#3b82f6',
  },
  {
    number: 2,
    label: '٢',
    nameAr: 'النبرة الثانية — صاعدة',
    description: 'الصوت يرتفع من المنخفض إلى العالي. مثلما تسأل شخصاً: "هل فعلاً؟"',
    example: '麻',
    pinyin: 'má',
    meaning: 'قنب / خدر',
    color: '#22c55e',
  },
  {
    number: 3,
    label: '٣',
    nameAr: 'النبرة الثالثة — هابط ثم صاعد',
    description: 'الصوت ينخفض ثم يعود ويرتفع. مثلما تتفق مع شخص وتميل رأسك.',
    example: '马',
    pinyin: 'mǎ',
    meaning: 'حصان',
    color: '#f97316',
  },
  {
    number: 4,
    label: '٤',
    nameAr: 'النبرة الرابعة — هابطة حادة',
    description: 'الصوت ينخفض بسرعة من عالي إلى منخفض. مثلما تأمر شخصاً: "قف!"',
    example: '骂',
    pinyin: 'mà',
    meaning: 'يشتم',
    color: '#ef4444',
  },
  {
    number: 0,
    label: '٠',
    nameAr: 'النبرة المحايدة — خفيفة وقصيرة',
    description: 'نطق خفيف وقصير بدون نبرة واضحة. تُستخدم في الكلمات الثانوية مثل أداة الاستفهام.',
    example: '吗',
    pinyin: 'ma',
    meaning: 'أداة استفهام',
    color: '#6b7280',
  },
]

// ─── Ma Comparison ──────────────────────────────────────────
const maComparison = [
  { char: '妈', pinyin: 'mā', meaning: 'أم', tone: 1, color: '#3b82f6' },
  { char: '麻', pinyin: 'má', meaning: 'قنب', tone: 2, color: '#22c55e' },
  { char: '马', pinyin: 'mǎ', meaning: 'حصان', tone: 3, color: '#f97316' },
  { char: '骂', pinyin: 'mà', meaning: 'يشتم', tone: 4, color: '#ef4444' },
]

// ─── Initials Data ──────────────────────────────────────────
interface InitialData {
  letter: string
  ipa: string
  example: string
  exampleChar: string
  exampleMeaning: string
  arabicExplanation: string
  similarToArabic: boolean
}

const initials: InitialData[] = [
  { letter: 'b', ipa: '[p]', example: '爸 bà', exampleChar: '爸', exampleMeaning: 'أب', arabicExplanation: 'مثل الباء بدون نفخ', similarToArabic: true },
  { letter: 'p', ipa: "[pʰ]", example: '怕 pà', exampleChar: '怕', exampleMeaning: 'يخاف', arabicExplanation: 'مثل الباء مع نفخ هواء', similarToArabic: true },
  { letter: 'm', ipa: '[m]', example: '妈 mā', exampleChar: '妈', exampleMeaning: 'أم', arabicExplanation: 'مثل الميم تماماً', similarToArabic: true },
  { letter: 'f', ipa: '[f]', example: '飞 fēi', exampleChar: '飞', exampleMeaning: 'يطير', arabicExplanation: 'مثل الفاء', similarToArabic: true },
  { letter: 'd', ipa: '[t]', example: '大 dà', exampleChar: '大', exampleMeaning: 'كبير', arabicExplanation: 'مثل الدال', similarToArabic: true },
  { letter: 't', ipa: "[tʰ]", example: '天 tiān', exampleChar: '天', exampleMeaning: 'سماء', arabicExplanation: 'مثل التاء مع نفخ هواء', similarToArabic: true },
  { letter: 'n', ipa: '[n]', example: '你 nǐ', exampleChar: '你', exampleMeaning: 'أنت', arabicExplanation: 'مثل النون', similarToArabic: true },
  { letter: 'l', ipa: '[l]', example: '来 lái', exampleChar: '来', exampleMeaning: 'يأتي', arabicExplanation: 'مثل اللام', similarToArabic: true },
  { letter: 'g', ipa: '[k]', example: '哥 gē', exampleChar: '哥', exampleMeaning: 'أخ أكبر', arabicExplanation: 'مثل الكاف', similarToArabic: true },
  { letter: 'k', ipa: "[kʰ]", example: '看 kàn', exampleChar: '看', exampleMeaning: 'ينظر', arabicExplanation: 'مثل الكاف مع نفخ هواء', similarToArabic: true },
  { letter: 'h', ipa: '[x]', example: '好 hǎo', exampleChar: '好', exampleMeaning: 'جيد', arabicExplanation: 'أقرب للحاء لكن من أعمق في الحلق', similarToArabic: false },
  { letter: 'j', ipa: '[tɕ]', example: '家 jiā', exampleChar: '家', exampleMeaning: 'بيت', arabicExplanation: 'مثل الجيم المصرية أقرب للحنك', similarToArabic: false },
  { letter: 'q', ipa: "[tɕʰ]", example: '去 qù', exampleChar: '去', exampleMeaning: 'يذهب', arabicExplanation: 'مثل j مع نفخ هواء أقوى', similarToArabic: false },
  { letter: 'x', ipa: '[ɕ]', example: '小 xiǎo', exampleChar: '小', exampleMeaning: 'صغير', arabicExplanation: 'أرق من الشين العربية قرب الحنك', similarToArabic: false },
  { letter: 'zh', ipa: '[ʈʂ]', example: '中 zhōng', exampleChar: '中', exampleMeaning: 'وسط', arabicExplanation: 'يُنطق مع تقوس أعمق للسان', similarToArabic: false },
  { letter: 'ch', ipa: '[ʈʂʰ]', example: '吃 chī', exampleChar: '吃', exampleMeaning: 'يأكل', arabicExplanation: 'مثل zh مع نفخ هواء', similarToArabic: false },
  { letter: 'sh', ipa: '[ʂ]', example: '是 shì', exampleChar: '是', exampleMeaning: 'يكون', arabicExplanation: 'أقرب للشين مع تقوس اللسان', similarToArabic: false },
  { letter: 'r', ipa: '[ʐ]', example: '人 rén', exampleChar: '人', exampleMeaning: 'شخص', arabicExplanation: 'مزيج بين الراء والغين المصرية', similarToArabic: false },
  { letter: 'z', ipa: '[ts]', example: '坐 zuò', exampleChar: '坐', exampleMeaning: 'يجلس', arabicExplanation: 'مثل الزاي بدون نفخ', similarToArabic: false },
  { letter: 'c', ipa: "[tsʰ]", example: '菜 cài', exampleChar: '菜', exampleMeaning: 'خضار', arabicExplanation: 'مثل الزاي مع نفخ هواء', similarToArabic: false },
  { letter: 's', ipa: '[s]', example: '三 sān', exampleChar: '三', exampleMeaning: 'ثلاثة', arabicExplanation: 'مثل السين', similarToArabic: true },
  { letter: 'y', ipa: '[j]', example: '一 yī', exampleChar: '一', exampleMeaning: 'واحد', arabicExplanation: 'مثل الياء (حرف 半元音)', similarToArabic: false },
  { letter: 'w', ipa: '[w]', example: '我 wǒ', exampleChar: '我', exampleMeaning: 'أنا', arabicExplanation: 'مثل الواو (حرف شبه حرف علة)', similarToArabic: true },
]

// ─── Finals Data ────────────────────────────────────────────
interface FinalData {
  final: string
  ipa: string
  example: string
  exampleChar: string
  exampleMeaning: string
  arabicExplanation: string
  similarToArabic: boolean
}

const finals: FinalData[] = [
  { final: 'a', ipa: '[a]', example: '八 bā', exampleChar: '八', exampleMeaning: 'ثمانية', arabicExplanation: 'مثل الألف العربية', similarToArabic: true },
  { final: 'o', ipa: '[o]', example: '哦 ò', exampleChar: '哦', exampleMeaning: 'آه', arabicExplanation: 'مثل الواو المضمومة', similarToArabic: true },
  { final: 'e', ipa: '[ɤ]', example: '鹅 é', exampleChar: '鹅', exampleMeaning: 'أوزة', arabicExplanation: 'صوت بين الألف والهمزة', similarToArabic: false },
  { final: 'i', ipa: '[i]', example: '衣 yī', exampleChar: '衣', exampleMeaning: 'ملابس', arabicExplanation: 'مثل الياء العربية', similarToArabic: true },
  { final: 'u', ipa: '[u]', example: '乌 wū', exampleChar: '乌', exampleMeaning: 'غراب أسود', arabicExplanation: 'مثل الواو المضمومة', similarToArabic: true },
  { final: 'ü', ipa: '[y]', example: '女 nǚ', exampleChar: '女', exampleMeaning: 'امرأة', arabicExplanation: 'ليس في العربية — ياء مع شفاه مدورة', similarToArabic: false },
  { final: 'ai', ipa: '[aɪ]', example: '爱 ài', exampleChar: '爱', exampleMeaning: 'حب', arabicExplanation: 'مثل "اي" في العربية', similarToArabic: true },
  { final: 'ei', ipa: '[eɪ]', example: '飞 fēi', exampleChar: '飞', exampleMeaning: 'يطير', arabicExplanation: 'مثل "إي" في كلمة عيد', similarToArabic: false },
  { final: 'ui', ipa: '[ueɪ]', example: '水 shuǐ', exampleChar: '水', exampleMeaning: 'ماء', arabicExplanation: 'مزيج من u + ei', similarToArabic: false },
  { final: 'ao', ipa: '[aʊ]', example: '好 hǎo', exampleChar: '好', exampleMeaning: 'جيد', arabicExplanation: 'مثل "او" في الكلمة', similarToArabic: true },
  { final: 'ou', ipa: '[oʊ]', example: '狗 gǒu', exampleChar: '狗', exampleMeaning: 'كلب', arabicExplanation: 'مثل "و" الممدودة', similarToArabic: false },
  { final: 'iu', ipa: '[ioʊ]', example: '九 jiǔ', exampleChar: '九', exampleMeaning: 'تسعة', arabicExplanation: 'مزيج من i + ou', similarToArabic: false },
  { final: 'ie', ipa: '[iɛ]', example: '写 xiě', exampleChar: '写', exampleMeaning: 'يكتب', arabicExplanation: 'مزيج من i + e', similarToArabic: false },
  { final: 'üe', ipa: '[yɛ]', example: '雪 xuě', exampleChar: '雪', exampleMeaning: 'ثلج', arabicExplanation: 'ليس في العربية — ü + e', similarToArabic: false },
  { final: 'er', ipa: 'ɚ', example: '二 èr', exampleChar: '二', exampleMeaning: 'اثنان', arabicExplanation: 'صوت فريد باللغة الصينية', similarToArabic: false },
  { final: 'an', ipa: '[an]', example: '三 sān', exampleChar: '三', exampleMeaning: 'ثلاثة', arabicExplanation: 'مثل "ان" في كلمة كتبان', similarToArabic: true },
  { final: 'en', ipa: '[ən]', example: '人 rén', exampleChar: '人', exampleMeaning: 'شخص', arabicExplanation: 'صوت وسط بين a و i + نون', similarToArabic: false },
  { final: 'in', ipa: '[in]', example: '心 xīn', exampleChar: '心', exampleMeaning: 'قلب', arabicExplanation: 'مثل "ين" في كلمة ينبع', similarToArabic: true },
  { final: 'un', ipa: '[uən]', example: '问 wèn', exampleChar: '问', exampleMeaning: 'يسأل', arabicExplanation: 'مزيج من u + en', similarToArabic: false },
  { final: 'ün', ipa: '[yn]', example: '军 jūn', exampleChar: '军', exampleMeaning: 'جيش', arabicExplanation: 'ليس في العربية — ü + نون', similarToArabic: false },
  { final: 'ang', ipa: '[aŋ]', example: '帮 bāng', exampleChar: '帮', exampleMeaning: 'يساعد', arabicExplanation: 'مثل "انج" مع أنفوي', similarToArabic: false },
  { final: 'eng', ipa: '[əŋ]', example: '风 fēng', exampleChar: '风', exampleMeaning: 'رياح', arabicExplanation: 'صوت وسط + نون أنفوية', similarToArabic: false },
  { final: 'ing', ipa: '[iŋ]', example: '听 tīng', exampleChar: '听', exampleMeaning: 'يستمع', arabicExplanation: 'مثل "ينج" مع نون أنفوية', similarToArabic: false },
  { final: 'ong', ipa: '[ʊŋ]', example: '中 zhōng', exampleChar: '中', exampleMeaning: 'وسط', arabicExplanation: 'مثل "ونج" لكن أوال أعمق', similarToArabic: false },
]

// ─── Special Rules Data ─────────────────────────────────────
interface SpecialRule {
  id: string
  titleAr: string
  description: string
  examples: {
    chars: string
    pinyin: string
    pinyinModified: string
    meaning: string
    explanation: string
  }[]
  tip: string
}

const specialRules: SpecialRule[] = [
  {
    id: 'tone-sandhi',
    titleAr: 'تغيير النبرة الثالثة (Tone Sandhi)',
    description: 'عندما تأتي النبرة الثالثة (٣) قبل نبرة ثالثة أخرى، تتحول الأولى تلقائياً إلى النبرة الثانية (٢). هذه القاعدة تسهل النطق وتجنب التكرار الممل لنفس النبرة.',
    examples: [
      {
        chars: '你好',
        pinyin: 'nǐ hǎo',
        pinyinModified: 'ní hǎo',
        meaning: 'مرحباً',
        explanation: 'nǐ + hǎo → ní hǎo — الأولى أصبحت صاعدة',
      },
      {
        chars: '很好',
        pinyin: 'hěn hǎo',
        pinyinModified: 'hén hǎo',
        meaning: 'جيد جداً',
        explanation: 'hěn + hǎo → hén hǎo — الأولى أصبحت صاعدة',
      },
      {
        chars: '水果',
        pinyin: 'shuǐ guǒ',
        pinyinModified: 'shuí guǒ',
        meaning: 'فواكه',
        explanation: 'shuǐ + guǒ → shuí guǒ — الأولى أصبحت صاعدة',
      },
    ],
    tip: 'تذكر: الثالثة + الثالثة = الثانية + الثالثة',
  },
  {
    id: 'u-umlaut-rule',
    titleAr: 'قاعدة ü مع j, q, x, y',
    description: 'حرف ü يُكتب كـ u عندما يأتي بعد الحروف j, q, x, y. لكن نطقه يبقى ü (ياء مع شفاه مدورة) وليس u عادي. هذا التبسيط في الكتابة لا يعني تغيير النطق.',
    examples: [
      {
        chars: '家',
        pinyin: 'jiā',
        pinyinModified: 'jüā (لا تُكتب هكذا)',
        meaning: 'بيت',
        explanation: 'يُنطق jüā لكن يُكتب jiā',
      },
      {
        chars: '去',
        pinyin: 'qù',
        pinyinModified: 'qǜ (لا تُكتب هكذا)',
        meaning: 'يذهب',
        explanation: 'يُنطق qǜ لكن يُكتب qù',
      },
      {
        chars: '学',
        pinyin: 'xué',
        pinyinModified: 'xüé (لا تُكتب هكذا)',
        meaning: 'يتعلم',
        explanation: 'يُنطق xüé لكن يُكتب xué',
      },
    ],
    tip: 'بعد n و l يُكتب ü بشكل عادي: 女 nǚ، 绿 lǜ',
  },
  {
    id: 'r-suffix',
    titleAr: 'قواعد الإضافة er 儿化音',
    description: 'في لهجة بكين، يُضاف حرف er (儿) في نهاية بعض الكلمات مما يُغيّر نطق المقطع الأخير. هذا يُعطي الكلمة طابعاً محلياً ودوداً. ليس ضرورياً في HSK لكنه شائع جداً في المحادثة.',
    examples: [
      {
        chars: '一点儿',
        pinyin: 'yì diǎnr',
        pinyinModified: 'يُنطق: yì diǎr',
        meaning: 'قليلاً',
        explanation: 'diǎn + er = diǎnr — النون تختفي',
      },
      {
        chars: '这儿',
        pinyin: 'zhèr',
        pinyinModified: 'zhè + er',
        meaning: 'هنا',
        explanation: 'zhè + er = zhèr — مكان مختصر',
      },
      {
        chars: '哪儿',
        pinyin: 'nǎr',
        pinyinModified: 'nǎ + er',
        meaning: 'أين',
        explanation: 'nǎ + er = nǎr — أين؟',
      },
    ],
    tip: '儿化音 شائعة في لهجة بكين والشمال الصيني',
  },
  {
    id: 'neutral-tone',
    titleAr: 'قاعدة النبرة المحايدة',
    description: 'النبرة المحايدة (المعروفة أيضاً بالنبرة الخامسة أو الخفيفة) هي نطق قصير وخفيف بدون نبرة محددة. تُستخدم عادة في المقاطع الثانوية مثل جزيئات الجمل وأسماء الإشارة والأرقام المركبة.',
    examples: [
      {
        chars: '吗',
        pinyin: 'ma',
        pinyinModified: 'خفيفة',
        meaning: 'أداة استفهام',
        explanation: 'تُضاف نهاية الجملة لتحويلها لسؤال',
      },
      {
        chars: '的',
        pinyin: 'de',
        pinyinModified: 'خفيفة',
        meaning: 'أداة ملكية / صفة',
        explanation: 'أكثر حرف استخداماً في الصينية',
      },
      {
        chars: '了',
        pinyin: 'le',
        pinyinModified: 'خفيفة',
        meaning: 'أداة ماضٍ',
        explanation: 'تُضاف بعد الفعل للدلالة على الماضي',
      },
    ],
    tip: 'النبرة المحايدة أقصر وأخف من أي نبرة أخرى',
  },
]

// ─── SVG Tone Curve Component ───────────────────────────────
function ToneCurveSVG({ toneNumber, color, size = 'md' }: { toneNumber: number; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-16 h-10',
    md: 'w-28 h-16',
    lg: 'w-36 h-20',
  }

  const pathData = (() => {
    switch (toneNumber) {
      case 1:
        // Flat high: horizontal line at top
        return 'M 15 20 L 85 20'
      case 2:
        // Rising: from bottom-left to top-right
        return 'M 15 55 C 35 50, 65 30, 85 15'
      case 3:
        // Dip: goes down then up
        return 'M 15 25 C 25 35, 35 58, 50 58 C 65 58, 75 35, 85 18'
      case 4:
        // Falling: from top-left to bottom-right
        return 'M 15 15 C 35 20, 65 45, 85 55'
      case 0:
        // Neutral: short flat line in middle
        return 'M 30 38 L 70 38'
      default:
        return ''
    }
  })()

  // Pitch reference lines
  const refLineY = [15, 28, 42, 55]

  return (
    <svg viewBox="0 0 100 70" className={sizeClasses[size]}>
      {/* Background reference lines */}
      {refLineY.map((y) => (
        <line
          key={y}
          x1="5"
          y1={y}
          x2="95"
          y2={y}
          stroke="#f3f4f6"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      ))}
      {/* Left pitch axis */}
      <line x1="5" y1="10" x2="5" y2="60" stroke="#e5e7eb" strokeWidth="1" />
      {/* 5 → 1 pitch labels */}
      <text x="2" y="18" fontSize="6" fill="#9ca3af" textAnchor="end">5</text>
      <text x="2" y="32" fontSize="6" fill="#9ca3af" textAnchor="end">4</text>
      <text x="2" y="46" fontSize="6" fill="#9ca3af" textAnchor="end">3</text>
      <text x="2" y="58" fontSize="6" fill="#9ca3af" textAnchor="end">1</text>
      {/* Main tone contour */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Dot at start */}
      <circle cx="15" cy={toneNumber === 0 ? 38 : toneNumber === 1 ? 20 : toneNumber === 2 ? 55 : toneNumber === 3 ? 25 : 15} r="3" fill={color} />
      {/* Dot at end */}
      <circle cx="85" cy={toneNumber === 0 ? 38 : toneNumber === 1 ? 20 : toneNumber === 2 ? 15 : toneNumber === 3 ? 18 : 55} r="3" fill={color} />
    </svg>
  )
}

// ─── TTS Button ─────────────────────────────────────────────
function SpeakButton({ text, size = 'sm' }: { text: string; size?: 'sm' | 'md' }) {
  const iconClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  const btnClass = size === 'md' ? 'h-9 w-9' : 'h-7 w-7'
  return (
    <Button
      variant="ghost"
      size="icon"
      className={btnClass}
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
    >
      <Volume2 className={iconClass} />
    </Button>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function PinyinHub() {
  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-red-700 flex items-center justify-center gap-3">
          <Headphones className="w-8 h-8" />
          مركز تعلّم البينيين
        </h2>
        <p className="text-gray-500 text-sm">تعلّم أصوات ونبرات اللغة الصينية بطريقة تفاعلية ومرئية</p>
      </motion.div>

      <Tabs defaultValue="tones" className="w-full" dir="rtl">
        <TabsList className="grid grid-cols-4 gap-1 h-auto p-1 bg-red-50">
          <TabsTrigger value="tones" className="text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <span className="hidden sm:inline ml-1">🎵</span>
            النبرات
          </TabsTrigger>
          <TabsTrigger value="initials" className="text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <span className="hidden sm:inline ml-1">🔤</span>
            الحروف الأولية
          </TabsTrigger>
          <TabsTrigger value="finals" className="text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <span className="hidden sm:inline ml-1">🔠</span>
            الحروف الأخيرة
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <span className="hidden sm:inline ml-1">📖</span>
            قواعد خاصة
          </TabsTrigger>
        </TabsList>

        {/* ═══════ TAB 1: TONES ═══════ */}
        <TabsContent value="tones" className="space-y-6">
          {/* 5 Tone Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tones.map((tone, idx) => (
              <motion.div
                key={tone.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  style={{ borderTop: '4px solid ' + tone.color }}
                  onClick={() => speak(tone.example)}
                >
                  <CardContent className="p-5 space-y-3">
                    {/* Tone number badge + name */}
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: tone.color }}
                      >
                        {tone.label}
                      </div>
                      <h3 className="font-bold text-sm text-gray-800">{tone.nameAr}</h3>
                    </div>

                    {/* SVG Tone Curve */}
                    <div className="flex justify-center py-2">
                      <ToneCurveSVG toneNumber={tone.number} color={tone.color} size="lg" />
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed">{tone.description}</p>

                    {/* Example */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <span className="font-chinese-serif text-3xl">{tone.example}</span>
                        <div>
                          <span className="text-sm font-chinese-sans text-gray-700 block">{tone.pinyin}</span>
                          <span className="text-xs text-gray-400">{tone.meaning}</span>
                        </div>
                      </div>
                      <SpeakButton text={tone.example} size="md" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* 5th card is the neutral tone (0) */}
          </div>

          {/* Ma Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 border-red-200 overflow-hidden">
              <CardHeader className="pb-3 bg-red-50">
                <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                  <BookOpen className="w-5 h-5" />
                  مقارنة النبرات الكلاسيكية — ma
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-4">
                  الكلمة نفسها &quot;ma&quot; تغيّر معناها بالكامل حسب النبرة! هذه أشهر أمثلة أهمية النبرات في الصينية:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {maComparison.map((m) => (
                    <motion.div
                      key={m.tone}
                      className="text-center cursor-pointer p-4 rounded-xl hover:shadow-md transition-all bg-white border"
                      style={{ borderBottom: '4px solid ' + m.color }}
                      onClick={() => speak(m.char)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="font-chinese-serif text-4xl mb-2">{m.char}</div>
                      <div className="font-chinese-sans text-sm font-semibold mb-1">{m.pinyin}</div>
                      <div className="text-xs text-gray-500">{m.meaning}</div>
                      <div className="mt-2 flex justify-center">
                        <ToneCurveSVG toneNumber={m.tone} color={m.color} size="sm" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ TAB 2: INITIALS ═══════ */}
        <TabsContent value="initials" className="space-y-4">
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">الحروف الأولية (声母) — 23 حرفاً</p>
                  <p>هذه هي الأصوات التي تبدأ بها المقاطع الصينية. بعضها يشبه أصوات العربية الموجودة، والبعض الآخر جديد تماماً ويتطلب تدريباً خاصاً.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Initials Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-red-50">
                        <th className="p-3 text-right font-semibold text-red-700 rounded-tr-lg">الحرف</th>
                        <th className="p-3 text-right font-semibold text-red-700">مثال</th>
                        <th className="p-3 text-right font-semibold text-red-700">المعنى</th>
                        <th className="p-3 text-right font-semibold text-red-700">IPA</th>
                        <th className="p-3 text-right font-semibold text-red-700">الشرح بالعربية</th>
                        <th className="p-3 text-center font-semibold text-red-700 rounded-tl-lg">🔊</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initials.map((item, idx) => (
                        <motion.tr
                          key={item.letter}
                          className="border-b hover:bg-red-50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-red-700 font-mono">{item.letter}</span>
                              <Badge
                                variant={item.similarToArabic ? 'default' : 'destructive'}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {item.similarToArabic ? 'مألوف' : 'جديد'}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-chinese-serif text-lg">{item.example}</span>
                          </td>
                          <td className="p-3 text-gray-600">{item.exampleMeaning}</td>
                          <td className="p-3 font-mono text-xs text-gray-500">{item.ipa}</td>
                          <td className="p-3 text-xs text-gray-600 max-w-[200px]">{item.arabicExplanation}</td>
                          <td className="p-3 text-center">
                            <SpeakButton text={item.exampleChar} />
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary note */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">ملاحظة عن التشابه مع العربية</p>
                <p>
                  الأصوات المألوفة: b, p, m, f, d, t, n, l, g, k, s, w — لها نظائر في العربية.
                  الأصوات الجديدة: h, j, q, x, zh, ch, sh, r, z, c, y — تحتاج تدريباً خاصاً لأنها لا توجد في العربية.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ TAB 3: FINALS ═══════ */}
        <TabsContent value="finals" className="space-y-4">
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-green-100 bg-green-50">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">الحروف الأخيرة (韵母) — 24 حرفاً</p>
                  <p>هذه هي الأصوات التي تنتهي بها المقاطع الصينية. تُنطق مع الحروف الأولية لتكوين المقاطع الكاملة مثل &quot;ma&quot; (م + ا).</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Finals Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-red-50">
                        <th className="p-3 text-right font-semibold text-red-700 rounded-tr-lg">الحرف الأخير</th>
                        <th className="p-3 text-right font-semibold text-red-700">مثال</th>
                        <th className="p-3 text-right font-semibold text-red-700">المعنى</th>
                        <th className="p-3 text-right font-semibold text-red-700">IPA</th>
                        <th className="p-3 text-right font-semibold text-red-700">الشرح بالعربية</th>
                        <th className="p-3 text-center font-semibold text-red-700 rounded-tl-lg">🔊</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finals.map((item, idx) => (
                        <motion.tr
                          key={item.final}
                          className="border-b hover:bg-red-50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-red-700 font-mono">{item.final}</span>
                              <Badge
                                variant={item.similarToArabic ? 'default' : 'destructive'}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {item.similarToArabic ? 'مألوف' : 'جديد'}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-chinese-serif text-lg">{item.example}</span>
                          </td>
                          <td className="p-3 text-gray-600">{item.exampleMeaning}</td>
                          <td className="p-3 font-mono text-xs text-gray-500">{item.ipa}</td>
                          <td className="p-3 text-xs text-gray-600 max-w-[200px]">{item.arabicExplanation}</td>
                          <td className="p-3 text-center">
                            <SpeakButton text={item.exampleChar} />
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ TAB 4: SPECIAL RULES ═══════ */}
        <TabsContent value="rules" className="space-y-6">
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-purple-100 bg-purple-50">
              <CardContent className="p-4 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">قواعد خاصة في البينيين</p>
                  <p>هذه القواعد الاستثنائية مهمة جداً للنطق الصحيح. ركّز عليها لأنها تُحدث فرقاً كبيراً في فهمك وواضحية نطقك.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rules */}
          {specialRules.map((rule, ruleIdx) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ruleIdx * 0.15 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-red-50 border-b border-red-100">
                  <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                    <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                      {ruleIdx + 1}
                    </span>
                    {rule.titleAr}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">{rule.description}</p>

                  {/* Examples */}
                  <div className="space-y-3">
                    {rule.examples.map((ex, exIdx) => (
                      <motion.div
                        key={exIdx}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ruleIdx * 0.15 + exIdx * 0.1 }}
                      >
                        {/* Chinese characters */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className="font-chinese-serif text-3xl cursor-pointer hover:text-red-600 transition-colors"
                            onClick={() => speak(ex.chars)}
                          >
                            {ex.chars}
                          </span>
                          <SpeakButton text={ex.chars} size="md" />
                        </div>

                        {/* Pinyin + meaning */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-chinese-sans text-sm font-semibold text-red-700">{ex.pinyin}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-chinese-sans text-sm font-mono text-gray-500">{ex.pinyinModified}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold">{ex.meaning}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            {ex.explanation}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tip */}
                  <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">{rule.tip}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
