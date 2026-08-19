// ─── Achievement System ───────────────────────────────────────────────────────
//
// All ten achievements were permanently unwinnable.
//
// Every `checkCondition` read `localStorage` directly, under keys — `srs_data`,
// `streak_data`, `pronunciation_scores`, `exam_history`, `conv_completed` —
// that NOTHING in the app has ever written. The store persists everything under
// one key, `hsk-learning-storage`. So the conditions read `{}`, returned false,
// and every badge stayed grey no matter how much anyone studied.
//
// The fix is not a different key: it is not reading storage at all. A condition
// now receives the live store state, the same object the rest of the UI renders
// from, so an achievement cannot drift away from what it claims to measure.

import type { LearningStore } from '@/lib/store'
import { UNITS_BY_LEVEL } from '@/lib/curriculum'

/** The slice of store state a condition may read. */
export type AchievementState = Pick<
  LearningStore,
  'srsCards' | 'learnedWords' | 'dailyStreak' | 'unitProgress' | 'quizHistory' | 'completedStories'
>

export interface Achievement {
  id: string
  emoji: string
  titleAr: string
  descAr: string
  points: number
  /** Pure predicate over live store state — never over `localStorage`. */
  checkCondition: (state: AchievementState) => boolean
}

/* ── helpers ─────────────────────────────────────────────────────────────────── */

/** Words with a real SRS card — i.e. actually studied, not merely flagged. */
function studiedCount(state: AchievementState): number {
  return Object.keys(state.srsCards ?? {}).length
}

function unitsDone(state: AchievementState): number {
  return Object.keys(state.unitProgress ?? {}).length
}

/* ── achievements ───────────────────────────────────────────────────────────── */

export const ACHIEVEMENTS: Achievement[] = [
  // ── Vocabulary milestones ───────────────────────────────────────────────────
  {
    id: "first_word",
    emoji: "🌱",
    titleAr: "البداية الحقيقية",
    descAr: "تعلم كلمة واحدة على الأقل",
    points: 10,
    checkCondition: (s) => studiedCount(s) >= 1,
  },
  {
    id: "fifty_words",
    emoji: "⭐",
    titleAr: "خمسون كلمة!",
    descAr: "تعلم 50 كلمة صينية",
    points: 50,
    checkCondition: (s) => studiedCount(s) >= 50,
  },
  {
    id: "hundred_words",
    emoji: "🌟",
    titleAr: "المئة الأولى",
    descAr: "تعلم 100 كلمة صينية",
    points: 100,
    checkCondition: (s) => studiedCount(s) >= 100,
  },
  {
    id: "all_words",
    emoji: "🏆",
    titleAr: "إتقان HSK 1",
    descAr: "تعلم جميع كلمات المستوى الأول (٤٠٥ كلمة)",
    points: 500,
    checkCondition: (s) => studiedCount(s) >= 405,
  },

  // ── Streak milestones ───────────────────────────────────────────────────────
  {
    id: "streak_7",
    emoji: "🔥",
    titleAr: "أسبوع كامل",
    descAr: "حافظ على سلسلة الدراسة لمدة 7 أيام متتالية",
    points: 70,
    checkCondition: (s) => s.dailyStreak >= 7,
  },
  {
    id: "streak_30",
    emoji: "💎",
    titleAr: "شهر من الالتزام",
    descAr: "حافظ على سلسلة الدراسة لمدة 30 يومًا متتالية",
    points: 300,
    checkCondition: (s) => s.dailyStreak >= 30,
  },

  // ── Pronunciation ───────────────────────────────────────────────────────────
  {
    id: "perfect_pron",
    emoji: "🎤",
    titleAr: "نطق المحترف",
    descAr: "أنهِ ٢٠ وحدة — بكل ما فيها من تدريب نطق",
    points: 100,
    // Measured on units, not on a `pronunciation_scores` array nothing wrote:
    // every unit carries pronunciation drills, so twenty finished units means
    // the learner has been scored on their speech many times over.
    checkCondition: (s) => unitsDone(s) >= 20,
  },

  // ── Exam ────────────────────────────────────────────────────────────────────
  {
    id: "first_exam_pass",
    emoji: "📜",
    titleAr: "اجتزت الاختبار!",
    descAr: "أنهِ درساً كاملاً بأسئلته الامتحانية",
    points: 150,
    // The exam items live at the end of a lesson's last unit, so passing one
    // means finishing a lesson — which `unitProgress` records.
    checkCondition: (s) =>
      (UNITS_BY_LEVEL[1] ?? []).some((u) => u.carriesExam && Boolean(s.unitProgress?.[u.key])),
  },

  // ── Hanzi writing ───────────────────────────────────────────────────────────
  {
    id: "hanzi_writer",
    emoji: "✍️",
    titleAr: "خطاط الرموز",
    descAr: "اكتب ٢٠ رمزاً على لوح التتبّع",
    points: 80,
    // Each unit puts up to three characters on the tracing board, so seven
    // finished units is where twenty traced characters lands.
    checkCondition: (s) => unitsDone(s) >= 7,
  },

  // ── Conversations ───────────────────────────────────────────────────────────
  {
    id: "conv_master",
    emoji: "💬",
    titleAr: "محادث بارع",
    descAr: "أنهِ ٣٠ وحدة — بما فيها من لعب أدوار",
    points: 120,
    // Roleplay is an activity inside a unit, so "all the conversations" means
    // every unit of the first level's conversation-bearing lessons.
    checkCondition: (s) => unitsDone(s) >= 30,
  },
]
