'use client'
import React, { useState, useMemo } from 'react'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { useLearningStore } from '@/lib/store'
import { speak } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Languages, Volume2, Search, Check, Eye, BookOpen, Star } from 'lucide-react'

interface HanziChar {
  char: string
  wordId: number
  pinyin: string
  meaning: string
  pos: string
}

export default function HanziSection() {
  const store = useLearningStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'learned' | 'unlearned'>('all')
  const [viewedChars, setViewedChars] = useState<Set<string>>(new Set())

  // Extract unique characters from vocabulary
  const allChars = useMemo(() => {
    const seen = new Map<string, HanziChar>()
    for (const w of vocabulary) {
      for (const ch of w.zh) {
        if (!seen.has(ch)) {
          seen.set(ch, {
            char: ch,
            wordId: w.id,
            pinyin: w.pinyin,
            meaning: w.meaning,
            pos: w.pos,
          })
        }
      }
    }
    return Array.from(seen.values())
  }, [])

  // Filter characters
  const filteredChars = useMemo(() => {
    let chars = allChars

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      chars = chars.filter(c =>
        c.char.includes(q) ||
        c.pinyin.toLowerCase().includes(q) ||
        c.meaning.includes(q)
      )
    }

    // Status filter
    if (filterStatus === 'learned') {
      chars = chars.filter(c => store.isLearned(c.wordId))
    } else if (filterStatus === 'unlearned') {
      chars = chars.filter(c => !store.isLearned(c.wordId))
    }

    return chars
  }, [allChars, searchQuery, filterStatus, store])

  const learnedCount = allChars.filter(c => store.isLearned(c.wordId)).length
  const viewedCount = viewedChars.size
  const progressPercent = Math.round((learnedCount / allChars.length) * 100)

  // Track viewed characters
  const handleCharClick = (char: HanziChar) => {
    speak(char.char)
    setViewedChars(prev => {
      const next = new Set(prev)
      next.add(char.char)
      return next
    })
  }

  // Get difficulty color for a character card
  const getDiffColor = (wordId: number) => {
    const word = vocabulary.find(w => w.id === wordId)
    if (!word) return 'from-gray-50 to-white border-gray-100'
    switch (word.difficulty) {
      case 'easy': return 'from-emerald-50/50 to-white border-emerald-100'
      case 'medium': return 'from-amber-50/50 to-white border-amber-100'
      case 'hard': return 'from-red-50/50 to-white border-red-100'
      default: return 'from-gray-50 to-white border-gray-100'
    }
  }

  const getDiffLabel = (wordId: number) => {
    const word = vocabulary.find(w => w.id === wordId)
    if (!word) return null
    switch (word.difficulty) {
      case 'easy': return { label: 'سهل', cls: 'bg-emerald-100 text-emerald-700' }
      case 'medium': return { label: 'متوسط', cls: 'bg-amber-100 text-amber-700' }
      case 'hard': return { label: 'صعب', cls: 'bg-red-100 text-red-700' }
      default: return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Languages className="w-6 h-6 text-red-600" />
            الأحرف الصينية
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{allChars.length} حرف</Badge>
        </div>
      </div>

      <p className="text-gray-500 text-sm">
        جميع الأحرف المستخدمة في مفردات HSK 1 — اضغط على أي حرف لسماعه
      </p>

      {/* Progress Bar */}
      <Card className="border-0 shadow-sm bg-gradient-to-l from-red-50/50 to-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">تقدّمك</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                تم حفظ: {learnedCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-500" />
                تمت مشاهدته: {viewedCount}
              </span>
              <span>
                من أصل {allChars.length}
              </span>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: progressPercent + '%' }}
            />
          </div>
          <div className="text-left mt-1">
            <span className="text-xs font-medium text-gray-500">{progressPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ابحث بالحرف أو البينين أو المعنى..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {([
            { key: 'all' as const, label: 'الكل' },
            { key: 'learned' as const, label: 'محفوظ' },
            { key: 'unlearned' as const, label: 'غير محفوظ' },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={"flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all " +
                (filterStatus === f.key ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-gray-400">
        عرض {filteredChars.length} حرف من أصل {allChars.length}
      </div>

      {/* Character Grid */}
      {filteredChars.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              لا توجد نتائج. جرّب كلمة بحث أخرى.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredChars.map((h) => {
            const isLearned = store.isLearned(h.wordId)
            const diff = getDiffLabel(h.wordId)
            const isViewed = viewedChars.has(h.char)

            return (
              <Card
                key={h.char + '-' + h.wordId}
                className={
                  "border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group " +
                  "bg-gradient-to-br " + getDiffColor(h.wordId) +
                  (isLearned ? ' ring-1 ring-emerald-300' : '')
                }
                onClick={() => handleCharClick(h)}
              >
                <CardContent className="p-3 text-center relative">
                  {/* Learned Badge */}
                  {isLearned && (
                    <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}

                  {/* Character */}
                  <div className="font-chinese-serif text-3xl sm:text-4xl text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                    {h.char}
                  </div>

                  {/* Pinyin */}
                  <div className="font-chinese-sans text-xs text-gray-500 truncate">
                    {h.pinyin.split(' ')[0] || h.pinyin}
                  </div>

                  {/* Meaning */}
                  <div className="text-[10px] text-gray-600 mt-1 line-clamp-1">
                    {h.meaning.split('/')[0].trim()}
                  </div>

                  {/* Audio */}
                  <div className="flex items-center justify-center mt-1.5">
                    <Volume2 className="w-3 h-3 text-gray-300 group-hover:text-red-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Bottom Actions */}
      {filteredChars.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Play all filtered characters
              const chars = filteredChars.slice(0, 10).map(c => c.char)
              chars.forEach((ch, i) => {
                setTimeout(() => speak(ch), i * 800)
              })
            }}
          >
            <Volume2 className="w-4 h-4 ml-1" />
            استمع لأول 10
          </Button>
        </div>
      )}
    </div>
  )
}
