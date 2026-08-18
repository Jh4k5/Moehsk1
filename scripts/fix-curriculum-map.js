const fs = require('fs');
const path = require('path');
const { load, ROOT } = require('./ts-load');

const vocab   = load('src/data/vocabulary.ts').vocabulary;
const lessons = load('src/data/lessons.ts').lessons;

// ── Decisions (evidence in scripts/audit-lesson-map.js + dup-compare.js) ──
const DELETE_DUPS   = [303, 304, 329, 338, 366];        // keep the richer lower id
const ORPHAN_LESSON = { 38:1, 41:1, 46:1, 47:1, 48:1, 55:1, 151:1, 32:1, 40:1, 68:2, 73:3, 33:11 };

// ── Canonical map: curated vocabularyIds wins, orphans placed by evidence ──
const canon = new Map();
for (const l of lessons)
  for (const id of l.vocabularyIds || [])
    if (!DELETE_DUPS.includes(id)) canon.set(id, l.id);
for (const [id, les] of Object.entries(ORPHAN_LESSON)) canon.set(Number(id), les);

const kept = vocab.filter(w => !DELETE_DUPS.includes(w.id));
const missing = kept.filter(w => !canon.has(w.id));
if (missing.length) { console.error('UNMAPPED:', missing.map(w=>`${w.id}/${w.zh}`)); process.exit(1); }

// ── 1. Rewrite lessons.ts vocabularyIds ──
const perLesson = new Map(lessons.map(l => [l.id, []]));
for (const [wid, lid] of [...canon].sort((a,b)=>a[0]-b[0])) perLesson.get(lid).push(wid);

let lsrc = fs.readFileSync(path.join(ROOT,'src/data/lessons.ts'),'utf8');
let lessonIdx = 0;
lsrc = lsrc.replace(/vocabularyIds: \[[^\]]*\]/g, () => {
  const l = lessons[lessonIdx++];
  return `vocabularyIds: [${perLesson.get(l.id).join(', ')}]`;
});
if (lessonIdx !== lessons.length) { console.error('lesson replace count mismatch', lessonIdx); process.exit(1); }
fs.writeFileSync(path.join(ROOT,'src/data/lessons.ts'), lsrc);

// ── 2. Rewrite vocabulary.ts: sync lesson field, drop duplicate rows ──
let vsrc = fs.readFileSync(path.join(ROOT,'src/data/vocabulary.ts'),'utf8');
const out = [];
let dropped = 0, synced = 0;
for (const line of vsrc.split('\n')) {
  const m = line.match(/^\{id:(\d+),/);
  if (!m) { out.push(line); continue; }
  const id = Number(m[1]);
  if (DELETE_DUPS.includes(id)) { dropped++; continue; }
  const want = canon.get(id);
  const cur  = /lesson:\s*(\d+)/.exec(line);
  if (cur && Number(cur[1]) !== want) synced++;
  out.push(cur ? line.replace(/lesson:\s*\d+/, `lesson: ${want}`)
               : line.replace(/^\{id:(\d+),/, `{id:$1, lesson: ${want},`));
  if (!cur) synced++;
}
fs.writeFileSync(path.join(ROOT,'src/data/vocabulary.ts'), out.join('\n'));

console.log(`lessons.ts  → ${lessons.length} vocabularyIds arrays rewritten`);
console.log(`vocabulary.ts → ${dropped} duplicate rows deleted, ${synced} lesson fields synced`);
console.log(`\nfinal distribution:`);
for (const l of lessons) console.log(`  L${String(l.id).padStart(2)} ${String(perLesson.get(l.id).length).padStart(3)} words   ${l.title}`);
console.log(`  TOTAL ${canon.size} words`);
