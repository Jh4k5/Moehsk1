const fs=require('fs'), path=require('path');
const {load,ROOT}=require('./ts-load');
const vocab=load('src/data/vocabulary.ts').vocabulary;
const valid=new Set(vocab.map(w=>w.id));
const DELETED={303:40,304:32,329:302,338:251,366:292}; // deleted -> canonical survivor

const f=path.join(ROOT,'src/data/hsk1/extras.ts');
let src=fs.readFileSync(f,'utf8');
let remapped=0, dropped=0;
src=src.replace(/words: \[([\d,\s]*)\]/g,(m,body)=>{
  const ids=body.split(',').map(s=>s.trim()).filter(Boolean).map(Number);
  const out=[];
  for(const id of ids){
    const t=DELETED[id]!==undefined?DELETED[id]:id;
    if(DELETED[id]!==undefined) remapped++;
    if(!valid.has(t)){ dropped++; continue; }
    if(!out.includes(t)) out.push(t);
  }
  return `words: [${out.join(',')}]`;
});
fs.writeFileSync(f,src);
console.log(`extras.ts roadmap: ${remapped} ids remapped to survivors, ${dropped} invalid dropped`);

// verify no dangling ids remain anywhere live
const extras=load('src/data/hsk1/extras.ts');
let bad=0;
for(const u of extras.roadmapUnits) for(const id of u.words) if(!valid.has(id)){console.log('DANGLING',id);bad++;}
console.log(bad?`${bad} dangling remain`:'no dangling roadmap ids');

// roadmap coverage
const covered=new Set(extras.roadmapUnits.flatMap(u=>u.words));
console.log(`roadmap covers ${covered.size}/${valid.size} words — ${valid.size-covered.size} still uncovered`);
