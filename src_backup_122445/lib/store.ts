import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type SRSCard,
  type Quality,
  createSRSCard,
  calculateNextReview,
  isDueForReview,
  getWeakWords as getWeakWordsUtil,
} from './srs';

export type Section =
  | 'dashboard'
  | 'vocabulary'
  | 'pinyin'
  | 'hanzi'
  | 'lessons'
  | 'grammar'
  | 'conversations'
  | 'practice'
  | 'games'
  | 'stories'
  | 'exam'
  | 'chat'
  | 'roadmap'
  | 'sentences'
  | 'visual-dict'
  | 'achievements'
  | 'pronunciation';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dailyStreak: number;
  lastStudyDate: string | null;
  totalXP: number;
  dailyGoal: number;
}

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

interface SRSState {
  srsCards: Record<number, SRSCard>;
  rateWord: (wordId: number, quality: Quality) => void;
  getSRSStats: () => { total: number; new: number; learning: number; review: number; mastered: number };
  getDueCardIds: () => number[];
  getWeakWordIds: (limit?: number) => number[];
}

interface LearningStore extends SRSState {
  // Auth
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  isLoggedIn: boolean;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Navigation
  currentSection: Section;
  setCurrentSection: (section: Section) => void;

  // Progress
  learnedWords: number[];
  toggleLearned: (id: number) => void;
  isLearned: (id: number) => boolean;
  bookmarkedWords: number[];
  toggleBookmark: (id: number) => void;
  isBookmarked: (id: number) => boolean;

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
  matchMemoryPair: (id1: number, id2: number) => void;
  incrementMemoryMoves: () => void;
  resetMemoryGame: () => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatMessages: () => void;

  // Streak
  dailyStreak: number;
  lastStudyDate: string;
  incrementStreak: () => void;

  // Daily Activity
  dailyActivity: Record<string, { wordsLearned: number; questionsAnswered: number }>;
  trackWordLearned: () => void;
  trackQuestionAnswered: () => void;
}

export type { QuizQuestion, MemoryCard, ChatMessage };

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      isLoggedIn: false,

      // Sidebar
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // Navigation
      currentSection: 'dashboard',
      setCurrentSection: (section) => set({ currentSection: section, sidebarOpen: false }),

      // Progress
      learnedWords: [],
      toggleLearned: (id) => {
        set((state) => ({
          learnedWords: state.learnedWords.includes(id)
            ? state.learnedWords.filter((w) => w !== id)
            : [...state.learnedWords, id],
        }));
        get().trackWordLearned();
        get().incrementStreak();
      },
      isLearned: (id) => get().learnedWords.includes(id),

      bookmarkedWords: [],
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarkedWords: state.bookmarkedWords.includes(id)
            ? state.bookmarkedWords.filter((w) => w !== id)
            : [...state.bookmarkedWords, id],
        })),
      isBookmarked: (id) => get().bookmarkedWords.includes(id),

      // Flashcard
      flashcardIndex: 0,
      setFlashcardIndex: (index) => set({ flashcardIndex: index, isFlipped: false }),
      isFlipped: false,
      flip: () => set((state) => ({ isFlipped: !state.isFlipped })),

      // Quiz
      quizScore: 0,
      quizTotal: 0,
      currentQuizQuestion: 0,
      quizQuestions: [],
      startQuiz: (questions) =>
        set({ quizQuestions: questions, quizScore: 0, quizTotal: questions.length, currentQuizQuestion: 0 }),
      answerQuiz: (correct) =>
        set((state) => ({ quizScore: correct ? state.quizScore + 1 : state.quizScore })),
      resetQuiz: () =>
        set({ quizScore: 0, quizTotal: 0, currentQuizQuestion: 0, quizQuestions: [] }),
      nextQuizQuestion: () =>
        set((state) => ({
          currentQuizQuestion: Math.min(state.currentQuizQuestion + 1, state.quizQuestions.length - 1),
        })),

      // Memory Game
      memoryCards: [],
      memoryMoves: 0,
      memoryPairs: 0,
      memoryLevel: 1,
      setMemoryLevel: (level) => set({ memoryLevel: level }),
      startMemoryGame: (cards) => set({ memoryCards: cards, memoryMoves: 0, memoryPairs: 0 }),
      matchMemoryPair: (id1, id2) =>
        set((state) => ({
          memoryCards: state.memoryCards.map((card) =>
            card.id === id1 || card.id === id2 ? { ...card, matched: true } : card,
          ),
          memoryPairs: state.memoryPairs + 1,
        })),
      incrementMemoryMoves: () => set((state) => ({ memoryMoves: state.memoryMoves + 1 })),
      resetMemoryGame: () => set({ memoryCards: [], memoryMoves: 0, memoryPairs: 0 }),

      // Chat
      chatMessages: [],
      addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
      clearChatMessages: () => set({ chatMessages: [] }),

      // Streak
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

      // Daily Activity
      dailyActivity: {},
      trackWordLearned: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          dailyActivity: {
            ...state.dailyActivity,
            [today]: {
              wordsLearned: (state.dailyActivity[today]?.wordsLearned || 0) + 1,
              questionsAnswered: state.dailyActivity[today]?.questionsAnswered || 0,
            },
          },
        }));
      },
      trackQuestionAnswered: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          dailyActivity: {
            ...state.dailyActivity,
            [today]: {
              wordsLearned: state.dailyActivity[today]?.wordsLearned || 0,
              questionsAnswered: (state.dailyActivity[today]?.questionsAnswered || 0) + 1,
            },
          },
        }));
      },

      // SRS
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
          learning: cards.filter((c) => c.reviewCount > 0 && c.repetitions < 3).length,
          review: cards.filter((c) => c.repetitions >= 1 && isDueForReview(c)).length,
          mastered: cards.filter((c) => c.repetitions >= 3 && c.easeFactor >= 2.0).length,
        };
      },
      getDueCardIds: () => {
        const { srsCards } = get();
        return Object.values(srsCards).filter(isDueForReview).map((c) => c.wordId);
      },
      getWeakWordIds: (limit = 20) => {
        const { srsCards } = get();
        return getWeakWordsUtil(Object.values(srsCards), limit);
      },
    }),
    {
      name: 'mudann-hsk-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        learnedWords: state.learnedWords,
        bookmarkedWords: state.bookmarkedWords,
        dailyStreak: state.dailyStreak,
        lastStudyDate: state.lastStudyDate,
        srsCards: state.srsCards,
        dailyActivity: state.dailyActivity,
      }),
    },
  ),
);
