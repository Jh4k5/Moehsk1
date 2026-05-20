'use client'
import React from 'react'
import { speak } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, Volume2, Lightbulb, Brain } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// PRONUNCIATION GUIDE SECTION
// ═══════════════════════════════════════════════════════════
export function PronunciationSection() {
  const toneData = [
    { tone: 1, label: 'النبرة الأولى', labelZh: '第一声', pinyin: 'mā', char: '妈', meaning: 'أم', description: 'مسطحة عالية - high flat', barClass: 'tone-bar-flat', color: 'from-red-500 to-red-600', emoji: '\u2500' },
    { tone: 2, label: 'النبرة الثانية', labelZh: '第二声', pinyin: 'má', char: '麻', meaning: 'قنب', description: 'صاعدة - rising', barClass: 'tone-bar-rising', color: 'from-orange-500 to-amber-600', emoji: '\u2197' },
    { tone: 3, label: 'النبرة الثالثة', labelZh: '第三声', pinyin: 'mǎ', char: '马', meaning: 'حصان', description: 'هابطة ثم صاعدة - dipping', barClass: 'tone-bar-dipping', color: 'from-emerald-500 to-green-600', emoji: '\u2198\u2197' },
    { tone: 4, label: 'النبرة الرابعة', labelZh: '第四声', pinyin: 'mà', char: '骂', meaning: 'يشتم', description: 'حادة هابطة - falling', barClass: 'tone-bar-falling', color: 'from-blue-500 to-indigo-600', emoji: '\u2198' },
  ]
  const toneRules = [
    { rule: '\u4E0D + \u7B2C\u56DB\u58F0 = \u7B2C\u4E8C\u58F0', example: 'b\u00FA sh\u00EC', exampleZh: '\u4E0D\u662F', meaning: 'ليس' },
    { rule: '\u4E00 + \u7B2C\u56DB\u58F0 = \u7B2C\u4E8C\u58F0', example: 'y\u00ED g\u00E8', exampleZh: '\u4E00\u4E2A', meaning: 'واحد' },
    { rule: '\u4E0D/\u4E00 + \u5176\u4ED6\u4E3A \u7B2C\u56DB\u58F0', example: 'b\u00F9 h\u01CEo', exampleZh: '\u4E0D\u597D', meaning: 'ليس جيداً' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Music className="w-6 h-6 text-red-600" />
            دليل النطق والنبرات
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
          <p className="text-gray-500 mt-1 text-sm">تعرّف على النبرات الأربع للغة الصينية مع أمثلة صوتية</p>
        </div>
      </div>
      {/* Tone Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">\uD83C\uDFB5 النبرات الأربع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {toneData.map(t => (
              <div key={t.tone} className="tone-guide-card rounded-xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={"w-10 h-10 rounded-full bg-gradient-to-br " + t.color + " flex items-center justify-center text-white font-bold text-lg shadow-lg"}>
                      {t.tone}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.label}</div>
                      <div className="text-xs text-gray-500">{t.labelZh}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => speak(t.pinyin)}
                    className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <Volume2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
                {/* Visual tone bar */}
                <div className={"tone-bar " + t.barClass} />
                {/* Character and meaning */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-chinese-serif text-2xl text-gray-900">{t.char}</span>
                    <span className="text-sm text-gray-600 font-chinese-sans">{t.pinyin}</span>
                  </div>
                  <span className="text-sm text-gray-600">{t.meaning}</span>
                </div>
                <div className="text-xs text-gray-400 text-center">{t.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Tone Rules */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            قواعد تغيير النبرات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {toneRules.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{r.rule}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-chinese-serif text-gray-800">{r.exampleZh}</span>
                    <span className="text-xs text-gray-500 font-chinese-sans">{r.example}</span>
                    <span className="text-xs text-gray-400">({r.meaning})</span>
                    <button
                      onClick={() => speak(r.exampleZh)}
                      className="mr-auto flex-shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Tone Practice with ma syllable */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            تدريب النبرات - مقارنة ma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {toneData.map(t => (
              <button
                key={t.tone}
                onClick={() => speak(t.pinyin)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                <span className="font-chinese-serif text-3xl">{t.char}</span>
                <span className="text-xs text-gray-500 font-chinese-sans">{t.pinyin}</span>
                <span className="text-[10px] text-gray-400">{t.meaning}</span>
                <Volume2 className="w-3.5 h-3.5 text-gray-400" />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">اضغط على أي حرف للاستماع - لاحظ الفرق بين النبرات الأربع</p>
        </CardContent>
      </Card>
    </div>
  )
}
