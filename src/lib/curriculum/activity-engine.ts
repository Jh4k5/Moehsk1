// ─── The activity engine ────────────────────────────────────────────────────
//
// Turns one unit of the curriculum into the stream of drills a learner works
// through. This is the file that makes the platform a path instead of an
// encyclopedia: the seventeen library sections stop being places you must
// choose to visit and become the drills inside a single sitting.
//
// Four rules shape every stream:
//
//   1. RAMP. Recognition before production. A word is presented, then
//      recognised, then produced — never asked for before it has been given.
//   2. VARIETY. No kind runs more than `MAX_KIND_RUN` times in a row, and a
//      game break lands about every `GAME_BREAK_EVERY` activities. Six
//      identical flashcards in a row is how a learner stops.
//   3. INTERLEAVING. Words from earlier units that SRS says are due get pulled
//      in, and words the learner has missed get extra repetitions. A unit is
//      never only its own words.
//   4. DETERMINISM. The stream is a pure function of (unit, learner state,
//      seed). Reload mid-unit and it is the same stream, in the same order,
//      with the distractors in the same places.
//
// Anything the content cannot support is SKIPPED, never faked. Most HSK2 and
// HSK3 lessons have no conversations authored yet, HSK1 has no daily-Q&A set,
// and only HSK1 has an exam bank. A unit drawn from thin content produces a
// shorter stream — not a stream with an empty roleplay in it.

import {
  ACTIVITY_KIND_LABEL_AR,
  GAME_BREAK_EVERY,
  MAX_KIND_RUN,
  type Activity,
  type ActivityKind,
  type ActivitySource,
  type Choice,
  type GameId,
  type LearnerState,
  type MultipleChoice,
  type RadicalPart,
  type SentenceRef,
  type Unit,
  type UnitRef,
} from './types'
// TYPE-only import of the content source. The engine no longer READS the data
// modules: it is handed the content it may use.
//
// That is not a style choice. `content-source` statically imports all three
// levels; this file imported it, `SessionRunner` imports this file, and the
// shell imports `SessionRunner` — so the entire paid curriculum rode into every
// public bundle through this one line. Taking content as an argument means the
// caller decides what the engine can see, and on the client that caller is an
// entitlement-filtered API response.
//
// It also makes the engine testable with a handful of fabricated words instead
// of the real 1,079.
import { hanziOf, type LevelContent, type VocabWord } from './content-types'
import { makeRng, type Rng } from './rng'

export { ACTIVITY_KIND_LABEL_AR }

// ── Tuning ──────────────────────────────────────────────────────────────────

/** How many characters of a unit get a tracing board. More than this and the
 *  unit stops being five minutes long. */
const MAX_WRITE_PER_UNIT = 3
/** How many due words from earlier units to weave in. */
const MAX_REVIEW_PER_UNIT = 4
/** How many extra reps a missed word earns. */
const MAX_REMEDIATION_PER_UNIT = 3
/** Distractors per multiple-choice question (so 4 options in total). */
const DISTRACTORS = 3
/** Pronunciation pass mark, out of 100. */
const PRONOUNCE_PASS = 70
/**
 * The most activities one unit may contain.
 *
 * A unit is meant to be a five-to-eight-minute sitting a learner can finish in
 * one go — that is the whole reason 48 lessons were cut into 191 units. Left
 * uncapped the engine produced streams of up to 62, which is not a sitting, it
 * is a session someone abandons in the middle and never returns to.
 */
const MAX_ACTIVITIES_PER_UNIT = 36
/**
 * The most game breaks in one unit.
 *
 * The plan asks for a break roughly every six activities. Applied literally to
 * a 42-activity stream that produced SEVEN breaks — one activity in eight was a
 * game, which stops being a reward and starts being the content. The spacing
 * rule stays; this caps how much of a unit it may consume.
 */
const MAX_GAME_BREAKS = 3

// ── Building blocks ─────────────────────────────────────────────────────────

/**
 * Words by id, out of the content the caller supplied.
 *
 * Ids that are absent are SKIPPED, not faked. For a viewer who is not entitled
 * to this level the API returns only the free lessons' words, so a locked
 * unit's ids resolve to nothing and the stream comes back empty — which is the
 * correct outcome, and the reason the gate can be trusted.
 */
function pickWords(ctx: Ctx, ids: readonly number[]): VocabWord[] {
  const out: VocabWord[] = []
  for (const id of ids) {
    const word = ctx.content.byId.get(id)
    if (word) out.push(word)
  }
  return out
}

interface Ctx {
  unit: Unit
  ref: UnitRef
  rng: Rng
  /** Everything the engine may draw on. Supplied by the caller, never imported. */
  content: LevelContent
  /** The unit's own words, in unit order. */
  words: VocabWord[]
  /** Every word of the level — the distractor pool. */
  pool: VocabWord[]
  learner: LearnerState
}

/** A distractor must be plausible and must not be the answer. */
function distractorsFor(ctx: Ctx, answer: VocabWord, project: (w: VocabWord) => string): Choice[] {
  const label = project(answer)
  const seen = new Set([label])
  // Prefer words of the same part of speech: "which means 'to eat'" is a real
  // question when the wrong answers are also verbs, and a giveaway when they
  // are numbers.
  const sameClass = ctx.pool.filter((w) => w.id !== answer.id && w.pos === answer.pos)
  const rest = ctx.pool.filter((w) => w.id !== answer.id && w.pos !== answer.pos)
  const ordered = [...ctx.rng.shuffle(sameClass), ...ctx.rng.shuffle(rest)]

  const out: Choice[] = []
  for (const w of ordered) {
    const text = project(w)
    if (!text || seen.has(text)) continue
    seen.add(text)
    out.push({ label: text, wordId: w.id })
    if (out.length === DISTRACTORS) break
  }
  return out
}

function multipleChoice(
  ctx: Ctx,
  correctChoice: Choice,
  distractors: Choice[],
  explanation: string,
): MultipleChoice | null {
  // A question with fewer than two options is not a question.
  if (distractors.length === 0) return null
  const choices = ctx.rng.shuffle([correctChoice, ...distractors])
  return {
    choices,
    correct: choices.findIndex((c) => c === correctChoice),
    explanation,
  }
}

function partsOf(word: VocabWord): RadicalPart[] {
  return (word.radicals ?? [])
    .filter((r) => r && r !== word.zh)
    .map((char) => ({ char, meaning: '' }))
}

function firstSentence(word: VocabWord): SentenceRef | null {
  const s = word.sentences?.[0]
  if (s) return { zh: s.zh, pinyin: s.pinyin, ar: s.ar }
  if (word.exZh) return { zh: word.exZh, pinyin: word.exPinyin, ar: word.meaning }
  return null
}

// ── Per-kind builders ───────────────────────────────────────────────────────
// Each returns `null` when the content cannot support the drill. The scheduler
// below simply skips nulls, which is why a thin lesson yields a short stream
// rather than a broken one.

type Draft = Omit<Activity, 'id' | 'index'> & { kind: ActivityKind }

function wordIntro(ctx: Ctx, word: VocabWord, ordinal: number, total: number): Draft {
  return {
    kind: 'word-intro',
    mode: 'present',
    source: 'new',
    unit: ctx.ref,
    wordIds: [word.id],
    word: {
      id: word.id,
      zh: word.zh,
      pinyin: word.pinyin,
      meaning: word.meaning,
      tones: word.tones ?? [],
      strokeCount: word.strokeCount ?? 0,
    },
    parts: partsOf(word),
    mnemonic: word.mnemonic ?? '',
    example: firstSentence(word),
    wordOrdinal: ordinal,
    wordTotal: total,
  } as Draft
}

function wordRecall(
  ctx: Ctx,
  word: VocabWord,
  direction: 'zh-to-ar' | 'ar-to-zh' | 'audio-to-zh',
  source: ActivitySource,
): Draft | null {
  const toArabic = direction === 'zh-to-ar'
  const project = toArabic ? (w: VocabWord) => w.meaning : (w: VocabWord) => w.zh
  const question = multipleChoice(
    ctx,
    { label: project(word), sub: toArabic ? undefined : word.pinyin, wordId: word.id },
    distractorsFor(ctx, word, project),
    `${word.zh} (${word.pinyin}) — ${word.meaning}`,
  )
  if (!question) return null
  return {
    kind: 'word-recall',
    mode: 'recognise',
    source,
    unit: ctx.ref,
    wordIds: [word.id],
    direction,
    prompt: toArabic ? word.zh : word.meaning,
    promptSub: toArabic ? word.pinyin : undefined,
    question,
  } as Draft
}

function hanziWrite(ctx: Ctx, word: VocabWord, char: string): Draft {
  return {
    kind: 'hanzi-write',
    mode: 'produce',
    source: 'new',
    unit: ctx.ref,
    wordIds: [word.id],
    char,
    strokeCount: word.strokeCount ?? 0,
    inWord: { zh: word.zh, pinyin: word.pinyin, meaning: word.meaning },
    parts: partsOf(word),
    hint: 'اكتب من الأعلى إلى الأسفل، ومن اليسار إلى اليمين.',
  } as Draft
}

const TONE_MARKS: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'], o: ['ō', 'ó', 'ǒ', 'ò'], e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'], u: ['ū', 'ú', 'ǔ', 'ù'], ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
}

/** Re-mark a bare syllable with each of the four tones. */
function toneVariants(bare: string): string[] | null {
  // The mark goes on a > o/e > the last vowel — the standard placement rule.
  const order = ['a', 'o', 'e', 'i', 'u', 'ü']
  let target = ''
  for (const v of order) if (bare.includes(v)) { target = v; break }
  if (!target || !TONE_MARKS[target]) return null
  const at = bare.indexOf(target)
  return TONE_MARKS[target].map((m) => bare.slice(0, at) + m + bare.slice(at + 1))
}

function toneDiscriminate(ctx: Ctx, word: VocabWord): Draft | null {
  const tone = word.tones?.[0]
  if (!tone || tone < 1 || tone > 4) return null
  const bare = (word.pinyinRaw ?? '').split(/\s+/)[0]
  if (!bare) return null
  const variants = toneVariants(bare)
  if (!variants) return null

  const correctLabel = variants[tone - 1]
  const choices: Choice[] = variants.map((label, i) => ({ label, sub: `النبرة ${i + 1}` }))
  const shuffled = ctx.rng.shuffle(choices)
  return {
    kind: 'tone-discriminate',
    mode: 'recognise',
    source: 'practice',
    unit: ctx.ref,
    wordIds: [word.id],
    syllable: bare,
    target: correctLabel,
    correctTone: tone as 1 | 2 | 3 | 4,
    question: {
      choices: shuffled,
      correct: shuffled.findIndex((c) => c.label === correctLabel),
      explanation: `${word.zh} تُنطق «${word.pinyin}» — بالنبرة ${tone}.`,
    },
  } as Draft
}

function pinyinMatch(ctx: Ctx, words: VocabWord[]): Draft | null {
  const pairs = words.slice(0, 5).map((w) => ({
    wordId: w.id, zh: w.zh, pinyin: w.pinyin, meaning: w.meaning,
  }))
  if (pairs.length < 3) return null
  return {
    kind: 'pinyin-match',
    mode: 'recognise',
    source: 'practice',
    unit: ctx.ref,
    wordIds: pairs.map((p) => p.wordId),
    pairs,
  } as Draft
}

function pronounce(ctx: Ctx, word: VocabWord): Draft {
  return {
    kind: 'pronounce',
    mode: 'produce',
    source: 'practice',
    unit: ctx.ref,
    wordIds: [word.id],
    targetZh: word.zh,
    targetPinyin: word.pinyin,
    meaning: word.meaning,
    scope: 'word',
    passScore: PRONOUNCE_PASS,
  } as Draft
}

function imageMatch(ctx: Ctx, word: VocabWord): Draft | null {
  const pictures = ctx.content.pictures
  const match = pictures.find((p) => p.zh === word.zh)
  if (!match) return null
  const question = multipleChoice(
    ctx,
    { label: word.zh, sub: word.pinyin, wordId: word.id },
    distractorsFor(ctx, word, (w) => w.zh),
    `${match.emoji} = ${word.zh} (${word.pinyin}) — ${word.meaning}`,
  )
  if (!question) return null
  return {
    kind: 'image-match',
    mode: 'recognise',
    source: 'practice',
    unit: ctx.ref,
    wordIds: [word.id],
    emoji: match.emoji,
    category: match.category,
    question,
  } as Draft
}

function grammarBrief(ctx: Ctx, grammarId: number): Draft | null {
  const rule = ctx.content.grammar.find((g) => g.id === grammarId)
  if (!rule) return null
  return {
    kind: 'grammar-brief',
    mode: 'present',
    source: 'new',
    unit: ctx.ref,
    wordIds: [],
    grammarId,
    titleAr: rule.titleAr || rule.title,
    description: rule.description,
    pattern: rule.pattern,
    examples: (rule.examples ?? []).slice(0, 2).map((e) => ({ zh: e.zh, pinyin: e.pinyin, ar: e.ar })),
  } as Draft
}

function grammarApply(ctx: Ctx, grammarId: number): Draft | null {
  const rule = ctx.content.grammar.find((g) => g.id === grammarId)
  const example = rule?.examples?.[0]
  if (!rule || !example) return null

  // Ask which sentence follows the pattern. The wrong answers are other rules'
  // examples, so the question tests the pattern rather than the vocabulary.
  const others = ctx.content.grammar
    .filter((g) => g.id !== grammarId)
    .flatMap((g) => g.examples ?? [])
    .filter((e) => e.zh && e.zh !== example.zh)
  const distractors = ctx.rng.sample(others, DISTRACTORS).map((e) => ({ label: e.zh, sub: e.pinyin }))
  const question = multipleChoice(
    ctx,
    { label: example.zh, sub: example.pinyin },
    distractors,
    `${rule.pattern} — ${example.ar}`,
  )
  if (!question) return null
  return {
    kind: 'grammar-apply',
    mode: 'produce',
    source: 'practice',
    unit: ctx.ref,
    wordIds: [],
    grammarId,
    prompt: `أي جملة تتبع القاعدة: ${rule.titleAr || rule.title}؟`,
    question,
  } as Draft
}

function sentenceOrder(ctx: Ctx, sentence: SentenceRef, wordIds: number[]): Draft | null {
  // Split on the characters, grouped into 2-char chunks where the sentence's
  // own words allow — a 12-token drag puzzle is a memory test, not a grammar one.
  const chars = hanziOf(sentence.zh)
  if (chars.length < 3 || chars.length > 12) return null
  const tokens: string[] = []
  const zhWords = pickWords(ctx, wordIds).map((w) => w.zh).filter((z) => z.length > 1)
  let rest = chars.join('')
  while (rest.length > 0) {
    const hit = zhWords.find((w) => rest.startsWith(w))
    if (hit) { tokens.push(hit); rest = rest.slice(hit.length) }
    else { tokens.push(rest[0]); rest = rest.slice(1) }
  }
  if (tokens.length < 3) return null

  const order = ctx.rng.shuffle(tokens.map((_, i) => i))
  return {
    kind: 'sentence-order',
    mode: 'produce',
    source: 'practice',
    unit: ctx.ref,
    wordIds,
    tokens: order.map((i) => tokens[i]),
    // `correctOrder[k]` = where the k-th displayed token belongs.
    correctOrder: order.map((i) => i),
    sentence,
  } as Draft
}

function fillBlank(ctx: Ctx, sentence: SentenceRef, word: VocabWord): Draft | null {
  if (!sentence.zh.includes(word.zh)) return null
  const question = multipleChoice(
    ctx,
    { label: word.zh, sub: word.pinyin, wordId: word.id },
    distractorsFor(ctx, word, (w) => w.zh),
    `${sentence.zh} — ${sentence.ar}`,
  )
  if (!question) return null
  return {
    kind: 'fill-blank',
    mode: 'produce',
    source: 'practice',
    unit: ctx.ref,
    wordIds: [word.id],
    masked: sentence.zh.replace(word.zh, '____'),
    pinyin: sentence.pinyin,
    ar: sentence.ar,
    question,
  } as Draft
}

function translate(ctx: Ctx, sentence: SentenceRef, wordIds: number[], direction: 'zh-to-ar' | 'ar-to-zh'): Draft | null {
  const lesson = ctx.content.lessons.find((l) => l.id === ctx.ref.lesson)
  const others = (lesson?.keySentences ?? [])
    .filter((s) => s.zh !== sentence.zh)
    .map((s) => ({ zh: s.zh, pinyin: s.pinyin, ar: s.arabic }))
  const toArabic = direction === 'zh-to-ar'
  const distractors = ctx.rng
    .sample(others, DISTRACTORS)
    .map((s) => ({ label: toArabic ? s.ar : s.zh, sub: toArabic ? undefined : s.pinyin }))
  const question = multipleChoice(
    ctx,
    { label: toArabic ? sentence.ar : sentence.zh, sub: toArabic ? undefined : sentence.pinyin },
    distractors,
    `${sentence.zh} (${sentence.pinyin}) — ${sentence.ar}`,
  )
  if (!question) return null
  return {
    kind: 'translate',
    mode: 'produce',
    source: 'practice',
    unit: ctx.ref,
    wordIds,
    direction,
    prompt: toArabic ? sentence.zh : sentence.ar,
    promptSub: toArabic ? sentence.pinyin : undefined,
    question,
  } as Draft
}

function roleplay(ctx: Ctx): Draft | null {
  const lesson = ctx.content.lessons.find((l) => l.id === ctx.ref.lesson)
  const conversations = lesson?.conversations ?? []
  if (conversations.length === 0) return null
  const conv = ctx.rng.pick(conversations)
  // Need a cue and a reply: the learner answers turn N given turn N-1.
  if (!conv || conv.turns.length < 2) return null
  const at = 1 + ctx.rng.int(conv.turns.length - 1)
  const cue = conv.turns[at - 1]
  const answer = conv.turns[at]

  const others = conversations
    .flatMap((c) => c.turns)
    .filter((t) => t.zh !== answer.zh && t.zh !== cue.zh)
  const distractors = ctx.rng.sample(others, DISTRACTORS).map((t) => ({ label: t.zh, sub: t.pinyin }))
  const question = multipleChoice(
    ctx,
    { label: answer.zh, sub: answer.pinyin },
    distractors,
    `${answer.zh} — ${answer.arabic}`,
  )
  if (!question) return null
  return {
    kind: 'roleplay',
    mode: 'produce',
    source: 'practice',
    unit: ctx.ref,
    wordIds: ctx.unit.wordIds,
    conversationId: 0,
    scene: conv.scene,
    prompt: `بماذا يردّ ${answer.name}؟`,
    cue: { zh: cue.zh, pinyin: cue.pinyin, ar: cue.arabic, speaker: cue.name },
    question,
  } as Draft
}

function storyExcerpt(ctx: Ctx): Draft | null {
  const all = ctx.content.stories.filter((s) => s.questions.length > 0)
  if (all.length === 0) return null
  // Pick the story that uses most of this unit's characters — the excerpt
  // should read like a use of what was just learned, not a random passage.
  const unitChars = new Set(ctx.unit.hanzi)
  const scored = all.map((s) => ({
    story: s,
    hits: s.lines.reduce((n, l) => n + hanziOf(l.zh).filter((c) => unitChars.has(c)).length, 0),
  }))
  scored.sort((a, b) => b.hits - a.hits)
  const story = scored[0].hits > 0 ? scored[0].story : ctx.rng.pick(all)
  if (!story) return null

  const q = ctx.rng.pick(story.questions)
  if (!q || q.options.length < 2) return null
  const start = ctx.rng.int(Math.max(1, story.lines.length - 3))
  const choices: Choice[] = q.options.map((label) => ({ label }))
  const correctLabel = q.options[q.correct]
  const shuffled = ctx.rng.shuffle(choices)
  return {
    kind: 'story-excerpt',
    mode: 'recognise',
    source: 'practice',
    unit: ctx.ref,
    wordIds: ctx.unit.wordIds,
    storyId: story.id,
    titleAr: story.titleAr,
    lines: story.lines.slice(start, start + 3),
    question: {
      choices: shuffled,
      correct: shuffled.findIndex((c) => c.label === correctLabel),
      explanation: `من القصة: ${story.titleAr}`,
    },
  } as Draft
}

function dailyQa(ctx: Ctx): Draft | null {
  const items = ctx.content.qa
  const item = ctx.rng.pick(items)
  if (!item) return null
  return {
    kind: 'daily-qa',
    mode: 'produce',
    source: 'practice',
    unit: ctx.ref,
    wordIds: [],
    ask: item.question,
    modelAnswer: item.answer,
    hint: 'أجب بأسلوبك، ثم قارن بالإجابة النموذجية.',
  } as Draft
}

const GAMES: { id: GameId; titleAr: string }[] = [
  { id: 'match', titleAr: 'طابِق الكلمات' },
  { id: 'memory', titleAr: 'لعبة الذاكرة' },
  { id: 'tone-catch', titleAr: 'التقط النبرة' },
  { id: 'speed-recall', titleAr: 'استدعاء سريع' },
]

function gameBreak(ctx: Ctx, poolWordIds: number[]): Draft {
  const game = GAMES[ctx.rng.int(GAMES.length)]
  return {
    kind: 'game-break',
    mode: 'break',
    source: 'practice',
    unit: ctx.ref,
    wordIds: [],
    game: game.id,
    titleAr: game.titleAr,
    poolWordIds,
  } as Draft
}

function examStyle(ctx: Ctx, count: number): Draft[] {
  const bank = ctx.content.exam
  if (bank.length === 0) return []
  return ctx.rng.sample(bank, count).map((item) => {
    const choices: Choice[] = item.options.map((label) => ({ label }))
    const correctLabel = item.options[item.correct]
    const shuffled = ctx.rng.shuffle(choices)
    return {
      kind: 'exam-style',
      mode: 'produce',
      source: 'assessment',
      unit: ctx.ref,
      wordIds: [],
      format: item.section === 'listening' ? 'listening-image' : 'reading-match',
      prompt: item.promptAr,
      stimulus: item.stimulus,
      stimulusPinyin: item.stimulusPinyin,
      question: {
        choices: shuffled,
        correct: shuffled.findIndex((c) => c.label === correctLabel),
        explanation: item.explanationAr,
      },
    } as Draft
  })
}

// ── Scheduling ──────────────────────────────────────────────────────────────

/**
 * Reorder one phase so no kind repeats more than `MAX_KIND_RUN` times in a row.
 *
 * Order within a phase is negotiable; the phase boundaries are not, so this is
 * only ever called on one phase and never moves an item across one. Items of
 * the same kind keep their relative order.
 *
 * The strategy is "most remaining first", not "first available". Taking the
 * first non-matching item leaves a phase of eight picture drills and four
 * separators looking like `sep sep sep img img img sep img img img img` — the
 * separators are spent early and the tail clumps anyway. Always emitting from
 * the kind with the most left to place spreads the scarce kinds across the
 * whole phase, and is the standard optimal greedy for this problem.
 *
 * When a phase is genuinely almost all one kind, the run stands: reordering
 * cannot invent variety the content does not have.
 */
function breakUpRuns(drafts: Draft[]): Draft[] {
  const buckets = new Map<ActivityKind, Draft[]>()
  for (const d of drafts) {
    const list = buckets.get(d.kind)
    if (list) list.push(d)
    else buckets.set(d.kind, [d])
  }

  const out: Draft[] = []
  let lastKind: ActivityKind | null = null
  let run = 0

  while (out.length < drafts.length) {
    const candidates = [...buckets.entries()].filter(([, list]) => list.length > 0)
    if (candidates.length === 0) break

    const blocked = lastKind !== null && run >= MAX_KIND_RUN ? lastKind : null
    const allowed = candidates.filter(([kind]) => kind !== blocked)
    // Nothing but the blocked kind is left — emit it rather than drop items.
    const from = (allowed.length > 0 ? allowed : candidates).sort((a, b) => b[1].length - a[1].length)[0]

    const next = from[1].shift() as Draft
    run = next.kind === lastKind ? run + 1 : 1
    lastKind = next.kind
    out.push(next)
  }
  return out
}

/**
 * Cut a stream down to `budget`, taking from the most over-represented kind
 * first and always from the END of that kind's run.
 *
 * Two things are never cut:
 *   * `word-intro` — every new word of the unit must be presented, or the unit
 *     silently stops teaching some of its own vocabulary;
 *   * the last remaining instance of any kind — losing the only roleplay to fit
 *     a budget is how a unit quietly turns back into a flashcard deck.
 *
 * So the cut always lands on the fourth `fill-blank` or the ninth
 * `word-recall`, never on the one drill of a kind the unit has.
 */
function trimToBudget(drafts: Draft[], budget: number): Draft[] {
  if (drafts.length <= budget) return drafts

  const counts = new Map<ActivityKind, number>()
  for (const d of drafts) counts.set(d.kind, (counts.get(d.kind) ?? 0) + 1)

  const doomed = new Set<Draft>()
  let over = drafts.length - budget

  while (over > 0) {
    // The kind with the most instances left, ignoring what may not be cut.
    let victim: ActivityKind | null = null
    let most = 1
    for (const [kind, n] of counts) {
      if (kind === 'word-intro') continue
      if (n > most) { most = n; victim = kind }
    }
    if (!victim) break // nothing left with a spare instance

    for (let i = drafts.length - 1; i >= 0; i--) {
      if (drafts[i].kind === victim && !doomed.has(drafts[i])) {
        doomed.add(drafts[i])
        counts.set(victim, most - 1)
        over--
        break
      }
    }
  }

  return drafts.filter((d) => !doomed.has(d))
}

/** Drop the nulls and stamp the ids the UI keys on. */
function finalise(drafts: (Draft | null)[], unitKeyStr: string): Activity[] {
  const kept = drafts.filter((d): d is Draft => d !== null)
  return kept.map((draft, index) => ({
    ...draft,
    id: `${unitKeyStr}#${index}-${draft.kind}`,
    index,
  })) as Activity[]
}

/** Words from earlier units that SM-2 says are due today. */
function dueReviewWords(ctx: Ctx): VocabWord[] {
  const now = Date.now()
  const own = new Set(ctx.unit.wordIds)
  const due = Object.values(ctx.learner.srsCards)
    .filter((card) => !own.has(card.wordId))
    .filter((card) => !card.nextReview || Date.parse(card.nextReview) <= now)
    // Most overdue first: the card that has been waiting longest is the one
    // closest to being forgotten.
    .sort((a, b) => Date.parse(a.nextReview ?? '0') - Date.parse(b.nextReview ?? '0'))
    .slice(0, MAX_REVIEW_PER_UNIT)
  return pickWords(ctx, due.map((c) => c.wordId))
}

export interface BuildOptions {
  /** Override the deterministic seed. Defaults to the learner's. */
  seed?: number
  /** Skip the closing exam block even on a lesson's last unit. */
  skipExam?: boolean
}

/**
 * The stream for one unit.
 *
 * Pure: same unit + same learner state + same seed ⇒ identical array, down to
 * the position of every distractor.
 */
export function buildActivityStream(
  unit: Unit,
  learner: LearnerState,
  content: LevelContent,
  options: BuildOptions = {},
): Activity[] {
  const ref = unit.ref
  const seed = options.seed ?? learner.seed
  const rng = makeRng(seed, unit.key)

  const ctx: Ctx = {
    unit,
    ref,
    rng,
    words: [],
    pool: content.vocabulary,
    learner,
    content,
  }

  const words = pickWords(ctx, unit.wordIds)
  // No words means the viewer may not see this unit's content. An empty stream
  // is the honest answer; the screen shows its locked state rather than a
  // session made of nothing.
  if (words.length === 0) return []
  ctx.words = words

  const lesson = content.lessons.find((l) => l.id === ref.lesson)
  const keySentences = (unit.keySentenceIndices ?? [])
    .map((i) => lesson?.keySentences?.[i])
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({ zh: s.zh, pinyin: s.pinyin, ar: s.arabic }))

  // ── Phase 1: present, in batches, each batch recalled before the next. ──
  //
  // Not "here are eight new words, now answer eight questions". Six word-intro
  // cards back to back is the exact monotony the variety rule exists to stop,
  // and a word met eight cards ago is gone by the time it is asked for. Two new
  // words, then those two recalled, then the next two: the gap between meeting
  // a word and needing it stays short, which is when a first repetition sticks.
  const PRESENT_BATCH = 2
  const present: (Draft | null)[] = []
  for (let start = 0; start < words.length; start += PRESENT_BATCH) {
    const batch = words.slice(start, start + PRESENT_BATCH)
    for (const [i, w] of batch.entries()) {
      present.push(wordIntro(ctx, w, start + i + 1, words.length))
    }
    for (const w of batch) present.push(wordRecall(ctx, w, 'zh-to-ar', 'new'))
  }
  const brief = unit.grammarIds[0] != null ? grammarBrief(ctx, unit.grammarIds[0]) : null
  if (brief) present.push(brief)

  // ── Phase 2: recognise. Sound, tone, picture, and a passage using them. ──
  const recognise: (Draft | null)[] = []
  recognise.push(pinyinMatch(ctx, words))
  for (const w of rng.sample(words, 2)) recognise.push(toneDiscriminate(ctx, w))
  for (const w of words) recognise.push(imageMatch(ctx, w))
  recognise.push(storyExcerpt(ctx))

  // ── Phase 3: produce. Write it, say it, build with it. ──
  const produce: (Draft | null)[] = []
  const writable = words
    .flatMap((w) => hanziOf(w.zh).map((char) => ({ w, char })))
    .filter((x, i, arr) => arr.findIndex((y) => y.char === x.char) === i)
  for (const { w, char } of rng.sample(writable, MAX_WRITE_PER_UNIT)) {
    produce.push(hanziWrite(ctx, w, char))
  }
  for (const w of words) produce.push(wordRecall(ctx, w, 'ar-to-zh', 'practice'))
  for (const w of rng.sample(words, 2)) produce.push(pronounce(ctx, w))
  for (const sentence of keySentences.slice(0, 2)) {
    produce.push(sentenceOrder(ctx, sentence, unit.wordIds))
  }
  for (const w of words) {
    const s = keySentences.find((k) => k.zh.includes(w.zh)) ?? firstSentence(w)
    if (s) produce.push(fillBlank(ctx, s, w))
  }
  if (keySentences[0]) produce.push(translate(ctx, keySentences[0], unit.wordIds, 'ar-to-zh'))
  if (unit.grammarIds[0] != null) produce.push(grammarApply(ctx, unit.grammarIds[0]))
  produce.push(roleplay(ctx))
  produce.push(dailyQa(ctx))

  // ── Interleaving: review and remediation, mixed into the produce phase. ──
  for (const w of dueReviewWords(ctx)) recognise.push(wordRecall(ctx, w, 'zh-to-ar', 'review'))
  const missed = pickWords(ctx, learner.missedWordIds.slice(0, MAX_REMEDIATION_PER_UNIT))
  for (const w of missed) produce.push(wordRecall(ctx, w, 'ar-to-zh', 'remediation'))

  // ── Assembly ──
  //
  // Order matters here and got it wrong once: trimming AFTER interleaving
  // reopens the runs the interleaver had just broken up, because removing the
  // fourth `fill-blank` can leave three of them adjacent. So each phase is
  // trimmed to its share of the budget FIRST, then interleaved, and the phase
  // boundaries are preserved throughout — a produce drill must never precede
  // the presentation it depends on.
  const phases = [
    present.filter((d): d is Draft => d !== null),
    recognise.filter((d): d is Draft => d !== null),
    produce.filter((d): d is Draft => d !== null),
  ]
  const total = phases.reduce((n, p) => n + p.length, 0)
  let body: Draft[] = []
  if (total <= MAX_ACTIVITIES_PER_UNIT) {
    body = phases.flatMap(breakUpRuns)
  } else {
    // The presentation phase is never squeezed: it is one card per new word
    // plus its first recall, and cutting it means not teaching a word the unit
    // claims to teach. The budget comes out of recognise and produce.
    const presentSize = phases[0].length
    const spare = Math.max(0, MAX_ACTIVITIES_PER_UNIT - presentSize)
    const drillTotal = phases[1].length + phases[2].length
    const share = (n: number) => (drillTotal === 0 ? 0 : Math.round((n / drillTotal) * spare))
    body = [
      ...breakUpRuns(phases[0]),
      ...breakUpRuns(trimToBudget(phases[1], share(phases[1].length))),
      ...breakUpRuns(trimToBudget(phases[2], spare - share(phases[1].length))),
    ]
  }

  // The lesson's last unit closes with exam-format items. Added AFTER the trim
  // so the assessment is never what gets cut to fit.
  if (unit.carriesExam && !options.skipExam) body = [...body, ...examStyle(ctx, 3)]

  // Game breaks go in last, so their spacing counts real activities.
  let breaksUsed = 0
  const withBreaks: Draft[] = []
  for (const [i, draft] of body.entries()) {
    const spaced = i > 0 && i % GAME_BREAK_EVERY === 0
    const roomLeft = i < body.length - 2
    if (spaced && roomLeft && breaksUsed < MAX_GAME_BREAKS) {
      withBreaks.push(gameBreak(ctx, unit.wordIds))
      breaksUsed++
    }
    withBreaks.push(draft)
  }

  return finalise(withBreaks, unit.key)
}
