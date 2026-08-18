const { load } = require('./ts-load');
const vocab = load('src/data/vocabulary.ts').vocabulary;
const lessons = load('src/data/lessons.ts').lessons;
const byId = new Map(vocab.map(w => [w.id, w]));

const ORPHANS = [33,38,32,40,41,46,47,48,55,68,73,151];

// Build per-lesson text corpus: key sentences + conversation turns + exercises
function corpus(l) {
  const parts = [];
  for (const s of l.keySentences || []) parts.push(s.zh);
  for (const c of l.conversations || []) for (const t of c.turns || []) parts.push(t.zh);
  for (const e of l.exercises || []) { parts.push(e.q || ''); for (const o of e.options || []) parts.push(o); }
  return parts.join(' ');
}
const texts = lessons.map(l => ({ id: l.id, title: l.title, text: corpus(l) }));

console.log('Orphan → first lesson whose own text actually uses it\n');
const assign = {};
for (const id of ORPHANS) {
  const w = byId.get(id);
  const hits = texts.filter(t => t.text.includes(w.zh)).map(t => t.id);
  const counts = texts.map(t => ({ id: t.id, n: (t.text.match(new RegExp(w.zh, 'g'))||[]).length })).filter(x=>x.n>0);
  const first = hits.length ? hits[0] : null;
  assign[id] = first;
  console.log(`#${String(id).padStart(3)} ${w.zh.padEnd(4)} ${w.pinyin.padEnd(10)} → ${first ? 'L'+first : 'NOT USED ANYWHERE'}   (appears in: ${counts.map(c=>`L${c.id}×${c.n}`).join(', ') || '—'})`);
}
console.log('\nProposed:', JSON.stringify(assign));
