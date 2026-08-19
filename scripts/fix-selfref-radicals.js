// يستبدل الجذور عديمة الفائدة (الجذر = الحرف نفسه) بتفكيك حقيقي، للأحرف المركّبة فقط.
// الأحرف الذرّية (人، 口، 大…) تُترك كما هي لأن جذرها هو نفسها بحق.
const fs=require('fs'), path=require('path');
const {ROOT}=require('./ts-load');
const COMPOSITE=require('/tmp/composite.json');

for(const rel of ['src/data/vocabulary.ts','src/data/hsk2/vocabulary2.ts']){
  const f=path.join(ROOT,rel);
  const out=[]; let n=0;
  for(const line of fs.readFileSync(f,'utf8').split('\n')){
    const m=line.match(/^\s*\{id:\s*\d+,\s*zh:\s*["']([^"']+)["']/);
    if(!m){ out.push(line); continue; }
    const zh=m[1];
    if([...zh].length!==1 || !COMPOSITE[zh]){ out.push(line); continue; }
    const parts=COMPOSITE[zh].map(p=>`"${p}"`).join(',');
    // فقط حين تكون القيمة الحالية هي الحرف نفسه
    const rep=line.replace(new RegExp(`radicals:\\s*\\[\\s*["']${zh}["']\\s*\\]`), () => { n++; return `radicals: [${parts}]`; });
    out.push(rep);
  }
  fs.writeFileSync(f,out.join('\n'));
  console.log(`${rel}: ${n} جذراً عديم الفائدة استُبدل بتفكيك حقيقي`);
}
