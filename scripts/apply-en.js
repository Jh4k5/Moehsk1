const fs=require('fs'), path=require('path');
const {ROOT}=require('./ts-load');
const JOBS=[
  ['src/data/vocabulary.ts',        require('./translations/hsk1-en.json')],
  ['src/data/hsk2/vocabulary2.ts',  require('./translations/hsk2-en-all.json')],
];
for(const [rel,tr] of JOBS){
  const f=path.join(ROOT,rel);
  const out=[]; let n=0;
  for(const line of fs.readFileSync(f,'utf8').split('\n')){
    const m=line.match(/^\s*\{id:\s*(\d+),/);
    if(!m){ out.push(line); continue; }
    const en=tr[m[1]];
    if(!en){ out.push(line); continue; }
    // exEn may be single- or double-quoted
    const rep=line.replace(/exEn:\s*(['"])((?:[^'"\\]|\\.)*)\1/, () => {
      n++; return `exEn:${JSON.stringify(en)}`;
    });
    out.push(rep);
  }
  fs.writeFileSync(f,out.join('\n'));
  console.log(`${rel}: ${n} exEn fields translated`);
}
