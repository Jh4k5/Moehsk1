// HSK2 daily Q&A — authored with HSK2 vocabulary, same shape as QASection's dailyQA.
export interface QAAnswer2 { zh: string; pinyin: string; arabic: string }
export interface QAQuestion2 { q: string; pinyin: string; arabic: string; answers: QAAnswer2[] }
export interface QACategory2 { category: string; icon: string; color: string; questions: QAQuestion2[] }

export const dailyQA2: QACategory2[] = [
  {
    category: "🏥 عند الطبيب",
    icon: "🏥",
    color: "red",
    questions: [
      { q: "你哪儿疼？", pinyin: "Nǐ nǎr téng?", arabic: "أين يؤلمك؟", answers: [{ zh: "我头疼", pinyin: "Wǒ tóu téng", arabic: "رأسي يؤلمني" }] },
      { q: "你身体怎么样？", pinyin: "Nǐ shēntǐ zěnmeyàng?", arabic: "كيف صحتك؟", answers: [{ zh: "不太舒服", pinyin: "Bú tài shūfu", arabic: "لست بحالة جيدة" }] },
      { q: "药店在哪儿？", pinyin: "Yàodiàn zài nǎr?", arabic: "أين الصيدلية؟", answers: [] },
    ],
  },
  {
    category: "✈️ في المطار",
    icon: "✈️",
    color: "blue",
    questions: [
      { q: "你什么时候出国？", pinyin: "Nǐ shénme shíhou chūguó?", arabic: "متى ستسافر للخارج؟", answers: [{ zh: "明天", pinyin: "Míngtiān", arabic: "غداً" }] },
      { q: "机票买了吗？", pinyin: "Jīpiào mǎi le ma?", arabic: "هل اشتريت تذكرة الطيران؟", answers: [{ zh: "已经买了", pinyin: "Yǐjīng mǎi le", arabic: "اشتريتها بالفعل" }] },
      { q: "机场远吗？", pinyin: "Jīchǎng yuǎn ma?", arabic: "هل المطار بعيد؟", answers: [] },
    ],
  },
  {
    category: "🏬 في المركز التجاري",
    icon: "🏬",
    color: "purple",
    questions: [
      { q: "这条裤子有别的颜色吗？", pinyin: "Zhè tiáo kùzi yǒu bié de yánsè ma?", arabic: "هل لهذا البنطال لون آخر؟", answers: [{ zh: "有黑色和白色的", pinyin: "Yǒu hēisè hé báisè de", arabic: "يوجد أسود وأبيض" }] },
      { q: "你喜欢什么颜色？", pinyin: "Nǐ xǐhuan shénme yánsè?", arabic: "ما اللون الذي تحبه؟", answers: [] },
      { q: "多少钱一个？", pinyin: "Duōshao qián yí ge?", arabic: "كم سعر الواحدة؟", answers: [] },
    ],
  },
  {
    category: "⚽ الهوايات والرياضة",
    icon: "⚽",
    color: "green",
    questions: [
      { q: "你的爱好是什么？", pinyin: "Nǐ de àihào shì shénme?", arabic: "ما هوايتك؟", answers: [{ zh: "我喜欢踢足球", pinyin: "Wǒ xǐhuan tī zúqiú", arabic: "أحب لعب كرة القدم" }] },
      { q: "周末你做什么？", pinyin: "Zhōumò nǐ zuò shénme?", arabic: "ماذا تفعل في العطلة؟", answers: [{ zh: "我去游泳", pinyin: "Wǒ qù yóuyǒng", arabic: "أذهب للسباحة" }] },
      { q: "你会打篮球吗？", pinyin: "Nǐ huì dǎ lánqiú ma?", arabic: "هل تستطيع لعب كرة السلة؟", answers: [] },
    ],
  },
  {
    category: "📖 الدراسة والامتحانات",
    icon: "📖",
    color: "orange",
    questions: [
      { q: "你准备好考试了吗？", pinyin: "Nǐ zhǔnbèi hǎo kǎoshì le ma?", arabic: "هل استعددت للامتحان؟", answers: [{ zh: "还没有", pinyin: "Hái méiyǒu", arabic: "ليس بعد" }] },
      { q: "这个词是什么意思？", pinyin: "Zhège cí shì shénme yìsi?", arabic: "ما معنى هذه الكلمة؟", answers: [] },
      { q: "你什么时候开学？", pinyin: "Nǐ shénme shíhou kāixué?", arabic: "متى تبدأ الدراسة؟", answers: [] },
    ],
  },
]
