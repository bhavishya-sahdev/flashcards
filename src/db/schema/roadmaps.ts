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
import { flashcardFolders } from "./flashcards";

// Roadmap templates that define the structure of learning paths
export const roadmapTemplates = pgTable("roadmap_templates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(), // e.g., "DSA Fundamentals", "System Design"
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "programming", "system-design", "interview-prep"
  isPublic: boolean("is_public").notNull().default(true),
  totalEstimatedTime: integer("total_estimated_time"), // in hours
  difficultyLevel: text("difficulty_level").notNull().default("Beginner"), // Beginner, Intermediate, Advanced
  tags: json("tags").$type<string[]>().default([]), // ["algorithms", "data-structures", "coding-interview"]
  
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// Individual topics within a roadmap
export const roadmapTopics = pgTable("roadmap_topics", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  templateId: integer("template_id")
    .notNull()
    .references(() => roadmapTemplates.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(), // e.g., "Arrays & Strings"
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull().default("Beginner"),
  estimatedTimeHours: integer("estimated_time_hours").notNull().default(8),
  orderIndex: integer("order_index").notNull(), // For ordering topics in the roadmap
  
  // Content and learning materials
  subtopics: json("subtopics").$type<string[]>().default([]), // ["Array manipulation", "Two pointers"]
  practiceProblemsCount: integer("practice_problems_count").notNull().default(0),
  keyLearningPoints: json("key_learning_points").$type<string[]>().default([]),
  
  // Prerequisites and unlocking
  prerequisiteTopicIds: json("prerequisite_topic_ids").$type<number[]>().default([]),
  
  // Optional: Link to a flashcard folder that contains related flashcards
  linkedFolderId: integer("linked_folder_id").references(() => flashcardFolders.id),
  
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// User's personal roadmap instances
export const userRoadmaps = pgTable("user_roadmaps", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  templateId: integer("template_id")
    .notNull()
    .references(() => roadmapTemplates.id, { onDelete: "cascade" }),
  
  // Customization
  isCustomized: boolean("is_customized").notNull().default(false),
  customName: text("custom_name"), // User can rename their roadmap instance
  customDescription: text("custom_description"),
  
  // Progress tracking
  isActive: boolean("is_active").notNull().default(true),
  startedAt: timestamp("started_at", { mode: "string" }).defaultNow(),
  targetCompletionDate: timestamp("target_completion_date", { mode: "string" }),
  
  // Analytics
  totalTimeSpent: integer("total_time_spent").notNull().default(0), // in minutes
  lastAccessedAt: timestamp("last_accessed_at", { mode: "string" }).defaultNow(),
  
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// User progress on individual topics
export const userTopicProgress = pgTable("user_topic_progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  userRoadmapId: integer("user_roadmap_id")
    .notNull()
    .references(() => userRoadmaps.id, { onDelete: "cascade" }),
  topicId: integer("topic_id")
    .notNull()
    .references(() => roadmapTopics.id, { onDelete: "cascade" }),
  
  // Progress status
  status: text("status").notNull().default("locked"), // locked, available, in_progress, completed
  
  // Progress metrics
  progressPercentage: real("progress_percentage").notNull().default(0), // 0-100
  timeSpent: integer("time_spent").notNull().default(0), // in minutes
  
  // Milestones
  startedAt: timestamp("started_at", { mode: "string" }),
  completedAt: timestamp("completed_at", { mode: "string" }),
  lastStudiedAt: timestamp("last_studied_at", { mode: "string" }),
  
  // User notes and bookmarks
  userNotes: text("user_notes"),
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  
  // Performance tracking
  practiceProblemsCompleted: integer("practice_problems_completed").notNull().default(0),
  averageScore: real("average_score"), // If there are quizzes/assessments
  
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// Track study sessions for roadmap topics
export const roadmapStudySessions = pgTable("roadmap_study_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  userRoadmapId: integer("user_roadmap_id")
    .notNull()
    .references(() => userRoadmaps.id, { onDelete: "cascade" }),
  topicId: integer("topic_id")
    .notNull()
    .references(() => roadmapTopics.id, { onDelete: "cascade" }),
  
  // Session details
  sessionType: text("session_type").notNull().default("study"), // study, practice, review
  durationMinutes: integer("duration_minutes").notNull().default(0),
  
  // Performance metrics
  problemsAttempted: integer("problems_attempted").notNull().default(0),
  problemsCompleted: integer("problems_completed").notNull().default(0),
  averageScore: real("average_score"),
  
  // Session notes
  notes: text("notes"),
  mood: text("mood"), // "focused", "distracted", "tired", etc.
  
  startedAt: timestamp("started_at", { mode: "string" }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

// Relations
export const roadmapTemplatesRelations = relations(roadmapTemplates, ({ many }) => ({
  topics: many(roadmapTopics),
  userRoadmaps: many(userRoadmaps),
}));

export const roadmapTopicsRelations = relations(roadmapTopics, ({ one, many }) => ({
  template: one(roadmapTemplates, {
    fields: [roadmapTopics.templateId],
    references: [roadmapTemplates.id],
  }),
  linkedFolder: one(flashcardFolders, {
    fields: [roadmapTopics.linkedFolderId],
    references: [flashcardFolders.id],
  }),
  userProgress: many(userTopicProgress),
  studySessions: many(roadmapStudySessions),
}));

export const userRoadmapsRelations = relations(userRoadmaps, ({ one, many }) => ({
  user: one(user, {
    fields: [userRoadmaps.userId],
    references: [user.id],
  }),
  template: one(roadmapTemplates, {
    fields: [userRoadmaps.templateId],
    references: [roadmapTemplates.id],
  }),
  topicProgress: many(userTopicProgress),
  studySessions: many(roadmapStudySessions),
}));

export const userTopicProgressRelations = relations(userTopicProgress, ({ one }) => ({
  user: one(user, {
    fields: [userTopicProgress.userId],
    references: [user.id],
  }),
  userRoadmap: one(userRoadmaps, {
    fields: [userTopicProgress.userRoadmapId],
    references: [userRoadmaps.id],
  }),
  topic: one(roadmapTopics, {
    fields: [userTopicProgress.topicId],
    references: [roadmapTopics.id],
  }),
}));

export const roadmapStudySessionsRelations = relations(roadmapStudySessions, ({ one }) => ({
  user: one(user, {
    fields: [roadmapStudySessions.userId],
    references: [user.id],
  }),
  userRoadmap: one(userRoadmaps, {
    fields: [roadmapStudySessions.userRoadmapId],
    references: [userRoadmaps.id],
  }),
  topic: one(roadmapTopics, {
    fields: [roadmapStudySessions.topicId],
    references: [roadmapTopics.id],
  }),
}));