'use client'
// ─── Games — the break between every sixth activity ─────────────────────────
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Gamepad2, RotateCcw, Trophy, Volume2 } from 'lucide-react'
import { speak } from '@/lib/tts'
import { useActiveLevel } from '@/lib/levels'
import { ts } from '@/lib/i18n'
import { useLearningStore } from '@/lib/store'

const memoryLevelOptions = [
  { level: 1, pairs: 6, label: 'المستوى 1 (6 أزواج)' },
  { level: 2, pairs: 8, label: 'المستوى 2 (8 أزواج)' },
  { level: 3, pairs: 12, label: 'المستوى 3 (12 أزواج)' },
]

export default function GamesSection() {
  const store = useLearningStore()
  const { vocabulary, tonePairs } = useActiveLevel()
  const { memoryCards, memoryMoves, memoryPairs, incrementStreak } = store

  // Memory and tone state used to be lifted into the page shell; both belong
  // to this route.
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([])
  const [toneAnswer, setToneAnswer] = useState<number | null>(null)
  const [toneScore, setToneScore] = useState(0)
  const [toneRound, setToneRound] = useState(0)

  const startMemoryGame = useCallback((level?: number) => {
    const lvl = level || store.memoryLevel
    const pairCount = memoryLevelOptions.find((l) => l.level === lvl)?.pairs || 8
    const selected = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, pairCount)
    const cards = selected
      .flatMap((w) => [
        { id: w.id * 2, zh: w.zh, ar: w.meaning, pinyin: w.pinyin, matched: false, type: 'hanzi' as const },
        { id: w.id * 2 + 1, zh: w.zh, ar: w.meaning, pinyin: w.pinyin, matched: false, type: 'meaning' as const },
      ])
      .sort(() => Math.random() - 0.5)
    store.startMemoryGame(cards)
    setMemoryFlipped([])
  }, [store, vocabulary])

  const handleMemoryClick = (id: number) => {
    if (memoryFlipped.length === 2) return
    const card = store.memoryCards.find((c) => c.id === id)
    if (!card || card.matched || memoryFlipped.includes(id)) return

    const newFlipped = [...memoryFlipped, id]
    setMemoryFlipped(newFlipped)

    if (newFlipped.length === 2) {
      store.incrementMemoryMoves()
      const [a, b] = newFlipped
      const cardA = store.memoryCards.find((c) => c.id === a)
      const cardB = store.memoryCards.find((c) => c.id === b)
      if (cardA && cardB && cardA.zh === cardB.zh && cardA.type !== cardB.type) {
        store.matchMemoryPair(a, b)
        setTimeout(() => setMemoryFlipped([]), 500)
      } else {
        setTimeout(() => setMemoryFlipped([]), 1000)
      }
    }
  }
  const [selectedMemoryLevel, setSelectedMemoryLevel] = useState(1)

  // Derive target tone index deterministically from toneRound (no useState+useEffect needed)
  const targetToneIdx = useMemo(() => {
    if (toneRound >= tonePairs.length) return 0
    const set = tonePairs[toneRound % tonePairs.length]
    const maxIdx = set.tones.length - 1
    const seed = (toneRound * 2654435761) >>> 0
    return seed % (maxIdx + 1)
  }, [toneRound])

  // Speed game state
  const [speedActive, setSpeedActive] = useState(false)
  const [speedTime, setSpeedTime] = useState(30)
  const [speedScore, setSpeedScore] = useState(0)
  const [speedStreak, setSpeedStreak] = useState(0)
  const [speedBest, setSpeedBest] = useState(0)
  const [speedWord, setSpeedWord] = useState<{ word: any; options: string[]; correct: string } | null>(null)
  const speedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startSpeedGame = () => {
    setSpeedActive(true)
    setSpeedTime(30)
    setSpeedScore(0)
    setSpeedStreak(0)
    nextSpeedWord()
    speedTimerRef.current = setInterval(() => {
      setSpeedTime(t => {
        if (t <= 1) {
          if (speedTimerRef.current) clearInterval(speedTimerRef.current)
          setSpeedActive(false)
          setSpeedBest(prev => Math.max(prev, speedScore))
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const nextSpeedWord = () => {
    const w = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    const wrongs = vocabulary.filter(v => v.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.zh)
    const options = [...wrongs, w.zh].sort(() => Math.random() - 0.5)
    setSpeedWord({ word: w, options, correct: w.zh })
  }

  const handleSpeedAnswer = (ans: string) => {
    if (ans === speedWord?.correct) {
      setSpeedScore(s => s + 1)
      setSpeedStreak(s => s + 1)
    } else {
      setSpeedStreak(0)
    }
    nextSpeedWord()
  }

  const currentPairCount = memoryLevelOptions.find(l => l.level === selectedMemoryLevel)?.pairs || 6

  const startToneGame = () => {
    setToneRound(0)
    setToneScore(0)
    setToneAnswer(null)
  }

  const currentToneSet = tonePairs[toneRound % tonePairs.length]
  const targetTone = currentToneSet?.tones[targetToneIdx]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary" />
          {ts('الألعاب التعليمية','Learning Games')}
        </h2>
      </div>

      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memory">{ts('لعبة الذاكرة','Memory Game')}</TabsTrigger>
          <TabsTrigger value="tone">{ts('تمييز النبرات','Tone Recognition')}</TabsTrigger>
          <TabsTrigger value="speed">{ts('لعبة السرعة ⚡','Speed Game ⚡')}</TabsTrigger>
        </TabsList>

        {/* Memory Game (Fixed) */}
        <TabsContent value="memory" className="space-y-4">
          {!memoryCards.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🧠</div>
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">{ts('لعبة الذاكرة','Memory Game')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  طابق الكلمة الصينية (الحرف) مع معناها! اختر المستوى وابدأ.
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {memoryLevelOptions.map(l => (
                    <Button
                      key={l.level}
                      variant={selectedMemoryLevel === l.level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMemoryLevel(l.level)}
                      className={selectedMemoryLevel === l.level ? 'bg-primary hover:brightness-110' : ''}
                    >
                      {l.label}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => { startMemoryGame(selectedMemoryLevel); incrementStreak() }} className="bg-primary hover:brightness-110">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-[var(--text-muted)]">
                <span>المحاولات: {memoryMoves}</span>
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
                      className={isFlipped
                        ? card.matched
                          ? "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-[var(--clr-success)]/40 bg-[var(--clr-success-bg)]"
                          : "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-[var(--clr-danger)]/40 bg-[var(--clr-danger-bg)]"
                        : "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-[var(--line-default)] bg-[var(--surface-card)] hover:bg-[var(--surface-card-h)] cursor-pointer"
                      }
                    >
                      {isFlipped ? (
                        isHanzi ? (
                          <div className="font-chinese-serif text-2xl text-[var(--text-primary)]">{card.zh}</div>
                        ) : (
                          <div className="p-1">
                            <div className="font-chinese-sans text-[10px] text-[var(--text-muted)]">{card.pinyin}</div>
                            <div className="text-xs text-[var(--text-primary)] font-bold leading-tight">{card.ar}</div>
                          </div>
                        )
                      ) : (
                        <div className="text-2xl text-[var(--text-muted)]">?</div>
                      )}
                    </button>
                  )
                })}
              </div>
              {memoryPairs === currentPairCount && (
                <div className="text-center space-y-3 p-6 bg-[var(--clr-success-bg)] rounded-xl">
                  <Trophy className="w-12 h-12 text-[var(--clr-warning)] mx-auto" />
                  <div className="text-xl font-bold text-[var(--clr-success)]">{ts('فزت! 🎉','You won! 🎉')}</div>
                  <div className="text-sm text-[var(--clr-success)]">أكملت اللعبة في {memoryMoves} محاولة</div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => startMemoryGame(selectedMemoryLevel)} variant="outline">{ts('العب مرة أخرى','Play again')}</Button>
                    <Button onClick={() => { store.resetMemoryGame() }} variant="outline">{ts('تغيير المستوى','Change level')}</Button>
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
                <Trophy className={toneScore >= Math.floor(tonePairs.length * 0.8) ? "w-16 h-16 text-[var(--clr-warning)]" : "w-16 h-16 text-[var(--text-muted)]"} />
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{ts('انتهت اللعبة!','Game over!')}</h3>
                <div className="text-3xl font-bold text-primary">{toneScore}/{tonePairs.length}</div>
                <Button onClick={startToneGame} className="bg-primary hover:brightness-110">
                  <RotateCcw className="w-4 h-4 ml-2" /> {ts('العب مرة أخرى','Play again')}
                </Button>
              </CardContent>
            </Card>
          ) : toneRound < tonePairs.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between text-sm text-[var(--text-muted)]">
                  <span>الجولة {toneRound + 1}/{tonePairs.length}</span>
                  <span>النتيجة: {toneScore}</span>
                </div>

                {currentToneSet && (
                <>
                <div className="text-center space-y-2">
                  <div className="text-sm text-[var(--text-muted)]">{ts('اختر النبرة الصحيحة للكلمة:','Choose the correct tone:')}</div>
                  <div className="font-chinese-sans text-lg text-primary">[{currentToneSet.syllable}]</div>
                  <Button variant="ghost" size="sm" onClick={() => targetTone && speak(targetTone.char)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع للنبرة
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentToneSet.tones.map((t, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className={toneAnswer === i
                        ? (i === targetToneIdx ? "h-auto py-4 flex flex-col items-center gap-1 transition-all border-[var(--clr-success)] bg-[var(--clr-success-bg)]" : "h-auto py-4 flex flex-col items-center gap-1 transition-all border-[var(--clr-danger)] bg-[var(--clr-danger-bg)]")
                        : "h-auto py-4 flex flex-col items-center gap-1 transition-all hover:bg-[var(--surface-card-h)]"
                      }
                      onClick={() => {
                        if (toneAnswer !== null) return
                        setToneAnswer(i)
                        if (i === targetToneIdx) {
                          setToneScore(s => s + 1)
                        }
                        setTimeout(() => {
                          setToneRound(r => r + 1)
                          setToneAnswer(null)
                        }, 1500)
                      }}
                    >
                      <span className="font-chinese-serif text-3xl">{t.char}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{t.pinyin} — النبرة {t.tone}</span>
                      <span className="text-xs text-[var(--text-muted)]">{t.meaning}</span>
                    </Button>
                  ))}
                </div>
                </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🎵</div>
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">لعبة {ts('تمييز النبرات','Tone Recognition')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  اختبر قدرتك على {ts('تمييز النبرات','Tone Recognition')} في اللغة الصينية. {tonePairs.length} مجموعات نبرية للتدرب!
                </p>
                <Button onClick={() => { startToneGame(); incrementStreak() }} className="bg-primary hover:brightness-110">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
