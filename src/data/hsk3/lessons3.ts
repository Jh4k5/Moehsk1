import type { Lesson } from '../lessons';

// HSK3 lessons — the 18 lessons of 新HSK教程3. vocabularyIds use HSK3 ids (3001+).
export const lessons3: Lesson[] = [
  {
    id: 1, title: 'في المطار والاستقبال', titleZh: '我们去机场接你们', level: 'HSK3',
    vocabularyIds: [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3022, 3023, 3024, 3025, 3026, 3027],
    grammarIds: [301, 302, 303],
    keySentences: [
      { zh: '以为', pinyin: 'yǐwéi', arabic: 'يظن (ظناً خاطئاً)', audioAvailable: true },
      { zh: '像', pinyin: 'xiàng', arabic: 'يشبه / مثل', audioAvailable: true },
      { zh: '长', pinyin: 'zhǎng', arabic: 'ينمو / يكبر', audioAvailable: true },
      { zh: '身高', pinyin: 'shēngāo', arabic: 'الطول (طول الجسم)', audioAvailable: true },
      { zh: '米', pinyin: 'mǐ', arabic: 'متر', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '菜单', pinyin: 'càidān', arabic: 'قائمة الطعام', audioAvailable: true },
      { zh: '又', pinyin: 'yòu', arabic: 'و... أيضاً / مرة أخرى', audioAvailable: true },
      { zh: '饿', pinyin: 'è', arabic: 'جائع', audioAvailable: true },
      { zh: '渴', pinyin: 'kě', arabic: 'عطشان', audioAvailable: true },
      { zh: '客气', pinyin: 'kèqi', arabic: 'مجامل / متكلّف', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '初中', pinyin: 'chūzhōng', arabic: 'المرحلة المتوسطة', audioAvailable: true },
      { zh: '咱们', pinyin: 'zánmen', arabic: 'نحن (شاملة المخاطَب)', audioAvailable: true },
      { zh: '换', pinyin: 'huàn', arabic: 'يبدّل / يغيّر', audioAvailable: true },
      { zh: '房子', pinyin: 'fángzi', arabic: 'بيت / منزل', audioAvailable: true },
      { zh: '小区', pinyin: 'xiǎoqū', arabic: 'حيّ سكني', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '假期', pinyin: 'jiàqī', arabic: 'عطلة / إجازة', audioAvailable: true },
      { zh: '海', pinyin: 'hǎi', arabic: 'البحر', audioAvailable: true },
      { zh: '草原', pinyin: 'cǎoyuán', arabic: 'سهل عشبي / بادية', audioAvailable: true },
      { zh: '主意', pinyin: 'zhǔyi', arabic: 'فكرة / رأي', audioAvailable: true },
      { zh: '骑', pinyin: 'qí', arabic: 'يركب (دراجة أو حصاناً)', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '总是', pinyin: 'zǒngshì', arabic: 'دائماً', audioAvailable: true },
      { zh: '终于', pinyin: 'zhōngyú', arabic: 'أخيراً', audioAvailable: true },
      { zh: '爬', pinyin: 'pá', arabic: 'يتسلّق', audioAvailable: true },
      { zh: '山', pinyin: 'shān', arabic: 'جبل', audioAvailable: true },
      { zh: '锻炼', pinyin: 'duànliàn', arabic: 'يمارس الرياضة', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '该', pinyin: 'gāi', arabic: 'ينبغي / حان دور', audioAvailable: true },
      { zh: '打算', pinyin: 'dǎsuàn', arabic: 'ينوي / يخطط', audioAvailable: true },
      { zh: '高铁', pinyin: 'gāotiě', arabic: 'قطار فائق السرعة', audioAvailable: true },
      { zh: '行', pinyin: 'xíng', arabic: 'لا بأس / يصلح', audioAvailable: true },
      { zh: '路口', pinyin: 'lùkǒu', arabic: 'تقاطع طرق', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '辆', pinyin: 'liàng', arabic: 'كلمة عدّ للمركبات', audioAvailable: true },
      { zh: '自行车', pinyin: 'zìxíngchē', arabic: 'دراجة هوائية', audioAvailable: true },
      { zh: '旧', pinyin: 'jiù', arabic: 'قديم / مستعمل', audioAvailable: true },
      { zh: '矮', pinyin: 'ǎi', arabic: 'قصير / منخفض', audioAvailable: true },
      { zh: '试', pinyin: 'shì', arabic: 'يجرّب', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '最近', pinyin: 'zuìjìn', arabic: 'مؤخراً', audioAvailable: true },
      { zh: '常', pinyin: 'cháng', arabic: 'غالباً / كثيراً', audioAvailable: true },
      { zh: '体育馆', pinyin: 'tǐyùguǎn', arabic: 'صالة رياضية', audioAvailable: true },
      { zh: '习惯', pinyin: 'xíguàn', arabic: 'عادة / يعتاد', audioAvailable: true },
      { zh: '胖', pinyin: 'pàng', arabic: 'سمين', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '校园', pinyin: 'xiàoyuán', arabic: 'الحرم الجامعي', audioAvailable: true },
      { zh: '卡', pinyin: 'kǎ', arabic: 'بطاقة', audioAvailable: true },
      { zh: '球场', pinyin: 'qiúchǎng', arabic: 'ملعب', audioAvailable: true },
      { zh: '为了', pinyin: 'wèile', arabic: 'من أجل', audioAvailable: true },
      { zh: '运动会', pinyin: 'yùndònghuì', arabic: 'مهرجان رياضي', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '数学', pinyin: 'shùxué', arabic: 'الرياضيات', audioAvailable: true },
      { zh: '认真', pinyin: 'rènzhēn', arabic: 'جادّ / متقن', audioAvailable: true },
      { zh: '笔记', pinyin: 'bǐjì', arabic: 'ملاحظات مكتوبة', audioAvailable: true },
      { zh: '清楚', pinyin: 'qīngchu', arabic: 'واضح', audioAvailable: true },
      { zh: '黑板', pinyin: 'hēibǎn', arabic: 'السبّورة', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '会议', pinyin: 'huìyì', arabic: 'اجتماع / مؤتمر', audioAvailable: true },
      { zh: '经理', pinyin: 'jīnglǐ', arabic: 'مدير', audioAvailable: true },
      { zh: '开会', pinyin: 'kāihuì', arabic: 'يعقد اجتماعاً', audioAvailable: true },
      { zh: '后天', pinyin: 'hòutiān', arabic: 'بعد غد', audioAvailable: true },
      { zh: '地点', pinyin: 'dìdiǎn', arabic: 'مكان', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '街', pinyin: 'jiē', arabic: 'شارع', audioAvailable: true },
      { zh: '开花', pinyin: 'kāihuā', arabic: 'يُزهر', audioAvailable: true },
      { zh: '公园', pinyin: 'gōngyuán', arabic: 'حديقة عامة', audioAvailable: true },
      { zh: '船', pinyin: 'chuán', arabic: 'قارب / سفينة', audioAvailable: true },
      { zh: '工作日', pinyin: 'gōngzuòrì', arabic: 'يوم عمل', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '请客', pinyin: 'qǐngkè', arabic: 'يدعو على وليمة', audioAvailable: true },
      { zh: '南方', pinyin: 'nánfāng', arabic: 'الجنوب', audioAvailable: true },
      { zh: '北方', pinyin: 'běifāng', arabic: 'الشمال', audioAvailable: true },
      { zh: '做法', pinyin: 'zuòfǎ', arabic: 'طريقة العمل / الطهي', audioAvailable: true },
      { zh: '不同', pinyin: 'bùtóng', arabic: 'مختلف', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '词典', pinyin: 'cídiǎn', arabic: 'قاموس', audioAvailable: true },
      { zh: '最好', pinyin: 'zuìhǎo', arabic: 'الأفضل أن', audioAvailable: true },
      { zh: '节', pinyin: 'jié', arabic: 'حصة دراسية (كلمة عدّ)', audioAvailable: true },
      { zh: '图书馆', pinyin: 'túshūguǎn', arabic: 'مكتبة', audioAvailable: true },
      { zh: '被', pinyin: 'bèi', arabic: 'أداة المبني للمجهول', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '蓝', pinyin: 'lán', arabic: 'أزرق', audioAvailable: true },
      { zh: '段', pinyin: 'duàn', arabic: 'مقطع / فترة', audioAvailable: true },
      { zh: '附近', pinyin: 'fùjìn', arabic: 'قريب / بالجوار', audioAvailable: true },
      { zh: '马路', pinyin: 'mǎlù', arabic: 'طريق عام', audioAvailable: true },
      { zh: '平时', pinyin: 'píngshí', arabic: 'عادةً / في الأيام العادية', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '脏', pinyin: 'zāng', arabic: 'متّسخ', audioAvailable: true },
      { zh: '可爱', pinyin: 'kě\'ài', arabic: 'لطيف / محبّب', audioAvailable: true },
      { zh: '一会儿', pinyin: 'yíhuìr', arabic: 'تارةً... وتارةً', audioAvailable: true },
      { zh: '脚', pinyin: 'jiǎo', arabic: 'قدم', audioAvailable: true },
      { zh: '照顾', pinyin: 'zhàogù', arabic: 'يعتني بـ', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '向', pinyin: 'xiàng', arabic: 'نحو / إلى', audioAvailable: true },
      { zh: '楼梯', pinyin: 'lóutī', arabic: 'درج / سلّم', audioAvailable: true },
      { zh: '害怕', pinyin: 'hàipà', arabic: 'يخاف', audioAvailable: true },
      { zh: '生气', pinyin: 'shēngqì', arabic: 'يغضب', audioAvailable: true },
      { zh: '常见', pinyin: 'chángjiàn', arabic: 'شائع / مألوف', audioAvailable: true }
    ],
    conversations: [],
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
      { zh: '怎样', pinyin: 'zěnyàng', arabic: 'كيف / بأي حال', audioAvailable: true },
      { zh: '过节', pinyin: 'guòjié', arabic: 'يحتفل بعيد', audioAvailable: true },
      { zh: '节日', pinyin: 'jiérì', arabic: 'عيد / مناسبة', audioAvailable: true },
      { zh: '联欢', pinyin: 'liánhuān', arabic: 'يقيم حفل لقاء', audioAvailable: true },
      { zh: '大概', pinyin: 'dàgài', arabic: 'غالباً / تقريباً', audioAvailable: true }
    ],
    conversations: [],
    exercises: [
      { type: 'multiple_choice', q: 'ما معنى 怎样 (zěnyàng)؟', options: ['كيف / بأي حال','الباندا العملاقة','يستخدم / يتناول (طعاماً)','رأس السنة'], correct: 0 },
      { type: 'multiple_choice', q: 'ما معنى 过节 (guòjié)؟', options: ['يقفز / يرقص','يتذكّر / يسجّل','يحتفل بعيد','طريق عام'], correct: 2 },
      { type: 'multiple_choice', q: 'ما معنى 节日 (jiérì)؟', options: ['جواز سفر','عيد / مناسبة','لم... إلا / عندئذ فقط','مكان'], correct: 1 }
    ],
  },
];
