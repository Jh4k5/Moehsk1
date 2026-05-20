import { vocabulary } from '@/data/vocabulary'
import { categories } from '@/data/content'

// ─── TTS Helper ─────────────────────────────────────────────
export const speak = (text: string, lang = 'zh-CN') => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.8
    window.speechSynthesis.speak(u)
  }
}

// ─── Smart Chat Responses ────────────────────────────────────
export function getChatResponse(message: string): string {
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
    return '📐 القواعد الأساسية في HSK 1:\n\n• **ترتيب الجملة**: فاعل + فعل + مفعول (مثل العربية)\n• **是 (shì)**: للتعريف بالهوية — 我是学生\n• **有 (yǒu)**: للملكية — 我有一本书\n• **不 (bù)**: نفي الحاضر، **没 (méi)**: نفي الماضي\n• **吗 (ma)**: لتحويل الجملة لسؤال — 你好吗؟\n\n💡 جرّب قسم "القواعد" للاطلاع على جميع القواعد مع أمثلة!'
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
export function buildAllSentences(): { zh: string; pinyin: string; ar: string; wordZh: string }[] {
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

export const allSentences = buildAllSentences()
