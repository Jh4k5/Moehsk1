// --- HSK 1 Exam Bank ---------------------------------------------------------
// Phase 3 - Full exam simulator data for listening & reading sections

export interface TrueFalseQuestion {
  id: string
  audio_text: string
  image_emoji: string
  image_label_ar: string
  correct: boolean
  explanation_ar: string
}

export interface MCQOption {
  emoji: string
  label: string
  correct: boolean
}

export interface MCQQuestion {
  id: string
  audio_text: string
  options: MCQOption[]
  explanation_ar: string
}

export interface DialogueTurn {
  speaker: string
  text: string
}

export interface DialogueQuestion {
  id: string
  dialogue: DialogueTurn[]
  question_ar: string
  options: string[]
  correct_index: number
  explanation_ar: string
}

export interface ReadingMatchQuestion {
  id: string
  hanzi: string
  options: MCQOption[]
}

export interface ReadingTrueFalse {
  id: string
  hanzi: string
  image_emoji: string
  image_label: string
  correct: boolean
  explanation_ar: string
}

export interface FillBlankQuestion {
  id: string
  sentence: string
  word_choices: string[]
  correct_index: number
  full_sentence: string
  translation_ar: string
}

export interface HSK1ExamBank {
  listening_part1: TrueFalseQuestion[]
  listening_part2: MCQQuestion[]
  listening_part3: DialogueQuestion[]
  reading_part1: ReadingMatchQuestion[]
  reading_part2: ReadingTrueFalse[]
  reading_part3: FillBlankQuestion[]
}

export const HSK1_EXAM_BANK: HSK1ExamBank = {
  // ===========================================================================
  // Listening Part 1 - True / False (5 questions)
  // ===========================================================================
  listening_part1: [
    {
      id: "lp1_01",
      audio_text: "\u6211\u662F\u5B66\u751F\u3002",
      image_emoji: "\uD83D\uDCDA",
      image_label_ar: "\u0637\u0627\u0644\u0628 \u064A\u062F\u0631\u0633",
      correct: true,
      explanation_ar: "\"\u6211\u662F\u5B66\u751F\" \u062A\u0639\u0646\u064A \"\u0623\u0646\u0627 \u0637\u0627\u0644\u0628\"\u060C \u0648\u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u0637\u0627\u0644\u0628\u064B\u0627 \u064A\u062F\u0631\u0633. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629.",
    },
    {
      id: "lp1_02",
      audio_text: "\u5979\u559D\u8336\u3002",
      image_emoji: "\u2615",
      image_label_ar: "\u0634\u062E\u0635 \u064A\u0634\u0631\u0628",
      correct: true,
      explanation_ar: "\"\u5979\u559D\u8336\" \u062A\u0639\u0646\u064A \"\u0647\u064A \u062A\u0634\u0631\u0628 \u0627\u0644\u0634\u0627\u064A\"\u060C \u0648\u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u0634\u062E\u0635\u064B\u0627 \u064A\u0634\u0631\u0628. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629.",
    },
    {
      id: "lp1_03",
      audio_text: "\u4ECA\u5929\u5929\u6C14\u5F88\u597D\u3002",
      image_emoji: "\u26C8\uFE0F",
      image_label_ar: "\u0639\u0627\u0635\u0641\u0629 \u0648\u0623\u0645\u0637\u0627\u0631",
      correct: false,
      explanation_ar: "\"\u4ECA\u5929\u5929\u6C14\u5F88\u597D\" \u062A\u0639\u0646\u064A \"\u0627\u0644\u0637\u0642\u0633 \u062C\u064A\u062F \u0627\u0644\u064A\u0648\u0645\"\u060C \u0644\u0643\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u0639\u0627\u0635\u0641\u0629 \u0648\u0623\u0645\u0637\u0627\u0631. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u062E\u0627\u0637\u0626\u0629.",
    },
    {
      id: "lp1_04",
      audio_text: "\u4ED6\u5728\u5403\u996D\u3002",
      image_emoji: "\uD83C\uDF5A",
      image_label_ar: "\u0634\u062E\u0635 \u064A\u0623\u0643\u0644",
      correct: true,
      explanation_ar: "\"\u4ED6\u5728\u5403\u996D\" \u062A\u0639\u0646\u064A \"\u0647\u0648 \u064A\u0623\u0643\u0644\"\u060C \u0648\u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u0634\u062E\u0635\u064B\u0627 \u064A\u0623\u0643\u0644. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629.",
    },
    {
      id: "lp1_05",
      audio_text: "\u6211\u4EEC\u53BB\u5B66\u6821\u3002",
      image_emoji: "\uD83C\uDFE5",
      image_label_ar: "\u0645\u0633\u062A\u0634\u0641\u0649",
      correct: false,
      explanation_ar: "\"\u6211\u4EEC\u53BB\u5B66\u6821\" \u062A\u0639\u0646\u064A \"\u0646\u062D\u0646 \u0646\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u0645\u062F\u0631\u0633\u0629\"\u060C \u0644\u0643\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u0645\u0633\u062A\u0634\u0641\u0649 \u0648\u0644\u064A\u0633 \u0645\u062F\u0631\u0633\u0629. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u062E\u0627\u0637\u0626\u0629.",
    },
  ],

  // ===========================================================================
  // Listening Part 2 - Multiple Choice with emoji options (5 questions)
  // ===========================================================================
  listening_part2: [
    {
      id: "lp2_01",
      audio_text: "\u82F9\u679C",
      options: [
        { emoji: "\uD83C\uDF4E", label: "\u062A\u0641\u0627\u062D", correct: true },
        { emoji: "\uD83C\uDF4C", label: "\u0645\u0648\u0632", correct: false },
        { emoji: "\uD83C\uDF4A", label: "\u0628\u0631\u062A\u0642\u0627\u0644", correct: false },
        { emoji: "\uD83C\uDF47", label: "\u0639\u0646\u0628", correct: false },
      ],
      explanation_ar: "\"\u82F9\u679C\" (p\u00EDnggu\u01D2) \u062A\u0639\u0646\u064A \"\u062A\u0641\u0627\u062D\".",
    },
    {
      id: "lp2_02",
      audio_text: "\u533B\u9662",
      options: [
        { emoji: "\uD83C\uDFEB", label: "\u0645\u062F\u0631\u0633\u0629", correct: false },
        { emoji: "\uD83C\uDFE5", label: "\u0645\u0633\u062A\u0634\u0641\u0649", correct: true },
        { emoji: "\uD83C\uDFEA", label: "\u0645\u062A\u062C\u0631", correct: false },
        { emoji: "\u2708\uFE0F", label: "\u0645\u0637\u0627\u0631", correct: false },
      ],
      explanation_ar: "\"\u533B\u9662\" (y\u012Byu\u00E0n) \u062A\u0639\u0646\u064A \"\u0645\u0633\u062A\u0634\u0641\u0649\".",
    },
    {
      id: "lp2_03",
      audio_text: "\u7238\u7238\u548C\u5988\u5988",
      options: [
        { emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", label: "\u0623\u0628 \u0648\u0623\u0645 \u0648\u0637\u0641\u0644\u0629", correct: true },
        { emoji: "\uD83D\uDC6B", label: "\u0635\u062F\u064A\u0642\u0627\u0646", correct: false },
        { emoji: "\uD83D\uDC76", label: "\u0637\u0641\u0644 \u0648\u062D\u062F\u0647", correct: false },
        { emoji: "\uD83D\uDC74\u200D\uD83D\uDC75", label: "\u062C\u062F \u0648\u062C\u062F\u0629", correct: false },
      ],
      explanation_ar: "\"\u7238\u7238\u548C\u5988\u5988\" (b\u00E0ba h\u00E9 m\u0101ma) \u062A\u0639\u0646\u064A \"\u0623\u0628 \u0648\u0623\u0645\".",
    },
    {
      id: "lp2_04",
      audio_text: "\u73B0\u5728\u4E03\u70B9\u534A\u3002",
      options: [
        { emoji: "\uD83D\uDD55", label: "6:00", correct: false },
        { emoji: "\uD83D\uDD57", label: "7:30", correct: true },
        { emoji: "\uD83D\uDD56", label: "7:00", correct: false },
        { emoji: "\uD83D\uDD58", label: "8:30", correct: false },
      ],
      explanation_ar: "\"\u73B0\u5728\u4E03\u70B9\u534A\" (xi\u00E0nz\u00E0i q\u012B di\u01CEn b\u00E0n) \u062A\u0639\u0646\u064A \"\u0627\u0644\u0622\u0646 \u0627\u0644\u0633\u0627\u0628\u0639\u0629 \u0648\u0627\u0644\u0646\u0635\u0641\".",
    },
    {
      id: "lp2_05",
      audio_text: "\u4E0B\u96EA\u4E86\u3002",
      options: [
        { emoji: "\u2600\uFE0F", label: "\u0645\u0634\u0645\u0633", correct: false },
        { emoji: "\uD83C\uDF27\uFE0F", label: "\u0645\u0645\u0637\u0631", correct: false },
        { emoji: "\u2744\uFE0F", label: "\u062B\u0644\u062C", correct: true },
        { emoji: "\uD83C\uDF2C\uFE0F", label: "\u0639\u0627\u0635\u0641", correct: false },
      ],
      explanation_ar: "\"\u4E0B\u96EA\u4E86\" (xi\u00E0 xu\u011B le) \u062A\u0639\u0646\u064A \"\u0623\u0635\u0628\u062D \u064A\u062A\u0633\u0627\u0642\u0637 \u0627\u0644\u062B\u0644\u062C\".",
    },
  ],

  // ===========================================================================
  // Listening Part 3 - Dialogue comprehension (10 questions)
  // ===========================================================================
  listening_part3: [
    {
      id: "lp3_01",
      dialogue: [
        { speaker: "\u7537", text: "\u4F60\u597D\uFF0C\u4F60\u53EB\u4EC0\u4E48\u540D\u5B57\uFF1F" },
        { speaker: "\u5973", text: "\u4F60\u597D\uFF0C\u6211\u53EB\u5C0F\u7EA2\u3002" },
      ],
      question_ar: "\u0645\u0627 \u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0623\u0629\u061F",
      options: ["\u0634\u064A\u0627\u0648 \u0645\u064A\u0646\u063A", "\u0634\u064A\u0627\u0648 \u0647\u0648\u0646\u063A", "\u0634\u064A\u0627\u0648 \u0647\u0648\u0627", "\u0634\u064A\u0627\u0648 \u0644\u064A"],
      correct_index: 1,
      explanation_ar: "\u0627\u0644\u0645\u0631\u0623\u0629 \u062A\u0642\u0648\u0644 \"\u6211\u53EB\u5C0F\u7EA2\" \u0623\u064A \u0627\u0633\u0645\u0647\u0627 \"\u0634\u064A\u0627\u0648 \u0647\u0648\u0646\u063A\".",
    },
    {
      id: "lp3_02",
      dialogue: [
        { speaker: "\u7537", text: "\u4F60\u4ECA\u5929\u53BB\u4E0D\u53BB\u5B66\u6821\uFF1F" },
        { speaker: "\u5973", text: "\u6211\u53BB\uFF0C\u4F60\u5462\uFF1F" },
        { speaker: "\u7537", text: "\u6211\u4E5F\u53BB\u3002" },
      ],
      question_ar: "\u0647\u0644 \u0627\u0644\u0631\u062C\u0644 \u064A\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u0645\u062F\u0631\u0633\u0629\u061F",
      options: ["\u0644\u0627\u060C \u0644\u0627 \u064A\u0630\u0647\u0628", "\u0646\u0639\u0645\u060C \u064A\u0630\u0647\u0628", "\u0644\u0627 \u064A\u0639\u0631\u0641", "\u064A\u0630\u0647\u0628 \u063A\u062F\u064B\u0627"],
      correct_index: 1,
      explanation_ar: "\u0627\u0644\u0631\u062C\u0644 \u064A\u0642\u0648\u0644 \"\u6211\u4E5F\u53BB\" \u0623\u064A \"\u0623\u0646\u0627 \u0623\u064A\u0636\u064B\u0627 \u0623\u0630\u0647\u0628\".",
    },
    {
      id: "lp3_03",
      dialogue: [
        { speaker: "\u5973", text: "\u4F60\u559C\u6B22\u559D\u4EC0\u4E48\uFF1F" },
        { speaker: "\u7537", text: "\u6211\u559C\u6B22\u559D\u8336\u3002" },
      ],
      question_ar: "\u0645\u0627\u0630\u0627 \u064A\u062D\u0628 \u0627\u0644\u0631\u062C\u0644 \u0623\u0646 \u064A\u0634\u0631\u0628\u061F",
      options: ["\u0642\u0647\u0648\u0629", "\u062D\u0644\u064A\u0628", "\u0634\u0627\u064A", "\u0645\u0627\u0621"],
      correct_index: 2,
      explanation_ar: "\u0627\u0644\u0631\u062C\u0644 \u064A\u0642\u0648\u0644 \"\u6211\u559C\u6B22\u559D\u8336\" \u0623\u064A \"\u0623\u062D\u0628 \u0634\u0631\u0628 \u0627\u0644\u0634\u0627\u064A\".",
    },
    {
      id: "lp3_04",
      dialogue: [
        { speaker: "\u7537", text: "\u73B0\u5728\u662F\u51E0\u70B9\uFF1F" },
        { speaker: "\u5973", text: "\u73B0\u5728\u516B\u70B9\u3002" },
        { speaker: "\u7537", text: "\u554A\uFF0C\u6211\u8BE5\u4E0A\u8BFE\u4E86\u3002" },
      ],
      question_ar: "\u0643\u0645 \u0627\u0644\u0633\u0627\u0639\u0629 \u0627\u0644\u0622\u0646\u061F",
      options: ["\u0633\u0628\u0639\u0629", "\u062B\u0645\u0627\u0646\u064A\u0629", "\u062A\u0633\u0639\u0629", "\u0639\u0634\u0631\u0629"],
      correct_index: 1,
      explanation_ar: "\u0627\u0644\u0645\u0631\u0623\u0629 \u062A\u0642\u0648\u0644 \"\u73B0\u5728\u516B\u70B9\" \u0623\u064A \"\u0627\u0644\u0622\u0646 \u0627\u0644\u062B\u0627\u0645\u0646\u0629\".",
    },
    {
      id: "lp3_05",
      dialogue: [
        { speaker: "\u5973", text: "\u8FD9\u662F\u4F60\u7684\u4E66\u5417\uFF1F" },
        { speaker: "\u7537", text: "\u4E0D\u662F\uFF0C\u6211\u7684\u4E66\u5728\u684C\u5B50\u4E0A\u3002" },
      ],
      question_ar: "\u0623\u064A\u0646 \u0643\u062A\u0627\u0628 \u0627\u0644\u0631\u062C\u0644\u061F",
      options: ["\u0639\u0644\u0649 \u0627\u0644\u0643\u0631\u0633\u064A", "\u0641\u064A \u0627\u0644\u062D\u0642\u064A\u0628\u0629", "\u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0648\u0644\u0629", "\u062A\u062D\u062A \u0627\u0644\u0633\u0631\u064A\u0631"],
      correct_index: 2,
      explanation_ar: "\u0627\u0644\u0631\u062C\u0644 \u064A\u0642\u0648\u0644 \"\u6211\u7684\u4E66\u5728\u684C\u5B50\u4E0A\" \u0623\u064A \"\u0643\u062A\u0627\u0628\u064A \u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0648\u0644\u0629\".",
    },
    {
      id: "lp3_06",
      dialogue: [
        { speaker: "\u7537", text: "\u4ECA\u5929\u5929\u6C14\u600E\u4E48\u6837\uFF1F" },
        { speaker: "\u5973", text: "\u4ECA\u5929\u5F88\u51B7\uFF0C\u4E0B\u96EA\u4E86\u3002" },
      ],
      question_ar: "\u0645\u0627 \u0647\u0648 \u0627\u0644\u0637\u0642\u0633 \u0627\u0644\u064A\u0648\u0645\u061F",
      options: ["\u0645\u0634\u0645\u0633 \u0648\u062F\u0627\u0641\u0626", "\u0628\u0627\u0631\u062F \u0648\u064A\u062A\u0633\u0627\u0642\u0637 \u0627\u0644\u062B\u0644\u062C", "\u062D\u0627\u0631 \u0648\u0645\u0645\u0637\u0631", "\u0639\u0627\u0635\u0641"],
      correct_index: 1,
      explanation_ar: "\u0627\u0644\u0645\u0631\u0623\u0629 \u062A\u0642\u0648\u0644 \"\u4ECA\u5929\u5F88\u51B7\uFF0C\u4E0B\u96EA\u4E86\" \u0623\u064A \"\u0627\u0644\u064A\u0648\u0645 \u0628\u0627\u0631\u062F\u060C \u064A\u062A\u0633\u0627\u0642\u0637 \u0627\u0644\u062B\u0644\u062C\".",
    },
    {
      id: "lp3_07",
      dialogue: [
        { speaker: "\u5973", text: "\u4F60\u65E9\u996D\u5403\u4EC0\u4E48\u4E86\uFF1F" },
        { speaker: "\u7537", text: "\u6211\u5403\u4E86\u4E00\u4E2A\u9762\u5305\u548C\u4E00\u676F\u725B\u5976\u3002" },
      ],
      question_ar: "\u0645\u0627\u0630\u0627 \u0623\u0643\u0644 \u0627\u0644\u0631\u062C\u0644 \u0641\u064A \u0627\u0644\u0625\u0641\u0637\u0627\u0631\u061F",
      options: ["\u0623\u0631\u0632 \u0648\u0634\u0627\u064A", "\u062E\u0628\u0632 \u0648\u062D\u0644\u064A\u0628", "\u0645\u0639\u0643\u0631\u0648\u0646\u0629 \u0648\u0645\u0627\u0621", "\u0644\u0645 \u064A\u0623\u0643\u0644 \u0634\u064A\u0626\u064B\u0627"],
      correct_index: 1,
      explanation_ar: "\u0627\u0644\u0631\u062C\u0644 \u064A\u0642\u0648\u0644 \"\u6211\u5403\u4E86\u4E00\u4E2A\u9762\u5305\u548C\u4E00\u676F\u725B\u5976\" \u0623\u064A \"\u0623\u0643\u0644\u062A \u062E\u0628\u0632\u0629 \u0648\u0643\u0648\u0628 \u062D\u0644\u064A\u0628\".",
    },
    {
      id: "lp3_08",
      dialogue: [
        { speaker: "\u7537", text: "\u4F60\u5BB6\u6709\u51E0\u53E3\u4EBA\uFF1F" },
        { speaker: "\u5973", text: "\u6211\u5BB6\u6709\u4E09\u53E3\u4EBA\uFF0C\u7238\u7238\u3001\u5988\u5988\u548C\u6211\u3002" },
      ],
      question_ar: "\u0643\u0645 \u0639\u062F\u062F \u0623\u0641\u0631\u0627\u062F \u0639\u0627\u0626\u0644\u0629 \u0627\u0644\u0645\u0631\u0623\u0629\u061F",
      options: ["\u0634\u062E\u0635\u0627\u0646", "\u062B\u0644\u0627\u062B\u0629", "\u0623\u0631\u0628\u0639\u0629", "\u062E\u0645\u0633\u0629"],
      correct_index: 1,
      explanation_ar: "\u0627\u0644\u0645\u0631\u0623\u0629 \u062A\u0642\u0648\u0644 \"\u6211\u5BB6\u6709\u4E09\u53E3\u4EBA\" \u0623\u064A \"\u0639\u0627\u0626\u0644\u062A\u064A \u0645\u0643\u0648\u0646\u0629 \u0645\u0646 \u062B\u0644\u0627\u062B\u0629 \u0623\u0634\u062E\u0627\u0635\".",
    },
    {
      id: "lp3_09",
      dialogue: [
        { speaker: "\u5973", text: "\u4F60\u8981\u53BB\u54EA\u513F\uFF1F" },
        { speaker: "\u7537", text: "\u6211\u8981\u53BB\u533B\u9662\u770B\u670B\u53CB\u3002" },
      ],
      question_ar: "\u0625\u0644\u0649 \u0623\u064A\u0646 \u064A\u0630\u0647\u0628 \u0627\u0644\u0631\u062C\u0644\u061F",
      options: ["\u0625\u0644\u0649 \u0627\u0644\u0645\u062F\u0631\u0633\u0629", "\u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649", "\u0625\u0644\u0649 \u0627\u0644\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A", "\u0625\u0644\u0649 \u0627\u0644\u0645\u0646\u0632\u0644"],
      correct_index: 1,
      explanation_ar: "\u0627\u0644\u0631\u062C\u0644 \u064A\u0642\u0648\u0644 \"\u6211\u8981\u53BB\u533B\u9662\" \u0623\u064A \"\u0633\u0623\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649\".",
    },
    {
      id: "lp3_10",
      dialogue: [
        { speaker: "\u7537", text: "\u4F60\u5B66\u4E60\u4E2D\u6587\u591A\u957F\u65F6\u95F4\u4E86\uFF1F" },
        { speaker: "\u5973", text: "\u6211\u5B66\u4E86\u4E09\u4E2A\u6708\u4E86\u3002" },
        { speaker: "\u7537", text: "\u4F60\u7684\u4E2D\u6587\u5F88\u597D\uFF01" },
      ],
      question_ar: "\u0645\u0646\u0630 \u0645\u062A\u0649 \u062A\u062F\u0631\u0633 \u0627\u0644\u0645\u0631\u0623\u0629 \u0627\u0644\u0635\u064A\u0646\u064A\u0629\u061F",
      options: ["\u0634\u0647\u0631 \u0648\u0627\u062D\u062F", "\u0634\u0647\u0631\u0627\u0646", "\u062B\u0644\u0627\u062B\u0629 \u0623\u0634\u0647\u0631", "\u0633\u062A\u0629 \u0623\u0634\u0647\u0631"],
      correct_index: 2,
      explanation_ar: "\u0627\u0644\u0645\u0631\u0623\u0629 \u062A\u0642\u0648\u0644 \"\u6211\u5B66\u4E86\u4E09\u4E2A\u6708\u4E86\" \u0623\u064A \"\u0623\u062F\u0631\u0633 \u0645\u0646\u0630 \u062B\u0644\u0627\u062B\u0629 \u0623\u0634\u0647\u0631\".",
    },
  ],

  // ===========================================================================
  // Reading Part 1 - Match hanzi to emoji meaning (5 questions)
  // ===========================================================================
  reading_part1: [
    {
      id: "rp1_01",
      hanzi: "\u7535\u8BDD",
      options: [
        { emoji: "\uD83D\uDCF1", label: "\u0647\u0627\u062A\u0641", correct: true },
        { emoji: "\uD83D\uDCBB", label: "\u062D\u0627\u0633\u0648\u0628", correct: false },
        { emoji: "\uD83D\uDCFA", label: "\u062A\u0644\u0641\u0627\u0632", correct: false },
        { emoji: "\uD83D\uDCF7", label: "\u0643\u0627\u0645\u064A\u0631\u0627", correct: false },
      ],
    },
    {
      id: "rp1_02",
      hanzi: "\u98DE\u673A",
      options: [
        { emoji: "\uD83D\uDE82", label: "\u0642\u0637\u0627\u0631", correct: false },
        { emoji: "\u2708\uFE0F", label: "\u0637\u0627\u0626\u0631\u0629", correct: true },
        { emoji: "\uD83D\uDE8C", label: "\u062D\u0627\u0641\u0644\u0629", correct: false },
        { emoji: "\uD83D\uDEA2", label: "\u0633\u0641\u064A\u0646\u0629", correct: false },
      ],
    },
    {
      id: "rp1_03",
      hanzi: "\u732B",
      options: [
        { emoji: "\uD83D\uDC15", label: "\u0643\u0644\u0628", correct: false },
        { emoji: "\uD83D\uDC1F", label: "\u0633\u0645\u0643\u0629", correct: false },
        { emoji: "\uD83D\uDC31", label: "\u0642\u0637\u0629", correct: true },
        { emoji: "\uD83D\uDC26", label: "\u0637\u0627\u0626\u0631", correct: false },
      ],
    },
    {
      id: "rp1_04",
      hanzi: "\u4E0B\u96E8",
      options: [
        { emoji: "\u2744\uFE0F", label: "\u062B\u0644\u062C", correct: false },
        { emoji: "\uD83C\uDF27\uFE0F", label: "\u0645\u0637\u0631", correct: true },
        { emoji: "\u2600\uFE0F", label: "\u0634\u0645\u0633", correct: false },
        { emoji: "\uD83C\uDF08", label: "\u0642\u0648\u0633 \u0642\u0632\u062D", correct: false },
      ],
    },
    {
      id: "rp1_05",
      hanzi: "\u9AD8\u5174",
      options: [
        { emoji: "\uD83D\uDE22", label: "\u062D\u0632\u064A\u0646", correct: false },
        { emoji: "\uD83D\uDE20", label: "\u063A\u0627\u0636\u0628", correct: false },
        { emoji: "\uD83D\uDE0A", label: "\u0633\u0639\u064A\u062F", correct: true },
        { emoji: "\uD83D\uDE34", label: "\u0646\u0639\u0633\u0627\u0646", correct: false },
      ],
    },
  ],

  // ===========================================================================
  // Reading Part 2 - True / False (5 questions)
  // ===========================================================================
  reading_part2: [
    {
      id: "rp2_01",
      hanzi: "\u5979\u5728\u559D\u5496\u5561\u3002",
      image_emoji: "\uD83C\uDF75",
      image_label: "\u0634\u0627\u064A",
      correct: false,
      explanation_ar: "\"\u5496\u5561\" \u062A\u0639\u0646\u064A \"\u0642\u0647\u0648\u0629\" \u0648\u0644\u064A\u0633 \"\u0634\u0627\u064A\". \u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u0627\u0644\u0634\u0627\u064A \u0648\u0644\u064A\u0633 \u0627\u0644\u0642\u0647\u0648\u0629. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u062E\u0627\u0637\u0626\u0629.",
    },
    {
      id: "rp2_02",
      hanzi: "\u4ED6\u5728\u770B\u4E66\u3002",
      image_emoji: "\uD83D\uDCD6",
      image_label: "\u0642\u0631\u0627\u0621\u0629",
      correct: true,
      explanation_ar: "\"\u770B\u4E66\" \u062A\u0639\u0646\u064A \"\u0642\u0631\u0627\u0621\u0629 \u0643\u062A\u0627\u0628\"\u060C \u0648\u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u0634\u062E\u0635\u064B\u0627 \u064A\u0642\u0631\u0623. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629.",
    },
    {
      id: "rp2_03",
      hanzi: "\u4ECA\u5929\u661F\u671F\u4E09\u3002",
      image_emoji: "\uD83D\uDCC5",
      image_label: "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621",
      correct: true,
      explanation_ar: "\"\u661F\u671F\u4E09\" \u062A\u0639\u0646\u064A \"\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621\". \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629.",
    },
    {
      id: "rp2_04",
      hanzi: "\u4ED6\u4EEC\u5728\u6253\u7403\u3002",
      image_emoji: "\uD83C\uDFCA",
      image_label: "\u0633\u0628\u0627\u062D\u0629",
      correct: false,
      explanation_ar: "\"\u6253\u7403\" \u062A\u0639\u0646\u064A \"\u0627\u0644\u0644\u0639\u0628 \u0628\u0643\u0631\u0629\" \u0648\u0644\u064A\u0633 \"\u0627\u0644\u0633\u0628\u0627\u062D\u0629\". \u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u0634\u062E\u0635\u064B\u0627 \u064A\u0633\u0628\u062D \u0648\u0644\u064A\u0633 \u064A\u0644\u0639\u0628. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u062E\u0627\u0637\u0626\u0629.",
    },
    {
      id: "rp2_05",
      hanzi: "\u8FD9\u4E2A\u82F9\u679C\u5F88\u7EA2\u3002",
      image_emoji: "\uD83C\uDF4E",
      image_label: "\u062A\u0641\u0627\u062D\u0629 \u062D\u0645\u0631\u0627\u0621",
      correct: true,
      explanation_ar: "\"\u5F88\u7EA2\" \u062A\u0639\u0646\u064A \"\u0623\u062D\u0645\u0631 \u062C\u062F\u064B\u0627\". \u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0638\u0647\u0631 \u062A\u0641\u0627\u062D\u0629 \u062D\u0645\u0631\u0627\u0621. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629.",
    },
  ],

  // ===========================================================================
  // Reading Part 3 - Fill in the blank (10 questions)
  // ===========================================================================
  reading_part3: [
    {
      id: "rp3_01",
      sentence: "\u6211\u662F\u4E00\u4E2A___\u3002",
      word_choices: ["\u5B66\u751F", "\u8001\u5E08", "\u533B\u751F", "\u670B\u53CB"],
      correct_index: 0,
      full_sentence: "\u6211\u662F\u4E00\u4E2A\u5B66\u751F\u3002",
      translation_ar: "\u0623\u0646\u0627 \u0637\u0627\u0644\u0628.",
    },
    {
      id: "rp3_02",
      sentence: "\u4ED6\u6BCF\u5929\u65E9\u4E0A\u559D___\u3002",
      word_choices: ["\u5496\u5561", "\u725B\u5976", "\u6C34", "\u8336"],
      correct_index: 3,
      full_sentence: "\u4ED6\u6BCF\u5929\u65E9\u4E0A\u559D\u8336\u3002",
      translation_ar: "\u0647\u0648 \u064A\u0634\u0631\u0628 \u0627\u0644\u0634\u0627\u064A \u0643\u0644 \u0635\u0628\u0627\u062D.",
    },
    {
      id: "rp3_03",
      sentence: "\u4ECA\u5929___\u5F88\u597D\u3002",
      word_choices: ["\u5929\u6C14", "\u65F6\u95F4", "\u5730\u65B9", "\u4E1C\u897F"],
      correct_index: 0,
      full_sentence: "\u4ECA\u5929\u5929\u6C14\u5F88\u597D\u3002",
      translation_ar: "\u0627\u0644\u0637\u0642\u0633 \u062C\u064A\u062F \u0627\u0644\u064A\u0648\u0645.",
    },
    {
      id: "rp3_04",
      sentence: "\u6211\u60F3\u53BB___\u4E70\u6C34\u679C\u3002",
      word_choices: ["\u5B66\u6821", "\u533B\u9662", "\u8D85\u5E02", "\u673A\u573A"],
      correct_index: 2,
      full_sentence: "\u6211\u60F3\u53BB\u8D85\u5E02\u4E70\u6C34\u679C\u3002",
      translation_ar: "\u0623\u0631\u064A\u062F \u0627\u0644\u0630\u0647\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u0641\u0648\u0627\u0643\u0647.",
    },
    {
      id: "rp3_05",
      sentence: "\u5979\u662F\u6211___\u3002",
      word_choices: ["\u59D0\u59D0", "\u670B\u53CB", "\u5988\u5988", "\u8001\u5E08"],
      correct_index: 1,
      full_sentence: "\u5979\u662F\u6211\u670B\u53CB\u3002",
      translation_ar: "\u0647\u064A \u0635\u062F\u064A\u0642\u062A\u064A.",
    },
    {
      id: "rp3_06",
      sentence: "\u73B0\u5728\u662F___\uFF0C\u6211\u8BE5\u8D70\u4E86\u3002",
      word_choices: ["\u516B\u70B9", "\u5341\u70B9", "\u5341\u4E8C\u70B9", "\u4E24\u70B9"],
      correct_index: 2,
      full_sentence: "\u73B0\u5728\u662F\u5341\u4E8C\u70B9\uFF0C\u6211\u8BE5\u8D70\u4E86\u3002",
      translation_ar: "\u0627\u0644\u0622\u0646 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \u0639\u0634\u0631\u0629\u060C \u064A\u062C\u0628 \u0623\u0646 \u0623\u0630\u0647\u0628.",
    },
    {
      id: "rp3_07",
      sentence: "\u8FD9\u4E2A___\u5F88\u597D\u5403\u3002",
      word_choices: ["\u82F9\u679C", "\u4E66", "\u7535\u5F71", "\u97F3\u4E50"],
      correct_index: 0,
      full_sentence: "\u8FD9\u4E2A\u82F9\u679C\u5F88\u597D\u5403\u3002",
      translation_ar: "\u0647\u0630\u0647 \u0627\u0644\u062A\u0641\u0627\u062D\u0629 \u0644\u0630\u064A\u0630\u0629 \u062C\u062F\u064B\u0627.",
    },
    {
      id: "rp3_08",
      sentence: "\u4ED6___\u559C\u6B22\u8FD0\u52A8\u3002",
      word_choices: ["\u4E0D", "\u5F88", "\u4E5F", "\u90FD"],
      correct_index: 1,
      full_sentence: "\u4ED6\u5F88\u559C\u6B22\u8FD0\u52A8\u3002",
      translation_ar: "\u0647\u0648 \u064A\u062D\u0628 \u0627\u0644\u0631\u064A\u0627\u0636\u0629 \u0643\u062B\u064A\u0631\u064B\u0627.",
    },
    {
      id: "rp3_09",
      sentence: "\u8BF7\u4F60___\u4E00\u4E0B\u3002",
      word_choices: ["\u5750", "\u7B49", "\u770B", "\u8BF4"],
      correct_index: 1,
      full_sentence: "\u8BF7\u4F60\u7B49\u4E00\u4E0B\u3002",
      translation_ar: "\u0645\u0646 \u0641\u0636\u0644\u0643 \u0627\u0646\u062A\u0638\u0631 \u0642\u0644\u064A\u0644\u064B\u0627.",
    },
    {
      id: "rp3_10",
      sentence: "\u660E\u5929\u662F\u661F\u671F___\u3002",
      word_choices: ["\u4E00", "\u4E09", "\u4E94", "\u516D"],
      correct_index: 2,
      full_sentence: "\u660E\u5929\u662F\u661F\u671F\u4E94\u3002",
      translation_ar: "\u063A\u062F\u064B\u0627 \u0647\u0648 \u0627\u0644\u062C\u0645\u0639\u0629.",
    },
  ],
}
