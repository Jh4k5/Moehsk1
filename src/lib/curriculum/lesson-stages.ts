// ─── [2.8] The shape of a lesson, as data ───────────────────────────────────
//
// A lesson runs through eight stages in one fixed pedagogical order, and the
// order is DATA here rather than control flow in a component. That is the whole
// requirement: «اجعل الترتيب بيانات قابلة للتهيئة (schema) لا شيفرة صلبة».
//
// Why it matters beyond tidiness. The platform's governing rule is «الشرح قبل
// التمرين» — nothing is asked of a learner that has not been taught. If the
// order lives in JSX, that rule is enforced by whoever last edited the screen,
// and it is unenforceable by a test. As data, it is checkable: `validateStages`
// below reads the same table the renderer reads, so a stream that drills a word
// before its explanation is a failing check, not a bad review someday.
//
// The eight stages, in the owner's own words:
//
//   ١ تمهيد        what we will learn and why
//   ٢ شرح          the rule and the new words, with worked examples
//   ٣ بينين ونطق   the sounds, the tones, and discrimination by ear
//   ٤ كتابة        the character's shape, stroke order and radical
//   ٥ قراءة/استماع  a short passage built only from what is now known
//   ٦ تمرين        drills on what was just taught
//   ٧ واجب         spaced review, after the lesson
//   ٨ اختبار الفصل  at the END OF A CHAPTER, not after every lesson
//
// Stage 8 is deliberately not per-lesson. An exam after every lesson trains
// recall of the last twenty minutes; an exam after a chapter is the only one
// that measures whether anything was retained.

import type { ActivityKind, ActivitySource } from './types'

export type StageId =
  | 'intro'
  | 'explanation'
  | 'pinyin'
  | 'writing'
  | 'reading'
  | 'practice'
  | 'homework'
  | 'chapter-exam'

/** Where a stage runs relative to the unit the learner opened. */
export type StageScope =
  /** Inside the unit session itself. */
  | 'unit'
  /** Queued for later — the learner leaves the session before meeting it. */
  | 'after-unit'
  /** Once per chapter, not per lesson. */
  | 'chapter'

export interface StageSpec {
  id: StageId
  /** Position in the lesson. Unique, and the only thing that orders stages. */
  order: number
  titleAr: string
  titleEn: string
  /** One line: what this stage is FOR. Shown to the learner, so both languages. */
  purposeAr: string
  purposeEn: string
  scope: StageScope
  /**
   * Activity kinds this stage may contain.
   *
   * An empty list means the stage carries no drill of its own — `intro` is
   * prose and `homework` is assembled from other stages' kinds at review time.
   */
  kinds: ActivityKind[]
  /**
   * Stages that MUST have been completed before this one may run.
   *
   * This is «الشرح قبل التمرين» written down. `practice` requires
   * `explanation`, so a stream that drills before it teaches is invalid by
   * construction rather than by opinion.
   */
  requires: StageId[]
  /** A lesson without this stage is incomplete. */
  required: boolean
}

export const LESSON_STAGES: readonly StageSpec[] = [
  {
    id: 'intro',
    order: 1,
    titleAr: 'تمهيد',
    titleEn: 'Warm-up',
    purposeAr: 'ماذا ستتعلّم في هذا الدرس، ولماذا يفيدك.',
    purposeEn: 'What this lesson teaches, and why it is worth your time.',
    scope: 'unit',
    kinds: [],
    requires: [],
    required: true,
  },
  {
    id: 'explanation',
    order: 2,
    titleAr: 'شرح',
    titleEn: 'Explanation',
    purposeAr: 'القاعدة والكلمات الجديدة، بأمثلة مشروحة قبل أي سؤال.',
    purposeEn: 'The rule and the new words, worked through before anything is asked.',
    scope: 'unit',
    kinds: ['explanation', 'word-intro', 'grammar-brief'],
    requires: ['intro'],
    required: true,
  },
  {
    id: 'pinyin',
    order: 3,
    titleAr: 'بينين ونطق',
    titleEn: 'Pinyin and pronunciation',
    purposeAr: 'الصوت والنبرة: تسمع الفرق قبل أن يُطلب منك إنتاجه.',
    purposeEn: 'Sound and tone: you hear the difference before you are asked to make it.',
    scope: 'unit',
    kinds: ['tone-discriminate', 'pinyin-match', 'pronounce'],
    requires: ['explanation'],
    required: true,
  },
  {
    id: 'writing',
    order: 4,
    titleAr: 'كتابة',
    titleEn: 'Writing',
    purposeAr: 'شكل الحرف وترتيب ضرباته وجذره — ثم تكتبه بنفسك.',
    purposeEn: "The character's shape, stroke order and radical — then you write it.",
    scope: 'unit',
    kinds: ['hanzi-write'],
    requires: ['explanation'],
    required: true,
  },
  {
    id: 'reading',
    order: 5,
    titleAr: 'قراءة واستماع',
    titleEn: 'Reading and listening',
    purposeAr: 'نصّ قصير لا يستعمل إلا ما تعرفه، مع أسئلة فهم.',
    purposeEn: 'A short passage using only what you already know, with comprehension questions.',
    scope: 'unit',
    kinds: ['story-excerpt', 'roleplay', 'daily-qa'],
    requires: ['explanation', 'pinyin'],
    required: true,
  },
  {
    id: 'practice',
    order: 6,
    titleAr: 'تمرين',
    titleEn: 'Practice',
    purposeAr: 'تطبيق على ما شُرح للتوّ — لا شيء هنا لم يُدرَّس.',
    purposeEn: 'Drills on what was just taught — nothing here is untaught.',
    scope: 'unit',
    kinds: [
      'word-recall',
      'grammar-apply',
      'sentence-order',
      'fill-blank',
      'translate',
      'image-match',
    ],
    requires: ['explanation'],
    required: true,
  },
  {
    id: 'homework',
    order: 7,
    titleAr: 'واجب',
    titleEn: 'Homework',
    purposeAr: 'مراجعة مباعدة بعد الدرس: كلمات اليوم وما يوشك أن يُنسى.',
    purposeEn: "Spaced review after the lesson: today's words and whatever is about to fade.",
    scope: 'after-unit',
    kinds: ['word-recall', 'translate', 'fill-blank'],
    requires: ['practice'],
    required: true,
  },
  {
    id: 'chapter-exam',
    order: 8,
    titleAr: 'اختبار الفصل',
    titleEn: 'Chapter test',
    purposeAr: 'في نهاية الفصل لا بعد كل درس — مجمّع، بزمن، وبتغذية راجعة تشرح.',
    purposeEn: 'At the end of a chapter, not after every lesson — cumulative, timed, and it explains.',
    scope: 'chapter',
    kinds: ['exam-style'],
    requires: ['homework'],
    required: false,
  },
] as const

// ── Derived lookups ─────────────────────────────────────────────────────────

export const STAGE_BY_ID: ReadonlyMap<StageId, StageSpec> = new Map(
  LESSON_STAGES.map((s) => [s.id, s]),
)

/** The stage an activity kind belongs to, or null for a kind no stage claims. */
const KIND_TO_STAGE = new Map<ActivityKind, StageId>()
for (const stage of LESSON_STAGES) {
  for (const kind of stage.kinds) {
    // First stage to claim a kind owns it. `word-recall` appears in both
    // `practice` and `homework`; inside a unit session it is practice, and
    // homework is assembled separately from the review queue.
    if (!KIND_TO_STAGE.has(kind)) KIND_TO_STAGE.set(kind, stage.id)
  }
}

export function stageOfKind(kind: ActivityKind): StageId | null {
  return KIND_TO_STAGE.get(kind) ?? null
}

/**
 * The stage an activity belongs to, taking its SOURCE into account.
 *
 * Kind alone is not enough for one case, and it is the case that matters most.
 * The engine presents two new words and then immediately asks for those two
 * back before moving on — a `word-recall` carrying `source: 'new'`. That recall
 * is not a drill in the stage-6 sense; it is the comprehension check that
 * closes a presentation, and the gap between meeting a word and needing it is
 * exactly why it sticks. Reading it as stage 6 would force the engine to move
 * every recall to the end of the session and throw that away in the name of
 * obeying the order.
 *
 * So: a recall of a word this unit has JUST introduced belongs to the
 * explanation stage. A recall sourced from practice, spaced review or
 * remediation belongs to practice, where it always did.
 */
export function stageOfActivity(kind: ActivityKind, source: ActivitySource): StageId | null {
  if (kind === 'word-recall' && source === 'new') return 'explanation'
  return stageOfKind(kind)
}

/**
 * A `game-break` belongs to NO stage, deliberately, and is listed in none of
 * the `kinds` arrays above.
 *
 * It is a breather placed by activity count, not a step in the lesson. When it
 * was filed under `practice` the validator read the first break — dropped in at
 * position 6, in the middle of the presentation — as the lesson reaching stage
 * 6, and then flagged every remaining new-word card as running backwards. One
 * misfiled kind accounted for most of a 3,000-violation count.
 *
 * `stageOfKind` returns null for it, so `validateStages` skips it rather than
 * letting a pause reorder the lesson around it.
 */

/** The stages that run inside a unit session, in order. */
export const UNIT_STAGES: readonly StageSpec[] = LESSON_STAGES
  .filter((s) => s.scope === 'unit')
  .sort((a, b) => a.order - b.order)

export function stageTitle(stage: StageSpec, locale: 'ar' | 'en'): string {
  return locale === 'en' ? stage.titleEn : stage.titleAr
}

export function stagePurpose(stage: StageSpec, locale: 'ar' | 'en'): string {
  return locale === 'en' ? stage.purposeEn : stage.purposeAr
}

// ── The rule, made checkable ────────────────────────────────────────────────

export interface StageViolation {
  /** 0-based index into the stream where the rule broke. */
  index: number
  kind: ActivityKind
  stage: StageId
  /** The stage that should have come first. */
  missing: StageId
  message: string
}

/**
 * Read a stream of activity kinds and report every place it asks before it
 * teaches.
 *
 * The check is per-stream and order-sensitive: a kind belonging to a stage
 * whose `requires` list names a stage not yet seen is a violation, and so is a
 * kind appearing before a stage of lower `order` that the stream will present
 * later. Both are the same mistake seen from two directions — the learner met
 * a question before the lesson that answers it.
 *
 * Returns an empty array for a well-ordered stream, so a caller can assert on
 * `.length === 0`.
 */
export function validateStages(
  stream: readonly { kind: ActivityKind; source: ActivitySource }[],
): StageViolation[] {
  const violations: StageViolation[] = []
  const seen = new Set<StageId>()
  let highestOrder = 0

  stream.forEach(({ kind, source }, index) => {
    const stageId = stageOfActivity(kind, source)
    if (!stageId) return
    const stage = STAGE_BY_ID.get(stageId)
    if (!stage) return

    for (const need of stage.requires) {
      // `intro` carries no activity of its own, so it can never be "seen" in a
      // stream of kinds. It is satisfied by the unit screen that precedes the
      // stream, not by the stream itself.
      if (need === 'intro') continue
      if (!seen.has(need)) {
        violations.push({
          index,
          kind,
          stage: stageId,
          missing: need,
          message: `«${kind}» belongs to stage «${stageId}», which requires «${need}» — not present yet at position ${index}`,
        })
      }
    }

    if (stage.order < highestOrder) {
      violations.push({
        index,
        kind,
        stage: stageId,
        missing: stageId,
        message: `«${kind}» (stage ${stage.order} «${stageId}») appears after stage ${highestOrder} — the lesson runs backwards here`,
      })
    }
    highestOrder = Math.max(highestOrder, stage.order)
    seen.add(stageId)
  })

  return violations
}
