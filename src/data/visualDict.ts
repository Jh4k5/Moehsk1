// ─── Visual Dictionary ────────────────────────────────────────────────────────
// Phase 3 – Emoji-annotated vocabulary organised by semantic category

export interface VisualDictWord {
  hanzi: string
  pinyin: string
  arabic: string
  emoji: string
}

export interface VisualDictCategory {
  key: string
  label: string
  words: VisualDictWord[]
}

export const VISUAL_DICT_CATEGORIES: VisualDictCategory[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // 🔢 الأرقام – Numbers
  // ════════════════════════════════════════════════════════════════════════════
  {
    key: "numbers",
    label: "🔢 الأرقام",
    words: [
      { hanzi: "零", pinyin: "líng", arabic: "صفر", emoji: "0️⃣" },
      { hanzi: "一", pinyin: "yī", arabic: "واحد", emoji: "1️⃣" },
      { hanzi: "二", pinyin: "èr", arabic: "اثنان", emoji: "2️⃣" },
      { hanzi: "三", pinyin: "sān", arabic: "ثلاثة", emoji: "3️⃣" },
      { hanzi: "四", pinyin: "sì", arabic: "أربعة", emoji: "4️⃣" },
      { hanzi: "五", pinyin: "wǔ", arabic: "خمسة", emoji: "5️⃣" },
      { hanzi: "六", pinyin: "liù", arabic: "ستة", emoji: "6️⃣" },
      { hanzi: "七", pinyin: "qī", arabic: "سبعة", emoji: "7️⃣" },
      { hanzi: "八", pinyin: "bā", arabic: "ثمانية", emoji: "8️⃣" },
      { hanzi: "九", pinyin: "jiǔ", arabic: "تسعة", emoji: "9️⃣" },
      { hanzi: "十", pinyin: "shí", arabic: "عشرة", emoji: "🔟" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 🍜 الطعام – Food
  // ════════════════════════════════════════════════════════════════════════════
  {
    key: "food",
    label: "🍜 الطعام",
    words: [
      { hanzi: "米饭", pinyin: "mǐfàn", arabic: "أرز", emoji: "🍚" },
      { hanzi: "面条", pinyin: "miàntiáo", arabic: "معكرونة / نودلز", emoji: "🍜" },
      { hanzi: "饺子", pinyin: "jiǎozi", arabic: "زلابية", emoji: "🥟" },
      { hanzi: "包子", pinyin: "bāozi", arabic: "كعك محشي على البخار", emoji: "🥖" },
      { hanzi: "苹果", pinyin: "píngguǒ", arabic: "تفاح", emoji: "🍎" },
      { hanzi: "香蕉", pinyin: "xiāngjiāo", arabic: "موز", emoji: "🍌" },
      { hanzi: "茶", pinyin: "chá", arabic: "شاي", emoji: "🍵" },
      { hanzi: "水", pinyin: "shuǐ", arabic: "ماء", emoji: "💧" },
      { hanzi: "牛奶", pinyin: "niúnǎi", arabic: "حليب", emoji: "🥛" },
      { hanzi: "鸡蛋", pinyin: "jīdàn", arabic: "بيضة", emoji: "🥚" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 👨‍👩‍👧 العائلة – Family
  // ════════════════════════════════════════════════════════════════════════════
  {
    key: "family",
    label: "👨‍👩‍👧 العائلة",
    words: [
      { hanzi: "爸爸", pinyin: "bàba", arabic: "أب / بابا", emoji: "👨" },
      { hanzi: "妈妈", pinyin: "māma", arabic: "أم / ماما", emoji: "👩" },
      { hanzi: "哥哥", pinyin: "gēge", arabic: "أخ أكبر", emoji: "👦" },
      { hanzi: "姐姐", pinyin: "jiějie", arabic: "أخت أكبر", emoji: "👧" },
      { hanzi: "弟弟", pinyin: "dìdi", arabic: "أخ أصغر", emoji: "🧒" },
      { hanzi: "妹妹", pinyin: "mèimei", arabic: "أخت أصغر", emoji: "👶" },
      { hanzi: "儿子", pinyin: "érzi", arabic: "ابن", emoji: "👦" },
      { hanzi: "女儿", pinyin: "nǚ'ér", arabic: "ابنة", emoji: "👧" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 📍 الأماكن – Places
  // ════════════════════════════════════════════════════════════════════════════
  {
    key: "places",
    label: "📍 الأماكن",
    words: [
      { hanzi: "学校", pinyin: "xuéxiào", arabic: "مدرسة", emoji: "🏫" },
      { hanzi: "医院", pinyin: "yīyuàn", arabic: "مستشفى", emoji: "🏥" },
      { hanzi: "超市", pinyin: "chāoshì", arabic: "سوبرماركت", emoji: "🏪" },
      { hanzi: "图书馆", pinyin: "túshūguǎn", arabic: "مكتبة", emoji: "📚" },
      { hanzi: "饭店", pinyin: "fàndiàn", arabic: "مطعم / فندق", emoji: "🍽️" },
      { hanzi: "机场", pinyin: "jīchǎng", arabic: "مطار", emoji: "✈️" },
      { hanzi: "家", pinyin: "jiā", arabic: "منزل / بيت", emoji: "🏠" },
      { hanzi: "公司", pinyin: "gōngsī", arabic: "شركة", emoji: "🏢" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 🚆 المواصلات – Transport
  // ════════════════════════════════════════════════════════════════════════════
  {
    key: "transport",
    label: "🚆 المواصلات",
    words: [
      { hanzi: "飞机", pinyin: "fēijī", arabic: "طائرة", emoji: "✈️" },
      { hanzi: "火车", pinyin: "huǒchē", arabic: "قطار", emoji: "🚂" },
      { hanzi: "出租车", pinyin: "chūzūchē", arabic: "تاكسي", emoji: "🚕" },
      { hanzi: "车", pinyin: "chē", arabic: "سيارة / مركبة", emoji: "🚗" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 🌤 الطقس – Weather
  // ════════════════════════════════════════════════════════════════════════════
  {
    key: "weather",
    label: "🌤 الطقس",
    words: [
      { hanzi: "下雨", pinyin: "xiàyǔ", arabic: "تمطر", emoji: "🌧️" },
      { hanzi: "下雪", pinyin: "xiàxuě", arabic: "يتساقط الثلج", emoji: "❄️" },
      { hanzi: "热", pinyin: "rè", arabic: "حار", emoji: "🌡️" },
      { hanzi: "冷", pinyin: "lěng", arabic: "بارد", emoji: "🥶" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 😊 المشاعر – Emotions
  // ════════════════════════════════════════════════════════════════════════════
  {
    key: "emotions",
    label: "😊 المشاعر",
    words: [
      { hanzi: "高兴", pinyin: "gāoxìng", arabic: "سعيد / مسرور", emoji: "😊" },
      { hanzi: "忙", pinyin: "máng", arabic: "مشغول", emoji: "🏃" },
      { hanzi: "累", pinyin: "lèi", arabic: "متعب", emoji: "😮‍💨" },
      { hanzi: "好", pinyin: "hǎo", arabic: "جيد / حسنًا", emoji: "👍" },
    ],
  },
]
