# `content-baseline.json` — the ratchet

Each number is **the worst this check is allowed to be**. `check-content.js`
fails the build in both directions:

* the count went **up** → this change made the content worse;
* the count went **down** → good, now lower the number here so the gain is
  locked in and cannot slide back unnoticed.

Zeroes are settled ground: pinyin, duplicate titles, function-word openers,
teaching order and unpaired Arabic in the engine are all fixed, and any
regression is a build failure on the spot.

The non-zero rows are honest debt, each one authoring work rather than a
script:

| row | what it is |
|---|---|
| `staleWordCount` | 1 — the tutor's «~150 حرفاً» line, a claim about CHARACTERS covering half of everyday text. True, and unrelated to HSK1's size. Left deliberately. |
| `prerequisiteViolations` | 430 of 1,079 words whose example sentences use a character taught later. |
| `arabicOnEnglishRoute` | 379 strings — Arabic story titles and Arabic speaker names reaching the `/en` route. |
| `missingEnglishMnemonics` | 1,079 — the field does not exist on any word yet. |
| `missingEnglishSentences` | 1,890 example sentences with no English. |
