const fs=require('fs'), path=require('path');
const {ROOT,load}=require('./ts-load');

// خريطة حرف → مكوّنات: من الكلمات أحادية الحرف في HSK1/HSK2 + ما أُلّف لأحرف HSK3
const map=new Map();
for(const w of [...load('src/data/vocabulary.ts').vocabulary, ...load('src/data/hsk2/vocabulary2.ts').vocabulary2]){
  if([...w.zh].length!==1 || !w.radicals?.length || map.has(w.zh)) continue;
  // جذر = الحرف نفسه لا يفكّك شيئاً؛ يُقبل فقط للأحرف الذرّية الحقيقية
  if(w.radicals.length===1 && w.radicals[0]===w.zh) continue;
  map.set(w.zh, w.radicals);
}
for(const [ch,parts] of Object.entries(require('/tmp/chars.json'))) map.set(ch, parts);

// كل مكوّن يجب أن يكون CJK — يمنع تسرّب نص لاتيني
const CJK=/^[⺀-⻿⼀-⿟　-〿㇀-㇯㐀-䶿一-鿿]+$/;
const bad=[]; for(const [ch,parts] of map) for(const p of parts) if(!CJK.test(p)) bad.push(ch+'→'+p);
if(bad.length){ console.error('مكوّنات غير صينية:', bad.join(', ')); process.exit(1); }
console.log(`خريطة المكوّنات: ${map.size} حرفاً، كلها صينية`);

// الأحرف الذرّية: جذرها هو نفسها وهذا صحيح
const ATOMIC='一二三四五六七八九十人口大小山手足女子日月木水火土田心目耳米马牛羊鱼鸟飞用比面肉长短高才干又只走里门车雨天上下白田刀力工弓文方风见几中不我他她们了的是有在这那什么去来好'.split('');
for(const ch of ATOMIC) if(!map.has(ch)) map.set(ch,[ch]);

const f=path.join(ROOT,'src/data/hsk3/vocabulary3.ts');
const out=[]; let n=0, skipped=0;
for(const line of fs.readFileSync(f,'utf8').split('\n')){
  const m=line.match(/^\s*\{id:\s*(\d+),.*?zh:\s*'([^']+)'/);
  if(!m){ out.push(line); continue; }
  const parts=[];
  for(const ch of m[2]) if(/[一-鿿]/.test(ch)) for(const p of (map.get(ch)||[])) if(!parts.includes(p)) parts.push(p);
  if(!parts.length){ skipped++; out.push(line); continue; }
  const rep=line.replace(/radicals:\s*\[\s*\]/, () => { n++; return `radicals:[${parts.map(p=>`'${p}'`).join(',')}]`; });
  out.push(rep);
}
fs.writeFileSync(f,out.join('\n'));
console.log(`vocabulary3.ts: ${n} كلمة أُسندت لها جذورها${skipped?`، ${skipped} بلا مكوّنات`:''}`);
