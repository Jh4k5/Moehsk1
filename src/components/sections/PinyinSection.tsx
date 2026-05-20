'use client'
import React, { useState } from 'react'
import { tones as pinyinTones, initials, finals, specialSounds, toneSandhiRules, commonCombinations } from '@/data/pinyin'
import { speak } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { GraduationCap, Volume2, Play, Info, Zap, Shuffle, ArrowUpDown } from 'lucide-react'

export default function PinyinSection() {
  const [activeTab, setActiveTab] = useState('tones')

  const totalCount = pinyinTones.length + initials.length + finals.length + specialSounds.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-red-600" />
            البينين
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{totalCount} عنصر</Badge>
        </div>
      </div>

      <p className="text-gray-500 text-sm">
        نظام الكتابة الصوتية للغة الصينية — تعلّم الحروف والنبرات والتركيبات
      </p>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="w-full">
        <div className="max-h-12 overflow-x-auto custom-scrollbar pb-1">
          <TabsList className="flex-row-reverse w-full h-auto bg-gray-100 p-1 rounded-xl gap-1 flex-nowrap">
            <TabsTrigger value="tones" className="text-xs flex-shrink-0">
              النبرات
              <Badge variant="secondary" className="mr-1 text-[10px] px-1.5 py-0">{pinyinTones.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="initials" className="text-xs flex-shrink-0">
              الحروف الأولية
              <Badge variant="secondary" className="mr-1 text-[10px] px-1.5 py-0">{initials.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="finals" className="text-xs flex-shrink-0">
              الحروف النهائية
              <Badge variant="secondary" className="mr-1 text-[10px] px-1.5 py-0">{finals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="special" className="text-xs flex-shrink-0">
              الأصوات الخاصة
              <Badge variant="secondary" className="mr-1 text-[10px] px-1.5 py-0">{specialSounds.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sandhi" className="text-xs flex-shrink-0">
              قواعد النبرة
              <Badge variant="secondary" className="mr-1 text-[10px] px-1.5 py-0">{toneSandhiRules.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="combinations" className="text-xs flex-shrink-0">
              التركيبات
              <Badge variant="secondary" className="mr-1 text-[10px] px-1.5 py-0">{commonCombinations.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab 1: Tones ── */}
        <TabsContent value="tones">
          <div className="space-y-3">
            <div className="bg-gradient-to-l from-red-50 to-amber-50/50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">ما هي النبرات؟</span>
              </div>
              <p className="text-sm text-gray-600">
                اللغة الصينية بها 4 نبرات أساسية + نبرة محايدة. نفس المقطع الصوتي يكتسب معانٍ مختلفة حسب النبرة.
              </p>
            </div>

            <div className="grid gap-4">
              {pinyinTones.map((t) => (
                <Card key={t.tone} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* SVG Tone Curve */}
                      <div className="flex-shrink-0 w-16 h-14 bg-gradient-to-br from-red-50 to-amber-50 rounded-xl flex flex-col items-center justify-center border border-red-100">
                        <svg width="60" height="30" viewBox="0 0 80 60" className="mb-1">
                          <path
                            d={t.svgPath}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="text-red-600"
                          />
                        </svg>
                        <span className="text-lg font-bold text-red-600">{t.symbol}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">{t.nameAr}</span>
                          <Badge variant="outline" className="text-[10px]">{t.name}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{t.descriptionAr}</p>
                      </div>

                      {/* Example + Audio */}
                      <button
                        onClick={() => speak(t.example)}
                        className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-br from-red-50 to-amber-50 border border-red-100 hover:from-red-100 hover:to-amber-100 transition-colors cursor-pointer group"
                      >
                        <span className="font-chinese-serif text-3xl text-gray-900 group-hover:text-red-600 transition-colors">
                          {t.example}
                        </span>
                        <span className="text-xs text-gray-500 font-chinese-sans">{t.examplePinyin}</span>
                        <span className="text-[10px] text-gray-400">{t.exampleAr}</span>
                        <Volume2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Initials ── */}
        <TabsContent value="initials">
          <div className="space-y-3">
            <div className="bg-gradient-to-l from-blue-50 to-cyan-50/50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">الحروف الأولية (声母)</span>
              </div>
              <p className="text-sm text-gray-600">
                الحروف الأولية هي الأصوات التي تبدأ بها المقاطع الصينية. يوجد 21+ حرفاً أولياً.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {initials.map((init) => (
                <Card
                  key={init.char}
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => speak(init.example)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <span className="text-xl font-bold text-red-700 font-chinese-sans">{init.char}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">{init.ipa}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); speak(init.example) }}
                      className="font-chinese-serif text-2xl text-gray-900 hover:text-red-600 transition-colors"
                    >
                      {init.example}
                    </button>
                    <div className="text-xs text-gray-500 font-chinese-sans mt-0.5">{init.examplePinyin}</div>
                    <div className="text-sm font-medium text-gray-700 mt-1">{init.exampleAr}</div>
                    {init.similarToArabic && (
                      <div className="mt-2 bg-amber-50 rounded-lg px-2 py-1">
                        <span className="text-[10px] text-amber-700">مشابه: {init.similarToArabic}</span>
                      </div>
                    )}
                    {init.note && (
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{init.note}</p>
                    )}
                    <Volume2 className="w-3.5 h-3.5 text-red-400 mx-auto mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Finals ── */}
        <TabsContent value="finals">
          <div className="space-y-3">
            <div className="bg-gradient-to-l from-green-50 to-emerald-50/50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">الحروف النهائية (韵母)</span>
              </div>
              <p className="text-sm text-gray-600">
                الحروف النهائية هي الأصوات التي تنتهي بها المقاطع الصينية. يوجد أكثر من 35 حرفاً نهائياً.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {finals.map((f) => (
                <Card
                  key={f.char}
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => speak(f.example)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <span className="text-xl font-bold text-emerald-700 font-chinese-sans">{f.char}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">{f.ipa}</div>

                    {/* Tone Variants */}
                    <div className="flex flex-wrap gap-1 justify-center mb-2">
                      <span className="text-[10px] font-chinese-sans bg-gray-100 rounded px-1 py-0.5 text-gray-600">{f.toneVariants.tone1}</span>
                      <span className="text-[10px] font-chinese-sans bg-gray-100 rounded px-1 py-0.5 text-gray-600">{f.toneVariants.tone2}</span>
                      <span className="text-[10px] font-chinese-sans bg-gray-100 rounded px-1 py-0.5 text-gray-600">{f.toneVariants.tone3}</span>
                      <span className="text-[10px] font-chinese-sans bg-gray-100 rounded px-1 py-0.5 text-gray-600">{f.toneVariants.tone4}</span>
                      {f.toneVariants.tone0 !== f.toneVariants.tone1 && (
                        <span className="text-[10px] font-chinese-sans bg-gray-100 rounded px-1 py-0.5 text-gray-400">{f.toneVariants.tone0}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); speak(f.example) }}
                      className="font-chinese-serif text-2xl text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                      {f.example}
                    </button>
                    <div className="text-xs text-gray-500 font-chinese-sans mt-0.5">{f.examplePinyin}</div>
                    <div className="text-sm font-medium text-gray-700 mt-1">{f.exampleAr}</div>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400 mx-auto mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Special Sounds ── */}
        <TabsContent value="special">
          <div className="space-y-3">
            <div className="bg-gradient-to-l from-amber-50 to-orange-50/50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">أصوات لا وجود لها في العربية</span>
              </div>
              <p className="text-sm text-gray-600">
                هذه الأصوات تحتاج تدريباً خاصاً لأنها لا توجد في اللغة العربية. ركّز على الاستماع والتقليد.
              </p>
            </div>

            <div className="grid gap-3">
              {specialSounds.map((s) => (
                <Card key={s.chinese} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Sound Character */}
                      <button
                        onClick={() => speak(s.chinese)}
                        className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border border-amber-200 hover:from-amber-200 hover:to-orange-200 transition-colors cursor-pointer group"
                      >
                        <span className="text-2xl font-bold text-amber-800 font-chinese-sans">{s.chinese}</span>
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900">{s.chinese}</span>
                          <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                            {s.arabic}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{s.description}</p>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg px-3 py-2 border border-amber-100">
                          <span className="text-sm font-medium text-amber-800 font-chinese-sans">{s.practice}</span>
                        </div>
                      </div>

                      {/* Play Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speak(s.practice)}
                        className="flex-shrink-0 border-amber-200 hover:bg-amber-50 text-amber-700"
                      >
                        <Play className="w-3.5 h-3.5 ml-1" />
                        استمع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Tone Sandhi Rules ── */}
        <TabsContent value="sandhi">
          <div className="space-y-3">
            <div className="bg-gradient-to-l from-purple-50 to-violet-50/50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpDown className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">قواعد تغيير النبرة (声调变化)</span>
              </div>
              <p className="text-sm text-gray-600">
                بعض الأحرف تتغير نبرتها حسب الحرف الذي يأتي بعدها. هذه القواعد مهمة جداً للنطق الصحيح.
              </p>
            </div>

            <div className="grid gap-4">
              {toneSandhiRules.map((rule, ri) => (
                <Card key={ri} className="border-0 shadow-sm">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {ri + 1}
                      </div>
                      {rule.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                    <div className="space-y-2">
                      {rule.rules.map((r, rri) => (
                        <div
                          key={rri}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-purple-50/50 transition-colors cursor-pointer"
                          onClick={() => speak(r.example)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-gray-500 bg-white rounded px-2 py-0.5 border">
                                {r.before}
                              </span>
                              <span className="text-xs text-purple-600 font-medium">{r.result}</span>
                            </div>
                            <div className="mt-1.5">
                              <button className="font-chinese-sans text-sm font-bold text-gray-900 hover:text-red-600 transition-colors">
                                {r.example}
                              </button>
                            </div>
                          </div>
                          <Volume2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 6: Common Combinations ── */}
        <TabsContent value="combinations">
          <div className="space-y-3">
            <div className="bg-gradient-to-l from-red-50 to-amber-50/50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Shuffle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">تركيبات شائعة</span>
              </div>
              <p className="text-sm text-gray-600">
                المقاطع الصينية تتكون من حرف أولي + حرف نهائي + نبرة. هذه أشهر التركيبات التي ستحتاجها.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonCombinations.map((c, ci) => (
                <Card
                  key={ci}
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => speak(c.char)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <span className="text-xs font-medium text-red-500 bg-red-50 rounded px-1.5 py-0.5 font-chinese-sans">{c.initial}</span>
                      <span className="text-gray-300">+</span>
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-50 rounded px-1.5 py-0.5 font-chinese-sans">{c.final}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); speak(c.char) }}
                      className="font-chinese-serif text-3xl text-gray-900 hover:text-red-600 transition-colors"
                    >
                      {c.char}
                    </button>
                    <div className="text-sm text-gray-500 font-chinese-sans mt-1">{c.pinyin}</div>
                    <div className="text-sm font-medium text-gray-700 mt-1">{c.meaning}</div>
                    <Volume2 className="w-3.5 h-3.5 text-red-400 mx-auto mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
