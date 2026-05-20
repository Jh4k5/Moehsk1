'use client'
import React, { useState, useMemo } from 'react'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { categories } from '@/data/content'
import { useLearningStore } from '@/lib/store'
import { speak } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BookOpen, Volume2, ChevronLeft, ChevronRight, Star, Check,
  Search, BookmarkPlus, Zap
} from 'lucide-react'

export default function VocabularySection({ filteredVocab, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }: {
  filteredVocab: VocabWord[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
}) {
  const store = useLearningStore()
  const [showPinyin, setShowPinyin] = useState(true)
  const [vocabTab, setVocabTab] = useState<'cards' | 'list' | 'favorites'>('cards')
  const word = filteredVocab[store.flashcardIndex]
  const bookmarkedCount = store.bookmarkedWords.length
  const bookmarkedVocab = useMemo(() => {
    return vocabulary.filter(w => store.bookmarkedWords.includes(w.id))
  }, [store.bookmarkedWords])
  // Build sentence list for the word
  const wordSentences = useMemo(() => {
    if (!word) return []
    const sents: { zh: string; pinyin: string; ar: string }[] = [
      { zh: word.exZh, pinyin: word.exPinyin, ar: word.exEn },
    ]
    if (word.s2) sents.push({ zh: word.s2.zh, pinyin: word.s2.py, ar: word.s2.ar })
    if (word.s3) sents.push({ zh: word.s3.zh, pinyin: word.s3.py, ar: word.s3.ar })
    return sents.filter(s => s.zh)
  }, [word])
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-600" />
            المفردات
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
        <Badge variant="secondary">{filteredVocab.length} كلمة</Badge>
      </div>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ابحث بالصينية أو البنيني أو العربية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Pinyin Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowPinyin(!showPinyin)}
          className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (showPinyin ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500')}
        >
          {showPinyin ? '\uD83D\uDD24 إخفاء البيني' : '\uD83D\uDD24 إظهار البيني'}
        </button>
      </div>
      {/* Tab navigation: Cards / Favorites / List */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {([
          { key: 'cards' as const, label: 'البطاقات' },
          { key: 'favorites' as const, label: '\u2B50 المفضلة (' + bookmarkedCount + ')' },
          { key: 'list' as const, label: 'القائمة' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setVocabTab(tab.key)}
            className={"flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all " + (vocabTab === tab.key ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Favorites Tab */}
      {vocabTab === 'favorites' && (
        <div className="space-y-3">
          {bookmarkedVocab.length === 0 ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <BookmarkPlus className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 text-center">لا توجد كلمات في المفضلة بعد<br />اضغط على أيقونة الإشارة المرجعية \u2B50 لحفظ كلمة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-2">
              {bookmarkedVocab.map(w => (
                <button
                  key={w.id}
                  onClick={() => { store.setFlashcardIndex(filteredVocab.findIndex(v => v.id === w.id)); setVocabTab('cards') }}
                  className={"w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all hover:bg-gray-50 border " + (store.isLearned(w.id) ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100')}
                >
                  <span className="font-chinese-serif text-xl w-20 text-gray-900">{w.zh}</span>
                  <span className="text-xs text-gray-500 font-chinese-sans w-28">{w.pinyin}</span>
                  <span className="text-sm text-gray-700 flex-1">{w.meaning}</span>
                  {store.isLearned(w.id) && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); store.toggleBookmark(w.id) }}
                    className="flex-shrink-0"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Flashcard (Cards Tab) */}
      {vocabTab === 'cards' && word && (
        <div className="space-y-4">
          <div className="perspective-1000 w-full">
            <div className={`relative w-full min-h-[260px] sm:min-h-[300px] cursor-pointer transition-transform duration-500 preserve-3d ${store.isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => store.flip()}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white via-red-50/30 to-white rounded-2xl flashcard-enhanced flex flex-col items-center justify-center p-6 gap-4">
                <div className="absolute top-3 right-3 flex gap-1">
                  <Badge variant="outline" className="text-xs font-chinese-sans bg-white/80">{word.pos}</Badge>
                  {word.lesson && <Badge variant="outline" className="text-xs bg-white/80">L{word.lesson}</Badge>}
                </div>
                <div className="font-chinese-serif text-6xl sm:text-7xl text-gray-900 mb-1 drop-shadow-sm" onClick={(e) => { e.stopPropagation(); speak(word.zh) }}>
                  {word.zh}
                </div>
                <div className="font-chinese-sans text-xl text-gray-500" onClick={(e) => { e.stopPropagation(); speak(word.pinyin) }}>
                  {showPinyin !== false && word.pinyin}
                </div>
                <p className="text-sm text-gray-400 mt-1">اضغط للنطق • مسافة أو انقر للقلب</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-white via-amber-50/30 to-white rounded-2xl flashcard-enhanced flex flex-col items-center justify-center p-5 overflow-y-auto custom-scrollbar">
                <div className="text-center mb-3">
                  <div className="font-chinese-serif text-4xl font-bold text-gray-900 mb-1">{word.zh}</div>
                  <div className="font-chinese-sans text-base text-gray-500">{word.pinyin}</div>
                  <div className="text-lg font-bold text-red-600 mt-1">{word.meaning}</div>
                </div>
                {word.mnemonic && (
                  <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3 text-center">
                    <span className="text-xs font-medium text-blue-600">💡 {word.mnemonic}</span>
                  </div>
                )}
                <div className="w-full space-y-2">
                  <div className="text-xs font-medium text-gray-500 text-center">📝 أمثلة:</div>
                  {wordSentences.slice(0, 3).map((s, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); speak(s.zh) }}
                      className="w-full text-right bg-white/60 hover:bg-white rounded-lg px-3 py-2 transition-colors group">
                      <div className="font-chinese-sans text-sm text-gray-800 group-hover:text-red-600 transition-colors">{s.zh}</div>
                      <div className="font-chinese-sans text-xs text-gray-400">{s.pinyin}</div>
                      <div className="text-xs text-gray-500">{s.ar}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.setFlashcardIndex(store.flashcardIndex - 1)}
              disabled={store.flashcardIndex === 0}
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={store.isLearned(word.id) ? 'default' : 'outline'}
                onClick={() => { store.toggleLearned(word.id); store.incrementStreak() }}
                className={store.isLearned(word.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {store.isLearned(word.id) ? <><Check className="w-4 h-4 ml-1" /> تم الحفظ</> : <><Star className="w-4 h-4 ml-1" /> حفظ</>}
              </Button>
              <Button
                size="sm"
                variant={store.isBookmarked(word.id) ? 'default' : 'ghost'}
                onClick={() => store.toggleBookmark(word.id)}
                className={store.isBookmarked(word.id) ? 'bg-amber-500 hover:bg-amber-600 animate-bookmark-pop' : 'text-gray-400 hover:text-amber-500'}
              >
                <BookmarkPlus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => speak(word.zh)}>
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.setFlashcardIndex(store.flashcardIndex + 1)}
              disabled={store.flashcardIndex >= filteredVocab.length - 1}
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center text-sm text-gray-500">
            {store.flashcardIndex + 1} / {filteredVocab.length}
          </div>
          {/* Character Decomposition / Radicals */}
          {word && word.radicals && word.radicals.length > 0 && (
            <Card className="j-card border-0 shadow-sm bg-gradient-to-l from-purple-50 to-indigo-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">تحليل الحروف والجذور</span>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  {word.zh.split('').map((char, i) => {
                    const vocabMatch = vocabulary.find(v => v.zh === char)
                    return (
                      <div key={i} className="text-center group">
                        <button
                          onClick={() => speak(char)}
                          className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-100 
                            flex items-center justify-center mb-1 group-hover:shadow-md group-hover:border-purple-300 transition-all cursor-pointer"
                        >
                          <span className="font-chinese-serif text-3xl text-purple-800">{char}</span>
                        </button>
                        {vocabMatch && (
                          <div className="text-[10px] text-gray-500">{vocabMatch.meaning}</div>
                        )}
                        {word.radicals[i] && word.radicals[i] !== char && (
                          <div className="text-[9px] text-purple-400 mt-0.5"> Radical: {word.radicals[i]}</div>
                        )}
                        {word.strokeCount && i === 0 && (
                          <div className="text-[9px] text-gray-400 mt-0.5">{word.strokeCount} strokes</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* Word List (List Tab) */}
      {vocabTab === 'list' && (
      <Card className="j-card border-0 shadow-sm">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-1 p-2">
          {filteredVocab.map((w) => (
            <button
              key={w.id}
              onClick={() => { store.setFlashcardIndex(filteredVocab.findIndex(v => v.id === w.id)); setVocabTab('cards') }}
              className={"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors hover:bg-gray-50 pr-5 " + (store.isLearned(w.id) ? 'word-learned-indicator' : 'word-unlearned-indicator')}
            >
              <span className="font-chinese-serif text-lg w-20 text-gray-900">{w.zh}</span>
              <span className="text-xs text-gray-500 font-chinese-sans w-28">{w.pinyin}</span>
              <span className="text-sm text-gray-700 flex-1">{w.meaning}</span>
              {store.isBookmarked(w.id) && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
              {store.isLearned(w.id) && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </Card>
      )}
    </div>
  )
}
