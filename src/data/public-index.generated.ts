// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE — do not edit by hand.
// Produced by `node scripts/build-public-index.js`.
//
// The curriculum's PUBLIC face: lesson titles, grammar names, counts. No word,
// no meaning, no example sentence. Everything here is already on the indexed
// marketing pages, so a client component may hold it — which is the point:
// rendering the path must not require importing the vocabulary.
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicLesson {
  id: number
  title: string
  titleZh: string
  /** How many words the lesson holds. A count, never the words. */
  wordCount: number
}

export interface PublicLevelIndex {
  level: 1 | 2 | 3
  label: string
  wordCount: number
  lessons: PublicLesson[]
  /** How many grammar rules the level has. A count — the names gloss
   *  their Chinese in Arabic, so they are gated with the rest. */
  grammarCount: number
}

export const PUBLIC_INDEX: Record<1 | 2 | 3, PublicLevelIndex> = {
  1: {
    level: 1,
    label: 'HSK 1',
    wordCount: 405,
    lessons: [
      { id: 1, title: "آي شياو يو، مرحباً!", titleZh: "艾小语，你好！", wordCount: 39 },
      { id: 2, title: "اسمي لي ون", titleZh: "我叫李文", wordCount: 28 },
      { id: 3, title: "أنا صيني", titleZh: "我是中国人", wordCount: 26 },
      { id: 4, title: "لدي طفلان", titleZh: "我有两个孩子", wordCount: 24 },
      { id: 5, title: "أنا أرتاح اليوم", titleZh: "今天我休息", wordCount: 24 },
      { id: 6, title: "ما رقم هاتفك؟", titleZh: "你的手机号是多少？", wordCount: 23 },
      { id: 7, title: "أريد...", titleZh: "我想要...", wordCount: 32 },
      { id: 8, title: "أنهي العمل الساعة 6:30 مساءً", titleZh: "我晚上六点半下班", wordCount: 24 },
      { id: 9, title: "أبي يعمل أيضاً في المستشفى", titleZh: "我爸爸也在医院工作", wordCount: 24 },
      { id: 10, title: "سأدرس في المدرسة غداً صباحاً", titleZh: "我明天上午在学校学习", wordCount: 24 },
      { id: 11, title: "التفاح هنا رخيص حقاً!", titleZh: "这儿的苹果真便宜！", wordCount: 30 },
      { id: 12, title: "أنا أدرس في الجامعة", titleZh: "我读大学", wordCount: 24 },
      { id: 13, title: "أمطرت الثلوج أمس", titleZh: "昨天下雪了", wordCount: 24 },
      { id: 14, title: "من فضلك أعطني كوب شاي", titleZh: "请给我一杯茶", wordCount: 24 },
      { id: 15, title: "أراكم في مطار داشينغ!", titleZh: "大兴机场见！", wordCount: 35 },
    ],
    grammarCount: 26,
  },
  2: {
    level: 2,
    label: 'HSK 2',
    wordCount: 195,
    lessons: [
      { id: 1, title: "التعارف والمساعدة", titleZh: "初次见面", wordCount: 13 },
      { id: 2, title: "المواصلات والأماكن", titleZh: "坐车去哪儿", wordCount: 17 },
      { id: 3, title: "الأنشطة اليومية", titleZh: "日常生活", wordCount: 15 },
      { id: 4, title: "الألوان والتسوق", titleZh: "颜色和商场", wordCount: 14 },
      { id: 5, title: "في الفندق والانتظار", titleZh: "在酒店", wordCount: 17 },
      { id: 6, title: "الطعام والمشاعر", titleZh: "生日快乐", wordCount: 13 },
      { id: 7, title: "الرياضة والهوايات", titleZh: "我的爱好", wordCount: 15 },
      { id: 8, title: "المقارنة والعائلة", titleZh: "我的家人", wordCount: 12 },
      { id: 9, title: "الأماكن والاتجاهات", titleZh: "问路", wordCount: 12 },
      { id: 10, title: "الدراسة والامتحانات", titleZh: "考试", wordCount: 12 },
      { id: 11, title: "الصحة والجسم", titleZh: "看病", wordCount: 12 },
      { id: 12, title: "الطقس والمدينة", titleZh: "天气", wordCount: 11 },
      { id: 13, title: "الفصل والإنترنت", titleZh: "上网", wordCount: 11 },
      { id: 14, title: "الاحتفالات والأشخاص", titleZh: "过年", wordCount: 10 },
      { id: 15, title: "السفر والمطار", titleZh: "去机场", wordCount: 11 },
    ],
    grammarCount: 15,
  },
  3: {
    level: 3,
    label: 'HSK 3',
    wordCount: 479,
    lessons: [
      { id: 1, title: "في المطار والاستقبال", titleZh: "我们去机场接你们", wordCount: 27 },
      { id: 2, title: "في المطعم والطلبات", titleZh: "你们想吃什么就点什么", wordCount: 28 },
      { id: 3, title: "السكن والحيّ", titleZh: "这个小区挺好的", wordCount: 26 },
      { id: 4, title: "السفر والعطلات", titleZh: "这家宾馆跟别的都不一样", wordCount: 27 },
      { id: 5, title: "التصوير والهوايات", titleZh: "这样的照片才好看", wordCount: 27 },
      { id: 6, title: "المواصلات والقطار السريع", titleZh: "高铁上还可以点外卖", wordCount: 26 },
      { id: 7, title: "التسوّق والمقارنة", titleZh: "那条裙子比短裤更好看", wordCount: 27 },
      { id: 8, title: "الصحة والرياضة", titleZh: "今天我出院了", wordCount: 28 },
      { id: 9, title: "الحياة الجامعية والمباريات", titleZh: "打不好没关系", wordCount: 26 },
      { id: 10, title: "الدراسة والامتحانات", titleZh: "你明天再把书还给我", wordCount: 28 },
      { id: 11, title: "العمل والاجتماعات", titleZh: "看来我没办法解决这个问题", wordCount: 27 },
      { id: 12, title: "الطقس والفصول", titleZh: "这个季节天气变化很快", wordCount: 26 },
      { id: 13, title: "الضيافة والثقافة", titleZh: "我的新邻居来自英国", wordCount: 27 },
      { id: 14, title: "المكتبة والحفلات", titleZh: "这本书被别人借走了", wordCount: 27 },
      { id: 15, title: "المدينة والمعالم", titleZh: "我是半个南京人", wordCount: 24 },
      { id: 16, title: "الحيوانات والطبيعة", titleZh: "我听说有的熊猫出国了", wordCount: 24 },
      { id: 17, title: "المستقبل والقرارات", titleZh: "我要多向认真的人学习", wordCount: 27 },
      { id: 18, title: "الأعياد والعائلة", titleZh: "我学会了包饺子", wordCount: 27 },
    ],
    grammarCount: 62,
  },
}

export function publicLevel(level: number): PublicLevelIndex {
  return PUBLIC_INDEX[(level as 1 | 2 | 3)] ?? PUBLIC_INDEX[1]
}
