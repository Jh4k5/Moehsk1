import type { Lesson } from '../lessons';

// HSK2 lessons — from New HSK Course 2 (15 lessons). vocabularyIds use HSK2 ids (2001+).
export const lessons2: Lesson[] = [
  {
    id: 1, title: 'التعارف والمساعدة', titleZh: '初次见面', level: 'HSK2',
    vocabularyIds: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2193],
    grammarIds: [201, 212],
    keySentences: [
      { zh: '帮忙', pinyin: 'bāngmáng', arabic: 'يساعد / يقدّم المساعدة', audioAvailable: true },
      { zh: '不好意思', pinyin: 'bùhǎoyìsi', arabic: 'آسف / المعذرة (بحرج خفيف)', audioAvailable: true },
      { zh: '次', pinyin: 'cì', arabic: 'مرّة (كلمة عدّ للمرّات)', audioAvailable: true },
      { zh: '懂', pinyin: 'dǒng', arabic: 'يفهم', audioAvailable: true },
      { zh: '给', pinyin: 'gěi', arabic: 'لـ / إلى (يعطي)', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 帮忙 (bāngmáng)؟', options: ['يساعد','آسف','مرّة (كلمة عدّ للمرّات)','يفهم'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 不好意思 (bùhǎoyìsi)؟', options: ['آسف','يساعد','مرّة (كلمة عدّ للمرّات)','يفهم'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 次 (cì)؟', options: ['مرّة (كلمة عدّ للمرّات)','يساعد','آسف','يفهم'], correct: 0 }
    ],
  },
  {
    id: 2, title: 'المواصلات والأماكن', titleZh: '坐车去哪儿', level: 'HSK2',
    vocabularyIds: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2190, 2194],
    grammarIds: [211],
    keySentences: [
      { zh: '啊', pinyin: 'a', arabic: 'آه / أداة تعجّب', audioAvailable: true },
      { zh: '别', pinyin: 'bié', arabic: 'لا تفعل (نهي)', audioAvailable: true },
      { zh: '车站', pinyin: 'chēzhàn', arabic: 'محطة (حافلات/قطار)', audioAvailable: true },
      { zh: '打车', pinyin: 'dǎchē', arabic: 'يأخذ سيارة أجرة', audioAvailable: true },
      { zh: '但', pinyin: 'dàn', arabic: 'لكن', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 啊 (a)؟', options: ['آه','لا تفعل (نهي)','محطة (حافلات/قطار)','يأخذ سيارة أجرة'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 别 (bié)؟', options: ['لا تفعل (نهي)','آه','محطة (حافلات/قطار)','يأخذ سيارة أجرة'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 车站 (chēzhàn)؟', options: ['محطة (حافلات/قطار)','آه','لا تفعل (نهي)','يأخذ سيارة أجرة'], correct: 0 }
    ],
  },
  {
    id: 3, title: 'الأنشطة اليومية', titleZh: '日常生活', level: 'HSK2',
    vocabularyIds: [2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042],
    grammarIds: [210],
    keySentences: [
      { zh: '不错', pinyin: 'búcuò', arabic: 'جيّد / لا بأس به', audioAvailable: true },
      { zh: '出去', pinyin: 'chūqù', arabic: 'يخرج', audioAvailable: true },
      { zh: '回来', pinyin: 'huílái', arabic: 'يعود / يرجع', audioAvailable: true },
      { zh: '回去', pinyin: 'huíqù', arabic: 'يعود (بعيداً)', audioAvailable: true },
      { zh: '累', pinyin: 'lèi', arabic: 'متعب', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 不错 (búcuò)؟', options: ['جيّد','يخرج','يعود','يعود (بعيداً)'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 出去 (chūqù)؟', options: ['يخرج','جيّد','يعود','يعود (بعيداً)'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 回来 (huílái)؟', options: ['يعود','جيّد','يخرج','يعود (بعيداً)'], correct: 0 }
    ],
  },
  {
    id: 4, title: 'الألوان والتسوق', titleZh: '颜色和商场', level: 'HSK2',
    vocabularyIds: [2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055, 2056],
    grammarIds: [203],
    keySentences: [
      { zh: '白色', pinyin: 'báisè', arabic: 'اللون الأبيض', audioAvailable: true },
      { zh: '黑色', pinyin: 'hēisè', arabic: 'اللون الأسود', audioAvailable: true },
      { zh: '红色', pinyin: 'hóngsè', arabic: 'اللون الأحمر', audioAvailable: true },
      { zh: '绿色', pinyin: 'lǜsè', arabic: 'اللون الأخضر', audioAvailable: true },
      { zh: '颜色', pinyin: 'yánsè', arabic: 'لون', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 白色 (báisè)؟', options: ['اللون الأبيض','اللون الأسود','اللون الأحمر','اللون الأخضر'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 黑色 (hēisè)؟', options: ['اللون الأسود','اللون الأبيض','اللون الأحمر','اللون الأخضر'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 红色 (hóngsè)؟', options: ['اللون الأحمر','اللون الأبيض','اللون الأسود','اللون الأخضر'], correct: 0 }
    ],
  },
  {
    id: 5, title: 'في الفندق والانتظار', titleZh: '在酒店', level: 'HSK2',
    vocabularyIds: [2057, 2058, 2059, 2060, 2061, 2062, 2063, 2064, 2065, 2066, 2067, 2068, 2069, 2070, 2071, 2072, 2073],
    grammarIds: [211, 214],
    keySentences: [
      { zh: '等', pinyin: 'děng', arabic: 'ينتظر', audioAvailable: true },
      { zh: '跟', pinyin: 'gēn', arabic: 'مع', audioAvailable: true },
      { zh: '酒店', pinyin: 'jiǔdiàn', arabic: 'فندق', audioAvailable: true },
      { zh: '快', pinyin: 'kuài', arabic: 'سريع', audioAvailable: true },
      { zh: '面', pinyin: 'miàn', arabic: 'نودلز / وجه', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 等 (děng)؟', options: ['ينتظر','مع','فندق','سريع'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 跟 (gēn)؟', options: ['مع','ينتظر','فندق','سريع'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 酒店 (jiǔdiàn)؟', options: ['فندق','ينتظر','مع','سريع'], correct: 0 }
    ],
  },
  {
    id: 6, title: 'الطعام والمشاعر', titleZh: '生日快乐', level: 'HSK2',
    vocabularyIds: [2074, 2075, 2076, 2077, 2078, 2079, 2080, 2081, 2082, 2083, 2084, 2085, 2086],
    grammarIds: [206, 208, 210],
    keySentences: [
      { zh: '长', pinyin: 'cháng', arabic: 'طويل', audioAvailable: true },
      { zh: '床', pinyin: 'chuáng', arabic: 'سرير', audioAvailable: true },
      { zh: '打开', pinyin: 'dǎkāi', arabic: 'يفتح / يشغّل', audioAvailable: true },
      { zh: '地', pinyin: 'de', arabic: 'أداة تحويل إلى ظرف (地)', audioAvailable: true },
      { zh: '画', pinyin: 'huà', arabic: 'يرسم / لوحة', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 长 (cháng)؟', options: ['طويل','سرير','يفتح','أداة تحويل إلى ظرف (地)'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 床 (chuáng)؟', options: ['سرير','طويل','يفتح','أداة تحويل إلى ظرف (地)'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 打开 (dǎkāi)؟', options: ['يفتح','طويل','سرير','أداة تحويل إلى ظرف (地)'], correct: 0 }
    ],
  },
  {
    id: 7, title: 'الرياضة والهوايات', titleZh: '我的爱好', level: 'HSK2',
    vocabularyIds: [2087, 2088, 2089, 2090, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099, 2100, 2101],
    grammarIds: [205],
    keySentences: [
      { zh: '爱好', pinyin: 'àihào', arabic: 'هواية', audioAvailable: true },
      { zh: '打', pinyin: 'dǎ', arabic: 'يضرب / يمارس / يتّصل', audioAvailable: true },
      { zh: '得', pinyin: 'de', arabic: 'أداة الوصف بعد الفعل (得)', audioAvailable: true },
      { zh: '从', pinyin: 'cóng', arabic: 'من (نقطة بداية)', audioAvailable: true },
      { zh: '开始', pinyin: 'kāishǐ', arabic: 'يبدأ', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 爱好 (àihào)؟', options: ['هواية','يضرب','أداة الوصف بعد الفعل (得)','من (نقطة بداية)'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 打 (dǎ)؟', options: ['يضرب','هواية','أداة الوصف بعد الفعل (得)','من (نقطة بداية)'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 得 (de)؟', options: ['أداة الوصف بعد الفعل (得)','هواية','يضرب','من (نقطة بداية)'], correct: 0 }
    ],
  },
  {
    id: 8, title: 'المقارنة والعائلة', titleZh: '我的家人', level: 'HSK2',
    vocabularyIds: [2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2110, 2111, 2112, 2113],
    grammarIds: [202, 204, 208],
    keySentences: [
      { zh: '比', pinyin: 'bǐ', arabic: 'مقارنةً بـ (أداة مقارنة)', audioAvailable: true },
      { zh: '但是', pinyin: 'dànshì', arabic: 'لكن', audioAvailable: true },
      { zh: '点', pinyin: 'diǎn', arabic: 'يطلب (طعاماً) / نقطة', audioAvailable: true },
      { zh: '饭馆', pinyin: 'fànguǎn', arabic: 'مطعم', audioAvailable: true },
      { zh: '记得', pinyin: 'jìde', arabic: 'يتذكّر', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 比 (bǐ)؟', options: ['مقارنةً بـ (أداة مقارنة)','لكن','يطلب (طعاماً)','مطعم'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 但是 (dànshì)؟', options: ['لكن','مقارنةً بـ (أداة مقارنة)','يطلب (طعاماً)','مطعم'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 点 (diǎn)؟', options: ['يطلب (طعاماً)','مقارنةً بـ (أداة مقارنة)','لكن','مطعم'], correct: 0 }
    ],
  },
  {
    id: 9, title: 'الأماكن والاتجاهات', titleZh: '问路', level: 'HSK2',
    vocabularyIds: [2114, 2115, 2116, 2117, 2118, 2119, 2120, 2121, 2122, 2123, 2124, 2125],
    grammarIds: [213],
    keySentences: [
      { zh: '咖啡', pinyin: 'kāfēi', arabic: 'قهوة', audioAvailable: true },
      { zh: '高', pinyin: 'gāo', arabic: 'طويل / عالٍ', audioAvailable: true },
      { zh: '个子', pinyin: 'gèzi', arabic: 'القامة / الطول', audioAvailable: true },
      { zh: '近', pinyin: 'jìn', arabic: 'قريب', audioAvailable: true },
      { zh: '离', pinyin: 'lí', arabic: 'عن / يبعد عن', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 咖啡 (kāfēi)؟', options: ['قهوة','طويل','القامة','قريب'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 高 (gāo)؟', options: ['طويل','قهوة','القامة','قريب'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 个子 (gèzi)؟', options: ['القامة','قهوة','طويل','قريب'], correct: 0 }
    ],
  },
  {
    id: 10, title: 'الدراسة والامتحانات', titleZh: '考试', level: 'HSK2',
    vocabularyIds: [2126, 2127, 2128, 2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136, 2192],
    grammarIds: [209],
    keySentences: [
      { zh: '帮', pinyin: 'bāng', arabic: 'يساعد', audioAvailable: true },
      { zh: '本子', pinyin: 'běnzi', arabic: 'دفتر', audioAvailable: true },
      { zh: '词', pinyin: 'cí', arabic: 'كلمة / مفردة', audioAvailable: true },
      { zh: '错', pinyin: 'cuò', arabic: 'خطأ', audioAvailable: true },
      { zh: '后面', pinyin: 'hòumiàn', arabic: 'الخلف / وراء', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 帮 (bāng)؟', options: ['يساعد','دفتر','كلمة','خطأ'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 本子 (běnzi)؟', options: ['دفتر','يساعد','كلمة','خطأ'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 词 (cí)؟', options: ['كلمة','يساعد','دفتر','خطأ'], correct: 0 }
    ],
  },
  {
    id: 11, title: 'الصحة والجسم', titleZh: '看病', level: 'HSK2',
    vocabularyIds: [2137, 2138, 2139, 2140, 2141, 2142, 2143, 2144, 2145, 2146, 2147, 2148],
    grammarIds: [207, 215],
    keySentences: [
      { zh: '动', pinyin: 'dòng', arabic: 'يتحرّك', audioAvailable: true },
      { zh: '经常', pinyin: 'jīngcháng', arabic: 'غالباً / كثيراً ما', audioAvailable: true },
      { zh: '路上', pinyin: 'lùshang', arabic: 'في الطريق', audioAvailable: true },
      { zh: '慢', pinyin: 'màn', arabic: 'بطيء', audioAvailable: true },
      { zh: '身体', pinyin: 'shēntǐ', arabic: 'الجسم / الصحّة', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 动 (dòng)؟', options: ['يتحرّك','غالباً','في الطريق','بطيء'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 经常 (jīngcháng)؟', options: ['غالباً','يتحرّك','في الطريق','بطيء'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 路上 (lùshang)؟', options: ['في الطريق','يتحرّك','غالباً','بطيء'], correct: 0 }
    ],
  },
  {
    id: 12, title: 'الطقس والمدينة', titleZh: '天气', level: 'HSK2',
    vocabularyIds: [2149, 2150, 2151, 2152, 2153, 2154, 2155, 2156, 2157, 2158, 2191],
    grammarIds: [206],
    keySentences: [
      { zh: '从小', pinyin: 'cóngxiǎo', arabic: 'منذ الصغر', audioAvailable: true },
      { zh: '地铁', pinyin: 'dìtiě', arabic: 'مترو الأنفاق', audioAvailable: true },
      { zh: '楼', pinyin: 'lóu', arabic: 'مبنى / طابق', audioAvailable: true },
      { zh: '晴', pinyin: 'qíng', arabic: 'صحو (طقس)', audioAvailable: true },
      { zh: '阴', pinyin: 'yīn', arabic: 'غائم', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 从小 (cóngxiǎo)؟', options: ['منذ الصغر','مترو الأنفاق','مبنى','صحو (طقس)'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 地铁 (dìtiě)؟', options: ['مترو الأنفاق','منذ الصغر','مبنى','صحو (طقس)'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 楼 (lóu)؟', options: ['مبنى','منذ الصغر','مترو الأنفاق','صحو (طقس)'], correct: 0 }
    ],
  },
  {
    id: 13, title: 'الفصل والإنترنت', titleZh: '上网', level: 'HSK2',
    vocabularyIds: [2159, 2160, 2161, 2162, 2163, 2164, 2165, 2166, 2167, 2168, 2169],
    grammarIds: [201],
    keySentences: [
      { zh: '班', pinyin: 'bān', arabic: 'صف / مجموعة دراسية', audioAvailable: true },
      { zh: '告诉', pinyin: 'gàosu', arabic: 'يخبر', audioAvailable: true },
      { zh: '教', pinyin: 'jiāo', arabic: 'يُعلّم / يدرّس', audioAvailable: true },
      { zh: '可能', pinyin: 'kěnéng', arabic: 'ربما / محتمل', audioAvailable: true },
      { zh: '里面', pinyin: 'lǐmiàn', arabic: 'الداخل / بداخل', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 班 (bān)؟', options: ['صف','يخبر','يُعلّم','ربما'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 告诉 (gàosu)؟', options: ['يخبر','صف','يُعلّم','ربما'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 教 (jiāo)؟', options: ['يُعلّم','صف','يخبر','ربما'], correct: 0 }
    ],
  },
  {
    id: 14, title: 'الاحتفالات والأشخاص', titleZh: '过年', level: 'HSK2',
    vocabularyIds: [2170, 2171, 2172, 2173, 2174, 2175, 2176, 2177, 2178, 2179],
    grammarIds: [208],
    keySentences: [
      { zh: '包', pinyin: 'bāo', arabic: 'حقيبة / كيس', audioAvailable: true },
      { zh: '过年', pinyin: 'guònián', arabic: 'يحتفل برأس السنة', audioAvailable: true },
      { zh: '没意思', pinyin: 'méiyìsi', arabic: 'ممل / غير مشوّق', audioAvailable: true },
      { zh: '女孩儿', pinyin: 'nǚháir', arabic: 'فتاة / بنت', audioAvailable: true },
      { zh: '前面', pinyin: 'qiánmiàn', arabic: 'الأمام / أمام', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 包 (bāo)؟', options: ['حقيبة','يحتفل برأس السنة','ممل','فتاة'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 过年 (guònián)؟', options: ['يحتفل برأس السنة','حقيبة','ممل','فتاة'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 没意思 (méiyìsi)؟', options: ['ممل','حقيبة','يحتفل برأس السنة','فتاة'], correct: 0 }
    ],
  },
  {
    id: 15, title: 'السفر والمطار', titleZh: '去机场', level: 'HSK2',
    vocabularyIds: [2180, 2181, 2182, 2183, 2184, 2185, 2186, 2187, 2188, 2189, 2195],
    grammarIds: [211],
    keySentences: [
      { zh: '出国', pinyin: 'chūguó', arabic: 'يسافر للخارج', audioAvailable: true },
      { zh: '出门', pinyin: 'chūmén', arabic: 'يخرج من البيت', audioAvailable: true },
      { zh: '飞', pinyin: 'fēi', arabic: 'يطير', audioAvailable: true },
      { zh: '高中', pinyin: 'gāozhōng', arabic: 'المرحلة الثانوية', audioAvailable: true },
      { zh: '机场', pinyin: 'jīchǎng', arabic: 'مطار', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 出国 (chūguó)؟', options: ['يسافر للخارج','يخرج من البيت','يطير','المرحلة الثانوية'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 出门 (chūmén)؟', options: ['يخرج من البيت','يسافر للخارج','يطير','المرحلة الثانوية'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 飞 (fēi)؟', options: ['يطير','يسافر للخارج','يخرج من البيت','المرحلة الثانوية'], correct: 0 }
    ],
  },
];
