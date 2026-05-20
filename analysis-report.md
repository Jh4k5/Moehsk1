# مُضَّن (Mudann) — Chinese Learning Platform Analysis Report
**Generated:** 2026-05-19  
**Platform:** Next.js 16 + TypeScript + Tailwind CSS + Prisma (SQLite) + Zustand + NextAuth.js

---

## 1. Project History Summary

| Task | Description | Status |
|------|-------------|--------|
| Task 1 | Major UI overhaul: Dashboard layout + Quizlet flashcards + Auth system | ✅ Complete |
| Task 2 | Fix server startup issue (website not opening) | ✅ Complete |

The platform started as a single-page Chinese learning app and has been restructured into a **dashboard-first** architecture with a **collapsible sidebar** for 17 learning sections.

---

## 2. Screenshot Analysis (VLM)

The uploaded screenshot shows an **older version** of the platform (before Task 1 overhaul):

### What the screenshot shows:
- **Bottom navigation**: 5 tabs — الرئيسية (Home), الألعاب (Games), التحديات (Challenges), الكلمات (Words), الإعدادات (Settings)
- **Dashboard cards**: "الإنجاز الأول" (First Achievement) with 0% progress, "الكلمة الأولى" (First Word) showing character 不
- **Stats**: 4 days, 0 weeks, 410 words total
- **Red hand-drawn shape**: Suggests a handwriting practice feature was attempted

### Discrepancy with current code:
The current codebase has a **completely different layout**:
- **Bottom nav**: الرئيسية (Home), المفردات (Vocabulary), التمارين (Practice), الألعاب (Games), المزيد (More)
- **Dashboard**: 8 rich widgets (Progress, Word of Day, Smart Review, Quick Review, Daily Plan, Achievements, Recent Activity, Weak Words)
- The "التحديات" (Challenges) and "الإعدادات" (Settings) sections from the screenshot **no longer exist** in the sidebar

---

## 3. Current Architecture

### Tech Stack
- **Framework**: Next.js (App Router) with `'use client'` components
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components + custom CSS animations
- **State**: Zustand with `persist` middleware (localStorage)
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth.js v5 with Credentials provider (bcryptjs)
- **Animations**: Framer Motion
- **TTS**: Web Speech API (`speechSynthesis`)
- **Speech Recognition**: Web Speech API (`SpeechRecognition`) for pronunciation practice

### File Structure
```
src/
├── app/
│   ├── page.tsx              # Main page (dashboard + sidebar + routing)
│   ├── layout.tsx            # Root layout with providers
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth handler
│       │   └── register/route.ts       # User registration
│       └── user/progress/route.ts     # Progress CRUD
├── components/
│   ├── DashboardWidgets.tsx    # 8 dashboard widgets
│   ├── LessonSystem.tsx        # 15 lessons (embedded data)
│   ├── QuizletFlashcard.tsx    # 3-mode flashcard (Flashcard/Sort/Pronunciation)
│   ├── VocabularySection.tsx   # 4-tab vocabulary (Cards/Quizlet/Favorites/List)
│   ├── QASection.tsx           # 3-tab Q&A (Patterns/Word Ordering/Quiz)
│   ├── VisualDictionary.tsx    # 3-view visual dict (Browse/Pronounce/Quiz)
│   ├── AuthDialog.tsx          # Login/Register dialog
│   ├── ConversationsSection.tsx
│   ├── ExamSimulator.tsx
│   ├── PronunciationPractice.tsx
│   ├── HanziSection.tsx
│   ├── AchievementsSection.tsx
│   ├── PinyinHub.tsx
│   ├── PomodoroTimer.tsx
│   ├── ErrorBoundary.tsx
│   ├── providers.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── sections/
│       ├── GamesSection.tsx
│       ├── GrammarSection.tsx
│       ├── PracticeSection.tsx
│       ├── SentencesSection.tsx
│       ├── StoriesSection.tsx
│       ├── ChatSection.tsx
│       ├── RoadmapSection.tsx
│       ├── HandwritingSection.tsx
│       ├── PronunciationSection.tsx
│       ├── DashboardSection.tsx
│       ├── LessonsSection.tsx
│       └── QuickReviewWidget.tsx
├── data/
│   ├── vocabulary.ts           # 410 HSK 1 words (main dataset)
│   ├── categories.ts           # 9 POS categories
│   ├── roadmap.ts              # 10 learning units
│   ├── grammarPracticeQuestions.ts  # 26 grammar topic quizzes (3 Qs each)
│   ├── visualDict.ts           # 62 words across 8 categories
│   ├── grammar.ts
│   ├── lessons.ts
│   ├── conversations.ts
│   ├── tonePairs.ts
│   ├── achievements.ts
│   ├── examBank.ts
│   ├── stories.ts
│   ├── pinyin.ts
│   └── content.ts
├── lib/
│   ├── store.ts               # Zustand store (main state)
│   ├── srs.ts                 # Spaced Repetition System
│   ├── auth.ts                # NextAuth config
│   ├── db.ts                  # Prisma client
│   └── helpers.ts             # Utility functions
├── types/
│   └── index.ts               # Section type union
└── prisma/
    └── schema.prisma           # Database schema
```

---

## 4. Sidebar Section Order (Current)

| # | Section ID | Arabic Label | Icon | Status |
|---|-----------|-------------|------|--------|
| 1 | `vocabulary` | المفردات والنطق | BookOpen | ✅ Working |
| 2 | `lessons` | الدروس | BookOpenText | ✅ Working |
| 3 | `grammar` | القواعد | GraduationCap | ✅ Working |
| 4 | `conversations` | المحادثات | MessageSquare | ✅ Working |
| 5 | `sentences` | الجمل | MessageCircle | ✅ Working |
| 6 | `practice` | التمارين | Target | ⚠️ Props passed but unused |
| 7 | `games` | الألعاب | Gamepad2 | ⚠️ Props passed but unused |
| 8 | `pinyin` | البينين | Sparkles | ✅ Working |
| 9 | `hanzi` | الحروف | PenTool | ✅ Working |
| 10 | `visual-dict` | القاموس البصري | Image | ✅ Working |
| 11 | `stories` | القصص | BookMarked | ⚠️ Props passed but unused |
| 12 | `exam` | محاكي الامتحان | FileText | ✅ Working |
| 13 | `achievements` | الإنجازات | Medal | ✅ Working |
| 14 | `chat` | المساعد الذكي | Bot | ✅ Working |
| 15 | `qa` | أسئلة شائعة | HelpCircle | ✅ Working |
| 16 | `roadmap` | خريطة الطريق | Map | ✅ Working |
| 17 | `pronunciation` | تمارين النطق | Mic | ✅ Working |

---

## 5. Component Analysis

### Core Components (Working)
| Component | Location | Lines | Description |
|-----------|----------|-------|-------------|
| `page.tsx` | `src/app/` | 349 | Main page: dashboard + sidebar + section routing |
| `DashboardWidgets` | `src/components/` | 436 | 8 animated dashboard cards |
| `LessonSystem` | `src/components/` | ~1500+ | 15 embedded lessons with conversations, grammar, exercises |
| `VocabularySection` | `src/components/sections/` | 302 | 4-tab vocab (Cards/Quizlet/Favorites/List) |
| `QASection` | `src/components/` | ~900+ | 3-tab Q&A with drag-and-drop exercises |
| `VisualDictionary` | `src/components/` | ~900+ | 3-view (Browse/Pronounce/Quiz) with speech recognition |
| `AuthDialog` | `src/components/` | 228 | Login/Register with email + password |
| `QuizletFlashcard` | `src/components/` | — | 3-mode flashcards (Flashcard/Sort/Pronunciation) |
| `Store` | `src/lib/store.ts` | 419 | Zustand with SRS, games, exam, quiz, chat state |

### Issues Found

1. **VocabularySection receives unused props**: `searchQuery`, `setSearchQuery`, `selectedCategory`, `setSelectedCategory`, `hideMastered`, `setHideMastered` are all passed as no-op functions (`() => {}`). The section **doesn't manage its own search/filter state** — it relies on parent props that are hardcoded.

2. **PracticeSection, GamesSection, StoriesSection receive dummy props**: State management is split awkwardly — some state lives in parent (page.tsx) but is passed as stubs.

3. **LessonSystem has embedded data**: ~1500+ lines with 15 lessons, conversations, grammar rules, and exercises hardcoded directly in the component. This should be extracted to data files (a separate `lessons.ts` exists but may not be used).

4. **Duplicate data files**: Both `src/data/lessons.ts` and the inline data in `LessonSystem.tsx` exist. Unclear which is the source of truth.

5. **Unused sections in `src/components/sections/`**: 
   - `DashboardSection.tsx` — appears unused (dashboard is `DashboardWidgets.tsx`)
   - `LessonsSection.tsx` — appears unused (lessons use `LessonSystem.tsx`)
   - `QuickReviewWidget.tsx` — appears unused (review is in `DashboardWidgets.tsx`)
   - `HandwritingSection.tsx` — no sidebar section maps to it (type has `handwriting` but no sidebar entry)
   - `PronunciationSection.tsx` — duplicates `PronunciationPractice.tsx`

6. **QASection path mismatch**: Imported as `@/components/QASection` in page.tsx but the actual file is there (not in sections/). The Glob found it at the correct path.

7. **Type definition has extra `handwriting` section**: `types/index.ts` includes `'handwriting'` but it's not in the sidebar and not rendered in `renderSectionContent()`.

---

## 6. Vocabulary Data

| Metric | Value |
|--------|-------|
| Total words | **410** |
| ID range | 1–410 |
| HSK Level | 1 |
| Word fields per entry | 21 fields (id, zh, pinyin, pos, meaning, exZh, exPinyin, exEn, s2, s3, mnemonic, sentences, lesson, difficulty, strokeCount, radicals, pinyinRaw, tones, english, frequencyRank) |
| Lessons covered | 1–15 |
| Difficulty levels | easy / medium / hard |
| POS categories | 9 (all, noun, verb, adjective, pronoun, numeral, particle, adverb, fixed) |

### Visual Dictionary (separate)
| Metric | Value |
|--------|-------|
| Total words | **62** |
| Categories | 8 (numbers, food, family, places, transport, weather, emotions, time) |
| Word fields | 4 (hanzi, pinyin, arabic, emoji) |

### Grammar Practice Questions
| Metric | Value |
|--------|-------|
| Topics | 26 |
| Questions per topic | 3 |
| Total questions | 78 |

---

## 7. Auth System Status

| Component | Status | Notes |
|-----------|--------|-------|
| NextAuth Config | ✅ Working | Credentials provider, bcryptjs |
| Register API | ✅ Working | Email validation, password hashing, duplicate check |
| Login API | ✅ Working | Via NextAuth callback |
| Progress API | ✅ Working | GET (fetch) + POST (save/update) |
| Auth Dialog UI | ✅ Working | Login/Register tabs |
| Session Provider | ✅ Working | Wrapped in layout.tsx |
| useAuth Hook | ✅ Exists | Client-side auth state |
| Server ↔ Client sync | ⚠️ **Disconnected** | Zustand (localStorage) and Prisma (server DB) are **NOT synced**. Progress is stored locally and never pushed to the server. |

### Auth Gap Analysis
- **Problem**: The Zustand store persists to `localStorage` (key: `hsk-learning-storage`) but there's **no code that syncs local progress to the server database**. When a user logs in, their local state is NOT merged with or uploaded to the server.
- **Impact**: Users lose progress when switching devices/browsers, despite having a working auth system and database schema.

---

## 8. Database Schema (Prisma)

| Model | Fields | Purpose |
|-------|--------|---------|
| `User` | id, email, name, password, image, emailVerified, timestamps | Core user model |
| `Account` | standard OAuth fields | OAuth provider accounts |
| `Session` | sessionToken, userId, expires | User sessions |
| `VerificationToken` | identifier, token, expires | Email verification |
| `UserProgress` | userId, date, wordsLearned, questionsAnswered, gamesPlayed, timeSpent | Daily activity tracking |
| `WordProgress` | userId, wordId, isLearned, isBookmarked, pronunciationScore, srs* | Per-word progress with SRS fields |
| `QuizHistory` | userId, date, score, total, difficulty, type | Quiz results |
| `UserAchievement` | userId, achievementId, unlockedAt | Achievement tracking |

### Database: SQLite
- Provider: SQLite
- Location: `DATABASE_URL` env var
- Schema synced via `bun run db:push`

---

## 9. Zustand Store State Management

### Persisted State (localStorage)
| State | Type | Description |
|-------|------|-------------|
| `learnedWords` | `number[]` | IDs of learned vocabulary words |
| `bookmarkedWords` | `number[]` | IDs of bookmarked words |
| `completedStories` | `number[]` | Indices of completed stories |
| `quizHistory` | `QuizHistoryEntry[]` | Quiz results with date/score/difficulty/type |
| `highScores` | `Record<string, number>` | Best scores per game |
| `dailyStreak` | `number` | Consecutive study days |
| `lastStudyDate` | `string` | Date of last study activity |
| `srsCards` | `Record<number, SRSCard>` | SM-2 spaced repetition cards |
| `dailyActivity` | `Record<string, DailyActivity>` | Daily words/questions/games counts |

### Non-persisted State (resets on reload)
| State | Type | Description |
|-------|------|-------------|
| `currentSection` | `Section` | Currently active sidebar section |
| `flashcardIndex` | `number` | Current flashcard position |
| `isFlipped` | `boolean` | Flashcard flip state |
| `quizScore/Total/Questions` | various | Active quiz state |
| `memoryCards/Moves/Pairs` | various | Memory game state |
| `chatMessages` | `ChatMessage[]` | AI chat history |
| `gameTimer/Difficulty/Score/Streak` | various | Game state |
| `examStarted/Type/Answers/Score/Time` | various | Exam state |

### SRS System
- Algorithm: **SM-2** (SuperMemo 2)
- Quality ratings: 0-5
- Fields per card: easeFactor, interval, repetitions, nextReview, lastReview, reviewCount
- Due card detection: `isDueForReview()`
- Weak word identification: `getWeakWords()` (low easeFactor, high incorrect rate)

---

## 10. Screenshot vs. Code Discrepancies

| Feature | Screenshot (Old) | Current Code |
|---------|-----------------|--------------|
| Layout | Tab-based with bottom nav | Dashboard + collapsible sidebar |
| Bottom nav tabs | Home, Games, Challenges, Words, Settings | Home, Vocabulary, Practice, Games, More |
| Dashboard content | 2 simple cards | 8 rich animated widgets |
| Challenges section | Exists | ❌ **Removed** |
| Settings section | Exists | ❌ **Removed** |
| Word display | Single card with 不 character | Multi-tab flashcard system |
| Progress | 0% circular | Animated SVG progress ring |
| Sidebar | None | 17-section collapsible sidebar |
| Auth UI | Not visible | Login button in header |

---

## 11. Key Findings

### ✅ Strengths
1. **Rich vocabulary**: 410 HSK 1 words with 21 data fields per word (pinyin, tones, radicals, mnemonics, examples)
2. **Comprehensive SRS**: Full SM-2 implementation with due cards, weak words, difficulty tracking
3. **15 structured lessons**: Each with conversations, grammar rules, and exercises
4. **Multi-mode learning**: Flashcards, Quizlet sort, pronunciation practice, visual dictionary, games
5. **Arabic localization**: Full RTL interface with Arabic labels
6. **Modern UI**: Framer Motion animations, shadcn/ui components, gradient cards
7. **Auth + DB ready**: NextAuth, Prisma schema with full progress tracking models

### ⚠️ Issues
1. **Auth-state sync gap**: Local Zustand state is never synced to server DB — auth system is functionally decorative
2. **Lesson data embedded**: 15 lessons (~1500 lines) hardcoded in `LessonSystem.tsx` instead of using data files
3. **Stub props pattern**: Several sections receive no-op callback props from page.tsx
4. **Duplicate/unused sections**: 5+ component files appear unused (DashboardSection, LessonsSection, QuickReviewWidget, HandwritingSection, PronunciationSection)
5. **Orphan type**: `handwriting` section type exists but has no sidebar entry or route
6. **No challenges section**: Was in screenshot but removed without replacement
7. **No settings section**: Was in screenshot but removed — no way to configure app
8. **Chat section**: Likely non-functional (no AI API key configured)
9. **Categories import mismatch**: VocabularySection imports `categories` from `@/data/content` (not `@/data/categories`)
10. **Screenshot outdated**: The uploaded screenshot shows a completely different UI version

### 🔴 Critical
- **Server ↔ Client progress sync is broken** — the #1 priority for the next phase

---

## 12. Recommendations for Next Development Phase

### Priority 1: Server Sync
- Implement a sync layer that pushes Zustand state to `/api/user/progress` when user is authenticated
- On login, merge server progress with local state
- Add a "sync status" indicator in the UI

### Priority 2: Clean Up Architecture
- Extract lesson data from `LessonSystem.tsx` into `src/data/lessons.ts`
- Remove unused component files (DashboardSection, LessonsSection, QuickReviewWidget, etc.)
- Fix VocabularySection to manage its own search/filter state (remove stub props)
- Remove orphan `handwriting` type or implement the section
- Fix categories import path in VocabularySection

### Priority 3: Restore Missing Features
- Add "التحديات" (Challenges) section — was in original UI
- Add "الإعدادات" (Settings) section — theme, sound, notifications, reset progress
- Consider a dedicated "Handwriting" section using the type that already exists

### Priority 4: Enhance Existing Features
- Add more grammar practice questions (currently only 3 per topic)
- Expand visual dictionary beyond 62 words
- Add sentence audio playback using TTS
- Implement real AI chat integration

### Priority 5: UX Improvements
- Add onboarding tutorial for new users
- Improve progress clarity (percentage with context)
- Add study reminders/notifications
- Better mobile responsiveness for sidebar sections
