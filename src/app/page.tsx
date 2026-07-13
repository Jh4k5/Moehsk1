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
  PanelRightClose, PanelRightOpen, LogOut, Mic, Moon, Sun,
  Settings as SettingsGear
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
import PronunciationPractice from '@/components/PronunciationPractice'
import PomodoroTimer from '@/components/PomodoroTimer'
import OnboardingScreen from '@/components/OnboardingScreen'
import SettingsSection from '@/components/SettingsSection'
import Paywall from '@/components/Paywall'
import { ThemeToggle } from '@/components/theme-toggle'

// ─── SRS Helper
import { isDueForReview, getDifficultyLabel, getWeakWords } from '@/lib/srs'

// ─── AI Tutor Engine + TTS ──────────────────────────────────
import { answerMessage, type TutorQuiz } from '@/lib/tutor/engine'
import { speak } from '@/lib/tts'
import { useActiveLevel } from '@/lib/levels'
import { useI18n, ts, tsPick } from '@/lib/i18n'

// ═══ Error Boundary ═══
class SectionErrorBoundary extends React.Component<
  {children: React.ReactNode; sectionName: string},
  {hasError: boolean; error: string}
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/60">
          <div className="text-4xl">⚠️</div>
          <div className="text-lg font-arabic">حدث خطأ في قسم {this.props.sectionName}</div>
          <div className="text-sm text-[var(--clr-danger)] max-w-md text-center">{this.state.error}</div>
          <button
            onClick={() => this.setState({ hasError: false, error: '' })}
            className="px-4 py-2 j-btn-primary rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Categories (بيانات مشتركة مع labelEn للترجمة) ──────────
import { categories } from '@/data/categories'

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

// ─── Build sentences from vocabulary ─────────────────────────
function buildAllSentences(vocab: VocabWord[]): { zh: string; pinyin: string; ar: string; wordZh: string }[] {
  const seen = new Set<string>()
  const result: { zh: string; pinyin: string; ar: string; wordZh: string }[] = []
  for (const w of vocab) {
    const add = (zh: string, py: string, ar: string) => {
      if (zh && !seen.has(zh)) {
        seen.add(zh)
        result.push({ zh, pinyin: py, ar, wordZh: w.zh })
      }
    }
    for (const s of (w.sentences || [])) add(s.zh, s.pinyin, s.ar)
    add(w.exZh, w.exPinyin, w.exEn)
    if (w.s2) add(w.s2.zh, w.s2.py, w.s2.ar)
    if (w.s3) add(w.s3.zh, w.s3.py, w.s3.ar)
  }
  return result
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
type Section = 'dashboard' | 'vocabulary' | 'grammar' | 'practice' | 'games' | 'stories' | 'roadmap' | 'sentences' | 'chat'
  | 'pinyin' | 'hanzi' | 'exam' | 'conversations' | 'lessons' | 'qa' | 'visual-dict' | 'achievements' | 'settings'

export default function Home() {
  const store = useLearningStore()
  const activeLevel = useActiveLevel()
  const { vocabulary } = activeLevel
  const { t, dir } = useI18n()
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
  const profile = store.profile
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // ترحيل مستخدمي النظام القديم (jisr_currentUser) إلى الملف الشخصي الجديد
  useEffect(() => {
    if (!mounted || profile) return
    try {
      const saved = localStorage.getItem('jisr_currentUser') || localStorage.getItem('mudann_currentUser')
      if (saved) {
        const old = JSON.parse(saved)
        if (old?.name && !old.isGuest) {
          store.setProfile({ name: old.name, avatarEmoji: '🐼', dailyGoal: 10, createdAt: new Date().toISOString() })
        }
        localStorage.removeItem('jisr_currentUser')
        localStorage.removeItem('mudann_currentUser')
        localStorage.removeItem('mudann_users')
      }
    } catch {}
  }, [mounted, profile])

  // تطبيق حجم الحروف الصينية المخصص
  useEffect(() => {
    document.documentElement.style.setProperty('--hanzi-scale', String(store.settings.hanziFontScale))
  }, [store.settings.hanziFontScale])

  // عند تبديل المستوى: إعادة ضبط المؤشرات لتجنّب الخروج عن النطاق
  useEffect(() => {
    store.setFlashcardIndex(0)
    setSentenceIndex(0)
    setActiveStory(0)
    setSearchQuery('')
    setSelectedCategory('all')
    setQuizAnswer(null)
    setQuizFinished(false)
  }, [store.currentLevel])

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

  // ─── Lesson names for sidebar dropdown
  const lessonNames = ['مرحباً يا آي شياو يو', 'اسمي لي ون', 'أنا صيني', 'لدي طفلان', 'أنا أرتاح اليوم', 'ما رقم هاتفك؟', 'أنهي العمل الساعة 6:30 مساءً', 'أبي يعمل أيضاً في المستشفى', 'سأدرس في المدرسة غداً صباحاً', 'التفاح هنا رخيص حقاً!', 'أمطرت الثلوج أمس', 'أنا أدرس في الجامعة', 'من فضلك أعطني كوب شاي', 'شاهدت فيلماً', 'أراكم في مطار داشينغ!']
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
  }, [searchQuery, selectedCategory, hideMastered, isWordMastered, vocabulary])

  // ─── Quiz Generation (30 questions) ──────────────────────
  const sessionSeed = useMemo(() => Date.now(), [])

  const generateQuiz = useCallback(() => {
    const count = 30
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
    const idSet = new Set(vocabulary.map(w => w.id))
    const learned = learnedWords.filter(id => idSet.has(id)).length
    const progress = total > 0 ? Math.round((learned / total) * 100) : 0
    const byCategory = categories.slice(1).map(cat => ({
      ...cat,
      count: vocabulary.filter(w => w.pos === cat.value).length,
      learned: vocabulary.filter(w => w.pos === cat.value && learnedWords.includes(w.id)).length,
    }))
    return { total, learned, progress, byCategory }
  }, [learnedWords, vocabulary])

  // ═══════════════════════════════════════════════════════════
  // ONBOARDING GUARD
  // ═══════════════════════════════════════════════════════════
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#17111f' }}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold text-white">桥</span>
        </div>
      </div>
    )
  }
  if (!profile) {
    return <OnboardingScreen />
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* ─── License gate: trial banner + expiry overlay ── */}
      <Paywall />
      {/* ─── Header ──────────────────────────────────────── */}
      <header className="j-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="j-logo-icon">
              <span className="j-logo-zh">桥</span>
            </div>
            <div className="j-logo-text">
              <span className="j-logo-ar">{t('جِسر', 'JISR')}</span>
              <span className="j-logo-en">JISR · {activeLevel.label}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{color: "var(--text-primary)"}}>{t('جِسر — تعلم الصينية', 'JISR — Learn Chinese')} {activeLevel.label}</h1>
              <p className="text-xs text-[var(--text-tertiary)]">{stats.total} {t('كلمة', 'words')} • {activeLevel.grammarRules.length} {t('قاعدة', 'rules')} • {activeLevel.level === 1 ? t('مستوى مبتدئ', 'Beginner') : t('مستوى ثانٍ', 'Elementary')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* ─── Level switcher (HSK1 / HSK2) ─── */}
            <div className="flex items-center rounded-full bg-[var(--surface-card-h)] border border-[var(--line-default)] p-0.5 shadow-sm">
              {([1, 2] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => store.setLevel(lv)}
                  className={
                    "px-3 py-1 rounded-full text-xs font-bold transition-all " +
                    (store.currentLevel === lv
                      ? "bg-primary text-white shadow"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]")
                  }
                >
                  HSK {lv}
                </button>
              ))}
            </div>
            {/* ─── Language switcher (Arabic / English) ─── */}
            <div className="flex items-center rounded-full bg-[var(--surface-card-h)] border border-[var(--line-default)] p-0.5 shadow-sm">
              {([['ar','ع'],['en','EN']] as const).map(([lg, label]) => (
                <button
                  key={lg}
                  onClick={() => store.setLang(lg)}
                  title={lg === 'ar' ? 'العربية' : 'English'}
                  className={
                    "px-2.5 py-1 rounded-full text-xs font-bold transition-all " +
                    (store.lang === lg
                      ? "bg-[var(--clr-secondary)] text-white shadow"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <ThemeToggle />
            <Badge className="hidden sm:flex gap-1 bg-[var(--clr-warning-bg)] text-[var(--clr-warning)] border-[var(--clr-warning)]/30">
              <Flame className="w-3 h-3" />
              <span>{store.dailyStreak} {t('يوم متتالي', 'day streak')}</span>
            </Badge>
            <Badge className="hidden sm:flex gap-1 bg-[var(--clr-info-bg)] text-[var(--clr-info)] border-[var(--clr-info)]/30">
              <Star className="w-3 h-3" />
              <span>{stats.learned}/{stats.total}</span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* ─── Mobile Sidebar Overlay ─────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ─── Sidebar Navigation ─────────────────────────── */}
        <aside className={
          "j-sidebar fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl " +
          /* Mobile: drawer */
          "w-72 " +
          (sidebarOpen ? "translate-x-0" : "translate-x-full") +
          /* Tablet+: overlay on main */
          " max-lg:shadow-2xl " +
          /* Desktop: fixed right column */
          " lg:sticky lg:top-0 lg:self-start lg:translate-x-0 lg:shadow-none lg:z-auto lg:max-h-screen lg:overflow-y-auto " +
          "lg:custom-scrollbar " +
          (sidebarOpen ? "lg:w-64" : "lg:w-[68px] lg:overflow-hidden") +
          " transition-all duration-300 ease-in-out"
        }>
          <div className="flex flex-col h-full">

            {/* ── Logo + Toggle ── */}
            <div className={"flex items-center gap-3 px-4 py-4 border-b border-white/8 " + (sidebarOpen ? "" : "lg:justify-center lg:px-2")}>
              <div className="w-10 h-10 bg-gradient-to-br j-logo-icon">
                <span className="font-chinese-serif text-white text-xl font-bold">桥</span>
              </div>
              {(sidebarOpen || typeof window === 'undefined') && (
                <div className="flex-1 min-w-0 hidden lg:block">
                  <span className="text-white font-bold text-lg leading-tight block">{t('جِسر', 'JISR')}</span>
                  <span className="j-logo-en">JISR · {activeLevel.label}</span>
                </div>
              )}
              {/* Mobile close */}
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 mr-auto text-[var(--text-muted)] hover:text-white"><X className="w-5 h-5" /></button>
              {/* Desktop toggle */}
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className={"hidden lg:flex p-1 text-[var(--text-muted)] hover:text-white transition-colors " + (sidebarOpen ? "mr-auto" : "mx-auto")}>
                {sidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>
            </div>

            {/* ── User info ── */}
            <div className={"flex items-center gap-3 px-4 py-3 mx-3 mt-3 rounded-xl bg-white/5 " + (sidebarOpen ? "" : "lg:hidden")}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--violet-500)] to-[var(--violet-700)] flex items-center justify-center shrink-0 text-lg">
                {profile.avatarEmoji || '🐼'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{profile.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-[var(--clr-energy)]" />{store.dailyStreak} {t('يوم', 'd')}
                    <Star className="w-3 h-3 text-[var(--clr-info)]" />{learnedWords.length}/{vocabulary.length}
                  </div>
                </div>
              )}
              <button onClick={() => store.clearProfile()} title={t('تبديل الملف الشخصي', 'Switch profile')}
                className={"p-1 text-[var(--text-muted)] hover:text-[var(--clr-danger)] transition-colors " + (sidebarOpen ? "" : "hidden")}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* ── Dashboard (always first) ── */}
            <button onClick={() => { setCurrentSection('dashboard'); if (window.innerWidth < 1024) setSidebarOpen(false) }}
              className={"j-nav-item mx-3 mt-3 " +
                (currentSection === 'dashboard'
                  ? "active"
                  : "text-white/50 hover:bg-white/6 hover:text-white/85"
                )}>
              <span
                className="j-nav-icon flex items-center justify-center rounded-lg transition-all"
                style={{
                  width: '30px', height: '30px',
                  background: currentSection === 'dashboard' ? '#8b5cf6' : '#8b5cf622',
                  color: currentSection === 'dashboard' ? '#fff' : '#a78bfa',
                  boxShadow: currentSection === 'dashboard' ? '0 4px 12px #8b5cf655' : 'none',
                }}
              >
                <LayoutDashboard className="w-4 h-4" />
              </span>
              {sidebarOpen && <span className="j-nav-label">{t('الرئيسية', 'Dashboard')}</span>}
            </button>

            {/* ── Lessons (expandable) ── */}
            <div className="mx-3 mt-1">
              <button onClick={() => { setCurrentSection('lessons'); setLessonsOpen(!lessonsOpen); if (window.innerWidth < 1024) setSidebarOpen(false) }}
                className={"j-nav-item w-full mt-1 " +
                  (currentSection === 'lessons'
                    ? "active"
                    : "text-white/50 hover:bg-white/6 hover:text-white/85"
                  )}>
                <span
                  className="j-nav-icon flex items-center justify-center rounded-lg transition-all"
                  style={{
                    width: '30px', height: '30px',
                    background: currentSection === 'lessons' ? '#f97316' : '#f9731622',
                    color: currentSection === 'lessons' ? '#fff' : '#fb923c',
                    boxShadow: currentSection === 'lessons' ? '0 4px 12px #f9731655' : 'none',
                  }}
                >
                  <BookOpenText className="w-4 h-4" />
                </span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-right j-nav-label">{t('الدروس', 'Lessons')}</span>
                    <span className="text-[10px] text-white/25 transition-transform duration-200 inline-block" style={{ transform: lessonsOpen ? 'rotate(90deg)' : 'rotate(0)' }}>▸</span>
                  </>
                )}
              </button>
              {lessonsOpen && sidebarOpen && (
                <div className="mr-8 mt-1 mb-2 space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar border-r border-white/8 pr-3">
                  {lessonNames.map((ln, i) => (
                    <button key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentSection('lessons'); if (window.innerWidth < 1024) setSidebarOpen(false) }}
                      className="w-full text-right text-xs text-white/40 hover:text-white/80 hover:bg-white/5 py-1.5 px-3 rounded-lg transition-all truncate">
                      {i + 1}. {ln}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Section groups ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-1 px-0 space-y-3 mt-2">
              {[
                { title: 'التعلم', titleEn: 'Learn', items: [
                  { id: 'vocabulary' as Section, label: 'المفردات والنطق', labelEn: 'Vocabulary', icon: BookOpen, color: '#fbbf24' },
                  { id: 'grammar' as Section, label: 'القواعد', labelEn: 'Grammar', icon: GraduationCap, color: '#38bdf8' },
                  { id: 'sentences' as Section, label: 'الجمل', labelEn: 'Sentences', icon: MessageCircle, color: '#34d399' },
                  { id: 'stories' as Section, label: 'القصص', labelEn: 'Stories', icon: BookMarked, color: '#f472b6' },
                  { id: 'conversations' as Section, label: 'المحادثات', labelEn: 'Conversations', icon: MessageSquare, color: '#2dd4bf' },
                ]},
                { title: 'التدريب', titleEn: 'Practice', items: [
                  { id: 'practice' as Section, label: 'التمارين', labelEn: 'Exercises', icon: Target, color: '#fb923c' },
                  { id: 'games' as Section, label: 'الألعاب', labelEn: 'Games', icon: Gamepad2, color: '#fb7185' },
                  { id: 'exam' as Section, label: 'محاكي الامتحان', labelEn: 'Exam Simulator', icon: FileText, color: '#818cf8' },
                  { id: 'qa' as Section, label: 'أسئلة يومية', labelEn: 'Daily Q&A', icon: HelpCircle, color: '#a3e635' },
                ]},
                { title: 'الأدوات', titleEn: 'Tools', items: [
                  { id: 'visual-dict' as Section, label: 'القاموس البصري', labelEn: 'Visual Dictionary', icon: Image, color: '#e879f9' },
                  { id: 'pinyin' as Section, label: 'البينين', labelEn: 'Pinyin', icon: Languages, color: '#22d3ee' },
                  { id: 'hanzi' as Section, label: 'الحروف', labelEn: 'Characters', icon: PenTool, color: '#f87171' },
                  { id: 'pronunciation' as Section, label: 'تدريب النطق', labelEn: 'Pronunciation', icon: Mic, color: '#c084fc' },
                ]},
                { title: 'أخرى', titleEn: 'More', items: [
                  { id: 'roadmap' as Section, label: 'خريطة الطريق', labelEn: 'Roadmap', icon: Map, color: '#4ade80' },
                  { id: 'achievements' as Section, label: 'الإنجازات', labelEn: 'Achievements', icon: Medal, color: '#facc15' },
                  { id: 'chat' as Section, label: 'المساعد الذكي', labelEn: 'AI Tutor', icon: Bot, color: '#60a5fa' },
                  { id: 'settings' as Section, label: 'الإعدادات', labelEn: 'Settings', icon: SettingsGear, color: '#cbd5e1' },
                ]},
              ].map(group => (
                <div key={group.title}>
                  {sidebarOpen && (
                    <div className="text-[10px] font-bold j-nav-divider mb-1.5 px-6">{t(group.title, group.titleEn)}</div>
                  )}
                  <div className="space-y-0.5 px-3">
                    {group.items.map(item => (
                      <button key={item.id}
                        onClick={() => { setCurrentSection(item.id); if (window.innerWidth < 1024) setSidebarOpen(false) }}
                        className={
                          "j-nav-item w-full relative group " +
                          (sidebarOpen ? "px-3 py-2.5" : "justify-center px-2 py-2.5") + " " +
                          (currentSection === item.id
                            ? "active"
                            : "text-white/50 hover:bg-white/6 hover:text-white/85"
                          )
                        }>
                        <span
                          className="j-nav-icon flex items-center justify-center rounded-lg transition-all"
                          style={{
                            width: '30px', height: '30px',
                            background: currentSection === item.id ? item.color : item.color + '22',
                            color: currentSection === item.id ? '#fff' : item.color,
                            boxShadow: currentSection === item.id ? `0 4px 12px ${item.color}55` : 'none',
                          }}
                        >
                          <item.icon className="w-4 h-4" />
                        </span>
                        {sidebarOpen && <span className="j-nav-label truncate">{t(item.label, item.labelEn)}</span>}
                        {!sidebarOpen && (
                          <div className="absolute right-full mr-2 px-2 py-1 j-tooltip">
                            {t(item.label, item.labelEn)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Progress footer ── */}
            <div className={"p-3 border-t border-white/8 " + (sidebarOpen ? "" : "lg:hidden")}>
              <div className="sidebar-progress bg-white/5 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">{ts('التقدم العام','Overall progress')}</span>
                  <span className="text-xs text-[var(--violet-300)] font-bold">{stats.progress}%</span>
                </div>
                <div className="progress-duo mb-1">
                  <div className="progress-duo-fill" style={{ width: stats.progress + '%' }} />
                </div>
                <div className="text-[10px] text-white/30 text-center">{stats.learned}/{stats.total} {t('كلمة', 'words')}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Mobile Bottom Navigation ──────────────────── */}
        <nav className="j-bottom-nav lg:hidden">
          {[
            { id: 'dashboard' as Section, label: 'الرئيسية', labelEn: 'Home', icon: LayoutDashboard },
            { id: 'lessons' as Section, label: 'الدروس', labelEn: 'Lessons', icon: BookOpenText },
            { id: 'vocabulary' as Section, label: 'المفردات', labelEn: 'Vocab', icon: BookOpen },
            { id: 'practice' as Section, label: 'تمارين', labelEn: 'Practice', icon: Target },
            { id: 'chat' as Section, label: 'المساعد', labelEn: 'Tutor', icon: Bot },
          ].map(item => (
            <button key={item.id}
              onClick={() => { setCurrentSection(item.id); incrementStreak() }}
              className={"flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[50px] transition-colors " +
                (currentSection === item.id ? "j-bottom-nav-item active" : "j-bottom-nav-item")
              }>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{t(item.label, item.labelEn)}</span>
            </button>
          ))}
          <button onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[50px] j-bottom-nav-item transition-colors">
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t('المزيد', 'More')}</span>
          </button>
        </nav>

        {/* ─── Mobile Header Hamburger ──────────────────── */}
        <button onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 right-4 z-50 bg-[var(--surface-card)] backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-[var(--line-default)] hover:bg-[var(--surface-card-h)] transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="5" x2="17" y2="5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="15" x2="17" y2="15" /></svg>
        </button>

        {/* ─── Main Content ──────────────────────────────── */}
        <main className="j-main-content flex-1 min-h-screen overflow-y-auto w-full p-4 md:p-6 pb-24 lg:pb-6 animate-fade-in" key={currentSection}>
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
                <SectionErrorBoundary sectionName='التمارين'>
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
</SectionErrorBoundary>
              )}
              {currentSection === 'games' && (
                <SectionErrorBoundary sectionName='الألعاب'>
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
</SectionErrorBoundary>
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
              {currentSection === 'pronunciation' && <SectionErrorBoundary sectionName='تدريب النطق'><PronunciationPractice /></SectionErrorBoundary>}
              {currentSection === 'hanzi' && <SectionErrorBoundary sectionName='الحروف'><HanziSection /></SectionErrorBoundary>}
              {currentSection === 'exam' && <ExamSimulator />}
              {currentSection === 'conversations' && <ConversationsSection />}
              {currentSection === 'lessons' && <LessonSystem />}
              {currentSection === 'qa' && <QASection />}
              {currentSection === 'visual-dict' && <VisualDictionary />}
              {currentSection === 'achievements' && <AchievementsSection />}
              {currentSection === 'settings' && <SectionErrorBoundary sectionName='الإعدادات'><SettingsSection /></SectionErrorBoundary>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="hidden lg:block border-t border-[var(--line-default)] bg-[var(--surface-card)] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-[var(--text-muted)]">
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
  stats: { total: number; learned: number; progress: number; byCategory: { value: string; label: string; labelEn?: string; count: number; learned: number }[] }
  onNavigate: (s: Section) => void
}) {
  const store = useLearningStore()
  const dashLevel = useActiveLevel()
  const todayKey = new Date().toDateString()
  const todayWords = store.dailyActivity[todayKey]?.wordsLearned || 0
  const dailyGoal = store.profile?.dailyGoal || 10
  const goalPct = Math.min(100, Math.round((todayWords / dailyGoal) * 100))
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="text-2xl">{store.profile?.avatarEmoji || '🐼'}</span>
            {ts('أهلاً', 'Welcome,')} {store.profile?.name || ts('بك', 'friend')}!
          </h2>
          <p className="text-[var(--text-muted)] mt-1">
            {goalPct >= 100
              ? ts('🎉 أنجزت هدفك اليومي — استمر إن أردت المزيد!', '🎉 Daily goal reached — keep going if you like!')
              : ts(`هدف اليوم: ${todayWords} من ${dailyGoal} كلمات جديدة`, `Today's goal: ${todayWords} of ${dailyGoal} new words`)}
          </p>
        </div>
        {/* حلقة تقدم الهدف اليومي */}
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line-default)" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--clr-primary)" strokeWidth="3.5"
              strokeLinecap="round" strokeDasharray={`${goalPct * 0.974} 100`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
            {goalPct}%
          </div>
        </div>
      </div>

      {/* Stats Cards — stat tiles: hero number + label in text ink, icon chip carries the hue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: ts('كلمة محفوظة', 'Words learned'), value: stats.learned, total: stats.total, icon: BookOpen, color: 'from-[var(--clr-primary)] to-[var(--clr-primary-h)]' },
          { label: ts('قاعدة نحوية', 'Grammar rules'), value: dashLevel.grammarRules.length, icon: GraduationCap, color: 'from-[var(--clr-warning)] to-[var(--amber-600)]' },
          { label: ts('أيام متتالية', 'Day streak'), value: store.dailyStreak, icon: Flame, color: 'from-[var(--clr-energy)] to-[var(--orange-400)]' },
          { label: ts('مستوى التقدم', 'Progress'), value: `${stats.progress}%`, icon: Trophy, color: 'from-[var(--clr-success)] to-[var(--emerald-600)]' },
        ].map((stat, i) => (
          <Card key={i} className="j-stat-card card-hover border-0">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
              <div className={"j-stat-icon bg-gradient-to-br " + stat.color}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="j-stat-number leading-none">
                {stat.value}
                {stat.total ? <span className="text-sm font-semibold text-[var(--text-muted)]"> / {stat.total}</span> : null}
              </div>
              <div className="j-stat-label">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{ts('التقدم حسب الفئة','Progress by category')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.byCategory.map((cat) => (
            <div key={cat.value} className="flex items-center gap-3">
              <span className="text-sm w-28 shrink-0 text-[var(--text-secondary)] text-start truncate">{tsPick(cat.label, cat.labelEn)}</span>
              <div className="flex-1">
                <div className="j-progress-bar">
                  <div className="j-progress-fill" style={{ width: `${cat.count > 0 ? (cat.learned / cat.count) * 100 : 0}%` }} />
                </div>
              </div>
              <span className="text-xs text-[var(--text-muted)] w-14 shrink-0 text-end tabular-nums" dir="ltr">{cat.learned}/{cat.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pomodoro Timer */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">🍅</span>
            {ts('مؤقت بومودورو', 'Pomodoro Timer')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PomodoroTimer />
        </CardContent>
      </Card>

      {/* Weak Words — SRS Priority */}
      <WeakWordsSection onNavigate={onNavigate} />

      {/* Daily Plan */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--clr-success-bg)] flex items-center justify-center text-sm">📋</span>
            {ts('خطة اليوم', "Today's Plan")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { label: ts('راجع البطاقات المستحقة', 'Review due flashcards'), icon: '🔄', section: 'vocabulary' as Section, done: false },
              { label: ts('أكمل تمرين واحد', 'Complete one exercise'), icon: '✏️', section: 'practice' as Section, done: false },
              { label: ts('اقرأ قصة قصيرة', 'Read a short story'), icon: '📖', section: 'stories' as Section, done: false },
              { label: ts('تدرّب على المحادثات', 'Practice conversations'), icon: '💬', section: 'conversations' as Section, done: false },
            ].map((task) => (
              <button
                key={task.label}
                onClick={() => onNavigate(task.section)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-card-h)] hover:bg-[var(--clr-primary)]/10 transition-colors text-start"
              >
                <span className="text-lg">{task.icon}</span>
                <span className="text-sm font-medium text-[var(--text-secondary)]">{task.label}</span>
                <span className="ms-auto text-xs text-[var(--text-muted)]">{ts('←', '→')}</span>
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
  const { vocabulary } = useActiveLevel()
  const store = useLearningStore()
  const { srsCards } = store
  const weakWordIds = getWeakWords(
    Object.values(srsCards) as any,
    5
  )
  const weakWords = vocabulary.filter(w => weakWordIds.includes(w.id))

  if (weakWords.length === 0) {
    return (
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--clr-warning-bg)] flex items-center justify-center text-sm">🎯</span>
            {ts('كلمات تحتاج مراجعة','Words to review')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            {ts('لا توجد كلمات ضعيفة بعد! استمر في التعلم 🌟','No weak words yet! Keep learning 🌟')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="j-card border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[var(--clr-warning-bg)] flex items-center justify-center text-sm">🎯</span>
          {ts('كلمات تحتاج انتباهك','Words needing attention')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {weakWords.map(w => (
            <button
              key={w.id}
              onClick={() => onNavigate('vocabulary')}
              className="px-3 py-2 rounded-xl bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30 text-sm hover:bg-[var(--clr-warning)]/20 transition-colors flex items-center gap-2"
            >
              <span className="font-chinese-serif font-bold text-[var(--text-primary)]">{w.zh}</span>
              <span className="text-xs text-[var(--text-muted)]">{tsPick(w.meaning, w.english)}</span>
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
  const { vocabulary } = useActiveLevel()
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

  // Use word.sentences[] — guaranteed 3 per word
  const wordSentences = useMemo(() => {
    if (!word) return []
    if (word.sentences && word.sentences.length > 0) {
      return word.sentences.slice(0, 3)
    }
    // Fallback: build from exZh + s2 + s3
    const sents: { zh: string; pinyin: string; ar: string }[] = []
    if (word.exZh) sents.push({ zh: word.exZh, pinyin: word.exPinyin, ar: word.exEn })
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
        color: bestSim >= 70 ? 'var(--clr-success)' : 'var(--clr-danger)',
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
      store.rateWord(w.id, 4)
      setSessionCorrect(p => p + 1)
      setLearnCompleted(p => p + 1)
    } else {
      store.rateWord(w.id, 1)
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
  }, [learnInput, deck, learnIndex, markSeen, store])

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
      store.rateWord(q.word.id, 4)
      setTestScore(p => p + 1)
      setSessionCorrect(p => p + 1)
    } else {
      store.rateWord(q.word.id, 1)
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
  }, [testAnswer, testIndex, testQuestions, markSeen, store])

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

  // ── SRS rate handlers ──
  const handleKnowIt = () => {
    if (!word) return
    store.rateWord(word.id, 4)
    store.incrementStreak()
    setPronResult(null)
    if (store.flashcardIndex < deck.length - 1) {
      store.setFlashcardIndex(store.flashcardIndex + 1)
    }
  }
  const handleDontKnow = () => {
    if (!word) return
    store.rateWord(word.id, 1)
    setPronResult(null)
    if (store.flashcardIndex < deck.length - 1) {
      store.setFlashcardIndex(store.flashcardIndex + 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header + Due Counter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {ts('المفردات','Vocabulary')}
          </h2>
          {dueCount > 0 && (
            <Badge className="bg-[var(--clr-warning-bg)] text-[var(--clr-warning)] border-[var(--clr-warning)]/30 hover:bg-[var(--clr-warning)]/10 gap-1 px-3 py-1">
              🎯 {dueCount} بطاقة مستحقة اليوم
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={hideMastered ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setHideMastered(v => !v)}>
            {hideMastered ? ts('✓ إخفاء المحفوظ','✓ Hide mastered') : ts('إخفاء المحفوظ','Hide mastered')}
          </Badge>
          <Badge variant="secondary">{filteredVocab.length} كلمة</Badge>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <Input
            placeholder={ts('ابحث بالصينية أو البنيني أو العربية...','Search Chinese, pinyin, or English...')}
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
              <SelectItem key={c.value} value={c.value}>{tsPick(c.label, (c as any).labelEn)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No words message */}
      {deck.length === 0 ? (
        <Card className="j-card border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-muted)]">{ts('لا توجد كلمات في هذا التصنيف','No words in this category')}</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'cards' | 'learn' | 'test' | 'match')}>
          {/* Tab bar + Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-2">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="cards" className="text-xs sm:text-sm gap-1">
                <BookOpen className="w-3.5 h-3.5 hidden sm:inline" />
                {ts('البطاقات','Cards')}
              </TabsTrigger>
              <TabsTrigger value="learn" className="text-xs sm:text-sm gap-1">
                <Brain className="w-3.5 h-3.5 hidden sm:inline" />
                {ts('تعلّم','Learn')}
              </TabsTrigger>
              <TabsTrigger value="test" className="text-xs sm:text-sm gap-1">
                <Target className="w-3.5 h-3.5 hidden sm:inline" />
                {ts('اختبار','Test')}
              </TabsTrigger>
              <TabsTrigger value="match" className="text-xs sm:text-sm gap-1">
                <Gamepad2 className="w-3.5 h-3.5 hidden sm:inline" />
                {ts('مطابقة','Match')}
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={doShuffle} className="text-xs gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                {ts('إعادة ترتيب','Shuffle')}
              </Button>
              <Button size="sm" variant="outline" onClick={doReset} className="text-xs gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                {ts('إعادة تعيين','Reset')}
              </Button>
              {/* Session stats */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)] mr-2">
                {sessionSeen.size > 0 && <Badge variant="outline" className="text-xs">📅 {sessionSeen.size}</Badge>}
                {sessionCorrect > 0 && <Badge className="text-xs bg-[var(--clr-success-bg)] text-[var(--clr-success)] border-0">✓ {sessionCorrect}</Badge>}
                {sessionIncorrect > 0 && <Badge className="text-xs bg-[var(--clr-danger-bg)] text-[var(--clr-danger)] border-0">✗ {sessionIncorrect}</Badge>}
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
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>{store.flashcardIndex + 1} {ts('من','of')} {deck.length}</span>
                    <span>{sessionSeen.size > 0 ? 'شوهد ' + sessionSeen.size : ''}</span>
                  </div>
                </div>

                {/* ═══ Flashcard ═══ */}
                <div
                  ref={cardRef}
                  className="j-flashcard"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  style={{ perspective: '1400px' }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {!store.isFlipped ? (
                    <motion.div
                      key={`front-${word.id}`}
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="relative w-full max-w-lg mx-auto cursor-pointer"
                      onClick={() => { store.flip(); markSeen(word.id); setPronResult(null) }}
                    >
                      {/* ── FRONT FACE ── */}
                      <div>
                        <Card className="j-hero-card border-0 shadow-2xl bg-gradient-to-br from-white via-primary/5 to-primary/10 rounded-3xl" style={{ minHeight: '420px' }}>
                          <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center gap-4" style={{ minHeight: '420px' }}>
                            {/* Character — Very Large Serif */}
                            <div
                              className="font-chinese-serif text-8xl sm:text-9xl text-[var(--text-primary)] select-none leading-none"
                            >
                              {word.zh}
                            </div>
                            {/* Pinyin */}
                            <div className="text-xl sm:text-2xl text-[var(--text-muted)] font-chinese-sans tracking-wide">
                              {word.pinyin}
                            </div>
                            {/* TTS Listen Button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--surface-card)]/80 border border-[var(--line-default)] text-[var(--text-tertiary)] hover:bg-[var(--clr-primary)]/10 hover:border-primary hover:text-primary transition-all shadow-sm"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span className="text-sm font-medium">{ts('🔊 استمع','🔊 Listen')}</span>
                            </button>
                            {/* POS badge */}
                            <Badge variant="outline" className="text-xs">{word.pos}</Badge>
                            {/* Hint */}
                            <div className="text-xs text-[var(--text-muted)] mt-2">
                              ─────── {ts('اضغط للقلب','tap to flip')} ──────
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                    ) : (
                    <motion.div
                      key={`back-${word.id}`}
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: -90 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="relative w-full max-w-lg mx-auto"
                    >
                      {/* ── BACK FACE ── */}
                      <div>
                        <Card className="j-flashcard-back border-0 shadow-2xl bg-gradient-to-br from-white via-[var(--surface-card-h)] to-[var(--clr-warning-bg)] rounded-3xl">
                          {/* زر القلب للأمام */}
                          <button
                            onClick={() => { store.flip(); setPronResult(null) }}
                            className="absolute top-3 left-3 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--surface-card)]/80 border border-[var(--line-default)] text-xs text-[var(--text-tertiary)] hover:text-primary hover:border-primary transition-all shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {ts('قلب', 'Flip')}
                          </button>
                          <CardContent className="flex flex-col p-5 sm:p-6 text-center gap-2">
                            {/* Meaning — Large */}
                            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                              {tsPick(word.meaning, word.english)}
                            </div>

                            {/* Chinese character + pinyin (smaller) */}
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-chinese-serif text-3xl text-primary">{word.zh}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); speak(word.zh) }}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--clr-info-bg)] hover:bg-[var(--clr-info)]/20 transition-colors"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-primary" />
                              </button>
                              <span className="text-sm text-[var(--text-muted)] font-chinese-sans">{word.pinyin}</span>
                            </div>

                            {/* Memory Tip */}
                            {word.mnemonic && (
                              <div className="bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30 rounded-xl px-4 py-2 text-sm text-[var(--clr-warning)] flex items-start gap-2">
                                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--clr-warning)]" />
                                <span>{ts('تذكّر', 'Tip')}: {word.mnemonic}</span>
                              </div>
                            )}

                            {/* ── Separator ── */}
                            <div className="border-t border-[var(--line-default)] my-1"></div>

                            {/* ── Sentences ── */}
                            <div className="text-right w-full">
                              <div className="text-xs font-bold text-[var(--text-muted)] mb-2 text-center">{ts('📝 الجمل:','📝 Sentences:')}</div>
                              <div className="space-y-2">
                                {wordSentences.map((s, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--line-subtle)] hover:bg-[var(--surface-card-h)] cursor-pointer transition-colors text-right"
                                    onClick={(e) => { e.stopPropagation(); speak(s.zh) }}
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-chinese-serif text-sm text-[var(--text-primary)]">{s.zh}</div>
                                      <div className="text-xs text-[var(--text-muted)] font-chinese-sans">{s.pinyin}</div>
                                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.ar}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* ── Separator ── */}
                            <div className="border-t border-[var(--line-default)] my-1"></div>

                            {/* ── Pronunciation Button (Prominent) ── */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isRecording) { stopPronRecording() } else { startPronRecording() }
                              }}
                              className={
                                "flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl transition-all duration-200 shadow-lg mx-auto " +
                                (isRecording
                                  ? "bg-[var(--clr-danger-bg)]0 text-white scale-105 animate-pulse"
                                  : "bg-primary text-white hover:brightness-110 hover:shadow-xl")
                              }
                            >
                              <Mic size={20} />
                              <span className="text-sm font-bold">
                                {isRecording ? '🔴 جارٍ التسجيل...' : '🎤 انطق الكلمة'}
                              </span>
                            </button>

                            {/* ── Pronunciation Result ── */}
                            {pronResult && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center text-sm py-2 px-4 rounded-xl"
                                style={{ background: pronResult.color + '12', color: pronResult.color, border: '1px solid ' + pronResult.color + '30' }}
                              >
                                <div className="font-bold">{pronResult.msg}</div>
                                <div className="text-xs mt-0.5 opacity-75">قلت: {pronResult.spoken} • النتيجة: {pronResult.score}%</div>
                              </motion.div>
                            )}

                            {/* ── SRS Buttons ── */}
                            <div className="flex items-center gap-3 mt-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleKnowIt() }}
                                className="j-btn-success flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white font-bold text-sm transition-all shadow-md hover:shadow-lg"
                              >
                                <Check className="w-5 h-5" />
                                أعرفها ✅
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDontKnow() }}
                                className="j-btn-ghost flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-[var(--clr-danger)]/30 text-[var(--clr-danger)] hover:bg-[var(--clr-danger-bg)] font-bold text-sm transition-all"
                              >
                                <X className="w-5 h-5" />
                                لا أعرفها ❌
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center justify-between max-w-lg mx-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => store.setFlashcardIndex(store.flashcardIndex - 1)}
                    disabled={store.flashcardIndex === 0}
                    className="rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {ts('السابق','Previous')}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={store.isLearned(word.id) ? 'default' : 'outline'}
                      onClick={(e) => { e.stopPropagation(); store.toggleLearned(word.id); store.incrementStreak() }}
                      className={store.isLearned(word.id) ? 'bg-[var(--clr-success)] hover:bg-[var(--clr-success-h)] rounded-xl' : 'rounded-xl'}
                    >
                      {store.isLearned(word.id) ? <><Check className="w-4 h-4 ml-1" /> {ts('تم الحفظ','Saved')}</> : <><Star className="w-4 h-4 ml-1" /> حفظ</>}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => store.setFlashcardIndex(store.flashcardIndex + 1)}
                    disabled={store.flashcardIndex >= deck.length - 1}
                    className="rounded-xl"
                  >
                    {ts('التالي','Next')}
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>

                {/* Word List (collapsed) */}
                <Card className="j-card border-0 shadow-sm">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="list" className="border-0">
                      <AccordionTrigger className="py-3 text-sm font-medium text-[var(--text-secondary)]">
                        {ts('قائمة الكلمات','Word list')} ({deck.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
                          {deck.map((w, i) => (
                            <button
                              key={w.id}
                              onClick={() => store.setFlashcardIndex(i)}
                              className={
                                store.isLearned(w.id)
                                  ? "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors hover:bg-[var(--surface-card-h)] bg-[var(--clr-success-bg)]/50"
                                  : "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors hover:bg-[var(--surface-card-h)]"
                              }
                            >
                              <span className="font-chinese-serif text-lg w-20 text-[var(--text-primary)]">{w.zh}</span>
                              <span className="text-xs text-[var(--text-muted)] font-chinese-sans w-28">{w.pinyin}</span>
                              <span className="text-sm text-[var(--text-secondary)] flex-1">{w.meaning}</span>
                              {sessionSeen.has(w.id) && <Eye className="w-3.5 h-3.5 text-[var(--clr-info)]" />}
                              {store.isLearned(w.id) && <Check className="w-4 h-4 text-[var(--clr-success)]" />}
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
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>{ts('السؤال','Question')} {learnIndex + 1} {ts('من','of')} {deck.length}</span>
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
                    <Card className="j-card border-0 shadow-xl bg-gradient-to-br from-white to-primary/10 rounded-2xl">
                      <CardContent className="p-6 sm:p-8 text-center space-y-6">
                        <div className="text-sm text-[var(--text-muted)]">{ts('ما معنى هذه الكلمة؟','What does this word mean?')}</div>
                        <div
                          className="font-chinese-serif text-7xl sm:text-8xl text-[var(--text-primary)] cursor-pointer hover:text-primary transition-colors mx-auto"
                          onClick={() => speak(deck[learnIndex].zh)}
                        >
                          {deck[learnIndex].zh}
                        </div>
                        <div className="text-lg text-[var(--text-muted)] font-chinese-sans">{deck[learnIndex].pinyin}</div>

                        {/* Memory tip in learn mode */}
                        {deck[learnIndex].mnemonic && (
                          <div className="bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30 rounded-xl px-4 py-2 text-sm text-[var(--clr-warning)] flex items-start gap-2 mx-auto max-w-md">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--clr-warning)]" />
                            <span>{deck[learnIndex].mnemonic}</span>
                          </div>
                        )}

                        {/* Input */}
                        <div className="max-w-md mx-auto space-y-3">
                          <Input
                            placeholder={ts('اكتب المعنى بالعربية...','Type the meaning...')}
                            value={learnInput}
                            onChange={(e) => setLearnInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') checkLearnAnswer() }}
                            className={
                              learnFeedback === 'correct' ? 'border-[var(--clr-success)] bg-[var(--clr-success-bg)]'
                                : learnFeedback === 'incorrect' ? 'border-[var(--clr-danger)] bg-[var(--clr-danger-bg)]'
                                : ''
                            }
                            dir="rtl"
                            disabled={learnFeedback !== null}
                          />
                          <div className="flex gap-2 justify-center">
                            <Button onClick={checkLearnAnswer} disabled={learnFeedback !== null || !learnInput.trim()} className="bg-primary hover:brightness-110 rounded-xl">
                              تحقق
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => speak(deck[learnIndex].zh)} className="rounded-xl">
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
                                ? "bg-[var(--clr-success-bg)] border border-[var(--clr-success)]/30 rounded-xl p-4"
                                : "bg-[var(--clr-danger-bg)] border border-[var(--clr-danger)]/30 rounded-xl p-4"
                            }
                          >
                            {learnFeedback === 'correct' ? (
                              <div className="flex items-center justify-center gap-2 text-[var(--clr-success)]">
                                <Check className="w-5 h-5" />
                                <span className="font-bold">{ts('أحسنت! صحيح','Correct! Well done')}</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-2 text-[var(--clr-danger)]">
                                  <X className="w-5 h-5" />
                                  <span className="font-bold">{ts('إجابة خاطئة','Wrong answer')}</span>
                                </div>
                                <div className="text-sm text-[var(--text-tertiary)]">
                                  الإجابة الصحيحة: <span className="font-bold">{deck[learnIndex].meaning}</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Skip */}
                        {learnFeedback === null && (
                          <button
                            className="text-xs j-bottom-nav-item transition-colors"
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
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-[var(--clr-warning)] mx-auto" />
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{ts('انتهى التعلّم! 🎉','Learning complete! 🎉')}</h3>
                    <div className="text-[var(--text-muted)] space-y-1">
                      <p>✓ {ts('صحيح','Correct')}: <span className="text-[var(--clr-success)] font-bold">{sessionCorrect}</span></p>
                      <p>✗ {ts('خاطئ','Wrong')}: <span className="text-[var(--clr-danger)] font-bold">{sessionIncorrect}</span></p>
                      <p>{ts('النسبة','Accuracy')}: <span className="text-primary font-bold">{deck.length > 0 ? Math.round((sessionCorrect / deck.length) * 100) : 0}%</span></p>
                    </div>
                    <Button onClick={initLearn} className="bg-primary hover:brightness-110 rounded-xl">
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
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Target className="w-12 h-12 text-primary mx-auto" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{ts('اختبار سريع','Quick Quiz')}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      10 أسئلة اختيار متعدد من المجموعة الحالية
                    </p>
                    <Button onClick={initTest} className="bg-primary hover:brightness-110 rounded-xl">
                      ابدأ الاختبار
                    </Button>
                  </CardContent>
                </Card>
              ) : testFinished ? (
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-[var(--clr-warning)] mx-auto" />
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{ts('نتيجة الاختبار 🎉','Quiz Result 🎉')}</h3>
                    <div className="text-[var(--text-muted)] space-y-1">
                      <p className="text-3xl font-bold text-primary">{testScore} / {testQuestions.length}</p>
                      <p>{ts('النسبة','Accuracy')}: {Math.round((testScore / testQuestions.length) * 100)}%</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={initTest} className="bg-primary hover:brightness-110 rounded-xl">
                        اختبار جديد
                      </Button>
                      <Button variant="outline" onClick={() => setTestQuestions([])} className="rounded-xl">
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
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
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
                      <Card className="j-card border-0 shadow-xl bg-gradient-to-br from-white to-primary/10 rounded-2xl">
                        <CardContent className="p-6 sm:p-8 text-center space-y-6">
                          <div className="text-sm text-[var(--text-muted)]">{ts('اختر المعنى الصحيح','Choose the correct meaning')}</div>
                          <div
                            className="font-chinese-serif text-6xl sm:text-7xl text-[var(--text-primary)] cursor-pointer hover:text-primary transition-colors"
                            onClick={() => speak(testQuestions[testIndex].word.zh)}
                          >
                            {testQuestions[testIndex].word.zh}
                          </div>
                          <div className="text-base text-[var(--text-muted)] font-chinese-sans">{testQuestions[testIndex].word.pinyin}</div>

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
                                      ? "p-3 rounded-xl border-2 border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)] font-medium text-sm transition-all"
                                      : isAnswered && isSelected && !isCorrect
                                        ? "p-3 rounded-xl border-2 border-[var(--clr-danger)] bg-[var(--clr-danger-bg)] text-[var(--clr-danger)] font-medium text-sm transition-all"
                                        : "p-3 rounded-xl border-2 border-[var(--line-default)] bg-[var(--surface-card)] hover:border-primary hover:bg-[var(--clr-primary)]/10 text-[var(--text-secondary)] font-medium text-sm transition-all cursor-pointer"
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
                              className="text-sm text-[var(--text-muted)]"
                            >
                              {!isSelectedCorrect(testAnswer, testQuestions[testIndex].correctIdx) && (
                                <span>
                                  الإجابة الصحيحة: <span className="font-bold text-[var(--clr-success)]">{testQuestions[testIndex].options[testQuestions[testIndex].correctIdx]}</span>
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
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Gamepad2 className="w-12 h-12 text-primary mx-auto" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{ts('لعبة المطابقة','Matching Game')}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      طابق بين 6 أزواج من الكلمات الصينية ومعانيها بالعربية في أسرع وقت!
                    </p>
                    <Button onClick={initMatch} className="bg-primary hover:brightness-110 rounded-xl">
                      ابدأ اللعبة
                    </Button>
                  </CardContent>
                </Card>
              ) : matchDone ? (
                <Card className="j-card border-0 shadow-xl rounded-2xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-[var(--clr-warning)] mx-auto" />
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{ts('أحسنت! 🎉','Well done! 🎉')}</h3>
                    <div className="text-[var(--text-muted)] space-y-1">
                      <p>⏱ {ts('الوقت','Time')}: <span className="font-bold">{formatTime(matchTimer)}</span></p>
                      <p>🎯 {ts('المحاولات','Moves')}: <span className="font-bold">{matchMoves}</span></p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={initMatch} className="bg-primary hover:brightness-110 rounded-xl">
                        {ts('العب مرة أخرى','Play again')}
                      </Button>
                      <Button variant="outline" onClick={() => setMatchTiles([])} className="rounded-xl">
                        رجوع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Timer & Moves */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-bold">{formatTime(matchTimer)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
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
                              ? "p-3 sm:p-4 rounded-xl bg-[var(--clr-success-bg)] border-2 border-[var(--clr-success)]/40 text-[var(--clr-success)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center transition-all"
                              : isSelectedTile
                                ? tile.type === 'zh'
                                  ? "p-3 sm:p-4 rounded-xl bg-[var(--clr-info-bg)] border-2 border-[var(--clr-primary)] text-[var(--clr-primary)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center font-chinese-serif text-lg sm:text-xl transition-all"
                                  : "p-3 sm:p-4 rounded-xl bg-[var(--clr-info-bg)] border-2 border-[var(--clr-primary)] text-[var(--clr-primary)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center text-sm sm:text-base font-medium transition-all"
                                : tile.type === 'zh'
                                  ? "p-3 sm:p-4 rounded-xl bg-[var(--surface-card)] border-2 border-[var(--line-default)] hover:border-primary text-[var(--text-primary)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center font-chinese-serif text-lg sm:text-xl cursor-pointer transition-all shadow-sm"
                                  : "p-3 sm:p-4 rounded-xl bg-[var(--surface-card)] border-2 border-[var(--line-default)] hover:border-primary text-[var(--text-secondary)] text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center text-sm sm:text-base cursor-pointer transition-all shadow-sm"
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
  const activeLevel = useActiveLevel()
  const { grammarRules } = activeLevel
  const [grammarAnswers, setGrammarAnswers] = useState<Record<string, Record<number, number>>>({})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          {ts('القواعد النحوية','Grammar')}
        </h2>
        <Badge variant="secondary">{grammarRules.length} {ts('قاعدة','rules')}</Badge>
      </div>
      <p className="text-[var(--text-muted)] text-sm">{ts(`جميع القواعد النحوية المطلوبة لـ ${activeLevel.label}`,`All grammar rules required for ${activeLevel.label}`)}</p>

      <Accordion type="multiple" className="space-y-2">
        {grammarRules.map((rule) => {
          const questions = activeLevel.grammarPractice[rule.id] || []
          const answers = grammarAnswers[String(rule.id)] || {}

          return (
            <AccordionItem key={rule.id} value={String(rule.id)} className="border rounded-xl shadow-sm px-4">
              <AccordionTrigger className="text-right hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {rule.id}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text-primary)] text-sm">{tsPick(rule.titleAr, rule.title)}</div>
                    {tsPick(rule.titleAr, rule.title) !== rule.title && (
                      <div className="text-xs text-[var(--text-muted)] font-ltr">{rule.title}</div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">{tsPick(rule.description, (rule as any).descriptionEn)}</p>

                {/* Pattern */}
                <div className="bg-[var(--surface-card-h)] rounded-lg p-3">
                  <div className="text-xs font-medium text-[var(--text-muted)] mb-1">{ts('الصيغة','Pattern')}</div>
                  <div className="text-sm font-medium text-primary font-chinese-sans">{tsPick(rule.pattern, (rule as any).patternEn)}</div>
                </div>

                {/* Examples */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[var(--text-muted)]">{ts('أمثلة:', 'Examples:')}</div>
                  {rule.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--surface-card-h)] cursor-pointer transition-colors"
                      onClick={() => speak(ex.zh)}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-chinese-serif text-[var(--text-primary)]">{ex.zh}</div>
                        <div className="text-xs text-[var(--text-muted)] font-chinese-sans">{ex.pinyin}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{tsPick(ex.ar, (ex as any).en)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {rule.tips && (
                  <div className="bg-[var(--clr-warning-bg)] border border-[var(--clr-warning)]/30 rounded-lg p-3">
                    <div className="text-xs font-medium text-[var(--clr-warning)] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {ts('نصيحة', 'Tip')}
                    </div>
                    <div className="text-sm text-[var(--clr-warning)] mt-1">{tsPick(rule.tips, (rule as any).tipsEn)}</div>
                  </div>
                )}

                {/* Practice Questions */}
                {questions.length > 0 && (
                  <div className="border-t border-[var(--line-default)] pt-3 space-y-3">
                    <div className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {ts('تمرين تفاعلي', 'Interactive practice')}
                    </div>
                    {questions.map((q, qi) => {
                      const selected = answers[qi]
                      const answered = selected !== undefined
                      const isCorrect = selected === q.correct
                      return (
                        <div key={qi} className="space-y-2">
                          <div className="font-chinese-serif text-sm text-[var(--text-primary)] font-medium">{q.zh}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => {
                              let cls = 'border-[var(--line-default)] hover:bg-[var(--surface-card-h)] text-[var(--text-secondary)]'
                              if (answered) {
                                if (oi === q.correct) cls = 'border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)]'
                                else if (oi === selected) cls = 'border-[var(--clr-danger)]/50 bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]'
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
                            <div className={isCorrect ? "text-xs font-medium text-[var(--clr-success)]" : "text-xs font-medium text-primary"}>
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
  const { vocabulary, grammarRules } = useActiveLevel()
  const { quizQuestions, quizScore, quizTotal, currentQuizQuestion, answerQuiz, nextQuizQuestion, resetQuiz, incrementStreak } = store
  const [fillBlankWord, setFillBlankWord] = useState<VocabWord | null>(null)
  const [fillAnswer, setFillAnswer] = useState('')
  const [fillResult, setFillResult] = useState<'correct' | 'wrong' | null>(null)
  const [matchPairs, setMatchPairs] = useState<{ zh: string; ar: string }[]>([])
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set())
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)

  // True/False game state
  const [tfQuestion, setTfQuestion] = useState<{ zh: string; ar: string; isCorrect: boolean } | null>(null)
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null)
  const [tfScore, setTfScore] = useState(0)
  const [tfTotal, setTfTotal] = useState(0)

  const startTFQuestion = () => {
    const w = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    const isCorrect = Math.random() > 0.5
    setTfQuestion({
      zh: w.zh + ' — ' + w.pinyin,
      ar: isCorrect ? w.meaning : vocabulary.find(v => v.id !== w.id)?.meaning || 'كلمة أخرى',
      isCorrect,
    })
    setTfAnswer(null)
  }

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
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          {ts('التمارين','Exercises')}
        </h2>
      </div>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quiz">{ts('اختيار من متعدد','Multiple choice')}</TabsTrigger>
          <TabsTrigger value="fill">{ts('اكمل الفراغ','Fill the blank')}</TabsTrigger>
          <TabsTrigger value="match">{ts('طابق الأزواج','Match pairs')}</TabsTrigger>
        </TabsList>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4">
          {!quizQuestions.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Brain className="w-16 h-16 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">{ts('اختبار المفردات','Vocabulary Quiz')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  30 سؤال عشوائي لاختبار معرفتك بالمفردات الصينية. اختر مستوى الصعوبة.
                </p>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <Button
                      key={d}
                      variant={quizDifficulty === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuizDifficulty(d)}
                      className={quizDifficulty === d ? 'bg-primary hover:brightness-110' : ''}
                    >
                      {d === 'easy' ? 'سهل (تلميح)' : d === 'medium' ? 'متوسط' : 'صعب (مؤقت)'}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => { generateQuiz(); incrementStreak() }} className="bg-primary hover:brightness-110">
                  ابدأ الاختبار
                </Button>
              </CardContent>
            </Card>
          ) : !quizFinished ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
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
                    className="font-chinese-serif text-6xl text-[var(--text-primary)] cursor-pointer hover:text-primary transition-colors"
                    onClick={() => speak(currentQuestion.question)}
                  >
                    {currentQuestion.question}
                  </div>
                  {/* Show pinyin hint in easy mode */}
                  {quizDifficulty === 'easy' && currentQuestion.questionPinyin && (
                    <div className="text-sm text-[var(--text-muted)] font-chinese-sans">{currentQuestion.questionPinyin}</div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => speak(currentQuestion.question)}>
                    <Volume2 className="w-4 h-4 ml-1" /> استمع
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt, i) => {
                    let btnClass = 'border-[var(--line-default)] hover:bg-[var(--surface-card-h)] text-[var(--text-primary)]'
                    if (quizAnswer !== null) {
                      if (i === currentQuestion.correctIndex) btnClass = 'border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)]'
                      else if (i === quizAnswer) btnClass = 'border-[var(--clr-danger)] bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]'
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
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
                <Trophy className={quizScore >= quizTotal * 0.8 ? "w-20 h-20 text-[var(--clr-warning)]" : "w-20 h-20 text-[var(--text-muted)]"} />
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  {getScoreMessage(quizScore, quizTotal)}
                </h3>
                <div className="text-4xl font-bold text-primary">{quizScore} / {quizTotal}</div>
                <Progress value={(quizScore / quizTotal) * 100} className="w-64 h-3" />
                <Button onClick={() => { resetQuiz(); setQuizFinished(false); generateQuiz() }} className="bg-primary hover:brightness-110">
                  <RotateCcw className="w-4 h-4 ml-2" /> حاول مرة أخرى
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fill Blank Tab */}
        <TabsContent value="fill" className="space-y-4">
          {!fillBlankWord ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <Languages className="w-16 h-16 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">{ts('اكتب الكلمة الصينية','Type the Chinese word')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  سيظهر لك المعنى بالعربية والجملة المثال. {ts('اكتب الكلمة الصينية','Type the Chinese word')} أو البينيين.
                </p>
                <Button onClick={() => { startFillBlank(); incrementStreak() }} className="bg-primary hover:brightness-110">
                  ابدأ التمرين
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-xl font-bold text-[var(--text-primary)]">{fillBlankWord.meaning}</div>
                  <div className="text-sm text-[var(--text-muted)] font-chinese-sans">{fillBlankWord.pinyin}</div>
                  <div className="bg-[var(--surface-card-h)] rounded-lg p-3 mt-3">
                    <div className="font-chinese-serif text-[var(--text-primary)]">{fillBlankWord.exZh}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{fillBlankWord.exPinyin}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={ts('اكتب الكلمة الصينية أو البينيين...','Type the Chinese word or pinyin...')}
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkFillAnswer()}
                    className="text-lg font-chinese-serif"
                  />
                  <Button onClick={checkFillAnswer} className="bg-primary hover:brightness-110">{ts('تحقق','Check')}</Button>
                </div>
                {fillResult && (
                  <div className={fillResult === 'correct' ? "p-3 rounded-lg text-center font-medium bg-[var(--clr-success-bg)] text-[var(--clr-success)]" : "p-3 rounded-lg text-center font-medium bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]"}>
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
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <ArrowLeftRight className="w-16 h-16 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">{ts('طابق الأزواج','Match pairs')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  اختر الكلمة الصينية ثم اختر ترجمتها العربية لإنشاء الأزواج المتطابقة.
                </p>
                <Button onClick={() => { startMatchGame(); incrementStreak() }} className="bg-primary hover:brightness-110">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matchedItems.size < matchPairs.length * 2 && (
                <div className="text-sm text-[var(--text-muted)] text-center">
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
                <div className="text-center space-y-3 p-6 bg-[var(--clr-success-bg)] rounded-xl">
                  <Trophy className="w-12 h-12 text-[var(--clr-warning)] mx-auto" />
                  <div className="text-xl font-bold text-[var(--clr-success)]">{ts('أحسنت! طابقت جميع الأزواج! 🎉','Great! You matched all pairs! 🎉')}</div>
                  <Button onClick={startMatchGame} variant="outline">{ts('العب مرة أخرى','Play again')}</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      <TabsContent value="tf" className="space-y-4">
          <Card className="j-card border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[var(--clr-success)]" />
                <X className="w-5 h-5 text-[var(--clr-danger)]" />
                <span className="font-bold text-[var(--text-secondary)]">{ts('صواب أم خطأ؟','True or False?')}</span>
              </div>
              {tfQuestion ? (
                <div className="w-full max-w-md space-y-4 text-center">
                  <p className="font-chinese-serif text-2xl font-bold text-[var(--text-primary)]">{tfQuestion.zh.split(' — ')[0]}</p>
                  <p className="text-sm text-[var(--text-muted)] font-chinese-sans">{tfQuestion.zh.split(' — ')[1] || ''}</p>
                  <div className="h-px bg-[var(--surface-card)] my-2" />
                  <p className="text-lg font-bold text-primary">{tfQuestion.ar}</p>
                  <p className="text-xs text-[var(--text-muted)]">{ts('هل هذه الترجمة صحيحة؟','Is this translation correct?')}</p>
                  {tfAnswer === null ? (
                    <div className="flex gap-4 justify-center mt-4">
                      <Button className="gap-2 bg-[var(--clr-success)] hover:bg-[var(--clr-success-h)] text-white border-0" onClick={() => { setTfAnswer(true); setTfTotal(t => t + 1); if (tfQuestion.isCorrect) setTfScore(s => s + 1) }}>
                        <Check className="w-4 h-4" /> صحيح
                      </Button>
                      <Button className="gap-2 bg-[var(--clr-danger)] hover:brightness-110 text-white border-0" onClick={() => { setTfAnswer(false); setTfTotal(t => t + 1); if (!tfQuestion.isCorrect) setTfScore(s => s + 1) }}>
                        <X className="w-4 h-4" /> خطأ
                      </Button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="text-lg font-bold" style={{ color: tfAnswer === tfQuestion.isCorrect ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
                        {tfAnswer === tfQuestion.isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                      </div>
                      <div className="flex items-center justify-between gap-3 px-4">
                        <span className="text-sm text-[var(--text-muted)]">النتيجة: {tfScore}/{tfTotal}</span>
                        <Button size="sm" onClick={startTFQuestion}>{ts('السؤال التالي','Next question')}</Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-muted)] max-w-sm text-center">{ts('سيظهر لك كلمة صينية مع ترجمتها. حدد هل الترجمة صحيحة أم لا.','A Chinese word with its translation will appear. Decide if it is correct.')}</p>
                  <Button onClick={startTFQuestion} className="gap-2 bg-primary border-0">
                    ابدأ اللعب
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
  setToneScore: React.Dispatch<React.SetStateAction<number>>
  toneRound: number
  setToneRound: React.Dispatch<React.SetStateAction<number>>
}) {
  const store = useLearningStore()
  const { vocabulary, tonePairs } = useActiveLevel()
  const { memoryCards, memoryMoves, memoryPairs, incrementStreak } = store
  const [selectedMemoryLevel, setSelectedMemoryLevel] = useState(1)

  // Derive target tone index deterministically from toneRound (no useState+useEffect needed)
  const targetToneIdx = useMemo(() => {
    if (toneRound >= tonePairs.length) return 0
    const set = tonePairs[toneRound % tonePairs.length]
    const maxIdx = set.tones.length - 1
    const seed = (toneRound * 2654435761) >>> 0
    return seed % (maxIdx + 1)
  }, [toneRound])

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
  }

  const currentToneSet = tonePairs[toneRound % tonePairs.length]
  const targetTone = currentToneSet?.tones[targetToneIdx]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary" />
          {ts('الألعاب التعليمية','Learning Games')}
        </h2>
      </div>

      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memory">{ts('لعبة الذاكرة','Memory Game')}</TabsTrigger>
          <TabsTrigger value="tone">{ts('تمييز النبرات','Tone Recognition')}</TabsTrigger>
          <TabsTrigger value="speed">{ts('لعبة السرعة ⚡','Speed Game ⚡')}</TabsTrigger>
        </TabsList>

        {/* Memory Game (Fixed) */}
        <TabsContent value="memory" className="space-y-4">
          {!memoryCards.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🧠</div>
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">{ts('لعبة الذاكرة','Memory Game')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  طابق الكلمة الصينية (الحرف) مع معناها! اختر المستوى وابدأ.
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {memoryLevelOptions.map(l => (
                    <Button
                      key={l.level}
                      variant={selectedMemoryLevel === l.level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMemoryLevel(l.level)}
                      className={selectedMemoryLevel === l.level ? 'bg-primary hover:brightness-110' : ''}
                    >
                      {l.label}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => { startMemoryGame(selectedMemoryLevel); incrementStreak() }} className="bg-primary hover:brightness-110">
                  ابدأ اللعبة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-[var(--text-muted)]">
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
                          ? "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-[var(--clr-success)]/40 bg-[var(--clr-success-bg)]"
                          : "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-[var(--clr-danger)]/40 bg-[var(--clr-danger-bg)]"
                        : "aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 text-center p-1 border-[var(--line-default)] bg-[var(--surface-card)] hover:bg-[var(--surface-card-h)] cursor-pointer"
                      }
                    >
                      {isFlipped ? (
                        isHanzi ? (
                          <div className="font-chinese-serif text-2xl text-[var(--text-primary)]">{card.zh}</div>
                        ) : (
                          <div className="p-1">
                            <div className="font-chinese-sans text-[10px] text-[var(--text-muted)]">{card.pinyin}</div>
                            <div className="text-xs text-[var(--text-primary)] font-bold leading-tight">{card.ar}</div>
                          </div>
                        )
                      ) : (
                        <div className="text-2xl text-[var(--text-muted)]">?</div>
                      )}
                    </button>
                  )
                })}
              </div>
              {memoryPairs === currentPairCount && (
                <div className="text-center space-y-3 p-6 bg-[var(--clr-success-bg)] rounded-xl">
                  <Trophy className="w-12 h-12 text-[var(--clr-warning)] mx-auto" />
                  <div className="text-xl font-bold text-[var(--clr-success)]">{ts('فزت! 🎉','You won! 🎉')}</div>
                  <div className="text-sm text-[var(--clr-success)]">أكملت اللعبة في {memoryMoves} محاولة</div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => startMemoryGame(selectedMemoryLevel)} variant="outline">{ts('العب مرة أخرى','Play again')}</Button>
                    <Button onClick={() => { store.resetMemoryGame() }} variant="outline">{ts('تغيير المستوى','Change level')}</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tone Game (Enhanced) */}
        <TabsContent value="tone" className="space-y-4">
          {toneRound >= tonePairs.length && toneAnswer !== null ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <Trophy className={toneScore >= Math.floor(tonePairs.length * 0.8) ? "w-16 h-16 text-[var(--clr-warning)]" : "w-16 h-16 text-[var(--text-muted)]"} />
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{ts('انتهت اللعبة!','Game over!')}</h3>
                <div className="text-3xl font-bold text-primary">{toneScore}/{tonePairs.length}</div>
                <Button onClick={startToneGame} className="bg-primary hover:brightness-110">
                  <RotateCcw className="w-4 h-4 ml-2" /> {ts('العب مرة أخرى','Play again')}
                </Button>
              </CardContent>
            </Card>
          ) : toneRound < tonePairs.length ? (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between text-sm text-[var(--text-muted)]">
                  <span>الجولة {toneRound + 1}/{tonePairs.length}</span>
                  <span>النتيجة: {toneScore}</span>
                </div>

                {currentToneSet && (
                <>
                <div className="text-center space-y-2">
                  <div className="text-sm text-[var(--text-muted)]">{ts('اختر النبرة الصحيحة للكلمة:','Choose the correct tone:')}</div>
                  <div className="font-chinese-sans text-lg text-primary">[{currentToneSet.syllable}]</div>
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
                        ? (i === targetToneIdx ? "h-auto py-4 flex flex-col items-center gap-1 transition-all border-[var(--clr-success)] bg-[var(--clr-success-bg)]" : "h-auto py-4 flex flex-col items-center gap-1 transition-all border-[var(--clr-danger)] bg-[var(--clr-danger-bg)]")
                        : "h-auto py-4 flex flex-col items-center gap-1 transition-all hover:bg-[var(--surface-card-h)]"
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
                      <span className="text-xs text-[var(--text-tertiary)]">{t.pinyin} — النبرة {t.tone}</span>
                      <span className="text-xs text-[var(--text-muted)]">{t.meaning}</span>
                    </Button>
                  ))}
                </div>
                </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="j-card border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-6xl">🎵</div>
                <h3 className="text-lg font-bold text-[var(--text-secondary)]">لعبة {ts('تمييز النبرات','Tone Recognition')}</h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
                  اختبر قدرتك على {ts('تمييز النبرات','Tone Recognition')} في اللغة الصينية. {tonePairs.length} مجموعات نبرية للتدرب!
                </p>
                <Button onClick={() => { startToneGame(); incrementStreak() }} className="bg-primary hover:brightness-110">
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
  const { vocabulary } = useActiveLevel()
  const allSentences = useMemo(() => buildAllSentences(vocabulary), [vocabulary])
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

  if (!sentence) return <div>{ts('لا توجد جمل','No sentences')}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          {ts('إتقان الجمل','Sentence Mastery')}
        </h2>
        <Badge variant="secondary">{allSentences.length} جملة</Badge>
      </div>
      <p className="text-[var(--text-muted)] text-sm">{ts('تدرب على الجمل اليومية — انقر على البطاقة لتقلبها','Practice daily sentences — tap the card to flip')}</p>

      {/* Sentence Flashcard */}
      <div className="j-flashcard">
        <div
          className={sentenceFlipped ? "relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d rotate-y-180" : "relative w-full max-w-lg mx-auto cursor-pointer transition-transform duration-500 preserve-3d"}
          onClick={() => setSentenceFlipped(!sentenceFlipped)}
          style={{ minHeight: '280px' }}
        >
          {/* Front - Chinese text */}
          <div className="absolute inset-0 backface-hidden">
            <Card className="j-card h-full border-0 shadow-lg bg-gradient-to-br from-white to-primary/10">
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-sm text-[var(--text-muted)] mb-4">{ts('اقرأ الجملة:','Read the sentence:')}</div>
                <div
                  className="font-chinese-serif text-3xl mb-4 text-[var(--text-primary)] cursor-pointer hover:text-primary transition-colors leading-relaxed"
                  onClick={(e) => { e.stopPropagation(); speak(sentence.zh) }}
                >
                  {sentence.zh}
                </div>
                <div className="text-sm text-[var(--text-muted)] font-chinese-sans">{sentence.pinyin}</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Volume2 className="w-3 h-3" />
                  <span>{ts('اضغط للنطق • انقر للقلب','Tap to pronounce • click to flip')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Back - Arabic + breakdown */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className="j-card h-full border-0 shadow-lg bg-gradient-to-br from-white to-[var(--clr-warning-bg)] overflow-y-auto custom-scrollbar">
              <CardContent className="flex flex-col items-center h-full p-6 text-center space-y-4">
                <div className="text-sm text-[var(--text-muted)]">{ts('الترجمة والتحليل:','Translation & breakdown:')}</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{sentence.ar}</div>
                <div className="w-full border-t border-[var(--line-default)] pt-3">
                  <div className="text-xs font-medium text-[var(--text-muted)] mb-2">{ts('🔤 تحليل الكلمات:','🔤 Word breakdown:')}</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {wordBreakdown.map((w, i) => (
                      <div key={i} className="bg-[var(--surface-card-h)] rounded-lg p-2 text-center min-w-[60px]"
                        onClick={(e) => { e.stopPropagation(); if (w.char) speak(w.char) }}>
                        <div className="font-chinese-serif text-lg text-primary">{w.char}</div>
                        {w.meaning && <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{w.meaning}</div>}
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
          {ts('السابقة','Previous')}
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
          {ts('التالية','Next')}
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-[var(--text-muted)]">
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
  const { stories } = useActiveLevel()
  const story = stories[activeStory]

  // Split Chinese text into clickable spans
  const renderClickableChinese = (text: string) => {
    const chars = text.split('')
    return chars.map((char, i) => {
      const isPunctuation = /[。！？，、；：""''（）《》\s]/.test(char)
      if (isPunctuation) {
        return <span key={i} className="font-chinese-serif text-[var(--text-primary)]">{char}</span>
      }
      return (
        <span
          key={i}
          className="font-chinese-serif text-[var(--text-primary)] cursor-pointer hover:text-primary hover:bg-primary/10 rounded px-0.5 transition-colors"
          onClick={() => speak(char)}
          title={ts('اضغط للنطق','Tap to pronounce')}
        >
          {char}
        </span>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-primary" />
          {ts('القصص القصيرة','Short Stories')}
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
            className={activeStory === i ? 'bg-primary hover:brightness-110' : ''}
          >
            {s.title}
          </Button>
        ))}
      </div>

      {/* Story Content */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="text-lg">{story.title}</div>
              <div className="font-chinese-serif text-sm text-[var(--text-muted)]">{story.titleZh}</div>
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
              className="p-3 rounded-lg bg-[var(--surface-card-h)] hover:bg-[var(--surface-card-h)] transition-colors"
              onClick={() => speak(line.zh)}
            >
              <div className="font-chinese-serif text-[var(--text-primary)] text-lg leading-relaxed">
                {renderClickableChinese(line.zh)}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-chinese-sans mt-1">{line.pinyin}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{line.ar}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comprehension Questions */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-[var(--clr-warning)]" />
            أسئلة الفهم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {story.questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <div className="font-chinese-serif text-sm text-[var(--text-primary)] font-medium">{q.zh}</div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = storyAnswers[qi] === oi
                  const isCorrect = oi === q.correct
                  const answered = storyAnswers[qi] !== undefined
                  let cls = 'border-[var(--line-default)] hover:bg-[var(--surface-card-h)] text-[var(--text-secondary)]'
                  if (answered) {
                    if (isCorrect) cls = 'border-[var(--clr-success)] bg-[var(--clr-success-bg)] text-[var(--clr-success)]'
                    else if (selected) cls = 'border-[var(--clr-danger)]/50 bg-[var(--clr-danger-bg)] text-[var(--clr-danger)]'
                  } else if (selected) {
                    cls = 'border-[var(--clr-danger)]/40 bg-primary/10 text-primary'
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
                <div className="text-[var(--clr-success)] font-bold">{ts('🎉 ممتاز! جميع الإجابات صحيحة!','🎉 Excellent! All answers correct!')}</div>
              ) : (
                <div className="text-[var(--clr-warning)] font-medium">{ts('حاول مرة أخرى! بعض الإجابات خاطئة.','Try again! Some answers are wrong.')}</div>
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
  const activeLevelBundle = useActiveLevel()
  const { vocabulary, level } = activeLevelBundle
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [followUps, setFollowUps] = useState<string[]>([])
  const pendingQuizRef = useRef<TutorQuiz | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.chatMessages])

  const handleSend = (text?: string) => {
    const userMsg = (text ?? input).trim()
    if (!userMsg) return
    setInput('')
    setFollowUps([])
    store.addChatMessage({ role: 'user', content: userMsg })
    setIsTyping(true)

    setTimeout(() => {
      const weakWords = store
        .getWeakWordIds(10)
        .map((id) => vocabulary.find((w) => w.id === id))
        .filter((w): w is VocabWord => !!w)
      const srsStats = store.getSRSStats()
      const reply = answerMessage(userMsg, {
        learnedWordIds: store.learnedWords,
        weakWords,
        dueCount: store.getDueCardIds().length,
        masteredCount: srsStats.mastered,
        dailyStreak: store.dailyStreak,
        dailyGoal: store.profile?.dailyGoal ?? 10,
        pendingQuiz: pendingQuizRef.current,
        level,
        lang: store.lang,
        vocabulary,
        grammarRules: activeLevelBundle.grammarRules,
        grammarPractice: activeLevelBundle.grammarPractice,
      })
      if (reply.quiz !== undefined) pendingQuizRef.current = reply.quiz
      store.addChatMessage({ role: 'assistant', content: reply.text })
      setFollowUps(reply.followUps || [])
      setIsTyping(false)
    }, 500 + Math.random() * 700)
  }

  const quickQuestions = [
    ts('ما معنى 你好؟', 'What does 你好 mean?'),
    ts('اختبرني', 'Quiz me'),
    ts('اشرح قاعدة 吗', 'Explain the 吗 rule'),
    ts('ماذا أراجع اليوم؟', 'What should I review today?'),
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          {ts('المساعد الذكي','AI Tutor')}
        </h2>
        <Button variant="ghost" size="sm" onClick={store.clearChatMessages}>
          <RotateCcw className="w-4 h-4 ml-1" /> مسح
        </Button>
      </div>
      <p className="text-[var(--text-muted)] text-sm">{ts('اسألني عن أي كلمة صينية أو احصل على نصائح للتعلم!','Ask me about any Chinese word or get study tips!')}</p>

      {/* Chat Messages */}
      <Card className="j-card border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-4" id="chat-container">
            {store.chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{ts('مرحباً! أنا مساعدك الصيني 🤖','Hi! I am your Chinese tutor 🤖')}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{ts('اسألني عن أي كلمة أو اطلب نصائح للتعلم','Ask me about any word or request study tips')}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {quickQuestions.map(q => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSend(q)}
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
                    ? "max-w-[80%] rounded-2xl px-4 py-3 bg-primary text-white rounded-br-sm"
                    : "max-w-[80%] rounded-2xl px-4 py-3 bg-[var(--surface-card-h)] text-[var(--text-primary)] rounded-bl-sm"
                }>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-primary">{ts('المعلم','Tutor')}</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex justify-end">
                <div className="bg-[var(--surface-card-h)] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {!isTyping && followUps.length > 0 && store.chatMessages.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {followUps.map(f => (
                  <Button
                    key={f}
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full"
                    onClick={() => handleSend(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder={ts('اكتب سؤالك هنا... (عربي أو صيني)','Type your question... (English or Chinese)')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
          disabled={isTyping}
        />
        <Button onClick={() => handleSend()} className="bg-primary hover:brightness-110" disabled={!input.trim() || isTyping}>
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
  const { vocabulary, grammarRules, roadmapUnits } = useActiveLevel()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          {ts('خريطة الطريق','Roadmap')}
        </h2>
        <Badge variant="secondary">{ts('10 ساعات','10 hours')}</Badge>
      </div>
      <p className="text-[var(--text-muted)] text-sm">{ts('خطة دراسية مقترحة لإنهاء المستوى الأول خلال 10 ساعات','A suggested study plan to finish HSK 1 in 10 hours')}</p>

      <div className="space-y-3">
        {roadmapUnits.map((unit) => {
          const totalWords = unit.words.length
          const learnedCount = unit.words.filter(id => store.isLearned(id)).length
          const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0
          const isComplete = progress === 100

          return (
            <Card key={unit.id} className={isComplete ? "border-0 shadow-sm card-hover transition-all ring-2 ring-[var(--clr-success)]/40" : "border-0 shadow-sm card-hover transition-all"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={isComplete
                    ? "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--clr-success-bg)] text-[var(--clr-success)]"
                    : "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary"
                  }>
                    {isComplete ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{unit.id}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[var(--text-primary)] text-sm">{unit.title}</h3>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {unit.hours} ساعة
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mb-2">{unit.desc}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-[var(--text-muted)]">{learnedCount}/{totalWords}</span>
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
      <Card className="j-card border-0 shadow-sm bg-gradient-to-r from-primary/10 to-[var(--clr-warning-bg)]/60">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">الإجمالي: {ts('10 ساعات','10 hours')}</h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            بإمكانك إنهاء المستوى الأول خلال أسبوعين إذا تابعت الدراسة يومياً
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{roadmapUnits.reduce((a, u) => a + u.words.length, 0)}</div>
              <div className="text-[var(--text-muted)]">كلمة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--clr-warning)]">{roadmapUnits.reduce((a, u) => a + new Set(u.grammarIds).size, 0)}</div>
              <div className="text-[var(--text-muted)]">قاعدة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--clr-success)]">10</div>
              <div className="text-[var(--text-muted)]">وحدة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
