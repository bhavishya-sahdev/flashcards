// app/api/flashcard/due/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { categorizeCards, calculateStudyStats } from "@/lib/spaced-repetition";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const includeStats = searchParams.get("includeStats") === "true";

    // Get user's folders with flashcards
    let userFolders;

    if (folderId) {
      // Get specific folder
      userFolders = await db.query.flashcardFolders.findMany({
        where: and(
          eq(flashcardFolders.ownerId, session.user.id),
          eq(flashcardFolders.id, parseInt(folderId))
        ),
        with: {
          flashcards: true,
        },
      });
    } else {
      // Get all folders
      userFolders = await db.query.flashcardFolders.findMany({
        where: eq(flashcardFolders.ownerId, session.user.id),
        with: {
          flashcards: true,
        },
      });
    }

    if (!userFolders.length) {
      return NextResponse.json({ error: "No folders found" }, { status: 404 });
    }

    // Flatten all flashcards
    const allCards = userFolders.flatMap((folder) =>
      folder.flashcards.map((card) => ({
        ...card,
        folderId: folder.id,
        folderName: folder.name,
      }))
    );

    // Categorize cards by review status
    const now = new Date();
    const categorizedCards = categorizeCards(allCards, now);

    // Prepare response
    const response: any = {
      folders: userFolders.map((folder) => ({
        id: folder.id.toString(),
        name: folder.name,
        description: folder.description,
        cardCount: folder.flashcards.length,
        dueCount:
          categorizeCards(folder.flashcards, now).dueNow.length +
          categorizeCards(folder.flashcards, now).learning.length,
      })),
      cards: {
        dueNow: categorizedCards.dueNow.map(formatCardForClient),
        learning: categorizedCards.learning.map(formatCardForClient),
        upcoming: categorizedCards.upcoming.map(formatCardForClient),
        future: categorizedCards.future.map(formatCardForClient),
      },
      totalCounts: {
        dueNow: categorizedCards.dueNow.length,
        learning: categorizedCards.learning.length,
        upcoming: categorizedCards.upcoming.length,
        future: categorizedCards.future.length,
        total: allCards.length,
      },
    };

    // Include study statistics if requested
    if (includeStats) {
      const allReviews = await db.query.flashcardReviews.findMany({
        where: (flashcardReviews) =>
          eq(flashcardReviews.ownerId, session.user.id),
        orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      });

      response.stats = calculateStudyStats(allCards, allReviews);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching due cards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatCardForClient(card: any) {
  return {
    id: card.id.toString(),
    question: card.question,
    answer: card.answer,
    category: card.category,
    difficulty: card.difficulty,
    codeTemplate: card.codeTemplate,
    folderId: card.folderId?.toString(),
    folderName: card.folderName,

    // Spaced repetition fields
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
    nextReviewDate: card.nextReviewDate,
    lastReviewDate: card.lastReviewDate,
    isLearning: card.isLearning,

    // Performance stats
    totalReviews: card.totalReviews || 0,
    correctReviews: card.correctReviews || 0,
    streakCount: card.streakCount || 0,
    maxStreak: card.maxStreak || 0,
    averageResponseTime: card.averageResponseTime,

    // Calculate accuracy percentage
    accuracy:
      card.totalReviews > 0
        ? Math.round((card.correctReviews / card.totalReviews) * 100)
        : null,
  };
}
