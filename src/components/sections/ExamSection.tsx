'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  HSK1_EXAM_BANK,
  type TrueFalseQuestion,
  type MCQQuestion,
  type DialogueQuestion,
  type ReadingMatchQuestion,
  type ReadingTrueFalse,
  type FillBlankQuestion,
} from '@/data/examBank'
import { speak } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText, Clock, Volume2, Check, X, Trophy, ArrowLeft, ArrowRight, Play,
  RotateCcw, AlertCircle, ChevronDown, ChevronUp, Headphones,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════
// EXAM SECTIONS CONFIG
// ═══════════════════════════════════════════════════════════

interface ExamSection {
  key: string
  labelAr: string
  type: 'listening' | 'reading'
  questions: any[]
}

const EXAM_SECTIONS: ExamSection[] = [
  { key: 'listening_part1', labelAr: 'الاستماع - الجزء ١ (صح/خطأ)', type: 'listening', questions: HSK1_EXAM_BANK.listening_part1 },
  { key: 'listening_part2', labelAr: 'الاستماع - الجزء ٢ (اختيار متعدد)', type: 'listening', questions: HSK1_EXAM_BANK.listening_part2 },
  { key: 'listening_part3', labelAr: 'الاستماع - الجزء ٣ (حوارات)', type: 'listening', questions: HSK1_EXAM_BANK.listening_part3 },
  { key: 'reading_part1', labelAr: 'القراءة - الجزء ١ (تطابق)', type: 'reading', questions: HSK1_EXAM_BANK.reading_part1 },
  { key: 'reading_part2', labelAr: 'القراءة - الجزء ٢ (صح/خطأ)', type: 'reading', questions: HSK1_EXAM_BANK.reading_part2 },
  { key: 'reading_part3', labelAr: 'القراءة - الجزء ٣ (إكمال الفراغ)', type: 'reading', questions: HSK1_EXAM_BANK.reading_part3 },
]

const TOTAL_QUESTIONS = 40
const PASS_THRESHOLD = 24 // 60%

// ═══════════════════════════════════════════════════════════
// EXAM SECTION COMPONENT
// ═══════════════════════════════════════════════════════════

export function ExamSection() {
  // Exam state
  const [phase, setPhase] = useState<'start' | 'exam' | 'results'>('start')
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | boolean>>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [elapsedMinutes, setElapsedMinutes] = useState(40)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewSectionIdx, setReviewSectionIdx] = useState(0)

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return
    timerRef.current = setInterval(() => {
      setElapsedSeconds(s => {
        if (s === 0) {
          setElapsedMinutes(m => {
            if (m <= 0) {
              setPhase('results')
              return 0
            }
            return m - 1
          })
          return 59
        }
        return s - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  // Current question helpers
  const currentSection = EXAM_SECTIONS[currentSectionIdx]
  const currentQuestion = currentSection?.questions[currentQIdx]
  const globalQIdx = EXAM_SECTIONS.slice(0, currentSectionIdx).reduce((sum, s) => sum + s.questions.length, 0) + currentQIdx
  const questionId = currentQuestion?.id || ''

  const answerKey = questionId
  const currentAnswer = answers[answerKey]

  const setAnswer = useCallback((key: string, val: number | boolean) => {
    setAnswers(prev => ({ ...prev, [key]: val }))
    setShowAnswer(true)
  }, [])

  const isCorrect = useCallback(() => {
    if (!currentQuestion) return false
    const a = answers[questionId]
    if (a === undefined) return false

    switch (currentSection.key) {
      case 'listening_part1':
        return a === (currentQuestion as TrueFalseQuestion).correct
      case 'listening_part2':
        return a === (currentQuestion as MCQQuestion).options.findIndex(o => o.correct)
      case 'listening_part3':
        return a === (currentQuestion as DialogueQuestion).correct_index
      case 'reading_part1':
        return a === (currentQuestion as ReadingMatchQuestion).options.findIndex(o => o.correct)
      case 'reading_part2':
        return a === (currentQuestion as ReadingTrueFalse).correct
      case 'reading_part3':
        return a === (currentQuestion as FillBlankQuestion).correct_index
      default:
        return false
    }
  }, [currentQuestion, currentSection, answers, questionId])

  const calculateScore = useCallback(() => {
    let score = 0
    EXAM_SECTIONS.forEach(sec => {
      sec.questions.forEach(q => {
        const a = answers[q.id]
        if (a === undefined) return
        let correct = false
        switch (sec.key) {
          case 'listening_part1':
            correct = a === (q as TrueFalseQuestion).correct; break
          case 'listening_part2':
            correct = a === (q as MCQQuestion).options.findIndex(o => o.correct); break
          case 'listening_part3':
            correct = a === (q as DialogueQuestion).correct_index; break
          case 'reading_part1':
            correct = a === (q as ReadingMatchQuestion).options.findIndex(o => o.correct); break
          case 'reading_part2':
            correct = a === (q as ReadingTrueFalse).correct; break
          case 'reading_part3':
            correct = a === (q as FillBlankQuestion).correct_index; break
        }
        if (correct) score++
      })
    })
    return score
  }, [answers])

  const getWrongAnswers = useCallback(() => {
    const wrong: Array<{ section: ExamSection; question: any; userAnswer: any; explanation: string }> = []
    EXAM_SECTIONS.forEach(sec => {
      sec.questions.forEach(q => {
        const a = answers[q.id]
        if (a === undefined) return
        let correct = false
        let explanation = ''
        switch (sec.key) {
          case 'listening_part1': {
            correct = a === (q as TrueFalseQuestion).correct
            explanation = (q as TrueFalseQuestion).explanation_ar
            break
          }
          case 'listening_part2': {
            correct = a === (q as MCQQuestion).options.findIndex(o => o.correct)
            explanation = (q as MCQQuestion).explanation_ar
            break
          }
          case 'listening_part3': {
            correct = a === (q as DialogueQuestion).correct_index
            explanation = (q as DialogueQuestion).explanation_ar
            break
          }
          case 'reading_part1': {
            correct = a === (q as ReadingMatchQuestion).options.findIndex(o => o.correct)
            break
          }
          case 'reading_part2': {
            correct = a === (q as ReadingTrueFalse).correct
            explanation = (q as ReadingTrueFalse).explanation_ar
            break
          }
          case 'reading_part3': {
            correct = a === (q as FillBlankQuestion).correct_index
            explanation = 'الجملة الكاملة: ' + (q as FillBlankQuestion).full_sentence
            break
          }
        }
        if (!correct) {
          wrong.push({ section: sec, question: q, userAnswer: a, explanation })
        }
      })
    })
    return wrong
  }, [answers])

  // Navigation
  const goNext = () => {
    if (!showAnswer) return
    if (currentQIdx + 1 < currentSection.questions.length) {
      setCurrentQIdx(i => i + 1)
    } else if (currentSectionIdx + 1 < EXAM_SECTIONS.length) {
      setCurrentSectionIdx(i => i + 1)
      setCurrentQIdx(0)
    } else {
      setPhase('results')
      if (timerRef.current) clearInterval(timerRef.current)
    }
    setShowAnswer(false)
  }

  const goPrev = () => {
    if (!showAnswer && answers[questionId] !== undefined) return
    if (currentQIdx > 0) {
      setCurrentQIdx(i => i - 1)
    } else if (currentSectionIdx > 0) {
      const prevSecIdx = currentSectionIdx - 1
      setCurrentSectionIdx(prevSecIdx)
      setCurrentQIdx(EXAM_SECTIONS[prevSecIdx].questions.length - 1)
    }
    setShowAnswer(false)
  }

  const answeredCount = Object.keys(answers).length
  const timeExpired = elapsedMinutes === 0 && elapsedSeconds === 0

  const startExam = () => {
    setPhase('exam')
    setCurrentSectionIdx(0)
    setCurrentQIdx(0)
    setAnswers({})
    setShowAnswer(false)
    setElapsedMinutes(40)
    setElapsedSeconds(0)
    setReviewMode(false)
  }

  // ═══════════════════════════════════════════════════════════
  // START SCREEN
  // ═══════════════════════════════════════════════════════════
  if (phase === 'start') {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">محاكي اختبار HSK 1</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-1" />
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-gradient-to-l from-red-50 via-orange-50/50 to-amber-50">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">محاكي اختبار HSK 1</h3>
              <p className="text-gray-500 text-sm">اختبر مستواك في اللغة الصينية مع محاكي كامل لاختبار HSK المستوى الأول</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'عدد الأسئلة', value: '40 سؤال', icon: FileText, color: 'text-red-600' },
                { label: 'الدرجة الكلية', value: '40 نقطة', icon: Trophy, color: 'text-amber-600' },
                { label: 'مدة الاختبار', value: '40 دقيقة', icon: Clock, color: 'text-blue-600' },
                { label: 'درجة النجاح', value: '60% (24/40)', icon: Check, color: 'text-emerald-600' },
              ].map((info, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                  <info.icon className={"w-5 h-5 " + info.color} />
                  <div>
                    <div className="text-sm font-bold text-gray-900">{info.value}</div>
                    <div className="text-[10px] text-gray-500">{info.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-700">أقسام الاختبار:</h4>
              <div className="space-y-2">
                {EXAM_SECTIONS.map((sec, i) => (
                  <div key={sec.key} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-gray-100 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {sec.type === 'listening' ? '🎧' : '📖'} {sec.type === 'listening' ? 'استماع' : 'قراءة'}
                      </Badge>
                      <span className="text-gray-700">{sec.labelAr}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{sec.questions.length} سؤال</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={startExam} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-12 text-base font-bold gap-2">
              <Play className="w-5 h-5" />
              ابدأ الاختبار
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═══════════════════════════════════════════════════════════
  if (phase === 'results') {
    const score = calculateScore()
    const passed = score >= PASS_THRESHOLD
    const wrongAnswers = getWrongAnswers()
    const pct = Math.round((score / TOTAL_QUESTIONS) * 100)
    const timeUsed = 40 * 60 - (elapsedMinutes * 60 + elapsedSeconds)
    const usedMin = Math.floor(timeUsed / 60)
    const usedSec = timeUsed % 60

    // Save to exam_history
    if (typeof window !== 'undefined') {
      try {
        const history = JSON.parse(localStorage.getItem('exam_history') || '[]')
        if (!history.some((e: any) => e.id === 'hsk1_' + Date.now())) {
          history.push({ id: 'hsk1_' + Date.now(), passed, score, total: TOTAL_QUESTIONS, date: new Date().toISOString() })
          localStorage.setItem('exam_history', JSON.stringify(history))
        }
      } catch {}
    }

    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">نتائج الاختبار</h2>
        </div>

        <Card className={"border-0 shadow-sm " + (passed ? 'bg-gradient-to-l from-emerald-50 to-teal-50 ring-2 ring-emerald-200' : 'bg-gradient-to-l from-red-50 to-orange-50 ring-2 ring-red-200')}>
          <CardContent className="p-6 text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
              <Trophy className={"w-20 h-20 mx-auto " + (passed ? 'text-amber-500' : 'text-gray-400')} />
            </motion.div>
            <div>
              <h3 className={"text-2xl font-bold " + (passed ? 'text-emerald-700' : 'text-red-700')}>
                {passed ? '🎉 أحسنت! نجحت في الاختبار!' : '😔 لم تنجح هذه المرة'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {passed
                  ? 'أداء ممتاز! أنت مستعد للمستوى التالي'
                  : 'لا تقلق، راجع المفردات والقواعد وحاول مرة أخرى'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-white/80">
                <div className="text-3xl font-bold text-gray-900">{score}/{TOTAL_QUESTIONS}</div>
                <div className="text-xs text-gray-500">النتيجة</div>
              </div>
              <div className="p-3 rounded-xl bg-white/80">
                <div className="text-3xl font-bold text-gray-900">{pct}%</div>
                <div className="text-xs text-gray-500">النسبة</div>
              </div>
              <div className="p-3 rounded-xl bg-white/80">
                <div className="text-3xl font-bold text-gray-900">{usedMin}:{String(usedSec).padStart(2, '0')}</div>
                <div className="text-xs text-gray-500">الوقت المستخدم</div>
              </div>
            </div>

            <Progress value={pct} className="h-4" />
            <div className="flex items-center justify-center gap-2">
              <Badge className={passed ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}>
                {passed ? <Check className="w-3 h-3 ml-1" /> : <X className="w-3 h-3 ml-1" />}
                {passed ? 'ناجح' : 'راسب'}
              </Badge>
              <Badge variant="outline">الحد الأدنى: 60%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Section breakdown */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">تفاصيل الأقسام:</h4>
            <div className="space-y-2">
              {EXAM_SECTIONS.map(sec => {
                let secScore = 0
                sec.questions.forEach(q => {
                  const a = answers[q.id]
                  if (a === undefined) return
                  let correct = false
                  switch (sec.key) {
                    case 'listening_part1': correct = a === (q as TrueFalseQuestion).correct; break
                    case 'listening_part2': correct = a === (q as MCQQuestion).options.findIndex(o => o.correct); break
                    case 'listening_part3': correct = a === (q as DialogueQuestion).correct_index; break
                    case 'reading_part1': correct = a === (q as ReadingMatchQuestion).options.findIndex(o => o.correct); break
                    case 'reading_part2': correct = a === (q as ReadingTrueFalse).correct; break
                    case 'reading_part3': correct = a === (q as FillBlankQuestion).correct_index; break
                  }
                  if (correct) secScore++
                })
                const secPct = Math.round((secScore / sec.questions.length) * 100)
                return (
                  <div key={sec.key} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-700">{sec.labelAr}</div>
                      <Progress value={secPct} className="h-1.5 mt-1" />
                    </div>
                    <div className={"text-sm font-bold " + (secPct >= 60 ? 'text-emerald-600' : 'text-red-600')}>
                      {secScore}/{sec.questions.length}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Wrong answers review */}
        {wrongAnswers.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <button
                className="w-full flex items-center justify-between"
                onClick={() => setReviewMode(!reviewMode)}
              >
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  مراجعة الأخطاء ({wrongAnswers.length} سؤال)
                </h4>
                {reviewMode ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              <AnimatePresence>
                {reviewMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {wrongAnswers.map((w, i) => (
                        <div key={i} className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] text-red-600 border-red-200">
                              {w.section.labelAr}
                            </Badge>
                          </div>
                          <div className="text-gray-700">
                            {w.question.hanzi && (
                              <span className="font-chinese-serif text-base font-bold ml-2">{w.question.hanzi}</span>
                            )}
                            {w.question.audio_text && (
                              <span className="font-chinese-serif text-base font-bold ml-2">{w.question.audio_text}</span>
                            )}
                            {w.question.sentence && (
                              <span className="font-chinese-serif text-base font-bold ml-2">{w.question.sentence}</span>
                            )}
                            {w.question.dialogue && (
                              <span className="text-gray-500 text-xs mr-1">
                                {(w.question as DialogueQuestion).dialogue.map((d: any) => d.text).join(' → ')}
                              </span>
                            )}
                          </div>
                          {w.explanation && (
                            <div className="text-xs text-gray-500 bg-white rounded-lg p-2 mt-1">
                              💡 {w.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={startExam} className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white gap-2">
            <RotateCcw className="w-4 h-4" />
            إعادة الاختبار
          </Button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // EXAM QUESTION SCREEN
  // ═══════════════════════════════════════════════════════════

  // Get audio text for listening questions
  const getAudioText = (): string => {
    if (!currentQuestion) return ''
    switch (currentSection.key) {
      case 'listening_part1': return (currentQuestion as TrueFalseQuestion).audio_text
      case 'listening_part2': return (currentQuestion as MCQQuestion).audio_text
      case 'listening_part3': return (currentQuestion as DialogueQuestion).dialogue.map((d: any) => d.text).join('，')
      default: return ''
    }
  }

  const playAudio = () => {
    const text = getAudioText()
    if (text) speak(text)
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">محاكي اختبار HSK 1</h2>
            <div className="text-[10px] text-gray-500">{currentSection.labelAr}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={"text-xs gap-1 " + (elapsedMinutes <= 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700')}>
            <Clock className="w-3 h-3" />
            {String(elapsedMinutes).padStart(2, '0')}:{String(elapsedSeconds).padStart(2, '0')}
          </Badge>
          <Badge variant="secondary" className="text-xs">{answeredCount}/{TOTAL_QUESTIONS}</Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={(answeredCount / TOTAL_QUESTIONS) * 100} className="h-2" />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>السؤال {globalQIdx + 1} من {TOTAL_QUESTIONS}</span>
          <span>{currentSection.type === 'listening' ? '🎧 قسم الاستماع' : '📖 قسم القراءة'}</span>
        </div>
      </div>

      {/* Section navigator */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {EXAM_SECTIONS.map((sec, i) => {
          const isActive = i === currentSectionIdx
          const secAnswered = sec.questions.filter(q => answers[q.id] !== undefined).length
          const isDone = secAnswered === sec.questions.length
          return (
            <button
              key={sec.key}
              onClick={() => {
                if (i < currentSectionIdx || (i === currentSectionIdx)) {
                  // Can navigate back
                }
              }}
              className={"flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border " +
                (isActive ? 'bg-red-50 text-red-700 border-red-200' : isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200')}
            >
              {sec.labelAr.split(' - ')[1] || sec.labelAr} ({secAnswered}/{sec.questions.length})
            </button>
          )
        })}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-5">
              {/* Question header */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  سؤال {globalQIdx + 1}
                </Badge>
                {currentSection.type === 'listening' && (
                  <button
                    onClick={playAudio}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-xs font-medium">استمع</span>
                  </button>
                )}
              </div>

              {/* LISTENING PART 1 - True/False with image */}
              {currentSection.key === 'listening_part1' && currentQuestion && (() => {
                const q = currentQuestion as TrueFalseQuestion
                return (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-6xl mb-3">{q.image_emoji}</div>
                      <div className="text-sm text-gray-500">{q.image_label_ar}</div>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      هل النطق الذي تسمعه يطابق الصورة؟
                    </div>
                    {!showAnswer ? (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 gap-2"
                          onClick={() => setAnswer(questionId, true)}
                        >
                          <Check className="w-5 h-5" />
                          نعم - صحيح
                        </Button>
                        <Button
                          className="flex-1 h-12 bg-red-600 hover:bg-red-700 gap-2"
                          onClick={() => setAnswer(questionId, false)}
                        >
                          <X className="w-5 h-5" />
                          لا - خطأ
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={"p-3 rounded-xl text-center text-sm font-medium " + (isCorrect() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                          {isCorrect() ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                        </div>
                        {!isCorrect() && (
                          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-sm text-center">
                            💡 {q.explanation_ar}
                          </div>
                        )}
                        <div className="text-center">
                          <div className="font-chinese-serif text-xl font-bold text-gray-800 mt-2">{q.audio_text}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* LISTENING PART 2 - MCQ with emoji options */}
              {currentSection.key === 'listening_part2' && currentQuestion && (() => {
                const q = currentQuestion as MCQQuestion
                const selectedIdx = typeof currentAnswer === 'number' ? currentAnswer : -1
                const correctIdx = q.options.findIndex(o => o.correct)
                return (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-gray-600">
                      استمع واختر الإجابة الصحيحة
                    </div>
                    {!showAnswer ? (
                      <div className="grid grid-cols-2 gap-3">
                        {q.options.map((opt, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-1 hover:bg-gray-50"
                            onClick={() => setAnswer(questionId, i)}
                          >
                            <span className="text-3xl">{opt.emoji}</span>
                            <span className="text-xs">{opt.label}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={"p-3 rounded-xl text-center border-2 transition-all " +
                                (i === correctIdx ? 'border-emerald-500 bg-emerald-50' :
                                  i === selectedIdx ? 'border-red-500 bg-red-50' :
                                  'border-gray-200 opacity-50')}
                            >
                              <span className="text-3xl">{opt.emoji}</span>
                              <div className="text-xs mt-1">{opt.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className={"p-3 rounded-xl text-sm font-medium text-center " + (isCorrect() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                          {isCorrect() ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-sm text-center">
                          💡 {q.explanation_ar}
                        </div>
                        <div className="text-center">
                          <div className="font-chinese-serif text-xl font-bold text-gray-800">{q.audio_text}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* LISTENING PART 3 - Dialogue */}
              {currentSection.key === 'listening_part3' && currentQuestion && (() => {
                const q = currentQuestion as DialogueQuestion
                const selectedIdx = typeof currentAnswer === 'number' ? currentAnswer : -1
                return (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                      {q.dialogue.map((turn, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-bold text-blue-700">{turn.speaker}:</span>
                          <span className="font-chinese-serif text-lg text-gray-800 mr-2">{turn.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-bold text-gray-700 text-center">{q.question_ar}</div>
                    {!showAnswer ? (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            className="w-full h-auto py-3 text-sm justify-start"
                            onClick={() => setAnswer(questionId, i)}
                          >
                            <span className="font-bold text-gray-400 ml-2">{String.fromCharCode(1571 + i)}.</span>
                            {opt}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={"p-3 rounded-xl text-sm border-2 transition-all " +
                                (i === q.correct_index ? 'border-emerald-500 bg-emerald-50 text-emerald-800' :
                                  i === selectedIdx ? 'border-red-500 bg-red-50 text-red-800' :
                                  'border-gray-200 opacity-50 text-gray-600')}
                            >
                              <span className="font-bold ml-1">{String.fromCharCode(1571 + i)}.</span> {opt}
                            </div>
                          ))}
                        </div>
                        <div className={"p-3 rounded-xl text-sm font-medium text-center " + (isCorrect() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                          {isCorrect() ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-sm text-center">
                          💡 {q.explanation_ar}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* READING PART 1 - Match hanzi to emoji */}
              {currentSection.key === 'reading_part1' && currentQuestion && (() => {
                const q = currentQuestion as ReadingMatchQuestion
                const selectedIdx = typeof currentAnswer === 'number' ? currentAnswer : -1
                const correctIdx = q.options.findIndex(o => o.correct)
                return (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">ما معنى هذه الكلمة؟</div>
                      <div
                        className="font-chinese-serif text-5xl font-bold text-gray-900 cursor-pointer hover:text-red-600 transition-colors"
                        onClick={() => speak(q.hanzi)}
                      >
                        {q.hanzi}
                      </div>
                    </div>
                    <button onClick={() => speak(q.hanzi)} className="mx-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                      <Volume2 className="w-3 h-3" /> استمع للنطق
                    </button>
                    {!showAnswer ? (
                      <div className="grid grid-cols-2 gap-3">
                        {q.options.map((opt, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-1"
                            onClick={() => setAnswer(questionId, i)}
                          >
                            <span className="text-3xl">{opt.emoji}</span>
                            <span className="text-xs">{opt.label}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={"p-3 rounded-xl text-center border-2 transition-all " +
                                (i === correctIdx ? 'border-emerald-500 bg-emerald-50' :
                                  i === selectedIdx ? 'border-red-500 bg-red-50' :
                                  'border-gray-200 opacity-50')}
                            >
                              <span className="text-3xl">{opt.emoji}</span>
                              <div className="text-xs mt-1">{opt.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className={"p-3 rounded-xl text-sm font-medium text-center " + (isCorrect() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                          {isCorrect() ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* READING PART 2 - True/False reading */}
              {currentSection.key === 'reading_part2' && currentQuestion && (() => {
                const q = currentQuestion as ReadingTrueFalse
                return (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-6xl mb-3">{q.image_emoji}</div>
                      <div className="text-sm text-gray-500 mb-3">{q.image_label}</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gray-50">
                      <div className="font-chinese-serif text-2xl font-bold text-gray-900">{q.hanzi}</div>
                      <button
                        onClick={() => speak(q.hanzi)}
                        className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
                      >
                        <Volume2 className="w-3 h-3" /> استمع
                      </button>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      هل الجملة الصينية تطابق الصورة؟
                    </div>
                    {!showAnswer ? (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 gap-2"
                          onClick={() => setAnswer(questionId, true)}
                        >
                          <Check className="w-5 h-5" />
                          نعم - صحيح
                        </Button>
                        <Button
                          className="flex-1 h-12 bg-red-600 hover:bg-red-700 gap-2"
                          onClick={() => setAnswer(questionId, false)}
                        >
                          <X className="w-5 h-5" />
                          لا - خطأ
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={"p-3 rounded-xl text-sm font-medium text-center " + (isCorrect() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                          {isCorrect() ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                        </div>
                        {!isCorrect() && (
                          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-sm text-center">
                            💡 {q.explanation_ar}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* READING PART 3 - Fill in the blank */}
              {currentSection.key === 'reading_part3' && currentQuestion && (() => {
                const q = currentQuestion as FillBlankQuestion
                const selectedIdx = typeof currentAnswer === 'number' ? currentAnswer : -1
                return (
                  <div className="space-y-4">
                    <div className="text-center p-4 rounded-xl bg-gray-50">
                      <div className="font-chinese-serif text-2xl font-bold text-gray-900">
                        {q.sentence.replace('___', '______')}
                      </div>
                      <button
                        onClick={() => speak(q.full_sentence)}
                        className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
                      >
                        <Volume2 className="w-3 h-3" /> استمع
                      </button>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      اختر الكلمة المناسبة لإكمال الجملة
                    </div>
                    {!showAnswer ? (
                      <div className="grid grid-cols-2 gap-3">
                        {q.word_choices.map((word, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            className="h-auto py-4 font-chinese-serif text-lg"
                            onClick={() => setAnswer(questionId, i)}
                          >
                            {word}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {q.word_choices.map((word, i) => (
                            <div
                              key={i}
                              className={"p-3 rounded-xl text-center border-2 transition-all font-chinese-serif text-lg " +
                                (i === q.correct_index ? 'border-emerald-500 bg-emerald-50' :
                                  i === selectedIdx ? 'border-red-500 bg-red-50' :
                                  'border-gray-200 opacity-50')}
                            >
                              {word}
                            </div>
                          ))}
                        </div>
                        <div className={"p-3 rounded-xl text-sm font-medium text-center " + (isCorrect() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                          {isCorrect() ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                        </div>
                        {!isCorrect() && (
                          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-sm text-center">
                            💡 الجملة الكاملة: <span className="font-chinese-serif font-bold">{q.full_sentence}</span>
                            <br />
                            <span className="text-gray-600">{q.translation_ar}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={currentSectionIdx === 0 && currentQIdx === 0}
          className="gap-1"
        >
          <ArrowRight className="w-4 h-4" />
          السابق
        </Button>

        <div className="text-xs text-gray-400">
          {globalQIdx + 1} / {TOTAL_QUESTIONS}
        </div>

        <Button
          size="sm"
          onClick={goNext}
          disabled={!showAnswer}
          className="gap-1 bg-red-600 hover:bg-red-700"
        >
          {currentSectionIdx === EXAM_SECTIONS.length - 1 && currentQIdx === currentSection.questions.length - 1
            ? 'إنهاء الاختبار'
            : 'التالي'}
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
