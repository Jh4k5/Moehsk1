const { load } = require('./ts-load');

const LEVELS = [
  { level: 1, vocab: 'src/data/vocabulary.ts',            vKey: 'vocabulary',  lessons: 'src/data/lessons.ts',            lKey: 'lessons'  },
  { level: 2, vocab: 'src/data/hsk2/vocabulary2.ts',      vKey: 'vocabulary2', lessons: 'src/data/hsk2/lessons2.ts',      lKey: 'lessons2' },
  { level: 3, vocab: 'src/data/hsk3/vocabulary3.ts',      vKey: 'vocabulary3', lessons: 'src/data/hsk3/lessons3.ts',      lKey: 'lessons3' },
];

for (const L of LEVELS) {
  const vocab   = load(L.vocab)[L.vKey];
  const lessons = load(L.lessons)[L.lKey];

  // A: word.lesson  →  B: lessons[].vocabularyIds
  const byField = new Map();                       // wordId -> lesson
  for (const w of vocab) if (w.lesson != null) byField.set(w.id, w.lesson);

  const byList = new Map();                        // wordId -> [lessons]
  for (const les of lessons)
    for (const id of (les.vocabularyIds || [])) {
      if (!byList.has(id)) byList.set(id, []);
      byList.get(id).push(les.id);
    }

  const disagree = [], orphanInList = [], dupInList = [], notInAnyLesson = [], unknownId = [];
  const wordById = new Map(vocab.map(w => [w.id, w]));

  for (const w of vocab) {
    const f = byField.get(w.id);
    const l = byList.get(w.id);
    if (!l || l.length === 0) { notInAnyLesson.push({ id: w.id, zh: w.zh, field: f }); continue; }
    if (l.length > 1) dupInList.push({ id: w.id, zh: w.zh, lessons: l });
    if (f != null && !l.includes(f)) disagree.push({ id: w.id, zh: w.zh, field: f, list: l });
  }
  for (const [id] of byList) if (!wordById.has(id)) unknownId.push(id);

  // Per-lesson counts under each source
  const cField = {}, cList = {};
  for (const [, ls] of byField) cField[ls] = (cField[ls] || 0) + 1;
  for (const les of lessons) cList[les.id] = (les.vocabularyIds || []).length;

  console.log(`\n${'='.repeat(70)}\nHSK${L.level}  —  ${vocab.length} words, ${lessons.length} lessons`);
  console.log(`  disagreements ..... ${disagree.length}`);
  console.log(`  in no lesson list . ${notInAnyLesson.length}`);
  console.log(`  in >1 lesson list . ${dupInList.length}`);
  console.log(`  list ids not in vocab ${unknownId.length}${unknownId.length ? ' → ' + unknownId.join(',') : ''}`);
  console.log(`\n  lesson | by word.lesson | by vocabularyIds | delta`);
  const allLes = [...new Set([...Object.keys(cField), ...Object.keys(cList)])].map(Number).sort((a,b)=>a-b);
  for (const id of allLes) {
    const a = cField[id] || 0, b = cList[id] || 0;
    console.log(`  ${String(id).padStart(6)} | ${String(a).padStart(14)} | ${String(b).padStart(16)} | ${a-b > 0 ? '+' : ''}${a-b}`);
  }
  console.log(`  ${'TOTAL'.padStart(6)} | ${String(byField.size).padStart(14)} | ${String([...byList.keys()].length).padStart(16)} |`);

  if (notInAnyLesson.length) {
    console.log(`\n  ORPHANS (no lesson references them; word.lesson says):`);
    for (const o of notInAnyLesson) console.log(`    #${o.id} ${o.zh} → lesson ${o.field}`);
  }
  if (disagree.length) {
    console.log(`\n  DISAGREEMENTS (first 25 of ${disagree.length}):`);
    for (const d of disagree.slice(0, 25))
      console.log(`    #${String(d.id).padStart(4)} ${d.zh.padEnd(6)} field=${String(d.field).padStart(2)}  list=[${d.list}]`);
  }
  if (dupInList.length) {
    console.log(`\n  IN MULTIPLE LESSONS (first 15 of ${dupInList.length}):`);
    for (const d of dupInList.slice(0, 15)) console.log(`    #${d.id} ${d.zh} → [${d.lessons}]`);
  }
}
