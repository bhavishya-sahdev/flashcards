import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcards, flashcardFolders } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
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

		const { searchParams } = new URL(request.url);
		const folderId = searchParams.get('folderId');
		
		if (!folderId) {
			return NextResponse.json(
				{ error: "Folder ID is required" },
				{ status: 400 }
			);
		}

		// Verify user owns the folder
		const [folder] = await db
			.select({ id: flashcardFolders.id, name: flashcardFolders.name })
			.from(flashcardFolders)
			.where(
				and(
					eq(flashcardFolders.id, parseInt(folderId)),
					eq(flashcardFolders.ownerId, session.user.id)
				)
			);

		if (!folder) {
			return NextResponse.json(
				{ error: "Folder not found or unauthorized" },
				{ status: 404 }
			);
		}

		// Get all flashcards in the folder
		const allCards = await db
			.select()
			.from(flashcards)
			.where(eq(flashcards.folderId, parseInt(folderId)));

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

		return NextResponse.json({
			folder: {
				id: folder.id.toString(),
				name: folder.name,
			},
			cards: {
				dueNow: categorizedCards.dueNow,
				learning: categorizedCards.learning,
				upcoming: categorizedCards.upcoming,
				future: categorizedCards.future,
			},
			dueCards,
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
		console.error("Error fetching due cards:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Get study statistics for a folder
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { folderId } = await request.json();
		
		if (!folderId) {
			return NextResponse.json(
				{ error: "Folder ID is required" },
				{ status: 400 }
			);
		}

		// Verify user owns the folder
		const [folder] = await db
			.select({ id: flashcardFolders.id })
			.from(flashcardFolders)
			.where(
				and(
					eq(flashcardFolders.id, parseInt(folderId)),
					eq(flashcardFolders.ownerId, session.user.id)
				)
			);

		if (!folder) {
			return NextResponse.json(
				{ error: "Folder not found or unauthorized" },
				{ status: 404 }
			);
		}

		// Get all flashcards with their review history
		const cards = await db
			.select()
			.from(flashcards)
			.where(eq(flashcards.folderId, parseInt(folderId)));

		const now = new Date();
		const totalCards = cards.length;
		const cardsDue = cards.filter(card => new Date(card.nextReviewDate) <= now).length;
		const cardsLearning = cards.filter(card => card.isLearning).length;
		const cardsGraduated = cards.filter(card => !card.isLearning).length;

		const totalReviews = cards.reduce((sum, card) => sum + card.totalReviews, 0);
		const correctReviews = cards.reduce((sum, card) => sum + card.correctReviews, 0);
		const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

		const averageEaseFactor = cards.length > 0
			? Math.round((cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length) * 100) / 100
			: 2.5;

		const streakCurrent = Math.max(...cards.map(card => card.streakCount), 0);
		const streakBest = Math.max(...cards.map(card => card.maxStreak), 0);

		// Calculate time spent (this would ideally come from session tracking)
		const averageResponseTimes = cards
			.filter(card => card.averageResponseTime)
			.map(card => card.averageResponseTime!);
		
		const averageResponseTime = averageResponseTimes.length > 0
			? averageResponseTimes.reduce((sum, time) => sum + time, 0) / averageResponseTimes.length
			: 0;

		return NextResponse.json({
			stats: {
				totalCards,
				cardsDue,
				cardsLearning,
				cardsGraduated,
				averageEaseFactor,
				totalReviews,
				accuracy,
				streakCurrent,
				streakBest,
				averageResponseTime: Math.round(averageResponseTime),
				// These would require session tracking to be accurate
				timeSpentToday: 0,
				timeSpentTotal: 0,
			},
		});
	} catch (error) {
		console.error("Error fetching study stats:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}