// ─── Tutor knowledge index built from the platform's own data ───────────────
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { grammarRules, type GrammarRule } from '@/data/grammar'
import { normalizeArabic, stripPinyinTones } from './normalize'

export interface TutorSentence {
  zh: string
  pinyin: string
  ar: string
  wordZh: string
}

export interface TutorIndex {
  hanziMap: Map<string, VocabWord>
  maxHanziLen: number
  pinyinMap: Map<string, VocabWord[]>
  arabicIndex: Map<string, VocabWord[]>
  englishMap: Map<string, VocabWord>
  grammarKeywords: { rule: GrammarRule; keywords: Set<string>; particles: Set<string> }[]
  sentences: TutorSentence[]
}

let cached: TutorIndex | null = null

export function getTutorIndex(): TutorIndex {
  if (cached) return cached

  const hanziMap = new Map<string, VocabWord>()
  const pinyinMap = new Map<string, VocabWord[]>()
  const arabicIndex = new Map<string, VocabWord[]>()
  const englishMap = new Map<string, VocabWord>()
  const sentences: TutorSentence[] = []
  const seenSentence = new Set<string>()
  let maxHanziLen = 1

  for (const w of vocabulary) {
    hanziMap.set(w.zh, w)
    maxHanziLen = Math.max(maxHanziLen, w.zh.length)

    const py = stripPinyinTones(w.pinyin).replace(/\s+/g, '')
    const list = pinyinMap.get(py) || []
    list.push(w)
    pinyinMap.set(py, list)

    for (const part of w.meaning.split('/')) {
      const token = normalizeArabic(part)
      if (!token) continue
      const arr = arabicIndex.get(token) || []
      arr.push(w)
      arabicIndex.set(token, arr)
      // فهرسة الكلمة الأولى من المعنى المركّب أيضاً ("كتاب مدرسي" → "كتاب")
      const first = token.split(/\s+/)[0]
      if (first && first !== token && first.length > 1) {
        const a2 = arabicIndex.get(first) || []
        if (!a2.includes(w)) a2.push(w)
        arabicIndex.set(first, a2)
      }
    }

    if (w.english) englishMap.set(w.english.toLowerCase(), w)

    for (const s of w.sentences || []) {
      if (!seenSentence.has(s.zh)) {
        seenSentence.add(s.zh)
        sentences.push({ zh: s.zh, pinyin: s.pinyin, ar: s.ar, wordZh: w.zh })
      }
    }
  }

  // كلمات مفتاحية لكل قاعدة: من العنوان العربي + محارف الأدوات في العنوان/النمط
  const grammarKeywords = grammarRules.map((rule) => {
    const keywords = new Set<string>()
    for (const t of normalizeArabic(rule.titleAr).split(/[\s:،+—-]+/)) {
      if (t.length > 2) keywords.add(t)
    }
    const particles = new Set<string>()
    for (const ch of (rule.title + rule.titleAr + rule.pattern).match(/[一-鿿]/g) || []) {
      particles.add(ch)
    }
    return { rule, keywords, particles }
  })

  cached = { hanziMap, maxHanziLen, pinyinMap, arabicIndex, englishMap, grammarKeywords, sentences }
  return cached
}

/** تقطيع مقطع هانزي إلى كلمات معجمية بأسلوب أطول-تطابق أولاً */
export function segmentHanzi(run: string, index: TutorIndex): VocabWord[] {
  const found: VocabWord[] = []
  let i = 0
  while (i < run.length) {
    let matched = false
    for (let len = Math.min(index.maxHanziLen, run.length - i); len >= 1; len--) {
      const slice = run.slice(i, i + len)
      const word = index.hanziMap.get(slice)
      if (word) {
        if (!found.includes(word)) found.push(word)
        i += len
        matched = true
        break
      }
    }
    if (!matched) i++
  }
  return found
}
