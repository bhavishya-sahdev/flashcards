import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  real,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

export const flashcardFolders = pgTable("flashcard_folders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").default(""),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull().default("Medium"),
  codeTemplate: text("code_template").notNull(),
  folderId: integer("folder_id")
    .notNull()
    .references(() => flashcardFolders.id, { onDelete: "cascade" }),

  // Spaced Repetition Fields
  easeFactor: real("ease_factor").notNull().default(2.5), // SM-2 algorithm ease factor (2.5 is default)
  interval: integer("interval").notNull().default(1), // Days until next review
  repetitions: integer("repetitions").notNull().default(0), // Number of successful repetitions
  nextReviewDate: timestamp("next_review_date", { mode: "string" })
    .defaultNow()
    .notNull(), // When card should be reviewed next
  lastReviewDate: timestamp("last_review_date", { mode: "string" }), // When card was last reviewed
  isLearning: boolean("is_learning").notNull().default(true), // Whether card is in learning phase
  learningStep: integer("learning_step").notNull().default(0), // Current step in learning phase (0-based index)

  // Performance Tracking
  totalReviews: integer("total_reviews").notNull().default(0), // Total number of times reviewed
  correctReviews: integer("correct_reviews").notNull().default(0), // Number of correct reviews
  streakCount: integer("streak_count").notNull().default(0), // Current correct streak
  maxStreak: integer("max_streak").notNull().default(0), // Best streak achieved
  averageResponseTime: real("average_response_time"), // Average time to answer (in seconds)

  // Metadata
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// New table to track individual review sessions for analytics
export const flashcardReviews = pgTable("flashcard_reviews", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  flashcardId: integer("flashcard_id")
    .notNull()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  ownerId: text("owner_id").notNull(), // Denormalized for easier querying

  // Review Details
  quality: integer("quality").notNull(), // 0-5 rating (SM-2 algorithm)
  responseTime: real("response_time"), // Time taken to answer (in seconds)
  wasCorrect: boolean("was_correct").notNull(),

  // Context
  reviewType: text("review_type").notNull().default("scheduled"), // "scheduled", "extra_practice", "cramming"
  sessionId: integer("session_id").references(() => studySessions.id), // Fixed to integer to match studySessions.id

  // Spaced Repetition State at Review Time (for analytics)
  easeFactorBefore: real("ease_factor_before").notNull(),
  intervalBefore: integer("interval_before").notNull(),
  easeFactorAfter: real("ease_factor_after").notNull(),
  intervalAfter: integer("interval_after").notNull(),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

// Table to track study sessions for analytics
export const studySessions = pgTable("study_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: text("owner_id").notNull(),
  folderId: integer("folder_id").references(() => flashcardFolders.id),

  // Session Statistics
  cardsReviewed: integer("cards_reviewed").notNull().default(0),
  cardsCorrect: integer("cards_correct").notNull().default(0),
  totalTimeSpent: real("total_time_spent").notNull().default(0), // in seconds
  sessionType: text("session_type").notNull().default("review"), // "review", "learn", "cram"

  startedAt: timestamp("started_at", { mode: "string" }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

// Drizzle Relations
export const flashcardFoldersRelations = relations(
  flashcardFolders,
  ({ many, one }) => ({
    owner: one(user, {
      fields: [flashcardFolders.ownerId],
      references: [user.id],
    }),
    flashcards: many(flashcards),
    studySessions: many(studySessions),
  })
);

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  folder: one(flashcardFolders, {
    fields: [flashcards.folderId],
    references: [flashcardFolders.id],
  }),
  reviews: many(flashcardReviews),
}));

export const flashcardReviewsRelations = relations(
  flashcardReviews,
  ({ one }) => ({
    flashcard: one(flashcards, {
      fields: [flashcardReviews.flashcardId],
      references: [flashcards.id],
    }),
    session: one(studySessions, {
      fields: [flashcardReviews.sessionId],
      references: [studySessions.id],
    }),
  })
);

export const studySessionsRelations = relations(
  studySessions,
  ({ one, many }) => ({
    folder: one(flashcardFolders, {
      fields: [studySessions.folderId],
      references: [flashcardFolders.id],
    }),
    reviews: many(flashcardReviews),
  })
);

// Quiz Results Tables
export const quizSessions = pgTable("quiz_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  folderId: integer("folder_id")
    .notNull()
    .references(() => flashcardFolders.id, { onDelete: "cascade" }),

  // Quiz Metadata
  quizId: text("quiz_id").notNull(), // Generated quiz ID
  title: text("title").notNull(),
  description: text("description"),
  
  // Results
  score: integer("score").notNull(), // Percentage score
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeSpent: integer("time_spent").notNull(), // in milliseconds
  
  // Quiz Data (stored as JSON)
  questions: json("questions").notNull(), // Quiz questions
  answers: json("answers").notNull(), // User answers

  // Metadata
  startedAt: timestamp("started_at", { mode: "string" }).notNull(),
  completedAt: timestamp("completed_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const quizSessionsRelations = relations(quizSessions, ({ one }) => ({
  owner: one(user, {
    fields: [quizSessions.ownerId],
    references: [user.id],
  }),
  folder: one(flashcardFolders, {
    fields: [quizSessions.folderId],
    references: [flashcardFolders.id],
  }),
}));

// Update existing relations to include quiz sessions
export const flashcardFoldersRelationsUpdated = relations(
  flashcardFolders,
  ({ many, one }) => ({
    owner: one(user, {
      fields: [flashcardFolders.ownerId],
      references: [user.id],
    }),
    flashcards: many(flashcards),
    studySessions: many(studySessions),
    quizSessions: many(quizSessions),
  })
);
