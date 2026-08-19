'use client'

import React, { useState, useMemo, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Mic, MicOff, RotateCcw, ChevronLeft, ChevronRight, Volume2,
  CheckCircle, XCircle, Lightbulb, Star, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { speak } from '@/lib/tts'
import { useSpeechRecognitionSupport } from '@/hooks/use-speech-support'
import { ts } from '@/lib/i18n'
import { useActiveLevel } from '@/lib/levels'
import { categories } from '@/data/categories'

// ─── Levenshtein Distance ───────────────────────────────────
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

// ─── Similarity Score ───────────────────────────────────────
function calculateSimilarity(spoken: string, expected: string): number {
  if (!spoken || !expected) return 0
  const cleanSpoken = spoken.trim().toLowerCase()
  const cleanExpected = expected.trim().toLowerCase()
  if (cleanSpoken === cleanExpected) return 100
  const distance = levenshteinDistance(cleanSpoken, cleanExpected)
  const maxLen = Math.max(cleanSpoken.length, cleanExpected.length)
  if (maxLen === 0) return 100
  return Math.round(((maxLen - distance) / maxLen) * 100)
}

// ─── Pronunciation Scoring ──────────────────────────────────
function scorePronunciation(spoken: string, expected: string, confidence: number): {
  score: number
  color: string
  feedback: string
  feedbackAr: string
} {
  const similarity = calculateSimilarity(spoken, expected)
  const weightedScore = Math.round(similarity * 0.6 + confidence * 100 * 0.4)

  if (weightedScore >= 85) {
    return {
      score: weightedScore,
      color: 'var(--clr-success)',
      feedback: 'Excellent pronunciation!',
      feedbackAr: 'ممتاز! نطقك رائع! 🎉',
    }
  } else if (weightedScore >= 65) {
    return {
      score: weightedScore,
      color: '#f97316',
      feedback: 'Good, but keep practicing!',
      feedbackAr: 'جيد! لكن استمر في التدريب 💪',
    }
  } else if (weightedScore >= 40) {
    return {
      score: weightedScore,
      color: '#eab308',
      feedback: 'Needs more practice.',
      feedbackAr: 'يحتاج مزيد من التمرين 📝',
    }
  } else {
    return {
      score: weightedScore,
      color: 'var(--clr-danger)',
      feedback: 'Try again, listen carefully.',
      feedbackAr: 'حاول مرة أخرى، استمع جيداً 🎧',
    }
  }
}

// ─── Practice Words ─────────────────────────────────────────
interface PracticeWord {
  zh: string
  pinyin: string
  meaning: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

const DEFAULT_PRACTICE_WORDS: PracticeWord[] = [
  // Easy - single syllable
  { zh: '你好', pinyin: 'nǐ hǎo', meaning: 'مرحباً', difficulty: 'easy', category: 'تحيات' },
  { zh: '谢谢', pinyin: 'xièxie', meaning: 'شكراً', difficulty: 'easy', category: 'تحيات' },
  { zh: '再见', pinyin: 'zàijiàn', meaning: 'مع السلامة', difficulty: 'easy', category: 'تحيات' },
  { zh: '我', pinyin: 'wǒ', meaning: 'أنا', difficulty: 'easy', category: 'ضمائر' },
  { zh: '你', pinyin: 'nǐ', meaning: 'أنت', difficulty: 'easy', category: 'ضمائر' },
  { zh: '他', pinyin: 'tā', meaning: 'هو', difficulty: 'easy', category: 'ضمائر' },
  { zh: '她', pinyin: 'tā', meaning: 'هي', difficulty: 'easy', category: 'ضمائر' },
  { zh: '是', pinyin: 'shì', meaning: 'يكون', difficulty: 'easy', category: 'أفعال' },
  { zh: '不', pinyin: 'bù', meaning: 'لا', difficulty: 'easy', category: 'أفعال' },
  { zh: '有', pinyin: 'yǒu', meaning: 'يملك', difficulty: 'easy', category: 'أفعال' },
  { zh: '大', pinyin: 'dà', meaning: 'كبير', difficulty: 'easy', category: 'صفات' },
  { zh: '小', pinyin: 'xiǎo', meaning: 'صغير', difficulty: 'easy', category: 'صفات' },
  { zh: '好', pinyin: 'hǎo', meaning: 'جيد', difficulty: 'easy', category: 'صفات' },
  { zh: '多', pinyin: 'duō', meaning: 'كثير', difficulty: 'easy', category: 'صفات' },
  { zh: '吃', pinyin: 'chī', meaning: 'يأكل', difficulty: 'easy', category: 'أفعال' },
  { zh: '喝', pinyin: 'hē', meaning: 'يشرب', difficulty: 'easy', category: 'أفعال' },
  { zh: '看', pinyin: 'kàn', meaning: 'ينظر', difficulty: 'easy', category: 'أفعال' },
  { zh: '水', pinyin: 'shuǐ', meaning: 'ماء', difficulty: 'easy', category: 'أسماء' },
  { zh: '茶', pinyin: 'chá', meaning: 'شاي', difficulty: 'easy', category: 'أسماء' },
  { zh: '人', pinyin: 'rén', meaning: 'شخص', difficulty: 'easy', category: 'أسماء' },
  // Medium
  { zh: '学习', pinyin: 'xuéxí', meaning: 'يتعلم', difficulty: 'medium', category: 'أفعال' },
  { zh: '工作', pinyin: 'gōngzuò', meaning: 'عمل', difficulty: 'medium', category: 'أسماء' },
  { zh: '老师', pinyin: 'lǎoshī', meaning: 'معلم', difficulty: 'medium', category: 'أسماء' },
  { zh: '学生', pinyin: 'xuéshēng', meaning: 'طالب', difficulty: 'medium', category: 'أسماء' },
  { zh: '中国', pinyin: 'Zhōngguó', meaning: 'الصين', difficulty: 'medium', category: 'أسماء' },
  { zh: '喜欢', pinyin: 'xǐhuan', meaning: 'يحب', difficulty: 'medium', category: 'أفعال' },
  { zh: '认识', pinyin: 'rènshi', meaning: 'يعرف', difficulty: 'medium', category: 'أفعال' },
  { zh: '知道', pinyin: 'zhīdào', meaning: 'يعلم', difficulty: 'medium', category: 'أفعال' },
  { zh: '朋友', pinyin: 'péngyou', meaning: 'صديق', difficulty: 'medium', category: 'أسماء' },
  { zh: '名字', pinyin: 'míngzi', meaning: 'اسم', difficulty: 'medium', category: 'أسماء' },
  { zh: '今天', pinyin: 'jīntiān', meaning: 'اليوم', difficulty: 'medium', category: 'زمن' },
  { zh: '明天', pinyin: 'míngtiān', meaning: 'غداً', difficulty: 'medium', category: 'زمن' },
  { zh: '早上', pinyin: 'zǎoshang', meaning: 'صباحاً', difficulty: 'medium', category: 'زمن' },
  { zh: '米饭', pinyin: 'mǐfàn', meaning: 'أرز', difficulty: 'medium', category: 'طعام' },
  { zh: '面条', pinyin: 'miàntiáo', meaning: 'نودلز', difficulty: 'medium', category: 'طعام' },
  // Hard
  { zh: '请问你叫什么名字？', pinyin: 'Qǐngwèn nǐ jiào shénme míngzi?', meaning: 'ما اسمك من فضلك؟', difficulty: 'hard', category: 'جمل' },
  { zh: '很高兴认识你。', pinyin: 'Hěn gāoxìng rènshi nǐ.', meaning: 'سعيد بمعرفتك.', difficulty: 'hard', category: 'جمل' },
  { zh: '我学习中文。', pinyin: 'Wǒ xuéxí Zhōngwén.', meaning: 'أنا أتعلم الصينية.', difficulty: 'hard', category: 'جمل' },
  { zh: '这个多少钱？', pinyin: 'Zhège duōshao qián?', meaning: 'بكم هذا؟', difficulty: 'hard', category: 'جمل' },
  { zh: '我每天早上七点起床。', pinyin: 'Wǒ měitiān zǎoshang qī diǎn qǐchuáng.', meaning: 'أستيقظ السابعة صباحاً كل يوم.', difficulty: 'hard', category: 'جمل' },
  { zh: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyou.', meaning: 'هو صديقي.', difficulty: 'hard', category: 'جمل' },
  { zh: '我们都是学生。', pinyin: 'Wǒmen dōu shì xuéshēng.', meaning: 'كلنا طلاب.', difficulty: 'hard', category: 'جمل' },
  { zh: '我想去中国。', pinyin: 'Wǒ xiǎng qù Zhōngguó.', meaning: 'أريد الذهاب للصين.', difficulty: 'hard', category: 'جمل' },
]

// ─── Speech Recognition Types ───────────────────────────────
interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

// ─── Main Component ─────────────────────────────────────────
export default function PronunciationPractice() {
  const { vocabulary, level } = useActiveLevel()
  const practiceWords = useMemo<PracticeWord[]>(() => {
    if (level === 1) return DEFAULT_PRACTICE_WORDS
    return vocabulary.map((w) => ({
      zh: w.zh,
      pinyin: w.pinyin,
      meaning: w.meaning,
      difficulty: w.difficulty,
      category: categories.find((c) => c.value === w.pos)?.label || w.pos,
    }))
  }, [vocabulary, level])
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [result, setResult] = useState<{
    spoken: string
    confidence: number
    score: number
    color: string
    feedbackAr: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Record<number, { scores: number[]; best: number }>>({})
  // Browser capability, read at render — not mirrored into state by an effect.
  // A runtime failure (permission denied, no engine) is separate state, because
  // that one really can change while the page is open.
  const detected = useSpeechRecognitionSupport()
  const [recognitionFailed, setRecognitionFailed] = useState(false)
  const isSupported = detected && !recognitionFailed
  const recognitionRef = useRef<any>(null)

  // Filtered words
  const filteredWords = useMemo(() => {
    if (difficultyFilter === 'all') return practiceWords
    return practiceWords.filter(w => w.difficulty === difficultyFilter)
  }, [difficultyFilter, practiceWords])

  const currentWord = filteredWords[currentWordIndex]

  // Start recording
  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('متصفحك لا يدعم التعرف على الصوت. يرجى استخدام Chrome أو Edge.')
      setRecognitionFailed(true)
      return
    }

    setError(null)
    setResult(null)
    setIsRecording(true)

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 5
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const results: SpeechRecognitionResultList = event.results
      // Check all alternatives (up to 5) and pick the best matching one
      let bestScore = 0
      let bestSpoken = ''
      let bestConfidence = 0
      const resultCount = results[0].length
      for (let i = 0; i < resultCount; i++) {
        const alt = results[0][i]
        const similarity = calculateSimilarity(alt.transcript, currentWord.zh)
        if (similarity > bestScore) {
          bestScore = similarity
          bestSpoken = alt.transcript
          bestConfidence = alt.confidence
        }
      }

      const pronResult = scorePronunciation(bestSpoken, currentWord.zh, bestConfidence)
      setResult({
        spoken: bestSpoken,
        confidence: bestConfidence,
        score: pronResult.score,
        color: pronResult.color,
        feedbackAr: pronResult.feedbackAr,
      })

      // Track attempts
      setAttempts(prev => {
        const current = prev[currentWordIndex] || { scores: [], best: 0 }
        const newScores = [...current.scores, pronResult.score]
        return {
          ...prev,
          [currentWordIndex]: {
            scores: newScores,
            best: Math.max(current.best, pronResult.score),
          },
        }
      })

      setIsRecording(false)
    }

    recognition.onerror = (event: any) => {
      setIsRecording(false)
      switch (event.error) {
        case 'no-speech':
          setError('لم يتم الكشف عن أي صوت. حاول مرة أخرى.')
          break
        case 'audio-capture':
          setError('لا يمكن الوصول إلى الميكروفون. تأكد من السماح بالوصول.')
          break
        case 'not-allowed':
          setError('تم رفض إذن الميكروفون. يرجى السماح بالوصول.')
          break
        case 'network':
          setError('خطأ في الشبكة. تأكد من اتصالك بالإنترنت.')
          break
        default:
          setError(`حدث خطأ: ${event.error}. حاول مرة أخرى.`)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [currentWord, currentWordIndex])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  // Next word
  const nextWord = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setResult(null)
      setError(null)
    }
  }

  // Previous word
  const prevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1)
      setResult(null)
      setError(null)
    }
  }

  // Random word
  const randomWord = () => {
    const idx = Math.floor(Math.random() * filteredWords.length)
    setCurrentWordIndex(idx)
    setResult(null)
    setError(null)
  }

  // Overall stats
  const overallStats = useMemo(() => {
    const allScores = Object.values(attempts).flatMap(a => a.scores)
    const avg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0
    const totalAttempts = allScores.length
    const excellent = allScores.filter(s => s >= 85).length
    return { avg, totalAttempts, excellent }
  }, [attempts])

  const wordAttempts = attempts[currentWordIndex]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[var(--clr-danger)] flex items-center justify-center gap-3">
          <Mic className="w-8 h-8" />
          تمارين النطق
        </h2>
        <p className="text-[var(--text-tertiary)]">{ts('تدرّب على نطق الصينية وحسّن لهجتك','Practice Chinese pronunciation and improve your accent')}</p>
      </div>

      {/* Not supported warning */}
      {!isSupported && (
        <Card className="border-[var(--clr-danger)]/30 bg-[var(--clr-danger-bg)]">
          <CardContent className="p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-[var(--clr-danger)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--clr-danger)]">{ts('المتصفح لا يدعم التعرف على الصوت','Your browser does not support speech recognition')}</p>
              <p className="text-xs text-[var(--clr-danger)] mt-1">{ts('يرجى استخدام Google Chrome أو Microsoft Edge لهذه الميزة.','Please use Google Chrome or Microsoft Edge for this feature.')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 justify-center flex-wrap">
        {[
          { value: 'all' as const, label: 'الكل' },
          { value: 'easy' as const, label: 'سهل' },
          { value: 'medium' as const, label: 'متوسط' },
          { value: 'hard' as const, label: 'صعب' },
        ].map(f => (
          <Button
            key={f.value}
            variant={difficultyFilter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setDifficultyFilter(f.value)
              setCurrentWordIndex(0)
              setResult(null)
              setError(null)
            }}
          >
            {f.label}
            <Badge variant="secondary" className="mr-1 text-[10px]">
              {f.value === 'all' ? practiceWords.length : practiceWords.filter(w => w.difficulty === f.value).length}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Main Practice Area ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {currentWord && (
            <>
              {/* Word Display */}
              <Card className="border-2 border-[var(--clr-danger)]/30">
                <CardContent className="p-8 text-center space-y-6">
                  {/* Category & difficulty */}
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{currentWord.category}</Badge>
                    <Badge variant={
                      currentWord.difficulty === 'easy' ? 'secondary' :
                      currentWord.difficulty === 'medium' ? 'default' : 'destructive'
                    }>
                      {currentWord.difficulty === 'easy' ? 'سهل' :
                       currentWord.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </Badge>
                  </div>

                  {/* Chinese character */}
                  <motion.div
                    key={currentWordIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div className="font-chinese-serif text-6xl text-[var(--clr-danger)]">{currentWord.zh}</div>
                    <div className="font-chinese-sans text-xl text-[var(--text-tertiary)]">{currentWord.pinyin}</div>
                    <div className="text-lg text-[var(--text-primary)]">{currentWord.meaning}</div>
                  </motion.div>

                  {/* Listen button */}
                  <Button variant="outline" onClick={() => speak(currentWord.zh)} className="mx-auto">
                    <Volume2 className="w-4 h-4 ml-1" />
                    استمع للنطق الصحيح
                  </Button>

                  {/* Mic Button */}
                  <div className="flex flex-col items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!isSupported}
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? 'bg-[var(--clr-danger)] shadow-lg shadow-[var(--clr-danger)]/30'
                          : 'bg-[var(--clr-danger-bg)] border-2 border-[var(--clr-danger)]/40 hover:border-[var(--clr-danger)] hover:bg-[var(--clr-danger-bg)]'
                      } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isRecording && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-[var(--clr-danger)]/50"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <AnimatePresence mode="wait">
                        {isRecording ? (
                          <motion.div key="recording" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <MicOff className="w-10 h-10 text-white" />
                          </motion.div>
                        ) : (
                          <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Mic className="w-10 h-10 text-[var(--clr-danger)]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <p className="text-sm text-[var(--text-muted)]">
                      {isRecording ? 'جاري التسجيل... اضغط للإيقاف' : 'سجّل نطقك'}
                    </p>
                  </div>

                  {/* Waveform animation while recording */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-1 h-8">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-[var(--clr-danger)] rounded-full"
                          animate={{
                            height: [4, Math.random() * 24 + 4, 4],
                          }}
                          transition={{
                            duration: 0.5 + Math.random() * 0.5,
                            repeat: Infinity,
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-[var(--clr-danger-bg)] text-[var(--clr-danger)] text-sm p-3 rounded-lg flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Result */}
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {/* Score display */}
                        <div className="flex justify-center">
                          <div
                            className="w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center"
                            style={{ borderColor: result.color }}
                          >
                            <span className="text-3xl font-bold" style={{ color: result.color }}>
                              {result.score}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">/ 100</span>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div
                          className="text-lg text-center p-3 rounded-lg"
                          style={{ backgroundColor: result.color + '15', color: result.color }}
                        >
                          {result.feedbackAr}
                        </div>

                        {/* Details */}
                        <div className="bg-[var(--surface-card-h)] rounded-lg p-4 text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">{ts('ما قلته:','You said:')}</span>
                            <span className="font-chinese-sans">{result.spoken}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">{ts('الصحيح:','Expected:')}</span>
                            <span className="font-chinese-sans font-bold text-[var(--clr-danger)]">{currentWord.zh}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">{ts('ثقة المحرك:','Engine confidence:')}</span>
                            <span>{Math.round(result.confidence * 100)}%</span>
                          </div>
                          {wordAttempts && (
                            <div className="flex justify-between">
                              <span className="text-[var(--text-muted)]">{ts('أفضل نتيجة:','Best score:')}</span>
                              <span style={{ color: wordAttempts.best >= 85 ? 'var(--clr-success)' : wordAttempts.best >= 60 ? '#f97316' : 'var(--clr-danger)' }}>
                                {wordAttempts.best}/100
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => { setResult(null); setError(null) }}
                          >
                            <RotateCcw className="w-4 h-4 ml-1" />
                            حاول مرة أخرى
                          </Button>
                          <Button onClick={nextWord} className="bg-[var(--clr-danger)] hover:bg-[var(--clr-danger)]/80">
                            الكلمة التالية
                            <ChevronLeft className="w-4 h-4 mr-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={prevWord} disabled={currentWordIndex <= 0}>
                  <ChevronRight className="w-4 h-4 ml-1" />
                  السابق
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-muted)]">
                    {currentWordIndex + 1} / {filteredWords.length}
                  </span>
                  <Button variant="ghost" size="sm" onClick={randomWord}>
                    عشوائي
                  </Button>
                </div>
                <Button variant="ghost" onClick={nextWord} disabled={currentWordIndex >= filteredWords.length - 1}>
                  التالي
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ─── Stats Sidebar ──────────────────────────────── */}
        <div className="space-y-4">
          {/* Overall Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{ts('إحصائيات النطق','Pronunciation stats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--clr-danger-bg)] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[var(--clr-danger)]">{overallStats.totalAttempts}</div>
                  <div className="text-xs text-[var(--text-muted)]">{ts('محاولات','attempts')}</div>
                </div>
                <div className="bg-[var(--clr-success-bg)] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[var(--clr-success)]">{overallStats.excellent}</div>
                  <div className="text-xs text-[var(--text-muted)]">ممتاز</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-muted)]">{ts('المتوسط العام','Overall average')}</span>
                  <span className="font-bold">{overallStats.avg}%</span>
                </div>
                <Progress value={overallStats.avg} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[var(--clr-warning)]" />
                نصائح للنطق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[var(--text-tertiary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--clr-danger)]">•</span>
                  استمع أولاً للنطق الصحيح ثم حاكه
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--clr-danger)]">•</span>
                  انتبه للنبرات الأربع — تغيير النبرة يغير المعنى
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--clr-danger)]">•</span>
                  تحدث ببطء ووضوح في البداية
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--clr-danger)]">•</span>
                  سجّل نفسك واسمع التسجيل للمقارنة
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--clr-danger)]">•</span>
                  استخدم Chrome أو Edge لأفضل نتيجة
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Recent attempts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{ts('آخر المحاولات','Recent attempts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(attempts).slice(-10).reverse().map(([idx, data]) => {
                  const word = filteredWords[parseInt(idx)]
                  if (!word) return null
                  return (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="font-chinese-serif text-[var(--clr-danger)]">{word.zh}</span>
                      <span className="text-[var(--text-muted)] flex-1 text-xs truncate">{word.meaning}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                        style={{
                          backgroundColor: data.best >= 85 ? '#22c55e20' : data.best >= 60 ? '#f9731620' : '#ef444420',
                          color: data.best >= 85 ? 'var(--clr-success)' : data.best >= 60 ? '#f97316' : 'var(--clr-danger)',
                        }}
                      >
                        {data.best}
                      </Badge>
                    </div>
                  )
                })}
                {Object.keys(attempts).length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] text-center py-4">
                    لم تبدأ بعد. اضغط على زر الميكروفون!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
