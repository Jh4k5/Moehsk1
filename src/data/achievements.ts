// ─── Achievement System ───────────────────────────────────────────────────────
// Phase 3 – Gamification with localStorage-backed condition checks

export interface Achievement {
  id: string
  emoji: string
  titleAr: string
  descAr: string
  points: number
  checkCondition: () => boolean
}

/* ── helpers ─────────────────────────────────────────────────────────────────── */

function getJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
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
    checkCondition: () => {
      const srs = getJson<Record<string, unknown>>("srs_data", {})
      return Object.keys(srs).length >= 1
    },
  },
  {
    id: "fifty_words",
    emoji: "⭐",
    titleAr: "خمسون كلمة!",
    descAr: "تعلم 50 كلمة صينية",
    points: 50,
    checkCondition: () => {
      const srs = getJson<Record<string, unknown>>("srs_data", {})
      return Object.keys(srs).length >= 50
    },
  },
  {
    id: "hundred_words",
    emoji: "🌟",
    titleAr: "المئة الأولى",
    descAr: "تعلم 100 كلمة صينية",
    points: 100,
    checkCondition: () => {
      const srs = getJson<Record<string, unknown>>("srs_data", {})
      return Object.keys(srs).length >= 100
    },
  },
  {
    id: "all_words",
    emoji: "🏆",
    titleAr: "إتقان HSK 1",
    descAr: "تعلم جميع 410 كلمة في المستوى الأول",
    points: 500,
    checkCondition: () => {
      const srs = getJson<Record<string, unknown>>("srs_data", {})
      return Object.keys(srs).length >= 410
    },
  },

  // ── Streak milestones ───────────────────────────────────────────────────────
  {
    id: "streak_7",
    emoji: "🔥",
    titleAr: "أسبوع كامل",
    descAr: "حافظ على سلسلة الدراسة لمدة 7 أيام متتالية",
    points: 70,
    checkCondition: () => {
      const streak = getJson<{ current: number }>("streak_data", { current: 0 })
      return streak.current >= 7
    },
  },
  {
    id: "streak_30",
    emoji: "💎",
    titleAr: "شهر من الالتزام",
    descAr: "حافظ على سلسلة الدراسة لمدة 30 يومًا متتالية",
    points: 300,
    checkCondition: () => {
      const streak = getJson<{ current: number }>("streak_data", { current: 0 })
      return streak.current >= 30
    },
  },

  // ── Pronunciation ───────────────────────────────────────────────────────────
  {
    id: "perfect_pron",
    emoji: "🎤",
    titleAr: "نطق المحترف",
    descAr: "حقق متوسط نطق 95% أو أعلى",
    points: 100,
    checkCondition: () => {
      const scores = getJson<number[]>("pronunciation_scores", [])
      if (scores.length === 0) return false
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      return avg >= 95
    },
  },

  // ── Exam ────────────────────────────────────────────────────────────────────
  {
    id: "first_exam_pass",
    emoji: "📜",
    titleAr: "اجتزت الاختبار!",
    descAr: "اجتز اختبار HSK 1 بنجاح",
    points: 150,
    checkCondition: () => {
      const history = getJson<Array<{ passed: boolean }>>("exam_history", [])
      return history.some((e) => e.passed === true)
    },
  },

  // ── Hanzi writing ───────────────────────────────────────────────────────────
  {
    id: "hanzi_writer",
    emoji: "✍️",
    titleAr: "خطاط الرموز",
    descAr: "حقق 80% أو أعلى في كتابة 20 رمز صيني",
    points: 80,
    checkCondition: () => {
      const srs = getJson<Record<string, { hanzi_score?: number }>>("srs_data", {})
      let count = 0
      for (const entry of Object.values(srs)) {
        if (entry.hanzi_score !== undefined && entry.hanzi_score >= 80) {
          count++
        }
      }
      return count >= 20
    },
  },

  // ── Conversations ───────────────────────────────────────────────────────────
  {
    id: "conv_master",
    emoji: "💬",
    titleAr: "محادث بارع",
    descAr: "أكمل جميع المحادثات التدريبية",
    points: 120,
    checkCondition: () => {
      const completed = getJson<boolean>("conv_completed", false)
      return completed === true
    },
  },
]
