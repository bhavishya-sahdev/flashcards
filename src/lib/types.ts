// Updated Flashcard interface with spaced repetition fields
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  codeTemplate: string;

  // Spaced Repetition Fields
  easeFactor: number; // SM-2 algorithm ease factor (2.5 is default)
  interval: number; // Days until next review
  repetitions: number; // Number of successful repetitions
  nextReviewDate: Date; // When card should be reviewed next
  lastReviewDate?: Date; // When card was last reviewed
  isLearning: boolean; // Whether card is in learning phase

  // Performance Tracking
  totalReviews: number; // Total number of times reviewed
  correctReviews: number; // Number of correct reviews
  streakCount: number; // Current correct streak
  maxStreak: number; // Best streak achieved
  averageResponseTime?: number; // Average time to answer (in seconds)

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardFolder {
  id: string;
  name: string;
  description: string;
  flashcards: Flashcard[];
  createdAt: Date;
  updatedAt?: Date;
}

// Quality rating for spaced repetition (SM-2 algorithm)
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

// Review session data
export interface FlashcardReview {
  id: string;
  flashcardId: string;
  ownerId: string;
  quality: ReviewQuality; // 0-5 rating
  responseTime?: number; // Time taken to answer (in seconds)
  wasCorrect: boolean;
  reviewType: "scheduled" | "extra_practice" | "cramming";
  sessionId?: string;

  // Spaced Repetition State at Review Time (for analytics)
  easeFactorBefore: number;
  intervalBefore: number;
  easeFactorAfter: number;
  intervalAfter: number;

  createdAt: Date;
}

// Study session tracking
export interface StudySession {
  id: string;
  ownerId: string;
  folderId?: string;
  cardsReviewed: number;
  cardsCorrect: number;
  totalTimeSpent: number; // in seconds
  sessionType: "review" | "learn" | "cram";
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
}

// For spaced repetition calculations
export interface SpacedRepetitionResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  isLearning: boolean;
}

// Cards grouped by review status
export interface ReviewCards {
  dueNow: Flashcard[]; // Cards that should be reviewed now
  learning: Flashcard[]; // Cards in learning phase
  upcoming: Flashcard[]; // Cards due soon (next 24 hours)
  future: Flashcard[]; // Cards due later
}

// Study statistics
export interface StudyStats {
  totalCards: number;
  cardsDue: number;
  cardsLearning: number;
  cardsGraduated: number; // Cards that have "graduated" from learning
  averageEaseFactor: number;
  totalReviews: number;
  accuracy: number; // percentage correct
  streakCurrent: number;
  streakBest: number;
  averageResponseTime?: number; // in seconds
  timeSpentToday: number; // in minutes
  timeSpentTotal: number; // in minutes
}

// Roadmap types
export interface RoadmapTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  totalEstimatedTime?: number; // in hours
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  topics: RoadmapTopic[];
}

export interface RoadmapTopic {
  id: string;
  templateId: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTimeHours: number;
  orderIndex: number;
  subtopics: string[];
  practiceProblemsCount: number;
  keyLearningPoints: string[];
  prerequisiteTopicIds: string[];
  linkedFolderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoadmap {
  id: string;
  userId: string;
  templateId: string;
  isCustomized: boolean;
  customName?: string;
  customDescription?: string;
  isActive: boolean;
  startedAt?: Date;
  targetCompletionDate?: Date;
  totalTimeSpent: number; // in minutes
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  template: RoadmapTemplate;
  topicProgress: UserTopicProgress[];
}

export interface UserTopicProgress {
  id: string;
  userId: string;
  userRoadmapId: string;
  topicId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progressPercentage: number; // 0-100
  timeSpent: number; // in minutes
  startedAt?: Date;
  completedAt?: Date;
  lastStudiedAt?: Date;
  userNotes?: string;
  isBookmarked: boolean;
  practiceProblemsCompleted: number;
  averageScore?: number;
  createdAt: Date;
  updatedAt: Date;
  topic: RoadmapTopic;
}

export interface RoadmapStudySession {
  id: string;
  userId: string;
  userRoadmapId: string;
  topicId: string;
  sessionType: 'study' | 'practice' | 'review';
  durationMinutes: number;
  problemsAttempted: number;
  problemsCompleted: number;
  averageScore?: number;
  notes?: string;
  mood?: string;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
}

export interface RoadmapProgressSummary {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  availableTopics: number;
  lockedTopics: number;
  totalTimeSpent: number; // in minutes
  averageScore?: number;
  currentStreak: number; // consecutive days studied
  lastStudyDate?: Date;
}
