const { load } = require('./ts-load');
const vocab = load('src/data/vocabulary.ts').vocabulary;
const lessons = load('src/data/lessons.ts').lessons;
const inLesson = new Map();
for (const l of lessons) for (const i of l.vocabularyIds||[]) inLesson.set(i, l.id);
const byId = new Map(vocab.map(w=>[w.id,w]));

const PAIRS = [[32,304],[40,303],[251,338],[292,366],[302,329]];
const richness = w => (w.s2?1:0)+(w.s3?1:0)+(w.radicals?.length?1:0)+(w.mnemonic?1:0)+(w.sentences?.length||0);

for (const pair of PAIRS) {
  console.log(`\n── ${byId.get(pair[0]).zh} ──`);
  for (const id of pair) {
    const w = byId.get(id);
    console.log(`  #${String(id).padStart(3)}  lesson-list=${inLesson.has(id)?'L'+inLesson.get(id):'ORPHAN'}  field=${w.lesson}  richness=${richness(w)}  sentences=${w.sentences?.length}  radicals=[${w.radicals}]  freq=${w.frequencyRank}`);
  }
}
