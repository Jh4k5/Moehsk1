// HSK3 daily Q&A — authored with HSK3 vocabulary, same shape as QASection's dailyQA.
export interface QAAnswer3 { zh: string; pinyin: string; arabic: string }
export interface QAQuestion3 { q: string; pinyin: string; arabic: string; answers: QAAnswer3[] }
export interface QACategory3 { category: string; icon: string; color: string; questions: QAQuestion3[] }

export const dailyQA3: QACategory3[] = [
  {
    category: '✈️ السفر والمطار',
    icon: '✈️',
    color: 'blue',
    questions: [
      { q: '你们几点到机场？', pinyin: 'Nǐmen jǐdiǎn dào jīchǎng?', arabic: 'متى تصلون إلى المطار؟', answers: [{ zh: '我们下午三点到', pinyin: 'Wǒmen xiàwǔ sāndiǎn dào', arabic: 'نصل الثالثة عصراً' }, { zh: '飞机晚点了', pinyin: 'Fēijī wǎndiǎn le', arabic: 'تأخرت الطائرة' }] },
      { q: '你带护照了吗？', pinyin: 'Nǐ dài hùzhào le ma?', arabic: 'هل أحضرتَ جواز السفر؟', answers: [{ zh: '带了，在包里', pinyin: 'Dài le, zài bāolǐ', arabic: 'نعم، في الحقيبة' }, { zh: '别着急，我带了', pinyin: 'Bié zhe jí, wǒ dài le', arabic: 'لا تقلق، أحضرتُه' }] },
      { q: '你的行李呢？', pinyin: 'Nǐ de xínglǐ ne?', arabic: 'أين أمتعتك؟', answers: [{ zh: '我的箱子不见了', pinyin: 'Wǒ de xiāngzi bújiàn le', arabic: 'حقيبتي اختفت' }, { zh: '行李不太多', pinyin: 'Xínglǐ bùtàiduō', arabic: 'الأمتعة ليست كثيرة' }] },
      { q: '我们怎么去？', pinyin: 'Wǒmen zěnme qù?', arabic: 'كيف نذهب؟', answers: [{ zh: '坐高铁很方便', pinyin: 'Zuò gāotiě hěn fāngbiàn', arabic: 'القطار السريع مريح جداً' }, { zh: '我们打车去吧', pinyin: 'Wǒmen dǎchē qù ba', arabic: 'لنذهب بسيارة أجرة' }] },
    ],
  },
  {
    category: '🏥 الصحة والرياضة',
    icon: '🏥',
    color: 'red',
    questions: [
      { q: '你哪儿不舒服？', pinyin: 'Nǐ nǎr bù shūfú?', arabic: 'أين تشعر بالألم؟', answers: [{ zh: '我的腿有点儿疼', pinyin: 'Wǒ de tuǐ yǒudiǎnr téng', arabic: 'ساقي تؤلمني قليلاً' }, { zh: '我感冒了', pinyin: 'Wǒ gǎnmào le', arabic: 'أُصبتُ بالزكام' }] },
      { q: '你常常锻炼吗？', pinyin: 'Nǐ chángcháng duànliàn ma?', arabic: 'هل تمارس الرياضة كثيراً؟', answers: [{ zh: '我几乎每天都锻炼', pinyin: 'Wǒ jīhū měitiān dōu duànliàn', arabic: 'أتمرّن كل يوم تقريباً' }, { zh: '我常去体育馆', pinyin: 'Wǒchángqù tǐyùguǎn', arabic: 'أذهب كثيراً إلى الصالة الرياضية' }] },
      { q: '你身体怎么样？', pinyin: 'Nǐ shēntǐ zěnmeyàng?', arabic: 'كيف صحتك؟', answers: [{ zh: '比以前健康多了', pinyin: 'Bǐ yǐqián jiànkāng duō le', arabic: 'أفضل صحة من قبل بكثير' }, { zh: '最近有点儿累', pinyin: 'Zuìjìn yǒudiǎnr lèi', arabic: 'متعب قليلاً مؤخراً' }] },
      { q: '医生说什么？', pinyin: 'Yīshēng shuō shénme?', arabic: 'ماذا قال الطبيب؟', answers: [{ zh: '他说要多休息', pinyin: 'Tā shuō yào duō xiūxī', arabic: 'قال إن عليّ الراحة أكثر' }, { zh: '他给我开了药', pinyin: 'Tā gěi wǒ kāi le yào', arabic: 'وصف لي دواءً' }] },
    ],
  },
  {
    category: '🎓 الدراسة والامتحانات',
    icon: '🎓',
    color: 'violet',
    questions: [
      { q: '作业做完了吗？', pinyin: 'Zuòyè zuò wán le ma?', arabic: 'هل أنهيتَ الواجب؟', answers: [{ zh: '还没有，有点儿难', pinyin: 'Hái méiyǒu, yǒudiǎnr nán', arabic: 'ليس بعد، صعب قليلاً' }, { zh: '做完了，很简单', pinyin: 'Zuò wán le, hěn jiǎndān', arabic: 'أنهيتُه، بسيط جداً' }] },
      { q: '你的汉语水平怎么样？', pinyin: 'Nǐ de hànyǔ shuǐpíng zěnmeyàng?', arabic: 'كيف مستواك في الصينية؟', answers: [{ zh: '越来越好了', pinyin: 'Yuèláiyuè hǎo le', arabic: 'يتحسّن أكثر فأكثر' }, { zh: '还需要多练习', pinyin: 'Hái xūyào duō liànxí', arabic: 'ما زلتُ أحتاج تدريباً أكثر' }] },
      { q: '考试以前你做什么？', pinyin: 'Kǎoshì yǐqián nǐ zuò shénme?', arabic: 'ماذا تفعل قبل الامتحان؟', answers: [{ zh: '我要好好复习', pinyin: 'Wǒyào hǎohǎo fùxí', arabic: 'سأراجع جيداً' }, { zh: '我看一遍笔记', pinyin: 'Wǒ kànyībiàn bǐjì', arabic: 'أقرأ الملاحظات مرة' }] },
      { q: '这个句子什么意思？', pinyin: 'Zhège jùzi shénme yìsi?', arabic: 'ما معنى هذه الجملة؟', answers: [{ zh: '老师讲得很清楚', pinyin: 'Lǎoshī jiǎng de hěn qīngchǔ', arabic: 'شرح المعلم بوضوح' }, { zh: '我也不太明白', pinyin: 'Wǒ yě bù tài míngbái', arabic: 'أنا أيضاً لا أفهمها جيداً' }] },
    ],
  },
  {
    category: '💼 العمل والمكتب',
    icon: '💼',
    color: 'amber',
    questions: [
      { q: '会议几点开始？', pinyin: 'Huìyì jǐdiǎn kāishǐ?', arabic: 'متى يبدأ الاجتماع؟', answers: [{ zh: '下午两点开会', pinyin: 'Xiàwǔ liǎngdiǎn kāihuì', arabic: 'الاجتماع الثانية بعد الظهر' }, { zh: '地点还没定', pinyin: 'De diǎn hái méidìng', arabic: 'لم يُحدَّد المكان بعد' }] },
      { q: '你收到邮件了吗？', pinyin: 'Nǐ shōudào yóujiàn le ma?', arabic: 'هل استلمتَ البريد؟', answers: [{ zh: '收到了，谢谢', pinyin: 'Shōudào le, xièxiè', arabic: 'استلمتُه، شكراً' }, { zh: '看来我的邮箱有问题', pinyin: 'Kànlái wǒ de yóuxiāng yǒu wèntí', arabic: 'يبدو أن في بريدي مشكلة' }] },
      { q: '你要请假吗？', pinyin: 'Nǐ yào qǐngjià ma?', arabic: 'هل ستأخذ إجازة؟', answers: [{ zh: '我想请一天假', pinyin: 'Wǒ xiǎng qǐng yītiān jiǎ', arabic: 'أريد إجازة يوم' }, { zh: '后天我要出差', pinyin: 'Hòutiān wǒyào chūchāi', arabic: 'بعد غد لديّ سفر عمل' }] },
      { q: '这个问题怎么解决？', pinyin: 'Zhège wèntí zěnme jiějué?', arabic: 'كيف تُحلّ هذه المشكلة؟', answers: [{ zh: '我们再想想办法', pinyin: 'Wǒmen zài xiǎngxiǎng bànfǎ', arabic: 'لنفكر في طريقة أخرى' }, { zh: '我愿意帮你', pinyin: 'Wǒ yuànyì bāng nǐ', arabic: 'أنا مستعد لمساعدتك' }] },
    ],
  },
  {
    category: '🎉 الأعياد والضيافة',
    icon: '🎉',
    color: 'green',
    questions: [
      { q: '你们怎样过节？', pinyin: 'Nǐmen zěnyàng guo jié?', arabic: 'كيف تحتفلون بالعيد؟', answers: [{ zh: '我们一边包饺子一边看晚会', pinyin: 'Wǒmen yībiān bāo jiǎozi yībiān kàn wǎnhuì', arabic: 'نصنع الزلابية ونشاهد الحفل' }, { zh: '全家一起过节', pinyin: 'Quánjiā yìqǐ guo jié', arabic: 'نحتفل مع العائلة كلها' }] },
      { q: '春节放几天假？', pinyin: 'Chūnjié fàng jǐtiān jiǎ?', arabic: 'كم يوماً عطلة عيد الربيع؟', answers: [{ zh: '大概七八天', pinyin: 'Dàgài qībātiān', arabic: 'نحو سبعة أو ثمانية أيام' }, { zh: '比别的节日长', pinyin: 'Bǐ bié de jiérì zhǎng', arabic: 'أطول من الأعياد الأخرى' }] },
      { q: '这是给你的礼物。', pinyin: 'Zhè shì gěi nǐ de lǐwù.', arabic: 'هذه هدية لك.', answers: [{ zh: '你太客气了', pinyin: 'Nǐ tài kèqì le', arabic: 'أنت مجامل جداً' }, { zh: '谢谢，我很喜欢', pinyin: 'Xièxiè, wǒ hěn xǐhuān', arabic: 'شكراً، أعجبتني كثيراً' }] },
      { q: '要不要来我家做客？', pinyin: 'Yào búyào lái wǒjiā zuòkè?', arabic: 'هل تودّ زيارة بيتي؟', answers: [{ zh: '有时间的话，一定去', pinyin: 'Yǒu shíjiān de huà, yídìng qù', arabic: 'إن كان لديّ وقت فسآتي حتماً' }, { zh: '好，几点方便？', pinyin: 'Hǎo, jǐdiǎn fāngbiàn?', arabic: 'حسناً، أي وقت مناسب؟' }] },
    ],
  },
];
