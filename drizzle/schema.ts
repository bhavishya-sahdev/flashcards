import { pgTable, uniqueIndex, index, integer, varchar, text, timestamp, foreignKey, boolean, json, real, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const posts = pgTable("posts", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "posts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	description: varchar().notNull(),
	slug: varchar().notNull(),
	title: varchar({ length: 256 }).notNull(),
	author: varchar().default('Bhavishya Sahdev').notNull(),
	keywords: varchar().array().default([""]).notNull(),
	category: varchar().notNull(),
	tags: varchar().array().default([""]).notNull(),
	content: text().notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }).defaultNow().notNull(),
	featuredImage: varchar("featured_image"),
}, (table) => [
	uniqueIndex("slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const flashcardFolders = pgTable("flashcard_folders", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "flashcard_folders_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	ownerId: text("owner_id").notNull(),
	name: text().notNull(),
	description: text().default(''),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "flashcard_folders_owner_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const userRoadmaps = pgTable("user_roadmaps", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_roadmaps_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	templateId: integer("template_id").notNull(),
	isCustomized: boolean("is_customized").default(false).notNull(),
	customName: text("custom_name"),
	customDescription: text("custom_description"),
	isActive: boolean("is_active").default(true).notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
	targetCompletionDate: timestamp("target_completion_date", { mode: 'string' }),
	totalTimeSpent: integer("total_time_spent").default(0).notNull(),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_roadmaps_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [roadmapTemplates.id],
			name: "user_roadmaps_template_id_roadmap_templates_id_fk"
		}).onDelete("cascade"),
]);

export const roadmapTemplates = pgTable("roadmap_templates", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "roadmap_templates_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	description: text().notNull(),
	category: text().notNull(),
	isPublic: boolean("is_public").default(true).notNull(),
	totalEstimatedTime: integer("total_estimated_time"),
	difficultyLevel: text("difficulty_level").default('Beginner').notNull(),
	tags: json().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const roadmapTopics = pgTable("roadmap_topics", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "roadmap_topics_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	templateId: integer("template_id").notNull(),
	name: text().notNull(),
	description: text().notNull(),
	difficulty: text().default('Beginner').notNull(),
	estimatedTimeHours: integer("estimated_time_hours").default(8).notNull(),
	orderIndex: integer("order_index").notNull(),
	subtopics: json().default([]),
	practiceProblemsCount: integer("practice_problems_count").default(0).notNull(),
	keyLearningPoints: json("key_learning_points").default([]),
	prerequisiteTopicIds: json("prerequisite_topic_ids").default([]),
	linkedFolderId: integer("linked_folder_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [roadmapTemplates.id],
			name: "roadmap_topics_template_id_roadmap_templates_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.linkedFolderId],
			foreignColumns: [flashcardFolders.id],
			name: "roadmap_topics_linked_folder_id_flashcard_folders_id_fk"
		}),
]);

export const roadmapStudySessions = pgTable("roadmap_study_sessions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "roadmap_study_sessions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	userRoadmapId: integer("user_roadmap_id").notNull(),
	topicId: integer("topic_id").notNull(),
	sessionType: text("session_type").default('study').notNull(),
	durationMinutes: integer("duration_minutes").default(0).notNull(),
	problemsAttempted: integer("problems_attempted").default(0).notNull(),
	problemsCompleted: integer("problems_completed").default(0).notNull(),
	averageScore: real("average_score"),
	notes: text(),
	mood: text(),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "roadmap_study_sessions_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userRoadmapId],
			foreignColumns: [userRoadmaps.id],
			name: "roadmap_study_sessions_user_roadmap_id_user_roadmaps_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [roadmapTopics.id],
			name: "roadmap_study_sessions_topic_id_roadmap_topics_id_fk"
		}).onDelete("cascade"),
]);

export const studySessions = pgTable("study_sessions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "study_sessions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	ownerId: text("owner_id").notNull(),
	folderId: integer("folder_id"),
	cardsReviewed: integer("cards_reviewed").default(0).notNull(),
	cardsCorrect: integer("cards_correct").default(0).notNull(),
	totalTimeSpent: real("total_time_spent").default(0).notNull(),
	sessionType: text("session_type").default('review').notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.folderId],
			foreignColumns: [flashcardFolders.id],
			name: "study_sessions_folder_id_flashcard_folders_id_fk"
		}),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const flashcards = pgTable("flashcards", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "flashcards_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	question: text().notNull(),
	answer: text().notNull(),
	category: text().notNull(),
	difficulty: text().default('Medium').notNull(),
	codeTemplate: text("code_template").notNull(),
	folderId: integer("folder_id").notNull(),
	easeFactor: real("ease_factor").default(2.5).notNull(),
	interval: integer().default(1).notNull(),
	repetitions: integer().default(0).notNull(),
	nextReviewDate: timestamp("next_review_date", { mode: 'string' }).defaultNow().notNull(),
	lastReviewDate: timestamp("last_review_date", { mode: 'string' }),
	isLearning: boolean("is_learning").default(true).notNull(),
	totalReviews: integer("total_reviews").default(0).notNull(),
	correctReviews: integer("correct_reviews").default(0).notNull(),
	streakCount: integer("streak_count").default(0).notNull(),
	maxStreak: integer("max_streak").default(0).notNull(),
	averageResponseTime: real("average_response_time"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	learningStep: integer("learning_step").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.folderId],
			foreignColumns: [flashcardFolders.id],
			name: "flashcards_folder_id_flashcard_folders_id_fk"
		}).onDelete("cascade"),
]);

export const flashcardReviews = pgTable("flashcard_reviews", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "flashcard_reviews_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	flashcardId: integer("flashcard_id").notNull(),
	ownerId: text("owner_id").notNull(),
	quality: integer().notNull(),
	responseTime: real("response_time"),
	wasCorrect: boolean("was_correct").notNull(),
	reviewType: text("review_type").default('scheduled').notNull(),
	sessionId: integer("session_id"),
	easeFactorBefore: real("ease_factor_before").notNull(),
	intervalBefore: integer("interval_before").notNull(),
	easeFactorAfter: real("ease_factor_after").notNull(),
	intervalAfter: integer("interval_after").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.flashcardId],
			foreignColumns: [flashcards.id],
			name: "flashcard_reviews_flashcard_id_flashcards_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [studySessions.id],
			name: "flashcard_reviews_session_id_study_sessions_id_fk"
		}),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const userTopicProgress = pgTable("user_topic_progress", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_topic_progress_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	userRoadmapId: integer("user_roadmap_id").notNull(),
	topicId: integer("topic_id").notNull(),
	status: text().default('locked').notNull(),
	progressPercentage: real("progress_percentage").default(0).notNull(),
	timeSpent: integer("time_spent").default(0).notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	lastStudiedAt: timestamp("last_studied_at", { mode: 'string' }),
	userNotes: text("user_notes"),
	isBookmarked: boolean("is_bookmarked").default(false).notNull(),
	practiceProblemsCompleted: integer("practice_problems_completed").default(0).notNull(),
	averageScore: real("average_score"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_topic_progress_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userRoadmapId],
			foreignColumns: [userRoadmaps.id],
			name: "user_topic_progress_user_roadmap_id_user_roadmaps_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [roadmapTopics.id],
			name: "user_topic_progress_topic_id_roadmap_topics_id_fk"
		}).onDelete("cascade"),
]);
