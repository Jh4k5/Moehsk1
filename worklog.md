---
Task ID: 1
Agent: Main Developer
Task: Full Restoration & Enhancement — 7 Tasks Implementation

Work Log:
- Fixed vocabulary.ts syntax errors (duplicate frequencyRank, unescaped apostrophe in 'it's okay')
- Created LoginScreen.tsx with 3 auth modes (login/register/guest) + localStorage persistence
- Added auth guard to page.tsx (LoginScreen shows first if no currentUser)
- Enhanced sidebar with user avatar, name, progress counter, lessons dropdown (15 lessons)
- Connected SRS SM-2 algorithm to Vocabulary section (due cards first, know/don't know buttons)
- Added microphone pronunciation testing to flashcard mode (Speech Recognition API)
- Added practical "حياة" (daily life) category to QASection with 8 real-world questions
- Added True/False exercise type (صواب أو خطأ) to Practice section
- Added Speed Game (لعبة السرعة ⚡) — 30 seconds, Arabic→Chinese matching, streak counter
- All changes were surgical (Additive Only) — no files rewritten, no features deleted

Stage Summary:
- ✅ HTTP 200 confirmed after every task
- ✅ All 17 sections preserved in navigation
- ✅ 410 vocabulary words intact
- ✅ 0 TypeScript errors in modified files
- ✅ LoginScreen.tsx (new file) — beautiful glassmorphism auth screen
- ✅ page.tsx grew from 2980 to 3304 lines (all additive)
- ✅ QASection.tsx grew with new practical category
- Backup created: page.tsx.bak.[timestamp]

---
Task ID: 2
Agent: Main Developer
Task: JISR Platform — Comprehensive Update (9 Tasks)

Work Log:
- TASK 1: Rebranded from مُضَّن/穆安 to جِسر/Jisr/桥 across layout.tsx, page.tsx header, and LoginScreen.tsx
- TASK 2: Changed color scheme from light blue (#1CB0F6) to dark blue (#1A5FA8) in globals.css + all hardcoded references in page.tsx
- TASK 3: Fixed flashcard flip bug — moved rotateY from CSS class to framer-motion animate prop to prevent inline style override conflict
- TASK 4: Verified exercises work correctly — all props properly passed, store methods functional
- TASK 5: Added sidebar toggle (PanelRightClose/Open) with collapsible state, logout button at bottom, icons-only mode when collapsed
- TASK 6: Replaced Quick Actions grid with Weak Words section (SRS-based) + Daily Plan checklist on Dashboard
- TASK 7: Enhanced microphone UI — large prominent button on card back face with recording animation, removed small nav button
- TASK 8: Rewrote QASection.tsx with 6 practical conversation categories (shopping, restaurant, introductions, help, transport, health) + accordion UI
- TASK 9: Updated all remaining color references (#1CB0F6→#1A5FA8, #0A90D4→#0D4E82, #E0F6FF→#E8F0FA) across page.tsx
- Added imports: PanelRightClose, PanelRightOpen, LogOut, Mic, getWeakWords
- Updated localStorage key to 'jisr_currentUser' (backward compatible with 'mudann_currentUser')

Stage Summary:
- ✅ HTTP 200 confirmed — server compiles and serves correctly
- ✅ All 17 sections preserved
- ✅ 411 vocabulary words intact
- ✅ page.tsx: 3384 lines (all surgical edits, no full rewrites)
- ✅ QASection.tsx: fully rewritten with practical Q&A
- ✅ LoginScreen.tsx: rebranded to Jisr
- ✅ globals.css: dark blue color scheme applied
- ✅ Backups created for all modified files

---
Task ID: Sidebar Redesign
Agent: Main Agent
Task: Complete sidebar redesign with JISR branding and dark theme

Work Log:
- Analyzed current sidebar: inline `<nav>` within Home component, white theme, w-56/w-16 toggle
- Replaced navItems: reorganized order (Dashboard first, then Lessons expandable, then section groups)
- Updated lessonNames to match actual lessons.ts titles (15 lessons)
- Changed "أسئلة شائعة" to "أسئلة يومية" in navItems
- Changed "المساعد" to "المساعد الذكي" in navItems
- Replaced entire sidebar `<nav>` with `<aside>` dark theme:
  - Background: from-[#0A1628] to-[#0D2137] (dark navy)
  - Logo: 桥 icon in blue gradient + جِسر / JISR · HSK 1
  - Desktop: sticky, w-64 expanded / w-[68px] collapsed with tooltips
  - Mobile: drawer with overlay, translate-x-full/translate-x-0
  - Mobile hamburger button added (fixed top-right)
  - Lessons expandable dropdown with 15 lesson titles
  - 4 section groups: التعلم, التدريب, الأدوات, أخرى
  - User info card with avatar, streak, word count, logout
  - Progress footer with blue gradient bar on dark background
- Replaced mobile bottom nav: 5 items (Dashboard, Lessons, Vocab, Practice, Chat) + "المزيد" hamburger
- Added CSS: sidebar-progress class for dark theme progress bars
- Fixed CSS parsing error (backslash in class selector → named class)

Stage Summary:
- Sidebar: Dark navy gradient, collapsible, mobile drawer, grouped sections, JISR branding
- Mobile: Hamburger button, drawer overlay, updated bottom nav with 5+1 items
- Server: HTTP 200, no duplicates, 3473 lines
- Branding: Consistent 桥/جِسر/JISR identity

---
Task ID: 3
Agent: Main Developer
Task: Rebuild Vocabulary System with Anki + Quizlet Standards (SRS + Active Recall + Pronunciation)

Work Log:
- Analyzed current VocabularySection (lines 1195-2153, 959 lines) in page.tsx
- Verified data: vocabulary.ts has 410 words with `sentences[]` (3 per word), `mnemonic` field, SRS fields
- Verified SRS library: SM-2 algorithm with `calculateNextReview()`, `isDueForReview()`, `getWeakWords()`
- Verified store: `rateWord()`, `getDueCardIds()`, `getSRSStats()` all functional
- Built new enhanced VocabularySection (~1030 lines) with:
  - **Front Face**: text-9xl Chinese character (serif), pinyin, dedicated [🔊 استمع] TTS button, POS badge, "اضغط للقلب" hint
  - **Back Face**: Large meaning, Chinese+pinyin mini display, 💡 memory tip (mnemonic), 3 sentences with per-sentence TTS, prominent [🎤 انطق الكلمة] mic button, inline pronunciation score, [✅ أعرفها] [❌ لا أعرفها] SRS buttons
  - **4 Study Modes**: Cards, Learn, Test, Match — all preserved and enhanced
  - **SRS Integration**: Learn mode now rates words (4/1), Test mode rates words, Cards mode has dedicated know/don't-know handlers
  - **Due counter**: "🎯 X بطاقة مستحقة اليوم" badge in header
  - **All 410 words** available via `word.sentences[]` + fallback to exZh/s2/s3
  - **TTS**: speechSynthesis zh-CN via `speak()` function
  - **Speech Recognition**: webkitSpeechRecognition zh-CN with 5 alternatives, Levenshtein similarity scoring
  - **Event handling**: e.stopPropagation() on all 11 internal buttons, flip only on outer card click
- Surgical replacement via Python script (lines 1195-2153 replaced)
- Validated: HTTP 200, no TypeScript errors in modified section

Stage Summary:
- ✅ HTTP 200 confirmed — server compiles and serves correctly
- ✅ VocabularySection rebuilt with Anki/Quizlet standards
- ✅ Front/back flashcard design matches user spec exactly
- ✅ Memory tips (mnemonic) displayed on both card back and learn mode
- ✅ 3 sentences per word with per-sentence TTS
- ✅ Prominent microphone button with recording animation
- ✅ Inline pronunciation score display
- ✅ SRS SM-2 integration in all 4 modes
- ✅ Due cards counter in header
- ✅ e.stopPropagation() on all internal interactive elements
- ✅ page.tsx: 3543 lines (net +70 lines from enhanced card design)
- Pre-existing lint errors: 3 (in PronunciationSection + backup — not related to this task)

---
Task ID: 4
Agent: Main Developer
Task: Expand Lesson Content — 22-40 Words per Lesson with Full Data

Work Log:
- Read uploaded reference files: New-HSK-Vocabulary-Level-1.pdf, 新HSK教程1_compressed_compressed.pdf, hsk1_book_content (1).json
- Extracted vocabulary.ts lesson assignments: found 410 words across 15 lessons
- Identified thin lessons: L5(21), L6(13), L8(10), L9(12), L10(12), L12(8), L13(7), L14(19) — all under 22
- Rebuilt lessons.ts (1262 lines) with expanded data:
  - All 15 lessons now have 22-40 vocabulary IDs from vocabulary.ts
  - Thin lessons supplemented with thematically related words from lesson 15
  - Each lesson has: 4-7 grammar IDs, 5-8 key sentences, 2-3 conversations, 4-6 exercises
  - Exercise types: multiple_choice, fill_blank, translate, tone
  - Conversations use Arabic speaker names (علي, ليلى, أحمد, سارة) with scene emojis
- Rebuilt LessonSystem.tsx (911 lines) with enhanced 5-tab UI:
  - **View 1**: Lesson list grid (2/3/4/5 cols responsive) with colored badges, progress bars, completion states
  - **View 2**: Lesson detail with 5 tabs:
    1. المفردات — word grid with TTS, learned status toggle
    2. القواعد — grammar accordion from grammarRules data
    3. محادثة — chat-bubble conversations with TTS
    4. الجمل — key sentences list with TTS
    5. التمارين — interactive exercises (MCQ, fill-blank, translate, tone) with scoring
  - Stats summary cards (total lessons, completed, words learned, remaining)
  - Framer Motion animations, RTL layout, mobile-first responsive
  - Integrates with useLearningStore for learned words persistence

Stage Summary:
- ✅ HTTP 200 confirmed — server compiles and serves correctly
- ✅ lessons.ts: 1262 lines, 15 lessons, all with 22-40 vocabulary IDs
- ✅ LessonSystem.tsx: 911 lines, 5-tab detail view, interactive exercises
- ✅ All vocabulary IDs sourced from vocabulary.ts (no invented words)
- ✅ Grammar IDs properly mapped to grammarRules (1-26)
- ✅ Conversations with Arabic names and emoji scenes
- ✅ 4 exercise types fully implemented with scoring
- ✅ TTS on all Chinese text elements
- ✅ Zero new lint errors introduced
- ✅ grep vocabularyIds returns 15 matches (one per lesson)
