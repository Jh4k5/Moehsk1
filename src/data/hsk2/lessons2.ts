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
    conversations: [
      {
        id: 'H2L1C1',
        title: 'أول لقاء في الجامعة',
        scene: '🏫 أول يوم في قاعة الدرس',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '你好！我是新来的学生。', pinyin: 'Nǐ hǎo! Wǒ shì xīn lái de xuésheng.', arabic: 'مرحباً! أنا طالبة جديدة.' },
          { speaker: 'B', name: 'أحمد', zh: '你好！我给你介绍一个朋友吧。', pinyin: 'Nǐ hǎo! Wǒ gěi nǐ jièshào yí ge péngyou ba.', arabic: 'مرحباً! دعيني أعرّفك على صديق.' },
          { speaker: 'A', name: 'ليلى', zh: '太好了，谢谢你帮忙。', pinyin: 'Tài hǎo le, xièxie nǐ bāngmáng.', arabic: 'رائع، شكراً على مساعدتك.' },
          { speaker: 'B', name: 'أحمد', zh: '不客气。你已经来过北京吗？', pinyin: 'Bú kèqi. Nǐ yǐjīng lái guo Běijīng ma?', arabic: 'عفواً. هل سبق أن جئتِ إلى بكين؟' },
          { speaker: 'A', name: 'ليلى', zh: '来过一次，那次我是来旅游的。', pinyin: 'Lái guo yí cì, nà cì wǒ shì lái lǚyóu de.', arabic: 'جئتُ مرة واحدة، وكانت تلك المرة للسياحة.' },
          { speaker: 'B', name: 'أحمد', zh: '那我请你吃北京烤鸭！', pinyin: 'Nà wǒ qǐng nǐ chī Běijīng kǎoyā!', arabic: 'إذن سأدعوك لأكل بطة بكين المشوية!' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L2C1',
        title: 'أيّ وسيلة إلى الجامعة؟',
        scene: '🚌 عند محطة الحافلات',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '请问，去北京大学坐公交车还是打车？', pinyin: 'Qǐngwèn, qù Běijīng Dàxué zuò gōngjiāochē háishi dǎchē?', arabic: 'عفواً، هل أذهب إلى جامعة بكين بالحافلة أم بسيارة أجرة؟' },
          { speaker: 'B', name: 'عمر', zh: '坐公交车吧，车站就在前面。', pinyin: 'Zuò gōngjiāochē ba, chēzhàn jiù zài qiánmiàn.', arabic: 'خذي الحافلة، فالمحطة أمامك مباشرة.' },
          { speaker: 'A', name: 'سارة', zh: '远吗？', pinyin: 'Yuǎn ma?', arabic: 'هل هي بعيدة؟' },
          { speaker: 'B', name: 'عمر', zh: '不太远，但是要坐半个小时。', pinyin: 'Bú tài yuǎn, dànshì yào zuò bàn ge xiǎoshí.', arabic: 'ليست بعيدة جداً، لكن الرحلة نصف ساعة.' },
          { speaker: 'A', name: 'سارة', zh: '啊，那我在网上买票吧。', pinyin: 'A, nà wǒ zài wǎngshang mǎi piào ba.', arabic: 'آه، إذن سأشتري التذكرة عبر الإنترنت.' },
          { speaker: 'B', name: 'عمر', zh: '别在网上买，上车再买。', pinyin: 'Bié zài wǎngshang mǎi, shàng chē zài mǎi.', arabic: 'لا تشتريها عبر الإنترنت، اشتريها بعد ركوب الحافلة.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L3C1',
        title: 'بعد يوم طويل',
        scene: '🏠 في البيت مساءً بعد العمل',
        turns: [
          { speaker: 'A', name: 'نورة', zh: '你怎么这么累？', pinyin: 'Nǐ zěnme zhème lèi?', arabic: 'لماذا أنت متعب إلى هذه الدرجة؟' },
          { speaker: 'B', name: 'خالد', zh: '我每天走路上班，回来得很晚。', pinyin: 'Wǒ měitiān zǒulù shàngbān, huílái de hěn wǎn.', arabic: 'أذهب إلى العمل مشياً كل يوم، وأعود متأخراً.' },
          { speaker: 'A', name: 'نورة', zh: '洗洗手，我们一起吃饭吧。', pinyin: 'Xǐxi shǒu, wǒmen yìqǐ chīfàn ba.', arabic: 'اغسل يديك، ولنأكل معاً.' },
          { speaker: 'B', name: 'خالد', zh: '好，我自己拿杯子。', pinyin: 'Hǎo, wǒ zìjǐ ná bēizi.', arabic: 'حسناً، سآخذ الكوب بنفسي.' },
          { speaker: 'A', name: 'نورة', zh: '吃完饭我们出去走走，怎么样？', pinyin: 'Chī wán fàn wǒmen chūqù zǒuzou, zěnmeyàng?', arabic: 'بعد الأكل نخرج للمشي، ما رأيك؟' },
          { speaker: 'B', name: 'خالد', zh: '不错！我们早点儿回来。', pinyin: 'Búcuò! Wǒmen zǎo diǎnr huílái.', arabic: 'فكرة جيدة! لنعد مبكراً.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L4C1',
        title: 'اختيار الألوان',
        scene: '🛍️ في مركز التسوّق',
        turns: [
          { speaker: 'A', name: 'مريم', zh: '你喜欢什么颜色的书包？', pinyin: 'Nǐ xǐhuan shénme yánsè de shūbāo?', arabic: 'أيّ لون من الحقائب المدرسية تحبّ؟' },
          { speaker: 'B', name: 'يوسف', zh: '我喜欢黑色的，因为很好看。', pinyin: 'Wǒ xǐhuan hēisè de, yīnwèi hěn hǎokàn.', arabic: 'أحبّ الأسود، لأنه جميل.' },
          { speaker: 'A', name: 'مريم', zh: '这条裤子是红色的，好看吗？', pinyin: 'Zhè tiáo kùzi shì hóngsè de, hǎokàn ma?', arabic: 'هذا البنطال أحمر، هل هو جميل؟' },
          { speaker: 'B', name: 'يوسف', zh: '好看！右边还有白色和绿色的。', pinyin: 'Hǎokàn! Yòubian hái yǒu báisè hé lǜsè de.', arabic: 'جميل! وعلى اليمين أيضاً أبيض وأخضر.' },
          { speaker: 'A', name: 'مريم', zh: '我们进去看看吧。', pinyin: 'Wǒmen jìnqù kànkan ba.', arabic: 'لندخل ونلقِ نظرة.' },
          { speaker: 'B', name: 'يوسف', zh: '好，这个商场的东西不太贵。', pinyin: 'Hǎo, zhège shāngchǎng de dōngxi bú tài guì.', arabic: 'حسناً، بضائع هذا المركز ليست غالية.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L5C1',
        title: 'في انتظار الجدّين',
        scene: '🏨 في بهو الفندق',
        turns: [
          { speaker: 'A', name: 'هدى', zh: '请进来！爷爷和奶奶已经到了吗？', pinyin: 'Qǐng jìnlái! Yéye hé nǎinai yǐjīng dào le ma?', arabic: 'تفضّل بالدخول! هل وصل الجدّ والجدّة؟' },
          { speaker: 'B', name: 'سامي', zh: '他们在下面，一会儿就上来。', pinyin: 'Tāmen zài xiàmian, yíhuìr jiù shànglái.', arabic: 'هما في الأسفل، وسيصعدان بعد قليل.' },
          { speaker: 'A', name: 'هدى', zh: '我跟你一起下去等他们吧。', pinyin: 'Wǒ gēn nǐ yìqǐ xiàqù děng tāmen ba.', arabic: 'سأنزل معك لانتظارهما.' },
          { speaker: 'B', name: 'سامي', zh: '好，我先准备一下房间。', pinyin: 'Hǎo, wǒ xiān zhǔnbèi yíxià fángjiān.', arabic: 'حسناً، سأجهّز الغرفة أولاً.' },
          { speaker: 'A', name: 'هدى', zh: '快点儿，我们下去喝奶茶。', pinyin: 'Kuài diǎnr, wǒmen xiàqù hē nǎichá.', arabic: 'أسرع، لنشرب الشاي بالحليب في الأسفل.' },
          { speaker: 'B', name: 'سامي', zh: '好，我这就走。', pinyin: 'Hǎo, wǒ zhè jiù zǒu.', arabic: 'حسناً، سأنطلق حالاً.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L6C1',
        title: 'عيد ميلاد سعيد',
        scene: '🎂 حفلة عيد ميلاد في البيت',
        turns: [
          { speaker: 'A', name: 'رنا', zh: '生日快乐！这是我给你画的画。', pinyin: 'Shēngrì kuàilè! Zhè shì wǒ gěi nǐ huà de huà.', arabic: 'عيد ميلاد سعيد! هذه لوحة رسمتُها لك.' },
          { speaker: 'B', name: 'فهد', zh: '谢谢！你画得真好。', pinyin: 'Xièxie! Nǐ huà de zhēn hǎo.', arabic: 'شكراً! رسمك جميل حقاً.' },
          { speaker: 'A', name: 'رنا', zh: '今天我们吃鱼和肉，好吗？', pinyin: 'Jīntiān wǒmen chī yú hé ròu, hǎo ma?', arabic: 'سنأكل اليوم سمكاً ولحماً، اتفقنا؟' },
          { speaker: 'B', name: 'فهد', zh: '好！我今天过得很快乐。', pinyin: 'Hǎo! Wǒ jīntiān guò de hěn kuàilè.', arabic: 'نعم! قضيتُ اليوم بسعادة كبيرة.' },
          { speaker: 'A', name: 'رنا', zh: '别忘了，晚上我们一起唱歌。', pinyin: 'Bié wàng le, wǎnshang wǒmen yìqǐ chànggē.', arabic: 'لا تنسَ، سنغنّي معاً في المساء.' },
          { speaker: 'B', name: 'فهد', zh: '我不会忘的！', pinyin: 'Wǒ bú huì wàng de!', arabic: 'لن أنسى!' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L7C1',
        title: 'الهوايات الرياضية',
        scene: '🏀 في ملعب المدرسة بعد الدوام',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '你的爱好是什么？', pinyin: 'Nǐ de àihào shì shénme?', arabic: 'ما هوايتك؟' },
          { speaker: 'B', name: 'أحمد', zh: '我喜欢运动，打篮球和踢足球都喜欢。', pinyin: 'Wǒ xǐhuan yùndòng, dǎ lánqiú hé tī zúqiú dōu xǐhuan.', arabic: 'أحبّ الرياضة، أحبّ كرة السلة وكرة القدم.' },
          { speaker: 'A', name: 'ليلى', zh: '你打得真好！我常常跑步。', pinyin: 'Nǐ dǎ de zhēn hǎo! Wǒ chángcháng pǎobù.', arabic: 'تلعب ببراعة! أما أنا فأجري كثيراً.' },
          { speaker: 'B', name: 'أحمد', zh: '跑步也很好。你从什么时候开始跑的？', pinyin: 'Pǎobù yě hěn hǎo. Nǐ cóng shénme shíhou kāishǐ pǎo de?', arabic: 'الجري جيد أيضاً. متى بدأتِ الجري؟' },
          { speaker: 'A', name: 'ليلى', zh: '从去年开始。我也想学游泳。', pinyin: 'Cóng qùnián kāishǐ. Wǒ yě xiǎng xué yóuyǒng.', arabic: 'منذ العام الماضي. وأريد أن أتعلّم السباحة أيضاً.' },
          { speaker: 'B', name: 'أحمد', zh: '那我们明天一起去游泳吧！', pinyin: 'Nà wǒmen míngtiān yìqǐ qù yóuyǒng ba!', arabic: 'إذن لنذهب للسباحة معاً غداً!' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L8C1',
        title: 'مطعمنا المفضّل',
        scene: '🍜 في مطعم صغير قرب المدرسة',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '你记得这家饭馆吗？', pinyin: 'Nǐ jìde zhè jiā fànguǎn ma?', arabic: 'أتذكر هذا المطعم؟' },
          { speaker: 'B', name: 'عمر', zh: '记得，就在学校左边。', pinyin: 'Jìde, jiù zài xuéxiào zuǒbian.', arabic: 'أتذكره، إنه على يسار المدرسة.' },
          { speaker: 'A', name: 'سارة', zh: '这里的菜比那家好吃。', pinyin: 'Zhèlǐ de cài bǐ nà jiā hǎochī.', arabic: 'طعام هذا المكان ألذّ من ذاك.' },
          { speaker: 'B', name: 'عمر', zh: '虽然贵一点儿，但是很有意思。', pinyin: 'Suīrán guì yìdiǎnr, dànshì hěn yǒuyìsi.', arabic: 'رغم أنه أغلى قليلاً، إلا أنه ممتع.' },
          { speaker: 'A', name: 'سارة', zh: '你的手表很好看，是谁给你的？', pinyin: 'Nǐ de shǒubiǎo hěn hǎokàn, shì shéi gěi nǐ de?', arabic: 'ساعتك جميلة، من أهداها لك؟' },
          { speaker: 'B', name: 'عمر', zh: '是我妻子送我的。', pinyin: 'Shì wǒ qīzi sòng wǒ de.', arabic: 'أهدتني إياها زوجتي.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L9C1',
        title: 'أين المقهى؟',
        scene: '🗺️ في الشارع، سؤال عن الطريق',
        turns: [
          { speaker: 'A', name: 'نورة', zh: '请问，咖啡店离这儿远吗？', pinyin: 'Qǐngwèn, kāfēi diàn lí zhèr yuǎn ma?', arabic: 'عفواً، هل المقهى بعيد عن هنا؟' },
          { speaker: 'B', name: 'خالد', zh: '不远，就在银行旁边。', pinyin: 'Bù yuǎn, jiù zài yínháng pángbiān.', arabic: 'ليس بعيداً، إنه بجانب البنك.' },
          { speaker: 'A', name: 'نورة', zh: '走路要多长时间？', pinyin: 'Zǒulù yào duō cháng shíjiān?', arabic: 'كم يستغرق المشي إليه؟' },
          { speaker: 'B', name: 'خالد', zh: '十分钟。你看，门口那个个子很高的男孩儿。', pinyin: 'Shí fēnzhōng. Nǐ kàn, ménkǒu nàge gèzi hěn gāo de nánháir.', arabic: 'عشر دقائق. انظري، ذلك الفتى الطويل عند المدخل.' },
          { speaker: 'A', name: 'نورة', zh: '是这样走吗？', pinyin: 'Shì zhèyàng zǒu ma?', arabic: 'هل أسير هكذا؟' },
          { speaker: 'B', name: 'خالد', zh: '对，往前走就到了。', pinyin: 'Duì, wǎng qián zǒu jiù dào le.', arabic: 'نعم، سيري إلى الأمام وستصلين.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L10C1',
        title: 'قبل الامتحان',
        scene: '📚 في الفصل قبل يوم من الامتحان',
        turns: [
          { speaker: 'A', name: 'مريم', zh: '快要考试了，你准备好了吗？', pinyin: 'Kuàiyào kǎoshì le, nǐ zhǔnbèi hǎo le ma?', arabic: 'الامتحان على وشك أن يبدأ، هل استعددت؟' },
          { speaker: 'B', name: 'يوسف', zh: '还没有。这些词我都记不住。', pinyin: 'Hái méiyǒu. Zhèxiē cí wǒ dōu jì bu zhù.', arabic: 'ليس بعد. لا أستطيع حفظ هذه الكلمات.' },
          { speaker: 'A', name: 'مريم', zh: '我帮你吧，这是我的本子。', pinyin: 'Wǒ bāng nǐ ba, zhè shì wǒ de běnzi.', arabic: 'سأساعدك، هذا دفتري.' },
          { speaker: 'B', name: 'يوسف', zh: '谢谢！这个题我做错了。', pinyin: 'Xièxie! Zhège tí wǒ zuò cuò le.', arabic: 'شكراً! أخطأتُ في هذا السؤال.' },
          { speaker: 'A', name: 'مريم', zh: '我也错了两个，别笑我。', pinyin: 'Wǒ yě cuò le liǎng ge, bié xiào wǒ.', arabic: 'وأنا أخطأتُ في سؤالين، فلا تضحك عليّ.' },
          { speaker: 'B', name: 'يوسف', zh: '我们一起看书吧。', pinyin: 'Wǒmen yìqǐ kànshū ba.', arabic: 'لنراجع الكتاب معاً.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L11C1',
        title: 'عند الطبيب',
        scene: '🏥 في عيادة الطبيب',
        turns: [
          { speaker: 'A', name: 'هدى', zh: '医生，我头疼，身体也不舒服。', pinyin: 'Yīshēng, wǒ tóuténg, shēntǐ yě bù shūfu.', arabic: 'دكتور، رأسي يؤلمني وجسمي متعب.' },
          { speaker: 'B', name: 'سامي', zh: '你最近经常头疼吗？', pinyin: 'Nǐ zuìjìn jīngcháng tóuténg ma?', arabic: 'هل يؤلمك رأسك كثيراً مؤخراً؟' },
          { speaker: 'A', name: 'هدى', zh: '是的，工作的时候最疼。', pinyin: 'Shì de, gōngzuò de shíhou zuì téng.', arabic: 'نعم، والألم أشدّ أثناء العمل.' },
          { speaker: 'B', name: 'سامي', zh: '你要多睡觉，走路也要慢一点儿。', pinyin: 'Nǐ yào duō shuìjiào, zǒulù yě yào màn yìdiǎnr.', arabic: 'عليكِ أن تنامي أكثر وأن تمشي ببطء.' },
          { speaker: 'A', name: 'هدى', zh: '要吃药吗？', pinyin: 'Yào chī yào ma?', arabic: 'هل أتناول دواءً؟' },
          { speaker: 'B', name: 'سامي', zh: '要，药店就在路上，很近。', pinyin: 'Yào, yàodiàn jiù zài lùshang, hěn jìn.', arabic: 'نعم، والصيدلية في الطريق وقريبة.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L12C1',
        title: 'طقس هذا الصباح',
        scene: '🌧️ عند مدخل المبنى صباحاً',
        turns: [
          { speaker: 'A', name: 'رنا', zh: '外面是晴天还是阴天？', pinyin: 'Wàimiàn shì qíngtiān háishi yīntiān?', arabic: 'هل الجو صحو أم غائم في الخارج؟' },
          { speaker: 'B', name: 'فهد', zh: '正下雨呢。', pinyin: 'Zhèng xià yǔ ne.', arabic: 'إنها تمطر الآن.' },
          { speaker: 'A', name: 'رنا', zh: '那我坐地铁去。地铁站远吗？', pinyin: 'Nà wǒ zuò dìtiě qù. Dìtiě zhàn yuǎn ma?', arabic: 'إذن سأذهب بالمترو. هل المحطة بعيدة؟' },
          { speaker: 'B', name: 'فهد', zh: '不远，就在那个楼后面。', pinyin: 'Bù yuǎn, jiù zài nàge lóu hòumiàn.', arabic: 'ليست بعيدة، إنها خلف تلك البناية.' },
          { speaker: 'A', name: 'رنا', zh: '好。我小时候就住在这儿。', pinyin: 'Hǎo. Wǒ xiǎoshíhou jiù zhù zài zhèr.', arabic: 'حسناً. كنتُ أسكن هنا في طفولتي.' },
          { speaker: 'B', name: 'فهد', zh: '是吗？我也是从小住在这儿。', pinyin: 'Shì ma? Wǒ yě shì cóngxiǎo zhù zài zhèr.', arabic: 'حقاً؟ وأنا أيضاً أسكن هنا منذ الصغر.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L13C1',
        title: 'في قاعة الحاسوب',
        scene: '💻 في قاعة الحاسوب بالمدرسة',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '老师，我们班可以在这儿上网吗？', pinyin: 'Lǎoshī, wǒmen bān kěyǐ zài zhèr shàngwǎng ma?', arabic: 'أستاذ، هل يمكن لصفّنا استخدام الإنترنت هنا؟' },
          { speaker: 'B', name: 'أحمد', zh: '可以。里面那个电脑很快。', pinyin: 'Kěyǐ. Lǐmiàn nàge diànnǎo hěn kuài.', arabic: 'نعم. ذلك الحاسوب في الداخل سريع.' },
          { speaker: 'A', name: 'ليلى', zh: '谢谢！洗手间在哪儿？', pinyin: 'Xièxie! Xǐshǒujiān zài nǎr?', arabic: 'شكراً! أين دورة المياه؟' },
          { speaker: 'B', name: 'أحمد', zh: '就在外面右边。', pinyin: 'Jiù zài wàimiàn yòubian.', arabic: 'في الخارج على اليمين.' },
          { speaker: 'A', name: 'ليلى', zh: '我希望今天能学会上网买东西。', pinyin: 'Wǒ xīwàng jīntiān néng xuéhuì shàngwǎng mǎi dōngxi.', arabic: 'آمل أن أتعلّم اليوم الشراء عبر الإنترنت.' },
          { speaker: 'B', name: 'أحمد', zh: '我教你吧，很快就能学会。', pinyin: 'Wǒ jiāo nǐ ba, hěn kuài jiù néng xuéhuì.', arabic: 'سأعلّمك، ستتعلّمين بسرعة.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L14C1',
        title: 'حفل رأس السنة',
        scene: '🎉 في حفل رأس السنة عند العائلة',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '你们过年做什么？', pinyin: 'Nǐmen guònián zuò shénme?', arabic: 'ماذا تفعلون في رأس السنة؟' },
          { speaker: 'B', name: 'عمر', zh: '我们在家吃饭，小孩儿们跳舞唱歌。', pinyin: 'Wǒmen zài jiā chīfàn, xiǎoháirmen tiàowǔ chànggē.', arabic: 'نتناول الطعام في البيت، والأطفال يرقصون ويغنّون.' },
          { speaker: 'A', name: 'سارة', zh: '前面那位女孩儿是谁？', pinyin: 'Qiánmiàn nà wèi nǚháir shì shéi?', arabic: 'من تلك الفتاة في الأمام؟' },
          { speaker: 'B', name: 'عمر', zh: '她姓王，眼睛很大很好看。', pinyin: 'Tā xìng Wáng, yǎnjing hěn dà hěn hǎokàn.', arabic: 'اسم عائلتها وانغ، وعيناها كبيرتان وجميلتان.' },
          { speaker: 'A', name: 'سارة', zh: '在这儿坐着没意思，我们也去跳舞吧。', pinyin: 'Zài zhèr zuòzhe méiyìsi, wǒmen yě qù tiàowǔ ba.', arabic: 'الجلوس هنا ممل، لنذهب للرقص أيضاً.' },
          { speaker: 'B', name: 'عمر', zh: '好，我拿着包跟你去。', pinyin: 'Hǎo, wǒ názhe bāo gēn nǐ qù.', arabic: 'حسناً، سآخذ حقيبتي وأذهب معك.' },
        ],
      },
    ],
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
    conversations: [
      {
        id: 'H2L15C1',
        title: 'قبل الإقلاع',
        scene: '✈️ في صالة المغادرة بالمطار',
        turns: [
          { speaker: 'A', name: 'نورة', zh: '你的机票和姓名都对吗？', pinyin: 'Nǐ de jīpiào hé xìngmíng dōu duì ma?', arabic: 'هل تذكرة الطيران والاسم صحيحان؟' },
          { speaker: 'B', name: 'خالد', zh: '都对，这是我第一次出国。', pinyin: 'Dōu duì, zhè shì wǒ dì yī cì chūguó.', arabic: 'كلاهما صحيح، وهذه أول مرة أسافر فيها إلى الخارج.' },
          { speaker: 'A', name: 'نورة', zh: '出门前你去颐和园了吗？', pinyin: 'Chūmén qián nǐ qù Yíhé Yuán le ma?', arabic: 'هل زرتَ قصر الصيف قبل الخروج؟' },
          { speaker: 'B', name: 'خالد', zh: '去了，门票不贵，那儿的鸟很多。', pinyin: 'Qù le, ménpiào bú guì, nàr de niǎo hěn duō.', arabic: 'نعم، التذكرة ليست غالية، وهناك طيور كثيرة.' },
          { speaker: 'A', name: 'نورة', zh: '太好了。快走吧，飞机要飞了。', pinyin: 'Tài hǎo le. Kuài zǒu ba, fēijī yào fēi le.', arabic: 'رائع. أسرع، الطائرة على وشك الإقلاع.' },
          { speaker: 'B', name: 'خالد', zh: '好，我们走。', pinyin: 'Hǎo, wǒmen zǒu.', arabic: 'حسناً، لنذهب.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 出国 (chūguó)؟', options: ['يسافر للخارج','يخرج من البيت','يطير','المرحلة الثانوية'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 出门 (chūmén)؟', options: ['يخرج من البيت','يسافر للخارج','يطير','المرحلة الثانوية'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 飞 (fēi)؟', options: ['يطير','يسافر للخارج','يخرج من البيت','المرحلة الثانوية'], correct: 0 }
    ],
  },
];
