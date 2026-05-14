// ─── Categories ─────────────────────────────────────────────
export const categories = [
  { value: 'all', label: 'الكل' },
  { value: 'noun', label: 'أسماء' },
  { value: 'verb', label: 'أفعال' },
  { value: 'adjective', label: 'صفات' },
  { value: 'pronoun', label: 'ضمائر' },
  { value: 'numeral', label: 'أعداد' },
  { value: 'particle', label: 'أدوات' },
  { value: 'adverb', label: 'ظروف' },
  { value: 'fixed', label: 'تعبيرات ثابتة' },
]
// ─── Roadmap Data ───────────────────────────────────────────
export const roadmapUnits = [
  { id: 1, title: 'التحيات والتعارف', hours: 1, words: [1,2,3,4,5,6,7,8,9,10,11,12,13,14], desc: 'تعلم التحيات الأساسية والتعرف على الآخرين', grammarIds: [1,5,11] },
  { id: 2, title: 'المعلومات الشخصية', hours: 1, words: [15,16,17,18,19,20,21,27,28,29,30], desc: 'التحدث عن نفسك والأسئلة الشخصية', grammarIds: [2,5,6,7] },
  { id: 3, title: 'العائلة والأصدقاء', hours: 1, words: [36,39,42,49,50,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71], desc: 'وصف العائلة والعلاقات الاجتماعية', grammarIds: [3,4,8,9,10] },
  { id: 4, title: 'الأرقام والعدّ', hours: 0.5, words: [51,52,53,74,75,77,109,154,155,156,162,184,185,188,195,204,217,234], desc: 'الأرقام من 0 إلى 1000 والمعدّات', grammarIds: [10,19] },
  { id: 5, title: 'الوقت والتواريخ', hours: 0.5, words: [72,73,76,93,94,96,98,99,115,116,163,177,192,193,196,197,200,206,207,208,214,235,249,253,254,261,275,280,293,302], desc: 'التعبير عن الوقت والتواريخ والأيام', grammarIds: [17,18] },
  { id: 6, title: 'المكان والاتجاهات', hours: 1, words: [81,97,103,133,164,165,166,167,168,169,277,284,285,286,289,296,297], desc: 'السؤال عن الأماكن والتعبير عن الموقع', grammarIds: [13,9] },
  { id: 7, title: 'الطعام والشراب', hours: 1, words: [78,79,84,85,89,90,105,111,119,126,136,159,160,161,178,259], desc: 'الطعام الصيني والمطاعم والطهي', grammarIds: [1,14] },
  { id: 8, title: 'المواصلات والتسوق', hours: 1, words: [87,88,91,92,107,118,130,131,143,157,158,182,197,198,216,218,219,220,240,241,245,246,260,262,274,275,276], desc: 'التنقل والتسوق والأسعار', grammarIds: [15,16,20,21,22,23] },
  { id: 9, title: 'الحياة اليومية', hours: 1.5, words: [44,45,46,47,48,82,83,106,113,114,121,122,123,124,125,137,141,142,144,145,146,147,148,149,150,152,170,171,172,173,174,175,176,179,180,181,189,190,191,202,203,205,209,210,211,212,213,215,216,217,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,241,242,243,244,247,248,249,250,251,252,255,256,257,258,259,260,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,294,295,296,297,298,299,300,301,302,303,304], desc: 'الأنشطة اليومية والحياة الاجتماعية', grammarIds: [12,14,18,22,23] },
  { id: 10, title: 'مراجعة شاملة', hours: 1, words: [1,2,3,19,20,21,25,26,27,28,30,31,32,33,34,35,37,38,39,40,41,43,48,49,50,51,55,68,69,70,71,106,150,156,170,190,193,204,223,241,244,256,258,259,261,280,281,292,298,300,304], desc: 'مراجعة المفردات والقواعد الأساسية', grammarIds: [24,25,26] },
]
// ─── Stories Data (7 stories) ────────────────────────────────
export const stories = [
  {
    id: 1,
    title: 'يوم لي مينغ',
    titleZh: '李明的一天',
    content: [
      { zh: '我叫李明。', pinyin: 'Wǒ jiào Lǐ Míng.', ar: 'اسمي لي مينغ.' },
      { zh: '我是中国学生。', pinyin: 'Wǒ shì Zhōngguó xuéshēng.', ar: 'أنا طالب صيني.' },
      { zh: '我早上七点起床。', pinyin: 'Wǒ zǎoshang qī diǎn qǐchuáng.', ar: 'أستيقظ السابعة صباحاً.' },
      { zh: '我吃早饭，然后去学校。', pinyin: 'Wǒ chī zǎofàn, ránhòu qù xuéxiào.', ar: 'آكل الفطور ثم أذهب للمدرسة.' },
      { zh: '八点上课。', pinyin: 'Bā diǎn shàngkè.', ar: 'الدرس يبدأ الساعة الثامنة.' },
      { zh: '我的老师很好。', pinyin: 'Wǒ de lǎoshī hěn hǎo.', ar: 'معلمي جيد جداً.' },
      { zh: '我学习中文和英语。', pinyin: 'Wǒ xuéxí Zhōngwén hé Yīngyǔ.', ar: 'أدرس الصينية والإنجليزية.' },
      { zh: '中午我吃午饭。', pinyin: 'Zhōngwǔ wǒ chī wǔfàn.', ar: 'في الظهيرة آكل الغداء.' },
      { zh: '下午三点下课。', pinyin: 'Xiàwǔ sān diǎn xiàkè.', ar: 'الدروس تنتهي الساعة الثالثة.' },
      { zh: '我和朋友去公园玩。', pinyin: 'Wǒ hé péngyou qù gōngyuán wán.', ar: 'أنا وأصدقائي نذهب للحديقة للعب.' },
      { zh: '晚上我在家吃饭。', pinyin: 'Wǎnshang wǒ zài jiā chī fàn.', ar: 'في المساء آكل في البيت.' },
      { zh: '十点睡觉。', pinyin: 'Shí diǎn shuìjiào.', ar: 'أنام في العاشرة.' },
      { zh: '今天很开心！', pinyin: 'Jīntiān hěn kāixīn!', ar: 'اليوم سعيد جداً!' },
    ],
    questions: [
      { zh: '李明几点起床？', options: ['六点', '七点', '八点', '九点'], correct: 1 },
      { zh: '李明学习什么？', options: ['中文和法语', '中文和英语', '英语和日语', '只学中文'], correct: 1 },
      { zh: '下午李明去哪里？', options: ['商店', '图书馆', '公园', '学校'], correct: 2 },
    ],
  },
  {
    id: 2,
    title: 'عائلة وانغ',
    titleZh: '王芳的家庭',
    content: [
      { zh: '这是王芳。', pinyin: 'Zhè shì Wáng Fāng.', ar: 'هذه وانغ فانغ.' },
      { zh: '她有一个大家庭。', pinyin: 'Tā yǒu yí gè dà jiātíng.', ar: 'لديها عائلة كبيرة.' },
      { zh: '爸爸是医生。', pinyin: 'Bàba shì yīshēng.', ar: 'أبي طبيب.' },
      { zh: '妈妈是老师。', pinyin: 'Māma shì lǎoshī.', ar: 'أمي معلمة.' },
      { zh: '她有一个哥哥。', pinyin: 'Tā yǒu yí gè gēge.', ar: 'لديها أخ أكبر.' },
      { zh: '哥哥在北京工作。', pinyin: 'Gēge zài Běijīng gōngzuò.', ar: 'أخوها الأكبر يعمل في بكين.' },
      { zh: '她还有一个妹妹。', pinyin: 'Tā hái yǒu yí gè mèimei.', ar: 'لديها أيضاً أخت صغرى.' },
      { zh: '妹妹七岁。', pinyin: 'Mèimei qī suì.', ar: 'أختها الصغرى عمرها سبع سنوات.' },
      { zh: '她们一家都很喜欢中国菜。', pinyin: 'Tāmen yì jiā dōu hěn xǐhuan Zhōngguó cài.', ar: 'عائلتها كلها تحب الطعام الصيني.' },
      { zh: '妈妈做的饺子最好吃。', pinyin: 'Māma zuò de jiǎozi zuì hǎochī.', ar: 'زلابية أمي هي الألذ.' },
    ],
    questions: [
      { zh: '王芳的爸爸做什么工作？', options: ['老师', '医生', '学生', '工人'], correct: 1 },
      { zh: '她有几个兄弟姊妹？', options: ['一个', '两个', '三个', '没有'], correct: 1 },
      { zh: '谁做的饺子最好吃？', options: ['爸爸', '哥哥', '妈妈', '王芳'], correct: 2 },
    ],
  },
  {
    id: 3,
    title: 'في المطعم',
    titleZh: '在饭店',
    content: [
      { zh: '今天我和朋友去饭店。', pinyin: 'Jīntiān wǒ hé péngyou qù fàndiàn.', ar: 'اليوم أنا وصديقي ذهبنا للمطعم.' },
      { zh: '这个饭店很大。', pinyin: 'Zhège fàndiàn hěn dà.', ar: 'هذا المطعم كبير.' },
      { zh: '我们坐下看菜单。', pinyin: 'Wǒmen zuòxià kàn càidān.', ar: 'جلسنا ونظرنا في قائمة الطعام.' },
      { zh: '我要一碗面条。', pinyin: 'Wǒ yào yì wǎn miàntiáo.', ar: 'أريد طبق نودلز.' },
      { zh: '我的朋友要米饭和菜。', pinyin: 'Wǒ de péngyou yào mǐfàn hé cài.', ar: 'صديقي يريد أرز وخضار.' },
      { zh: '我们也点了包子和茶。', pinyin: 'Wǒmen yě diǎn le bāozi hé chá.', ar: 'طلبنا أيضاً باوزي وشاي.' },
      { zh: '菜很好吃，不太贵。', pinyin: 'Cài hěn hǎochī, bú tài guì.', ar: 'الطعام لذيذ وغير غالي.' },
      { zh: '一共五十元。', pinyin: 'Yīgòng wǔshí yuán.', ar: 'المجموع خمسون يواناً.' },
      { zh: '我们很高兴。', pinyin: 'Wǒmen hěn gāoxìng.', ar: 'نحن سعداء جداً.' },
    ],
    questions: [
      { zh: '他们点了什么喝的？', options: ['水', '咖啡', '茶', '牛奶'], correct: 2 },
      { zh: '一共多少钱？', options: ['三十元', '四十元', '五十元', '六十元'], correct: 2 },
      { zh: '菜怎么样？', options: ['很贵', '不好吃', '很好吃，不太贵', '很便宜'], correct: 2 },
    ],
  },
  {
    id: 4,
    title: 'في المطار',
    titleZh: '在机场',
    content: [
      { zh: '今天我要去中国。', pinyin: 'Jīntiān wǒ yào qù Zhōngguó.', ar: 'اليوم سأذهب إلى الصين.' },
      { zh: '我早上六点起床。', pinyin: 'Wǒ zǎoshang liù diǎn qǐchuáng.', ar: 'أستيقظ السادسة صباحاً.' },
      { zh: '我坐出租车去机场。', pinyin: 'Wǒ zuò chūzūchē qù jīchǎng.', ar: 'أركب التاكسي للمطار.' },
      { zh: '机场很大，人很多。', pinyin: 'Jīchǎng hěn dà, rén hěn duō.', ar: 'المطار كبير والناس كثيرون.' },
      { zh: '我的飞机八点起飞。', pinyin: 'Wǒ de fēijī bā diǎn qǐfēi.', ar: 'طائرتي تقلع الثامنة.' },
      { zh: '我有一个大箱子。', pinyin: 'Wǒ yǒu yí gè dà xiāngzi.', ar: 'لدي حقيبة كبيرة.' },
      { zh: '我买了机票和护照。', pinyin: 'Wǒ mǎi le jīpiào hé hùzhào.', ar: 'اشتريت تذكرة وجواز سفر.' },
      { zh: '两个小时以后，我到了北京。', pinyin: 'Liǎng gè xiǎoshí yǐhòu, wǒ dào le Běijīng.', ar: 'بعد ساعتين وصلت بكين.' },
      { zh: '我很高兴！', pinyin: 'Wǒ hěn gāoxìng!', ar: 'أنا سعيد جداً!' },
    ],
    questions: [
      { zh: '他几点起床？', options: ['五点', '六点', '七点', '八点'], correct: 1 },
      { zh: '他去哪里？', options: ['日本', '中国', '法国', '泰国'], correct: 1 },
      { zh: '飞机几点起飞？', options: ['六点', '七点', '八点', '九点'], correct: 2 },
    ],
  },
  {
    id: 5,
    title: 'زيارة الطبيب',
    titleZh: '看医生',
    content: [
      { zh: '我今天不舒服。', pinyin: 'Wǒ jīntiān bù shūfu.', ar: 'أنا لست مرتاحاً اليوم.' },
      { zh: '我头疼，也咳嗽。', pinyin: 'Wǒ tóu téng, yě késou.', ar: 'رأسي يؤلمني وأسعل أيضاً.' },
      { zh: '妈妈带我去医院。', pinyin: 'Māma dài wǒ qù yīyuàn.', ar: 'أمي تأخذني للمستشفى.' },
      { zh: '医生问我哪里不舒服。', pinyin: 'Yīshēng wèn wǒ nǎlǐ bù shūfu.', ar: 'الطبيب سألني أين أؤلم.' },
      { zh: '医生说我感冒了。', pinyin: 'Yīshēng shuō wǒ gǎnmào le.', ar: 'الطبيب قال إنني مصاب بالزكام.' },
      { zh: '我需要吃药和休息。', pinyin: 'Wǒ xūyào chī yào hé xiūxi.', ar: 'أحتاج لأخذ دواء والراحة.' },
      { zh: '每天吃三次药。', pinyin: 'Měitiān chī sān cì yào.', ar: 'آخذ الدواء ثلاث مرات يومياً.' },
      { zh: '妈妈给我做了汤。', pinyin: 'Māma gěi wǒ zuò le tāng.', ar: 'أمي صنعت لي حساءً.' },
      { zh: '我喝了热茶，感觉好多了。', pinyin: 'Wǒ hē le rè chá, gǎnjué hǎo duō le.', ar: 'شربت شاياً ساخناً وأشعر بتحسن كبير.' },
    ],
    questions: [
      { zh: '他哪里不舒服？', options: ['肚子疼', '头疼和咳嗽', '脚疼', '眼睛疼'], correct: 1 },
      { zh: '他得了什么病？', options: ['发烧', '感冒', '肚子疼', '牙疼'], correct: 1 },
      { zh: '每天吃几次药？', options: ['一次', '两次', '三次', '四次'], correct: 2 },
    ],
  },
  {
    id: 6,
    title: 'عيد الميلاد',
    titleZh: '生日快乐',
    content: [
      { zh: '今天是我的生日。', pinyin: 'Jīntiān shì wǒ de shēngrì.', ar: 'اليوم هو عيد ميلادي.' },
      { zh: '我二十岁了。', pinyin: 'Wǒ èrshí suì le.', ar: 'عمري عشرون سنة.' },
      { zh: '朋友们来我家。', pinyin: 'Péngyoumen lái wǒ jiā.', ar: 'أصدقائي جاءوا لمنزلي.' },
      { zh: '他们给我了很多礼物。', pinyin: 'Tāmen gěi wǒ le hěn duō lǐwù.', ar: 'أعطوني كثيراً من الهدايا.' },
      { zh: '妈妈做了一个大蛋糕。', pinyin: 'Māma zuò le yí gè dà dàngāo.', ar: 'أمي صنعت كعكة كبيرة.' },
      { zh: '我们唱了生日歌。', pinyin: 'Wǒmen chàng le shēngrì gē.', ar: 'غنينا أغنية عيد الميلاد.' },
      { zh: '我许了一个愿望。', pinyin: 'Wǒ xǔ le yí gè yuànwàng.', ar: 'تمنيت أمنية.' },
      { zh: '大家一起吃蛋糕和水果。', pinyin: 'Dàjiā yīqǐ chī dàngāo hé shuǐguǒ.', ar: 'كلنا أكلنا الكعكة والفواكه معاً.' },
      { zh: '今天真的很开心！', pinyin: 'Jīntiān zhēn de hěn kāixīn!', ar: 'اليوم سعيد حقاً!' },
    ],
    questions: [
      { zh: '他几岁？', options: ['十八岁', '十九岁', '二十岁', '二十一岁'], correct: 2 },
      { zh: '妈妈做了什么？', options: ['饺子', '面条', '大蛋糕', '米饭'], correct: 2 },
      { zh: '他们做了什么？', options: ['看电影', '唱歌和吃蛋糕', '去公园', '做作业'], correct: 1 },
    ],
  },
  {
    id: 7,
    title: 'في السوق',
    titleZh: '在市场',
    content: [
      { zh: '周末我和妈妈去市场。', pinyin: 'Zhōumò wǒ hé māma qù shìchǎng.', ar: 'في عطلة نهاية الأسبوع أنا وأمي نذهب للسوق.' },
      { zh: '市场很大，东西很多。', pinyin: 'Shìchǎng hěn dà, dōngxi hěn duō.', ar: 'السوق كبير والأشياء كثيرة.' },
      { zh: '我们买了水果和菜。', pinyin: 'Wǒmen mǎi le shuǐguǒ hé cài.', ar: 'اشترينا فواكه وخضروات.' },
      { zh: '苹果五块钱一斤。', pinyin: 'Píngguǒ wǔ kuài qián yì jīn.', ar: 'التفاح بخمسة يوانات للرطل.' },
      { zh: '我想买一件衣服。', pinyin: 'Wǒ xiǎng mǎi yí jiàn yīfu.', ar: 'أريد شراء ثوب.' },
      { zh: '这件衣服太贵了。', pinyin: 'Zhè jiàn yīfu tài guì le.', ar: 'هذا الثوب غالي جداً.' },
      { zh: '那件衣服便宜，也很好看。', pinyin: 'Nà jiàn yīfu piányí, yě hěn hǎokàn.', ar: 'ذاك الثوب رخيص وجميل أيضاً.' },
      { zh: '我买了那件衣服。', pinyin: 'Wǒ mǎi le nà jiàn yīfu.', ar: 'اشتريت ذلك الثوب.' },
      { zh: '我们今天很高兴。', pinyin: 'Wǒmen jīntiān hěn gāoxìng.', ar: 'نحن سعداء اليوم.' },
    ],
    questions: [
      { zh: '苹果多少钱一斤？', options: ['三块钱', '四块钱', '五块钱', '六块钱'], correct: 2 },
      { zh: '他买了什么衣服？', options: ['贵的', '便宜的', '红色的', '白色的'], correct: 1 },
      { zh: '他和谁去市场？', options: ['朋友', '姐姐', '妈妈', '哥哥'], correct: 2 },
    ],
  },
]
// ─── Enhanced Tone Practice Data ─────────────────────────────
export const tonePairs = [
  { syllable: 'ma', tones: [
    { tone: 1, char: '妈', pinyin: 'mā', meaning: 'أم' },
    { tone: 2, char: '麻', pinyin: 'má', meaning: 'قنب' },
    { tone: 3, char: '马', pinyin: 'mǎ', meaning: 'حصان' },
    { tone: 4, char: '骂', pinyin: 'mà', meaning: 'يشتم' },
  ]},
  { syllable: 'shi', tones: [
    { tone: 1, char: '师', pinyin: 'shī', meaning: 'معلم' },
    { tone: 2, char: '十', pinyin: 'shí', meaning: 'عشرة' },
    { tone: 3, char: '史', pinyin: 'shǐ', meaning: 'تاريخ' },
    { tone: 4, char: '是', pinyin: 'shì', meaning: 'يكون' },
  ]},
  { syllable: 'ren', tones: [
    { tone: 1, char: '人', pinyin: 'rén', meaning: 'شخص' },
    { tone: 2, char: '认', pinyin: 'rèn', meaning: 'يعترف' },
    { tone: 3, char: '忍', pinyin: 'rěn', meaning: 'يتحمل' },
    { tone: 4, char: '日', pinyin: 'rì', meaning: 'يوم' },
  ]},
  { syllable: 'ba', tones: [
    { tone: 1, char: '八', pinyin: 'bā', meaning: 'ثمانية' },
    { tone: 2, char: '拔', pinyin: 'bá', meaning: 'يسحب' },
    { tone: 3, char: '把', pinyin: 'bǎ', meaning: 'يمسك' },
    { tone: 4, char: '爸', pinyin: 'bà', meaning: 'أب' },
  ]},
  { syllable: 'yi', tones: [
    { tone: 1, char: '衣', pinyin: 'yī', meaning: 'ملابس' },
    { tone: 2, char: '移', pinyin: 'yí', meaning: 'ينقل' },
    { tone: 3, char: '已', pinyin: 'yǐ', meaning: 'بالفعل' },
    { tone: 4, char: '意', pinyin: 'yì', meaning: 'معنى' },
  ]},
  { syllable: 'bu', tones: [
    { tone: 1, char: '不', pinyin: 'bù', meaning: 'لا' },
    { tone: 2, char: '不', pinyin: 'bú', meaning: 'لا (قبل رابعة)' },
  ]},
  { syllable: 'de', tones: [
    { tone: 1, char: '的', pinyin: 'de', meaning: 'أداة ملكية' },
    { tone: 2, char: '得', pinyin: 'dé', meaning: 'يحصل' },
    { tone: 3, char: '地', pinyin: 'dì', meaning: 'أرض' },
  ]},
]
// ─── Grammar Practice Questions ──────────────────────────────
export const grammarPracticeQuestions: Record<number, { zh: string; options: string[]; correct: number }[]> = {
  1: [
    { zh: 'اختر الصيغة الصحيحة: 我 ___ 中文。', options: ['学习', '是学习', '学习是', '在学习'], correct: 0 },
    { zh: 'أي جملة صحيحة؟', options: ['我水喝', '我喝水', '喝水我', '水我喝'], correct: 1 },
    { zh: 'جملة صحيحة: 她 ___ 书。', options: ['看', '书看', '看是', '是看'], correct: 0 },
  ],
  2: [
    { zh: '___ 你是学生吗؟', options: ['我', '你', '他', '她'], correct: 1 },
    { zh: 'النفي الصحيح: 我 ___ 老师吗؟', options: ['是', '不是', '不', '没是'], correct: 1 },
    { zh: '他是___。', options: ['学生一个', '一个学生', '学生是', '是学生一个'], correct: 1 },
  ],
  3: [
    { zh: '我 ___ 一本书。', options: ['是', '有', '在', '不'], correct: 1 },
    { zh: '她没有手机。"没有" تعني:', options: ['لا تريد', 'ليس لديها', 'لا تحب', 'لا تعرف'], correct: 1 },
    { zh: '___ 有人在教室里。', options: ['我', '你', '这里', '他'], correct: 2 },
  ],
  4: [
    { zh: '我 ___ 吃肉。(لا آكل الآن)', options: ['没', '不', '在', '很'], correct: 1 },
    { zh: '我昨天 ___ 吃饭。(لم آكل البارحة)', options: ['不', '没', '不是', '不会'], correct: 1 },
    { zh: '他 ___ 是中国人。(ليس صينياً)', options: ['没', '不', '不在', '不会'], correct: 1 },
  ],
  5: [
    { zh: 'تحويل لسؤال: 他是学生。', options: ['他是学生吗؟', '他学生吗是؟', '吗他是学生؟', '他是吗学生؟'], correct: 0 },
    { zh: '你好___؟', options: ['吗', '不', '没', '了'], correct: 0 },
    { zh: '这是一本书___؟', options: ['吗', '不', '呢', '吧'], correct: 0 },
  ],
  6: [
    { zh: '"أنت طالب؟" بصيغة A不A:', options: ['你是学生不是؟', '你是不是学生؟', '你不是是学生؟', '你学生是不是؟'], correct: 1 },
    { zh: '你 ___ 吃؟', options: ['吃不吃', '不吃饭', '吃吗', '没吃'], correct: 0 },
    { zh: '他有书___؟', options: ['不是', '吗', '没有', '没'], correct: 2 },
  ],
  7: [
    { zh: '___ 叫什么名字؟ (ما اسمك؟)', options: ['你', '我', '他', '她'], correct: 0 },
    { zh: '这是___؟ (من هذا؟)', options: ['谁', '什么', '哪', '几'], correct: 0 },
    { zh: '多少钱___؟', options: ['多少', '几', '什么', '哪'], correct: 0 },
  ],
  8: [
    { zh: '她很漂亮。"很" هنا تعني:', options: ['كثيراً', 'كلمة نحوية', 'صغيرة', 'كبيرة'], correct: 1 },
    { zh: 'النفي: 他 ___ 高。', options: ['不很', '没有', '不', '没'], correct: 2 },
    { zh: '天气很好。"很好" تعني:', options: ['جيد جداً', 'كبير', 'سيء', 'بارد'], correct: 0 },
  ],
  9: [
    { zh: '___ 本书是我的。', options: ['这', '那', '这个', '那个'], correct: 0 },
    { zh: '___ 个人是老师。', options: ['这', '那', '这那', '个这'], correct: 1 },
    { zh: '"هنا" بالصينية:', options: ['那里', '这里', '哪里', '那儿'], correct: 1 },
  ],
  10: [
    { zh: '三 ___ 人', options: ['个', '本', '只', '条'], correct: 0 },
    { zh: '两 ___ 书', options: ['个', '本', '只', '杯'], correct: 1 },
    { zh: '一 ___ 茶', options: ['个', '本', '杯', '条'], correct: 2 },
  ],
  11: [
    { zh: '___ 的书 (كتابي)', options: ['我', '你', '他', '她'], correct: 0 },
    { zh: '她们 = ___ + 们', options: ['她', '他', '它', '你'], correct: 0 },
    { zh: '谁的朋友؟ 我___朋友。', options: ['的', '是', '不', '很'], correct: 0 },
  ],
  12: [
    { zh: '我___在吃饭。(أنا آكل الآن)', options: ['在', '是', '有', '想'], correct: 0 },
    { zh: '她___在睡觉。', options: ['正在', '不', '没有', '想'], correct: 0 },
    { zh: '他在___什么؟', options: ['在', '是', '有', '不'], correct: 0 },
  ],
  13: [
    { zh: '我___学校。(أنا في المدرسة)', options: ['在', '是', '有', '去'], correct: 0 },
    { zh: '书在桌子上。"上" تعني:', options: ['فوق', 'تحت', 'داخل', 'خارج'], correct: 0 },
    { zh: '他在___؟(أين هو؟)', options: ['哪里', '什么', '谁', '几'], correct: 0 },
  ],
  14: [
    { zh: '我___去中国。(أريد الذهاب للصين)', options: ['想', '是', '有', '在'], correct: 0 },
    { zh: '我___说汉语。(أستطيع التحدث)', options: ['会', '想', '是', '在'], correct: 0 },
    { zh: '我___进来吗؟(هل يمكنني الدخول؟)', options: ['可以', '想', '是', '在'], correct: 0 },
  ],
  15: [
    { zh: '我___是学生。(أنا أيضاً طالب)', options: ['也', '都', '不', '很'], correct: 0 },
    { zh: '她___喜欢音乐。(هي أيضاً تحب)', options: ['也', '都', '不', '很'], correct: 0 },
    { zh: '位置 "也" في الجملة:', options: ['قبل الفعل', 'بعد الفعل', 'آخر الجملة', 'أول الجملة'], correct: 0 },
  ],
  16: [
    { zh: '我们___是学生。(كلنا طلاب)', options: ['都', '也', '不', '很'], correct: 0 },
    { zh: '他们___喜欢中国。(كلهم يحبون)', options: ['都', '也', '不', '想'], correct: 0 },
    { zh: '位置 "都" في الجملة:', options: ['قبل الفعل', 'آخر الجملة', 'أول الجملة', 'بعد الفعل'], correct: 0 },
  ],
  17: [
    { zh: '我___去学校。(أنا أذهب اليوم)', options: ['今天', '昨天', '明天', '哪里'], correct: 0 },
    { zh: 'ترتيب الوقت في الجملة:', options: ['بعد الفاعل', 'قبل الفاعل', 'آخر الجملة', 'أول الجملة'], correct: 0 },
    { zh: '他___来。(سيأتي غداً)', options: ['明天', '今天', '昨天', '现在'], correct: 0 },
  ],
  18: [
    { zh: '我吃___饭。(أكلت)', options: ['了', '着', '过', '的'], correct: 0 },
    { zh: 'النفي في الماضي:', options: ['没 + فعل', '不 + فعل', '没有是', '不了'], correct: 0 },
    { zh: '他来___。(أتى)', options: ['了', '着', '过', '的'], correct: 0 },
  ],
  19: [
    { zh: '___钱؟ (كم الثمن؟)', options: ['多少', '几', '什么', '哪'], correct: 0 },
    { zh: '你___岁؟ (كم عمرك؟)', options: ['几', '多少', '什么', '多'], correct: 0 },
    { zh: '几 تستخدم للأعداد:', options: ['الصغيرة', 'الكبيرة', 'السنة', 'الساعة'], correct: 0 },
  ],
  20: [
    { zh: '书___笔 (الكتاب والقلم)', options: ['和', '都', '也', '不'], correct: 0 },
    { zh: '"和" تربط:', options: ['الأسماء فقط', 'الجمل', 'الأفعال', 'الصفات'], correct: 0 },
    { zh: '我和你___学生。', options: ['都', '和', '也', '在'], correct: 0 },
  ],
  21: [
    { zh: '他比我___。(أطول مني)', options: ['高', '很高', '不高', '太'], correct: 0 },
    { zh: 'النفي: 我没有他___。', options: ['高', '很高', '太高', '不高'], correct: 0 },
    { zh: '比 تأتي بين:', options: ['شيئين للمقارنة', 'الفعل والمفعول', 'الصفة والاسم', 'الفاعل والفعل'], correct: 0 },
  ],
  22: [
    { zh: '我们走吧。"吧" تعني:', options: ['اقتراح', 'سؤال', 'نفي', 'تأكيد'], correct: 0 },
    { zh: '吃饭___! (هيا نأكل)', options: ['吧', '吗', '不', '没'], correct: 0 },
    { zh: '你是学生___؟ (أنت طالب، أليس كذلك؟)', options: ['吧', '吗', '呢', '不'], correct: 0 },
  ],
  23: [
    { zh: '___好了! (رائع جداً)', options: ['太', '很', '非常', '不'], correct: 0 },
    { zh: '太贵___! (غالٍ جداً)', options: ['了', '吗', '不', '很'], correct: 0 },
    { zh: '太___了 تستخدم:', options: ['للمبالغة', 'للسؤال', 'للنفي', 'للتأكيد'], correct: 0 },
  ],
  24: [
    { zh: '妈 (mā) تعني:', options: ['أم', 'حصان', 'قنب', 'يشتم'], correct: 0 },
    { zh: '马 (mǎ) تعني:', options: ['أم', 'حصان', 'قنب', 'يشتم'], correct: 1 },
    { zh: 'عدد النبرات في الصينية:', options: ['4', '3', '5', '6'], correct: 0 },
  ],
  25: [
    { zh: '不是 → bú 还是 bù؟', options: ['bú', 'bù', 'bā', 'bǎ'], correct: 0 },
    { zh: '不吃 → bù 还是 bú؟', options: ['bù', 'bú', 'bā', 'bǎ'], correct: 0 },
    { zh: '不 تصبح ثانية قبل:', options: ['النبرة الرابعة', 'النبرة الأولى', 'النبرة الثانية', 'النبرة الثالثة'], correct: 0 },
  ],
  26: [
    { zh: '一个 → yí 还是 yī؟', options: ['yí', 'yī', 'yì', 'yǐ'], correct: 0 },
    { zh: '一天 → yì 还是 yī؟', options: ['yì', 'yí', 'yī', 'yǐ'], correct: 0 },
    { zh: '第一 → dì yī، هنا 一:', options: ['تبقى أولى', 'تصبح ثانية', 'تصبح رابعة', 'تختفي'], correct: 0 },
  ],
}
// ─── Keyboard Shortcuts Data ──────────────────────────────
export const keyboardShortcuts = [
  { keys: ['←', '→'], description: 'التنقل بين البطاقات', section: 'المفردات' },
  { keys: ['مسافة'], description: 'قلب البطاقة', section: 'المفردات' },
  { keys: ['?'], description: 'عرض اختصارات لوحة المفاتيح', section: 'عام' },
  { keys: ['1-9'], description: 'الانتقال بين الأقسام', section: 'عام' },
  { keys: ['Esc'], description: 'إغلاق النوافذ', section: 'عام' },
]
