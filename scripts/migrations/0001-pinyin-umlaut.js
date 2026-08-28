// ü written as plain u in `pinyinRaw` — three words.
//
// This is not a spelling preference. In Mandarin `lu` and `lü` are DIFFERENT
// syllables with different meanings: 路 lù is "road", 绿 lǜ is "green". The
// display field is correct in all three cases; the numbered field beside it
// says something else, and the numbered field is what a tone drill and any
// future audio lookup read.
//
// `v` is the standard keyboard stand-in for `ü` and is what the rest of the
// corpus uses (see HSK1's 女儿 «nv3'e2r»), so that is the spelling restored
// here. Note that HSK2 writes this field WITHOUT tone digits at all
// («bangmang», not «bang1mang2»), so no digits are introduced: the fix is the
// umlaut and nothing else, and the level's own convention is left alone.

module.exports = {
  id: '0001-pinyin-umlaut',
  describe: '[2.9] restore the ü in three pinyinRaw fields',
  edits: () => [
    { file: 'src/data/hsk2/vocabulary2.ts', from: "pinyinRaw:'luyou'", to: "pinyinRaw:'lvyou'" },
    { file: 'src/data/hsk2/vocabulary2.ts', from: "pinyinRaw:'luse'", to: "pinyinRaw:'lvse'" },
    { file: 'src/data/hsk2/vocabulary2.ts', from: "pinyinRaw:'nuhair'", to: "pinyinRaw:'nvhair'" },
  ],
}
