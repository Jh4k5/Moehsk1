'use client'
import { useState, useMemo } from 'react'
import { VISUAL_DICT_CATEGORIES, type VisualDictCategory, type VisualDictWord } from '@/data/visualDict'
import { speak } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search, Volume2, Grid, BookOpen,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════
// CATEGORY COLOR PALETTE
// ═══════════════════════════════════════════════════════════
const CATEGORY_COLORS: Record<string, { bg: string; border: string; badge: string; accent: string; cardBg: string }> = {
  numbers: { bg: 'from-violet-500 to-purple-600', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', accent: 'text-violet-600', cardBg: 'from-violet-50 to-purple-50/50' },
  food: { bg: 'from-orange-500 to-red-500', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', accent: 'text-orange-600', cardBg: 'from-orange-50 to-red-50/50' },
  family: { bg: 'from-pink-500 to-rose-500', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700', accent: 'text-pink-600', cardBg: 'from-pink-50 to-rose-50/50' },
  places: { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', accent: 'text-emerald-600', cardBg: 'from-emerald-50 to-teal-50/50' },
  transport: { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', accent: 'text-blue-600', cardBg: 'from-blue-50 to-cyan-50/50' },
  weather: { bg: 'from-sky-500 to-blue-400', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', accent: 'text-sky-600', cardBg: 'from-sky-50 to-blue-50/50' },
  emotions: { bg: 'from-amber-500 to-yellow-500', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', accent: 'text-amber-600', cardBg: 'from-amber-50 to-yellow-50/50' },
  time: { bg: 'from-indigo-500 to-violet-500', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', accent: 'text-indigo-600', cardBg: 'from-indigo-50 to-violet-50/50' },
}

const DEFAULT_COLOR = { bg: 'from-gray-500 to-gray-600', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', accent: 'text-gray-600', cardBg: 'from-gray-50 to-gray-50/50' }

// ═══════════════════════════════════════════════════════════
// WORD CARD COMPONENT
// ═══════════════════════════════════════════════════════════
function WordCard({ word, colorKey, index }: { word: VisualDictWord; colorKey: string; index: number }) {
  const colors = CATEGORY_COLORS[colorKey] || DEFAULT_COLOR

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <Card
        className={"border-0 shadow-sm cursor-pointer hover:shadow-md transition-all group " + colors.border}
        onClick={() => speak(word.hanzi)}
      >
        <CardContent className={"p-4 bg-gradient-to-br " + colors.cardBg}>
          <div className="text-center space-y-2">
            <div className="text-4xl group-hover:scale-110 transition-transform duration-200">{word.emoji}</div>
            <div className="font-chinese-serif text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              {word.hanzi}
            </div>
            <div className="font-chinese-sans text-sm text-gray-500">{word.pinyin}</div>
            <div className="text-sm font-medium text-gray-700">{word.arabic}</div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                speak(word.hanzi)
              }}
              className="mt-1 mx-auto w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <Volume2 className={"w-3.5 h-3.5 " + colors.accent} />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// VISUAL DICT SECTION
// ═══════════════════════════════════════════════════════════
export function VisualDictSection() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Total word count
  const totalWords = VISUAL_DICT_CATEGORIES.reduce((sum, cat) => sum + cat.words.length, 0)

  // Filter words
  const filteredWords = useMemo(() => {
    const categories = selectedCategory === 'all'
      ? VISUAL_DICT_CATEGORIES
      : VISUAL_DICT_CATEGORIES.filter(c => c.key === selectedCategory)

    const result: Array<{ word: VisualDictWord; categoryKey: string }> = []
    categories.forEach(cat => {
      cat.words.forEach(word => {
        const matchSearch = !searchQuery ||
          word.hanzi.includes(searchQuery) ||
          word.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.arabic.includes(searchQuery)
        if (matchSearch) {
          result.push({ word, categoryKey: cat.key })
        }
      })
    })
    return result
  }, [selectedCategory, searchQuery])

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">القاموس البصري</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full mt-1" />
          </div>
        </div>
        <Badge variant="secondary">{totalWords} كلمة</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث بالصينية، البينيين، أو العربية..."
          className="pr-10"
        />
      </div>

      {/* Category Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={"flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all border " +
            (selectedCategory === 'all'
              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300')}
        >
          <Grid className="w-3.5 h-3.5 inline-block ml-1" />
          الكل ({totalWords})
        </button>
        {VISUAL_DICT_CATEGORIES.map(cat => {
          const colors = CATEGORY_COLORS[cat.key] || DEFAULT_COLOR
          const isActive = selectedCategory === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={"flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all border " +
                (isActive
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300')}
            >
              <span className="ml-1">{cat.icon}</span>
              {cat.label} ({cat.words.length})
            </button>
          )
        })}
      </div>

      {/* Category info banner */}
      {selectedCategory !== 'all' && (
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
        >
          <div className="text-3xl">{VISUAL_DICT_CATEGORIES.find(c => c.key === selectedCategory)?.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-gray-900">
              {VISUAL_DICT_CATEGORIES.find(c => c.key === selectedCategory)?.label}
            </div>
            <div className="text-xs text-gray-500">
              {filteredWords.length} كلمة • اضغط على أي كلمة لسماع النطق
            </div>
          </div>
        </motion.div>
      )}

      {/* Search results info */}
      {searchQuery && (
        <div className="text-xs text-gray-500 text-center">
          {filteredWords.length} نتيجة لـ "{searchQuery}"
        </div>
      )}

      {/* Word Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredWords.map((item, i) => (
            <WordCard
              key={item.word.hanzi + item.word.pinyin}
              word={item.word}
              colorKey={item.categoryKey}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredWords.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">لم يتم العثور على كلمات مطابقة</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
            className="text-xs text-teal-600 hover:underline mt-2"
          >
            عرض جميع الكلمات
          </button>
        </div>
      )}
    </div>
  )
}
