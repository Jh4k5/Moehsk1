#!/usr/bin/env python3
"""
Generate expanded lessons.ts for HSK1 learning platform.
Each lesson gets 22-40 vocabularyIds, grammarIds, keySentences, conversations, exercises.
"""

import re
import json

# ─── Parse vocabulary.ts ───────────────────────────────────────────────
with open('/home/z/my-project/src/data/vocabulary.ts', 'r') as f:
    vocab_content = f.read()

# Split into entries
entries_raw = vocab_content.split('},\n{')

words = {}
for entry in entries_raw:
    m_id = re.search(r'id:(\d+)', entry)
    if not m_id:
        continue
    wid = int(m_id.group(1))
    m_zh = re.search(r'zh:"([^"]*)"', entry)
    m_py = re.search(r'pinyin:"([^"]*)"', entry)
    m_pos = re.search(r'pos:"([^"]*)"', entry)
    m_meaning = re.search(r'meaning:"([^"]*)"', entry)
    m_en = re.search(r'english:\s*[\'"]([^\'"]*)[\'"]', entry)
    m_lesson = re.search(r'lesson:\s*(\d+)', entry)
    
    # Extract sentences
    sents = []
    sent_pattern = r'\{zh:"([^"]*)",\s*pinyin:"([^"]*)",\s*ar:"([^"]*)"\}'
    for sm in re.finditer(sent_pattern, entry):
        sents.append({'zh': sm.group(1), 'pinyin': sm.group(2), 'ar': sm.group(3)})
    
    # Also extract exZh/exPinyin/exEn
    m_exzh = re.search(r'exZh:"([^"]*)"', entry)
    m_expy = re.search(r'exPinyin:"([^"]*)"', entry)
    m_exen = re.search(r'exEn:"([^"]*)"', entry)
    
    words[wid] = {
        'id': wid,
        'zh': m_zh.group(1) if m_zh else '',
        'pinyin': m_py.group(1) if m_py else '',
        'pos': m_pos.group(1) if m_pos else '',
        'meaning': m_meaning.group(1) if m_meaning else '',
        'english': m_en.group(1) if m_en else '',
        'lesson': int(m_lesson.group(1)) if m_lesson else None,
        'sentences': sents,
        'exZh': m_exzh.group(1) if m_exzh else '',
        'exPinyin': m_expy.group(1) if m_expy else '',
        'exEn': m_exen.group(1) if m_exen else '',
    }

print(f"Parsed {len(words)} vocabulary words")

# ─── Group words by lesson ──────────────────────────────────────────────
lesson_words = {}
for wid, w in words.items():
    if w['lesson']:
        lesson_words.setdefault(w['lesson'], []).append(wid)

for n in range(1, 16):
    ids = sorted(lesson_words.get(n, []))
    print(f"Lesson {n}: {len(ids)} words")

# ─── Topic keywords for supplementary word matching ─────────────────────
# Map lesson number -> topic keywords to find matching words
lesson_topics = {
    1: ['greeting', 'hello', 'name', 'teacher', 'student', 'friend', 'introduce', 'country', 'nationality', 'china', 'french', 'thailand', 'english', 'polite', 'excuse', 'thank', 'sorry', 'welcome'],
    2: ['number', 'count', 'one', 'two', 'three', 'ten', 'hundred', 'thousand', 'how many', 'much', 'few'],
    3: ['time', 'today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'hour', 'minute', 'week', 'month', 'year', 'date', 'day', 'monday', 'sunday'],
    4: ['family', 'father', 'mother', 'brother', 'sister', 'son', 'daughter', 'husband', 'wife', 'grandparent', 'friend', 'girlfriend', 'boyfriend', 'child'],
    5: ['food', 'eat', 'drink', 'rice', 'noodle', 'tea', 'water', 'coffee', 'fruit', 'meat', 'fish', 'vegetable', 'bread', 'chicken', 'restaurant', 'delicious', 'hungry'],
    6: ['shop', 'buy', 'sell', 'money', 'price', 'cheap', 'expensive', 'pay', 'store', 'market', 'clothes', 'bag'],
    7: ['place', 'where', 'here', 'there', 'school', 'hospital', 'bank', 'hotel', 'restaurant', 'home', 'room', 'door', 'street', 'city', 'beijing', 'shanghai'],
    8: ['transport', 'bus', 'taxi', 'car', 'train', 'plane', 'subway', 'airport', 'station', 'bike', 'walk', 'go', 'come', 'travel'],
    9: ['weather', 'hot', 'cold', 'rain', 'snow', 'wind', 'sunny', 'cloud', 'spring', 'summer', 'autumn', 'winter', 'season', 'temperature'],
    10: ['body', 'head', 'eye', 'ear', 'mouth', 'hand', 'foot', 'sick', 'doctor', 'hospital', 'medicine', 'health', 'headache', 'fever', 'cold'],
    11: ['study', 'work', 'job', 'company', 'office', 'school', 'class', 'homework', 'exam', 'read', 'write', 'speak', 'listen', 'learn', 'teach'],
    12: ['hobby', 'music', 'movie', 'sport', 'football', 'basketball', 'swim', 'dance', 'sing', 'play', 'game', 'book', 'photo', 'travel'],
    13: ['happy', 'sad', 'angry', 'tired', 'busy', 'bored', 'miss', 'want', 'like', 'love', 'hate', 'feel', 'mood', 'emotion'],
    14: ['home', 'house', 'room', 'bed', 'table', 'chair', 'kitchen', 'bathroom', 'toilet', 'clean', 'wash', 'cook', 'sleep', 'wake', 'shower', 'daily'],
    15: ['review', 'all', 'comprehensive', 'general', 'everything', 'also', 'still', 'very', 'really', 'already'],
}

# ─── Helper: find supplementary words for a lesson ──────────────────────
def find_supplementary_words(lesson_num, current_ids, needed, min_lesson=1, max_lesson=15):
    """Find words from other lessons that match the topic."""
    topic_keywords = lesson_topics.get(lesson_num, [])
    candidates = []
    for wid, w in words.items():
        if wid in current_ids:
            continue
        if w['lesson'] == lesson_num:
            continue
        if w['lesson'] is None:
            continue
        # Score based on keyword match
        score = 0
        zh_lower = w['zh'].lower()
        en_lower = w['english'].lower()
        meaning_lower = w['meaning'].lower()
        for kw in topic_keywords:
            if kw in en_lower or kw in zh_lower:
                score += 2
        if score > 0:
            candidates.append((wid, score))
    
    # Sort by score descending
    candidates.sort(key=lambda x: -x[1])
    return [c[0] for c in candidates[:needed]]

# ─── Build vocabularyIds for each lesson ────────────────────────────────
lesson_vocab_ids = {}
for n in range(1, 16):
    base_ids = sorted(lesson_words.get(n, []))
    count = len(base_ids)
    
    if count < 22:
        needed = min(22, 40) - count
        # Try to find topic-matching words from lesson 15 (catch-all)
        extra = find_supplementary_words(n, set(base_ids), needed)
        # If still not enough, just add from lesson 15
        if len(extra) < needed:
            lesson15_ids = [wid for wid in lesson_words.get(15, []) if wid not in base_ids and wid not in extra]
            extra.extend(lesson15_ids[:needed - len(extra)])
        base_ids = sorted(set(base_ids + extra))
    
    # Cap at 40
    if len(base_ids) > 40:
        base_ids = sorted(base_ids[:40])
    
    lesson_vocab_ids[n] = base_ids
    print(f"Lesson {n}: final {len(base_ids)} vocab IDs")

# ─── Lesson metadata ───────────────────────────────────────────────────
lesson_meta = {
    1: {'title': 'التحيات والتعريف بالنفس', 'titleZh': '问候与介绍', 'level': 'beginner', 'desc': 'تعلم التحيات الأساسية وكيفية التعريف بالنفس'},
    2: {'title': 'الأرقام والأعداد', 'titleZh': '数字与数量', 'level': 'beginner', 'desc': 'تعلم الأرقام من صفر إلى ألف والعدادات'},
    3: {'title': 'الوقت والتاريخ', 'titleZh': '时间与日期', 'level': 'beginner', 'desc': 'تعلم التعبير عن الوقت والأيام والتواريخ'},
    4: {'title': 'العائلة والعلاقات', 'titleZh': '家庭与关系', 'level': 'beginner', 'desc': 'تعلم أفراد العائلة والعلاقات الشخصية'},
    5: {'title': 'الطعام والشراب', 'titleZh': '饮食', 'level': 'elementary', 'desc': 'تعلم أسماء الأطعمة والمشروبات الشائعة'},
    6: {'title': 'التسوق والمال', 'titleZh': '购物与金钱', 'level': 'elementary', 'desc': 'تعلم التسوق والتفاوض على الأسعار'},
    7: {'title': 'الأماكن والاتجاهات', 'titleZh': '地点与方向', 'level': 'elementary', 'desc': 'تعلم التعبير عن الأماكن والاتجاهات'},
    8: {'title': 'المواصلات والسفر', 'titleZh': '交通与旅行', 'level': 'elementary', 'desc': 'تعلم وسائل المواصلات والسفر'},
    9: {'title': 'الطقس والفصول', 'titleZh': '天气与季节', 'level': 'intermediate', 'desc': 'تعلم الحديث عن الطقس والفصول'},
    10: {'title': 'الجسم والصحة', 'titleZh': '身体与健康', 'level': 'intermediate', 'desc': 'تعلم أعضاء الجسم والصحة'},
    11: {'title': 'الدراسة والعمل', 'titleZh': '学习与工作', 'level': 'intermediate', 'desc': 'تعلم مفردات الدراسة والعمل'},
    12: {'title': 'الترفيه والهوايات', 'titleZh': '娱乐与爱好', 'level': 'intermediate', 'desc': 'تعلم الحديث عن الهوايات والترفيه'},
    13: {'title': 'المشاعر والحالة', 'titleZh': '情感与状态', 'level': 'intermediate', 'desc': 'تعلم التعبير عن المشاعر والحالات'},
    14: {'title': 'المنزل والحياة اليومية', 'titleZh': '家庭与日常生活', 'level': 'intermediate', 'desc': 'تعلم مفردات المنزل والروتين اليومي'},
    15: {'title': 'المراجعة والتكامل', 'titleZh': '复习与综合', 'level': 'advanced', 'desc': 'مراجعة شاملة لجميع الدروس السابقة'},
}

# Grammar IDs per lesson
lesson_grammar = {
    1: [1, 5, 11, 7],      # SVO, Question Particle, Personal Pronouns, Question Words
    2: [2, 3, 15],          # 是, 有, 也
    3: [4, 8, 14],          # Negation, Adjective+很, Modal Verbs
    4: [6, 9, 12],          # A不A Questions, Demonstratives, 在 for Continuous
    5: [10, 13, 16],        # Measure Words, 在 for Location, 都
    6: [17, 18, 19],        # Time Expressions, Past Tense 了, Quantity Questions
    7: [20, 21, 22],        # Conjunction 和, Comparison 比, Suggestion 吧
    8: [23, 24, 25],        # 太...了, Four Tones, Tone Change of 不
    9: [1, 8, 14],          # SVO, Adjective+很, Modal Verbs
    10: [2, 10, 16],        # 是, Measure Words, 都
    11: [3, 11, 13],        # 有, Personal Pronouns, 在 for Location
    12: [5, 15, 22],        # Question Particle, 也, Suggestion 吧
    13: [7, 9, 19],         # Question Words, Demonstratives, Quantity Questions
    14: [4, 18, 20],        # Negation, Past Tense 了, Conjunction 和
    15: [1, 2, 3, 4, 5, 6], # All basic grammar review
}

# ─── Key Sentences for each lesson ──────────────────────────────────────
# Each sentence: { zh, pinyin, arabic }
lesson_sentences = {
    1: [
        {'zh': '你好，请问你叫什么名字？', 'pinyin': 'Nǐ hǎo, qǐngwèn nǐ jiào shénme míngzi?', 'arabic': 'مرحباً، ما اسمك من فضلك؟'},
        {'zh': '我叫大卫，我是学生。', 'pinyin': 'Wǒ jiào Dàwèi, wǒ shì xuésheng.', 'arabic': 'اسمي ديفيد، أنا طالب.'},
        {'zh': '她是我的老师，她很好。', 'pinyin': 'Tā shì wǒ de lǎoshī, tā hěn hǎo.', 'arabic': 'هي معلمتي، وهي طيبة جداً.'},
        {'zh': '你们是哪国人？', 'pinyin': 'Nǐmen shì nǎ guó rén?', 'arabic': 'من أي بلد أنتم؟'},
        {'zh': '认识你很高兴！', 'pinyin': 'Rènshi nǐ hěn gāoxìng!', 'arabic': 'سعيد بمعرفتك!'},
        {'zh': '谢谢你的帮助！——不客气。', 'pinyin': 'Xièxie nǐ de bāngzhù! — Bú kèqi.', 'arabic': 'شكراً على مساعدتك! — العفو.'},
        {'zh': '大家好！我们都是中国人。', 'pinyin': 'Dàjiā hǎo! Wǒmen dōu shì Zhōngguó rén.', 'arabic': 'مرحباً بالجميع! نحن جميعاً صينيون.'},
        {'zh': '请问，他是谁？', 'pinyin': 'Qǐngwèn, tā shì shéi?', 'arabic': 'عفواً، من هو؟'},
    ],
    2: [
        {'zh': '你有几本书？', 'pinyin': 'Nǐ yǒu jǐ běn shū?', 'arabic': 'كم كتاباً لديك؟'},
        {'zh': '我要三杯茶。', 'pinyin': 'Wǒ yào sān bēi chá.', 'arabic': 'أريد ثلاثة أكواب شاي.'},
        {'zh': '这个多少钱？', 'pinyin': 'Zhège duōshao qián?', 'arabic': 'كم ثمن هذا؟'},
        {'zh': '我有一百块钱。', 'pinyin': 'Wǒ yǒu yì bǎi kuài qián.', 'arabic': 'لدي مئة يوان.'},
        {'zh': '他今年二十岁。', 'pinyin': 'Tā jīnnián èrshí suì.', 'arabic': 'هو يبلغ من العمر عشرين عاماً هذا العام.'},
        {'zh': '教室里有十五个学生。', 'pinyin': 'Jiàoshì lǐ yǒu shíwǔ gè xuésheng.', 'arabic': 'في الفصل خمسة عشر طالباً.'},
    ],
    3: [
        {'zh': '今天几号？', 'pinyin': 'Jīntiān jǐ hào?', 'arabic': 'ما تاريخ اليوم؟'},
        {'zh': '现在是八点半。', 'pinyin': 'Xiànzài shì bā diǎn bàn.', 'arabic': 'الساعة الآن الثامنة والنصف.'},
        {'zh': '你每天几点起床？', 'pinyin': 'Nǐ měitiān jǐ diǎn qǐchuáng?', 'arabic': 'في أي ساعة تستيقظ كل يوم؟'},
        {'zh': '明天是星期一。', 'pinyin': 'Míngtiān shì xīngqīyī.', 'arabic': 'غداً هو يوم الإثنين.'},
        {'zh': '我上午有课，下午休息。', 'pinyin': 'Wǒ shàngwǔ yǒu kè, xiàwǔ xiūxi.', 'arabic': 'لدي حصة صباحاً، وأرتاح بعد الظهر.'},
        {'zh': '你的生日是哪天？', 'pinyin': 'Nǐ de shēngrì shì nǎ tiān?', 'arabic': 'متى عيد ميلادك؟'},
    ],
    4: [
        {'zh': '你家有几口人？', 'pinyin': 'Nǐ jiā yǒu jǐ kǒu rén?', 'arabic': 'كم عدد أفراد عائلتك؟'},
        {'zh': '这是我姐姐，她在北京工作。', 'pinyin': 'Zhè shì wǒ jiějie, tā zài Běijīng gōngzuò.', 'arabic': 'هذه أختي الكبرى، هي تعمل في بكين.'},
        {'zh': '他不是我男朋友，是我的同学。', 'pinyin': 'Tā bú shì wǒ nánpéngyou, shì wǒ de tóngxué.', 'arabic': 'هو ليس حبيبي، بل زميلي.'},
        {'zh': '我爸爸是医生，妈妈是老师。', 'pinyin': 'Wǒ bàba shì yīshēng, māma shì lǎoshī.', 'arabic': 'أبي طبيب وأمي معلمة.'},
        {'zh': '他们有一个很好的家庭。', 'pinyin': 'Tāmen yǒu yí ge hěn hǎo de jiātíng.', 'arabic': 'لديهم عائلة طيبة جداً.'},
        {'zh': '你喜欢你的弟弟吗？', 'pinyin': 'Nǐ xǐhuān nǐ de dìdi ma?', 'arabic': 'هل تحب أخاك الأصغر؟'},
    ],
    5: [
        {'zh': '你想吃什么？', 'pinyin': 'Nǐ xiǎng chī shénme?', 'arabic': 'ماذا تريد أن تأكل؟'},
        {'zh': '我要一杯咖啡和一碗米饭。', 'pinyin': 'Wǒ yào yì bēi kāfēi hé yì wǎn mǐfàn.', 'arabic': 'أريد كوب قهوة وطبق أرز.'},
        {'zh': '这个菜很好吃，也不贵。', 'pinyin': 'Zhège cài hěn hǎochī, yě bú guì.', 'arabic': 'هذا الطبق لذيذ وغير غالي.'},
        {'zh': '你喝不喝茶？', 'pinyin': 'Nǐ hē bù hē chá?', 'arabic': 'هل تشرب الشاي أم لا؟'},
        {'zh': '中国菜和泰国菜都很好吃。', 'pinyin': 'Zhōngguó cài hé Tàiguó cài dōu hěn hǎochī.', 'arabic': 'المطبخ الصيني والتايلاندي كلاهما لذيذ.'},
        {'zh': '他喜欢吃水果，不喜欢吃肉。', 'pinyin': 'Tā xǐhuān chī shuǐguǒ, bù xǐhuān chī ròu.', 'arabic': 'هو يحب أكل الفاكهة ولا يحب اللحم.'},
    ],
    6: [
        {'zh': '这件衣服多少钱？', 'pinyin': 'Zhè jiàn yīfu duōshao qián?', 'arabic': 'كم سعر هذه الملابس؟'},
        {'zh': '太贵了，可以便宜一点吗？', 'pinyin': 'Tài guì le, kěyǐ piányi yìdiǎn ma?', 'arabic': 'غالية جداً، هل يمكن أن تكون أرخص قليلاً؟'},
        {'zh': '我在这个商店买了一些东西。', 'pinyin': 'Wǒ zài zhège shāngdiàn mǎi le yìxiē dōngxi.', 'arabic': 'اشتريت بعض الأشياء من هذا المتجر.'},
        {'zh': '你有零钱吗？', 'pinyin': 'Nǐ yǒu língqián ma?', 'arabic': 'هل لديك نقود صغيرة؟'},
        {'zh': '这个和那个哪个好？', 'pinyin': 'Zhège hé nàge nǎge hǎo?', 'arabic': 'أيهما أفضل، هذا أم ذاك؟'},
        {'zh': '我没带钱，下次再来。', 'pinyin': 'Wǒ méi dài qián, xià cì zài lái.', 'arabic': 'لم أحضر نقوداً، سآتي المرة القادمة.'},
    ],
    7: [
        {'zh': '请问，地铁站在哪儿？', 'pinyin': 'Qǐngwèn, dìtiězhàn zài nǎr?', 'arabic': 'عفواً، أين محطة المترو؟'},
        {'zh': '邮局就在学校的旁边。', 'pinyin': 'Yóujú jiù zài xuéxiào de pángbiān.', 'arabic': 'مكتب البريد بجوار المدرسة.'},
        {'zh': '这里离北京很远。', 'pinyin': 'Zhèlǐ lí Běijīng hěn yuǎn.', 'arabic': 'هنا بعيد جداً عن بكين.'},
        {'zh': '医院在银行和学校之间。', 'pinyin': 'Yīyuàn zài yínháng hé xuéxiào zhījiān.', 'arabic': 'المستشفى بين البنك والمدرسة.'},
        {'zh': '往前走，然后右转。', 'pinyin': 'Wǎng qián zǒu, ránhòu yòu zhuǎn.', 'arabic': 'امشِ إلى الأمام ثم انعطف يميناً.'},
        {'zh': '我家在那边，离这儿不远。', 'pinyin': 'Wǒ jiā zài nàbiān, lí zhèr bù yuǎn.', 'arabic': 'منزلي هناك، ليس بعيداً من هنا.'},
    ],
    8: [
        {'zh': '你坐什么车来学校？', 'pinyin': 'Nǐ zuò shénme chē lái xuéxiào?', 'arabic': 'بماذا تأتي إلى المدرسة؟'},
        {'zh': '我坐公共汽车去上班。', 'pinyin': 'Wǒ zuò gōnggòng qìchē qù shàngbān.', 'arabic': 'أذهب إلى العمل بالحافلة.'},
        {'zh': '从这儿到机场多远？', 'pinyin': 'Cóng zhèr dào jīchǎng duō yuǎn?', 'arabic': 'كم المسافة من هنا إلى المطار؟'},
        {'zh': '出租车在门口等我们。', 'pinyin': 'Chūzūchē zài ménkǒu děng wǒmen.', 'arabic': 'السيارة الأجرة تنتظرنا عند الباب.'},
        {'zh': '我想买一张去上海的机票。', 'pinyin': 'Wǒ xiǎng mǎi yì zhāng qù Shànghǎi de jīpiào.', 'arabic': 'أريد شراء تذكرة طيران إلى شنغهاي.'},
        {'zh': '明天下午三点出发。', 'pinyin': 'Míngtiān xiàwǔ sān diǎn chūfā.', 'arabic': 'سننطلق غداً الساعة الثالثة بعد الظهر.'},
    ],
    9: [
        {'zh': '今天天气怎么样？', 'pinyin': 'Jīntiān tiānqì zěnmeyàng?', 'arabic': 'كيف الطقس اليوم؟'},
        {'zh': '今天很热，不想出门。', 'pinyin': 'Jīntiān hěn rè, bù xiǎng chūmén.', 'arabic': 'الطقس حار جداً اليوم، لا أريد الخروج.'},
        {'zh': '昨天下午下雨了。', 'pinyin': 'Zuótiān xiàwǔ xià yǔ le.', 'arabic': 'أمطرت بعد الظهر أمس.'},
        {'zh': '北京的冬天很冷。', 'pinyin': 'Běijīng de dōngtiān hěn lěng.', 'arabic': 'شتاء بكين بارد جداً.'},
        {'zh': '你最喜欢哪个季节？', 'pinyin': 'Nǐ zuì xǐhuān nǎge jìjié?', 'arabic': 'ما هو الموسم المفضل لديك؟'},
        {'zh': '春天的时候花都开了。', 'pinyin': 'Chūntiān de shíhou huā dōu kāi le.', 'arabic': 'في الربيع تتفتح كل الأزهار.'},
    ],
    10: [
        {'zh': '你哪里不舒服？', 'pinyin': 'Nǐ nǎlǐ bù shūfú?', 'arabic': 'أين تشعر بعدم الراحة؟'},
        {'zh': '我头疼，想去医院。', 'pinyin': 'Wǒ tóu téng, xiǎng qù yīyuàn.', 'arabic': 'عندي صداع، أريد الذهاب للمستشفى.'},
        {'zh': '医生让我多喝水，多休息。', 'pinyin': 'Yīshēng ràng wǒ duō hē shuǐ, duō xiūxi.', 'arabic': 'الأمرة طلبت مني أن أشرب كثيراً من الماء وأرتاح.'},
        {'zh': '他今天发烧了，没有来上课。', 'pinyin': 'Tā jīntiān fāshāo le, méiyǒu lái shàngkè.', 'arabic': 'هو محموم اليوم، لم يحضر الدرس.'},
        {'zh': '你吃药了吗？', 'pinyin': 'Nǐ chī yào le ma?', 'arabic': 'هل تناولت الدواء؟'},
        {'zh': '她眼睛很大，头发很长。', 'pinyin': 'Tā yǎnjing hěn dà, tóufa hěn cháng.', 'arabic': 'عيناها كبيرتان وشعرها طويل.'},
    ],
    11: [
        {'zh': '你在哪里工作？', 'pinyin': 'Nǐ zài nǎlǐ gōngzuò?', 'arabic': 'أين تعمل؟'},
        {'zh': '我是老师，在学校教书。', 'pinyin': 'Wǒ shì lǎoshī, zài xuéxiào jiāoshū.', 'arabic': 'أنا معلم، أدرّس في المدرسة.'},
        {'zh': '你学什么专业？', 'pinyin': 'Nǐ xué shénme zhuānyè?', 'arabic': 'ما هو تخصصك؟'},
        {'zh': '我每天学习中文两个小时。', 'pinyin': 'Wǒ měitiān xuéxí Zhōngwén liǎng gè xiǎoshí.', 'arabic': 'أدرس اللغة الصينية ساعتين كل يوم.'},
        {'zh': '明天有考试，我还在复习。', 'pinyin': 'Míngtiān yǒu kǎoshì, wǒ hái zài fùxí.', 'arabic': 'غداً لدينا اختبار، ما زلت أراجع.'},
        {'zh': '她工作很努力，是公司的经理。', 'pinyin': 'Tā gōngzuò hěn nǔlì, shì gōngsī de jīnglǐ.', 'arabic': 'هي تعمل بجد، وهي مديرة الشركة.'},
    ],
    12: [
        {'zh': '你有什么爱好？', 'pinyin': 'Nǐ yǒu shénme àihào?', 'arabic': 'ما هي هواياتك؟'},
        {'zh': '我喜欢听音乐和看电影。', 'pinyin': 'Wǒ xǐhuān tīng yīnyuè hé kàn diànyǐng.', 'arabic': 'أحب الاستماع إلى الموسيقى ومشاهدة الأفلام.'},
        {'zh': '周末我们一起去踢足球吧。', 'pinyin': 'Zhōumò wǒmen yīqǐ qù tī zúqiú ba.', 'arabic': 'لنذهب معاً لنلعب كرة القدم في نهاية الأسبوع.'},
        {'zh': '你会游泳吗？', 'pinyin': 'Nǐ huì yóuyǒng ma?', 'arabic': 'هل تستطيع السباحة؟'},
        {'zh': '他正在看书，很安静。', 'pinyin': 'Tā zhèngzài kàn shū, hěn ānjìng.', 'arabic': 'هو يقرأ كتاباً، هادئ جداً.'},
        {'zh': '我周末常常和朋友一起唱歌。', 'pinyin': 'Wǒ zhōumò chángcháng hé péngyou yīqǐ chànggē.', 'arabic': 'في نهاية الأسبوع غالباً أغني مع أصدقائي.'},
    ],
    13: [
        {'zh': '你今天心情怎么样？', 'pinyin': 'Nǐ jīntiān xīnqíng zěnmeyàng?', 'arabic': 'كيف حالتك المزاجية اليوم؟'},
        {'zh': '我很高兴，因为我考试及格了。', 'pinyin': 'Wǒ hěn gāoxìng, yīnwèi wǒ kǎoshì jígé le.', 'arabic': 'أنا سعيد لأنني نجحت في الاختبار.'},
        {'zh': '他看起来很累。', 'pinyin': 'Tā kàn qǐlái hěn lèi.', 'arabic': 'يبدو متعباً جداً.'},
        {'zh': '别担心，没事的。', 'pinyin': 'Bié dānxīn, méishì de.', 'arabic': 'لا تقلق، كل شيء على ما يرام.'},
        {'zh': '我很想念我的家人。', 'pinyin': 'Wǒ hěn xiǎngniàn wǒ de jiārén.', 'arabic': 'أنا أشتاق إلى عائلتي كثيراً.'},
        {'zh': '你忙不忙？我们一起吃饭吧。', 'pinyin': 'Nǐ máng bù máng? Wǒmen yīqǐ chī fàn ba.', 'arabic': 'هل أنت مشغول؟ لنأكل معاً.'},
    ],
    14: [
        {'zh': '你住在哪儿？', 'pinyin': 'Nǐ zhù zài nǎr?', 'arabic': 'أين تسكن؟'},
        {'zh': '我家有三间卧室和一个厨房。', 'pinyin': 'Wǒ jiā yǒu sān jiān wòshì hé yí ge chúfáng.', 'arabic': 'منزلي به ثلاث غرف نوم ومطبخ.'},
        {'zh': '我每天早上七点起床。', 'pinyin': 'Wǒ měitiān zǎoshang qī diǎn qǐchuáng.', 'arabic': 'أستيقظ كل صباح الساعة السابعة.'},
        {'zh': '请把房间打扫一下。', 'pinyin': 'Qǐng bǎ fángjiān dǎsǎo yíxià.', 'arabic': 'يرجى تنظيف الغرفة.'},
        {'zh': '晚饭你想吃什么？我来做。', 'pinyin': 'Wǎnfàn nǐ xiǎng chī shénme? Wǒ lái zuò.', 'arabic': 'ماذا تريد أن تأكل على العشاء؟ سأطبخ.'},
        {'zh': '他每天晚上十一点睡觉。', 'pinyin': 'Tā měitiān wǎnshang shíyī diǎn shuìjiào.', 'arabic': 'ينام كل ليلة الساعة الحادية عشرة.'},
    ],
    15: [
        {'zh': '对不起，我迟到了。', 'pinyin': 'Duìbuqǐ, wǒ chídào le.', 'arabic': 'آسف، لقد تأخرت.'},
        {'zh': '没关系，请坐。', 'pinyin': 'Méi guānxi, qǐng zuò.', 'arabic': 'لا بأس، تفضل بالجلوس.'},
        {'zh': '还想要什么吗？', 'pinyin': 'Hái xiǎng yào shénme ma?', 'arabic': 'هل تريد شيئاً آخر؟'},
        {'zh': '他还在学习吗？', 'pinyin': 'Tā hái zài xuéxí ma?', 'arabic': 'هل لا يزال يدرس؟'},
        {'zh': '谁知道答案？请举手。', 'pinyin': 'Shéi zhīdào dá\'àn? Qǐng jǔshǒu.', 'arabic': 'من يعرف الجواب؟ يرجى رفع اليد.'},
        {'zh': '我们学了很多东西，也交了很多朋友。', 'pinyin': 'Wǒmen xué le hěn duō dōngxi, yě jiāo le hěn duō péngyou.', 'arabic': 'تعلمنا أشياء كثيرة وتعرفنا على أصدقاء كثر.'},
    ],
}

# ─── Conversations for each lesson ──────────────────────────────────────
lesson_conversations = {
    1: [
        {
            'id': 'L1C1',
            'title': 'التعارف في الفصل',
            'scene': 'في الفصل الدراسي',
            'turns': [
                {'speaker': 'A', 'name': '大卫', 'zh': '你好！我叫大卫，请问你叫什么名字？', 'pinyin': 'Nǐ hǎo! Wǒ jiào Dàwèi, qǐngwèn nǐ jiào shénme míngzi?', 'arabic': 'مرحباً! اسمي ديفيد، ما اسمك من فضلك؟'},
                {'speaker': 'B', 'name': '王芳', 'zh': '你好，我叫王芳。很高兴认识你。', 'pinyin': 'Nǐ hǎo, wǒ jiào Wáng Fāng. Hěn gāoxìng rènshi nǐ.', 'arabic': 'مرحباً، اسمي وانغ فانغ. سعيدة بمعرفتك.'},
                {'speaker': 'A', 'name': '大卫', 'zh': '你是中国人吗？', 'pinyin': 'Nǐ shì Zhōngguó rén ma?', 'arabic': 'هل أنت صينية؟'},
                {'speaker': 'B', 'name': '王芳', 'zh': '对，我是中国人。你是哪国人？', 'pinyin': 'Duì, wǒ shì Zhōngguó rén. Nǐ shì nǎ guó rén?', 'arabic': 'نعم، أنا صينية. من أي بلد أنت؟'},
                {'speaker': 'A', 'name': '大卫', 'zh': '我是法国人。我也学习中文。', 'pinyin': 'Wǒ shì Fǎguó rén. Wǒ yě xuéxí Zhōngwén.', 'arabic': 'أنا فرنسي. أنا أيضاً أدرس الصينية.'},
                {'speaker': 'B', 'name': '王芳', 'zh': '太好了！再见！', 'pinyin': 'Tài hǎo le! Zàijiàn!', 'arabic': 'رائع جداً! إلى اللقاء!'},
            ]
        },
        {
            'id': 'L1C2',
            'title': 'تحية الأستاذ',
            'scene': 'في المدرسة',
            'turns': [
                {'speaker': 'A', 'name': '学生们', 'zh': '老师好！', 'pinyin': 'Lǎoshī hǎo!', 'arabic': 'مرحباً أستاذ!'},
                {'speaker': 'B', 'name': '王老师', 'zh': '同学们好！大家好吗？', 'pinyin': 'Tóngxuémen hǎo! Dàjiā hǎo ma?', 'arabic': 'مرحباً أيها الطلاب! كيف حال الجميع؟'},
                {'speaker': 'A', 'name': '学生们', 'zh': '我们很好，谢谢老师！', 'pinyin': 'Wǒmen hěn hǎo, xièxie lǎoshī!', 'arabic': 'نحن بخير، شكراً أستاذ!'},
                {'speaker': 'B', 'name': '王老师', 'zh': '你们都是好学生。我们开始上课吧。', 'pinyin': 'Nǐmen dōu shì hǎo xuésheng. Wǒmen kāishǐ shàngkè ba.', 'arabic': 'أنتم جميعاً طلاب ممتازون. لنبدأ الدرس.'},
            ]
        },
    ],
    2: [
        {
            'id': 'L2C1',
            'title': 'في المطعم',
            'scene': 'في مطعم صيني',
            'turns': [
                {'speaker': 'A', 'name': 'زائر', 'zh': '服务员，请给我一份菜单。', 'pinyin': 'Fúwùyuán, qǐng gěi wǒ yí fèn càidān.', 'arabic': 'النادل، من فضلك أعطني قائمة الطعام.'},
                {'speaker': 'B', 'name': 'نادل', 'zh': '好的，这是菜单。你想吃什么？', 'pinyin': 'Hǎo de, zhè shì càidān. Nǐ xiǎng chī shénme?', 'arabic': 'حسناً، هذه القائمة. ماذا تريد أن تأكل؟'},
                {'speaker': 'A', 'name': 'زائر', 'zh': '我要两碗米饭和一盘鱼。', 'pinyin': 'Wǒ yào liǎng wǎn mǐfàn hé yì pán yú.', 'arabic': 'أريد طبقي أرز وصحن سمك.'},
                {'speaker': 'B', 'name': 'نادل', 'zh': '好的。还要别的吗？', 'pinyin': 'Hǎo de. Hái yào biéde ma?', 'arabic': 'حسناً. هل تريد شيئاً آخر؟'},
                {'speaker': 'A', 'name': 'زائر', 'zh': '再要一杯茶。多少钱？', 'pinyin': 'Zài yào yì bēi chá. Duōshao qián?', 'arabic': 'وكوب شاي أيضاً. كم الثمن؟'},
            ]
        },
        {
            'id': 'L2C2',
            'title': 'الأسئلة عن الأرقام',
            'scene': 'في الفصل',
            'turns': [
                {'speaker': 'A', 'name': 'أستاذ', 'zh': '教室里有几个人？', 'pinyin': 'Jiàoshì lǐ yǒu jǐ gè rén?', 'arabic': 'كم شخصاً في الفصل؟'},
                {'speaker': 'B', 'name': 'طالب', 'zh': '有十二个人。', 'pinyin': 'Yǒu shíèr gè rén.', 'arabic': 'يوجد اثنا عشر شخصاً.'},
                {'speaker': 'A', 'name': 'أستاذ', 'zh': '你有几本书？', 'pinyin': 'Nǐ yǒu jǐ běn shū?', 'arabic': 'كم كتاباً لديك؟'},
                {'speaker': 'B', 'name': 'طالب', 'zh': '我有三本书。', 'pinyin': 'Wǒ yǒu sān běn shū.', 'arabic': 'لدي ثلاثة كتب.'},
            ]
        },
    ],
    3: [
        {
            'id': 'L3C1',
            'title': 'مواعيد الدراسة',
            'scene': 'في الفصل',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '今天星期几？', 'pinyin': 'Jīntiān xīngqī jǐ?', 'arabic': 'ما هو يوم اليوم؟'},
                {'speaker': 'B', 'name': '大卫', 'zh': '今天是星期三。', 'pinyin': 'Jīntiān shì xīngqīsān.', 'arabic': 'اليوم هو الأربعاء.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '现在几点了？', 'pinyin': 'Xiànzài jǐ diǎn le?', 'arabic': 'كم الساعة الآن؟'},
                {'speaker': 'B', 'name': '大卫', 'zh': '九点十五分。我们还有课吗？', 'pinyin': 'Jiǔ diǎn shíwǔ fēn. Wǒmen hái yǒu kè ma?', 'arabic': 'التاسعة والربع. هل لا يزال لدينا درس؟'},
                {'speaker': 'A', 'name': '王芳', 'zh': '有，下午两点上课。', 'pinyin': 'Yǒu, xiàwǔ liǎng diǎn shàngkè.', 'arabic': 'نعم، الدرس الساعة الثانية بعد الظهر.'},
            ]
        },
        {
            'id': 'L3C2',
            'title': 'دعوة للقاء',
            'scene': 'عبر الهاتف',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '喂，大卫吗？你明天有空吗？', 'pinyin': 'Wèi, Dàwèi ma? Nǐ míngtiān yǒu kòng ma?', 'arabic': 'ألو، ديفيد؟ هل أنت متفرغ غداً؟'},
                {'speaker': 'B', 'name': '大卫', 'zh': '明天上午没事，下午要去上课。', 'pinyin': 'Míngtiān shàngwǔ méishì, xiàwǔ yào qù shàngkè.', 'arabic': 'ليس لدي شيء صباحاً، سأذهب للدرس بعد الظهر.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '那我们上午十点见面吧。', 'pinyin': 'Nà wǒmen shàngwǔ shí diǎn jiànmiàn ba.', 'arabic': 'إذن لنلتقِ الساعة العاشرة صباحاً.'},
                {'speaker': 'B', 'name': '大卫', 'zh': '好的，明天见！', 'pinyin': 'Hǎo de, míngtiān jiàn!', 'arabic': 'حسناً، أراك غداً!'},
            ]
        },
    ],
    4: [
        {
            'id': 'L4C1',
            'title': 'التحدث عن العائلة',
            'scene': 'بين زميلين',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '大卫，你家有几口人？', 'pinyin': 'Dàwèi, nǐ jiā yǒu jǐ kǒu rén?', 'arabic': 'ديفيد، كم عدد أفراد عائلتك؟'},
                {'speaker': 'B', 'name': '大卫', 'zh': '我家有四口人：爸爸、妈妈、姐姐和我。', 'pinyin': 'Wǒ jiā yǒu sì kǒu rén: bàba, māma, jiějie hé wǒ.', 'arabic': 'عائلتي من أربعة أشخاص: أبي وأمي وأختي الكبرى وأنا.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '你姐姐做什么工作？', 'pinyin': 'Nǐ jiějie zuò shénme gōngzuò?', 'arabic': 'ماذا تعمل أختك الكبرى؟'},
                {'speaker': 'B', 'name': '大卫', 'zh': '她是老师，在北京的一所大学工作。', 'pinyin': 'Tā shì lǎoshī, zài Běijīng de yì suǒ dàxué gōngzuò.', 'arabic': 'هي معلمة، تعمل في جامعة في بكين.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '我也有一个姐姐，她是一位医生。', 'pinyin': 'Wǒ yě yǒu yí ge jiějie, tā shì yí wèi yīshēng.', 'arabic': 'أنا أيضاً لدي أخت كبرى، وهي طبيبة.'},
            ]
        },
        {
            'id': 'L4C2',
            'title': 'وصف شخص',
            'scene': 'في حديقة',
            'turns': [
                {'speaker': 'A', 'name': '大卫', 'zh': '那个女孩是谁？', 'pinyin': 'Nàge nǚhái shì shéi?', 'arabic': 'من تلك الفتاة؟'},
                {'speaker': 'B', 'name': '王芳', 'zh': '她是我的好朋友，叫李娜。', 'pinyin': 'Tā shì wǒ de hǎo péngyou, jiào Lǐ Nà.', 'arabic': 'هي صديقتي الجيدة، اسمها لي نا.'},
                {'speaker': 'A', 'name': '大卫', 'zh': '她是你同学吗？', 'pinyin': 'Tā shì nǐ tóngxué ma?', 'arabic': 'هل هي زميلتك في الفصل؟'},
                {'speaker': 'B', 'name': '王芳', 'zh': '不是，她是我邻居。我们从小就是朋友。', 'pinyin': 'Bú shì, tā shì wǒ línjū. Wǒmen cóng xiǎo jiù shì péngyou.', 'arabic': 'لا، هي جارتي. نحن أصدقاء منذ الصغر.'},
            ]
        },
    ],
    5: [
        {
            'id': 'L5C1',
            'title': 'في مطعم صيني',
            'scene': 'في مطعم',
            'turns': [
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '你想吃什么？', 'pinyin': 'Nǐ xiǎng chī shénme?', 'arabic': 'ماذا تريد أن تأكل؟'},
                {'speaker': 'B', 'name': '王芳', 'zh': '我想吃一碗面条。你呢？', 'pinyin': 'Wǒ xiǎng chī yì wǎn miàntiáo. Nǐ ne?', 'arabic': 'أريد أن آكل طبق نودلز. وأنت؟'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '我要米饭和一盘鸡肉。', 'pinyin': 'Wǒ yào mǐfàn hé yì pán jīròu.', 'arabic': 'أريد أرزاً وصحن دجاج.'},
                {'speaker': 'B', 'name': '王芳', 'zh': '我们再点一些蔬菜吧。', 'pinyin': 'Wǒmen zài diǎn yìxiē shūcài ba.', 'arabic': 'لنطلب بعض الخضروات أيضاً.'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '好，也要一杯茶。', 'pinyin': 'Hǎo, yě yào yì bēi chá.', 'arabic': 'حسناً، وأريد كوب شاي أيضاً.'},
            ]
        },
        {
            'id': 'L5C2',
            'title': 'دعوة لتناول الطعام',
            'scene': 'في الشارع',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你吃了吗？', 'pinyin': 'Nǐ chī le ma?', 'arabic': 'هل أكلت؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '还没吃，我饿了。', 'pinyin': 'Hái méi chī, wǒ è le.', 'arabic': 'لم آكل بعد، أنا جائع.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '我们一起去吃饭吧。我知道一家很好的中餐馆。', 'pinyin': 'Wǒmen yīqǐ qù chī fàn ba. Wǒ zhīdào yì jiā hěn hǎo de Zhōngguó cānguǎn.', 'arabic': 'لنذهب لنأكل معاً. أعرف مطعماً صينياً جيداً.'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '太好了！那里的菜贵不贵？', 'pinyin': 'Tài hǎo le! Nàlǐ de cài guì bú guì?', 'arabic': 'رائع! هل الطعام هناك غالي؟'},
                {'speaker': 'A', 'name': '王芳', 'zh': '不贵，也很好吃。', 'pinyin': 'Bú guì, yě hěn hǎochī.', 'arabic': 'ليس غالياً، ولذيذ أيضاً.'},
            ]
        },
    ],
    6: [
        {
            'id': 'L6C1',
            'title': 'الشراء في السوق',
            'scene': 'في سوق',
            'turns': [
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '请问，这个多少钱？', 'pinyin': 'Qǐngwèn, zhège duōshao qián?', 'arabic': 'عفواً، كم سعر هذا؟'},
                {'speaker': 'B', 'name': 'بائع', 'zh': '这个五十块钱。', 'pinyin': 'Zhège wǔshí kuài qián.', 'arabic': 'هذا بخمسين يواناً.'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '太贵了。可以便宜一点吗？', 'pinyin': 'Tài guì le. Kěyǐ piányi yìdiǎn ma?', 'arabic': 'غالي جداً. هل يمكن أن يكون أرخص قليلاً؟'},
                {'speaker': 'B', 'name': 'بائع', 'zh': '四十块怎么样？', 'pinyin': 'Sìshí kuài zěnmeyàng?', 'arabic': 'كيف بأربعين يواناً؟'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '好的，我要两个。', 'pinyin': 'Hǎo de, wǒ yào liǎng gè.', 'arabic': 'حسناً، أريد اثنين.'},
            ]
        },
        {
            'id': 'L6C2',
            'title': 'شراء الملابس',
            'scene': 'في متجر ملابس',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你喜欢这件衣服吗？', 'pinyin': 'Nǐ xǐhuān zhè jiàn yīfu ma?', 'arabic': 'هل تحب هذه الملابس؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '颜色很好，但是太大了。', 'pinyin': 'Yánsè hěn hǎo, dànshì tài dà le.', 'arabic': 'اللون جميل، لكنها كبيرة جداً.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '有小号的吗？', 'pinyin': 'Yǒu xiǎo hào de ma?', 'arabic': 'هل لديكم مقاس صغير؟'},
                {'speaker': 'B', 'name': 'بائع', 'zh': '有的，请等一下。', 'pinyin': 'Yǒu de, qǐng děng yíxià.', 'arabic': 'نعم، انتظر لحظة.'},
            ]
        },
    ],
    7: [
        {
            'id': 'L7C1',
            'title': 'السؤال عن الطريق',
            'scene': 'في الشارع',
            'turns': [
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '请问，邮局在哪儿？', 'pinyin': 'Qǐngwèn, yóujú zài nǎr?', 'arabic': 'عفواً، أين مكتب البريد؟'},
                {'speaker': 'B', 'name': 'مارة', 'zh': '往前走，在第二个路口左转。', 'pinyin': 'Wǎng qián zǒu, zài dì èr ge lùkǒu zuǒ zhuǎn.', 'arabic': 'امشِ إلى الأمام، وانعطف يساراً عند التقاطع الثاني.'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '远不远？', 'pinyin': 'Yuǎn bù yuǎn?', 'arabic': 'هل هو بعيد؟'},
                {'speaker': 'B', 'name': 'مارة', 'zh': '不远，走路五分钟就到了。', 'pinyin': 'Bù yuǎn, zǒu lù wǔ fēnzhōng jiù dào le.', 'arabic': 'ليس بعيداً، خمس دقائق مشياً وتصل.'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '谢谢你的帮助！', 'pinyin': 'Xièxie nǐ de bāngzhù!', 'arabic': 'شكراً على مساعدتك!'},
            ]
        },
        {
            'id': 'L7C2',
            'title': 'وصف المكان',
            'scene': 'في الحرم الجامعي',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你的学校大不大？', 'pinyin': 'Nǐ de xuéxiào dà bù dà?', 'arabic': 'هل مدرستك كبيرة؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '很大。有一个图书馆、两个食堂和一个运动场。', 'pinyin': 'Hěn dà. Yǒu yí ge túshūguǎn, liǎng gè shítáng hé yí ge yùndòngchǎng.', 'arabic': 'كبيرة جداً. فيها مكتبة ومطعمان وملاعب رياضية.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '宿舍在哪里？', 'pinyin': 'Sùshè zài nǎlǐ?', 'arabic': 'أين السكن الطلابي؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '在学校后面，离教室很近。', 'pinyin': 'Zài xuéxiào hòumiàn, lí jiàoshì hěn jìn.', 'arabic': 'خلف المدرسة، قريب جداً من الفصول.'},
            ]
        },
    ],
    8: [
        {
            'id': 'L8C1',
            'title': 'في محطة الحافلات',
            'scene': 'في محطة',
            'turns': [
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '请问，去北京大学的公共汽车是几路？', 'pinyin': 'Qǐngwèn, qù Běijīng Dàxué de gōnggòng qìchē shì jǐ lù?', 'arabic': 'عفواً، أي حافلة تذهب إلى جامعة بكين؟'},
                {'speaker': 'B', 'name': 'مارة', 'zh': '你可以坐地铁，三号线，很快。', 'pinyin': 'Nǐ kěyǐ zuò dìtiě, sān hào xiàn, hěn kuài.', 'arabic': 'يمكنك ركوب المترو، الخط الثالث، سريع جداً.'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '地铁站远吗？', 'pinyin': 'Dìtiězhàn yuǎn ma?', 'arabic': 'هل محطة المترو بعيدة؟'},
                {'speaker': 'B', 'name': 'مارة', 'zh': '就在那边，走路两分钟。', 'pinyin': 'Jiù zài nàbiān, zǒu lù liǎng fēnzhōng.', 'arabic': 'هناك، دقيقتان مشياً.'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '太好了，谢谢！', 'pinyin': 'Tài hǎo le, xièxie!', 'arabic': 'ممتاز، شكراً!'},
            ]
        },
        {
            'id': 'L8C2',
            'title': 'في المطار',
            'scene': 'في المطار',
            'turns': [
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '你好，我想买一张去上海的机票。', 'pinyin': 'Nǐ hǎo, wǒ xiǎng mǎi yì zhāng qù Shànghǎi de jīpiào.', 'arabic': 'مرحباً، أريد شراء تذكرة طيران إلى شنغهاي.'},
                {'speaker': 'B', 'name': 'موظف', 'zh': '好的，您要什么时候的？', 'pinyin': 'Hǎo de, nín yào shénme shíhou de?', 'arabic': 'حسناً، متى تريد؟'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '明天下午的。多少钱？', 'pinyin': 'Míngtiān xiàwǔ de. Duōshao qián?', 'arabic': 'غداً بعد الظهر. كم السعر؟'},
                {'speaker': 'B', 'name': 'موظف', 'zh': '八百块。这是您的机票。', 'pinyin': 'Bābǎi kuài. Zhè shì nín de jīpiào.', 'arabic': 'ثمانمئة يوان. هذه تذكرتك.'},
            ]
        },
    ],
    9: [
        {
            'id': 'L9C1',
            'title': 'الحديث عن الطقس',
            'scene': 'في الصباح',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '今天天气真好！', 'pinyin': 'Jīntiān tiānqì zhēn hǎo!', 'arabic': 'الطقس جميل اليوم!'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '对，不冷也不热。我们去公园吧。', 'pinyin': 'Duì, bù lěng yě bú rè. Wǒmen qù gōngyuán ba.', 'arabic': 'نعم، ليس بارداً ولا حاراً. لنذهب إلى الحديقة.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '好主意！昨天天气很不好，下雨了。', 'pinyin': 'Hǎo zhǔyì! Zuótiān tiānqì hěn bù hǎo, xià yǔ le.', 'arabic': 'فكرة رائعة! طقس أمس كان سيئاً، أمطرت.'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '春天的天气变化很大。', 'pinyin': 'Chūntiān de tiānqì biànhuà hěn dà.', 'arabic': 'طقس الربيع يتغير كثيراً.'},
            ]
        },
        {
            'id': 'L9C2',
            'title': 'الموسم المفضل',
            'scene': 'في الفصل',
            'turns': [
                {'speaker': 'A', 'name': 'أستاذ', 'zh': '你们最喜欢哪个季节？', 'pinyin': 'Nǐmen zuì xǐhuān nǎge jìjié?', 'arabic': 'ما هو الموسم المفضل لديكم؟'},
                {'speaker': 'B', 'name': 'طالب', 'zh': '我喜欢秋天，天气很舒服。', 'pinyin': 'Wǒ xǐhuān qiūtiān, tiānqì hěn shūfú.', 'arabic': 'أحب الخريف، الطقس مريح جداً.'},
                {'speaker': 'A', 'name': 'أستاذ', 'zh': '北京的冬天怎么样？', 'pinyin': 'Běijīng de dōngtiān zěnmeyàng?', 'arabic': 'كيف شتاء بكين؟'},
                {'speaker': 'B', 'name': 'طالب', 'zh': '冬天很冷，常常下雪。', 'pinyin': 'Dōngtiān hěn lěng, chángcháng xià xuě.', 'arabic': 'الشتاء بارد جداً، ويتساقط الثلج غالباً.'},
                {'speaker': 'A', 'name': 'أستاذ', 'zh': '夏天呢？', 'pinyin': 'Xiàtiān ne?', 'arabic': 'وماذا عن الصيف؟'},
                {'speaker': 'B', 'name': 'طالب', 'zh': '夏天太热了，我不喜欢。', 'pinyin': 'Xiàtiān tài rè le, wǒ bù xǐhuān.', 'arabic': 'الصيف حار جداً، لا أحبه.'},
            ]
        },
    ],
    10: [
        {
            'id': 'L10C1',
            'title': 'زيارة الطبيب',
            'scene': 'في المستشفى',
            'turns': [
                {'speaker': 'A', 'name': 'طبيب', 'zh': '你怎么了？哪里不舒服？', 'pinyin': 'Nǐ zěnme le? Nǎlǐ bù shūfú?', 'arabic': 'ما بك؟ أين تشعر بعدم الراحة؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我头疼，嗓子也疼。', 'pinyin': 'Wǒ tóu téng, sǎngzi yě téng.', 'arabic': 'عندي صداع وحلق يؤلمني.'},
                {'speaker': 'A', 'name': 'طبيب', 'zh': '你发烧了吗？让我看看。', 'pinyin': 'Nǐ fāshāo le ma? Ràng wǒ kànkan.', 'arabic': 'هل لديك حمى؟ دعني أفحصك.'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '没有发烧，就是很累。', 'pinyin': 'Méiyǒu fāshāo, jiùshì hěn lèi.', 'arabic': 'ليس لدي حمى، لكنني متعب جداً.'},
                {'speaker': 'A', 'name': 'طبيب', 'zh': '多喝水，多休息，吃这个药，一天三次。', 'pinyin': 'Duō hē shuǐ, duō xiūxi, chī zhège yào, yì tiān sān cì.', 'arabic': 'اشرب كثيراً من الماء واسترح أكثر، خذ هذا الدواء ثلاث مرات يومياً.'},
            ]
        },
        {
            'id': 'L10C2',
            'title': 'الحديث عن الصحة',
            'scene': 'بين أصدقاء',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你今天怎么没来上课？', 'pinyin': 'Nǐ jīntiān zěnme méi lái shàngkè?', 'arabic': 'لماذا لم تحضر الدرس اليوم؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我生病了，昨天去了医院。', 'pinyin': 'Wǒ shēngbìng le, zuótiān qù le yīyuàn.', 'arabic': 'كنت مريضاً، ذهبت للمستشفى أمس.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '现在怎么样了？好些了吗？', 'pinyin': 'Xiànzài zěnmeyàng le? Hǎo xiē le ma?', 'arabic': 'كيف حالك الآن؟ هل تحسنت؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '好多了，谢谢你的关心。', 'pinyin': 'Hǎo duō le, xièxie nǐ de guānxīn.', 'arabic': 'تحسنت كثيراً، شكراً على اهتمامك.'},
            ]
        },
    ],
    11: [
        {
            'id': 'L11C1',
            'title': 'الحديث عن العمل',
            'scene': 'في حفل تعارف',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '请问你是做什么工作的？', 'pinyin': 'Qǐngwèn nǐ shì zuò shénme gōngzuò de?', 'arabic': 'ما هو عملك من فضلك؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我是一名老师，在一所中学教书。', 'pinyin': 'Wǒ shì yì míng lǎoshī, zài yì suǒ zhōngxué jiāoshū.', 'arabic': 'أنا معلم، أدرّس في مدرسة متوسطة.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '教什么课？', 'pinyin': 'Jiāo shénme kè?', 'arabic': 'ما المادة التي تدرّسها؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我教英文。你呢？', 'pinyin': 'Wǒ jiāo Yīngwén. Nǐ ne?', 'arabic': 'أدرّس الإنجليزية. وأنتِ؟'},
                {'speaker': 'A', 'name': '王芳', 'zh': '我在一家公司工作，是经理。', 'pinyin': 'Wǒ zài yì jiā gōngsī gōngzuò, shì jīnglǐ.', 'arabic': 'أعمل في شركة وأنا مديرة.'},
            ]
        },
        {
            'id': 'L11C2',
            'title': 'الحديث عن الدراسة',
            'scene': 'في المكتبة',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你每天学习多长时间？', 'pinyin': 'Nǐ měitiān xuéxí duō cháng shíjiān?', 'arabic': 'كم من الوقت تدرس كل يوم؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '大概三个小时。明天有考试，所以今天多复习一会儿。', 'pinyin': 'Dàgài sān gè xiǎoshí. Míngtiān yǒu kǎoshì, suǒyǐ jīntiān duō fùxí yíhuìr.', 'arabic': 'حوالي ثلاث ساعات. غداً لدينا اختبار، لذا سأراجع أكثر اليوم.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '你学什么专业？', 'pinyin': 'Nǐ xué shénme zhuānyè?', 'arabic': 'ما هو تخصصك؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我学中文专业，已经学了一年多了。', 'pinyin': 'Wǒ xué Zhōngwén zhuānyè, yǐjīng xué le yì nián duō le.', 'arabic': 'أدرس تخصص اللغة الصينية، وقد درست أكثر من سنة.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '中文难不难？', 'pinyin': 'Zhōngwén nán bù nán?', 'arabic': 'هل الصينية صعبة؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '有点难，但是很有意思。', 'pinyin': 'Yǒudiǎn nán, dànshì hěn yǒuyìsi.', 'arabic': 'صعبة بعض الشيء، لكنها ممتعة جداً.'},
            ]
        },
    ],
    12: [
        {
            'id': 'L12C1',
            'title': 'الحديث عن الهوايات',
            'scene': 'بين أصدقاء جدد',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你周末一般做什么？', 'pinyin': 'Nǐ zhōumò yìbān zuò shénme?', 'arabic': 'ماذا تفعل عادة في نهاية الأسبوع؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我喜欢看电影和听音乐。你呢？', 'pinyin': 'Wǒ xǐhuān kàn diànyǐng hé tīng yīnyuè. Nǐ ne?', 'arabic': 'أحب مشاهدة الأفلام والاستماع للموسيقى. وأنتِ؟'},
                {'speaker': 'A', 'name': '王芳', 'zh': '我喜欢运动，常常踢足球和游泳。', 'pinyin': 'Wǒ xǐhuān yùndòng, chángcháng tī zúqiú hé yóuyǒng.', 'arabic': 'أحب الرياضة، غالباً ألعب كرة القدم وأسبح.'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '你会游泳吗？', 'pinyin': 'Nǐ huì yóuyǒng ma?', 'arabic': 'هل تستطيعين السباحة؟'},
                {'speaker': 'A', 'name': '王芳', 'zh': '会，我游得很好。下次我们一起去吧！', 'pinyin': 'Huì, wǒ yóu de hěn hǎo. Xià cì wǒmen yīqǐ qù ba!', 'arabic': 'نعم، أسبح جيداً. لنذهب معاً المرة القادمة!'},
            ]
        },
        {
            'id': 'L12C2',
            'title': 'دعوة لحضور حفلة',
            'scene': 'عبر الهاتف',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '大卫，明天晚上有音乐会，你去不去？', 'pinyin': 'Dàwèi, míngtiān wǎnshang yǒu yīnyuèhuì, nǐ qù bú qù?', 'arabic': 'ديفيد، هناك حفل موسيقي غداً مساءً، هل تأتي؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '什么音乐会？', 'pinyin': 'Shénme yīnyuèhuì?', 'arabic': 'ما نوع الحفل الموسيقي؟'},
                {'speaker': 'A', 'name': '王芳', 'zh': '中国民乐音乐会，在学校大礼堂。', 'pinyin': 'Zhōngguó mínyuè yīnyuèhuì, zài xuéxiào dà lǐtáng.', 'arabic': 'حفل موسيقى شعبية صينية، في القاعة الكبرى للمدرسة.'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '听起来很有意思！几点开始？', 'pinyin': 'Tīng qǐlái hěn yǒuyìsi! Jǐ diǎn kāishǐ?', 'arabic': 'يبدو ممتعاً! متى يبدأ؟'},
                {'speaker': 'A', 'name': '王芳', 'zh': '晚上七点半。我们一起去吧！', 'pinyin': 'Wǎnshang qī diǎn bàn. Wǒmen yīqǐ qù ba!', 'arabic': 'الساعة السابعة والنصف مساءً. لنذهب معاً!'},
            ]
        },
    ],
    13: [
        {
            'id': 'L13C1',
            'title': 'التعبير عن المشاعر',
            'scene': 'بين صديقين',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你今天看起来不太高兴。怎么了？', 'pinyin': 'Nǐ jīntiān kàn qǐlái bú tài gāoxìng. Zěnme le?', 'arabic': 'يبدو أنك غير سعيد اليوم. ما بك؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我考试没及格，很伤心。', 'pinyin': 'Wǒ kǎoshì méi jígé, hěn shāngxīn.', 'arabic': 'لم أنجح في الاختبار، أنا حزين جداً.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '别担心，下次一定可以考好。', 'pinyin': 'Bié dānxīn, xià cì yídìng kěyǐ kǎo hǎo.', 'arabic': 'لا تقلق، يمكنك النجاح في المرة القادمة بالتأكيد.'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '谢谢你。你真是一个好朋友。', 'pinyin': 'Xièxie nǐ. Nǐ zhēn shì yí ge hǎo péngyou.', 'arabic': 'شكراً لك. أنت حقاً صديق جيد.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '我也很想你。我们一起努力学习吧！', 'pinyin': 'Wǒ yě hěn xiǎng nǐ. Wǒmen yīqǐ nǔlì xuéxí ba!', 'arabic': 'أنا أيضاً أفتقدك. لنذاكر بجد معاً!'},
            ]
        },
        {
            'id': 'L13C2',
            'title': 'يوم متعب',
            'scene': 'بعد العمل',
            'turns': [
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '今天太忙了，我很累。', 'pinyin': 'Jīntiān tài máng le, wǒ hěn lèi.', 'arabic': 'كنت مشغولاً جداً اليوم، أنا متعب.'},
                {'speaker': 'B', 'name': '王芳', 'zh': '你现在想做什么？', 'pinyin': 'Nǐ xiànzài xiǎng zuò shénme?', 'arabic': 'ماذا تريد أن تفعل الآن؟'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '我想回家休息。你呢？', 'pinyin': 'Wǒ xiǎng huí jiā xiūxi. Nǐ ne?', 'arabic': 'أريد العودة للمنزل والراحة. وأنتِ؟'},
                {'speaker': 'B', 'name': '王芳', 'zh': '我也很忙，不过我很开心，因为今天工作做得很好。', 'pinyin': 'Wǒ yě hěn máng, búguò wǒ hěn kāixīn, yīnwèi jīntiān gōngzuò zuò de hěn hǎo.', 'arabic': 'أنا أيضاً مشغولة، لكنني سعيدة لأنني أنجزت عملي جيداً اليوم.'},
            ]
        },
    ],
    14: [
        {
            'id': 'L14C1',
            'title': 'وصف المنزل',
            'scene': 'بين جارين',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你家住在哪儿？', 'pinyin': 'Nǐ jiā zhù zài nǎr?', 'arabic': 'أين يقع منزلك؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我住在学校附近的一个小区里。', 'pinyin': 'Wǒ zhù zài xuéxiào fùjìn de yí ge xiǎoqū lǐ.', 'arabic': 'أسكن في مجمع سكني قريب من المدرسة.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '你的房子大吗？', 'pinyin': 'Nǐ de fángzi dà ma?', 'arabic': 'هل منزلك كبير؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '不大，有两间卧室，一个客厅和一个厨房。', 'pinyin': 'Bú dà, yǒu liǎng jiān wòshì, yí ge kètīng hé yí ge chúfáng.', 'arabic': 'ليس كبيراً، فيه غرفتا نوم وصالة ومطبخ.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '听起来不错。你每天几点起床？', 'pinyin': 'Tīng qǐlái búcuò. Nǐ měitiān jǐ diǎn qǐchuáng?', 'arabic': 'يبدو جيداً. في أي ساعة تستيقظ كل يوم؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '每天早上七点。然后洗澡、吃早饭、去上课。', 'pinyin': 'Měitiān zǎoshang qī diǎn. Ránhòu xǐzǎo, chī zǎofàn, qù shàngkè.', 'arabic': 'السابعة صباحاً كل يوم. ثم أستحم وتناول الفطور وأذهب للدرس.'},
            ]
        },
        {
            'id': 'L14C2',
            'title': 'الروتين اليومي',
            'scene': 'في المساء',
            'turns': [
                {'speaker': 'A', 'name': '王芳', 'zh': '你晚上一般做什么？', 'pinyin': 'Nǐ wǎnshang yìbān zuò shénme?', 'arabic': 'ماذا تفعل عادة في المساء؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '我一般在房间看书、写作业。', 'pinyin': 'Wǒ yìbān zài fángjiān kàn shū, xiě zuòyè.', 'arabic': 'عادة أقرأ كتاباً وأكتب واجبي في غرفتي.'},
                {'speaker': 'A', 'name': '王芳', 'zh': '你几点睡觉？', 'pinyin': 'Nǐ jǐ diǎn shuìjiào?', 'arabic': 'في أي ساعة تنام؟'},
                {'speaker': 'B', 'name': 'ديفيد', 'zh': '大概十一点。你呢？', 'pinyin': 'Dàgài shíyī diǎn. Nǐ ne?', 'arabic': 'حوالي الحادية عشرة. وأنتِ؟'},
                {'speaker': 'A', 'name': '王芳', 'zh': '我十点就睡觉了。早起早睡，对身体好。', 'pinyin': 'Wǒ shí diǎn jiù shuìjiào le. Zǎo qǐ zǎo shuì, duì shēntǐ hǎo.', 'arabic': 'أنام في العاشرة. النوم المبكر والاستيقاظ المبكر جيد للصحة.'},
            ]
        },
    ],
    15: [
        {
            'id': 'L15C1',
            'title': 'مراجعة: في المتجر',
            'scene': 'في متجر',
            'turns': [
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '请问，这个多少钱？', 'pinyin': 'Qǐngwèn, zhège duōshao qián?', 'arabic': 'عفواً، كم سعر هذا؟'},
                {'speaker': 'B', 'name': 'بائع', 'zh': '这个一百二十块钱。', 'pinyin': 'Zhège yìbǎi èrshí kuài qián.', 'arabic': 'هذا بمئة وعشرين يواناً.'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '太贵了，可以便宜一点吗？', 'pinyin': 'Tài guì le, kěyǐ piányi yìdiǎn ma?', 'arabic': 'غالي جداً، هل يمكن أن يكون أرخص؟'},
                {'speaker': 'B', 'name': 'بائع', 'zh': '一百块吧。你还要别的吗？', 'pinyin': 'Yìbǎi kuài ba. Nǐ hái yào biéde ma?', 'arabic': 'بمئة يوان. هل تريد شيئاً آخر؟'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '不了，谢谢。再见！', 'pinyin': 'Bù le, xièxie. Zàijiàn!', 'arabic': 'لا، شكراً. إلى اللقاء!'},
                {'speaker': 'B', 'name': 'بائع', 'zh': '再见，欢迎下次再来！', 'pinyin': 'Zàijiàn, huānyíng xià cì zài lái!', 'arabic': 'إلى اللقاء، أهلاً بك في المرة القادمة!'},
            ]
        },
        {
            'id': 'L15C2',
            'title': 'مراجعة: مقابلة ودية',
            'scene': 'في مقهى',
            'turns': [
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '好久不见！你最近怎么样？', 'pinyin': 'Hǎojiǔ bú jiàn! Nǐ zuìjìn zěnmeyàng?', 'arabic': 'طاب لقاءك! كيف حالك مؤخراً؟'},
                {'speaker': 'B', 'name': '王芳', 'zh': '我还不错，你呢？还在学习中文吗？', 'pinyin': 'Wǒ hái búcuò, nǐ ne? Hái zài xuéxí Zhōngwén ma?', 'arabic': 'أنا بخير، وأنت؟ هل لا تزال تدرس الصينية؟'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '对，我已经学了一年中文了。', 'pinyin': 'Duì, wǒ yǐjīng xué le yì nián Zhōngwén le.', 'arabic': 'نعم، لقد درست الصينية لمدة عام.'},
                {'speaker': 'B', 'name': '王芳', 'zh': '太好了！你的中文说得很好。', 'pinyin': 'Tài hǎo le! Nǐ de Zhōngwén shuō de hěn hǎo.', 'arabic': 'ممتاز! تتحدث الصينية بشكل جيد جداً.'},
                {'speaker': 'A', 'name': 'ديفيد', 'zh': '谢谢！你工作忙不忙？', 'pinyin': 'Xièxie! Nǐ gōngzuò máng bù máng?', 'arabic': 'شكراً! هل أنت مشغول في العمل؟'},
                {'speaker': 'B', 'name': '王芳', 'zh': '很忙，但是很有意思。对了，谁是我们高中的同学？', 'pinyin': 'Hěn máng, dànshì hěn yǒuyìsi. Duì le, shéi shì wǒmen gāozhōng de tóngxué?', 'arabic': 'مشغولة جداً، لكن ممتع. بالمناسبة، من هم زملاؤنا في الثانوية؟'},
            ]
        },
    ],
}

# ─── Exercises for each lesson ──────────────────────────────────────────
# Types: multiple_choice (4 options), fill_blank, translate, tone
lesson_exercises = {
    1: [
        {'type': 'multiple_choice', 'q': 'ما معنى "你好"؟', 'options': ['مرحباً', 'شكراً', 'وداعاً', 'آسف'], 'correct': 0},
        {'type': 'fill_blank', 'q': '我___学生。（أنا طالب）', 'answer': '是'},
        {'type': 'translate', 'q': 'ترجم: 你叫什么名字？', 'answer': 'ما اسمك؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "شكراً" بالصينية؟', 'options': ['再见', '谢谢', '你好', '不客气'], 'correct': 1},
        {'type': 'translate', 'q': 'ترجم: 她是我的老师。', 'answer': 'هي معلمتي.'},
        {'type': 'tone', 'q': 'ما النبرة الصحيحة لـ "你好"؟', 'options': ['nǐ hǎo (3-3)', 'ní hǎo (2-3)', 'nǐ hào (3-4)', 'nǐ háo (3-2)'], 'correct': 0},
    ],
    2: [
        {'type': 'multiple_choice', 'q': 'كم عدد "三十五"؟', 'options': ['30', '35', '53', '45'], 'correct': 1},
        {'type': 'fill_blank', 'q': '你___几本书？（لديك كم كتاباً؟）', 'answer': '有'},
        {'type': 'translate', 'q': 'ترجم: 这个多少钱？', 'answer': 'كم سعر هذا؟'},
        {'type': 'multiple_choice', 'q': 'ما معنى "一百"？', 'options': ['10', '50', '100', '1000'], 'correct': 2},
        {'type': 'fill_blank', 'q': '我___二十岁。（أنا في العشرين من عمري）', 'answer': '今年'},
    ],
    3: [
        {'type': 'multiple_choice', 'q': 'ما معنى "明天"؟', 'options': ['اليوم', 'أمس', 'غداً', 'الآن'], 'correct': 2},
        {'type': 'fill_blank', 'q': '现在是八点___。（الساعة الآن الثامنة والنصف）', 'answer': '半'},
        {'type': 'translate', 'q': 'ترجم: 你每天几点起床？', 'answer': 'في أي ساعة تستيقظ كل يوم؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "الاثنين" بالصينية؟', 'options': ['星期三', '星期一', '星期五', '星期天'], 'correct': 1},
        {'type': 'fill_blank', 'q': '今天___号？（ما تاريخ اليوم؟）', 'answer': '几'},
    ],
    4: [
        {'type': 'multiple_choice', 'q': 'ما معنى "姐姐"؟', 'options': ['الأخت الصغرى', 'الأم', 'الأخت الكبرى', 'الجدة'], 'correct': 2},
        {'type': 'fill_blank', 'q': '他___我的同学。（هو زميلي）', 'answer': '是'},
        {'type': 'translate', 'q': 'ترجم: 你家有几个人？', 'answer': 'كم عدد أفراد عائلتك؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "أب" بالصينية؟', 'options': ['妈妈', '哥哥', '弟弟', '爸爸'], 'correct': 3},
        {'type': 'translate', 'q': 'ترجم: 她是我姐姐。', 'answer': 'هي أختي الكبرى.'},
    ],
    5: [
        {'type': 'multiple_choice', 'q': 'ما معنى "米饭"؟', 'options': ['الماء', 'الأرز', 'الشاي', 'الخبز'], 'correct': 1},
        {'type': 'fill_blank', 'q': '你想___什么？（ماذا تريد أن تأكل؟）', 'answer': '吃'},
        {'type': 'translate', 'q': 'ترجم: 这个菜很好吃。', 'answer': 'هذا الطبق لذيذ جداً.'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "شاي" بالصينية؟', 'options': ['咖啡', '水', '茶', '果汁'], 'correct': 2},
        {'type': 'fill_blank', 'q': '我___一杯咖啡。（أريد كوب قهوة）', 'answer': '要'},
    ],
    6: [
        {'type': 'multiple_choice', 'q': 'ما معنى "多少钱"؟', 'options': ['كم يبعد', 'كم الثمن', 'كم عدد', 'كم عمر'], 'correct': 1},
        {'type': 'fill_blank', 'q': '这件衣服太___了。（هذه الملابس غالية جداً）', 'answer': '贵'},
        {'type': 'translate', 'q': 'ترجم: 可以便宜一点吗？', 'answer': 'هل يمكن أن يكون أرخص قليلاً؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "رخص" بالصينية؟', 'options': ['贵', '便宜', '多', '少'], 'correct': 1},
        {'type': 'translate', 'q': 'ترجم: 我要买一些东西。', 'answer': 'أريد شراء بعض الأشياء.'},
    ],
    7: [
        {'type': 'multiple_choice', 'q': 'ما معنى "在哪儿"؟', 'options': ['ماذا', 'من أين', 'أين', 'متى'], 'correct': 2},
        {'type': 'fill_blank', 'q': '邮局___学校旁边。（مكتب البريد بجوار المدرسة）', 'answer': '在'},
        {'type': 'translate', 'q': 'ترجم: 请问，地铁站在哪儿？', 'answer': 'عفواً، أين محطة المترو؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "يميناً" بالصينية؟', 'options': ['左', '右', '前', '后'], 'correct': 1},
        {'type': 'fill_blank', 'q': '往前走，然后___转。（امشِ للأمام ثم انعطف) ', 'answer': '右'},
    ],
    8: [
        {'type': 'multiple_choice', 'q': 'ما معنى "出租车"؟', 'options': ['الحافلة', 'القطار', 'السيارة الأجرة', 'الدراجة'], 'correct': 2},
        {'type': 'fill_blank', 'q': '我坐公共___去上班。（أذهب للعمل بالحافلة）', 'answer': '汽车'},
        {'type': 'translate', 'q': 'ترجم: 从这儿到机场多远？', 'answer': 'كم المسافة من هنا إلى المطار؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "مطار" بالصينية؟', 'options': ['火车站', '机场', '地铁站', '汽车站'], 'correct': 1},
        {'type': 'translate', 'q': 'ترجم: 明天下午三点出发。', 'answer': 'سننطلق غداً الساعة الثالثة بعد الظهر.'},
    ],
    9: [
        {'type': 'multiple_choice', 'q': 'ما معنى "天气"؟', 'options': ['الوقت', 'الطقس', 'الموسم', 'التاريخ'], 'correct': 1},
        {'type': 'fill_blank', 'q': '今天很___，不想出门。（الطقس حار جداً اليوم）', 'answer': '热'},
        {'type': 'translate', 'q': 'ترجم: 北京的冬天很冷。', 'answer': 'شتاء بكين بارد جداً.'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "مطر" بالصينية؟', 'options': ['雪', '风', '雨', '云'], 'correct': 2},
        {'type': 'fill_blank', 'q': '我最喜欢___天。（أنا أحب فصل الربيع) ', 'answer': '春'},
    ],
    10: [
        {'type': 'multiple_choice', 'q': 'ما معنى "头疼"؟', 'options': ['آلام البطن', 'الصداع', 'ألم الأسنان', 'الزكام'], 'correct': 1},
        {'type': 'fill_blank', 'q': '你___了吗？（هل تناولت الدواء؟）', 'answer': '吃药'},
        {'type': 'translate', 'q': 'ترجم: 你哪里不舒服？', 'answer': 'أين تشعر بعدم الراحة؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "طبيب" بالصينية؟', 'options': ['护士', '病人', '医生', '老师'], 'correct': 2},
        {'type': 'translate', 'q': 'ترجم: 多喝水，多休息。', 'answer': 'اشرب كثيراً من الماء واسترح أكثر.'},
    ],
    11: [
        {'type': 'multiple_choice', 'q': 'ما معنى "工作"؟', 'options': ['الدراسة', 'العمل', 'اللعب', 'النوم'], 'correct': 1},
        {'type': 'fill_blank', 'q': '我是老师，在学校___书。（أنا معلم، أدرّس في المدرسة）', 'answer': '教'},
        {'type': 'translate', 'q': 'ترجم: 你在哪里工作？', 'answer': 'أين تعمل؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "اختبار" بالصينية؟', 'options': ['作业', '考试', '课程', '毕业'], 'correct': 1},
        {'type': 'fill_blank', 'q': '明天有___，我还在复习。（غداً اختبار، ما زلت أراجع）', 'answer': '考试'},
    ],
    12: [
        {'type': 'multiple_choice', 'q': 'ما معنى "爱好"؟', 'options': ['العمل', 'الهواية', 'الصداقة', 'العائلة'], 'correct': 1},
        {'type': 'fill_blank', 'q': '我喜欢___音乐。（أحب الاستماع للموسيقى）', 'answer': '听'},
        {'type': 'translate', 'q': 'ترجم: 你会游泳吗？', 'answer': 'هل تستطيع السباحة؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "كرة القدم" بالصينية؟', 'options': ['篮球', '足球', '排球', '网球'], 'correct': 1},
        {'type': 'translate', 'q': 'ترجم: 我周末常常和朋友一起唱歌。', 'answer': 'في نهاية الأسبوع غالباً أغني مع أصدقائي.'},
    ],
    13: [
        {'type': 'multiple_choice', 'q': 'ما معنى "高兴"؟', 'options': ['حزين', 'سعيد', 'غاضب', 'متعب'], 'correct': 1},
        {'type': 'fill_blank', 'q': '别___，没事的。（لا تقلق، كل شيء على ما يرام) ', 'answer': '担心'},
        {'type': 'translate', 'q': 'ترجم: 我很想我的家人。', 'answer': 'أنا أشتاق إلى عائلتي كثيراً.'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "مشغول" بالصينية؟', 'options': ['累', '忙', '高兴', '无聊'], 'correct': 1},
        {'type': 'fill_blank', 'q': '你___不忙？（هل أنت مشغول أم لا؟）', 'answer': '忙'},
    ],
    14: [
        {'type': 'multiple_choice', 'q': 'ما معنى "卧室"؟', 'options': ['المطبخ', 'غرفة النوم', 'الحمام', 'الصالة'], 'correct': 1},
        {'type': 'fill_blank', 'q': '我每天早上七点___。（أستيقظ كل صباح الساعة السابعة）', 'answer': '起床'},
        {'type': 'translate', 'q': 'ترجم: 你住在哪儿？', 'answer': 'أين تسكن؟'},
        {'type': 'multiple_choice', 'q': 'كيف تقول "المطبخ" بالصينية؟', 'options': ['客厅', '卧室', '厨房', '卫生间'], 'correct': 2},
        {'type': 'translate', 'q': 'ترجم: 晚饭你想吃什么？', 'answer': 'ماذا تريد أن تأكل على العشاء؟'},
    ],
    15: [
        {'type': 'multiple_choice', 'q': 'ما معنى "对不起"؟', 'options': ['شكراً', 'مرحباً', 'آسف', 'لا بأس'], 'correct': 2},
        {'type': 'fill_blank', 'q': '___关系，别担心。（لا بأس، لا تقلق) ', 'answer': '没'},
        {'type': 'translate', 'q': 'ترجم: 他还在学习吗？', 'answer': 'هل لا يزال يدرس؟'},
        {'type': 'multiple_choice', 'q': 'ما معنى "没关系"؟', 'options': ['آسف', 'لا بأس', 'شكراً', 'مرحباً'], 'correct': 1},
        {'type': 'translate', 'q': 'ترجم: 我们学了很多东西。', 'answer': 'تعلمنا أشياء كثيرة.'},
        {'type': 'tone', 'q': 'ما النبرة الصحيحة لـ "对不起"؟', 'options': ['duì bù qǐ (4-4-3)', 'duì bù qǐ (4-2-3)', 'duì bù qǐ (2-4-3)', 'duì bú qǐ (4-2-3)'], 'correct': 3},
    ],
}

# ─── Generate TypeScript ────────────────────────────────────────────────
lines = []
lines.append('// Auto-generated expanded lessons data for HSK1 learning platform')
lines.append('// Each lesson has 22-40 vocabulary IDs, grammar IDs, key sentences, conversations, and exercises')
lines.append('')
lines.append('export interface Lesson {')
lines.append('  id: number;')
lines.append('  title: string;')
lines.append('  titleZh: string;')
lines.append('  level: string;')
lines.append('  description: string;')
lines.append('  vocabularyIds: number[];')
lines.append('  grammarIds: number[];')
lines.append('  keySentences: { zh: string; pinyin: string; arabic: string }[];')
lines.append('  conversations: {')
lines.append('    id: string;')
lines.append('    title: string;')
lines.append('    scene: string;')
lines.append('    turns: { speaker: string; name: string; zh: string; pinyin: string; arabic: string }[];')
lines.append('  }[];')
lines.append('  exercises: (')
lines.append('    { type: "multiple_choice"; q: string; options: string[]; correct: number }')
lines.append('    | { type: "fill_blank"; q: string; answer: string }')
lines.append('    | { type: "translate"; q: string; answer: string }')
lines.append('    | { type: "tone"; q: string; options: string[]; correct: number }')
lines.append('  )[];')
lines.append('}')
lines.append('')
lines.append('export const lessons: Lesson[] = [')

for n in range(1, 16):
    meta = lesson_meta[n]
    vocab_ids = lesson_vocab_ids[n]
    grammar_ids = lesson_grammar[n]
    sentences = lesson_sentences.get(n, [])
    conversations = lesson_conversations.get(n, [])
    exercises = lesson_exercises.get(n, [])

    lines.append('  {')
    lines.append(f'    id: {n},')
    lines.append(f'    title: {json.dumps(meta["title"], ensure_ascii=False)},')
    lines.append(f'    titleZh: {json.dumps(meta["titleZh"], ensure_ascii=False)},')
    lines.append(f'    level: {json.dumps(meta["level"], ensure_ascii=False)},')
    lines.append(f'    description: {json.dumps(meta["desc"], ensure_ascii=False)},')
    lines.append(f'    vocabularyIds: {json.dumps(vocab_ids)},')
    lines.append(f'    grammarIds: {json.dumps(grammar_ids)},')

    # Key sentences
    lines.append('    keySentences: [')
    for s in sentences:
        lines.append(f'      {{ zh: {json.dumps(s["zh"], ensure_ascii=False)}, pinyin: {json.dumps(s["pinyin"], ensure_ascii=False)}, arabic: {json.dumps(s["arabic"], ensure_ascii=False)} }},')
    lines.append('    ],')

    # Conversations
    lines.append('    conversations: [')
    for conv in conversations:
        lines.append('      {')
        lines.append(f'        id: {json.dumps(conv["id"], ensure_ascii=False)},')
        lines.append(f'        title: {json.dumps(conv["title"], ensure_ascii=False)},')
        lines.append(f'        scene: {json.dumps(conv["scene"], ensure_ascii=False)},')
        lines.append('        turns: [')
        for turn in conv['turns']:
            lines.append(f'          {{ speaker: {json.dumps(turn["speaker"], ensure_ascii=False)}, name: {json.dumps(turn["name"], ensure_ascii=False)}, zh: {json.dumps(turn["zh"], ensure_ascii=False)}, pinyin: {json.dumps(turn["pinyin"], ensure_ascii=False)}, arabic: {json.dumps(turn["arabic"], ensure_ascii=False)} }},')
        lines.append('        ],')
        lines.append('      },')
    lines.append('    ],')

    # Exercises
    lines.append('    exercises: [')
    for ex in exercises:
        if ex['type'] in ('multiple_choice', 'tone'):
            lines.append(f'      {{ type: {json.dumps(ex["type"])}, q: {json.dumps(ex["q"], ensure_ascii=False)}, options: {json.dumps(ex["options"], ensure_ascii=False)}, correct: {ex["correct"]} }},')
        elif ex['type'] in ('fill_blank', 'translate'):
            lines.append(f'      {{ type: {json.dumps(ex["type"])}, q: {json.dumps(ex["q"], ensure_ascii=False)}, answer: {json.dumps(ex["answer"], ensure_ascii=False)} }},')
    lines.append('    ],')

    if n < 15:
        lines.append('  },')
    else:
        lines.append('  },')

lines.append('];')
lines.append('')

output = '\n'.join(lines)

with open('/home/z/my-project/src/data/lessons.ts', 'w') as f:
    f.write(output)

print(f"\nGenerated lessons.ts successfully!")
print(f"Total lines: {len(lines)}")

# Verify
for n in range(1, 16):
    count = len(lesson_vocab_ids[n])
    status = '✓' if 22 <= count <= 40 else '✗'
    print(f"  Lesson {n}: {count} vocab IDs {status}")
