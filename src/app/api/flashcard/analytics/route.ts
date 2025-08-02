import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcards, flashcardReviews, studySessions, flashcardFolders } from "@/db/schema/flashcards";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const folderId = searchParams.get('folderId');
		const timeRange = searchParams.get('timeRange') || '30'; // days

		const userId = session.user.id;
		const daysAgo = new Date();
		daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

		// Get all user's flashcards (filtered by folder if specified)
		let whereConditions = [eq(flashcardFolders.ownerId, userId)];
		if (folderId) {
			whereConditions.push(eq(flashcards.folderId, parseInt(folderId)));
		}

		const userFlashcards = await db
			.select({
				id: flashcards.id,
				question: flashcards.question,
				answer: flashcards.answer,
				category: flashcards.category,
				difficulty: flashcards.difficulty,
				codeTemplate: flashcards.codeTemplate,
				folderId: flashcards.folderId,
				easeFactor: flashcards.easeFactor,
				interval: flashcards.interval,
				repetitions: flashcards.repetitions,
				nextReviewDate: flashcards.nextReviewDate,
				lastReviewDate: flashcards.lastReviewDate,
				isLearning: flashcards.isLearning,
				learningStep: flashcards.learningStep,
				totalReviews: flashcards.totalReviews,
				correctReviews: flashcards.correctReviews,
				streakCount: flashcards.streakCount,
				maxStreak: flashcards.maxStreak,
				averageResponseTime: flashcards.averageResponseTime,
				createdAt: flashcards.createdAt,
				updatedAt: flashcards.updatedAt,
			})
			.from(flashcards)
			.innerJoin(flashcardFolders, eq(flashcards.folderId, flashcardFolders.id))
			.where(and(...whereConditions));

		// Get reviews in the time range
		const flashcardIds = userFlashcards.map(f => f.id);
		
		let reviewsData: any[] = [];
		if (flashcardIds.length > 0) {
			reviewsData = await db
				.select()
				.from(flashcardReviews)
				.where(
					and(
						eq(flashcardReviews.ownerId, userId),
						gte(flashcardReviews.createdAt, daysAgo.toISOString())
					)
				)
				.orderBy(desc(flashcardReviews.createdAt));
		}

		// Get study sessions in the time range
		let studySessionsData: any[] = [];
		studySessionsData = await db
			.select()
			.from(studySessions)
			.where(
				and(
					eq(studySessions.ownerId, userId),
					gte(studySessions.createdAt, daysAgo.toISOString())
				)
			)
			.orderBy(desc(studySessions.createdAt));

		// Calculate overall statistics
		const totalCards = userFlashcards.length;
		const totalReviews = reviewsData.length;
		const correctReviews = reviewsData.filter(r => r.wasCorrect).length;
		const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

		// Cards by status
		const now = new Date();
		const cardsDue = userFlashcards.filter(card => 
			new Date(card.nextReviewDate) <= now
		).length;
		const cardsLearning = userFlashcards.filter(card => card.isLearning).length;
		const cardsGraduated = userFlashcards.filter(card => !card.isLearning && card.repetitions > 0).length;

		// Calculate streaks
		const currentStreaks = userFlashcards.map(card => card.streakCount);
		const maxStreaks = userFlashcards.map(card => card.maxStreak);
		const currentBestStreak = Math.max(...currentStreaks, 0);
		const allTimeBestStreak = Math.max(...maxStreaks, 0);

		// Average response time
		const cardsWithResponseTime = userFlashcards.filter(card => card.averageResponseTime);
		const averageResponseTime = cardsWithResponseTime.length > 0
			? cardsWithResponseTime.reduce((sum, card) => sum + (card.averageResponseTime || 0), 0) / cardsWithResponseTime.length
			: 0;

		// Average ease factor
		const averageEaseFactor = userFlashcards.length > 0
			? userFlashcards.reduce((sum, card) => sum + card.easeFactor, 0) / userFlashcards.length
			: 2.5;

		// Time spent statistics
		const timeSpentTotal = studySessionsData.reduce((sum, session) => sum + (session.totalTimeSpent || 0), 0);
		const timeSpentToday = studySessionsData
			.filter(session => {
				const sessionDate = new Date(session.createdAt);
				const today = new Date();
				return sessionDate.toDateString() === today.toDateString();
			})
			.reduce((sum, session) => sum + (session.totalTimeSpent || 0), 0);

		// Daily review data for charts (last 30 days)
		const dailyReviews = [];
		for (let i = 29; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateStr = date.toDateString();
			
			const dayReviews = reviewsData.filter(review => 
				new Date(review.createdAt).toDateString() === dateStr
			);
			
			dailyReviews.push({
				date: date.toISOString().split('T')[0],
				total: dayReviews.length,
				correct: dayReviews.filter(r => r.wasCorrect).length,
				accuracy: dayReviews.length > 0 ? (dayReviews.filter(r => r.wasCorrect).length / dayReviews.length) * 100 : 0
			});
		}

		// Difficulty breakdown
		const difficultyStats = {
			Easy: userFlashcards.filter(card => card.difficulty === 'Easy').length,
			Medium: userFlashcards.filter(card => card.difficulty === 'Medium').length,
			Hard: userFlashcards.filter(card => card.difficulty === 'Hard').length,
		};

		// Category breakdown
		const categoryStats = userFlashcards.reduce((acc, card) => {
			acc[card.category] = (acc[card.category] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Folder breakdown (if not filtered by folder)
		let folderStats = {};
		if (!folderId) {
			const userFolders = await db
				.select()
				.from(flashcardFolders)
				.where(eq(flashcardFolders.ownerId, userId));

			folderStats = userFolders.reduce((acc, folder) => {
				const folderCards = userFlashcards.filter(card => card.folderId === folder.id);
				acc[folder.name] = {
					total: folderCards.length,
					due: folderCards.filter(card => new Date(card.nextReviewDate) <= now).length,
					learning: folderCards.filter(card => card.isLearning).length,
				};
				return acc;
			}, {} as Record<string, any>);
		}

		const analytics = {
			overview: {
				totalCards,
				cardsDue,
				cardsLearning,
				cardsGraduated,
				totalReviews,
				accuracy: Math.round(accuracy * 100) / 100,
				currentBestStreak,
				allTimeBestStreak,
				averageResponseTime: Math.round(averageResponseTime * 100) / 100,
				averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
				timeSpentToday: Math.round(timeSpentToday / 60), // convert to minutes
				timeSpentTotal: Math.round(timeSpentTotal / 60), // convert to minutes
			},
			charts: {
				dailyReviews,
				difficultyStats,
				categoryStats,
				folderStats,
			},
			recentActivity: reviewsData.slice(0, 10).map(review => ({
				id: review.id,
				flashcardId: review.flashcardId,
				quality: review.quality,
				wasCorrect: review.wasCorrect,
				responseTime: review.responseTime,
				createdAt: review.createdAt,
			})),
		};

		return NextResponse.json({ success: true, analytics });

	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}