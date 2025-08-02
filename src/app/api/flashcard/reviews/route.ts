import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcards, flashcardReviews, studySessions } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { calculateNextReview, type ReviewQuality } from "@/lib/spaced-repetition";

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { flashcardId, quality, responseTime, sessionId } = await request.json();

		if (!flashcardId || quality === undefined) {
			return NextResponse.json(
				{ error: "Flashcard ID and quality rating are required" },
				{ status: 400 }
			);
		}

		if (quality < 0 || quality > 5) {
			return NextResponse.json(
				{ error: "Quality must be between 0 and 5" },
				{ status: 400 }
			);
		}

		// Get the current flashcard
		const [flashcard] = await db
			.select()
			.from(flashcards)
			.where(eq(flashcards.id, parseInt(flashcardId)));

		if (!flashcard) {
			return NextResponse.json(
				{ error: "Flashcard not found" },
				{ status: 404 }
			);
		}

		// Calculate next review parameters
		const currentState = {
			easeFactor: flashcard.easeFactor,
			interval: flashcard.interval,
			repetitions: flashcard.repetitions,
			isLearning: flashcard.isLearning,
			learningStep: flashcard.learningStep,
		};

		const reviewResult = calculateNextReview(currentState, quality as ReviewQuality);

		// Calculate new performance metrics
		const newTotalReviews = flashcard.totalReviews + 1;
		const wasCorrect = quality >= 3; // Consider 3+ as correct
		const newCorrectReviews = flashcard.correctReviews + (wasCorrect ? 1 : 0);
		
		// Update streak
		const newStreakCount = wasCorrect ? flashcard.streakCount + 1 : 0;
		const newMaxStreak = Math.max(flashcard.maxStreak, newStreakCount);

		// Update average response time
		const newAverageResponseTime = responseTime
			? flashcard.averageResponseTime
				? (flashcard.averageResponseTime * flashcard.totalReviews + responseTime) / newTotalReviews
				: responseTime
			: flashcard.averageResponseTime;

		// Update the flashcard with new spaced repetition values
		const [updatedFlashcard] = await db
			.update(flashcards)
			.set({
				easeFactor: reviewResult.easeFactor,
				interval: reviewResult.interval,
				repetitions: reviewResult.repetitions,
				nextReviewDate: reviewResult.nextReviewDate.toISOString(),
				lastReviewDate: new Date().toISOString(),
				isLearning: reviewResult.isLearning,
				learningStep: reviewResult.learningStep,
				totalReviews: newTotalReviews,
				correctReviews: newCorrectReviews,
				streakCount: newStreakCount,
				maxStreak: newMaxStreak,
				averageResponseTime: newAverageResponseTime,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(flashcards.id, parseInt(flashcardId)))
			.returning();

		// Record the review for analytics
		await db.insert(flashcardReviews).values({
			flashcardId: parseInt(flashcardId),
			ownerId: session.user.id,
			quality: quality,
			responseTime: responseTime || null,
			wasCorrect,
			reviewType: "scheduled",
			sessionId: sessionId ? parseInt(sessionId) : null,
			easeFactorBefore: currentState.easeFactor,
			intervalBefore: currentState.interval,
			easeFactorAfter: reviewResult.easeFactor,
			intervalAfter: reviewResult.interval,
		});

		return NextResponse.json({
			success: true,
			flashcard: {
				id: updatedFlashcard.id.toString(),
				easeFactor: updatedFlashcard.easeFactor,
				interval: updatedFlashcard.interval,
				repetitions: updatedFlashcard.repetitions,
				nextReviewDate: updatedFlashcard.nextReviewDate,
				isLearning: updatedFlashcard.isLearning,
				totalReviews: updatedFlashcard.totalReviews,
				correctReviews: updatedFlashcard.correctReviews,
				streakCount: updatedFlashcard.streakCount,
				graduatedFromLearning: reviewResult.graduatedFromLearning,
			},
		});
	} catch (error) {
		console.error("Error submitting review:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}