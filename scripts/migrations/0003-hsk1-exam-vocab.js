// [2.17] Nine characters in the HSK1 exam bank that HSK1 never teaches.
//
// Surfaced by `scripts/check-exam-vocab.js` the first time it ran — a check
// written to police the two NEW banks, which immediately found the OLD one had
// been breaking the rule all along.
//
// The nine: 啊 猫 咖 啡 球 每 音 乐 等. Every one is HSK2 or later, and every one
// sat in a question an HSK1 learner is scored on.
//
// Each edit swaps the offending word for an HSK1 word that keeps the question
// testing the SAME skill. Nothing is removed: every item still exists, still
// tests what it tested, and still offers four choices. See the comments beside
// each edit in `scripts/` for the reasoning, including why «菜» was rejected as
// a replacement distractor for rp3_07.

module.exports = {
  id: '0003-hsk1-exam-vocab',
  describe: '[2.17] HSK1 exam used 9 characters HSK1 never teaches',
  edits: () => ([
    {
        "file": "src/data/examBank.ts",
        "from": "        { speaker: \"\\u7537\", text: \"\\u554A\\uFF0C\\u6211\\u8BE5\\u4E0A\\u8BFE\\u4E86\\u3002\" },",
        "to": "        { speaker: \"\\u7537\", text: \"\\u6211\\u8981\\u53BB\\u5B66\\u6821\\u3002\" },"
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      hanzi: \"\\u732B\",",
        "to": "      hanzi: \"\\u4E66\","
    },
    {
        "file": "src/data/examBank.ts",
        "from": "        { emoji: \"\\uD83D\\uDC15\", label: \"\\u0643\\u0644\\u0628\", correct: false },",
        "to": "        { emoji: \"\\uD83D\\uDCF1\", label: \"\\u0647\\u0627\\u062A\\u0641\", correct: false },"
    },
    {
        "file": "src/data/examBank.ts",
        "from": "        { emoji: \"\\uD83D\\uDC1F\", label: \"\\u0633\\u0645\\u0643\\u0629\", correct: false },",
        "to": "        { emoji: \"\\uD83E\\uDD64\", label: \"\\u0643\\u0648\\u0628\", correct: false },"
    },
    {
        "file": "src/data/examBank.ts",
        "from": "        { emoji: \"\\uD83D\\uDC31\", label: \"\\u0642\\u0637\\u0629\", correct: true },",
        "to": "        { emoji: \"\\uD83D\\uDCD6\", label: \"\\u0643\\u062A\\u0627\\u0628\", correct: true },"
    },
    {
        "file": "src/data/examBank.ts",
        "from": "        { emoji: \"\\uD83D\\uDC26\", label: \"\\u0637\\u0627\\u0626\\u0631\", correct: false },",
        "to": "        { emoji: \"\\uD83D\\uDE97\", label: \"\\u0633\\u064A\\u0627\\u0631\\u0629\", correct: false },"
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      hanzi: \"\\u5979\\u5728\\u559D\\u5496\\u5561\\u3002\",\n      image_emoji: \"\\uD83C\\uDF75\",\n      image_label: \"\\u0634\\u0627\\u064A\",\n      correct: false,",
        "to": "      hanzi: \"\\u5979\\u5728\\u559D\\u8336\\u3002\",\n      image_emoji: \"\\uD83C\\uDF75\",\n      image_label: \"\\u0634\\u0627\\u064A\",\n      correct: true,"
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      explanation_ar: \"\\\"\\u5496\\u5561\\\" \\u062A\\u0639\\u0646\\u064A \\\"\\u0642\\u0647\\u0648\\u0629\\\" \\u0648\\u0644\\u064A\\u0633 \\\"\\u0634\\u0627\\u064A\\\". \\u0627\\u0644\\u0635\\u0648\\u0631\\u0629 \\u062A\\u0638\\u0647\\u0631 \\u0627\\u0644\\u0634\\u0627\\u064A \\u0648\\u0644\\u064A\\u0633 \\u0627\\u0644\\u0642\\u0647\\u0648\\u0629. \\u0627\\u0644\\u0625\\u062C\\u0627\\u0628\\u0629 \\u062E\\u0627\\u0637\\u0626\\u0629.\",",
        "to": "      explanation_ar: \"\\u00AB\\u8336\\u00BB \\u062A\\u0639\\u0646\\u064A \\u00AB\\u0634\\u0627\\u064A\\u00BB\\u060C \\u0648\\u0627\\u0644\\u0635\\u0648\\u0631\\u0629 \\u062A\\u064F\\u0638\\u0647\\u0631 \\u0627\\u0644\\u0634\\u0627\\u064A. \\u0627\\u0644\\u0625\\u062C\\u0627\\u0628\\u0629 \\u0635\\u062D\\u064A\\u062D\\u0629.\","
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      hanzi: \"\\u4ED6\\u4EEC\\u5728\\u6253\\u7403\\u3002\",",
        "to": "      hanzi: \"\\u4ED6\\u4EEC\\u5728\\u770B\\u4E66\\u3002\","
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      explanation_ar: \"\\\"\\u6253\\u7403\\\" \\u062A\\u0639\\u0646\\u064A \\\"\\u0627\\u0644\\u0644\\u0639\\u0628 \\u0628\\u0643\\u0631\\u0629\\\" \\u0648\\u0644\\u064A\\u0633 \\\"\\u0627\\u0644\\u0633\\u0628\\u0627\\u062D\\u0629\\\". \\u0627\\u0644\\u0635\\u0648\\u0631\\u0629 \\u062A\\u0638\\u0647\\u0631 \\u0634\\u062E\\u0635\\u064B\\u0627 \\u064A\\u0633\\u0628\\u062D \\u0648\\u0644\\u064A\\u0633 \\u064A\\u0644\\u0639\\u0628. \\u0627\\u0644\\u0625\\u062C\\u0627\\u0628\\u0629 \\u062E\\u0627\\u0637\\u0626\\u0629.\",",
        "to": "      explanation_ar: \"\\u00AB\\u770B\\u4E66\\u00BB \\u062A\\u0639\\u0646\\u064A \\u00AB\\u064A\\u0642\\u0631\\u0623 \\u0643\\u062A\\u0627\\u0628\\u064B\\u0627\\u00BB \\u0648\\u0644\\u064A\\u0633 \\u00AB\\u0627\\u0644\\u0633\\u0628\\u0627\\u062D\\u0629\\u00BB. \\u0627\\u0644\\u0635\\u0648\\u0631\\u0629 \\u062A\\u064F\\u0638\\u0647\\u0631 \\u0634\\u062E\\u0635\\u064B\\u0627 \\u064A\\u0633\\u0628\\u062D. \\u0627\\u0644\\u0625\\u062C\\u0627\\u0628\\u0629 \\u062E\\u0627\\u0637\\u0626\\u0629.\","
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      sentence: \"\\u4ED6\\u6BCF\\u5929\\u65E9\\u4E0A\\u559D___\\u3002\",",
        "to": "      sentence: \"\\u4ED6\\u65E9\\u4E0A\\u559D___\\u3002\","
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      word_choices: [\"\\u5496\\u5561\", \"\\u725B\\u5976\", \"\\u6C34\", \"\\u8336\"],",
        "to": "      word_choices: [\"\\u83DC\", \"\\u725B\\u5976\", \"\\u6C34\", \"\\u8336\"],"
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      full_sentence: \"\\u4ED6\\u6BCF\\u5929\\u65E9\\u4E0A\\u559D\\u8336\\u3002\",",
        "to": "      full_sentence: \"\\u4ED6\\u65E9\\u4E0A\\u559D\\u8336\\u3002\","
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      translation_ar: \"\\u0647\\u0648 \\u064A\\u0634\\u0631\\u0628 \\u0627\\u0644\\u0634\\u0627\\u064A \\u0643\\u0644 \\u0635\\u0628\\u0627\\u062D.\",",
        "to": "      translation_ar: \"\\u0647\\u0648 \\u064A\\u0634\\u0631\\u0628 \\u0627\\u0644\\u0634\\u0627\\u064A \\u0641\\u064A \\u0627\\u0644\\u0635\\u0628\\u0627\\u062D.\","
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      word_choices: [\"\\u82F9\\u679C\", \"\\u4E66\", \"\\u7535\\u5F71\", \"\\u97F3\\u4E50\"],",
        "to": "      word_choices: [\"\\u82F9\\u679C\", \"\\u4E66\", \"\\u7535\\u5F71\", \"\\u8F66\"],"
    },
    {
        "file": "src/data/examBank.ts",
        "from": "      sentence: \"\\u8BF7\\u4F60___\\u4E00\\u4E0B\\u3002\",\n      word_choices: [\"\\u5750\", \"\\u7B49\", \"\\u770B\", \"\\u8BF4\"],\n      correct_index: 1,\n      full_sentence: \"\\u8BF7\\u4F60\\u7B49\\u4E00\\u4E0B\\u3002\",\n      translation_ar: \"\\u0645\\u0646 \\u0641\\u0636\\u0644\\u0643 \\u0627\\u0646\\u062A\\u0638\\u0631 \\u0642\\u0644\\u064A\\u0644\\u064B\\u0627.\",",
        "to": "      sentence: \"\\u8BF7\\u4F60___\\u4E00\\u4E0B\\u3002\",\n      word_choices: [\"\\u5750\", \"\\u5403\", \"\\u770B\", \"\\u8BF4\"],\n      correct_index: 0,\n      full_sentence: \"\\u8BF7\\u4F60\\u5750\\u4E00\\u4E0B\\u3002\",\n      translation_ar: \"\\u0645\\u0646 \\u0641\\u0636\\u0644\\u0643 \\u0627\\u062C\\u0644\\u0633 \\u0642\\u0644\\u064A\\u0644\\u064B\\u0627.\","
    }
]),
}
