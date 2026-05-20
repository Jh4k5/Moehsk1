'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { vocabulary, type VocabWord } from '@/data/vocabulary'
import { grammarRules } from '@/data/grammar'
import { useLearningStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen, GraduationCap, Gamepad2, BookMarked, Map, LayoutDashboard,
  Volume2, ChevronLeft, ChevronRight, RotateCcw, Star, Check, X,
  Brain, Trophy, Target, Sparkles, Search, Filter, Eye, Heart,
  Clock, Flame, Languages, MessageCircle, ArrowLeftRight, Bot,
  Send, MoreHorizontal, Lightbulb, PenTool, FileText, Medal,
  Image, HelpCircle, GraduationCap as GradIcon, BookOpenText, MessageSquare,
  PanelRightClose, PanelRightOpen, LogOut, Mic
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Standalone Components ─────────────────────────────────
import PinyinHub from '@/components/PinyinHub'
import HanziSection from '@/components/HanziSection'
import ExamSimulator from '@/components/ExamSimulator'
import ConversationsSection from '@/components/ConversationsSection'
import LessonSystem from '@/components/LessonSystem'
import QASection from '@/components/QASection'
import VisualDictionary from '@/components/VisualDictionary'
import AchievementsSection from '@/components/AchievementsSection'
import PomodoroTimer from '@/components/PomodoroTimer'
import LoginScreen from '@/components/LoginScreen'

// ─── SRS Helper
import { isDueForReview, getDifficultyLabel, getWeakWords } from '@/lib/srs'

// ─── TTS Helper ─────────────────────────────────────────────
const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.8
    window.speechSynthesis.speak(u)
  }
}

// ─── Categories ─────────────────────────────────────────────
const categories = [
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
const roadmapUnits = [
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
const stories = [
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
      { zh: '妈妈给我做了汤。', pinyin: 'Māma gěi wǒ zuò le tāng.', ar: 'أمي صنعتب لي حساءً.' },
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
const tonePairs = [
  { syllable: 'ma', tones: [
    { tone: 1, char: '妈', pinyin: 'mā', meaning: 'أم' },
    { tone: 2, char: '麻', pinyin: 'má', meaning: 'قنب' },
    { tone: 3, char: '马', pinyin: 'mǎ', meaning: 'حصان' },
    { tone: 4, char: '骂', pinyin: 'mà', meaning: 'يشتم' },
  ]},
  { syllable: 'shi', tones: [
    { tone: 1, char: '师', pinyin: 'shī', meaning: 'معلم' },
    { tone: 2, char: '十', pinyin: 'shí', meaning: 'عشرة' },
    { tone: 3, char: '水', pinyin: 'shuǐ', meaning: 'ماء' },
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
const grammarPracticeQuestions: Record<number, { zh: string; options: string[]; correct: number }[]> = {
  1: [
    { zh: 'اختر الصيغة الصحيحة: 我 ___ 中文。', options: ['学习', '是学习', '学习是', '在学习'], correct: 0 },
    { zh: 'أي جملة صحيحة؟', options: ['我水喝', '我喝水', '喝水我', '水我喝'], correct: 1 },
    { zh: 'جملة صحيحة: 她 ___ 书。', options: ['看', '书看', '看是', '是看'], correct: 0 },
  ],
  2: [
    { zh: '___ 你是学生吗？', options: ['我', '你', '他', '她'], correct: 1 },
    { zh: 'النفي الصحيح: 我 ___ 老师吗？', options: ['是', '不是', '不', '没是'], correct: 1 },
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
    { zh: 'تحويل لسؤال: 他是学生。', options: ['他是学生吗？', '他学生吗是？', '吗他是学生？', '他是吗学生？'], correct: 0 },
    { zh: '你好___？', options: ['吗', '不', '没', '了'], correct: 0 },
    { zh: '这是一本书___？', options: ['吗', '不', '呢', '吧'], correct: 0 },
  ],
  6: [
    { zh: '"أنت طالب؟" بصيغة A不A:', options: ['你是学生不是？', '你是不是学生？', '你不是是学生？', '你学生是不是？'], correct: 1 },
    { zh: '你 ___ 吃？', options: ['吃不吃', '不吃饭', '吃吗', '没吃'], correct: 0 },
    { zh: '他有书___？', options: ['不是', '吗', '没有', '没'], correct: 2 },
  ],
  7: [
    { zh: '___ 叫什么名字؟ (ما اسمك؟)', options: ['你', '我', '他', '她'], correct: 0 },
    { zh: '这是___？ (من هذا؟)', options: ['谁', '什么', '哪', '几'], correct: 0 },
    { zh: '多少钱___？', options: ['多少', '几', '什么', '哪'], correct: 0 },
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
    { zh: '谁的朋友？ 我___朋友。', options: ['的', '是', '不', '很'], correct: 0 },
  ],
  12: [
    { zh: '我___在吃饭。(أنا آكل الآن)', options: ['在', '是', '有', '想'], correct: 0 },
    { zh: '她___在睡觉。', options: ['正在', '不', '没有', '想'], correct: 0 },
    { zh: '他在___什么？', options: ['在', '是', '有', '不'], correct: 0 },
  ],
  13: [
    { zh: '我___学校。(أنا في المدرسة)', options: ['在', '是', '有', '去'], correct: 0 },
    { zh: '书在桌子上。"上" تعني:', options: ['فوق', 'تحت', 'داخل', 'خارج'], correct: 0 },
    { zh: '他在___？(أين هو؟)', options: ['哪里', '什么', '谁', '几'], correct: 0 },
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
    { zh: '___钱？ (كم الثمن؟)', options: ['多少', '几', '什么', '哪'], correct: 0 },
    { zh: '你___岁？ (كم عمرك؟)', options: ['几', '多少', '什么', '多'], correct: 0 },
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
    { zh: '吃饭___！ (هيا نأكل)', options: ['吧', '吗', '不', '没'], correct: 0 },
    { zh: '你是学生___؟ (أنت طالب، أليس كذلك؟)', options: ['吧', '吗', '呢', '不'], correct: 0 },
  ],
  23: [
    { zh: '___好了！ (رائع جداً)', options: ['太', '很', '非常', '不'], correct: 0 },
    { zh: '太贵___！ (غالٍ جداً)', options: ['了', '吗', '不', '很'], correct: 0 },
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

// ─── Smart Chat Responses ────────────────────────────────────
function getChatResponse(message: string): string {
  const msg = message.toLowerCase()
  
  // Search for vocabulary words
  const foundWord = vocabulary.find(w => 
    msg.includes(w.zh.toLowerCase()) || 
    msg.includes(w.pinyin.toLowerCase()) ||
    w.meaning.split('/').some(m => msg.includes(m.trim().toLowerCase()))
  )
  
  if (foundWord) {
    const sentences: string[] = []
    sentences.push(`📚 **${foundWord.zh}** (${foundWord.pinyin}) — ${foundWord.meaning}`)
    sentences.push(`🏷️ نوع الكلمة: ${categories.find(c => c.value === foundWord.pos)?.label || foundWord.pos}`)
    sentences.push(`\n📝 أمثلة:`)
    sentences.push(`• ${foundWord.exZh}`)
    sentences.push(`  ${foundWord.exPinyin}`)
    if (foundWord.s2) {
      sentences.push(`• ${foundWord.s2.zh}`)
      sentences.push(`  ${foundWord.s2.py}`)
    }
    if (foundWord.s3) {
      sentences.push(`• ${foundWord.s3.zh}`)
      sentences.push(`  ${foundWord.s3.py}`)
    }
    sentences.push(`\n💡 نصيحة: حاول استخدام "${foundWord.zh}" في جملة اليوم!`)
    return sentences.join('\n')
  }
  
  // Greeting responses
  if (msg.includes('مرحب') || msg.includes('سلام') || msg.includes('أهل') || msg.includes('هلا')) {
    return '你好！👋 مرحباً بك! كيف يمكنني مساعدتك في تعلم الصينية اليوم؟\n\nيمكنني مساعدتك في:\n• شرح مفردات معينة\n• تقديم نصائح للنطق\n• شرح القواعد النحوية\n• إعطاء أمثلة عملية\n\nاكتب كلمة صينية أو عربية وسأشرحها لك! 😊'
  }
  
  if (msg.includes('شكر') || msg.includes('ممتاز') || msg.includes('شكرا')) {
    return '不客气！ 😊 أنا دائماً هنا لمساعدتك. تابع التعلم ولا تستسلم!加油 (jiāyóu) = هيا!/استمر!'
  }
  
  if (msg.includes('نطق') || msg.includes('صوت') || msg.includes('لهجة') || msg.includes('نبر')) {
    return '🎵 النطق الصيني يعتمد على النبرات الأربع:\n\n1️⃣ النبرة الأولى (ـ): مسطحة عالية — mā (أم)\n2️⃣ النبرة الثانية (↗): صاعدة — má (قنب)\n3️⃣ النبرة الثالثة (↘↗): هابطة ثم صاعدة — mǎ (حصان)\n4️⃣ النبرة الرابعة (↘): حادة هابطة — mà (يشتم)\n\n💡 نصيحة: استمع كثيراً وتدرب على تقليد النطق. يمكنك استخدام قسم "تمييز النبرات" في الألعاب للتدرب!'
  }
  
  if (msg.includes('قاع') || msg.includes('نح') || msg.includes('grammar') || msg.includes('قاعدة')) {
    return '📐 القواعد الأساسية في HSK 1:\n\n• **ترتيب الجملة**: فاعل + فعل + مفعول (مثل العربية)\n• **是 (shì)**: للتعريف بالهوية — 我是学生\n• **有 (yǒu)**: للملكية — 我有一本书\n• **不 (bù)**: نفي الحاضر، **没 (méi)**: نفي الماضي\n• **吗 (ma)**: لتحويل الجملة لسؤال — 你好吗？\n\n💡 جرّب قسم "القواعد" للاطلاع على جميع القواعد مع أمثلة!'
  }
  
  if (msg.includes('صع') || msg.includes('مستحيل') || msg.includes('صعب') || msg.includes('تحدي')) {
    return '💪 لا تستسلم! تعلم الصينية يحتاج صبراً لكنه ممتع!\n\n نصائح مهمة:\n1. تعلم 5-10 كلمات يومياً\n2. راجع باستخدام البطاقات التعليمية\n3. استمع للمحتوى الصيني\n4. تكلم ولو خطأ — الممارسة أهم من الكمال!\n5. استخدم قسم "التمارين" وال "ألعاب" يومياً\n\n加油！أنت تبلي حسناً! 🌟'
  }
  
  if (msg.includes('عد') || msg.includes('رقم') || msg.includes('أرقام') || msg.includes('إحص')) {
    return '🔢 الأرقام الصينية الأساسية:\n\n一 yī (1) 二 èr (2) 三 sān (3) 四 sì (4) 五 wǔ (5)\n六 liù (6) 七 qī (7) 八 bā (8) 九 jiǔ (9) 十 shí (10)\n\n💡 قاعدة مهمة:\n• 11 = 十一 (shíyī) = 10 + 1\n• 20 = 二十 (èrshí) = 2 × 10\n• 100 = 一百 (yībǎi)\n• اثنان مع المعدّ = 两 (liǎng) وليس 二\n\nجرّب قسم "الألعاب" — لعبة الذاكرة — للتدرب!'
  }
  
  // Default helpful response
  const tips = [
    '💡 نصيحة: حاول قراءة القصص القصيرة في قسم "القصص" — القراءة تساعد كثيراً!\n\nيمكنك سؤالي عن أي كلمة صينية وأنا سأشرحها لك بالتفصيل.',
    '🌟 هل تعلم؟ الصينية لها أكثر من 5000 حرف، لكنك تحتاج فقط حوالي 150 حرفاً لفهم 50% من النصوص اليومية!\n\nHSK 1 يعلمك 304 كلمة — بداية ممتازة!',
    '📝 تمارين يومية مقترحة:\n1. راجع 10 بطاقات تعليمية\n2. أجب على 5 أسئلة في قسم التمارين\n3. العب لعبة واحدة في قسم الألعاب\n4. اقرأ قصة قصيرة\n\nالاستمرارية هي مفتاح النجاح! 💪',
    '🎮 العب واستنتج! ألعابنا التعليمية مصممة لتجعل التعلم ممتعاً:\n• لعبة الذاكرة — طابق الصينية بالعربية\n• تمييز النبرات — تدرب على النطق الصحيح\n• اختبارات متعددة المستويات\n\nجرّبها الآن! 🚀',
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

// ─── Build sentences from vocabulary ─────────────────────────
function buildAllSentences(): { zh: string; pinyin: string; ar: string; wordZh: string }[] {
  const seen = new Set<string>()
  const result: { zh: string; pinyin: string; ar: string; wordZh: string }[] = []
  for (const w of vocabulary) {
    const add = (zh: string, py: string, ar: string) => {
      if (!seen.has(zh)) {
        seen.add(zh)
        result.push({ zh, pinyin: py, ar, wordZh: w.zh })
      }
    }
    add(w.exZh, w.exPinyin, w.exEn)
    if (w.s2) add(w.s2.zh, w.s2.py, w.s2.ar)
    if (w.s3) add(w.s3.zh, w.s3.py, w.s3.ar)
  }
  return result
}
const allSentences = buildAllSentences()

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
type Section = 'dashboard' | 'vocabulary' | 'grammar' | 'practice' | 'games' | 'stories' | 'roadmap' | 'sentences' | 'chat'
  | 'pinyin' | 'hanzi' | 'exam' | 'conversations' | 'lessons' | 'qa' | 'visual-dict' | 'achievements'

export default function Home() {
  const store = useLearningStore()
  const { currentSection, setCurrentSection, learnedWords, toggleLearned, incrementStreak, srsCards } = store
  const [hideMastered, setHideMastered] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizFinished, setQuizFinished] = useState(false)
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [hardTimer, setHardTimer] = useState(15)
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([])
  const [toneAnswer, setToneAnswer] = useState<number | null>(null)
  const [toneScore, setToneScore] = useState(0)
  const [toneRound, setToneRound] = useState(0)
  const [storyAnswers, setStoryAnswers] = useState<Record<number, number>>({})
  const [activeStory, setActiveStory] = useState(0)
  const [sentenceFlipped, setSentenceFlipped] = useState(false)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [currentUser, setCurrentUser] = useState<{ name: string; isGuest: boolean } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jisr_currentUser') || localStorage.getItem('mudann_currentUser')
      return saved ? JSON.parse(saved) : null
    }
    return null
  })

  // Hard mode timer
  useEffect(() => {
    if (quizDifficulty !== 'hard' || quizAnswer !== null || quizFinished || !store.quizQuestions.length) return
    if (hardTimer <= 0) {
      // Use a timeout to avoid calling setState synchronously in the effect
      const t = setTimeout(() => {
        setQuizAnswer(-1)
        setTimeout(() => {
          if (store.currentQuizQuestion < store.quizTotal - 1) {
            store.nextQuizQuestion()
            setQuizAnswer(null)
            setHardTimer(15)
          } else {
            setQuizFinished(true)
          }
        }, 1000)
      }, 0)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setHardTimer(h => h - 1), 1000)
    return () => clearTimeout(t)
  }, [hardTimer, quizDifficulty, quizAnswer, quizFinished, store.quizQuestions.length, store.currentQuizQuestion, store.quizTotal, store])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (currentSection === 'vocabulary') {
        if (e.key === 'ArrowLeft') store.setFlashcardIndex(Math.max(0, store.flashcardIndex - 1))
        if (e.key === 'ArrowRight') store.setFlashcardIndex(Math.min(vocabulary.length - 1, store.flashcardIndex + 1))
        if (e.key === ' ') { e.preventDefault(); store.flip() }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentSection, store.flashcardIndex])

  // ─── Navigation Items ──────────────────────────────────────
  const navItems = [
    { id: 'dashboard' as Section, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'vocabulary' as Section, label: 'المفردات', icon: BookOpen },
    { id: 'pinyin' as Section, label: 'البينين', icon: Languages },
    { id: 'hanzi' as Section, label: 'الحروف', icon: PenTool },
    { id: 'grammar' as Section, label: 'القواعد', icon: GraduationCap },
    { id: 'lessons' as Section, label: 'الدروس', icon: BookOpenText },
    { id: 'conversations' as Section, label: 'المحادثات', icon: MessageSquare },
    { id: 'sentences' as Section, label: 'الجمل', icon: MessageCircle },
    { id: 'stories' as Section, label: 'القصص', icon: BookMarked },
    { id: 'practice' as Section, label: 'التمارين', icon: Target },
    { id: 'games' as Section, label: 'الألعاب', icon: Gamepad2 },
    { id: 'qa' as Section, label: 'أسئلة شائعة', icon: HelpCircle },
    { id: 'visual-dict' as Section, label: 'القاموس والنطق', icon: Image },
    { id: 'exam' as Section, label: 'محاكي الامتحان', icon: FileText },
    { id: 'achievements' as Section, label: 'الإنجازات', icon: Medal },
    { id: 'chat' as Section, label: 'المساعد', icon: Bot },
    { id: 'roadmap' as Section, label: 'خريطة الطريق', icon: Map },
  ]

  // ─── Lesson names for sidebar dropdown
  const lessonNames = ['التحيات والتعارف', 'المعلومات الشخصية', 'العائلة والأصدقاء', 'الوقت والأرقام', 'الطعام والشراب', 'التسوق', 'المكان والاتجاهات', 'المواصلات', 'الحياة اليومية', 'الصحة', 'العمل والدراسة', 'الهوايات', 'الطقس والمواسم', 'السفر', 'مراجعة شاملة']
  const [lessonsOpen, setLessonsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // ─── Filtered Vocab ────────────────────────────────────────
  // Check if a word is mastered (SRS reviewCount >= 3)
  const isWordMastered = useCallback((wordId: number): boolean => {
    const card = srsCards[wordId]
    return card ? card.reviewCount >= 3 : false
  }, [srsCards])

  const filteredVocab = useMemo(() => {
    return vocabulary.filter(w => {
      // Filter out mastered words if toggle is on
      if (hideMastered && isWordMastered(w.id)) return false
      const matchSearch = searchQuery === '' ||
        w.zh.includes(searchQuery) ||
        w.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.meaning.includes(searchQuery)
      const matchCat = selectedCategory === 'all' || w.pos === selectedCategory
      return matchSearch && matchCat
    })
  }, [searchQuery, selectedCategory, hideMastered, isWordMastered])

  // ─── Quiz Generation (20 questions) ──────────────────────
  const generateQuiz = useCallback(() => {
    const count = 20
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, count)
    const questions = shuffled.map(word => {
      const wrongOptions = vocabulary
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning)
      const options = [...wrongOptions, word.meaning].sort(() => Math.random() - 0.5)
      return {
        wordId: word.id,
        question: word.zh,
        questionPinyin: word.pinyin,
        options,
        correctIndex: options.indexOf(word.meaning),
      }
    })
    store.startQuiz(questions)
    setQuizAnswer(null)
    setQuizFinished(false)
    setHardTimer(15)
  }, [store])

  // ─── Memory Game (fixed) ──────────────────────────────────
  const memoryLevels = [
    { level: 1, pairs: 6, label: 'المستوى 1 (6 أزواج)' },
    { level: 2, pairs: 8, label: 'المستوى 2 (8 أزواج)' },
    { level: 3, pairs: 12, label: 'المستوى 3 (12 أزواج)' },
  ]

  const startMemoryGame = useCallback((level?: number) => {
    const lvl = level || store.memoryLevel
    const pairCount = memoryLevels.find(l => l.level === lvl)?.pairs || 8
    const selected = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, pairCount)
    const cards = selected.flatMap(w => [
      { id: w.id * 2, zh: w.zh, ar: w.meaning, pinyin: w.pinyin, matched: false, type: 'hanzi' as const },
      { id: w.id * 2 + 1, zh: w.zh, ar: w.meaning, pinyin: w.pinyin, matched: false, type: 'meaning' as const },
    ]).sort(() => Math.random() - 0.5)
    store.startMemoryGame(cards)
    setMemoryFlipped([])
  }, [store])

  const handleMemoryClick = (id: number) => {
    if (memoryFlipped.length === 2) return
    const card = store.memoryCards.find(c => c.id === id)
    if (!card || card.matched || memoryFlipped.includes(id)) return

    const newFlipped = [...memoryFlipped, id]
    setMemoryFlipped(newFlipped)

    if (newFlipped.length === 2) {
      store.incrementMemoryMoves()
      const [a, b] = newFlipped
      const cardA = store.memoryCards.find(c => c.id === a)
      const cardB = store.memoryCards.find(c => c.id === b)
      // Match: same zh AND different type
      if (cardA && cardB && cardA.zh === cardB.zh && cardA.type !== cardB.type) {
        store.matchMemoryPair(a, b)
        setTimeout(() => setMemoryFlipped([]), 500)
      } else {
        setTimeout(() => setMemoryFlipped([]), 1000)
      }
    }
  }

  // ─── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = vocabulary.length
    const learned = learnedWords.length
    const progress = total > 0 ? Math.round((learned / total) * 100) : 0
    const byCategory = categories.slice(1).map(cat => ({
      ...cat,
      count: vocabulary.filter(w => w.pos === cat.value).length,
      learned: vocabulary.filter(w => w.pos === cat.value && learnedWords.includes(w.id)).length,
    }))
    return { total, learned, progress, byCategory }
  }, [learnedWords])

  // ═══════════════════════════════════════════════════════════
  // AUTH GUARD
  // ═══════════════════════════════════════════════════════════
  if (!currentUser) {
    return <LoginScreen onLogin={(user) => setCurrentUser(user)} />
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* ─── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="font-chinese-serif text-xl font-bold">桥</span>
              <span className="font-arabic text-sm font-bold">جِسر</span>
              <span className="text-[10px] text-muted-foreground tracking-widest">JISR</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">جِسر — تعلم الصينية HSK 1</h1>
              <p className="text-xs text-gray-500">{stats.total} كلمة • 26 قاعدة • مستوى مبتدئ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="hidden sm:flex gap-1 bg-amber-50 text-amber-700 border-amber-200">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>{store.dailyStreak} يوم متتالي</span>
            </Badge>
            <Badge className="hidden sm:flex gap-1 bg-blue-50 text-blue-700 border-blue-200">
              <Star className="w-3 h-3 text-blue-500" />
              <span>{stats.learned}/{stats.total}</span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* ─── Sidebar Navigation (Desktop) ──────────────── */}
        <nav className={`hidden lg:flex flex-col border-l border-gray-100 p-3 gap-1 sticky top-[60px] self-start max-h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar bg-white/50 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'}`}>
          {/* Toggle button */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors self-start mb-1">
            {sidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>

          {/* User info */}
          <div className={`flex items-center gap-3 p-2 mb-2 rounded-xl bg-gradient-to-l from-[#E8F0FA] to-white ${sidebarOpen ? '' : 'justify-center p-2'}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0" style={{ background: 'linear-gradient(135deg, #1A5FA8, #0D4E82)' }}>
              {currentUser?.isGuest ? '👋' : currentUser?.name?.charAt(0) || '?'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{currentUser?.name || 'زائر'}</div>
                <div className="text-[10px] text-gray-500">{currentUser?.isGuest ? 'زائر' : 'مستخدم'} • {learnedWords.length} محفوظة</div>
              </div>
            )}
          </div>
          <div className="h-px bg-gray-100 mb-2" />
          {navItems.map(item => {
            if (item.id === 'lessons') {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => { setCurrentSection(item.id); setLessonsOpen(!lessonsOpen) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-right">{item.label}</span>
                        <span className="text-[10px] text-gray-400 transition-transform" style={{ transform: lessonsOpen ? 'rotate(90deg)' : 'rotate(0)' }}>▸</span>
                      </>
                    )}
                  </button>
                  {lessonsOpen && sidebarOpen && (
                    <div className="mr-8 mb-1 space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {lessonNames.map((ln, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setCurrentSection('lessons'); if (store.setCurrentLesson) store.setCurrentLesson(i + 1); }}
                          className="w-full text-right text-xs text-gray-500 hover:text-[#1A5FA8] hover:bg-[#F0FAFF] py-1.5 px-3 rounded-lg transition-all truncate"
                        >
                          {i + 1}. {ln}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={currentSection === item.id
                  ? "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-[#E8F0FA] text-[#1A5FA8] shadow-sm"
                  : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              >
                <item.icon className={currentSection === item.id ? "w-5 h-5 text-[#1A5FA8]" : "w-5 h-5 text-gray-400 shrink-0"} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
          {/* Progress (shown when open) */}
          {sidebarOpen && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-b from-[#E8F0FA] to-[#F0FAFF]">
              <div className="text-xs text-gray-600 mb-2 font-medium">التقدم العام</div>
              <div className="progress-duo mb-1">
                <div className="progress-duo-fill" style={{ width: `${stats.progress}%` }} />
              </div>
              <div className="text-xs text-gray-500 text-center">{stats.progress}%</div>
            </div>
          )}
          {/* Logout button */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={() => { localStorage.removeItem('jisr_currentUser'); localStorage.removeItem('mudann_currentUser'); setCurrentUser(null); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </nav>

        {/* ─── Mobile Bottom Navigation ──────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around py-2 px-1 safe-area-bottom">
          {navItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentSection(item.id); incrementStreak() }}
              className={currentSection === item.id
                ? "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-[#1A5FA8]"
                : "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-gray-400"
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const moreSections: Section[] = ['pinyin', 'hanzi', 'lessons', 'conversations', 'sentences', 'stories', 'grammar', 'practice', 'games', 'qa', 'visual-dict', 'exam', 'achievements', 'chat', 'roadmap']
              const currentIdx = moreSections.indexOf(store.currentSection as Section)
              const nextIdx = (currentIdx + 1) % moreSections.length
              setCurrentSection(moreSections[nextIdx])
            }}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-gray-400"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">المزيد</span>
          </button>
        </nav>

        {/* ─── Main Content ──────────────────────────────── */}
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 animate-fade-in" key={currentSection}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentSection === 'dashboard' && <DashboardSection stats={stats} onNavigate={setCurrentSection} />}
              {currentSection === 'vocabulary' && (
                <VocabularySection
                  filteredVocab={filteredVocab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  hideMastered={hideMastered}
                  setHideMastered={setHideMastered}
                />
              )}
              {currentSection === 'grammar' && <GrammarSection />}
              {currentSection === 'practice' && (
                <PracticeSection
                  quizAnswer={quizAnswer}
                  setQuizAnswer={setQuizAnswer}
                  quizFinished={quizFinished}
                  setQuizFinished={setQuizFinished}
                  generateQuiz={generateQuiz}
                  quizDifficulty={quizDifficulty}
                  setQuizDifficulty={setQuizDifficulty}
                  hardTimer={hardTimer}
                  setHardTimer={setHardTimer}
                />
              )}
              {currentSection === 'games' && (
                <GamesSection
                  memoryFlipped={memoryFlipped}
                  handleMemoryClick={handleMemoryClick}
                  startMemoryGame={startMemoryGame}
                  toneAnswer={toneAnswer}
                  setToneAnswer={setToneAnswer}
                  toneScore={toneScore}
                  setToneScore={setToneScore}
                  toneRound={toneRound}
                  setToneRound={setToneRound}
                />
              )}
              {currentSection === 'sentences' && (
                <SentencesSection
                  sentenceFlipped={sentenceFlipped}
                  setSentenceFlipped={setSentenceFlipped}
                  sentenceIndex={sentenceIndex}
                  setSentenceIndex={setSentenceIndex}
                />
              )}
              {currentSection === 'stories' && (
                <StoriesSection
                  activeStory={activeStory}
                  setActiveStory={setActiveStory}
                  storyAnswers={storyAnswers}
                  setStoryAnswers={setStoryAnswers}
                />
              )}
              {currentSection === 'chat' && <ChatSection />}
              {currentSection === 'roadmap' && <RoadmapSection />}
              {/* ─── Integrated Standalone Components ─────────── */}
              {currentSection === 'pinyin' && <PinyinHub />}
              {/* pronunciation merged into visual-dict */}
              {currentSection === 'hanzi' && <HanziSection />}
              {currentSection === 'exam' && <ExamSimulator />}
              {currentSection === 'conversations' && <ConversationsSection />}
              {currentSection === 'lessons' && <LessonSystem />}
              {currentSection === 'qa' && <QASection />}
              {currentSection === 'visual-dict' && <VisualDictionary />}
              {currentSection === 'achievements' && <AchievementsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="hidden lg:block border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          تعلم اللغة الصينية — HSK المستوى الأول • {stats.learned} من {stats.total} كلمة تم حفظها
        </div>
      </footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD SECTION
// ═══════════════════════════════════════════════════════════
function DashboardSection({ stats, onNavigate }: {
  stats: { total: number; learned: number; progress: number; byCategory: { value: string; label: string; count: number; learned: number }[] }
  onNavigate: (s: Section) => void
}) {
  const store = useLearningStore()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-[#1A5FA8]" />
          لوحة التحكم
        </h2>
        <p className="text-gray-500 mt-1">مرحباً بك في رحلة تعلم اللغة الصينية!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'كلمة محفوظة', value: stats.learned, total: stats.total, icon: BookOpen, color: 'from-[#1A5FA8] to-[#0D4E82]' },
          { label: 'قاعدة نحوية', value: 26, total: 26, icon: GraduationCap, color: 'from-amber-500 to-amber-600' },
          { label: 'أيام متتالية', value: store.dailyStreak, icon: Flame, color: 'from-orange-500 to-orange-600' },
          { label: 'مستوى التقدم', value: `${stats.progress}%`, icon: Trophy, color: 'from-emerald-500 to-emerald-600' },
        ].map((stat, i) => (
          <Card key={i} className="card-hover border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={"w-10 h-10 rounded-lg bg-gradient-to-br " + stat.color + " flex items-center justify-center mb-3"}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              {stat.total && <div className="text-xs text-gray-500">من {stat.total}</div>}
              <div className="text-xs text-gray-600 font-medium mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">التقدم حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.byCategory.map((cat) => (
            <div key={cat.value} className="flex items-center gap-3">
              <span className="text-sm w-20 text-gray-600 text-left">{cat.label}</span>
              <div className="flex-1">
                <div className="progress-duo">
                  <div className="progress-duo-fill" style={{ width: `${cat.count > 0 ? (cat.learned / cat.count) * 100 : 0}%` }} />
                </div>
              </div>
              <span className="text-xs text-gray-500 w-16 text-left">{cat.learned}/{cat.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pomodoro Timer */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#E8F0FA] flex items-center justify-center text-sm">🍅</span>
            مؤقت بومودورو
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PomodoroTimer />
        </CardContent>
      </Card>

      {/* Weak Words — SRS Priority */}
      <WeakWordsSection onNavigate={onNavigate} />

      {/* Daily Plan */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">📋</span>
            خطة اليوم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { label: 'راجع البطاقات المستحقة', icon: '🔄', section: 'vocabulary' as Section, done: false },
              { label: 'أكمل تمرين واحد', icon: '✏️', section: 'practice' as Section, done: false },
              { label: 'اقرأ قصة قصيرة', icon: '📖', section: 'stories' as Section, done: false },
              { label: 'تدرّب على المحادثات', icon: '💬', section: 'conversations' as Section, done: false },
            ].map((task) => (
              <button
                key={task.label}
                onClick={() => onNavigate(task.section)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#E8F0FA] transition-colors text-right"
              >
                <span className="text-lg">{task.icon}</span>
                <span className="text-sm font-medium text-gray-700">{task.label}</span>
                <span className="mr-auto text-xs text-gray-400">→</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Weak Words Component ─────────────────────────────────────
function WeakWordsSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const store = useLearningStore()
  const { srsCards } = store
  const weakWordIds = getWeakWords(
    Object.values(srsCards) as any,
    5
  )
  const weakWords = vocabulary.filter(w => weakWordIds.includes(w.id))

  if (weakWords.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-sm">🎯</span>
            كلمات تحتاج مراجعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            لا توجد كلمات ضعيفة بعد! استمر في التعلم 🌟
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-sm">🎯</span>
          كلمات تحتاج انتباهك
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {weakWords.map(w => (
            <button
              key={w.id}
              onClick={() => onNavigate('vocabulary')}
              className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm hover:bg-amber-100 transition-colors flex items-center gap-2"
            >
              <span className="font-chinese-serif font-bold text-gray-900">{w.zh}</span>
              <span className="text-xs text-gray-500">{w.meaning}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════
// VOCABULARY SECTION (Quizlet-Style Flashcards)
// ═══════════════════════════════════════════════════════════
function VocabularySection({ filteredVocab, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, hideMastered, setHideMastered }: {
  filteredVocab: VocabWord[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
  hideMastered: boolean
  setHideMastered: (v: boolean | ((prev: boolean) => boolean)) => void
}) {
  const store = useLearningStore()
  const [activeMode, setActiveMode] = useState<'cards' | 'learn' | 'test' | 'match'>('cards')
  const [shuffledVocab, setShuffledVocab] = useState<VocabWord[]>([])
  const [sessionSeen, setSessionSeen] = useState<Set<number>>(new Set())
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionIncorrect, setSessionIncorrect] = useState(0)

  // ── Learn mode state ──
  const [learnIndex, setLearnIndex] = useState(0)
  const [learnInput, setLearnInput] = useState('')
  const [learnFeedback, setLearnFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [learnCompleted, setLearnCompleted] = useState(0)

  // ── Test mode state ──
  const [testQuestions, setTestQuestions] = useState<{ word: VocabWord; options: string[]; correctIdx: number }[]>([])
  const [testIndex, setTestIndex] = useState(0)
  const [testAnswer, setTestAnswer] = useState<number | null>(null)
  const [testFinished, setTestFinished] = useState(false)
  const [testScore, setTestScore] = useState(0)

  // ── Match mode state ──
  const [matchPairs, setMatchPairs] = useState<{ id: number; zh: string; ar: string; pinyin: string }[]>([])
  const [matchTiles, setMatchTiles] = useState<{ id: number; text: string; type: 'zh' | 'ar'; matched: boolean }[]>([])
  const [matchSelected, setMatchSelected] = useState<number | null>(null)
  const [matchMoves, setMatchMoves] = useState(0)
  const [matchTimer, setMatchTimer] = useState(0)
  const [matchStarted, setMatchStarted] = useState(false)
  const [matchDone, setMatchDone] = useState(false)

  // ── Swipe state ──
  const swipeStartX = useRef(0)
  const swipeEndX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // ── Pronunciation state ──
  const [isRecording, setIsRecording] = useState(false)
  const [pronResult, setPronResult] = useState<{ score: number; spoken: string; color: string; msg: string } | null>(null)
  const pronRecRef = useRef<any>(null)

  // SRS: Build deck with due cards first, then new cards
  const dueCardIds = store.getDueCardIds()
  const dueCards = filteredVocab.filter(w => dueCardIds.includes(w.id))
  const newCards = filteredVocab.filter(w => !dueCardIds.includes(w.id))
  const srsDeck = [...dueCards, ...newCards]
  const deck = shuffledVocab.length > 0 ? shuffledVocab : srsDeck
  const dueCount = dueCards.length
  const word = deck[store.flashcardIndex] || deck[0]

  const wordSentences = useMemo(() => {
    if (!word) return []
    const sents: { zh: string; pinyin: string; ar: string }[] = [
      { zh: word.exZh, pinyin: word.exPinyin, ar: word.exEn },
    ]
    if (word.s2) sents.push({ zh: word.s2.zh, pinyin: word.s2.py, ar: word.s2.ar })
    if (word.s3) sents.push({ zh: word.s3.zh, pinyin: word.s3.py, ar: word.s3.ar })
    return sents.filter(s => s.zh)
  }, [word])

  // Shuffle function
  const doShuffle = useCallback(() => {
    const s = [...filteredVocab].sort(() => Math.random() - 0.5)
    setShuffledVocab(s)
    store.setFlashcardIndex(0)
  }, [filteredVocab, store])

  // ── Pronunciation helper ──
  const pronSimilarity = (spoken: string, expected: string): number => {
    if (!spoken || !expected) return 0
    const s = spoken.trim().toLowerCase()
    const e = expected.trim().toLowerCase()
    if (s === e) return 100
    let d = 0
    const sl = s.length, el = e.length
    const matrix: number[][] = Array.from({ length: el + 1 }, (_, i) => [i])
    for (let j = 1; j <= sl; j++) matrix[0][j] = j
    for (let i = 1; i <= el; i++) {
      for (let j = 1; j <= sl; j++) {
        if (e.charAt(i - 1) === s.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
        else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
    d = matrix[el][sl]
    return Math.round(((Math.max(sl, el) - d) / Math.max(sl, el)) * 100)
  }

  const startPronRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    setPronResult(null)
    setIsRecording(true)
    const recognition = new SR()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 5
    recognition.continuous = false
    recognition.onresult = (event: any) => {
      let bestSim = 0
      let bestSpoken = ''
      for (let i = 0; i < event.results[0].length; i++) {
        const alt = event.results[0][i]
        const sim = pronSimilarity(alt.transcript, word?.zh || '')
        if (sim > bestSim) { bestSim = sim; bestSpoken = alt.transcript }
      }
      setPronResult({
        score: bestSim,
        spoken: bestSpoken,
        color: bestSim >= 70 ? '#22c55e' : '#ef4444',
        msg: bestSim >= 70 ? 'نطق ممتاز! 🎉' : 'حاول مرة أخرى 🎧',
      })
      setIsRecording(false)
    }
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)
    pronRecRef.current = recognition
    recognition.start()
  }

  const stopPronRecording = () => {
    if (pronRecRef.current) pronRecRef.current.stop()
    setIsRecording(false)
  }

  // Reset all progress
  const doReset = useCallback(() => {
    setShuffledVocab([])
    store.setFlashcardIndex(0)
    setSessionSeen(new Set())
    setSessionCorrect(0)
    setSessionIncorrect(0)
    setLearnIndex(0)
    setLearnInput('')
    setLearnFeedback(null)
    setLearnCompleted(0)
    setTestQuestions([])
    setTestIndex(0)
    setTestAnswer(null)
    setTestFinished(false)
    setTestScore(0)
    setMatchPairs([])
    setMatchTiles([])
    setMatchSelected(null)
    setMatchMoves(0)
    setMatchTimer(0)
    setMatchStarted(false)
    setMatchDone(false)
  }, [store])

  // Track card seen
  const markSeen = useCallback((wId: number) => {
    setSessionSeen(prev => {
      const n = new Set(prev)
      n.add(wId)
      return n
    })
  }, [])

  // ── Swipe handlers ──
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.changedTouches[0].screenX
  }, [])
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    swipeEndX.current = e.changedTouches[0].screenX
    const diff = swipeStartX.current - swipeEndX.current
    if (Math.abs(diff) > 60) {
      if (diff > 0 && store.flashcardIndex < deck.length - 1) {
        store.setFlashcardIndex(store.flashcardIndex + 1)
      } else if (diff < 0 && store.flashcardIndex > 0) {
        store.setFlashcardIndex(store.flashcardIndex - 1)
      }
    }
  }, [deck.length, store])

  // ── Learn mode ──
  const initLearn = useCallback(() => {
    setLearnIndex(0)
    setLearnInput('')
    setLearnFeedback(null)
    setLearnCompleted(0)
  }, [])

  const checkLearnAnswer = useCallback(() => {
    if (!learnInput.trim()) return
    const w = deck[learnIndex]
    if (!w) return
    const correct = learnInput.trim() === w.meaning.trim() ||
      w.meaning.split('/').some(m => m.trim() === learnInput.trim()) ||
      w.meaning.includes(learnInput.trim())
    setLearnFeedback(correct ? 'correct' : 'incorrect')
    if (correct) {
      setSessionCorrect(p => p + 1)
      setLearnCompleted(p => p + 1)
    } else {
      setSessionIncorrect(p => p + 1)
      setLearnCompleted(p => p + 1)
    }
    markSeen(w.id)
    setTimeout(() => {
      if (learnIndex < deck.length - 1) {
        setLearnIndex(p => p + 1)
        setLearnInput('')
        setLearnFeedback(null)
      }
    }, 1200)
  }, [learnInput, deck, learnIndex, markSeen])

  // ── Test mode ──
  const initTest = useCallback(() => {
    const count = Math.min(10, deck.length)
    const selected = [...deck].sort(() => Math.random() - 0.5).slice(0, count)
    const qs = selected.map(w => {
      const wrong = deck.filter(d => d.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.meaning)
      const options = [...wrong, w.meaning].sort(() => Math.random() - 0.5)
      return { word: w, options, correctIdx: options.indexOf(w.meaning) }
    })
    setTestQuestions(qs)
    setTestIndex(0)
    setTestAnswer(null)
    setTestFinished(false)
    setTestScore(0)
  }, [deck])

  const handleTestAnswer = useCallback((idx: number) => {
    if (testAnswer !== null) return
    setTestAnswer(idx)
    const q = testQuestions[testIndex]
    const isCorrect = idx === q.correctIdx
    if (isCorrect) {
      setTestScore(p => p + 1)
      setSessionCorrect(p => p + 1)
    } else {
      setSessionIncorrect(p => p + 1)
    }
    markSeen(q.word.id)
    setTimeout(() => {
      if (testIndex < testQuestions.length - 1) {
        setTestIndex(p => p + 1)
        setTestAnswer(null)
      } else {
        setTestFinished(true)
      }
    }, 1000)
  }, [testAnswer, testIndex, testQuestions, markSeen])

  // ── Match mode ──
  const initMatch = useCallback(() => {
    const pairCount = Math.min(6, deck.length)
    const selected = [...deck].sort(() => Math.random() - 0.5).slice(0, pairCount)
    const pairs = selected.map(w => ({ id: w.id, zh: w.zh, ar: w.meaning, pinyin: w.pinyin }))
    setMatchPairs(pairs)
    const tiles = selected.flatMap(w => [
      { id: w.id * 2, text: w.zh, type: 'zh' as const, matched: false },
      { id: w.id * 2 + 1, text: w.meaning, type: 'ar' as const, matched: false },
    ]).sort(() => Math.random() - 0.5)
    setMatchTiles(tiles)
    setMatchSelected(null)
    setMatchMoves(0)
    setMatchTimer(0)
    setMatchStarted(false)
    setMatchDone(false)
  }, [deck])

  // Match timer
  useEffect(() => {
    if (!matchStarted || matchDone || matchPairs.length === 0) return
    const t = setTimeout(() => setMatchTimer(p => p + 1), 1000)
    return () => clearTimeout(t)
  }, [matchStarted, matchDone, matchTimer, matchPairs.length])

  const handleMatchTile = useCallback((tileId: number) => {
    if (matchDone) return
    const tile = matchTiles.find(t => t.id === tileId)
    if (!tile || tile.matched) return
    if (!matchStarted) setMatchStarted(true)

    if (matchSelected === null) {
      setMatchSelected(tileId)
      return
    }

    const prevTile = matchTiles.find(t => t.id === matchSelected)
    if (!prevTile) { setMatchSelected(null); return }

    // Same type = ignore
    if (prevTile.type === tile.type) {
      setMatchSelected(tileId)
      return
    }

    // Check match
    const prevWordId = prevTile.type === 'zh' ? matchPairs.find(p => p.zh === prevTile.text) : matchPairs.find(p => p.ar === prevTile.text)
    const currWordId = tile.type === 'zh' ? matchPairs.find(p => p.zh === tile.text) : matchPairs.find(p => p.ar === tile.text)

    setMatchMoves(p => p + 1)

    setMatchTiles(prev => {
      const isMatch = prevWordId && currWordId && prevWordId.id === currWordId.id
      if (isMatch) {
        const updated = prev.map(t =>
          t.id === matchSelected || t.id === tileId ? { ...t, matched: true } : t
        )
        // Check if all tiles are now matched
        const allMatched = updated.every(t => t.matched)
        if (allMatched) {
          setTimeout(() => setMatchDone(true), 300)
        }
        return updated
      }
      return prev
    })
    setMatchSelected(null)
  }, [matchDone, matchStarted, matchSelected, matchTiles, matchPairs])

  // ── Progress ──
  const progressPercent = deck.length > 0 ? ((store.flashcardIndex + 1) / deck.length) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#1A5FA8]" />
          المفردات
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={hideMastered ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setHideMastered(v => !v)}>
            {hideMastered ? '✓ إخفاء المحفوظ' : 'إخفاء المحفوظ'}
          </Badge>
          <Badge variant="secondary">{filteredVocab.length} كلمة</Badge>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ابحث بالصينية أو البنيني أو العربية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No words message */}
      {deck.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد كلمات في هذا التصنيف</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'cards' | 'learn' | 'test' | 'match')}>
          {/* Tab bar + Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-2">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="cards" className="text-xs sm:text-sm gap-1">
                <BookOpen className="w-3.5 h-3.5 hidden sm:inline" />
                البطاقات
              </TabsTrigger>
              <TabsTrigger value="learn" className="text-xs sm:text-sm gap-1">
                <Brain className="w-3.5 h-3.5 hidden sm:inline" />
                تعلّم
              </TabsTrigger>
              <TabsTrigger value="test" className="text-xs sm:text-sm gap-1">
                <Target className="w-3.5 h-3.5 hidden sm:inline" />
                اختبار
              </TabsTrigger>
              <TabsTrigger value="match" className="text-xs sm:text-sm gap-1">
                <Gamepad2 className="w-3.5 h-3.5 hidden sm:inline" />
                مطابقة
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={doShuffle} className="text-xs gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة ترتيب
              </Button>
              <Button size="sm" variant="outline" onClick={doReset} className="text-xs gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة تعيين
              </Button>
              {/* Session stats */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 mr-2">
                {sessionSeen.size > 0 && <Badge variant="outline" className="text-xs">📅 {sessionSeen.size}</Badge>}
                {sessionCorrect > 0 && <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">✓ {sessionCorrect}</Badge>}
                {sessionIncorrect > 0 && <Badge className="text-xs bg-red-100 text-red-700 border-0">✗ {sessionIncorrect}</Badge>}
              </div>
            </div>
          </div>

          {/* ═══ CARDS MODE ═══ */}
          <TabsContent value="cards">
            {word && (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{store.flashcardIndex + 1} من {deck.length}</span>
                    <span>{sessionSeen.size > 0 ? `شوهد ${sessionSeen.size}` : ''}</span>
                  </div>
                </div>

                {/* Flashcard */}
                <div
                  ref={cardRef}
                  className="perspective-1000"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0, rotateY: store.isFlipped ? 180 : 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                      style={{ transformStyle: 'preserve-3d', minHeight: '340px' }}
                      className={"relative w-full max-w-lg mx-auto cursor-pointer"}
                      onClick={() => { store.flip(); markSeen(word.id) }}
                    >
                      {/* Front */}
                      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                        <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-white to-[#E8F0FA] rounded-2xl">
                          <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="text-xs text-gray-400 mb-3">← اسحب أو استخدم الأسهم →</div>
                            <div
                              className="font-chinese-serif text-8xl mb-3 text-gray-900 cursor-pointer hover:text-[#1A5FA8] transition-colors"
                              onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                            >
                              {word.zh}
                            </div>
                            <div className="text-xl text-gray-400 font-chinese-sans mb-2">{word.pinyin}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                              <Volume2 className="w-3 h-3" />
                              <span>اضغط للنطق • انقر للقلب • مسافة للقلب</span>
                            </div>
                            <Badge className="mt-4" variant="outline">{word.pos}</Badge>
                          </CardContent>
                        </Card>
                      </div>
                      {/* Back */}
                      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-white to-amber-50 overflow-y-auto custom-scrollbar rounded-2xl">
                          <CardContent className="flex flex-col items-center justify-start h-full p-6 text-center space-y-3">
                            <div className="text-3xl font-bold text-gray-900 mt-2">{word.meaning}</div>
                            <div className="font-chinese-serif text-5xl text-[#0D4E82] cursor-pointer hover:text-[#1A5FA8] transition-colors"
                              onClick={(e) => { e.stopPropagation(); speak(word.zh) }}>
                              {word.zh}
                            </div>
                            <div className="text-sm text-gray-400 font-chinese-sans">{word.pinyin}</div>
                            {/* Enhanced Microphone Button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); if (isRecording) { stopPronRecording(); } else { startPronRecording(); } }}
                              className={
                                "flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200 shadow-lg mt-1 " +
                                (isRecording
                                  ? "bg-red-500 text-white scale-105 animate-pulse"
                                  : "bg-[#1A5FA8] text-white hover:bg-[#0D4E82]")
                              }
                            >
                              <Mic size={22} />
                              <span className="text-xs font-medium">
                                {isRecording ? 'جارٍ التسجيل...' : 'انطق الكلمة'}
                              </span>
                            </button>
                            <div className="w-full border-t border-gray-200 pt-3 mt-2 space-y-2">
                              <div className="text-xs font-medium text-gray-500">📝 أمثلة:</div>
                              {wordSentences.map((s, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 p-2 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors text-right"
                                  onClick={(e) => { e.stopPropagation(); speak(s.zh) }}
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="font-chinese-serif text-sm text-gray-900">{s.zh}</div>
                                    <div className="text-xs text-gray-500 font-chinese-sans">{s.pinyin}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{s.ar}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between max-w-lg mx-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => store.setFlashcardIndex(store.flashcardIndex - 1)}
                    disabled={store.flashcardIndex === 0}
                  >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={store.isLearned(word.id) ? 'default' : 'outline'}
                      onClick={() => { toggleLearned(word.id); incrementStreak() }}
                      className={store.isLearned(word.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    >
                      {store.isLearned(word.id) ? <><Check className="w-4 h-4 ml-1" /> تم الحفظ</> : <><Star className="w-4 h-4 ml-1" /> حفظ</>}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => speak(word.zh)}>
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => store.setFlashcardIndex(store.flashcardIndex + 1)}
                    disabled={store.flashcardIndex >= deck.length - 1}
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
                {pronResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg mx-auto text-center text-sm py-2 px-4 rounded-xl"
                    style={{ background: pronResult.color + '15', color: pronResult.color, border: '1px solid ' + pronResult.color + '30' }}
                  >
                    <div className="font-bold">{pronResult.msg}</div>
                    <div className="text-xs mt-0.5 opacity-75">قلت: {pronResult.spoken} • دقة: {pronResult.score}%</div>
                  </motion.div>
                )}

                {/* SRS Buttons */}
                <div className="flex items-center justify-center gap-3 max-w-lg mx-auto mt-2">
                  {dueCount > 0 && (
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {dueCount} كلمة مستحقة اليوم
                    </span>
                  )}
                  <Button
                    size="sm"
                    className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                    onClick={() => {
                      store.rateWord(word.id, 4)
                      incrementStreak()
                      if (store.flashcardIndex < deck.length - 1) {
                        store.setFlashcardIndex(store.flashcardIndex + 1)
                      }
                    }}
                  >
                    <Check className="w-3.5 h-3.5" /> أعرفها
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      store.rateWord(word.id, 1)
                      if (store.flashcardIndex < deck.length - 1) {
                        store.setFlashcardIndex(store.flashcardIndex + 1)
                      }
                    }}
                  >
                    <X className="w-3.5 h-3.5" /> لا أعرفها
                  </Button>
                </div>

                {/* Word List (collapsed) */}
                <Card className="border-0 shadow-sm">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="list" className="border-0">
                      <AccordionTrigger className="py-3 text-sm font-medium text-gray-700">
                        قائمة الكلمات ({deck.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
                          {deck.map((w, i) => (
                            <button
                              key={w.id}
                              onClick={() => store.setFlashcardIndex(i)}
                              className={
                                store.isLearned(w.id)
                                  ? "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors hover:bg-gray-50 bg-emerald-50/50"
                                  : "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors hover:bg-gray-50"
                              }
                            >
                              <span className="font-chinese-serif text-lg w-20 text-gray-900">{w.zh}</span>
                              <span className="text-xs text-gray-500 font-chinese-sans w-28">{w.pinyin}</span>
                              <span className="text-sm text-gray-700 flex-1">{w.meaning}</span>
                              {sessionSeen.has(w.id) && <Eye className="w-3.5 h-3.5 text-blue-400" />}
                              {store.isLearned(w.id) && <Check className="w-4 h-4 text-emerald-600" />}
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ═══ LEARN MODE ═══ */}
          <TabsContent value="learn">
            <div className="space-y-4">
              {/* Progress */}
              <div className="space-y-1">
                <Progress value={deck.length > 0 ? (learnCompleted / deck.length) * 100 : 0} className="h-2" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>السؤال {learnIndex + 1} من {deck.length}</span>
                  <span>✓ {sessionCorrect} | ✗ {sessionIncorrect}</span>
                </div>
              </div>

              {learnIndex < deck.length && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={deck[learnIndex].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#E8F0FA] rounded-2xl">
                      <CardContent className="p-6 sm:p-8 text-center space-y-6">
                        <div className="text-sm text-gray-400">ما معنى هذه الكلمة؟</div>
                        <div
                          className="font-chinese-serif text-7xl sm:text-8xl text-gray-900 cursor-pointer hover:text-[#1A5FA8] transition-colors mx-auto"
                          onClick={() => speak(deck[learnIndex].zh)}
                        >
                          {deck[learnIndex].zh}
                        </div>
                        <div className="text-lg text-gray-400 font-chinese-sans">{deck[learnIndex].pinyin}</div>

                        {/* Input */}
                        <div className="max-w-md mx-auto space-y-3">
                          <Input
                            placeholder="اكتب المعنى بالعربية..."
                            value={learnInput}
                            onChange={(e) => setLearnInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') checkLearnAnswer() }}
                            className={
                              learnFeedback === 'correct' ? 'border-emerald-500 bg-emerald-50'
                                : learnFeedback === 'incorrect' ? 'border-red-500 bg-red-50'
                                : ''
                            }
                            dir="rtl"
                            disabled={learnFeedback !== null}
                          />
                          <div className="flex gap-2 justify-center">
                            <Button onClick={checkLearnAnswer} disabled={learnFeedback !== null || !learnInput.trim()} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                              تحقق
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => speak(deck[learnIndex].zh)}>
                              <Volume2 className="w-4 h-4 ml-1" /> استمع
                            </Button>
                          </div>
                        </div>

                        {/* Feedback */}
                        {learnFeedback && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={
                              learnFeedback === 'correct'
                                ? "bg-emerald-50 border border-emerald-200 rounded-xl p-4"
                                : "bg-red-50 border border-red-200 rounded-xl p-4"
                            }
                          >
                            {learnFeedback === 'correct' ? (
                              <div className="flex items-center justify-center gap-2 text-emerald-600">
                                <Check className="w-5 h-5" />
                                <span className="font-bold">أحسنت! صحيح</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-2 text-red-600">
                                  <X className="w-5 h-5" />
                                  <span className="font-bold">إجابة خاطئة</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  الإجابة الصحيحة: <span className="font-bold">{deck[learnIndex].meaning}</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Skip */}
                        {learnFeedback === null && (
                          <button
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => {
                              setLearnIndex(p => p + 1)
                              setLearnInput('')
                            }}
                          >
                            تخطّي →
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Learn Complete */}
              {learnIndex >= deck.length && (
                <Card className="border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-gray-900">انتهى التعلّم! 🎉</h3>
                    <div className="text-gray-500 space-y-1">
                      <p>✓ صحيح: <span className="text-emerald-600 font-bold">{sessionCorrect}</span></p>
                      <p>✗ خاطئ: <span className="text-red-600 font-bold">{sessionIncorrect}</span></p>
                      <p>النسبة: <span className="text-[#1A5FA8] font-bold">{deck.length > 0 ? Math.round((sessionCorrect / deck.length) * 100) : 0}%</span></p>
                    </div>
                    <Button onClick={initLearn} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                      ابدأ من جديد
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ═══ TEST MODE ═══ */}
          <TabsContent value="test">
            <div className="space-y-4">
              {testQuestions.length === 0 ? (
                <Card className="border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Target className="w-12 h-12 text-[#1A5FA8] mx-auto" />
                    <h3 className="text-lg font-bold text-gray-900">اختبار سريع</h3>
                    <p className="text-sm text-gray-500">
                      {Math.min(10, deck.length)} سؤال متعدد الخيارات من المجموعة الحالية
                    </p>
                    <Button onClick={initTest} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                      ابدأ الاختبار
                    </Button>
                  </CardContent>
                </Card>
              ) : testFinished ? (
                <Card className="border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-gray-900">نتيجة الاختبار 🎉</h3>
                    <div className="text-gray-500 space-y-1">
                      <p className="text-3xl font-bold text-[#1A5FA8]">{testScore} / {testQuestions.length}</p>
                      <p>النسبة: {Math.round((testScore / testQuestions.length) * 100)}%</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={initTest} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                        اختبار جديد
                      </Button>
                      <Button variant="outline" onClick={() => setTestQuestions([])}>
                        رجوع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Progress */}
                  <div className="space-y-1">
                    <Progress value={((testIndex + 1) / testQuestions.length) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>السؤال {testIndex + 1} من {testQuestions.length}</span>
                      <span>✓ {testScore}</span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={testIndex}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#E8F0FA] rounded-2xl">
                        <CardContent className="p-6 sm:p-8 text-center space-y-6">
                          <div className="text-sm text-gray-400">اختر المعنى الصحيح</div>
                          <div
                            className="font-chinese-serif text-6xl sm:text-7xl text-gray-900 cursor-pointer hover:text-[#1A5FA8] transition-colors"
                            onClick={() => speak(testQuestions[testIndex].word.zh)}
                          >
                            {testQuestions[testIndex].word.zh}
                          </div>
                          <div className="text-base text-gray-400 font-chinese-sans">{testQuestions[testIndex].word.pinyin}</div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                            {testQuestions[testIndex].options.map((opt, i) => {
                              const isAnswered = testAnswer !== null
                              const isCorrect = i === testQuestions[testIndex].correctIdx
                              const isSelected = i === testAnswer
                              return (
                                <motion.button
                                  key={i}
                                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                  onClick={() => handleTestAnswer(i)}
                                  disabled={isAnswered}
                                  className={
                                    isAnswered && isCorrect
                                      ? "p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-medium text-sm transition-all"
                                      : isAnswered && isSelected && !isCorrect
                                        ? "p-3 rounded-xl border-2 border-red-500 bg-red-50 text-red-700 font-medium text-sm transition-all"
                                        : "p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-[#1A5FA8] hover:bg-blue-50 text-gray-700 font-medium text-sm transition-all cursor-pointer"
                                  }
                                >
                                  {isAnswered && isCorrect && <Check className="w-4 h-4 inline ml-1" />}
                                  {isAnswered && isSelected && !isCorrect && <X className="w-4 h-4 inline ml-1" />}
                                  {opt}
                                </motion.button>
                              )
                            })}
                          </div>

                          {/* Feedback after answer */}
                          {testAnswer !== null && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-gray-500"
                            >
                              {!isSelectedCorrect(testAnswer, testQuestions[testIndex].correctIdx) && (
                                <span>
                                  الإجابة الصحيحة: <span className="font-bold text-emerald-600">{testQuestions[testIndex].options[testQuestions[testIndex].correctIdx]}</span>
                                </span>
                              )}
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </div>
          </TabsContent>

          {/* ═══ MATCH MODE ═══ */}
          <TabsContent value="match">
            <div className="space-y-4">
              {matchTiles.length === 0 ? (
                <Card className="border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Gamepad2 className="w-12 h-12 text-[#1A5FA8] mx-auto" />
                    <h3 className="text-lg font-bold text-gray-900">لعبة المطابقة</h3>
                    <p className="text-sm text-gray-500">
                      طابق بين الكلمات الصينية ومعانيها بالعربية في أسرع وقت!
                    </p>
                    <Button onClick={initMatch} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                      ابدأ اللعبة
                    </Button>
                  </CardContent>
                </Card>
              ) : matchDone ? (
                <Card className="border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-gray-900">أحسنت! 🎉</h3>
                    <div className="text-gray-500 space-y-1">
                      <p>⏱ الوقت: <span className="font-bold">{formatTime(matchTimer)}</span></p>
                      <p>🎯 المحاولات: <span className="font-bold">{matchMoves}</span></p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={initMatch} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                        العب مرة أخرى
                      </Button>
                      <Button variant="outline" onClick={() => setMatchTiles([])}>
                        رجوع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Timer & Moves */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-bold">{formatTime(matchTimer)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Target className="w-4 h-4" />
                      <span>{Math.floor(matchTiles.filter(t => t.matched).length / 2)} / {matchPairs.length}</span>
                    </div>
                    <Badge variant="outline">{matchMoves} محاولة</Badge>
                  </div>

                  {/* Tiles Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                    {matchTiles.map((tile) => {
                      const isSelectedTile = matchSelected === tile.id
                      return (
                        <motion.button
                          key={tile.id}
                          whileHover={!tile.matched ? { scale: 1.03 } : {}}
                          whileTap={!tile.matched ? { scale: 0.97 } : {}}
                          onClick={() => handleMatchTile(tile.id)}
                          disabled={tile.matched}
                          className={
                            tile.matched
                              ? "p-3 sm:p-4 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-300 text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center transition-all"
                              : isSelectedTile
                                ? tile.type === 'zh'
                                  ? "p-3 sm:p-4 rounded-xl bg-blue-100 border-2 border-[#1A5FA8] text-[#0D4E82] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center font-chinese-serif text-lg sm:text-xl transition-all"
                                  : "p-3 sm:p-4 rounded-xl bg-blue-100 border-2 border-[#1A5FA8] text-[#1A5FA8] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center text-sm sm:text-base font-medium transition-all"
                                : tile.type === 'zh'
                                  ? "p-3 sm:p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[#1A5FA8] text-gray-900 text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center font-chinese-serif text-lg sm:text-xl cursor-pointer transition-all shadow-sm"
                                  : "p-3 sm:p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[#1A5FA8] text-gray-700 text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center text-sm sm:text-base cursor-pointer transition-all shadow-sm"
                          }
                        >
                          {tile.matched ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            tile.text
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// ── Helpers (outside component) ──
function isSelectedCorrect(answer: number | null, correct: number): boolean {
  return answer !== null && answer === correct
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
}

// ═══════════════════════════════════════════════════════════
// GRAMMAR SECTION (Enhanced with Practice Questions)
// ═══════════════════════════════════════════════════════════
function GrammarSection() {
  const [grammarAnswers, setGrammarAnswers] = useState<Record<string, Record<number, number>>>({})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#1A5FA8]" />
          القواعد النحوية
        </h2>
        <Badge variant="secondary">26 قاعدة</Badge>
      </div>
      <p className="text-gray-500 text-sm">جميع القواعد النحوية المطلوبة للمستوى الأول (HSK 1)</p>

      <Accordion type="multiple" className="space-y-2">
        {grammarRules.map((rule) => {
          const questions = grammarPracticeQuestions[rule.id] || []
          const answers = grammarAnswers[String(rule.id)] || {}

          return (
            <AccordionItem key={rule.id} value={String(rule.id)} className="border rounded-xl shadow-sm px-4">
              <AccordionTrigger className="text-right hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F0FA] text-[#0D4E82] flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {rule.id}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{rule.titleAr}</div>
                    <div className="text-xs text-gray-500 font-ltr">{rule.title}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-4">
                <p className="text-sm text-gray-700">{rule.description}</p>

                {/* Pattern */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">الصيغة</div>
                  <div className="text-sm font-medium text-[#0D4E82] font-chinese-sans">{rule.pattern}</div>
                </div>

                {/* Examples */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500">أمثلة:</div>
                  {rule.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => speak(ex.zh)}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-chinese-serif text-gray-900">{ex.zh}</div>
                        <div className="text-xs text-gray-500 font-chinese-sans">{ex.pinyin}</div>
                        <div className="text-sm text-gray-700">{ex.ar}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {rule.tips && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      نصيحة
                    </div>
                    <div className="text-sm text-amber-900 mt-1">{rule.tips}</div>
                  </div>
                )}

                {/* Practice Questions */}
                {questions.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 space-y-3">
                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      تمرين تفاعلي
                    </div>
                    {questions.map((q, qi) => {
                      const selected = answers[qi]
                      const answered = selected !== undefined
                      const isCorrect = selected === q.correct
                      return (
                        <div key={qi} className="space-y-2">
                          <div className="font-chinese-serif text-sm text-gray-800 font-medium">{q.zh}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => {
                              let cls = 'border-gray-200 hover:bg-gray-50 text-gray-700'
                              if (answered) {
                                if (oi === q.correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                else if (oi === selected) cls = 'border-red-400 bg-[#FFE5E5] text-red-800'
                              }
                              return (
                                <Button
                                  key={oi}
                                  variant="outline"
                                  size="sm"
                                  className={"h-auto py-2 text-xs " + cls}
                                  onClick={() => {
                                    if (answered) return
                                    setGrammarAnswers(prev => ({
                                      ...prev,
                                      [String(rule.id)]: { ...prev[String(rule.id)], [qi]: oi },
                                    }))
                                  }}
                                >
                                  {opt}
                                </Button>
                              )
                            })}
                          </div>
                          {answered && (
                            <div className={isCorrect ? "text-xs font-medium text-emerald-700" : "text-xs font-medium text-[#0D4E82]"}>
                              {isCorrect ? '✓ إجابة صحيحة!' : '✗ حاول مرة أخرى'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PRACTICE SECTION (Enhanced Quiz)
// ═══════════════════════════════════════════════════════════
function PracticeSection({ quizAnswer, setQuizAnswer, quizFinished, setQuizFinished, generateQuiz, quizDifficulty, setQuizDifficulty, hardTimer, setHardTimer }: {
  quizAnswer: number | null
  setQuizAnswer: (a: number | null) => void
  quizFinished: boolean
  setQuizFinished: (f: boolean) => void
  generateQuiz: () => void
  quizDifficulty: 'easy' | 'medium' | 'hard'
  setQuizDifficulty: (d: 'easy' | 'medium' | 'hard') => void
  hardTimer: number
  setHardTimer: (t: number) => void
}) {
  const store = useLearningStore()
  const { quizQuestions, quizScore, quizTotal, currentQuizQuestion, answerQuiz, nextQuizQuestion, resetQuiz, incrementStreak } = store
  const [fillBlankWord, setFillBlankWord] = useState<VocabWord | null>(null)
  const [fillAnswer, setFillAnswer] = useState('')
  const [fillResult, setFillResult] = useState<'correct' | 'wrong' | null>(null)
  const [matchPairs, setMatchPairs] = useState<{ zh: string; ar: string }[]>([])
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set())
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)

  const startFillBlank = () => {
    const random = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    setFillBlankWord(random)
    setFillAnswer('')
    setFillResult(null)
  }

  const checkFillAnswer = () => {
    if (!fillBlankWord) return
    const correct = fillAnswer.trim() === fillBlankWord.zh ||
      fillAnswer.trim() === fillBlankWord.pinyin
    setFillResult(correct ? 'correct' : 'wrong')
    if (correct) incrementStreak()
  }

  const startMatchGame = () => {
    const selected = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 6)
    setMatchPairs(selected.map(w => ({ zh: w.zh, ar: w.meaning })))
    setMatchedItems(new Set())
    setSelectedMatch(null)
  }

  const handleMatchClick = (item: string, side: 'zh' | 'ar') => {
    if (matchedItems.has(item)) return
    if (!selectedMatch) {
      setSelectedMatch(item)
    } else {
      const zhItem = side === 'zh' ? item : selectedMatch
      const arItem = side === 'ar' ? item : selectedMatch
      const pair = matchPairs.find(p => p.zh === zhItem && p.ar === arItem)
      if (pair) {
        setMatchedItems(prev => new Set([...prev, zhItem, arItem]))
      }
      setSelectedMatch(null)
    }
  }

  const currentQuestion = quizQuestions[currentQuizQuestion]

  const getScoreMessage = (score: number, total: number) => {
    const pct = score / total
    if (pct >= 0.9) return 'ممتاز! 🎉 أنت نجم حقيقي في اللغة الصينية!'
    if (pct >= 0.8) return 'أحسنت! 👏 تقدم رائع، واصل!'
    if (pct >= 0.6) return 'جيد! 💪 أنت في الطريق الصحيح، استمر!'
    if (pct >= 0.4) return 'لا بأس! 📚 راجع المفردات وحاول مرة أخرى.'
    return 'حاول مرة أخرى! 💡 استخدم البطاقات التعليمية للمراجعة.'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-[#1A5FA8]" />
          التمارين
        </h2>
      </div>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quiz">اختيار من متعدد</TabsTrigger>
          <TabsTrigger value="fill">اكمل الفراغ</TabsTrigger>
          <TabsTrigger value="match">طابق الأزواج</TabsTrigger>
        </TabsList>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4">
          {!quizQuestions.length ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Brain className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">اختبار المفردات</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  20 سؤال عشوائي لاختبار معرفتك بالمفردات الصينية. اختر مستوى الصعوبة.
                </p>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <Button
                      key={d}
                      variant={quizDifficulty === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuizDifficulty(d)}
                      className={quizDifficulty === d ? 'bg-[#1A5FA8] hover:bg-[#0D4E82]' : ''}
                    >
                      {d === 'easy' ? 'سهل (تلميح)' : d === 'medium' ? 'متوسط' : 'صعب (مؤقت)'}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => { generateQuiz(); incrementStreak() }} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                  ابدأ الاختبار
                </Button>
              </CardContent>
            </Card>
          ) : !quizFinished ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>السؤال {currentQuizQuestion + 1} من {quizTotal}</span>
                  <div className="flex items-center gap-3">
                    {quizDifficulty === 'hard' && (
                      <Badge variant={hardTimer <= 5 ? 'destructive' : 'secondary'} className="gap-1">
                        <Clock className="w-3 h-3" />
                        {hardTimer}ث
                      </Badge>
                    )}
                    <span>النتيجة: {quizScore}/{quizTotal}</span>
                  </div>
                </div>
                <Progress value={(currentQuizQuestion / quizTotal) * 100} className="h-1.5" />

                <div className="text-center space-y-4">
                  <div
                    className="font-chinese-serif text-6xl text-gray-900 cursor-pointer hover:text-[#1A5FA8] transition-colors"
                    onClick={() => speak(currentQuestion.question)}
                  >
                    {currentQuestion.question}
                  </div>
                  {/* Show pinyin hint in easy mode */}
                  {quizDifficulty === 'easy' && currentQuestion.questionPinyin && (
                    <div className="text-sm text-gray-400 font-chinese-sans">{currentQuestion.questionPinyin}</div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => speak(currentQuestion.question)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt, i) => {
                    let btnClass = 'border-gray-200 hover:bg-gray-50 text-gray-900'
                    if (quizAnswer !== null) {
                      if (i === currentQuestion.correctIndex) btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      else if (i === quizAnswer) btnClass = 'border-red-500 bg-[#FFE5E5] text-red-800'
                    }
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={"h-auto py-3 text-sm " + btnClass + " transition-all"}
                        onClick={() => {
                          if (quizAnswer !== null) return
                          setQuizAnswer(i)
                          answerQuiz(i === currentQuestion.correctIndex)
                          setTimeout(() => {
                            if (currentQuizQuestion < quizTotal - 1) {
                              nextQuizQuestion()
                              setQuizAnswer(null)
                              setHardTimer(15)
                            } else {
                              setQuizFinished(true)
                            }
                          }, 1200)
                        }}
                      >
                        {opt}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
                <Trophy className={quizScore >= quizTotal * 0.8 ? "w-20 h-20 text-yellow-500" : "w-20 h-20 text-gray-400"} />
                <h3 className="text-2xl font-bold text-gray-900">
                  {getScoreMessage(quizScore, quizTotal)}
                </h3>
                <div className="text-4xl font-bold text-[#1A5FA8]">{quizScore} / {quizTotal}</div>
                <Progress value={(quizScore / quizTotal) * 100} className="w-64 h-3" />
                <Button onClick={() => { resetQuiz(); setQuizFinished(false); generateQuiz() }} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                  <RotateCcw className="w-4 h-4 ml-2" /> حاول مرة أخرى
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fill Blank Tab */}
        <TabsContent value="fill" className="space-y-4">
          {!fillBlankWord ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Languages className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">اكتب الكلمة الصينية</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  سيظهر لك المعنى بالعربية والجملة المثال. اكتب الكلمة الصينية أو البينيين.
                </p>
                <Button onClick={() => { startFillBlank(); incrementStreak() }} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                  ابدأ التمرين
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-xl font-bold text-gray-900">{fillBlankWord.meaning}</div>
                  <div className="text-sm text-gray-500 font-chinese-sans">{fillBlankWord.pinyin}</div>
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <div className="font-chinese-serif text-gray-800">{fillBlankWord.exZh}</div>
                    <div className="text-xs text-gray-500 mt-1">{fillBlankWord.exPinyin}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب الكلمة الصينية أو البينيين..."
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkFillAnswer()}
                    className="text-lg font-chinese-serif"
                  />
                  <Button onClick={checkFillAnswer} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">تحقق</Button>
                </div>
                {fillResult && (
                  <div className={fillResult === 'correct' ? "p-3 rounded-lg text-center font-medium bg-emerald-50 text-emerald-800" : "p-3 rounded-lg text-center font-medium bg-[#FFE5E5] text-red-800"}>
                    {fillResult === 'correct' ? '✓ إجابة صحيحة!' : '✗ الإجابة الصحيحة: ' + fillBlankWord.zh}
                  </div>
                )}
                <div className="text-center">
                  <Button variant="outline" onClick={startFillBlank} className="gap-1">
                    <RotateCcw className="w-3 h-3" /> كلمة أخرى
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Match Tab */}
        <TabsContent value="match" className="space-y-4">
          {!matchPairs.length ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <ArrowLeftRight className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">طابق الأزواج</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  اختر الكلمة الصينية ثم اختر ترجمتها العربية لإنشاء الأزواج المتطابقة.
                </p>
                <Button onClick={() => { startMatchGame(); incrementStreak() }} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matchedItems.size < matchPairs.length * 2 && (
                <div className="text-sm text-gray-500 text-center">
                  الأزواج المتطابقة: {matchedItems.size / 2} / {matchPairs.length}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {matchPairs.map(p => (
                    <Button
                      key={p.zh}
                      variant={matchedItems.has(p.zh) ? 'secondary' : selectedMatch === p.zh ? 'default' : 'outline'}
                      className={matchedItems.has(p.zh) ? "w-full justify-center font-chinese-serif text-lg h-12 opacity-50" : "w-full justify-center font-chinese-serif text-lg h-12"}
                      onClick={() => handleMatchClick(p.zh, 'zh')}
                      disabled={matchedItems.has(p.zh)}
                    >
                      {p.zh}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  {matchPairs.map(p => (
                    <Button
                      key={p.ar}
                      variant={matchedItems.has(p.ar) ? 'secondary' : selectedMatch === p.ar ? 'default' : 'outline'}
                      className={matchedItems.has(p.ar) ? "w-full justify-center text-sm h-12 opacity-50" : "w-full justify-center text-sm h-12"}
                      onClick={() => handleMatchClick(p.ar, 'ar')}
                      disabled={matchedItems.has(p.ar)}
                    >
                      {p.ar}
                    </Button>
                  ))}
                </div>
              </div>
              {matchedItems.size === matchPairs.length * 2 && (
                <div className="text-center space-y-3 p-6 bg-emerald-50 rounded-xl">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
                  <div className="text-xl font-bold text-emerald-800">أحسنت! طابقت جميع الأزواج! 🎉</div>
                  <Button onClick={startMatchGame} variant="outline">العب مرة أخرى</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      <TabsContent value="tf" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                <X className="w-5 h-5 text-red-500" />
                <span className="font-bold text-gray-700">صواب أم خطأ؟</span>
              </div>
              {tfQuestion ? (
                <div className="w-full max-w-md space-y-4 text-center">
                  <p className="font-chinese-serif text-2xl font-bold text-gray-900">{tfQuestion.zh.split(' — ')[0]}</p>
                  <p className="text-sm text-gray-500 font-chinese-sans">{tfQuestion.zh.split(' — ')[1] || ''}</p>
                  <div className="h-px bg-gray-200 my-2" />
                  <p className="text-lg font-bold" style={{ color: '#1A5FA8' }}>{tfQuestion.ar}</p>
                  <p className="text-xs text-gray-400">هل هذه الترجمة صحيحة؟</p>
                  {tfAnswer === null ? (
                    <div className="flex gap-4 justify-center mt-4">
                      <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={() => { setTfAnswer(true); setTfTotal(t => t + 1); if (tfQuestion.isCorrect) setTfScore(s => s + 1) }}>
                        <Check className="w-4 h-4" /> صحيح
                      </Button>
                      <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white border-0" onClick={() => { setTfAnswer(false); setTfTotal(t => t + 1); if (!tfQuestion.isCorrect) setTfScore(s => s + 1) }}>
                        <X className="w-4 h-4" /> خطأ
                      </Button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="text-lg font-bold" style={{ color: tfAnswer === tfQuestion.isCorrect ? '#22c55e' : '#ef4444' }}>
                        {tfAnswer === tfQuestion.isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                      </div>
                      <div className="flex items-center justify-between gap-3 px-4">
                        <span className="text-sm text-gray-500">النتيجة: {tfScore}/{tfTotal}</span>
                        <Button size="sm" onClick={startTFQuestion}>السؤال التالي</Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 max-w-sm text-center">سيظهر لك كلمة صينية مع ترجمتها. حدد هل الترجمة صحيحة أم لا.</p>
                  <Button onClick={startTFQuestion} className="gap-2" style={{ backgroundColor: '#1A5FA8', border: 'none' }}>
                    ابدأ اللعب
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
<TabsContent value="speed" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-8 space-y-4">
              {speedActive ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold" style={{ color: speedTime <= 10 ? '#ef4444' : '#1A5FA8' }}>{speedTime}</div>
                      <div className="text-xs text-gray-500">ثانية</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">{speedScore}</div>
                      <div className="text-xs text-gray-500">صحيح</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-500">🔥 {speedStreak}</div>
                      <div className="text-xs text-gray-500">متتالية</div>
                    </div>
                  </div>
                  {speedWord && (
                    <motion.div key={speedWord.word.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}>
                      <p className="text-xl font-bold text-gray-900 mb-4">{speedWord.word.meaning}</p>
                      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                        {speedWord.options.map(opt => (
                          <button key={opt} onClick={() => handleSpeedAnswer(opt)}
                            className="py-4 rounded-xl text-xl font-chinese-serif border-2 border-gray-200 hover:border-[#1A5FA8] hover:bg-[#E8F0FA] transition-all active:scale-95">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-2">⚡</div>
                  <h3 className="text-xl font-bold text-gray-700">لعبة السرعة</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">30 ثانية! اختر الترجمة الصينية الصحيحة للكلمة العربية. كم كلمة تستطيع؟</p>
                  {speedBest > 0 && <p className="text-sm text-amber-600 font-bold">🏆 أعلى نتيجة: {speedBest}</p>}
                  {speedScore > 0 && <p className="text-sm text-gray-600">آخر نتيجة: {speedScore}</p>}
                  <Button onClick={startSpeedGame} className="gap-2 text-base" style={{ backgroundColor: '#1A5FA8', border: 'none' }}>
                    ابدأ اللعبة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
</Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// GAMES SECTION (Fixed Memory + Enhanced Tones)
// ═══════════════════════════════════════════════════════════
const memoryLevelOptions = [
  { level: 1, pairs: 6, label: 'المستوى 1 (6 أزواج)' },
  { level: 2, pairs: 8, label: 'المستوى 2 (8 أزواج)' },
  { level: 3, pairs: 12, label: 'المستوى 3 (12 أزواج)' },
]

function GamesSection({ memoryFlipped, handleMemoryClick, startMemoryGame, toneAnswer, setToneAnswer, toneScore, setToneScore, toneRound, setToneRound }: {
  memoryFlipped: number[]
  handleMemoryClick: (id: number) => void
  startMemoryGame: (level?: number) => void
  toneAnswer: number | null
  setToneAnswer: (a: number | null) => void
  toneScore: number
  setToneScore: (s: number) => void
  toneRound: number
  setToneRound: (r: number) => void
}) {
  const store = useLearningStore()
  const { memoryCards, memoryMoves, memoryPairs, incrementStreak } = store
  const [selectedMemoryLevel, setSelectedMemoryLevel] = useState(1)
  const [targetToneIdx, setTargetToneIdx] = useState(0)

  // Speed game state
  const [speedActive, setSpeedActive] = useState(false)
  const [speedTime, setSpeedTime] = useState(30)
  const [speedScore, setSpeedScore] = useState(0)
  const [speedStreak, setSpeedStreak] = useState(0)
  const [speedBest, setSpeedBest] = useState(0)
  const [speedWord, setSpeedWord] = useState<{ word: any; options: string[]; correct: string } | null>(null)
  const speedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startSpeedGame = () => {
    setSpeedActive(true)
    setSpeedTime(30)
    setSpeedScore(0)
    setSpeedStreak(0)
    nextSpeedWord()
    speedTimerRef.current = setInterval(() => {
      setSpeedTime(t => {
        if (t <= 1) {
          if (speedTimerRef.current) clearInterval(speedTimerRef.current)
          setSpeedActive(false)
          setSpeedBest(prev => Math.max(prev, speedScore))
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const nextSpeedWord = () => {
    const w = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    const wrongs = vocabulary.filter(v => v.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.zh)
    const options = [...wrongs, w.zh].sort(() => Math.random() - 0.5)
    setSpeedWord({ word: w, options, correct: w.zh })
  }

  const handleSpeedAnswer = (ans: string) => {
    if (ans === speedWord?.correct) {
      setSpeedScore(s => s + 1)
      setSpeedStreak(s => s + 1)
    } else {
      setSpeedStreak(0)
    }
    nextSpeedWord()
  }

  const currentPairCount = memoryLevelOptions.find(l => l.level === selectedMemoryLevel)?.pairs || 6

  const startToneGame = () => {
    setToneRound(0)
    setToneScore(0)
    setToneAnswer(null)
    setTargetToneIdx(0)
  }

  // Randomize target tone when advancing rounds
  useEffect(() => {
    if (toneRound < tonePairs.length) {
      const set = tonePairs[toneRound % tonePairs.length]
      const maxIdx = set.tones.length - 1
      setTargetToneIdx(Math.floor(Math.random() * (maxIdx + 1)))
    }
  }, [toneRound])

  const currentToneSet = tonePairs[toneRound % tonePairs.length]
  const targetTone = currentToneSet?.tones[targetToneIdx]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-[#1A5FA8]" />
          الألعاب التعليمية
        </h2>
      </div>

      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memory">لعبة الذاكرة</TabsTrigger>
          <TabsTrigger value="tone">تمييز النبرات</TabsTrigger>
          <TabsTrigger value="speed">لعبة السرعة ⚡</TabsTrigger>
        </TabsList>

        {/* Memory Game (Fixed) */}
        <TabsContent value="memory" className="space-y-4">
          {!memoryCards.length ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🧠</div>
                <h3 className="text-lg font-bold text-gray-700">لعبة الذاكرة</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  طابق الكلمة الصينية (الحرف) مع معناها! اختر المستوى وابدأ.
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {memoryLevelOptions.map(l => (
                    <Button
                      key={l.level}
                      variant={selectedMemoryLevel === l.level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMemoryLevel(l.level)}
                      className={selectedMemoryLevel === l.level ? 'bg-[#1A5FA8] hover:bg-[#0D4E82]' : ''}
                    >
                      {l.label}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => { startMemoryGame(selectedMemoryLevel); incrementStreak() }} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>المحاولات: {memoryMoves}</span>
                <span>الأزواج: {memoryPairs}/{currentPairCount}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {memoryCards.map(card => {
                  const isFlipped = memoryFlipped.includes(card.id) || card.matched
                  const isHanzi = card.type === 'hanzi'
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleMemoryClick(card.id)}
                      className={isFlipped
                        ? card.matched
                          ? "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-emerald-300 bg-emerald-50"
                          : "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-red-300 bg-[#FFE5E5]"
                        : "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                      }
                    >
                      {isFlipped ? (
                        isHanzi ? (
                          <div className="font-chinese-serif text-2xl text-gray-900">{card.zh}</div>
                        ) : (
                          <div className="p-1">
                            <div className="font-chinese-sans text-[10px] text-gray-500">{card.pinyin}</div>
                            <div className="text-xs text-gray-800 font-bold leading-tight">{card.ar}</div>
                          </div>
                        )
                      ) : (
                        <div className="text-2xl text-gray-300">?</div>
                      )}
                    </button>
                  )
                })}
              </div>
              {memoryPairs === currentPairCount && (
                <div className="text-center space-y-3 p-6 bg-emerald-50 rounded-xl">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
                  <div className="text-xl font-bold text-emerald-800">فزت! 🎉</div>
                  <div className="text-sm text-emerald-700">أكملت اللعبة في {memoryMoves} محاولة</div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => startMemoryGame(selectedMemoryLevel)} variant="outline">العب مرة أخرى</Button>
                    <Button onClick={() => { store.resetMemoryGame() }} variant="outline">تغيير المستوى</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tone Game (Enhanced) */}
        <TabsContent value="tone" className="space-y-4">
          {toneRound >= tonePairs.length && toneAnswer !== null ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <Trophy className={toneScore >= Math.floor(tonePairs.length * 0.8) ? "w-16 h-16 text-yellow-500" : "w-16 h-16 text-gray-400"} />
                <h3 className="text-xl font-bold text-gray-900">انتهت اللعبة!</h3>
                <div className="text-3xl font-bold text-[#1A5FA8]">{toneScore}/{tonePairs.length}</div>
                <Button onClick={startToneGame} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                  <RotateCcw className="w-4 h-4 ml-2" /> العب مرة أخرى
                </Button>
              </CardContent>
            </Card>
          ) : toneRound < tonePairs.length ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>الجولة {toneRound + 1}/{tonePairs.length}</span>
                  <span>النتيجة: {toneScore}</span>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-sm text-gray-500">اختر النبرة الصحيحة للكلمة:</div>
                  <div className="font-chinese-sans text-lg text-[#1A5FA8]">[{currentToneSet.syllable}]</div>
                  <Button variant="ghost" size="sm" onClick={() => targetTone && speak(targetTone.char)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع للنبرة
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentToneSet.tones.map((t, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className={toneAnswer === i
                        ? (i === targetToneIdx ? "h-auto py-4 flex flex-col items-center gap-1 transition-all border-emerald-500 bg-emerald-50" : "h-auto py-4 flex flex-col items-center gap-1 transition-all border-red-500 bg-[#FFE5E5]")
                        : "h-auto py-4 flex flex-col items-center gap-1 transition-all hover:bg-gray-50"
                      }
                      onClick={() => {
                        if (toneAnswer !== null) return
                        setToneAnswer(i)
                        if (i === targetToneIdx) {
                          setToneScore(s => s + 1)
                        }
                        setTimeout(() => {
                          setToneRound(r => r + 1)
                          setToneAnswer(null)
                        }, 1500)
                      }}
                    >
                      <span className="font-chinese-serif text-3xl">{t.char}</span>
                      <span className="text-xs text-gray-600">{t.pinyin} — النبرة {t.tone}</span>
                      <span className="text-xs text-gray-400">{t.meaning}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🎵</div>
                <h3 className="text-lg font-bold text-gray-700">لعبة تمييز النبرات</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  اختبر قدرتك على تمييز النبرات في اللغة الصينية. {tonePairs.length} مجموعات نبرية للتدرب!
                </p>
                <Button onClick={() => { startToneGame(); incrementStreak() }} className="bg-[#1A5FA8] hover:bg-[#0D4E82]">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SENTENCES SECTION (New)
// ═══════════════════════════════════════════════════════════
function SentencesSection({ sentenceFlipped, setSentenceFlipped, sentenceIndex, setSentenceIndex }: {
  sentenceFlipped: boolean
  setSentenceFlipped: (f: boolean) => void
  sentenceIndex: number
  setSentenceIndex: (i: number) => void
}) {
  const sentence = allSentences[sentenceIndex]

  // Word breakdown from vocabulary
  const wordBreakdown = useMemo(() => {
    if (!sentence) return []
    const breakdown: { char: string; meaning: string; pinyin: string }[] = []
    const chars = sentence.zh.replace(/[。！？，、；：""''（）《》\s]/g, '').split('')
    for (const char of chars) {
      const found = vocabulary.find(w => w.zh === char)
      if (found) {
        breakdown.push({ char, meaning: found.meaning, pinyin: found.pinyin })
      } else {
        // Try multi-char words
        breakdown.push({ char, meaning: '', pinyin: '' })
      }
    }
    return breakdown
  }, [sentence])

  if (!sentence) return <div>لا توجد جمل</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#1A5FA8]" />
          إتقان الجمل
        </h2>
        <Badge variant="secondary">{allSentences.length} جملة</Badge>
      </div>
      <p className="text-gray-500 text-sm">تدرب على الجمل اليومية — انقر على البطاقة لتقلبها</p>

      {/* Sentence Flashcard */}
      <div className="perspective-1000">
        <div
          className={sentenceFlipped ? "relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d rotate-y-180" : "relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d"}
          onClick={() => setSentenceFlipped(!sentenceFlipped)}
          style={{ minHeight: '280px' }}
        >
          {/* Front - Chinese text */}
          <div className="absolute inset-0 backface-hidden">
            <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-[#E8F0FA]">
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-sm text-gray-400 mb-4">اقرأ الجملة:</div>
                <div
                  className="font-chinese-serif text-3xl mb-4 text-gray-900 cursor-pointer hover:text-[#1A5FA8] transition-colors leading-relaxed"
                  onClick={(e) => { e.stopPropagation(); speak(sentence.zh) }}
                >
                  {sentence.zh}
                </div>
                <div className="text-sm text-gray-400 font-chinese-sans">{sentence.pinyin}</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Volume2 className="w-3 h-3" />
                  <span>اضغط للنطق • انقر للقلب</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Back - Arabic + breakdown */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-amber-50 overflow-y-auto custom-scrollbar">
              <CardContent className="flex flex-col items-center h-full p-6 text-center space-y-4">
                <div className="text-sm text-gray-400">الترجمة والتحليل:</div>
                <div className="text-xl font-bold text-gray-900">{sentence.ar}</div>
                <div className="w-full border-t border-gray-200 pt-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">🔤 تحليل الكلمات:</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {wordBreakdown.map((w, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 text-center min-w-[60px]"
                        onClick={(e) => { e.stopPropagation(); if (w.char) speak(w.char) }}>
                        <div className="font-chinese-serif text-lg text-[#0D4E82]">{w.char}</div>
                        {w.meaning && <div className="text-[10px] text-gray-500 mt-0.5">{w.meaning}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); speak(sentence.zh) }}>
                  <Volume2 className="w-4 h-4 ml-1" /> استمع للجملة كاملة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSentenceIndex(Math.max(0, sentenceIndex - 1)); setSentenceFlipped(false) }}
          disabled={sentenceIndex === 0}
        >
          <ChevronRight className="w-4 h-4" />
          السابقة
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { const rand = Math.floor(Math.random() * allSentences.length); setSentenceIndex(rand); setSentenceFlipped(false) }}
        >
          <RotateCcw className="w-4 h-4 ml-1" />
          عشوائي
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSentenceIndex(Math.min(allSentences.length - 1, sentenceIndex + 1)); setSentenceFlipped(false) }}
          disabled={sentenceIndex >= allSentences.length - 1}
        >
          التالية
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        {sentenceIndex + 1} / {allSentences.length}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STORIES SECTION (Enhanced with clickable words)
// ═══════════════════════════════════════════════════════════
function StoriesSection({ activeStory, setActiveStory, storyAnswers, setStoryAnswers }: {
  activeStory: number
  setActiveStory: (s: number) => void
  storyAnswers: Record<number, number>
  setStoryAnswers: (a: Record<number, number>) => void
}) {
  const store = useLearningStore()
  const story = stories[activeStory]

  // Split Chinese text into clickable spans
  const renderClickableChinese = (text: string) => {
    const chars = text.split('')
    return chars.map((char, i) => {
      const isPunctuation = /[。！？，、；：""''（）《》\s]/.test(char)
      if (isPunctuation) {
        return <span key={i} className="font-chinese-serif text-gray-900">{char}</span>
      }
      return (
        <span
          key={i}
          className="font-chinese-serif text-gray-900 cursor-pointer hover:text-[#1A5FA8] hover:bg-[#E8F0FA] rounded px-0.5 transition-colors"
          onClick={() => speak(char)}
          title="اضغط للنطق"
        >
          {char}
        </span>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-[#1A5FA8]" />
          القصص القصيرة
        </h2>
        <Badge variant="secondary">{stories.length} قصص</Badge>
      </div>

      {/* Story Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stories.map((s, i) => (
          <Button
            key={s.id}
            variant={activeStory === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveStory(i); setStoryAnswers({}); store.incrementStreak() }}
            className={activeStory === i ? 'bg-[#1A5FA8] hover:bg-[#0D4E82]' : ''}
          >
            {s.title}
          </Button>
        ))}
      </div>

      {/* Story Content */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="text-lg">{story.title}</div>
              <div className="font-chinese-serif text-sm text-gray-500">{story.titleZh}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => speak(story.content[0].zh)}>
              <Volume2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {story.content.map((line, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => speak(line.zh)}
            >
              <div className="font-chinese-serif text-gray-900 text-lg leading-relaxed">
                {renderClickableChinese(line.zh)}
              </div>
              <div className="text-xs text-gray-500 font-chinese-sans mt-1">{line.pinyin}</div>
              <div className="text-sm text-gray-700 mt-1">{line.ar}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comprehension Questions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-500" />
            أسئلة الفهم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {story.questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <div className="font-chinese-serif text-sm text-gray-800 font-medium">{q.zh}</div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = storyAnswers[qi] === oi
                  const isCorrect = oi === q.correct
                  const answered = storyAnswers[qi] !== undefined
                  let cls = 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  if (answered) {
                    if (isCorrect) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    else if (selected) cls = 'border-red-400 bg-[#FFE5E5] text-red-800'
                  } else if (selected) {
                    cls = 'border-red-300 bg-[#E8F0FA] text-[#0D4E82]'
                  }
                  return (
                    <Button
                      key={oi}
                      variant="outline"
                      size="sm"
                      className={"h-auto py-2 text-xs " + cls}
                      onClick={() => {
                        if (answered) return
                        setStoryAnswers({ ...storyAnswers, [qi]: oi })
                      }}
                    >
                      {opt}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
          {Object.keys(storyAnswers).length === story.questions.length && (
            <div className="text-center pt-2">
              {Object.entries(storyAnswers).every(([qi, oi]) => story.questions[Number(qi)].correct === oi) ? (
                <div className="text-emerald-700 font-bold">🎉 ممتاز! جميع الإجابات صحيحة!</div>
              ) : (
                <div className="text-amber-700 font-medium">حاول مرة أخرى! بعض الإجابات خاطئة.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CHAT SECTION (AI Assistant)
// ═══════════════════════════════════════════════════════════
function ChatSection() {
  const store = useLearningStore()
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.chatMessages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    store.addChatMessage({ role: 'user', content: userMsg })
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const response = getChatResponse(userMsg)
      store.addChatMessage({ role: 'assistant', content: response })
      setIsTyping(false)
    }, 800 + Math.random() * 1200)
  }

  const quickQuestions = [
    'كيف أنطق النبرات؟',
    'اشرح كلمة 你好',
    'أحتاج نصائح للتعلم',
    'الأرقام الصينية',
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="w-6 h-6 text-[#1A5FA8]" />
          المساعد الذكي
        </h2>
        <Button variant="ghost" size="sm" onClick={store.clearChatMessages}>
          <RotateCcw className="w-4 h-4 ml-1" /> مسح
        </Button>
      </div>
      <p className="text-gray-500 text-sm">اسألني عن أي كلمة صينية أو احصل على نصائح للتعلم!</p>

      {/* Chat Messages */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-4" id="chat-container">
            {store.chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E8F0FA] flex items-center justify-center">
                  <Bot className="w-8 h-8 text-[#1A5FA8]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">مرحباً! أنا مساعدك الصيني 🤖</h3>
                  <p className="text-sm text-gray-500 mt-1">اسألني عن أي كلمة أو اطلب نصائح للتعلم</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {quickQuestions.map(q => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setInput(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {store.chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={msg.role === 'user' ? "flex justify-start" : "flex justify-end"}
              >
                <div className={msg.role === 'user'
                    ? "max-w-[80%] rounded-2xl px-4 py-3 bg-[#1A5FA8] text-white rounded-br-sm"
                    : "max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900 rounded-bl-sm"
                }>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot className="w-3 h-3 text-[#1A5FA8]" />
                      <span className="text-xs font-medium text-[#1A5FA8]">المعلم</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex justify-end">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="اكتب سؤالك هنا... (عربي أو صيني)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
          disabled={isTyping}
        />
        <Button onClick={handleSend} className="bg-[#1A5FA8] hover:bg-[#0D4E82]" disabled={!input.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ROADMAP SECTION
// ═══════════════════════════════════════════════════════════
function RoadmapSection() {
  const store = useLearningStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Map className="w-6 h-6 text-[#1A5FA8]" />
          خريطة الطريق
        </h2>
        <Badge variant="secondary">10 ساعات</Badge>
      </div>
      <p className="text-gray-500 text-sm">خطة دراسية مقترحة لإنهاء المستوى الأول خلال 10 ساعات</p>

      <div className="space-y-3">
        {roadmapUnits.map((unit) => {
          const totalWords = unit.words.length
          const learnedCount = unit.words.filter(id => store.isLearned(id)).length
          const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0
          const isComplete = progress === 100

          return (
            <Card key={unit.id} className={isComplete ? "border-0 shadow-sm card-hover transition-all ring-2 ring-emerald-200" : "border-0 shadow-sm card-hover transition-all"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={isComplete
                    ? "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-700"
                    : "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#E8F0FA] text-[#0D4E82]"
                  }>
                    {isComplete ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{unit.id}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{unit.title}</h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {unit.hours} ساعة
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{unit.desc}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-gray-500">{learnedCount}/{totalWords}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{totalWords} كلمة</Badge>
                      {unit.grammarIds.map(gid => {
                        const rule = grammarRules.find(r => r.id === gid)
                        return rule ? (
                          <Badge key={gid} variant="outline" className="text-[10px]">{rule.titleAr}</Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Total Time Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#E8F0FA] to-[#FFF8DB]">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">الإجمالي: 10 ساعات</h3>
          <p className="text-sm text-gray-600">
            بإمكانك إنهاء المستوى الأول خلال أسبوعين إذا تابعت الدراسة يومياً
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1A5FA8]">{roadmapUnits.reduce((a, u) => a + u.words.length, 0)}</div>
              <div className="text-gray-500">كلمة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{roadmapUnits.reduce((a, u) => a + new Set(u.grammarIds).size, 0)}</div>
              <div className="text-gray-500">قاعدة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">10</div>
              <div className="text-gray-500">وحدة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
