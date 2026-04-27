import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Section = 'dashboard' | 'vocabulary' | 'grammar' | 'practice' | 'games' | 'stories' | 'roadmap' | 'sentences' | 'chat';

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

interface LearningStore {
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
  
  // Streak
  dailyStreak: number;
  lastStudyDate: string;
  incrementStreak: () => void;
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      // Navigation
      currentSection: 'dashboard',
      setCurrentSection: (section) => set({ currentSection: section }),
      
      // Progress
      learnedWords: [],
      toggleLearned: (id) => set((state) => ({
        learnedWords: state.learnedWords.includes(id)
          ? state.learnedWords.filter((w) => w !== id)
          : [...state.learnedWords, id],
      })),
      isLearned: (id) => get().learnedWords.includes(id),
      
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
      startQuiz: (questions) => set({
        quizQuestions: questions,
        quizScore: 0,
        quizTotal: questions.length,
        currentQuizQuestion: 0,
      }),
      answerQuiz: (correct) => set((state) => ({
        quizScore: correct ? state.quizScore + 1 : state.quizScore,
      })),
      resetQuiz: () => set({
        quizScore: 0,
        quizTotal: 0,
        currentQuizQuestion: 0,
        quizQuestions: [],
      }),
      nextQuizQuestion: () => set((state) => ({
        currentQuizQuestion: Math.min(state.currentQuizQuestion + 1, state.quizQuestions.length - 1),
      })),
      
      // Memory Game
      memoryCards: [],
      memoryMoves: 0,
      memoryPairs: 0,
      memoryLevel: 1,
      setMemoryLevel: (level) => set({ memoryLevel: level }),
      startMemoryGame: (cards) => set({
        memoryCards: cards,
        memoryMoves: 0,
        memoryPairs: 0,
      }),
      flipMemoryCard: (id) => set((state) => ({
        memoryCards: state.memoryCards.map((card) =>
          card.id === id ? { ...card } : card
        ),
      })),
      matchMemoryPair: (id1, id2) => set((state) => ({
        memoryCards: state.memoryCards.map((card) =>
          card.id === id1 || card.id === id2
            ? { ...card, matched: true }
            : card
        ),
        memoryPairs: state.memoryPairs + 1,
      })),
      incrementMemoryMoves: () => set((state) => ({
        memoryMoves: state.memoryMoves + 1,
      })),
      resetMemoryGame: () => set({
        memoryCards: [],
        memoryMoves: 0,
        memoryPairs: 0,
      }),
      
      // Chat
      chatMessages: [],
      addChatMessage: (msg) => set((state) => ({
        chatMessages: [...state.chatMessages, msg],
      })),
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
    }),
    {
      name: 'hsk-learning-storage',
      partialize: (state) => ({
        learnedWords: state.learnedWords,
        dailyStreak: state.dailyStreak,
        lastStudyDate: state.lastStudyDate,
      }),
    }
  )
);
