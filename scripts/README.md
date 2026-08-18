# scripts/

Data-integrity tooling for the curriculum rebuild.

| script | what it does |
|---|---|
| `ts-load.js` | requires `.ts` data modules directly (transpiles on require, resolves `@/`) so audits read the real arrays instead of grepping text |
| `validate-content.js` | **the quality gate.** ids, ranges, duplicates, language integrity, lesson↔word single-sourcing, tone-mark correctness, roadmap references. `npm run validate:content` |
| `audit-lesson-map.js` | reports disagreements between `word.lesson` and `lessons[].vocabularyIds` |
| `lang-audit.js` | finds Arabic fields holding English and English fields holding Arabic |
| `fix-curriculum-map.js` | one-shot: made `lessons[].vocabularyIds` the single source of truth, placed orphans, removed duplicate words |
| `place-orphans.js` / `verify-context.js` | evidence used to place the 12 unassigned HSK1 words — each was assigned to the first lesson whose own sentences actually use it |
| `dup-compare.js` | evidence used to pick which of each duplicate word pair to keep (richer data, earlier lesson) |
| `regen-roadmap.js` | derives roadmap units from lessons so coverage is 100% by construction |
| `apply-ar.js` / `apply-en.js` | applied the authored translations in `translations/` |

`translations/` holds the authored strings so the work is reviewable and re-appliable.

Run `npm run check` before committing content changes.
