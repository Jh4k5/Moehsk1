// SM-2 Spaced Repetition Algorithm (Anki-style)
// Quality ratings: 0=complete failure, 1=incorrect, 2=incorrect but easy, 3=correct with difficulty, 4=correct with some hesitation, 5=perfect

export interface SRSCard {
  wordId: number;
  easeFactor: number;       // Starts at 2.5
  interval: number;          // Days between reviews
  repetitions: number;       // Number of successful repetitions
  nextReview: string | null; // ISO date string
  lastReview: string | null;
  reviewCount: number;
  correctCount: number;
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export function createSRSCard(wordId: number): SRSCard {
  return {
    wordId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: null,
    lastReview: null,
    reviewCount: 0,
    correctCount: 0,
  };
}

export function calculateNextReview(card: SRSCard, quality: Quality): SRSCard {
  const now = new Date().toISOString();
  const updated = { ...card, lastReview: now, reviewCount: card.reviewCount + 1 };

  if (quality < 3) {
    // Reset - failed
    updated.repetitions = 0;
    updated.interval = 1;
  } else {
    // Success
    if (updated.repetitions === 0) {
      updated.interval = 1;
    } else if (updated.repetitions === 1) {
      updated.interval = 6;
    } else {
      updated.interval = Math.round(updated.interval * updated.easeFactor);
    }
    updated.repetitions++;
    updated.correctCount++;
  }

  // Adjust ease factor
  updated.easeFactor = Math.max(
    1.3,
    updated.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + updated.interval);
  updated.nextReview = nextDate.toISOString();

  return updated;
}

export function isDueForReview(card: SRSCard): boolean {
  if (!card.nextReview) return true; // Never reviewed = due now
  return new Date(card.nextReview) <= new Date();
}

export function getDueCards(cards: SRSCard[]): SRSCard[] {
  return cards.filter(isDueForReview);
}

export function getNewCards(cards: SRSCard[]): number[] {
  // Cards that have never been reviewed (nextReview === null)
  return cards.filter(c => c.nextReview === null).map(c => c.wordId);
}

export function getReviewCards(cards: SRSCard[]): SRSCard[] {
  // Cards that have been reviewed and are due
  return cards.filter(c => c.nextReview !== null && isDueForReview(c));
}

export function getDifficultyLabel(card: SRSCard): { label: string; color: string } {
  if (card.reviewCount === 0) return { label: 'جديد', color: 'bg-blue-100 text-blue-700' };
  if (card.easeFactor >= 2.0 && card.repetitions >= 3) return { label: 'سهل', color: 'bg-green-100 text-green-700' };
  if (card.easeFactor >= 1.5) return { label: 'متوسط', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'صعب', color: 'bg-red-100 text-red-700' };
}

// Get words that should be prioritized in games (weak words first)
export function getWeakWords(cards: SRSCard[], limit: number): number[] {
  return cards
    .filter(c => c.reviewCount > 0) // Only reviewed words
    .sort((a, b) => {
      // Sort by: lowest ease factor first, then lowest repetitions
      if (a.easeFactor !== b.easeFactor) return a.easeFactor - b.easeFactor;
      return a.repetitions - b.repetitions;
    })
    .slice(0, limit)
    .map(c => c.wordId);
}

// Levenshtein distance for pronunciation scoring
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function calculateSimilarity(spoken: string, expected: string): number {
  const normalized1 = spoken.toLowerCase().replace(/\s+/g, '');
  const normalized2 = expected.toLowerCase().replace(/\s+/g, '');
  if (normalized1 === normalized2) return 1;
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLen = Math.max(normalized1.length, normalized2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

export function scorePronunciation(spoken: string, expected: string): { score: number; feedback: string } {
  const similarity = calculateSimilarity(spoken, expected);

  if (similarity >= 0.9) return { score: 95, feedback: 'ممتاز! النطق دقيق جداً 🎉' };
  if (similarity >= 0.75) return { score: 80, feedback: 'جيد جداً، انتبه للنبرة 🎯' };
  if (similarity >= 0.6) return { score: 65, feedback: 'جيد، حاول مرة أخرى 👍' };
  if (similarity >= 0.4) return { score: 40, feedback: 'تحتاج مراجعة النطق 📖' };
  return { score: 20, feedback: 'استمع مرة أخرى وحاول أن تقلّد 🔁' };
}
