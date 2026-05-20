'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { tonePairs } from '@/data/content'
import { speak } from '@/lib/helpers'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { specialSounds } from '@/data/pinyin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Mic, Volume2, Brain, CheckCircle, XCircle,
  Lightbulb, Headphones, Play
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// Tab 1: Tone Training (تدريب النبرات)
// ═══════════════════════════════════════════════════════════
function ToneTrainingTab() {
  const [quizMode, setQuizMode] = useState(false)
  const [currentPairIdx, setCurrentPairIdx] = useState(0)
  const [targetTone, setTargetTone] = useState<number | null>(null)
  const [selectedTone, setSelectedTone] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showBrowse, setShowBrowse] = useState(true)

  const currentPair = tonePairs[currentPairIdx]

  const pickRandomTone = useCallback(() => {
    const pair = tonePairs[currentPairIdx]
    if (!pair) return
    const randomToneIdx = Math.floor(Math.random() * pair.tones.length)
    setTargetTone(randomToneIdx)
    setSelectedTone(null)
    setFeedback(null)
  }, [currentPairIdx])

  const startQuiz = useCallback(() => {
    setShowBrowse(false)
    setQuizMode(true)
    setScore({ correct: 0, total: 0 })
  }, [])

  const handleToneClick = useCallback((toneIdx: number) => {
    if (quizMode && targetTone !== null) {
      setSelectedTone(toneIdx)
      const isCorrect = toneIdx === targetTone
      setFeedback(isCorrect ? 'correct' : 'wrong')
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }))
      if (!isCorrect && targetTone !== null && currentPair) {
        speak(currentPair.tones[targetTone].char)
      }
      setTimeout(() => {
        pickRandomTone()
      }, 1500)
    } else {
      if (currentPair) {
        speak(currentPair.tones[toneIdx].char)
      }
    }
  }, [quizMode, targetTone, currentPair, pickRandomTone])

  const goToNextPair = useCallback(() => {
    setCurrentPairIdx(i => Math.min(tonePairs.length - 1, i + 1))
    setTargetTone(null)
    setSelectedTone(null)
    setFeedback(null)
  }, [])

  const goToPrevPair = useCallback(() => {
    setCurrentPairIdx(i => Math.max(0, i - 1))
    setTargetTone(null)
    setSelectedTone(null)
    setFeedback(null)
  }, [])

  const toneColors: Record<number, string> = {
    1: 'from-red-400 to-red-500',
    2: 'from-amber-400 to-orange-500',
    3: 'from-purple-400 to-purple-600',
    4: 'from-emerald-500 to-emerald-600',
  }

  const toneLabels: Record<number, string> = {
    1: 'النبرة الأولى',
    2: 'النبرة الثانية',
    3: 'النبرة الثالثة',
    4: 'النبرة الرابعة',
  }

  const toneSymbols: Record<number, string> = {
    1: '─',
    2: '↗',
    3: '↘↗',
    4: '↘',
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={!quizMode ? 'default' : 'outline'}
          onClick={() => { setShowBrowse(true); setQuizMode(false) }}
          className={!quizMode ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
        >
          <Headphones className="w-4 h-4 ml-1" />
          استعراض
        </Button>
        <Button
          variant={quizMode ? 'default' : 'outline'}
          onClick={startQuiz}
          className={quizMode ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
        >
          <Brain className="w-4 h-4 ml-1" />
          اختبار النبرات
        </Button>
      </div>

      {quizMode && (
        <Card className="border-0 shadow-sm bg-gradient-to-l from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-600" />
                اختبار النبرات
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">
                  {score.correct} صحيح
                </Badge>
                <Badge variant="outline" className="text-gray-500">
                  {score.total} سؤال
                </Badge>
              </div>
            </div>
            {score.total > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>النتيجة</span>
                  <span>{Math.round((score.correct / score.total) * 100)}%</span>
                </div>
                <Progress value={(score.correct / score.total) * 100} className="h-2" />
              </div>
            )}
            <p className="text-sm text-gray-600 mb-3">
              استمع للنبرة ثم اختر النبرة الصحيحة:
            </p>
          </CardContent>
        </Card>
      )}

      {/* Browse Mode - Pair Selector */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={goToPrevPair} disabled={currentPairIdx === 0}>
          السابق
        </Button>
        <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
          {tonePairs.map((pair, i) => (
            <button
              key={pair.syllable}
              onClick={() => { setCurrentPairIdx(i); setTargetTone(null); setSelectedTone(null); setFeedback(null) }}
              className={
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold font-chinese-sans transition-all " +
                (currentPairIdx === i
                  ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200')
              }
            >
              {pair.syllable}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={goToNextPair} disabled={currentPairIdx >= tonePairs.length - 1}>
          التالي
        </Button>
      </div>

      {/* Tone Cards */}
      {currentPair && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentPair.tones.map((tone, i) => {
            const isTarget = quizMode && targetTone === i
            const isSelected = selectedTone === i
            const colorClass = toneColors[tone.tone] || 'from-gray-400 to-gray-500'

            return (
              <button
                key={i}
                onClick={() => handleToneClick(i)}
                className={
                  "rounded-xl border-2 p-4 text-center transition-all " +
                  (isTarget && feedback === 'correct'
                    ? 'border-emerald-400 bg-emerald-50 shadow-lg scale-105'
                    : isTarget && feedback === 'wrong' && isSelected
                      ? 'border-red-400 bg-red-50'
                      : isTarget && feedback === 'wrong'
                        ? 'border-emerald-300 bg-emerald-50'
                        : isTarget
                          ? 'border-amber-300 bg-amber-50 animate-pulse'
                          : isSelected && feedback === 'wrong'
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white hover:shadow-md hover:border-gray-300'
                  )
                }
              >
                {/* Feedback Icon */}
                {feedback && isTarget && (
                  <div className="mb-1">
                    {feedback === 'correct' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </div>
                )}

                {/* Tone Symbol */}
                <div className={"text-2xl mb-2 " + (isTarget && quizMode ? 'opacity-0' : 'opacity-100')}>
                  {toneSymbols[tone.tone] || ''}
                </div>

                {/* Character */}
                <div className="font-chinese-serif text-3xl font-bold text-gray-900 mb-1">
                  {quizMode && isTarget ? '?' : tone.char}
                </div>

                {/* Pinyin */}
                <div className="font-chinese-sans text-sm text-gray-500 mb-1">
                  {quizMode && isTarget ? '???' : tone.pinyin}
                </div>

                {/* Meaning */}
                <div className="text-xs text-gray-600 mb-2">
                  {tone.meaning}
                </div>

                {/* Tone Label */}
                <div className={"text-[10px] font-bold bg-gradient-to-r " + colorClass + " text-white rounded-full px-2 py-0.5 inline-block"}>
                  {toneLabels[tone.tone]}
                </div>

                {/* Audio button (browse mode only) */}
                {!quizMode && (
                  <div className="mt-2">
                    <Volume2 className="w-4 h-4 text-gray-400 mx-auto" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Play target tone button */}
      {quizMode && targetTone !== null && currentPair && (
        <div className="text-center">
          <Button
            onClick={() => speak(currentPair.tones[targetTone].char)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            size="lg"
          >
            <Volume2 className="w-5 h-5 ml-2" />
            استمع مجدداً
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            المقطع: {currentPair.syllable} — استمع ثم اختر النبرة الصحيحة
          </p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Tab 2: Text Reading (قراءة النص)
// ═══════════════════════════════════════════════════════════
function TextReadingTab() {
  const [currentWordIdx, setCurrentWordIdx] = useState(0)
  const [pronScore, setPronScore] = useState<number | null>(null)
  const [pronListening, setPronListening] = useState(false)
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  const filteredWords = useMemo(() => {
    let words = vocabulary.slice(0, 60)
    if (filter !== 'all') {
      words = words.filter(w => w.difficulty === filter)
    }
    return words
  }, [filter])

  const currentWord = filteredWords[currentWordIdx]

  const startPronunciation = useCallback(() => {
    if (!currentWord || typeof window === 'undefined') return
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('متصفحك لا يدعم التعرف على الصوت. يرجى استخدام Chrome.')
      return
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SpeechRec()
    rec.lang = 'zh-CN'
    rec.interimResults = false
    rec.maxAlternatives = 5
    setPronListening(true)
    setPronScore(null)
    rec.onresult = (e: any) => {
      const results = e.results[0]
      let bestMatch = 0
      for (let i = 0; i < results.length; i++) {
        const similarity = results[i].transcript.toLowerCase().includes(currentWord.zh.toLowerCase())
          ? 1
          : (results[i].confidence || 0)
        if (similarity > bestMatch) bestMatch = similarity
      }
      setPronScore(Math.round(bestMatch * 100))
      setPronListening(false)
    }
    rec.onerror = () => setPronListening(false)
    rec.onend = () => setPronListening(false)
    rec.start()
  }, [currentWord])

  const goNext = useCallback(() => {
    setCurrentWordIdx(i => Math.min(filteredWords.length - 1, i + 1))
    setPronScore(null)
  }, [filteredWords.length])

  const goPrev = useCallback(() => {
    setCurrentWordIdx(i => Math.max(0, i - 1))
    setPronScore(null)
  }, [])

  if (!currentWord) return null

  const difficultyColor: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }
  const difficultyLabel: Record<string, string> = {
    easy: 'سهل',
    medium: 'متوسط',
    hard: 'صعب',
  }

  return (
    <div className="space-y-4">
      {/* Difficulty Filter */}
      <div className="flex gap-2">
        {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter(f); setCurrentWordIdx(0); setPronScore(null) }}
            className={filter === f ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
          >
            {f === 'all' ? 'الكل' : difficultyLabel[f]}
          </Button>
        ))}
      </div>

      {/* Word Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-l from-purple-50 to-fuchsia-50">
        <CardContent className="p-6 text-center space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <Progress value={((currentWordIdx + 1) / filteredWords.length) * 100} className="h-1.5 flex-1" />
            <span className="text-xs text-gray-400">{currentWordIdx + 1}/{filteredWords.length}</span>
          </div>

          {/* Character */}
          <button
            onClick={() => speak(currentWord.zh)}
            className="font-chinese-serif text-7xl text-gray-900 hover:text-purple-600 transition-colors cursor-pointer block mx-auto"
          >
            {currentWord.zh}
          </button>

          {/* Pinyin */}
          <div className="font-chinese-sans text-xl text-gray-500">
            {currentWord.pinyin}
          </div>

          {/* Meaning */}
          <div className="text-lg font-bold text-purple-700">
            {currentWord.meaning}
          </div>

          {/* Difficulty Badge */}
          <Badge className={difficultyColor[currentWord.difficulty]}>
            {difficultyLabel[currentWord.difficulty]}
          </Badge>

          {/* Example */}
          {currentWord.exZh && (
            <div className="bg-white/80 rounded-xl p-3 max-w-sm mx-auto">
              <div className="text-xs text-gray-400 mb-1">مثال:</div>
              <div
                className="font-chinese-sans text-sm text-gray-800 cursor-pointer hover:text-purple-600"
                onClick={() => speak(currentWord.exZh)}
              >
                {currentWord.exZh}
              </div>
              <div className="text-[11px] text-gray-400">{currentWord.exPinyin}</div>
              <div className="text-xs text-gray-500">{currentWord.exEn}</div>
            </div>
          )}

          {/* Listen button */}
          <Button
            variant="outline"
            onClick={() => speak(currentWord.zh)}
            className="mx-auto"
          >
            <Volume2 className="w-4 h-4 ml-2" />
            استمع
          </Button>

          {/* Record button */}
          <div className="space-y-3">
            <Button
              onClick={startPronunciation}
              disabled={pronListening}
              size="lg"
              className={
                pronListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse mx-auto'
                  : 'bg-purple-600 hover:bg-purple-700 text-white mx-auto'
              }
            >
              <Mic className={"w-5 h-5 ml-2 " + (pronListening ? 'animate-pulse' : '')} />
              {pronListening ? 'جارٍ الاستماع...' : 'انطق الكلمة'}
            </Button>

            {/* Score Display */}
            {pronScore !== null && (
              <div className="space-y-2">
                <Badge
                  className={
                    pronScore >= 85
                      ? 'bg-emerald-100 text-emerald-700 text-sm px-3 py-1'
                      : pronScore >= 60
                        ? 'bg-amber-100 text-amber-700 text-sm px-3 py-1'
                        : 'bg-red-100 text-red-700 text-sm px-3 py-1'
                  }
                >
                  {pronScore >= 85 && <CheckCircle className="w-4 h-4 ml-1" />}
                  {pronScore < 85 && <XCircle className="w-4 h-4 ml-1" />}
                  {pronScore >= 85 ? 'ممتاز!' : pronScore >= 60 ? 'جيد!' : 'حاول مجدداً'} {pronScore}%
                </Badge>
                <Progress
                  value={pronScore}
                  className="h-2.5 max-w-xs mx-auto"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={goPrev} disabled={currentWordIdx === 0}>
          السابق
        </Button>
        <Button variant="outline" onClick={goNext} disabled={currentWordIdx >= filteredWords.length - 1}>
          التالي
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Tab 3: Pronunciation Tips (نصائح للنطق)
// ═══════════════════════════════════════════════════════════
function PronunciationTipsTab() {
  const [expandedTip, setExpandedTip] = useState<number | null>(null)

  const tips = [
    {
      id: 1,
      title: 'النبرات الأربع',
      titleZh: '四声',
      icon: '🎵',
      color: 'from-red-500 to-red-600',
      content: 'اللغة الصينية لها أربع نبرات رئيسية ونبرة محايدة:',
      details: [
        { label: 'النبرة الأولى (─)', desc: 'صوت مسطح ومرتفع. مثل أنك تغني نغمة واحدة ثابتة.', example: '妈 mā (أم)' },
        { label: 'النبرة الثانية (↗)', desc: 'صوت يصعد من الأدنى للأعلى. مثلما تسأل: "حقاً؟"', example: '麻 má (قنب)' },
        { label: 'النبرة الثالثة (↘↗)', desc: 'صوت ينزل ثم يصعد. مثلما تقول: "لا... أو ربما نعم."', example: '马 mǎ (حصان)' },
        { label: 'النبرة الرابعة (↘)', desc: 'صوت حاد يهبط بقوة. مثلما تأمر: "توقف!"', example: '骂 mà (يشتم)' },
      ]
    },
    {
      id: 2,
      title: 'تغييرات النبرة',
      titleZh: '变调',
      icon: '🔄',
      color: 'from-amber-500 to-orange-500',
      content: 'بعض النبرات تتغير عند الجوار:',
      details: [
        { label: 'قاعدة 不 (bù)', desc: 'قبل النبرة الرابعة تتحول إلى النبرة الثانية: 不是 bú shì', example: '不好 bù hǎo (تبقى رابعة)' },
        { label: 'قاعدة 一 (yī)', desc: 'تتغير حسب النبرة التالية:', example: '一个 yí gè (ثانية) / 一天 yì tiān (رابعة)' },
        { label: '3 + 3', desc: 'عند اجتماع نبرتين ثالثتين، الأولى تصبح ثانية:', example: '你好 nǐ hǎo → ní hǎo' },
      ]
    },
    {
      id: 3,
      title: 'أخطاء شائعة للمتحدثين بالعربية',
      titleZh: '阿拉伯语母语者常见错误',
      icon: '⚠️',
      color: 'from-purple-500 to-purple-600',
      content: 'هذه الأخطاء شائعة بين المتحدثين بالعربية:',
      details: [
        { label: 'عدم التمييز بين zh و j', desc: 'zh تنطق من خلف الأسنان (مثل جيم عربية لكن أبعد خلفاً)، بينما j أقرب للأسنان الأمامية.', example: '中 zhōng ≠ 机 jī' },
        { label: 'عدم التمييز بين sh و x', desc: 'sh من خلف الأسنان، x أقرب لشين الإسبانية.', example: '是 shì ≠ 洗 xǐ' },
        { label: 'الخلط بين ch و q', desc: 'ch من خلف الأسنان مع نفخة، q أقرب للأمام مع نفخة.', example: '吃 chī ≠ 七 qī' },
        { label: 'نطق ü كـ u', desc: 'الصوت ü يختلف عن u. حاول النطق بـ "u" مع شفاه مضغوطة أكثر.', example: '女 nǚ (امرأة) ≠ 怒 nù (غضب)' },
        { label: 'تجاهل النبرات', desc: 'خطأ شائع جداً! النبرة تغير المعنى تماماً. تدرب عليها يومياً.', example: '妈 mā (أم) ≠ 马 mǎ (حصان) ≠ 骂 mà (يشتم)' },
      ]
    },
    {
      id: 4,
      title: 'وضع الفم واللسان',
      titleZh: '口型与舌位',
      icon: '👄',
      color: 'from-pink-500 to-rose-500',
      content: 'وضع الفم الصحيح مهم جداً للنطق الدقيق:',
      details: [
        { label: 'zh/ch/sh', desc: 'ارفع مقدمة اللسان لخلف الأسنان العلوية. يكون اللسان ملفوفاً قليلاً للخلف.', example: 'جرّب: أنطق جيم عربية ثم ارفع اللسان أكثر للخلف' },
        { label: 'j/q/x', desc: 'اللسان يلمس الجزء خلف الأسنان السفلية. الشفاه ممتدة كالابتسامة.', example: 'جرّب: ابتسم ثم أنطق شيئاً بين الأسنان' },
        { label: 'r', desc: 'أقوى من الراء العربية. لف اللسان للخلف واترك مساحة للهواء.', example: '人 rén - ارفع اللسان أكثر من الراء العربية' },
        { label: 'ü', desc: 'ابدأ بنطق "ee" ثم اضغط شفتيك للأمام كأنك ستقول "oo" دون أن تنتهي بـ oo.', example: '女 nǚ - ابتسم ثم اضغط الشفاه للأمام' },
      ]
    },
    {
      id: 5,
      title: 'أصوات خاصة',
      titleZh: '特殊发音',
      icon: '🎯',
      color: 'from-cyan-500 to-teal-500',
      content: 'أصوات لا وجود لها في العربية وتحتاج تدريباً خاصاً:',
      details: [
        { label: 'zh (جيم ملفوظة من الخلف)', desc: 'مثل الجيم العربية لكن اللسان أبعد خلفاً. شائع في كثير من الكلمات.', example: '中 zhōng (وسط/صين) / 这 zhè (هذا)' },
        { label: 'ch (تشاف من الخلف)', desc: 'مثل zh مع نفخة هوائية أقوى.', example: '吃 chī (يأكل) / 车 chē (سيارة)' },
        { label: 'sh (شين من الخلف)', desc: 'مثل الشين العربية لكن اللسان ملفوف للخلف.', example: '是 shì (يكون) / 书 shū (كتاب)' },
        { label: 'x (شين إسبانية)', desc: 'أقرب للأمام من sh. شبيهة بشين الإسبانية.', example: '学 xué (يتعلم) / 小 xiǎo (صغير)' },
        { label: 'q (تشاف إسبانية)', desc: 'أقرب للأمام من ch. مع نفخة.', example: '去 qù (يذهب) / 七 qī (سبعة)' },
        { label: 'ü (يو فرنسية)', desc: 'مثل يو الفرنسية. غير موجودة في العربية.', example: '女 nǚ (امرأة) / 绿 lǜ (أخضر)' },
      ]
    },
  ]

  return (
    <div className="space-y-3">
      {tips.map((tip) => (
        <Card
          key={tip.id}
          className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all"
          onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
        >
          <CardContent className="p-4">
            {/* Tip Header */}
            <div className="flex items-center gap-3">
              <div className={"w-10 h-10 rounded-lg bg-gradient-to-br " + tip.color + " flex items-center justify-center text-white text-lg flex-shrink-0"}>
                {tip.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">{tip.title}</h3>
                  <span className="font-chinese-sans text-xs text-gray-400">{tip.titleZh}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{tip.content}</p>
              </div>
              <div className={"w-6 h-6 rounded-full flex items-center justify-center text-gray-400 text-xs transition-transform " + (expandedTip === tip.id ? 'rotate-180' : '')}>
                ▼
              </div>
            </div>

            {/* Expanded Details */}
            {expandedTip === tip.id && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                {tip.details.map((detail, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-700">{detail.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">{detail.desc}</p>
                    <div className="bg-white rounded-lg px-3 py-2 text-xs">
                      <span className="text-gray-400">📝 </span>
                      <span className="font-chinese-sans text-gray-700">{detail.example}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Special Sounds Quick Reference */}
      <Card className="border-0 shadow-sm bg-gradient-to-l from-cyan-50 to-teal-50">
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            مرجع سريع - أصوات خاصة
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {specialSounds.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-chinese-sans font-bold text-xs">
                    {s.chinese}
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-gray-700">{s.description}</div>
                    <div className="text-[9px] text-gray-400">العربية: {s.arabic}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); speak(s.chinese) }}
                  className="p-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-600" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Main Pronunciation Section
// ═══════════════════════════════════════════════════════════
export default function PronunciationSection() {
  const [activeTab, setActiveTab] = useState<'tones' | 'reading' | 'tips'>('tones')

  const tabs = [
    { key: 'tones' as const, label: 'تدريب النبرات', icon: Brain },
    { key: 'reading' as const, label: 'قراءة النص', icon: Volume2 },
    { key: 'tips' as const, label: 'نصائح للنطق', icon: Lightbulb },
  ]

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-600" />
          تدريب النطق
        </h2>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all " +
              (activeTab === tab.key
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700')
            }
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'tones' && <ToneTrainingTab />}
      {activeTab === 'reading' && <TextReadingTab />}
      {activeTab === 'tips' && <PronunciationTipsTab />}
    </div>
  )
}
