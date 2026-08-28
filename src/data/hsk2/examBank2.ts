// ─── [2.17] HSK2 exam bank ──────────────────────────────────────────────────
//
// HSK2 and HSK3 had ZERO exam questions — measured, not guessed — while HSK1
// had forty. So `buildChapterExam` returned an empty paper for six of the nine
// chapters, and the only honest thing a screen could do with that was refuse to
// open. This is HSK2's half of closing that.
//
// Written on the shape of `examBank.ts`, section for section, so
// `content-source.ts` reads it through the adapters that already exist.
//
// THE CONSTRAINT THAT SHAPED EVERY ITEM: every Chinese character below is drawn
// from HSK1 or HSK2 vocabulary. An exam is the last place a learner should meet
// a character for the first time — a wrong answer there reads as "you failed to
// learn this" when in fact nobody ever showed it. `scripts/check-exam-vocab.js`
// enforces it, and caught three violations in this very file on its first run
// (礼物 and 英语), so the rule is not theoretical.
//
// STATUS: authored by the assistant, `needs_review`, per the owner's rule that
// nothing machine-written ships unreviewed.

import type { HSK1ExamBank } from '@/data/examBank'

export const HSK2_EXAM_BANK: HSK1ExamBank = {
  listening_part1: [
    { id: 'h2_lp1_01', audio_text: '我每天跑步。', image_emoji: '🏃', image_label_ar: 'شخص يركض', correct: true,
      explanation_ar: '«我每天跑步» تعني «أركض كل يوم»، والصورة تُظهر شخصاً يركض. الإجابة صحيحة.' },
    { id: 'h2_lp1_02', audio_text: '他在洗手。', image_emoji: '🍎', image_label_ar: 'تفاحة', correct: false,
      explanation_ar: '«他在洗手» تعني «هو يغسل يديه»، والصورة تفاحة. لا تطابق.' },
    { id: 'h2_lp1_03', audio_text: '我的书包是红色的。', image_emoji: '🎒', image_label_ar: 'حقيبة مدرسية حمراء', correct: true,
      explanation_ar: '«书包» حقيبة مدرسية و«红色» أحمر، والصورة تطابقهما.' },
    { id: 'h2_lp1_04', audio_text: '今天天气很好。', image_emoji: '🌧️', image_label_ar: 'مطر', correct: false,
      explanation_ar: '«天气很好» تعني «الطقس جميل»، والصورة تُظهر مطراً. لا تطابق.' },
    { id: 'h2_lp1_05', audio_text: '我们一起踢足球。', image_emoji: '⚽', image_label_ar: 'كرة قدم', correct: true,
      explanation_ar: '«踢足球» تعني «نلعب كرة القدم»، والصورة كرة قدم. الإجابة صحيحة.' },
  ],

  listening_part2: [
    { id: 'h2_lp2_01', audio_text: '咖啡', explanation_ar: '«咖啡» (kāfēi) تعني «قهوة».',
      options: [
        { emoji: '☕', label: 'قهوة', correct: true },
        { emoji: '🥛', label: 'حليب', correct: false },
        { emoji: '🍵', label: 'شاي', correct: false },
        { emoji: '💧', label: 'ماء', correct: false },
      ] },
    { id: 'h2_lp2_02', audio_text: '地铁', explanation_ar: '«地铁» (dìtiě) هو مترو الأنفاق.',
      options: [
        { emoji: '🚇', label: 'مترو', correct: true },
        { emoji: '🚌', label: 'حافلة', correct: false },
        { emoji: '✈️', label: 'طائرة', correct: false },
        { emoji: '🚕', label: 'سيارة أجرة', correct: false },
      ] },
    { id: 'h2_lp2_03', audio_text: '眼睛', explanation_ar: '«眼睛» (yǎnjing) تعني «عينان».',
      options: [
        { emoji: '👀', label: 'عينان', correct: true },
        { emoji: '👂', label: 'أذن', correct: false },
        { emoji: '✋', label: 'يد', correct: false },
        { emoji: '🦶', label: 'قدم', correct: false },
      ] },
    { id: 'h2_lp2_04', audio_text: '机场', explanation_ar: '«机场» (jīchǎng) هو المطار.',
      options: [
        { emoji: '🛫', label: 'مطار', correct: true },
        { emoji: '🏨', label: 'فندق', correct: false },
        { emoji: '🏫', label: 'مدرسة', correct: false },
        { emoji: '🏪', label: 'متجر', correct: false },
      ] },
    { id: 'h2_lp2_05', audio_text: '手表', explanation_ar: '«手表» (shǒubiǎo) هي ساعة اليد.',
      options: [
        { emoji: '⌚', label: 'ساعة يد', correct: true },
        { emoji: '📱', label: 'هاتف', correct: false },
        { emoji: '💻', label: 'حاسوب', correct: false },
        { emoji: '📚', label: 'كتب', correct: false },
      ] },
  ],

  listening_part3: [
    { id: 'h2_lp3_01',
      dialogue: [{ speaker: '男', text: '你好，请问洗手间在哪儿？' }, { speaker: '女', text: '在前面，右边。' }],
      question_ar: 'أين دورة المياه؟',
      options: ['في الخلف، يساراً', 'في الأمام، يميناً', 'في الأعلى', 'بجانب الباب'],
      correct_index: 1, explanation_ar: 'المرأة تقول «在前面，右边» أي «في الأمام، على اليمين».' },
    { id: 'h2_lp3_02',
      dialogue: [{ speaker: '女', text: '你为什么不来？' }, { speaker: '男', text: '因为我很累。' }],
      question_ar: 'لماذا لم يأتِ الرجل؟',
      options: ['لأنه مشغول', 'لأنه متعب', 'لأنه مريض', 'لأنه بعيد'],
      correct_index: 1, explanation_ar: '«因为我很累» تعني «لأنني متعب جداً». و累 = متعب.' },
    { id: 'h2_lp3_03',
      dialogue: [{ speaker: '男', text: '你的爱好是什么？' }, { speaker: '女', text: '我喜欢游泳。' }],
      question_ar: 'ما هوايتها؟',
      options: ['الجري', 'السباحة', 'كرة السلة', 'الرقص'],
      correct_index: 1, explanation_ar: '«游泳» (yóuyǒng) تعني «السباحة».' },
    { id: 'h2_lp3_04',
      dialogue: [{ speaker: '女', text: '这条裤子多少钱？' }, { speaker: '男', text: '一百块。' }],
      question_ar: 'كم ثمن البنطال؟',
      options: ['عشرة', 'مئة', 'ألف', 'عشرة آلاف'],
      correct_index: 1, explanation_ar: '«一百块» تعني «مئة». و条 كلمة عدّ للأشياء الطويلة كالبنطال.' },
    { id: 'h2_lp3_05',
      dialogue: [{ speaker: '男', text: '你什么时候开始上班？' }, { speaker: '女', text: '我已经开始了。' }],
      question_ar: 'متى بدأت العمل؟',
      options: ['غداً', 'بدأت بالفعل', 'الأسبوع القادم', 'لم تقرّر'],
      correct_index: 1, explanation_ar: '«已经» (yǐjīng) تعني «بالفعل / سبق أن».' },
    { id: 'h2_lp3_06',
      dialogue: [{ speaker: '女', text: '你怎么去机场？' }, { speaker: '男', text: '我打车去。' }],
      question_ar: 'كيف سيذهب إلى المطار؟',
      options: ['بالمترو', 'بسيارة أجرة', 'بالحافلة', 'مشياً'],
      correct_index: 1, explanation_ar: '«打车» (dǎchē) تعني «يأخذ سيارة أجرة».' },
    { id: 'h2_lp3_07',
      dialogue: [{ speaker: '男', text: '你头疼吗？' }, { speaker: '女', text: '是的，我要去药店。' }],
      question_ar: 'إلى أين ستذهب؟',
      options: ['إلى المدرسة', 'إلى الصيدلية', 'إلى المطعم', 'إلى الفندق'],
      correct_index: 1, explanation_ar: '«药店» (yàodiàn) هي الصيدلية، لأن رأسها يؤلمها (头疼).' },
    { id: 'h2_lp3_08',
      dialogue: [{ speaker: '女', text: '明天是我的生日。' }, { speaker: '男', text: '那我们一起吃饭吧。' }],
      question_ar: 'ما المناسبة غداً؟',
      options: ['امتحان', 'عيد ميلادها', 'رأس السنة', 'سفر'],
      correct_index: 1, explanation_ar: '«生日» (shēngrì) تعني «عيد ميلاد».' },
    { id: 'h2_lp3_09',
      dialogue: [{ speaker: '男', text: '你家离学校远吗？' }, { speaker: '女', text: '不远，走路十分钟。' }],
      question_ar: 'كم تبعد بيتها عن المدرسة؟',
      options: ['بعيدة جداً', 'عشر دقائق مشياً', 'ساعة بالحافلة', 'لم تقل'],
      correct_index: 1, explanation_ar: '«走路十分钟» أي عشر دقائق على القدمين، و«不远» = ليست بعيدة.' },
    { id: 'h2_lp3_10',
      dialogue: [{ speaker: '女', text: '你会游泳吗？' }, { speaker: '男', text: '会一点儿，但是不好。' }],
      question_ar: 'كيف يسبح الرجل؟',
      options: ['جيداً جداً', 'قليلاً وليس جيداً', 'لا يسبح', 'يتعلّم الآن'],
      correct_index: 1, explanation_ar: '«会一点儿，但是不好» أي «قليلاً، لكن ليس جيداً».' },
  ],

  reading_part1: [
    { id: 'h2_rp1_01', hanzi: '鱼', explanation_ar: '«鱼» (yú) تعني «سمك».',
      options: [
        { emoji: '🐟', label: 'سمك', correct: true },
        { emoji: '🐦', label: 'طائر', correct: false },
        { emoji: '🌸', label: 'زهرة', correct: false },
        { emoji: '🍖', label: 'لحم', correct: false },
      ] },
    { id: 'h2_rp1_02', hanzi: '床', explanation_ar: '«床» (chuáng) هو السرير.',
      options: [
        { emoji: '🛏️', label: 'سرير', correct: true },
        { emoji: '🚪', label: 'باب', correct: false },
        { emoji: '🪑', label: 'كرسي', correct: false },
        { emoji: '🏠', label: 'بيت', correct: false },
      ] },
    { id: 'h2_rp1_03', hanzi: '花', explanation_ar: '«花» (huā) تعني «زهرة».',
      options: [
        { emoji: '🌸', label: 'زهرة', correct: true },
        { emoji: '🐟', label: 'سمك', correct: false },
        { emoji: '🐦', label: 'طائر', correct: false },
        { emoji: '📖', label: 'كتاب', correct: false },
      ] },
    { id: 'h2_rp1_04', hanzi: '笔', explanation_ar: '«笔» (bǐ) هو القلم.',
      options: [
        { emoji: '🖊️', label: 'قلم', correct: true },
        { emoji: '📓', label: 'دفتر', correct: false },
        { emoji: '🎒', label: 'حقيبة', correct: false },
        { emoji: '⌚', label: 'ساعة', correct: false },
      ] },
    { id: 'h2_rp1_05', hanzi: '鸟', explanation_ar: '«鸟» (niǎo) هو الطائر.',
      options: [
        { emoji: '🐦', label: 'طائر', correct: true },
        { emoji: '🐟', label: 'سمك', correct: false },
        { emoji: '🌸', label: 'زهرة', correct: false },
        { emoji: '🍚', label: 'أرز', correct: false },
      ] },
  ],

  reading_part2: [
    { id: 'h2_rp2_01', hanzi: '他在跳舞。', image_emoji: '💃', image_label: 'شخص يرقص', correct: true,
      explanation_ar: '«跳舞» (tiàowǔ) تعني «يرقص»، والصورة تطابقها.' },
    { id: 'h2_rp2_02', hanzi: '我在看书。', image_emoji: '🏊', image_label: 'شخص يسبح', correct: false,
      explanation_ar: '«看书» تعني «أقرأ كتاباً»، والصورة تُظهر سباحة. لا تطابق.' },
    { id: 'h2_rp2_03', hanzi: '外面下雨了。', image_emoji: '🌧️', image_label: 'مطر بالخارج', correct: true,
      explanation_ar: '«外面» بالخارج و«下雨» تمطر، والصورة تطابقهما.' },
    { id: 'h2_rp2_04', hanzi: '这是我的手表。', image_emoji: '🎒', image_label: 'حقيبة مدرسية', correct: false,
      explanation_ar: '«手表» ساعة يد، والصورة حقيبة. لا تطابق.' },
    { id: 'h2_rp2_05', hanzi: '他打篮球。', image_emoji: '🏀', image_label: 'كرة سلة', correct: true,
      explanation_ar: '«打篮球» تعني «يلعب كرة السلة»، والصورة تطابقها.' },
  ],

  reading_part3: [
    { id: 'h2_rp3_01', sentence: '我很累，___休息一下。', word_choices: ['想', '走', '笑', '飞'],
      correct_index: 0, full_sentence: '我很累，想休息一下。', translation_ar: 'أنا متعب، أريد أن أستريح قليلاً.' },
    { id: 'h2_rp3_02', sentence: '___我很忙，所以没去。', word_choices: ['因为', '但是', '虽然', '还是'],
      correct_index: 0, full_sentence: '因为我很忙，所以没去。', translation_ar: 'لأنني كنت مشغولاً جداً، لم أذهب.' },
    { id: 'h2_rp3_03', sentence: '他每天___去学校。', word_choices: ['走路', '洗手', '打开', '介绍'],
      correct_index: 0, full_sentence: '他每天走路去学校。', translation_ar: 'يذهب إلى المدرسة مشياً كل يوم.' },
    { id: 'h2_rp3_04', sentence: '这个电影很___。', word_choices: ['有意思', '洗手间', '书包', '手表'],
      correct_index: 0, full_sentence: '这个电影很有意思。', translation_ar: 'هذا الفيلم ممتع جداً.' },
    { id: 'h2_rp3_05', sentence: '请你___我一下。', word_choices: ['帮', '飞', '笑', '姓'],
      correct_index: 0, full_sentence: '请你帮我一下。', translation_ar: 'من فضلك ساعدني قليلاً.' },
    { id: 'h2_rp3_06', sentence: '我___吃过北京烤鸭。', word_choices: ['已经', '一起', '经常', '可能'],
      correct_index: 0, full_sentence: '我已经吃过北京烤鸭。', translation_ar: 'سبق أن أكلت بطة بكين المشوية.' },
    { id: 'h2_rp3_07', sentence: '他的个子很___。', word_choices: ['高', '快', '错', '远'],
      correct_index: 0, full_sentence: '他的个子很高。', translation_ar: 'قامته طويلة جداً.' },
    { id: 'h2_rp3_08', sentence: '我们___去饭馆吧。', word_choices: ['一起', '为什么', '不好意思', '有时'],
      correct_index: 0, full_sentence: '我们一起去饭馆吧。', translation_ar: 'لنذهب إلى المطعم معاً.' },
    { id: 'h2_rp3_09', sentence: '考试___要开始了。', word_choices: ['快', '因为', '所以', '虽然'],
      correct_index: 0, full_sentence: '考试快要开始了。', translation_ar: 'الامتحان على وشك أن يبدأ.' },
    { id: 'h2_rp3_10', sentence: '我不___这个词的意思。', word_choices: ['懂', '洗', '拿', '踢'],
      correct_index: 0, full_sentence: '我不懂这个词的意思。', translation_ar: 'لا أفهم معنى هذه الكلمة.' },
  ],
}
