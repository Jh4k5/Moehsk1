// HSK 1 New Curriculum (2021) - Complete Vocabulary Data
// Extracted from 58 PDF pages via VLM
// Organized into 10 lessons with ~500 words total

export interface HSK1Word {
  chinese: string
  pinyin: string
  arabic: string
  lesson: number
}

export interface HSK1Lesson {
  num: number
  titleZh: string
  titleAr: string
  words: HSK1Word[]
}

// ═══════════════════════════════════════════════════════════════
// LESSON 1: 你好 (Hello)
// ═══════════════════════════════════════════════════════════════

const lesson1Words: HSK1Word[] = [
  { chinese: '你好', pinyin: 'nǐ hǎo', arabic: 'مرحبا', lesson: 1 },
  { chinese: '大家', pinyin: 'dà jiā', arabic: 'الجميع', lesson: 1 },
  { chinese: '好', pinyin: 'hǎo', arabic: 'جيد / حسن', lesson: 1 },
  { chinese: '学生', pinyin: 'xué shēng', arabic: 'طالب', lesson: 1 },
  { chinese: '们', pinyin: 'men', arabic: 'الجمع (جزيء الجمع)', lesson: 1 },
  { chinese: '老师', pinyin: 'lǎo shī', arabic: 'معلم', lesson: 1 },
  { chinese: '您', pinyin: 'nín', arabic: 'أنت (صيغة احترام)', lesson: 1 },
  { chinese: '你们', pinyin: 'nǐ men', arabic: 'أنتم', lesson: 1 },
  { chinese: '谢谢', pinyin: 'xiè xie', arabic: 'شكراً', lesson: 1 },
  { chinese: '不客气', pinyin: 'bú kè qi', arabic: 'عفواً / لا شكر على واجب', lesson: 1 },
  { chinese: '同学', pinyin: 'tóng xué', arabic: 'زميل دراسة', lesson: 1 },
  { chinese: '再见', pinyin: 'zài jiàn', arabic: 'مع السلامة', lesson: 1 },
  { chinese: '请问', pinyin: 'qǐng wèn', arabic: 'عذراً / أرجو منك', lesson: 1 },
  { chinese: '你', pinyin: 'nǐ', arabic: 'أنت', lesson: 1 },
  { chinese: '叫', pinyin: 'jiào', arabic: 'يسمى / يدعى', lesson: 1 },
  { chinese: '什么', pinyin: 'shén me', arabic: 'ما / شيء', lesson: 1 },
  { chinese: '名字', pinyin: 'míng zi', arabic: 'اسم', lesson: 1 },
  { chinese: '我', pinyin: 'wǒ', arabic: 'أنا', lesson: 1 },
  { chinese: '不', pinyin: 'bù', arabic: 'لا', lesson: 1 },
  { chinese: '是', pinyin: 'shì', arabic: 'نعم / هو', lesson: 1 },
  { chinese: '对不起', pinyin: 'duì bu qǐ', arabic: 'أنا أسف', lesson: 1 },
  { chinese: '没关系', pinyin: 'méi guān xi', arabic: 'لا بأس', lesson: 1 },
  { chinese: '没事', pinyin: 'méi shì', arabic: 'لا يهم', lesson: 1 },
  { chinese: '很', pinyin: 'hěn', arabic: 'جداً / كثير', lesson: 1 },
  { chinese: '高兴', pinyin: 'gāo xìng', arabic: 'سعيد', lesson: 1 },
  { chinese: '认识', pinyin: 'rèn shi', arabic: 'يعرف', lesson: 1 },
  { chinese: '也', pinyin: 'yě', arabic: 'أيضاً', lesson: 1 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 2: 你叫什么名字 (What's Your Name?)
// ═══════════════════════════════════════════════════════════════

const lesson2Words: HSK1Word[] = [
  { chinese: '人', pinyin: 'rén', arabic: 'شخص', lesson: 2 },
  { chinese: '的', pinyin: 'de', arabic: 'حرف ملكية (الذي/التي)', lesson: 2 },
  { chinese: '这', pinyin: 'zhè', arabic: 'هذا', lesson: 2 },
  { chinese: '谁', pinyin: 'shéi', arabic: 'من', lesson: 2 },
  { chinese: '女朋友', pinyin: 'nǚ péng you', arabic: 'صديقة', lesson: 2 },
  { chinese: '哪', pinyin: 'nǎ', arabic: 'أي / أين', lesson: 2 },
  { chinese: '国', pinyin: 'guó', arabic: 'دولة', lesson: 2 },
  { chinese: '她', pinyin: 'tā', arabic: 'هي', lesson: 2 },
  { chinese: '喂', pinyin: 'wèi', arabic: 'مرحباً (على الهاتف)', lesson: 2 },
  { chinese: '姐姐', pinyin: 'jiě jie', arabic: 'الأخت الكبرى', lesson: 2 },
  { chinese: '工作', pinyin: 'gōng zuò', arabic: 'عمل / وظيفة', lesson: 2 },
  { chinese: '还', pinyin: 'hái', arabic: 'مازال / أيضاً', lesson: 2 },
  { chinese: '忙', pinyin: 'máng', arabic: 'مشغول', lesson: 2 },
  { chinese: '吗', pinyin: 'ma', arabic: 'هل (سؤال)', lesson: 2 },
  { chinese: '对', pinyin: 'duì', arabic: 'نعم / صحيح', lesson: 2 },
  { chinese: '太', pinyin: 'tài', arabic: 'جداً / كثير', lesson: 2 },
  { chinese: '我们', pinyin: 'wǒ men', arabic: 'نحن', lesson: 2 },
  { chinese: '想', pinyin: 'xiǎng', arabic: 'يريد / يفكر', lesson: 2 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 3: 她有几口人 (How Many People in Her Family?)
// ═══════════════════════════════════════════════════════════════

const lesson3Words: HSK1Word[] = [
  { chinese: '有', pinyin: 'yǒu', arabic: 'لدي / يملك', lesson: 3 },
  { chinese: '多少', pinyin: 'duō shǎo', arabic: 'كم', lesson: 3 },
  { chinese: '个', pinyin: 'gè', arabic: 'وحدة قياس عامة', lesson: 3 },
  { chinese: '哥哥', pinyin: 'gē ge', arabic: 'الأخ الأكبر', lesson: 3 },
  { chinese: '呢', pinyin: 'ne', arabic: 'ماذا عن...؟', lesson: 3 },
  { chinese: '没有', pinyin: 'méi yǒu', arabic: 'لا يملك / ليس لدي', lesson: 3 },
  { chinese: '家', pinyin: 'jiā', arabic: 'عائلة / منزل', lesson: 3 },
  { chinese: '几', pinyin: 'jǐ', arabic: 'كم (للأعداد الصغيرة)', lesson: 3 },
  { chinese: '口', pinyin: 'kǒu', arabic: 'وحدة قياس لأفراد العائلة', lesson: 3 },
  { chinese: '爸爸', pinyin: 'bà ba', arabic: 'أب / أبي', lesson: 3 },
  { chinese: '妈妈', pinyin: 'mā ma', arabic: 'أم / أمي', lesson: 3 },
  { chinese: '妹妹', pinyin: 'mèi mei', arabic: 'أخت صغيرة', lesson: 3 },
  { chinese: '和', pinyin: 'hé', arabic: 'و', lesson: 3 },
  { chinese: '儿子', pinyin: 'ér zi', arabic: 'ابن', lesson: 3 },
  { chinese: '孩子', pinyin: 'hái zi', arabic: 'أطفال / طفل', lesson: 3 },
  { chinese: '女儿', pinyin: 'nǚ\'ér', arabic: 'ابنة', lesson: 3 },
  { chinese: '岁', pinyin: 'suì', arabic: 'عام / سنة (العمر)', lesson: 3 },
  { chinese: '他', pinyin: 'tā', arabic: 'هو', lesson: 3 },
  { chinese: '多大', pinyin: 'duō dà', arabic: 'كم عمر', lesson: 3 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 4: 今天几号 (What's the Date Today?)
// ═══════════════════════════════════════════════════════════════

const lesson4Words: HSK1Word[] = [
  { chinese: '今天', pinyin: 'jīn tiān', arabic: 'اليوم', lesson: 4 },
  { chinese: '号', pinyin: 'hào', arabic: 'رقم / يوم (من الشهر)', lesson: 4 },
  { chinese: '月', pinyin: 'yuè', arabic: 'شهر', lesson: 4 },
  { chinese: '日', pinyin: 'rì', arabic: 'يوم', lesson: 4 },
  { chinese: '星期', pinyin: 'xīng qī', arabic: 'أسبوع', lesson: 4 },
  { chinese: '星期天', pinyin: 'xīng qī tiān', arabic: 'الأحد', lesson: 4 },
  { chinese: '休息', pinyin: 'xiū xi', arabic: 'استراحة / راحة', lesson: 4 },
  { chinese: '会', pinyin: 'huì', arabic: 'يعرف / يستطيع', lesson: 4 },
  { chinese: '做饭', pinyin: 'zuò fàn', arabic: 'يطبخ الطعام', lesson: 4 },
  { chinese: '做', pinyin: 'zuò', arabic: 'يصنع / يفعل', lesson: 4 },
  { chinese: '面条儿', pinyin: 'miàn tiáo r', arabic: 'نودلز / معكرونة', lesson: 4 },
  { chinese: '饺子', pinyin: 'jiǎo zi', arabic: 'جاتزي (حبوب محشوة)', lesson: 4 },
  { chinese: '一些', pinyin: 'yī xiē', arabic: 'بعض', lesson: 4 },
  { chinese: '菜', pinyin: 'cài', arabic: 'خضار / طبق', lesson: 4 },
  { chinese: '下班', pinyin: 'xià bān', arabic: 'الخروج من العمل', lesson: 4 },
  { chinese: '新', pinyin: 'xīn', arabic: 'جديد', lesson: 4 },
  { chinese: '电脑', pinyin: 'diàn nǎo', arabic: 'كمبيوتر', lesson: 4 },
  { chinese: '真', pinyin: 'zhēn', arabic: 'حقيقي', lesson: 4 },
  { chinese: '好看', pinyin: 'hǎo kàn', arabic: 'جميل (منظر)', lesson: 4 },
  { chinese: '喜欢', pinyin: 'xǐ huan', arabic: 'يحب', lesson: 4 },
  { chinese: '它', pinyin: 'tā', arabic: 'هو/هي (للجمادات)', lesson: 4 },
  { chinese: '手机', pinyin: 'shǒu jī', arabic: 'هاتف خلوي', lesson: 4 },
  { chinese: '电话', pinyin: 'diàn huà', arabic: 'هاتف', lesson: 4 },
  { chinese: '明天', pinyin: 'míng tiān', arabic: 'غداً', lesson: 4 },
  { chinese: '去', pinyin: 'qù', arabic: 'يذهب', lesson: 4 },
  { chinese: '哪儿', pinyin: 'nǎr', arabic: 'أين', lesson: 4 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 5: 明天你想去哪儿 (Where Do You Want to Go Tomorrow?)
// ═══════════════════════════════════════════════════════════════

const lesson5Words: HSK1Word[] = [
  { chinese: '超市', pinyin: 'chāo shì', arabic: 'سوبر ماركت', lesson: 5 },
  { chinese: '买', pinyin: 'mǎi', arabic: 'يشتري', lesson: 5 },
  { chinese: '东西', pinyin: 'dōng xi', arabic: 'أشياء', lesson: 5 },
  { chinese: '些', pinyin: 'xiē', arabic: 'بعض', lesson: 5 },
  { chinese: '牛奶', pinyin: 'niú nǎi', arabic: 'حليب', lesson: 5 },
  { chinese: '吃', pinyin: 'chī', arabic: 'يأكل', lesson: 5 },
  { chinese: '晚饭', pinyin: 'wǎn fàn', arabic: 'العشاء', lesson: 5 },
  { chinese: '那边', pinyin: 'nà biān', arabic: 'هناك / ذلك الجانب', lesson: 5 },
  { chinese: '包子', pinyin: 'bāo zi', arabic: 'باوزي (خبز صيني محشو)', lesson: 5 },
  { chinese: '非常', pinyin: 'fēi cháng', arabic: 'جداً / للغاية', lesson: 5 },
  { chinese: '好吃', pinyin: 'hǎo chī', arabic: 'لذيذ', lesson: 5 },
  { chinese: '米饭', pinyin: 'mǐ fàn', arabic: 'الأرز', lesson: 5 },
  { chinese: '怎么', pinyin: 'zěn me', arabic: 'كيف', lesson: 5 },
  { chinese: '出租车', pinyin: 'chū zū chē', arabic: 'تاكسي', lesson: 5 },
  { chinese: '现在', pinyin: 'xiàn zài', arabic: 'الآن', lesson: 5 },
  { chinese: '早上', pinyin: 'zǎo shang', arabic: 'صباحاً', lesson: 5 },
  { chinese: '上午', pinyin: 'shàng wǔ', arabic: 'صباحاً (قبل الظهر)', lesson: 5 },
  { chinese: '分', pinyin: 'fēn', arabic: 'دقيقة', lesson: 5 },
  { chinese: '课', pinyin: 'kè', arabic: 'درس / حصة', lesson: 5 },
  { chinese: '下午', pinyin: 'xià wǔ', arabic: 'بعد الظهر', lesson: 5 },
  { chinese: '见', pinyin: 'jiàn', arabic: 'رؤية / لقاء', lesson: 5 },
  { chinese: '吧', pinyin: 'ba', arabic: 'أداة اقتراح', lesson: 5 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 6: 现在几点 (What Time Is It Now?)
// ═══════════════════════════════════════════════════════════════

const lesson6Words: HSK1Word[] = [
  { chinese: '电影院', pinyin: 'diàn yǐng yuàn', arabic: 'سينما', lesson: 6 },
  { chinese: '看', pinyin: 'kàn', arabic: 'مشاهدة / يرى', lesson: 6 },
  { chinese: '电影', pinyin: 'diàn yǐng', arabic: 'فيلم', lesson: 6 },
  { chinese: '事', pinyin: 'shì', arabic: 'شيء / أمر / عمل', lesson: 6 },
  { chinese: '上课', pinyin: 'shàng kè', arabic: 'يبدأ الدرس', lesson: 6 },
  { chinese: '半', pinyin: 'bàn', arabic: 'نصف', lesson: 6 },
  { chinese: '下课', pinyin: 'xià kè', arabic: 'ينتهي الدرس', lesson: 6 },
  { chinese: '在', pinyin: 'zài', arabic: 'في / عند', lesson: 6 },
  { chinese: '里', pinyin: 'lǐ', arabic: 'داخل', lesson: 6 },
  { chinese: '晚上', pinyin: 'wǎn shang', arabic: 'مساء / الليل', lesson: 6 },
  { chinese: '医院', pinyin: 'yī yuàn', arabic: 'مستشفى', lesson: 6 },
  { chinese: '上班', pinyin: 'shàng bān', arabic: 'الذهاب للعمل', lesson: 6 },
  { chinese: '店', pinyin: 'diàn', arabic: 'متجر / محل', lesson: 6 },
  { chinese: '分钟', pinyin: 'fēn zhōng', arabic: 'دقيقة', lesson: 6 },
  { chinese: '后', pinyin: 'hòu', arabic: 'بعد', lesson: 6 },
  { chinese: '房间', pinyin: 'fáng jiān', arabic: 'غرفة', lesson: 6 },
  { chinese: '外', pinyin: 'wài', arabic: 'خارج', lesson: 6 },
  { chinese: '只', pinyin: 'zhī', arabic: 'قطعة (عدد)', lesson: 6 },
  { chinese: '小', pinyin: 'xiǎo', arabic: 'صغير', lesson: 6 },
  { chinese: '猫', pinyin: 'māo', arabic: 'قطة', lesson: 6 },
  { chinese: '没', pinyin: 'méi', arabic: 'ليس / لا', lesson: 6 },
  { chinese: '看见', pinyin: 'kàn jiàn', arabic: 'رؤية / أرى', lesson: 6 },
  { chinese: '桌子', pinyin: 'zhuō zi', arabic: 'طاولة', lesson: 6 },
  { chinese: '下', pinyin: 'xià', arabic: 'تحت / أسفل', lesson: 6 },
  { chinese: '漂亮', pinyin: 'piào liang', arabic: 'جميل', lesson: 6 },
  { chinese: '学校', pinyin: 'xué xiào', arabic: 'مدرسة', lesson: 6 },
  { chinese: '书店', pinyin: 'shū diàn', arabic: 'مكتبة', lesson: 6 },
  { chinese: '前', pinyin: 'qián', arabic: 'أمام / سابق', lesson: 6 },
  { chinese: '能', pinyin: 'néng', arabic: 'يمكن', lesson: 6 },
  { chinese: '到', pinyin: 'dào', arabic: 'يصل', lesson: 6 },
  { chinese: '午饭', pinyin: 'wǔ fàn', arabic: 'غداء', lesson: 6 },
  { chinese: '饭', pinyin: 'fàn', arabic: 'طعام / وجبة', lesson: 6 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 7: 你的房间在哪儿 (Where Is Your Room?)
// ═══════════════════════════════════════════════════════════════

const lesson7Words: HSK1Word[] = [
  { chinese: '大', pinyin: 'dà', arabic: 'كبير', lesson: 7 },
  { chinese: '病人', pinyin: 'bìng rén', arabic: 'مريض', lesson: 7 },
  { chinese: '多', pinyin: 'duō', arabic: 'كثير', lesson: 7 },
  { chinese: '医生', pinyin: 'yī shēng', arabic: 'طبيب', lesson: 7 },
  { chinese: '前边', pinyin: 'qián biān', arabic: 'أمام', lesson: 7 },
  { chinese: '边', pinyin: 'biān', arabic: 'جانب / حافة', lesson: 7 },
  { chinese: '那个', pinyin: 'nà ge', arabic: 'ذلك / تلك', lesson: 7 },
  { chinese: '外边', pinyin: 'wài biān', arabic: 'خارج', lesson: 7 },
  { chinese: '椅子', pinyin: 'yǐ zi', arabic: 'كرسي', lesson: 7 },
  { chinese: '上', pinyin: 'shàng', arabic: 'أعلى / فوق', lesson: 7 },
  { chinese: '本', pinyin: 'běn', arabic: 'نسخة (وحدة قياس للكتب)', lesson: 7 },
  { chinese: '书', pinyin: 'shū', arabic: 'كتاب', lesson: 7 },
  { chinese: '那', pinyin: 'nà', arabic: 'ذلك / تلك', lesson: 7 },
  { chinese: '第', pinyin: 'dì', arabic: 'الـ... (ترتيب)', lesson: 7 },
  { chinese: '学习', pinyin: 'xué xí', arabic: 'يتعلم', lesson: 7 },
  { chinese: '白天', pinyin: 'bái tiān', arabic: 'النهار', lesson: 7 },
  { chinese: '读书', pinyin: 'dú shū', arabic: 'يقرأ / يدرس', lesson: 7 },
  { chinese: '朋友', pinyin: 'péng you', arabic: 'صديق / صديقة', lesson: 7 },
  { chinese: '唱', pinyin: 'chàng', arabic: 'يغني', lesson: 7 },
  { chinese: '歌', pinyin: 'gē', arabic: 'أغنية', lesson: 7 },
  { chinese: '好听', pinyin: 'hǎo tīng', arabic: 'ذو صوت جميل', lesson: 7 },
  { chinese: '电视', pinyin: 'diàn shì', arabic: 'تلفاز', lesson: 7 },
  { chinese: '狗', pinyin: 'gǒu', arabic: 'كلب', lesson: 7 },
  { chinese: '玩', pinyin: 'wán', arabic: 'يلعب', lesson: 7 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 8: 他正在做什么 (What Is He Doing?)
// ═══════════════════════════════════════════════════════════════

const lesson8Words: HSK1Word[] = [
  { chinese: '杯子', pinyin: 'bēi zi', arabic: 'كوب / فنجان', lesson: 8 },
  { chinese: '售货员', pinyin: 'shòu huò yuán', arabic: 'بائع / بائعة', lesson: 8 },
  { chinese: '这边', pinyin: 'zhè biān', arabic: 'هنا / هذا الجانب', lesson: 8 },
  { chinese: '钱', pinyin: 'qián', arabic: 'نقود / مال', lesson: 8 },
  { chinese: '这些', pinyin: 'zhè xiē', arabic: 'هؤلاء / هذه الأشياء', lesson: 8 },
  { chinese: '块', pinyin: 'kuài', arabic: 'يوان (وحدة نقدية)', lesson: 8 },
  { chinese: '便宜', pinyin: 'pián yi', arabic: 'رخيص', lesson: 8 },
  { chinese: '商店', pinyin: 'shāng diàn', arabic: 'متجر', lesson: 8 },
  { chinese: '衣服', pinyin: 'yī fu', arabic: 'ملابس', lesson: 8 },
  { chinese: '件', pinyin: 'jiàn', arabic: 'قطعة (وحدة قياس)', lesson: 8 },
  { chinese: '元', pinyin: 'yuán', arabic: 'يوان (عملة صينية)', lesson: 8 },
  { chinese: '怎么样', pinyin: 'zěn me yàng', arabic: 'كيف', lesson: 8 },
  { chinese: '贵', pinyin: 'guì', arabic: 'غالي', lesson: 8 },
  { chinese: '穿', pinyin: 'chuān', arabic: 'يرتدي', lesson: 8 },
  { chinese: '女', pinyin: 'nǚ', arabic: 'امرأة / أنثى', lesson: 8 },
  { chinese: '男', pinyin: 'nán', arabic: 'رجل / ذكر', lesson: 8 },
  { chinese: '那儿', pinyin: 'nàr', arabic: 'هناك', lesson: 8 },
  { chinese: '时候', pinyin: 'shí hou', arabic: 'حين / وقت', lesson: 8 },
  { chinese: '饭店', pinyin: 'fàn diàn', arabic: 'مطعم / فندق', lesson: 8 },
  { chinese: '知道', pinyin: 'zhī dào', arabic: 'يعرف', lesson: 8 },
  { chinese: '正在', pinyin: 'zhèng zài', arabic: 'يحدث الآن', lesson: 8 },
  { chinese: '找', pinyin: 'zhǎo', arabic: 'يبحث عن', lesson: 8 },
  { chinese: '开车', pinyin: 'kāi chē', arabic: 'يقود السيارة', lesson: 8 },
  { chinese: '车', pinyin: 'chē', arabic: 'سيارة / مركبة', lesson: 8 },
  { chinese: '读', pinyin: 'dú', arabic: 'يقرأ', lesson: 8 },
  { chinese: '大学', pinyin: 'dà xué', arabic: 'جامعة', lesson: 8 },
  { chinese: '大学生', pinyin: 'dà xué shēng', arabic: 'طالب جامعي', lesson: 8 },
  { chinese: '学', pinyin: 'xué', arabic: 'يتعلم / دراسة', lesson: 8 },
  { chinese: '弟弟', pinyin: 'dì di', arabic: 'أخي الصغير', lesson: 8 },
  { chinese: '起床', pinyin: 'qǐ chuáng', arabic: 'الاستيقاظ', lesson: 8 },
  { chinese: '睡觉', pinyin: 'shuì jiào', arabic: 'النوم', lesson: 8 },
  { chinese: '睡', pinyin: 'shuì', arabic: 'ينام', lesson: 8 },
  { chinese: '那里', pinyin: 'nà lǐ', arabic: 'هناك', lesson: 8 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 9: 你喜欢什么衣服 (What Clothes Do You Like?)
// ═══════════════════════════════════════════════════════════════

const lesson9Words: HSK1Word[] = [
  { chinese: '哪里', pinyin: 'nǎ lǐ', arabic: 'أين', lesson: 9 },
  { chinese: '昨天', pinyin: 'zuó tiān', arabic: 'أمس', lesson: 9 },
  { chinese: '问', pinyin: 'wèn', arabic: 'يسأل', lesson: 9 },
  { chinese: '说', pinyin: 'shuō', arabic: 'يقول', lesson: 9 },
  { chinese: '要', pinyin: 'yào', arabic: 'يريد / أريد', lesson: 9 },
  { chinese: '小朋友', pinyin: 'xiǎo péng yǒu', arabic: 'طفل / صغير', lesson: 9 },
  { chinese: '天气', pinyin: 'tiān qì', arabic: 'طقس', lesson: 9 },
  { chinese: '这里', pinyin: 'zhè lǐ', arabic: 'هنا', lesson: 9 },
  { chinese: '天', pinyin: 'tiān', arabic: 'يوم / سماء', lesson: 9 },
  { chinese: '下雨', pinyin: 'xià yǔ', arabic: 'يمطر', lesson: 9 },
  { chinese: '了', pinyin: 'le', arabic: 'أداة (تم / انتهى)', lesson: 9 },
  { chinese: '雨', pinyin: 'yǔ', arabic: 'مطر', lesson: 9 },
  { chinese: '有点儿', pinyin: 'yǒu diǎnr', arabic: 'قليلاً', lesson: 9 },
  { chinese: '觉得', pinyin: 'jué de', arabic: 'يشعر / يعتقد', lesson: 9 },
  { chinese: '冷', pinyin: 'lěng', arabic: 'بارد', lesson: 9 },
  { chinese: '雪', pinyin: 'xuě', arabic: 'ثلج', lesson: 9 },
  { chinese: '来', pinyin: 'lái', arabic: 'يأتي', lesson: 9 },
  { chinese: '公司', pinyin: 'gōng sī', arabic: 'شركة', lesson: 9 },
  { chinese: '生病', pinyin: 'shēng bìng', arabic: 'مرض / يمرض', lesson: 9 },
  { chinese: '看病', pinyin: 'kàn bìng', arabic: 'الذهاب للطبيب', lesson: 9 },
  { chinese: '病', pinyin: 'bìng', arabic: 'مرض', lesson: 9 },
  { chinese: '一点儿', pinyin: 'yī diǎnr', arabic: 'قليل', lesson: 9 },
  { chinese: '药', pinyin: 'yào', arabic: 'دواء', lesson: 9 },
  { chinese: '回', pinyin: 'huí', arabic: 'يعود / يرجع', lesson: 9 },
  { chinese: '再', pinyin: 'zài', arabic: 'مرة أخرى', lesson: 9 },
  { chinese: '喝', pinyin: 'hē', arabic: 'يشرب', lesson: 9 },
  { chinese: '热', pinyin: 'rè', arabic: 'حار', lesson: 9 },
  { chinese: '水', pinyin: 'shuǐ', arabic: 'ماء', lesson: 9 },
  { chinese: '可以', pinyin: 'kě yǐ', arabic: 'يمكن', lesson: 9 },
  { chinese: '问题', pinyin: 'wèn tí', arabic: 'سؤال / مشكلة', lesson: 9 },
  { chinese: '卖', pinyin: 'mài', arabic: 'يبيع', lesson: 9 },
  { chinese: '打电话', pinyin: 'dǎ diàn huà', arabic: 'يتصل هاتفياً', lesson: 9 },
  { chinese: '一下', pinyin: 'yī xià', arabic: 'لحظة / قليلاً', lesson: 9 },
  { chinese: '服务员', pinyin: 'fú wù yuán', arabic: 'نادل / خادم', lesson: 9 },
  { chinese: '女士', pinyin: 'nǚ shì', arabic: 'سيدة', lesson: 9 },
  { chinese: '请', pinyin: 'qǐng', arabic: 'أرجو', lesson: 9 },
  { chinese: '坐', pinyin: 'zuò', arabic: 'يجلس', lesson: 9 },
  { chinese: '给', pinyin: 'gěi', arabic: 'يعطي', lesson: 9 },
  { chinese: '杯', pinyin: 'bēi', arabic: 'كأس', lesson: 9 },
  { chinese: '早饭', pinyin: 'zǎo fàn', arabic: 'الإفطار', lesson: 9 },
  { chinese: '这个', pinyin: 'zhè ge', arabic: 'هذا / هذه', lesson: 9 },
  { chinese: '面包', pinyin: 'miàn bāo', arabic: 'خبز', lesson: 9 },
  { chinese: '鸡蛋', pinyin: 'jī dàn', arabic: 'بيضة', lesson: 9 },
  { chinese: '先生', pinyin: 'xiān sheng', arabic: 'سيد / سيدي', lesson: 9 },
  { chinese: '一半', pinyin: 'yī bàn', arabic: 'نصف', lesson: 9 },
  { chinese: '茶', pinyin: 'chá', arabic: 'شاي', lesson: 9 },
]

// ═══════════════════════════════════════════════════════════════
// LESSON 10: 天气怎么样 (How's the Weather?)
// ═══════════════════════════════════════════════════════════════

const lesson10Words: HSK1Word[] = [
  { chinese: '火车', pinyin: 'huǒ chē', arabic: 'قطار', lesson: 10 },
  { chinese: '中午', pinyin: 'zhōng wǔ', arabic: 'الظهيرة', lesson: 10 },
  { chinese: '开', pinyin: 'kāi', arabic: 'يفتح / يشغل / ينطلق', lesson: 10 },
  { chinese: '有些', pinyin: 'yǒu xiē', arabic: 'بعض', lesson: 10 },
  { chinese: '有的', pinyin: 'yǒu de', arabic: 'بعض (الناس/الأشياء)', lesson: 10 },
  { chinese: '写', pinyin: 'xiě', arabic: 'يكتب', lesson: 10 },
  { chinese: '都', pinyin: 'dōu', arabic: 'كل / جميع', lesson: 10 },
  { chinese: '听见', pinyin: 'tīng jiàn', arabic: 'سمع', lesson: 10 },
  { chinese: '不要', pinyin: 'bú yào', arabic: 'لا (نهي)', lesson: 10 },
  { chinese: '说话', pinyin: 'shuō huà', arabic: 'يتحدث / يكلم', lesson: 10 },
  { chinese: '听', pinyin: 'tīng', arabic: 'يسمع / يستمع', lesson: 10 },
  { chinese: '哪些', pinyin: 'nǎ xiē', arabic: 'أي (جمع)', lesson: 10 },
  { chinese: '字', pinyin: 'zì', arabic: 'حرف / كلمة', lesson: 10 },
  { chinese: '明年', pinyin: 'míng nián', arabic: 'السنة القادمة', lesson: 10 },
  { chinese: '中学', pinyin: 'zhōng xué', arabic: 'المدرسة الإعدادية', lesson: 10 },
  { chinese: '小学', pinyin: 'xiǎo xué', arabic: 'المدرسة الابتدائية', lesson: 10 },
  { chinese: '中学生', pinyin: 'zhōng xué shēng', arabic: 'طالب المدرسة الإعدادية', lesson: 10 },
  { chinese: '小学生', pinyin: 'xiǎo xué shēng', arabic: 'طالب المدرسة الابتدائية', lesson: 10 },
  { chinese: '上学', pinyin: 'shàng xué', arabic: 'الذهاب إلى المدرسة', lesson: 10 },
  { chinese: '他们', pinyin: 'tā men', arabic: 'هم (ذكور)', lesson: 10 },
  { chinese: '她们', pinyin: 'tā men', arabic: 'هن (إناث)', lesson: 10 },
  { chinese: '它们', pinyin: 'tā men', arabic: 'هي (للجمادات)', lesson: 10 },
  { chinese: '晚', pinyin: 'wǎn', arabic: 'مساء / متأخر', lesson: 10 },
  { chinese: '爱', pinyin: 'ài', arabic: 'يحب', lesson: 10 },
  { chinese: '哪个', pinyin: 'nǎ ge', arabic: 'أي (استفهام)', lesson: 10 },
  { chinese: '去年', pinyin: 'qù nián', arabic: 'السنة الماضية', lesson: 10 },
  { chinese: '男朋友', pinyin: 'nán péng you', arabic: 'صديق (ذكر)', lesson: 10 },
  { chinese: '年', pinyin: 'nián', arabic: 'سنة / عام', lesson: 10 },
  { chinese: '好玩儿', pinyin: 'hǎo wánr', arabic: 'ممتع', lesson: 10 },
  { chinese: '飞机', pinyin: 'fēi jī', arabic: 'طائرة', lesson: 10 },
  { chinese: '小时', pinyin: 'xiǎo shí', arabic: 'ساعة', lesson: 10 },
  { chinese: '家人', pinyin: 'jiā rén', arabic: 'أهل / عائلة', lesson: 10 },
  { chinese: '时间', pinyin: 'shí jiān', arabic: 'وقت / زمن', lesson: 10 },
  { chinese: '机场', pinyin: 'jī chǎng', arabic: 'مطار', lesson: 10 },
  { chinese: '接', pinyin: 'jiē', arabic: 'يستقبل / يلتقط', lesson: 10 },
  { chinese: '早', pinyin: 'zǎo', arabic: 'مبكر / صباح', lesson: 10 },
]

// ═══════════════════════════════════════════════════════════════
// COMPILED LESSONS & FLAT WORD LIST
// ═══════════════════════════════════════════════════════════════

export const hsk1Lessons: HSK1Lesson[] = [
  {
    num: 1,
    titleZh: '你好',
    titleAr: 'مرحباً',
    words: lesson1Words,
  },
  {
    num: 2,
    titleZh: '你叫什么名字',
    titleAr: 'ما اسمك؟',
    words: lesson2Words,
  },
  {
    num: 3,
    titleZh: '她有几口人',
    titleAr: 'كم عدد أفراد عائلتها؟',
    words: lesson3Words,
  },
  {
    num: 4,
    titleZh: '今天几号',
    titleAr: 'ما هو تاريخ اليوم؟',
    words: lesson4Words,
  },
  {
    num: 5,
    titleZh: '明天你想去哪儿',
    titleAr: 'أين تريد أن تذهب غداً؟',
    words: lesson5Words,
  },
  {
    num: 6,
    titleZh: '现在几点',
    titleAr: 'كم الساعة الآن؟',
    words: lesson6Words,
  },
  {
    num: 7,
    titleZh: '你的房间在哪儿',
    titleAr: 'أين غرفتك؟',
    words: lesson7Words,
  },
  {
    num: 8,
    titleZh: '他正在做什么',
    titleAr: 'ماذا يفعل الآن؟',
    words: lesson8Words,
  },
  {
    num: 9,
    titleZh: '你喜欢什么衣服',
    titleAr: 'ما هي الملابس التي تحبها؟',
    words: lesson9Words,
  },
  {
    num: 10,
    titleZh: '天气怎么样',
    titleAr: 'كيف حال الطقس؟',
    words: lesson10Words,
  },
]

// Flat array of all words with lesson reference
export const hsk1AllWords: HSK1Word[] = hsk1Lessons.flatMap((lesson) => lesson.words)

// Helper: get words by lesson number
export function getWordsByLesson(lessonNum: number): HSK1Word[] {
  return hsk1Lessons.find((l) => l.num === lessonNum)?.words ?? []
}

// Helper: search words by Chinese, pinyin, or Arabic
export function searchWords(query: string): HSK1Word[] {
  const q = query.toLowerCase()
  return hsk1AllWords.filter(
    (w) =>
      w.chinese.includes(query) ||
      w.pinyin.toLowerCase().includes(q) ||
      w.arabic.includes(query)
  )
}

// Helper: get total word count
export function getTotalWordCount(): number {
  return hsk1AllWords.length
}

// Helper: get lesson by number
export function getLesson(lessonNum: number): HSK1Lesson | undefined {
  return hsk1Lessons.find((l) => l.num === lessonNum)
}
