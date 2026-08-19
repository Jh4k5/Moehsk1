import { create } from 'zustand';
import { unitPassed, type UnitProgress } from '@/lib/curriculum/progress';
import { parseUnitKey, unitKey } from '@/lib/curriculum/types';
import { persist } from 'zustand/middleware';
import {
  type SRSCard,
  type Quality,
  createSRSCard,
  calculateNextReview,
  isDueForReview,
  getWeakWords as getWeakWordsUtil,
} from './srs';

// ── Section type ──────────────────────────────────────────────────────────
// THE one declaration. It used to exist three times — here, in `app/page.tsx`
// (18 members, missing 'pronunciation', papered over with `as Section`) and in
// `types/index.ts` (19 members, but 'handwriting' instead of 'settings').
// `SECTIONS` is the runtime list; `Section` is derived from it, so a section
// can never be added to one and forgotten in the other.
export const SECTIONS = [
  'dashboard',
  'vocabulary',
  'pinyin',
  'hanzi',
  'pronunciation',
  'lessons',
  'grammar',
  'conversations',
  'practice',
  'games',
  'stories',
  'exam',
  'chat',
  'roadmap',
  'sentences',
  'qa',
  'visual-dict',
  'achievements',
  'settings',
] as const;

type Section = (typeof SECTIONS)[number];

export function isSection(value: string | undefined | null): value is Section {
  return (SECTIONS as readonly string[]).includes(value as string);
}

// ── Profile & Settings ─────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  avatarEmoji: string;
  dailyGoal: number;
  createdAt: string;
}

export interface AppSettings {
  hanziFontScale: number; // 1.0 - 1.6
  ttsRate: number; // 0.5 - 1.2
  ttsVoiceURI: string | null;
}

// ── Existing interfaces ───────────────────────────────────────────────────
interface QuizQuestion {
  wordId: number;
  question: string;
  questionPinyin?: string;
  options: string[];
  correctIndex: number;
}

interface MemoryCard {
  id: number;
  zh: string;
  ar: string;
  pinyin: string;
  matched: boolean;
  type: 'hanzi' | 'meaning';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Activity / Progress tracking types ─────────────────────────────────
type DailyActivityEntry = {
  wordsLearned: number;
  questionsAnswered: number;
};

type QuizHistoryEntry = {
  date: string;
  score: number;
  total: number;
  difficulty: string;
  type: string;
};

// ── SRS State ─────────────────────────────────────────────────────────────
interface SRSState {
  srsCards: Record<number, SRSCard>;
  rateWord: (wordId: number, quality: Quality) => void;
  getSRSStats: () => { total: number; new: number; learning: number; review: number; mastered: number };
  getDueCardIds: () => number[];
  getWeakWordIds: (limit?: number) => number[];
  getCardDifficulty: (wordId: number) => string;
}

// ── Game State ────────────────────────────────────────────────────────────
interface GameState {
  gameTimer: number;
  setGameTimer: (t: number) => void;
  gameDifficulty: 'easy' | 'medium' | 'hard';
  setGameDifficulty: (d: 'easy' | 'medium' | 'hard') => void;
  gameScore: number;
  setGameScore: (s: number) => void;
  gameStreak: number;
  setGameStreak: (s: number) => void;
}

// ── Exam State ────────────────────────────────────────────────────────────
interface ExamState {
  examStarted: boolean;
  examType: 'listening' | 'reading' | 'full' | null;
  examAnswers: Record<number, number>;
  examScore: number;
  examTimeRemaining: number;
  setExamState: (state: Partial<ExamState>) => void;
  resetExam: () => void;
}

// ── Combined Store ────────────────────────────────────────────────────────
export interface LearningStore
  extends SRSState,
    GameState,
    ExamState {
  // Navigation
  currentSection: Section;
  setCurrentSection: (section: Section) => void;

  // Progress
  learnedWords: number[];
  toggleLearned: (id: number) => void;
  isLearned: (id: number) => boolean;

  // Flashcard
  flashcardIndex: number;
  setFlashcardIndex: (index: number) => void;
  isFlipped: boolean;
  flip: () => void;

  // Quiz
  quizScore: number;
  quizTotal: number;
  currentQuizQuestion: number;
  quizQuestions: QuizQuestion[];
  startQuiz: (questions: QuizQuestion[]) => void;
  answerQuiz: (correct: boolean) => void;
  resetQuiz: () => void;
  nextQuizQuestion: () => void;

  // Memory Game
  memoryCards: MemoryCard[];
  memoryMoves: number;
  memoryPairs: number;
  memoryLevel: number;
  setMemoryLevel: (level: number) => void;
  startMemoryGame: (cards: MemoryCard[]) => void;
  flipMemoryCard: (id: number) => void;
  matchMemoryPair: (id1: number, id2: number) => void;
  incrementMemoryMoves: () => void;
  resetMemoryGame: () => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatMessages: () => void;

  // Unit progress — the sequential path's record of what is finished.
  // `learnedWords` is NOT this: it counted flashcard button presses, went up
  // whether or not the word could be used, and unlocked nothing.
  unitProgress: UnitProgress;
  completeUnit: (key: string, correct: number, scored: number) => void;
  /** The beginner primer — «unit zero». Free, and before lesson one. */
  primerDone: boolean;
  completePrimer: () => void;
  isUnitDone: (key: string) => boolean;
  resetUnit: (key: string) => void;

  // Streak
  dailyStreak: number;
  lastStudyDate: string;
  incrementStreak: () => void;

  // Daily Activity
  dailyActivity: Record<string, DailyActivityEntry>;
  recordDailyActivity: (date: string, wordsLearned: number, questionsAnswered: number, storiesRead: number) => void;

  // Quiz History
  quizHistory: QuizHistoryEntry[];
  addQuizHistory: (entry: QuizHistoryEntry) => void;

  // High Scores
  highScores: Record<string, number>;
  updateHighScore: (gameType: string, score: number) => void;

  // Stories
  completedStories: number[];
  isStoryCompleted: (storyIndex: number) => boolean;
  toggleStoryCompleted: (storyIndex: number) => void;

  // Bookmarks
  bookmarkedWords: number[];
  isBookmarked: (wordId: number) => boolean;
  toggleBookmark: (wordId: number) => void;

  // Profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Hydration flag (avoids onboarding flash before localStorage loads)
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // Active HSK level (1, 2 or 3)
  currentLevel: 1 | 2 | 3;
  setLevel: (level: 1 | 2 | 3) => void;

  // UI language — a runtime mirror of the `[locale]` route segment, not a
  // stored preference. Set by `LocaleSync`; read by the non-hook `ts()` helper.
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
}

export type { Section, QuizQuestion, MemoryCard, ChatMessage };

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      // ── Navigation ────────────────────────────────────────────────────
      currentSection: 'dashboard',
      setCurrentSection: (section) => set({ currentSection: section }),

      // ── Progress ──────────────────────────────────────────────────────
      learnedWords: [],
      toggleLearned: (id) =>
        set((state) => {
          const already = state.learnedWords.includes(id);
          const learnedWords = already
            ? state.learnedWords.filter((w) => w !== id)
            : [...state.learnedWords, id];

          // THE daily-goal counter, and the only place it moves.
          //
          // The goal ring on the home screen was stuck at 0% for everyone:
          // `recordDailyActivity` had exactly one caller and it passed
          // `wordsLearned = 0`, so nothing in the entire codebase ever
          // incremented the number the ring is drawn from. A learner could
          // finish six units and watch a ring that never filled.
          //
          // Counting here rather than in `completeUnit` covers every route by
          // which a word is actually learned — the mandatory path and the free
          // flashcards alike — and counts each word once, because this is the
          // one function that decides a word is learned. Un-learning a word
          // does not decrement: the day's count is what happened that day, and
          // reversing it later does not un-happen it.
          const today = new Date().toDateString();
          const day = state.dailyActivity[today] || { wordsLearned: 0, questionsAnswered: 0 };
          const dailyActivity = already
            ? state.dailyActivity
            : { ...state.dailyActivity, [today]: { ...day, wordsLearned: day.wordsLearned + 1 } };

          return { learnedWords, dailyActivity };
        }),
      isLearned: (id) => get().learnedWords.includes(id),

      // ── Flashcard ─────────────────────────────────────────────────────
      flashcardIndex: 0,
      setFlashcardIndex: (index) => set({ flashcardIndex: index, isFlipped: false }),
      isFlipped: false,
      flip: () => set((state) => ({ isFlipped: !state.isFlipped })),

      // ── Quiz ──────────────────────────────────────────────────────────
      quizScore: 0,
      quizTotal: 0,
      currentQuizQuestion: 0,
      quizQuestions: [],
      startQuiz: (questions) =>
        set({
          quizQuestions: questions,
          quizScore: 0,
          quizTotal: questions.length,
          currentQuizQuestion: 0,
        }),
      answerQuiz: (correct) =>
        set((state) => ({
          quizScore: correct ? state.quizScore + 1 : state.quizScore,
        })),
      resetQuiz: () =>
        set({
          quizScore: 0,
          quizTotal: 0,
          currentQuizQuestion: 0,
          quizQuestions: [],
        }),
      nextQuizQuestion: () =>
        set((state) => ({
          currentQuizQuestion: Math.min(
            state.currentQuizQuestion + 1,
            state.quizQuestions.length - 1,
          ),
        })),

      // ── Memory Game ───────────────────────────────────────────────────
      memoryCards: [],
      memoryMoves: 0,
      memoryPairs: 0,
      memoryLevel: 1,
      setMemoryLevel: (level) => set({ memoryLevel: level }),
      startMemoryGame: (cards) =>
        set({ memoryCards: cards, memoryMoves: 0, memoryPairs: 0 }),
      flipMemoryCard: (id) =>
        set((state) => ({
          memoryCards: state.memoryCards.map((card) =>
            card.id === id ? { ...card } : card,
          ),
        })),
      matchMemoryPair: (id1, id2) =>
        set((state) => ({
          memoryCards: state.memoryCards.map((card) =>
            card.id === id1 || card.id === id2
              ? { ...card, matched: true }
              : card,
          ),
          memoryPairs: state.memoryPairs + 1,
        })),
      incrementMemoryMoves: () =>
        set((state) => ({ memoryMoves: state.memoryMoves + 1 })),
      resetMemoryGame: () =>
        set({ memoryCards: [], memoryMoves: 0, memoryPairs: 0 }),

      // ── Chat ──────────────────────────────────────────────────────────
      chatMessages: [],
      addChatMessage: (msg) =>
        set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
      clearChatMessages: () => set({ chatMessages: [] }),

      // ── Unit progress ─────────────────────────────────────────────────
      unitProgress: {},

      primerDone: false,
      completePrimer: () => {
        if (get().primerDone) return;
        set({ primerDone: true });
        get().incrementStreak();
      },

      completeUnit: (key, correct, scored) => {
        // The key comes from a URL, so it is validated before it is recorded.
        // An unparseable one would otherwise sit in the progress map forever,
        // unlocking nothing and matching no unit.
        const ref = parseUnitKey(key);
        if (!ref) return;
        if (!unitPassed(correct, scored)) return;
        const validKey = unitKey(ref);
        set((state) => ({
          unitProgress: {
            ...state.unitProgress,
            [validKey]: { key: validKey, correct, scored, completedAt: new Date().toISOString() },
          },
        }));
        // The streak advances HERE and nowhere else. It used to advance on any
        // navigation click, so opening the app four times looked like four days
        // of study — a number that flattered the learner and measured nothing.
        get().incrementStreak();
        // Questions only. The words are counted by `toggleLearned`, which the
        // session calls for each of the unit's words — counting them here too
        // would double every unit.
        const today = new Date().toDateString();
        get().recordDailyActivity(today, 0, scored, 0);
      },

      isUnitDone: (key) => Boolean(get().unitProgress[key]),

      resetUnit: (key) =>
        set((state) => {
          const next = { ...state.unitProgress };
          delete next[key];
          return { unitProgress: next };
        }),

      // ── Streak ────────────────────────────────────────────────────────
      dailyStreak: 0,
      lastStudyDate: '',
      incrementStreak: () => {
        const today = new Date().toDateString();
        const { lastStudyDate, dailyStreak } = get();
        if (lastStudyDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastStudyDate === yesterday.toDateString()) {
            set({ dailyStreak: dailyStreak + 1, lastStudyDate: today });
          } else {
            set({ dailyStreak: 1, lastStudyDate: today });
          }
        }
      },

      // ── SRS (Spaced Repetition System) ────────────────────────────────
      srsCards: {},

      rateWord: (wordId: number, quality: Quality) => {
        const { srsCards } = get();
        const existing = srsCards[wordId] || createSRSCard(wordId);
        const updated = calculateNextReview(existing, quality);
        set({ srsCards: { ...srsCards, [wordId]: updated } });
      },

      getSRSStats: () => {
        const { srsCards } = get();
        const cards = Object.values(srsCards);
        return {
          total: cards.length,
          new: cards.filter((c) => c.reviewCount === 0).length,
          learning: cards.filter(
            (c) => c.reviewCount > 0 && c.repetitions < 3,
          ).length,
          review: cards.filter(
            (c) => c.repetitions >= 1 && isDueForReview(c),
          ).length,
          mastered: cards.filter(
            (c) => c.repetitions >= 3 && c.easeFactor >= 2.0,
          ).length,
        };
      },

      getDueCardIds: () => {
        const { srsCards } = get();
        return Object.values(srsCards)
          .filter(isDueForReview)
          .map((c) => c.wordId);
      },

      getWeakWordIds: (limit = 20) => {
        const { srsCards } = get();
        return getWeakWordsUtil(Object.values(srsCards), limit);
      },

      getCardDifficulty: (wordId: number) => {
        const { srsCards } = get();
        const card = srsCards[wordId];
        if (!card) return 'new';
        if (card.easeFactor >= 2.0 && card.repetitions >= 3) return 'easy';
        if (card.easeFactor >= 1.5) return 'medium';
        return 'hard';
      },

      // ── Game ──────────────────────────────────────────────────────────
      gameTimer: 0,
      setGameTimer: (t: number) => set({ gameTimer: t }),
      gameDifficulty: 'medium' as const,
      setGameDifficulty: (d: 'easy' | 'medium' | 'hard') =>
        set({ gameDifficulty: d }),
      gameScore: 0,
      setGameScore: (s: number) => set({ gameScore: s }),
      gameStreak: 0,
      setGameStreak: (s: number) => set({ gameStreak: s }),

      // ── Daily Activity ───────────────────────────────────────────────
      dailyActivity: {},
      recordDailyActivity: (date, wordsLearned, questionsAnswered, storiesRead) =>
        set((state) => {
          const existing = state.dailyActivity[date] || { wordsLearned: 0, questionsAnswered: 0 };
          return {
            dailyActivity: {
              ...state.dailyActivity,
              [date]: {
                wordsLearned: existing.wordsLearned + wordsLearned,
                questionsAnswered: existing.questionsAnswered + questionsAnswered,
              },
            },
          };
        }),

      // ── Quiz History ───────────────────────────────────────────────────
      quizHistory: [],
      addQuizHistory: (entry) =>
        set((state) => ({ quizHistory: [...state.quizHistory, entry] })),

      // ── High Scores ────────────────────────────────────────────────────
      highScores: {},
      updateHighScore: (gameType, score) =>
        set((state) => {
          const current = state.highScores[gameType] || 0;
          if (score > current) {
            return { highScores: { ...state.highScores, [gameType]: score } };
          }
          return {};
        }),

      // ── Stories ────────────────────────────────────────────────────────
      completedStories: [],
      isStoryCompleted: (storyIndex) => get().completedStories.includes(storyIndex),
      toggleStoryCompleted: (storyIndex) =>
        set((state) => ({
          completedStories: state.completedStories.includes(storyIndex)
            ? state.completedStories.filter((s) => s !== storyIndex)
            : [...state.completedStories, storyIndex],
        })),

      // ── Bookmarks ──────────────────────────────────────────────────────
      bookmarkedWords: [],
      isBookmarked: (wordId) => get().bookmarkedWords.includes(wordId),
      toggleBookmark: (wordId) =>
        set((state) => ({
          bookmarkedWords: state.bookmarkedWords.includes(wordId)
            ? state.bookmarkedWords.filter((w) => w !== wordId)
            : [...state.bookmarkedWords, wordId],
        })),

      // ── Profile ────────────────────────────────────────────────────────
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),

      // ── Settings ───────────────────────────────────────────────────────
      settings: { hanziFontScale: 1, ttsRate: 0.8, ttsVoiceURI: null },
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      // ── Hydration ──────────────────────────────────────────────────────
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      // ── Active HSK level ───────────────────────────────────────────────
      currentLevel: 1,
      setLevel: (level) => set({ currentLevel: level }),

      // ── UI language ────────────────────────────────────────────────────
      lang: 'ar',
      setLang: (lang) => set({ lang }),

      // ── Exam ──────────────────────────────────────────────────────────
      examStarted: false,
      examType: null,
      examAnswers: {},
      examScore: 0,
      examTimeRemaining: 0,
      setExamState: (partial) => set(partial as Partial<LearningStore>),
      resetExam: () =>
        set({
          examStarted: false,
          examType: null,
          examAnswers: {},
          examScore: 0,
          examTimeRemaining: 0,
        }),
    }),
    {
      name: 'hsk-learning-storage',
      version: 3,
      // v2 → v3 adds `unitProgress`. The old `migrate` was a cast that moved
      // nothing, so a store persisted before this key existed came back without
      // it and every read of `unitProgress[...]` threw. Missing keys are filled
      // from the defaults instead of assumed present.
      migrate: (persisted: unknown) => {
        const old = (persisted ?? {}) as Partial<LearningStore>;
        return {
          ...old,
          unitProgress: old.unitProgress ?? {},
          primerDone: old.primerDone ?? false,
        } as LearningStore;
      },
      partialize: (state) => ({
        learnedWords: state.learnedWords,
        unitProgress: state.unitProgress,
        primerDone: state.primerDone,
        dailyStreak: state.dailyStreak,
        lastStudyDate: state.lastStudyDate,
        srsCards: state.srsCards,
        dailyActivity: state.dailyActivity,
        quizHistory: state.quizHistory,
        highScores: state.highScores,
        completedStories: state.completedStories,
        bookmarkedWords: state.bookmarkedWords,
        profile: state.profile,
        settings: state.settings,
        currentLevel: state.currentLevel,
        // `lang` is deliberately absent: the URL segment owns the language.
        // Persisting it made a stored 'en' fight the served `/ar` page.
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
