// ─── [2.1] The authored half of an explanation ──────────────────────────────
//
// An explanation card is assembled from two sources:
//
//   * `src/data/grammar*.ts` — already bilingual and already good. It holds the
//     title, the idea, the pattern and worked examples in Arabic AND English.
//     Nothing here duplicates any of it.
//   * this file — the two things grammar data has never carried: the mistakes
//     learners actually make, and one line to carry away.
//
// Keeping them apart matters. The grammar files are the curriculum and are
// edited as curriculum; this file is teaching commentary written for THIS
// audience — Arabic speakers — and most of its value is in errors that only an
// Arabic speaker makes. «أنا طالب» has no copula, so «我学生» is the mistake an
// Arabic speaker writes and an English speaker never does. A generic mistake
// list would have caught none of the seven below.
//
// EVERY entry is `needs_review` until the owner signs it off. That is the rule
// for anything the machine authored, and `scripts/check-content.js` counts what
// is still pending so the number is never a matter of memory.
//
// SCOPE: HSK1 lesson 1's seven rules — the model lesson. The pattern is
// deliberately proven on one lesson before it is spread over the other 47.

import type { CommonMistake } from '@/lib/curriculum/types'

export interface AuthoredExplanation {
  /** Grammar rule this commentary belongs to. */
  grammarId: number
  /** Level, so a lookup never crosses levels by accident. */
  level: 1 | 2 | 3
  mistakes: CommonMistake[]
  /** One line the learner should leave with. */
  summaryAr: string
  summaryEn: string
  status: 'authored' | 'needs_review'
}

export const AUTHORED_EXPLANATIONS: readonly AuthoredExplanation[] = [
  {
    grammarId: 1,
    level: 1,
    summaryAr: 'الفاعل أولاً دائماً. الصينية لا تعرف «أكلَ الولدُ».',
    summaryEn: 'The subject always comes first. Chinese has no verb-first sentence.',
    status: 'needs_review',
    mistakes: [
      {
        wrongZh: '吃我饭。',
        rightZh: '我吃饭。',
        whyAr: 'العربية تجيز تقديم الفعل «أكلَ الولدُ التفاحة»، والصينية لا تجيزه إطلاقاً. تقديم الفعل هنا لا يجعل الجملة ركيكة بل غير مفهومة.',
        whyEn: 'Arabic allows a verb-first sentence; Chinese never does. Fronting the verb does not sound odd — it stops meaning anything.',
      },
      {
        wrongZh: '我饭吃。',
        rightZh: '我吃饭。',
        whyAr: 'المفعول بعد الفعل لا قبله. هذا الترتيب مألوف لمتعلّمي اليابانية، وهو خطأ في الصينية.',
        whyEn: 'The object follows the verb, never precedes it. That order belongs to Japanese, not Chinese.',
      },
    ],
  },
  {
    grammarId: 2,
    level: 1,
    summaryAr: '是 للأسماء فقط. مع الصفات لا تستعمل 是 بل 很.',
    summaryEn: '是 links nouns only. With an adjective use 很, not 是.',
    status: 'needs_review',
    mistakes: [
      {
        wrongZh: '我学生。',
        rightZh: '我是学生。',
        whyAr: 'الجملة الاسمية في العربية بلا فعل: «أنا طالب». الصينية تلزمك بـ是 بين الاسمين، فحذفها خطأ شائع جداً عند الناطق بالعربية.',
        whyEn: 'Arabic nominal sentences have no verb — «I student» is correct Arabic. Chinese requires 是 between the two nouns, and dropping it is the most common Arabic-speaker error here.',
      },
      {
        wrongZh: '我是很好。',
        rightZh: '我很好。',
        whyAr: 'العكس تماماً: مع الصفة لا تُستعمل 是 أبداً. الصفة في الصينية تعمل عمل الفعل بنفسها، و很 هي ما يسبقها.',
        whyEn: 'The mirror error: 是 is never used before an adjective. A Chinese adjective already behaves like a verb, and 很 is what precedes it.',
      },
    ],
  },
  {
    grammarId: 5,
    level: 1,
    summaryAr: '吗 تحوّل الخبر إلى سؤال دون تغيير أي كلمة أخرى — ولا تجتمع مع كلمة استفهام.',
    summaryEn: '吗 turns a statement into a question without moving anything else — and never joins a question word.',
    status: 'needs_review',
    mistakes: [
      {
        wrongZh: '你叫什么名字吗？',
        rightZh: '你叫什么名字？',
        whyAr: 'الجملة فيها 什么 وهي كلمة استفهام، فالسؤال قائم بها. إضافة 吗 فوقها تكرار لا تقبله الصينية.',
        whyEn: 'The sentence already asks, through 什么. Adding 吗 on top is a double question, which Chinese does not allow.',
      },
      {
        wrongZh: '你是学生？',
        rightZh: '你是学生吗？',
        whyAr: 'رفع الصوت في آخر الجملة يكفي في العربية والإنجليزية، ولا يكفي في الصينية: النبرات محجوزة للمعنى، فالسؤال يحتاج أداة مكتوبة.',
        whyEn: 'Rising intonation is enough in Arabic and English. It is not enough in Chinese, where pitch already carries word meaning — the question needs a written particle.',
      },
    ],
  },
  {
    grammarId: 7,
    level: 1,
    summaryAr: 'كلمة الاستفهام تبقى مكان الجواب — لا تُقدَّم إلى أول الجملة.',
    summaryEn: 'The question word stays where the answer would go — it is never moved to the front.',
    status: 'needs_review',
    mistakes: [
      {
        wrongZh: '什么你叫？',
        rightZh: '你叫什么？',
        whyAr: 'في العربية والإنجليزية تُقدَّم أداة الاستفهام. في الصينية تجلس في موضع الجواب تماماً: «你叫___» فتضع 什么 مكان الفراغ.',
        whyEn: 'Arabic and English move the question word to the front. Chinese leaves it exactly where the answer belongs: «你叫___», and 什么 fills the blank.',
      },
      {
        wrongZh: '哪里你去？',
        rightZh: '你去哪里？',
        whyAr: 'القاعدة نفسها مع المكان: ترتيب الجملة لا يتغيّر بين الخبر والسؤال.',
        whyEn: 'Same rule for place: the word order of a question is identical to the statement.',
      },
    ],
  },
  {
    grammarId: 11,
    level: 1,
    summaryAr: '们 للعاقل فقط، و的 تُحذف مع الأهل والأقارب.',
    summaryEn: '们 is for people only, and 的 drops with family.',
    status: 'needs_review',
    mistakes: [
      {
        wrongZh: '书们',
        rightZh: '书',
        whyAr: '们 لاحقة جمع للعاقل وحده. الأشياء لا تُجمع بها إطلاقاً، والعدد يُفهم من السياق أو من عدد صريح.',
        whyEn: '们 pluralises people only. Objects never take it; number comes from context or from an explicit numeral.',
      },
      {
        wrongZh: '我的妈妈',
        rightZh: '我妈妈',
        whyAr: 'ليست خطأً نحوياً لكنها غير طبيعية: مع الأهل والأصدقاء المقرّبين تُحذف 的 عادةً. قولها يشبه «الأم التي أملكها».',
        whyEn: 'Not ungrammatical, but unnatural: 的 is normally dropped with family and close friends. Keeping it reads like «the mother I possess».',
      },
    ],
  },
  {
    grammarId: 15,
    level: 1,
    summaryAr: '也 قبل الفعل دائماً — لا في آخر الجملة كما في العربية.',
    summaryEn: '也 always sits before the verb — never at the end, the way «too» does in English.',
    status: 'needs_review',
    mistakes: [
      {
        wrongZh: '我是学生也。',
        rightZh: '我也是学生。',
        whyAr: '«أنا طالب أيضاً» تضع «أيضاً» في الآخر، والصينية تضع 也 قبل الفعل مباشرة. هذا الترتيب هو الخطأ الأول عند النقل الحرفي من العربية.',
        whyEn: 'English and Arabic put «too» at the end; Chinese puts 也 immediately before the verb. Translating the position literally is the first mistake learners make here.',
      },
      {
        wrongZh: '也我是学生。',
        rightZh: '我也是学生。',
        whyAr: '也 تتبع الفاعل ولا تسبقه. موضعها بين الفاعل والفعل، لا في رأس الجملة.',
        whyEn: '也 follows the subject, never precedes it. Its place is between subject and verb.',
      },
    ],
  },
  {
    grammarId: 24,
    level: 1,
    summaryAr: 'النبرة جزء من الكلمة لا زينة عليها — تغييرها يغيّر المعنى.',
    summaryEn: 'A tone is part of the word, not decoration on it — change the tone and you change the word.',
    status: 'needs_review',
    mistakes: [
      {
        wrongZh: 'nǐ hǎo',
        rightZh: 'ní hǎo',
        whyAr: 'نبرتان ثالثتان متتاليتان: الأولى تُنطق ثانيةً. تُكتب nǐ hǎo وتُنطق ní hǎo — وهذه أول قاعدة تحوّل يقابلها المتعلّم.',
        whyEn: 'Two third tones in a row: the first is pronounced as a second. Written nǐ hǎo, said ní hǎo — the first tone-change rule a learner meets.',
      },
      {
        wrongZh: 'māma',
        rightZh: 'māma',
        whyAr: 'المقطع الثاني بلا نبرة (نبرة خفيفة) وليس بالنبرة الأولى. إعطاء كل مقطع نبرة كاملة يجعل الكلام آلياً ومتعباً للسامع.',
        whyEn: 'The second syllable is neutral, not first tone. Giving every syllable a full tone is what makes a learner sound mechanical.',
      },
    ],
  },
] as const

export const EXPLANATION_BY_GRAMMAR: ReadonlyMap<string, AuthoredExplanation> = new Map(
  AUTHORED_EXPLANATIONS.map((e) => [`${e.level}:${e.grammarId}`, e]),
)

/** How many authored explanations are still waiting for the owner's review. */
export const PENDING_REVIEW_COUNT = AUTHORED_EXPLANATIONS
  .filter((e) => e.status === 'needs_review').length
