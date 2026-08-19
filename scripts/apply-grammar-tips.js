const fs=require('fs'), path=require('path');
const {ROOT}=require('./ts-load');
const TIPS=require('./translations/hsk1-grammar-tips.json');
const f=path.join(ROOT,'src/data/grammar.ts');
const lines=fs.readFileSync(f,'utf8').split('\n');

const out=[]; let cur=null, depth=0, hasTips=false, buf=[];
const flush=()=>{
  if(cur && TIPS[cur] && !hasTips){
    // أدرج قبل السطر الأخير من الكتلة (القوس المغلق)
    const close=buf.pop();
    buf.push(`    tips: ${JSON.stringify(TIPS[cur].ar)},`);
    buf.push(`    tipsEn: ${JSON.stringify(TIPS[cur].en)},`);
    buf.push(close);
  }
  out.push(...buf); buf=[]; cur=null; hasTips=false;
};

for(const line of lines){
  const m=line.match(/^\s*id:\s*(\d+),/);
  if(m && depth>0){ flush(); cur=m[1]; }
  if(cur!==null){
    buf.push(line);
    if(/^\s*tips:/.test(line)) hasTips=true;
    // نهاية كتلة القاعدة
    if(/^\s{2}\},\s*$/.test(line)) flush();
  } else out.push(line);
  depth += (line.match(/\{/g)||[]).length - (line.match(/\}/g)||[]).length;
}
flush();
fs.writeFileSync(f,out.join('\n'));
