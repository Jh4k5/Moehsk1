import 'server-only'

// ─── الطبقة الثانية: النموذج اللغوي ─────────────────────────────────────────
//
// كل ما يخصّ Anthropic محبوس في هذا الملف. المسار لا يعرف اسم النموذج ولا
// شكل الطلب، ويعرف شيئاً واحداً: إما نصّ جواب، وإما سبب فشل — ولا استثناء
// يخرج من هنا أبداً. استدعاء نموذج فاشل يجب أن يهبط بالمعلّم إلى محرك القواعد،
// لا أن يُسقط المسار على الطالب برمز 500.
//
// المفتاح: ANTHROPIC_API_KEY. غيابه ليس عطلاً — إنما ميزة غير مهيأة، وهي
// الحالة الافتراضية لمن يشغّل المنصة قبل أن يشتري رصيداً.

import Anthropic from '@anthropic-ai/sdk'
import { tutorSystemPrompt, buildUserMessage } from './prompt'

/**
 * النموذج ورصيده.
 *
 * أسئلة الطالب قصيرة وأجوبتها أقصر: شرح مبتدئ في ستة أسطر. لذلك سقف مخرجات
 * صغير و`effort: 'low'` — الجهد العالي هنا يشتري تكلفة لا جودة.
 */
const MODEL = 'claude-opus-5'
const MAX_TOKENS = 900

export type TutorModelFailure =
  /** لا مفتاح: الميزة غير مهيأة على هذا الخادم. */
  | 'not-configured'
  /** رفض النموذج الإجابة لأسباب سياسة. */
  | 'refused'
  /** عطل شبكة أو حصّة أو خطأ من الواجهة. */
  | 'unavailable'
  /** رد فارغ لا نص فيه. */
  | 'empty'

export interface TutorModelResult {
  ok: boolean
  text: string | null
  failure: TutorModelFailure | null
  /** للّوج والتقارير فقط، لا يُعرض للطالب. */
  usage: { inputTokens: number; outputTokens: number } | null
}

/** هل يملك هذا الخادم مفتاحاً أصلاً؟ يُقرأ عند كل نداء: لا تخزين لحالة سرّية. */
export function isModelConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim())
}

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

export interface AskModelInput {
  question: string
  level: number
  /** حقائق المنهج من محرك القواعد — تمنع النموذج من مخالفة ما يدرسه الطالب. */
  grounding: string
}

/** سؤال واحد، جواب واحد. بلا محادثة سابقة: كل نداء مستقل ومحدود التكلفة. */
export async function askModel(input: AskModelInput): Promise<TutorModelResult> {
  if (!isModelConfigured()) {
    return { ok: false, text: null, failure: 'not-configured', usage: null }
  }

  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: 'low' },
      system: tutorSystemPrompt(input.level),
      messages: [{ role: 'user', content: buildUserMessage(input.question, input.grounding) }],
      // الاحتياط الخادمي عند رفض السياسة: يُعاد الطلب على نموذج بديل داخل
      // النداء نفسه بدل أن يعود الطالب بلا شيء.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    })

    const usage = {
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    }

    if (response.stop_reason === 'refusal') {
      return { ok: false, text: null, failure: 'refused', usage }
    }

    const text = response.content
      .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()

    if (!text) return { ok: false, text: null, failure: 'empty', usage }
    return { ok: true, text, failure: null, usage }
  } catch (err) {
    // لا تمييز بين أنواع الأعطال في الرسالة المعروضة: الطالب يرى تنبيهاً واحداً
    // وجواب محرك القواعد، والتفصيل يبقى في لوج الخادم.
    console.error('[tutor] model call failed:', (err as Error).message)
    return { ok: false, text: null, failure: 'unavailable', usage: null }
  }
}
