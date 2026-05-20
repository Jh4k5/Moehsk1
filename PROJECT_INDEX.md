# Jisr (جِسر/桥) — HSK1 Chinese Learning Platform
## Project Index

### Architecture
- **Framework**: Next.js 16 (App Router) + TypeScript 5 + React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui + Framer Motion
- **State**: Zustand (`useLearningStore` in `src/lib/store.ts`)
- **SRS**: SM-2 Spaced Repetition (`src/lib/srs.ts`)
- **TTS**: Web Speech API (`speechSynthesis zh-CN`)
- **Theme**: Custom localStorage-based dark/light/system (no `next-themes`)
- **Fonts**: Tajawal (Arabic RTL) + Noto Sans SC / Noto Serif SC (Chinese)
- **Direction**: RTL (`dir="rtl"`, `lang="ar"`)

---

### Core Application
- `src/app/page.tsx` — Main SPA (3611 lines). Contains: Dashboard (with Word of the Day + Science Tip), Vocabulary (Anki-style flashcards with SRS), Grammar, Practice (30 random questions), Games (Memory + Speed), Stories (7 reading stories), Roadmap (10 units), Sentences, AI Chat sections. Sidebar (dark navy, collapsible, mobile drawer), header (sticky, theme toggle), mobile bottom nav.
- `src/app/layout.tsx` — Root layout (57 lines). RTL, Google Fonts (Tajawal, Noto Sans SC/Serif SC), custom ThemeProvider, FOUC prevention script in `<head>`.
- `src/app/globals.css` — Complete CSS (599 lines). Jisr color system (`--jisr-*`), shadcn/ui theme vars for light + dark modes, animations, utility classes (`.jisr-card`, `.jisr-header`, `.jisr-sidebar`, `.jisr-btn-primary`, `.jisr-flashcard`), flashcard flip animations, gamification effects.

---

### Components (src/components/)

#### Active Components (imported in page.tsx)
| File | Lines | Description |
|------|-------|-------------|
| `LoginScreen.tsx` | 293 | Auth screen with 3 modes (login/register/guest) + localStorage persistence. Glassmorphism design. |
| `LessonSystem.tsx` | 911 | 15 lessons with 5 tabs (vocab/grammar/conversation/sentences/exercises). Interactive exercises with scoring. |
| `HanziSection.tsx` | 439 | HanziWriter character drawing practice. 88 HSK1 characters. Auto-animate, quiz mode, reset. Responsive (flex-col mobile, flex-row desktop). |
| `PinyinHub.tsx` | 789 | Pinyin system with 4 tabs: Tones (5 tones with SVG pitch contours), Initials (23), Finals (24), Special Rules (4). |
| `ExamSimulator.tsx` | 642 | HSK1 mock exam (listening + reading + true/false, 40 questions). Randomized per session. |
| `ConversationsSection.tsx` | 651 | 16 everyday conversation scenes with Arabic speaker names. Chat-bubble UI with TTS. |
| `QASection.tsx` | 1428 | 22 daily-life Q&As in 5 categories (shopping, restaurant, introductions, transport, help). Per-category color scheme. Flashcard practice mode. DnD exercise + Quiz tabs. |
| `VisualDictionary.tsx` | 953 | Visual dictionary with 63 words across 8 emoji-categorized groups. |
| `AchievementsSection.tsx` | 323 | 11 unlockable achievements with progress tracking. |
| `PomodoroTimer.tsx` | 244 | Study timer (25/5/15 min Pomodoro cycles). |
| `theme-provider.tsx` | 54 | Custom theme provider (localStorage-based, no `next-themes`). Supports dark/light/system. |
| `theme-toggle.tsx` | 65 | Theme toggle dropdown with Arabic labels (فاتح/داكن/تلقائي). |

#### Legacy/Unused Components (NOT imported in page.tsx)
| File | Lines | Description |
|------|-------|-------------|
| `PronunciationPractice.tsx` | 701 | Standalone pronunciation practice — not connected to main SPA. |
| `sections/DashboardSection.tsx` | 677 | Legacy dashboard — replaced by inline section in page.tsx. |
| `sections/PracticeSection.tsx` | 899 | Legacy practice — replaced by inline section. |
| `sections/VocabularySection.tsx` | 289 | Legacy vocabulary — replaced by inline section. |
| `sections/GamesSection.tsx` | 405 | Legacy games — replaced by inline section. |
| `sections/GrammarSection.tsx` | 157 | Legacy grammar — replaced by inline section. |
| `sections/StoriesSection.tsx` | 194 | Legacy stories — replaced by inline section. |
| `sections/LessonsSection.tsx` | 175 | Legacy lessons — replaced by LessonSystem.tsx. |
| `sections/SentencesSection.tsx` | 135 | Legacy sentences — replaced by inline section. |
| `sections/HandwritingSection.tsx` | 343 | Legacy handwriting — replaced by HanziSection.tsx. |
| `sections/PronunciationSection.tsx` | 136 | Legacy pronunciation — replaced by inline section. |
| `sections/RoadmapSection.tsx` | 115 | Legacy roadmap — replaced by inline section. |
| `sections/ChatSection.tsx` | 188 | Legacy chat — replaced by inline section. |
| `sections/QuickReviewWidget.tsx` | 57 | Legacy quick review widget. |

#### shadcn/ui Components (src/components/ui/)
40 auto-generated UI primitives: `accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `checkbox`, `command`, `collapsible`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle`, `toggle-group`, `tooltip`, `chart`, `sidebar`.

---

### Data Files (src/data/)
| File | Lines | Records | Description |
|------|-------|---------|-------------|
| `vocabulary.ts` | 434 | 411 words | Full HSK1 vocabulary with `zh`, `pinyin`, `arabic`, `pos`, `sentences[]` (3 per word), `mnemonic`, SRS fields (`interval`, `easeFactor`, `nextReview`, `repetitions`). |
| `grammar.ts` | 347 | 27 rules | Grammar patterns with Chinese/Arabic explanations, examples, and usage notes. |
| `lessons.ts` | 1262 | 15 lessons | Each lesson has 22-40 `vocabularyIds`, 4-7 `grammarIds`, 5-8 key sentences, 2-3 conversations, 4-6 exercises (MCQ, fill-blank, translate, tone). |
| `conversations.ts` | 291 | 16 scenes | Dialogue-based conversations with Arabic speaker names (علي, ليلى, أحمد, سارة) and scene emojis. |
| `content.ts` | 363 | 6 exports | `categories` (9 POS tags), `roadmapUnits` (10 units), `stories` (7 reading stories with questions), `tonePairs` (7 syllable groups), `grammarPracticeQuestions` (26 rules × 3 questions), `keyboardShortcuts` (5 entries). |
| `examBank.ts` | 487 | 40 questions | HSK1 exam question bank (listening, reading, true/false). |
| `visualDict.ts` | 169 | 63 entries | Emoji-categorized visual dictionary (8 categories). |
| `pinyin.ts` | 711 | 57 entries | Pinyin data: initials (23), finals (24), tone explanations (5), tone sandhi rules. |
| `achievements.ts` | 157 | 11 items | Unlockable achievement definitions with icon, description, condition. |

---

### Library (src/lib/)
| File | Lines | Description |
|------|-------|-------------|
| `store.ts` | 330 | Zustand store: `useLearningStore`. Manages sections, vocabulary progress, quiz state, streak, score, learned words, SRS word ratings. |
| `srs.ts` | 143 | SM-2 spaced repetition algorithm: `calculateNextReview()`, `isDueForReview()`, `getWeakWords()`, `getSRSStats()`. |
| `analytics.ts` | 213 | Learning analytics: study time tracking, word mastery stats, progress calculations. |
| `helpers.ts` | 98 | Utility functions: `speak()` TTS, `splitChineseWords()`, Fisher-Yates shuffle, Levenshtein distance for pronunciation scoring. |
| `db.ts` | 12 | Database stub (Prisma placeholder, not active). |
| `utils.ts` | 6 | `cn()` helper (Tailwind class merge). |

---

### Types (src/types/)
- `index.ts` (20 lines) — Shared TypeScript interfaces: `VocabularyWord`, `GrammarRule`, `Lesson`, `Conversation`, `Achievement`, etc.

---

### Hooks (src/hooks/)
- `use-toast.ts` (193 lines) — Toast notification hook (shadcn/ui).
- `use-mobile.ts` (19 lines) — Mobile viewport detection hook.

---

### API Routes
- `src/app/api/route.ts` (4 lines) — Health check endpoint.
- `src/app/api/chat/route.ts` (90 lines) — AI chat assistant (z-ai-web-dev-sdk integration).

---

### Navigation Sections (17 total)
| # | Key | Arabic Label |
|---|-----|-------------|
| 1 | `dashboard` | الرئيسية |
| 2 | `lessons` | الدروس |
| 3 | `vocabulary` | المفردات والنطق |
| 4 | `grammar` | القواعد |
| 5 | `sentences` | الجمل |
| 6 | `stories` | القصص |
| 7 | `conversations` | المحادثات |
| 8 | `practice` | التمارين |
| 9 | `games` | الألعاب |
| 10 | `qa` | أسئلة يومية |
| 11 | `visual-dict` | القاموس البصري |
| 12 | `pinyin` | البينين |
| 13 | `hanzi` | الحروف |
| 14 | `exam` | محاكي الامتحان |
| 15 | `achievements` | الإنجازات |
| 16 | `chat` | المساعد الذكي |
| 17 | `roadmap` | خريطة الطريق |

---

### Backup Directories (not active)
- `src_BACKUP_20260523_193219/` — Pre-theme-change backup (used `next-themes`)
- `src_backup_192546/` — Earlier backup
- `src_EMERGENCY_025809/` — Emergency rollback backup

---

### Key Stats
- **Total active source lines**: ~12,800 (page.tsx + components + data + lib)
- **Vocabulary**: 411 HSK1 words with full SRS data
- **Lessons**: 15 lessons, 22-40 words each
- **Grammar**: 27 rules with practice questions
- **Stories**: 7 reading stories with comprehension questions
- **Conversations**: 16 everyday dialogue scenes
- **Achievements**: 11 unlockable milestones
- **Theme**: Dark/Light/System (localStorage, no next-themes dependency)
- **Responsive**: Mobile-first (flex-col mobile, flex-row desktop), touch targets 44px
