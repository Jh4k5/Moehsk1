#!/usr/bin/env node
/**
 * Content validator — the quality gate for all authored content.
 * Run: node scripts/validate-content.js   (exit 1 on any error)
 */
const { load } = require('./ts-load');

const AR = /[؀-ۿ]/;
const LAT = /[A-Za-z]/;
const HAN = /[一-鿿]/;
const TONE_MARK = {
  1: 'āēīōūǖ', 2: 'áéíóúǘ', 3: 'ǎěǐǒǔǚ', 4: 'àèìòùǜ',
};

const errors = [];
const warns  = [];
const err  = (scope, msg) => errors.push(`${scope}: ${msg}`);
const warn = (scope, msg) => warns.push(`${scope}: ${msg}`);

const LEVELS = [
  { n:1, vocab:['src/data/vocabulary.ts','vocabulary'],           lessons:['src/data/lessons.ts','lessons'],            range:[1,999]     },
  { n:2, vocab:['src/data/hsk2/vocabulary2.ts','vocabulary2'],    lessons:['src/data/hsk2/lessons2.ts','lessons2'],     range:[2001,2999] },
  { n:3, vocab:['src/data/hsk3/vocabulary3.ts','vocabulary3'],    lessons:['src/data/hsk3/lessons3.ts','lessons3'],     range:[3001,3999] },
];

for (const L of LEVELS) {
  const S = `HSK${L.n}`;
  const vocab   = load(L.vocab[0])[L.vocab[1]];
  const lessons = load(L.lessons[0])[L.lessons[1]];

  // ── ids ──────────────────────────────────────────────────
  const seenId = new Set(), seenZh = new Map();
  for (const w of vocab) {
    if (seenId.has(w.id)) err(S, `duplicate id ${w.id}`);
    seenId.add(w.id);
    if (w.id < L.range[0] || w.id > L.range[1]) err(S, `id ${w.id} (${w.zh}) outside range ${L.range}`);
    if (seenZh.has(w.zh)) err(S, `duplicate word ${w.zh} (#${seenZh.get(w.zh)} and #${w.id})`);
    seenZh.set(w.zh, w.id);
  }

  // ── language integrity ───────────────────────────────────
  for (const w of vocab) {
    if (!AR.test(w.meaning))                 err(S, `#${w.id} ${w.zh}: meaning is not Arabic — "${w.meaning}"`);
    if (w.exEn && AR.test(w.exEn))           err(S, `#${w.id} ${w.zh}: exEn contains Arabic — "${w.exEn}"`);
    if (w.english && AR.test(w.english))     err(S, `#${w.id} ${w.zh}: english contains Arabic`);
    if (!HAN.test(w.zh))                     err(S, `#${w.id}: zh has no Han characters — "${w.zh}"`);
    for (const [i, s] of (w.sentences || []).entries()) {
      if (!HAN.test(s.zh))                          err(S, `#${w.id} sentence[${i}] has no Chinese`);
      if (!AR.test(s.ar) && LAT.test(s.ar))         err(S, `#${w.id} ${w.zh}: sentence[${i}].ar is not Arabic — "${s.ar}"`);
      if (!s.pinyin)                                err(S, `#${w.id} sentence[${i}] missing pinyin`);
    }
  }

  // ── lesson mapping must be single-sourced ────────────────
  const byField = new Map(vocab.filter(w=>w.lesson!=null).map(w=>[w.id,w.lesson]));
  const byList  = new Map();
  for (const l of lessons) for (const id of (l.vocabularyIds||[])) {
    if (byList.has(id)) err(S, `word #${id} listed in lessons ${byList.get(id)} and ${l.id}`);
    byList.set(id, l.id);
  }
  for (const w of vocab) {
    if (!byList.has(w.id))                     err(S, `#${w.id} ${w.zh} belongs to no lesson`);
    else if (byField.get(w.id) !== byList.get(w.id))
      err(S, `#${w.id} ${w.zh}: word.lesson=${byField.get(w.id)} but listed in lesson ${byList.get(w.id)}`);
  }
  for (const [id] of byList) if (!seenId.has(id)) err(S, `lesson list references unknown word id ${id}`);

  // ── lesson size sanity (units are cut from these) ────────
  for (const l of lessons) {
    const n = (l.vocabularyIds||[]).length;
    if (n === 0)  err(S, `lesson ${l.id} has no vocabulary`);
    if (n > 45)   warn(S, `lesson ${l.id} has ${n} words — will need more units`);
  }
}

// ── tone pairs: syllable + tone mark must agree ────────────
{
  const S = 'tonePairs';
  const tp = load('src/data/hsk1/extras.ts').tonePairs;
  for (const set of tp) for (const t of set.tones) {
    const base = t.pinyin.normalize('NFD').replace(/[̀-ͯ]/g,'');
    if (base !== set.syllable) err(S, `${t.char} "${t.pinyin}" is syllable "${base}", listed under "${set.syllable}"`);
    const marks = TONE_MARK[t.tone];
    if (marks && ![...marks].some(c=>t.pinyin.includes(c)))
      err(S, `${t.char} "${t.pinyin}" declared tone ${t.tone} but carries no tone-${t.tone} mark`);
  }
}

// ── roadmap must reference real words ──────────────────────
{
  const S = 'roadmap';
  const vocab = load('src/data/vocabulary.ts').vocabulary;
  const valid = new Set(vocab.map(w=>w.id));
  const units = load('src/data/hsk1/extras.ts').roadmapUnits;
  const covered = new Set();
  for (const u of units) for (const id of u.words) {
    if (!valid.has(id)) err(S, `unit ${u.id} references unknown word id ${id}`);
    covered.add(id);
  }
  const gap = valid.size - [...covered].filter(i=>valid.has(i)).length;
  if (gap) warn(S, `${gap} of ${valid.size} HSK1 words are not covered by any roadmap unit`);
}

// ── report ─────────────────────────────────────────────────
const line = '─'.repeat(64);
if (warns.length) {
  console.log(`\n${line}\nWARNINGS (${warns.length})\n${line}`);
  for (const w of warns) console.log('  ⚠ ' + w);
}
if (errors.length) {
  console.log(`\n${line}\nERRORS (${errors.length})\n${line}`);
  for (const e of errors.slice(0,60)) console.log('  ✗ ' + e);
  if (errors.length > 60) console.log(`  … and ${errors.length-60} more`);
  console.log(`\n✗ content validation FAILED — ${errors.length} error(s)\n`);
  process.exit(1);
}
console.log(`\n✓ content validation passed — 0 errors, ${warns.length} warning(s)\n`);
