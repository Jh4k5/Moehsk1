// ─── Deterministic randomness ───────────────────────────────────────────────
//
// The activity stream must be the SAME every time a learner opens a unit.
// `Math.random()` would reshuffle the distractors on every render, so a wrong
// answer on the left could be the right answer a second later — and a learner
// who reloads mid-unit would lose their place in a stream that no longer
// exists. Everything random below is a pure function of `(seed, label)`.
//
// mulberry32: 32-bit, no dependencies, good enough for shuffling four choices.

export interface Rng {
  /** Float in [0, 1). */
  next(): number
  /** Integer in [0, max). */
  int(max: number): number
  /** A new array, shuffled. Never mutates the input. */
  shuffle<T>(items: readonly T[]): T[]
  /** `count` distinct items, or fewer when the pool is smaller. */
  sample<T>(items: readonly T[], count: number): T[]
  /** One item, or undefined for an empty pool. */
  pick<T>(items: readonly T[]): T | undefined
}

/** FNV-1a — turns a label into a seed offset so two draws from one seed differ. */
export function hashString(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function makeRng(seed: number, label = ''): Rng {
  let state = (seed ^ (label ? hashString(label) : 0)) >>> 0

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (max: number): number => (max <= 0 ? 0 : Math.floor(next() * max))

  const shuffle = <T,>(items: readonly T[]): T[] => {
    const out = items.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(i + 1)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  return {
    next,
    int,
    shuffle,
    sample: (items, count) => shuffle(items).slice(0, Math.max(0, count)),
    pick: (items) => (items.length === 0 ? undefined : items[int(items.length)]),
  }
}
