import type { Lesson } from '../lessons';

// HSK3 lessons — the 18 lessons of 新HSK教程3. vocabularyIds use HSK3 ids (3001+).
export const lessons3: Lesson[] = [
  {
    id: 1, title: 'في المطار والاستقبال', titleZh: '我们去机场接你们', level: 'HSK3',
    vocabularyIds: [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3022, 3023, 3024, 3025, 3026, 3027],
    grammarIds: [301, 302, 303],
    keySentences: [
      { zh: "我们去机场接你们。", pinyin: "Wǒmen qù jīchǎng jiē nǐmen.", arabic: "سنذهب إلى المطار لاستقبالكم.", audioAvailable: true },
      { zh: "我以为你的行李丢了。", pinyin: "Wǒ yǐwéi nǐ de xíngli diū le.", arabic: "ظننتُ أنّ أمتعتك قد ضاعت.", audioAvailable: true },
      { zh: "他的身高是一米八，头发很短。", pinyin: "Tā de shēngāo shì yī mǐ bā, tóufa hěn duǎn.", arabic: "طوله متر وثمانون، وشعره قصير جداً.", audioAvailable: true },
      { zh: "我的护照好像不见了！", pinyin: "Wǒ de hùzhào hǎoxiàng bújiàn le!", arabic: "يبدو أنّ جواز سفري مفقود!", audioAvailable: true },
      { zh: "你可以帮助我拿箱子吗？", pinyin: "Nǐ kěyǐ bāngzhù wǒ ná xiāngzi ma?", arabic: "هل يمكنك مساعدتي في حمل الحقيبة؟", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L1C1',
        title: 'في المطار',
        scene: '✈️ في صالة الوصول بالمطار',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '我们去机场接他们吧。', pinyin: 'Wǒmen qù jīchǎng jiē tāmen ba.', arabic: 'لنذهب إلى المطار لاستقبالهم.' },
          { speaker: 'B', name: 'أحمد', zh: '好，别忘了带护照。', pinyin: 'Hǎo, bié wàng le dài hùzhào.', arabic: 'حسناً، لا تنسَ إحضار جواز السفر.' },
          { speaker: 'A', name: 'ليلى', zh: '他长什么样？我没见过他。', pinyin: 'Tā zhǎng shénme yàng? Wǒ méi jiàn guo tā.', arabic: 'كيف يبدو؟ لم أره من قبل.' },
          { speaker: 'B', name: 'أحمد', zh: '他很瘦，头发很短，身高一米八。', pinyin: 'Tā hěn shòu, tóufa hěn duǎn, shēngāo yī mǐ bā.', arabic: 'إنه نحيف وشعره قصير وطوله متر وثمانون.' },
          { speaker: 'A', name: 'ليلى', zh: '好像是他，站在服务台旁边。', pinyin: 'Hǎoxiàng shì tā, zhàn zài fúwùtái pángbiān.', arabic: 'يبدو أنه هو، يقف بجانب مكتب الخدمة.' },
          { speaker: 'B', name: 'أحمد', zh: '对，我们去帮他拿箱子吧。', pinyin: 'Duì, wǒmen qù bāng tā ná xiāngzi ba.', arabic: 'صحيح، لنذهب لمساعدته في حمل الحقيبة.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 以为 (yǐwéi)؟', options: ['اللون الأصفر','ورق','يمكث في المستشفى','يظن (ظناً خاطئاً)'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 像 (xiàng)؟', options: ['عطشان','حديقة عامة','يشبه / مثل','مؤخراً'], correct: 2 },
      { type: 'multiple_choice', q: 'ما معنى 长 (zhǎng)؟', options: ['في القلب / في النفس','زوج (كلمة عدّ)','ينمو / يكبر','يشارك في'], correct: 2 }
    ],
  },
  {
    id: 2, title: 'في المطعم والطلبات', titleZh: '你们想吃什么就点什么', level: 'HSK3',
    vocabularyIds: [3028, 3029, 3030, 3031, 3032, 3033, 3034, 3035, 3036, 3037, 3038, 3039, 3040, 3041, 3042, 3043, 3044, 3045, 3046, 3047, 3048, 3049, 3050, 3051, 3052, 3053, 3054, 3055],
    grammarIds: [304, 305, 306],
    keySentences: [
      { zh: "服务员，请给我一张菜单。", pinyin: "Fúwùyuán, qǐng gěi wǒ yì zhāng càidān.", arabic: "أيها النادل، من فضلك أعطني قائمة الطعام.", audioAvailable: true },
      { zh: "我又饿又渴，想喝点儿饮料。", pinyin: "Wǒ yòu è yòu kě, xiǎng hē diǎnr yǐnliào.", arabic: "أنا جائع وعطشان، وأريد أن أشرب شيئاً.", audioAvailable: true },
      { zh: "你们想吃什么就点什么。", pinyin: "Nǐmen xiǎng chī shénme jiù diǎn shénme.", arabic: "اطلبوا ما تشتهون من الطعام.", audioAvailable: true },
      { zh: "请再给我一双筷子和一个碗。", pinyin: "Qǐng zài gěi wǒ yì shuāng kuàizi hé yí ge wǎn.", arabic: "من فضلك أعطني زوجاً آخر من عيدان الطعام وصحناً.", audioAvailable: true },
      { zh: "你不用客气，尝尝这个蛋糕吧！", pinyin: "Nǐ búyòng kèqi, chángchang zhège dàngāo ba!", arabic: "لا داعي للتكلّف، تذوّق هذه الكعكة!", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L2C1',
        title: 'في المطعم',
        scene: '🍽️ في مطعم مساءً',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '服务员，请给我们菜单。', pinyin: 'Fúwùyuán, qǐng gěi wǒmen càidān.', arabic: 'أيها النادل، أعطنا قائمة الطعام من فضلك.' },
          { speaker: 'B', name: 'عمر', zh: '你们想吃什么就点什么。', pinyin: 'Nǐmen xiǎng chī shénme jiù diǎn shénme.', arabic: 'اطلبوا ما تشتهون.' },
          { speaker: 'A', name: 'سارة', zh: '我又饿又渴，先要一碗面吧。', pinyin: 'Wǒ yòu è yòu kě, xiān yào yì wǎn miàn ba.', arabic: 'أنا جائعة وعطشانة، سأطلب أولاً صحن نودلز.' },
          { speaker: 'B', name: 'عمر', zh: '服务员很热情，我们也点鸡吧。', pinyin: 'Fúwùyuán hěn rèqíng, wǒmen yě diǎn jī ba.', arabic: 'النادل ودود جداً، لنطلب أيضاً الدجاج.' },
          { speaker: 'A', name: 'سارة', zh: '好，别客气，多点一点儿。', pinyin: 'Hǎo, bié kèqi, duō diǎn yìdiǎnr.', arabic: 'حسناً، لا تتكلّف، اطلب أكثر قليلاً.' },
          { speaker: 'B', name: 'عمر', zh: '好，我马上叫服务员。', pinyin: 'Hǎo, wǒ mǎshàng jiào fúwùyuán.', arabic: 'حسناً، سأنادي النادل حالاً.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 菜单 (càidān)؟', options: ['مجامل / متكلّف','يحبّ / مولع بـ','يرغب / مستعدّ','قائمة الطعام'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 又 (yòu)؟', options: ['أو','قارب / سفينة','يقلق','و... أيضاً / مرة أخرى'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 饿 (è)؟', options: ['دورة المياه','جائع','زميل عمل','أول أمس'], correct: 1 }
    ],
  },
  {
    id: 3, title: 'السكن والحيّ', titleZh: '这个小区挺好的', level: 'HSK3',
    vocabularyIds: [3056, 3057, 3058, 3059, 3060, 3061, 3062, 3063, 3064, 3065, 3066, 3067, 3068, 3069, 3070, 3071, 3072, 3073, 3074, 3075, 3076, 3077, 3078, 3079, 3080, 3081],
    grammarIds: [307, 308, 309],
    keySentences: [
      { zh: "这个小区的环境挺好的。", pinyin: "Zhège xiǎoqū de huánjìng tǐng hǎo de.", arabic: "بيئة هذا الحيّ السكني جيدة جداً.", audioAvailable: true },
      { zh: "咱们下个月就搬家吧。", pinyin: "Zánmen xià ge yuè jiù bānjiā ba.", arabic: "لننتقل إلى المنزل الجديد الشهر القادم.", audioAvailable: true },
      { zh: "房子里有空调、冰箱和洗衣机。", pinyin: "Fángzi lǐ yǒu kōngtiáo, bīngxiāng hé xǐyījī.", arabic: "في البيت مكيّف وثلاجة وغسّالة ملابس.", audioAvailable: true },
      { zh: "出门以前请关灯。", pinyin: "Chūmén yǐqián qǐng guān dēng.", arabic: "من فضلك أطفئ المصباح قبل الخروج.", audioAvailable: true },
      { zh: "我需要去银行办一张信用卡。", pinyin: "Wǒ xūyào qù yínháng bàn yì zhāng xìnyòngkǎ.", arabic: "أحتاج أن أذهب إلى البنك لأستخرج بطاقة ائتمان.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L3C1',
        title: 'بيت جديد',
        scene: '🏘️ في الحيّ السكني الجديد',
        turns: [
          { speaker: 'A', name: 'نورة', zh: '咱们的新房子在小区里面。', pinyin: 'Zánmen de xīn fángzi zài xiǎoqū lǐmiàn.', arabic: 'بيتنا الجديد داخل الحيّ السكني.' },
          { speaker: 'B', name: 'خالد', zh: '环境挺好的，还有空调和冰箱。', pinyin: 'Huánjìng tǐng hǎo de, hái yǒu kōngtiáo hé bīngxiāng.', arabic: 'البيئة جيدة جداً، وفيه مكيّف وثلاجة.' },
          { speaker: 'A', name: 'نورة', zh: '我们下个月就搬家吧。', pinyin: 'Wǒmen xià ge yuè jiù bānjiā ba.', arabic: 'لننتقل الشهر القادم.' },
          { speaker: 'B', name: 'خالد', zh: '好，我先去银行办一张信用卡。', pinyin: 'Hǎo, wǒ xiān qù yínháng bàn yì zhāng xìnyòngkǎ.', arabic: 'حسناً، سأذهب أولاً إلى البنك لأستخرج بطاقة ائتمان.' },
          { speaker: 'A', name: 'نورة', zh: '别忘了打扫房子。', pinyin: 'Bié wàng le dǎsǎo fángzi.', arabic: 'لا تنسَ تنظيف البيت.' },
          { speaker: 'B', name: 'خالد', zh: '放心，我需要的东西都准备好了。', pinyin: 'Fàngxīn, wǒ xūyào de dōngxi dōu zhǔnbèi hǎo le.', arabic: 'اطمئني، جهّزتُ كل ما أحتاجه.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 初中 (chūzhōng)؟', options: ['حاسوب محمول / دفتر','المرحلة المتوسطة','فرصة','جداً / إلى حد كبير'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 咱们 (zánmen)؟', options: ['يُزهر','نحن (شاملة المخاطَب)','فرصة','فقط'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 换 (huàn)؟', options: ['طريقة / حلّ','مشروب','مدير المدرسة','يبدّل / يغيّر'], correct: 3 }
    ],
  },
  {
    id: 4, title: 'السفر والعطلات', titleZh: '这家宾馆跟别的都不一样', level: 'HSK3',
    vocabularyIds: [3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3091, 3092, 3093, 3094, 3095, 3096, 3097, 3098, 3099, 3100, 3101, 3102, 3103, 3104, 3105, 3106, 3107, 3108],
    grammarIds: [310, 311, 312],
    keySentences: [
      { zh: "这家宾馆跟别的都不一样。", pinyin: "Zhè jiā bīnguǎn gēn biéde dōu bù yíyàng.", arabic: "هذا الفندق مختلف تماماً عن غيره.", audioAvailable: true },
      { zh: "假期我想去草原上骑马。", pinyin: "Jiàqī wǒ xiǎng qù cǎoyuán shang qí mǎ.", arabic: "في العطلة أريد الذهاب إلى السهل العشبي لركوب الحصان.", audioAvailable: true },
      { zh: "飞机晚点了，三点一刻才起飞。", pinyin: "Fēijī wǎndiǎn le, sān diǎn yí kè cái qǐfēi.", arabic: "تأخّرت الطائرة، ولم تُقلع إلا في الثالثة والربع.", audioAvailable: true },
      { zh: "草原上有很多牛和羊。", pinyin: "Cǎoyuán shang yǒu hěn duō niú hé yáng.", arabic: "في السهل العشبي أبقار وأغنام كثيرة.", audioAvailable: true },
      { zh: "房间很干净，我们都很满意。", pinyin: "Fángjiān hěn gānjìng, wǒmen dōu hěn mǎnyì.", arabic: "الغرفة نظيفة جداً، وكلّنا راضون.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L4C1',
        title: 'خطة العطلة',
        scene: '🏔️ في مكتب السفريات قبل الإجازة',
        turns: [
          { speaker: 'A', name: 'مريم', zh: '假期你想去哪儿？', pinyin: 'Jiàqī nǐ xiǎng qù nǎr?', arabic: 'أين تريد الذهاب في العطلة؟' },
          { speaker: 'B', name: 'يوسف', zh: '我想去草原骑马、看牛和羊。', pinyin: 'Wǒ xiǎng qù cǎoyuán qí mǎ, kàn niú hé yáng.', arabic: 'أريد الذهاب إلى السهل العشبي لركوب الحصان ورؤية الأبقار والأغنام.' },
          { speaker: 'A', name: 'مريم', zh: '那家宾馆怎么样？跟别的一样吗？', pinyin: 'Nà jiā bīnguǎn zěnmeyàng? Gēn biéde yíyàng ma?', arabic: 'كيف ذلك الفندق؟ هل هو مثل غيره؟' },
          { speaker: 'B', name: 'يوسف', zh: '不一样，特别干净，我很满意。', pinyin: 'Bù yíyàng, tèbié gānjìng, wǒ hěn mǎnyì.', arabic: 'مختلف، نظيف جداً، وأنا راضٍ عنه.' },
          { speaker: 'A', name: 'مريم', zh: '飞机几点起飞？', pinyin: 'Fēijī jǐdiǎn qǐfēi?', arabic: 'متى تُقلع الطائرة؟' },
          { speaker: 'B', name: 'يوسف', zh: '三点一刻，我们一定要早点儿到。', pinyin: 'Sān diǎn yí kè, wǒmen yídìng yào zǎo diǎnr dào.', arabic: 'الثالثة والربع، يجب أن نصل مبكراً.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 假期 (jiàqī)؟', options: ['عطلة / إجازة','ثقافة','يراجع','بعد غد'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 海 (hǎi)؟', options: ['رئيسي','البحر','قارب / سفينة','الماضي'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 草原 (cǎoyuán)؟', options: ['خاص / بشكل خاص','جريدة','سهل عشبي / بادية','عطلة نهاية الأسبوع'], correct: 2 }
    ],
  },
  {
    id: 5, title: 'التصوير والهوايات', titleZh: '这样的照片才好看', level: 'HSK3',
    vocabularyIds: [3109, 3110, 3111, 3112, 3113, 3114, 3115, 3116, 3117, 3118, 3119, 3120, 3121, 3122, 3123, 3124, 3125, 3126, 3127, 3128, 3129, 3130, 3131, 3132, 3133, 3134, 3135],
    grammarIds: [313, 314, 315, 316],
    keySentences: [
      { zh: "这样的照片才好看。", pinyin: "Zhèyàng de zhàopiàn cái hǎokàn.", arabic: "مثل هذه الصور هي الجميلة حقاً.", audioAvailable: true },
      { zh: "我们终于爬到山上了！", pinyin: "Wǒmen zhōngyú pá dào shān shang le!", arabic: "أخيراً وصلنا إلى أعلى الجبل!", audioAvailable: true },
      { zh: "他对拍照很感兴趣。", pinyin: "Tā duì pāizhào hěn gǎn xìngqù.", arabic: "إنه مهتمّ جداً بالتصوير.", audioAvailable: true },
      { zh: "我今天收到了一封邮件。", pinyin: "Wǒ jīntiān shōudào le yì fēng yóujiàn.", arabic: "استلمتُ اليوم رسالة بريدية.", audioAvailable: true },
      { zh: "我每天早上都锻炼身体。", pinyin: "Wǒ měitiān zǎoshang dōu duànliàn shēntǐ.", arabic: "أمارس الرياضة كل صباح.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L5C1',
        title: 'صورة جميلة',
        scene: '⛰️ على قمة الجبل عند الغروب',
        turns: [
          { speaker: 'A', name: 'هدى', zh: '我们终于爬到山上了！', pinyin: 'Wǒmen zhōngyú pá dào shān shang le!', arabic: 'أخيراً وصلنا إلى أعلى الجبل!' },
          { speaker: 'B', name: 'سامي', zh: '这样的照片才好看，快拍照吧。', pinyin: 'Zhèyàng de zhàopiàn cái hǎokàn, kuài pāizhào ba.', arabic: 'مثل هذه الصور هي الجميلة، التقط صورة بسرعة.' },
          { speaker: 'A', name: 'هدى', zh: '我对拍照一直很感兴趣。', pinyin: 'Wǒ duì pāizhào yìzhí hěn gǎn xìngqù.', arabic: 'أنا مهتمّة بالتصوير دائماً.' },
          { speaker: 'B', name: 'سامي', zh: '你的水平比较高，教教我吧。', pinyin: 'Nǐ de shuǐpíng bǐjiào gāo, jiāojiao wǒ ba.', arabic: 'مستواك عالٍ نسبياً، علّمني.' },
          { speaker: 'A', name: 'هدى', zh: '好，先看看太阳和树在哪儿。', pinyin: 'Hǎo, xiān kànkan tàiyáng hé shù zài nǎr.', arabic: 'حسناً، انظر أولاً أين الشمس والشجرة.' },
          { speaker: 'B', name: 'سامي', zh: '好，我们锻炼完再拍一张。', pinyin: 'Hǎo, wǒmen duànliàn wán zài pāi yì zhāng.', arabic: 'حسناً، سنلتقط صورة أخرى بعد أن ننهي التمرين.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 总是 (zǒngshì)؟', options: ['دائماً','مجتهد','فقط إذا / لا... إلا','ضعيف / ناقص'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 终于 (zhōngyú)؟', options: ['عيدان الطعام','بطارية متنقلة','تغيّر / تبدّل','أخيراً'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 爬 (pá)؟', options: ['يتسلّق','أكثر من / فوق','كيلوغرام','فكرة / رأي'], correct: 0 }
    ],
  },
  {
    id: 6, title: 'المواصلات والقطار السريع', titleZh: '高铁上还可以点外卖', level: 'HSK3',
    vocabularyIds: [3136, 3137, 3138, 3139, 3140, 3141, 3142, 3143, 3144, 3145, 3146, 3147, 3148, 3149, 3150, 3151, 3152, 3153, 3154, 3155, 3156, 3157, 3158, 3159, 3160, 3161],
    grammarIds: [317, 318, 319],
    keySentences: [
      { zh: "高铁上还可以点外卖。", pinyin: "Gāotiě shang hái kěyǐ diǎn wàimài.", arabic: "في القطار السريع يمكنك أيضاً طلب توصيل الطعام.", audioAvailable: true },
      { zh: "我打算坐高铁去北京。", pinyin: "Wǒ dǎsuàn zuò gāotiě qù Běijīng.", arabic: "أنوي الذهاب إلى بكين بالقطار فائق السرعة.", audioAvailable: true },
      { zh: "前面的路口有红绿灯，过马路要小心。", pinyin: "Qiánmiàn de lùkǒu yǒu hónglǜdēng, guò mǎlù yào xiǎoxīn.", arabic: "عند التقاطع أمامنا إشارة مرور، فانتبه عند عبور الطريق.", audioAvailable: true },
      { zh: "如果你迟到了，我们就先走。", pinyin: "Rúguǒ nǐ chídào le, wǒmen jiù xiān zǒu.", arabic: "إذا تأخّرت، فسنمضي نحن أولاً.", audioAvailable: true },
      { zh: "上车以前必须检票。", pinyin: "Shàng chē yǐqián bìxū jiǎnpiào.", arabic: "يجب التحقّق من التذاكر قبل ركوب القطار.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L6C1',
        title: 'على القطار السريع',
        scene: '🚄 في محطة القطار السريع',
        turns: [
          { speaker: 'A', name: 'رنا', zh: '我打算坐高铁去北京。', pinyin: 'Wǒ dǎsuàn zuò gāotiě qù Běijīng.', arabic: 'أنوي الذهاب إلى بكين بالقطار فائق السرعة.' },
          { speaker: 'B', name: 'فهد', zh: '别迟到，检票的时间快到了。', pinyin: 'Bié chídào, jiǎnpiào de shíjiān kuài dào le.', arabic: 'لا تتأخر، وقت التحقق من التذاكر قريب.' },
          { speaker: 'A', name: 'رنا', zh: '如果车很多，我们就走路过去。', pinyin: 'Rúguǒ chē hěn duō, wǒmen jiù zǒulù guòqù.', arabic: 'إذا كانت السيارات كثيرة، سنمشي إلى هناك.' },
          { speaker: 'B', name: 'فهد', zh: '好，过马路要小心红绿灯。', pinyin: 'Hǎo, guò mǎlù yào xiǎoxīn hónglǜdēng.', arabic: 'حسناً، انتبه لإشارة المرور عند عبور الطريق.' },
          { speaker: 'A', name: 'رنا', zh: '上车以后我们可以安静地休息。', pinyin: 'Shàng chē yǐhòu wǒmen kěyǐ ānjìng de xiūxi.', arabic: 'بعد ركوب القطار يمكننا الراحة بهدوء.' },
          { speaker: 'B', name: 'فهد', zh: '对，高铁上还可以点外卖。', pinyin: 'Duì, gāotiě shang hái kěyǐ diǎn wàimài.', arabic: 'صحيح، وفي القطار السريع يمكن أيضاً طلب توصيل الطعام.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 该 (gāi)؟', options: ['ينبغي / حان دور','صحن / وعاء','شَعر','زوجان'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 打算 (dǎsuàn)؟', options: ['رياح','يراجع','ينوي / يخطط','شارع'], correct: 2 },
      { type: 'multiple_choice', q: 'ما معنى 高铁 (gāotiě)؟', options: ['جادّ / متقن','تقاطع طرق','ثم / بعد ذلك','قطار فائق السرعة'], correct: 3 }
    ],
  },
  {
    id: 7, title: 'التسوّق والمقارنة', titleZh: '那条裙子比短裤更好看', level: 'HSK3',
    vocabularyIds: [3162, 3163, 3164, 3165, 3166, 3167, 3168, 3169, 3170, 3171, 3172, 3173, 3174, 3175, 3176, 3177, 3178, 3179, 3180, 3181, 3182, 3183, 3184, 3185, 3186, 3187, 3188],
    grammarIds: [320, 321, 322, 323],
    keySentences: [
      { zh: "那条裙子比短裤更好看。", pinyin: "Nà tiáo qúnzi bǐ duǎnkù gèng hǎokàn.", arabic: "تلك التنّورة أجمل من الشورت.", audioAvailable: true },
      { zh: "这件大衣的大小很合适。", pinyin: "Zhè jiàn dàyī de dàxiǎo hěn héshì.", arabic: "مقاس هذا المعطف مناسب تماماً.", audioAvailable: true },
      { zh: "我决定买那辆自行车。", pinyin: "Wǒ juédìng mǎi nà liàng zìxíngchē.", arabic: "قرّرتُ شراء تلك الدراجة الهوائية.", audioAvailable: true },
      { zh: "这个西瓜又新鲜又甜。", pinyin: "Zhège xīguā yòu xīnxiān yòu tián.", arabic: "هذا البطيخ طازج وحلو المذاق.", audioAvailable: true },
      { zh: "这些香蕉一共多少钱？", pinyin: "Zhèxiē xiāngjiāo yígòng duōshao qián?", arabic: "كم ثمن هذا الموز كلّه؟", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L7C1',
        title: 'التسوّق للثياب',
        scene: '👗 في متجر الملابس',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '那条裙子比这条更好看。', pinyin: 'Nà tiáo qúnzi bǐ zhè tiáo gèng hǎokàn.', arabic: 'تلك التنّورة أجمل من هذه.' },
          { speaker: 'B', name: 'أحمد', zh: '颜色不错，大小也合适。', pinyin: 'Yánsè búcuò, dàxiǎo yě héshì.', arabic: 'اللون جيد، والمقاس مناسب أيضاً.' },
          { speaker: 'A', name: 'ليلى', zh: '我决定买黄色的了。', pinyin: 'Wǒ juédìng mǎi huángsè de le.', arabic: 'قرّرت شراء اللون الأصفر.' },
          { speaker: 'B', name: 'أحمد', zh: '好，我们去买点儿西瓜和香蕉吧。', pinyin: 'Hǎo, wǒmen qù mǎi diǎnr xīguā hé xiāngjiāo ba.', arabic: 'حسناً، لنشترِ بعض البطيخ والموز.' },
          { speaker: 'A', name: 'ليلى', zh: '这个西瓜又新鲜又甜。', pinyin: 'Zhège xīguā yòu xīnxiān yòu tián.', arabic: 'هذا البطيخ طازج وحلو المذاق.' },
          { speaker: 'B', name: 'أحمد', zh: '好，一共多少钱？', pinyin: 'Hǎo, yígòng duōshao qián?', arabic: 'حسناً، كم الثمن كله؟' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 辆 (liàng)؟', options: ['كلمة عدّ للمركبات','أو','يطمئن','ثقافة'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 自行车 (zìxíngchē)؟', options: ['للغاية','زوجان','يقيم حفل لقاء','دراجة هوائية'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 旧 (jiù)؟', options: ['حصان','الشتاء','قديم / مستعمل','حيّ سكني'], correct: 2 }
    ],
  },
  {
    id: 8, title: 'الصحة والرياضة', titleZh: '今天我出院了', level: 'HSK3',
    vocabularyIds: [3189, 3190, 3191, 3192, 3193, 3194, 3195, 3196, 3197, 3198, 3199, 3200, 3201, 3202, 3203, 3204, 3205, 3206, 3207, 3208, 3209, 3210, 3211, 3212, 3213, 3214, 3215, 3216],
    grammarIds: [324, 325, 326, 327],
    keySentences: [
      { zh: "今天我出院了。", pinyin: "Jīntiān wǒ chūyuàn le.", arabic: "اليوم غادرتُ المستشفى.", audioAvailable: true },
      { zh: "他感冒了，还有点儿发烧。", pinyin: "Tā gǎnmào le, hái yǒudiǎnr fāshāo.", arabic: "أصيب بالزكام، ولديه ارتفاع بسيط في الحرارة.", audioAvailable: true },
      { zh: "我最近常去体育馆打羽毛球。", pinyin: "Wǒ zuìjìn cháng qù tǐyùguǎn dǎ yǔmáoqiú.", arabic: "أذهب مؤخراً كثيراً إلى الصالة الرياضية للعب كرة الريشة.", audioAvailable: true },
      { zh: "你别担心，医生说他的身体很健康。", pinyin: "Nǐ bié dānxīn, yīshēng shuō tā de shēntǐ hěn jiànkāng.", arabic: "لا تقلق، قال الطبيب إنّ صحته جيدة.", audioAvailable: true },
      { zh: "早睡早起是很好的习惯。", pinyin: "Zǎo shuì zǎo qǐ shì hěn hǎo de xíguàn.", arabic: "النوم مبكراً والاستيقاظ مبكراً عادة جيدة جداً.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L8C1',
        title: 'بعد المستشفى',
        scene: '🏥 عند خروجه من المستشفى',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '今天我出院了，谢谢你的关心。', pinyin: 'Jīntiān wǒ chūyuàn le, xièxie nǐ de guānxīn.', arabic: 'اليوم غادرتُ المستشفى، شكراً على اهتمامك.' },
          { speaker: 'B', name: 'عمر', zh: '别客气，你现在身体健康吗？', pinyin: 'Bié kèqi, nǐ xiànzài shēntǐ jiànkāng ma?', arabic: 'لا داعي للشكر، هل صحتك جيدة الآن؟' },
          { speaker: 'A', name: 'سارة', zh: '好多了，医生说以后要注意休息。', pinyin: 'Hǎoduō le, yīshēng shuō yǐhòu yào zhùyì xiūxi.', arabic: 'أفضل بكثير، وقال الطبيب إنّ عليّ الاهتمام بالراحة لاحقاً.' },
          { speaker: 'B', name: 'عمر', zh: '以后我们一起去体育馆打羽毛球吧。', pinyin: 'Yǐhòu wǒmen yìqǐ qù tǐyùguǎn dǎ yǔmáoqiú ba.', arabic: 'لنذهب معاً لاحقاً إلى الصالة الرياضية للعب كرة الريشة.' },
          { speaker: 'A', name: 'سارة', zh: '好主意，运动对身体很好。', pinyin: 'Hǎo zhǔyi, yùndòng duì shēntǐ hěn hǎo.', arabic: 'فكرة جيدة، الرياضة مفيدة للجسم.' },
          { speaker: 'B', name: 'عمر', zh: '别担心，我每天都跟你一起锻炼。', pinyin: 'Bié dānxīn, wǒ měitiān dōu gēn nǐ yìqǐ duànliàn.', arabic: 'لا تقلقي، سأمارس الرياضة معك كل يوم.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 最近 (zuìjìn)؟', options: ['مؤخراً','سمّاعة أذن','مصباح / ضوء','نهر'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 常 (cháng)؟', options: ['يجيب','فصل دراسي','يراجع','غالباً / كثيراً'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 体育馆 (tǐyùguǎn)؟', options: ['صالة رياضية','يحلّ','إشارة مرور','مريض'], correct: 0 }
    ],
  },
  {
    id: 9, title: 'الحياة الجامعية والمباريات', titleZh: '打不好没关系', level: 'HSK3',
    vocabularyIds: [3217, 3218, 3219, 3220, 3221, 3222, 3223, 3224, 3225, 3226, 3227, 3228, 3229, 3230, 3231, 3232, 3233, 3234, 3235, 3236, 3237, 3238, 3239, 3240, 3241, 3242],
    grammarIds: [328, 329, 330],
    keySentences: [
      { zh: "打不好没关系。", pinyin: "Dǎ bù hǎo méi guānxì.", arabic: "لا بأس إن لم تُحسن اللعب.", audioAvailable: true },
      { zh: "我想参加学校的运动会。", pinyin: "Wǒ xiǎng cānjiā xuéxiào de yùndònghuì.", arabic: "أريد المشاركة في المهرجان الرياضي للمدرسة.", audioAvailable: true },
      { zh: "他每天在球场练习网球。", pinyin: "Tā měitiān zài qiúchǎng liànxí wǎngqiú.", arabic: "يتدرّب على كرة المضرب في الملعب كل يوم.", audioAvailable: true },
      { zh: "比赛以前我有点儿紧张。", pinyin: "Bǐsài yǐqián wǒ yǒudiǎnr jǐnzhāng.", arabic: "كنتُ متوتراً قليلاً قبل المباراة.", audioAvailable: true },
      { zh: "他是一位有名的运动员。", pinyin: "Tā shì yí wèi yǒumíng de yùndòngyuán.", arabic: "إنه لاعب رياضي مشهور.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L9C1',
        title: 'قبل المباراة',
        scene: '🎾 في ملعب الجامعة',
        turns: [
          { speaker: 'A', name: 'نورة', zh: '你每天在球场练习网球吗？', pinyin: 'Nǐ měitiān zài qiúchǎng liànxí wǎngqiú ma?', arabic: 'هل تتدرّب على كرة المضرب في الملعب كل يوم؟' },
          { speaker: 'B', name: 'خالد', zh: '对，我想参加学校的运动会。', pinyin: 'Duì, wǒ xiǎng cānjiā xuéxiào de yùndònghuì.', arabic: 'نعم، أريد المشاركة في المهرجان الرياضي للمدرسة.' },
          { speaker: 'A', name: 'نورة', zh: '比赛以前你紧张吗？', pinyin: 'Bǐsài yǐqián nǐ jǐnzhāng ma?', arabic: 'هل تتوتّر قبل المباراة؟' },
          { speaker: 'B', name: 'خالد', zh: '有点儿，但是打不好没关系。', pinyin: 'Yǒudiǎnr, dànshì dǎ bù hǎo méi guānxì.', arabic: 'قليلاً، لكن لا بأس إن لم ألعب بشكل جيد.' },
          { speaker: 'A', name: 'نورة', zh: '你已经是很好的运动员了。', pinyin: 'Nǐ yǐjīng shì hěn hǎo de yùndòngyuán le.', arabic: 'أنت بالفعل لاعب جيد.' },
          { speaker: 'B', name: 'خالد', zh: '谢谢，我们一起去看比赛吧。', pinyin: 'Xièxie, wǒmen yìqǐ qù kàn bǐsài ba.', arabic: 'شكراً، لنذهب معاً لمشاهدة المباراة.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 校园 (xiàoyuán)؟', options: ['يؤدّي عرضاً','نوع (كلمة عدّ)','الحرم الجامعي','يتزوّج'], correct: 2 },
      { type: 'multiple_choice', q: 'ما معنى 卡 (kǎ)؟', options: ['لم... إلا / عندئذ فقط','بطاقة','ربع ساعة','يتذوّق'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 球场 (qiúchǎng)؟', options: ['ملعب','مرّة (من البداية للنهاية)','درج / سلّم','يستقبل / يقلّ (شخصاً)'], correct: 0 }
    ],
  },
  {
    id: 10, title: 'الدراسة والامتحانات', titleZh: '你明天再把书还给我', level: 'HSK3',
    vocabularyIds: [3243, 3244, 3245, 3246, 3247, 3248, 3249, 3250, 3251, 3252, 3253, 3254, 3255, 3256, 3257, 3258, 3259, 3260, 3261, 3262, 3263, 3264, 3265, 3266, 3267, 3268, 3269, 3270],
    grammarIds: [331, 332, 333],
    keySentences: [
      { zh: "你明天再把书还给我。", pinyin: "Nǐ míngtiān zài bǎ shū huán gěi wǒ.", arabic: "أعِد لي الكتاب غداً.", audioAvailable: true },
      { zh: "老师讲的每一句话我都听明白了。", pinyin: "Lǎoshī jiǎng de měi yí jù huà wǒ dōu tīng míngbai le.", arabic: "فهمتُ كل جملة شرحها المعلّم.", audioAvailable: true },
      { zh: "这次数学考试有点儿难。", pinyin: "Zhè cì shùxué kǎoshì yǒudiǎnr nán.", arabic: "امتحان الرياضيات هذه المرة صعب بعض الشيء.", audioAvailable: true },
      { zh: "请你把黑板上的句子读一遍。", pinyin: "Qǐng nǐ bǎ hēibǎn shang de jùzi dú yí biàn.", arabic: "من فضلك اقرأ الجمل المكتوبة على السبّورة مرة كاملة.", audioAvailable: true },
      { zh: "我要努力提高我的外语水平。", pinyin: "Wǒ yào nǔlì tígāo wǒ de wàiyǔ shuǐpíng.", arabic: "سأجتهد لأرفع مستواي في اللغة الأجنبية.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L10C1',
        title: 'مراجعة الدرس',
        scene: '📖 في المكتبة قبل الامتحان',
        turns: [
          { speaker: 'A', name: 'مريم', zh: '你明天再把书还给我吧。', pinyin: 'Nǐ míngtiān zài bǎ shū huán gěi wǒ ba.', arabic: 'أعِد لي الكتاب غداً.' },
          { speaker: 'B', name: 'يوسف', zh: '好，这次数学考试有点儿难。', pinyin: 'Hǎo, zhè cì shùxué kǎoshì yǒudiǎnr nán.', arabic: 'حسناً، امتحان الرياضيات هذه المرة صعب بعض الشيء.' },
          { speaker: 'A', name: 'مريم', zh: '老师讲的句子你都听明白了吗？', pinyin: 'Lǎoshī jiǎng de jùzi nǐ dōu tīng míngbai le ma?', arabic: 'هل فهمت كل الجمل التي شرحها المعلّم؟' },
          { speaker: 'B', name: 'يوسف', zh: '差不多，但是外语水平还是不高。', pinyin: 'Chàbuduō, dànshì wàiyǔ shuǐpíng háishi bù gāo.', arabic: 'تقريباً، لكن مستواي في اللغة الأجنبية ما زال غير عالٍ.' },
          { speaker: 'A', name: 'مريم', zh: '我们把黑板上的句子再读一遍吧。', pinyin: 'Wǒmen bǎ hēibǎn shang de jùzi zài dú yí biàn ba.', arabic: 'لنقرأ الجمل المكتوبة على السبّورة مرة أخرى.' },
          { speaker: 'B', name: 'يوسف', zh: '好，我要努力提高水平。', pinyin: 'Hǎo, wǒ yào nǔlì tígāo shuǐpíng.', arabic: 'حسناً، سأجتهد لأرفع مستواي.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 数学 (shùxué)؟', options: ['الرياضيات','ينمو / يكبر','الآخرون / غير ذلك','يُعيد / يردّ'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 认真 (rènzhēn)؟', options: ['أول أمس','أداة المبني للمجهول','طابق / طبقة','جادّ / متقن'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 笔记 (bǐjì)؟', options: ['ينتبه إلى','يقلق','يمكث في المستشفى','ملاحظات مكتوبة'], correct: 3 }
    ],
  },
  {
    id: 11, title: 'العمل والاجتماعات', titleZh: '看来我没办法解决这个问题', level: 'HSK3',
    vocabularyIds: [3271, 3272, 3273, 3274, 3275, 3276, 3277, 3278, 3279, 3280, 3281, 3282, 3283, 3284, 3285, 3286, 3287, 3288, 3289, 3290, 3291, 3292, 3293, 3294, 3295, 3296, 3297],
    grammarIds: [334, 335, 336, 337],
    keySentences: [
      { zh: "看来我没办法解决这个问题。", pinyin: "Kànlái wǒ méi bànfǎ jiějué zhège wèntí.", arabic: "يبدو أنه ليس لديّ حلّ لهذه المشكلة.", audioAvailable: true },
      { zh: "后天上午我们要开会。", pinyin: "Hòutiān shàngwǔ wǒmen yào kāihuì.", arabic: "سنعقد اجتماعاً بعد غد صباحاً.", audioAvailable: true },
      { zh: "请把这个地点发到我的邮箱。", pinyin: "Qǐng bǎ zhège dìdiǎn fā dào wǒ de yóuxiāng.", arabic: "من فضلك أرسل هذا المكان إلى بريدي الإلكتروني.", audioAvailable: true },
      { zh: "我今天想跟经理请假。", pinyin: "Wǒ jīntiān xiǎng gēn jīnglǐ qǐngjià.", arabic: "أريد أن أطلب إجازة من المدير اليوم.", audioAvailable: true },
      { zh: "在这个城市生活是一个很好的机会。", pinyin: "Zài zhège chéngshì shēnghuó shì yí ge hěn hǎo de jīhuì.", arabic: "العيش في هذه المدينة فرصة جيدة جداً.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L11C1',
        title: 'اجتماع العمل',
        scene: '🏢 في المكتب صباحاً',
        turns: [
          { speaker: 'A', name: 'هدى', zh: '后天上午我们要开会。', pinyin: 'Hòutiān shàngwǔ wǒmen yào kāihuì.', arabic: 'سنعقد اجتماعاً بعد غد صباحاً.' },
          { speaker: 'B', name: 'سامي', zh: '看来我没办法解决这个问题。', pinyin: 'Kànlái wǒ méi bànfǎ jiějué zhège wèntí.', arabic: 'يبدو أنه ليس لديّ حلّ لهذه المشكلة.' },
          { speaker: 'A', name: 'هدى', zh: '别担心，你可以跟经理说说。', pinyin: 'Bié dānxīn, nǐ kěyǐ gēn jīnglǐ shuōshuo.', arabic: 'لا تقلق، يمكنك التحدث مع المدير.' },
          { speaker: 'B', name: 'سامي', zh: '好，我今天想跟他请假。', pinyin: 'Hǎo, wǒ jīntiān xiǎng gēn tā qǐngjià.', arabic: 'حسناً، أريد أن أطلب منه إجازة اليوم.' },
          { speaker: 'A', name: 'هدى', zh: '请把地点发到我的邮箱吧。', pinyin: 'Qǐng bǎ dìdiǎn fā dào wǒ de yóuxiāng ba.', arabic: 'من فضلك أرسل المكان إلى بريدي الإلكتروني.' },
          { speaker: 'B', name: 'سامي', zh: '好，这是一个很好的机会。', pinyin: 'Hǎo, zhè shì yí ge hěn hǎo de jīhuì.', arabic: 'حسناً، هذه فرصة جيدة جداً.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 会议 (huìyì)؟', options: ['كاميرا','اجتماع / مؤتمر','يخدم / خدمة','مجامل / متكلّف'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 经理 (jīnglǐ)؟', options: ['نحن (شاملة المخاطَب)','طازج','يستعير / يُعير','مدير'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 开会 (kāihuì)؟', options: ['لم... إلا / عندئذ فقط','غرفة','مدينة','يعقد اجتماعاً'], correct: 3 }
    ],
  },
  {
    id: 12, title: 'الطقس والفصول', titleZh: '这个季节天气变化很快', level: 'HSK3',
    vocabularyIds: [3298, 3299, 3300, 3301, 3302, 3303, 3304, 3305, 3306, 3307, 3308, 3309, 3310, 3311, 3312, 3313, 3314, 3315, 3316, 3317, 3318, 3319, 3320, 3321, 3322, 3323],
    grammarIds: [338, 339, 340, 341],
    keySentences: [
      { zh: "这个季节天气变化很快。", pinyin: "Zhège jìjié tiānqì biànhuà hěn kuài.", arabic: "يتغيّر الطقس بسرعة في هذا الفصل.", audioAvailable: true },
      { zh: "外面刮风了，你带伞了吗？", pinyin: "Wàimiàn guā fēng le, nǐ dài sǎn le ma?", arabic: "الرياح تهبّ في الخارج، هل أحضرتَ مظلّة؟", audioAvailable: true },
      { zh: "春天到了，公园里的花都开了。", pinyin: "Chūntiān dào le, gōngyuán lǐ de huā dōu kāi le.", arabic: "حلّ الربيع، وتفتّحت كل الزهور في الحديقة.", audioAvailable: true },
      { zh: "秋天的叶子变成了黄色。", pinyin: "Qiūtiān de yèzi biànchéng le huángsè.", arabic: "أوراق الشجر في الخريف صارت صفراء.", audioAvailable: true },
      { zh: "我最喜欢凉快的秋天。", pinyin: "Wǒ zuì xǐhuan liángkuai de qiūtiān.", arabic: "أحبّ الخريف المنعش أكثر من غيره.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L12C1',
        title: 'تغيّر الطقس',
        scene: '🍂 عند نافذة الفصل في الخريف',
        turns: [
          { speaker: 'A', name: 'رنا', zh: '这个季节天气变化很快。', pinyin: 'Zhège jìjié tiānqì biànhuà hěn kuài.', arabic: 'يتغيّر الطقس بسرعة في هذا الفصل.' },
          { speaker: 'B', name: 'فهد', zh: '外面刮风了，你带伞了吗？', pinyin: 'Wàimiàn guā fēng le, nǐ dài sǎn le ma?', arabic: 'الرياح تهبّ في الخارج، هل أحضرت مظلّة؟' },
          { speaker: 'A', name: 'رنا', zh: '带了，秋天的叶子都变成黄色了。', pinyin: 'Dài le, qiūtiān de yèzi dōu biànchéng huángsè le.', arabic: 'أحضرتُها، وأوراق الشجر في الخريف صارت كلها صفراء.' },
          { speaker: 'B', name: 'فهد', zh: '我最喜欢凉快的秋天。', pinyin: 'Wǒ zuì xǐhuan liángkuai de qiūtiān.', arabic: 'أحبّ الخريف المنعش أكثر من غيره.' },
          { speaker: 'A', name: 'رنا', zh: '春天公园里的花都开了，也很好看。', pinyin: 'Chūntiān gōngyuán lǐ de huā dōu kāi le, yě hěn hǎokàn.', arabic: 'في الربيع تتفتح كل الزهور في الحديقة، وهي جميلة أيضاً.' },
          { speaker: 'B', name: 'فهد', zh: '对，我们常常去公园散步。', pinyin: 'Duì, wǒmen chángcháng qù gōngyuán sànbù.', arabic: 'صحيح، نذهب كثيراً للتنزّه في الحديقة.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 街 (jiē)؟', options: ['اتجاه','زوج (كلمة عدّ)','شارع','نظيف'], correct: 2 },
      { type: 'multiple_choice', q: 'ما معنى 开花 (kāihuā)؟', options: ['ثلج / يبرّد','معطف مطر','يُزهر','صوت / كلمة عدّ للأصوات'], correct: 2 },
      { type: 'multiple_choice', q: 'ما معنى 公园 (gōngyuán)؟', options: ['حديقة عامة','مرّة (من البداية للنهاية)','يوافق','العالم'], correct: 0 }
    ],
  },
  {
    id: 13, title: 'الضيافة والثقافة', titleZh: '我的新邻居来自英国', level: 'HSK3',
    vocabularyIds: [3324, 3325, 3326, 3327, 3328, 3329, 3330, 3331, 3332, 3333, 3334, 3335, 3336, 3337, 3338, 3339, 3340, 3341, 3342, 3343, 3344, 3345, 3346, 3347, 3348, 3349, 3350],
    grammarIds: [342, 343, 344],
    keySentences: [
      { zh: "我的新邻居来自南方。", pinyin: "Wǒ de xīn línjū láizì nánfāng.", arabic: "جاري الجديد قادم من الجنوب.", audioAvailable: true },
      { zh: "今天我请客，你们不要客气。", pinyin: "Jīntiān wǒ qǐngkè, nǐmen búyào kèqi.", arabic: "اليوم أنا أدعوكم، فلا تتكلّفوا.", audioAvailable: true },
      { zh: "我们一边吃饭，一边聊天儿。", pinyin: "Wǒmen yìbiān chīfàn, yìbiān liáotiānr.", arabic: "نتناول الطعام ونتحدّث في الوقت نفسه.", audioAvailable: true },
      { zh: "去做客的话，最好带一个礼物。", pinyin: "Qù zuòkè dehuà, zuìhǎo dài yí ge lǐwù.", arabic: "إن ذهبتَ زائراً، فالأفضل أن تحمل هدية.", audioAvailable: true },
      { zh: "南方和北方的做法很不同。", pinyin: "Nánfāng hé běifāng de zuòfǎ hěn bùtóng.", arabic: "طريقة الطهي في الجنوب تختلف كثيراً عن الشمال.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L13C1',
        title: 'زيارة الجار الجديد',
        scene: '🏡 في بيت الجار مساءً',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '我的新邻居来自南方。', pinyin: 'Wǒ de xīn línjū láizì nánfāng.', arabic: 'جاري الجديد قادم من الجنوب.' },
          { speaker: 'B', name: 'أحمد', zh: '今天我请客，你们不要客气。', pinyin: 'Jīntiān wǒ qǐngkè, nǐmen búyào kèqi.', arabic: 'اليوم أنا أدعوكم، فلا تتكلّفوا.' },
          { speaker: 'A', name: 'ليلى', zh: '去做客的话，最好带一个礼物。', pinyin: 'Qù zuòkè dehuà, zuìhǎo dài yí ge lǐwù.', arabic: 'إن ذهبنا زائرين، فالأفضل أن نحمل هدية.' },
          { speaker: 'B', name: 'أحمد', zh: '好主意，我们一边吃饭，一边聊天儿。', pinyin: 'Hǎo zhǔyi, wǒmen yìbiān chīfàn, yìbiān liáotiānr.', arabic: 'فكرة جيدة، سنتناول الطعام ونتحدّث معاً.' },
          { speaker: 'A', name: 'ليلى', zh: '南方和北方的做法很不同。', pinyin: 'Nánfāng hé běifāng de zuòfǎ hěn bùtóng.', arabic: 'طريقة الطهي في الجنوب تختلف كثيراً عن الشمال.' },
          { speaker: 'B', name: 'أحمد', zh: '对，我很想尝尝南方的菜。', pinyin: 'Duì, wǒ hěn xiǎng chángchang nánfāng de cài.', arabic: 'صحيح، أريد كثيراً تذوّق طعام الجنوب.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 请客 (qǐngkè)؟', options: ['يدعو على وليمة','يتذكّر / يسجّل','فقط','بطاقة ائتمان'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 南方 (nánfāng)؟', options: ['شخصية مشهورة','الجنوب','نحو / إلى','واضح'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 北方 (běifāng)؟', options: ['بل وأيضاً','الشمال','اجتماع / مؤتمر','باستمرار / طوال الوقت'], correct: 1 }
    ],
  },
  {
    id: 14, title: 'المكتبة والحفلات', titleZh: '这本书被别人借走了', level: 'HSK3',
    vocabularyIds: [3351, 3352, 3353, 3354, 3355, 3356, 3357, 3358, 3359, 3360, 3361, 3362, 3363, 3364, 3365, 3366, 3367, 3368, 3369, 3370, 3371, 3372, 3373, 3374, 3375, 3376, 3377],
    grammarIds: [345, 346, 347],
    keySentences: [
      { zh: "这本书被别人借走了。", pinyin: "Zhè běn shū bèi biéren jiè zǒu le.", arabic: "استعار شخص آخر هذا الكتاب.", audioAvailable: true },
      { zh: "我常常去图书馆看报纸。", pinyin: "Wǒ chángcháng qù túshūguǎn kàn bàozhǐ.", arabic: "أذهب كثيراً إلى المكتبة لقراءة الجرائد.", audioAvailable: true },
      { zh: "我忘记带词典了，怎么办？", pinyin: "Wǒ wàngjì dài cídiǎn le, zěnme bàn?", arabic: "نسيتُ إحضار القاموس، ماذا أفعل؟", audioAvailable: true },
      { zh: "新年晚会上，留学生表演了一个节目。", pinyin: "Xīnnián wǎnhuì shang, liúxuéshēng biǎoyǎn le yí ge jiémù.", arabic: "في حفل رأس السنة قدّم الطلاب الوافدون فقرة.", audioAvailable: true },
      { zh: "最后我们一块儿看了一个视频。", pinyin: "Zuìhòu wǒmen yíkuàir kàn le yí ge shìpín.", arabic: "في النهاية شاهدنا مقطعاً مرئياً معاً.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L14C1',
        title: 'في المكتبة',
        scene: '📚 في مكتبة المدرسة',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '我常常去图书馆看报纸。', pinyin: 'Wǒ chángcháng qù túshūguǎn kàn bàozhǐ.', arabic: 'أذهب كثيراً إلى المكتبة لقراءة الجرائد.' },
          { speaker: 'B', name: 'عمر', zh: '我忘记带词典了，怎么办？', pinyin: 'Wǒ wàngjì dài cídiǎn le, zěnme bàn?', arabic: 'نسيتُ إحضار القاموس، ماذا أفعل؟' },
          { speaker: 'A', name: 'سارة', zh: '这本书被别人借走了，你先看这本吧。', pinyin: 'Zhè běn shū bèi biéren jiè zǒu le, nǐ xiān kàn zhè běn ba.', arabic: 'هذا الكتاب استعاره شخص آخر، اقرأ هذا أولاً.' },
          { speaker: 'B', name: 'عمر', zh: '谢谢，晚会上有留学生表演节目吗？', pinyin: 'Xièxie, wǎnhuì shang yǒu liúxuéshēng biǎoyǎn jiémù ma?', arabic: 'شكراً، هل يقدّم الطلاب الوافدون فقرة في الحفل؟' },
          { speaker: 'A', name: 'سارة', zh: '有，我们最后一块儿看视频吧。', pinyin: 'Yǒu, wǒmen zuìhòu yíkuàir kàn shìpín ba.', arabic: 'نعم، لنشاهد مقطعاً مرئياً معاً في النهاية.' },
          { speaker: 'B', name: 'عمر', zh: '好，这个主意很不错。', pinyin: 'Hǎo, zhège zhǔyi hěn búcuò.', arabic: 'حسناً، هذه فكرة جيدة جداً.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 词典 (cídiǎn)؟', options: ['يفحص','مشهور','اجتماع / مؤتمر','قاموس'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 最好 (zuìhǎo)؟', options: ['يشغّل الجهاز','الأفضل أن','قريباً / بعد وقت قصير','جملة'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 节 (jié)؟', options: ['يعقد اجتماعاً','حصة دراسية (كلمة عدّ)','مرج عشبي','حاسوب محمول / دفتر'], correct: 1 }
    ],
  },
  {
    id: 15, title: 'المدينة والمعالم', titleZh: '我是半个南京人', level: 'HSK3',
    vocabularyIds: [3378, 3379, 3380, 3381, 3382, 3383, 3384, 3385, 3386, 3387, 3388, 3389, 3390, 3391, 3392, 3393, 3394, 3395, 3396, 3397, 3398, 3399, 3400, 3401],
    grammarIds: [348, 349, 350],
    keySentences: [
      { zh: "我是半个南京人。", pinyin: "Wǒ shì bàn ge Nánjīng rén.", arabic: "أنا نصف نانجينغيّ.", audioAvailable: true },
      { zh: "学校附近有一条很长的河。", pinyin: "Xuéxiào fùjìn yǒu yì tiáo hěn cháng de hé.", arabic: "قرب المدرسة نهر طويل جداً.", audioAvailable: true },
      { zh: "这个景点每天有很多游客。", pinyin: "Zhège jǐngdiǎn měitiān yǒu hěn duō yóukè.", arabic: "يزور هذا المعلَم سيّاح كثيرون كل يوم.", audioAvailable: true },
      { zh: "平时放学以后我喜欢去河边走走。", pinyin: "Píngshí fàngxué yǐhòu wǒ xǐhuan qù hé biān zǒuzou.", arabic: "عادةً بعد انتهاء الدوام أحبّ أن أتمشّى على ضفة النهر.", audioAvailable: true },
      { zh: "我在马路上遇见了一位老人。", pinyin: "Wǒ zài mǎlù shang yùjiàn le yí wèi lǎorén.", arabic: "التقيتُ صدفةً بمسنّ في الطريق.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L15C1',
        title: 'نصف نانجينغي',
        scene: '🏞️ على ضفة النهر مساءً',
        turns: [
          { speaker: 'A', name: 'نورة', zh: '我是半个南京人。', pinyin: 'Wǒ shì bàn ge Nánjīng rén.', arabic: 'أنا نصف نانجينغيّ.' },
          { speaker: 'B', name: 'خالد', zh: '学校附近有一条很长的河，是吗？', pinyin: 'Xuéxiào fùjìn yǒu yì tiáo hěn cháng de hé, shì ma?', arabic: 'هل هناك نهر طويل قرب المدرسة؟' },
          { speaker: 'A', name: 'نورة', zh: '对，平时放学以后我喜欢去河边走走。', pinyin: 'Duì, píngshí fàngxué yǐhòu wǒ xǐhuan qù hé biān zǒuzou.', arabic: 'نعم، عادةً بعد الدوام أحبّ التمشي على ضفة النهر.' },
          { speaker: 'B', name: 'خالد', zh: '这个景点每天有很多游客吧？', pinyin: 'Zhège jǐngdiǎn měitiān yǒu hěn duō yóukè ba?', arabic: 'أظنّ أنّ هذا المعلَم يستقبل سيّاحاً كثيرين كل يوم؟' },
          { speaker: 'A', name: 'نورة', zh: '是的，我常常在马路上遇见外地人。', pinyin: 'Shì de, wǒ chángcháng zài mǎlù shang yùjiàn wàidì rén.', arabic: 'نعم، ألتقي كثيراً بأشخاص من خارج المدينة في الطريق.' },
          { speaker: 'B', name: 'خالد', zh: '那我们明天也去河边看看吧。', pinyin: 'Nà wǒmen míngtiān yě qù hé biān kànkan ba.', arabic: 'إذن لنذهب غداً أيضاً إلى ضفة النهر لنرى.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 蓝 (lán)؟', options: ['برّي','قدم','أزرق','الشتاء'], correct: 2 },
      { type: 'multiple_choice', q: 'ما معنى 段 (duàn)؟', options: ['مقطع / فترة','يلتقط صورة','في الحقيقة','قريب / بالجوار'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 附近 (fùjìn)؟', options: ['جواز سفر','معاً / في المكان نفسه','ماو (عُشر يوان)','قريب / بالجوار'], correct: 3 }
    ],
  },
  {
    id: 16, title: 'الحيوانات والطبيعة', titleZh: '我听说有的熊猫出国了', level: 'HSK3',
    vocabularyIds: [3402, 3403, 3404, 3405, 3406, 3407, 3408, 3409, 3410, 3411, 3412, 3413, 3414, 3415, 3416, 3417, 3418, 3419, 3420, 3421, 3422, 3423, 3424, 3425],
    grammarIds: [351, 352, 353, 354],
    keySentences: [
      { zh: "我听说有的熊猫出国了。", pinyin: "Wǒ tīngshuō yǒude xióngmāo chūguó le.", arabic: "سمعتُ أنّ بعض الباندا سافرت إلى الخارج.", audioAvailable: true },
      { zh: "周末我们去动物园看大熊猫吧。", pinyin: "Zhōumò wǒmen qù dòngwùyuán kàn dàxióngmāo ba.", arabic: "لنذهب في عطلة نهاية الأسبوع إلى حديقة الحيوان لرؤية الباندا العملاقة.", audioAvailable: true },
      { zh: "大熊猫最喜爱吃竹子。", pinyin: "Dàxióngmāo zuì xǐ'ài chī zhúzi.", arabic: "أحبّ ما تأكله الباندا العملاقة هو الخيزران.", audioAvailable: true },
      { zh: "它的脸很大，样子很可爱。", pinyin: "Tā de liǎn hěn dà, yàngzi hěn kě'ài.", arabic: "وجهها كبير وشكلها لطيف جداً.", audioAvailable: true },
      { zh: "全世界的人都喜欢这种动物。", pinyin: "Quán shìjiè de rén dōu xǐhuan zhè zhǒng dòngwù.", arabic: "الناس في العالم كلّه يحبّون هذا النوع من الحيوانات.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L16C1',
        title: 'في حديقة الحيوان',
        scene: '🐼 في حديقة الحيوان يوم العطلة',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '周末我们去动物园看大熊猫吧。', pinyin: 'Zhōumò wǒmen qù dòngwùyuán kàn dàxióngmāo ba.', arabic: 'لنذهب في عطلة نهاية الأسبوع إلى حديقة الحيوان لرؤية الباندا العملاقة.' },
          { speaker: 'B', name: 'أحمد', zh: '好，我听说有的熊猫出国了。', pinyin: 'Hǎo, wǒ tīngshuō yǒude xióngmāo chūguó le.', arabic: 'حسناً، سمعتُ أنّ بعض الباندا سافرت إلى الخارج.' },
          { speaker: 'A', name: 'ليلى', zh: '它的脸很大，样子很可爱。', pinyin: "Tā de liǎn hěn dà, yàngzi hěn kě'ài.", arabic: 'وجهها كبير وشكلها لطيف جداً.' },
          { speaker: 'B', name: 'أحمد', zh: '对，它最喜爱吃竹子。', pinyin: "Duì, tā zuì xǐ'ài chī zhúzi.", arabic: 'صحيح، وأكثر ما تحبّ أكله هو الخيزران.' },
          { speaker: 'A', name: 'ليلى', zh: '全世界的人都喜欢这种动物。', pinyin: 'Quán shìjiè de rén dōu xǐhuan zhè zhǒng dòngwù.', arabic: 'الناس في العالم كلّه يحبّون هذا النوع من الحيوانات.' },
          { speaker: 'B', name: 'أحمد', zh: '我们多拍几张照片吧。', pinyin: 'Wǒmen duō pāi jǐ zhāng zhàopiàn ba.', arabic: 'لنلتقط عدة صور.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 脏 (zāng)؟', options: ['متّسخ','أداة المبني للمجهول','اهتمام / هواية','سائق'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 可爱 (kě\'ài)؟', options: ['ودود / حارّ الاستقبال','صوت / كلمة عدّ للأصوات','يمارس الرياضة','لطيف / محبّب'], correct: 3 },
      { type: 'multiple_choice', q: 'ما معنى 一会儿 (yíhuìr)؟', options: ['متأخر (عن الموعد)','تارةً... وتارةً','يقرّر / قرار','أولاً'], correct: 1 }
    ],
  },
  {
    id: 17, title: 'المستقبل والقرارات', titleZh: '我要多向认真的人学习', level: 'HSK3',
    vocabularyIds: [3426, 3427, 3428, 3429, 3430, 3431, 3432, 3433, 3434, 3435, 3436, 3437, 3438, 3439, 3440, 3441, 3442, 3443, 3444, 3445, 3446, 3447, 3448, 3449, 3450, 3451, 3452],
    grammarIds: [355, 356, 357, 358],
    keySentences: [
      { zh: "我要多向认真的人学习。", pinyin: "Wǒ yào duō xiàng rènzhēn de rén xuéxí.", arabic: "أريد أن أتعلّم كثيراً من الأشخاص الجادّين.", audioAvailable: true },
      { zh: "我认为这个方法很有用。", pinyin: "Wǒ rènwéi zhège fāngfǎ hěn yǒuyòng.", arabic: "أرى أنّ هذه الطريقة مفيدة جداً.", audioAvailable: true },
      { zh: "你走错方向了。", pinyin: "Nǐ zǒu cuò fāngxiàng le.", arabic: "لقد سرتَ في الاتجاه الخاطئ.", audioAvailable: true },
      { zh: "这个问题不太容易回答。", pinyin: "Zhège wèntí bú tài róngyì huídá.", arabic: "هذا السؤال ليس سهل الإجابة.", audioAvailable: true },
      { zh: "上课的时候必须关机。", pinyin: "Shàngkè de shíhou bìxū guānjī.", arabic: "يجب إطفاء الجهاز أثناء الحصة.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L17C1',
        title: 'خيار المستقبل',
        scene: '🎓 في غرفة المذاكرة',
        turns: [
          { speaker: 'A', name: 'مريم', zh: '我要多向认真的人学习。', pinyin: 'Wǒ yào duō xiàng rènzhēn de rén xuéxí.', arabic: 'أريد أن أتعلّم كثيراً من الأشخاص الجادّين.' },
          { speaker: 'B', name: 'يوسف', zh: '我认为留学是个好机会。', pinyin: 'Wǒ rènwéi liúxué shì ge hǎo jīhuì.', arabic: 'أرى أنّ الدراسة في الخارج فرصة جيدة.' },
          { speaker: 'A', name: 'مريم', zh: '这个问题不太容易回答。', pinyin: 'Zhège wèntí bú tài róngyì huídá.', arabic: 'هذا السؤال ليس سهل الإجابة.' },
          { speaker: 'B', name: 'يوسف', zh: '你可以查一查有关的国家。', pinyin: 'Nǐ kěyǐ chá yi chá yǒuguān de guójiā.', arabic: 'يمكنك البحث عن الدول المتعلقة بالأمر.' },
          { speaker: 'A', name: 'مريم', zh: '好，我会继续想这件事情。', pinyin: 'Hǎo, wǒ huì jìxù xiǎng zhè jiàn shìqing.', arabic: 'حسناً، سأستمر في التفكير بهذا الأمر.' },
          { speaker: 'B', name: 'يوسف', zh: '别害怕，你一定能找到方向。', pinyin: 'Bié hàipà, nǐ yídìng néng zhǎodào fāngxiàng.', arabic: 'لا تخف، ستجد اتجاهك بالتأكيد.' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 向 (xiàng)؟', options: ['واضح','نحو / إلى','يضع','قريباً / بعد وقت قصير'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 楼梯 (lóutī)؟', options: ['يغضب','درج / سلّم','رسّام','جداً / إلى حد كبير'], correct: 1 },
      { type: 'multiple_choice', q: 'ما معنى 害怕 (hàipà)؟', options: ['يخاف','ملاحظات مكتوبة','غالباً / تقريباً','يُقلع (الطائرة)'], correct: 0 }
    ],
  },
  {
    id: 18, title: 'الأعياد والعائلة', titleZh: '我学会了包饺子', level: 'HSK3',
    vocabularyIds: [3453, 3454, 3455, 3456, 3457, 3458, 3459, 3460, 3461, 3462, 3463, 3464, 3465, 3466, 3467, 3468, 3469, 3470, 3471, 3472, 3473, 3474, 3475, 3476, 3477, 3478, 3479],
    grammarIds: [359, 360, 361, 362],
    keySentences: [
      { zh: "我学会了包饺子。", pinyin: "Wǒ xuéhuì le bāo jiǎozi.", arabic: "تعلّمتُ صنع الزلابية.", audioAvailable: true },
      { zh: "春节是中国最重要的节日。", pinyin: "Chūnjié shì Zhōngguó zuì zhòngyào de jiérì.", arabic: "عيد الربيع هو أهمّ عيد في الصين.", audioAvailable: true },
      { zh: "我们刚刚出发，大概六点到。", pinyin: "Wǒmen gānggāng chūfā, dàgài liù diǎn dào.", arabic: "انطلقنا للتوّ، وسنصل تقريباً في السادسة.", audioAvailable: true },
      { zh: "只要坚持，你一定能完成目标。", pinyin: "Zhǐyào jiānchí, nǐ yídìng néng wánchéng mùbiāo.", arabic: "ما دمتَ مواظباً فستحقّق هدفك بالتأكيد.", audioAvailable: true },
      { zh: "我下个学期就要毕业了。", pinyin: "Wǒ xià ge xuéqī jiù yào bìyè le.", arabic: "سأتخرّج في الفصل الدراسي القادم.", audioAvailable: true },
    ],
    conversations: [
      {
        id: 'H3L18C1',
        title: 'تحضير عيد الربيع',
        scene: '🥟 في المطبخ قبل عيد الربيع',
        turns: [
          { speaker: 'A', name: 'هدى', zh: '我学会了包饺子。', pinyin: 'Wǒ xuéhuì le bāo jiǎozi.', arabic: 'تعلّمتُ صنع الزلابية.' },
          { speaker: 'B', name: 'سامي', zh: '春节是中国最重要的节日。', pinyin: 'Chūnjié shì Zhōngguó zuì zhòngyào de jiérì.', arabic: 'عيد الربيع هو أهمّ عيد في الصين.' },
          { speaker: 'A', name: 'هدى', zh: '阿姨和叔叔刚刚到，我们出发吧。', pinyin: 'Āyí hé shūshu gānggāng dào, wǒmen chūfā ba.', arabic: 'الخالة والعمّ وصلا للتوّ، لننطلق.' },
          { speaker: 'B', name: 'سامي', zh: '好，大概六点就能见面了。', pinyin: 'Hǎo, dàgài liù diǎn jiù néng jiànmiàn le.', arabic: 'حسناً، سنلتقي تقريباً في السادسة.' },
          { speaker: 'A', name: 'هدى', zh: '只要坚持，你一定能完成目标。', pinyin: 'Zhǐyào jiānchí, nǐ yídìng néng wánchéng mùbiāo.', arabic: 'ما دمتَ مواظباً فستحقّق هدفك بالتأكيد.' },
          { speaker: 'B', name: 'سامي', zh: '谢谢，节日快乐！', pinyin: 'Xièxie, jiérì kuàilè!', arabic: 'شكراً، عيداً سعيداً!' },
        ],
      },
    ],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 怎样 (zěnyàng)؟', options: ['كيف / بأي حال','الباندا العملاقة','يستخدم / يتناول (طعاماً)','رأس السنة'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 过节 (guòjié)؟', options: ['يقفز / يرقص','يتذكّر / يسجّل','يحتفل بعيد','طريق عام'], correct: 2 },
      { type: 'multiple_choice', q: 'ما معنى 节日 (jiérì)؟', options: ['جواز سفر','عيد / مناسبة','لم... إلا / عندئذ فقط','مكان'], correct: 1 }
    ],
  },
];
