const fs=require('fs'), path=require('path');
const {ROOT}=require('./ts-load');
const tr=require('./translations/hsk1-ar-all.json');
const f=path.join(ROOT,'src/data/vocabulary.ts');
let src=fs.readFileSync(f,'utf8');
const out=[]; let applied=0;
for(const line of src.split('\n')){
  const m=line.match(/^\{id:(\d+),/);
  if(!m){ out.push(line); continue; }
  const id=m[1];
  const ar=tr[id];
  if(!ar){ out.push(line); continue; }
  // sentences[0] is the FIRST {zh:...,pinyin:...,ar:"..."} inside sentences:[
  const si=line.indexOf('sentences:[');
  if(si<0){ out.push(line); continue; }
  const head=line.slice(0,si), tail=line.slice(si);
  // replace the ar of the first sentence object only
  const rep=tail.replace(/^(sentences:\[\{[^}]*?ar:")((?:[^"\\]|\\.)*)(")/, (mm,a,old,c)=>{
    applied++; return a+ar.replace(/"/g,'\\"')+c;
  });
  out.push(head+rep);
}
fs.writeFileSync(f,out.join('\n'));
console.log(`applied ${applied} Arabic translations to sentences[0].ar`);
