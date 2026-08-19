const fs=require('fs'), path=require('path');
const {ROOT,load}=require('./ts-load');
const KS=require('./translations/hsk3-keysentences.json');

// نفس حارس apply-keysentences.js: كل حرف مستعمل يجب أن يكون قد دُرِّس
// في HSK1 أو HSK2 أو HSK3 — وإلا تُرفض الجملة ولا يُكتب شيء.
const taught=new Set();
for(const w of [
  ...load('src/data/vocabulary.ts').vocabulary,
  ...load('src/data/hsk2/vocabulary2.ts').vocabulary2,
  ...load('src/data/hsk3/vocabulary3.ts').vocabulary3,
]) for(const ch of w.zh) if(/[一-鿿]/.test(ch)) taught.add(ch);

const unknown=new Map();
let total=0, notSentence=[];
for(const [les,arr] of Object.entries(KS))
  for(const s of arr){
    total++;
    if(!/[。？！]/.test(s.zh)) notSentence.push(`درس ${les}: ${s.zh}`);
    for(const ch of s.zh) if(/[一-鿿]/.test(ch) && !taught.has(ch)){
      if(!unknown.has(ch)) unknown.set(ch, []);
      unknown.get(ch).push(`درس ${les}: ${s.zh}`);
    }
  }
if(unknown.size){
  console.log(`⚠ ${unknown.size} حرفاً خارج مفردات المستوى:`);
  for(const [ch,where] of unknown) for(const w of where) console.log(`   ${ch} ← ${w}`);
  process.exit(1);
} else console.log('✓ كل الأحرف مُدرَّسة في HSK1 أو HSK2 أو HSK3 (0 حرف خارج المستوى)');
if(notSentence.length){
  console.log(`⚠ ${notSentence.length} مدخلاً ليس جملة (لا يحوي 。؟！):`);
  for(const w of notSentence) console.log(`   ${w}`);
  process.exit(1);
} else console.log(`✓ ${total} مدخلاً كلّها جمل حقيقية`);

if(process.argv.includes('--check')) process.exit(0);

const f=path.join(ROOT,'src/data/hsk3/lessons3.ts');
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
console.log(`lessons3.ts: ${n} درساً استُبدلت جمله المفتاحية`);
