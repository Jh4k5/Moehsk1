'use client'
import React, { useMemo } from 'react'
import { vocabulary } from '@/data/vocabulary'
import { allSentences, speak } from '@/lib/helpers'
import { useLearningStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Volume2, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react'

export function SentencesSection({ sentenceFlipped, setSentenceFlipped, sentenceIndex, setSentenceIndex }: {
  sentenceFlipped: boolean
  setSentenceFlipped: (f: boolean) => void
  sentenceIndex: number
  setSentenceIndex: (i: number) => void
}) {
  const store = useLearningStore()
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
  if (!sentence) return <div>لا توجد جمل</div>
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-red-600" />
            إتقان الجمل
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
        <Badge variant="secondary">{allSentences.length} جملة</Badge>
      </div>
      <p className="text-gray-500 text-sm">تدرب على الجمل اليومية — انقر على البطاقة لتقلبها</p>
      {/* Sentence Flashcard */}
      <div className="perspective-1000">
        <div
          className={`relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d ${sentenceFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setSentenceFlipped(!sentenceFlipped)}
          style={{ minHeight: '280px' }}
        >
          {/* Front - Chinese text */}
          <div className="absolute inset-0 backface-hidden">
            <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-sm text-gray-400 mb-4">اقرأ الجملة:</div>
                <div
                  className="font-chinese-serif text-3xl mb-4 text-gray-900 cursor-pointer hover:text-red-600 transition-colors leading-relaxed"
                  onClick={(e) => { e.stopPropagation(); speak(sentence.zh) }}
                >
                  {sentence.zh}
                </div>
                <div className="text-sm text-gray-400 font-chinese-sans">{sentence.pinyin}</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Volume2 className="w-3 h-3" />
                  <span>اضغط للنطق • انقر للقلب</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Back - Arabic + breakdown */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-amber-50 overflow-y-auto custom-scrollbar">
              <CardContent className="flex flex-col items-center h-full p-6 text-center space-y-4">
                <div className="text-sm text-gray-400">الترجمة والتحليل:</div>
                <div className="text-xl font-bold text-gray-900">{sentence.ar}</div>
                <div className="w-full border-t border-gray-200 pt-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">🔤 تحليل الكلمات:</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {wordBreakdown.map((w, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 text-center min-w-[60px]"
                        onClick={(e) => { e.stopPropagation(); if (w.char) speak(w.char) }}>
                        <div className="font-chinese-serif text-lg text-red-700">{w.char}</div>
                        {w.meaning && <div className="text-[10px] text-gray-500 mt-0.5">{w.meaning}</div>}
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
          السابقة
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
          التالية
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-center text-sm text-gray-500">
        {sentenceIndex + 1} / {allSentences.length}
      </div>
    </div>
  )
}
