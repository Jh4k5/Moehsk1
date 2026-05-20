'use client'
import React from 'react'
import { vocabulary } from '@/data/vocabulary'
import { roadmapUnits } from '@/data/content'
import { grammarRules } from '@/data/grammar'
import { useLearningStore, type Section } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Map, Check, Clock } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// ROADMAP SECTION
// ═══════════════════════════════════════════════════════════
export function RoadmapSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const store = useLearningStore()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-red-600" />
            خريطة الطريق
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
        <Badge variant="secondary">10 ساعات</Badge>
      </div>
      <p className="text-gray-500 text-sm">خطة دراسية مقترحة لإنهاء المستوى الأول خلال 10 ساعات</p>
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-amber-500 to-emerald-500" />
        {/* Cards */}
        <div className="space-y-3">
        {roadmapUnits.map((unit) => {
          const totalWords = unit.words.length
          const learnedCount = unit.words.filter(id => store.isLearned(id)).length
          const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0
          const isComplete = progress === 100
          return (
            <div key={unit.id} className="relative pr-12">
              {/* Timeline dot */}
              <div className={`absolute right-4 top-4 w-5 h-5 rounded-full border-2 border-white shadow-md z-10 ${isComplete ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <Card className={`border-0 shadow-sm card-hover transition-all cursor-pointer ${isComplete ? 'ring-2 ring-emerald-200' : ''}`}
              onClick={() => {
                const unitWords = vocabulary.filter(w => unit.words.includes(w.id))
                if (unitWords.length > 0) {
                  onNavigate('vocabulary')
                }
              }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isComplete ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{unit.id}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{unit.title}</h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {unit.hours} ساعة
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{unit.desc}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-gray-500">{learnedCount}/{totalWords}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{totalWords} كلمة</Badge>
                      {unit.grammarIds.map(gid => {
                        const rule = grammarRules.find(r => r.id === gid)
                        return rule ? (
                          <Badge key={gid} variant="outline" className="text-[10px]">{rule.titleAr}</Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )
        })}
        </div>
      </div>
      {/* Total Time Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-red-50 to-amber-50">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">الإجمالي: 10 ساعات</h3>
          <p className="text-sm text-gray-600">
            بإمكانك إنهاء المستوى الأول خلال أسبوعين إذا تابعت الدراسة يومياً
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{roadmapUnits.reduce((a, u) => a + u.words.length, 0)}</div>
              <div className="text-gray-500">كلمة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{roadmapUnits.reduce((a, u) => a + new Set(u.grammarIds).size, 0)}</div>
              <div className="text-gray-500">قاعدة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">10</div>
              <div className="text-gray-500">وحدة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
