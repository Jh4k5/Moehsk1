'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { conversations, type Conversation, type ConversationTurn } from '@/data/conversations'
import { speak } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  MessageSquare, Volume2, ChevronLeft, ChevronRight,
  Search, Users, Play
} from 'lucide-react'

export default function ConversationsSection() {
  const [activeConvIdx, setActiveConvIdx] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [completedConvos, setCompletedConvos] = useState<Set<number>>(new Set())
  const [showList, setShowList] = useState(false)

  const conv = conversations[activeConvIdx]

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.trim().toLowerCase()
    return conversations.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.titleChinese.toLowerCase().includes(q) ||
      c.context.toLowerCase().includes(q) ||
      c.turns.some(t => t.hanzi.includes(q) || t.arabic.toLowerCase().includes(q))
    )
  }, [searchQuery])

  const progressCount = completedConvos.size
  const totalCount = conversations.length

  const markComplete = useCallback(() => {
    if (!conv) return
    setCompletedConvos(prev => {
      const next = new Set(prev)
      next.add(conv.id)
      return next
    })
  }, [conv])

  const goToPrev = useCallback(() => {
    setActiveConvIdx(i => Math.max(0, i - 1))
  }, [])

  const goToNext = useCallback(() => {
    setActiveConvIdx(i => Math.min(conversations.length - 1, i + 1))
  }, [])

  const selectConv = useCallback((idx: number) => {
    setActiveConvIdx(idx)
    setShowList(false)
  }, [])

  const handleSpeak = useCallback((text: string) => {
    speak(text)
  }, [])

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-600" />
          المحادثات
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-violet-200">
            {progressCount}/{totalCount} محادثة مكتملة
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <Progress value={(progressCount / totalCount) * 100} className="h-2 flex-1" />
        <span className="text-xs text-gray-500 font-medium">{Math.round((progressCount / totalCount) * 100)}%</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث في المحادثات..."
          className="pr-10"
        />
      </div>

      {/* Conversation List (grid) */}
      {!showList && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
          {filteredConversations.map((c, i) => {
            const isActive = conv && c.id === conv.id
            const isComplete = completedConvos.has(c.id)
            return (
              <button
                key={c.id}
                onClick={() => selectConv(i)}
                className={
                  "p-3 rounded-xl border text-right transition-all hover:shadow-md " +
                  (isActive
                    ? 'bg-violet-50 border-violet-300 ring-1 ring-violet-200'
                    : 'bg-white border-gray-200 hover:border-violet-200')
                }
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {c.lesson}
                  </Badge>
                  {isComplete && (
                    <span className="text-emerald-500 text-xs">✓</span>
                  )}
                </div>
                <div className="font-chinese-sans text-sm font-medium text-gray-900 mb-0.5">
                  {c.titleChinese}
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-2">{c.title}</div>
                <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{c.context}</div>
              </button>
            )
          })}
        </div>
      )}

      {conv && (
        <>
          {/* Conversation Card */}
          <Card className="border-0 shadow-sm overflow-hidden">
            {/* Conversation Header */}
            <CardHeader className="bg-gradient-to-l from-violet-50 to-purple-50 pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-600" />
                  <span className="font-chinese-sans text-lg">{conv.titleChinese}</span>
                  <span className="text-gray-400 text-sm">— {conv.title}</span>
                </div>
                <button
                  onClick={() => handleSpeak(conv.turns.map(t => t.hanzi).join(''))}
                  className="p-2 rounded-full bg-white border border-violet-200 hover:bg-violet-100 transition-colors"
                >
                  <Play className="w-4 h-4 text-violet-600" />
                </button>
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] bg-white">
                  الدرس {conv.lesson}
                </Badge>
                <span className="text-xs text-gray-500">{conv.context}</span>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="p-4 space-y-3">
              {conv.turns.map((turn, i) => (
                <TurnBubble
                  key={i}
                  turn={turn}
                  index={i}
                  onSpeak={handleSpeak}
                />
              ))}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrev}
              disabled={activeConvIdx === 0}
              className="flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              السابقة
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {activeConvIdx + 1} / {conversations.length}
              </span>
              {!completedConvos.has(conv.id) && (
                <Button
                  size="sm"
                  onClick={markComplete}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  إكمال ✓
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={activeConvIdx >= conversations.length - 1}
              className="flex items-center gap-1"
            >
              التالية
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Vocabulary Used */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-500" />
                معلومات المحادثة
              </h4>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{conv.turns.length} جملة</span>
                <span>{conv.vocabularyUsed.length} كلمة مستخدمة</span>
                <span>{conv.grammarUsed.length} قاعدة نحوية</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ─── Chat Bubble Component ───────────────────────────────────
function TurnBubble({
  turn,
  index,
  onSpeak
}: {
  turn: ConversationTurn
  index: number
  onSpeak: (text: string) => void
}) {
  const isSpeakerA = turn.speaker === 'A'

  return (
    <div className={"flex gap-3 " + (isSpeakerA ? 'justify-start' : 'justify-end')}>
      {/* Speaker Avatar */}
      {isSpeakerA && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
          أ
        </div>
      )}

      {/* Message Bubble */}
      <div
        onClick={() => onSpeak(turn.hanzi)}
        className={
          "max-w-[80%] rounded-2xl px-4 py-3 space-y-1 cursor-pointer transition-all hover:shadow-md " +
          (isSpeakerA
            ? 'bg-violet-50 border border-violet-100 hover:bg-violet-100'
            : 'bg-gray-100 hover:bg-gray-150')
        }
      >
        {/* Speaker label + audio */}
        <div className="flex items-center justify-between">
          <span className={"text-[10px] font-bold " + (isSpeakerA ? 'text-violet-600' : 'text-gray-500')}>
            المتحدث {isSpeakerA ? 'أ' : 'ب'}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onSpeak(turn.hanzi) }}
            className={
              "p-1 rounded-full transition-colors " +
              (isSpeakerA ? 'hover:bg-violet-200' : 'hover:bg-gray-200')
            }
          >
            <Volume2 className={"w-3.5 h-3.5 " + (isSpeakerA ? 'text-violet-400' : 'text-gray-400')} />
          </button>
        </div>

        {/* Chinese text */}
        <div className="font-chinese-serif text-sm text-gray-900 leading-relaxed">
          {turn.hanzi}
        </div>

        {/* Pinyin */}
        <div className="font-chinese-sans text-[11px] text-gray-400">
          {turn.pinyin}
        </div>

        {/* Arabic translation */}
        <div className="text-xs text-gray-600 leading-relaxed">
          {turn.arabic}
        </div>
      </div>

      {/* Speaker B Avatar */}
      {!isSpeakerA && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
          ب
        </div>
      )}
    </div>
  )
}
