'use client'
// ─── Exercises — multiple choice, fill the blank, match, true/false ─────────
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeftRight, Brain, Check, Clock, Languages, RotateCcw, Target, Trophy,
  Volume2, X,
} from 'lucide-react'
import { speak } from '@/lib/tts'
import { useActiveLevel } from '@/lib/levels'
import { ts } from '@/lib/i18n'
import { useLearningStore } from '@/lib/store'
import { type VocabWord } from '@/data/vocabulary'

export default function PracticeSection() {
  const store = useLearningStore()
  const { vocabulary, grammarRules } = useActiveLevel()
  const { quizQuestions, quizScore, quizTotal, currentQuizQuestion, answerQuiz, nextQuizQuestion, resetQuiz, incrementStreak } = store

  // Quiz state and the hard-mode countdown used to live in the page shell and
  // arrive as nine props. Both belong to this route.
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizFinished, setQuizFinished] = useState(false)
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [hardTimer, setHardTimer] = useState(15)

  const generateQuiz = useCallback(() => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 30)
    const questions = shuffled.map((word) => {
      const wrongOptions = vocabulary
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.meaning)
      const options = [...wrongOptions, word.meaning].sort(() => Math.random() - 0.5)
      return {
        wordId: word.id,
        question: word.zh,
        questionPinyin: word.pinyin,
        options,
        correctIndex: options.indexOf(word.meaning),
      }
    })
    store.startQuiz(questions)
    setQuizAnswer(null)
    setQuizFinished(false)
    setHardTimer(15)
  }, [vocabulary, store])

  // Hard mode: one second per tick, then auto-advance.
  useEffect(() => {
    if (quizDifficulty !== 'hard' || quizAnswer !== null || quizFinished || !quizQuestions.length) return
    if (hardTimer <= 0) {
      const t = setTimeout(() => {
        setQuizAnswer(-1)
        setTimeout(() => {
          if (currentQuizQuestion < quizTotal - 1) {
            nextQuizQuestion()
            setQuizAnswer(null)
            setHardTimer(15)
          } else {
            setQuizFinished(true)
          }
        }, 1000)
      }, 0)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setHardTimer((h) => h - 1), 1000)
    return () => clearTimeout(t)
  }, [hardTimer, quizDifficulty, quizAnswer, quizFinished, quizQuestions.length, currentQuizQuestion, quizTotal, nextQuizQuestion])
  const [fillBlankWord, setFillBlankWord] = useState<VocabWord | null>(null)
  const [fillAnswer, setFillAnswer] = useState('')
  const [fillResult, setFillResult] = useState<'correct' | 'wrong' | null>(null)
  const [matchPairs, setMatchPairs] = useState<{ zh: string; ar: string }[]>([])
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set())
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)

  // True/False game state
  const [tfQuestion, setTfQuestion] = useState<{ zh: string; ar: string; isCorrect: boolean } | null>(null)
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null)
  const [tfScore, setTfScore] = useState(0)
  const [tfTotal, setTfTotal] = useState(0)

  const startTFQuestion = () => {
    const w = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    const isCorrect = Math.random() > 0.5
    setTfQuestion({
      zh: w.zh + ' — ' + w.pinyin,
      ar: isCorrect ? w.meaning : vocabulary.find(v => v.id !== w.id)?.meaning || 'كلمة أخرى',
      isCorrect,
    })
    setTfAnswer(null)
  }

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
    // The one streak call left outside the mandatory path: answering a
    // question CORRECTLY is study, unlike the seven "start game" clicks that
    // used to feed it. `incrementStreak` is idempotent within a day, so this
    // marks the day studied and nothing more.
    if (correct) incrementStreak()
  }

  const startMatchGame = () => {
    const selected = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 6)
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
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          {ts('التمارين','Exercises')}
        </h2>
      </div>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quiz">{ts('اختيار من متعدد','Multiple choice')}</TabsTrigger>
          <TabsTrigger value="fill">{ts('اكمل الفراغ','Fill the blank')}</TabsTrigger>
          <TabsTrigger value="match">{ts('طابق الأزواج','Match pairs')}</TabsTrigger>
        </TabsList>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4">
          {!quizQuestions.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Brain className="w-16 h-16 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">{ts('اختبار المفردات','Vocabulary Quiz')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  30 سؤال عشوائي لاختبار معرفتك بالمفردات الصينية. اختر مستوى الصعوبة.
                </p>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <Button
                      key={d}
                      variant={quizDifficulty === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuizDifficulty(d)}
                      className={quizDifficulty === d ? 'bg-primary hover:brightness-110' : ''}
                    >
                      {d === 'easy' ? 'سهل (تلميح)' : d === 'medium' ? 'متوسط' : 'صعب (مؤقت)'}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => generateQuiz()} className="bg-primary hover:brightness-110">
                  ابدأ الاختبار
                </Button>
              </CardContent>
            </Card>
          ) : !quizFinished ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
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
                <Progress value={(currentQuizQuestion / quizTotal) * 100} className="h-1.5" />

                <div className="text-center space-y-4">
                  <div
                    className="font-chinese-serif text-6xl text-[var(--text-primary)] cursor-pointer hover:text-primary transition-colors"
                    onClick={() => speak(currentQuestion.question)}
                  >
                    {currentQuestion.question}
                  </div>
                  {/* Show pinyin hint in easy mode */}
                  {quizDifficulty === 'easy' && currentQuestion.questionPinyin && (
                    <div className="text-sm text-[var(--text-muted)] font-chinese-sans">{currentQuestion.questionPinyin}</div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => speak(currentQuestion.question)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt, i) => {
                    let btnClass = 'border-[var(--line-default)] hover:bg-[var(--surface-card-h)] text-[var(--text-primary)]'
                    if (quizAnswer !== null) {
                      if (i === currentQuestion.correctIndex) btnClass = 'border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)]'
                      else if (i === quizAnswer) btnClass = 'border-[var(--clr-danger)] bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]'
                    }
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={"h-auto py-3 text-sm " + btnClass + " transition-all"}
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
                <Trophy className={quizScore >= quizTotal * 0.8 ? "w-20 h-20 text-[var(--clr-warning)]" : "w-20 h-20 text-[var(--text-muted)]"} />
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  {getScoreMessage(quizScore, quizTotal)}
                </h3>
                <div className="text-4xl font-bold text-primary">{quizScore} / {quizTotal}</div>
                <Progress value={(quizScore / quizTotal) * 100} className="w-64 h-3" />
                <Button onClick={() => { resetQuiz(); setQuizFinished(false); generateQuiz() }} className="bg-primary hover:brightness-110">
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
                <Languages className="w-16 h-16 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">{ts('اكتب الكلمة الصينية','Type the Chinese word')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  سيظهر لك المعنى بالعربية والجملة المثال. {ts('اكتب الكلمة الصينية','Type the Chinese word')} أو البينيين.
                </p>
                <Button onClick={() => startFillBlank()} className="bg-primary hover:brightness-110">
                  ابدأ التمرين
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-xl font-bold text-[var(--text-primary)]">{fillBlankWord.meaning}</div>
                  <div className="text-sm text-[var(--text-muted)] font-chinese-sans">{fillBlankWord.pinyin}</div>
                  <div className="bg-[var(--surface-card-h)] rounded-lg p-3 mt-3">
                    <div className="font-chinese-serif text-[var(--text-primary)]">{fillBlankWord.exZh}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{fillBlankWord.exPinyin}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={ts('اكتب الكلمة الصينية أو البينيين...','Type the Chinese word or pinyin...')}
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkFillAnswer()}
                    className="text-lg font-chinese-serif"
                  />
                  <Button onClick={checkFillAnswer} className="bg-primary hover:brightness-110">{ts('تحقق','Check')}</Button>
                </div>
                {fillResult && (
                  <div className={fillResult === 'correct' ? "p-3 rounded-lg text-center font-medium bg-[var(--clr-success-bg)] text-[var(--clr-success)]" : "p-3 rounded-lg text-center font-medium bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]"}>
                    {fillResult === 'correct' ? '✓ إجابة صحيحة!' : '✗ الإجابة الصحيحة: ' + fillBlankWord.zh}
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
                <ArrowLeftRight className="w-16 h-16 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">{ts('طابق الأزواج','Match pairs')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  اختر الكلمة الصينية ثم اختر ترجمتها العربية لإنشاء الأزواج المتطابقة.
                </p>
                <Button onClick={() => startMatchGame()} className="bg-primary hover:brightness-110">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matchedItems.size < matchPairs.length * 2 && (
                <div className="text-sm text-[var(--text-muted)] text-center">
                  الأزواج المتطابقة: {matchedItems.size / 2} / {matchPairs.length}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {matchPairs.map(p => (
                    <Button
                      key={p.zh}
                      variant={matchedItems.has(p.zh) ? 'secondary' : selectedMatch === p.zh ? 'default' : 'outline'}
                      className={matchedItems.has(p.zh) ? "w-full justify-center font-chinese-serif text-lg h-12 opacity-50" : "w-full justify-center font-chinese-serif text-lg h-12"}
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
                      className={matchedItems.has(p.ar) ? "w-full justify-center text-sm h-12 opacity-50" : "w-full justify-center text-sm h-12"}
                      onClick={() => handleMatchClick(p.ar, 'ar')}
                      disabled={matchedItems.has(p.ar)}
                    >
                      {p.ar}
                    </Button>
                  ))}
                </div>
              </div>
              {matchedItems.size === matchPairs.length * 2 && (
                <div className="text-center space-y-3 p-6 bg-[var(--clr-success-bg)] rounded-xl">
                  <Trophy className="w-12 h-12 text-[var(--clr-warning)] mx-auto" />
                  <div className="text-xl font-bold text-[var(--clr-success)]">{ts('أحسنت! طابقت جميع الأزواج! 🎉','Great! You matched all pairs! 🎉')}</div>
                  <Button onClick={startMatchGame} variant="outline">{ts('العب مرة أخرى','Play again')}</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      <TabsContent value="tf" className="space-y-4">
          <Card className="j-card border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[var(--clr-success)]" />
                <X className="w-5 h-5 text-[var(--clr-danger)]" />
                <span className="font-bold text-[var(--text-secondary)]">{ts('صواب أم خطأ؟','True or False?')}</span>
              </div>
              {tfQuestion ? (
                <div className="w-full max-w-md space-y-4 text-center">
                  <p className="font-chinese-serif text-2xl font-bold text-[var(--text-primary)]">{tfQuestion.zh.split(' — ')[0]}</p>
                  <p className="text-sm text-[var(--text-muted)] font-chinese-sans">{tfQuestion.zh.split(' — ')[1] || ''}</p>
                  <div className="h-px bg-[var(--surface-card)] my-2" />
                  <p className="text-lg font-bold text-primary">{tfQuestion.ar}</p>
                  <p className="text-xs text-[var(--text-muted)]">{ts('هل هذه الترجمة صحيحة؟','Is this translation correct?')}</p>
                  {tfAnswer === null ? (
                    <div className="flex gap-4 justify-center mt-4">
                      <Button className="gap-2 bg-[var(--clr-success)] hover:bg-[var(--clr-success-h)] text-white border-0" onClick={() => { setTfAnswer(true); setTfTotal(t => t + 1); if (tfQuestion.isCorrect) setTfScore(s => s + 1) }}>
                        <Check className="w-4 h-4" /> صحيح
                      </Button>
                      <Button className="gap-2 bg-[var(--clr-danger)] hover:brightness-110 text-white border-0" onClick={() => { setTfAnswer(false); setTfTotal(t => t + 1); if (!tfQuestion.isCorrect) setTfScore(s => s + 1) }}>
                        <X className="w-4 h-4" /> خطأ
                      </Button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="text-lg font-bold" style={{ color: tfAnswer === tfQuestion.isCorrect ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
                        {tfAnswer === tfQuestion.isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                      </div>
                      <div className="flex items-center justify-between gap-3 px-4">
                        <span className="text-sm text-[var(--text-muted)]">النتيجة: {tfScore}/{tfTotal}</span>
                        <Button size="sm" onClick={startTFQuestion}>{ts('السؤال التالي','Next question')}</Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-muted)] max-w-sm text-center">{ts('سيظهر لك كلمة صينية مع ترجمتها. حدد هل الترجمة صحيحة أم لا.','A Chinese word with its translation will appear. Decide if it is correct.')}</p>
                  <Button onClick={startTFQuestion} className="gap-2 bg-primary border-0">
                    ابدأ اللعب
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
</Tabs>
    </div>
  )
}
