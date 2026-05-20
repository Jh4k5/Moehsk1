'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { tonePairs } from '@/data/content'
import { useLearningStore } from '@/lib/store'
import { speak } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Gamepad2, Volume2, RotateCcw, Trophy, Zap, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const memoryLevelOptions = [
  { level: 1, pairs: 6, label: 'المستوى 1 (6 أزواج)' },
  { level: 2, pairs: 8, label: 'المستوى 2 (8 أزواج)' },
  { level: 3, pairs: 12, label: 'المستوى 3 (12 أزواج)' },
]

export function GamesSection({ memoryFlipped, handleMemoryClick, startMemoryGame, toneAnswer, setToneAnswer, toneScore, setToneScore, toneRound, setToneRound }: {
  memoryFlipped: number[]
  handleMemoryClick: (id: number) => void
  startMemoryGame: (level?: number) => void
  toneAnswer: number | null
  setToneAnswer: (a: number | null) => void
  toneScore: number
  setToneScore: React.Dispatch<React.SetStateAction<number>>
  toneRound: number
  setToneRound: React.Dispatch<React.SetStateAction<number>>
}) {
  const store = useLearningStore()
  const { memoryCards, memoryMoves, memoryPairs, incrementStreak } = store
  const [selectedMemoryLevel, setSelectedMemoryLevel] = useState(1)
  const [memoryTime, setMemoryTime] = useState(0)
  const [memoryTimerActive, setMemoryTimerActive] = useState(false)
  // Speed round state
  const [speedGameActive, setSpeedGameActive] = useState(false)
  const [speedScore, setSpeedScore] = useState(0)
  const [speedTotal, setSpeedTotal] = useState(0)
  const [speedTimeLeft, setSpeedTimeLeft] = useState(10)
  const [speedWordIndex, setSpeedWordIndex] = useState(0)
  const [speedAnswered, setSpeedAnswered] = useState<number | null>(null)
  const [speedGameOver, setSpeedGameOver] = useState(false)
  const [speedWords, setSpeedWords] = useState<VocabWord[]>([])
  const currentPairCount = memoryLevelOptions.find(l => l.level === selectedMemoryLevel)?.pairs || 6
  const startToneGame = () => {
    setToneRound(0)
    setToneScore(0)
    setToneAnswer(null)
  }
  const currentToneSet = tonePairs[toneRound % tonePairs.length]
  // Speed round logic
  const startSpeedGame = useCallback(() => {
    // Smart word selection: prioritize weak/new words
    const weakIds = store.getWeakWordIds(10)
    const weakWords = weakIds.map(id => vocabulary.find(w => w.id === id)).filter((w): w is VocabWord => !!w)
    const newWords = vocabulary.filter(w => !store.learnedWords.includes(w.id) && !weakIds.includes(w.id)).sort(() => Math.random() - 0.5).slice(0, 10)
    const remaining = vocabulary.filter(w => !weakWords.some(ww => ww.id === w.id) && !newWords.some(ww => ww.id === w.id)).sort(() => Math.random() - 0.5).slice(0, 15 - weakWords.length - newWords.length)
    const words = [...weakWords, ...newWords, ...remaining].slice(0, 15)
    setSpeedWords(words)
    setSpeedGameActive(true)
    setSpeedScore(0)
    setSpeedTotal(15)
    setSpeedTimeLeft(10)
    setSpeedWordIndex(0)
    setSpeedAnswered(null)
    setSpeedGameOver(false)
  }, [])
  // Speed round timer
  useEffect(() => {
    if (!speedGameActive || speedGameOver) return
    if (speedTimeLeft <= 0) {
      setSpeedGameOver(true)
      return
    }
    const t = setTimeout(() => setSpeedTimeLeft(h => h - 1), 1000)
    return () => clearTimeout(t)
  }, [speedGameActive, speedTimeLeft, speedGameOver])
  const currentSpeedWord = useMemo(() => {
    const w = speedWords[speedWordIndex]
    if (!speedGameActive || !w) return null
    const wrong = vocabulary.filter(v => v.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.meaning)
    const all = [...wrong, w.meaning].sort(() => Math.random() - 0.5)
    return { ...w, correctIndex: all.indexOf(w.meaning), options: all }
  }, [speedGameActive, speedWordIndex, speedWords])
  const speedOptions = currentSpeedWord?.options || []
  const answerSpeedRound = useCallback((idx: number) => {
    if (speedAnswered !== null) return
    setSpeedAnswered(idx)
    const isCorrect = idx === currentSpeedWord?.correctIndex
    if (isCorrect) setSpeedScore(s => s + 1)
    // SRS integration
    if (currentSpeedWord) {
      const quality = isCorrect ? 4 : 1
      store.rateWord(currentSpeedWord.id, quality)
    }
    setTimeout(() => {
      if (speedWordIndex < 14) {
        setSpeedWordIndex(i => i + 1)
        setSpeedAnswered(null)
        setSpeedTimeLeft(10)
      } else {
        setSpeedGameOver(true)
      }
    }, 800)
  }, [speedAnswered, speedWordIndex, currentSpeedWord])
  // Memory game timer
  useEffect(() => {
    if (!memoryTimerActive || memoryPairs === currentPairCount) {
      if (memoryPairs === currentPairCount) setMemoryTimerActive(false)
      return
    }
    const t = setInterval(() => setMemoryTime(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [memoryTimerActive, memoryPairs, currentPairCount])
  // Start memory timer when game begins
  useEffect(() => {
    if (memoryCards.length > 0 && memoryPairs === 0) {
      setMemoryTime(0)
      setMemoryTimerActive(true)
    }
  }, [memoryCards.length])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-red-600" />
            الألعاب التعليمية
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
      </div>
      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memory">لعبة الذاكرة</TabsTrigger>
          <TabsTrigger value="tone">تمييز النبرات</TabsTrigger>
          <TabsTrigger value="speed">تحدي السرعة</TabsTrigger>
        </TabsList>
        {/* Memory Game (Fixed) */}
        <TabsContent value="memory" className="space-y-4">
          {!memoryCards.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🧠</div>
                <h3 className="text-lg font-bold text-gray-700">لعبة الذاكرة</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  طابق الكلمة الصينية (الحرف) مع معناها! اختر المستوى وابدأ.
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {memoryLevelOptions.map(l => (
                    <Button
                      key={l.level}
                      variant={selectedMemoryLevel === l.level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMemoryLevel(l.level)}
                      className={selectedMemoryLevel === l.level ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      {l.label}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => { startMemoryGame(selectedMemoryLevel); incrementStreak() }} className="bg-red-600 hover:bg-red-700">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>المحاولات: {memoryMoves}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{memoryTime}s</span>
                <span>الأزواج: {memoryPairs}/{currentPairCount}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {memoryCards.map(card => {
                  const isFlipped = memoryFlipped.includes(card.id) || card.matched
                  const isHanzi = card.type === 'hanzi'
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleMemoryClick(card.id)}
                      className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 ${
                        isFlipped
                          ? card.matched
                            ? 'border-emerald-300 bg-emerald-50 scale-[1.03]'
                            : 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      {isFlipped ? (
                        isHanzi ? (
                          <div className="font-chinese-serif text-2xl text-gray-900">{card.zh}</div>
                        ) : (
                          <div className="p-1">
                            <div className="font-chinese-sans text-[10px] text-gray-500">{card.pinyin}</div>
                            <div className="text-xs text-gray-800 font-bold leading-tight">{card.ar}</div>
                          </div>
                        )
                      ) : (
                        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg w-10 h-10 flex items-center justify-center">
                          <div className="text-lg font-bold text-red-400">?</div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {memoryPairs === currentPairCount && (
                <div className="text-center space-y-3 p-6 bg-emerald-50 rounded-xl">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
                  <div className="text-xl font-bold text-emerald-800">فزت! 🎉</div>
                  <div className="text-sm text-emerald-700">أكملت اللعبة في {memoryMoves} محاولة • {memoryTime} ثانية</div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => startMemoryGame(selectedMemoryLevel)} variant="outline">العب مرة أخرى</Button>
                    <Button onClick={() => { store.resetMemoryGame() }} variant="outline">تغيير المستوى</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        {/* Tone Game (Enhanced) */}
        <TabsContent value="tone" className="space-y-4">
          {toneRound >= tonePairs.length && toneAnswer !== null ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <Trophy className={`w-16 h-16 ${toneScore >= Math.floor(tonePairs.length * 0.8) ? 'text-yellow-500' : 'text-gray-400'}`} />
                <h3 className="text-xl font-bold text-gray-900">انتهت اللعبة!</h3>
                <div className="text-3xl font-bold text-red-600">{toneScore}/{tonePairs.length}</div>
                <Button onClick={startToneGame} className="bg-red-600 hover:bg-red-700">
                  <RotateCcw className="w-4 h-4 ml-2" /> العب مرة أخرى
                </Button>
              </CardContent>
            </Card>
          ) : toneRound < tonePairs.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>الجولة {toneRound + 1}/{tonePairs.length}</span>
                  <span>النتيجة: {toneScore}</span>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm text-gray-500">اختر النبرة الصحيحة للكلمة:</div>
                  <div className="font-chinese-sans text-lg text-red-600">[{currentToneSet.syllable}]</div>
                  <Button variant="ghost" size="sm" onClick={() => speak(currentToneSet.tones[0].char)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع للنبرة الأولى
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentToneSet.tones.map((t, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className={`h-auto py-4 flex flex-col items-center gap-1 transition-all ${
                        toneAnswer === i
                          ? i === 0 ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (toneAnswer !== null) return
                        setToneAnswer(i)
                        if (i === 0) {
                          setToneScore(s => s + 1)
                        }
                        setTimeout(() => {
                          setToneRound(r => r + 1)
                          setToneAnswer(null)
                        }, 1500)
                      }}
                    >
                      <span className="font-chinese-serif text-3xl">{t.char}</span>
                      <span className="text-xs text-gray-600">{t.pinyin} — النبرة {t.tone}</span>
                      <span className="text-xs text-gray-400">{t.meaning}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🎵</div>
                <h3 className="text-lg font-bold text-gray-700">لعبة تمييز النبرات</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  اختبر قدرتك على تمييز النبرات في اللغة الصينية. {tonePairs.length} مجموعات نبرية للتدرب!
                </p>
                <Button onClick={() => { startToneGame(); incrementStreak() }} className="bg-red-600 hover:bg-red-700">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Speed Round Game */}
        <TabsContent value="speed">
          {!speedGameActive ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg animate-float">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">تحدي السرعة</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                شاهد الكلمة الصينية واختر الترجمة الصحيحة بأسرع وقت ممكن!
                <br />15 كلمة • 10 ثوانٍ لكل كلمة
              </p>
              {/* Difficulty selector */}
              <div className="flex gap-2 justify-center mb-4">
                {[
                  { value: 'easy', label: 'سهل', desc: 'عربي → صيني' },
                  { value: 'medium', label: 'متوسط', desc: 'صيني → عربي' },
                  { value: 'hard', label: 'صعب', desc: 'في جملة' },
                ].map(d => (
                  <button
                    key={d.value}
                    onClick={() => store.setGameDifficulty(d.value as 'easy' | 'medium' | 'hard')}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      store.gameDifficulty === d.value
                        ? 'bg-red-600 text-white border-red-600 shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-300'
                    }`}
                  >
                    <div className="font-bold">{d.label}</div>
                    <div className="text-[10px] opacity-70">{d.desc}</div>
                  </button>
                ))}
              </div>
              <Button onClick={startSpeedGame} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg">
                <Zap className="w-4 h-4" />
                ابدأ التحدي
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timer Bar */}
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 right-0 bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(speedTimeLeft / 10) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {/* Score */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-gray-700">{speedScore}/{speedTotal}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold font-mono text-lg">{speedTimeLeft}s</span>
                </div>
              </div>
              {/* Word Card */}
              <Card className="j-card border-0 shadow-lg overflow-hidden">
                <CardContent className="p-8 text-center bg-gradient-to-br from-white to-amber-50">
                  {speedGameOver ? (
                    <div>
                      <div className="text-4xl mb-4">⏰</div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">انتهى الوقت!</h3>
                      <p className="text-gray-500 mb-4">نتيجتك: {speedScore} من {speedTotal}</p>
                      <div className="text-3xl mb-2 font-chinese-serif">{currentSpeedWord?.zh}</div>
                      <div className="text-sm text-gray-500 mb-4">{currentSpeedWord?.meaning}</div>
                      <Button onClick={startSpeedGame} className="gap-2">حاول مرة أخرى</Button>
                    </div>
                  ) : (
                    <div>
                      <div className="font-chinese-serif text-5xl font-bold text-gray-900 mb-3">{currentSpeedWord?.zh}</div>
                      <button onClick={() => speak(currentSpeedWord?.zh || '')} className="inline-block">
                        <Volume2 className="w-6 h-6 text-red-500 mx-auto" />
                      </button>
                    </div>
                  )}
                  {/* Options */}
                  <div className="mt-4 space-y-2">
                    {speedOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => answerSpeedRound(i)}
                        disabled={speedAnswered !== null}
                        className={`w-full text-right px-4 py-3 rounded-xl text-sm transition-all ${
                          speedAnswered === null
                            ? 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-300'
                            : i === currentSpeedWord?.correctIndex
                              ? 'bg-emerald-100 border border-emerald-400 animate-pulse-correct'
                              : speedAnswered === i && i !== currentSpeedWord?.correctIndex
                                ? 'bg-red-100 border border-red-400 animate-pulse-wrong'
                                : i === currentSpeedWord?.correctIndex
                                  ? 'bg-emerald-100 border border-emerald-400'
                                  : 'border border-gray-200 opacity-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
