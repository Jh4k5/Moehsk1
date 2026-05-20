export interface KeySentence {
  zh: string
  pinyin: string
  arabic: string
  audioAvailable: boolean
}

export interface ConversationTurn {
  speaker: 'A' | 'B' | 'C'
  name: string
  zh: string
  pinyin: string
  arabic: string
}

export interface Conversation {
  id: string
  title: string
  scene: string
  turns: ConversationTurn[]
}

export interface Exercise {
  type: 'multiple_choice' | 'fill_blank' | 'translate' | 'tone'
  q: string
  options?: string[]
  correct?: number
  answer?: string
}

export interface Lesson {
  id: number
  title: string
  titleZh: string
  level: string
  vocabularyIds: number[]
  grammarIds: number[]
  keySentences: KeySentence[]
  conversations: Conversation[]
  exercises: Exercise[]
}

export const lessons: Lesson[] = [
  // ============================================================
  // LESSON 1: التحيات والتعارف — 问候与认识
  // ============================================================
  {
    id: 1,
    title: 'آي شياو يو، مرحباً!',
    titleZh: '艾小语，你好！',
    level: 'مبتدئ',
    vocabularyIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26, 27, 28, 29, 30, 31, 37, 39],
    grammarIds: [1, 2, 5, 7, 11, 15, 24],
    keySentences: [
      { zh: '你好！', pinyin: 'Nǐ hǎo!', arabic: 'مرحباً!', audioAvailable: true },
      { zh: '你好吗？', pinyin: 'Nǐ hǎo ma?', arabic: 'كيف حالك؟', audioAvailable: true },
      { zh: '我很好，谢谢。', pinyin: 'Wǒ hěn hǎo, xièxie.', arabic: 'أنا بخير، شكراً.', audioAvailable: true },
      { zh: '请问，你叫什么名字？', pinyin: 'Qǐngwèn, nǐ jiào shénme míngzi?', arabic: 'عفواً، ما اسمك؟', audioAvailable: true },
      { zh: '我叫阿里。', pinyin: 'Wǒ jiào Ālǐ.', arabic: 'اسمي علي.', audioAvailable: true },
      { zh: '认识你很高兴。', pinyin: 'Rènshi nǐ hěn gāoxìng.', arabic: 'سعيد بمعرفتك.', audioAvailable: true },
      { zh: '我是中国人。', pinyin: 'Wǒ shì Zhōngguó rén.', arabic: 'أنا صيني.', audioAvailable: true },
      { zh: '再见！', pinyin: 'Zàijiàn!', arabic: 'مع السلامة!', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L1C1',
        title: 'التعارف لأول مرة',
        scene: '🏫 في فصل دراسي جديد — يوم الافتتاح',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '你好！我是新同学。', pinyin: 'Nǐ hǎo! Wǒ shì xīn tóngxué.', arabic: 'مرحباً! أنا طالبة جديدة.' },
          { speaker: 'B', name: 'أحمد', zh: '你好！请问你叫什么名字？', pinyin: 'Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?', arabic: 'مرحباً! ما اسمك من فضلك؟' },
          { speaker: 'A', name: 'ليلى', zh: '我叫李丽。你呢？', pinyin: 'Wǒ jiào Lǐ Lì. Nǐ ne?', arabic: 'اسمي لي لي. وأنت؟' },
          { speaker: 'B', name: 'أحمد', zh: '我叫阿里。认识你很高兴。', pinyin: 'Wǒ jiào Ālǐ. Rènshi nǐ hěn gāoxìng.', arabic: 'اسمي علي. سعيد بمعرفتك.' },
          { speaker: 'A', name: 'ليلى', zh: '我也是。你是哪国人？', pinyin: 'Wǒ yě shì. Nǐ shì nǎ guó rén?', arabic: 'أنا أيضاً. من أي بلد أنت؟' },
          { speaker: 'B', name: 'أحمد', zh: '我是中国人。她也是中国人。', pinyin: 'Wǒ shì Zhōngguó rén. Tā yě shì Zhōngguó rén.', arabic: 'أنا صيني. وهي أيضاً صينية.' },
        ],
      },
      {
        id: 'L1C2',
        title: 'في مكتب المعلم',
        scene: '🏢 في مكتب المعلمة — استشارة أكاديمية',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '王老师，您好！', pinyin: 'Wáng lǎoshī, nín hǎo!', arabic: 'مرحباً أستاذة وانغ!' },
          { speaker: 'B', name: '王老师', zh: '你好！你叫什么名字？', pinyin: 'Nǐ hǎo! Nǐ jiào shénme míngzi?', arabic: 'مرحباً! ما اسمك؟' },
          { speaker: 'A', name: 'سارة', zh: '老师，我叫王芳。', pinyin: 'Lǎoshī, wǒ jiào Wáng Fāng.', arabic: 'أستاذة، اسمي وانغ فانغ.' },
          { speaker: 'B', name: '王老师', zh: '王芳，你是学生吗？', pinyin: 'Wáng Fāng, nǐ shì xuésheng ma?', arabic: 'وانغ فانغ، هل أنت طالبة؟' },
          { speaker: 'A', name: 'سارة', zh: '对，我是学生。谢谢老师！', pinyin: 'Duì, wǒ shì xuésheng. Xièxie lǎoshī!', arabic: 'نعم، أنا طالبة. شكراً أستاذة!' },
          { speaker: 'B', name: '王老师', zh: '不客气。再见！', pinyin: 'Bú kèqi. Zàijiàn!', arabic: 'العفو. مع السلامة!' },
        ],
      },
      {
        id: 'L1C3',
        title: 'مكالمة هاتفية',
        scene: '📱 مكالمة هاتفية بين صديقين',
        turns: [
          { speaker: 'A', name: 'علي', zh: '喂？你好！', pinyin: 'Wèi? Nǐ hǎo!', arabic: 'ألو؟ مرحباً!' },
          { speaker: 'B', name: 'حسن', zh: '你好，阿里！你好吗？', pinyin: 'Nǐ hǎo, Ālǐ! Nǐ hǎo ma?', arabic: 'مرحباً علي! كيف حالك؟' },
          { speaker: 'A', name: 'علي', zh: '我很好，谢谢。你呢？', pinyin: 'Wǒ hěn hǎo, xièxie. Nǐ ne?', arabic: 'أنا بخير، شكراً. وأنت؟' },
          { speaker: 'B', name: 'حسن', zh: '我也很好。太好了！', pinyin: 'Wǒ yě hěn hǎo. Tài hǎo le!', arabic: 'أنا أيضاً بخير. رائع!' },
          { speaker: 'A', name: 'علي', zh: '谢谢！再见！', pinyin: 'Xièxie! Zàijiàn!', arabic: 'شكراً! مع السلامة!' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '你好吗？ — 你很____。',
        options: ['好', '吃', '去', '叫'],
        correct: 0,
      },
      {
        type: 'multiple_choice',
        q: '"我叫..." تعني:',
        options: ['أنا آكل', 'اسمي', 'أنا أذهب', 'أنا أعرف'],
        correct: 1,
      },
      {
        type: 'fill_blank',
        q: '____，你叫什么名字？',
        answer: '请问',
      },
      {
        type: 'fill_blank',
        q: '认识你很____。',
        answer: '高兴',
      },
      {
        type: 'translate',
        q: 'ترجم: 我是学生。',
        answer: 'أنا طالب.',
      },
      {
        type: 'tone',
        q: 'ما نبرة صوت كلمة "好" (hǎo)؟',
        options: ['النبرة الأولى ـ', 'النبرة الثانية ↗', 'النبرة الثالثة ↘↗', 'النبرة الرابعة ↘'],
        correct: 2,
      },
    ],
  },

  // ============================================================
  // LESSON 2: الأرقام والأعداد — 数字与数量
  // ============================================================
  {
    id: 2,
    title: 'اسمي لي ون',
    titleZh: '我叫李文',
    level: 'مبتدئ',
    vocabularyIds: [52, 53, 58, 59, 74, 75, 77, 80, 96, 109, 140, 154, 155, 156, 185, 188, 195, 204, 217, 234, 249, 261, 262, 263, 266, 267, 287],
    grammarIds: [3, 10, 19, 26],
    keySentences: [
      { zh: '一，二，三，四，五。', pinyin: 'Yī, èr, sān, sì, wǔ.', arabic: 'واحد، اثنان، ثلاثة، أربعة، خمسة.', audioAvailable: true },
      { zh: '我有三个朋友。', pinyin: 'Wǒ yǒu sān gè péngyou.', arabic: 'لدي ثلاثة أصدقاء.', audioAvailable: true },
      { zh: '他有一本书。', pinyin: 'Tā yǒu yī běn shū.', arabic: 'لديه كتاب واحد.', audioAvailable: true },
      { zh: '请问，这多少钱？', pinyin: 'Qǐngwèn, zhè duōshao qián?', arabic: 'عفواً، كم سعر هذا؟', audioAvailable: true },
      { zh: '这只猫很好。', pinyin: 'Zhè zhī māo hěn hǎo.', arabic: 'هذه القطة جميلة.', audioAvailable: true },
      { zh: '我喝两杯茶。', pinyin: 'Wǒ hē liǎng bēi chá.', arabic: 'أشرب كوبين من الشاي.', audioAvailable: true },
      { zh: '你没有时间吗？', pinyin: 'Nǐ méiyǒu shíjiān ma?', arabic: 'أليس لديك وقت؟', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L2C1',
        title: 'في المطعم',
        scene: '🍜 في مطعم صيني — طلب الطعام',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '请问，这多少钱？', pinyin: 'Qǐngwèn, zhè duōshao qián?', arabic: 'عفواً، كم سعر هذا؟' },
          { speaker: 'B', name: 'النادل', zh: '十五块。', pinyin: 'Shíwǔ kuài.', arabic: 'خمسة عشر يوان.' },
          { speaker: 'A', name: 'أحمد', zh: '我要两杯茶。', pinyin: 'Wǒ yào liǎng bēi chá.', arabic: 'أريد كوبين من الشاي.' },
          { speaker: 'B', name: 'النادل', zh: '好的，一共二十块。', pinyin: 'Hǎo de, yígòng èrshí kuài.', arabic: 'حسناً، المجموع عشرون يوان.' },
          { speaker: 'A', name: 'أحمد', zh: '给你。', pinyin: 'Gěi nǐ.', arabic: 'تفضل.' },
          { speaker: 'B', name: 'النادل', zh: '谢谢！', pinyin: 'Xièxie!', arabic: 'شكراً!' },
        ],
      },
      {
        id: 'L2C2',
        title: 'عدد الأشياء',
        scene: '🏠 في غرفة المعيشة — حديث عائلي',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '你有几本书？', pinyin: 'Nǐ yǒu jǐ běn shū?', arabic: 'كم عدد كتبك؟' },
          { speaker: 'B', name: 'عمر', zh: '我有五本书。你呢？', pinyin: 'Wǒ yǒu wǔ běn shū. Nǐ ne?', arabic: 'لدي خمسة كتب. وأنت؟' },
          { speaker: 'A', name: 'سارة', zh: '我有很多书。', pinyin: 'Wǒ yǒu hěn duō shū.', arabic: 'لدي كثير من الكتب.' },
          { speaker: 'B', name: 'عمر', zh: '你还有猫吗？', pinyin: 'Nǐ hái yǒu māo ma?', arabic: 'هل لديك قطة أيضاً؟' },
          { speaker: 'A', name: 'سارة', zh: '是的，我有一只猫。', pinyin: 'Shì de, wǒ yǒu yī zhī māo.', arabic: 'نعم، لدي قطة واحدة.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '三本书 — "本" هي:',
        options: ['اسم', 'عداد', 'فعل', 'صفة'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '两 =',
        options: ['一', '二', '两', '三'],
        correct: 2,
      },
      {
        type: 'fill_blank',
        q: '请问，这____钱？',
        answer: '多少',
      },
      {
        type: 'fill_blank',
        q: '我喝一杯____。',
        answer: '茶',
      },
      {
        type: 'translate',
        q: 'ترجم: 他有一只猫。',
        answer: 'لديه قطة واحدة.',
      },
    ],
  },

  // ============================================================
  // LESSON 3: الوقت والتاريخ — 时间与日期
  // ============================================================
  {
    id: 3,
    title: 'أنا صيني',
    titleZh: '我是中国人',
    level: 'مبتدئ',
    vocabularyIds: [69, 72, 76, 98, 116, 133, 139, 163, 177, 194, 222, 231, 241, 244, 247, 252, 253, 254, 275, 276, 278, 279, 280, 293, 302, 329],
    grammarIds: [4, 8, 17, 18],
    keySentences: [
      { zh: '现在几点？', pinyin: 'Xiànzài jǐ diǎn?', arabic: 'كم الساعة الآن؟', audioAvailable: true },
      { zh: '现在八点半。', pinyin: 'Xiànzài bā diǎn bàn.', arabic: 'الآن الثامنة والنصف.', audioAvailable: true },
      { zh: '今天是星期几？', pinyin: 'Jīntiān shì xīngqī jǐ?', arabic: 'ما هو اليوم اليوم؟', audioAvailable: true },
      { zh: '今天是星期一。', pinyin: 'Jīntiān shì xīngqī yī.', arabic: 'اليوم هو الاثنين.', audioAvailable: true },
      { zh: '你几点起床？', pinyin: 'Nǐ jǐ diǎn qǐchuáng?', arabic: 'في أي ساعة تستيقظ؟', audioAvailable: true },
      { zh: '我七点上课。', pinyin: 'Wǒ qī diǎn shàngkè.', arabic: 'أبدأ الدرس الساعة السابعة.', audioAvailable: true },
      { zh: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', arabic: 'الطقس اليوم جيد.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L3C1',
        title: 'مواعيد اليوم',
        scene: '⏰ في الممر — صباح يوم دراسي',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '早上好！现在几点？', pinyin: 'Zǎoshang hǎo! Xiànzài jǐ diǎn?', arabic: 'صباح الخير! كم الساعة الآن؟' },
          { speaker: 'B', name: 'أحمد', zh: '七点半。你几点上课？', pinyin: 'Qī diǎn bàn. Nǐ jǐ diǎn shàngkè?', arabic: 'السابعة والنصف. في أي ساعة يبدأ درسك؟' },
          { speaker: 'A', name: 'ليلى', zh: '八点上课。还有半个小时。', pinyin: 'Bā diǎn shàngkè. Hái yǒu bàn gè xiǎoshí.', arabic: 'الدرس يبدأ الثامنة. متبقي نصف ساعة.' },
          { speaker: 'B', name: 'أحمد', zh: '好的，我们一起走吧。', pinyin: 'Hǎo de, wǒmen yīqǐ zǒu ba.', arabic: 'حسناً، هيا نذهب معاً.' },
        ],
      },
      {
        id: 'L3C2',
        title: 'خطط نهاية الأسبوع',
        scene: '📚 في المكتبة — الخميس',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '今天是星期四，明天是星期五。', pinyin: 'Jīntiān shì xīngqīsì, míngtiān shì xīngqīwǔ.', arabic: 'اليوم هو الخميس، وغداً الجمعة.' },
          { speaker: 'B', name: 'عمر', zh: '对！你星期六做什么？', pinyin: 'Duì! Nǐ xīngqīliù zuò shénme?', arabic: 'صحيح! ماذا ستفعل يوم السبت؟' },
          { speaker: 'A', name: 'سارة', zh: '我想去图书馆看书。', pinyin: 'Wǒ xiǎng qù túshūguǎn kàn shū.', arabic: 'أريد الذهاب إلى المكتبة لقراءة كتاب.' },
          { speaker: 'B', name: 'عمر', zh: '我明天没有课。', pinyin: 'Wǒ míngtiān méiyǒu kè.', arabic: 'ليس لدي درس غداً.' },
          { speaker: 'A', name: 'سارة', zh: '太好了！你和我一起去吧。', pinyin: 'Tài hǎo le! Nǐ hé wǒ yīqǐ qù ba.', arabic: 'رائع! هيا نذهب معاً.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"八点半" تعني:',
        options: ['8:00', '8:30', '8:15', '9:00'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '今天是星期一，明天是:',
        options: ['星期六', '星期天', '星期二', '星期一'],
        correct: 2,
      },
      {
        type: 'fill_blank',
        q: '现在____？ — 八点。',
        answer: '几点',
      },
      {
        type: 'fill_blank',
        q: '今天____很好。',
        answer: '天气',
      },
      {
        type: 'translate',
        q: 'ترجم: 我七点起床。',
        answer: 'أنا أستيقظ الساعة السابعة.',
      },
      {
        type: 'tone',
        q: 'ما نبرة كلمة "点" (diǎn)؟',
        options: ['النبرة الأولى ـ', 'النبرة الثانية ↗', 'النبرة الثالثة ↘↗', 'النبرة الرابعة ↘'],
        correct: 2,
      },
    ],
  },

  // ============================================================
  // LESSON 4: العائلة والعلاقات — 家庭与关系
  // ============================================================
  {
    id: 4,
    title: 'لدي طفلان',
    titleZh: '我有两个孩子',
    level: 'مبتدئ',
    vocabularyIds: [36, 42, 49, 54, 57, 60, 61, 62, 63, 64, 65, 66, 67, 70, 71, 104, 137, 170, 171, 179, 181, 218, 220, 242],
    grammarIds: [2, 3, 6, 11, 20],
    keySentences: [
      { zh: '这是我爸爸。', pinyin: 'Zhè shì wǒ bàba.', arabic: 'هذا أبي.', audioAvailable: true },
      { zh: '她是我妈妈。', pinyin: 'Tā shì wǒ māma.', arabic: 'هذه أمي.', audioAvailable: true },
      { zh: '我有一个哥哥和一个姐姐。', pinyin: 'Wǒ yǒu yī gè gēge hé yī gè jiějie.', arabic: 'لدي أخ أكبر وأخت أكبر.', audioAvailable: true },
      { zh: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyou.', arabic: 'هو صديقي.', audioAvailable: true },
      { zh: '我们是一家人。', pinyin: 'Wǒmen shì yī jiā rén.', arabic: 'نحن عائلة واحدة.', audioAvailable: true },
      { zh: '你有兄弟姐妹吗？', pinyin: 'Nǐ yǒu xiōngdìjiěmèi ma?', arabic: 'هل لديك إخوة وأخوات؟', audioAvailable: true },
      { zh: '她不是我女朋友。', pinyin: 'Tā bú shì wǒ de nǚpéngyou.', arabic: 'هي ليست صديقتي.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L4C1',
        title: 'تقديم العائلة',
        scene: '🏠 في منزل ليلى — زيارة من صديق',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '你好！这是你家吗？', pinyin: 'Nǐ hǎo! Zhè shì nǐ jiā ma?', arabic: 'مرحباً! هل هذا منزلك؟' },
          { speaker: 'B', name: 'ليلى', zh: '是的，请进！这是我妈妈。', pinyin: 'Shì de, qǐng jìn! Zhè shì wǒ māma.', arabic: 'نعم، تفضل! هذه أمي.' },
          { speaker: 'A', name: 'أحمد', zh: '阿姨好！', pinyin: 'Āyí hǎo!', arabic: 'مرحباً خالة!' },
          { speaker: 'C', name: 'أم ليلى', zh: '你好！请坐。', pinyin: 'Nǐ hǎo! Qǐng zuò.', arabic: 'مرحباً! تفضل بالجلوس.' },
          { speaker: 'A', name: 'أحمد', zh: '谢谢！你有兄弟姐妹吗？', pinyin: 'Xièxie! Nǐ yǒu xiōngdìjiěmèi ma?', arabic: 'شكراً! هل لديك إخوة وأخوات؟' },
          { speaker: 'B', name: 'ليلى', zh: '我有一个弟弟。他不在家。', pinyin: 'Wǒ yǒu yī gè dìdi. Tā bú zài jiā.', arabic: 'لدي أخ أصغر. هو ليس في المنزل.' },
        ],
      },
      {
        id: 'L4C2',
        title: 'الحديث عن العائلة',
        scene: '🏫 في ساحة المدرسة — وقت الراحة',
        turns: [
          { speaker: 'A', name: 'عمر', zh: '你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', arabic: 'كم عدد أفراد عائلتك؟' },
          { speaker: 'B', name: 'سارة', zh: '我家有五口人。爸爸、妈妈、哥哥和我。', pinyin: 'Wǒ jiā yǒu wǔ kǒu rén. Bàba, māma, gēge hé wǒ.', arabic: 'عائلتي من خمسة أشخاص. أبي وأمي وأخي الأكبر وأنا.' },
          { speaker: 'A', name: 'عمر', zh: '你哥哥做什么工作？', pinyin: 'Nǐ gēge zuò shénme gōngzuò?', arabic: 'ما هو عمل أخيك الأكبر؟' },
          { speaker: 'B', name: 'سارة', zh: '他是老师。', pinyin: 'Tā shì lǎoshī.', arabic: 'هو معلم.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"爸爸" تعني:',
        options: ['أم', 'أب', 'أخ', 'أخت'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '她是我姐姐。 — "姐姐" تعني:',
        options: ['الأخت الصغرى', 'الأخت الكبرى', 'الجدة', 'العمّة'],
        correct: 1,
      },
      {
        type: 'fill_blank',
        q: '这是____朋友。',
        answer: '我的',
      },
      {
        type: 'fill_blank',
        q: '你____兄弟姐妹吗？',
        answer: '有',
      },
      {
        type: 'translate',
        q: 'ترجم: 我们是一家人。',
        answer: 'نحن عائلة واحدة.',
      },
      {
        type: 'translate',
        q: 'ترجم إلى الصينية: لدي أخ أصغر.',
        answer: '我有一个弟弟。',
      },
    ],
  },

  // ============================================================
  // LESSON 5: الطعام والشراب — 饮食
  // ============================================================
  {
    id: 5,
    title: 'أنا أرتاح اليوم',
    titleZh: '今天我休息',
    level: 'مبتدئ',
    vocabularyIds: [78, 79, 84, 85, 89, 105, 110, 111, 122, 126, 136, 138, 159, 160, 161, 178, 184, 212, 213, 230, 235, 190, 260, 118],
    grammarIds: [1, 4, 10, 14, 23],
    keySentences: [
      { zh: '你吃什么？', pinyin: 'Nǐ chī shénme?', arabic: 'ماذا تأكل؟', audioAvailable: true },
      { zh: '我想喝水。', pinyin: 'Wǒ xiǎng hē shuǐ.', arabic: 'أريد شرب الماء.', audioAvailable: true },
      { zh: '请给我一杯茶。', pinyin: 'Qǐng gěi wǒ yī bēi chá.', arabic: 'من فضلك أعطني كوب شاي.', audioAvailable: true },
      { zh: '这个菜很好吃。', pinyin: 'Zhège cài hěn hǎochī.', arabic: 'هذا الطبق لذيذ جداً.', audioAvailable: true },
      { zh: '我要一碗米饭。', pinyin: 'Wǒ yào yī wǎn mǐfàn.', arabic: 'أريد طبقاً من الأرز.', audioAvailable: true },
      { zh: '你喜欢喝茶还是咖啡？', pinyin: 'Nǐ xǐhuān hē chá háishì kāfēi?', arabic: 'هل تحب الشاي أم القهوة؟', audioAvailable: true },
      { zh: '晚饭你吃什么？', pinyin: 'Wǎnfàn nǐ chī shénme?', arabic: 'ماذا ستأكل في العشاء؟', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L5C1',
        title: 'في مطعم صيني',
        scene: '🍜 في مطعم — وقت الغداء',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '你好！请问，你们有什么？', pinyin: 'Nǐ hǎo! Qǐngwèn, nǐmen yǒu shénme?', arabic: 'مرحباً! عفواً، ماذا لديكم؟' },
          { speaker: 'B', name: 'النادل', zh: '我们有米饭、面条和菜。', pinyin: 'Wǒmen yǒu mǐfàn, miàntiáo hé cài.', arabic: 'لدينا أرز ومعكرونة وأطباق.' },
          { speaker: 'A', name: 'أحمد', zh: '我要一碗米饭和一个菜。', pinyin: 'Wǒ yào yī wǎn mǐfàn hé yī gè cài.', arabic: 'أريد طبق أرز وطبقاً واحداً.' },
          { speaker: 'B', name: 'النادل', zh: '你要喝水还是茶？', pinyin: 'Nǐ yào hē shuǐ háishì chá?', arabic: 'هل تريد ماء أم شاي؟' },
          { speaker: 'A', name: 'أحمد', zh: '请给我一杯水。', pinyin: 'Qǐng gěi wǒ yī bēi shuǐ.', arabic: 'من فضلك أعطني كوب ماء.' },
          { speaker: 'B', name: 'النادل', zh: '好的，请等一下。', pinyin: 'Hǎo de, qǐng děng yīxià.', arabic: 'حسناً، انتظر قليلاً.' },
        ],
      },
      {
        id: 'L5C2',
        title: 'دعوة للعشاء',
        scene: '📱 مكالمة هاتفية — دعوة عشاء',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '喂！你吃晚饭了吗？', pinyin: 'Wèi! Nǐ chī wǎnfàn le ma?', arabic: 'ألو! هل أكلت العشاء؟' },
          { speaker: 'B', name: 'سارة', zh: '还没有。你呢？', pinyin: 'Hái méiyǒu. Nǐ ne?', arabic: 'بعد لا. وأنتِ؟' },
          { speaker: 'A', name: 'ليلى', zh: '我也没有。我们一起去吃饭吧。', pinyin: 'Wǒ yě méiyǒu. Wǒmen yīqǐ qù chīfàn ba.', arabic: 'أنا أيضاً لم آكل. هيا نذهب لتناول الطعام معاً.' },
          { speaker: 'B', name: 'سارة', zh: '好！太好了！吃什么？', pinyin: 'Hǎo! Tài hǎo le! Chī shénme?', arabic: 'حسناً! رائع! ماذا نأكل؟' },
          { speaker: 'A', name: 'ليلى', zh: '吃面条怎么样？', pinyin: 'Chī miàntiáo zěnmeyàng?', arabic: 'ما رأيك أن نأكل معكرونة؟' },
          { speaker: 'B', name: 'سارة', zh: '我喜欢面条！走吧！', pinyin: 'Wǒ xǐhuān miàntiáo! Zǒu ba!', arabic: 'أنا أحب المعكرونة! هيا بنا!' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"一碗米饭" — "碗" هي:',
        options: ['عداد للأطباق', 'عداد للأكواب', 'عداد للكتب', 'عداد للملابس'],
        correct: 0,
      },
      {
        type: 'multiple_choice',
        q: '你喜欢____茶？',
        options: ['吃', '喝', '去', '看'],
        correct: 1,
      },
      {
        type: 'fill_blank',
        q: '请给我一杯____。',
        answer: '水',
      },
      {
        type: 'fill_blank',
        q: '这个菜很____。',
        answer: '好吃',
      },
      {
        type: 'translate',
        q: 'ترجم: 我想喝水。',
        answer: 'أريد شرب الماء.',
      },
    ],
  },

  // ============================================================
  // LESSON 6: التسوق والمال — 购物与金钱
  // ============================================================
  {
    id: 6,
    title: 'ما رقم هاتفك؟',
    titleZh: '你的手机号是多少？',
    level: 'مبتدئ',
    vocabularyIds: [87, 121, 135, 149, 157, 158, 182, 187, 198, 264, 274, 322, 323, 97, 251, 339, 354, 202, 148, 56, 83, 240, 180],
    grammarIds: [3, 14, 19, 23],
    keySentences: [
      { zh: '这件衣服多少钱？', pinyin: 'Zhè jiàn yīfu duōshao qián?', arabic: 'كم سعر هذه الملابس؟', audioAvailable: true },
      { zh: '太贵了！', pinyin: 'Tài guì le!', arabic: 'غالٍ جداً!', audioAvailable: true },
      { zh: '可以便宜一点吗？', pinyin: 'Kěyǐ piányi yīdiǎn ma?', arabic: 'هل يمكن أن يكون أرخص قليلاً؟', audioAvailable: true },
      { zh: '一共多少钱？', pinyin: 'Yígòng duōshao qián?', arabic: 'كم المبلغ الإجمالي؟', audioAvailable: true },
      { zh: '我不要这个，我要那个。', pinyin: 'Wǒ bú yào zhège, wǒ yào nàge.', arabic: 'لا أريد هذا، أريد ذلك.', audioAvailable: true },
      { zh: '这件新的还是旧的？', pinyin: 'Zhè jiàn xīn de háishì jiù de?', arabic: 'هذا الجديد أم القديم؟', audioAvailable: true },
      { zh: '我没有钱了。', pinyin: 'Wǒ méiyǒu qián le.', arabic: 'لم يعد لدي مال.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L6C1',
        title: 'شراء ملابس',
        scene: '🛍️ في متجر ملابس — تسوق',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '你好，这件衣服多少钱？', pinyin: 'Nǐ hǎo, zhè jiàn yīfu duōshao qián?', arabic: 'مرحباً، كم سعر هذه الملابس؟' },
          { speaker: 'B', name: 'البائع', zh: '两百块。', pinyin: 'Liǎng bǎi kuài.', arabic: 'مائتا يوان.' },
          { speaker: 'A', name: 'ليلى', zh: '太贵了！可以便宜一点吗？', pinyin: 'Tài guì le! Kěyǐ piányi yīdiǎn ma?', arabic: 'غالٍ جداً! هل يمكن أن يكون أرخص قليلاً؟' },
          { speaker: 'B', name: 'البائع', zh: '一百五十块，怎么样？', pinyin: 'Yī bǎi wǔshí kuài, zěnmeyàng?', arabic: 'مائة وخمسون يوان، ما رأيك؟' },
          { speaker: 'A', name: 'ليلى', zh: '好的，我要了。', pinyin: 'Hǎo de, wǒ yào le.', arabic: 'حسناً، سآخذها.' },
        ],
      },
      {
        id: 'L6C2',
        title: 'في السوق',
        scene: '🏪 في سوق شعبي — شراء هدايا',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '先生，这个多少钱？', pinyin: 'Xiānsheng, zhège duōshao qián?', arabic: 'سيد، كم سعر هذا؟' },
          { speaker: 'B', name: 'البائع', zh: '五十块。质量很好。', pinyin: 'Wǔshí kuài. Zhìliàng hěn hǎo.', arabic: 'خمسون يوان. الجودة جيدة جداً.' },
          { speaker: 'A', name: 'أحمد', zh: '有新的吗？', pinyin: 'Yǒu xīn de ma?', arabic: 'هل يوجد جديد؟' },
          { speaker: 'B', name: 'البائع', zh: '有，这是新的。', pinyin: 'Yǒu, zhè shì xīn de.', arabic: 'نعم، هذا جديد.' },
          { speaker: 'A', name: 'أحمد', zh: '好的，我要两个。一共多少钱？', pinyin: 'Hǎo de, wǒ yào liǎng gè. Yígòng duōshao qián?', arabic: 'حسناً، أريد اثنين. كم المجموع؟' },
          { speaker: 'B', name: 'البائع', zh: '一百块。', pinyin: 'Yī bǎi kuài.', arabic: 'مائة يوان.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"太贵了" تعني:',
        options: ['رخيص جداً', 'غالٍ جداً', 'جيد جداً', 'قليل جداً'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '你____买东西？',
        options: ['去', '要', '想', '可以'],
        correct: 1,
      },
      {
        type: 'fill_blank',
        q: '这件衣服____多少钱？',
        answer: '一共',
      },
      {
        type: 'fill_blank',
        q: '我____这个，我要那个。',
        answer: '不要',
      },
      {
        type: 'translate',
        q: 'ترجم: 可以便宜一点吗？',
        answer: 'هل يمكن أن يكون أرخص قليلاً؟',
      },
    ],
  },

  // ============================================================
  // LESSON 7: الأماكن والاتجاهات — 地点与方向
  // ============================================================
  {
    id: 7,
    title: 'أريد...',
    titleZh: '我想要...',
    level: 'مبتدئ',
    vocabularyIds: [34, 81, 103, 119, 127, 153, 164, 165, 166, 167, 168, 169, 172, 173, 174, 175, 186, 196, 210, 226, 227, 236, 268, 277, 284, 285, 286, 289, 290, 335, 336, 337],
    grammarIds: [9, 13, 20, 22],
    keySentences: [
      { zh: '请问，图书馆在哪儿？', pinyin: 'Qǐngwèn, túshūguǎn zài nǎr?', arabic: 'عفواً، أين المكتبة؟', audioAvailable: true },
      { zh: '学校在那边。', pinyin: 'Xuéxiào zài nàbiān.', arabic: 'المدرسة هناك.', audioAvailable: true },
      { zh: '这里是我的家。', pinyin: 'Zhèlǐ shì wǒ de jiā.', arabic: 'هنا منزلي.', audioAvailable: true },
      { zh: '银行在商店旁边。', pinyin: 'Yínháng zài shāngdiàn pángbiān.', arabic: 'البنك بجانب المتجر.', audioAvailable: true },
      { zh: '往前走，在左边。', pinyin: 'Wǎng qián zǒu, zài zuǒbiān.', arabic: 'امشِ للأمام، على اليسار.', audioAvailable: true },
      { zh: '书店在对面。', pinyin: 'Shūdiàn zài duìmiàn.', arabic: 'المكتبة أمامك.', audioAvailable: true },
      { zh: '那个地方很远。', pinyin: 'Nàge dìfang hěn yuǎn.', arabic: 'ذلك المكان بعيد جداً.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L7C1',
        title: 'سؤال عن الطريق',
        scene: '🗺️ في الشارع — سائح يبحث عن مكان',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '请问，公司在哪儿？', pinyin: 'Qǐngwèn, gōngsī zài nǎr?', arabic: 'عفواً، أين الشركة؟' },
          { speaker: 'B', name: 'المارة', zh: '往前走，在右边。', pinyin: 'Wǎng qián zǒu, zài yòubiān.', arabic: 'امشِ للأمام، على اليمين.' },
          { speaker: 'A', name: 'أحمد', zh: '远不远？', pinyin: 'Yuǎn bù yuǎn?', arabic: 'هل هو بعيد؟' },
          { speaker: 'B', name: 'المارة', zh: '不远，走五分钟。', pinyin: 'Bù yuǎn, zǒu wǔ fēnzhōng.', arabic: 'ليس بعيداً، خمس دقائق مشياً.' },
          { speaker: 'A', name: 'أحمد', zh: '谢谢！', pinyin: 'Xièxie!', arabic: 'شكراً!' },
          { speaker: 'B', name: 'المارة', zh: '不客气！', pinyin: 'Bú kèqi!', arabic: 'العفو!' },
        ],
      },
      {
        id: 'L7C2',
        title: 'وصف المكان',
        scene: '🏫 أمام المدرسة — اجتماع صديقين',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '你住在哪儿？', pinyin: 'Nǐ zhù zài nǎr?', arabic: 'أين تسكنين؟' },
          { speaker: 'B', name: 'ليلى', zh: '我住在学校附近。', pinyin: 'Wǒ zhù zài xuéxiào fùjìn.', arabic: 'أسكن بالقرب من المدرسة.' },
          { speaker: 'A', name: 'سارة', zh: '学校旁边有超市吗？', pinyin: 'Xuéxiào pángbiān yǒu chāoshì ma?', arabic: 'هل يوجد سوبرماركت بجانب المدرسة؟' },
          { speaker: 'B', name: 'ليلى', zh: '有，在学校对面。', pinyin: 'Yǒu, zài xuéxiào duìmiàn.', arabic: 'نعم، أمام المدرسة.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"在哪儿" تعني:',
        options: ['ماذا', 'من أين', 'أين', 'متى'],
        correct: 2,
      },
      {
        type: 'multiple_choice',
        q: '学校在左边 — "左边" تعني:',
        options: ['اليمين', 'الأمام', 'الخلف', 'اليسار'],
        correct: 3,
      },
      {
        type: 'fill_blank',
        q: '请问，图书馆____哪儿？',
        answer: '在',
      },
      {
        type: 'fill_blank',
        q: '银行在商店____。',
        answer: '旁边',
      },
      {
        type: 'translate',
        q: 'ترجم: 往前走。',
        answer: 'امشِ للأمام.',
      },
      {
        type: 'translate',
        q: 'ترجم إلى الصينية: المكتبة في اليسار.',
        answer: '图书馆在左边。',
      },
    ],
  },

  // ============================================================
  // LESSON 8: المواصلات والسفر — 交通与旅行
  // ============================================================
  {
    id: 8,
    title: 'أنهي العمل الساعة 6:30 مساءً',
    titleZh: '我晚上六点半下班',
    level: 'مبتدئ',
    vocabularyIds: [88, 91, 93, 114, 130, 143, 325, 326, 327, 328, 191, 150, 299, 348, 350, 370, 344, 345, 342, 343, 399, 129, 134, 352],
    grammarIds: [12, 13, 14, 18],
    keySentences: [
      { zh: '你坐地铁去学校吗？', pinyin: 'Nǐ zuò dìtiě qù xuéxiào ma?', arabic: 'هل تذهب للمدرسة بالمترو؟', audioAvailable: true },
      { zh: '火车站在那边。', pinyin: 'Huǒchēzhàn zài nàbiān.', arabic: 'محطة القطار هناك.', audioAvailable: true },
      { zh: '我想去北京。', pinyin: 'Wǒ xiǎng qù Běijīng.', arabic: 'أريد الذهاب إلى بكين.', audioAvailable: true },
      { zh: '这个地方很远。', pinyin: 'Zhège dìfang hěn yuǎn.', arabic: 'هذا المكان بعيد جداً.', audioAvailable: true },
      { zh: '你什么时候到？', pinyin: 'Nǐ shénme shíhou dào?', arabic: 'متى ستصل؟', audioAvailable: true },
      { zh: '坐飞机很快。', pinyin: 'Zuò fēijī hěn kuài.', arabic: 'السفر بالطائرة سريع جداً.', audioAvailable: true },
      { zh: '他很慢，我很快。', pinyin: 'Tā hěn màn, wǒ hěn kuài.', arabic: 'هو بطيء، أنا سريع.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L8C1',
        title: 'في محطة القطار',
        scene: '🚉 في محطة القطار — استفسار عن المسار',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '请问，去北京的火车在哪儿？', pinyin: 'Qǐngwèn, qù Běijīng de huǒchē zài nǎr?', arabic: 'عفواً، أين قطار بكين؟' },
          { speaker: 'B', name: 'موظف المحطة', zh: '在三号站台。', pinyin: 'Zài sān hào zhàntái.', arabic: 'في المنصة رقم ثلاثة.' },
          { speaker: 'A', name: 'أحمد', zh: '什么时候到北京？', pinyin: 'Shénme shíhou dào Běijīng?', arabic: 'متى يصل إلى بكين؟' },
          { speaker: 'B', name: 'موظف المحطة', zh: '三个小时以后到。', pinyin: 'Sān gè xiǎoshí yǐhòu dào.', arabic: 'يصل بعد ثلاث ساعات.' },
          { speaker: 'A', name: 'أحمد', zh: '谢谢你！', pinyin: 'Xièxie nǐ!', arabic: 'شكراً لك!' },
        ],
      },
      {
        id: 'L8C2',
        title: 'اختيار وسيلة المواصلات',
        scene: '🚌 في المدينة — حوار عن التنقل',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '你每天怎么去学校？', pinyin: 'Nǐ měitiān zěnme qù xuéxiào?', arabic: 'كيف تذهبين للمدرسة كل يوم؟' },
          { speaker: 'B', name: 'ليلى', zh: '我坐地铁去学校，很快。', pinyin: 'Wǒ zuò dìtiě qù xuéxiào, hěn kuài.', arabic: 'أذهب بالمترو، سريع جداً.' },
          { speaker: 'A', name: 'سارة', zh: '学校远不远？', pinyin: 'Xuéxiào yuǎn bù yuǎn?', arabic: 'هل المدرسة بعيدة؟' },
          { speaker: 'B', name: 'ليلى', zh: '不远，坐地铁十五分钟。', pinyin: 'Bù yuǎn, zuò dìtiě shíwǔ fēnzhōng.', arabic: 'ليست بعيدة، بالمترو خمس عشرة دقيقة.' },
          { speaker: 'A', name: 'سارة', zh: '坐地铁很方便。', pinyin: 'Zuò dìtiě hěn fāngbiàn.', arabic: 'التنقل بالمترو مريح جداً.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"坐火车" تعني:',
        options: ['ركوب الحافلة', 'ركوب القطار', 'ركوب الطائرة', 'ركوب المترو'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '这辆车很____。',
        options: ['远', '快', '慢', '方便'],
        correct: 1,
      },
      {
        type: 'fill_blank',
        q: '我想____北京。',
        answer: '去',
      },
      {
        type: 'fill_blank',
        q: '那个地方很____。',
        answer: '远',
      },
      {
        type: 'translate',
        q: 'ترجم: 火车站在那边。',
        answer: 'محطة القطار هناك.',
      },
    ],
  },

  // ============================================================
  // LESSON 9: الطقس والفصول — 天气与季节
  // ============================================================
  {
    id: 9,
    title: 'أبي يعمل أيضاً في المستشفى',
    titleZh: '我爸爸也在医院工作',
    level: 'مبتدئ',
    vocabularyIds: [152, 193, 237, 257, 273, 305, 306, 307, 308, 309, 310, 324, 272, 271, 361, 358, 385, 362, 398, 356, 357, 363, 371, 373],
    grammarIds: [8, 21, 23],
    keySentences: [
      { zh: '今天天气怎么样？', pinyin: 'Jīntiān tiānqì zěnmeyàng?', arabic: 'كيف الطقس اليوم؟', audioAvailable: true },
      { zh: '今天很热。', pinyin: 'Jīntiān hěn rè.', arabic: 'الطقس اليوم حار جداً.', audioAvailable: true },
      { zh: '外面在下雨。', pinyin: 'Wàimiàn zài xià yǔ.', arabic: 'إنها تمطر في الخارج.', audioAvailable: true },
      { zh: '现在是夏天。', pinyin: 'Xiànzài shì xiàtiān.', arabic: 'الآن هو فصل الصيف.', audioAvailable: true },
      { zh: '春天经常下雨。', pinyin: 'Chūntiān jīngcháng xià yǔ.', arabic: 'إنها تمطر غالباً في الربيع.', audioAvailable: true },
      { zh: '阳光很好。', pinyin: 'Yángguāng hěn hǎo.', arabic: 'ضوء الشمس جيد.', audioAvailable: true },
      { zh: '因为下雨，所以我不去。', pinyin: 'Yīnwèi xià yǔ, suǒyǐ wǒ bú qù.', arabic: 'لأنها تمطر، لذلك لن أذهب.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L9C1',
        title: 'حديث عن الطقس',
        scene: '☀️ في الحديقة — يوم مشمس',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '今天天气怎么样？', pinyin: 'Jīntiān tiānqì zěnmeyàng?', arabic: 'كيف الطقس اليوم؟' },
          { speaker: 'B', name: 'سارة', zh: '今天很好，阳光很不错。', pinyin: 'Jīntiān hěn hǎo, yángguāng hěn búcuò.', arabic: 'اليوم جيد، ضوء الشمس لطيف.' },
          { speaker: 'A', name: 'أحمد', zh: '昨天热不热？', pinyin: 'Zuótiān rè bú rè?', arabic: 'هل كان حاراً أمس؟' },
          { speaker: 'B', name: 'سارة', zh: '昨天太热了！', pinyin: 'Zuótiān tài rè le!', arabic: 'كان حاراً جداً أمس!' },
          { speaker: 'A', name: 'أحمد', zh: '因为太热，所以我昨天没去公园。', pinyin: 'Yīnwèi tài rè, suǒyǐ wǒ zuótiān méi qù gōngyuán.', arabic: 'بسبب الحر الشديد، لم أذهب إلى الحديقة أمس.' },
        ],
      },
      {
        id: 'L9C2',
        title: 'خطط نهاية الأسبوع',
        scene: '🌧️ في المنزل — يوم ممطر',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '外面在下雨，你不能出去了。', pinyin: 'Wàimiàn zài xià yǔ, nǐ bù néng chūqù le.', arabic: 'إنها تمطر في الخارج، لا يمكنك الخروج.' },
          { speaker: 'B', name: 'عمر', zh: '但是周末我想出去玩。', pinyin: 'Dànshì zhōumò wǒ xiǎng chūqù wán.', arabic: 'لكنني أريد الخروج للنزهة في عطلة نهاية الأسبوع.' },
          { speaker: 'A', name: 'ليلى', zh: '可能明天天气好。', pinyin: 'Kěnéng míngtiān tiānqì hǎo.', arabic: 'ربما يكون الطقس جيداً غداً.' },
          { speaker: 'B', name: 'عمر', zh: '如果明天不下雨，我们一起去。', pinyin: 'Rúguǒ míngtiān bù xià yǔ, wǒmen yīqǐ qù.', arabic: 'إذا لم تمطر غداً، نذهب معاً.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"今天很热" تعني:',
        options: ['اليوم بارد', 'اليوم حار', 'اليوم ممطر', 'اليوم مشمس'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '春天是第几个季节？',
        options: ['第一个', '第二个', '第三个', '第四个'],
        correct: 0,
      },
      {
        type: 'fill_blank',
        q: '外面在____雨。',
        answer: '下',
      },
      {
        type: 'fill_blank',
        q: '____下雨，所以我不去。',
        answer: '因为',
      },
      {
        type: 'translate',
        q: 'ترجم: 今天天气怎么样？',
        answer: 'كيف الطقس اليوم؟',
      },
      {
        type: 'tone',
        q: 'ما نبرة كلمة "热" (rè)؟',
        options: ['النبرة الأولى ـ', 'النبرة الثانية ↗', 'النبرة الثالثة ↘↗', 'النبرة الرابعة ↘'],
        correct: 3,
      },
    ],
  },

  // ============================================================
  // LESSON 10: الجسم والصحة — 身体与健康
  // ============================================================
  {
    id: 10,
    title: 'سأدرس في المدرسة غداً صباحاً',
    titleZh: '我明天上午在学校学习',
    level: 'مبتدئ',
    vocabularyIds: [82, 145, 203, 265, 312, 313, 314, 315, 316, 317, 318, 346, 353, 355, 364, 369, 359, 375, 211, 367, 396, 388, 292, 215],
    grammarIds: [4, 8, 14, 18],
    keySentences: [
      { zh: '我的头很疼。', pinyin: 'Wǒ de tóu hěn téng.', arabic: 'رأسي يؤلمني كثيراً.', audioAvailable: true },
      { zh: '你生病了吗？', pinyin: 'Nǐ shēngbìng le ma?', arabic: 'هل أنت مريض؟', audioAvailable: true },
      { zh: '你应该去看医生。', pinyin: 'Nǐ yīnggāi qù kàn yīshēng.', arabic: 'يجب أن تذهب لرؤية الطبيب.', audioAvailable: true },
      { zh: '我感冒了。', pinyin: 'Wǒ gǎnmào le.', arabic: 'لقد أصبت بالزكام.', audioAvailable: true },
      { zh: '你感觉怎么样？', pinyin: 'Nǐ gǎnjué zěnmeyàng?', arabic: 'كيف تشعر؟', audioAvailable: true },
      { zh: '我已经吃药了。', pinyin: 'Wǒ yǐjīng chī yào le.', arabic: 'لقد تناولت الدواء بالفعل.', audioAvailable: true },
      { zh: '你必须多喝水。', pinyin: 'Nǐ bìxū duō hē shuǐ.', arabic: 'يجب عليك شرب الكثير من الماء.', audioAvailable: true },
      { zh: '别担心，放心吧。', pinyin: 'Bié dānxīn, fàngxīn ba.', arabic: 'لا تقلق، اطمئن.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L10C1',
        title: 'زيارة الطبيب',
        scene: '🏥 في عيادة الطبيب — فحص طبي',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '医生，你好。我不舒服。', pinyin: 'Yīshēng, nǐ hǎo. Wǒ bù shūfu.', arabic: 'دكتور، مرحباً. أنا لا أشعر جيداً.' },
          { speaker: 'B', name: 'الطبيب', zh: '你怎么了？你感觉怎么样？', pinyin: 'Nǐ zěnme le? Nǐ gǎnjué zěnmeyàng?', arabic: 'ما بك؟ كيف تشعر؟' },
          { speaker: 'A', name: 'أحمد', zh: '我感冒了，头很疼。', pinyin: 'Wǒ gǎnmào le, tóu hěn téng.', arabic: 'أصبت بالزكام ورأسي يؤلمني كثيراً.' },
          { speaker: 'B', name: 'الطبيب', zh: '你应该多休息，多喝水。', pinyin: 'Nǐ yīnggāi duō xiūxi, duō hē shuǐ.', arabic: 'يجب أن ترتاح كثيراً وتشرب الكثير من الماء.' },
          { speaker: 'A', name: 'أحمد', zh: '我需要吃药吗？', pinyin: 'Wǒ xūyào chī yào ma?', arabic: 'هل أحتاج لتناول الدواء؟' },
          { speaker: 'B', name: 'الطبيب', zh: '是的，你必须吃药。', pinyin: 'Shì de, nǐ bìxū chī yào.', arabic: 'نعم، يجب عليك تناول الدواء.' },
        ],
      },
      {
        id: 'L10C2',
        title: 'قلق صديق',
        scene: '📱 مكالمة هاتفية — الاطمئنان على صديق',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '听说你生病了，你感觉怎么样？', pinyin: 'Tīngshuō nǐ shēngbìng le, nǐ gǎnjué zěnmeyàng?', arabic: 'سمعت أنك مريض، كيف تشعر؟' },
          { speaker: 'B', name: 'ليلى', zh: '我已经吃药了，好了一点。', pinyin: 'Wǒ yǐjīng chī yào le, hǎo le yīdiǎn.', arabic: 'تناولت الدواء وأشعر بتحسن قليلاً.' },
          { speaker: 'A', name: 'سارة', zh: '别担心，好好休息。', pinyin: 'Bié dānxīn, hǎohǎo xiūxi.', arabic: 'لا تقلقي، استريحي جيداً.' },
          { speaker: 'B', name: 'ليلى', zh: '谢谢你来看我。', pinyin: 'Xièxie nǐ lái kàn wǒ.', arabic: 'شكراً لمجيئك لرؤيتي.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"感冒" تعني:',
        options: ['صداع', 'زكام', 'حمى', 'ألم'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '你应该____看医生。',
        options: ['去', '不', '没有', '也'],
        correct: 0,
      },
      {
        type: 'fill_blank',
        q: '我的____很疼。',
        answer: '头',
      },
      {
        type: 'fill_blank',
        q: '你必须多喝水。 — "必须" تعني:',
        answer: 'يجب',
      },
      {
        type: 'translate',
        q: 'ترجم: 你感觉怎么样？',
        answer: 'كيف تشعر؟',
      },
    ],
  },

  // ============================================================
  // LESSON 11: الدراسة والعمل — 学习与工作
  // ============================================================
  {
    id: 11,
    title: 'التفاح هنا رخيص حقاً!',
    titleZh: '这儿的苹果真便宜！',
    level: 'مبتدئ',
    vocabularyIds: [43, 94, 95, 99, 100, 107, 108, 131, 132, 144, 147, 199, 200, 208, 209, 233, 239, 248, 256, 258, 259, 319, 320, 321, 333, 349, 351, 378, 405],
    grammarIds: [1, 3, 14, 17, 18],
    keySentences: [
      { zh: '我是大学生。', pinyin: 'Wǒ shì dàxuéshēng.', arabic: 'أنا طالب جامعي.', audioAvailable: true },
      { zh: '你做什么工作？', pinyin: 'Nǐ zuò shénme gōngzuò?', arabic: 'ما هو عملك؟', audioAvailable: true },
      { zh: '我学习中文。', pinyin: 'Wǒ xuéxí Zhōngwén.', arabic: 'أنا أدرس اللغة الصينية.', audioAvailable: true },
      { zh: '这个问题很难。', pinyin: 'Zhège wèntí hěn nán.', arabic: 'هذه المشكلة صعبة جداً.', audioAvailable: true },
      { zh: '他已经毕业了。', pinyin: 'Tā yǐjīng bìyè le.', arabic: 'لقد تخرّج بالفعل.', audioAvailable: true },
      { zh: '我在公司上班。', pinyin: 'Wǒ zài gōngsī shàngbān.', arabic: 'أنا أعمل في شركة.', audioAvailable: true },
      { zh: '下课后你去哪儿？', pinyin: 'Xiàkè hòu nǐ qù nǎr?', arabic: 'أين تذهب بعد انتهاء الحصة؟', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L11C1',
        title: 'في مقابلة عمل',
        scene: '🏢 في مكتب الموارد البشرية — مقابلة عمل',
        turns: [
          { speaker: 'A', name: 'المدير', zh: '你好，请问你叫什么名字？', pinyin: 'Nǐ hǎo, qǐngwèn nǐ jiào shénme míngzi?', arabic: 'مرحباً، ما اسمك من فضلك؟' },
          { speaker: 'B', name: 'أحمد', zh: '我叫阿里。我是大学生。', pinyin: 'Wǒ jiào Ālǐ. Wǒ shì dàxuéshēng.', arabic: 'اسمي علي. أنا طالب جامعي.' },
          { speaker: 'A', name: 'المدير', zh: '你学习什么？', pinyin: 'Nǐ xuéxí shénme?', arabic: 'ماذا تدرس؟' },
          { speaker: 'B', name: 'أحمد', zh: '我学习中文和英文。', pinyin: 'Wǒ xuéxí Zhōngwén hé Yīngwén.', arabic: 'أدرس الصينية والإنجليزية.' },
          { speaker: 'A', name: 'المدير', zh: '你会说英语吗？', pinyin: 'Nǐ huì shuō Yīngyǔ ma?', arabic: 'هل تستطيع التحدث بالإنجليزية؟' },
          { speaker: 'B', name: 'أحمد', zh: '会，我已经学了三年了。', pinyin: 'Huì, wǒ yǐjīng xué le sān nián le.', arabic: 'نعم، لقد درستها لثلاث سنوات.' },
        ],
      },
      {
        id: 'L11C2',
        title: 'حديث عن الدراسة',
        scene: '📚 في الفصل — وقت الراحة',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '你的考试怎么样？', pinyin: 'Nǐ de kǎoshì zěnmeyàng?', arabic: 'كيف كان امتحانك؟' },
          { speaker: 'B', name: 'ليلى', zh: '这个问题很难，但是我觉得还可以。', pinyin: 'Zhège wèntí hěn nán, dànshì wǒ juéde hái kěyǐ.', arabic: 'السؤال كان صعباً، لكنني أعتقد أنه كان مقبولاً.' },
          { speaker: 'A', name: 'سارة', zh: '你每天都在学校学习吗？', pinyin: 'Nǐ měitiān dōu zài xuéxiào xuéxí ma?', arabic: 'هل تدرسين في المدرسة كل يوم؟' },
          { speaker: 'B', name: 'ليلى', zh: '是的，下课以后我还去图书馆。', pinyin: 'Shì de, xiàkè yǐhòu wǒ hái qù túshūguǎn.', arabic: 'نعم، بعد الحصة أذهب أيضاً إلى المكتبة.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"大学生" تعني:',
        options: ['طالب مدرسة', 'طالب جامعة', 'معلم', 'أستاذ'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '你____什么工作？',
        options: ['去', '做', '看', '吃'],
        correct: 1,
      },
      {
        type: 'fill_blank',
        q: '我学习____。',
        answer: '中文',
      },
      {
        type: 'fill_blank',
        q: '这个____很难。',
        answer: '问题',
      },
      {
        type: 'translate',
        q: 'ترجم: 他是老师。',
        answer: 'هو معلم.',
      },
      {
        type: 'translate',
        q: 'ترجم إلى الصينية: أعمل في شركة.',
        answer: '我在公司上班。',
      },
    ],
  },

  // ============================================================
  // LESSON 12: الترفيه والهوايات — 娱乐与爱好
  // ============================================================
  {
    id: 12,
    title: 'أنا أدرس في الجامعة',
    titleZh: '我读大学',
    level: 'مبتدئ',
    vocabularyIds: [86, 102, 117, 123, 125, 224, 228, 250, 223, 374, 376, 377, 379, 386, 381, 382, 383, 384, 387, 391, 393, 409, 124, 216],
    grammarIds: [5, 6, 15, 22],
    keySentences: [
      { zh: '你喜欢做什么？', pinyin: 'Nǐ xǐhuān zuò shénme?', arabic: 'ماذا تحب أن تفعل؟', audioAvailable: true },
      { zh: '我喜欢听音乐。', pinyin: 'Wǒ xǐhuān tīng yīnyuè.', arabic: 'أحب الاستماع إلى الموسيقى.', audioAvailable: true },
      { zh: '她很好玩儿。', pinyin: 'Tā hěn hǎowánr.', arabic: 'إنها ممتعة جداً.', audioAvailable: true },
      { zh: '我们一起运动吧！', pinyin: 'Wǒmen yīqǐ yùndòng ba!', arabic: 'هيا نتدرب معاً!', audioAvailable: true },
      { zh: '今天是我的生日。', pinyin: 'Jīntiān shì wǒ de shēngrì.', arabic: 'اليوم هو عيد ميلادي.', audioAvailable: true },
      { zh: '加油！你很厉害！', pinyin: 'Jiāyóu! Nǐ hěn lìhai!', arabic: 'بالتوفيق! أنت رائع!', audioAvailable: true },
      { zh: '这道题很简单。', pinyin: 'Zhè dào tí hěn jiǎndān.', arabic: 'هذا السؤال بسيط جداً.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L12C1',
        title: 'حديث عن الهوايات',
        scene: '🏃 في الحديقة — وقت فراغ',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '你喜欢做什么？', pinyin: 'Nǐ xǐhuān zuò shénme?', arabic: 'ماذا تحب أن تفعل؟' },
          { speaker: 'B', name: 'سارة', zh: '我喜欢运动和听音乐。你呢？', pinyin: 'Wǒ xǐhuān yùndòng hé tīng yīnyuè. Nǐ ne?', arabic: 'أحب الرياضة والاستماع للموسيقى. وأنت؟' },
          { speaker: 'A', name: 'أحمد', zh: '我喜欢散步和看书。', pinyin: 'Wǒ xǐhuān sànbù hé kàn shū.', arabic: 'أحب النزهة وقراءة الكتب.' },
          { speaker: 'B', name: 'سارة', zh: '差不多，我们也一起去公园吧。', pinyin: 'Chàbuduō, wǒmen yě yīqǐ qù gōngyuán ba.', arabic: 'تقريباً، هيا نذهب معاً إلى الحديقة.' },
          { speaker: 'A', name: 'أحمد', zh: '好办法！', pinyin: 'Hǎo bànfǎ!', arabic: 'فكرة رائعة!' },
        ],
      },
      {
        id: 'L12C2',
        title: 'حفلة عيد ميلاد',
        scene: '🎂 في منزل سارة — حفلة عيد ميلاد',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '生日快乐！', pinyin: 'Shēngrì kuàilè!', arabic: 'عيد ميلاد سعيد!' },
          { speaker: 'B', name: 'سارة', zh: '谢谢你们来！', pinyin: 'Xièxie nǐmen lái!', arabic: 'شكراً لمجيئكم!' },
          { speaker: 'C', name: 'عمر', zh: '这是给你的礼物。', pinyin: 'Zhè shì gěi nǐ de lǐwù.', arabic: 'هذا هدية لكِ.' },
          { speaker: 'B', name: 'سارة', zh: '太好了！你们太聪明了！', pinyin: 'Tài hǎo le! Nǐmen tài cōngming le!', arabic: 'رائع! أنتم أذكياء جداً!' },
          { speaker: 'A', name: 'ليلى', zh: '一起唱歌吧！', pinyin: 'Yīqǐ chànggē ba!', arabic: 'هيا نغني معاً!' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"听音乐" تعني:',
        options: ['مشاهدة التلفاز', 'الاستماع إلى الموسيقى', 'قراءة كتاب', 'لعب كرة'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '"加油" تستخدم:',
        options: ['للترحيب', 'للتشجيع', 'للشكر', 'للاستفسار'],
        correct: 1,
      },
      {
        type: 'fill_blank',
        q: '我喜欢____音乐。',
        answer: '听',
      },
      {
        type: 'fill_blank',
        q: '你很____！',
        answer: '厉害',
      },
      {
        type: 'translate',
        q: 'ترجم: 一起运动吧！',
        answer: 'هيا نتدرب معاً!',
      },
    ],
  },

  // ============================================================
  // LESSON 13: المشاعر والحالة — 情感与状态
  // ============================================================
  {
    id: 13,
    title: 'أمطرت الثلوج أمس',
    titleZh: '昨天下雪了',
    level: 'مبتدئ',
    vocabularyIds: [45, 50, 113, 141, 183, 347, 389, 408, 365, 281, 282, 232, 283, 368, 394, 395, 400, 401, 402, 403, 404, 406, 407, 410],
    grammarIds: [5, 7, 8, 14],
    keySentences: [
      { zh: '我很想家。', pinyin: 'Wǒ hěn xiǎng jiā.', arabic: 'أنا أشتاق لبيتي كثيراً.', audioAvailable: true },
      { zh: '你今天忙吗？', pinyin: 'Nǐ jīntiān máng ma?', arabic: 'هل أنت مشغول اليوم؟', audioAvailable: true },
      { zh: '我有点儿生气。', pinyin: 'Wǒ yǒu diǎnr shēngqì.', arabic: 'أنا غاضب قليلاً.', audioAvailable: true },
      { zh: '你怎么样？', pinyin: 'Nǐ zěnmeyàng?', arabic: 'كيف حالك؟', audioAvailable: true },
      { zh: '我希望考试很简单。', pinyin: 'Wǒ xīwàng kǎoshì hěn jiǎndān.', arabic: 'أتمنى أن يكون الامتحان بسيطاً.', audioAvailable: true },
      { zh: '虽然很难，但是很有意思。', pinyin: 'Suīrán hěn nán, dànshì hěn yǒuyìsi.', arabic: 'رغم أنه صعب، لكنه ممتع جداً.', audioAvailable: true },
      { zh: '我明白你的意思。', pinyin: 'Wǒ míngbai nǐ de yìsi.', arabic: 'أنا أفهم ما تقصد.', audioAvailable: true },
      { zh: '你喜欢什么颜色？', pinyin: 'Nǐ xǐhuān shénme yánsè?', arabic: 'ما الألوان التي تحبها؟', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L13C1',
        title: 'حديث عن المشاعر',
        scene: '😔 في مقهى — صديقان يتحدثان',
        turns: [
          { speaker: 'A', name: 'عمر', zh: '你今天怎么样？', pinyin: 'Nǐ jīntiān zěnmeyàng?', arabic: 'كيف حالك اليوم؟' },
          { speaker: 'B', name: 'أحمد', zh: '我有点儿生气。', pinyin: 'Wǒ yǒu diǎnr shēngqì.', arabic: 'أنا غاضب قليلاً.' },
          { speaker: 'A', name: 'عمر', zh: '怎么了？', pinyin: 'Zěnme le?', arabic: 'ما بك؟' },
          { speaker: 'B', name: 'أحمد', zh: '考试太难了，虽然我努力了。', pinyin: 'Kǎoshì tài nán le, suīrán wǒ nǔlì le.', arabic: 'الامتحان كان صعباً جداً، رغم أنني اجتهدت.' },
          { speaker: 'A', name: 'عمر', zh: '别担心，下次你会做得更好。', pinyin: 'Bié dānxīn, xià cì nǐ huì zuò de gèng hǎo.', arabic: 'لا تقلق، في المرة القادمة ستؤدي بشكل أفضل.' },
          { speaker: 'B', name: 'أحمد', zh: '谢谢你。', pinyin: 'Xièxie nǐ.', arabic: 'شكراً لك.' },
        ],
      },
      {
        id: 'L13C2',
        title: 'تقديم صديق',
        scene: '👋 في حفل — لقاء جديد',
        turns: [
          { speaker: 'A', name: 'سارة', zh: '我来介绍一下，这是我的朋友李丽。', pinyin: 'Wǒ lái jièshào yīxià, zhè shì wǒ de péngyou Lǐ Lì.', arabic: 'دعني أقدم لكِ، هذه صديقتي لي لي.' },
          { speaker: 'B', name: 'ليلى', zh: '你好！很高兴认识你。', pinyin: 'Nǐ hǎo! Hěn gāoxìng rènshi nǐ.', arabic: 'مرحباً! سعيدة بمعرفتك.' },
          { speaker: 'C', name: 'عمر', zh: '你好！你做什么工作？', pinyin: 'Nǐ hǎo! Nǐ zuò shénme gōngzuò?', arabic: 'مرحباً! ما هو عملك؟' },
          { speaker: 'B', name: 'ليلى', zh: '我是老师。或者我们可以选择其他话题。', pinyin: 'Wǒ shì lǎoshī. Huòzhě wǒmen kěyǐ xuǎnzé qítā huàtí.', arabic: 'أنا معلمة. أو يمكننا اختيار موضوع آخر.' },
          { speaker: 'C', name: 'عمر', zh: '这个颜色很适合你。', pinyin: 'Zhège yánsè hěn shìhé nǐ.', arabic: 'هذا اللون يناسبك كثيراً.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"生气" تعني:',
        options: ['سعيد', 'حزين', 'غاضب', 'متوتر'],
        correct: 2,
      },
      {
        type: 'multiple_choice',
        q: '我希望____好天气。',
        options: ['有', '是', '做', '想'],
        correct: 0,
      },
      {
        type: 'fill_blank',
        q: '你今天怎么样？ — 我很____。',
        answer: '忙',
      },
      {
        type: 'fill_blank',
        q: '我明白你的____。',
        answer: '意思',
      },
      {
        type: 'translate',
        q: 'ترجم: 虽然很难，但是很有意思。',
        answer: 'رغم أنه صعب، لكنه ممتع جداً.',
      },
    ],
  },

  // ============================================================
  // LESSON 14: المنزل والحياة اليومية — 家庭与日常生活
  // ============================================================
  {
    id: 14,
    title: 'من فضلك أعطني كوب شاي',
    titleZh: '请给我一杯茶',
    level: 'مبتدئ',
    vocabularyIds: [90, 101, 112, 128, 142, 206, 207, 214, 221, 255, 269, 288, 296, 297, 301, 330, 331, 332, 334, 189, 300, 392, 380, 390],
    grammarIds: [12, 13, 17, 20],
    keySentences: [
      { zh: '我每天七点起床。', pinyin: 'Wǒ měitiān qī diǎn qǐchuáng.', arabic: 'أنا أستيقظ الساعة السابعة كل يوم.', audioAvailable: true },
      { zh: '他在家做饭。', pinyin: 'Tā zài jiā zuòfàn.', arabic: 'هو يطبخ في المنزل.', audioAvailable: true },
      { zh: '你住在哪儿？', pinyin: 'Nǐ zhù zài nǎr?', arabic: 'أين تسكن؟', audioAvailable: true },
      { zh: '我住在城市中心。', pinyin: 'Wǒ zhù zài chéngshì zhōngxīn.', arabic: 'أسكن في وسط المدينة.', audioAvailable: true },
      { zh: '这是你的房间吗？', pinyin: 'Zhè shì nǐ de fángjiān ma?', arabic: 'هل هذه غرفتك؟', audioAvailable: true },
      { zh: '我习惯早起。', pinyin: 'Wǒ xíguàn zǎo qǐ.', arabic: 'لدي عادة الاستيقاظ مبكراً.', audioAvailable: true },
      { zh: '今天比昨天冷。', pinyin: 'Jīntiān bǐ zuótiān lěng.', arabic: 'اليوم أبرد من أمس.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L14C1',
        title: 'روتين يومي',
        scene: '🌅 في المطبخ — صباح يوم عادي',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '你每天几点起床？', pinyin: 'Nǐ měitiān jǐ diǎn qǐchuáng?', arabic: 'في أي ساعة تستيقظ كل يوم؟' },
          { speaker: 'B', name: 'سارة', zh: '我每天七点起床。你呢？', pinyin: 'Wǒ měitiān qī diǎn qǐchuáng. Nǐ ne?', arabic: 'أنا أستيقظ الساعة السابعة كل يوم. وأنت؟' },
          { speaker: 'A', name: 'أحمد', zh: '我一般八点起床，比较晚。', pinyin: 'Wǒ yìbān bā diǎn qǐchuáng, bǐjiào wǎn.', arabic: 'أنا عادة أستيقظ الثامنة، متأخر نسبياً.' },
          { speaker: 'B', name: 'سارة', zh: '起床以后你做什么？', pinyin: 'Qǐchuáng yǐhòu nǐ zuò shénme?', arabic: 'ماذا تفعل بعد الاستيقاظ؟' },
          { speaker: 'A', name: 'أحمد', zh: '我先吃早饭，然后去学校。', pinyin: 'Wǒ xiān chī zǎofàn, ránhòu qù xuéxiào.', arabic: 'أنا أتناول الإفطار أولاً، ثم أذهب للمدرسة.' },
          { speaker: 'B', name: 'سارة', zh: '我住在学校附近，所以走路去。', pinyin: 'Wǒ zhù zài xuéxiào fùjìn, suǒyǐ zǒulù qù.', arabic: 'أسكن بالقرب من المدرسة، لذلك أمشي.' },
        ],
      },
      {
        id: 'L14C2',
        title: 'الحديث عن المنزل',
        scene: '🏠 في غرفة المعيشة — جار جديد',
        turns: [
          { speaker: 'A', name: 'ليلى', zh: '你家有几间房间？', pinyin: 'Nǐ jiā yǒu jǐ jiān fángjiān?', arabic: 'كم عدد الغرف في منزلك؟' },
          { speaker: 'B', name: 'عمر', zh: '我家有三间房间，一个客厅。', pinyin: 'Wǒ jiā yǒu sān jiān fángjiān, yī gè kètīng.', arabic: 'في منزلي ثلاث غرف وصالة معيشة.' },
          { speaker: 'A', name: 'ليلى', zh: '你一个人住吗？', pinyin: 'Nǐ yī gè rén zhù ma?', arabic: 'هل تسكن وحدك؟' },
          { speaker: 'B', name: 'عمر', zh: '不，我和家人一起住。', pinyin: 'Bù, wǒ hé jiārén yīqǐ zhù.', arabic: 'لا، أسكن مع عائلتي.' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"起床" تعني:',
        options: ['النوم', 'الاستيقاظ', 'الجلوس', 'المشي'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '"做饭" تعني:',
        options: ['الأكل', 'الشرب', 'الطبخ', 'الشراء'],
        correct: 2,
      },
      {
        type: 'fill_blank',
        q: '我每天七点____。',
        answer: '起床',
      },
      {
        type: 'fill_blank',
        q: '你住在____？',
        answer: '哪儿',
      },
      {
        type: 'translate',
        q: 'ترجم: 他在家做饭。',
        answer: 'هو يطبخ في المنزل.',
      },
      {
        type: 'translate',
        q: 'ترجم إلى الصينية: اليوم أبرد من أمس.',
        answer: '今天比昨天冷。',
      },
    ],
  },

  // ============================================================
  // LESSON 15: المراجعة الشاملة — 复习与综合
  // ============================================================
  {
    id: 15,
    title: 'أراكم في مطار داشينغ!',
    titleZh: '大兴机场见！',
    level: 'مبتدئ',
    vocabularyIds: [22, 23, 24, 35, 44, 51, 92, 106, 115, 120, 146, 162, 176, 192, 197, 201, 205, 219, 225, 229, 238, 243, 245, 246, 270, 291, 294, 295, 298, 311, 338, 340, 341, 360, 366, 372, 397],
    grammarIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    keySentences: [
      { zh: '对不起！——没关系。', pinyin: 'Duìbuqǐ! — Méi guānxi.', arabic: 'آسف! — لا يهم.', audioAvailable: true },
      { zh: '你还有事吗？', pinyin: 'Nǐ hái yǒu shì ma?', arabic: 'هل لديك شيء آخر؟', audioAvailable: true },
      { zh: '他一定会来。', pinyin: 'Tā yídìng huì lái.', arabic: 'سيأتي بالتأكيد.', audioAvailable: true },
      { zh: '我们是一起学习的。', pinyin: 'Wǒmen shì yīqǐ xuéxí de.', arabic: 'نحن ندرس معاً.', audioAvailable: true },
      { zh: '这是谁的书？', pinyin: 'Zhè shì shéi de shū?', arabic: 'من كتاب هذا؟', audioAvailable: true },
      { zh: '给，这是你的。', pinyin: 'Gěi, zhè shì nǐ de.', arabic: 'تفضل، هذا لك.', audioAvailable: true },
      { zh: '请排队等候。', pinyin: 'Qǐng páiduì děnghòu.', arabic: 'من فضلك قف في الصف وانتظر.', audioAvailable: true },
      { zh: '大家都准备好了。', pinyin: 'Dàjiā dōu zhǔnbèi hǎo le.', arabic: 'الجميع مستعدون.', audioAvailable: true },
    ],
    conversations: [
      {
        id: 'L15C1',
        title: 'مراجعة شاملة',
        scene: '🎓 في الفصل — آخر يوم في الدورة',
        turns: [
          { speaker: 'A', name: '王老师', zh: '同学们，今天是我们最后一课。', pinyin: 'Tóngxuémen, jīntiān shì wǒmen zuìhòu yī kè.', arabic: 'أيها الطلاب، اليوم هو درسنا الأخير.' },
          { speaker: 'B', name: 'أحمد', zh: '对不起老师，我还想问一个问题。', pinyin: 'Duìbuqǐ lǎoshī, wǒ hái xiǎng wèn yī gè wèntí.', arabic: 'آسف أستاذ، أريد سؤالاً آخر.' },
          { speaker: 'A', name: '王老师', zh: '没关系，请问。', pinyin: 'Méi guānxi, qǐngwèn.', arabic: 'لا بأس، تفضل.' },
          { speaker: 'B', name: 'أحمد', zh: '"这是谁的书"和"这书是谁的"有区别吗？', pinyin: '"Zhè shì shéi de shū" hé "zhè shū shì shéi de" yǒu qūbié ma?', arabic: 'هل هناك فرق بين الجملتين؟' },
          { speaker: 'A', name: '王老师', zh: '意思差不多，但是有区别。', pinyin: 'Yìsi chàbuduō, dànshì yǒu qūbié.', arabic: 'المعنى تقريباً متشابه، لكن هناك فرق.' },
          { speaker: 'C', name: 'سارة', zh: '老师，您辛苦了！', pinyin: 'Lǎoshī, nín xīnkǔ le!', arabic: 'أستاذ، لقد تعبتِ!' },
          { speaker: 'A', name: '王老师', zh: '没事！你们一定努力学习！', pinyin: 'Méishì! Nǐmen yídìng nǔlì xuéxí!', arabic: 'لا بأس! يجب أن تجتهدوا في الدراسة!' },
        ],
      },
      {
        id: 'L15C2',
        title: 'لقاء وداع',
        scene: '✈️ في المطار — وداع أصدقاء',
        turns: [
          { speaker: 'A', name: 'أحمد', zh: '你要回去了吗？', pinyin: 'Nǐ yào huíqù le ma?', arabic: 'هل ستعود؟' },
          { speaker: 'B', name: 'ليلى', zh: '是的，明年我再来中国。', pinyin: 'Shì de, míngnián wǒ zài lái Zhōngguó.', arabic: 'نعم، سأعود إلى الصين العام القادم.' },
          { speaker: 'A', name: 'أحمد', zh: '我们一定保持联系。', pinyin: 'Wǒmen yídìng bǎochí liánxì.', arabic: 'يجب أن نبقي على التواصل بالتأكيد.' },
          { speaker: 'B', name: 'ليلى', zh: '给，这是我的电话号码。', pinyin: 'Gěi, zhè shì wǒ de diànhuà hàomǎ.', arabic: 'تفضل، هذا رقم هاتفي.' },
          { speaker: 'A', name: 'أحمد', zh: '谢谢你！再见！', pinyin: 'Xièxie nǐ! Zàijiàn!', arabic: 'شكراً لك! مع السلامة!' },
          { speaker: 'B', name: 'ليلى', zh: '明年见！', pinyin: 'Míngnián jiàn!', arabic: 'أراك العام القادم!' },
        ],
      },
    ],
    exercises: [
      {
        type: 'multiple_choice',
        q: '"对不起" — كيف ترد؟',
        options: ['谢谢', '没关系', '你好', '再见'],
        correct: 1,
      },
      {
        type: 'multiple_choice',
        q: '"这是谁的书" — "谁" تعني:',
        options: ['ماذا', 'من', 'أين', 'متى'],
        correct: 1,
      },
      {
        type: 'fill_blank',
        q: '我们____一起学习的。',
        answer: '是',
      },
      {
        type: 'fill_blank',
        q: '他____会来。',
        answer: '一定',
      },
      {
        type: 'translate',
        q: 'ترجم: 给，这是你的。',
        answer: 'تفضل، هذا لك.',
      },
      {
        type: 'translate',
        q: 'ترجم إلى الصينية: آسف! — لا يهم.',
        answer: '对不起！——没关系。',
      },
      {
        type: 'tone',
        q: 'ما نبرة كلمة "不" قبل كلمة من النبرة الرابعة؟',
        options: ['تبقى رابعة → bù', 'تصبح ثانية → bú', 'تصبح ثالثة → bǔ', 'تصبح أولى → bū'],
        correct: 1,
      },
      {
        type: 'tone',
        q: 'ما نبرة كلمة "一" قبل كلمة من النبرة الرابعة؟',
        options: ['تبقى أولى → yī', 'تصبح ثانية → yí', 'تصبح ثالثة → yǐ', 'تصبح رابعة → yì'],
        correct: 1,
      },
    ],
  },
];
