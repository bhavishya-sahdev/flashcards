// lib/spaced-repetition.ts

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SpacedRepetitionConfig {
  // Learning phase steps (in minutes)
  learningSteps: number[];

  // Graduation settings
  graduatingInterval: number; // days
  easyInterval: number; // days

  // Interval multipliers
  againMultiplier: number;
  hardMultiplier: number;
  easyMultiplier: number;

  // Ease factor bounds
  minEaseFactor: number;
  maxEaseFactor: number;

  // Ease factor changes
  easeFactorChange: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

// Default configuration (similar to modern Anki)
export const DEFAULT_CONFIG: SpacedRepetitionConfig = {
  learningSteps: [1, 10], // 1 minute, 10 minutes
  graduatingInterval: 1, // 1 day
  easyInterval: 4, // 4 days
  againMultiplier: 0, // restart
  hardMultiplier: 1.2,
  easyMultiplier: 1.3,
  minEaseFactor: 1.3,
  maxEaseFactor: 2.5,
  easeFactorChange: {
    again: -0.2,
    hard: -0.15,
    good: 0,
    easy: 0.15,
  },
};

export interface FlashcardState {
  easeFactor: number;
  interval: number;
  repetitions: number;
  isLearning: boolean;
  learningStep: number; // which learning step we're on
}

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  isLearning: boolean;
  learningStep: number;
  graduatedFromLearning: boolean;
}

/**
 * Calculate the next review parameters based on user performance
 */
export function calculateNextReview(
  currentState: FlashcardState,
  quality: ReviewQuality,
  config: SpacedRepetitionConfig = DEFAULT_CONFIG
): ReviewResult {
  const now = new Date();

  // Handle learning phase
  if (currentState.isLearning) {
    return handleLearningPhase(currentState, quality, config, now);
  }

  // Handle review phase (graduated cards)
  return handleReviewPhase(currentState, quality, config, now);
}

/**
 * Handle cards in learning phase (new cards)
 */
function handleLearningPhase(
  state: FlashcardState,
  quality: ReviewQuality,
  config: SpacedRepetitionConfig,
  now: Date
): ReviewResult {
  // If quality is 0 or 1 (Again/Hard), restart learning
  if (quality <= 1) {
    return {
      easeFactor: state.easeFactor,
      interval: config.learningSteps[0], // Back to first step
      repetitions: 0,
      nextReviewDate: addMinutes(now, config.learningSteps[0]),
      isLearning: true,
      learningStep: 0,
      graduatedFromLearning: false,
    };
  }

  // Quality 2+ (Good/Easy) - advance in learning
  const nextStep = state.learningStep + 1;

  // Check if we should graduate from learning
  if (nextStep >= config.learningSteps.length) {
    // Graduate to review phase
    const graduationInterval =
      quality >= 4 ? config.easyInterval : config.graduatingInterval;

    return {
      easeFactor: state.easeFactor,
      interval: graduationInterval,
      repetitions: 1,
      nextReviewDate: addDays(now, graduationInterval),
      isLearning: false,
      learningStep: 0,
      graduatedFromLearning: true,
    };
  }

  // Continue in learning phase
  const nextStepMinutes = config.learningSteps[nextStep];

  return {
    easeFactor: state.easeFactor,
    interval: nextStepMinutes,
    repetitions: state.repetitions,
    nextReviewDate: addMinutes(now, nextStepMinutes),
    isLearning: true,
    learningStep: nextStep,
    graduatedFromLearning: false,
  };
}

/**
 * Handle cards in review phase (graduated cards)
 */
function handleReviewPhase(
  state: FlashcardState,
  quality: ReviewQuality,
  config: SpacedRepetitionConfig,
  now: Date
): ReviewResult {
  let newEaseFactor = state.easeFactor;
  let newInterval: number;
  let newRepetitions = state.repetitions;

  // Update ease factor based on quality
  switch (quality) {
    case 0:
    case 1: // Again
      newEaseFactor += config.easeFactorChange.again;
      newInterval = config.learningSteps[0]; // Back to learning
      newRepetitions = 0;
      break;

    case 2: // Hard
      newEaseFactor += config.easeFactorChange.hard;
      newInterval = Math.max(
        1,
        Math.round(state.interval * config.hardMultiplier)
      );
      newRepetitions += 1;
      break;

    case 3: // Good
      newEaseFactor += config.easeFactorChange.good;
      newInterval = Math.round(state.interval * newEaseFactor);
      newRepetitions += 1;
      break;

    case 4:
    case 5: // Easy
      newEaseFactor += config.easeFactorChange.easy;
      newInterval = Math.round(
        state.interval * newEaseFactor * config.easyMultiplier
      );
      newRepetitions += 1;
      break;
  }

  // Clamp ease factor to bounds
  newEaseFactor = Math.max(
    config.minEaseFactor,
    Math.min(config.maxEaseFactor, newEaseFactor)
  );

  // Ensure minimum interval of 1 day for review cards
  if (quality > 1) {
    newInterval = Math.max(1, newInterval);
  }

  // If quality <= 1, go back to learning
  const isBackToLearning = quality <= 1;
  const nextReviewDate = isBackToLearning
    ? addMinutes(now, newInterval)
    : addDays(now, newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
    isLearning: isBackToLearning,
    learningStep: isBackToLearning ? 1 : 0,
    graduatedFromLearning: false,
  };
}

/**
 * Get cards that are due for review
 */
export function getDueCards(cards: any[], now: Date = new Date()) {
  return cards.filter((card) => {
    const dueDate = new Date(card.nextReviewDate);
    return dueDate <= now;
  });
}

/**
 * Get cards grouped by review status
 */
export function categorizeCards(cards: any[], now: Date = new Date()) {
  const dueNow: any[] = [];
  const learning: any[] = [];
  const upcoming: any[] = [];
  const future: any[] = [];

  const tomorrow = addDays(now, 1);

  cards.forEach((card) => {
    const dueDate = new Date(card.nextReviewDate);

    if (dueDate <= now) {
      if (card.isLearning) {
        learning.push(card);
      } else {
        dueNow.push(card);
      }
    } else if (dueDate <= tomorrow) {
      upcoming.push(card);
    } else {
      future.push(card);
    }
  });

  return { dueNow, learning, upcoming, future };
}

/**
 * Initialize a new flashcard with default spaced repetition values
 */
export function initializeNewCard(): Partial<FlashcardState> {
  return {
    easeFactor: 2.5,
    interval: 1, // Will be set to first learning step when first reviewed
    repetitions: 0,
    isLearning: true,
    learningStep: 0,
  };
}

// Utility functions
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Calculate study statistics from cards
 */
export function calculateStudyStats(cards: any[], reviews: any[]) {
  const totalCards = cards.length;
  const now = new Date();

  const cardsDue = getDueCards(cards, now).length;
  const cardsLearning = cards.filter((card) => card.isLearning).length;
  const cardsGraduated = cards.filter((card) => !card.isLearning).length;

  const totalReviews = reviews.length;
  const correctReviews = reviews.filter((review) => review.wasCorrect).length;
  const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

  const averageEaseFactor =
    cards.length > 0
      ? cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length
      : 2.5;

  // Calculate streaks
  const streakCurrent = cards.reduce(
    (max, card) => Math.max(max, card.streakCount || 0),
    0
  );
  const streakBest = cards.reduce(
    (max, card) => Math.max(max, card.maxStreak || 0),
    0
  );

  // Calculate time spent today (reviews from today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayReviews = reviews.filter(
    (review) => new Date(review.createdAt) >= today
  );
  const timeSpentToday =
    todayReviews.reduce((sum, review) => sum + (review.responseTime || 0), 0) /
    60; // minutes

  const timeSpentTotal =
    reviews.reduce((sum, review) => sum + (review.responseTime || 0), 0) / 60; // minutes

  return {
    totalCards,
    cardsDue,
    cardsLearning,
    cardsGraduated,
    averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
    totalReviews,
    accuracy: Math.round(accuracy),
    streakCurrent,
    streakBest,
    timeSpentToday: Math.round(timeSpentToday),
    timeSpentTotal: Math.round(timeSpentTotal),
  };
}
