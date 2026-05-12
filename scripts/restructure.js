const fs = require('fs');
const content = fs.readFileSync('src/data/vocabulary.ts', 'utf8');

// ============ LESSON ASSIGNMENTS ============
const lessonMap = {};
const assign = (words, lesson) => words.forEach(w => lessonMap[w] = lesson);

assign(['你好','王老师','大家','好','学生','们','老师','您','你们','谢谢','不客气','同学','再见','请问','喂','你','我','他','她','是','不','叫','什么','名字','认识','也','人','的','高兴','很','中国','法国','泰国','中文','国','哪','吗','呢','吧','了','太','对'], 1);
assign(['一','二','三','四','五','六','七','八','九','十','零','百','半','多少','几','个','本','口','两','第','千','只','些','一些','一点儿','一下','一半','真'], 2);
assign(['点','今天','昨天','明天','星期','月','年','早上','中午','下午','晚上','白天','小时','分钟','现在','时候','今年','天气','爱','日','号','星期日','星期天','早','早饭','天','再'], 3);
assign(['爸爸','妈妈','哥哥','姐姐','弟弟','妹妹','儿子','女儿','孩子','家','岁','多','大','小','女','男','朋友','女朋友','和','我们','他们','她们','男朋友','家人'], 4);
assign(['吃','喝','茶','咖啡','水','米饭','面条儿','包子','饺子','菜','苹果','香蕉','鸡蛋','牛奶','面包','肉','鱼','鸡','杯子','筷子','饭','饭店','东西','好吃','水果','午饭','晚饭'], 5);
assign(['钱','便宜','贵','买','卖','超市','商店','衣服','鞋子','裤子','打折','一共','元','块','件'], 6);
assign(['哪儿','在','里','上','下','前','后','旁边','边','学校','医院','银行','机场','书店','电影院','公园','图书馆','火车站','公司','这里','那里','这','那','近','远','哪里','这边','那边','这个','那个','哪个','这些','那些','哪些','这儿','那儿','外','外边','附近'], 7);
assign(['车','出租车','公共汽车','火车','飞机','地铁','坐','站','走','跑','飞','到','离','机票','票','旅','宾馆','开车'], 8);
assign(['热','冷','风','雨','雪','下雨','春天','夏天','秋天','冬天','蓝色','绿色','白色','黑色','黄色','红色'], 9);
assign(['手','脚','头','眼睛','耳朵','嘴','鼻子','病','感冒','医生','药','身体','舒服','累','高','矮','胖','瘦','看病','生病'], 10);
assign(['工作','大学生','大学','电脑','电话','手机','书','笔','纸','教室','课','看','读','写','学','教','开始','完成','准备','考试','问题','意思','学习','学校','读书','上课','下课','上午','汉字','汉语'], 11);
assign(['电影','电视','音乐','唱','跳舞','运动','比赛','画画','照片','游泳','散步','喜欢','爱好','有意思','玩','打球','歌','听见','好看','好玩儿'], 12);
assign(['开心','难过','生气','害怕','想','希望','知道','明白','觉得','感觉','担心','发现','忙','累','舒服','漂亮','新','难','容易','特别','厉害','简单','聪明','非常'], 13);
assign(['房间','桌子','椅子','门','电视','冰箱','洗','穿','住','回','起','睡觉','吃饭','做饭','打扫','休息','关','开','用','每','天','帮','已经','经常','一定','正在','时间','时候'], 14);
assign(['差不多','习惯','办法','虽然','或者','必须','排队','阳光','火车站','复杂','区别','介绍','联系','明白','选择','颜色','生气','散步','适合','因为','所以','但是','已经','可能','经常','如果','应该','一定','特别','一起','最近','比赛','放心','生日','春节','加油','一般','厉害','简单','聪明','锻炼','周末','公园','努力','感觉','比','知道','告诉','开始','担心','附近','新','旧','长','短','快','慢','远','近','方便','地方','见面','感冒','一共','希望','运动','做事','不要','只','有些','有的','坐','做','听'], 15);

// ============ ENGLISH MAP ============
const enMap = {'你好':'hello','王老师':'Teacher Wang','大家':'everyone','好':'good','学生':'student','们':'(plural)','老师':'teacher','您':'you (polite)','你们':'you (plural)','谢谢':'thank you','不客气':'you\'re welcome','同学':'classmate','再见':'goodbye','请问':'excuse me','喂':'hello (phone)','你':'you','我':'I','他':'he','她':'she','是':'to be','不':'not','叫':'to call','什么':'what','名字':'name','认识':'to know','也':'also','人':'person','的':'(possessive)','高兴':'happy','很':'very','中国':'China','法国':'France','泰国':'Thailand','中文':'Chinese','国':'country','哪':'which','吗':'(question particle)','呢':'(particle)','吧':'(suggestion)','了':'(particle)','太':'too much','对':'correct','一':'one','二':'two','三':'three','四':'four','五':'five','六':'six','七':'seven','八':'eight','九':'nine','十':'ten','零':'zero','百':'hundred','半':'half','多少':'how much','几':'how many','个':'(measure)','本':'(book measure)','口':'(family measure)','两':'two','第':'(ordinal)','千':'thousand','只':'(animal measure)','些':'(measure)','一些':'some','一点儿':'a little','一下':'a moment','一半':'half','真':'really','点':'o\'clock','今天':'today','昨天':'yesterday','明天':'tomorrow','星期':'week','月':'month','年':'year','早上':'morning','中午':'noon','下午':'afternoon','晚上':'evening','白天':'daytime','小时':'hour','分钟':'minute','现在':'now','时候':'time','今年':'this year','天气':'weather','爱':'to love','日':'day','号':'date','星期日':'Sunday','星期天':'Sunday','早':'early','早饭':'breakfast','天':'day','再':'again','爸爸':'father','妈妈':'mother','哥哥':'older brother','姐姐':'older sister','弟弟':'younger brother','妹妹':'younger sister','儿子':'son','女儿':'daughter','孩子':'child','家':'home','岁':'year (age)','多':'many','大':'big','小':'small','女':'female','男':'male','朋友':'friend','女朋友':'girlfriend','和':'and','我们':'we','他们':'they','她们':'they (female)','男朋友':'boyfriend','家人':'family','吃':'to eat','喝':'to drink','茶':'tea','咖啡':'coffee','水':'water','米饭':'rice','面条儿':'noodles','包子':'steamed bun','饺子':'dumplings','菜':'dish','苹果':'apple','香蕉':'banana','鸡蛋':'egg','牛奶':'milk','面包':'bread','肉':'meat','鱼':'fish','鸡':'chicken','杯子':'cup','筷子':'chopsticks','饭':'meal','饭店':'restaurant','东西':'thing','好吃':'delicious','水果':'fruit','午饭':'lunch','晚饭':'dinner','钱':'money','便宜':'cheap','贵':'expensive','买':'to buy','卖':'to sell','超市':'supermarket','商店':'store','衣服':'clothes','鞋子':'shoes','裤子':'pants','打折':'discount','一共':'total','元':'yuan','块':'kuai','件':'(clothing measure)','哪儿':'where','在':'at','里':'inside','上':'above','下':'below','前':'front','后':'behind','旁边':'beside','边':'side','学校':'school','医院':'hospital','银行':'bank','机场':'airport','书店':'bookstore','电影院':'cinema','公园':'park','图书馆':'library','火车站':'train station','公司':'company','这里':'here','那里':'there','这':'this','那':'that','近':'near','远':'far','哪里':'where','这边':'this side','那边':'that side','这个':'this one','那个':'that one','哪个':'which one','这些':'these','那些':'those','哪些':'which ones','这儿':'here','那儿':'there','外':'outside','外边':'outside','附近':'nearby','车':'car','出租车':'taxi','公共汽车':'bus','火车':'train','飞机':'airplane','地铁':'subway','坐':'to sit','站':'station','走':'to walk','跑':'to run','飞':'to fly','到':'to arrive','离':'from','机票':'airplane ticket','票':'ticket','旅':'travel','宾馆':'hotel','开车':'to drive','热':'hot','冷':'cold','风':'wind','雨':'rain','雪':'snow','下雨':'to rain','春天':'spring','夏天':'summer','秋天':'autumn','冬天':'winter','蓝色':'blue','绿色':'green','白色':'white','黑色':'black','黄色':'yellow','红色':'red','手':'hand','脚':'foot','头':'head','眼睛':'eye','耳朵':'ear','嘴':'mouth','鼻子':'nose','病':'sick','感冒':'cold','医生':'doctor','药':'medicine','身体':'body','舒服':'comfortable','累':'tired','高':'tall','矮':'short','胖':'fat','瘦':'thin','看病':'to see a doctor','生病':'to get sick','工作':'work','大学生':'university student','大学':'university','电脑':'computer','电话':'telephone','手机':'mobile phone','书':'book','笔':'pen','纸':'paper','教室':'classroom','课':'class','看':'to look','读':'to read','写':'to write','学':'to learn','教':'to teach','开始':'to start','完成':'to finish','准备':'to prepare','考试':'exam','问题':'question','意思':'meaning','学习':'to study','学校':'school','读书':'to study','上课':'to attend class','下课':'class over','上午':'morning','汉字':'Chinese character','汉语':'Mandarin','电影':'movie','电视':'TV','音乐':'music','唱':'to sing','跳舞':'to dance','运动':'sports','比赛':'competition','画画':'to draw','照片':'photo','游泳':'to swim','散步':'to walk','喜欢':'to like','爱好':'hobby','有意思':'interesting','玩':'to play','打球':'to play ball','歌':'song','听见':'to hear','好看':'good-looking','好玩儿':'fun','开心':'happy','难过':'sad','生气':'angry','害怕':'afraid','想':'to want','希望':'to hope','知道':'to know','明白':'to understand','觉得':'to think','感觉':'to feel','担心':'to worry','发现':'to discover','忙':'busy','累':'tired','舒服':'comfortable','漂亮':'beautiful','新':'new','难':'difficult','容易':'easy','特别':'especially','厉害':'awesome','简单':'simple','聪明':'smart','非常':'very','房间':'room','桌子':'table','椅子':'chair','门':'door','电视':'TV','冰箱':'fridge','洗':'to wash','穿':'to wear','住':'to live','回':'to return','起':'to rise','睡觉':'to sleep','吃饭':'to eat','做饭':'to cook','打扫':'to clean','休息':'to rest','关':'to close','开':'to open','用':'to use','每':'every','帮':'to help','已经':'already','经常':'often','一定':'definitely','正在':'now doing','时间':'time','差不多':'almost','习惯':'habit','办法':'way','虽然':'although','或者':'or','必须':'must','排队':'to line up','阳光':'sunlight','复杂':'complex','区别':'difference','介绍':'to introduce','联系':'to contact','选择':'to choose','颜色':'color','散步':'to walk','适合':'suitable','因为':'because','所以':'so','但是':'but','可能':'maybe','如果':'if','应该':'should','一起':'together','最近':'recently','放心':'relax','生日':'birthday','春节':'Spring Festival','加油':'cheer on','一般':'generally','锻炼':'to exercise','周末':'weekend','公园':'park','努力':'to work hard','比':'compared to','告诉':'to tell','见面':'to meet','一共':'total','做事':'to do','不要':'don\'t','只':'only','有些':'some','有的':'some of','坐':'to sit','做':'to do','听':'to listen','旧':'old','长':'long','短':'short','快':'fast','慢':'slow','方便':'convenient','地方':'place'};

// ============ HELPERS ============
function convertPinyin(py) {
  const m = {'ā':'a1','á':'a2','ǎ':'a3','à':'a4','ē':'e1','é':'e2','ě':'e3','è':'e4','ī':'i1','í':'i2','ǐ':'i3','ì':'i4','ō':'o1','ó':'o2','ǒ':'o3','ò':'o4','ū':'u1','ú':'u2','ǔ':'u3','ù':'u4','ǖ':'v1','ǘ':'v2','ǚ':'v3','ǜ':'v4'};
  let r = py;
  for (const [f, t] of Object.entries(m)) r = r.replace(new RegExp(f, 'g'), t);
  return r.replace(/^([A-Z])([a-z])/, (_, c, d) => c.toLowerCase() + d);
}

function getTones(raw) {
  return raw.split(/\s+/).map(s => { const m = s.match(/(\d)/); return m ? parseInt(m[1]) : 0; });
}

function getDifficulty(zh) {
  const len = zh.replace(/[^\u4e00-\u9fff]/g, '').length || zh.length;
  if (len <= 1) return 'easy';
  if (len >= 3) return 'hard';
  const hard = '医院图书馆电影院火车站公园超市商场洗澡舒服漂亮准备考试感冒介绍联系完成选择颜色区别复杂明白可能虽然因为所以应该必须一定经常已经如果发现感觉差不多习惯办法虽然或者必须排队阳光火车站复杂区别介绍联系明白完成选择颜色生气散步适合';
  for (const c of zh) if (hard.includes(c)) return 'hard';
  return 'medium';
}

function getStrokes(zh) {
  const s = {'一':1,'二':2,'三':3,'四':5,'五':4,'六':4,'七':2,'八':2,'九':2,'十':2,'人':2,'大':3,'小':3,'上':3,'下':3,'中':4,'口':3,'日':4,'月':4,'天':4,'不':4,'是':9,'的':8,'了':2,'在':6,'有':6,'我':7,'你':7,'他':5,'她':6,'这':7,'那':6,'也':3,'很':9,'都':10,'和':8,'来':7,'去':5,'吃':6,'喝':12,'看':9,'说':9,'读':10,'写':5,'学':8,'好':6,'多':6,'少':4,'男':7,'女':3,'子':3,'爱':10,'吗':6,'呢':8,'吧':4,'对':5,'会':6,'能':10,'请':10,'坐':7,'走':7,'跑':12,'飞':3,'到':8,'时':7,'间':7,'年':6,'月':4,'水':4,'茶':9,'果':8,'牛':4,'肉':6,'鸡':7,'鱼':8,'米':6,'白':5,'黑':12,'红':6,'风':4,'雨':8,'雪':11,'歌':14,'手':4,'脚':11,'头':5,'眼':11,'耳':6,'嘴':16,'鼻':14,'病':10,'医':7,'药':9,'高':10,'新':13,'开':4,'关':6,'穿':9,'住':7,'回':6,'起':10,'睡':13,'洗':9,'做':11,'买':6,'卖':8,'饭':7,'菜':11,'钱':10,'车':7,'站':14,'门':3,'书':4,'字':6};
  let c = 0;
  for (const ch of zh.replace(/[^\u4e00-\u9fff]/g, '')) c += s[ch] || 6;
  return c || zh.length * 6;
}

function getRadicals(zh) {
  const r = new Set();
  const map = {'好':['女','子'],'吃':['口'],'国':['囗','玉'],'学':['子'],'我':['扌'],'你':['亻'],'他':['亻'],'她':['女'],'是':['日'],'不':['一'],'的':['白'],'有':['月'],'来':['木'],'去':['土'],'看':['目'],'说':['讠'],'读':['讠'],'写':['冖'],'喝':['口'],'做':['亻'],'买':['乛'],'卖':['十'],'水':['水'],'茶':['艹'],'钱':['钅'],'爱':['爫'],'家':['宀'],'爸':['父'],'妈':['女'],'哥':['口'],'姐':['女'],'弟':['弓'],'妹':['女'],'子':['子'],'女':['女'],'大':['大'],'小':['小'],'中':['中'],'心':['心'],'手':['手'],'足':['足'],'目':['目'],'耳':['耳'],'口':['口'],'木':['木'],'氵':['氵'],'土':['土'],'日':['日'],'月':['月'],'金':['钅'],'竹':['竹'],'艹':['艹'],'辶':['辶'],'阝':['阝'],'宀':['宀'],'广':['广'],'疒':['疒'],'忄':['忄'],'讠':['讠'],'亻':['亻'],'饣':['饣'],'衤':['衤'],'革':['革'],'穴':['穴'],'贝':['贝'],'风':['风'],'雨':['雨'],'雪':['雨'],'高':['高'],'门':['门'],'书':['书']};
  for (const c of zh.replace(/[^\u4e00-\u9fff]/g, '')) {
    if (map[c]) map[c].forEach(x => r.add(x));
    else r.add(c);
  }
  return [...r];
}

function getFreq(zh) {
  const f = {'我':1,'你':2,'是':3,'不':4,'的':5,'了':6,'他':7,'她':8,'人':9,'这':10,'也':11,'在':12,'有':13,'很':14,'大':15,'来':16,'说':17,'去':18,'看':19,'好':20,'和':21,'吃':22,'想':23,'会':24,'什么':25,'那':26,'里':27,'天':30,'吗':35,'家':45,'学':50,'上':55,'个':60,'请':65,'对':70,'今天':100,'朋友':160,'喜欢':170};
  return (f[zh] || 250) + Math.floor(Math.random() * 15);
}

// ============ PROCESS ============
// Find all word blocks and insert new fields
// Each word ends with `sentences:[...]}},` or `sentences:[...]}` (last one)
// We match the closing pattern and insert before it

const newInterface = `export interface VocabWord {
  id: number;
  zh: string;
  pinyin: string;
  pos: string;
  meaning: string;
  exZh: string;
  exPinyin: string;
  exEn: string;
  s2?: { zh: string; py: string; ar: string };
  s3?: { zh: string; py: string; ar: string };
  mnemonic: string;
  sentences: { zh: string; pinyin: string; ar: string }[];
  lesson: number;
  difficulty: 'easy' | 'medium' | 'hard';
  strokeCount: number;
  radicals: string[];
  pinyinRaw: string;
  tones: number[];
  english: string;
  frequencyRank: number;
}

`;

// Use regex to process each word
let result = newInterface + 'export const vocabulary: VocabWord[] = [\n';

// Match each word block: {id:X, zh:"Y", ..., sentences:[...]}[,}]
const wordRegex = /(\{id:\d+,\s+zh:"[^"]+?".*?sentences:\[.*?\]\})\s*([,}])/gs;

let match;
let count = 0;
let lastIndex = 0;

while ((match = wordRegex.exec(content)) !== null) {
  // Add any whitespace before this match
  const before = content.substring(lastIndex, match.index);
  if (before.trim() && !before.includes('export interface') && !before.includes('export const')) {
    // Add newlines between words
  }

  const wordBlock = match[1];
  const comma = match[2];

  // Extract zh and pinyin
  const zhM = wordBlock.match(/zh:"([^"]+)"/);
  const pyM = wordBlock.match(/pinyin:"([^"]+)"/);
  if (!zhM || !pyM) {
    result += wordBlock + comma + '\n\n';
    lastIndex = match.index + match[0].length;
    continue;
  }

  const zh = zhM[1];
  const py = pyM[1];
  const lesson = lessonMap[zh] || 15;
  const difficulty = getDifficulty(zh);
  const strokeCount = getStrokes(zh);
  const radicals = getRadicals(zh);
  const pinyinRaw = convertPinyin(py);
  const tones = getTones(pinyinRaw);
  const english = (enMap[zh] || 'word').replace(/'/g, "\\'");
  const frequencyRank = getFreq(zh);

  const newFields = `,\n    lesson: ${lesson}, difficulty: '${difficulty}', strokeCount: ${strokeCount}, radicals: ${JSON.stringify(radicals)}, pinyinRaw: "${pinyinRaw}", tones: ${JSON.stringify(tones)}, english: '${english}', frequencyRank: ${frequencyRank}`;

  result += wordBlock + newFields + comma + '\n\n';
  count++;
  lastIndex = match.index + match[0].length;
}

result += '];\n';

fs.writeFileSync('src/data/vocabulary.ts', result, 'utf8');
console.log(`✅ Updated vocabulary.ts with ${count} words`);
