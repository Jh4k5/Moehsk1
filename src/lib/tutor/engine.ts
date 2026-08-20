// ─── محرك المعلم الذكي: فهم النية + توليد الرد من بيانات المنصة ─────────────
import { vocabulary as vocabulary1, type VocabWord } from '@/data/vocabulary'
import { grammarPracticeQuestions as grammarPractice1 } from '@/data/grammarPracticeQuestions'
import { grammarRules as grammarRules1 } from '@/data/grammar'
import { categories } from '@/data/categories'
import { getTutorIndex, segmentHanzi } from './index'
import { normalizeArabic, stripPinyinTones, extractHanzi, contentTokens, tokenize } from './normalize'

// المستوى النشط: تُضبط في بداية answerMessage من ctx (آمنة لأن المعالجة متزامنة)
let _level = 1
let _lang: 'ar' | 'en' = 'ar'
let _vocab: VocabWord[] = vocabulary1
let _grammarRules: any[] = grammarRules1
let _grammarPractice: Record<number, { zh: string; options: string[]; correct: number }[]> = grammarPractice1

/** اختيار نص حسب اللغة النشطة للمعلم */
const L = (ar: string, en: string) => (_lang === 'en' ? en : ar)
/** معنى الكلمة حسب اللغة (إنجليزي في وضع EN) */
const M = (w: VocabWord) => (_lang === 'en' && w.english ? w.english : w.meaning)

export interface TutorQuiz {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface TutorContext {
  learnedWordIds: number[]
  weakWords: VocabWord[]
  dueCount: number
  masteredCount: number
  dailyStreak: number
  dailyGoal: number
  pendingQuiz: TutorQuiz | null
  level?: number
  lang?: 'ar' | 'en'
  vocabulary?: VocabWord[]
  grammarRules?: any[]
  grammarPractice?: Record<number, { zh: string; options: string[]; correct: number }[]>
}

/**
 * لماذا عجز المحرك عن الإجابة — وهو المفتاح الذي يقرر إن كان السؤال يستحق
 * استدعاء النموذج اللغوي المدفوع أم لا.
 */
export type TutorGap =
  /** سؤال لم يُفهم أصلاً */
  | 'unknown-intent'
  /** طلب مقارنة، وأحد طرفيها على الأقل خارج بيانات المستوى */
  | 'comparison'
  /** سؤال «لماذا» لا تغطيه قاعدة نحوية مفهرسة */
  | 'why'
  /** نص صيني أو طلب ترجمة خارج معجم المستوى */
  | 'out-of-corpus'

export interface TutorReply {
  text: string
  followUps?: string[]
  quiz?: TutorQuiz | null // undefined = لا تغيير، null = مسح الاختبار المعلق
  /**
   * هل أجاب المحرك فعلاً؟ `false` تعني أن النص أعلاه اعتذار لا جواب، وأن
   * السؤال مرشّح للتصعيد إلى النموذج اللغوي عبر POST /api/tutor.
   * تُضبط تلقائياً في answerMessage: كل مسار لم يعلن ثغرة يُعدّ مُجيباً.
   */
  resolved?: boolean
  gap?: TutorGap
}

/** مسار عاجز: نصّه يُعرض كما هو متى تعذّر النموذج، وسببه يقرر التصعيد. */
function gap(g: TutorGap, reply: TutorReply): TutorReply {
  return { ...reply, resolved: false, gap: g }
}

const TONE_NAMES = ['محايدة', 'الأولى (ـ مسطحة عالية)', 'الثانية (↗ صاعدة)', 'الثالثة (∨ هابطة صاعدة)', 'الرابعة (↘ حادة هابطة)']
const TONE_NAMES_EN = ['neutral', '1st (ˉ high flat)', '2nd (↗ rising)', '3rd (∨ dip-rising)', '4th (↘ sharp falling)']

function posLabel(pos: string): string {
  const c = categories.find((c) => c.value === pos)
  if (!c) return pos
  return (_lang === 'en' && (c as any).labelEn) ? (c as any).labelEn : c.label
}

function toneLine(w: VocabWord): string {
  if (!w.tones?.length) return ''
  const names = _lang === 'en' ? TONE_NAMES_EN : TONE_NAMES
  const parts = w.tones.map((t) => names[t] || `${t}`)
  return `🎵 ${L('النبرات', 'Tones')}: ${parts.join(L(' ثم ', ' then '))}`
}

function wordCard(w: VocabWord, ctx: TutorContext): string {
  const lines: string[] = []
  lines.push(`📚 **${w.zh}** (${w.pinyin}) — ${M(w)}`)
  lines.push(`🏷️ ${posLabel(w.pos)} • ${w.strokeCount} ${L('ضربة', 'strokes')}${w.radicals?.length ? ` • ${L('الجذور', 'radicals')}: ${w.radicals.join(' ')}` : ''}`)
  const tl = toneLine(w)
  if (tl) lines.push(tl)
  if (w.mnemonic && _lang !== 'en') lines.push(`🧠 للحفظ: ${w.mnemonic}`)
  const examples = (w.sentences || []).slice(0, 2)
  if (examples.length) {
    lines.push('')
    lines.push(L('📝 أمثلة:', '📝 Examples:'))
    for (const s of examples) {
      lines.push(`• ${s.zh}`)
      lines.push(`  ${s.pinyin}${/[ء-ي]/.test(s.ar) && _lang !== 'en' ? ` — ${s.ar}` : ''}`)
    }
  }
  if (ctx.learnedWordIds.includes(w.id)) {
    lines.push('')
    lines.push(L('✅ هذه الكلمة ضمن كلماتك المتعلمة — أحسنت!', '✅ This word is in your learned list — great!'))
  } else {
    lines.push('')
    lines.push(L('💡 أضفها لقائمتك من قسم المفردات لتدخل جدول مراجعاتك.', '💡 Add it from the Vocabulary section to enter your review schedule.'))
  }
  return lines.join('\n')
}

function findWords(message: string): VocabWord[] {
  const index = getTutorIndex(_level, _vocab, _grammarRules)
  const results: VocabWord[] = []

  // 1) هانزي مباشر
  for (const run of extractHanzi(message)) {
    for (const w of segmentHanzi(run, index)) {
      if (!results.includes(w)) results.push(w)
    }
  }
  if (results.length) return results

  // 2) بينيين (بدون نبرات): "nihao" أو "ni hao"
  const latin = message.match(/[a-zA-Zàáǎāèéěēìíǐīòóǒōùúǔūǖǘǚǜü\s]+/g)?.join(' ') || ''
  if (latin.trim()) {
    const folded = stripPinyinTones(latin).replace(/\s+/g, '')
    const byPinyin = index.pinyinMap.get(folded)
    if (byPinyin) return [...byPinyin]
    const eng = index.englishMap.get(latin.trim().toLowerCase())
    if (eng) return [eng]
  }

  // 3) عربي: رموز دلالية ضد فهرس المعاني
  for (const token of contentTokens(message)) {
    const hits = index.arabicIndex.get(token)
    if (hits) {
      for (const w of hits) if (!results.includes(w)) results.push(w)
    }
  }
  return results
}

function makeWordQuiz(ctx: TutorContext): TutorQuiz {
  const pool = ctx.weakWords.length
    ? ctx.weakWords
    : _vocab.filter((w) => !ctx.learnedWordIds.includes(w.id))
  const target = (pool.length ? pool : _vocab)[Math.floor(Math.random() * (pool.length ? pool.length : _vocab.length))]
  const distractors = _vocab
    .filter((w) => w.id !== target.id && w.pos === target.pos)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  while (distractors.length < 3) {
    const r = _vocab[Math.floor(Math.random() * _vocab.length)]
    if (r.id !== target.id && !distractors.includes(r)) distractors.push(r)
  }
  const options = [target, ...distractors].sort(() => Math.random() - 0.5)
  return {
    question: L(`ما معنى 「${target.zh}」 (${target.pinyin})؟`, `What does 「${target.zh}」 (${target.pinyin}) mean?`),
    options: options.map((w) => M(w).split('/')[0].trim()),
    correctIndex: options.indexOf(target),
    explanation: L(`${target.zh} (${target.pinyin}) تعني: ${target.meaning}`, `${target.zh} (${target.pinyin}) means: ${target.english || target.meaning}`),
  }
}

function parseQuizAnswer(message: string, quiz: TutorQuiz): number | null {
  const m = normalizeArabic(message)
  const num = m.match(/^[\s]*([1-4١-٤])[\s.)]*$/)
  if (num) {
    const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '١': 0, '٢': 1, '٣': 2, '٤': 3 }
    return map[num[1]]
  }
  const letters: Record<string, number> = { 'ا': 0, 'أ': 0, 'ب': 1, 'ج': 2, 'د': 3, a: 0, b: 1, c: 2, d: 3 }
  if (m.length === 1 && m in letters) return letters[m]
  const idx = quiz.options.findIndex((o) => normalizeArabic(o) === m || normalizeArabic(o).includes(m))
  return idx >= 0 && m.length > 1 ? idx : null
}

function formatQuiz(q: TutorQuiz): string {
  const letters = ['1', '2', '3', '4']
  return `🎯 ${q.question}\n\n${q.options.map((o, i) => `${letters[i]}. ${o}`).join('\n')}\n\n${L('أجب برقم الخيار (1-4)', 'Answer with the option number (1-4)')}`
}

/** أفضل قاعدة نحوية تطابق الرسالة، أو null. يستعملها مسار القواعد ومسار «لماذا». */
function findGrammarRule(message: string, index: ReturnType<typeof getTutorIndex>) {
  const msgTokens = new Set(tokenize(message))
  const msgHanzi = new Set(extractHanzi(message).join('').split(''))
  let best: { score: number; entry: (typeof index.grammarKeywords)[0] } | null = null
  for (const gk of index.grammarKeywords) {
    let score = 0
    for (const kw of gk.keywords) if (msgTokens.has(kw)) score += 2
    for (const p of gk.particles) if (msgHanzi.has(p)) score += 3
    if (score > 0 && (!best || score > best.score)) best = { score, entry: gk }
  }
  return best
}

/** بطاقة قاعدة كاملة + سؤال تدريبي إن وُجد له تمرين مفهرس. */
function grammarCard(rule: any): { text: string; quiz: TutorQuiz | null } {
  const lines = [`📐 **${rule.titleAr}**`, '', rule.description, `🔧 النمط: ${rule.pattern}`, '', '📝 أمثلة:']
  for (const ex of rule.examples.slice(0, 2)) {
    lines.push(`• ${ex.zh}`)
    lines.push(`  ${ex.pinyin} — ${ex.ar}`)
  }
  if (rule.tips) lines.push('', `💡 ${rule.tips}`)
  const practice = _grammarPractice[rule.id]
  let quiz: TutorQuiz | null = null
  if (practice?.length) {
    const p = practice[Math.floor(Math.random() * practice.length)]
    quiz = {
      question: p.zh,
      options: p.options,
      correctIndex: p.correct,
      explanation: `القاعدة: ${rule.titleAr} — ${rule.pattern}`,
    }
    lines.push('', '🎯 سؤال تدريبي:', formatQuiz(quiz))
  }
  return { text: lines.join('\n'), quiz }
}

const GRAMMAR_TRIGGERS = ['قاعده', 'قواعد', 'نحو', 'grammar', 'تركيب', 'صيغه', 'rule', 'explain']
const TONE_TRIGGERS = ['نطق', 'انطق', 'نبره', 'نبرات', 'تون', 'tone', 'بينيين', 'pinyin', 'صوت', 'pronounce', 'pronunciation', 'say']
const QUIZ_TRIGGERS = ['اختبر', 'اختبار', 'كويز', 'quiz', 'امتحن', 'سؤال لي', 'اسالني', 'اسئلني', 'test me']
const ADVICE_TRIGGERS = ['اراجع', 'مراجعه', 'نصيحه', 'نصائح', 'خطه', 'تقدمي', 'اذاكر', 'ادرس', 'مستواي', 'review', 'advice', 'plan', 'progress', 'study']
const EXAMPLE_TRIGGERS = ['مثال', 'امثله', 'جمله', 'جمل', 'example', 'sentence']
const NUMBER_TRIGGERS = ['رقم', 'ارقام', 'اعداد', 'عد ', 'الاعداد', 'number', 'count']
const COMPARE_TRIGGERS = ['الفرق', 'فرق بين', 'مقارنه', 'ايهما', 'متي استخدم', 'difference', 'vs', 'versus', 'compare']
const WHY_TRIGGERS = ['لماذا', 'ليش', 'لم نستخدم', 'why', 'سبب']
const WRITE_TRIGGERS = ['اكتب', 'كتابه', 'ضربات', 'ضربه', 'رسم الحرف', 'ترتيب الضربات', 'stroke', 'write', 'radical', 'جذر', 'جذور']

function matchTriggers(normalized: string, triggers: string[]): boolean {
  return triggers.some((t) => normalized.includes(t))
}

/**
 * الطبقة الأولى: جواب مجاني مبني على بيانات المنصة نفسها.
 *
 * كل مسار يُرجع نصاً هو جواب فعلي، إلا ما مرّ عبر gap() — فذاك اعتذار يحمل سبب
 * العجز، وهو وحده ما يستحق استدعاء النموذج المدفوع.
 */
export function answerMessage(raw: string, ctx: TutorContext): TutorReply {
  const reply = runRules(raw, ctx)
  // من لم يعلن ثغرة فقد أجاب. gap() تكتب resolved:false فوق هذه القيمة.
  return { resolved: true, ...reply }
}

function runRules(raw: string, ctx: TutorContext): TutorReply {
  // ضبط بيانات المستوى النشط لهذه المعالجة
  _level = ctx.level ?? 1
  _lang = ctx.lang ?? 'ar'
  _vocab = ctx.vocabulary ?? vocabulary1
  _grammarRules = ctx.grammarRules ?? grammarRules1
  _grammarPractice = ctx.grammarPractice ?? grammarPractice1

  const message = raw.trim()
  const normalized = normalizeArabic(message)
  const index = getTutorIndex(_level, _vocab, _grammarRules)

  // ── 0) إجابة اختبار معلّق ──────────────────────────────────────────────
  if (ctx.pendingQuiz) {
    const answer = parseQuizAnswer(message, ctx.pendingQuiz)
    if (answer !== null) {
      const correct = answer === ctx.pendingQuiz.correctIndex
      const text = correct
        ? L(`🎉 صحيح! أحسنت!\n\n${ctx.pendingQuiz.explanation}`, `🎉 Correct! Well done!\n\n${ctx.pendingQuiz.explanation}`)
        : L(`❌ ليست الإجابة الصحيحة. الجواب: **${ctx.pendingQuiz.options[ctx.pendingQuiz.correctIndex]}**\n\n${ctx.pendingQuiz.explanation}`, `❌ Not correct. The answer is: **${ctx.pendingQuiz.options[ctx.pendingQuiz.correctIndex]}**\n\n${ctx.pendingQuiz.explanation}`)
      return { text, quiz: null, followUps: [L('اختبرني مرة أخرى', 'Quiz me again'), L('ماذا أراجع اليوم؟', 'What should I review today?')] }
    }
    // ليست إجابة → يكمل التحليل الطبيعي مع مسح الاختبار
  }

  // ── 0.1) مقارنة بين طرفين ─────────────────────────────────────────────
  // «ما الفرق بين 的 و 得؟» — المنصة تملك بطاقة كل طرف، فتُبنى المقارنة منها
  // مجاناً. إن لم يُعرف طرفان فالسؤال خارج المعجم ويستحق النموذج.
  if (matchTriggers(normalized, COMPARE_TRIGGERS)) {
    const sides = findWords(message)
    if (sides.length >= 2) {
      const [a, b] = sides
      const lines = [
        `⚖️ الفرق بين **${a.zh}** و **${b.zh}**:`,
        '',
        `• **${a.zh}** (${a.pinyin}) — ${M(a)} • ${posLabel(a.pos)}`,
        a.sentences?.[0] ? `  مثال: ${a.sentences[0].zh} — ${a.sentences[0].ar}` : '',
        '',
        `• **${b.zh}** (${b.pinyin}) — ${M(b)} • ${posLabel(b.pos)}`,
        b.sentences?.[0] ? `  مثال: ${b.sentences[0].zh} — ${b.sentences[0].ar}` : '',
        '',
        a.pos === b.pos
          ? `🔎 كلاهما ${posLabel(a.pos)}، فالفرق في المعنى والاستعمال — قارن المثالين أعلاه.`
          : `🔎 الأول ${posLabel(a.pos)} والثاني ${posLabel(b.pos)}، فموقعهما في الجملة مختلف.`,
      ].filter(Boolean)
      return { text: lines.join('\n'), followUps: [`أمثلة على ${a.zh}`, `أمثلة على ${b.zh}`], quiz: null }
    }
    const known = sides.length === 1 ? `عرفت **${sides[0].zh}** وحدها من سؤالك، ` : ''
    return gap('comparison', {
      text: `⚖️ ${known}ولا أملك الطرف الآخر في بيانات هذا المستوى، فلا أبني لك مقارنة دقيقة بنفسي.`,
      followUps: sides.length === 1 ? [`اشرح ${sides[0].zh}`] : ['اشرح قاعدة 的', 'اختبرني'],
      quiz: null,
    })
  }

  // ── 0.2) كتابة الحرف: الضربات والجذور ─────────────────────────────────
  if (matchTriggers(normalized, WRITE_TRIGGERS)) {
    const words = findWords(message)
    if (words.length) {
      const w = words[0]
      const lines = [
        `✍️ كتابة **${w.zh}** (${w.pinyin} — ${M(w)}):`,
        `• عدد الضربات: ${w.strokeCount}`,
        w.radicals?.length ? `• الجذور: ${w.radicals.join(' + ')}` : '',
        w.mnemonic ? `🧠 للتذكر: ${w.mnemonic}` : '',
        '',
        '💡 افتح قسم «الحروف» وتتبّع ترتيب الضربات بإصبعك — الترتيب جزء من الحفظ لا زينة.',
      ].filter(Boolean)
      return { text: lines.join('\n'), followUps: [`أمثلة على ${w.zh}`, `كيف أنطق ${w.zh}؟`], quiz: null }
    }
  }

  // ── 0.3) «لماذا»: قاعدة إن وُجدت، وإلا فهو تعليل يحتاج النموذج ─────────
  if (matchTriggers(normalized, WHY_TRIGGERS)) {
    const best = findGrammarRule(message, index)
    if (best) {
      const card = grammarCard(best.entry.rule)
      return { text: card.text, quiz: card.quiz, followUps: card.quiz ? undefined : ['اختبرني', 'اشرح قاعدة أخرى'] }
    }
    return gap('why', {
      text: 'سؤالك سؤال تعليل («لماذا»)، ولا أجد قاعدة مفهرسة في هذا المستوى تغطيه.',
      followUps: ['اشرح قاعدة النفي', 'اختبرني'],
      quiz: null,
    })
  }

  // ── 1) طلب اختبار ─────────────────────────────────────────────────────
  if (matchTriggers(normalized, QUIZ_TRIGGERS)) {
    const quiz = makeWordQuiz(ctx)
    return { text: formatQuiz(quiz), quiz }
  }

  // ── 2) نطق / نبرات ────────────────────────────────────────────────────
  if (matchTriggers(normalized, TONE_TRIGGERS)) {
    const words = findWords(message)
    if (words.length) {
      const w = words[0]
      const lines = [
        `🎵 نطق **${w.zh}**: ${w.pinyin}`,
        toneLine(w),
        '',
        `📝 جرّبها في جملة: ${w.sentences?.[0]?.zh || w.exZh}`,
        `   ${w.sentences?.[0]?.pinyin || w.exPinyin}`,
        '',
        '💡 اضغط زر الصوت 🔊 في قسم المفردات لسماع النطق، وتدرّب في قسم النطق!',
      ].filter(Boolean)
      return { text: lines.join('\n'), followUps: [`اختبرني`, `أمثلة على ${w.zh}`], quiz: null }
    }
    return {
      text: '🎵 النبرات الأربع هي روح الصينية:\n\n1️⃣ الأولى (ā): مسطحة عالية — 妈 mā (أم)\n2️⃣ الثانية (á): صاعدة كسؤال — 麻 má\n3️⃣ الثالثة (ǎ): تهبط ثم تصعد — 马 mǎ (حصان)\n4️⃣ الرابعة (à): حادة هابطة كأمر — 骂 mà\n\n⚡ قاعدتان مهمتان:\n• 不 bù تصبح bú قبل النبرة الرابعة: 不是 bú shì\n• نبرتان ثالثتان متتاليتان: الأولى تصبح ثانية — 你好 ní hǎo\n\n💡 تدرّب في قسم "النطق" وقسم "البينيين"!',
      followUps: ['كيف أنطق 谢谢؟', 'اختبرني'],
      quiz: null,
    }
  }

  // ── 3) قاعدة نحوية ────────────────────────────────────────────────────
  if (matchTriggers(normalized, GRAMMAR_TRIGGERS) || (extractHanzi(message).join('').length === 1 && '的吗呢吧了和比太不没'.includes(extractHanzi(message).join('')))) {
    const best = findGrammarRule(message, index)
    if (best) {
      const card = grammarCard(best.entry.rule)
      return { text: card.text, quiz: card.quiz, followUps: card.quiz ? undefined : ['اختبرني', 'اشرح قاعدة أخرى'] }
    }
    return {
      text: '📐 أهم قواعد HSK 1:\n\n• ترتيب الجملة: فاعل + فعل + مفعول — 我吃饭\n• 是 للهوية: 我是学生 (أنا طالب)\n• 有 للملكية: 我有一本书 — نفيها بـ 没有 فقط\n• 不 لنفي الحاضر، 没 لنفي الماضي\n• 吗 تحوّل أي جملة لسؤال: 你好吗？\n• 的 للملكية والوصف: 我的书 (كتابي)\n\nاسألني عن أي قاعدة بالتحديد، مثل: "اشرح قاعدة 吗"',
      followUps: ['اشرح قاعدة 的', 'اشرح قاعدة النفي', 'اختبرني'],
      quiz: null,
    }
  }

  // ── 4) أمثلة وجمل ─────────────────────────────────────────────────────
  if (matchTriggers(normalized, EXAMPLE_TRIGGERS)) {
    const words = findWords(message)
    if (words.length) {
      const w = words[0]
      const related = index.sentences.filter((s) => s.zh.includes(w.zh)).slice(0, 3)
      const pool = related.length ? related : (w.sentences || []).map((s) => ({ ...s, wordZh: w.zh }))
      const lines = [`📝 جمل تستخدم **${w.zh}** (${w.pinyin} — ${w.meaning}):`, '']
      for (const s of pool.slice(0, 3)) {
        lines.push(`• ${s.zh}`)
        lines.push(`  ${s.pinyin}${/[ء-ي]/.test(s.ar) ? ` — ${s.ar}` : ''}`)
      }
      return { text: lines.join('\n'), followUps: [`اختبرني`, `كيف أنطق ${w.zh}؟`], quiz: null }
    }
  }

  // ── 5) بحث كلمة (هانزي / بينيين / عربي) ───────────────────────────────
  const words = findWords(message)
  if (words.length) {
    if (words.length === 1) {
      const w = words[0]
      return { text: wordCard(w, ctx), followUps: [`أمثلة على ${w.zh}`, `كيف أنطق ${w.zh}؟`, 'اختبرني'], quiz: null }
    }
    const hanziRun = extractHanzi(message).join('')
    if (hanziRun.length >= 2 && words.length >= 2) {
      // جملة/عبارة صينية: فكّكها كلمة كلمة
      const lines = ['🔍 تحليل العبارة كلمة كلمة:', '']
      for (const w of words.slice(0, 6)) {
        lines.push(`• **${w.zh}** (${w.pinyin}) — ${w.meaning}`)
      }
      // كم من حروف الجملة غطّاه المعجم فعلاً؟ تفكيكٌ ناقص ليس ترجمة، ومن يطلب
      // ترجمة جملة كاملة لا يكفيه أن نعرف نصفها.
      const covered = Math.min(
        words.reduce((n, w) => n + (message.includes(w.zh) ? w.zh.length : 0), 0),
        hanziRun.length,
      )
      const coverage = covered / hanziRun.length
      const wantsFullMeaning = /(ترجم|بالعربي|معني الجمله|translate)/.test(normalized)
      if (coverage < 0.7 || (wantsFullMeaning && coverage < 1)) {
        lines.push('', `⚠️ لم يغطِّ معجم هذا المستوى إلا ${Math.round(coverage * 100)}٪ من حروف الجملة، فلا أضمن ترجمتها كاملة.`)
        return gap('out-of-corpus', {
          text: lines.join('\n'),
          followUps: words.slice(0, 2).map((w) => `اشرح ${w.zh}`),
          quiz: null,
        })
      }
      lines.push('', 'اسألني عن أي كلمة منها لشرح أوسع!')
      return { text: lines.join('\n'), followUps: words.slice(0, 2).map((w) => `اشرح ${w.zh}`), quiz: null }
    }
    // عدة نتائج عربية محتملة
    const lines = ['وجدت أكثر من كلمة مناسبة:', '']
    for (const w of words.slice(0, 4)) {
      lines.push(`• **${w.zh}** (${w.pinyin}) — ${w.meaning}`)
    }
    lines.push('', 'اكتب الكلمة الصينية التي تريد شرحها بالتفصيل.')
    return { text: lines.join('\n'), followUps: words.slice(0, 2).map((w) => `اشرح ${w.zh}`), quiz: null }
  }

  // ── 6) نصيحة دراسية مبنية على تقدم المستخدم ───────────────────────────
  if (matchTriggers(normalized, ADVICE_TRIGGERS)) {
    const learned = ctx.learnedWordIds.length
    const total = _vocab.length
    const pct = Math.round((learned / total) * 100)
    const lines = [
      `📊 تقدمك الحالي:`,
      `• تعلمت ${learned} من ${total} كلمة (${pct}%)`,
      `• سلسلة الأيام: ${ctx.dailyStreak} 🔥`,
      ctx.dueCount ? `• لديك ${ctx.dueCount} كلمة مستحقة للمراجعة اليوم!` : `• لا مراجعات مستحقة اليوم — ممتاز!`,
      '',
    ]
    if (ctx.weakWords.length) {
      lines.push('⚠️ كلماتك الأضعف — ركّز عليها:')
      for (const w of ctx.weakWords.slice(0, 5)) {
        lines.push(`• ${w.zh} (${w.pinyin}) — ${w.meaning}`)
      }
      lines.push('')
    }
    lines.push(`🎯 خطة اليوم المقترحة:`)
    lines.push(`1. راجع الكلمات المستحقة في قسم المفردات`)
    lines.push(`2. تعلّم ${ctx.dailyGoal || 10} كلمات جديدة (هدفك اليومي)`)
    lines.push(`3. أنجز درساً من قسم الدروس أو اقرأ قصة قصيرة`)
    return { text: lines.join('\n'), followUps: ['اختبرني بكلماتي الضعيفة', 'اشرح قاعدة جديدة'], quiz: null }
  }

  // ── 7) أرقام ──────────────────────────────────────────────────────────
  if (matchTriggers(normalized, NUMBER_TRIGGERS)) {
    return {
      text: '🔢 الأرقام الصينية:\n\n一 yī (1) • 二 èr (2) • 三 sān (3) • 四 sì (4) • 五 wǔ (5)\n六 liù (6) • 七 qī (7) • 八 bā (8) • 九 jiǔ (9) • 十 shí (10)\n\n💡 التركيب منطقي جداً:\n• 11 = 十一 (عشرة وواحد)\n• 25 = 二十五 (اثنان عشرة خمسة)\n• 100 = 一百 yìbǎi\n• مع المعدودات استخدم 两 liǎng بدل 二: 两个人 (شخصان)',
      followUps: ['اختبرني بالأرقام', 'ما معنى 几؟'],
      quiz: null,
    }
  }

  // ── 8) تحية / شكر ─────────────────────────────────────────────────────
  if (/(مرحب|سلام|اهل|هلا|صباح|مساء|هاي|你好|hello|hi|hey)/.test(normalized)) {
    return {
      text: L(
        `你好！👋 أنا معلمك الشخصي (老师 lǎoshī).\n\nيمكنني:\n• شرح أي كلمة — اكتبها بالصيني أو البينيين أو العربي\n• شرح قواعد HSK مع أمثلة وتمارين\n• اختبارك بأسئلة مبنية على نقاط ضعفك\n• اقتراح خطة مراجعة من تقدمك الفعلي\n\nجرّب: "ما معنى 你好؟" أو "اختبرني"! 😊`,
        `你好！👋 I'm your personal tutor (老师 lǎoshī).\n\nI can:\n• Explain any word — type it in Chinese, pinyin, or English\n• Explain HSK grammar with examples and exercises\n• Quiz you based on your weak points\n• Suggest a review plan from your real progress\n\nTry: "what does 你好 mean?" or "quiz me"! 😊`),
      followUps: [L('ما معنى 谢谢؟', 'What does 谢谢 mean?'), L('اختبرني', 'Quiz me'), L('ماذا أراجع اليوم؟', 'What should I review today?')],
      quiz: null,
    }
  }
  if (/(شكر|ممتاز|رائع|جميل|thank|thanks|great|nice)/.test(normalized)) {
    return {
      text: L('不客气 (bú kèqi) — على الرحب والسعة! 😊\n\n加油 (jiāyóu) — واصل التقدم! أنا هنا متى احتجتني.',
        '不客气 (bú kèqi) — you\'re welcome! 😊\n\n加油 (jiāyóu) — keep it up! I\'m here whenever you need me.'),
      followUps: [L('اختبرني', 'Quiz me'), L('ماذا أراجع اليوم؟', 'What should I review today?')],
      quiz: null,
    }
  }
  if (/(صعب|مستحيل|تعبت|مليت|احبطت)/.test(normalized)) {
    return {
      text: `💪 طبيعي أن تشعر بذلك — الصينية تحتاج صبراً، لكن انظر:\n\n• سلسلتك ${ctx.dailyStreak} يوم 🔥 — هذا التزام حقيقي\n• تعلمت ${ctx.learnedWordIds.length} كلمة حتى الآن\n• تحتاج ~150 حرفاً فقط لفهم نصف النصوص اليومية!\n\nنصيحتي: قلّل الجرعة ولا توقفها — ٥ كلمات يومياً أفضل من ٥٠ مرة في الأسبوع.\n\n加油！`,
      followUps: ['ماذا أراجع اليوم؟', 'اختبرني بشيء سهل'],
      quiz: null,
    }
  }

  // ── 9) عجز المحرك ─────────────────────────────────────────────────────
  // النص نفسه لم يتغير — يُعرض كما هو متى تعذّر النموذج — لكنه صار يحمل سبب
  // العجز، فتقرر POST /api/tutor التصعيد عن علم لا عن تخمين.
  const wantsTranslation = /(ترجم|بالصيني|بالعربي|translate)/.test(normalized)
  const outOfCorpus = extractHanzi(message).length > 0 || wantsTranslation
  return gap(outOfCorpus ? 'out-of-corpus' : 'unknown-intent', {
    text: L(
      `لم أفهم سؤالك تماماً 🤔 — لكن يمكنني مساعدتك في:\n\n📚 **شرح الكلمات**: اكتب أي كلمة بالصيني (你好) أو البينيين (nihao) أو العربي (مرحبا)\n📐 **القواعد**: "اشرح قاعدة 吗" أو "قاعدة النفي"\n🎯 **اختبار**: "اختبرني" — أسئلة مبنية على كلماتك الضعيفة\n📊 **خطة مراجعة**: "ماذا أراجع اليوم؟"`,
      `I didn't quite get that 🤔 — but I can help with:\n\n📚 **Word meanings**: type any word in Chinese (你好), pinyin (nihao), or English\n📐 **Grammar**: "explain the 吗 rule" or "negation rule"\n🎯 **Quiz**: "quiz me" — questions based on your weak words\n📊 **Review plan**: "what should I review today?"`),
    followUps: [L('ما معنى 你好؟', 'What does 你好 mean?'), L('اختبرني', 'Quiz me'), L('ماذا أراجع اليوم؟', 'What should I review today?')],
    quiz: null,
  })
}

/**
 * ما تعرفه المنصة عن رسالة بعينها: كلماتها المعجمية والقاعدة المطابقة.
 *
 * تستعملها طبقة النموذج لتغذية السؤال بحقائق المنهج (النطق، المعنى، نمط
 * القاعدة) حتى لا يخترع النموذج نبرة أو معنى يخالف ما يدرسه الطالب في القسم
 * الآخر من المنصة.
 */
export function collectGrounding(
  raw: string,
  ctx: Pick<TutorContext, 'level' | 'lang' | 'vocabulary' | 'grammarRules' | 'grammarPractice'>,
): { words: VocabWord[]; rule: any | null } {
  _level = ctx.level ?? 1
  _lang = ctx.lang ?? 'ar'
  _vocab = ctx.vocabulary ?? vocabulary1
  _grammarRules = ctx.grammarRules ?? grammarRules1
  _grammarPractice = ctx.grammarPractice ?? grammarPractice1

  const message = raw.trim()
  const index = getTutorIndex(_level, _vocab, _grammarRules)
  const best = findGrammarRule(message, index)
  return { words: findWords(message).slice(0, 5), rule: best ? best.entry.rule : null }
}
