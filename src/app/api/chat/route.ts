import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `أنت مدرس صيني متخصص في HSK 1 للناطقين بالعربية.
اسمك: 老师 (lǎoshī)

قواعد صارمة:
1. أجب دائماً بالعربية مع إدراج الصيني والبينيين عند الحاجة
2. لا تخرج عن نطاق مفردات HSK 1 (410 كلمة)
3. عند سؤال نحوي: اشرح القاعدة + مثال + تمرين فوري
4. عند سؤال عن نطق: اشرح النبرة الصحيحة مع وصف صوتي
5. عند خطأ الطالب: صحح بلطف + اشرح السبب + أعطِ مثالاً آخر
6. لا تولد أسئلة عشوائية — انتظر سؤال الطالب
7. اقترح دائماً خطوة عملية: "جرب أن تقول..."
8. استخدم تنسيق واضح مع نقاط مرقمة وأمثلة
9. إذا سأل عن كلمة خارج HSK 1، قل "هذه الكلمة ليست في مستوى HSK 1، لكن..."`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    // Build context message
    const contextMsg = context
      ? `\n\nسياق المستخدم:\n- الدرس الحالي: ${context.currentLesson || 'غير محدد'}\n- الكلمات المتعلمة: ${context.learnedCount || 0}\n- الكلمات الضعيفة: ${context.weakWords?.join(', ') || 'لا يوجد'}`
      : '';

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT + contextMsg },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    // Use the LLM from z-ai-web-dev-sdk
    const { LLM } = await import('z-ai-web-dev-sdk');

    const response = await LLM.chat({
      model: 'glm-4-flash',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      message:
        response.choices?.[0]?.message?.content ||
        'عذراً، حدث خطأ. حاول مرة أخرى.',
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);

    // Fallback to smart pre-built responses
    const { messages } = await req.json().catch(() => ({ messages: [] }));
    const lastMsg = messages?.[messages.length - 1]?.content || '';

    const fallbackResponse = generateFallbackResponse(lastMsg);

    return NextResponse.json({ message: fallbackResponse });
  }
}

function generateFallbackResponse(message: string): string {
  const msg = message.toLowerCase();

  if (
    msg.includes('مرحبا') ||
    msg.includes('أهلا') ||
    msg.includes('هلا')
  ) {
    return '你好! 👋 مرحباً بك!\n\nأنا معلمك الصيني 老师. كيف يمكنني مساعدتك اليوم؟\n\nيمكنك سؤالي عن:\n• 📝 مفردات الصينية\n• 📖 القواعد النحوية\n• 🗣️ النطق والنبرات\n• ✏️ تصحيح الجمل\n\nجرب أن تسألني!';
  }

  if (
    msg.includes('نطق') ||
    msg.includes('بينيين') ||
    msg.includes('pinyin')
  ) {
    return '🗣️ **دليل النطق الصيني**\n\nالصينية لديها 4 نبرات رئيسية + نبرة محايدة:\n\n1️⃣ **النبرة الأولى** (─): مستوية عالية — مثل "mā" (أم)\n2️⃣ **النبرة الثانية** (↗): صاعدة — مثل "má" (قنب)\n3️⃣ **النبرة الثالثة** (↘↗): هابطة ثم صاعدة — مثل "mǎ" (حصان)\n4️⃣ **النبرة الرابعة** (↘): هابطة حادة — مثل "mà" (يشتم)\n\n💡 **نصيحة**: النبرة تغيّر المعنى تماماً! "mā" (أم) ≠ "mǎ" (حصان) ≠ "mà" (يشتم)\n\nجرب أن تقول: nǐ hǎo (مرحباً) مع الانتباه للنبرة الثالثة على "nǐ" والنبرة الثالثة على "hǎo"';
  }

  if (
    msg.includes('شكرا') ||
    msg.includes('شكراً') ||
    msg.includes('ممتاز')
  ) {
    return '不客气! 😊 (العفو!)\n\nاستمر في التعلم، أنت تتقدم بشكل رائع!\n\nهل تريد:\n• تعلم كلمات جديدة؟\n• التدرب على النطق؟\n• مراجعة القواعد؟';
  }

  return '💡 **كيف يمكنني مساعدتك؟**\n\nيمكنك سؤالي عن:\n\n📝 **المفردات**: "ما معنى كلمة 吃؟"\n📖 **القواعد**: "كيف أسأل في الصينية؟"\n🗣️ **النطق**: "كيف أنطق 你好؟"\n✏️ **التصحيح**: "صحح هذه الجملة: 我是学生"\n📊 **المراجعة**: "ما هي الكلمات التي يجب أن أراجعها؟"\n\nجرب أن تسألني سؤالاً محدداً! 🚀';
}
