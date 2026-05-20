'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Volume2, Play, PenLine, RotateCcw, BookOpen } from 'lucide-react'
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

// ─── HSK1 Character List (80+ characters) ───────────────────
const HSK1_CHARS = [
  '你','好','我','是','不','的','了','在','人','有',
  '他','这','中','大','来','上','国','个','到','说','们','为','子','和',
  '地','出','道','也','时','年','得','就','那','要','下','以','生','会',
  '可','自','着','去','之','过','家','学','对','能','如','发','用',
  '方','又','行','所','然','天','多','则','而','当','没','动','面','起',
  '看','定','分','还','进','小','部','其','些','主','样','理',
  '心','她','本','前','开','但','因','只','从','想','实','第','明','问',
]

// ─── Character Info Map (pinyin + Arabic meaning) ───────────
const charInfoMap: Record<string, { pinyin: string; meaning: string }> = {
  '你': { pinyin: 'nǐ', meaning: 'أنت' },
  '好': { pinyin: 'hǎo', meaning: 'جيد / مرحباً' },
  '我': { pinyin: 'wǒ', meaning: 'أنا' },
  '是': { pinyin: 'shì', meaning: 'يكون / نعم' },
  '不': { pinyin: 'bù', meaning: 'لا' },
  '的': { pinyin: 'de', meaning: 'أداة ملكية' },
  '了': { pinyin: 'le', meaning: 'أداة ماضي' },
  '在': { pinyin: 'zài', meaning: 'في / موجود' },
  '人': { pinyin: 'rén', meaning: 'شخص / إنسان' },
  '有': { pinyin: 'yǒu', meaning: 'يملك / هناك' },
  '他': { pinyin: 'tā', meaning: 'هو' },
  '这': { pinyin: 'zhè', meaning: 'هذا' },
  '中': { pinyin: 'zhōng', meaning: 'وسط / صيني' },
  '大': { pinyin: 'dà', meaning: 'كبير' },
  '来': { pinyin: 'lái', meaning: 'يأتي' },
  '上': { pinyin: 'shàng', meaning: 'فوق / أعلى' },
  '国': { pinyin: 'guó', meaning: 'دولة' },
  '个': { pinyin: 'gè', meaning: 'عداد عام' },
  '到': { pinyin: 'dào', meaning: 'يصل إلى' },
  '说': { pinyin: 'shuō', meaning: 'يتكلم' },
  '们': { pinyin: 'men', meaning: 'جمع للأشخاص' },
  '为': { pinyin: 'wèi', meaning: 'لأجل' },
  '子': { pinyin: 'zǐ', meaning: 'طفل / لاحقة' },
  '和': { pinyin: 'hé', meaning: 'و / مع' },
  '地': { pinyin: 'dì', meaning: 'أرض / مكان' },
  '出': { pinyin: 'chū', meaning: 'يخرج' },
  '道': { pinyin: 'dào', meaning: 'طريق / يقول' },
  '也': { pinyin: 'yě', meaning: 'أيضاً' },
  '时': { pinyin: 'shí', meaning: 'وقت / ساعة' },
  '年': { pinyin: 'nián', meaning: 'سنة' },
  '得': { pinyin: 'de', meaning: 'أداة نتيجة' },
  '就': { pinyin: 'jiù', meaning: 'إذن / فوراً' },
  '那': { pinyin: 'nà', meaning: 'ذاك / ذلك' },
  '要': { pinyin: 'yào', meaning: 'يريد / يجب' },
  '下': { pinyin: 'xià', meaning: 'تحت / أسفل' },
  '以': { pinyin: 'yǐ', meaning: 'بـ / بأخذ' },
  '生': { pinyin: 'shēng', meaning: 'يولد / طالب' },
  '会': { pinyin: 'huì', meaning: 'يستطيع / سوف' },
  '可': { pinyin: 'kě', meaning: 'يمكن / لكن' },
  '自': { pinyin: 'zì', meaning: 'ذات / من نفسه' },
  '着': { pinyin: 'zhe', meaning: 'أداة استمرار' },
  '去': { pinyin: 'qù', meaning: 'يذهب' },
  '之': { pinyin: 'zhī', meaning: 'أداة تعريف' },
  '过': { pinyin: 'guò', meaning: 'مضى / تجربة' },
  '家': { pinyin: 'jiā', meaning: 'بيت / عائلة' },
  '学': { pinyin: 'xué', meaning: 'يتعلم / دراسة' },
  '对': { pinyin: 'duì', meaning: 'صحيح / لـ' },
  '能': { pinyin: 'néng', meaning: 'يستطيع' },
  '如': { pinyin: 'rú', meaning: 'مثل / كما' },
  '发': { pinyin: 'fā', meaning: 'يرسل / يصدر' },
  '用': { pinyin: 'yòng', meaning: 'يستخدم' },
  '方': { pinyin: 'fāng', meaning: 'اتجاه / جانب' },
  '又': { pinyin: 'yòu', meaning: 'مرة أخرى / و' },
  '行': { pinyin: 'xíng', meaning: 'يمشي / جيد' },
  '所': { pinyin: 'suǒ', meaning: 'مكان / أداة' },
  '然': { pinyin: 'rán', meaning: 'لكن / هكذا' },
  '天': { pinyin: 'tiān', meaning: 'سماء / يوم' },
  '多': { pinyin: 'duō', meaning: 'كثير' },
  '则': { pinyin: 'zé', meaning: 'إذن / قاعدة' },
  '而': { pinyin: 'ér', meaning: 'لكن / و' },
  '当': { pinyin: 'dāng', meaning: 'عندما / يكون' },
  '没': { pinyin: 'méi', meaning: 'لم / ليس لديه' },
  '动': { pinyin: 'dòng', meaning: 'يتحرك' },
  '面': { pinyin: 'miàn', meaning: 'وجه / سطح' },
  '起': { pinyin: 'qǐ', meaning: 'يقوم / يبدأ' },
  '看': { pinyin: 'kàn', meaning: 'ينظر / يرى' },
  '定': { pinyin: 'dìng', meaning: 'يقرر / ثابت' },
  '分': { pinyin: 'fēn', meaning: 'نقطة / دقيقة' },
  '还': { pinyin: 'hái', meaning: 'بعدُ / أيضاً' },
  '进': { pinyin: 'jìn', meaning: 'يدخل / تقدم' },
  '小': { pinyin: 'xiǎo', meaning: 'صغير' },
  '部': { pinyin: 'bù', meaning: 'قسم / جزء' },
  '其': { pinyin: 'qí', meaning: 'ذلك / أداة' },
  '些': { pinyin: 'xiē', meaning: 'بعض' },
  '主': { pinyin: 'zhǔ', meaning: 'رئيس / سيد' },
  '样': { pinyin: 'yàng', meaning: 'شكل / مظهر' },
  '理': { pinyin: 'lǐ', meaning: 'منطق / يدبر' },
  '心': { pinyin: 'xīn', meaning: 'قلب' },
  '她': { pinyin: 'tā', meaning: 'هي' },
  '本': { pinyin: 'běn', meaning: 'أصل / هذا' },
  '前': { pinyin: 'qián', meaning: 'أمام / قبل' },
  '开': { pinyin: 'kāi', meaning: 'يفتح' },
  '但': { pinyin: 'dàn', meaning: 'لكن' },
  '因': { pinyin: 'yīn', meaning: 'بسبب' },
  '只': { pinyin: 'zhǐ', meaning: 'فقط' },
  '从': { pinyin: 'cóng', meaning: 'من / يتبع' },
  '想': { pinyin: 'xiǎng', meaning: 'يريد / يفكر' },
  '实': { pinyin: 'shí', meaning: 'حقيقي / فعلاً' },
  '第': { pinyin: 'dì', meaning: 'الرقم الترتيبي' },
  '明': { pinyin: 'míng', meaning: 'مشرق / غد' },
  '问': { pinyin: 'wèn', meaning: 'يسأل' },
}

// ─── Main Component ─────────────────────────────────────────
export default function HanziSection() {
  const [selectedChar, setSelectedChar] = useState<string>('你')
  const [hanziWriterLoaded, setHanziWriterLoaded] = useState(() => {
    if (typeof window !== 'undefined') return !!(window as any).HanziWriter
    return false
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [quizResult, setQuizResult] = useState<{ totalMistakes: number; totalStrokes: number } | null>(null)

  const writerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load hanzi-writer from CDN
  useEffect(() => {
    if (typeof window === 'undefined' || hanziWriterLoaded) return
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js'
    script.onload = () => setHanziWriterLoaded(true)
    document.head.appendChild(script)
  }, [hanziWriterLoaded])

  // Create writer when character changes
  const createWriter = useCallback((char: string) => {
    if (!hanziWriterLoaded || !containerRef.current || !char) return
    const HW = (window as any).HanziWriter
    containerRef.current.innerHTML = ''
    writerRef.current = HW.create(containerRef.current, char, {
      width: 300,
      height: 300,
      padding: 5,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 300,
    })
  }, [hanziWriterLoaded])

  // Init character when selected changes
  const prevCharRef = useRef<string>('')
  useEffect(() => {
    if (hanziWriterLoaded && selectedChar && prevCharRef.current !== selectedChar) {
      prevCharRef.current = selectedChar
      setIsQuizMode(false)
      setQuizResult(null)
      createWriter(selectedChar)
    }
  }, [hanziWriterLoaded, selectedChar, createWriter])

  // Auto-animate character
  const animateCharacter = useCallback(() => {
    if (!writerRef.current || isAnimating) return
    setIsAnimating(true)
    setIsQuizMode(false)
    setQuizResult(null)
    createWriter(selectedChar)
    requestAnimationFrame(() => {
      if (writerRef.current) {
        writerRef.current.animateCharacter({
          onComplete: () => setIsAnimating(false),
        })
      }
    })
  }, [selectedChar, isAnimating, createWriter])

  // Start quiz mode
  const startQuiz = useCallback(() => {
    if (!writerRef.current) return
    setIsQuizMode(true)
    setQuizResult(null)
    createWriter(selectedChar)
    requestAnimationFrame(() => {
      if (writerRef.current) {
        writerRef.current.quiz({
          onComplete: (summaryData: any) => {
            setQuizResult({
              totalMistakes: summaryData.totalMistakes,
              totalStrokes: summaryData.totalStrokes,
            })
          },
        })
      }
    })
  }, [selectedChar, createWriter])

  // Reset
  const resetCharacter = useCallback(() => {
    setIsQuizMode(false)
    setQuizResult(null)
    setIsAnimating(false)
    createWriter(selectedChar)
  }, [selectedChar, createWriter])

  const charInfo = charInfoMap[selectedChar]

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-red-700 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8" />
          إتقان الحروف الصينية
        </h2>
        <p className="text-gray-600">تعلّم كتابة الحروف الصينية خطوة بخطوة</p>
        <Badge variant="outline" className="text-sm">
          {HSK1_CHARS.length} حرف من HSK1
        </Badge>
      </div>

      {/* Main Layout: Grid (LEFT) + Drawing Area (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Character Grid */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-2 max-h-[520px] overflow-y-auto">
                {HSK1_CHARS.map((char, idx) => {
                  const isSelected = selectedChar === char
                  const info = charInfoMap[char]
                  return (
                    <motion.button
                      key={char}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.008, duration: 0.2 }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedChar(char)}
                      className={
                        'relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-colors cursor-pointer ' +
                        (isSelected
                          ? 'bg-red-50 border-red-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-red-300 hover:bg-red-50/50')
                      }
                    >
                      <span className={'font-chinese-serif text-2xl ' + (isSelected ? 'text-red-700' : 'text-gray-800')}>
                        {char}
                      </span>
                      {info && (
                        <span className="text-[9px] text-gray-400 mt-0.5 font-chinese-sans leading-tight">
                          {info.pinyin}
                        </span>
                      )}
                      {isSelected && (
                        <motion.div
                          layoutId="char-selected-indicator"
                          className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Drawing Area + Controls */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Character Info Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedChar}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl border-2 border-red-200 shadow-sm">
                    <span className="font-chinese-serif text-4xl text-red-700">{selectedChar}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-chinese-sans text-xl font-bold text-gray-800">
                        {charInfo?.pinyin || ''}
                      </span>
                      <button
                        onClick={() => speak(selectedChar)}
                        className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 transition-colors text-red-600"
                        aria-label="استمع للنطق"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-lg">{charInfo?.meaning || ''}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Drawing Area */}
          <Card className="border-red-200 overflow-hidden">
            <CardContent className="p-4 flex flex-col items-center">
              <div
                ref={containerRef}
                className="w-[300px] h-[300px] bg-white rounded-xl border-2 border-red-100 flex items-center justify-center relative"
              >
                {!hanziWriterLoaded && (
                  <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
                    <RotateCcw className="w-6 h-6 animate-spin" />
                    جاري التحميل...
                  </div>
                )}
                {/* Quiz result overlay */}
                {isQuizMode && quizResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={
                      'absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-2 backdrop-blur-sm ' +
                      (quizResult.totalMistakes === 0
                        ? 'bg-green-50/90'
                        : quizResult.totalMistakes <= 2
                          ? 'bg-amber-50/90'
                          : 'bg-red-50/90')
                    }
                  >
                    <span className="text-5xl">
                      {quizResult.totalMistakes === 0 ? '🎉' : quizResult.totalMistakes <= 2 ? '👍' : '💪'}
                    </span>
                    <p className="font-bold text-lg">
                      {quizResult.totalMistakes === 0
                        ? 'مثالي!'
                        : quizResult.totalMistakes <= 2
                          ? 'جيد!'
                          : 'حاول مرة أخرى'}
                    </p>
                    <p className="text-sm text-gray-600">
                      أخطاء: {quizResult.totalMistakes} من {quizResult.totalStrokes} خطوط
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Three Control Buttons */}
              <div className="grid grid-cols-3 gap-2 w-full mt-4">
                <Button
                  onClick={animateCharacter}
                  disabled={!hanziWriterLoaded || isAnimating}
                  className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                >
                  <Play className="w-4 h-4" />
                  <span className="text-sm">رسم تلقائي</span>
                </Button>
                <Button
                  onClick={startQuiz}
                  disabled={!hanziWriterLoaded}
                  variant={isQuizMode ? 'default' : 'outline'}
                  className={
                    isQuizMode
                      ? 'bg-red-600 hover:bg-red-700 text-white gap-1.5'
                      : 'border-red-300 text-red-700 hover:bg-red-50 gap-1.5'
                  }
                >
                  <PenLine className="w-4 h-4" />
                  <span className="text-sm">وضع الاختبار</span>
                </Button>
                <Button
                  onClick={resetCharacter}
                  disabled={!hanziWriterLoaded}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">إعادة</span>
                </Button>
              </div>

              {/* Quiz mode hint */}
              {isQuizMode && !quizResult && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600 mt-3 text-center bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  ارسم الحرف على المنطقة أعلاه
                </motion.p>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-red-100 bg-red-50/50">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong className="text-red-700">رسم تلقائي:</strong> شاهد كيف يُكتب الحرف خطوة بخطوة</p>
                  <p><strong className="text-red-700">وضع الاختبار:</strong> ارسم الحرف بنفسك وتحقق من صحتك</p>
                  <p><strong className="text-red-700">إعادة:</strong> أعد تهيئة منطقة الرسم</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
