// ─── [2.17] HSK3 exam bank ──────────────────────────────────────────────────
//
// The other half of closing the gap described in `hsk2/examBank2.ts`: HSK3's
// three chapters returned an empty paper, so the exam screen had nothing to
// render and the level ended without an assessment.
//
// Same shape, same six sections, same hard constraint — every Chinese character
// below comes from HSK1, HSK2 or HSK3 vocabulary, enforced by
// `scripts/check-exam-vocab.js`. At this level the constraint is looser in
// practice (673 characters are available by now) but the check still matters:
// it is exactly when the vocabulary feels large that an author stops noticing
// they reached past it.
//
// The items lean on HSK3's own themes — travel and luggage, the restaurant,
// the flat and its appliances, the bank, health — rather than repeating HSK1's
// greetings, so the paper measures this level rather than the ones before it.
//
// STATUS: authored by the assistant, `needs_review`.

import type { HSK1ExamBank } from '@/data/examBank'

export const HSK3_EXAM_BANK: HSK1ExamBank = {
  listening_part1: [
    { id: 'h3_lp1_01', audio_text: '我的行李丢了。', image_emoji: '🧳', image_label_ar: 'حقيبة سفر', correct: true,
      explanation_ar: '«行李» أمتعة و«丢了» ضاعت، والصورة حقيبة سفر. الإجابة صحيحة.' },
    { id: 'h3_lp1_02', audio_text: '房子里有空调。', image_emoji: '🍜', image_label_ar: 'طبق شعيرية', correct: false,
      explanation_ar: '«空调» مكيّف هواء، والصورة طعام. لا تطابق.' },
    { id: 'h3_lp1_03', audio_text: '他在银行工作。', image_emoji: '🏦', image_label_ar: 'بنك', correct: true,
      explanation_ar: '«银行» (yínháng) هو البنك، والصورة تطابقه.' },
    { id: 'h3_lp1_04', audio_text: '我很渴。', image_emoji: '😴', image_label_ar: 'شخص نائم', correct: false,
      explanation_ar: '«渴» تعني «عطشان» لا «نعسان». لا تطابق.' },
    { id: 'h3_lp1_05', audio_text: '请给我一双筷子。', image_emoji: '🥢', image_label_ar: 'عيدان طعام', correct: true,
      explanation_ar: '«筷子» (kuàizi) هي عيدان الطعام، والصورة تطابقها.' },
  ],

  listening_part2: [
    { id: 'h3_lp2_01', audio_text: '护照', explanation_ar: '«护照» (hùzhào) هو جواز السفر.',
      options: [
        { emoji: '🛂', label: 'جواز سفر', correct: true },
        { emoji: '💳', label: 'بطاقة ائتمان', correct: false },
        { emoji: '🎫', label: 'تذكرة', correct: false },
        { emoji: '📄', label: 'ورقة', correct: false },
      ] },
    { id: 'h3_lp2_02', audio_text: '冰箱', explanation_ar: '«冰箱» (bīngxiāng) هي الثلاجة.',
      options: [
        { emoji: '🧊', label: 'ثلاجة', correct: true },
        { emoji: '🧺', label: 'غسّالة', correct: false },
        { emoji: '💡', label: 'مصباح', correct: false },
        { emoji: '🛏️', label: 'سرير', correct: false },
      ] },
    { id: 'h3_lp2_03', audio_text: '蛋糕', explanation_ar: '«蛋糕» (dàngāo) هي الكعكة.',
      options: [
        { emoji: '🍰', label: 'كعكة', correct: true },
        { emoji: '🍜', label: 'شعيرية', correct: false },
        { emoji: '🍚', label: 'أرز', correct: false },
        { emoji: '🐟', label: 'سمك', correct: false },
      ] },
    { id: 'h3_lp2_04', audio_text: '花园', explanation_ar: '«花园» (huāyuán) هي الحديقة.',
      options: [
        { emoji: '🌷', label: 'حديقة', correct: true },
        { emoji: '🏦', label: 'بنك', correct: false },
        { emoji: '🏨', label: 'فندق', correct: false },
        { emoji: '🚇', label: 'مترو', correct: false },
      ] },
    { id: 'h3_lp2_05', audio_text: '照片', explanation_ar: '«照片» (zhàopiàn) هي الصورة الفوتوغرافية.',
      options: [
        { emoji: '🖼️', label: 'صورة', correct: true },
        { emoji: '📄', label: 'ورقة', correct: false },
        { emoji: '🧳', label: 'حقيبة', correct: false },
        { emoji: '🥄', label: 'ملعقة', correct: false },
      ] },
  ],

  listening_part3: [
    { id: 'h3_lp3_01',
      dialogue: [{ speaker: '女', text: '你的行李找到了吗？' }, { speaker: '男', text: '还没有，我很着急。' }],
      question_ar: 'ما حال الرجل؟',
      options: ['مسرور', 'قلق', 'متعب', 'جائع'],
      correct_index: 1, explanation_ar: '«着急» (zháojí) تعني «قلق / متلهّف»، ولم يجد أمتعته بعد.' },
    { id: 'h3_lp3_02',
      dialogue: [{ speaker: '男', text: '这个房子怎么样？' }, { speaker: '女', text: '环境很好，但是有点儿贵。' }],
      question_ar: 'ما رأيها في البيت؟',
      options: ['رخيص وجميل', 'محيطه جيد لكنه غالٍ قليلاً', 'بعيد جداً', 'صغير'],
      correct_index: 1, explanation_ar: '«环境很好» المحيط جيد، «但是有点儿贵» لكنه غالٍ قليلاً.' },
    { id: 'h3_lp3_03',
      dialogue: [{ speaker: '女', text: '你要用信用卡吗？' }, { speaker: '男', text: '不用，我带了钱。' }],
      question_ar: 'بماذا سيدفع؟',
      options: ['ببطاقة ائتمان', 'بالمال الذي أحضره', 'لن يدفع', 'لم يقرّر'],
      correct_index: 1, explanation_ar: '«不用» أي «لا حاجة»، و«我带了钱» أحضرتُ مالاً — فلن يستعمل البطاقة.' },
    { id: 'h3_lp3_04',
      dialogue: [{ speaker: '男', text: '你饿了吗？' }, { speaker: '女', text: '有点儿，我们点外卖吧。' }],
      question_ar: 'ماذا اقترحت؟',
      options: ['الذهاب لمطعم', 'طلب توصيل طعام', 'الطبخ في البيت', 'الانتظار'],
      correct_index: 1, explanation_ar: '«点外卖» تعني «نطلب طعاماً بالتوصيل».' },
    { id: 'h3_lp3_05',
      dialogue: [{ speaker: '女', text: '你什么时候搬家？' }, { speaker: '男', text: '下个星期。' }],
      question_ar: 'متى سينتقل؟',
      options: ['اليوم', 'الأسبوع القادم', 'الشهر القادم', 'لم يقرّر'],
      correct_index: 1, explanation_ar: '«下个星期» تعني «الأسبوع القادم»، و搬家 = ينتقل لمنزل جديد.' },
    { id: 'h3_lp3_06',
      dialogue: [{ speaker: '男', text: '请问服务台在哪儿？' }, { speaker: '女', text: '在中间，前面一点儿。' }],
      question_ar: 'أين مكتب الخدمة؟',
      options: ['على اليسار', 'في الوسط، إلى الأمام قليلاً', 'في الأعلى', 'خارج المبنى'],
      correct_index: 1, explanation_ar: '«中间» الوسط، و«前面一点儿» إلى الأمام قليلاً.' },
    { id: 'h3_lp3_07',
      dialogue: [{ speaker: '女', text: '你的头发很短。' }, { speaker: '男', text: '是的，昨天刚换的。' }],
      question_ar: 'ماذا لاحظت المرأة؟',
      options: ['أنه نحيف', 'أن شعره قصير', 'أنه طويل', 'أنه متعب'],
      correct_index: 1, explanation_ar: '«头发很短» تعني «شعرك قصير جداً».' },
    { id: 'h3_lp3_08',
      dialogue: [{ speaker: '男', text: '这个菜你尝过吗？' }, { speaker: '女', text: '尝过，很好吃。' }],
      question_ar: 'ما رأيها في الطبق؟',
      options: ['لم تجرّبه', 'جرّبته وكان لذيذاً', 'لم يعجبها', 'حارّ جداً'],
      correct_index: 1, explanation_ar: '«尝过» تعني «تذوّقته»، و«很好吃» لذيذ جداً.' },
    { id: 'h3_lp3_09',
      dialogue: [{ speaker: '女', text: '假期你去哪儿了？' }, { speaker: '男', text: '我去海边了。' }],
      question_ar: 'أين قضى العطلة؟',
      options: ['في الجبل', 'على شاطئ البحر', 'في البيت', 'في المدرسة'],
      correct_index: 1, explanation_ar: '«海边» تعني «شاطئ البحر»، و假期 = عطلة.' },
    { id: 'h3_lp3_10',
      dialogue: [{ speaker: '男', text: '你为什么不用洗衣机？' }, { speaker: '女', text: '它坏了。' }],
      question_ar: 'لماذا لا تستخدم الغسّالة؟',
      options: ['لا تعرف كيف', 'لأنها معطّلة', 'لأنها بعيدة', 'لا تحتاجها'],
      correct_index: 1, explanation_ar: '«坏了» تعني «تعطّلت».' },
  ],

  reading_part1: [
    { id: 'h3_rp1_01', hanzi: '碗', explanation_ar: '«碗» (wǎn) هو الصحن أو الوعاء.',
      options: [
        { emoji: '🥣', label: 'وعاء', correct: true },
        { emoji: '🥢', label: 'عيدان', correct: false },
        { emoji: '🥄', label: 'ملعقة', correct: false },
        { emoji: '🍰', label: 'كعكة', correct: false },
      ] },
    { id: 'h3_rp1_02', hanzi: '灯', explanation_ar: '«灯» (dēng) هو المصباح.',
      options: [
        { emoji: '💡', label: 'مصباح', correct: true },
        { emoji: '🧊', label: 'ثلاجة', correct: false },
        { emoji: '🧺', label: 'غسّالة', correct: false },
        { emoji: '🛏️', label: 'سرير', correct: false },
      ] },
    { id: 'h3_rp1_03', hanzi: '海', explanation_ar: '«海» (hǎi) هو البحر.',
      options: [
        { emoji: '🌊', label: 'بحر', correct: true },
        { emoji: '🌷', label: 'حديقة', correct: false },
        { emoji: '🏦', label: 'بنك', correct: false },
        { emoji: '🧳', label: 'حقيبة', correct: false },
      ] },
    { id: 'h3_rp1_04', hanzi: '鸡', explanation_ar: '«鸡» (jī) هو الدجاج.',
      options: [
        { emoji: '🍗', label: 'دجاج', correct: true },
        { emoji: '🐟', label: 'سمك', correct: false },
        { emoji: '🍚', label: 'أرز', correct: false },
        { emoji: '🍰', label: 'كعكة', correct: false },
      ] },
    { id: 'h3_rp1_05', hanzi: '纸', explanation_ar: '«纸» (zhǐ) هو الورق.',
      options: [
        { emoji: '📄', label: 'ورق', correct: true },
        { emoji: '🖼️', label: 'صورة', correct: false },
        { emoji: '💳', label: 'بطاقة', correct: false },
        { emoji: '🛂', label: 'جواز', correct: false },
      ] },
  ],

  reading_part2: [
    { id: 'h3_rp2_01', hanzi: '他在打扫房间。', image_emoji: '🧹', image_label: 'شخص ينظّف', correct: true,
      explanation_ar: '«打扫» تعني «ينظّف»، والصورة تطابقها.' },
    { id: 'h3_rp2_02', hanzi: '我需要一个箱子。', image_emoji: '🍗', image_label: 'دجاج', correct: false,
      explanation_ar: '«箱子» حقيبة أو صندوق، والصورة طعام. لا تطابق.' },
    { id: 'h3_rp2_03', hanzi: '她在看照片。', image_emoji: '🖼️', image_label: 'صورة', correct: true,
      explanation_ar: '«照片» صورة فوتوغرافية، والصورة تطابقها.' },
    { id: 'h3_rp2_04', hanzi: '他去银行了。', image_emoji: '🌊', image_label: 'بحر', correct: false,
      explanation_ar: '«银行» بنك، والصورة بحر. لا تطابق.' },
    { id: 'h3_rp2_05', hanzi: '桌子上有一个碗。', image_emoji: '🥣', image_label: 'وعاء', correct: true,
      explanation_ar: '«碗» وعاء، والصورة تطابقها.' },
  ],

  reading_part3: [
    { id: 'h3_rp3_01', sentence: '我的护照___了，怎么办？', word_choices: ['丢', '换', '带', '选'],
      correct_index: 0, full_sentence: '我的护照丢了，怎么办？', translation_ar: 'ضاع جواز سفري، ماذا أفعل؟' },
    { id: 'h3_rp3_02', sentence: '这件事很___，不要忘。', word_choices: ['重要', '简单', '方便', '年轻'],
      correct_index: 0, full_sentence: '这件事很重要，不要忘。', translation_ar: 'هذا الأمر مهم جداً، لا تنسَ.' },
    { id: 'h3_rp3_03', sentence: '我很饿，想___点儿东西。', word_choices: ['吃', '站', '搬', '关'],
      correct_index: 0, full_sentence: '我很饿，想吃点儿东西。', translation_ar: 'أنا جائع، أريد أن آكل شيئاً.' },
    { id: 'h3_rp3_04', sentence: '请___一下灯。', word_choices: ['关', '尝', '选', '接'],
      correct_index: 0, full_sentence: '请关一下灯。', translation_ar: 'من فضلك أطفئ المصباح.' },
    { id: 'h3_rp3_05', sentence: '我___他是老师。', word_choices: ['以为', '需要', '发现', '帮助'],
      correct_index: 0, full_sentence: '我以为他是老师。', translation_ar: 'ظننت أنه معلّم.' },
    { id: 'h3_rp3_06', sentence: '这个小区的___很好。', word_choices: ['环境', '号码', '行李', '头发'],
      correct_index: 0, full_sentence: '这个小区的环境很好。', translation_ar: 'محيط هذا الحي جيد جداً.' },
    { id: 'h3_rp3_07', sentence: '服务员很___。', word_choices: ['热情', '着急', '短', '瘦'],
      correct_index: 0, full_sentence: '服务员很热情。', translation_ar: 'النادل ودود جداً.' },
    { id: 'h3_rp3_08', sentence: '我要___钱。', word_choices: ['还', '尝', '打扫', '搬家'],
      correct_index: 0, full_sentence: '我要还钱。', translation_ar: 'أريد أن أُعيد المال.' },
    { id: 'h3_rp3_09', sentence: '我们用___吃饭。', word_choices: ['筷子', '照片', '护照', '空调'],
      correct_index: 0, full_sentence: '我们用筷子吃饭。', translation_ar: 'نأكل بعيدان الطعام.' },
    { id: 'h3_rp3_10', sentence: '假期我想去___边。', word_choices: ['海', '灯', '纸', '碗'],
      correct_index: 0, full_sentence: '假期我想去海边。', translation_ar: 'أريد الذهاب إلى شاطئ البحر في العطلة.' },
  ],
}
