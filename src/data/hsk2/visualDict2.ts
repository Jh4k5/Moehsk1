export interface VisualDictWord2 { hanzi: string; pinyin: string; arabic: string; emoji: string }
export interface VisualDictCategory2 { key: string; label: string; icon: string; words: VisualDictWord2[] }
export const VISUAL_DICT_CATEGORIES_2: VisualDictCategory2[] = [
  { key: 'cat0', label: '颜色 الألوان', icon: '🎨', words: [
      { hanzi: '白色', pinyin: 'báisè', arabic: 'اللون الأبيض', emoji: '⬜' },
      { hanzi: '黑色', pinyin: 'hēisè', arabic: 'اللون الأسود', emoji: '⬛' },
      { hanzi: '红色', pinyin: 'hóngsè', arabic: 'اللون الأحمر', emoji: '🟥' },
      { hanzi: '绿色', pinyin: 'lǜsè', arabic: 'اللون الأخضر', emoji: '🟩' },
      { hanzi: '颜色', pinyin: 'yánsè', arabic: 'لون', emoji: '🎨' }
  ] },
  { key: 'cat1', label: 'الطعام والشراب', icon: '🍜', words: [
      { hanzi: '咖啡', pinyin: 'kāfēi', arabic: 'قهوة', emoji: '☕' },
      { hanzi: '奶茶', pinyin: 'nǎichá', arabic: 'شاي بالحليب', emoji: '🧋' },
      { hanzi: '肉', pinyin: 'ròu', arabic: 'لحم', emoji: '🍖' },
      { hanzi: '鱼', pinyin: 'yú', arabic: 'سمك', emoji: '🐟' }
  ] },
  { key: 'cat2', label: 'الأشياء اليومية', icon: '🎒', words: [
      { hanzi: '书包', pinyin: 'shūbāo', arabic: 'حقيبة مدرسية', emoji: '🎒' },
      { hanzi: '裤子', pinyin: 'kùzi', arabic: 'بنطال', emoji: '👖' },
      { hanzi: '手表', pinyin: 'shǒubiǎo', arabic: 'ساعة يد', emoji: '⌚' },
      { hanzi: '本子', pinyin: 'běnzi', arabic: 'دفتر', emoji: '📓' },
      { hanzi: '笔', pinyin: 'bǐ', arabic: 'قلم', emoji: '🖊️' },
      { hanzi: '包', pinyin: 'bāo', arabic: 'حقيبة / كيس', emoji: '👜' }
  ] },
  { key: 'cat3', label: 'الأماكن', icon: '🏙️', words: [
      { hanzi: '商场', pinyin: 'shāngchǎng', arabic: 'مركز تسوّق', emoji: '🏬' },
      { hanzi: '饭馆', pinyin: 'fànguǎn', arabic: 'مطعم', emoji: '🍽️' },
      { hanzi: '酒店', pinyin: 'jiǔdiàn', arabic: 'فندق', emoji: '🏨' },
      { hanzi: '教室', pinyin: 'jiàoshì', arabic: 'قاعة الدرس / الفصل', emoji: '🏫' },
      { hanzi: '药店', pinyin: 'yàodiàn', arabic: 'صيدلية', emoji: '🏥' },
      { hanzi: '门口', pinyin: 'ménkǒu', arabic: 'المدخل / الباب', emoji: '🚪' },
      { hanzi: '楼', pinyin: 'lóu', arabic: 'مبنى / طابق', emoji: '🏢' }
  ] },
  { key: 'cat4', label: 'المواصلات', icon: '🚌', words: [
      { hanzi: '公交车', pinyin: 'gōngjiāochē', arabic: 'حافلة عامة', emoji: '🚌' },
      { hanzi: '地铁', pinyin: 'dìtiě', arabic: 'مترو الأنفاق', emoji: '🚇' },
      { hanzi: '车站', pinyin: 'chēzhàn', arabic: 'محطة (حافلات/قطار)', emoji: '🚏' },
      { hanzi: '机场', pinyin: 'jīchǎng', arabic: 'مطار', emoji: '🛫' },
      { hanzi: '机票', pinyin: 'jīpiào', arabic: 'تذكرة طيران', emoji: '🎫' },
      { hanzi: '门票', pinyin: 'ménpiào', arabic: 'تذكرة دخول', emoji: '🎟️' }
  ] },
  { key: 'cat5', label: 'الرياضة والطبيعة', icon: '🏀', words: [
      { hanzi: '篮球', pinyin: 'lánqiú', arabic: 'كرة السلة', emoji: '🏀' },
      { hanzi: '足球', pinyin: 'zúqiú', arabic: 'كرة القدم', emoji: '⚽' },
      { hanzi: '鸟', pinyin: 'niǎo', arabic: 'طائر / عصفور', emoji: '🐦' },
      { hanzi: '花', pinyin: 'huā', arabic: 'زهرة / يُنفق', emoji: '🌸' },
      { hanzi: '眼睛', pinyin: 'yǎnjing', arabic: 'عين / عينان', emoji: '👁️' }
  ] },
]
