import type { Conversation } from '../conversations';

// HSK2 conversations — authored from New HSK Course 2 lesson dialogues.
export const conversations2: Conversation[] = [
  {
    id: 201, lesson: 1, title: 'طلب مساعدة', titleChinese: '请你帮忙',
    context: 'صديقان يتحدثان عن المساعدة',
    turns: [
      { speaker: 'A', hanzi: '你好，你能帮我一个忙吗？', pinyin: 'Nǐ hǎo, nǐ néng bāng wǒ yí ge máng ma?', arabic: 'مرحباً، هل يمكنك مساعدتي؟' },
      { speaker: 'B', hanzi: '当然可以。什么事？', pinyin: 'Dāngrán kěyǐ. Shénme shì?', arabic: 'بالطبع. ما الأمر؟' },
      { speaker: 'A', hanzi: '我想介绍一个新朋友给你。', pinyin: 'Wǒ xiǎng jièshào yí ge xīn péngyou gěi nǐ.', arabic: 'أريد أن أقدّم لك صديقاً جديداً.' },
      { speaker: 'B', hanzi: '好的，我已经准备好了。', pinyin: 'Hǎo de, wǒ yǐjīng zhǔnbèi hǎo le.', arabic: 'حسناً، أنا مستعد بالفعل.' },
    ],
    vocabularyUsed: [2001, 2006, 2010], grammarUsed: [212],
  },
  {
    id: 202, lesson: 2, title: 'أين المحطة؟', titleChinese: '车站在哪儿',
    context: 'سائح يسأل عن المواصلات',
    turns: [
      { speaker: 'A', hanzi: '请问，车站在哪儿？', pinyin: 'Qǐngwèn, chēzhàn zài nǎr?', arabic: 'عفواً، أين المحطة؟' },
      { speaker: 'B', hanzi: '往前走，不太远。', pinyin: 'Wǎng qián zǒu, bú tài yuǎn.', arabic: 'اتجه للأمام، ليست بعيدة.' },
      { speaker: 'A', hanzi: '我可以坐公交车去吗？', pinyin: 'Wǒ kěyǐ zuò gōngjiāochē qù ma?', arabic: 'هل يمكنني الذهاب بالحافلة؟' },
      { speaker: 'B', hanzi: '可以，或者打车也很快。', pinyin: 'Kěyǐ, huòzhě dǎchē yě hěn kuài.', arabic: 'نعم، أو سيارة الأجرة سريعة أيضاً.' },
    ],
    vocabularyUsed: [2013, 2016, 2019], grammarUsed: [213],
  },
  {
    id: 203, lesson: 4, title: 'في المركز التجاري', titleChinese: '在商场',
    context: 'اختيار ملابس بلون معيّن',
    turns: [
      { speaker: 'A', hanzi: '这条裤子有别的颜色吗？', pinyin: 'Zhè tiáo kùzi yǒu bié de yánsè ma?', arabic: 'هل لهذا البنطال لون آخر؟' },
      { speaker: 'B', hanzi: '有黑色和白色的。', pinyin: 'Yǒu hēisè hé báisè de.', arabic: 'يوجد أسود وأبيض.' },
      { speaker: 'A', hanzi: '我觉得黑色比白色好看。', pinyin: 'Wǒ juéde hēisè bǐ báisè hǎokàn.', arabic: 'أرى أن الأسود أجمل من الأبيض.' },
      { speaker: 'B', hanzi: '好的，因为你喜欢，所以我给你拿黑色的。', pinyin: 'Hǎo de, yīnwèi nǐ xǐhuan, suǒyǐ wǒ gěi nǐ ná hēisè de.', arabic: 'حسناً، بما أنك تحبه، سأحضر لك الأسود.' },
    ],
    vocabularyUsed: [2038, 2039, 2043], grammarUsed: [202, 203],
  },
  {
    id: 204, lesson: 6, title: 'عيد ميلاد', titleChinese: '生日快乐',
    context: 'الاحتفال بعيد ميلاد صديق',
    turns: [
      { speaker: 'A', hanzi: '今天是我的生日！', pinyin: 'Jīntiān shì wǒ de shēngrì!', arabic: 'اليوم عيد ميلادي!' },
      { speaker: 'B', hanzi: '生日快乐！这是给你的礼物。', pinyin: 'Shēngrì kuàilè! Zhè shì gěi nǐ de lǐwù.', arabic: 'عيد ميلاد سعيد! هذه هديّتك.' },
      { speaker: 'A', hanzi: '谢谢！我们去饭馆吃鱼吧。', pinyin: 'Xièxie! Wǒmen qù fànguǎn chī yú ba.', arabic: 'شكراً! لنذهب للمطعم لأكل السمك.' },
      { speaker: 'B', hanzi: '好，我请你！', pinyin: 'Hǎo, wǒ qǐng nǐ!', arabic: 'حسناً، أنا أدعوك!' },
    ],
    vocabularyUsed: [2081, 2079], grammarUsed: [206],
  },
  {
    id: 205, lesson: 10, title: 'قبل الامتحان', titleChinese: '快要考试了',
    context: 'طالبان يتحدثان عن الامتحان',
    turns: [
      { speaker: 'A', hanzi: '快要考试了，你准备好了吗？', pinyin: 'Kuàiyào kǎoshì le, nǐ zhǔnbèi hǎo le ma?', arabic: 'الامتحان اقترب، هل استعددت؟' },
      { speaker: 'B', hanzi: '这道题我不会，你能教我吗？', pinyin: 'Zhè dào tí wǒ bú huì, nǐ néng jiāo wǒ ma?', arabic: 'لا أعرف هذا السؤال، هل تعلّمني؟' },
      { speaker: 'A', hanzi: '可以，你写错了这个词。', pinyin: 'Kěyǐ, nǐ xiě cuò le zhège cí.', arabic: 'نعم، لقد كتبت هذه الكلمة خطأ.' },
      { speaker: 'B', hanzi: '啊，我懂了，谢谢！', pinyin: 'À, wǒ dǒng le, xièxie!', arabic: 'آه، فهمت، شكراً!' },
    ],
    vocabularyUsed: [2140, 2141], grammarUsed: [209, 210],
  },
  {
    id: 206, lesson: 15, title: 'في المطار', titleChinese: '去机场',
    context: 'الوداع قبل السفر',
    turns: [
      { speaker: 'A', hanzi: '你什么时候出国？', pinyin: 'Nǐ shénme shíhou chūguó?', arabic: 'متى ستسافر للخارج؟' },
      { speaker: 'B', hanzi: '明天，我已经买了机票。', pinyin: 'Míngtiān, wǒ yǐjīng mǎi le jīpiào.', arabic: 'غداً، اشتريت تذكرة الطيران بالفعل.' },
      { speaker: 'A', hanzi: '我送你去机场吧。', pinyin: 'Wǒ sòng nǐ qù jīchǎng ba.', arabic: 'سأوصّلك إلى المطار.' },
      { speaker: 'B', hanzi: '太好了，谢谢你！', pinyin: 'Tài hǎo le, xièxie nǐ!', arabic: 'رائع، شكراً لك!' },
    ],
    vocabularyUsed: [2180, 2185, 2184], grammarUsed: [201],
  },
]
