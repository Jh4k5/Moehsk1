// «HSK 1 يبدأ بـ١٥٠ منها فقط» — the stale number the owner named.
//
// It comes from the OLD HSK syllabus, where level one was 150 words. The new
// syllabus this platform teaches has 405, and the corpus in this repository
// holds exactly that. The primer is the first screen a beginner reads, so the
// first factual claim the platform makes about itself was wrong by a factor of
// nearly three — and wrong in the direction that undersells the work.
//
// The replacement numbers are measured, not chosen:
//   405 words · 374 distinct characters in HSK1 (counted over the corpus)
// and the card is about CHARACTERS, so it now says both — the character count
// is the honest answer to its own title, «كم رمزاً تحتاج؟», and the word count
// is what a reader will compare against everything else on the platform.
//
// NOT TOUCHED: `src/lib/tutor/engine.ts:494` also says «~150». That line is a
// different and defensible claim — roughly 150 characters covers about half of
// everyday text — and has nothing to do with the size of HSK1. Deleting every
// «150» in the repository would have removed a true sentence along with the
// false one.

module.exports = {
  id: '0002-hsk1-word-count',
  describe: '[2.10] the primer said HSK1 is 150 words; it is 405',
  edits: () => [
    {
      file: 'src/data/primer.ts',
      from: "body: 'للحياة اليومية نحو ٢٠٠٠ رمز، وHSK 1 يبدأ بـ١٥٠ منها فقط. لن تحفظ عشرات الآلاف — هذه خرافة تُخيف المبتدئين بلا سبب.',",
      to: "body: 'للحياة اليومية نحو ٢٠٠٠ رمز، وHSK 1 يبدأ بـ٣٧٤ منها عبر ٤٠٥ كلمات. لن تحفظ عشرات الآلاف — هذه خرافة تُخيف المبتدئين بلا سبب.',",
    },
  ],
}
