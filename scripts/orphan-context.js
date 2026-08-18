const { load } = require('./ts-load');
const vocab = load('src/data/vocabulary.ts').vocabulary;
const lessons = load('src/data/lessons.ts').lessons;
const byId = new Map(vocab.map(w => [w.id, w]));

console.log('LESSON TITLES + word count + first words\n');
for (const l of lessons) {
  const ws = (l.vocabularyIds||[]).map(i => byId.get(i)).filter(Boolean);
  console.log(`${String(l.id).padStart(2)}. ${l.title}  (${l.titleZh})  [${ws.length} words]`);
  console.log(`    ${ws.slice(0,12).map(w=>w.zh).join(' · ')}`);
}

const ORPHANS = [32,33,38,40,41,46,47,48,55,68,73,151,303,304];
console.log('\n\nORPHANS in detail:\n');
for (const id of ORPHANS) {
  const w = byId.get(id);
  const dup = vocab.filter(x => x.zh === w.zh && x.id !== id).map(x=>x.id);
  console.log(`#${String(id).padStart(3)} ${w.zh.padEnd(5)} ${w.pinyin.padEnd(12)} ${w.pos.padEnd(11)} ${w.meaning}${dup.length?`   ⟵ DUPLICATE of #${dup}`:''}`);
}
