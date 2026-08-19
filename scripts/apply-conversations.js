#!/usr/bin/env node
/**
 * apply-conversations.js — fills the empty `conversations: []` of every HSK2 /
 * HSK3 lesson from a JSON batch, one turn per line, in the HSK1 house style.
 *
 * GUARD: every Han character of every turn must already have been taught.
 *   - HSK2 lessons may only use characters taught in HSK1 or HSK2.
 *   - HSK3 lessons may use characters taught in HSK1, HSK2 or HSK3.
 * Offenders are named and the script exits 1 WITHOUT writing anything —
 * rewrite the turn with taught vocabulary, never weaken the guard.
 *
 * Usage: node scripts/apply-conversations.js [--check]
 */
const fs = require('fs');
const path = require('path');
const { ROOT, load } = require('./ts-load');

const CHECK_ONLY = process.argv.includes('--check');

const charsOf = (rows) => {
  const s = new Set();
  for (const w of rows) for (const c of w.zh) s.add(c);
  return s;
};
const H1 = charsOf(load('src/data/vocabulary.ts').vocabulary);
const H2 = charsOf(load('src/data/hsk2/vocabulary2.ts').vocabulary2);
const H3 = charsOf(load('src/data/hsk3/vocabulary3.ts').vocabulary3);
const upTo2 = new Set([...H1, ...H2]);
const upTo3 = new Set([...upTo2, ...H3]);

const HAN = /[㐀-䶿一-鿿]/;
const PUNCT = new Set([...'。，、？！：；…—·（）《》〈〉“”‘’ '.split(''), ...'0123456789'.split('')]);

function offendingChars(zh, allowed) {
  const bad = [];
  for (const c of zh) {
    if (PUNCT.has(c)) continue;
    if (!HAN.test(c) || !allowed.has(c)) bad.push(c);
  }
  return [...new Set(bad)];
}

const JOBS = [
  { rel: 'src/data/hsk2/lessons2.ts', json: './translations/hsk2-conversations.json', allowed: upTo2, label: 'HSK1+HSK2' },
  { rel: 'src/data/hsk3/lessons3.ts', json: './translations/hsk3-conversations.json', allowed: upTo3, label: 'HSK1+HSK2+HSK3' },
];

let failures = 0, convs = 0, turns = 0;

for (const job of JOBS) {
  const p = path.join(__dirname, job.json);
  if (!fs.existsSync(p)) continue;
  const batch = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [lessonId, conv] of Object.entries(batch)) {
    convs++;
    if (!conv.id || !conv.title || !conv.scene) {
      failures++;
      console.error(`✗ ${job.rel} lesson ${lessonId}: missing id/title/scene`);
    }
    if (!/^[\p{Extended_Pictographic}]/u.test(conv.scene || '')) {
      failures++;
      console.error(`✗ ${job.rel} lesson ${lessonId}: scene does not start with an emoji — "${conv.scene}"`);
    }
    const n = (conv.turns || []).length;
    if (n < 4 || n > 6) {
      failures++;
      console.error(`✗ ${job.rel} lesson ${lessonId}: ${n} turns (must be 4–6)`);
    }
    for (const t of conv.turns || []) {
      turns++;
      if (!['A', 'B', 'C'].includes(t.speaker) || !t.name || !t.pinyin || !t.arabic) {
        failures++;
        console.error(`✗ ${job.rel} lesson ${lessonId}: turn "${t.zh}" is missing a field`);
      }
      const bad = offendingChars(t.zh || '', job.allowed);
      if (bad.length) {
        failures++;
        console.error(`✗ ${job.rel} lesson ${lessonId}: "${t.zh}" — character(s) not taught in ${job.label}: ${bad.join(' ')}`);
      }
    }
  }
}

if (failures) {
  console.error(`\n✗ ${failures} problem(s) — nothing written. Rewrite with taught vocabulary.`);
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log(`✓ ${convs} محادثة / ${turns} دور — كل الحروف مُدرَّسة (0 حرف خارج المستوى)`);
  process.exit(0);
}

const q = (s) => (/['\\]/.test(s) ? JSON.stringify(s) : `'${s}'`);

for (const job of JOBS) {
  const p = path.join(__dirname, job.json);
  if (!fs.existsSync(p)) continue;
  const batch = JSON.parse(fs.readFileSync(p, 'utf8'));
  const file = path.join(ROOT, job.rel);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const out = [];
  let lessonId = null, applied = 0;

  for (const line of lines) {
    const idm = line.match(/^\s*id:\s*(\d+),\s*title:/);
    if (idm) { lessonId = idm[1]; out.push(line); continue; }

    const cm = line.match(/^(\s*)conversations:\s*\[\],?\s*$/);
    if (!cm || !batch[lessonId]) { out.push(line); continue; }

    const i = cm[1];
    const c = batch[lessonId];
    out.push(`${i}conversations: [`);
    out.push(`${i}  {`);
    out.push(`${i}    id: ${q(c.id)},`);
    out.push(`${i}    title: ${q(c.title)},`);
    out.push(`${i}    scene: ${q(c.scene)},`);
    out.push(`${i}    turns: [`);
    for (const t of c.turns) {
      out.push(`${i}      { speaker: ${q(t.speaker)}, name: ${q(t.name)}, zh: ${q(t.zh)}, pinyin: ${q(t.pinyin)}, arabic: ${q(t.arabic)} },`);
    }
    out.push(`${i}    ],`);
    out.push(`${i}  },`);
    out.push(`${i}],`);
    applied++;
  }

  fs.writeFileSync(file, out.join('\n'));
  console.log(`${job.rel}: ${applied} محادثة طُبِّقت`);
}
