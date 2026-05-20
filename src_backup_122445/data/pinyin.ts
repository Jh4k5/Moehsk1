export interface PinyinInitial {
  char: string;
  ipa: string;
  example: string;
  examplePinyin: string;
  exampleAr: string;
  similarToArabic?: string;
  note?: string;
}

export interface PinyinFinal {
  char: string;
  ipa: string;
  toneVariants: {
    tone1: string;
    tone2: string;
    tone3: string;
    tone4: string;
    tone0: string;
  };
  example: string;
  examplePinyin: string;
  exampleAr: string;
}

export interface ToneExplanation {
  tone: number;
  name: string;
  nameAr: string;
  symbol: string;
  description: string;
  descriptionAr: string;
  example: string;
  examplePinyin: string;
  exampleAr: string;
  // SVG path data for tone curve visualization
  svgPath: string;
}

// ── Initials (声母) ──────────────────────────────────────────────────────
export const initials: PinyinInitial[] = [
  {
    char: 'b',
    ipa: '[p]',
    example: '爸',
    examplePinyin: 'bà',
    exampleAr: 'أب',
    similarToArabic: 'باء',
    note: 'غير مرقّق مثل b الإنجليزية',
  },
  {
    char: 'p',
    ipa: '[pʰ]',
    example: '怕',
    examplePinyin: 'pà',
    exampleAr: 'يخاف',
    similarToArabic: 'باء مع نفخة',
    note: 'مثل p الإنجليزية',
  },
  {
    char: 'm',
    ipa: '[m]',
    example: '妈',
    examplePinyin: 'mā',
    exampleAr: 'أم',
    similarToArabic: 'ميم',
    note: 'نفس ميم العربية',
  },
  {
    char: 'f',
    ipa: '[f]',
    example: '飞',
    examplePinyin: 'fēi',
    exampleAr: 'يطير',
    similarToArabic: 'فاء',
    note: 'نفس فاء العربية',
  },
  {
    char: 'd',
    ipa: '[t]',
    example: '大',
    examplePinyin: 'dà',
    exampleAr: 'كبير',
    similarToArabic: 'دال',
    note: 'غير مرقّق مثل d الإنجليزية',
  },
  {
    char: 't',
    ipa: '[tʰ]',
    example: '天',
    examplePinyin: 'tiān',
    exampleAr: 'سماء',
    similarToArabic: 'تاء مع نفخة',
  },
  {
    char: 'n',
    ipa: '[n]',
    example: '你',
    examplePinyin: 'nǐ',
    exampleAr: 'أنت',
    similarToArabic: 'نون',
    note: 'نفس نون العربية',
  },
  {
    char: 'l',
    ipa: '[l]',
    example: '来',
    examplePinyin: 'lái',
    exampleAr: 'يأتي',
    similarToArabic: 'لام',
    note: 'نفس لام العربية',
  },
  {
    char: 'g',
    ipa: '[k]',
    example: '哥',
    examplePinyin: 'gē',
    exampleAr: 'أخ أكبر',
    note: 'غير مرقّق مثل g الإنجليزية',
  },
  {
    char: 'k',
    ipa: '[kʰ]',
    example: '看',
    examplePinyin: 'kàn',
    exampleAr: 'ينظر',
    note: 'مثل k الإنجليزية',
  },
  {
    char: 'h',
    ipa: '[x]',
    example: '好',
    examplePinyin: 'hǎo',
    exampleAr: 'جيد',
    note: 'أقوى من h الإنجليزية، مثل خاء خفيفة',
  },
  {
    char: 'j',
    ipa: '[tɕ]',
    example: '叫',
    examplePinyin: 'jiào',
    exampleAr: 'يُسمّى',
    note: 'صوت فريد، مثل j الإسبانية',
  },
  {
    char: 'q',
    ipa: '[tɕʰ]',
    example: '去',
    examplePinyin: 'qù',
    exampleAr: 'يذهب',
    note: 'صوت فريد، مثل ch الإسبانية',
  },
  {
    char: 'x',
    ipa: '[ɕ]',
    example: '学',
    examplePinyin: 'xué',
    exampleAr: 'يتعلم',
    note: 'صوت فريد، مثل sh الإسبانية',
  },
  {
    char: 'zh',
    ipa: '[tʂ]',
    example: '中',
    examplePinyin: 'zhōng',
    exampleAr: 'وسط/صين',
    note: '⚠️ صوت جديد! مثل جيم ملفوظة من خلف الأسنان',
  },
  {
    char: 'ch',
    ipa: '[tʂʰ]',
    example: '吃',
    examplePinyin: 'chī',
    exampleAr: 'يأكل',
    note: '⚠️ صوت جديد! مثل تشاف ملفوظة من خلف الأسنان',
  },
  {
    char: 'sh',
    ipa: '[ʂ]',
    example: '是',
    examplePinyin: 'shì',
    exampleAr: 'يكون',
    note: '⚠️ صوت جديد! مثل شين ملفوظة من خلف الأسنان',
  },
  {
    char: 'r',
    ipa: '[ʐ]',
    example: '人',
    examplePinyin: 'rén',
    exampleAr: 'شخص',
    note: '⚠️ صوت فريد! مثل راء فرنسية ممدودة',
  },
  {
    char: 'z',
    ipa: '[ts]',
    example: '坐',
    examplePinyin: 'zuò',
    exampleAr: 'يجلس',
    note: 'مثل ts الإنجليزية في "cats"',
  },
  {
    char: 'c',
    ipa: '[tsʰ]',
    example: '草',
    examplePinyin: 'cǎo',
    exampleAr: 'عشب',
    note: 'مثل ts الإنجليزية في "cats" مع نفخة',
  },
  {
    char: 's',
    ipa: '[s]',
    example: '三',
    examplePinyin: 'sān',
    exampleAr: 'ثلاثة',
    similarToArabic: 'سين',
    note: 'نفس سين العربية تقريباً',
  },
  {
    char: 'y',
    ipa: '[j]',
    example: '一',
    examplePinyin: 'yī',
    exampleAr: 'واحد',
    note: 'شبه ياء، تُستخدم كأولية',
  },
  {
    char: 'w',
    ipa: '[w]',
    example: '我',
    examplePinyin: 'wǒ',
    exampleAr: 'أنا',
    note: 'شبه واو، تُستخدم كأولية',
  },
];

// ── Finals (韵母) ────────────────────────────────────────────────────────
export const finals: PinyinFinal[] = [
  {
    char: 'a',
    ipa: '[a]',
    toneVariants: { tone1: 'ā', tone2: 'á', tone3: 'ǎ', tone4: 'à', tone0: 'a' },
    example: '大',
    examplePinyin: 'dà',
    exampleAr: 'كبير',
  },
  {
    char: 'o',
    ipa: '[o]',
    toneVariants: { tone1: 'ō', tone2: 'ó', tone3: 'ǒ', tone4: 'ò', tone0: 'o' },
    example: '我',
    examplePinyin: 'wǒ',
    exampleAr: 'أنا',
  },
  {
    char: 'e',
    ipa: '[ɤ]',
    toneVariants: { tone1: 'ē', tone2: 'é', tone3: 'ě', tone4: 'è', tone0: 'e' },
    example: '哥',
    examplePinyin: 'gē',
    exampleAr: 'أخ أكبر',
  },
  {
    char: 'i',
    ipa: '[i]',
    toneVariants: { tone1: 'ī', tone2: 'í', tone3: 'ǐ', tone4: 'ì', tone0: 'i' },
    example: '一',
    examplePinyin: 'yī',
    exampleAr: 'واحد',
  },
  {
    char: 'u',
    ipa: '[u]',
    toneVariants: { tone1: 'ū', tone2: 'ú', tone3: 'ǔ', tone4: 'ù', tone0: 'u' },
    example: '五',
    examplePinyin: 'wǔ',
    exampleAr: 'خمسة',
  },
  {
    char: 'ü',
    ipa: '[y]',
    toneVariants: { tone1: 'ǖ', tone2: 'ǘ', tone3: 'ǚ', tone4: 'ǜ', tone0: 'ü' },
    example: '女',
    examplePinyin: 'nǚ',
    exampleAr: 'امرأة',
  },
  {
    char: 'ai',
    ipa: '[aɪ]',
    toneVariants: { tone1: 'āi', tone2: 'ái', tone3: 'ǎi', tone4: 'ài', tone0: 'ai' },
    example: '爱',
    examplePinyin: 'ài',
    exampleAr: 'يحب',
  },
  {
    char: 'ei',
    ipa: '[eɪ]',
    toneVariants: { tone1: 'ēi', tone2: 'éi', tone3: 'ěi', tone4: 'èi', tone0: 'ei' },
    example: '北',
    examplePinyin: 'běi',
    exampleAr: 'شمال',
  },
  {
    char: 'ao',
    ipa: '[aʊ]',
    toneVariants: { tone1: 'āo', tone2: 'áo', tone3: 'ǎo', tone4: 'ào', tone0: 'ao' },
    example: '好',
    examplePinyin: 'hǎo',
    exampleAr: 'جيد',
  },
  {
    char: 'ou',
    ipa: '[oʊ]',
    toneVariants: { tone1: 'ōu', tone2: 'óu', tone3: 'ǒu', tone4: 'òu', tone0: 'ou' },
    example: '后',
    examplePinyin: 'hòu',
    exampleAr: 'خلف/بعد',
  },
  {
    char: 'an',
    ipa: '[an]',
    toneVariants: { tone1: 'ān', tone2: 'án', tone3: 'ǎn', tone4: 'àn', tone0: 'an' },
    example: '三',
    examplePinyin: 'sān',
    exampleAr: 'ثلاثة',
  },
  {
    char: 'en',
    ipa: '[ən]',
    toneVariants: { tone1: 'ēn', tone2: 'én', tone3: 'ěn', tone4: 'èn', tone0: 'en' },
    example: '人',
    examplePinyin: 'rén',
    exampleAr: 'شخص',
  },
  {
    char: 'ang',
    ipa: '[aŋ]',
    toneVariants: { tone1: 'āng', tone2: 'áng', tone3: 'ǎng', tone4: 'àng', tone0: 'ang' },
    example: '忙',
    examplePinyin: 'máng',
    exampleAr: 'مشغول',
  },
  {
    char: 'eng',
    ipa: '[əŋ]',
    toneVariants: { tone1: 'ēng', tone2: 'éng', tone3: 'ěng', tone4: 'èng', tone0: 'eng' },
    example: '风',
    examplePinyin: 'fēng',
    exampleAr: 'رياح',
  },
  {
    char: 'ong',
    ipa: '[ʊŋ]',
    toneVariants: { tone1: 'ōng', tone2: 'óng', tone3: 'ǒng', tone4: 'òng', tone0: 'ong' },
    example: '中',
    examplePinyin: 'zhōng',
    exampleAr: 'وسط/صين',
  },
  {
    char: 'ia',
    ipa: '[iA]',
    toneVariants: { tone1: 'iā', tone2: 'iá', tone3: 'iǎ', tone4: 'ià', tone0: 'ia' },
    example: '家',
    examplePinyin: 'jiā',
    exampleAr: 'بيت/عائلة',
  },
  {
    char: 'ie',
    ipa: '[iɛ]',
    toneVariants: { tone1: 'iē', tone2: 'ié', tone3: 'iě', tone4: 'iè', tone0: 'ie' },
    example: '写',
    examplePinyin: 'xiě',
    exampleAr: 'يكتب',
  },
  {
    char: 'iao',
    ipa: '[iaʊ]',
    toneVariants: { tone1: 'iāo', tone2: 'iáo', tone3: 'iǎo', tone4: 'iào', tone0: 'iao' },
    example: '小',
    examplePinyin: 'xiǎo',
    exampleAr: 'صغير',
  },
  {
    char: 'iu',
    ipa: '[ioʊ]',
    toneVariants: { tone1: 'iū', tone2: 'iú', tone3: 'iǔ', tone4: 'iù', tone0: 'iu' },
    example: '九',
    examplePinyin: 'jiǔ',
    exampleAr: 'تسعة',
  },
  {
    char: 'ian',
    ipa: '[iɛn]',
    toneVariants: { tone1: 'iān', tone2: 'ián', tone3: 'iǎn', tone4: 'iàn', tone0: 'ian' },
    example: '天',
    examplePinyin: 'tiān',
    exampleAr: 'سماء/يوم',
  },
  {
    char: 'in',
    ipa: '[in]',
    toneVariants: { tone1: 'īn', tone2: 'ín', tone3: 'ǐn', tone4: 'ìn', tone0: 'in' },
    example: '心',
    examplePinyin: 'xīn',
    exampleAr: 'قلب',
  },
  {
    char: 'iang',
    ipa: '[iaŋ]',
    toneVariants: { tone1: 'iāng', tone2: 'iáng', tone3: 'iǎng', tone4: 'iàng', tone0: 'iang' },
    example: '想',
    examplePinyin: 'xiǎng',
    exampleAr: 'يفكر/يريد',
  },
  {
    char: 'ing',
    ipa: '[iŋ]',
    toneVariants: { tone1: 'īng', tone2: 'íng', tone3: 'ǐng', tone4: 'ìng', tone0: 'ing' },
    example: '听',
    examplePinyin: 'tīng',
    exampleAr: 'يسمع',
  },
  {
    char: 'iong',
    ipa: '[yʊŋ]',
    toneVariants: { tone1: 'iōng', tone2: 'ióng', tone3: 'iǒng', tone4: 'iòng', tone0: 'iong' },
    example: '兄',
    examplePinyin: 'xiōng',
    exampleAr: 'أخ',
  },
  {
    char: 'ua',
    ipa: '[uA]',
    toneVariants: { tone1: 'uā', tone2: 'uá', tone3: 'uǎ', tone4: 'uà', tone0: 'ua' },
    example: '花',
    examplePinyin: 'huā',
    exampleAr: 'زهرة',
  },
  {
    char: 'uo',
    ipa: '[uɔ]',
    toneVariants: { tone1: 'uō', tone2: 'uó', tone3: 'uǒ', tone4: 'uò', tone0: 'uo' },
    example: '多',
    examplePinyin: 'duō',
    exampleAr: 'كثير',
  },
  {
    char: 'uai',
    ipa: '[uaɪ]',
    toneVariants: { tone1: 'uāi', tone2: 'uái', tone3: 'uǎi', tone4: 'uài', tone0: 'uai' },
    example: '快',
    examplePinyin: 'kuài',
    exampleAr: 'سريع',
  },
  {
    char: 'ui',
    ipa: '[ueɪ]',
    toneVariants: { tone1: 'uī', tone2: 'uí', tone3: 'uǐ', tone4: 'uì', tone0: 'ui' },
    example: '水',
    examplePinyin: 'shuǐ',
    exampleAr: 'ماء',
  },
  {
    char: 'uan',
    ipa: '[uan]',
    toneVariants: { tone1: 'uān', tone2: 'uán', tone3: 'uǎn', tone4: 'uàn', tone0: 'uan' },
    example: '关',
    examplePinyin: 'guān',
    exampleAr: 'يغلق/بوابة',
  },
  {
    char: 'un',
    ipa: '[uən]',
    toneVariants: { tone1: 'ūn', tone2: 'ún', tone3: 'ǔn', tone4: 'ùn', tone0: 'un' },
    example: '春',
    examplePinyin: 'chūn',
    exampleAr: 'ربيع',
  },
  {
    char: 'uang',
    ipa: '[uaŋ]',
    toneVariants: { tone1: 'uāng', tone2: 'uáng', tone3: 'uǎng', tone4: 'uàng', tone0: 'uang' },
    example: '光',
    examplePinyin: 'guāng',
    exampleAr: 'ضوء',
  },
  {
    char: 'ueng',
    ipa: '[uəŋ]',
    toneVariants: { tone1: 'uēng', tone2: 'uéng', tone3: 'uěng', tone4: 'uèng', tone0: 'ueng' },
    example: '翁',
    examplePinyin: 'wēng',
    exampleAr: 'رجل عجوز',
  },
  {
    char: 'üe',
    ipa: '[yɛ]',
    toneVariants: { tone1: 'üē', tone2: 'üé', tone3: 'üě', tone4: 'üè', tone0: 'üe' },
    example: '学',
    examplePinyin: 'xué',
    exampleAr: 'يتعلم',
  },
  {
    char: 'üan',
    ipa: '[yɛn]',
    toneVariants: { tone1: 'üān', tone2: 'üán', tone3: 'üǎn', tone4: 'üàn', tone0: 'üan' },
    example: '圆',
    examplePinyin: 'yuán',
    exampleAr: 'دائري/يوان',
  },
  {
    char: 'ün',
    ipa: '[yn]',
    toneVariants: { tone1: 'ǖn', tone2: 'ǘn', tone3: 'ǚn', tone4: 'ǜn', tone0: 'ün' },
    example: '云',
    examplePinyin: 'yún',
    exampleAr: 'سحاب',
  },
  {
    char: 'er',
    ipa: '[ɚ]',
    toneVariants: { tone1: 'ēr', tone2: 'ér', tone3: 'ěr', tone4: 'èr', tone0: 'er' },
    example: '二',
    examplePinyin: 'èr',
    exampleAr: 'اثنان',
  },
];

// ── Tone Explanations (声调) ──────────────────────────────────────────────
export const tones: ToneExplanation[] = [
  {
    tone: 1,
    name: 'First Tone',
    nameAr: 'النبرة الأولى (المستوية)',
    symbol: '─',
    description: 'High and level pitch, held constant',
    descriptionAr: 'صوت مرتفع ومستقر، يُحافظ على نفس الارتفاع',
    example: '妈',
    examplePinyin: 'mā',
    exampleAr: 'أم',
    svgPath: 'M 10 30 L 70 30',
  },
  {
    tone: 2,
    name: 'Second Tone',
    nameAr: 'النبرة الثانية (الصاعدة)',
    symbol: '↗',
    description: 'Rising pitch, starts mid and goes up',
    descriptionAr: 'صوت صاعد، يبدأ من المنتصف ويصعد للأعلى',
    example: '麻',
    examplePinyin: 'má',
    exampleAr: 'قنب/كتان',
    svgPath: 'M 10 50 L 70 10',
  },
  {
    tone: 3,
    name: 'Third Tone',
    nameAr: 'النبرة الثالثة (الهابطة-الصاعدة)',
    symbol: '↘↗',
    description: 'Falling then rising, dips low then rises',
    descriptionAr: 'صوت ينزل ثم يصعد، ينخفض ثم يرتفع',
    example: '马',
    examplePinyin: 'mǎ',
    exampleAr: 'حصان',
    svgPath: 'M 10 20 C 25 60, 45 60, 70 20',
  },
  {
    tone: 4,
    name: 'Fourth Tone',
    nameAr: 'النبرة الرابعة (الهابطة الحادة)',
    symbol: '↘',
    description: 'Falling pitch, starts high and drops sharply',
    descriptionAr: 'صوت هابط حاد، يبدأ مرتفعاً وينزل بقوة',
    example: '骂',
    examplePinyin: 'mà',
    exampleAr: 'يشتم',
    svgPath: 'M 10 10 L 70 55',
  },
  {
    tone: 0,
    name: 'Neutral Tone',
    nameAr: 'النبرة المحايدة (الخفيفة)',
    symbol: '•',
    description: 'Short and light, no distinct pitch direction',
    descriptionAr: 'صوت قصير وخفيف، بدون اتجاه محدد للنبرة',
    example: '吗',
    examplePinyin: 'ma',
    exampleAr: 'علامة سؤال',
    svgPath: 'M 30 35 L 50 35',
  },
];

// ── Special sounds comparison with Arabic ─────────────────────────────────
export const specialSounds = [
  {
    chinese: 'zh',
    arabic: 'لا يوجد',
    description: 'مثل جيم ملفوظة من خلف الأسنان',
    practice: '中 zhōng = وسط/صين',
  },
  {
    chinese: 'ch',
    arabic: 'لا يوجد',
    description: 'مثل تشاف من خلف الأسنان',
    practice: '吃 chī = يأكل',
  },
  {
    chinese: 'sh',
    arabic: 'لا يوجد',
    description: 'مثل شين من خلف الأسنان',
    practice: '是 shì = يكون',
  },
  {
    chinese: 'r',
    arabic: 'قريب من الراء',
    description: 'أقوى وأطول من الراء العربية',
    practice: '人 rén = شخص',
  },
  {
    chinese: 'x',
    arabic: 'لا يوجد',
    description: 'مثل شين الإسبانية',
    practice: '学 xué = يتعلم',
  },
  {
    chinese: 'q',
    arabic: 'لا يوجد',
    description: 'مثل تشاف الإسبانية',
    practice: '去 qù = يذهب',
  },
  {
    chinese: 'ü',
    arabic: 'لا يوجد',
    description: 'مثل يو الفرنسية (u مع شفاه مدورة)',
    practice: '女 nǚ = امرأة',
  },
];

// ── Tone sandhi rules ─────────────────────────────────────────────────────
export const toneSandhiRules = [
  {
    name: 'قاعدة "yi" (一)',
    nameAr: 'تحويل نبرة واحد',
    description: 'يتغير نبرة 一 حسب ما يليه',
    rules: [
      { before: 'النبرة الأولى', result: '→ yì (النبرة الرابعة)', example: '一天 yì tiān' },
      { before: 'النبرة الثانية', result: '→ yì (النبرة الرابعة)', example: '一年 yì nián' },
      { before: 'النبرة الثالثة', result: '→ yì (النبرة الرابعة)', example: '一个 yí gè → yí gè' },
      { before: 'النبرة الرابعة', result: '→ yí (النبرة الثانية)', example: '一月 yí yuè' },
      { before: 'وحده', result: '→ yī (النبرة الأولى)', example: '一 yī' },
    ],
  },
  {
    name: 'قاعدة "bu" (不)',
    nameAr: 'تحويل نبرة لا',
    description: 'يتغير نبرة 不 قبل النبرة الرابعة فقط',
    rules: [
      { before: 'النبرة الرابعة', result: '→ bú (النبرة الثانية)', example: '不是 bú shì' },
      { before: 'غير ذلك', result: '→ bù (النبرة الرابعة)', example: '不好 bù hǎo' },
    ],
  },
  {
    name: 'قاعدة النبرة الثالثة المزدوجة',
    nameAr: '3+3 → 2+3',
    description: 'عند اجتماع نبرتين ثالثتين، تتحول الأولى إلى ثانية',
    rules: [
      { before: '3 + 3', result: '→ 2 + 3', example: '你好 nǐ hǎo → ní hǎo' },
    ],
  },
];

// ── Common combinations / syllables ───────────────────────────────────────
export const commonCombinations = [
  // ba group
  { initial: 'b', final: 'a', pinyin: 'ba', char: '八', meaning: 'ثمانية' },
  { initial: 'b', final: 'ai', pinyin: 'bai', char: '白', meaning: 'أبيض' },
  { initial: 'b', final: 'an', pinyin: 'ban', char: '半', meaning: 'نصف' },
  { initial: 'b', final: 'ang', pinyin: 'bang', char: '帮', meaning: 'يساعد' },
  { initial: 'b', final: 'ao', pinyin: 'bao', char: '包', meaning: 'حقيبة' },
  { initial: 'b', final: 'ei', pinyin: 'bei', char: '杯', meaning: 'كوب' },
  { initial: 'b', final: 'en', pinyin: 'ben', char: '本', meaning: 'كتاب/جذر' },
  { initial: 'b', final: 'i', pinyin: 'bi', char: '比', meaning: 'يقارن' },
  { initial: 'b', final: 'ie', pinyin: 'bie', char: '别', meaning: 'لا/لا تنسَ' },
  { initial: 'b', final: 'in', pinyin: 'bin', char: '宾', meaning: 'ضيف' },
  { initial: 'b', final: 'ing', pinyin: 'bing', char: '病', meaning: 'مريض' },
  { initial: 'b', final: 'o', pinyin: 'bo', char: '波', meaning: 'موجة' },
  { initial: 'b', final: 'u', pinyin: 'bu', char: '不', meaning: 'لا' },
  // d group
  { initial: 'd', final: 'a', pinyin: 'da', char: '大', meaning: 'كبير' },
  { initial: 'd', final: 'ai', pinyin: 'dai', char: '带', meaning: 'يحمل' },
  { initial: 'd', final: 'an', pinyin: 'dan', char: '但', meaning: 'لكن' },
  { initial: 'd', final: 'ang', pinyin: 'dang', char: '当', meaning: 'يعمل كـ' },
  { initial: 'd', final: 'ao', pinyin: 'dao', char: '到', meaning: 'يصل' },
  { initial: 'd', final: 'e', pinyin: 'de', char: '的', meaning: 'حرف جر/ملكية' },
  { initial: 'd', final: 'i', pinyin: 'di', char: '第', meaning: 'الترتيب' },
  { initial: 'd', final: 'ian', pinyin: 'dian', char: '点', meaning: 'ساعة/نقطة' },
  { initial: 'd', final: 'ing', pinyin: 'ding', char: '定', meaning: 'يحدد' },
  { initial: 'd', final: 'ong', pinyin: 'dong', char: '懂', meaning: 'يفهم' },
  { initial: 'd', final: 'u', pinyin: 'du', char: '读', meaning: 'يقرأ' },
  { initial: 'd', final: 'uo', pinyin: 'duo', char: '多', meaning: 'كثير' },
  // h group
  { initial: 'h', final: 'ai', pinyin: 'hai', char: '还', meaning: 'أيضاً/بعد' },
  { initial: 'h', final: 'ao', pinyin: 'hao', char: '好', meaning: 'جيد' },
  { initial: 'h', final: 'e', pinyin: 'he', char: '喝', meaning: 'يشرب' },
  { initial: 'h', final: 'ua', pinyin: 'hua', char: '花', meaning: 'زهرة' },
  { initial: 'h', final: 'uai', pinyin: 'huai', char: '坏', meaning: 'سيء' },
  { initial: 'h', final: 'an', pinyin: 'han', char: '汉', meaning: 'صيني/هان' },
  { initial: 'h', final: 'ang', pinyin: 'hang', char: '行', meaning: 'صف/خط' },
  { initial: 'h', final: 'ou', pinyin: 'hou', char: '后', meaning: 'خلف/بعد' },
  { initial: 'h', final: 'ui', pinyin: 'hui', char: '回', meaning: 'يعود' },
  { initial: 'h', final: 'un', pinyin: 'hun', char: '婚', meaning: 'زواج' },
];
