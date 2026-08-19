'use client'
// ─── Stories — a short passage, then a comprehension question ──────────────
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookMarked, Brain, Volume2 } from 'lucide-react'
import { speak } from '@/lib/tts'
import { useActiveLevel } from '@/lib/levels'
import { ts } from '@/lib/i18n'
import { useLearningStore } from '@/lib/store'

export default function StoriesSection() {
  const store = useLearningStore()
  const { stories } = useActiveLevel()
  const [activeStory, setActiveStory] = useState(0)
  const [storyAnswers, setStoryAnswers] = useState<Record<number, number>>({})
  const story = stories[activeStory]

  // Split Chinese text into clickable spans
  const renderClickableChinese = (text: string) => {
    const chars = text.split('')
    return chars.map((char, i) => {
      const isPunctuation = /[。！？，、；：""''（）《》\s]/.test(char)
      if (isPunctuation) {
        return <span key={i} className="font-chinese-serif text-[var(--text-primary)]">{char}</span>
      }
      return (
        <span
          key={i}
          className="font-chinese-serif text-[var(--text-primary)] cursor-pointer hover:text-primary hover:bg-primary/10 rounded px-0.5 transition-colors"
          onClick={() => speak(char)}
          title={ts('اضغط للنطق','Tap to pronounce')}
        >
          {char}
        </span>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-primary" />
          {ts('القصص القصيرة','Short Stories')}
        </h2>
        <Badge variant="secondary">{stories.length} قصص</Badge>
      </div>

      {/* Story Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stories.map((s, i) => (
          <Button
            key={s.id}
            variant={activeStory === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveStory(i); setStoryAnswers({}) }}
            className={activeStory === i ? 'bg-primary hover:brightness-110' : ''}
          >
            {s.title}
          </Button>
        ))}
      </div>

      {/* Story Content */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="text-lg">{story.title}</div>
              <div className="font-chinese-serif text-sm text-[var(--text-muted)]">{story.titleZh}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => speak(story.content[0].zh)}>
              <Volume2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {story.content.map((line, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-[var(--surface-card-h)] hover:bg-[var(--surface-card-h)] transition-colors"
              onClick={() => speak(line.zh)}
            >
              <div className="font-chinese-serif text-[var(--text-primary)] text-lg leading-relaxed">
                {renderClickableChinese(line.zh)}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-chinese-sans mt-1">{line.pinyin}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{line.ar}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comprehension Questions */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-[var(--clr-warning)]" />
            أسئلة الفهم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {story.questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <div className="font-chinese-serif text-sm text-[var(--text-primary)] font-medium">{q.zh}</div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = storyAnswers[qi] === oi
                  const isCorrect = oi === q.correct
                  const answered = storyAnswers[qi] !== undefined
                  let cls = 'border-[var(--line-default)] hover:bg-[var(--surface-card-h)] text-[var(--text-secondary)]'
                  if (answered) {
                    if (isCorrect) cls = 'border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)]'
                    else if (selected) cls = 'border-[var(--clr-danger)]/50 bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]'
                  } else if (selected) {
                    cls = 'border-[var(--clr-danger)]/40 bg-primary/10 text-primary'
                  }
                  return (
                    <Button
                      key={oi}
                      variant="outline"
                      size="sm"
                      className={"h-auto py-2 text-xs " + cls}
                      onClick={() => {
                        if (answered) return
                        setStoryAnswers({ ...storyAnswers, [qi]: oi })
                      }}
                    >
                      {opt}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
          {Object.keys(storyAnswers).length === story.questions.length && (
            <div className="text-center pt-2">
              {Object.entries(storyAnswers).every(([qi, oi]) => story.questions[Number(qi)].correct === oi) ? (
                <div className="text-[var(--clr-success)] font-bold">{ts('🎉 ممتاز! جميع الإجابات صحيحة!','🎉 Excellent! All answers correct!')}</div>
              ) : (
                <div className="text-[var(--clr-warning)] font-medium">{ts('حاول مرة أخرى! بعض الإجابات خاطئة.','Try again! Some answers are wrong.')}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
