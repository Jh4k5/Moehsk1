const fs=require('fs'), path=require('path');
const {ROOT}=require('./ts-load');
const JOBS=[['src/data/hsk2/vocabulary2.ts', require('./translations/hsk2-mnemonics.json')]];
for(const [rel,tr] of JOBS){
  const f=path.join(ROOT,rel);
  const out=[]; let n=0;
  for(const line of fs.readFileSync(f,'utf8').split('\n')){
    const m=line.match(/^\s*\{id:\s*(\d+),/);
    if(!m){ out.push(line); continue; }
    const t=tr[m[1]];
    if(!t){ out.push(line); continue; }
    // mnemonic is currently the empty string
    const rep=line.replace(/mnemonic:\s*(['"])\1/, () => { n++; return `mnemonic:${JSON.stringify(t)}`; });
    out.push(rep);
  }
  fs.writeFileSync(f,out.join('\n'));
  console.log(`${rel}: ${n} تعبير حفظ طُبِّق`);
}
