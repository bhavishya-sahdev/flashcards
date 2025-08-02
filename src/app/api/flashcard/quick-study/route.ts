import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcards, flashcardFolders } from "@/db/schema/flashcards";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDueCards, categorizeCards } from "@/lib/spaced-repetition";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get all folders belonging to the user
		const userFolders = await db
			.select({ id: flashcardFolders.id, name: flashcardFolders.name })
			.from(flashcardFolders)
			.where(eq(flashcardFolders.ownerId, session.user.id));

		if (userFolders.length === 0) {
			return NextResponse.json({
				folders: [],
				cards: {
					dueNow: [],
					learning: [],
					upcoming: [],
					future: [],
				},
				dueCards: [],
				totalDue: 0,
				summary: {
					totalCards: 0,
					dueNow: 0,
					learning: 0,
					upcoming: 0,
					future: 0,
				},
			});
		}

		// Get all flashcards from all user's folders
		const folderIds = userFolders.map(folder => folder.id);
		const allCards = await db
			.select({
				id: flashcards.id,
				question: flashcards.question,
				answer: flashcards.answer,
				category: flashcards.category,
				difficulty: flashcards.difficulty,
				codeTemplate: flashcards.codeTemplate,
				folderId: flashcards.folderId,
				isLearning: flashcards.isLearning,
				easeFactor: flashcards.easeFactor,
				totalReviews: flashcards.totalReviews,
				correctReviews: flashcards.correctReviews,
				streakCount: flashcards.streakCount,
				maxStreak: flashcards.maxStreak,
				lastReviewDate: flashcards.lastReviewDate,
				nextReviewDate: flashcards.nextReviewDate,
				interval: flashcards.interval,
				averageResponseTime: flashcards.averageResponseTime,
				createdAt: flashcards.createdAt,
				updatedAt: flashcards.updatedAt,
				folderName: flashcardFolders.name,
			})
			.from(flashcards)
			.innerJoin(flashcardFolders, eq(flashcards.folderId, flashcardFolders.id))
			.where(eq(flashcardFolders.ownerId, session.user.id));

		const now = new Date();

		// Convert to the format expected by our spaced repetition functions
		const formattedCards = allCards.map(card => ({
			...card,
			id: card.id.toString(),
			nextReviewDate: new Date(card.nextReviewDate),
			lastReviewDate: card.lastReviewDate ? new Date(card.lastReviewDate) : undefined,
			createdAt: new Date(card.createdAt),
			updatedAt: new Date(card.updatedAt),
		}));

		// Categorize cards using spaced repetition logic
		const categorizedCards = categorizeCards(formattedCards, now);
		
		// Get only the due cards (including learning cards)
		const dueCards = getDueCards(formattedCards, now);

		// Group due cards by folder for better organization
		const cardsByFolder = dueCards.reduce((acc, card) => {
			const folderName = card.folderName || 'Unknown';
			if (!acc[folderName]) {
				acc[folderName] = [];
			}
			acc[folderName].push(card);
			return acc;
		}, {} as Record<string, typeof dueCards>);

		return NextResponse.json({
			folders: userFolders,
			cards: {
				dueNow: categorizedCards.dueNow,
				learning: categorizedCards.learning,
				upcoming: categorizedCards.upcoming,
				future: categorizedCards.future,
			},
			dueCards,
			cardsByFolder,
			totalDue: dueCards.length,
			summary: {
				totalCards: formattedCards.length,
				dueNow: categorizedCards.dueNow.length,
				learning: categorizedCards.learning.length,
				upcoming: categorizedCards.upcoming.length,
				future: categorizedCards.future.length,
			},
		});
	} catch (error) {
		console.error("Error fetching quick study cards:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}