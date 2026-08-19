'use client'
// ─── Grammar — a rule, then its drill, immediately ──────────────────────────
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Brain, GraduationCap, Sparkles, Volume2 } from 'lucide-react'
import { speak } from '@/lib/tts'
import { useActiveLevel } from '@/lib/levels'
import { ts, tsPick } from '@/lib/i18n'

export default function GrammarSection() {
  const activeLevel = useActiveLevel()
  const { grammarRules } = activeLevel
  const [grammarAnswers, setGrammarAnswers] = useState<Record<string, Record<number, number>>>({})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          {ts('القواعد النحوية','Grammar')}
        </h2>
        <Badge variant="secondary">{grammarRules.length} {ts('قاعدة','rules')}</Badge>
      </div>
      <p className="text-[var(--text-muted)] text-sm">{ts(`جميع القواعد النحوية المطلوبة لـ ${activeLevel.label}`,`All grammar rules required for ${activeLevel.label}`)}</p>

      <Accordion type="multiple" className="space-y-2">
        {grammarRules.map((rule) => {
          const questions = activeLevel.grammarPractice[rule.id] || []
          const answers = grammarAnswers[String(rule.id)] || {}

          return (
            <AccordionItem key={rule.id} value={String(rule.id)} className="border rounded-xl shadow-sm px-4">
              <AccordionTrigger className="text-right hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {rule.id}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text-primary)] text-sm">{tsPick(rule.titleAr, rule.title)}</div>
                    {tsPick(rule.titleAr, rule.title) !== rule.title && (
                      <div className="text-xs text-[var(--text-muted)] font-ltr">{rule.title}</div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">{tsPick(rule.description, (rule as any).descriptionEn)}</p>

                {/* Pattern */}
                <div className="bg-[var(--surface-card-h)] rounded-lg p-3">
                  <div className="text-xs font-medium text-[var(--text-muted)] mb-1">{ts('الصيغة','Pattern')}</div>
                  <div className="text-sm font-medium text-primary font-chinese-sans">{tsPick(rule.pattern, (rule as any).patternEn)}</div>
                </div>

                {/* Examples */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[var(--text-muted)]">{ts('أمثلة:', 'Examples:')}</div>
                  {rule.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--surface-card-h)] cursor-pointer transition-colors"
                      onClick={() => speak(ex.zh)}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-chinese-serif text-[var(--text-primary)]">{ex.zh}</div>
                        <div className="text-xs text-[var(--text-muted)] font-chinese-sans">{ex.pinyin}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{tsPick(ex.ar, (ex as any).en)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {rule.tips && (
                  <div className="bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30 rounded-lg p-3">
                    <div className="text-xs font-medium text-[var(--clr-warning)] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {ts('نصيحة', 'Tip')}
                    </div>
                    <div className="text-sm text-[var(--clr-warning)] mt-1">{tsPick(rule.tips, (rule as any).tipsEn)}</div>
                  </div>
                )}

                {/* Practice Questions */}
                {questions.length > 0 && (
                  <div className="border-t border-[var(--line-default)] pt-3 space-y-3">
                    <div className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {ts('تمرين تفاعلي', 'Interactive practice')}
                    </div>
                    {questions.map((q, qi) => {
                      const selected = answers[qi]
                      const answered = selected !== undefined
                      const isCorrect = selected === q.correct
                      return (
                        <div key={qi} className="space-y-2">
                          <div className="font-chinese-serif text-sm text-[var(--text-primary)] font-medium">{q.zh}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => {
                              let cls = 'border-[var(--line-default)] hover:bg-[var(--surface-card-h)] text-[var(--text-secondary)]'
                              if (answered) {
                                if (oi === q.correct) cls = 'border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)]'
                                else if (oi === selected) cls = 'border-[var(--clr-danger)]/50 bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]'
                              }
                              return (
                                <Button
                                  key={oi}
                                  variant="outline"
                                  size="sm"
                                  className={"h-auto py-2 text-xs " + cls}
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
                            <div className={isCorrect ? "text-xs font-medium text-[var(--clr-success)]" : "text-xs font-medium text-primary"}>
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
