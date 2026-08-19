#!/usr/bin/env node
/**
 * Unit splitter — cuts every lesson into topical units of 5–8 words.
 * Writes `src/data/units/units.generated.ts`. Do not hand-edit that file.
 *
 *   node scripts/build-units.js          # write + report
 *   node scripts/build-units.js --dry    # report only
 *
 * How the cut is made
 * ───────────────────
 * 1. Similarity: every pair of words in a lesson is scored on signals that
 *    actually exist in the data — co-occurrence in the lesson's own key
 *    sentences / conversations / example sentences, shared Han characters,
 *    shared radicals, shared semantic topic, same part of speech, and
 *    proximity in the textbook's own ordering.
 * 2. Seriation: average-link agglomerative clustering builds a dendrogram; the
 *    leaves are then ordered so that each merge places the most similar pair of
 *    subtrees back-to-back. Similar words end up adjacent in one linear order.
 * 3. Cut: a dynamic program splits that order into contiguous segments of 5–8
 *    words, maximising within-segment cohesion, with the segment count pinned
 *    to 4–6 whenever the lesson is large enough to allow it.
 *
 * Contiguous cutting is what guarantees the two hard invariants: every word
 * lands in exactly one unit, and no unit is empty or out of range.
 */
const fs = require('fs')
const path = require('path')
const { load, ROOT } = require('./ts-load')
const { rankedLabels, posLabelFor } = require('./topics')

const MIN_WORDS = 5
const MAX_WORDS = 8
const PREFERRED_UNITS = [4, 6] // inclusive range, when the lesson allows it
/** Declared session size: how many words a unit should aim for. */
const TARGET_WORDS_PER_UNIT = 5.5
/** How hard the cut is pushed toward equal-sized units. */
const BALANCE_WEIGHT = 0.15

const LEVELS = [
  {
    n: 1,
    vocab: ['src/data/vocabulary.ts', 'vocabulary'],
    lessons: ['src/data/lessons.ts', 'lessons'],
    conversations: ['src/data/conversations.ts', 'conversations'],
  },
  {
    n: 2,
    vocab: ['src/data/hsk2/vocabulary2.ts', 'vocabulary2'],
    lessons: ['src/data/hsk2/lessons2.ts', 'lessons2'],
    conversations: ['src/data/hsk2/conversations2.ts', 'conversations2'],
  },
  {
    n: 3,
    vocab: ['src/data/hsk3/vocabulary3.ts', 'vocabulary3'],
    lessons: ['src/data/hsk3/lessons3.ts', 'lessons3'],
    conversations: ['src/data/hsk3/conversations3.ts', 'conversations3'],
  },
]

const HAN = /[一-鿿]/

// ── similarity ──────────────────────────────────────────────────────────────

const W = {
  keySentence: 3.0, // both words appear in the same key sentence
  conversationTurn: 2.2, // both appear in the same conversation turn
  conversation: 0.5, // both appear somewhere in the same conversation
  crossExample: 2.5, // one word appears in the other's example sentence
  sharedChar: 2.5, // per shared Han character
  sharedRadical: 1.2, // per shared radical
  sharedTopic: 2.4, // per shared semantic topic
  samePos: 0.8,
  adjacency: 1.0, // decays with distance in the textbook ordering
}

function charsOf(zh) {
  return [...zh].filter((c) => HAN.test(c))
}

function buildSimilarity(words, lesson, conversations, topicsOfWord) {
  const n = words.length
  const sim = Array.from({ length: n }, () => new Float64Array(n))
  const add = (i, j, v) => {
    sim[i][j] += v
    sim[j][i] += v
  }

  const chars = words.map((w) => new Set(charsOf(w.zh)))
  const rads = words.map((w) => new Set(w.radicals || []))
  const topics = words.map((w) => new Set(topicsOfWord(w)))
  const ownText = words.map((w) =>
    [w.exZh || '', ...(w.sentences || []).map((s) => s.zh)].join(' ')
  )

  // texts that can bind two words together
  const keySentences = (lesson.keySentences || []).map((s) => s.zh || '')
  const convs = conversations.filter((c) => c.lesson === lesson.id)

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = words[i]
      const b = words[j]

      for (const s of keySentences) {
        if (s.includes(a.zh) && s.includes(b.zh)) add(i, j, W.keySentence)
      }
      for (const c of convs) {
        let inTurn = false
        let inConv = 0
        for (const t of c.turns || []) {
          const zh = t.hanzi || t.zh || ''
          const ha = zh.includes(a.zh)
          const hb = zh.includes(b.zh)
          if (ha && hb) inTurn = true
          if (ha) inConv |= 1
          if (hb) inConv |= 2
        }
        if (inTurn) add(i, j, W.conversationTurn)
        else if (inConv === 3) add(i, j, W.conversation)
      }
      if (ownText[i].includes(b.zh)) add(i, j, W.crossExample)
      if (ownText[j].includes(a.zh)) add(i, j, W.crossExample)

      let shared = 0
      for (const c of chars[i]) if (chars[j].has(c)) shared++
      if (shared) add(i, j, W.sharedChar * shared)

      let sr = 0
      for (const r of rads[i]) if (rads[j].has(r)) sr++
      if (sr) add(i, j, W.sharedRadical * sr)

      let st = 0
      for (const t of topics[i]) if (topics[j].has(t)) st++
      if (st) add(i, j, W.sharedTopic * st)

      if (a.pos === b.pos) add(i, j, W.samePos)

      add(i, j, W.adjacency / (1 + Math.abs(i - j)))
    }
  }
  return sim
}

// ── seriation: average-link dendrogram with orientation-optimised leaf order ─

function seriate(sim) {
  const n = sim.length
  if (n <= 2) return [...Array(n).keys()]

  // each cluster: { members: number[], order: number[] }
  let clusters = [...Array(n).keys()].map((i) => ({ members: [i], order: [i] }))

  const avgLink = (a, b) => {
    let s = 0
    for (const i of a.members) for (const j of b.members) s += sim[i][j]
    return s / (a.members.length * b.members.length)
  }

  while (clusters.length > 1) {
    let bi = 0
    let bj = 1
    let best = -Infinity
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const v = avgLink(clusters[i], clusters[j])
        // ties resolved by the earlier pair — deterministic
        if (v > best + 1e-12) {
          best = v
          bi = i
          bj = j
        }
      }
    }
    const A = clusters[bi]
    const B = clusters[bj]
    // pick the orientation whose touching ends are most similar
    const combos = [
      [A.order, B.order],
      [A.order, [...B.order].reverse()],
      [[...A.order].reverse(), B.order],
      [[...A.order].reverse(), [...B.order].reverse()],
    ]
    let bestOrder = combos[0]
    let bestJoin = -Infinity
    for (const [x, y] of combos) {
      const v = sim[x[x.length - 1]][y[0]]
      if (v > bestJoin + 1e-12) {
        bestJoin = v
        bestOrder = [x, y]
      }
    }
    const merged = {
      members: [...A.members, ...B.members],
      order: [...bestOrder[0], ...bestOrder[1]],
    }
    clusters = clusters.filter((_, k) => k !== bi && k !== bj)
    clusters.push(merged)
  }
  return clusters[0].order
}

// ── cut: DP over segment counts ─────────────────────────────────────────────

/** Mean pairwise similarity inside `order[a..b)`. */
function cohesion(sim, order, a, b) {
  let s = 0
  let pairs = 0
  for (let i = a; i < b; i++) {
    for (let j = i + 1; j < b; j++) {
      s += sim[order[i]][order[j]]
      pairs++
    }
  }
  return pairs ? s / pairs : 0
}

/**
 * How many units a lesson of `n` words gets.
 *
 * Cohesion alone cannot pick the count: with a fixed word total, a score that
 * sums over segments always tilts toward one end. So the count is decided by a
 * declared target session size and only the *cut points* are optimised.
 *
 * Target is `TARGET_WORDS_PER_UNIT`, clamped to what 5–8 allows and, when the
 * lesson is big enough, to the plan's 4–6 units per lesson.
 */
function unitCountFor(n) {
  const kMin = Math.ceil(n / MAX_WORDS)
  const kMax = Math.floor(n / MIN_WORDS)
  if (kMin > kMax) return 0 // impossible: 1–4 or 9 words cannot be cut
  let k = Math.round(n / TARGET_WORDS_PER_UNIT)
  if (kMax >= PREFERRED_UNITS[0] && kMin <= PREFERRED_UNITS[1]) {
    k = Math.min(Math.max(k, PREFERRED_UNITS[0]), PREFERRED_UNITS[1])
  }
  return Math.min(Math.max(k, kMin), kMax)
}

function cut(sim, order) {
  const n = order.length
  const K = unitCountFor(n)
  if (!K) throw new Error(`cannot cut ${n} words into units of ${MIN_WORDS}–${MAX_WORDS}`)

  const ideal = n / K
  // dp[k][i] = best score for the first i words split into exactly k segments
  const NEG = -Infinity
  const dp = Array.from({ length: K + 1 }, () => new Float64Array(n + 1).fill(NEG))
  const from = Array.from({ length: K + 1 }, () => new Int32Array(n + 1).fill(-1))
  dp[0][0] = 0
  for (let k = 1; k <= K; k++) {
    for (let i = MIN_WORDS * k; i <= n; i++) {
      for (let len = MIN_WORDS; len <= MAX_WORDS; len++) {
        const j = i - len
        if (j < 0 || dp[k - 1][j] === NEG) continue
        // reward cohesion inside the segment, penalise cutting a strong bond,
        // and keep segments near the ideal size
        const boundary = i < n ? sim[order[i - 1]][order[i]] : 0
        const score =
          dp[k - 1][j] +
          cohesion(sim, order, j, i) * len -
          boundary * 0.35 -
          BALANCE_WEIGHT * (len - ideal) ** 2
        if (score > dp[k][i] + 1e-12) {
          dp[k][i] = score
          from[k][i] = j
        }
      }
    }
  }
  if (dp[K][n] === NEG) throw new Error(`no feasible split for ${n} words into ${K} units`)

  const segments = []
  let i = n
  for (let k = K; k >= 1; k--) {
    const j = from[k][i]
    segments.unshift(order.slice(j, i))
    i = j
  }
  return segments
}

// ── Arabic copy ─────────────────────────────────────────────────────────────

const AR_COUNT = {
  2: 'كلمتين',
  3: 'ثلاث كلمات',
  4: 'أربع كلمات',
  5: 'خمس كلمات',
  6: 'ست كلمات',
  7: 'سبع كلمات',
  8: 'ثماني كلمات',
}

/**
 * First clean fragment of an Arabic meaning, for use inside a sentence.
 * Grammatical glosses are written parenthesised — "(أداة الملكية / الوصف)" —
 * so the parentheses are unwrapped rather than cut mid-way.
 */
function shortMeaning(word) {
  let m = String(word.meaning || '').trim()
  if (m.startsWith('(')) m = m.slice(1).replace(/\)/g, ' ')
  else m = m.split(' (')[0]
  m = m.split(/[/،؛]/)[0]
  m = m.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
  m = m.replace(/[.!؟?]+$/, '').trim()
  if (m.length > 24) {
    const cut = m.slice(0, 24)
    const sp = cut.lastIndexOf(' ')
    m = (sp > 8 ? cut.slice(0, sp) : cut).trim()
  }
  return m || word.zh
}

const FUNCTION_POS = new Set(['particle', 'conjunction', 'preposition', 'measure'])

/** Distinct short meanings for the copy — content words first, no repeats. */
function meaningList(words, count) {
  const ordered = [
    ...words.filter((w) => !FUNCTION_POS.has(w.pos)),
    ...words.filter((w) => FUNCTION_POS.has(w.pos)),
  ]
  const out = []
  const seen = new Set()
  for (const w of ordered) {
    const m = shortMeaning(w)
    if (!m || seen.has(m)) continue
    seen.add(m)
    out.push(m)
    if (out.length === count) break
  }
  return out
}

/** The words that bind the unit together most strongly — used in the copy. */
function centralWords(sim, words, idx, count) {
  const scored = idx.map((i, k) => {
    let s = 0
    for (const j of idx) if (j !== i) s += sim[i][j]
    return { i, k, s }
  })
  scored.sort((a, b) => b.s - a.s || a.k - b.k)
  return scored.slice(0, count).map((x) => words[x.i])
}

/**
 * Arabic title for one unit. Tries, in order: its strongest unclaimed topic,
 * its part-of-speech label, then the strongest topic narrowed by two of the
 * unit's own words — so two number units inside one lesson never share a name.
 */
const AR_ORDINAL = [
  '', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة',
  'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة',
]

/**
 * The unit's title.
 *
 * When two units of a level would share a topic label, they are told apart by
 * an ORDINAL — «الطعام والشراب (الثانية)» — not by listing their words.
 *
 * The previous version disambiguated with `meaningList(...)`, producing titles
 * like «الطعام والشراب: يستخدم وجائع». `units.generated.ts` ships to the
 * browser so the path can render, and it carries each unit's characters in
 * `hanzi` — so those titles put paid character↔meaning pairs into a public
 * bundle. Two survived every other fix and were caught only by probing all 324
 * paid-only words instead of a 40-word sample.
 *
 * A learner reading the path gains nothing from two translations in a title
 * anyway; they gain from knowing which of the two units this is.
 */
function makeTitle(unitWords, headline, used, unitIndex) {
  const candidates = [...rankedLabels(unitWords), posLabelFor(unitWords)]
  for (const c of candidates) {
    if (c && !used.has(c)) {
      used.add(c)
      return c
    }
  }
  const base = candidates[0] || posLabelFor(unitWords)
  let n = 2
  while (used.has(`${base} (${AR_ORDINAL[n] || n})`)) n++
  const titled = `${base} (${AR_ORDINAL[n] || n})`
  used.add(titled)
  return titled
}

/**
 * The unit's one-line goal.
 *
 * It names the TOPIC and the count — never the words' Arabic meanings.
 *
 * It used to read «تتعلّم ست كلمات: يستقبل، يفقد، مفقود، وتستعملها…»: the first
 * three translations, spelled out. `units.generated.ts` ships to the browser so
 * the path can render, and the same file carries each unit's `hanzi` array —
 * so between the two, a public bundle held roughly 570 character↔meaning pairs
 * of paid vocabulary. The most valuable field of the product, in the file that
 * was supposed to be its harmless index.
 *
 * The topic is public (it is the unit title, printed on the indexed lesson
 * pages); the translations are the product.
 */
function makeGoal(unitWords, headline, carriesExam, title) {
  const n = unitWords.length
  const count = AR_COUNT[n] || `${n} كلمات`
  const topic = title ? `عن ${title}` : 'من الدرس'
  return carriesExam
    ? `${count} جديدة ${topic}، ثم تراجع الدرس كلّه بأسئلة بنمط HSK.`
    : `${count} جديدة ${topic}، تستعملها في جمل الدرس ومحادثاته.`
}

// ── build ───────────────────────────────────────────────────────────────────

function buildLevel(L, topicsOfWord) {
  const vocab = load(L.vocab[0])[L.vocab[1]]
  const lessons = load(L.lessons[0])[L.lessons[1]]
  const conversations = load(L.conversations[0])[L.conversations[1]] || []
  const byId = new Map(vocab.map((w) => [w.id, w]))

  const units = []
  for (const lesson of lessons) {
    const ids = (lesson.vocabularyIds || []).slice()
    const words = ids.map((id) => byId.get(id)).filter(Boolean)
    if (words.length !== ids.length) {
      throw new Error(`HSK${L.n} lesson ${lesson.id}: unknown vocabulary id in vocabularyIds`)
    }

    const sim = buildSimilarity(words, lesson, conversations, topicsOfWord)
    const order = seriate(sim)
    const segments = cut(sim, order)

    // present units in the textbook's own progression
    segments.sort((a, b) => Math.min(...a.map((i) => words[i].id)) - Math.min(...b.map((i) => words[i].id)))

    const grammarIds = lesson.grammarIds || []
    const usedTitles = new Set()

    segments.forEach((seg, u) => {
      const unitWords = seg.map((i) => words[i])
      const wordIds = unitWords.map((w) => w.id)
      const carriesExam = u === segments.length - 1

      const keySentenceIndices = []
      ;(lesson.keySentences || []).forEach((s, k) => {
        if (unitWords.some((w) => (s.zh || '').includes(w.zh))) keySentenceIndices.push(k)
      })
      const conversationIds = conversations
        .filter(
          (c) =>
            c.lesson === lesson.id &&
            (c.turns || []).some((t) => unitWords.some((w) => (t.hanzi || t.zh || '').includes(w.zh)))
        )
        .map((c) => c.id)

      // spread the lesson's grammar rules over its units so each has one
      const mine = grammarIds.filter((_, gi) => gi % segments.length === u)
      const unitGrammar = mine.length
        ? mine
        : grammarIds.length
          ? [grammarIds[u % grammarIds.length]]
          : []

      const hanzi = []
      for (const w of unitWords) for (const c of charsOf(w.zh)) if (!hanzi.includes(c)) hanzi.push(c)

      const headline = centralWords(sim, words, seg, Math.min(3, unitWords.length))

      const title = makeTitle(unitWords, headline, usedTitles, u + 1)

      units.push({
        ref: { level: L.n, lesson: lesson.id, unit: u + 1 },
        key: `${L.n}:${lesson.id}:${u + 1}`,
        title,
        goal: makeGoal(unitWords, headline, carriesExam, title),
        wordIds,
        grammarIds: unitGrammar,
        keySentenceIndices,
        conversationIds,
        carriesExam,
        hanzi,
      })
    })
  }
  return units
}

function main() {
  const dry = process.argv.includes('--dry')
  const { topicsOf } = require('./topics')

  const all = []
  const perLevel = []
  for (const L of LEVELS) {
    const units = buildLevel(L, topicsOf)
    all.push(...units)
    perLevel.push({ level: L.n, units })
  }

  // ── invariants ──
  const problems = []
  for (const { level, units } of perLevel) {
    const L = LEVELS.find((x) => x.n === level)
    const vocab = load(L.vocab[0])[L.vocab[1]]
    const seen = new Map()
    for (const u of units) {
      if (u.wordIds.length < MIN_WORDS || u.wordIds.length > MAX_WORDS)
        problems.push(`HSK${level} ${u.key}: ${u.wordIds.length} words (allowed ${MIN_WORDS}–${MAX_WORDS})`)
      if (!u.title.trim()) problems.push(`HSK${level} ${u.key}: empty title`)
      for (const id of u.wordIds) {
        if (seen.has(id)) problems.push(`HSK${level}: word ${id} in ${seen.get(id)} and ${u.key}`)
        seen.set(id, u.key)
      }
    }
    for (const w of vocab) if (!seen.has(w.id)) problems.push(`HSK${level}: word ${w.id} ${w.zh} is in no unit`)
  }
  if (problems.length) {
    console.error('✗ unit invariants violated:')
    for (const p of problems.slice(0, 40)) console.error('  ' + p)
    process.exit(1)
  }

  // ── report ──
  const line = '─'.repeat(66)
  console.log(`\n${line}\nUNIT SPLIT\n${line}`)
  for (const { level, units } of perLevel) {
    const lessons = new Map()
    for (const u of units) lessons.set(u.ref.lesson, (lessons.get(u.ref.lesson) || 0) + 1)
    const sizes = units.map((u) => u.wordIds.length)
    const words = sizes.reduce((a, b) => a + b, 0)
    console.log(
      `  HSK${level}: ${units.length} units across ${lessons.size} lessons  ` +
        `(${Math.min(...lessons.values())}–${Math.max(...lessons.values())} units/lesson, ` +
        `${Math.min(...sizes)}–${Math.max(...sizes)} words/unit, ${words} words)`
    )
    console.log(
      `           units per lesson: ${[...lessons.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]).join(',')}`
    )
  }
  console.log(`  TOTAL: ${all.length} units\n`)

  if (dry) return

  const out = emit(all, perLevel)
  const dest = path.join(ROOT, 'src/data/units/units.generated.ts')
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, out, 'utf8')
  console.log(`  wrote ${path.relative(ROOT, dest)} (${all.length} units)\n`)
}

function emit(all, perLevel) {
  const head = `// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE — do not edit by hand.
// Produced by \`node scripts/build-units.js\` from src/data/*/lessons*.ts.
//
${perLevel
  .map((p) => {
    const l = new Set(p.units.map((u) => u.ref.lesson))
    return `//   HSK${p.level}: ${p.units.length} units over ${l.size} lessons`
  })
  .join('\n')}
//   total: ${all.length} units
// ─────────────────────────────────────────────────────────────────────────────
import type { Unit } from '@/lib/curriculum/types'

export const unitsGenerated: Unit[] = [
`
  const body = all
    .map((u) => {
      const j = (v) => JSON.stringify(v)
      return (
        `  {\n` +
        `    ref: { level: ${u.ref.level}, lesson: ${u.ref.lesson}, unit: ${u.ref.unit} },\n` +
        `    key: ${j(u.key)},\n` +
        `    title: ${j(u.title)},\n` +
        `    goal: ${j(u.goal)},\n` +
        `    wordIds: ${j(u.wordIds)},\n` +
        `    grammarIds: ${j(u.grammarIds)},\n` +
        `    keySentenceIndices: ${j(u.keySentenceIndices)},\n` +
        `    conversationIds: ${j(u.conversationIds)},\n` +
        `    carriesExam: ${u.carriesExam},\n` +
        `    hanzi: ${j(u.hanzi)},\n` +
        `  },`
      )
    })
    .join('\n')

  const tail = `
]

/** Unit count per level — the real numbers, replacing the plan's estimates. */
export const UNIT_COUNTS: Record<1 | 2 | 3, number> = {
${perLevel.map((p) => `  ${p.level}: ${p.units.length},`).join('\n')}
}
`
  return head + body + tail
}

if (require.main === module) main()
module.exports = { buildLevel, seriate, cut, unitCountFor, MIN_WORDS, MAX_WORDS }
