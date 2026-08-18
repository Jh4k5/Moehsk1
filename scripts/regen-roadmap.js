const fs=require('fs'), path=require('path');
const {load,ROOT}=require('./ts-load');
const lessons=load('src/data/lessons.ts').lessons;
const vocab=load('src/data/vocabulary.ts').vocabulary;
const byId=new Map(vocab.map(w=>[w.id,w]));

// Roadmap unit == lesson: one source of truth, 100% coverage by construction.
const units=lessons.map(l=>({
  id:l.id, title:l.title,
  hours:Math.max(0.5, Math.round((l.vocabularyIds.length/12)*2)/2),
  words:[...l.vocabularyIds].sort((a,b)=>a-b),
  desc:`${l.titleZh} — ${l.vocabularyIds.length} كلمة و${(l.grammarIds||[]).length} قاعدة`,
  grammarIds:l.grammarIds||[],
}));
const body='export const roadmapUnits = [\n'+units.map(u=>
  `  { id: ${u.id}, title: ${JSON.stringify(u.title)}, hours: ${u.hours}, words: [${u.words.join(',')}], desc: ${JSON.stringify(u.desc)}, grammarIds: [${u.grammarIds.join(',')}] },`
).join('\n')+'\n]';

const f=path.join(ROOT,'src/data/hsk1/extras.ts');
let s=fs.readFileSync(f,'utf8');
const s2=s.replace(/export const roadmapUnits = \[[\s\S]*?\n\]/, body);
if(s2===s){console.error('roadmapUnits block not found');process.exit(1);}
fs.writeFileSync(f,s2);
console.log(`roadmap regenerated from lessons: ${units.length} units, ${new Set(units.flatMap(u=>u.words)).size}/${vocab.length} words covered`);
