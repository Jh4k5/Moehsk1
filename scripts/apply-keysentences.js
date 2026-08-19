const fs=require('fs'), path=require('path');
const {ROOT,load}=require('./ts-load');
const KS=require('./translations/hsk2-keysentences.json');

// كل حرف مستعمل يجب أن يكون قد دُرِّس في HSK1 أو HSK2
const taught=new Set();
for(const w of [...load('src/data/vocabulary.ts').vocabulary, ...load('src/data/hsk2/vocabulary2.ts').vocabulary2])
  for(const ch of w.zh) if(/[一-鿿]/.test(ch)) taught.add(ch);

const unknown=new Map();
for(const [les,arr] of Object.entries(KS))
  for(const s of arr)
    for(const ch of s.zh) if(/[一-鿿]/.test(ch) && !taught.has(ch)){
      if(!unknown.has(ch)) unknown.set(ch, []);
      unknown.get(ch).push(`درس ${les}: ${s.zh}`);
    }
if(unknown.size){
  console.log(`⚠ ${unknown.size} حرفاً خارج مفردات المستوى:`);
  for(const [ch,where] of unknown) for(const w of where) console.log(`   ${ch} ← ${w}`);
  process.exit(1);
} else console.log('✓ كل الأحرف مُدرَّسة في HSK1 أو HSK2');

const f=path.join(ROOT,'src/data/hsk2/lessons2.ts');
let src=fs.readFileSync(f,'utf8');
let idx=0, n=0;
src=src.replace(/keySentences:\s*\[[\s\S]*?\n\s*\],/g, () => {
  idx++;
  const arr=KS[String(idx)];
  if(!arr) return '';
  n++;
  const rows=arr.map(s=>`      { zh: ${JSON.stringify(s.zh)}, pinyin: ${JSON.stringify(s.pinyin)}, arabic: ${JSON.stringify(s.arabic)}, audioAvailable: true },`).join('\n');
  return `keySentences: [\n${rows}\n    ],`;
});
fs.writeFileSync(f,src);
console.log(`lessons2.ts: ${n} درساً استُبدلت جمله المفتاحية`);
