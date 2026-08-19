// ─── تمهيد المبتدئ — the beginner primer, "unit zero" ───────────────────────
//
// Before lesson one. For someone who has never seen a Chinese character and
// does not know what a tone is — which is the platform's whole audience, since
// it exists to teach Chinese to Arabic speakers from zero.
//
// The path used to drop that person straight into «你好», four tones and a
// stroke order they had never been told existed. The plan called this the free
// tier's front door, and it was missing entirely.
//
// Built on `src/data/pinyin.ts`: 711 lines with every initial and final
// compared to an Arabic sound, five tone explanations with their pitch curves,
// and the tone-sandhi rules. It had ZERO importers — the richest teaching
// material in the repository, written and then never shown to anyone.
//
// FREE, always, for everyone. It is what convinces a visitor the platform can
// teach them at all, and charging for that would be charging at the wrong end.

import { initials, finals, tones, specialSounds, toneSandhiRules, commonCombinations } from './pinyin'

export interface PrimerCard {
  /** A short Arabic heading. */
  title: string
  /** One or two sentences. Longer than that and it stops being read. */
  body: string
  /** Optional Chinese to show large. */
  hanzi?: string
  pinyin?: string
  gloss?: string
}

export interface PrimerCheck {
  question: string
  options: string[]
  correct: number
  /** Why — shown after answering, right or wrong. */
  because: string
}

export interface PrimerChapter {
  id: string
  title: string
  /** One line: what the reader will be able to do after it. */
  goal: string
  cards: PrimerCard[]
  checks: PrimerCheck[]
}

const tone = (n: number) => tones.find((t) => t.tone === n)!

export const PRIMER: PrimerChapter[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    id: 'what-is-chinese',
    title: 'ما هي الصينية؟',
    goal: 'تعرف لماذا لا يوجد «أبجدية» صينية، وما الذي تتعلّمه بدلاً منها.',
    cards: [
      {
        title: 'لا حروف أبجدية',
        body: 'العربية ٢٨ حرفاً تُركَّب منها كل الكلمات. الصينية ليست كذلك: لكل كلمة تقريباً رمزٌ خاصّ بها، والرمز يحمل معنىً لا صوتاً فقط.',
        hanzi: '人',
        pinyin: 'rén',
        gloss: 'إنسان',
      },
      {
        title: 'الرمز صورة اختُصرت',
        body: 'أقدم الرموز رسومٌ بُسِّطت عبر آلاف السنين. 人 كان رسماً لإنسان واقف بساقين، و山 لثلاث قمم جبل.',
        hanzi: '山',
        pinyin: 'shān',
        gloss: 'جبل',
      },
      {
        title: 'كم رمزاً تحتاج؟',
        body: 'للحياة اليومية نحو ٢٠٠٠ رمز، وHSK 1 يبدأ بـ١٥٠ منها فقط. لن تحفظ عشرات الآلاف — هذه خرافة تُخيف المبتدئين بلا سبب.',
      },
      {
        title: 'والنطق؟',
        body: 'لأن الرمز لا يقول نطقه، وُضع نظام «البينين» يكتب النطق بحروف لاتينية. ستقرأ البينين في كل درس تحت كل رمز.',
        hanzi: '好',
        pinyin: 'hǎo',
        gloss: 'جيّد',
      },
    ],
    checks: [
      {
        question: 'ما الفرق الأساسي بين الأبجدية العربية والكتابة الصينية؟',
        options: [
          'الرمز الصيني يحمل معنىً، لا صوتاً فقط',
          'الصينية تُكتب من اليمين لليسار',
          'الصينية حروفها أكثر من ٢٨ بقليل',
          'لا فرق يُذكر',
        ],
        correct: 0,
        because: 'الحرف العربي صوتٌ يُركَّب مع غيره؛ الرمز الصيني وحدةُ معنىً قائمة بذاتها.',
      },
      {
        question: 'ما هو «البينين»؟',
        options: [
          'كتابة نطق الرمز بحروف لاتينية',
          'أسلوب خطّ صيني قديم',
          'اسم امتحان اللغة',
          'ترتيب ضربات الرمز',
        ],
        correct: 0,
        because: 'الرمز لا يقول نطقه، فالبينين هو الجسر بينه وبين لسانك.',
      },
    ],
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    id: 'radicals',
    title: 'الرموز تُبنى من جذور',
    goal: 'تفكّ رمزاً إلى أجزائه بدل أن تحفظه صورةً صمّاء.',
    cards: [
      {
        title: 'الرمز ليس خربشة',
        body: 'كل رمز تقريباً مركَّب من أجزاء صغيرة تُسمّى الجذور، ولكل جذر معنىً. من عرف الجذور حفظ الرموز بنصف الجهد.',
      },
      {
        title: 'جذر يدلّ على المعنى',
        body: 'الجذر 氵 يعني «ماء». وكل رمز فيه له علاقة بالماء: 河 نهر، 海 بحر، 洗 يغسل.',
        hanzi: '河',
        pinyin: 'hé',
        gloss: 'نهر',
      },
      {
        title: 'وجذر يدلّ على النطق',
        body: 'كثير من الرموز نصفه يقول المعنى ونصفه يقول النطق تقريباً. 妈 = 女 (امرأة) + 马 (mǎ) — فهي أمّ، وتُنطق mā.',
        hanzi: '妈',
        pinyin: 'mā',
        gloss: 'أمّ',
      },
      {
        title: 'وترتيب الضربات ليس زينة',
        body: 'يُكتب الرمز بترتيب ثابت: من الأعلى للأسفل، ومن اليسار لليمين. الترتيب يجعل يدك تحفظ الرمز، لا عينك وحدها — ولذلك في كل وحدة لوح تتبّع.',
      },
    ],
    checks: [
      {
        question: 'رمز فيه الجذر 氵 — بمَ يتعلّق معناه غالباً؟',
        options: ['بالماء', 'بالنار', 'بالإنسان', 'بالعدد'],
        correct: 0,
        because: '氵 صورة مختصرة للماء 水، وتظهر في 河 و海 و洗.',
      },
      {
        question: 'لماذا يُكتب الرمز بترتيب ضربات ثابت؟',
        options: [
          'لأن الترتيب يجعل اليد تحفظ الرمز',
          'لأنه شرط في الامتحان فقط',
          'لأن الرمز يصير أجمل',
          'لا سبب — عادة قديمة',
        ],
        correct: 0,
        because: 'الكتابة بترتيبها ذاكرةٌ حركية، وهي أثبت من الحفظ البصري وحده.',
      },
    ],
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    id: 'tones',
    title: 'النبرات الأربع',
    goal: 'تسمع الفرق بين النبرات، وتعرف لماذا تغيّر المعنى تماماً.',
    cards: [
      {
        title: 'النبرة تغيّر المعنى',
        body: 'المقطع نفسه بنبرة مختلفة كلمةٌ مختلفة. mā أمّ، má قنّب، mǎ حصان، mà يشتم. النبرة ليست تنغيماً — هي جزء من الكلمة.',
        hanzi: '妈 麻 马 骂',
        pinyin: 'mā má mǎ mà',
      },
      ...[1, 2, 3, 4].map((n) => {
        const t = tone(n)
        return {
          title: t.nameAr,
          body: t.descriptionAr,
          hanzi: t.example,
          pinyin: t.examplePinyin,
          gloss: t.exampleAr,
        }
      }),
      {
        title: tone(0).nameAr,
        body: `${tone(0).descriptionAr} — تأتي على مقاطع خفيفة في آخر الكلمة.`,
        hanzi: tone(0).example,
        pinyin: tone(0).examplePinyin,
        gloss: tone(0).exampleAr,
      },
      {
        title: 'قاعدة تتكرّر كثيراً',
        body: toneSandhiRules[0]?.description
          ? `${toneSandhiRules[0].nameAr}: ${toneSandhiRules[0].description}`
          : 'بعض النبرات تتغيّر حسب ما بعدها — ستراها في الدروس.',
      },
    ],
    checks: [
      {
        question: 'ماذا تعني mǎ (النبرة الثالثة)؟',
        options: ['حصان', 'أمّ', 'يشتم', 'قنّب'],
        correct: 0,
        because: '马 mǎ حصان. النبرة الأولى mā أمّ، والرابعة mà يشتم — المقطع واحد والمعاني أربعة.',
      },
      {
        question: 'النبرة الثانية (á) كيف تُنطق؟',
        options: [
          'صاعدة، كأنك تسأل مستغرباً',
          'مستوية عالية وثابتة',
          'هابطة بحدّة',
          'قصيرة وخفيفة بلا اتجاه',
        ],
        correct: 0,
        because: tone(2).descriptionAr,
      },
      {
        question: 'هل يمكن تجاهل النبرات في البداية؟',
        options: [
          'لا — النبرة جزء من الكلمة، وتجاهلها يغيّر ما تقوله',
          'نعم، يفهمك الصينيون من السياق',
          'نعم، النبرات للمستويات المتقدّمة',
          'النبرات للكتابة لا للنطق',
        ],
        correct: 0,
        because: 'تجاهل النبرة كتجاهل حركة الحرف في العربية: «كَتَبَ» و«كُتِبَ» ليستا واحدة.',
      },
    ],
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    id: 'pinyin',
    title: 'البينين: كيف تقرأ النطق',
    goal: 'تقرأ أي بينين بصوت قريب من الصحيح، وتعرف الأصوات التي لا مقابل لها بالعربية.',
    cards: [
      {
        title: 'مقطعان في كل كلمة',
        body: 'كل مقطع بينين = بداية + نهاية. في bā: الـb بداية والـa نهاية. البدايات ٢٣ والنهايات ٣٦، وبها تُقرأ كل الكلمات.',
        hanzi: '八',
        pinyin: 'bā',
        gloss: 'ثمانية',
      },
      ...initials.slice(0, 3).map((i) => ({
        title: `البداية ${i.char}`,
        body: `${i.note}${i.similarToArabic ? ` — أقرب ما يكون إلى ${i.similarToArabic} بالعربية.` : ''}`,
        hanzi: i.example,
        pinyin: i.examplePinyin,
        gloss: i.exampleAr,
      })),
      {
        title: 'أصوات لا مقابل لها بالعربية',
        body: specialSounds
          .slice(0, 3)
          .map((s) => `${s.chinese}: ${s.description}`)
          .join(' · '),
      },
      {
        title: 'لا تقلق من الإتقان الآن',
        body: 'لن تنطق كل شيء صحيحاً من اليوم الأول، ولا يُنتظَر منك ذلك. في كل وحدة تمرين نطق يسمعك ويعطيك درجة، والتحسّن يأتي بالتكرار.',
      },
    ],
    checks: [
      {
        question: 'ممّ يتكوّن مقطع البينين؟',
        options: ['بداية ونهاية', 'ثلاثة حروف دائماً', 'حرف واحد فقط', 'رمز ونبرة'],
        correct: 0,
        because: 'بداية (٢٣ منها) + نهاية (٣٦) — وبهما يُقرأ كل مقطع في اللغة.',
      },
      {
        question: `في «${commonCombinations[0]?.pinyin ?? 'ba'}» — أين النبرة؟`,
        options: [
          'فوق حرف النهاية',
          'فوق حرف البداية',
          'في آخر المقطع دائماً',
          'لا تُكتب النبرة',
        ],
        correct: 0,
        because: 'علامة النبرة توضع فوق حرف علّة من النهاية، لا فوق البداية.',
      },
    ],
  },
]

/** Every card in the primer, for the progress bar. */
export const PRIMER_CARD_COUNT = PRIMER.reduce((n, c) => n + c.cards.length + c.checks.length, 0)

/** Kept exported so the source of this material is greppable from here. */
export const PRIMER_SOURCE = { initials, finals, tones, specialSounds, toneSandhiRules, commonCombinations }
