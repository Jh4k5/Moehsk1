const { load } = require('./ts-load');
const vocab = load('src/data/vocabulary.ts').vocabulary;
const lessons = load('src/data/lessons.ts').lessons;
const byId = new Map(vocab.map(w=>[w.id,w]));

function lines(l){
  const out=[];
  for (const s of l.keySentences||[]) out.push(['جملة', s.zh]);
  for (const c of l.conversations||[]) for (const t of c.turns||[]) out.push(['محادثة', t.zh]);
  for (const e of l.exercises||[]) { if(e.q) out.push(['تمرين', e.q]); }
  return out;
}
for (const [id, L] of [[38,1],[41,1],[46,1],[47,1],[48,1],[55,1],[151,1],[68,2],[73,3],[33,11]]) {
  const w = byId.get(id);
  const les = lessons.find(x=>x.id===L);
  const hit = lines(les).filter(([,t])=>t.includes(w.zh)).slice(0,2);
  console.log(`#${id} ${w.zh} → L${L}:  ${hit.map(([k,t])=>`[${k}] ${t}`).join('   |   ')}`);
}
// Where do country words live?
console.log('\nCountry / nationality words and their lesson (per vocabularyIds):');
const inLesson = new Map();
for (const l of lessons) for (const i of l.vocabularyIds||[]) inLesson.set(i, l.id);
for (const w of vocab) if (/国|中文|汉语|人$/.test(w.zh) && w.zh.length<=3)
  console.log(`  ${w.zh.padEnd(5)} #${String(w.id).padStart(3)} → ${inLesson.has(w.id)?'L'+inLesson.get(w.id):'— ORPHAN'}`);
