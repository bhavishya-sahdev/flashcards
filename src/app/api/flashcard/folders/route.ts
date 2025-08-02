import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's folders with their flashcards
    const userFolders = await db
      .select({
        id: flashcardFolders.id,
        name: flashcardFolders.name,
        description: flashcardFolders.description,
        createdAt: flashcardFolders.createdAt,
        flashcard: {
          id: flashcards.id,
          question: flashcards.question,
          answer: flashcards.answer,
          category: flashcards.category,
          difficulty: flashcards.difficulty,
          codeTemplate: flashcards.codeTemplate,
          // Spaced repetition fields
          easeFactor: flashcards.easeFactor,
          interval: flashcards.interval,
          repetitions: flashcards.repetitions,
          nextReviewDate: flashcards.nextReviewDate,
          lastReviewDate: flashcards.lastReviewDate,
          isLearning: flashcards.isLearning,
          learningStep: flashcards.learningStep,
          // Performance tracking
          totalReviews: flashcards.totalReviews,
          correctReviews: flashcards.correctReviews,
          streakCount: flashcards.streakCount,
          maxStreak: flashcards.maxStreak,
          averageResponseTime: flashcards.averageResponseTime,
          // Metadata
          createdAt: flashcards.createdAt,
          updatedAt: flashcards.updatedAt,
        },
      })
      .from(flashcardFolders)
      .leftJoin(flashcards, eq(flashcards.folderId, flashcardFolders.id))
      .where(eq(flashcardFolders.ownerId, session.user.id));

    // Group flashcards by folder
    const foldersMap = new Map();

    userFolders.forEach((row) => {
      const folderId = row.id.toString();

      if (!foldersMap.has(folderId)) {
        foldersMap.set(folderId, {
          id: folderId,
          name: row.name,
          description: row.description,
          createdAt: new Date(row.createdAt),
          flashcards: [],
        });
      }

      // Add flashcard if it exists
      if (row?.flashcard?.id) {
        foldersMap.get(folderId).flashcards.push({
          id: row.flashcard.id.toString(),
          question: row.flashcard.question,
          answer: row.flashcard.answer,
          category: row.flashcard.category,
          difficulty: row.flashcard.difficulty,
          codeTemplate: row.flashcard.codeTemplate,
          // Spaced repetition fields
          easeFactor: row.flashcard.easeFactor,
          interval: row.flashcard.interval,
          repetitions: row.flashcard.repetitions,
          nextReviewDate: new Date(row.flashcard.nextReviewDate),
          lastReviewDate: row.flashcard.lastReviewDate ? new Date(row.flashcard.lastReviewDate) : null,
          isLearning: row.flashcard.isLearning,
          learningStep: row.flashcard.learningStep,
          // Performance tracking
          totalReviews: row.flashcard.totalReviews,
          correctReviews: row.flashcard.correctReviews,
          streakCount: row.flashcard.streakCount,
          maxStreak: row.flashcard.maxStreak,
          averageResponseTime: row.flashcard.averageResponseTime,
          // Metadata
          createdAt: new Date(row.flashcard.createdAt),
          updatedAt: new Date(row.flashcard.updatedAt),
        });
      }
    });

    const folders = Array.from(foldersMap.values());

    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const [newFolder] = await db
      .insert(flashcardFolders)
      .values({
        ownerId: session.user.id,
        name: name.trim(),
        description: description?.trim() || "",
      })
      .returning();

    return NextResponse.json({
      folder: {
        id: newFolder.id.toString(),
        name: newFolder.name,
        description: newFolder.description,
        createdAt: new Date(newFolder.createdAt),
        flashcards: [],
      },
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
