'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Clock, Headphones, BookOpen, Play, CheckCircle, XCircle,
  Trophy, AlertTriangle, RotateCcw, ChevronLeft, ChevronRight, Volume2
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

// ─── Question Types ─────────────────────────────────────────
interface ExamQuestion {
  type: 'listening' | 'reading'
  subType: 'choice' | 'trueFalse' | 'match'
  question: string
  options: string[]
  correctIndex: number
  audioText?: string // For listening questions
  pinyin?: string
  points: number
}

// ─── Vocabulary pool for exam generation ────────────────────
interface VocabItem {
  zh: string
  pinyin: string
  meaning: string
}

const examVocab: VocabItem[] = [
  { zh: '你好', pinyin: 'nǐ hǎo', meaning: 'مرحباً' },
  { zh: '再见', pinyin: 'zàijiàn', meaning: 'مع السلامة' },
  { zh: '谢谢', pinyin: 'xièxie', meaning: 'شكراً' },
  { zh: '对不起', pinyin: 'duìbuqǐ', meaning: 'آسف' },
  { zh: '我', pinyin: 'wǒ', meaning: 'أنا' },
  { zh: '你', pinyin: 'nǐ', meaning: 'أنت' },
  { zh: '他', pinyin: 'tā', meaning: 'هو' },
  { zh: '她', pinyin: 'tā', meaning: 'هي' },
  { zh: '是', pinyin: 'shì', meaning: 'يكون' },
  { zh: '不', pinyin: 'bù', meaning: 'لا' },
  { zh: '有', pinyin: 'yǒu', meaning: 'يملك' },
  { zh: '在', pinyin: 'zài', meaning: 'في' },
  { zh: '大', pinyin: 'dà', meaning: 'كبير' },
  { zh: '小', pinyin: 'xiǎo', meaning: 'صغير' },
  { zh: '好', pinyin: 'hǎo', meaning: 'جيد' },
  { zh: '多', pinyin: 'duō', meaning: 'كثير' },
  { zh: '少', pinyin: 'shǎo', meaning: 'قليل' },
  { zh: '吃', pinyin: 'chī', meaning: 'يأكل' },
  { zh: '喝', pinyin: 'hē', meaning: 'يشرب' },
  { zh: '看', pinyin: 'kàn', meaning: 'ينظر' },
  { zh: '学', pinyin: 'xué', meaning: 'يتعلم' },
  { zh: '工作', pinyin: 'gōngzuò', meaning: 'عمل' },
  { zh: '老师', pinyin: 'lǎoshī', meaning: 'معلم' },
  { zh: '学生', pinyin: 'xuéshēng', meaning: 'طالب' },
  { zh: '中国', pinyin: 'Zhōngguó', meaning: 'الصين' },
  { zh: '今天', pinyin: 'jīntiān', meaning: 'اليوم' },
  { zh: '明天', pinyin: 'míngtiān', meaning: 'غداً' },
  { zh: '昨天', pinyin: 'zuótiān', meaning: 'أمس' },
  { zh: '早上', pinyin: 'zǎoshang', meaning: 'صباحاً' },
  { zh: '水', pinyin: 'shuǐ', meaning: 'ماء' },
  { zh: '茶', pinyin: 'chá', meaning: 'شاي' },
  { zh: '米饭', pinyin: 'mǐfàn', meaning: 'أرز' },
  { zh: '朋友', pinyin: 'péngyou', meaning: 'صديق' },
  { zh: '家', pinyin: 'jiā', meaning: 'بيت' },
  { zh: '学校', pinyin: 'xuéxiào', meaning: 'مدرسة' },
  { zh: '医院', pinyin: 'yīyuàn', meaning: 'مستشفى' },
  { zh: '商店', pinyin: 'shāngdiàn', meaning: 'متجر' },
  { zh: '名字', pinyin: 'míngzi', meaning: 'اسم' },
  { zh: '什么', pinyin: 'shénme', meaning: 'ماذا' },
  { zh: '怎么', pinyin: 'zěnme', meaning: 'كيف' },
  { zh: '几', pinyin: 'jǐ', meaning: 'كم (عدد قليل)' },
  { zh: '多少', pinyin: 'duōshao', meaning: 'كم (عدد/سعر)' },
  { zh: '很', pinyin: 'hěn', meaning: 'جداً' },
  { zh: '都', pinyin: 'dōu', meaning: 'كل' },
  { zh: '也', pinyin: 'yě', meaning: 'أيضاً' },
  { zh: '想', pinyin: 'xiǎng', meaning: 'يريد' },
  { zh: '可以', pinyin: 'kěyǐ', meaning: 'يمكن' },
  { zh: '会', pinyin: 'huì', meaning: 'يستطيع' },
  { zh: '应该', pinyin: 'yīnggāi', meaning: 'يجب' },
  { zh: '去', pinyin: 'qù', meaning: 'يذهب' },
  { zh: '来', pinyin: 'lái', meaning: 'يأتي' },
  { zh: '买', pinyin: 'mǎi', meaning: 'يشتري' },
  { zh: '卖', pinyin: 'mài', meaning: 'يبيع' },
  { zh: '喜欢', pinyin: 'xǐhuan', meaning: 'يحب' },
  { zh: '认识', pinyin: 'rènshi', meaning: 'يعرف' },
  { zh: '知道', pinyin: 'zhīdào', meaning: 'يعلم' },
]

const sentencePool = [
  { zh: '我是学生。', pinyin: 'Wǒ shì xuéshēng.', meaning: 'أنا طالب.' },
  { zh: '他是中国人。', pinyin: 'Tā shì Zhōngguó rén.', meaning: 'هو صيني.' },
  { zh: '我有一个朋友。', pinyin: 'Wǒ yǒu yí gè péngyou.', meaning: 'لدي صديق.' },
  { zh: '她喜欢喝茶。', pinyin: 'Tā xǐhuan hē chá.', meaning: 'هي تحب شرب الشاي.' },
  { zh: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', meaning: 'الطقس اليوم جيد.' },
  { zh: '我每天早上七点起床。', pinyin: 'Wǒ měitiān zǎoshang qī diǎn qǐchuáng.', meaning: 'أستيقظ السابعة صباحاً كل يوم.' },
  { zh: '这个多少钱？', pinyin: 'Zhège duōshao qián?', meaning: 'بكم هذا؟' },
  { zh: '请问，厕所在哪儿？', pinyin: 'Qǐngwèn, cèsuǒ zài nǎr?', meaning: 'عفواً، أين الحمام؟' },
  { zh: '我想去中国。', pinyin: 'Wǒ xiǎng qù Zhōngguó.', meaning: 'أريد الذهاب للصين.' },
  { zh: '我们都在学校学习。', pinyin: 'Wǒmen dōu zài xuéxiào xuéxí.', meaning: 'كلنا نتعلم في المدرسة.' },
  { zh: '他不认识那个人。', pinyin: 'Tā bù rènshi nà gè rén.', meaning: 'هو لا يعرف ذلك الشخص.' },
  { zh: '你能帮助我吗？', pinyin: 'Nǐ néng bāngzhù wǒ ma?', meaning: 'هل يمكنك مساعدتي؟' },
  { zh: '她也是我的朋友。', pinyin: 'Tā yě shì wǒ de péngyou.', meaning: 'هي أيضاً صديقتي.' },
  { zh: '这本书很有意思。', pinyin: 'Zhè běn shū hěn yǒuyìsi.', meaning: 'هذا الكتاب ممتع جداً.' },
  { zh: '我昨天去了商店。', pinyin: 'Wǒ zuótiān qù le shāngdiàn.', meaning: 'ذهبت للمتجر أمس.' },
  { zh: '请你帮我说中文。', pinyin: 'Qǐng nǐ bāng wǒ shuō Zhōngwén.', meaning: 'ساعدني على التحدث بالصينية من فضلك.' },
  { zh: '他很忙，没有时间。', pinyin: 'Tā hěn máng, méiyǒu shíjiān.', meaning: 'هو مشغول وليس لديه وقت.' },
  { zh: '我们都喜欢中国菜。', pinyin: 'Wǒmen dōu xǐhuan Zhōngguó cài.', meaning: 'كلنا نحب الطعام الصيني.' },
  { zh: '你应该多练习。', pinyin: 'Nǐ yīnggāi duō liànxí.', meaning: 'يجب أن تتدرب أكثر.' },
  { zh: '明天会下雨吗？', pinyin: 'Míngtiān huì xiàyǔ ma?', meaning: 'هل ستمطر غداً؟' },
]

// ─── Exam Generation ────────────────────────────────────────
function generateListeningQuestions(count: number): ExamQuestion[] {
  const questions: ExamQuestion[] = []
  const shuffled = [...examVocab].sort(() => Math.random() - 0.5)

  for (let i = 0; i < count && i < shuffled.length; i++) {
    const correct = shuffled[i]
    const wrongs = examVocab.filter(v => v.zh !== correct.zh).sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...wrongs, correct].sort(() => Math.random() - 0.5)
    questions.push({
      type: 'listening',
      subType: 'choice',
      question: 'استمع واختر المعنى الصحيح:',
      options: options.map(o => o.meaning),
      correctIndex: options.indexOf(correct),
      audioText: correct.zh,
      pinyin: correct.pinyin,
      points: Math.round(100 / count * 10) / 10,
    })
  }
  return questions
}

function generateReadingQuestions(count: number): ExamQuestion[] {
  const questions: ExamQuestion[] = []
  const shuffled = [...examVocab].sort(() => Math.random() - 0.5)

  for (let i = 0; i < count && i < shuffled.length; i++) {
    const correct = shuffled[i]
    const wrongs = examVocab.filter(v => v.zh !== correct.zh).sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...wrongs, correct].sort(() => Math.random() - 0.5)
    questions.push({
      type: 'reading',
      subType: 'choice',
      question: `ما معنى "${correct.zh}"؟`,
      options: options.map(o => o.meaning),
      correctIndex: options.indexOf(correct),
      pinyin: correct.pinyin,
      points: Math.round(100 / count * 10) / 10,
    })
  }
  return questions
}

function generateTrueFalseQuestions(count: number): ExamQuestion[] {
  const questions: ExamQuestion[] = []
  const shuffledSentences = [...sentencePool].sort(() => Math.random() - 0.5).slice(0, count)

  for (const s of shuffledSentences) {
    const isCorrect = Math.random() > 0.5
    const wrongMeaning = sentencePool.find(sp => sp.zh !== s.zh && sp.meaning !== s.meaning)
    questions.push({
      type: 'reading',
      subType: 'trueFalse',
      question: `${s.zh} — هل معناها:`,
      options: [
        isCorrect ? s.meaning : (wrongMeaning?.meaning || 'معنى خاطئ'),
        isCorrect ? (wrongMeaning?.meaning || 'معنى خاطئ') : s.meaning,
      ],
      correctIndex: isCorrect ? 0 : 1,
      pinyin: s.pinyin,
      points: Math.round(100 / count * 10) / 10,
    })
  }
  return questions
}

// ─── Timer Component ────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ─── Exam Types ─────────────────────────────────────────────
type ExamType = 'listening' | 'reading' | 'full'
type ExamPhase = 'start' | 'exam' | 'results'

// ─── Main Component ─────────────────────────────────────────
export default function ExamSimulator() {
  const [examPhase, setExamPhase] = useState<ExamPhase>('start')
  const [examType, setExamType] = useState<ExamType>('full')
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false)

  const examConfig = useMemo(() => {
    switch (examType) {
      case 'listening': return { time: 1200, listening: 20, reading: 0, tf: 0, label: 'الاستماع (20 دقيقة)' }
      case 'reading': return { time: 1020, listening: 0, reading: 20, tf: 10, label: 'القراءة (17 دقيقة)' }
      case 'full': return { time: 2220, listening: 20, reading: 15, tf: 10, label: 'الامتحان الكامل (37 دقيقة)' }
    }
  }, [examType])

  // Timer effect (handles auto-finish when time runs out)
  useEffect(() => {
    if (examPhase !== 'exam') return
    if (timeLeft <= 0) {
      const t = setTimeout(() => {
        setExamPhase('results')
        setShowAnswerFeedback(false)
      }, 0)
      return () => clearTimeout(t)
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [examPhase, timeLeft])

  // Start exam
  const startExam = useCallback(() => {
    const listeningQs = generateListeningQuestions(examConfig.listening)
    const readingQs = generateReadingQuestions(examConfig.reading)
    const tfQs = generateTrueFalseQuestions(examConfig.tf)
    const allQs = [...listeningQs, ...readingQs, ...tfQs]
    setQuestions(allQs)
    setAnswers(new Array(allQs.length).fill(null))
    setCurrentQuestion(0)
    setTimeLeft(examConfig.time)
    setExamPhase('exam')
    setShowAnswerFeedback(false)
  }, [examConfig])

  // Answer question
  const answerQuestion = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)
    setShowAnswerFeedback(true)
  }

  // Next question
  const nextQuestion = () => {
    setShowAnswerFeedback(false)
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setExamPhase('results')
      setShowAnswerFeedback(false)
    }
  }

  // Previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      setShowAnswerFeedback(false)
    }
  }

  // Calculate scores
  const scores = useMemo(() => {
    if (examPhase !== 'results') return { listening: 0, reading: 0, total: 0, pass: false, weakAreas: [] as string[] }

    let listeningCorrect = 0
    let listeningTotal = 0
    let readingCorrect = 0
    let readingTotal = 0
    const wrongCategories: string[] = []

    questions.forEach((q, i) => {
      if (q.type === 'listening') {
        listeningTotal += q.points
        if (answers[i] === q.correctIndex) listeningCorrect += q.points
      } else {
        readingTotal += q.points
        if (answers[i] === q.correctIndex) readingCorrect += q.points
      }

      if (answers[i] !== q.correctIndex) {
        wrongCategories.push(q.audioText || q.question.substring(0, 20))
      }
    })

    const listeningScore = Math.round(listeningCorrect * 10) / 10
    const readingScore = Math.round(readingCorrect * 10) / 10
    const total = Math.round((listeningScore + readingScore) * 10) / 10

    return {
      listening: listeningScore,
      reading: readingScore,
      total,
      pass: total >= 120,
      weakAreas: wrongCategories.slice(0, 5),
    }
  }, [examPhase, questions, answers])

  const currentQ = questions[currentQuestion]

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-red-700 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" />
          محاكي امتحان HSK 1
        </h2>
        <p className="text-gray-600">تدرّب على امتحان HSK المستوى الأول</p>
      </div>

      {/* ─── Start Screen ──────────────────────────────────── */}
      {examPhase === 'start' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-xl">اختر نوع الامتحان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { type: 'listening' as ExamType, icon: Headphones, label: 'قسم الاستماع', time: '20 دقيقة', desc: '20 سؤال استماع', color: 'text-red-600' },
                { type: 'reading' as ExamType, icon: BookOpen, label: 'قسم القراءة', time: '17 دقيقة', desc: '20 سؤال قراءة', color: 'text-orange-600' },
                { type: 'full' as ExamType, icon: Trophy, label: 'الامتحان الكامل', time: '37 دقيقة', desc: '45 سؤال (استماع + قراءة)', color: 'text-red-700' },
              ]).map(opt => (
                <Card
                  key={opt.type}
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    examType === opt.type ? 'border-2 border-red-500 bg-red-50' : 'border hover:border-red-200'
                  }`}
                  onClick={() => setExamType(opt.type)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <opt.icon className={`w-8 h-8 ${opt.color} shrink-0`} />
                    <div className="flex-1">
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-sm text-gray-500">{opt.desc}</div>
                    </div>
                    <div className="text-sm text-gray-400">{opt.time}</div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">ملاحظات مهمة:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>درجة النجاح: 120 من 200 (60%)</li>
                      <li>الاستماع: 100 نقطة | القراءة: 100 نقطة</li>
                      <li>استخدم سماعات لقسم الاستماع</li>
                      <li>الوقت يبدأ عند الضغط على &quot;ابدأ&quot;</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={startExam}
                className="w-full bg-red-600 hover:bg-red-700 text-lg h-14"
              >
                <Play className="w-5 h-5 ml-2" />
                ابدأ الامتحان: {examConfig.label}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Exam Screen ───────────────────────────────────── */}
      {examPhase === 'exam' && currentQ && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Timer & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Card className={`${timeLeft <= 60 ? 'border-red-500 bg-red-50 animate-pulse' : ''}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <Clock className={`w-6 h-6 ${timeLeft <= 60 ? 'text-red-600' : 'text-gray-600'}`} />
                <div>
                  <div className="text-xs text-gray-500">الوقت المتبقي</div>
                  <div className={`text-xl font-bold font-mono ${timeLeft <= 60 ? 'text-red-600' : ''}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <Badge variant={currentQ.type === 'listening' ? 'default' : 'secondary'}>
                  {currentQ.type === 'listening' ? 'استماع' : 'قراءة'}
                </Badge>
                <div>
                  <div className="text-xs text-gray-500">السؤال</div>
                  <div className="text-xl font-bold">{currentQuestion + 1}/{questions.length}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">التقدم</div>
                <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Question Card */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Listening audio section */}
              {currentQ.type === 'listening' && currentQ.audioText && (
                <div className="flex flex-col items-center gap-4 bg-red-50 rounded-xl p-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full w-20 h-20"
                    onClick={() => speak(currentQ.audioText || '')}
                  >
                    <Volume2 className="w-8 h-8 text-red-600" />
                  </Button>
                  <p className="text-sm text-gray-500">اضغط للاستماع</p>
                  {currentQ.pinyin && (
                    <p className="text-xs text-gray-400 font-chinese-sans">({currentQ.pinyin})</p>
                  )}
                </div>
              )}

              {/* Question text */}
              <div className="text-center">
                <h3 className="text-lg font-medium">{currentQ.question}</h3>
                {currentQ.type === 'reading' && currentQ.pinyin && (
                  <p className="text-sm text-gray-400 font-chinese-sans mt-1">({currentQ.pinyin})</p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {currentQ.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion] === idx
                  const isCorrect = idx === currentQ.correctIndex
                  const showFeedback = showAnswerFeedback && answers[currentQuestion] !== null

                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={
                          showFeedback
                            ? isCorrect ? 'default' : isSelected ? 'destructive' : 'outline'
                            : isSelected ? 'default' : 'outline'
                        }
                        className={`w-full h-14 text-right justify-start text-base ${
                          showFeedback && isCorrect ? 'bg-green-600 hover:bg-green-600' : ''
                        }`}
                        onClick={() => answerQuestion(idx)}
                        disabled={answers[currentQuestion] !== null && showAnswerFeedback}
                      >
                        <span className="ml-3 inline-flex w-6 h-6 rounded-full items-center justify-center text-xs border shrink-0">
                          {String.fromCharCode(1571 + idx)}
                        </span>
                        {option}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>

              {/* Answer feedback */}
              <AnimatePresence>
                {showAnswerFeedback && answers[currentQuestion] !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-center p-3 rounded-lg flex items-center justify-center gap-2 ${
                      answers[currentQuestion] === currentQ.correctIndex
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {answers[currentQuestion] === currentQ.correctIndex ? (
                      <><CheckCircle className="w-5 h-5" /> إجابة صحيحة!</>
                    ) : (
                      <><XCircle className="w-5 h-5" /> إجابة خاطئة. الإجابة الصحيحة: {currentQ.options[currentQ.correctIndex]}</>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion <= 0}>
                  <ChevronRight className="w-4 h-4 ml-1" />
                  السابق
                </Button>

                <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentQuestion ? 'bg-red-600' :
                        answers[idx] !== null ? 'bg-gray-400' : 'bg-gray-200'
                      }`}
                      onClick={() => { setCurrentQuestion(idx); setShowAnswerFeedback(answers[idx] !== null) }}
                    />
                  ))}
                </div>

                <Button
                  onClick={nextQuestion}
                  disabled={answers[currentQuestion] === null}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {currentQuestion === questions.length - 1 ? 'إنهاء' : 'التالي'}
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Finish early button */}
          <div className="text-center mt-4">
            <Button variant="ghost" size="sm" onClick={() => { setExamPhase('results'); setShowAnswerFeedback(false) }}>
              إنهاء الامتحان مبكراً
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── Results Screen ────────────────────────────────── */}
      {examPhase === 'results' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Score Card */}
            <Card className={`border-2 ${scores.pass ? 'border-green-500' : 'border-red-500'}`}>
              <CardContent className="p-8 text-center space-y-6">
                <div className="text-6xl">{scores.pass ? '🎉' : '💪'}</div>
                <h3 className={`text-2xl font-bold ${scores.pass ? 'text-green-700' : 'text-red-700'}`}>
                  {scores.pass ? 'مبروك! نجحت في الامتحان!' : 'لم تنجح هذه المرة. واصل التعلم!'}
                </h3>

                {/* Total Score */}
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${
                  scores.pass ? 'border-green-500' : 'border-red-500'
                }`}>
                  <div>
                    <div className={`text-3xl font-bold ${scores.pass ? 'text-green-700' : 'text-red-700'}`}>
                      {scores.total}
                    </div>
                    <div className="text-sm text-gray-500">من 200</div>
                  </div>
                </div>

                {/* Section Scores */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <Card className={scores.listening >= 60 ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Headphones className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-500">الاستماع</span>
                      </div>
                      <div className="text-2xl font-bold">{scores.listening}</div>
                      <div className="text-xs text-gray-400">من 100</div>
                    </CardContent>
                  </Card>
                  <Card className={scores.reading >= 60 ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-500">القراءة</span>
                      </div>
                      <div className="text-2xl font-bold">{scores.reading}</div>
                      <div className="text-xs text-gray-400">من 100</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pass/Fail threshold */}
                <div className="text-sm text-gray-500">
                  درجة النجاح: 120/200 (60%)
                </div>
              </CardContent>
            </Card>

            {/* Weak Areas */}
            {scores.weakAreas.length > 0 && (
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    المجالات الضعيفة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scores.weakAreas.map((area, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    راجع هذه الكلمات والجمل في قسم المفردات وحاول مرة أخرى.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setExamPhase('start')} variant="outline">
                <RotateCcw className="w-4 h-4 ml-1" />
                امتحان جديد
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={startExam}>
                <Play className="w-4 h-4 ml-1" />
                أعد المحاولة
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
