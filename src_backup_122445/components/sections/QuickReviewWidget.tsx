'use client'
import React, { useState } from 'react'
import { vocabulary } from '@/data/vocabulary'
import { useLearningStore } from '@/lib/store'
import { speak } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Volume2, Check, RotateCcw, Zap } from 'lucide-react'

export default function QuickReviewWidget() {
  const store = useLearningStore()
  const [quickFlipped, setQuickFlipped] = useState(false)
  const unlearned = vocabulary.filter(w => !store.learnedWords.includes(w.id))
  if (unlearned.length === 0) return null
  const dailySeed = new Date().getDate()
  const quickWord = unlearned[dailySeed % unlearned.length]
  return (
    <Card className="border-0 shadow-sm card-glass-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          مراجعة سريعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="perspective-1000" onClick={() => setQuickFlipped(!quickFlipped)}>
          <div className={`relative min-h-[120px] cursor-pointer transition-transform duration-500 preserve-3d ${quickFlipped ? 'rotate-y-180' : ''}`}>
            <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex flex-col items-center justify-center p-4">
              <div className="font-chinese-serif text-4xl text-gray-900 mb-1">{quickWord.zh}</div>
              <div className="font-chinese-sans text-sm text-gray-500">{quickWord.pinyin}</div>
              <button onClick={(e) => { e.stopPropagation(); speak(quickWord.zh) }} className="mt-2">
                <Volume2 className="w-4 h-4 text-amber-500" />
              </button>
              <div className="text-[10px] text-gray-400 mt-2">اضغط لقلب البطاقة</div>
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col items-center justify-center p-4">
              <div className="text-lg font-bold text-emerald-700">{quickWord.meaning}</div>
              <div className="font-chinese-serif text-2xl text-gray-900 mt-2">{quickWord.zh}</div>
              {quickWord.mnemonic && <div className="text-xs text-gray-500 mt-1">💡 {quickWord.mnemonic}</div>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => { store.toggleLearned(quickWord.id); store.incrementStreak() }}>
            <Check className="w-3.5 h-3.5 ml-1" /> عرفتها!
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => { store.rateWord(quickWord.id, 1); store.incrementStreak() }}>
            <RotateCcw className="w-3.5 h-3.5 ml-1" /> راجعها
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
