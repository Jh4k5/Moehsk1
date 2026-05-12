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
  // Lessons 7-15 generated with similar structure
  ...Array.from({ length: 9 }, (_, i) => ({
    id: i + 7,
    titleAr: ['المكان والاتجاهات', 'المواصلات والتسوق', 'الحياة اليومية', 'العمل والمهنة', 'الصحة والمرض', 'الهوايات والرياضة', 'الطقس والمواسم', 'السفر والعطلات', 'مراجعة شاملة'][i],
    titleZh: ['地点与方向', '交通与购物', '日常生活', '工作与职业', '健康与疾病', '爱好与运动', '天气与季节', '旅行与假期', '综合复习'][i],
    words: [
      { zh: '这个', pinyin: 'zhège', meaning: 'هذا' },
      { zh: '哪个', pinyin: 'nǎge', meaning: 'أي' },
      { zh: '在', pinyin: 'zài', meaning: 'في' },
      { zh: '去', pinyin: 'qù', meaning: 'يذهب' },
      { zh: '来', pinyin: 'lái', meaning: 'يأتي' },
      { zh: '想', pinyin: 'xiǎng', meaning: 'يريد' },
    ],
    sentences: [
      { zh: '请问，厕所在哪儿？', pinyin: 'Qǐngwèn, cèsuǒ zài nǎr?', ar: 'عفواً، أين الحمام؟' },
      { zh: '我想去北京。', pinyin: 'Wǒ xiǎng qù Běijīng.', ar: 'أريد الذهاب لبكين.' },
    ],
    conversation: [
      { speaker: 'A', name: 'سائح', hanzi: '请问，火车站在哪儿？', pinyin: 'Qǐngwèn, huǒchēzhàn zài nǎr?', arabic: 'عفواً، أين محطة القطار؟' },
      { speaker: 'B', name: 'مارة', hanzi: '往前走，在左边。', pinyin: 'Wǎng qián zǒu, zài zuǒbiān.', arabic: 'امشِ للأمام، على اليسار.' },
    ],
    grammar: [
      { title: 'أساسية', description: 'قواعد أساسية للدرس', pattern: 'فاعل + فعل + مفعول', example: '我去学校。', exampleAr: 'أذهب للمدرسة.' },
    ],
    exerciseQuestions: [
      { zh: 'سؤال تمريني', options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'], correct: 0 },
      { zh: 'سؤال ثانٍ', options: ['أ', 'ب', 'ج', 'د'], correct: 1 },
    ],
  })),
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
        <h2 className="text-3xl font-bold text-red-700 flex items-center justify-center gap-3">
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
                        ? 'bg-red-50 border-2 border-red-500'
                        : unlocked
                          ? 'hover:bg-gray-50 border border-transparent'
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => unlocked && setSelectedLesson(lesson.id)}
                    disabled={!unlocked}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isActive ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
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
              <Card className="mb-4 border-2 border-red-200">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-600 text-white">الدرس {currentLesson.id}</Badge>
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
                              <div className="font-chinese-serif text-6xl text-red-700">{currentLesson.words[flashcardIndex]?.zh}</div>
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
                            idx === flashcardIndex ? 'border-red-500 border-2' : ''
                          } ${learnedWords.has(key) ? 'bg-green-50' : ''}`}
                          onClick={() => { setFlashcardIndex(idx); setIsFlipped(false) }}
                        >
                          <div className="font-chinese-serif text-xl text-red-700">{word.zh}</div>
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
                        <MessageCircle className="w-5 h-5 text-red-600" />
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
                                ? 'bg-red-50 rounded-tr-sm border border-red-100'
                                : 'bg-blue-50 rounded-tl-sm border border-blue-100'
                            }`}>
                              <div className={`text-xs mb-1 ${turn.speaker === 'A' ? 'text-red-500' : 'text-blue-500'}`}>
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
                            <Target className="w-5 h-5 text-red-600" />
                            سؤال {exerciseIndex + 1} من {currentLesson.exerciseQuestions.length}
                          </CardTitle>
                          <Badge variant="outline">النتيجة: {exerciseScore}/{exerciseIndex + (exerciseAnswer !== null ? 1 : 0)}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center bg-red-50 rounded-xl p-4">
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
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
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
                          <div className="text-4xl font-bold text-red-700">
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
                            <GraduationCap className="w-5 h-5 text-red-600" />
                            <h4 className="font-bold text-lg">{rule.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                          <div className="bg-red-50 rounded-lg p-3 font-mono text-sm text-red-800">
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
