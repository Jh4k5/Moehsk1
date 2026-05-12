'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen, Play, ChevronLeft, ChevronRight, Eye, EyeOff,
  Search, Volume2, RotateCcw, Check, X, GripVertical, Pen, Lightbulb
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

// ─── Character Data (HSK 1 - 60 characters) ─────────────────
interface CharData {
  strokes: number
  radicals: string[]
  meaning: string
  pinyin: string
  lesson: number
}

const characterData: Record<string, CharData> = {
  '人': { strokes: 2, radicals: ['人'], meaning: 'شخص', pinyin: 'rén', lesson: 1 },
  '大': { strokes: 3, radicals: ['大'], meaning: 'كبير', pinyin: 'dà', lesson: 1 },
  '小': { strokes: 3, radicals: ['小'], meaning: 'صغير', pinyin: 'xiǎo', lesson: 1 },
  '好': { strokes: 6, radicals: ['女', '子'], meaning: 'جيد', pinyin: 'hǎo', lesson: 1 },
  '我': { strokes: 7, radicals: ['手', '戈'], meaning: 'أنا', pinyin: 'wǒ', lesson: 1 },
  '你': { strokes: 7, radicals: ['亻', '尔'], meaning: 'أنت', pinyin: 'nǐ', lesson: 1 },
  '他': { strokes: 5, radicals: ['亻', '也'], meaning: 'هو', pinyin: 'tā', lesson: 1 },
  '她': { strokes: 6, radicals: ['女', '也'], meaning: 'هي', pinyin: 'tā', lesson: 1 },
  '中': { strokes: 4, radicals: ['口', '丨'], meaning: 'وسط', pinyin: 'zhōng', lesson: 2 },
  '国': { strokes: 8, radicals: ['囗', '玉'], meaning: 'دولة', pinyin: 'guó', lesson: 2 },
  '学': { strokes: 8, radicals: ['子', '冖'], meaning: 'يتعلم', pinyin: 'xué', lesson: 2 },
  '生': { strokes: 5, radicals: ['生'], meaning: 'يولد / طالب', pinyin: 'shēng', lesson: 2 },
  '老': { strokes: 6, radicals: ['老'], meaning: 'كبير في السن', pinyin: 'lǎo', lesson: 2 },
  '师': { strokes: 6, radicals: ['刀', '巾'], meaning: 'معلم', pinyin: 'shī', lesson: 2 },
  '是': { strokes: 9, radicals: ['日', '疋'], meaning: 'يكون', pinyin: 'shì', lesson: 3 },
  '不': { strokes: 4, radicals: ['不'], meaning: 'لا', pinyin: 'bù', lesson: 3 },
  '有': { strokes: 6, radicals: ['月', '𠂇'], meaning: 'يملك', pinyin: 'yǒu', lesson: 3 },
  '在': { strokes: 6, radicals: ['土', '亻'], meaning: 'في', pinyin: 'zài', lesson: 3 },
  '这': { strokes: 7, radicals: ['辶', '文'], meaning: 'هذا', pinyin: 'zhè', lesson: 3 },
  '那': { strokes: 6, radicals: ['阝', '冉'], meaning: 'ذاك', pinyin: 'nà', lesson: 3 },
  '什': { strokes: 4, radicals: ['亻', '十'], meaning: 'ماذا', pinyin: 'shén', lesson: 3 },
  '么': { strokes: 3, radicals: ['丿', '厶'], meaning: 'أداة', pinyin: 'me', lesson: 3 },
  '一': { strokes: 1, radicals: ['一'], meaning: 'واحد', pinyin: 'yī', lesson: 4 },
  '二': { strokes: 2, radicals: ['二'], meaning: 'اثنان', pinyin: 'èr', lesson: 4 },
  '三': { strokes: 3, radicals: ['三'], meaning: 'ثلاثة', pinyin: 'sān', lesson: 4 },
  '四': { strokes: 5, radicals: ['囗', '儿'], meaning: 'أربعة', pinyin: 'sì', lesson: 4 },
  '五': { strokes: 4, radicals: ['五'], meaning: 'خمسة', pinyin: 'wǔ', lesson: 4 },
  '六': { strokes: 4, radicals: ['六'], meaning: 'ستة', pinyin: 'liù', lesson: 4 },
  '七': { strokes: 2, radicals: ['七'], meaning: 'سبعة', pinyin: 'qī', lesson: 4 },
  '八': { strokes: 2, radicals: ['八'], meaning: 'ثمانية', pinyin: 'bā', lesson: 4 },
  '九': { strokes: 2, radicals: ['九'], meaning: 'تسعة', pinyin: 'jiǔ', lesson: 4 },
  '十': { strokes: 2, radicals: ['十'], meaning: 'عشرة', pinyin: 'shí', lesson: 4 },
  '百': { strokes: 6, radicals: ['一', '白'], meaning: 'مئة', pinyin: 'bǎi', lesson: 4 },
  '千': { strokes: 3, radicals: ['丿', '十'], meaning: 'ألف', pinyin: 'qiān', lesson: 4 },
  '万': { strokes: 3, radicals: ['万'], meaning: 'عشرة آلاف', pinyin: 'wàn', lesson: 4 },
  '个': { strokes: 3, radicals: ['人', '丨'], meaning: 'عداد عام', pinyin: 'gè', lesson: 5 },
  '上': { strokes: 3, radicals: ['上'], meaning: 'فوق', pinyin: 'shàng', lesson: 5 },
  '下': { strokes: 3, radicals: ['下'], meaning: 'تحت', pinyin: 'xià', lesson: 5 },
  '前': { strokes: 9, radicals: ['䒑', '月', '刂'], meaning: 'أمام', pinyin: 'qián', lesson: 5 },
  '后': { strokes: 6, radicals: ['厂', '口'], meaning: 'خلف', pinyin: 'hòu', lesson: 5 },
  '左': { strokes: 5, radicals: ['工', '𠂇'], meaning: 'يسار', pinyin: 'zuǒ', lesson: 5 },
  '右': { strokes: 5, radicals: ['口', '手'], meaning: 'يمين', pinyin: 'yòu', lesson: 5 },
  '东': { strokes: 5, radicals: ['木', '日'], meaning: 'شرق', pinyin: 'dōng', lesson: 5 },
  '西': { strokes: 6, radicals: ['西'], meaning: 'غرب', pinyin: 'xī', lesson: 5 },
  '南': { strokes: 9, radicals: ['十', '冂', '¥'], meaning: 'جنوب', pinyin: 'nán', lesson: 5 },
  '北': { strokes: 5, radicals: ['北'], meaning: 'شمال', pinyin: 'běi', lesson: 5 },
  '吃': { strokes: 6, radicals: ['口', '乞'], meaning: 'يأكل', pinyin: 'chī', lesson: 6 },
  '喝': { strokes: 12, radicals: ['口', '曷'], meaning: 'يشرب', pinyin: 'hē', lesson: 6 },
  '看': { strokes: 9, radicals: ['手', '目'], meaning: 'ينظر', pinyin: 'kàn', lesson: 6 },
  '听': { strokes: 7, radicals: ['口', '斤'], meaning: 'يستمع', pinyin: 'tīng', lesson: 6 },
  '说': { strokes: 9, radicals: ['讠', '兑'], meaning: 'يتكلم', pinyin: 'shuō', lesson: 6 },
  '读': { strokes: 10, radicals: ['讠', '卖'], meaning: 'يقرأ', pinyin: 'dú', lesson: 6 },
  '写': { strokes: 5, radicals: ['冖', '与'], meaning: 'يكتب', pinyin: 'xiě', lesson: 6 },
  '天': { strokes: 4, radicals: ['天'], meaning: 'سماء / يوم', pinyin: 'tiān', lesson: 7 },
  '日': { strokes: 4, radicals: ['日'], meaning: 'شمس / يوم', pinyin: 'rì', lesson: 7 },
  '月': { strokes: 4, radicals: ['月'], meaning: 'قمر / شهر', pinyin: 'yuè', lesson: 7 },
  '年': { strokes: 6, radicals: ['干', '午'], meaning: 'سنة', pinyin: 'nián', lesson: 7 },
  '今': { strokes: 4, radicals: ['人', '乛'], meaning: 'اليوم', pinyin: 'jīn', lesson: 7 },
  '明': { strokes: 8, radicals: ['日', '月'], meaning: 'غد / مشرق', pinyin: 'míng', lesson: 7 },
  '多': { strokes: 6, radicals: ['夕', '夕'], meaning: 'كثير', pinyin: 'duō', lesson: 7 },
  '少': { strokes: 4, radicals: ['小', '丿'], meaning: 'قليل', pinyin: 'shǎo', lesson: 7 },
  '山': { strokes: 3, radicals: ['山'], meaning: 'جبل', pinyin: 'shān', lesson: 8 },
  '水': { strokes: 4, radicals: ['水'], meaning: 'ماء', pinyin: 'shuǐ', lesson: 8 },
  '火': { strokes: 4, radicals: ['火'], meaning: 'نار', pinyin: 'huǒ', lesson: 8 },
  '木': { strokes: 4, radicals: ['木'], meaning: 'شجرة', pinyin: 'mù', lesson: 8 },
  '土': { strokes: 3, radicals: ['土'], meaning: 'تراب', pinyin: 'tǔ', lesson: 8 },
  '手': { strokes: 4, radicals: ['手'], meaning: 'يد', pinyin: 'shǒu', lesson: 8 },
  '口': { strokes: 3, radicals: ['口'], meaning: 'فم', pinyin: 'kǒu', lesson: 8 },
  '目': { strokes: 5, radicals: ['目'], meaning: 'عين', pinyin: 'mù', lesson: 8 },
  '耳': { strokes: 6, radicals: ['耳'], meaning: 'أذن', pinyin: 'ěr', lesson: 8 },
}

// ─── Radicals Data ──────────────────────────────────────────
interface RadicalData {
  radical: string
  meaning: string
  category: string
  examples: { char: string; meaning: string }[]
}

const radicalsData: RadicalData[] = [
  { radical: '人', meaning: 'إنسان', category: 'الإنسان', examples: [{ char: '你', meaning: 'أنت' }, { char: '他', meaning: 'هو' }, { char: '大', meaning: 'كبير' }] },
  { radical: '口', meaning: 'فم', category: 'أجزاء الجسم', examples: [{ char: '吃', meaning: 'يأكل' }, { char: '喝', meaning: 'يشرب' }, { char: '听', meaning: 'يستمع' }] },
  { radical: '女', meaning: 'امرأة', category: 'الإنسان', examples: [{ char: '好', meaning: 'جيد' }, { char: '她', meaning: 'هي' }] },
  { radical: '日', meaning: 'شمس', category: 'الطبيعة', examples: [{ char: '明', meaning: 'مشرق' }, { char: '是', meaning: 'يكون' }] },
  { radical: '月', meaning: 'قمر', category: 'الطبيعة', examples: [{ char: '明', meaning: 'مشرق' }, { char: '有', meaning: 'يملك' }] },
  { radical: '木', meaning: 'شجرة', category: 'الطبيعة', examples: [{ char: '东', meaning: 'شرق' }] },
  { radical: '水', meaning: 'ماء', category: 'الطبيعة', examples: [] },
  { radical: '火', meaning: 'نار', category: 'الطبيعة', examples: [] },
  { radical: '土', meaning: 'تراب', category: 'الطبيعة', examples: [{ char: '在', meaning: 'في' }] },
  { radical: '山', meaning: 'جبل', category: 'الطبيعة', examples: [] },
  { radical: '手', meaning: 'يد', category: 'أجزاء الجسم', examples: [{ char: '看', meaning: 'ينظر' }] },
  { radical: '目', meaning: 'عين', category: 'أجزاء الجسم', examples: [{ char: '看', meaning: 'ينظر' }] },
  { radical: '耳', meaning: 'أذن', category: 'أجزاء الجسم', examples: [] },
  { radical: '囗', meaning: 'إطار', category: 'أشكال', examples: [{ char: '国', meaning: 'دولة' }, { char: '四', meaning: 'أربعة' }] },
  { radical: '十', meaning: 'عشرة', category: 'أعداد', examples: [{ char: '千', meaning: 'ألف' }] },
  { radical: '一', meaning: 'واحد', category: 'أعداد', examples: [{ char: '百', meaning: 'مئة' }] },
  { radical: '讠', meaning: 'كلام', category: 'أفعال', examples: [{ char: '说', meaning: 'يتكلم' }, { char: '读', meaning: 'يقرأ' }] },
  { radical: '亻', meaning: 'إنسان (جانبي)', category: 'الإنسان', examples: [{ char: '你', meaning: 'أنت' }, { char: '他', meaning: 'هو' }, { char: '什', meaning: 'ماذا' }] },
  { radical: '辶', meaning: 'حركة', category: 'أشكال', examples: [{ char: '这', meaning: 'هذا' }] },
  { radical: '大', meaning: 'كبير', category: 'الإنسان', examples: [] },
  { radical: '小', meaning: 'صغير', category: 'أشكال', examples: [{ char: '少', meaning: 'قليل' }] },
  { radical: '子', meaning: 'طفل', category: 'الإنسان', examples: [{ char: '好', meaning: 'جيد' }, { char: '学', meaning: 'يتعلم' }] },
]

// ─── Main Component ─────────────────────────────────────────
export default function HanziSection() {
  const [selectedChar, setSelectedChar] = useState<string>('人')
  const [searchQuery, setSearchQuery] = useState('')
  const [lessonFilter, setLessonFilter] = useState<number>(0)
  const [hanziWriterLoaded, setHanziWriterLoaded] = useState(() => {
    if (typeof window !== 'undefined') return !!(window as any).HanziWriter
    return false
  })
  const revealedStrokesRef = useRef(0)
  const [revealedStrokes, setRevealedStrokes] = useState(0)
  const [quizMode, setQuizMode] = useState(false)
  const [quizChar, setQuizChar] = useState<string | null>(null)
  const [quizRevealed, setQuizRevealed] = useState(0)
  const [quizResult, setQuizResult] = useState<boolean | null>(null)
  const writerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const quizContainerRef = useRef<HTMLDivElement>(null)

  // Load hanzi-writer from CDN (only sets state in async callback)
  useEffect(() => {
    if (typeof window === 'undefined' || hanziWriterLoaded) return
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js'
    script.onload = () => setHanziWriterLoaded(true)
    document.head.appendChild(script)
  }, [hanziWriterLoaded])

  // Character list filtered
  const allChars = useMemo(() => {
    return Object.entries(characterData) as [string, CharData][]
  }, [])

  const filteredChars = useMemo(() => {
    return allChars.filter(([char, data]) => {
      const matchSearch = searchQuery === '' ||
        char.includes(searchQuery) ||
        data.pinyin.includes(searchQuery.toLowerCase()) ||
        data.meaning.includes(searchQuery)
      const matchLesson = lessonFilter === 0 || data.lesson === lessonFilter
      return matchSearch && matchLesson
    })
  }, [allChars, searchQuery, lessonFilter])

  const currentData = characterData[selectedChar]

  // Animate character with hanzi-writer
  const animateCharacter = useCallback(() => {
    if (!hanziWriterLoaded || !containerRef.current || !selectedChar) return
    const HW = (window as any).HanziWriter
    containerRef.current.innerHTML = ''
    writerRef.current = new HW(containerRef.current, selectedChar, {
      width: 250,
      height: 250,
      padding: 20,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 200,
      strokeColor: '#dc2626',
      outlineColor: '#fecaca',
      drawingColor: '#dc2626',
    })
    setRevealedStrokes(0)
    if (writerRef.current) {
      writerRef.current.animateCharacter({
        onComplete: () => setRevealedStrokes(currentData?.strokes || 0),
      })
    }
  }, [hanziWriterLoaded, selectedChar, currentData])

  // Show next stroke
  const showNextStroke = useCallback(() => {
    if (!writerRef.current || !currentData) return
    if (revealedStrokes < currentData.strokes) {
      writerRef.current.animateStroke(revealedStrokes)
      setRevealedStrokes(prev => prev + 1)
    }
  }, [revealedStrokes, currentData])

  // Reset character
  const resetCharacter = useCallback(() => {
    if (!hanziWriterLoaded || !containerRef.current || !selectedChar) return
    const HW = (window as any).HanziWriter
    containerRef.current.innerHTML = ''
    writerRef.current = new HW(containerRef.current, selectedChar, {
      width: 250,
      height: 250,
      padding: 20,
      showOutline: true,
      strokeColor: '#dc2626',
      outlineColor: '#fecaca',
      drawingColor: '#dc2626',
    })
    setRevealedStrokes(0)
  }, [hanziWriterLoaded, selectedChar])

  // Init character when selected changes
  const prevCharRef = useRef<string>('')
  useEffect(() => {
    if (hanziWriterLoaded && selectedChar && containerRef.current && prevCharRef.current !== selectedChar) {
      prevCharRef.current = selectedChar
      const HW = (window as any).HanziWriter
      containerRef.current.innerHTML = ''
      writerRef.current = new HW(containerRef.current, selectedChar, {
        width: 250,
        height: 250,
        padding: 20,
        showOutline: true,
        strokeColor: '#dc2626',
        outlineColor: '#fecaca',
        drawingColor: '#dc2626',
      })
      revealedStrokesRef.current = 0
      // Schedule state update asynchronously to satisfy lint
      requestAnimationFrame(() => setRevealedStrokes(0))
    }
  }, [hanziWriterLoaded, selectedChar])

  // Quiz functions
  const startQuiz = () => {
    const chars = Object.keys(characterData)
    const randomChar = chars[Math.floor(Math.random() * chars.length)]
    setQuizChar(randomChar)
    setQuizRevealed(0)
    setQuizResult(null)
    setQuizMode(true)

    // Create a quiz writer
    setTimeout(() => {
      if (!hanziWriterLoaded || !quizContainerRef.current || !randomChar) return
      const HW = (window as any).HanziWriter
      quizContainerRef.current.innerHTML = ''
      const qWriter = new HW(quizContainerRef.current, randomChar, {
        width: 200,
        height: 200,
        padding: 15,
        showOutline: true,
        strokeColor: '#dc2626',
        outlineColor: '#fecaca',
        drawingColor: '#dc2626',
      })
      // Hide all strokes by showing outline only
      ;(quizContainerRef.current as any)._hw = qWriter
    }, 100)
  }

  const revealNextQuizStroke = () => {
    const qWriter = (quizContainerRef.current as any)?._hw
    if (qWriter && quizChar) {
      const totalStrokes = characterData[quizChar]?.strokes || 0
      if (quizRevealed < totalStrokes) {
        qWriter.animateStroke(quizRevealed)
        setQuizRevealed(prev => prev + 1)
      }
    }
  }

  const radicalCategories = useMemo(() => {
    const cats = new Set(radicalsData.map(r => r.category))
    return Array.from(cats)
  }, [])

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
          {Object.keys(characterData).length} حرف متاح
        </Badge>
      </div>

      <Tabs defaultValue="viewer" className="w-full" dir="rtl">
        <TabsList className="grid grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="viewer">عارض الحروف</TabsTrigger>
          <TabsTrigger value="list">قائمة الحروف</TabsTrigger>
          <TabsTrigger value="radicals">الجذور</TabsTrigger>
          <TabsTrigger value="quiz">اختبر نفسك</TabsTrigger>
        </TabsList>

        {/* ─── Character Viewer Tab ─────────────────────────── */}
        <TabsContent value="viewer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Character Display */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6 flex flex-col items-center">
                <div
                  ref={containerRef}
                  className="w-[250px] h-[250px] bg-white rounded-xl border-2 border-red-100 flex items-center justify-center"
                >
                  {!hanziWriterLoaded && (
                    <div className="text-gray-400 text-sm">جاري التحميل...</div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-3 mt-4">
                  <Button onClick={animateCharacter} className="bg-red-600 hover:bg-red-700">
                    <Play className="w-4 h-4 ml-1" />
                    تشغيل
                  </Button>
                  <Button variant="outline" onClick={showNextStroke}>
                    <ChevronLeft className="w-4 h-4 ml-1" />
                    خطوة ({revealedStrokes}/{currentData?.strokes || 0})
                  </Button>
                  <Button variant="outline" onClick={resetCharacter}>
                    <RotateCcw className="w-4 h-4 ml-1" />
                    إعادة
                  </Button>
                  <Button variant="ghost" onClick={() => speak(selectedChar)}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Character Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الحرف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentData && (
                  <>
                    <div className="text-center bg-red-50 rounded-xl p-6">
                      <div className="font-chinese-serif text-6xl text-red-700 mb-2">{selectedChar}</div>
                      <div className="font-chinese-sans text-xl text-gray-600">{currentData.pinyin}</div>
                      <div className="text-lg text-gray-800 mt-1">{currentData.meaning}</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">عدد الخطوط</span>
                        <Badge variant="outline">{currentData.strokes} خطوط</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">الجذور</span>
                        <div className="flex gap-1">
                          {currentData.radicals.map((r, i) => (
                            <Badge key={i} variant="secondary" className="font-chinese-serif text-base">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">الدرس</span>
                        <Badge>الدرس {currentData.lesson}</Badge>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const keys = Object.keys(characterData)
                          const idx = keys.indexOf(selectedChar)
                          if (idx > 0) {
                            setSelectedChar(keys[idx - 1])
                          }
                        }}
                      >
                        <ChevronRight className="w-4 h-4 ml-1" />
                        السابق
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const keys = Object.keys(characterData)
                          const idx = keys.indexOf(selectedChar)
                          if (idx < keys.length - 1) {
                            setSelectedChar(keys[idx + 1])
                          }
                        }}
                      >
                        التالي
                        <ChevronLeft className="w-4 h-4 mr-1" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Character List Tab ───────────────────────────── */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث بالحرف، البينيين، أو المعنى..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={lessonFilter === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLessonFilter(0)}
              >
                الكل
              </Button>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(l => (
                <Button
                  key={l}
                  variant={lessonFilter === l ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLessonFilter(l)}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredChars.map(([char, data], idx) => (
              <motion.div
                key={char}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-md transition-all text-center p-2 ${
                    selectedChar === char ? 'border-red-500 border-2 bg-red-50' : ''
                  }`}
                  onClick={() => setSelectedChar(char)}
                >
                  <div className="font-chinese-serif text-2xl text-red-700">{char}</div>
                  <div className="text-[10px] text-gray-500 font-chinese-sans">{data.pinyin}</div>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {data.strokes} خط
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-gray-500 text-center">
            عرض {filteredChars.length} من {allChars.length} حرف
          </p>
        </TabsContent>

        {/* ─── Radicals Tab ─────────────────────────────────── */}
        <TabsContent value="radicals" className="space-y-6">
          {radicalCategories.map(category => (
            <div key={category}>
              <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                <GripVertical className="w-5 h-5" />
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {radicalsData
                  .filter(r => r.category === category)
                  .map((radical, idx) => (
                    <motion.div
                      key={radical.radical}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center border border-red-200">
                              <span className="font-chinese-serif text-3xl text-red-700">{radical.radical}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-800">{radical.meaning}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {radical.examples.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {radical.examples.map((ex, i) => (
                                      <Badge key={i} variant="outline" className="text-[10px]">
                                        {ex.char} {ex.meaning}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">بدون أمثلة في المستوى الحالي</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ─── Quiz Tab ─────────────────────────────────────── */}
        <TabsContent value="quiz" className="space-y-4">
          {!quizMode ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <Pen className="w-16 h-16 mx-auto text-red-300" />
                <h3 className="text-xl font-bold">اختبر نفسك</h3>
                <p className="text-gray-600">
                  سيظهر لك حرف صيني. حاول تذكر شكله، ثم اكشف الخطوط تدريجياً.
                </p>
                <Button onClick={startQuiz} className="bg-red-600 hover:bg-red-700 text-lg px-8">
                  ابدأ الاختبار
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  {quizResult === null ? (
                    <>
                      <p className="text-gray-600">ما هو هذا الحرف؟</p>
                      <div
                        ref={quizContainerRef}
                        className="w-[200px] h-[200px] bg-white rounded-xl border-2 border-red-100 flex items-center justify-center"
                      />
                      <div className="text-sm text-gray-400">
                        خطوط مكشوفة: {quizRevealed}/{quizChar ? characterData[quizChar]?.strokes : 0}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={revealNextQuizStroke}>
                          <Eye className="w-4 h-4 ml-1" />
                          اكشف خط
                        </Button>
                        <Button variant="outline" onClick={startQuiz}>
                          <RotateCcw className="w-4 h-4 ml-1" />
                          حرف آخر
                        </Button>
                      </div>

                      <div className="w-full max-w-md">
                        <p className="text-sm text-gray-500 mb-2">هل عرفت الرمز؟</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setQuizResult(true)}
                          >
                            <Check className="w-4 h-4 ml-1" />
                            نعم، عرفته
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => setQuizResult(false)}
                          >
                            <X className="w-4 h-4 ml-1" />
                            لا، لم أعرفه
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-4"
                    >
                      <div className="text-center bg-red-50 rounded-xl p-6">
                        <div className="font-chinese-serif text-6xl text-red-700 mb-2">{quizChar}</div>
                        <div className="font-chinese-sans text-xl text-gray-600">
                          {quizChar ? characterData[quizChar]?.pinyin : ''}
                        </div>
                        <div className="text-lg text-gray-800 mt-1">
                          {quizChar ? characterData[quizChar]?.meaning : ''}
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${quizResult ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {quizResult ? (
                          <p className="flex items-center justify-center gap-2 text-lg">
                            <Check className="w-6 h-6" /> ممتاز! 🎉
                          </p>
                        ) : (
                          <p className="flex items-center justify-center gap-2">
                            <Lightbulb className="w-5 h-5" /> لا بأس! راجع هذا الحرف وجرّب مرة أخرى.
                          </p>
                        )}
                      </div>
                      <Button onClick={startQuiz} className="bg-red-600 hover:bg-red-700">
                        حرف آخر
                        <ChevronLeft className="w-4 h-4 mr-1" />
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
