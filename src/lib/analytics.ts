// ─── Analytics Engine ─────────────────────────────────────────────────────────
// Phase 3 – Centralised learning statistics with localStorage persistence

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface LearningStats {
  learnedWords: number
  totalWords: number
  learnedPercent: number
  dueToday: number
  avgPronunciation: number | null
  avgExamScore: number | null
  hardWords: number
  streak: number
  heatmap30days: Record<string, number>
  daysToComplete: number | null
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

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / 86_400_000)
}

/* ── Cache ──────────────────────────────────────────────────────────────────── */

let cachedStats: LearningStats | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5_000 // 5 seconds

/* ── Analytics object ───────────────────────────────────────────────────────── */

export const Analytics = {
  /**
   * Compute overall learning statistics from localStorage data.
   */
  getStats(): LearningStats {
    // ── SRS data ──────────────────────────────────────────────────────────────
    const srs = getJson<
      Record<
        string,
        {
          interval?: number
          nextReview?: string | number
          easeFactor?: number
          hanzi_score?: number
        }
      >
    >("srs_data", {})

    const learnedWords = Object.keys(srs).length
    const totalWords = 410

    const today = todayKey()
    let dueToday = 0
    let hardWords = 0

    for (const entry of Object.values(srs)) {
      if (!entry.nextReview) continue
      const next = typeof entry.nextReview === "number"
        ? new Date(entry.nextReview)
        : new Date(entry.nextReview)
      if (next.toISOString().slice(0, 10) <= today) {
        dueToday++
      }
      if (entry.easeFactor !== undefined && entry.easeFactor < 2.0) {
        hardWords++
      }
    }

    // ── Pronunciation ─────────────────────────────────────────────────────────
    const pronScores = getJson<number[]>("pronunciation_scores", [])
    const avgPronunciation =
      pronScores.length > 0
        ? Math.round((pronScores.reduce((a, b) => a + b, 0) / pronScores.length) * 10) / 10
        : null

    // ── Exam history ──────────────────────────────────────────────────────────
    const examHistory = getJson<Array<{ score: number; passed: boolean }>>(
      "exam_history",
      [],
    )
    const avgExamScore =
      examHistory.length > 0
        ? Math.round(
            (examHistory.reduce((a, b) => a + b.score, 0) / examHistory.length) * 10,
          ) / 10
        : null

    // ── Streak ────────────────────────────────────────────────────────────────
    const streakData = getJson<{ current: number; lastDate: string }>("streak_data", {
      current: 0,
      lastDate: "",
    })
    const streak = streakData.current

    // ── Heatmap (last 30 days) ───────────────────────────────────────────────
    const dailyActivity = getJson<Record<string, number>>("daily_activity", {})
    const heatmap30days: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      heatmap30days[key] = dailyActivity[key] ?? 0
    }

    // ── Days to complete estimate ─────────────────────────────────────────────
    let daysToComplete: number | null = null
    if (learnedWords > 0 && learnedWords < totalWords) {
      // Find the earliest learning date from heatmap
      const activeDays = Object.keys(dailyActivity).length
      if (activeDays > 0) {
        const rate = learnedWords / activeDays
        daysToComplete = Math.ceil((totalWords - learnedWords) / rate)
      }
    }

    const learnedPercent =
      totalWords > 0
        ? Math.round((learnedWords / totalWords) * 1000) / 10
        : 0

    return {
      learnedWords,
      totalWords,
      learnedPercent,
      dueToday,
      avgPronunciation,
      avgExamScore,
      hardWords,
      streak,
      heatmap30days,
      daysToComplete,
    }
  },

  /**
   * Record one activity for today in the daily_activity tracker.
   */
  recordActivity(): void {
    if (typeof window === "undefined") return
    const key = todayKey()
    const activity = getJson<Record<string, number>>("daily_activity", {})
    activity[key] = (activity[key] ?? 0) + 1
    localStorage.setItem("daily_activity", JSON.stringify(activity))
  },

  /**
   * Update the study streak. Call after each study session.
   */
  updateStreak(): void {
    if (typeof window === "undefined") return

    const streak = getJson<{ current: number; lastDate: string }>("streak_data", {
      current: 0,
      lastDate: "",
    })

    const today = todayKey()
    const lastDate = streak.lastDate

    if (lastDate === today) {
      // Already recorded today – nothing to do
      return
    }

    if (lastDate) {
      const last = new Date(lastDate)
      const now = new Date(today)
      const diff = daysBetween(last, now)

      if (diff === 1) {
        // Consecutive day
        streak.current += 1
      } else if (diff > 1) {
        // Streak broken
        streak.current = 1
      }
    } else {
      // First time ever
      streak.current = 1
    }

    streak.lastDate = today
    localStorage.setItem("streak_data", JSON.stringify(streak))
  },

  /**
   * Cached version of getStats – refreshes at most once every 5 seconds.
   */
  getCachedStats(): LearningStats {
    const now = Date.now()
    if (!cachedStats || now - cacheTimestamp > CACHE_TTL) {
      cachedStats = this.getStats()
      cacheTimestamp = now
    }
    return cachedStats
  },
}
