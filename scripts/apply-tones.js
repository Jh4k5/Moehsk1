#!/usr/bin/env node
/**
 * apply-tones.js — derive each word's `tones` array from its own `pinyin`
 * and rewrite the ones that disagree.
 *
 *   node scripts/apply-tones.js --check    report only, change nothing
 *   node scripts/apply-tones.js            report + rewrite the data files
 *
 * Rules: ā/á/ǎ/à (and ē ī ō ū ǖ …) = 1/2/3/4, a vowel-bearing syllable with
 * no mark = 0 (neutral). One syllable = one vowel cluster, so spaces,
 * apostrophes (nǚ'ér) and consonants all close a syllable, while erhua
 * written into the syllable (yíhuìr) stays one syllable — the array must
 * line up with the pinyin the learner actually sees.
 */
const fs = require('fs');
const path = require('path');
const { ROOT, load } = require('./ts-load');

// ── pinyin → tones ────────────────────────────────────────────
const MARK = { '̄': 1, '́': 2, '̌': 3, '̀': 4 }; // macron acute caron grave
const DIAERESIS = '̈';
const VOWEL = /[aeiouüv]/;

function syllables(pinyin) {
  const out = [];
  let cur = null;
  for (const ch of pinyin.normalize('NFD')) {
    if (MARK[ch] !== undefined) { if (cur) cur.tone = MARK[ch]; continue; }
    if (ch === DIAERESIS) continue;                 // the umlaut of ü carries no tone
    const base = ch.toLowerCase();
    if (VOWEL.test(base)) {
      if (!cur) { cur = { letters: '', tone: 0 }; out.push(cur); }
      cur.letters += base;
    } else {
      cur = null;                                   // consonant, space or ' ends the syllable
    }
  }
  return out;
}
const tonesOf = (pinyin) => syllables(pinyin).map((s) => s.tone);
const same = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

// ── the three vocabulary files ────────────────────────────────
const LEVELS = [
  { n: 1, rel: 'src/data/vocabulary.ts',         key: 'vocabulary'  },
  { n: 2, rel: 'src/data/hsk2/vocabulary2.ts',   key: 'vocabulary2' },
  { n: 3, rel: 'src/data/hsk3/vocabulary3.ts',   key: 'vocabulary3' },
];

const CHECK = process.argv.includes('--check');
const report = {};
let grand = 0;

for (const L of LEVELS) {
  const words = load(L.rel)[L.key];
  const want = new Map();     // id → correct tones
  const lines = [];

  for (const w of words) {
    const derived = tonesOf(w.pinyin);
    if (!derived.length) { console.log(`  ! HSK${L.n} #${w.id} ${w.zh}: pinyin "${w.pinyin}" has no vowel`); continue; }
    if (same(derived, w.tones)) continue;
    want.set(String(w.id), derived);
    lines.push(`  HSK${L.n} #${w.id} ${w.zh} ${w.pinyin}: ${JSON.stringify(w.tones)} → ${JSON.stringify(derived)}`);
  }

  console.log(`\nHSK${L.n} — ${want.size} disagreement(s) of ${words.length} words`);
  for (const l of lines) console.log(l);
  grand += want.size;
  report[`hsk${L.n}`] = Object.fromEntries([...want]);
  if (CHECK || !want.size) continue;

  // rewrite, one line per record, keeping the file's own spacing style
  const file = path.join(ROOT, L.rel);
  const src = fs.readFileSync(file, 'utf8');
  const spaced = (src.match(/tones:\s*\[\d+,\s\d/g) || []).length > (src.match(/tones:\s*\[\d+,\d/g) || []).length;
  const sep = spaced ? ', ' : ',';
  let applied = 0;
  const out = src.split('\n').map((line) => {
    const m = line.match(/^\s*\{id:\s*(\d+),/);
    if (!m || !want.has(m[1])) return line;
    return line.replace(/tones:(\s*)\[[^\]]*\]/, (_all, gap) => {
      applied++;
      return `tones:${gap}[${want.get(m[1]).join(sep)}]`;
    });
  }).join('\n');
  if (applied !== want.size) {
    console.error(`  ✗ HSK${L.n}: matched ${applied} lines but expected ${want.size} — aborting, nothing written`);
    process.exit(1);
  }
  fs.writeFileSync(file, out);
  console.log(`  ✓ ${L.rel}: ${applied} tone array(s) rewritten`);
}

fs.writeFileSync(
  path.join(ROOT, 'scripts/translations/tones-fixes.json'),
  JSON.stringify(report, null, 1) + '\n'
);
console.log(`\n${CHECK ? 'would fix' : 'fixed'} ${grand} tone array(s) in total\n`);
