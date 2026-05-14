'use client'
import { useState } from 'react'
import { grammarRules } from '@/data/grammar'
import { grammarPracticeQuestions } from '@/data/content'
import { speak } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  GraduationCap, Volume2, Sparkles, Brain, Search,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// GRAMMAR SECTION (Enhanced with Practice Questions)
// ═══════════════════════════════════════════════════════════
export function GrammarSection() {
  const [grammarAnswers, setGrammarAnswers] = useState<Record<string, Record<number, number>>>({})
  const [grammarSearch, setGrammarSearch] = useState('')
  const filteredGrammar = grammarRules.filter(rule =>
    rule.title.includes(grammarSearch) || rule.description.includes(grammarSearch)
  )
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-red-600" />
            القواعد النحوية
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
        <Badge variant="secondary">26 قاعدة</Badge>
      </div>
      <p className="text-gray-500 text-sm">جميع القواعد النحوية المطلوبة للمستوى الأول (HSK 1)</p>
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="ابحث في القواعد..."
          value={grammarSearch}
          onChange={(e) => setGrammarSearch(e.target.value)}
          className="pr-9"
        />
      </div>
      <Accordion type="multiple" className="space-y-2">
        {filteredGrammar.map((rule) => {
          const questions = grammarPracticeQuestions[rule.id] || []
          const answers = grammarAnswers[String(rule.id)] || {}
          return (
            <AccordionItem key={rule.id} value={String(rule.id)} className="border rounded-xl shadow-sm px-4">
              <AccordionTrigger className="text-right hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {rule.id}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{rule.titleAr}</div>
                    <div className="text-xs text-gray-500 font-ltr">{rule.title}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-4">
                <p className="text-sm text-gray-700">{rule.description}</p>
                {/* Pattern */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">الصيغة</div>
                  <div className="text-sm font-medium text-red-700 font-chinese-sans">{rule.pattern}</div>
                </div>
                {/* Examples */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500">أمثلة:</div>
                  {rule.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => speak(ex.zh)}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-chinese-serif text-gray-900">{ex.zh}</div>
                        <div className="text-xs text-gray-500 font-chinese-sans">{ex.pinyin}</div>
                        <div className="text-sm text-gray-700">{ex.ar}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Tips */}
                {rule.tips && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 border-r-4 border-amber-400 rounded-xl p-3">
                    <div className="text-xs font-medium text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      نصيحة
                    </div>
                    <div className="text-sm text-amber-900 mt-1">{rule.tips}</div>
                  </div>
                )}
                {/* Practice Questions */}
                {questions.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 space-y-3">
                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      تمرين تفاعلي
                    </div>
                    {questions.map((q, qi) => {
                      const selected = answers[qi]
                      const answered = selected !== undefined
                      const isCorrect = selected === q.correct
                      return (
                        <div key={qi} className="space-y-2">
                          <div className="font-chinese-serif text-sm text-gray-800 font-medium">{q.zh}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => {
                              let cls = 'border-gray-200 hover:bg-gray-50 text-gray-700'
                              if (answered) {
                                if (oi === q.correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                else if (oi === selected) cls = 'border-red-400 bg-red-50 text-red-800'
                              }
                              return (
                                <Button
                                  key={oi}
                                  variant="outline"
                                  size="sm"
                                  className={`h-auto py-2 text-xs ${cls}`}
                                  onClick={() => {
                                    if (answered) return
                                    setGrammarAnswers(prev => ({
                                      ...prev,
                                      [String(rule.id)]: { ...prev[String(rule.id)], [qi]: oi },
                                    }))
                                  }}
                                >
                                  {opt}
                                </Button>
                              )
                            })}
                          </div>
                          {answered && (
                            <div className={`text-xs font-medium ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                              {isCorrect ? '✓ إجابة صحيحة!' : '✗ حاول مرة أخرى'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
