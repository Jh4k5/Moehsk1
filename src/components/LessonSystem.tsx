'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen, Lock, CheckCircle, Play, ChevronLeft, ChevronRight, Star, Volume2,
  MessageCircle, Target, GraduationCap, RotateCcw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── TTS Helper ─────────────────────────────────────────────
const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.7
    window.speechSynthesis.speak(u)
  }
}

// ─── Lesson Data ────────────────────────────────────────────
interface LessonWord {
  zh: string
  pinyin: string
  meaning: string
}

interface Sentence {
  zh: string
  pinyin: string
  ar: string
}

interface ConversationTurn {
  speaker: 'A' | 'B'
  name: string
  hanzi: string
  pinyin: string
  arabic: string
}

interface GrammarRule {
  title: string
  description: string
  pattern: string
  example: string
  exampleAr: string
}

interface Lesson {
  id: number
  titleAr: string
  titleZh: string
  words: LessonWord[]
  sentences: Sentence[]
  conversation: ConversationTurn[]
  grammar: GrammarRule[]
  exerciseQuestions: { zh: string; options: string[]; correct: number }[]
}

const lessons: Lesson[] = [
  {
    id: 1, titleAr: 'التحيات والتعارف', titleZh: '问候与认识',
    words: [
      { zh: '你好', pinyin: 'nǐ hǎo', meaning: 'مرحباً' },
      { zh: '再见', pinyin: 'zàijiàn', meaning: 'مع السلامة' },
      { zh: '谢谢', pinyin: 'xièxie', meaning: 'شكراً' },
      { zh: '不客气', pinyin: 'bú kèqi', meaning: 'العفو' },
      { zh: '请', pinyin: 'qǐng', meaning: 'من فضلك' },
      { zh: '对不起', pinyin: 'duìbuqǐ', meaning: 'آسف' },
      { zh: '没关系', pinyin: 'méi guānxi', meaning: 'لا يهم' },
      { zh: '请问', pinyin: 'qǐngwèn', meaning: 'عفواً' },
    ],
    sentences: [
      { zh: '你好！', pinyin: 'Nǐ hǎo!', ar: 'مرحباً!' },
      { zh: '你好吗？', pinyin: 'Nǐ hǎo ma?', ar: 'كيف حالك؟' },
      { zh: '我很好，谢谢。', pinyin: 'Wǒ hěn hǎo, xièxie.', ar: 'أنا بخير، شكراً.' },
      { zh: '再见！', pinyin: 'Zàijiàn!', ar: 'مع السلامة!' },
      { zh: '谢谢你的帮助。', pinyin: 'Xièxie nǐ de bāngzhù.', ar: 'شكراً على مساعدتك.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '你好！', pinyin: 'Nǐ hǎo!', arabic: 'مرحباً!' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '你好！请问你叫什么名字？', pinyin: 'Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?', arabic: 'مرحباً! ما اسمك من فضلك؟' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '我叫李明。你呢？', pinyin: 'Wǒ jiào Lǐ Míng. Nǐ ne?', arabic: 'اسمي لي مينغ. وأنت؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我叫王芳。很高兴认识你。', pinyin: 'Wǒ jiào Wáng Fāng. Hěn gāoxìng rènshi nǐ.', arabic: 'اسمي وانغ فانغ. سعيدة بمعرفتك.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '我也是。再见！', pinyin: 'Wǒ yě shì. Zàijiàn!', arabic: 'أنا أيضاً. مع السلامة!' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '再见！', pinyin: 'Zàijiàn!', arabic: 'مع السلامة!' },
    ],
    grammar: [
      { title: 'صيغة التحية', description: '你好 هي أشهر تحية صينية', pattern: '你好！ (Nǐ hǎo!)', example: '你好，老师！', exampleAr: 'مرحباً يا معلم!' },
      { title: 'التعبير عن الشكر', description: '谢谢 + 不客气', pattern: '谢谢 → 不客气', example: '谢谢！——不客气。', exampleAr: 'شكراً! — العفو.' },
    ],
    exerciseQuestions: [
      { zh: 'ما معنى 你好؟', options: ['مع السلامة', 'مرحباً', 'شكراً', 'آسف'], correct: 1 },
      { zh: 'كيف تقول "شكراً" بالصينية؟', options: ['对不起', '没关系', '谢谢', '你好'], correct: 2 },
      { zh: 'ما الرد على شكر؟', options: ['你好', '再见', '对不起', '不客气'], correct: 3 },
      { zh: 'كيف تقول "مع السلامة"؟', options: ['你好', '再见', '谢谢', '请问'], correct: 1 },
      { zh: 'ما معنى 对不起؟', options: ['مرحباً', 'من فضلك', 'آسف', 'لا بأس'], correct: 2 },
    ],
  },
  {
    id: 2, titleAr: 'المعلومات الشخصية', titleZh: '个人信息',
    words: [
      { zh: '我', pinyin: 'wǒ', meaning: 'أنا' },
      { zh: '你', pinyin: 'nǐ', meaning: 'أنت' },
      { zh: '他', pinyin: 'tā', meaning: 'هو' },
      { zh: '她', pinyin: 'tā', meaning: 'هي' },
      { zh: '叫', pinyin: 'jiào', meaning: 'اسمه / يسمى' },
      { zh: '名字', pinyin: 'míngzi', meaning: 'اسم' },
      { zh: '什么', pinyin: 'shénme', meaning: 'ماذا' },
      { zh: '认识', pinyin: 'rènshi', meaning: 'يعرف' },
    ],
    sentences: [
      { zh: '我叫李明。', pinyin: 'Wǒ jiào Lǐ Míng.', ar: 'اسمي لي مينغ.' },
      { zh: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', ar: 'ما اسمك؟' },
      { zh: '他是谁？', pinyin: 'Tā shì shéi?', ar: 'من هو؟' },
      { zh: '很高兴认识你。', pinyin: 'Hěn gāoxìng rènshi nǐ.', ar: 'سعيد بمعرفتك.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '你好，我叫李明。你叫什么名字？', pinyin: 'Nǐ hǎo, wǒ jiào Lǐ Míng. Nǐ jiào shénme míngzi?', arabic: 'مرحباً، اسمي لي مينغ. ما اسمك؟' },
      { speaker: 'B', name: 'سارة', hanzi: '我叫萨拉。你是哪国人？', pinyin: 'Wǒ jiào Sàlā. Nǐ shì nǎ guó rén?', arabic: 'اسمي سارة. من أي بلد أنت؟' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '我是中国人。你呢？', pinyin: 'Wǒ shì Zhōngguó rén. Nǐ ne?', arabic: 'أنا صيني. وأنت؟' },
      { speaker: 'B', name: 'سارة', hanzi: '我是埃及人。很高兴认识你。', pinyin: 'Wǒ shì Āijí rén. Hěn gāoxìng rènshi nǐ.', arabic: 'أنا مصرية. سعيدة بمعرفتك.' },
    ],
    grammar: [
      { title: 'صيغة التعريف بالنفس', description: '我叫 + الاسم', pattern: '我叫 + [الاسم]', example: '我叫李明。', exampleAr: 'اسمي لي مينغ.' },
      { title: 'سؤال عن الاسم', description: '你叫什么名字؟', pattern: '你叫什么名字？', example: '请问你叫什么名字？', exampleAr: 'ما اسمك من فضلك؟' },
    ],
    exerciseQuestions: [
      { zh: 'ما معنى 我؟', options: ['أنت', 'هو', 'أنا', 'هي'], correct: 2 },
      { zh: 'كيف تسأل عن اسم شخص؟', options: ['你叫什么名字？', '你好吗？', '你是谁？', '你在哪儿？'], correct: 0 },
      { zh: '叫 تعني:', options: ['يسمى', 'يعرف', 'يأتي', 'يذهب'], correct: 0 },
      { zh: '他是谁؟ تعني:', options: ['ما اسمه؟', 'من هو؟', 'كيف حاله؟', 'أين هو؟'], correct: 1 },
    ],
  },
  {
    id: 3, titleAr: 'العائلة والأصدقاء', titleZh: '家庭与朋友',
    words: [
      { zh: '爸爸', pinyin: 'bàba', meaning: 'أب' },
      { zh: '妈妈', pinyin: 'māma', meaning: 'أم' },
      { zh: '哥哥', pinyin: 'gēge', meaning: 'أخ أكبر' },
      { zh: '姐姐', pinyin: 'jiějie', meaning: 'أخت كبرى' },
      { zh: '弟弟', pinyin: 'dìdi', meaning: 'أخ أصغر' },
      { zh: '妹妹', pinyin: 'mèimei', meaning: 'أخت صغرى' },
      { zh: '朋友', pinyin: 'péngyou', meaning: 'صديق' },
      { zh: '家', pinyin: 'jiā', meaning: 'بيت / عائلة' },
    ],
    sentences: [
      { zh: '这是我的爸爸。', pinyin: 'Zhè shì wǒ de bàba.', ar: 'هذا أبي.' },
      { zh: '我有一个哥哥。', pinyin: 'Wǒ yǒu yí gè gēge.', ar: 'لدي أخ أكبر.' },
      { zh: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyou.', ar: 'هو صديقي.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', arabic: 'كم عدد أفراد عائلتك؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我家有三口人。爸爸、妈妈和我。', pinyin: 'Wǒ jiā yǒu sān kǒu rén. Bàba, māma hé wǒ.', arabic: 'عائلتي من ثلاثة أشخاص. أبي وأمي وأنا.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '你有兄弟姐妹吗？', pinyin: 'Nǐ yǒu xiōngdì jiěmèi ma?', arabic: 'هل لديك إخوة وأخوات؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我没有兄弟姐妹。', pinyin: 'Wǒ méiyǒu xiōngdì jiěmèi.', arabic: 'ليس لدي إخوة وأخوات.' },
    ],
    grammar: [
      { title: 'التعبير عن الملكية', description: '我有的استخدام', pattern: '我/你/他 + 有 + عدد + كائن', example: '我有一个哥哥。', exampleAr: 'لدي أخ أكبر.' },
      { title: 'سؤال عن العائلة', description: '你家有几口人؟', pattern: '你家有几口人？', example: '你家有几个人？', exampleAr: 'كم فرداً في عائلتك؟' },
    ],
    exerciseQuestions: [
      { zh: 'ما معنى 爸爸؟', options: ['أم', 'أخ', 'أب', 'صديق'], correct: 2 },
      { zh: 'ما معنى 朋友؟', options: ['عائلة', 'صديق', 'معلم', 'جار'], correct: 1 },
      { zh: '我家有三口人. تعني:', options: ['بيتي كبير', 'عائلتي من 3 أشخاص', 'بيتي من 3 طوابق', 'عندي 3 بيوت'], correct: 1 },
    ],
  },
  {
    id: 4, titleAr: 'الأرقام والعدّ', titleZh: '数字',
    words: [
      { zh: '一', pinyin: 'yī', meaning: 'واحد' },
      { zh: '二', pinyin: 'èr', meaning: 'اثنان' },
      { zh: '三', pinyin: 'sān', meaning: 'ثلاثة' },
      { zh: '四', pinyin: 'sì', meaning: 'أربعة' },
      { zh: '五', pinyin: 'wǔ', meaning: 'خمسة' },
      { zh: '六', pinyin: 'liù', meaning: 'ستة' },
      { zh: '七', pinyin: 'qī', meaning: 'سبعة' },
      { zh: '八', pinyin: 'bā', meaning: 'ثمانية' },
    ],
    sentences: [
      { zh: '我有一本书。', pinyin: 'Wǒ yǒu yì běn shū.', ar: 'لدي كتاب واحد.' },
      { zh: '我们班有二十个学生。', pinyin: 'Wǒmen bān yǒu èrshí gè xuéshēng.', ar: 'فصلنا فيه عشرون طالباً.' },
      { zh: '三个苹果五块钱。', pinyin: 'Sān gè píngguǒ wǔ kuài qián.', ar: 'ثلاث تفاحات بخمسة يوانات.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '这个多少钱？', pinyin: 'Zhège duōshao qián?', arabic: 'بكم هذا؟' },
      { speaker: 'B', name: 'البائع', hanzi: '五个苹果十块钱。', pinyin: 'Wǔ gè píngguǒ shí kuài qián.', arabic: 'خمس تفاحات بعشرة يوانات.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '好的，我要五个。', pinyin: 'Hǎo de, wǒ yào wǔ gè.', arabic: 'حسناً، أريد خمس.' },
    ],
    grammar: [
      { title: 'الأرقام 1-10', description: 'الأساس', pattern: '一二三四五六七八九十', example: '三 + 个 + 人', exampleAr: 'ثلاثة أشخاص' },
      { title: 'كم سعر؟', description: '多少', pattern: '这个多少钱？', example: '这个多少钱？一共二十块。', exampleAr: 'بكم هذا؟ المجموع عشرون يواناً.' },
    ],
    exerciseQuestions: [
      { zh: 'ما معنى 三؟', options: ['واحد', 'اثنان', 'ثلاثة', 'أربعة'], correct: 2 },
      { zh: 'كيف تقول 8 بالصينية؟', options: ['七', '八', '九', '六'], correct: 1 },
      { zh: '多少钱؟ تعني:', options: ['كم عدداً', 'كم عمراً', 'كم سعراً', 'كم وقتاً'], correct: 2 },
    ],
  },
  {
    id: 5, titleAr: 'الوقت والتواريخ', titleZh: '时间与日期',
    words: [
      { zh: '今天', pinyin: 'jīntiān', meaning: 'اليوم' },
      { zh: '明天', pinyin: 'míngtiān', meaning: 'غداً' },
      { zh: '昨天', pinyin: 'zuótiān', meaning: 'أمس' },
      { zh: '早上', pinyin: 'zǎoshang', meaning: 'صباحاً' },
      { zh: '中午', pinyin: 'zhōngwǔ', meaning: 'ظهراً' },
      { zh: '下午', pinyin: 'xiàwǔ', meaning: 'بعد الظهر' },
      { zh: '晚上', pinyin: 'wǎnshang', meaning: 'مساءً' },
      { zh: '现在', pinyin: 'xiànzài', meaning: 'الآن' },
    ],
    sentences: [
      { zh: '今天几号？', pinyin: 'Jīntiān jǐ hào?', ar: 'اليوم كم رقمه؟' },
      { zh: '现在是八点。', pinyin: 'Xiànzài shì bā diǎn.', ar: 'الآن الساعة الثامنة.' },
      { zh: '我早上七点起床。', pinyin: 'Wǒ zǎoshang qī diǎn qǐchuáng.', ar: 'أستيقظ الساعة سبعة صباحاً.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '请问现在几点？', pinyin: 'Qǐngwèn xiànzài jǐ diǎn?', arabic: 'الساعة كم الآن؟' },
      { speaker: 'B', name: 'شخص عابر', hanzi: '现在是下午三点。', pinyin: 'Xiànzài shì xiàwǔ sān diǎn.', arabic: 'الآن الثالثة بعد الظهر.' },
    ],
    grammar: [
      { title: 'التعبير عن الوقت', description: 'الساعة + رقم + 点', pattern: '现在 + 是 + [رقم] + 点', example: '现在是三点。', exampleAr: 'الآن الساعة الثالثة.' },
    ],
    exerciseQuestions: [
      { zh: 'ما معنى 今天؟', options: ['أمس', 'غداً', 'اليوم', 'الآن'], correct: 2 },
      { zh: '早上 تعني:', options: ['مساءً', 'ظهراً', 'بعد الظهر', 'صباحاً'], correct: 3 },
    ],
  },
  {
    id: 6, titleAr: 'الطعام والشراب', titleZh: '饮食',
    words: [
      { zh: '吃', pinyin: 'chī', meaning: 'يأكل' },
      { zh: '喝', pinyin: 'hē', meaning: 'يشرب' },
      { zh: '米饭', pinyin: 'mǐfàn', meaning: 'أرز' },
      { zh: '水', pinyin: 'shuǐ', meaning: 'ماء' },
      { zh: '茶', pinyin: 'chá', meaning: 'شاي' },
      { zh: '咖啡', pinyin: 'kāfēi', meaning: 'قهوة' },
      { zh: '面条', pinyin: 'miàntiáo', meaning: 'نودلز' },
      { zh: '饺子', pinyin: 'jiǎozi', meaning: 'زلابية' },
    ],
    sentences: [
      { zh: '你想吃什么？', pinyin: 'Nǐ xiǎng chī shénme?', ar: 'ماذا تريد أن تأكل؟' },
      { zh: '我要一碗面条。', pinyin: 'Wǒ yào yì wǎn miàntiáo.', ar: 'أريد طبق نودلز.' },
      { zh: '我喝一杯茶。', pinyin: 'Wǒ hē yì bēi chá.', ar: 'أشرب كوب شاي.' },
    ],
    conversation: [
      { speaker: 'A', name: 'النادل', hanzi: '你好，请问你要吃什么？', pinyin: 'Nǐ hǎo, qǐngwèn nǐ yào chī shénme?', arabic: 'مرحباً، ماذا تريد أن تأكل؟' },
      { speaker: 'B', name: 'لي مينغ', hanzi: '我要一碗面条和一杯茶。', pinyin: 'Wǒ yào yì wǎn miàntiáo hé yì bēi chá.', arabic: 'أريد طبق نودلز وكوب شاي.' },
      { speaker: 'A', name: 'النادل', hanzi: '好的，请稍等。', pinyin: 'Hǎo de, qǐng shāo děng.', arabic: 'حسناً، انتظر قليلاً.' },
    ],
    grammar: [
      { title: 'التعبير عن الرغبة', description: '我要', pattern: '我要 + [كائن]', example: '我要一碗面条。', exampleAr: 'أريد طبق نودلز.' },
    ],
    exerciseQuestions: [
      { zh: 'ما معنى 吃؟', options: ['يشرب', 'يطبخ', 'يأكل', 'يشتري'], correct: 2 },
      { zh: '米饭 تعني:', options: ['خبز', 'أرز', 'نودلز', 'حساء'], correct: 1 },
      { zh: '茶 تعني:', options: ['ماء', 'حليب', 'قهوة', 'شاي'], correct: 3 },
    ],
  },
  {
    id: 7, titleAr: 'هاتفك المحمول وبيتك', titleZh: '你的手机号是多少？',
    words: [
      { zh: '手机', pinyin: 'shǒujī', meaning: 'هاتف محمول' },
      { zh: '号', pinyin: 'hào', meaning: 'رقم' },
      { zh: '电脑', pinyin: 'diànnǎo', meaning: 'حاسوب' },
      { zh: '多少', pinyin: 'duōshao', meaning: 'كم (للأسعار والأرقام)' },
      { zh: '钱', pinyin: 'qián', meaning: 'مال / نقود' },
      { zh: '块', pinyin: 'kuài', meaning: 'يوان (عملة)' },
      { zh: '很', pinyin: 'hěn', meaning: 'جداً' },
      { zh: '太', pinyin: 'tài', meaning: 'أكثر من اللازم' },
      { zh: '大', pinyin: 'dà', meaning: 'كبير' },
      { zh: '小', pinyin: 'xiǎo', meaning: 'صغير' },
      { zh: '多', pinyin: 'duō', meaning: 'كثير' },
      { zh: '少', pinyin: 'shǎo', meaning: 'قليل' },
      { zh: '高', pinyin: 'gāo', meaning: 'طويل / عالٍ' },
      { zh: '好看', pinyin: 'hǎokàn', meaning: 'جميل' },
      { zh: '便宜', pinyin: 'piányí', meaning: 'رخيص' },
      { zh: '贵', pinyin: 'guì', meaning: 'غالٍ' },
      { zh: '别', pinyin: 'bié', meaning: 'لا تفعل' },
      { zh: '长', pinyin: 'cháng', meaning: 'طويل' },
      { zh: '短', pinyin: 'duǎn', meaning: 'قصير' },
      { zh: '新', pinyin: 'xīn', meaning: 'جديد' },
      { zh: '旧', pinyin: 'jiù', meaning: 'قديم' },
      { zh: '合适', pinyin: 'héshì', meaning: 'مناسب' },
    ],
    sentences: [
      { zh: '你的手机号是多少？', pinyin: 'Nǐ de shǒujī hào shì duōshao?', ar: 'ما رقم هاتفك المحمول؟' },
      { zh: '这个手机多少钱？', pinyin: 'Zhège shǒujī duōshao qián?', ar: 'بكم هذا الهاتف المحمول؟' },
      { zh: '太贵了！', pinyin: 'Tài guì le!', ar: 'غالٍ جداً!' },
      { zh: '这个很便宜。', pinyin: 'Zhège hěn piányí.', ar: 'هذا رخيص جداً.' },
      { zh: '我的电脑是新的。', pinyin: 'Wǒ de diànnǎo shì xīn de.', ar: 'حاسوبي جديد.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '请问，你的手机号是多少？', pinyin: 'Qǐngwèn, nǐ de shǒujī hào shì duōshao?', arabic: 'من فضلك، ما رقم هاتفك المحمول؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我的手机号是一三八零零一二三四五六。', pinyin: 'Wǒ de shǒujī hào shì yī sān bā líng líng yī èr sān sì wǔ liù.', arabic: 'رقم هاتفي هو 138-0012-3456.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '谢谢！你的电脑多少钱？', pinyin: 'Xièxie! Nǐ de diànnǎo duōshao qián?', arabic: 'شكراً! بكم حاسوبك؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '五千块。', pinyin: 'Wǔqiān kuài.', arabic: 'خمسة آلاف يوان.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '太贵了！我要便宜的。', pinyin: 'Tài guì le! Wǒ yào piányí de.', arabic: 'غالٍ جداً! أريد أرخص.' },
    ],
    grammar: [
      { title: 'سؤال عن رقم الهاتف', description: '手机号是多少؟', pattern: '手机号 + 是 + 多少？', example: '你的手机号是多少？', exampleAr: 'ما رقم هاتفك؟' },
      { title: 'أسلوب التفضيل', description: '形容词 + 的 + اسم', pattern: '我 + 要 + صفة + 的 + اسم', example: '我要便宜的。', exampleAr: 'أريد الرخيص.' },
    ],
    exerciseQuestions: [
      { zh: '手机号是多少？ سؤال عن:', options: ['الاسم', 'رقم الهاتف', 'العمر', 'العنوان'], correct: 1 },
      { zh: '太贵了 تعني:', options: ['رخيص جداً', 'غالٍ جداً', 'معقول', 'جديد'], correct: 1 },
      { zh: '便宜 تعني:', options: ['غالٍ', 'كبير', 'رخيص', 'قديم'], correct: 2 },
      { zh: '多少 تستخدم مع:', options: ['الأشخاص', 'الأوقات', 'الأرقام والأسعار', 'الأماكن'], correct: 2 },
      { zh: '手机 تعني:', options: ['حاسوب', 'هاتف محمول', 'تلفزيون', 'تابلت'], correct: 1 },
    ],
  },
  {
    id: 8, titleAr: 'مواعيد العمل والدراسة', titleZh: '我晚上六点半下班',
    words: [
      { zh: '上班', pinyin: 'shàngbān', meaning: 'يذهب للعمل' },
      { zh: '下班', pinyin: 'xiàbān', meaning: 'ينهي العمل' },
      { zh: '开始', pinyin: 'kāishǐ', meaning: 'يبدأ' },
      { zh: '已经', pinyin: 'yǐjīng', meaning: 'بالفعل' },
      { zh: '一半', pinyin: 'yíbàn', meaning: 'نصف' },
      { zh: '点', pinyin: 'diǎn', meaning: 'ساعة (في الوقت)' },
      { zh: '分', pinyin: 'fēn', meaning: 'دقيقة' },
      { zh: '半', pinyin: 'bàn', meaning: 'نصف' },
      { zh: '早上', pinyin: 'zǎoshang', meaning: 'صباحاً' },
      { zh: '中午', pinyin: 'zhōngwǔ', meaning: 'ظهراً' },
      { zh: '下午', pinyin: 'xiàwǔ', meaning: 'بعد الظهر' },
      { zh: '晚上', pinyin: 'wǎnshang', meaning: 'مساءً' },
      { zh: '分钟', pinyin: 'fēnzhōng', meaning: 'دقيقة' },
      { zh: '小时', pinyin: 'xiǎoshí', meaning: 'ساعة (وحدة زمن)' },
      { zh: '课', pinyin: 'kè', meaning: 'درس / حصة' },
      { zh: '教室', pinyin: 'jiàoshì', meaning: 'فصل دراسي' },
      { zh: '休息', pinyin: 'xiūxi', meaning: 'يستريح' },
      { zh: '忙', pinyin: 'máng', meaning: 'مشغول' },
      { zh: '早', pinyin: 'zǎo', meaning: 'مبكر' },
      { zh: '晚', pinyin: 'wǎn', meaning: 'متأخر' },
      { zh: '刚才', pinyin: 'gāngcái', meaning: 'للتوّ' },
      { zh: '经常', pinyin: 'jīngcháng', meaning: 'غالباً' },
    ],
    sentences: [
      { zh: '我晚上六点半下班。', pinyin: 'Wǒ wǎnshang liù diǎn bàn xiàbān.', ar: 'أنهي العمل الساعة ستة ونصف مساءً.' },
      { zh: '他每天早上八点上班。', pinyin: 'Tā měitiān zǎoshang bā diǎn shàngbān.', ar: 'يذهب للعمل كل يوم الساعة الثامنة صباحاً.' },
      { zh: '现在几点了？已经十点半了。', pinyin: 'Xiànzài jǐ diǎn le? Yǐjīng shí diǎn bàn le.', ar: 'الساعة كم الآن؟ عشر ونصف بالفعل.' },
      { zh: '我休息十分钟。', pinyin: 'Wǒ xiūxi shí fēnzhōng.', ar: 'أستريح عشر دقائق.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '你现在忙吗？', pinyin: 'Nǐ xiànzài máng ma?', arabic: 'هل أنت مشغول الآن؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '不忙。我已经下班了。', pinyin: 'Bù máng. Wǒ yǐjīng xiàbān le.', arabic: 'لا، لست مشغولة. أنهيت العمل بالفعل.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '你几点下班？', pinyin: 'Nǐ jǐ diǎn xiàbān?', arabic: 'كم تنهي العمل؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我晚上六点半下班。', pinyin: 'Wǒ wǎnshang liù diǎn bàn xiàbān.', arabic: 'أنهي العمل الساعة ستة ونصف مساءً.' },
    ],
    grammar: [
      { title: 'التعبير عن الوقت', description: 'الساعة + رقم + 点 (+ نصف = 半)', pattern: '现在 + 是 + [ساعة] + 点', example: '现在是六点半。', exampleAr: 'الآن الساعة ستة ونصف.' },
      { title: 'التعبير عن العمل والراحة', description: '上班 / 下班 / 休息', pattern: '我 + [وقت] + 上班/下班', example: '我早上八点上班。', exampleAr: 'أذهب للعمل الساعة الثامنة صباحاً.' },
    ],
    exerciseQuestions: [
      { zh: '下班 تعني:', options: ['يذهب للعمل', 'ينهي العمل', 'يستريح', 'ينام'], correct: 1 },
      { zh: '六点半 تعني:', options: ['6:00', '6:15', '6:30', '6:45'], correct: 2 },
      { zh: '已经 تعني:', options: ['لا يزال', 'بالفعل', 'سابقاً', 'لاحقاً'], correct: 1 },
      { zh: '休息 تعني:', options: ['يعمل', 'يستريح', 'يأكل', 'ينام'], correct: 1 },
      { zh: '分钟 تعني:', options: ['ساعة', 'يوم', 'دقيقة', 'ثانية'], correct: 2 },
    ],
  },
  {
    id: 9, titleAr: 'العمل في المستشفى', titleZh: '我爸爸也在医院工作',
    words: [
      { zh: '医院', pinyin: 'yīyuàn', meaning: 'مستشفى' },
      { zh: '也', pinyin: 'yě', meaning: 'أيضاً' },
      { zh: '都', pinyin: 'dōu', meaning: 'كل / جميع' },
      { zh: '做', pinyin: 'zuò', meaning: 'يفعل / يعمل' },
      { zh: '医生', pinyin: 'yīshēng', meaning: 'طبيب' },
      { zh: '护士', pinyin: 'hùshi', meaning: 'ممرض/ة' },
      { zh: '公司', pinyin: 'gōngsī', meaning: 'شركة' },
      { zh: '银行', pinyin: 'yínháng', meaning: 'بنك' },
      { zh: '商店', pinyin: 'shāngdiàn', meaning: 'متجر' },
      { zh: '前面', pinyin: 'qiánmiàn', meaning: 'أمام' },
      { zh: '后面', pinyin: 'hòumiàn', meaning: 'خلف' },
      { zh: '左边', pinyin: 'zuǒbiān', meaning: 'يسار' },
      { zh: '右边', pinyin: 'yòubiān', meaning: 'يمين' },
      { zh: '旁边', pinyin: 'pángbiān', meaning: 'بجانب' },
      { zh: '对面', pinyin: 'duìmiàn', meaning: 'مقابل' },
      { zh: '里', pinyin: 'lǐ', meaning: 'داخل' },
      { zh: '外', pinyin: 'wài', meaning: 'خارج' },
      { zh: '上', pinyin: 'shàng', meaning: 'فوق' },
      { zh: '下', pinyin: 'xià', meaning: 'تحت' },
      { zh: '旁边', pinyin: 'pángbiān', meaning: 'بجانب' },
      { zh: '附近', pinyin: 'fùjìn', meaning: 'قريب / بالقرب' },
      { zh: '远', pinyin: 'yuǎn', meaning: 'بعيد' },
    ],
    sentences: [
      { zh: '我爸爸也在医院工作。', pinyin: 'Wǒ bàba yě zài yīyuàn gōngzuò.', ar: 'أبي أيضاً يعمل في المستشفى.' },
      { zh: '医院在学校的旁边。', pinyin: 'Yīyuàn zài xuéxiào de pángbiān.', ar: 'المستشفى بجانب المدرسة.' },
      { zh: '我们都学习中文。', pinyin: 'Wǒmen dōu xuéxí Zhōngwén.', ar: 'نحن جميعاً ندرس الصينية.' },
      { zh: '银行在左边，商店在右边。', pinyin: 'Yínháng zài zuǒbiān, shāngdiàn zài yòubiān.', ar: 'البنك على اليسار، المتجر على اليمين.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '你爸爸在哪儿工作？', pinyin: 'Nǐ bàba zài nǎr gōngzuò?', arabic: 'أين يعمل أبوك؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我爸爸在医院工作。他是医生。', pinyin: 'Wǒ bàba zài yīyuàn gōngzuò. Tā shì yīshēng.', arabic: 'أبي يعمل في المستشفى. هو طبيب.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '我妈妈也在医院工作。她是护士。', pinyin: 'Wǒ māma yě zài yīyuàn gōngzuò. Tā shì hùshi.', arabic: 'أمي أيضاً تعمل في المستشفى. هي ممرضة.' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '你爸爸你妈妈都在医院工作！', pinyin: 'Nǐ bàba nǐ māma dōu zài yīyuàn gōngzuò!', arabic: 'أبوك وأمك يعملان كلاهما في المستشفى!' },
    ],
    grammar: [
      { title: 'أيضاً = 也', description: '也 تأتي قبل الفعل', pattern: 'فاعل + 也 + فعل', example: '我也学习中文。', exampleAr: 'أنا أيضاً أدرس الصينية.' },
      { title: 'جميعاً = 都', description: '都 تأتي بعد الفاعل', pattern: 'فاعل + 都 + فعل', example: '我们都去学校。', exampleAr: 'نحن جميعاً نذهب للمدرسة.' },
      { title: 'في مكان = 在', description: 'التعبير عن الموقع', pattern: 'مكان + 在 + اسم', example: '银行在学校旁边。', exampleAr: 'البنك بجانب المدرسة.' },
    ],
    exerciseQuestions: [
      { zh: '医院 تعني:', options: ['مدرسة', 'مستشفى', 'بنك', 'شركة'], correct: 1 },
      { zh: '也 تعني:', options: ['كل', 'لا', 'أيضاً', 'لكن'], correct: 2 },
      { zh: '都 تعني:', options: ['أيضاً', 'كل / جميع', 'ليس', 'بعض'], correct: 1 },
      { zh: '医生 تعني:', options: ['ممرض', 'طبيب', 'معلم', 'شرطي'], correct: 1 },
      { zh: '左边 تعني:', options: ['فوق', 'تحت', 'يسار', 'يمين'], correct: 2 },
    ],
  },
  {
    id: 10, titleAr: 'الدراسة في المدرسة', titleZh: '我明天上午在学校学习',
    words: [
      { zh: '明天', pinyin: 'míngtiān', meaning: 'غداً' },
      { zh: '上午', pinyin: 'shàngwǔ', meaning: 'صباحاً (قبل الظهر)' },
      { zh: '学习', pinyin: 'xuéxí', meaning: 'يدرس / يتعلم' },
      { zh: '看', pinyin: 'kàn', meaning: 'يرى / يشاهد' },
      { zh: '写', pinyin: 'xiě', meaning: 'يكتب' },
      { zh: '听', pinyin: 'tīng', meaning: 'يسمع' },
      { zh: '说', pinyin: 'shuō', meaning: 'يقول / يتحدث' },
      { zh: '读', pinyin: 'dú', meaning: 'يقرأ' },
      { zh: '汉语', pinyin: 'Hànyǔ', meaning: 'اللغة الصينية' },
      { zh: '英语', pinyin: 'Yīngyǔ', meaning: 'اللغة الإنجليزية' },
      { zh: '一起', pinyin: 'yīqǐ', meaning: 'معاً' },
      { zh: '只', pinyin: 'zhǐ', meaning: 'فقط' },
      { zh: '能', pinyin: 'néng', meaning: 'يستطيع' },
      { zh: '会', pinyin: 'huì', meaning: 'يستطيع / يعرف كيف' },
      { zh: '可以', pinyin: 'kěyǐ', meaning: 'يمكن' },
      { zh: '应该', pinyin: 'yīnggāi', meaning: 'يجب أن' },
      { zh: '要', pinyin: 'yào', meaning: 'يريد / سوف' },
      { zh: '希望', pinyin: 'xīwàng', meaning: 'يأمل' },
      { zh: '觉得', pinyin: 'juéde', meaning: 'يشعر / يعتقد' },
      { zh: '难', pinyin: 'nán', meaning: 'صعب' },
      { zh: '容易', pinyin: 'róngyì', meaning: 'سهل' },
      { zh: '有意思', pinyin: 'yǒuyìsi', meaning: 'ممتع / مثير للاهتمام' },
    ],
    sentences: [
      { zh: '我明天上午在学校学习。', pinyin: 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí.', ar: 'سأدرس في المدرسة غداً صباحاً.' },
      { zh: '你会说英语吗？', pinyin: 'Nǐ huì shuō Yīngyǔ ma?', ar: 'هل تستطيع التحدث بالإنجليزية؟' },
      { zh: '我觉得汉语很难，但很有意思。', pinyin: 'Wǒ juéde Hànyǔ hěn nán, dàn hěn yǒuyìsi.', ar: 'أعتقد الصينية صعبة لكنها ممتعة.' },
      { zh: '我们明天一起去图书馆。', pinyin: 'Wǒmen míngtiān yīqǐ qù túshūguǎn.', ar: 'نذهب معاً للمكتبة غداً.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '你明天做什么？', pinyin: 'Nǐ míngtiān zuò shénme?', arabic: 'ماذا ستفعل غداً؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我明天上午在学校学习。', pinyin: 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí.', arabic: 'سأدرس في المدرسة غداً صباحاً.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '你能来吗？', pinyin: 'Nǐ néng lái ma?', arabic: 'هل تستطيع المجيء؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '可以。我们一起学习吧！', pinyin: 'Kěyǐ. Wǒmen yīqǐ xuéxí ba!', arabic: 'نعم. لندرس معاً!' },
    ],
    grammar: [
      { title: 'التعبير عن المستقبل', description: '明天 / 后天 + فعل', pattern: '我 + [وقت مستقبلي] + فعل', example: '我明天去学校。', exampleAr: 'سأذهب للمدرسة غداً.' },
      { title: 'القدرة: 能 / 会 / 可以', description: '能 = قدرة عامة، 会 = مهارة مكتسبة، 可以 = إذن', pattern: 'فاعل + 能/会/可以 + فعل', example: '我会说汉语。', exampleAr: 'أستطيع التحدث بالصينية.' },
    ],
    exerciseQuestions: [
      { zh: '明天 تعني:', options: ['اليوم', 'أمس', 'غداً', 'الآن'], correct: 2 },
      { zh: '学习 تعني:', options: ['يعمل', 'يدرس', 'يلعب', 'ينام'], correct: 1 },
      { zh: '一起 تعني:', options: ['وحيد', 'معاً', 'سريع', 'ببطء'], correct: 1 },
      { zh: '觉得 تعني:', options: ['يرى', 'يشعر / يعتقد', 'يسمع', 'يأكل'], correct: 1 },
      { zh: '难 تعني:', options: ['سهل', 'صعب', 'كبير', 'جميل'], correct: 1 },
    ],
  },
  {
    id: 11, titleAr: 'التفاح هنا رخيص!', titleZh: '这儿的苹果真便宜！',
    words: [
      { zh: '这儿', pinyin: 'zhèr', meaning: 'هنا' },
      { zh: '那儿', pinyin: 'nàr', meaning: 'هناك' },
      { zh: '苹果', pinyin: 'píngguǒ', meaning: 'تفاح' },
      { zh: '香蕉', pinyin: 'xiāngjiāo', meaning: 'موز' },
      { zh: '水果', pinyin: 'shuǐguǒ', meaning: 'فواكه' },
      { zh: '买', pinyin: 'mǎi', meaning: 'يشتري' },
      { zh: '卖', pinyin: 'mài', meaning: 'يبيع' },
      { zh: '种', pinyin: 'zhǒng', meaning: 'نوع / يزرع' },
      { zh: '斤', pinyin: 'jīn', meaning: 'رطل (500 غرام)' },
      { zh: '个', pinyin: 'gè', meaning: 'عدد عام' },
      { zh: '本', pinyin: 'běn', meaning: 'عداد للكتب' },
      { zh: '瓶', pinyin: 'píng', meaning: 'عداد للزجاجات' },
      { zh: '杯', pinyin: 'bēi', meaning: 'عداد للأكواب' },
      { zh: '碗', pinyin: 'wǎn', meaning: 'عداد للأطباق' },
      { zh: '最好', pinyin: 'zuì hǎo', meaning: 'الأفضل' },
      { zh: '特别', pinyin: 'tèbié', meaning: 'خاصة / بشكل خاص' },
      { zh: '真', pinyin: 'zhēn', meaning: 'حقاً / فعلاً' },
      { zh: '一些', pinyin: 'yìxiē', meaning: 'بعض / قليلاً' },
      { zh: '别人', pinyin: 'biérén', meaning: 'الآخرون' },
      { zh: '大家', pinyin: 'dàjiā', meaning: 'الجميع' },
      { zh: '因为', pinyin: 'yīnwèi', meaning: 'لأن' },
      { zh: '所以', pinyin: 'suǒyǐ', meaning: 'لذلك' },
    ],
    sentences: [
      { zh: '这儿的苹果真便宜！', pinyin: 'Zhèr de píngguǒ zhēn piányí!', ar: 'التفاح هنا رخيص فعلاً!' },
      { zh: '我要买两斤苹果。', pinyin: 'Wǒ yào mǎi liǎng jīn píngguǒ.', ar: 'أريد شراء رطلين من التفاح.' },
      { zh: '哪种水果最好吃？', pinyin: 'Nǎ zhǒng shuǐguǒ zuì hǎochī?', ar: 'أي نوع من الفواكه ألذ؟' },
      { zh: '因为下雨，所以我没去。', pinyin: 'Yīnwèi xiàyǔ, suǒyǐ wǒ méi qù.', ar: 'لأنها تمطر، لم أذهب.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '这儿的苹果真便宜！', pinyin: 'Zhèr de píngguǒ zhēn piányí!', arabic: 'التفاح هنا رخيص فعلاً!' },
      { speaker: 'B', name: 'البائعة', hanzi: '是啊，三块钱一斤。', pinyin: 'Shì a, sān kuài qián yì jīn.', arabic: 'نعم، ثلاثة يوانات للرطل.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '我要两斤苹果和一斤香蕉。', pinyin: 'Wǒ yào liǎng jīn píngguǒ hé yì jīn xiāngjiāo.', arabic: 'أريد رطلين تفاح ورطلاً موز.' },
      { speaker: 'B', name: 'البائعة', hanzi: '一共十二块。', pinyin: 'Yīgòng shíèr kuài.', arabic: 'المجموع اثنا عشر يواناً.' },
    ],
    grammar: [
      { title: 'العدادات (量词)', description: 'كل اسم له عدد محدد', pattern: 'عدد + عداد + اسم', example: '两斤苹果 / 一本书', exampleAr: 'رطلان تفاح / كتاب واحد' },
      { title: 'العلة والنتيجة', description: 'لأن... لذلك...', pattern: '因为 + جملة，所以 + جملة', example: '因为下雨，所以我没去。', exampleAr: 'لأنها تمطر، لم أذهب.' },
    ],
    exerciseQuestions: [
      { zh: '这儿的苹果真便宜！这儿 تعني:', options: ['هناك', 'هنا', 'أين', 'كل مكان'], correct: 1 },
      { zh: '两斤 تعني:', options: ['كيلو واحد', 'كيلو', 'رطلان', 'ثلاثة أرطال'], correct: 2 },
      { zh: '因为...所以...', options: ['بسبب فقط', 'علة ونتيجة', 'سؤال', 'نفي'], correct: 1 },
      { zh: '买 تعني:', options: ['يبيع', 'يشتري', 'يعطي', 'يأخذ'], correct: 1 },
      { zh: '水果 تعني:', options: ['خضروات', 'لحوم', 'فواكه', 'حلويات'], correct: 2 },
    ],
  },
  {
    id: 12, titleAr: 'أدرس في الجامعة', titleZh: '我读大学呢',
    words: [
      { zh: '大学', pinyin: 'dàxué', meaning: 'جامعة' },
      { zh: '呢', pinyin: 'ne', meaning: 'حرف تنبيه استفهامي' },
      { zh: '怎么', pinyin: 'zěnme', meaning: 'كيف' },
      { zh: '为什么', pinyin: 'wèishénme', meaning: 'لماذا' },
      { zh: '什么时候', pinyin: 'shénme shíhou', meaning: 'متى' },
      { zh: '哪儿', pinyin: 'nǎr', meaning: 'أين' },
      { zh: '怎么样', pinyin: 'zěnmeyàng', meaning: 'كيف حالك؟ / كيف؟' },
      { zh: '比较', pinyin: 'bǐjiào', meaning: 'نسبياً / بالمقارنة' },
      { zh: '最', pinyin: 'zuì', meaning: 'الأكثر / الأفضل' },
      { zh: '还', pinyin: 'hái', meaning: 'لا يزال / بعد ذلك' },
      { zh: '没', pinyin: 'méi', meaning: 'لم (نفي الماضي)' },
      { zh: '正在', pinyin: 'zhèngzài', meaning: 'في طور الآن' },
      { zh: '过', pinyin: 'guò', meaning: 'تجربة في الماضي' },
      { zh: '了', pinyin: 'le', meaning: 'التغيير / اكتمال الفعل' },
      { zh: '吧', pinyin: 'ba', meaning: 'حرف اقتراح' },
      { zh: '啊', pinyin: 'a', meaning: 'حرف تعجب' },
      { zh: '呢', pinyin: 'ne', meaning: 'تنبيه' },
      { zh: '准备', pinyin: 'zhǔnbèi', meaning: 'يستعد' },
      { zh: '考试', pinyin: 'kǎoshì', meaning: 'امتحان' },
      { zh: '成绩', pinyin: 'chéngjì', meaning: 'درجة / نتيجة' },
      { zh: '毕业', pinyin: 'bìyè', meaning: 'يتخرج' },
      { zh: '专业', pinyin: 'zhuānyè', meaning: 'تخصص' },
    ],
    sentences: [
      { zh: '我读大学呢。', pinyin: 'Wǒ dú dàxué ne.', ar: 'أنا أدرس في الجامعة.' },
      { zh: '你怎么去学校？', pinyin: 'Nǐ zěnme qù xuéxiào?', ar: 'كيف تذهب للمدرسة؟' },
      { zh: '他正在做什么？', pinyin: 'Tā zhèngzài zuò shénme?', ar: 'ماذا يفعل الآن؟' },
      { zh: '你学什么专业？', pinyin: 'Nǐ xué shénme zhuānyè?', ar: 'ما تخصصك؟' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '你现在做什么？', pinyin: 'Nǐ xiànzài zuò shénme?', arabic: 'ماذا تفعل الآن؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我读大学呢。我学中文专业。', pinyin: 'Wǒ dú dàxué ne. Wǒ xué Zhōngwén zhuānyè.', arabic: 'أنا أدرس في الجامعة. تخصصي اللغة الصينية.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '中文难吗？', pinyin: 'Zhōngwén nán ma?', arabic: 'هل الصينية صعبة؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '比较难，但是很有意思。', pinyin: 'Bǐjiào nán, dànshì hěn yǒuyìsi.', arabic: 'صعبة نسبياً، لكنها ممتعة جداً.' },
    ],
    grammar: [
      { title: 'السؤال بكيف: 怎么', description: 'للسؤال عن الطريقة', pattern: '怎么 + فعل', example: '你怎么去学校？', exampleAr: 'كيف تذهب للمدرسة؟' },
      { title: '正在: الفعل المستمر', description: 'يعبر عن فعل يجري الآن', pattern: '正在 + فعل + 呢', example: '他正在学习。', exampleAr: 'هو يدرس الآن.' },
    ],
    exerciseQuestions: [
      { zh: '大学 تعني:', options: ['مدرسة', 'جامعة', 'مكتبة', 'معمل'], correct: 1 },
      { zh: '怎么 تعني:', options: ['أين', 'متى', 'كيف', 'ماذا'], correct: 2 },
      { zh: '正在 تعني:', options: ['كان', 'سيكون', 'في طور الآن', 'عادةً'], correct: 2 },
      { zh: '专业 تعني:', options: ['وظيفة', 'تخصص', 'مهارة', 'لغة'], correct: 1 },
      { zh: '呢 في نهاية الجملة تعبر عن:', options: ['نفي', 'تأكيد', 'تنبيه / استمرار', 'سؤال'], correct: 2 },
    ],
  },
  {
    id: 13, titleAr: 'أمس نزل الثلج', titleZh: '昨天下雪了',
    words: [
      { zh: '昨天', pinyin: 'zuótiān', meaning: 'أمس' },
      { zh: '下雪', pinyin: 'xià xuě', meaning: 'ينزل الثلج' },
      { zh: '下雨', pinyin: 'xià yǔ', meaning: 'تمطر' },
      { zh: '天气', pinyin: 'tiānqì', meaning: 'طقس' },
      { zh: '冷', pinyin: 'lěng', meaning: 'بارد' },
      { zh: '热', pinyin: 'rè', meaning: 'حار' },
      { zh: '温度', pinyin: 'wēndù', meaning: 'درجة حرارة' },
      { zh: '度', pinyin: 'dù', meaning: 'درجة' },
      { zh: '春天', pinyin: 'chūntiān', meaning: 'الربيع' },
      { zh: '夏天', pinyin: 'xiàtiān', meaning: 'الصيف' },
      { zh: '秋天', pinyin: 'qiūtiān', meaning: 'الخريف' },
      { zh: '冬天', pinyin: 'dōngtiān', meaning: 'الشتاء' },
      { zh: '风', pinyin: 'fēng', meaning: 'ريح' },
      { zh: '不', pinyin: 'bú', meaning: 'لا (نفي الحاضر)' },
      { zh: '没', pinyin: 'méi', meaning: 'لم (نفي الماضي)' },
      { zh: '穿', pinyin: 'chuān', meaning: 'يرتدي' },
      { zh: '衣服', pinyin: 'yīfu', meaning: 'ملابس' },
      { zh: '带', pinyin: 'dài', meaning: 'يحمل / يأخذ معه' },
      { zh: '雨伞', pinyin: 'yǔsǎn', meaning: 'مظلة' },
      { zh: '感冒', pinyin: 'gǎnmào', meaning: 'زكام' },
      { zh: '不舒服', pinyin: 'bù shūfu', meaning: 'غير مرتاح' },
      { zh: '头疼', pinyin: 'tóu téng', meaning: 'صداع' },
    ],
    sentences: [
      { zh: '昨天下雪了。', pinyin: 'Zuótiān xià xuě le.', ar: 'أمس نزل الثلج.' },
      { zh: '今天天气很冷。', pinyin: 'Jīntiān tiānqì hěn lěng.', ar: 'الطقس اليوم بارد جداً.' },
      { zh: '我感冒了，头疼。', pinyin: 'Wǒ gǎnmào le, tóu téng.', ar: 'أنا مصاب بالزكام، عندي صداع.' },
      { zh: '你应该多穿衣服。', pinyin: 'Nǐ yīnggāi duō chuān yīfu.', ar: 'يجب أن ترتدي ملابس أكثر.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '今天天气怎么样？', pinyin: 'Jīntiān tiānqì zěnmeyàng?', arabic: 'كيف الطقس اليوم؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '很冷。昨天下雪了。', pinyin: 'Hěn lěng. Zuótiān xià xuě le.', arabic: 'بارد جداً. أمس نزل الثلج.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '我不舒服，我感冒了。', pinyin: 'Wǒ bù shūfu, wǒ gǎnmào le.', arabic: 'أنا لست مرتاحاً، عندي زكام.' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '你应该去医院。', pinyin: 'Nǐ yīnggāi qù yīyuàn.', arabic: 'يجب أن تذهب للمستشفى.' },
    ],
    grammar: [
      { title: 'نفي الماضي: 没(有)', description: '没 + فعل يعبر عن نفي في الماضي', pattern: '没 + فعل + 了', example: '昨天没下雨。', exampleAr: 'لم تمطر أمس.' },
      { title: 'التعبير عن المرض', description: '不舒服 / 感冒 / 疼', pattern: '我 +不舒服 / 感冒了', example: '我头疼。', exampleAr: 'عندي صداع.' },
    ],
    exerciseQuestions: [
      { zh: '昨天 تعني:', options: ['اليوم', 'غداً', 'أمس', 'الآن'], correct: 2 },
      { zh: '下雪 تعني:', options: ['تمطر', 'يشرق الشمس', 'ينزل الثلج', 'تكون غائمة'], correct: 2 },
      { zh: '不舒服 تعني:', options: ['سعيد', 'متعب', 'غير مرتاح', 'جائع'], correct: 2 },
      { zh: '感冒 تعني:', options: ['حمى', 'زكام', 'صداع', 'ألم'], correct: 1 },
      { zh: '没 + فعل يعبر عن:', options: ['نفي الحاضر', 'نفي الماضي', 'أمر', 'اقتراح'], correct: 1 },
    ],
  },
  {
    id: 14, titleAr: 'شاي من فضلك', titleZh: '请给我一杯茶',
    words: [
      { zh: '给', pinyin: 'gěi', meaning: 'يعطي' },
      { zh: '杯', pinyin: 'bēi', meaning: 'كوب (عداد)' },
      { zh: '瓶', pinyin: 'píng', meaning: 'زجاجة (عداد)' },
      { zh: '张', pinyin: 'zhāng', meaning: 'ورقة / تذكرة (عداد)' },
      { zh: '把', pinyin: 'bǎ', meaning: 'أداة حصر' },
      { zh: '让', pinyin: 'ràng', meaning: 'يدع / يسمح' },
      { zh: '帮', pinyin: 'bāng', meaning: 'يساعد' },
      { zh: '告诉', pinyin: 'gàosu', meaning: 'يخبر' },
      { zh: '请', pinyin: 'qǐng', meaning: 'من فضلك / يرجى' },
      { zh: '一下', pinyin: 'yíxià', meaning: 'قليلاً / للحظة' },
      { zh: '慢', pinyin: 'màn', meaning: 'بطيء' },
      { zh: '快', pinyin: 'kuài', meaning: 'سريع' },
      { zh: '等', pinyin: 'děng', meaning: 'ينتظر' },
      { zh: '分钟', pinyin: 'fēnzhōng', meaning: 'دقيقة' },
      { zh: '电影', pinyin: 'diànyǐng', meaning: 'فيلم / سينما' },
      { zh: '电视', pinyin: 'diànshì', meaning: 'تلفزيون' },
      { zh: '音乐', pinyin: 'yīnyuè', meaning: 'موسيقى' },
      { zh: '运动', pinyin: 'yùndòng', meaning: 'رياضة / حركة' },
      { zh: '跑', pinyin: 'pǎo', meaning: 'يركض' },
      { zh: '游泳', pinyin: 'yóuyǒng', meaning: 'السباحة' },
      { zh: '喜欢', pinyin: 'xǐhuan', meaning: 'يحب' },
      { zh: '爱', pinyin: 'ài', meaning: 'يحب (عميق)' },
      { zh: '认识', pinyin: 'rènshi', meaning: 'يعرف / يتعرف على' },
    ],
    sentences: [
      { zh: '请给我一杯茶。', pinyin: 'Qǐng gěi wǒ yì bēi chá.', ar: 'من فضلك أعطني كوب شاي.' },
      { zh: '请等一下。', pinyin: 'Qǐng děng yíxià.', ar: 'من فضلك انتظر قليلاً.' },
      { zh: '我喜欢看电影。', pinyin: 'Wǒ xǐhuan kàn diànyǐng.', ar: 'أحب مشاهدة الأفلام.' },
      { zh: '请帮我说英语。', pinyin: 'Qǐng bāng wǒ shuō Yīngyǔ.', ar: 'ساعدني على التحدث بالإنجليزية من فضلك.' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '服务员，请给我一杯茶。', pinyin: 'Fúwùyuán, qǐng gěi wǒ yì bēi chá.', arabic: 'النادل، من فضلك أعطني كوب شاي.' },
      { speaker: 'B', name: 'النادل', hanzi: '好的，请等一下。', pinyin: 'Hǎo de, qǐng děng yíxià.', arabic: 'حسناً، انتظر قليلاً.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '谢谢。你们的茶怎么样？', pinyin: 'Xièxie. Nǐmen de chá zěnmeyàng?', arabic: 'شكراً. كيف شايكم؟' },
      { speaker: 'B', name: 'النادل', hanzi: '我们有很多种茶。绿茶、红茶、花茶。', pinyin: 'Wǒmen yǒu hěn duō zhǒng chá. Lǜchá, hóngchá, huāchá.', arabic: 'لدينا أنواع كثيرة من الشاي. شاي أخضر، أحمر، زهري.' },
    ],
    grammar: [
      { title: 'المفعول المزدوج: 给 + شخص + شيء', description: 'فعل + شخص + شيء', pattern: '请 + 给 + شخص + شيء', example: '请给我一杯茶。', exampleAr: 'من فضلك أعطني كوب شاي.' },
      { title: '一下 للتخفيف', description: 'فعل + 一下 = للحظة', pattern: 'فعل + 一下', example: '请等一下。', exampleAr: 'من فضلك انتظر قليلاً.' },
    ],
    exerciseQuestions: [
      { zh: '请给我一杯茶。给 تعني:', options: ['يأخذ', 'يعطي', 'يبيع', 'يشتري'], correct: 1 },
      { zh: '一下 تعني:', options: ['كثير', 'قليلاً', 'لا شيء', 'دائماً'], correct: 1 },
      { zh: '喜欢 تعني:', options: ['يكره', 'يحب', 'يعرف', 'يفهم'], correct: 1 },
      { zh: '快 تعني:', options: ['بطيء', 'سريع', 'جميل', 'جديد'], correct: 1 },
      { zh: '请等一下 تعني:', options: ['اذهب', 'تعال', 'انتظر قليلاً', 'اجلس'], correct: 2 },
    ],
  },
  {
    id: 15, titleAr: 'اللقاء في مطار داكسينغ', titleZh: '大兴机场见！',
    words: [
      { zh: '机场', pinyin: 'jīchǎng', meaning: 'مطار' },
      { zh: '飞机', pinyin: 'fēijī', meaning: 'طائرة' },
      { zh: '出租车', pinyin: 'chūzūchē', meaning: 'تاكسي' },
      { zh: '火车', pinyin: 'huǒchē', meaning: 'قطار' },
      { zh: '地铁', pinyin: 'dìtiě', meaning: 'مترو أنفاق' },
      { zh: '票', pinyin: 'piào', meaning: 'تذكرة' },
      { zh: '护照', pinyin: 'hùzhào', meaning: 'جواز سفر' },
      { zh: '行李', pinyin: 'xínglǐ', meaning: 'أمتعة' },
      { zh: '到达', pinyin: 'dàodá', meaning: 'يصل' },
      { zh: '出发', pinyin: 'chūfā', meaning: 'ينطلق' },
      { zh: '接', pinyin: 'jiē', meaning: 'يستقبل / يلتقط' },
      { zh: '送', pinyin: 'sòng', meaning: 'يودّع / يرسل' },
      { zh: '见', pinyin: 'jiàn', meaning: 'يرى / يلتقي' },
      { zh: '旅行', pinyin: 'lǚxíng', meaning: 'سفر / رحلة' },
      { zh: '旅游', pinyin: 'lǚyóu', meaning: 'سياحة' },
      { zh: '回来', pinyin: 'huílái', meaning: 'يعود' },
      { zh: '路上', pinyin: 'lùshang', meaning: 'على الطريق' },
      { zh: '安全', pinyin: 'ānquán', meaning: 'آمن' },
      { zh: '注意', pinyin: 'zhùyì', meaning: 'ينتبه' },
      { zh: '开心', pinyin: 'kāixīn', meaning: 'سعيد' },
      { zh: '担心', pinyin: 'dānxīn', meaning: 'يشفق / يقلق' },
      { zh: '路上小心', pinyin: 'lùshang xiǎoxīn', meaning: 'كن حذراً في الطريق' },
      { zh: '再见', pinyin: 'zàijiàn', meaning: 'مع السلامة' },
    ],
    sentences: [
      { zh: '大兴机场见！', pinyin: 'Dàxīng jīchǎng jiàn!', ar: 'أراك في مطار داكسينغ!' },
      { zh: '我的飞机下午三点起飞。', pinyin: 'Wǒ de fēijī xiàwǔ sān diǎn qǐfēi.', ar: 'طائرتي تقلع الساعة الثالثة بعد الظهر.' },
      { zh: '路上小心。', pinyin: 'Lùshang xiǎoxīn.', ar: 'كن حذراً في الطريق.' },
      { zh: '祝你好运！', pinyin: 'Zhù nǐ hǎo yùn!', ar: 'حظاً سعيداً!' },
    ],
    conversation: [
      { speaker: 'A', name: 'لي مينغ', hanzi: '你明天去哪儿？', pinyin: 'Nǐ míngtiān qù nǎr?', arabic: 'إلى أين تذهب غداً؟' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '我明天去北京。大兴机场见！', pinyin: 'Wǒ míngtiān qù Běijīng. Dàxīng jīchǎng jiàn!', arabic: 'أذهب لبكين غداً. أراك في مطار داكسينغ!' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '好的！路上小心。', pinyin: 'Hǎo de! Lùshang xiǎoxīn.', arabic: 'حسناً! كن حذراً في الطريق.' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '谢谢！三天以后见。', pinyin: 'Xièxie! Sān tiān yǐhòu jiàn.', arabic: 'شكراً! أراك بعد ثلاثة أيام.' },
      { speaker: 'A', name: 'لي مينغ', hanzi: '祝你好运！', pinyin: 'Zhù nǐ hǎo yùn!', arabic: 'حظاً سعيداً!' },
      { speaker: 'B', name: 'وانغ فانغ', hanzi: '再见！', pinyin: 'Zàijiàn!', arabic: 'مع السلامة!' },
    ],
    grammar: [
      { title: 'التعبير عن السفر', description: '去 + مكان', pattern: '我 + [وقت] + 去 + مكان', example: '我明天去北京。', exampleAr: 'أذهب لبكين غداً.' },
      { title: 'التعبير عن اللقاء والوداع', description: '见 / 再见 / 祝你好运', pattern: '机场 + 见', example: '大兴机场见！', exampleAr: 'أراك في مطار داكسينغ!' },
      { title: 'الأمن والسلامة', description: '路上小心 / 祝你好运', pattern: '路上 + 小心', example: '路上小心。', exampleAr: 'كن حذراً في الطريق.' },
    ],
    exerciseQuestions: [
      { zh: '机场 تعني:', options: ['محطة قطار', 'مطار', 'ميناء', 'محطة حافلات'], correct: 1 },
      { zh: '飞机 تعني:', options: ['قطار', 'تاكسي', 'طائرة', 'حافلة'], correct: 2 },
      { zh: '再见 تعني:', options: ['مرحباً', 'مع السلامة', 'شكراً', 'من فضلك'], correct: 1 },
      { zh: '路上小心 تعني:', options: ['امشِ بسرعة', 'كن حذراً في الطريق', 'الطريق قصير', 'الطريق طويل'], correct: 1 },
      { zh: '旅行 تعني:', options: ['عمل', 'دراسة', 'سفر / رحلة', 'نوم'], correct: 2 },
      { zh: '护照 تعني:', options: ['بطاقة شخصية', 'تذكرة', 'جواز سفر', 'رخصة قيادة'], correct: 2 },
    ],
  },
]

// ─── Main Component ─────────────────────────────────────────
export default function LessonSystem() {
  const [selectedLesson, setSelectedLesson] = useState<number>(1)
  const [flashcardIndex, setFlashcardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [exerciseAnswer, setExerciseAnswer] = useState<number | null>(null)
  const [exerciseScore, setExerciseScore] = useState(0)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [exerciseFinished, setExerciseFinished] = useState(false)
  const [learnedWords, setLearnedWords] = useState<Set<number>>(new Set())

  const currentLesson = lessons.find(l => l.id === selectedLesson)!

  // Check if lesson is unlocked (70% of previous)
  const isLessonUnlocked = (lessonId: number) => {
    if (lessonId === 1) return true
    const prevLesson = lessons.find(l => l.id === lessonId - 1)
    if (!prevLesson) return true
    const prevWordsCount = prevLesson.words.length
    if (prevWordsCount === 0) return true
    const prevLearned = prevLesson.words.filter(w => learnedWords.has(`${lessonId - 1}-${w.zh}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0))).length
    return prevLearned >= prevWordsCount * 0.3
  }

  const getLessonProgress = (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return 0
    const total = lesson.words.length
    if (total === 0) return 0
    const learned = lesson.words.filter(w => learnedWords.has(`${lessonId}-${w.zh}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0))).length
    return Math.round((learned / total) * 100)
  }

  const toggleWordLearned = (lessonId: number, word: string) => {
    const key = `${lessonId}-${word}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    setLearnedWords(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Exercise logic
  const handleExerciseAnswer = (optionIndex: number) => {
    if (exerciseAnswer !== null) return
    setExerciseAnswer(optionIndex)
    const question = currentLesson.exerciseQuestions[exerciseIndex]
    if (optionIndex === question.correct) {
      setExerciseScore(prev => prev + 1)
    }
  }

  const nextExerciseQuestion = () => {
    if (exerciseIndex < currentLesson.exerciseQuestions.length - 1) {
      setExerciseIndex(prev => prev + 1)
      setExerciseAnswer(null)
    } else {
      setExerciseFinished(true)
    }
  }

  const resetExercise = () => {
    setExerciseAnswer(null)
    setExerciseScore(0)
    setExerciseIndex(0)
    setExerciseFinished(false)
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[#0A90D4] flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8" />
          نظام الدروس
        </h2>
        <p className="text-gray-600">15 درساً منظماً لتعلّم الصينية خطوة بخطوة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ─── Left Panel: Lesson List ──────────────────────── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">الدروس</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto space-y-1">
              {lessons.map(lesson => {
                const unlocked = isLessonUnlocked(lesson.id)
                const progress = getLessonProgress(lesson.id)
                const isActive = selectedLesson === lesson.id

                return (
                  <button
                    key={lesson.id}
                    className={`w-full text-right p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#E0F6FF] border-2 border-[#1CB0F6]'
                        : unlocked
                          ? 'hover:bg-gray-50 border border-transparent'
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => unlocked && setSelectedLesson(lesson.id)}
                    disabled={!unlocked}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isActive ? 'bg-[#1CB0F6] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {unlocked ? lesson.id : <Lock className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{lesson.titleAr}</div>
                        <div className="text-[10px] text-gray-500 font-chinese-sans truncate">{lesson.titleZh}</div>
                        <Progress value={progress} className="h-1 mt-1" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Panel: Lesson Content ──────────────────── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLesson}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Lesson Header */}
              <Card className="mb-4 border-2 border-[#1CB0F6]">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#1CB0F6] text-white">الدرس {currentLesson.id}</Badge>
                        <h3 className="text-xl font-bold">{currentLesson.titleAr}</h3>
                      </div>
                      <p className="text-gray-500 font-chinese-sans mt-1">{currentLesson.titleZh}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedLesson <= 1}
                        onClick={() => setSelectedLesson(prev => prev - 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                        السابق
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedLesson >= lessons.length}
                        onClick={() => setSelectedLesson(prev => prev + 1)}
                      >
                        التالي
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lesson Tabs */}
              <Tabs defaultValue="vocabulary" className="w-full" dir="rtl">
                <TabsList className="grid grid-cols-5 gap-1 h-auto p-1">
                  <TabsTrigger value="vocabulary" className="text-xs sm:text-sm">المفردات</TabsTrigger>
                  <TabsTrigger value="sentences" className="text-xs sm:text-sm">الجمل</TabsTrigger>
                  <TabsTrigger value="conversation" className="text-xs sm:text-sm">المحادثة</TabsTrigger>
                  <TabsTrigger value="exercises" className="text-xs sm:text-sm">التمارين</TabsTrigger>
                  <TabsTrigger value="grammar" className="text-xs sm:text-sm">القواعد</TabsTrigger>
                </TabsList>

                {/* ─── Vocabulary Tab ──────────────────────── */}
                <TabsContent value="vocabulary" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{currentLesson.words.length} كلمة</p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFlashcardIndex(prev => Math.max(0, prev - 1))}
                        disabled={flashcardIndex <= 0}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-500 self-center">
                        {flashcardIndex + 1}/{currentLesson.words.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFlashcardIndex(prev => Math.min(currentLesson.words.length - 1, prev + 1))}
                        disabled={flashcardIndex >= currentLesson.words.length - 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <Card
                      className="cursor-pointer min-h-[280px] transition-all hover:shadow-lg"
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[280px]">
                        <AnimatePresence mode="wait">
                          {isFlipped ? (
                            <motion.div
                              key="back"
                              initial={{ rotateY: 90 }}
                              animate={{ rotateY: 0 }}
                              exit={{ rotateY: 90 }}
                              className="text-center space-y-4"
                            >
                              <div className="text-sm text-gray-500">المعنى</div>
                              <div className="text-3xl font-bold text-gray-800">{currentLesson.words[flashcardIndex]?.meaning}</div>
                              <div className="font-chinese-sans text-lg text-gray-600">{currentLesson.words[flashcardIndex]?.pinyin}</div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); speak(currentLesson.words[flashcardIndex]?.zh || '') }}
                              >
                                <Volume2 className="w-4 h-4 ml-1" />
                                استمع
                              </Button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="front"
                              initial={{ rotateY: 90 }}
                              animate={{ rotateY: 0 }}
                              exit={{ rotateY: 90 }}
                              className="text-center space-y-3"
                            >
                              <div className="font-chinese-serif text-6xl text-[#0A90D4]">{currentLesson.words[flashcardIndex]?.zh}</div>
                              <div className="text-sm text-gray-400">اضغط لقلب البطاقة</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2 mt-4 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => speak(currentLesson.words[flashcardIndex]?.zh || '')}
                      >
                        <Volume2 className="w-4 h-4 ml-1" />
                        استمع
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleWordLearned(currentLesson.id, currentLesson.words[flashcardIndex]?.zh || '')}
                      >
                        <Star className={`w-4 h-4 ml-1 ${
                          learnedWords.has(`${currentLesson.id}-${currentLesson.words[flashcardIndex]?.zh}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
                            ? 'fill-yellow-400 text-yellow-400'
                            : ''
                        }`} />
                        تعلّمتها
                      </Button>
                    </div>
                  </div>

                  {/* Word grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-6">
                    {currentLesson.words.map((word, idx) => {
                      const key = `${currentLesson.id}-${word.zh}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                      return (
                        <Card
                          key={idx}
                          className={`p-3 text-center cursor-pointer hover:shadow-sm transition-all ${
                            idx === flashcardIndex ? 'border-[#1CB0F6] border-2' : ''
                          } ${learnedWords.has(key) ? 'bg-[#E5F9DB]' : ''}`}
                          onClick={() => { setFlashcardIndex(idx); setIsFlipped(false) }}
                        >
                          <div className="font-chinese-serif text-xl text-[#0A90D4]">{word.zh}</div>
                          <div className="text-[10px] text-gray-500 font-chinese-sans">{word.pinyin}</div>
                          <div className="text-xs text-gray-600">{word.meaning}</div>
                          {learnedWords.has(key) && <CheckCircle className="w-3 h-3 text-green-500 mx-auto mt-1" />}
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                {/* ─── Sentences Tab ───────────────────────── */}
                <TabsContent value="sentences" className="space-y-3">
                  {currentLesson.sentences.map((sentence, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="font-chinese-serif text-lg">{sentence.zh}</div>
                              <div className="text-xs text-gray-500 font-chinese-sans">{sentence.pinyin}</div>
                              <div className="text-sm text-gray-700">{sentence.ar}</div>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => speak(sentence.zh)}>
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                {/* ─── Conversation Tab ────────────────────── */}
                <TabsContent value="conversation" className="space-y-3">
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="w-5 h-5 text-[#1CB0F6]" />
                        <h4 className="font-bold">محادثة: {currentLesson.titleAr}</h4>
                      </div>
                      <div className="space-y-3">
                        {currentLesson.conversation.map((turn, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex gap-3 ${turn.speaker === 'A' ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`rounded-2xl p-3 max-w-[80%] ${
                              turn.speaker === 'A'
                                ? 'bg-[#E0F6FF] rounded-tr-sm border border-[#1CB0F6]'
                                : 'bg-blue-50 rounded-tl-sm border border-blue-100'
                            }`}>
                              <div className={`text-xs mb-1 ${turn.speaker === 'A' ? 'text-[#1CB0F6]' : 'text-blue-500'}`}>
                                {turn.name}
                              </div>
                              <div className="font-chinese-serif text-lg">{turn.hanzi}</div>
                              <div className="text-xs text-gray-500 font-chinese-sans">{turn.pinyin}</div>
                              <div className="text-sm text-gray-700">{turn.arabic}</div>
                            </div>
                            <button
                              onClick={() => speak(turn.hanzi)}
                              className="self-center shrink-0 p-2 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              <Volume2 className="w-4 h-4 text-gray-500" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ─── Exercises Tab ───────────────────────── */}
                <TabsContent value="exercises" className="space-y-4">
                  {!exerciseFinished ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#1CB0F6]" />
                            سؤال {exerciseIndex + 1} من {currentLesson.exerciseQuestions.length}
                          </CardTitle>
                          <Badge variant="outline">النتيجة: {exerciseScore}/{exerciseIndex + (exerciseAnswer !== null ? 1 : 0)}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center bg-[#E0F6FF] rounded-xl p-4">
                          <p className="text-lg font-medium">{currentLesson.exerciseQuestions[exerciseIndex]?.zh}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentLesson.exerciseQuestions[exerciseIndex]?.options.map((option, idx) => (
                            <Button
                              key={idx}
                              variant={
                                exerciseAnswer === null ? 'outline' :
                                idx === currentLesson.exerciseQuestions[exerciseIndex].correct ? 'default' :
                                idx === exerciseAnswer ? 'destructive' : 'outline'
                              }
                              className="h-14 text-right justify-start"
                              onClick={() => handleExerciseAnswer(idx)}
                              disabled={exerciseAnswer !== null}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>

                        {exerciseAnswer !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-center p-3 rounded-lg ${
                              exerciseAnswer === currentLesson.exerciseQuestions[exerciseIndex].correct
                                ? 'bg-[#E5F9DB] text-green-700'
                                : 'bg-[#E0F6FF] text-[#0A90D4]'
                            }`}
                          >
                            {exerciseAnswer === currentLesson.exerciseQuestions[exerciseIndex].correct
                              ? 'إجابة صحيحة! 🎉'
                              : 'إجابة خاطئة، حاول مرة أخرى.'
                            }
                          </motion.div>
                        )}

                        {exerciseAnswer !== null && (
                          <Button onClick={nextExerciseQuestion} className="w-full">
                            {exerciseIndex < currentLesson.exerciseQuestions.length - 1 ? 'السؤال التالي' : 'عرض النتائج'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="text-center">
                        <CardContent className="p-8 space-y-4">
                          <div className="text-6xl">
                            {exerciseScore === currentLesson.exerciseQuestions.length ? '🏆' : exerciseScore >= currentLesson.exerciseQuestions.length / 2 ? '👍' : '💪'}
                          </div>
                          <h3 className="text-2xl font-bold">نتيجتك</h3>
                          <div className="text-4xl font-bold text-[#0A90D4]">
                            {exerciseScore}/{currentLesson.exerciseQuestions.length}
                          </div>
                          <p className="text-gray-600">
                            {exerciseScore === currentLesson.exerciseQuestions.length
                              ? 'ممتاز! أحسنت!'
                              : exerciseScore >= currentLesson.exerciseQuestions.length / 2
                                ? 'جيد! واصل التعلم!'
                                : 'لا بأس! راجع الدرس وحاول مرة أخرى.'}
                          </p>
                          <Button onClick={resetExercise} variant="outline">
                            <RotateCcw className="w-4 h-4 ml-1" />
                            إعادة التمرين
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </TabsContent>

                {/* ─── Grammar Tab ─────────────────────────── */}
                <TabsContent value="grammar" className="space-y-4">
                  {currentLesson.grammar.map((rule, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-[#1CB0F6]" />
                            <h4 className="font-bold text-lg">{rule.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                          <div className="bg-[#E0F6FF] rounded-lg p-3 font-mono text-sm text-red-800">
                            {rule.pattern}
                          </div>
                          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                            <div className="flex-1">
                              <div className="font-chinese-serif text-sm">{rule.example}</div>
                              <div className="text-xs text-gray-500 mt-1">{rule.exampleAr}</div>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => speak(rule.example)}>
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>
              </Tabs>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
