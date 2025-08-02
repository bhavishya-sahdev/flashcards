// app/api/flashcard/review/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcards, flashcardReviews } from "@/db/schema/flashcards";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { calculateNextReview, ReviewQuality } from "@/lib/spaced-repetition";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      flashcardId,
      quality,
      responseTime,
      reviewType = "scheduled",
      sessionId,
    } = await request.json();

    // Validate input
    if (!flashcardId || quality === undefined || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: "Invalid flashcard ID or quality rating" },
        { status: 400 }
      );
    }

    // Get current flashcard state
    const [currentCard] = await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.id, parseInt(flashcardId)))
      .limit(1);

    if (!currentCard) {
      return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 }
      );
    }

    // Verify user owns this flashcard (through folder ownership)
    const cardWithFolder = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, parseInt(flashcardId)),
      with: {
        folder: true,
      },
    });

    if (!cardWithFolder || cardWithFolder.folder.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to flashcard" },
        { status: 403 }
      );
    }

    // Current state for spaced repetition algorithm
    const currentState = {
      easeFactor: currentCard.easeFactor,
      interval: currentCard.interval,
      repetitions: currentCard.repetitions,
      isLearning: currentCard.isLearning,
      learningStep: currentCard.learningStep,
    };

    // Calculate next review using spaced repetition algorithm
    const reviewResult = calculateNextReview(
      currentState,
      quality as ReviewQuality
    );

    // Determine if the review was correct (quality >= 2)
    const wasCorrect = quality >= 2;

    // Update streak counts
    const newStreakCount = wasCorrect ? (currentCard.streakCount || 0) + 1 : 0;
    const newMaxStreak = Math.max(currentCard.maxStreak || 0, newStreakCount);

    // Calculate new average response time
    const totalReviews = (currentCard.totalReviews || 0) + 1;
    const newAverageResponseTime = responseTime
      ? ((currentCard.averageResponseTime || 0) * (totalReviews - 1) +
          responseTime) /
        totalReviews
      : currentCard.averageResponseTime;

    // Update flashcard with new spaced repetition values
    const [updatedCard] = await db
      .update(flashcards)
      .set({
        easeFactor: reviewResult.easeFactor,
        interval: reviewResult.interval,
        repetitions: reviewResult.repetitions,
        nextReviewDate: reviewResult.nextReviewDate.toString(),
        lastReviewDate: new Date().toString(),
        isLearning: reviewResult.isLearning,
        learningStep: reviewResult.learningStep,
        totalReviews: totalReviews,
        correctReviews: wasCorrect
          ? (currentCard.correctReviews || 0) + 1
          : currentCard.correctReviews || 0,
        streakCount: newStreakCount,
        maxStreak: newMaxStreak,
        averageResponseTime: newAverageResponseTime,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(flashcards.id, parseInt(flashcardId)))
      .returning();

    // Record the review in flashcard_reviews table
    const [reviewRecord] = await db
      .insert(flashcardReviews)
      .values({
        flashcardId: parseInt(flashcardId),
        ownerId: session.user.id,
        quality,
        responseTime,
        wasCorrect,
        reviewType,
        sessionId: sessionId ? parseInt(sessionId) : null,
        easeFactorBefore: currentState.easeFactor,
        intervalBefore: currentState.interval,
        easeFactorAfter: reviewResult.easeFactor,
        intervalAfter: reviewResult.interval,
      })
      .returning();

    return NextResponse.json({
      success: true,
      flashcard: {
        id: updatedCard.id.toString(),
        easeFactor: updatedCard.easeFactor,
        interval: updatedCard.interval,
        repetitions: updatedCard.repetitions,
        nextReviewDate: updatedCard.nextReviewDate,
        isLearning: updatedCard.isLearning,
        graduatedFromLearning: reviewResult.graduatedFromLearning,
      },
      review: {
        id: reviewRecord.id.toString(),
        quality: reviewRecord.quality,
        wasCorrect: reviewRecord.wasCorrect,
        responseTime: reviewRecord.responseTime,
      },
      message: reviewResult.graduatedFromLearning
        ? "Card graduated from learning phase!"
        : undefined,
    });
  } catch (error) {
    console.error("Error processing review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
