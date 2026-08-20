import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { checkEntitlement } from '@/lib/entitlement'
import { getAppConfig } from '@/lib/config/server'
import { answerMessage, collectGrounding } from '@/lib/tutor/engine'
import { getTutorLevelData } from '@/lib/tutor/levelData'
import { groundingBlock } from '@/lib/tutor/prompt'
import { askModel, isModelConfigured } from '@/lib/tutor/model'
import {
  MODEL_FAILED_NOTICE,
  MODEL_UNCONFIGURED_NOTICE,
  USAGE_UNAVAILABLE_REFUSAL,
  dailyLimitRefusal,
  refuseTutorModel,
} from '@/lib/tutor/access'
import { consumeTutorCredit, peekTutorUsage, recordModelCall, refundTutorCredit } from '@/lib/tutor/usage'

// ─── POST /api/tutor ────────────────────────────────────────────────────────
//
// معلّم بمستويين، وترتيبهما هو الفكرة كلها:
//
//   ١. محرك القواعد أولاً، على الخادم، دائماً. يجيب من مفردات المنصة وقواعدها
//      بلا تكلفة ولا مفتاح ولا حساب. المتكرر — معنى كلمة، نبرة، قاعدة، مثال —
//      يُجاب هنا وينتهي.
//   ٢. النموذج اللغوي حين يعلن المحرك عجزه فقط (`resolved === false`)، وحينها
//      يمرّ الطلب على سلّم الرفض: موقوف → غير مسجّل → غير مشترك → تجاوز الحد.
//
// لماذا يعيد الخادم تشغيل المحرك بدل أن يصدّق العميل؟ لأن «المحرك عجز» ادّعاء
// يكلّف مالاً. لو صدّقناه لصار أي متصفح قادراً على استنزاف الرصيد بادّعائه في
// كل رسالة. الادّعاء يُعاد حسابه هنا من النص وحده.
//
// وحساب الاستهلاك لا يُقرأ من العميل إطلاقاً: يُحجز ذرّياً في قاعدة البيانات
// باسم المستخدم الذي أثبتته الجلسة (انظر ./usage.ts و 0010_tutor.sql).

export const runtime = 'nodejs'

/** أقصى طول سؤال. أطول من هذا ليس سؤال طالب مبتدئ، وهو تكلفة مدخلات بلا فائدة. */
const MAX_QUESTION_CHARS = 600

type Tier = 'rules' | 'model'

interface TutorResponseBody {
  ok: boolean
  /** أي طبقة أجابت فعلاً — تُعرض للطالب كي يعرف ما يستهلكه. */
  tier: Tier
  text: string
  followUps?: string[]
  /** سبب عجز محرك القواعد، إن عجز. */
  gap?: string | null
  /** رصيد اليوم بعد هذا الطلب، أو null إن لم يُستدعَ النموذج. */
  usage?: { used: number; limit: number; remaining: number } | null
  /** تنبيه صادق يُعرض تحت الجواب (مفتاح ناقص، عطل، رفض…). */
  notice?: string
  /** رمز الرفض حين يكون هناك رفض. */
  code?: string
}

function readBody(raw: unknown): { message: string; level: number; lang: 'ar' | 'en' } | null {
  if (!raw || typeof raw !== 'object') return null
  const body = raw as Record<string, unknown>
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return null
  return {
    message: message.slice(0, MAX_QUESTION_CHARS),
    level: Number(body.level) || 1,
    lang: body.lang === 'en' ? 'en' : 'ar',
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'اكتب سؤالك أولاً.' }, { status: 400 })
  }

  const body = readBody(payload)
  if (!body) {
    return NextResponse.json({ ok: false, error: 'اكتب سؤالك أولاً.' }, { status: 400 })
  }

  // ── الطبقة الأولى: محرك القواعد ──────────────────────────────────────────
  // بلا تقدّم الطالب: ذاك يعيش في متصفحه، والمطلوب هنا حكم واحد — هل يستطيع
  // المحرك الإجابة من المحتوى نفسه؟
  const levelData = getTutorLevelData(body.level)
  const rules = answerMessage(body.message, {
    learnedWordIds: [],
    weakWords: [],
    dueCount: 0,
    masteredCount: 0,
    dailyStreak: 0,
    dailyGoal: 0,
    pendingQuiz: null,
    level: levelData.level,
    lang: body.lang,
    vocabulary: levelData.vocabulary,
    grammarRules: levelData.grammarRules,
    grammarPractice: levelData.grammarPractice,
  })

  const rulesBody: TutorResponseBody = {
    ok: true,
    tier: 'rules',
    text: rules.text,
    followUps: rules.followUps,
    gap: rules.gap ?? null,
    usage: null,
  }

  if (rules.resolved !== false) {
    // أجاب المحرك: لا حساب، لا اشتراك، لا تكلفة. ينتهي الطلب هنا.
    return NextResponse.json(rulesBody)
  }

  // ── سلّم الرفض قبل أي إنفاق ──────────────────────────────────────────────
  const config = await getAppConfig()
  const user = await getCurrentUser()
  const entitlement = user ? await checkEntitlement(user.id) : null

  const refusal = refuseTutorModel({
    tutorEnabled: config.features.tutorEnabled,
    dailyLimit: config.features.tutorDailyLimit,
    signedIn: Boolean(user),
    isEntitled: Boolean(entitlement?.isEntitled),
  })
  if (refusal) {
    // الرفض يخصّ النموذج وحده: جواب المحرك (ولو كان اعتذاراً) يمضي مع الرفض،
    // فلا يخرج الطالب صفر اليدين لأنه غير مشترك.
    return NextResponse.json(
      { ...rulesBody, ok: false, code: refusal.code, notice: refusal.messageAr },
      { status: refusal.status },
    )
  }

  // ── لا مفتاح: هبوط معلن إلى محرك القواعد وحده، لا خطأ ────────────────────
  if (!isModelConfigured()) {
    return NextResponse.json({ ...rulesBody, notice: MODEL_UNCONFIGURED_NOTICE })
  }

  // ── الحد اليومي: حجز ذرّي قبل الاستدعاء ──────────────────────────────────
  const limit = config.features.tutorDailyLimit
  const reserved = await consumeTutorCredit(user!.id, limit)
  if (!reserved) {
    // تعذّر العدّ. نرفض بدل أن نستدعي: نداء بلا عدّاد تكلفة بلا سقف.
    return NextResponse.json(
      { ...rulesBody, ok: false, code: USAGE_UNAVAILABLE_REFUSAL.code, notice: USAGE_UNAVAILABLE_REFUSAL.messageAr },
      { status: USAGE_UNAVAILABLE_REFUSAL.status },
    )
  }
  if (!reserved.allowed) {
    const limitRefusal = dailyLimitRefusal(reserved.limit)
    return NextResponse.json(
      {
        ...rulesBody,
        ok: false,
        code: limitRefusal.code,
        notice: limitRefusal.messageAr,
        usage: { used: reserved.used, limit: reserved.limit, remaining: 0 },
      },
      { status: limitRefusal.status },
    )
  }

  // ── الطبقة الثانية ───────────────────────────────────────────────────────
  const grounding = collectGrounding(body.message, {
    level: levelData.level,
    lang: body.lang,
    vocabulary: levelData.vocabulary,
    grammarRules: levelData.grammarRules,
    grammarPractice: levelData.grammarPractice,
  })

  const answer = await askModel({
    question: body.message,
    level: levelData.level,
    grounding: groundingBlock(grounding.words, grounding.rule),
  })

  if (!answer.ok || !answer.text) {
    // عطل عندنا لا يُخصم من الطالب.
    await refundTutorCredit(user!.id, reserved.source)
    return NextResponse.json({
      ...rulesBody,
      notice: MODEL_FAILED_NOTICE,
      usage: { used: Math.max(reserved.used - 1, 0), limit: reserved.limit, remaining: reserved.remaining + 1 },
    })
  }

  await recordModelCall(user!.id, {
    level: levelData.level,
    gap: rules.gap ?? null,
    question_chars: body.message.length,
    input_tokens: answer.usage?.inputTokens ?? null,
    output_tokens: answer.usage?.outputTokens ?? null,
  })

  return NextResponse.json({
    ok: true,
    tier: 'model',
    text: answer.text,
    followUps: rules.followUps,
    gap: rules.gap ?? null,
    usage: { used: reserved.used, limit: reserved.limit, remaining: reserved.remaining },
  } satisfies TutorResponseBody)
}

// ─── GET /api/tutor ─────────────────────────────────────────────────────────
// حالة المعلّم للواجهة: هل الطبقة الثانية متاحة لهذا الزائر، وكم بقي له اليوم؟
// لا تحجز شيئاً ولا تستدعي النموذج.

export async function GET() {
  const config = await getAppConfig()
  const user = await getCurrentUser()
  const entitlement = user ? await checkEntitlement(user.id) : null

  const refusal = refuseTutorModel({
    tutorEnabled: config.features.tutorEnabled,
    dailyLimit: config.features.tutorDailyLimit,
    signedIn: Boolean(user),
    isEntitled: Boolean(entitlement?.isEntitled),
  })

  const usage =
    user && !refusal ? await peekTutorUsage(user.id, config.features.tutorDailyLimit) : null

  return NextResponse.json({
    ok: true,
    tutorEnabled: config.features.tutorEnabled,
    signedIn: Boolean(user),
    isSubscriber: Boolean(entitlement?.isEntitled),
    modelConfigured: isModelConfigured(),
    limit: config.features.tutorDailyLimit,
    used: usage?.used ?? null,
    remaining: usage?.remaining ?? null,
    code: refusal?.code ?? null,
    notice: refusal
      ? refusal.messageAr
      : isModelConfigured()
        ? null
        : MODEL_UNCONFIGURED_NOTICE,
  })
}
