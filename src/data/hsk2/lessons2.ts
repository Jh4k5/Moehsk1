import type { Lesson } from '../lessons';

// HSK2 lessons — from New HSK Course 2 (15 lessons). vocabularyIds use HSK2 ids (2001+).
export const lessons2: Lesson[] = [
  {
    id: 1, title: 'التعارف والمساعدة', titleZh: '初次见面', level: 'HSK2',
    vocabularyIds: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2193],
    grammarIds: [201, 212],
    keySentences: [
      { zh: "不好意思，我不懂。", pinyin: "Bùhǎoyìsi, wǒ bù dǒng.", arabic: "المعذرة، لم أفهم.", audioAvailable: true },
      { zh: "我给你介绍一下。", pinyin: "Wǒ gěi nǐ jièshào yíxià.", arabic: "دعني أعرّفك.", audioAvailable: true },
      { zh: "你能帮我一个忙吗？", pinyin: "Nǐ néng bāng wǒ yí ge máng ma?", arabic: "هل يمكنك مساعدتي؟", audioAvailable: true },
      { zh: "我已经去过一次北京了。", pinyin: "Wǒ yǐjīng qùguo yí cì Běijīng le.", arabic: "سبق أن ذهبتُ إلى بكين مرة.", audioAvailable: true },
      { zh: "他让我一起去旅游。", pinyin: "Tā ràng wǒ yìqǐ qù lǚyóu.", arabic: "طلب مني أن أسافر معه.", audioAvailable: true },
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
      { zh: "车站离这儿远吗？", pinyin: "Chēzhàn lí zhèr yuǎn ma?", arabic: "هل المحطة بعيدة عن هنا؟", audioAvailable: true },
      { zh: "别打车，我们坐公交车吧。", pinyin: "Bié dǎchē, wǒmen zuò gōngjiāochē ba.", arabic: "لا تأخذ تاكسي، لنركب الحافلة.", audioAvailable: true },
      { zh: "我在网上买了票。", pinyin: "Wǒ zài wǎngshang mǎile piào.", arabic: "اشتريتُ التذكرة عبر الإنترنت.", audioAvailable: true },
      { zh: "你过来一下，教室在这间。", pinyin: "Nǐ guòlái yíxià, jiàoshì zài zhè jiān.", arabic: "تعال لحظة، الفصل في هذه الغرفة.", audioAvailable: true },
      { zh: "你是中国人还是外国人？", pinyin: "Nǐ shì Zhōngguó rén háishi wàiguó rén?", arabic: "هل أنت صيني أم أجنبي؟", audioAvailable: true },
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
      { zh: "我今天很累，不想出去。", pinyin: "Wǒ jīntiān hěn lèi, bù xiǎng chūqù.", arabic: "أنا متعب اليوم، لا أريد الخروج.", audioAvailable: true },
      { zh: "你为什么这么早回来？", pinyin: "Nǐ wèishénme zhème zǎo huílái?", arabic: "لماذا عدتَ مبكراً هكذا؟", audioAvailable: true },
      { zh: "我洗完手就来。", pinyin: "Wǒ xǐwán shǒu jiù lái.", arabic: "سآتي حالما أنتهي من غسل يديّ.", audioAvailable: true },
      { zh: "这些东西我自己拿。", pinyin: "Zhèxiē dōngxi wǒ zìjǐ ná.", arabic: "سأحمل هذه الأغراض بنفسي.", audioAvailable: true },
      { zh: "我每天送孩子上学。", pinyin: "Wǒ měi tiān sòng háizi shàngxué.", arabic: "أوصّل الطفل إلى المدرسة كل يوم.", audioAvailable: true },
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
      { zh: "你喜欢什么颜色？", pinyin: "Nǐ xǐhuan shénme yánsè?", arabic: "أي لون تحبّ؟", audioAvailable: true },
      { zh: "这条裤子是黑色的。", pinyin: "Zhè tiáo kùzi shì hēisè de.", arabic: "هذا البنطال أسود.", audioAvailable: true },
      { zh: "因为下雨，所以我没去商场。", pinyin: "Yīnwèi xiàyǔ, suǒyǐ wǒ méi qù shāngchǎng.", arabic: "لأن السماء أمطرت، لم أذهب إلى المركز التجاري.", audioAvailable: true },
      { zh: "书包在右边。", pinyin: "Shūbāo zài yòubian.", arabic: "الحقيبة على اليمين.", audioAvailable: true },
      { zh: "我们进去看看吧。", pinyin: "Wǒmen jìnqù kànkan ba.", arabic: "لندخل ونلقِ نظرة.", audioAvailable: true },
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
      { zh: "请等一会儿。", pinyin: "Qǐng děng yíhuìr.", arabic: "انتظر لحظة من فضلك.", audioAvailable: true },
      { zh: "我跟爷爷奶奶住在一起。", pinyin: "Wǒ gēn yéye nǎinai zhù zài yìqǐ.", arabic: "أسكن مع جدّي وجدّتي.", audioAvailable: true },
      { zh: "酒店在下面，我们下去吧。", pinyin: "Jiǔdiàn zài xiàmian, wǒmen xiàqù ba.", arabic: "الفندق في الأسفل، لننزل.", audioAvailable: true },
      { zh: "你快准备一下，我们走。", pinyin: "Nǐ kuài zhǔnbèi yíxià, wǒmen zǒu.", arabic: "استعدّ بسرعة، سنذهب.", audioAvailable: true },
      { zh: "我想喝一杯奶茶。", pinyin: "Wǒ xiǎng hē yì bēi nǎichá.", arabic: "أريد كوب شاي بالحليب.", audioAvailable: true },
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
      { zh: "生日快乐！", pinyin: "Shēngrì kuàilè!", arabic: "عيد ميلاد سعيد!", audioAvailable: true },
      { zh: "我忘了打开门。", pinyin: "Wǒ wàngle dǎkāi mén.", arabic: "نسيتُ أن أفتح الباب.", audioAvailable: true },
      { zh: "他高兴地画了画儿。", pinyin: "Tā gāoxìng de huàle huàr.", arabic: "رسم بسعادة.", audioAvailable: true },
      { zh: "我今天不太舒服。", pinyin: "Wǒ jīntiān bú tài shūfu.", arabic: "لستُ بحال جيدة اليوم.", audioAvailable: true },
      { zh: "我没吃过这个鱼。", pinyin: "Wǒ méi chīguo zhège yú.", arabic: "لم يسبق أن أكلتُ هذا السمك.", audioAvailable: true },
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
      { zh: "我的爱好是打篮球。", pinyin: "Wǒ de àihào shì dǎ lánqiú.", arabic: "هوايتي لعب كرة السلة.", audioAvailable: true },
      { zh: "他跑得很快。", pinyin: "Tā pǎo de hěn kuài.", arabic: "يجري بسرعة.", audioAvailable: true },
      { zh: "我们从八点开始运动。", pinyin: "Wǒmen cóng bā diǎn kāishǐ yùndòng.", arabic: "نبدأ الرياضة من الثامنة.", audioAvailable: true },
      { zh: "你会踢足球吗？", pinyin: "Nǐ huì tī zúqiú ma?", arabic: "هل تجيد لعب كرة القدم؟", audioAvailable: true },
      { zh: "我每天早上去游泳。", pinyin: "Wǒ měi tiān zǎoshang qù yóuyǒng.", arabic: "أذهب للسباحة كل صباح.", audioAvailable: true },
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
      { zh: "他比我高。", pinyin: "Tā bǐ wǒ gāo.", arabic: "هو أطول مني.", audioAvailable: true },
      { zh: "虽然很累，但是很有意思。", pinyin: "Suīrán hěn lèi, dànshì hěn yǒu yìsi.", arabic: "رغم التعب، لكنه ممتع جداً.", audioAvailable: true },
      { zh: "我的手表在左边。", pinyin: "Wǒ de shǒubiǎo zài zuǒbian.", arabic: "ساعتي على اليسار.", audioAvailable: true },
      { zh: "你还记得那家饭馆吗？", pinyin: "Nǐ hái jìde nà jiā fànguǎn ma?", arabic: "هل ما زلت تتذكّر ذلك المطعم؟", audioAvailable: true },
      { zh: "我丈夫在饭馆工作。", pinyin: "Wǒ zhàngfu zài fànguǎn gōngzuò.", arabic: "زوجي يعمل في مطعم.", audioAvailable: true },
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
      { zh: "请问，咖啡店离这儿远吗？", pinyin: "Qǐngwèn, kāfēi diàn lí zhèr yuǎn ma?", arabic: "عفواً، هل المقهى بعيد عن هنا؟", audioAvailable: true },
      { zh: "不远，就在旁边。", pinyin: "Bù yuǎn, jiù zài pángbiān.", arabic: "ليس بعيداً، إنه بالجوار تماماً.", audioAvailable: true },
      { zh: "那个男孩儿个子很高。", pinyin: "Nàge nánháir gèzi hěn gāo.", arabic: "ذلك الصبي طويل القامة.", audioAvailable: true },
      { zh: "我每周走路去学校。", pinyin: "Wǒ měi zhōu zǒulù qù xuéxiào.", arabic: "أمشي إلى المدرسة كل أسبوع.", audioAvailable: true },
      { zh: "他在门口等你。", pinyin: "Tā zài ménkǒu děng nǐ.", arabic: "ينتظرك عند المدخل.", audioAvailable: true },
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
      { zh: "快要考试了。", pinyin: "Kuàiyào kǎoshì le.", arabic: "الامتحان على وشك أن يبدأ.", audioAvailable: true },
      { zh: "这个词我写错了。", pinyin: "Zhège cí wǒ xiěcuò le.", arabic: "كتبتُ هذه الكلمة خطأً.", audioAvailable: true },
      { zh: "你能帮我看看这个题吗？", pinyin: "Nǐ néng bāng wǒ kànkan zhège tí ma?", arabic: "هل يمكنك أن تنظر في هذه المسألة؟", audioAvailable: true },
      { zh: "九月开学。", pinyin: "Jiǔ yuè kāixué.", arabic: "الدراسة تبدأ في سبتمبر.", audioAvailable: true },
      { zh: "我的本子和笔在后面。", pinyin: "Wǒ de běnzi hé bǐ zài hòumiàn.", arabic: "دفتري وقلمي في الخلف.", audioAvailable: true },
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
      { zh: "我头疼，想去药店买药。", pinyin: "Wǒ tóu téng, xiǎng qù yàodiàn mǎi yào.", arabic: "رأسي يؤلمني، أريد شراء دواء من الصيدلية.", audioAvailable: true },
      { zh: "你身体怎么样？", pinyin: "Nǐ shēntǐ zěnmeyàng?", arabic: "كيف صحتك؟", audioAvailable: true },
      { zh: "他站着说话。", pinyin: "Tā zhànzhe shuōhuà.", arabic: "يتحدث وهو واقف.", audioAvailable: true },
      { zh: "路上慢一点儿。", pinyin: "Lùshang màn yìdiǎnr.", arabic: "تمهّل في الطريق.", audioAvailable: true },
      { zh: "我经常运动，这是最好的药。", pinyin: "Wǒ jīngcháng yùndòng, zhè shì zuì hǎo de yào.", arabic: "أمارس الرياضة كثيراً، وهي أفضل دواء.", audioAvailable: true },
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
      { zh: "今天是晴天，不是阴天。", pinyin: "Jīntiān shì qíngtiān, bú shì yīntiān.", arabic: "اليوم صحو لا غائم.", audioAvailable: true },
      { zh: "外面正下雨。", pinyin: "Wàimiàn zhèng xiàyǔ.", arabic: "تمطر في الخارج الآن.", audioAvailable: true },
      { zh: "我从小住在这个楼里。", pinyin: "Wǒ cóngxiǎo zhù zài zhège lóu li.", arabic: "أسكن في هذا المبنى منذ صغري.", audioAvailable: true },
      { zh: "我坐地铁去上班。", pinyin: "Wǒ zuò dìtiě qù shàngbān.", arabic: "أذهب إلى العمل بالمترو.", audioAvailable: true },
      { zh: "小时候我常在这个站等车。", pinyin: "Xiǎoshíhou wǒ cháng zài zhège zhàn děng chē.", arabic: "في طفولتي كنتُ أنتظر الحافلة في هذه المحطة.", audioAvailable: true },
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
      { zh: "老师告诉我们，明天上网课。", pinyin: "Lǎoshī gàosu wǒmen, míngtiān shàng wǎngkè.", arabic: "أخبرنا المعلم أن الدرس غداً عبر الإنترنت.", audioAvailable: true },
      { zh: "洗手间在里面。", pinyin: "Xǐshǒujiān zài lǐmiàn.", arabic: "دورة المياه في الداخل.", audioAvailable: true },
      { zh: "他是在这个班学的中文。", pinyin: "Tā shì zài zhège bān xué de Zhōngwén.", arabic: "تعلّم الصينية في هذا الصف تحديداً.", audioAvailable: true },
      { zh: "我希望你能来。", pinyin: "Wǒ xīwàng nǐ néng lái.", arabic: "أتمنى أن تستطيع المجيء.", audioAvailable: true },
      { zh: "上面的花很漂亮。", pinyin: "Shàngmiàn de huā hěn piàoliang.", arabic: "الزهور في الأعلى جميلة جداً.", audioAvailable: true },
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
      { zh: "我们回家过年。", pinyin: "Wǒmen huí jiā guònián.", arabic: "نعود إلى البيت للاحتفال برأس السنة.", audioAvailable: true },
      { zh: "那位女孩儿的眼睛很大。", pinyin: "Nà wèi nǚháir de yǎnjing hěn dà.", arabic: "عينا تلك الفتاة كبيرتان.", audioAvailable: true },
      { zh: "你姓什么？", pinyin: "Nǐ xìng shénme?", arabic: "ما اسم عائلتك؟", audioAvailable: true },
      { zh: "我学过跳舞。", pinyin: "Wǒ xuéguo tiàowǔ.", arabic: "سبق أن تعلّمتُ الرقص.", audioAvailable: true },
      { zh: "这个电影没意思。", pinyin: "Zhège diànyǐng méi yìsi.", arabic: "هذا الفيلم ممل.", audioAvailable: true },
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
      { zh: "我买了去北京的机票。", pinyin: "Wǒ mǎile qù Běijīng de jīpiào.", arabic: "اشتريتُ تذكرة طيران إلى بكين.", audioAvailable: true },
      { zh: "我们八点出门去机场。", pinyin: "Wǒmen bā diǎn chūmén qù jīchǎng.", arabic: "نخرج في الثامنة إلى المطار.", audioAvailable: true },
      { zh: "颐和园的门票多少钱？", pinyin: "Yíhé Yuán de ménpiào duōshao qián?", arabic: "بكم تذكرة دخول قصر الصيف؟", audioAvailable: true },
      { zh: "鸟在天上飞。", pinyin: "Niǎo zài tiān shàng fēi.", arabic: "الطيور تطير في السماء.", audioAvailable: true },
      { zh: "请写上你的姓名。", pinyin: "Qǐng xiě shàng nǐ de xìngmíng.", arabic: "من فضلك اكتب اسمك الكامل.", audioAvailable: true },
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 出国 (chūguó)؟', options: ['يسافر للخارج','يخرج من البيت','يطير','المرحلة الثانوية'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 出门 (chūmén)؟', options: ['يخرج من البيت','يسافر للخارج','يطير','المرحلة الثانوية'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 飞 (fēi)؟', options: ['يطير','يسافر للخارج','يخرج من البيت','المرحلة الثانوية'], correct: 0 }
    ],
  },
];
