#!/usr/bin/env python3
"""Expand lessons.ts with keySentences, exercises, and fix short lessons."""

import re
import json

# ============================================================
# 1. Define new interface and content for all 15 lessons
# ============================================================

NEW_INTERFACE = '''export interface Lesson {
  lessonId: number;
  title: string;
  titleChinese: string;
  description: string;
  wordIds: number[];
  grammarRuleIds: number[];
  conversationIds: number[];
  estimatedMinutes: number;
  keySentences: { zh: string; pinyin: string; ar: string }[];
  exercises: {
    type: 'multiple_choice' | 'fill_blank' | 'translation' | 'matching';
    question: string;
    options?: string[];
    correct?: number;
    answer?: string;
    hint?: string;
    explanation: string;
  }[];
}'''

# ============================================================
# 2. Expanded word IDs for short lessons
# ============================================================

EXPANDED_WORD_IDS = {
    8: [88,91,93,114,130,143,325,326,327,328,
        # New transport/travel words from lesson 15:
        92,   # 打电话 - make phone call
        115,  # 分 - minute
        299,  # 坐 - to sit (sit on bus/train)
        191,  # 去 - to go
        150,  # 来 - to come
        342,  # 快 - fast
        343,  # 慢 - slow
        344,  # 远 - far
        345,  # 近 - close/near
        348,  # 方便 - convenient
        350,  # 地方 - place
        370,  # 附近 - nearby
        399,  # 火车站 - train station
        397,  # 排队 - wait in line
    ],
    9: [152,193,237,257,273,305,306,307,308,309,310,324,
        # New weather/time words from lesson 15:
        44,   # 还 - still
        202,  # 少 - little/few
        398,  # 阳光 - sunlight
        229,  # 晚 - late
        362,  # 经常 - often
        385,  # 周末 - weekend
        373,  # 最近 - recently
        340,  # 长 - long
        341,  # 短 - short
        380,  # 一般 - average/normal
    ],
    10: [82,145,203,265,312,313,314,315,316,317,318,346,
         # New body/health words from lesson 15:
         353,  # 感冒 - catch cold
         388,  # 感觉 - to feel
         384,  # 锻炼 - to exercise/train
         364,  # 运动 - sports/exercise
         189,  # 起床 - to wake up
         211,  # 睡 - to sleep
         375,  # 放心 - to be relieved
         369,  # 担心 - to worry
         409,  # 散步 - to take a walk
         387,  # 努力 - to work hard
         379,  # 加油 - come on
    ],
    12: [86,102,117,123,125,224,228,250,
         # New entertainment/hobby words from lesson 15:
         374,  # 比赛 - competition/match
         376,  # 生日 - birthday
         377,  # 春节 - Spring Festival
         386,  # 公园 - park
         364,  # 运动 - sports
         384,  # 锻炼 - exercise
         124,  # 好听 - sounds nice
         223,  # 听 - to listen
         146,  # 看见 - to see
         372,  # 一起 - together
         292,  # 知道 - to know
         120,  # 狗 - dog (pet)
         311,  # 鸟 - bird
         243,  # 小朋友 - child
         298,  # 字 - character
         281,  # 怎么 - how
    ],
    13: [45,50,113,141,183,347,389,
         # New feelings/emotions words from lesson 15:
         24,   # 没事 - it's okay/never mind
         388,  # 感觉 - to feel
         369,  # 担心 - to worry
         375,  # 放心 - to be relieved
         408,  # 生气 - to be angry
         365,  # 希望 - to hope
         379,  # 加油 - come on
         383,  # 聪明 - smart
         381,  # 厉害 - awesome
         282,  # 怎么样 - how about it
         404,  # 明白 - to understand
         367,  # 告诉 - to tell
         361,  # 可能 - maybe
         360,  # 一定 - definitely
         355,  # 应该 - should
         382,  # 简单 - simple
    ],
}

# Words moved out of lesson 15
MOVED_IDS = set()
for ids in EXPANDED_WORD_IDS.values():
    MOVED_IDS.update(ids)

# Original lesson 15 word IDs
L15_ORIGINAL = [22,23,24,35,44,51,56,83,92,97,106,115,118,120,124,129,134,146,148,150,
                162,176,180,189,190,191,192,197,201,202,205,211,215,216,219,223,225,
                229,232,238,240,243,245,246,251,260,270,271,272,281,282,283,291,292,
                294,295,298,299,300,311,338,339,340,341,342,343,344,345,348,350,352,
                353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,
                370,371,372,373,374,375,376,377,379,380,381,382,383,384,385,386,387,
                388,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,406,
                407,408,409,410]

L15_NEW = [wid for wid in L15_ORIGINAL if wid not in MOVED_IDS]

# ============================================================
# 3. Key Sentences and Exercises for all 15 lessons
# ============================================================

LESSON_CONTENT = {
    1: {
        "keySentences": [
            {"zh": "你好！", "pinyin": "Nǐ hǎo!", "ar": "مرحباً!"},
            {"zh": "你好吗？", "pinyin": "Nǐ hǎo ma?", "ar": "كيف حالك؟"},
            {"zh": "我很好，谢谢。", "pinyin": "Wǒ hěn hǎo, xièxie.", "ar": "أنا بخير، شكراً."},
            {"zh": "请问，你叫什么名字？", "pinyin": "Qǐngwèn, nǐ jiào shénme míngzi?", "ar": "عفواً، ما اسمك؟"},
            {"zh": "我叫大卫。", "pinyin": "Wǒ jiào Dàwèi.", "ar": "اسمي ديفيد."},
            {"zh": "我是学生。", "pinyin": "Wǒ shì xuéshēng.", "ar": "أنا طالب."},
            {"zh": "认识你很高兴。", "pinyin": "Rènshi nǐ hěn gāoxìng.", "ar": "سعيد بمعرفتك."},
            {"zh": "再见！明天见。", "pinyin": "Zàijiàn! Míngtiān jiàn.", "ar": "مع السلامة! أراك غداً."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"你好吗？\" تعني:", "options": ["ما اسمك؟", "كيف حالك؟", "من أين أنت؟", "ماذا تريد؟"], "correct": 1, "explanation": "你好吗 = كيف حالك؟。吗 أداة استفهام تُضاف في نهاية الجملة."},
            {"type": "multiple_choice", "question": "كيف تقول \"شكراً\" بالصينية؟", "options": ["你好", "再见", "谢谢", "不客气"], "correct": 2, "explanation": "谢谢 (xièxie) = شكراً"},
            {"type": "fill_blank", "question": "我___大卫。 (اسمي ديفيد)", "answer": "叫", "hint": "jiào", "explanation": "叫 = يُسمّى/اسمه。 我叫... = اسمي..."},
            {"type": "fill_blank", "question": "我___学生。 (أنا طالب)", "answer": "是", "hint": "shì", "explanation": "是 (shì) = فعل الكينونة \"يكون/هو\"."},
            {"type": "translation", "question": "ترجم إلى الصينية: \"أنا بخير، شكراً.\"", "answer": "我很好，谢谢。", "hint": "Wǒ hěn hǎo, xièxie.", "explanation": "很 (hěn) = جداً. 好 (hǎo) = جيد."},
            {"type": "multiple_choice", "question": "\"再见\" تعني:", "options": ["صباح الخير", "مع السلامة", "أهلاً وسهلاً", "تصبح على خير"], "correct": 1, "explanation": "再见 (zàijiàn) = مع السلامة / وداعاً."},
        ],
    },
    2: {
        "keySentences": [
            {"zh": "一，二，三……十", "pinyin": "Yī, èr, sān……shí", "ar": "واحد، اثنان، ثلاثة…… عشرة"},
            {"zh": "这个多少钱？", "pinyin": "Zhège duōshao qián?", "ar": "كم سعر هذا؟"},
            {"zh": "我要三个。", "pinyin": "Wǒ yào sān gè.", "ar": "أريد ثلاثة."},
            {"zh": "一百二十三", "pinyin": "Yī bǎi èr shí sān", "ar": "مائة وثلاثة وعشرون"},
            {"zh": "今天几号？", "pinyin": "Jīntiān jǐ hào?", "ar": "اليوم كم تاريخه؟"},
            {"zh": "他今年二十岁。", "pinyin": "Tā jīnnián èr shí suì.", "ar": "هو هذا العام يبلغ من العمر عشرين عاماً."},
            {"zh": "一共多少钱？", "pinyin": "Yīgòng duōshao qián?", "ar": "كم المجموع؟"},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"十五\" تعني بالعربية:", "options": ["خمسة عشر", "ثلاثة عشر", "عشرة", "خمسة"], "correct": 0, "explanation": "十五 (shíwǔ) = خمسة عشر"},
            {"type": "multiple_choice", "question": "كيف تسأل عن الثمن بالصينية؟", "options": ["这个是什么？", "这个多少钱？", "你要几个？", "这个好不好？"], "correct": 1, "explanation": "多少钱 (duōshao qián) = كم الثمن / كم السعر."},
            {"type": "fill_blank", "question": "我___两个苹果。 (أريد تفاحتين)", "answer": "要", "hint": "yào", "explanation": "要 (yào) = يريد."},
            {"type": "fill_blank", "question": "一共___多少钱？ (كم المجموع؟)", "answer": "多少", "hint": "duōshao", "explanation": "多少 = كم."},
            {"type": "translation", "question": "ترجم إلى الصينية: \"عشرون شخصاً\"", "answer": "二十个人", "hint": "èr shí gè rén", "explanation": "二十 = 20，个 = معدّ،人 = شخص."},
        ],
    },
    3: {
        "keySentences": [
            {"zh": "现在几点？", "pinyin": "Xiànzài jǐ diǎn?", "ar": "الساعة كم الآن؟"},
            {"zh": "现在八点半。", "pinyin": "Xiànzài bā diǎn bàn.", "ar": "الآن الثامنة والنصف."},
            {"zh": "今天是星期几？", "pinyin": "Jīntiān shì xīngqī jǐ?", "ar": "اليوم يوم الجمعة؟ (أي يوم؟)"},
            {"zh": "今天是星期一。", "pinyin": "Jīntiān shì xīngqī yī.", "ar": "اليوم هو الإثنين."},
            {"zh": "你几点起床？", "pinyin": "Nǐ jǐ diǎn qǐchuáng?", "ar": "في أي ساعة تستيقظ؟"},
            {"zh": "我早上七点上课。", "pinyin": "Wǒ zǎoshàng qī diǎn shàngkè.", "ar": "أبدأ الدرس الساعة سبعة صباحاً."},
            {"zh": "明天是我生日。", "pinyin": "Míngtiān shì wǒ shēngrì.", "ar": "غداً هو عيد ميلادي."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "كيف تسأل عن الوقت؟", "options": ["今天是几号？", "现在几点？", "你几岁？", "明天做什么？"], "correct": 1, "explanation": "几点 (jǐ diǎn) = كم الساعة."},
            {"type": "multiple_choice", "question": "\"星期三\" هو:", "options": ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس"], "correct": 2, "explanation": "星期三 (xīngqī sān) = الأربعاء."},
            {"type": "fill_blank", "question": "现在___八点。 (الآن الثامنة)", "answer": "点", "hint": "diǎn", "explanation": "点 (diǎn) = ساعة/نقطة."},
            {"type": "fill_blank", "question": "今天是星期___。 (اليوم هو الجمعة)", "answer": "五", "hint": "wǔ", "explanation": "星期五 (xīngqī wǔ) = الجمعة."},
            {"type": "translation", "question": "ترجم: \"الساعة الآن الثانية والنصف.\"", "answer": "现在两点半。", "hint": "Xiànzài liǎng diǎn bàn.", "explanation": "半 (bàn) = النصف."},
        ],
    },
    4: {
        "keySentences": [
            {"zh": "这是我的爸爸。", "pinyin": "Zhè shì wǒ de bàba.", "ar": "هذا أبي."},
            {"zh": "我有两个哥哥。", "pinyin": "Wǒ yǒu liǎng gè gēge.", "ar": "لدي أخوان أكبر مني."},
            {"zh": "她是我妹妹。", "pinyin": "Tā shì wǒ mèimei.", "ar": "هي أختي الصغرى."},
            {"zh": "我们是一家人。", "pinyin": "Wǒmen shì yī jiā rén.", "ar": "نحن عائلة واحدة."},
            {"zh": "他喜欢他妈妈。", "pinyin": "Tā xǐhuān tā māma.", "ar": "هو يحب أمه."},
            {"zh": "你有兄弟姐妹吗？", "pinyin": "Nǐ yǒu xiōngdìjiěmèi ma?", "ar": "هل لديك إخوة وأخوات؟"},
            {"zh": "我的家人都很友好。", "pinyin": "Wǒ de jiārén dōu hěn yǒuhǎo.", "ar": "عائلتي كلها ودودة."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"哥哥\" يعني:", "options": ["الأخ الأصغر", "الأخ الأكبر", "الابن", "الأب"], "correct": 1, "explanation": "哥哥 (gēge) = الأخ الأكبر."},
            {"type": "multiple_choice", "question": "كيف تقول \"أختي الصغرى\"؟", "options": ["姐姐", "妹妹", "姐姐们", "妈妈"], "correct": 1, "explanation": "妹妹 (mèimei) = الأخت الصغرى."},
            {"type": "fill_blank", "question": "我___一个姐姐和一个弟弟。 (لدي أخت كبرى وأخ أصغر)", "answer": "有", "hint": "yǒu", "explanation": "有 (yǒu) = لدي / يوجد."},
            {"type": "fill_blank", "question": "这___我的家人。 (هذه عائلتي)", "answer": "是", "hint": "shì", "explanation": "是 (shì) = هو/يكون."},
            {"type": "translation", "question": "ترجم: \"هل لديك إخوة؟\"", "answer": "你有兄弟姐妹吗？", "hint": "Nǐ yǒu xiōngdìjiěmèi ma?", "explanation": "兄弟姐妹 = إخوة وأخوات."},
        ],
    },
    5: {
        "keySentences": [
            {"zh": "你想吃什么？", "pinyin": "Nǐ xiǎng chī shénme?", "ar": "ماذا تريد أن تأكل؟"},
            {"zh": "我想喝茶。", "pinyin": "Wǒ xiǎng hē chá.", "ar": "أريد شرب الشاي."},
            {"zh": "这个菜很好吃。", "pinyin": "Zhège cài hěn hǎochī.", "ar": "هذا الطبق لذيذ جداً."},
            {"zh": "请给我一杯水。", "pinyin": "Qǐng gěi wǒ yì bēi shuǐ.", "ar": "من فضلك أعطني كوب ماء."},
            {"zh": "我不喜欢吃辣的。", "pinyin": "Wǒ bù xǐhuān chī là de.", "ar": "لا أحب الأكل الحار."},
            {"zh": "一共多少钱？", "pinyin": "Yīgòng duōshao qián?", "ar": "كم المجموع؟"},
            {"zh": "再来一碗米饭，谢谢。", "pinyin": "Zài lái yì wǎn mǐfàn, xièxie.", "ar": "طبق أرز آخر من فضلك، شكراً."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"米饭\" يعني:", "options": ["شاي", "ماء", "أرز", "خبز"], "correct": 2, "explanation": "米饭 (mǐfàn) = أرز مطبوخ."},
            {"type": "multiple_choice", "question": "كيف تقول \"ماء\" بالصينية؟", "options": ["茶", "米饭", "水", "果汁"], "correct": 2, "explanation": "水 (shuǐ) = ماء."},
            {"type": "fill_blank", "question": "我___喝咖啡。 (أريد شرب القهوة)", "answer": "想", "hint": "xiǎng", "explanation": "想 (xiǎng) = يريد / يتمنى."},
            {"type": "fill_blank", "question": "这个菜很___。 (هذا الطبق لذيذ جداً)", "answer": "好吃", "hint": "hǎochī", "explanation": "好吃 (hǎochī) = لذيذ."},
            {"type": "translation", "question": "ترجم: \"من فضلك أعطني قهوة.\"", "answer": "请给我一杯咖啡。", "hint": "Qǐng gěi wǒ yì bēi kāfēi.", "explanation": "一杯 = كوب واحد."},
        ],
    },
    6: {
        "keySentences": [
            {"zh": "这个多少钱？", "pinyin": "Zhège duōshao qián?", "ar": "كم سعر هذا؟"},
            {"zh": "太贵了！便宜一点儿吧。", "pinyin": "Tài guì le! Piányi yìdiǎnr ba.", "ar": "غالي جداً! اجعله أرخص قليلاً."},
            {"zh": "我要买这本书。", "pinyin": "Wǒ yào mǎi zhè běn shū.", "ar": "أريد شراء هذا الكتاب."},
            {"zh": "可以便宜一点吗？", "pinyin": "Kěyǐ piányi yìdiǎn ma?", "ar": "هل يمكن أن يكون أرخص قليلاً؟"},
            {"zh": "我付现金。", "pinyin": "Wǒ fù xiànjīn.", "ar": "أدفع نقداً."},
            {"zh": "你要什么颜色？", "pinyin": "Nǐ yào shénme yánsè?", "ar": "ما اللون الذي تريده؟"},
            {"zh": "给我两个，谢谢。", "pinyin": "Gěi wǒ liǎng gè, xièxie.", "ar": "أعطني اثنين، شكراً."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "كيف تسأل عن السعر؟", "options": ["这是什么？", "这个多少钱？", "这个好不好？", "你要买吗？"], "correct": 1, "explanation": "多少钱 (duōshao qián) = كم الثمن."},
            {"type": "multiple_choice", "question": "\"便宜\" تعني:", "options": ["غالي", "رخيص", "جيد", "كثير"], "correct": 1, "explanation": "便宜 (piányi) = رخيص."},
            {"type": "fill_blank", "question": "太___了！ (غالٍ جداً!)", "answer": "贵", "hint": "guì", "explanation": "贵 (guì) = غالي / باهظ الثمن."},
            {"type": "fill_blank", "question": "我___买一件衣服。 (أريد شراء ثوب)", "answer": "想", "hint": "xiǎng", "explanation": "想 (xiǎng) = يريد."},
            {"type": "translation", "question": "ترجم: \"هل يمكن أن يكون أرخص قليلاً؟\"", "answer": "可以便宜一点吗？", "hint": "Kěyǐ piányi yìdiǎn ma?", "explanation": "可以 (kěyǐ) = يمكن."},
        ],
    },
    7: {
        "keySentences": [
            {"zh": "请问，洗手间在哪儿？", "pinyin": "Qǐngwèn, xǐshǒujiān zài nǎr?", "ar": "عفواً، أين الحمام؟"},
            {"zh": "学校在左边。", "pinyin": "Xuéxiào zài zuǒbiān.", "ar": "المدرسة على اليسار."},
            {"zh": "邮局就在附近。", "pinyin": "Yóujú jiù zài fùjìn.", "ar": "مكتب البريد قريب جداً."},
            {"zh": "往前走，然后右转。", "pinyin": "Wǎng qián zǒu, ránhòu yòu zhuǎn.", "ar": "اسلك الأمام ثم انعطف يميناً."},
            {"zh": "这里是我家。", "pinyin": "Zhèlǐ shì wǒ jiā.", "ar": "هنا هو منزلي."},
            {"zh": "图书馆在那边。", "pinyin": "Túshūguǎn zài nàbiān.", "ar": "المكتبة هناك."},
            {"zh": "离这里远不远？", "pinyin": "Lí zhèlǐ yuǎn bù yuǎn?", "ar": "هل هو بعيد من هنا؟"},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "كيف تسأل عن مكان الحمام؟", "options": ["洗手间是什么？", "洗手间在哪儿？", "洗手间好不好？", "去洗手间吧"], "correct": 1, "explanation": "在哪儿 (zài nǎr) = أين."},
            {"type": "multiple_choice", "question": "\"左边\" يعني:", "options": ["اليمين", "الأمام", "اليسار", "الخلف"], "correct": 2, "explanation": "左边 (zuǒbiān) = اليسار."},
            {"type": "fill_blank", "question": "请问，银行在___？ (عفواً، أين البنك؟)", "answer": "哪儿", "hint": "nǎr", "explanation": "哪儿 = أين (شكل محكي)."},
            {"type": "fill_blank", "question": "往前___，然后右转。 (اسلك الأمام ثم انعطف يميناً)", "answer": "走", "hint": "zǒu", "explanation": "走 (zǒu) = يمشي / يسلك."},
            {"type": "translation", "question": "ترجم: \"المكتبة قريبة من هنا.\"", "answer": "图书馆离这里很近。", "hint": "Túshūguǎn lí zhèlǐ hěn jìn.", "explanation": "离 (lí) = عن / من. 近 (jìn) = قريب."},
        ],
    },
    8: {
        "keySentences": [
            {"zh": "请问，地铁站在哪儿？", "pinyin": "Qǐngwèn, dìtiězhàn zài nǎr?", "ar": "عفواً، أين محطة المترو؟"},
            {"zh": "我坐公共汽车去学校。", "pinyin": "Wǒ zuò gōnggòng qìchē qù xuéxiào.", "ar": "أذهب للمدرسة بالحافلة."},
            {"zh": "火车站离这里远吗？", "pinyin": "Huǒchēzhàn lí zhèlǐ yuǎn ma?", "ar": "هل محطة القطار بعيدة من هنا؟"},
            {"zh": "我想去北京，怎么去？", "pinyin": "Wǒ xiǎng qù Běijīng, zěnme qù?", "ar": "أريد الذهاب لبكين، كيف أذهب؟"},
            {"zh": "坐飞机很快。", "pinyin": "Zuò fēijī hěn kuài.", "ar": "السفر بالطائرة سريع."},
            {"zh": "你经常坐出租车吗？", "pinyin": "Nǐ jīngcháng zuò chūzūchē ma?", "ar": "هل تستقل سيارة الأجرة غالباً؟"},
            {"zh": "从这里到学校大约十五分钟。", "pinyin": "Cóng zhèlǐ dào xuéxiào dàyuē shíwǔ fēnzhōng.", "ar": "من هنا إلى المدرسة حوالي خمس عشرة دقيقة."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"出租车\" يعني:", "options": ["حافلة", "قطار", "سيارة أجرة", "مترو"], "correct": 2, "explanation": "出租车 (chūzūchē) = سيارة أجرة / تاكسي."},
            {"type": "multiple_choice", "question": "كيف تقول \"طائرة\" بالصينية؟", "options": ["火车", "飞机", "船", "自行车"], "correct": 1, "explanation": "飞机 (fēijī) = طائرة."},
            {"type": "fill_blank", "question": "我坐公共___去学校。 (أذهب للمدرسة بالحافلة)", "answer": "汽车", "hint": "qìchē", "explanation": "公共汽车 = حافلة."},
            {"type": "fill_blank", "question": "火车___离这里远吗？ (هل محطة القطار بعيدة؟)", "answer": "站", "hint": "zhàn", "explanation": "站 (zhàn) = محطة."},
            {"type": "translation", "question": "ترجم: \"السفر بالطائرة سريع جداً.\"", "answer": "坐飞机很快。", "hint": "Zuò fēijī hěn kuài.", "explanation": "快 (kuài) = سريع."},
        ],
    },
    9: {
        "keySentences": [
            {"zh": "今天天气很好。", "pinyin": "Jīntiān tiānqì hěn hǎo.", "ar": "الطقس اليوم جيد."},
            {"zh": "明天会下雨吗？", "pinyin": "Míngtiān huì xià yǔ ma?", "ar": "هل ستمطر غداً؟"},
            {"zh": "今天很冷，多穿衣服。", "pinyin": "Jīntiān hěn lěng, duō chuān yīfu.", "ar": "اليوم بارد جداً، ارتدِ ملابس أكثر."},
            {"zh": "春天天气很舒服。", "pinyin": "Chūntiān tiānqì hěn shūfu.", "ar": "طقس الربيع مريح جداً."},
            {"zh": "你喜欢什么季节？", "pinyin": "Nǐ xǐhuān shénme jìjié?", "ar": "ما الفصل الذي تفضله؟"},
            {"zh": "阳光很好，我们去散步吧。", "pinyin": "Yángguāng hěn hǎo, wǒmen qù sànbù ba.", "ar": "أشعة الشمس جميلة، هيا نتمشَّ."},
            {"zh": "最近经常下雨。", "pinyin": "Zuìjìn jīngcháng xià yǔ.", "ar": "يمطر كثيراً في الآونة الأخيرة."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"天气\" تعني:", "options": ["طقس", "موسم", "فصل", "سنة"], "correct": 0, "explanation": "天气 (tiānqì) = طقس."},
            {"type": "multiple_choice", "question": "كيف تقول \"يتمطر\" بالصينية؟", "options": ["下雪", "下雨", "刮风", "晴天"], "correct": 1, "explanation": "下雨 (xià yǔ) = يتمطر."},
            {"type": "fill_blank", "question": "今天很___，多穿衣服。 (اليوم بارد، ارتدِ ملابس أكثر)", "answer": "冷", "hint": "lěng", "explanation": "冷 (lěng) = بارد."},
            {"type": "fill_blank", "question": "春天天气很___。 (طقس الربيع مريح)", "answer": "舒服", "hint": "shūfu", "explanation": "舒服 (shūfu) = مريح."},
            {"type": "translation", "question": "ترجم: \"هل ستمطر غداً؟\"", "answer": "明天会下雨吗？", "hint": "Míngtiān huì xià yǔ ma?", "explanation": "会 (huì) = سـ / سوف."},
        ],
    },
    10: {
        "keySentences": [
            {"zh": "我头疼。", "pinyin": "Wǒ tóu téng.", "ar": "رأسي يؤلمني."},
            {"zh": "你哪儿不舒服？", "pinyin": "Nǐ nǎr bù shūfu?", "ar": "أين تشعر بعدم الارتياح؟"},
            {"zh": "我感冒了。", "pinyin": "Wǒ gǎnmào le.", "ar": "لقد أصبت بالزكام."},
            {"zh": "你应该多喝水。", "pinyin": "Nǐ yīnggāi duō hē shuǐ.", "ar": "يجب أن تشرب كثيراً من الماء."},
            {"zh": "我每天锻炼身体。", "pinyin": "Wǒ měitiān duànliàn shēntǐ.", "ar": "أتدرب يومياً."},
            {"zh": "运动对身体很好。", "pinyin": "Yùndòng duì shēntǐ hěn hǎo.", "ar": "الرياضة مفيدة جداً للجسم."},
            {"zh": "别担心，你会好的。", "pinyin": "Bié dānxīn, nǐ huì hǎo de.", "ar": "لا تقلق، ستصبح بخير."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"感冒\" يعني:", "options": ["حمى", "زكام", "سعال", "صداع"], "correct": 1, "explanation": "感冒 (gǎnmào) = زكام / برد."},
            {"type": "multiple_choice", "question": "كيف تقول \"ألم\" بالصينية؟", "options": ["舒服", "疼", "好", "大"], "correct": 1, "explanation": "疼 (téng) = ألم / يؤلم."},
            {"type": "fill_blank", "question": "我___感冒了。 (لقد أصبت بالزكام)", "answer": "已经", "hint": "yǐjīng", "explanation": "已经 (yǐjīng) = بالفعل / مسبقاً."},
            {"type": "fill_blank", "question": "你应该多喝___。 (يجب أن تشرب كثيراً من الماء)", "answer": "水", "hint": "shuǐ", "explanation": "水 (shuǐ) = ماء."},
            {"type": "translation", "question": "ترجم: \"الرياضة مفيدة للجسم.\"", "answer": "运动对身体很好。", "hint": "Yùndòng duì shēntǐ hěn hǎo.", "explanation": "身体 = الجسم."},
        ],
    },
    11: {
        "keySentences": [
            {"zh": "我是学生，我学习中文。", "pinyin": "Wǒ shì xuéshēng, wǒ xuéxí Zhōngwén.", "ar": "أنا طالب، أدرس اللغة الصينية."},
            {"zh": "你做什么工作？", "pinyin": "Nǐ zuò shénme gōngzuò?", "ar": "ما هو عملك؟"},
            {"zh": "他是老师，在学校工作。", "pinyin": "Tā shì lǎoshī, zài xuéxiào gōngzuò.", "ar": "هو معلم، يعمل في المدرسة."},
            {"zh": "我的专业是经济。", "pinyin": "Wǒ de zhuānyè shì jīngjì.", "ar": "تخصصي هو الاقتصاد."},
            {"zh": "每天早上八点上班。", "pinyin": "Měitiān zǎoshàng bā diǎn shàngbān.", "ar": "أذهب للعمل كل يوم الساعة ثمانية صباحاً."},
            {"zh": "中文很难，但很有意思。", "pinyin": "Zhōngwén hěn nán, dàn hěn yǒuyìsi.", "ar": "الصينية صعبة لكنها ممتعة."},
            {"zh": "我想学好中文。", "pinyin": "Wǒ xiǎng xuéhǎo Zhōngwén.", "ar": "أريد أن أتقن الصينية."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"老师\" يعني:", "options": ["طالب", "طبيب", "معلم", "مهندس"], "correct": 2, "explanation": "老师 (lǎoshī) = معلم / أستاذ."},
            {"type": "multiple_choice", "question": "كيف تقول \"عمل\" بالصينية؟", "options": ["学习", "工作", "休息", "吃饭"], "correct": 1, "explanation": "工作 (gōngzuò) = عمل / وظيفة."},
            {"type": "fill_blank", "question": "我想___中文。 (أريد دراسة الصينية)", "answer": "学习", "hint": "xuéxí", "explanation": "学习 (xuéxí) = يدرس / يتعلّم."},
            {"type": "fill_blank", "question": "他每天八点___班。 (يذهب للعمل كل يوم الساعة ثمانية)", "answer": "上", "hint": "shàng", "explanation": "上班 (shàngbān) = يذهب للعمل."},
            {"type": "translation", "question": "ترجم: \"الصينية صعبة لكن ممتعة.\"", "answer": "中文很难，但很有意思。", "hint": "Zhōngwén hěn nán, dàn hěn yǒuyìsi.", "explanation": "但 (dàn) = لكن / ولكن."},
        ],
    },
    12: {
        "keySentences": [
            {"zh": "你喜欢做什么？", "pinyin": "Nǐ xǐhuān zuò shénme?", "ar": "ماذا تحب أن تفعل؟"},
            {"zh": "我喜欢听音乐。", "pinyin": "Wǒ xǐhuān tīng yīnyuè.", "ar": "أحب الاستماع للموسيقى."},
            {"zh": "我们一起去公园散步吧。", "pinyin": "Wǒmen yīqǐ qù gōngyuán sànbù ba.", "ar": "هيا نذهب معاً للتنزه في الحديقة."},
            {"zh": "他喜欢运动，经常锻炼。", "pinyin": "Tā xǐhuān yùndòng, jīngcháng duànliàn.", "ar": "هو يحب الرياضة ويتدرب كثيراً."},
            {"zh": "明天有一场比赛。", "pinyin": "Míngtiān yǒu yì chǎng bǐsài.", "ar": "غداً توجد مباراة."},
            {"zh": "你喜欢看书还是看电影？", "pinyin": "Nǐ xǐhuān kàn shū háishì kàn diànyǐng?", "ar": "هل تحب القراءة أم مشاهدة الأفلام؟"},
            {"zh": "我周末喜欢和朋友一起玩。", "pinyin": "Wǒ zhōumò xǐhuān hé péngyou yīqǐ wán.", "ar": "في عطلة نهاية الأسبوع أحب اللعب مع أصدقائي."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"音乐\" يعني:", "options": ["رياضة", "موسيقى", "فيلم", "كتاب"], "correct": 1, "explanation": "音乐 (yīnyuè) = موسيقى."},
            {"type": "multiple_choice", "question": "كيف تقول \"حديقة\" بالصينية؟", "options": ["学校", "商店", "公园", "医院"], "correct": 2, "explanation": "公园 (gōngyuán) = حديقة عامة."},
            {"type": "fill_blank", "question": "我喜欢___音乐。 (أحب الاستماع للموسيقى)", "answer": "听", "hint": "tīng", "explanation": "听 (tīng) = يستمع."},
            {"type": "fill_blank", "question": "明天有一场___。 (غداً توجد مباراة)", "answer": "比赛", "hint": "bǐsài", "explanation": "比赛 (bǐsài) = مسابقة / مباراة."},
            {"type": "translation", "question": "ترجم: \"هو يحب الرياضة.\"", "answer": "他喜欢运动。", "hint": "Tā xǐhuān yùndòng.", "explanation": "喜欢 (xǐhuān) = يحب / يفضل."},
        ],
    },
    13: {
        "keySentences": [
            {"zh": "我今天很高兴。", "pinyin": "Wǒ jīntiān hěn gāoxìng.", "ar": "أنا سعيد جداً اليوم."},
            {"zh": "别担心，没事。", "pinyin": "Bié dānxīn, méishì.", "ar": "لا تقلق، لا بأس."},
            {"zh": "他生气了。", "pinyin": "Tā shēngqì le.", "ar": "هو غاضب."},
            {"zh": "我感觉不舒服。", "pinyin": "Wǒ gǎnjué bù shūfu.", "ar": "أنا لا أشعر بارتياح."},
            {"zh": "别生气，我们一起想办法。", "pinyin": "Bié shēngqì, wǒmen yīqǐ xiǎng bànfǎ.", "ar": "لا تغضب، لنفكر في حل معاً."},
            {"zh": "你应该放心。", "pinyin": "Nǐ yīnggāi fàngxīn.", "ar": "يجب أن تطمئن."},
            {"zh": "我希望能见到你。", "pinyin": "Wǒ xīwàng néng jiàn dào nǐ.", "ar": "آمل أن أراك."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"高兴\" يعني:", "options": ["حزين", "سعيد", "غاضب", "خائف"], "correct": 1, "explanation": "高兴 (gāoxìng) = سعيد / مسرور."},
            {"type": "multiple_choice", "question": "\"生气\" يعني:", "options": ["سعيد", "قلق", "غاضب", "مرتاح"], "correct": 2, "explanation": "生气 (shēngqì) = غاضب."},
            {"type": "fill_blank", "question": "别___，没事。 (لا تقلق، لا بأس)", "answer": "担心", "hint": "dānxīn", "explanation": "担心 (dānxīn) = يقلق."},
            {"type": "fill_blank", "question": "我应该___。 (يجب أن أطمئن)", "answer": "放心", "hint": "fàngxīn", "explanation": "放心 (fàngxīn) = يطمئن / يرتاح بال."},
            {"type": "translation", "question": "ترجم: \"أنا سعيد جداً اليوم.\"", "answer": "我今天很高兴。", "hint": "Wǒ jīntiān hěn gāoxìng.", "explanation": "今天 (jīntiān) = اليوم."},
        ],
    },
    14: {
        "keySentences": [
            {"zh": "我每天早上七点起床。", "pinyin": "Wǒ měitiān zǎoshàng qī diǎn qǐchuáng.", "ar": "أستيقظ كل يوم الساعة سبعة صباحاً."},
            {"zh": "晚上我在家看书。", "pinyin": "Wǎnshàng wǒ zài jiā kàn shū.", "ar": "مساءً أقرأ كتاباً في البيت."},
            {"zh": "早饭我吃面包和牛奶。", "pinyin": "Zǎofàn wǒ chī miànbāo hé niúnǎi.", "ar": "في الإفطار آكل خبزاً وأشرب حليباً."},
            {"zh": "我家在学校的旁边。", "pinyin": "Wǒ jiā zài xuéxiào de pángbiān.", "ar": "منزلي بجوار المدرسة."},
            {"zh": "我的房间很干净。", "pinyin": "Wǒ de fángjiān hěn gānjìng.", "ar": "غرفتي نظيفة جداً."},
            {"zh": "你在家做什么？", "pinyin": "Nǐ zài jiā zuò shénme?", "ar": "ماذا تفعل في البيت؟"},
            {"zh": "我喜欢做饭。", "pinyin": "Wǒ xǐhuān zuò fàn.", "ar": "أحب الطبخ."},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"起床\" يعني:", "options": ["ينام", "يستيقظ", "يأكل", "يشرب"], "correct": 1, "explanation": "起床 (qǐchuáng) = يستيقظ / ينهض من النوم."},
            {"type": "multiple_choice", "question": "كيف تقول \"منزل/بيت\" بالصينية؟", "options": ["学校", "医院", "家", "商店"], "correct": 2, "explanation": "家 (jiā) = منزل / بيت."},
            {"type": "fill_blank", "question": "我每天早上七点___。 (أستيقظ كل يوم الساعة سبعة صباحاً)", "answer": "起床", "hint": "qǐchuáng", "explanation": "起床 = يستيقظ."},
            {"type": "fill_blank", "question": "晚上我在___看书。 (مساءً أقرأ كتاباً في البيت)", "answer": "家", "hint": "jiā", "explanation": "家 (jiā) = بيت."},
            {"type": "translation", "question": "ترجم: \"أحب الطبخ.\"", "answer": "我喜欢做饭。", "hint": "Wǒ xǐhuān zuò fàn.", "explanation": "做饭 (zuò fàn) = الطبخ / إعداد الطعام."},
        ],
    },
    15: {
        "keySentences": [
            {"zh": "对不起，我不知道。", "pinyin": "Duìbuqǐ, wǒ bù zhīdào.", "ar": "آسف، لا أعرف."},
            {"zh": "没关系。", "pinyin": "Méi guānxi.", "ar": "لا بأس / لا يهم."},
            {"zh": "你知道他在哪儿吗？", "pinyin": "Nǐ zhīdào tā zài nǎr ma?", "ar": "هل تعرف أين هو؟"},
            {"zh": "如果你努力学习，一定会成功。", "pinyin": "Rúguǒ nǐ nǔlì xuéxí, yídìng huì chénggōng.", "ar": "إذا اجتهدت في الدراسة، ستنجح بالتأكيد."},
            {"zh": "虽然很难，但是很有意思。", "pinyin": "Suīrán hěn nán, dànshì hěn yǒuyìsi.", "ar": "رغم أنها صعبة، لكنها ممتعة."},
            {"zh": "我们应该互相帮助。", "pinyin": "Wǒmen yīnggāi hùxiāng bāngzhù.", "ar": "يجب علينا مساعدة بعضنا البعض."},
            {"zh": "别担心，我明白你的意思。", "pinyin": "Bié dānxīn, wǒ míngbai nǐ de yìsi.", "ar": "لا تقلق، أفهم ما تقصده."},
            {"zh": "希望大家都能学好中文！", "pinyin": "Xīwàng dàjiā dōu néng xuéhǎo Zhōngwén!", "ar": "آمل أن يتمكن الجميع من إتقان الصينية!"},
        ],
        "exercises": [
            {"type": "multiple_choice", "question": "\"对不起\" تعني:", "options": ["شكراً", "آسف", "مع السلامة", "مرحباً"], "correct": 1, "explanation": "对不起 (duìbuqǐ) = آسف / معذرة."},
            {"type": "multiple_choice", "question": "\"虽然……但是……\" تعني:", "options": ["لأن…… لذلك……", "رغم أن…… لكن……", "لو…… إذا……", "أو…… و……"], "correct": 1, "explanation": "虽然……但是…… = رغم أن…… لكن…… (عطف وتضاد)."},
            {"type": "fill_blank", "question": "没关系，不___。 (لا بأس، لا تقلق)", "answer": "客气", "hint": "kèqi", "explanation": "不客气 = العفو / على الرحب."},
            {"type": "fill_blank", "question": "别___，我明白你的意思。 (لا تقلق، أفهم ما تقصده)", "answer": "担心", "hint": "dānxīn", "explanation": "担心 (dānxīn) = يقلق."},
            {"type": "translation", "question": "ترجم: \"رغم أنها صعبة، لكنها ممتعة.\"", "answer": "虽然很难，但是很有意思。", "hint": "Suīrán hěn nán, dànshì hěn yǒuyìsi.", "explanation": "虽然 (suīrán) = رغم / على الرغم."},
            {"type": "multiple_choice", "question": "\"努力\" يعني:", "options": ["كسول", "يجتهد", "سعيد", "غاضب"], "correct": 1, "explanation": "努力 (nǔlì) = يجتهد / يبذل جهداً."},
        ],
    },
}

# ============================================================
# 4. Read and transform the file
# ============================================================

with open('src/data/lessons.ts', 'r') as f:
    original = f.read()

# Build the new file
lines = original.split('\n')
new_lines = []

# Phase 1: Replace the interface
in_interface = False
interface_done = False
for line in lines:
    if 'export interface Lesson {' in line:
        in_interface = True
        new_lines.append(NEW_INTERFACE)
        # skip lines until we find closing brace
        continue
    if in_interface and not interface_done:
        if line.strip() == '}':
            in_interface = False
            interface_done = True
        continue
    new_lines.append(line)

content = '\n'.join(new_lines)

# Phase 2: Expand word IDs for short lessons
for lesson_id, new_ids in EXPANDED_WORD_IDS.items():
    ids_str = str(new_ids)
    # Find the pattern for this lesson
    # We need to match the wordIds array within the specific lesson
    pattern = rf'(lessonId: {lesson_id},\s+title: [^\n]+,\s+titleChinese: [^\n]+,\s+description: [^\n]+,\s+)wordIds: \[[^\]]+\]'
    
    def replace_word_ids(m):
        return m.group(1) + 'wordIds: ' + ids_str
    
    content = re.sub(pattern, replace_word_ids, content)

# Phase 3: Update lesson 15 word IDs
l15_ids_str = str(L15_NEW)
l15_pattern = rf'(lessonId: 15,\s+title: [^\n]+,\s+titleChinese: [^\n]+,\s+description: [^\n]+,\s+)wordIds: \[[^\]]+\]'

def replace_l15_word_ids(m):
    return m.group(1) + 'wordIds: ' + l15_ids_str

content = re.sub(l15_pattern, replace_l15_word_ids, content)

# Phase 4: Add keySentences and exercises to each lesson
for lesson_id in range(1, 16):
    lc = LESSON_CONTENT[lesson_id]
    key_sentences_str = json.dumps(lc['keySentences'], ensure_ascii=False, indent=4)
    exercises_str = json.dumps(lc['exercises'], ensure_ascii=False, indent=4)
    
    # Find the estimatedMinutes line for this lesson and add content after it
    pattern = rf'(lessonId: {lesson_id},[^\}}]+?estimatedMinutes: \d+),(\s+\}},?)'
    
    def add_content(m):
        base = m.group(1)
        ending = m.group(2)
        new_content = f'''{base},
    keySentences: {key_sentences_str},
    exercises: {exercises_str}{ending}'''
        return new_content
    
    content = re.sub(pattern, add_content, content, flags=re.DOTALL)

# Write the new file
with open('src/data/lessons.ts', 'w') as f:
    f.write(content)

print("SUCCESS: lessons.ts has been expanded!")
print(f"Lesson 15 new word count: {len(L15_NEW)}")
for lid, ids in EXPANDED_WORD_IDS.items():
    print(f"Lesson {lid} expanded to {len(ids)} words")
