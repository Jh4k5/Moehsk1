'use client'
// ─── Roadmap — where you are in the curriculum, at a glance ────────────────
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, Clock, Map } from 'lucide-react'
import { useActiveLevel } from '@/lib/levels'
import { ts } from '@/lib/i18n'
import { useLearningStore } from '@/lib/store'

export default function RoadmapSection() {
  const store = useLearningStore()
  const { vocabulary, grammarRules, roadmapUnits } = useActiveLevel()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          {ts('خريطة الطريق','Roadmap')}
        </h2>
        <Badge variant="secondary">{ts('10 ساعات','10 hours')}</Badge>
      </div>
      <p className="text-[var(--text-muted)] text-sm">{ts('خطة دراسية مقترحة لإنهاء المستوى الأول خلال 10 ساعات','A suggested study plan to finish HSK 1 in 10 hours')}</p>

      <div className="space-y-3">
        {roadmapUnits.map((unit) => {
          const totalWords = unit.words.length
          const learnedCount = unit.words.filter(id => store.isLearned(id)).length
          const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0
          const isComplete = progress === 100

          return (
            <Card key={unit.id} className={isComplete ? "border-0 shadow-sm card-hover transition-all ring-2 ring-[var(--clr-success)]/40" : "border-0 shadow-sm card-hover transition-all"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={isComplete
                    ? "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--clr-success-bg)] text-[var(--clr-success)]"
                    : "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary"
                  }>
                    {isComplete ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{unit.id}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[var(--text-primary)] text-sm">{unit.title}</h3>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {unit.hours} ساعة
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mb-2">{unit.desc}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-[var(--text-muted)]">{learnedCount}/{totalWords}</span>
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
          )
        })}
      </div>

      {/* Total Time Summary */}
      <Card className="j-card border-0 shadow-sm bg-gradient-to-r from-primary/10 to-[var(--clr-warning-bg)]/60">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">الإجمالي: {ts('10 ساعات','10 hours')}</h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            بإمكانك إنهاء المستوى الأول خلال أسبوعين إذا تابعت الدراسة يومياً
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{roadmapUnits.reduce((a, u) => a + u.words.length, 0)}</div>
              <div className="text-[var(--text-muted)]">كلمة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--clr-warning)]">{roadmapUnits.reduce((a, u) => a + new Set(u.grammarIds).size, 0)}</div>
              <div className="text-[var(--text-muted)]">قاعدة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--clr-success)]">10</div>
              <div className="text-[var(--text-muted)]">وحدة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
