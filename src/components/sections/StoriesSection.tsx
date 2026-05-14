'use client'
import React, { useEffect } from 'react'
import { stories } from '@/data/content'
import { speak } from '@/lib/helpers'
import { useLearningStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookMarked, Volume2, Check, Brain } from 'lucide-react'

export function StoriesSection({ activeStory, setActiveStory, storyAnswers, setStoryAnswers }: {
  activeStory: number
  setActiveStory: (s: number) => void
  storyAnswers: Record<number, number>
  setStoryAnswers: (a: Record<number, number>) => void
}) {
  const store = useLearningStore()
  const story = stories[activeStory]
  const completedCount = store.completedStories.length
  const allCorrect = Object.keys(storyAnswers).length === story.questions.length &&
    Object.entries(storyAnswers).every(([qi, oi]) => story.questions[Number(qi)].correct === oi)

  // Auto-toggle story completion when all questions answered correctly
  useEffect(() => {
    if (allCorrect && Object.keys(storyAnswers).length > 0) {
      if (!store.isStoryCompleted(activeStory)) {
        store.toggleStoryCompleted(activeStory)
        // Record daily activity
        const today = new Date().toISOString().split('T')[0]
        store.recordDailyActivity(today, 0, story.questions.length, 0)
      }
    }
  }, [allCorrect, activeStory, story, store, storyAnswers])
  // Split Chinese text into clickable spans
  const renderClickableChinese = (text: string) => {
    const chars = text.split('')
    return chars.map((char, i) => {
      const isPunctuation = /[。！？，、；：""''（）《》\s]/.test(char)
      if (isPunctuation) {
        return <span key={i} className="font-chinese-serif text-gray-900">{char}</span>
      }
      return (
        <span
          key={i}
          className="font-chinese-serif text-gray-900 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded px-0.5 transition-colors"
          onClick={() => speak(char)}
          title="اضغط للنطق"
        >
          {char}
        </span>
      )
    })
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-red-600" />
            القصص القصيرة
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
        <Badge variant="secondary">{stories.length} قصص</Badge>
      </div>
      {/* Quick Stats */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Badge variant="secondary" className="gap-1">
          <BookMarked className="w-3 h-3" />
          {stories.length} قصة متاحة
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Check className="w-3 h-3 text-emerald-500" />
          <span>{completedCount}/{stories.length} مكتملة</span>
        </Badge>
      </div>
      {/* Story Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stories.map((s, i) => (
          <Button
            key={s.id}
            variant={activeStory === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveStory(i); setStoryAnswers({}); store.incrementStreak() }}
            className={activeStory === i ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {s.title}
            {store.isStoryCompleted(i) && (
              <Check className="w-3 h-3 mr-1 text-emerald-300" />
            )}
          </Button>
        ))}
      </div>
      {/* Reading Progress */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">تقدم القراءة:</span>
        <Progress value={Object.keys(storyAnswers).length > 0 ? Math.round((Object.keys(storyAnswers).length / stories[activeStory].questions.length) * 100) : 0} className="flex-1 h-2" />
        <span className="text-sm font-medium text-gray-600">{Object.keys(storyAnswers).length}/{stories[activeStory].questions.length}</span>
      </div>
      {/* Story Content */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="text-lg">{story.title}</div>
              <div className="font-chinese-serif text-sm text-gray-500">{story.titleZh}</div>
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
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => speak(line.zh)}
            >
              <div className="font-chinese-serif text-gray-900 text-lg leading-relaxed">
                {renderClickableChinese(line.zh)}
              </div>
              <div className="text-xs text-gray-500 font-chinese-sans mt-1">{line.pinyin}</div>
              <div className="text-sm text-gray-700 mt-1">{line.ar}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Gradient Divider */}
      <hr className="gradient-divider" />
      {/* Comprehension Questions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-500" />
            أسئلة الفهم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {story.questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <div className="font-chinese-serif text-sm text-gray-800 font-medium">{q.zh}</div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = storyAnswers[qi] === oi
                  const isCorrect = oi === q.correct
                  const answered = storyAnswers[qi] !== undefined
                  let cls = 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  if (answered) {
                    if (isCorrect) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    else if (selected) cls = 'border-red-400 bg-red-50 text-red-800'
                  } else if (selected) {
                    cls = 'border-red-300 bg-red-50 text-red-700'
                  }
                  return (
                    <Button
                      key={oi}
                      variant="outline"
                      size="sm"
                      className={`h-auto py-2 text-xs ${cls}`}
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
              {allCorrect ? (
                <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                  🎉 ممتاز! جميع الإجابات صحيحة!
                  {!store.isStoryCompleted(activeStory) && (
                    <Badge className="mr-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200">
                      ✓ مكتمل
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-amber-700 dark:text-amber-400 font-medium">حاول مرة أخرى! بعض الإجابات خاطئة.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
