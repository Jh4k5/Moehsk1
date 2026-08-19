'use client'
// ─── Sentences — every example the level's vocabulary carries ───────────────
import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, MessageCircle, RotateCcw, Volume2 } from 'lucide-react'
import { speak } from '@/lib/tts'
import { useActiveLevel } from '@/lib/levels'
import { ts } from '@/lib/i18n'
import { buildAllSentences } from '@/features/shared/helpers'

export default function SentencesSection() {
  const { vocabulary } = useActiveLevel()
  const [sentenceFlipped, setSentenceFlipped] = useState(false)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const allSentences = useMemo(() => buildAllSentences(vocabulary), [vocabulary])
  const sentence = allSentences[sentenceIndex]

  // Word breakdown from vocabulary
  const wordBreakdown = useMemo(() => {
    if (!sentence) return []
    const breakdown: { char: string; meaning: string; pinyin: string }[] = []
    const chars = sentence.zh.replace(/[。！？，、；：""''（）《》\s]/g, '').split('')
    for (const char of chars) {
      const found = vocabulary.find(w => w.zh === char)
      if (found) {
        breakdown.push({ char, meaning: found.meaning, pinyin: found.pinyin })
      } else {
        // Try multi-char words
        breakdown.push({ char, meaning: '', pinyin: '' })
      }
    }
    return breakdown
  }, [sentence])

  if (!sentence) return <div>{ts('لا توجد جمل','No sentences')}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          {ts('إتقان الجمل','Sentence Mastery')}
        </h2>
        <Badge variant="secondary">{allSentences.length} جملة</Badge>
      </div>
      <p className="text-[var(--text-muted)] text-sm">{ts('تدرب على الجمل اليومية — انقر على البطاقة لتقلبها','Practice daily sentences — tap the card to flip')}</p>

      {/* Sentence Flashcard */}
      <div className="j-flashcard">
        <div
          className={sentenceFlipped ? "relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d rotate-y-180" : "relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d"}
          onClick={() => setSentenceFlipped(!sentenceFlipped)}
          style={{ minHeight: '280px' }}
        >
          {/* Front - Chinese text */}
          <div className="absolute inset-0 backface-hidden">
            <Card className="j-card h-full border-0 shadow-lg bg-gradient-to-br from-white to-primary/10">
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-sm text-[var(--text-muted)] mb-4">{ts('اقرأ الجملة:','Read the sentence:')}</div>
                <div
                  className="font-chinese-serif text-3xl mb-4 text-[var(--text-primary)] cursor-pointer hover:text-primary transition-colors leading-relaxed"
                  onClick={(e) => { e.stopPropagation(); speak(sentence.zh) }}
                >
                  {sentence.zh}
                </div>
                <div className="text-sm text-[var(--text-muted)] font-chinese-sans">{sentence.pinyin}</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Volume2 className="w-3 h-3" />
                  <span>{ts('اضغط للنطق • انقر للقلب','Tap to pronounce • click to flip')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Back - Arabic + breakdown */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className="j-card h-full border-0 shadow-lg bg-gradient-to-br from-white to-[var(--clr-warning-bg)] overflow-y-auto custom-scrollbar">
              <CardContent className="flex flex-col items-center h-full p-6 text-center space-y-4">
                <div className="text-sm text-[var(--text-muted)]">{ts('الترجمة والتحليل:','Translation & breakdown:')}</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{sentence.ar}</div>
                <div className="w-full border-t border-[var(--line-default)] pt-3">
                  <div className="text-xs font-medium text-[var(--text-muted)] mb-2">{ts('🔤 تحليل الكلمات:','🔤 Word breakdown:')}</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {wordBreakdown.map((w, i) => (
                      <div key={i} className="bg-[var(--surface-card-h)] rounded-lg p-2 text-center min-w-[60px]"
                        onClick={(e) => { e.stopPropagation(); if (w.char) speak(w.char) }}>
                        <div className="font-chinese-serif text-lg text-primary">{w.char}</div>
                        {w.meaning && <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{w.meaning}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); speak(sentence.zh) }}>
                  <Volume2 className="w-4 h-4 ml-1" /> استمع للجملة كاملة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSentenceIndex(Math.max(0, sentenceIndex - 1)); setSentenceFlipped(false) }}
          disabled={sentenceIndex === 0}
        >
          <ChevronRight className="w-4 h-4" />
          {ts('السابقة','Previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { const rand = Math.floor(Math.random() * allSentences.length); setSentenceIndex(rand); setSentenceFlipped(false) }}
        >
          <RotateCcw className="w-4 h-4 ml-1" />
          عشوائي
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSentenceIndex(Math.min(allSentences.length - 1, sentenceIndex + 1)); setSentenceFlipped(false) }}
          disabled={sentenceIndex >= allSentences.length - 1}
        >
          {ts('التالية','Next')}
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-[var(--text-muted)]">
        {sentenceIndex + 1} / {allSentences.length}
      </div>
    </div>
  )
}
