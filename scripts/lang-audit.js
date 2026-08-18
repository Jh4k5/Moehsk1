const { load } = require('./ts-load');
const AR=/[؀-ۿ]/, LAT=/[A-Za-z]/;
const sets=[['HSK1','src/data/vocabulary.ts','vocabulary'],['HSK2','src/data/hsk2/vocabulary2.ts','vocabulary2'],['HSK3','src/data/hsk3/vocabulary3.ts','vocabulary3']];
const work={};
for(const [name,f,k] of sets){
  const v=load(f)[k];
  const arBad=[], enBad=[];
  for(const w of v){
    const s0=w.sentences?.[0];
    if(s0 && !AR.test(s0.ar) && LAT.test(s0.ar))
      arBad.push({id:w.id, zh:w.zh, sent:s0.zh, py:s0.pinyin, wrongAr:s0.ar, sameAsExEn:s0.ar===w.exEn});
    if(w.exEn && AR.test(w.exEn)) enBad.push({id:w.id, zh:w.zh, sent:w.exZh, py:w.exPinyin, arabicInEn:w.exEn});
  }
  work[name]={arBad,enBad};
  console.log(`${name}: sentences[0].ar holding English = ${arBad.length} (identical to exEn: ${arBad.filter(x=>x.sameAsExEn).length}) | exEn holding Arabic = ${enBad.length}`);
}
require('fs').writeFileSync('scripts/lang-work.json', JSON.stringify(work,null,1));
console.log('\nwritten scripts/lang-work.json');
console.log('\nsample — needs ARABIC for sentences[0].ar:');
for(const x of work.HSK1.arBad.slice(0,5)) console.log(`  #${x.id} ${x.zh}  ${x.sent}  (${x.py})  currently: "${x.wrongAr}"`);
console.log('\nsample — needs ENGLISH for exEn:');
for(const x of work.HSK1.enBad.slice(0,5)) console.log(`  #${x.id} ${x.zh}  ${x.sent}  (${x.py})  currently: "${x.arabicInEn}"`);
