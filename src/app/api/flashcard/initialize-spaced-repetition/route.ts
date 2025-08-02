// app/api/flashcard/initialize-spaced-repetition/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcards, flashcardFolders } from "@/db/schema/flashcards";
import { and, eq, isNull, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { initializeNewCard } from "@/lib/spaced-repetition";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all user's flashcards that haven't been initialized for spaced repetition
    // (where easeFactor is null or nextReviewDate is null)
    const uninitializedCards = await db
      .select({
        id: flashcards.id,
        folderId: flashcards.folderId,
        question: flashcards.question,
      })
      .from(flashcards)
      .innerJoin(flashcardFolders, eq(flashcards.folderId, flashcardFolders.id))
      .where(
        and(
          eq(flashcardFolders.ownerId, session.user.id),
          or(
            isNull(flashcards.easeFactor),
            isNull(flashcards.nextReviewDate),
            isNull(flashcards.interval)
          )
        )
      );

    if (uninitializedCards.length === 0) {
      return NextResponse.json({
        message: "All cards are already initialized",
        initializedCount: 0,
      });
    }

    // Initialize each card with default spaced repetition values
    const defaultValues = initializeNewCard();
    const now = new Date();

    const updatePromises = uninitializedCards.map((card) =>
      db
        .update(flashcards)
        .set({
          easeFactor: defaultValues.easeFactor,
          interval: defaultValues.interval,
          repetitions: defaultValues.repetitions,
          nextReviewDate: now.toISOString(), // Make all cards available for immediate review
          isLearning: defaultValues.isLearning,
          learningStep: defaultValues.learningStep,
          totalReviews: 0,
          correctReviews: 0,
          streakCount: 0,
          maxStreak: 0,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(flashcards.id, card.id))
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Successfully initialized ${uninitializedCards.length} flashcards for spaced repetition`,
      initializedCount: uninitializedCards.length,
      cards: uninitializedCards.map((card) => ({
        id: card.id.toString(),
        question: card.question.substring(0, 50) + "...",
        folderId: card.folderId.toString(),
      })),
    });
  } catch (error) {
    console.error("Error initializing spaced repetition:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
