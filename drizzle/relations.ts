import { relations } from "drizzle-orm/relations";
import { user, flashcardFolders, userRoadmaps, roadmapTemplates, roadmapTopics, roadmapStudySessions, studySessions, account, session, flashcards, flashcardReviews, userTopicProgress } from "./schema";

export const flashcardFoldersRelations = relations(flashcardFolders, ({one, many}) => ({
	user: one(user, {
		fields: [flashcardFolders.ownerId],
		references: [user.id]
	}),
	roadmapTopics: many(roadmapTopics),
	studySessions: many(studySessions),
	flashcards: many(flashcards),
}));

export const userRelations = relations(user, ({many}) => ({
	flashcardFolders: many(flashcardFolders),
	userRoadmaps: many(userRoadmaps),
	roadmapStudySessions: many(roadmapStudySessions),
	accounts: many(account),
	sessions: many(session),
	userTopicProgresses: many(userTopicProgress),
}));

export const userRoadmapsRelations = relations(userRoadmaps, ({one, many}) => ({
	user: one(user, {
		fields: [userRoadmaps.userId],
		references: [user.id]
	}),
	roadmapTemplate: one(roadmapTemplates, {
		fields: [userRoadmaps.templateId],
		references: [roadmapTemplates.id]
	}),
	roadmapStudySessions: many(roadmapStudySessions),
	userTopicProgresses: many(userTopicProgress),
}));

export const roadmapTemplatesRelations = relations(roadmapTemplates, ({many}) => ({
	userRoadmaps: many(userRoadmaps),
	roadmapTopics: many(roadmapTopics),
}));

export const roadmapTopicsRelations = relations(roadmapTopics, ({one, many}) => ({
	roadmapTemplate: one(roadmapTemplates, {
		fields: [roadmapTopics.templateId],
		references: [roadmapTemplates.id]
	}),
	flashcardFolder: one(flashcardFolders, {
		fields: [roadmapTopics.linkedFolderId],
		references: [flashcardFolders.id]
	}),
	roadmapStudySessions: many(roadmapStudySessions),
	userTopicProgresses: many(userTopicProgress),
}));

export const roadmapStudySessionsRelations = relations(roadmapStudySessions, ({one}) => ({
	user: one(user, {
		fields: [roadmapStudySessions.userId],
		references: [user.id]
	}),
	userRoadmap: one(userRoadmaps, {
		fields: [roadmapStudySessions.userRoadmapId],
		references: [userRoadmaps.id]
	}),
	roadmapTopic: one(roadmapTopics, {
		fields: [roadmapStudySessions.topicId],
		references: [roadmapTopics.id]
	}),
}));

export const studySessionsRelations = relations(studySessions, ({one, many}) => ({
	flashcardFolder: one(flashcardFolders, {
		fields: [studySessions.folderId],
		references: [flashcardFolders.id]
	}),
	flashcardReviews: many(flashcardReviews),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const flashcardsRelations = relations(flashcards, ({one, many}) => ({
	flashcardFolder: one(flashcardFolders, {
		fields: [flashcards.folderId],
		references: [flashcardFolders.id]
	}),
	flashcardReviews: many(flashcardReviews),
}));

export const flashcardReviewsRelations = relations(flashcardReviews, ({one}) => ({
	flashcard: one(flashcards, {
		fields: [flashcardReviews.flashcardId],
		references: [flashcards.id]
	}),
	studySession: one(studySessions, {
		fields: [flashcardReviews.sessionId],
		references: [studySessions.id]
	}),
}));

export const userTopicProgressRelations = relations(userTopicProgress, ({one}) => ({
	user: one(user, {
		fields: [userTopicProgress.userId],
		references: [user.id]
	}),
	userRoadmap: one(userRoadmaps, {
		fields: [userTopicProgress.userRoadmapId],
		references: [userRoadmaps.id]
	}),
	roadmapTopic: one(roadmapTopics, {
		fields: [userTopicProgress.topicId],
		references: [roadmapTopics.id]
	}),
}));