#!/usr/bin/env node
/**
 * apply-mnemonics3.js — fill the empty `mnemonic` field of the HSK3 words
 * from scripts/translations/hsk3-mnemonic-*.json (batches merged in order).
 * Only an EMPTY mnemonic is written to, so re-running is safe and an already
 * authored hook is never overwritten.
 */
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./ts-load');

const DIR = path.join(ROOT, 'scripts/translations');
const batches = fs.readdirSync(DIR).filter((f) => /^hsk3-mnemonic-\d+\.json$/.test(f)).sort();

const tr = {};
for (const b of batches) {
  const part = JSON.parse(fs.readFileSync(path.join(DIR, b), 'utf8'));
  for (const [id, text] of Object.entries(part)) {
    if (tr[id]) console.log(`  ! id ${id} appears twice — ${b} wins`);
    tr[id] = text;
  }
  console.log(`  ${b}: ${Object.keys(part).length}`);
}
console.log(`${batches.length} batch file(s), ${Object.keys(tr).length} mnemonic(s) ready`);

const rel = 'src/data/hsk3/vocabulary3.ts';
const file = path.join(ROOT, rel);
const out = [];
let applied = 0, skipped = 0;
for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
  const m = line.match(/^\s*\{id:\s*(\d+),/);
  if (!m || !tr[m[1]]) { out.push(line); continue; }
  const rep = line.replace(/mnemonic:\s*(['"])\1/, () => { applied++; return `mnemonic:${JSON.stringify(tr[m[1]])}`; });
  if (rep === line) skipped++;
  out.push(rep);
}
fs.writeFileSync(file, out.join('\n'));
console.log(`${rel}: ${applied} mnemonic(s) applied${skipped ? `, ${skipped} already had one` : ''}`);
