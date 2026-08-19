// ─── Small pure helpers shared by more than one feature ─────────────────────
import type { VocabWord } from '@/data/vocabulary'

export function isSelectedCorrect(answer: number | null, correct: number): boolean {
  return answer !== null && answer === correct
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
}

/** Every distinct example sentence carried by a level's vocabulary. */
export function buildAllSentences(
  vocab: VocabWord[],
): { zh: string; pinyin: string; ar: string; wordZh: string }[] {
  const seen = new Set<string>()
  const result: { zh: string; pinyin: string; ar: string; wordZh: string }[] = []
  for (const w of vocab) {
    const add = (zh: string, py: string, ar: string) => {
      if (zh && !seen.has(zh)) {
        seen.add(zh)
        result.push({ zh, pinyin: py, ar, wordZh: w.zh })
      }
    }
    for (const s of (w.sentences || [])) add(s.zh, s.pinyin, s.ar)
    add(w.exZh, w.exPinyin, w.exEn)
    if (w.s2) add(w.s2.zh, w.s2.py, w.s2.ar)
    if (w.s3) add(w.s3.zh, w.s3.py, w.s3.ar)
  }
  return result
}
