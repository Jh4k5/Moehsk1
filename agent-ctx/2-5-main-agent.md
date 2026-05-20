---
Task IDs: 2, 3, 4, 5
Agent: Main Agent
Tasks: Fix Lessons, Grammar, Sentences, and Stories sections

Work Log:

**Task 2 - Replace LessonsSection with LessonSystem:**
- Found that the renderSection switch case already used `<LessonSystem />` and the import was already present (though duplicated)
- Removed the duplicate `import LessonSystem from '@/components/LessonSystem'` on line 7
- The old `LessonDetail` and `LessonsSection` functions remain as dead code since they're not referenced
- `LessonSystem` component from `@/components/LessonSystem.tsx` provides full lesson data for 8+ lessons with words, sentences, conversations, grammar, and exercises

**Task 3 - Fix Grammar Section field name mismatches:**
- The old GrammarSection referenced non-existent fields: `rule.explanation`, `rule.example`, `rule.examplePinyin`, `rule.tip`
- The actual grammar.ts data has: `titleAr`, `description`, `pattern`, `examples[]`, `tips`
- Rewrote GrammarSection to display all 26 rules correctly with proper field names
- Each rule shows Arabic title, description, pattern box, all examples, and optional tips

**Task 4 - Fix Sentences Section to be flashcards:**
- Replaced simple reveal-based layout with full flip-card system
- Front: Chinese sentence + pinyin + audio button + word badge
- Back: Arabic translation + keyword breakdown + audio button
- Uses same CSS flip animation as VocabularySection
- Added progress bar and sentence counter
- Navigation buttons with previous/next and audio

**Task 5 - Fix Stories Section with audio improvements:**
- Added auto-play button that reads story sentence by sentence using speak()
- Added story progress indicator with Progress bar
- Changed per-sentence audio button from hover-only to always visible
- Added visual highlight for current line during auto-play
- Proper cleanup on unmount and story change

**Verification:** ESLint passes with zero errors for page.tsx. Dev server returns HTTP 200.
