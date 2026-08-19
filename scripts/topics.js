// Semantic topic lexicon used to name units.
//
// Each entry matches a word on three channels — the Chinese form, the Arabic
// meaning, the English gloss — so it still fires on HSK2/HSK3 where `radicals`
// and `mnemonic` are empty. `label` is the Arabic unit title.
//
// The Arabic channel is a WORD LIST, not a regex, and is matched on whole
// tokens after normalisation and clitic stripping. Substring matching over
// Arabic is unusable here: "يد" (hand) sits inside "جيد" (good) and "سعيد"
// (happy), "جد" (grandfather) inside "جداً" (very), and "ست" (six) inside
// "الاستفهام" (interrogative). All three produced wrong unit titles.
//
// Order matters only for tie-breaking: earlier entries win an exact tie.

// ── Arabic normalisation ────────────────────────────────────────────────────

const AR_LETTER = 'ء-ي'
const TASHKEEL = /[ً-ْٰـ]/g

function normAr(s) {
  return String(s || '')
    .replace(TASHKEEL, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
}

const PREFIXES = ['وال', 'بال', 'فال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ك', 'ل']
const SUFFIXES = ['اتها', 'ات', 'ون', 'ين', 'ان', 'ها', 'هم', 'كم', 'نا', 'ه', 'ي']

const tokenRe = new RegExp(`[^${AR_LETTER}]+`)

/** Every plausible stem of every Arabic token in `text`. */
function arStems(text) {
  const out = new Set()
  for (const raw of normAr(text).split(tokenRe)) {
    if (!raw) continue
    const bases = new Set([raw])
    for (const p of PREFIXES) {
      if (raw.startsWith(p) && raw.length - p.length >= 2) bases.add(raw.slice(p.length))
    }
    for (const b of bases) {
      out.add(b)
      for (const s of SUFFIXES) {
        if (b.endsWith(s) && b.length - s.length >= 2) out.add(b.slice(0, -s.length))
      }
    }
  }
  return out
}

// ── the lexicon ─────────────────────────────────────────────────────────────

/** @type {{key:string,label:string,zh?:RegExp,ar?:string[],en?:RegExp,arSet?:Set<string>}[]} */
const TOPICS = [
  {
    key: 'greeting',
    label: 'التحيّة والتعارف',
    zh: /你好|您好|再见|谢谢|不客气|对不起|没关系|欢迎|请问|喂|认识|介绍|同学|名字|高兴|客气/,
    ar: ['مرحبا', 'اهلا', 'وداعا', 'شكرا', 'العفو', 'اسف', 'الو', 'يعرف', 'يتعرف', 'يقدم', 'زميل', 'اسم', 'تحيه', 'سلام'],
    en: /\b(hello|hi|goodbye|bye|thanks?|thank you|sorry|welcome|greet|introduce|classmate|name)\b/i,
  },
  {
    key: 'numbers',
    label: 'الأعداد والحساب',
    zh: /^(?:[零一二三四五六七八九十百千万两]+|多少|几|半|一半|第.|.+倍)$/,
    ar: ['صفر', 'واحد', 'اثنان', 'اثنين', 'ثلاثه', 'اربعه', 'خمسه', 'سته', 'سبعه', 'ثمانيه', 'تسعه', 'عشره', 'عشرون', 'مئه', 'مائه', 'الف', 'رقم', 'عدد', 'اعداد', 'نصف', 'ضعف', 'كم', 'عداد', 'ترتيبيه'],
    en: /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|number|numeral|how many|half)\b/i,
  },
  {
    key: 'time',
    label: 'الوقت والتاريخ',
    zh: /年|月|日|号|点|分钟|星期|今天|明天|昨天|早上|上午|中午|下午|晚上|现在|时候|小时|周末|以前|以后|最近|刚才|将来|季节|春|夏|秋|冬/,
    ar: ['سنه', 'عام', 'شهر', 'يوم', 'ساعه', 'دقيقه', 'اسبوع', 'اليوم', 'غدا', 'امس', 'صباح', 'ظهر', 'عصر', 'مساء', 'ليل', 'الان', 'وقت', 'زمن', 'قبل', 'بعد', 'موسم', 'ربيع', 'صيف', 'خريف', 'شتاء', 'تاريخ', 'مبكرا', 'متاخرا'],
    en: /\b(year|month|day|hour|minute|week|weekend|today|tomorrow|yesterday|morning|noon|afternoon|evening|night|now|time|season|spring|summer|autumn|winter|early|late)\b/i,
  },
  {
    key: 'family',
    label: 'الأسرة والأقارب',
    zh: /爸|妈|哥|姐|弟|妹|儿子|女儿|家人|爱人|妻|丈夫|奶奶|爷爷|叔|阿姨|孩子/,
    ar: ['اب', 'ام', 'والد', 'والده', 'اخ', 'اخت', 'ابن', 'ابنه', 'زوج', 'زوجه', 'جد', 'جده', 'عم', 'خال', 'طفل', 'اطفال', 'اسره', 'عائله', 'اقارب', 'ابناء'],
    en: /\b(father|mother|dad|mom|brother|sister|son|daughter|husband|wife|family|child|children|parents|grandfather|grandmother)\b/i,
  },
  {
    key: 'food',
    label: 'الطعام والشراب',
    zh: /米饭|面条|水果|苹果|香蕉|鸡蛋|咖啡|啤酒|餐厅|厨房|菜单|饮料|筷子|^(?:吃|喝|饭|菜|茶|肉|鱼|汤|饿|渴|饱|甜|辣|盐|糖|吃饭|好吃)$/,
    ar: ['ياكل', 'يشرب', 'طعام', 'اكل', 'شراب', 'مشروب', 'ارز', 'خبز', 'شاي', 'فاكهه', 'تفاح', 'موز', 'بيض', 'لحم', 'سمك', 'حساء', 'قهوه', 'جوع', 'جائع', 'عطشان', 'مطعم', 'طبخ', 'حلو', 'ملح', 'سكر', 'وجبه', 'دجاج', 'شوربه', 'عيدان'],
    en: /\b(eat|drink|food|meal|rice|noodles?|tea|fruit|apple|banana|egg|meat|fish|soup|coffee|beer|hungry|thirsty|restaurant|cook|sweet|salt|sugar|chicken|menu|chopsticks)\b/i,
  },
  {
    key: 'study',
    label: 'الدراسة والمدرسة',
    zh: /学生|老师|学校|教室|上课|下课|课本|念书|读书|写字|学习|汉语|中文|考试|练习|作业|铅笔|同学|大学|留学|成绩|复习/,
    ar: ['طالب', 'طلاب', 'معلم', 'استاذ', 'استاذه', 'مدرسه', 'فصل', 'درس', 'دروس', 'كتاب', 'يكتب', 'يقرا', 'يدرس', 'يتعلم', 'الصينيه', 'امتحان', 'تمرين', 'واجب', 'قلم', 'جامعه', 'حرف', 'مراجعه', 'يعلم', 'صف', 'قاعه'],
    en: /\b(student|teacher|school|classroom|book|write|read|study|learn|chinese|exam|test|exercise|homework|pen|pencil|university|college|character|review|teach|lesson)\b/i,
  },
  {
    key: 'place',
    label: 'الأماكن والاتجاهات',
    zh: /上边|下边|里边|外边|前边|后边|左|右|旁边|中间|这儿|那儿|哪儿|医院|商店|银行|饭馆|宾馆|机场|车站|房间|厕所|图书馆|公园|地方|附近|楼/,
    ar: ['فوق', 'تحت', 'داخل', 'خارج', 'امام', 'خلف', 'يسار', 'يمين', 'بجانب', 'وسط', 'هنا', 'هناك', 'اين', 'مستشفي', 'متجر', 'بنك', 'مطعم', 'فندق', 'مطار', 'محطه', 'غرفه', 'حمام', 'مكتبه', 'حديقه', 'مكان', 'قريب', 'بعيد', 'طابق', 'شارع', 'مدينه'],
    en: /\b(above|below|inside|outside|front|behind|left|right|beside|middle|here|there|where|hospital|shop|store|bank|hotel|airport|station|room|toilet|library|park|place|near|far|floor|street|city)\b/i,
  },
  {
    key: 'travel',
    label: 'السفر والتنقّل',
    zh: /飞机|火车|出租车|公交车|自行车|旅游|旅行|地图|开车|骑车|车站|机票|行李|护照|上车|下车/,
    ar: ['يمشي', 'يذهب', 'ياتي', 'يعود', 'يركب', 'طائره', 'قطار', 'سياره', 'دراجه', 'طريق', 'تذكره', 'سفر', 'سياحه', 'خريطه', 'يقود', 'يصل', 'يغادر', 'حقيبه', 'جواز', 'امتعه', 'رحله', 'حافله'],
    en: /\b(walk|go|come|return|ride|plane|train|taxi|bus|car|bicycle|road|ticket|travel|trip|map|drive|arrive|leave|luggage|passport|suitcase)\b/i,
  },
  {
    key: 'shopping',
    label: 'التسوّق والمال',
    zh: /买|卖|钱|块钱|便宜|商店|超市|价钱|付钱|生意|市场/,
    ar: ['يشتري', 'يبيع', 'مال', 'نقود', 'ثمن', 'سعر', 'غالي', 'رخيص', 'متجر', 'سوق', 'يدفع', 'يستاجر', 'تجاره', 'شراء'],
    en: /\b(buy|sell|money|price|expensive|cheap|shop|supermarket|market|pay|rent|business)\b/i,
  },
  {
    key: 'body',
    label: 'الجسد والصحة',
    zh: /医生|医院|生病|吃药|眼睛|耳朵|鼻子|嘴|头发|身体|累|疼|健康|锻炼|感冒|发烧|休息|身高/,
    ar: ['طبيب', 'مستشفي', 'مرض', 'مريض', 'دواء', 'عين', 'اذن', 'انف', 'فم', 'راس', 'يد', 'قدم', 'جسم', 'تعب', 'الم', 'صحه', 'رياضه', 'زكام', 'حمي', 'يستريح', 'شعر', 'طول'],
    en: /\b(doctor|hospital|ill|sick|medicine|eye|ear|nose|mouth|head|hair|hand|foot|body|tired|pain|health|cold|fever|rest|height)\b/i,
  },
  {
    key: 'weather',
    label: 'الطقس والطبيعة',
    zh: /天气|下雨|下雪|刮风|太阳|月亮|阴天|晴天|气温|环境|空气|^(?:冷|热|云|山|河|树|花|草|风|雨|雪)$/,
    ar: ['طقس', 'بارد', 'حار', 'مطر', 'ثلج', 'رياح', 'سحاب', 'شمس', 'قمر', 'جبل', 'نهر', 'شجره', 'زهره', 'عشب', 'غائم', 'مشمس', 'حراره', 'بيئه', 'هواء'],
    en: /\b(weather|cold|hot|rain|snow|wind|cloud|sun|moon|mountain|river|tree|flower|grass|cloudy|sunny|temperature|environment|air)\b/i,
  },
  {
    key: 'work',
    label: 'العمل والمهن',
    zh: /工作|公司|经理|服务员|上班|下班|会议|同事|办公室|职业/,
    ar: ['عمل', 'وظيفه', 'شركه', 'مدير', 'نادل', 'اجتماع', 'مكتب', 'مهنه', 'مشغول', 'موظف', 'خدمه', 'يخدم'],
    en: /\b(work|job|company|manager|waiter|meeting|office|profession|busy|employee|service|serve)\b/i,
  },
  {
    key: 'things',
    label: 'الأشياء والملابس',
    zh: /衣服|裤子|鞋|帽子|东西|手机|电脑|桌子|椅子|杯子|电视|电话|包|门|窗户|手表|照片|礼物|盘子|碗/,
    ar: ['ملابس', 'قميص', 'بنطال', 'حذاء', 'قبعه', 'شيء', 'اشياء', 'هاتف', 'حاسوب', 'طاوله', 'كرسي', 'كوب', 'تلفاز', 'حقيبه', 'باب', 'نافذه', 'صوره', 'هديه', 'طبق', 'صحن'],
    en: /\b(clothes|shirt|trousers|shoes|hat|thing|things|phone|computer|table|chair|cup|television|bag|door|window|watch|photo|gift|plate|bowl)\b/i,
  },
  {
    key: 'people',
    label: 'الناس والعلاقات',
    zh: /朋友|先生|小姐|帮助|一起|大家|自己|别人|关系|结婚/,
    ar: ['صديق', 'اصدقاء', 'شخص', 'ناس', 'سيد', 'انسه', 'يساعد', 'معا', 'الجميع', 'نفسه', 'اخرون', 'علاقه', 'زواج', 'يحب', 'مساعده'],
    en: /\b(friend|person|people|mister|miss|help|together|everyone|self|others|relationship|marry|love)\b/i,
  },
  {
    key: 'speech',
    label: 'الكلام والتواصل',
    zh: /说话|回答|告诉|意思|明白|语言|写信|电子邮件|聊天|^(?:问|叫|听|说|懂|信)$/,
    ar: ['يقول', 'كلام', 'يسال', 'يجيب', 'يخبر', 'يدعي', 'يستمع', 'معني', 'يفهم', 'لغه', 'رساله', 'بريد', 'سؤال', 'جواب', 'حديث'],
    en: /\b(say|speak|talk|ask|answer|reply|tell|call|listen|meaning|understand|language|letter|email|chat)\b/i,
  },
  {
    key: 'feeling',
    label: 'المشاعر والصفات',
    zh: /高兴|快乐|难过|生气|喜欢|希望|担心|奇怪|有意思|重要|简单|容易|漂亮|好看|热情/,
    ar: ['سعيد', 'فرح', 'حزين', 'غاضب', 'جيد', 'رائع', 'يحب', 'يامل', 'قلق', 'غريب', 'ممتع', 'مهم', 'بسيط', 'صعب', 'سهل', 'جميل', 'مريح', 'شعور', 'خائف'],
    en: /\b(happy|glad|sad|angry|like|hope|worry|strange|interesting|important|simple|difficult|easy|beautiful|comfortable|feel|feeling|afraid)\b/i,
  },
  {
    key: 'size',
    label: 'الوصف والمقارنة',
    zh: /^(?:大|小|多|少|高|矮|长|短|快|慢|新|旧|胖|瘦|贵|重|轻|很多|很少|多么)$/,
    ar: ['كبير', 'صغير', 'كثير', 'قليل', 'طويل', 'قصير', 'سريع', 'بطيء', 'جديد', 'قديم', 'سمين', 'نحيف', 'ثقيل', 'خفيف', 'عالي', 'منخفض', 'اكثر', 'اقل'],
    en: /\b(big|large|small|many|much|few|tall|long|short|fast|slow|new|old|fat|thin|heavy|light|high|low|more|less)\b/i,
  },
  {
    key: 'home',
    label: 'البيت والحياة اليومية',
    zh: /睡觉|起床|做饭|打扫|开门|关门|帮忙|家里|^(?:住|洗|穿|找|放|拿|用|不用|使用)$/,
    ar: ['بيت', 'منزل', 'يسكن', 'ينام', 'يستيقظ', 'يغسل', 'يطبخ', 'ينظف', 'يلبس', 'يفتح', 'يغلق', 'يبحث', 'يضع', 'ياخذ', 'يستعمل', 'يستخدم'],
    en: /\b(home|house|live|sleep|get up|wash|cook|clean|wear|open|close|find|put|take|use)\b/i,
  },
  {
    key: 'leisure',
    label: 'الترفيه والرياضة',
    zh: /运动|跑步|游泳|踢足球|打球|唱歌|跳舞|音乐|电影|看电视|爱好|游戏|画画|^(?:玩|画)$/,
    ar: ['يلعب', 'رياضه', 'يجري', 'يسبح', 'كره', 'يغني', 'يرقص', 'موسيقي', 'فيلم', 'هوايه', 'لعبه', 'يرسم'],
    en: /\b(play|sport|run|swim|football|ball|sing|dance|music|film|movie|hobby|game|draw)\b/i,
  },
]

// pre-normalise the Arabic word lists once
for (const t of TOPICS) if (t.ar) t.arSet = new Set(t.ar.map(normAr))

/** Fallback labels when no topic reaches the threshold — keyed on `pos`. */
const POS_LABEL = {
  verb: 'أفعال يومية',
  noun: 'أسماء وأشياء',
  adjective: 'صفات ووصف',
  adverb: 'ظروف وأدوات تأكيد',
  pronoun: 'ضمائر وإشارة',
  numeral: 'الأعداد والحساب',
  measure: 'كلمات العدّ',
  particle: 'أدوات ووظائف',
  conjunction: 'أدوات الربط',
  preposition: 'حروف الجرّ',
  modal: 'أفعال القدرة والرغبة',
  fixed: 'تعابير ثابتة',
}

const DEFAULT_LABEL = 'كلمات الدرس'

/** Topic keys a word matches. */
function topicsOf(word) {
  const zh = word.zh || ''
  const en = word.english || ''
  const stems = arStems(word.meaning || '')
  const hits = []
  for (const t of TOPICS) {
    if (t.zh && t.zh.test(zh)) {
      hits.push(t.key)
      continue
    }
    let viaAr = false
    if (t.arSet) {
      for (const s of stems) {
        if (t.arSet.has(s)) {
          viaAr = true
          break
        }
      }
    }
    if (viaAr) {
      hits.push(t.key)
      continue
    }
    if (t.en && t.en.test(en)) hits.push(t.key)
  }
  return hits
}

/**
 * Arabic topic labels for a group of words, strongest first. Only topics that
 * cover at least two words and `threshold` of the group are returned, so a
 * single stray match can never name a unit.
 */
function rankedLabels(words, threshold = 0.35) {
  const count = new Map()
  for (const w of words) for (const k of topicsOf(w)) count.set(k, (count.get(k) || 0) + 1)
  return TOPICS.map((t, order) => ({ t, order, n: count.get(t.key) || 0 }))
    .filter((x) => x.n >= 2 && x.n / words.length >= threshold)
    .sort((a, b) => b.n - a.n || a.order - b.order)
    .map((x) => x.t.label)
}

/** The winning Arabic label for a group of words, or null when none is strong. */
function labelFor(words, threshold = 0.35) {
  return rankedLabels(words, threshold)[0] || null
}

/** Label from the dominant part of speech. */
function posLabelFor(words) {
  const count = new Map()
  for (const w of words) count.set(w.pos, (count.get(w.pos) || 0) + 1)
  let best = null
  let bestN = 0
  for (const [pos, n] of count) {
    if (n > bestN || (n === bestN && best && pos < best)) {
      bestN = n
      best = pos
    }
  }
  return POS_LABEL[best] || DEFAULT_LABEL
}

module.exports = {
  TOPICS,
  POS_LABEL,
  DEFAULT_LABEL,
  normAr,
  arStems,
  topicsOf,
  labelFor,
  rankedLabels,
  posLabelFor,
}
