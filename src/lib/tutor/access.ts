// ─── سلّم الرفض للطبقة الثانية (النموذج اللغوي) ─────────────────────────────
//
// دالة نقيّة بلا قاعدة بيانات ولا شبكة: تأخذ الحقائق التي حسمها المسار، وتعيد
// الرفض الأول المنطبق. سببان لعزلها هنا:
//
//   1. الترتيب نفسه هو السياسة: معطّل → غير مسجّل → غير مشترك → تجاوز الحد.
//      ترتيبٌ مختلف يسرّب معلومة (مثلاً أن الميزة مفعّلة أصلاً) أو يعِد بما لا
//      يُعطى (يطلب اشتراكاً بينما الميزة موقوفة من لوحة التحكم).
//   2. يمكن اختبار السلّم كاملاً بلا خادم ولا مفتاح API.
//
// محرك القواعد لا يمرّ من هنا إطلاقاً: هو مجاني للجميع، ولذلك يحمل كل ردّ رفض
// نصَّ المحرك معه — لا يخرج الطالب صفر اليدين.

export type TutorRefusalCode =
  | 'tutor-disabled'
  | 'requires-sign-in'
  | 'requires-subscription'
  | 'daily-limit'
  | 'usage-unavailable'

export interface TutorRefusal {
  code: TutorRefusalCode
  /** رمز HTTP الموافق للسبب — لا 500 في أي منها: كلها قرارات لا أعطال. */
  status: number
  /** الرسالة كما يقرؤها الطالب. */
  messageAr: string
}

export interface TutorAccessFacts {
  /** features.tutorEnabled من app_config. */
  tutorEnabled: boolean
  /** features.tutorDailyLimit من app_config — صفر يعني «مغلق فعلياً». */
  dailyLimit: number
  signedIn: boolean
  isEntitled: boolean
}

/** أول رفض منطبق، أو null إن كان الطريق مفتوحاً حتى عدّاد الحد اليومي. */
export function refuseTutorModel(facts: TutorAccessFacts): TutorRefusal | null {
  if (!facts.tutorEnabled) {
    return {
      code: 'tutor-disabled',
      status: 503,
      messageAr: 'المعلّم الذكي موقوف مؤقتاً من لوحة التحكم. شرح الكلمات والقواعد يعمل هنا كالمعتاد.',
    }
  }
  if (!facts.signedIn) {
    return {
      code: 'requires-sign-in',
      status: 401,
      messageAr: 'سجّل الدخول ليجيبك المعلّم الذكي عن هذا السؤال. شرح الكلمات والقواعد يبقى متاحاً بلا حساب.',
    }
  }
  if (!facts.isEntitled) {
    return {
      code: 'requires-subscription',
      status: 403,
      messageAr: 'أسئلة المعلّم الذكي للمشتركين. الاشتراك يفتحها، ومحرك الشرح المجاني يبقى مفتوحاً لك دائماً.',
    }
  }
  // الحدّ صفر = الميزة مغلقة بالإعداد لا بالاستهلاك، فرسالتها رسالة الحدّ.
  if (facts.dailyLimit <= 0) return dailyLimitRefusal(0)
  return null
}

/** رفض تجاوز الحد اليومي — يُبنى بعد العدّاد لأن الرقم يأتي من الإعدادات. */
export function dailyLimitRefusal(limit: number): TutorRefusal {
  return {
    code: 'daily-limit',
    status: 429,
    messageAr:
      limit <= 0
        ? 'أسئلة المعلّم الذكي مغلقة حالياً (الحدّ اليومي مضبوط على صفر). محرك الشرح المجاني ما زال يجيبك.'
        : `بلغت حدّك اليومي: ${limit} ${limit === 1 ? 'سؤال' : 'أسئلة'} للمعلّم الذكي. يتجدّد غداً، وشرح الكلمات والقواعد بلا حدّ.`,
  }
}

/** تعذّر قراءة العدّاد. نرفض ولا نسمح: استدعاء بلا عدّاد تكلفة بلا سقف. */
export const USAGE_UNAVAILABLE_REFUSAL: TutorRefusal = {
  code: 'usage-unavailable',
  status: 503,
  messageAr: 'تعذّر التحقق من حدّك اليومي الآن، فلن أستدعي المعلّم الذكي. جرّب بعد قليل — والشرح المجاني يعمل.',
}

/** لا مفتاح API: الميزة غير مهيأة. ليست رفضاً — إنما تنبيه مع جواب القواعد. */
export const MODEL_UNCONFIGURED_NOTICE =
  'المعلّم الذكي غير مهيّأ على هذا الخادم بعد (لا مفتاح API)، فهذه إجابة محرك الشرح المجاني وحده.'

/** فشل الاستدعاء بعد حجز الرصيد — يُعاد الرصيد ويُخبَر الطالب بالحقيقة. */
export const MODEL_FAILED_NOTICE =
  'تعذّر الوصول إلى المعلّم الذكي الآن ولم يُحتسب السؤال من رصيدك. هذه إجابة محرك الشرح المجاني.'
