'use client'
import { useState } from 'react'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { useLearningStore } from '@/lib/store'
import { speak } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Target, Volume2, Trophy, RotateCcw, Brain, Languages,
  ArrowLeftRight, Clock, Type, Headphones,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════
// LISTENING QUIZ TAB COMPONENT
// ═══════════════════════════════════════════════════════════
function ListeningQuizTab() {
  const store = useLearningStore()
  const { incrementStreak } = store
  const LISTEN_TOTAL = 10

  const [lqActive, setLqActive] = useState(false)
  const [lqRound, setLqRound] = useState(0)
  const [lqScore, setLqScore] = useState(0)
  const [lqWord, setLqWord] = useState<VocabWord | null>(null)
  const [lqOptions, setLqOptions] = useState<string[]>([])
  const [lqCorrectIdx, setLqCorrectIdx] = useState(0)
  const [lqAnswered, setLqAnswered] = useState<number | null>(null)
  const [lqFinished, setLqFinished] = useState(false)

  const generateListeningQuestion = () => {
    const w = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    // Get 3 wrong Arabic meanings from other words
    const wrongOptions = vocabulary
      .filter(v => v.id !== w.id && v.meaning !== w.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(v => v.meaning)
    const opts = [...wrongOptions, w.meaning].sort(() => Math.random() - 0.5)
    setLqWord(w)
    setLqOptions(opts)
    setLqCorrectIdx(opts.indexOf(w.meaning))
    setLqAnswered(null)
    // Play audio automatically
    setTimeout(() => speak(w.zh), 300)
  }

  const startListeningQuiz = () => {
    setLqActive(true)
    setLqRound(0)
    setLqScore(0)
    setLqFinished(false)
    generateListeningQuestion()
  }

  const handleListeningAnswer = (i: number) => {
    if (lqAnswered !== null || !lqWord) return
    setLqAnswered(i)
    const isCorrect = i === lqCorrectIdx
    if (isCorrect) {
      setLqScore(s => s + 1)
      incrementStreak()
    }
    // Record activity
    const today = new Date().toISOString().split('T')[0]
    store.recordDailyActivity(today, 0, 1, 0)

    // Check if finished after answering
    if (lqRound + 1 >= LISTEN_TOTAL) {
      const finalScore = isCorrect ? lqScore + 1 : lqScore
      // Record quiz history
      store.addQuizHistory({
        date: new Date().toISOString(),
        score: finalScore,
        total: LISTEN_TOTAL,
        difficulty: 'medium',
        type: 'listening',
      })
      // Update high score
      const pct = Math.round((finalScore / LISTEN_TOTAL) * 100)
      store.updateHighScore('quiz', pct)
    }
  }

  const nextListeningQuestion = () => {
    if (lqRound + 1 >= LISTEN_TOTAL) {
      setLqFinished(true)
      setLqRound(r => r + 1)
    } else {
      setLqRound(r => r + 1)
      generateListeningQuestion()
    }
  }

  const getListeningScoreMessage = (score: number, total: number) => {
    const pct = score / total
    if (pct >= 0.9) return 'ممتاز! 🎉 فهمك للمسموع رائع!'
    if (pct >= 0.7) return 'أحسنت! 👏 أذنك تتحسن!'
    if (pct >= 0.5) return 'جيد! 💪 استمر في الاستماع!'
    return 'تحتاج مراجعة! 🎧 استمع أكثر للمفردات.'
  }

  if (!lqActive) {
    return (
      <Card className="j-card border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-950 dark:to-blue-950 flex items-center justify-center">
            <Headphones className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">الاستماع</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
            استمع للنطق الصيني واختر المعنى العربي الصحيح. 10 أسئلة في كل جولة. درّب أذنك على فهم الصينية!
          </p>
          <Button onClick={startListeningQuiz} className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 gap-2">
            <Headphones className="w-4 h-4" />
            ابدأ الاختبار
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (lqFinished) {
    const pct = Math.round((lqScore / LISTEN_TOTAL) * 100)
    return (
      <Card className="j-card border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
          <Trophy className={`w-20 h-20 ${lqScore >= LISTEN_TOTAL * 0.7 ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`} />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getListeningScoreMessage(lqScore, LISTEN_TOTAL)}</h3>
          <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{lqScore} / {LISTEN_TOTAL}</div>
          <div className="text-lg text-gray-500 dark:text-gray-400">{pct}%</div>
          <Progress value={pct} className="w-64 h-3" />
          <Button onClick={startListeningQuiz} className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800">
            <RotateCcw className="w-4 h-4 ml-2" /> حاول مرة أخرى
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>السؤال {Math.min(lqRound + 1, LISTEN_TOTAL)} / {LISTEN_TOTAL}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 text-xs">النتيجة: {lqScore}</Badge>
        </div>
      </div>
      <Progress value={(lqRound / LISTEN_TOTAL) * 100} className="h-2" />
      {lqWord && (
        <>
          <Card className="j-card border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">ما معنى ما تسمعه؟</div>
              <button
                onClick={() => speak(lqWord.zh)}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600 hover:from-cyan-600 hover:to-blue-600 dark:hover:from-cyan-700 dark:hover:to-blue-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <Volume2 className="w-10 h-10 text-white" />
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500">اضغط للاستماع مرة أخرى</p>
              {lqAnswered !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <div className="font-chinese-serif text-4xl font-bold text-gray-900 dark:text-gray-100">{lqWord.zh}</div>
                  <div className="font-chinese-sans text-lg text-gray-500 dark:text-gray-400">{lqWord.pinyin}</div>
                </motion.div>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {lqOptions.map((opt, i) => {
              let btnClass = 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
              let animClass = ''
              if (lqAnswered !== null) {
                if (i === lqCorrectIdx) {
                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 ring-2 ring-emerald-400 dark:ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900'
                  if (lqAnswered === lqCorrectIdx) animClass = 'animate-pulse-correct'
                } else if (i === lqAnswered) {
                  btnClass = 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 ring-2 ring-red-400 dark:ring-red-500 ring-offset-2 dark:ring-offset-gray-900'
                  animClass = 'animate-pulse-wrong'
                } else {
                  btnClass += ' opacity-40'
                }
              }
              return (
                <Button
                  key={i}
                  variant="outline"
                  className={`h-auto py-4 text-sm ${btnClass} ${animClass} transition-all`}
                  onClick={() => handleListeningAnswer(i)}
                  disabled={lqAnswered !== null}
                >
                  {opt}
                </Button>
              )
            })}
          </div>
          {lqAnswered !== null && (
            <div className="text-center space-y-2">
              {lqAnswered === lqCorrectIdx ? (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                  ✅ أحسنت! فهمت المعنى بشكل صحيح!
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-sm font-medium">
                  ❌ المعنى الصحيح: <span className="font-bold">{lqWord!.meaning}</span>
                </div>
              )}
              <Button onClick={nextListeningQuestion} variant="outline" className="gap-1">
                <RotateCcw className="w-3 h-3" />
                {lqRound + 1 >= LISTEN_TOTAL ? 'عرض النتيجة' : 'التالي'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PINYIN QUIZ TAB COMPONENT
// ═══════════════════════════════════════════════════════════
function PinyinQuizTab() {
  const store = useLearningStore()
  const { incrementStreak } = store
  const PINYIN_TOTAL = 10

  const [pyActive, setPyActive] = useState(false)
  const [pyRound, setPyRound] = useState(0)
  const [pyScore, setPyScore] = useState(0)
  const [pyWord, setPyWord] = useState<VocabWord | null>(null)
  const [pyOptions, setPyOptions] = useState<string[]>([])
  const [pyCorrectIdx, setPyCorrectIdx] = useState(0)
  const [pyAnswered, setPyAnswered] = useState<number | null>(null)
  const [pyFinished, setPyFinished] = useState(false)

  const generatePinyinQuestion = () => {
    const w = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    // Get 3 wrong pinyin options from other words
    const wrongOptions = vocabulary
      .filter(v => v.id !== w.id && v.pinyin !== w.pinyin)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(v => v.pinyin)
    const opts = [...wrongOptions, w.pinyin].sort(() => Math.random() - 0.5)
    setPyWord(w)
    setPyOptions(opts)
    setPyCorrectIdx(opts.indexOf(w.pinyin))
    setPyAnswered(null)
  }

  const startPinyinQuiz = () => {
    setPyActive(true)
    setPyRound(0)
    setPyScore(0)
    setPyFinished(false)
    generatePinyinQuestion()
  }

  const handlePinyinAnswer = (i: number) => {
    if (pyAnswered !== null) return
    setPyAnswered(i)
    if (i === pyCorrectIdx) {
      setPyScore(s => s + 1)
      incrementStreak()
    }
    // Record activity
    const today = new Date().toISOString().split('T')[0]
    store.recordDailyActivity(today, 0, 1, 0)
  }

  const nextPinyinQuestion = () => {
    if (pyRound + 1 >= PINYIN_TOTAL) {
      setPyFinished(true)
      setPyRound(r => r + 1)
    } else {
      setPyRound(r => r + 1)
      generatePinyinQuestion()
    }
  }

  const getPinyinScoreMessage = (score: number, total: number) => {
    const pct = score / total
    if (pct >= 0.9) return 'ممتاز! 🎉 نطقك رائع!'
    if (pct >= 0.7) return 'أحسنت! 👏 تقدم جيد في البينيين!'
    if (pct >= 0.5) return 'جيد! 💪 استمر في التدريب!'
    return 'تحتاج مراجعة! 📚 راجع نطق الكلمات.'
  }

  if (!pyActive) {
    return (
      <Card className="j-card border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
            <Type className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">اختبار البيني</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            شاهد الحرف الصيني واختر البيني (النطق) الصحيح. 10 أسئلة في كل جولة.
          </p>
          <Button onClick={startPinyinQuiz} className="bg-red-600 hover:bg-red-700 gap-2">
            <Type className="w-4 h-4" />
            ابدأ الاختبار
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (pyFinished) {
    return (
      <Card className="j-card border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
          <Trophy className={`w-20 h-20 ${pyScore >= PINYIN_TOTAL * 0.7 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h3 className="text-2xl font-bold text-gray-900">{getPinyinScoreMessage(pyScore, PINYIN_TOTAL)}</h3>
          <div className="text-4xl font-bold text-red-600">{pyScore} / {PINYIN_TOTAL}</div>
          <Progress value={(pyScore / PINYIN_TOTAL) * 100} className="w-64 h-3" />
          <Button onClick={startPinyinQuiz} className="bg-red-600 hover:bg-red-700">
            <RotateCcw className="w-4 h-4 ml-2" /> حاول مرة أخرى
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>السؤال {Math.min(pyRound + 1, PINYIN_TOTAL)} / {PINYIN_TOTAL}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">النتيجة: {pyScore}</Badge>
        </div>
      </div>
      <Progress value={(pyRound / PINYIN_TOTAL) * 100} className="h-2" />
      {pyWord && (
        <>
          <Card className="j-card border-0 shadow-sm bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-xs text-red-500 font-medium">ما هو نطق هذا الحرف؟</div>
              <div
                className="font-chinese-serif text-7xl font-bold text-gray-900 cursor-pointer hover:text-red-600 transition-colors"
                onClick={() => speak(pyWord.zh)}
              >
                {pyWord.zh}
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs text-gray-400">{pyWord.pos} — {pyWord.meaning}</span>
                <button
                  onClick={() => speak(pyWord.zh)}
                  className="w-8 h-8 rounded-full bg-white border border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {pyOptions.map((opt, i) => {
              let btnClass = 'border-gray-200 hover:bg-gray-50 text-gray-900 font-chinese-sans'
              let animClass = ''
              if (pyAnswered !== null) {
                if (i === pyCorrectIdx) {
                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400 ring-offset-2 font-chinese-sans'
                  if (pyAnswered === pyCorrectIdx) animClass = 'animate-pulse-correct'
                } else if (i === pyAnswered) {
                  btnClass = 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-400 ring-offset-2 font-chinese-sans'
                  animClass = 'animate-pulse-wrong'
                } else {
                  btnClass += ' opacity-40'
                }
              }
              return (
                <Button
                  key={i}
                  variant="outline"
                  className={`h-auto py-4 text-base ${btnClass} ${animClass} transition-all`}
                  onClick={() => handlePinyinAnswer(i)}
                  disabled={pyAnswered !== null}
                >
                  {opt}
                </Button>
              )
            })}
          </div>
          {pyAnswered !== null && (
            <div className="text-center space-y-2">
              {pyAnswered === pyCorrectIdx ? (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
                  ✅ أحسنت! النطق صحيح!
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
                  ❌ النطق الصحيح: <span className="font-chinese-sans text-lg font-bold">{pyWord!.pinyin}</span>
                </div>
              )}
              <Button onClick={nextPinyinQuestion} variant="outline" className="gap-1">
                <RotateCcw className="w-3 h-3" />
                {pyRound + 1 >= PINYIN_TOTAL ? 'عرض النتيجة' : 'التالي'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PRACTICE SECTION (Enhanced Quiz)
// ═══════════════════════════════════════════════════════════
export function PracticeSection({ quizAnswer, setQuizAnswer, quizFinished, setQuizFinished, generateQuiz, quizDifficulty, setQuizDifficulty, hardTimer, setHardTimer }: {
  quizAnswer: number | null
  setQuizAnswer: (a: number | null) => void
  quizFinished: boolean
  setQuizFinished: (f: boolean) => void
  generateQuiz: () => void
  quizDifficulty: 'easy' | 'medium' | 'hard'
  setQuizDifficulty: (d: 'easy' | 'medium' | 'hard') => void
  hardTimer: number
  setHardTimer: (t: number) => void
}) {
  const store = useLearningStore()
  const { quizQuestions, quizScore, quizTotal, currentQuizQuestion, answerQuiz, nextQuizQuestion, resetQuiz, incrementStreak } = store
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
    const selected = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 6)
    setMatchPairs(selected.map(w => ({ zh: w.zh, ar: w.meaning })))
    setMatchedItems(new Set())
    setSelectedMatch(null)
  }
  // Reverse Quiz state (meaning → character)
  const [reverseWord, setReverseWord] = useState<VocabWord | null>(null)
  const [reverseOptions, setReverseOptions] = useState<string[]>([])
  const [reverseAnswered, setReverseAnswered] = useState<number | null>(null)
  const [reverseCorrectIndex, setReverseCorrectIndex] = useState(0)
  const [reverseScore, setReverseScore] = useState(0)
  const [reverseRound, setReverseRound] = useState(0)
  const [reverseTotal, setReverseTotal] = useState(10)
  const startReverseQuiz = () => {
    const w = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    const wrong = vocabulary.filter(v => v.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.zh)
    const opts = [...wrong, w.zh].sort(() => Math.random() - 0.5)
    setReverseWord(w)
    setReverseOptions(opts)
    setReverseCorrectIndex(opts.indexOf(w.zh))
    setReverseAnswered(null)
    if (reverseRound >= reverseTotal) {
      setReverseRound(0)
      setReverseScore(0)
    }
  }
  const handleReverseAnswer = (i: number) => {
    if (reverseAnswered !== null) return
    setReverseAnswered(i)
    if (i === reverseCorrectIndex) {
      setReverseScore(s => s + 1)
      incrementStreak()
    }
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
  const getScoreMessage = (score: number, total: number) => {
    const pct = score / total
    if (pct >= 0.9) return 'ممتاز! 🎉 أنت نجم حقيقي في اللغة الصينية!'
    if (pct >= 0.8) return 'أحسنت! 👏 تقدم رائع، واصل!'
    if (pct >= 0.6) return 'جيد! 💪 أنت في الطريق الصحيح، استمر!'
    if (pct >= 0.4) return 'لا بأس! 📚 راجع المفردات وحاول مرة أخرى.'
    return 'حاول مرة أخرى! 💡 استخدم البطاقات التعليمية للمراجعة.'
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-red-600" />
            التمارين
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
      </div>
      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="quiz">اختيار متعدد</TabsTrigger>
          <TabsTrigger value="listening">الاستماع</TabsTrigger>
          <TabsTrigger value="pinyin">اختبار البيني</TabsTrigger>
          <TabsTrigger value="fill">اكمل الفراغ</TabsTrigger>
          <TabsTrigger value="match">طابق الأزواج</TabsTrigger>
          <TabsTrigger value="writing">الكتابة</TabsTrigger>
          <TabsTrigger value="reverse">معنى←حرف</TabsTrigger>
        </TabsList>
        {/* Listening Quiz Tab */}
        <TabsContent value="listening" className="space-y-4">
          <ListeningQuizTab />
        </TabsContent>
        {/* Pinyin Quiz Tab */}
        <TabsContent value="pinyin" className="space-y-4">
          <PinyinQuizTab />
        </TabsContent>
        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4">
          {!quizQuestions.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Brain className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">اختبار المفردات</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  20 سؤال عشوائي لاختبار معرفتك بالمفردات الصينية. اختر مستوى الصعوبة.
                </p>
                <div className="flex gap-3">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setQuizDifficulty(d)}
                      className={"difficulty-pill difficulty-pill-" + d + (quizDifficulty === d ? " active" : "")}
                    >
                      <span>{d === 'easy' ? '\uD83D\uDFE2' : d === 'medium' ? '\uD83D\uDFE1' : '\uD83D\uDD34'}</span>
                      {d === 'easy' ? 'سهل' : d === 'medium' ? 'متوسط' : 'صعب'}
                    </button>
                  ))}
                </div>
                <Button onClick={() => { generateQuiz(); incrementStreak() }} className="bg-red-600 hover:bg-red-700">
                  ابدأ الاختبار
                </Button>
              </CardContent>
            </Card>
          ) : !quizFinished ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>السؤال {currentQuizQuestion + 1} من {quizTotal}</span>
                  <div className="flex items-center gap-3">
                    {quizDifficulty === 'hard' && (
                      <Badge variant={hardTimer <= 5 ? 'destructive' : 'secondary'} className="gap-1">
                        <Clock className="w-3 h-3" />
                        {hardTimer}ث
                      </Badge>
                    )}
                    <span>النتيجة: {quizScore}/{quizTotal}</span>
                  </div>
                </div>
                <Progress value={(currentQuizQuestion / quizTotal) * 100} className="h-2.5 bg-gradient-to-r from-red-500 to-amber-500" />
                <div className="text-center space-y-4">
                  <div
                    className="font-chinese-serif text-6xl text-gray-900 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={() => speak(currentQuestion.question)}
                  >
                    {currentQuestion.question}
                  </div>
                  {/* Show pinyin hint in easy mode */}
                  {quizDifficulty === 'easy' && currentQuestion.questionPinyin && (
                    <div className="text-sm text-gray-400 font-chinese-sans">{currentQuestion.questionPinyin}</div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => speak(currentQuestion.question)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt, i) => {
                    let btnClass = 'border-gray-200 hover:bg-gray-50 text-gray-900'
                    let animClass = ''
                    if (quizAnswer !== null) {
                      if (i === currentQuestion.correctIndex) {
                        btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400 ring-offset-2'
                        if (quizAnswer === currentQuestion.correctIndex) animClass = 'animate-pulse-correct'
                      }
                      else if (i === quizAnswer) {
                        btnClass = 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-400 ring-offset-2'
                        animClass = 'animate-pulse-wrong'
                      }
                    }
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={`h-auto py-3 text-sm ${btnClass} ${animClass} transition-all`}
                        onClick={() => {
                          if (quizAnswer !== null) return
                          setQuizAnswer(i)
                          answerQuiz(i === currentQuestion.correctIndex)
                          setTimeout(() => {
                            if (currentQuizQuestion < quizTotal - 1) {
                              nextQuizQuestion()
                              setQuizAnswer(null)
                              setHardTimer(15)
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
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
                <Trophy className={`w-20 h-20 ${quizScore >= quizTotal * 0.8 ? 'text-yellow-500' : 'text-gray-400'}`} />
                <h3 className="text-2xl font-bold text-gray-900">
                  {getScoreMessage(quizScore, quizTotal)}
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
            <Card className="j-card border-0 shadow-sm">
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
            <Card className="j-card border-0 shadow-sm">
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
            <Card className="j-card border-0 shadow-sm">
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
        {/* Writing Tab */}
        <TabsContent value="writing">
          {!fillBlankWord ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Languages className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">تدرب على الكتابة</h3>
              <p className="text-sm text-gray-500 mb-4">اكتب البيني للكلمة الصينية المعروضة</p>
              <Button onClick={() => {
                const random = vocabulary[Math.floor(Math.random() * vocabulary.length)]
                setFillBlankWord(random)
                setFillAnswer('')
                setFillResult(null)
              }} className="gap-2">
                <Languages className="w-4 h-4" />
                ابدأ التدريب
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="text-center p-6">
                <div className="font-chinese-serif text-5xl font-bold mb-2">{fillBlankWord.zh}</div>
                <div className="text-gray-500 text-sm">{fillBlankWord.pos} — {fillBlankWord.meaning}</div>
                <button onClick={() => speak(fillBlankWord.zh)} className="mt-2">
                  <Volume2 className="w-5 h-5 mx-auto text-red-500" />
                </button>
              </Card>
              <div className="flex gap-2">
                <Input
                  value={fillAnswer}
                  onChange={(e) => setFillAnswer(e.target.value)}
                  placeholder="اكتب البيني هنا..."
                  className="text-left font-chinese-sans"
                  dir="ltr"
                />
                <Button onClick={() => {
                  const correct = fillAnswer.trim().toLowerCase() === fillBlankWord.pinyin.toLowerCase().replace(/\s/g, '')
                  setFillResult(correct ? 'correct' : 'wrong')
                  if (correct) incrementStreak()
                }}>تحقق</Button>
                <Button variant="outline" onClick={startFillBlank}>التالي</Button>
              </div>
              {fillResult && (
                <div className={`p-3 rounded-lg text-center ${fillResult === 'correct' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {fillResult === 'correct' ? '✅ أحسنت! إجابة صحيحة!' : `❌ حاول مرة أخرى! الجواب الصحيح: ${fillBlankWord.pinyin}`}
                </div>
              )}
            </div>
          )}
        </TabsContent>
        {/* Reverse Quiz Tab — Meaning → Character */}
        <TabsContent value="reverse" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              الجولة: {Math.min(reverseRound + 1, reverseTotal)}/{reverseTotal} • النقاط: {reverseScore}
            </div>
            {reverseRound >= reverseTotal && reverseWord && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                النتيجة النهائية: {reverseScore}/{reverseTotal}
              </Badge>
            )}
          </div>
          {!reverseWord ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <ArrowLeftRight className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">اختر الحرف الصحيح</h3>
              <p className="text-sm text-gray-500 mb-4">شاهد المعنى العربي واختر الحرف الصيني المناسب</p>
              <Button onClick={startReverseQuiz} className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <ArrowLeftRight className="w-4 h-4" />
                ابدأ التمرين ({reverseTotal} أسئلة)
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-0">
                <div className="text-xs text-purple-500 font-medium mb-1">ما هو الحرف الصيني المناسب؟</div>
                <div className="text-xl font-bold text-gray-900 mb-1">{reverseWord.meaning}</div>
                <div className="text-sm text-gray-400 font-chinese-sans" dir="ltr">{reverseWord.pinyin}</div>
                <button onClick={() => speak(reverseWord.zh)} className="mt-2 mx-auto">
                  <Volume2 className="w-5 h-5 text-purple-500" />
                </button>
              </Card>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {reverseOptions.map((opt, i) => (
                  <button key={i}
                    onClick={() => handleReverseAnswer(i)}
                    disabled={reverseAnswered !== null}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center font-chinese-serif text-4xl transition-all
                      ${reverseAnswered === null ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md' : ''}
                      ${reverseAnswered === i && i === reverseCorrectIndex ? 'border-emerald-400 bg-emerald-50 animate-pulse-correct' : ''}
                      ${reverseAnswered === i && i !== reverseCorrectIndex ? 'border-red-400 bg-red-50 animate-pulse-wrong' : ''}
                      ${reverseAnswered !== null && i !== reverseCorrectIndex && i !== reverseAnswered ? 'opacity-40' : ''}
                    `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {reverseAnswered !== null && (
                <div className="text-center space-y-2">
                  {reverseAnswered === reverseCorrectIndex ? (
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
                      ✅ أحسنت! الإجابة صحيحة!
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
                      ❌ الجواب الصحيح: <span className="font-chinese-serif text-lg">{reverseWord.zh}</span>
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      if (reverseRound + 1 >= reverseTotal) {
                        setReverseRound(r => r + 1)
                      } else {
                        setReverseRound(r => r + 1)
                        startReverseQuiz()
                      }
                    }}
                    variant="outline"
                    className="gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {reverseRound + 1 >= reverseTotal ? 'عرض النتيجة' : 'التالي'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
