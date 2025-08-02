// app/api/flashcards/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, answer, category, difficulty, codeTemplate, folderId } =
      await request.json();

    if (!question?.trim() || !answer?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: "Question, answer, and category are required" },
        { status: 400 }
      );
    }

    // Verify user owns the folder
    const folder = await db
      .select({ id: flashcardFolders.id })
      .from(flashcardFolders)
      .where(
        and(
          eq(flashcardFolders.id, parseInt(folderId)),
          eq(flashcardFolders.ownerId, session.user.id)
        )
      );

    if (!folder.length) {
      return NextResponse.json(
        { error: "Folder not found or unauthorized" },
        { status: 404 }
      );
    }

    const [newFlashcard] = await db
      .insert(flashcards)
      .values({
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        difficulty: difficulty || "Medium",
        codeTemplate: codeTemplate?.trim() || getDefaultCodeTemplate(),
        folderId: parseInt(folderId),
      })
      .returning();

    return NextResponse.json({
      flashcard: {
        id: newFlashcard.id.toString(),
        question: newFlashcard.question,
        answer: newFlashcard.answer,
        category: newFlashcard.category,
        difficulty: newFlashcard.difficulty,
        codeTemplate: newFlashcard.codeTemplate,
        // Spaced repetition fields
        easeFactor: newFlashcard.easeFactor,
        interval: newFlashcard.interval,
        repetitions: newFlashcard.repetitions,
        nextReviewDate: new Date(newFlashcard.nextReviewDate),
        lastReviewDate: newFlashcard.lastReviewDate ? new Date(newFlashcard.lastReviewDate) : null,
        isLearning: newFlashcard.isLearning,
        learningStep: newFlashcard.learningStep,
        // Performance tracking
        totalReviews: newFlashcard.totalReviews,
        correctReviews: newFlashcard.correctReviews,
        streakCount: newFlashcard.streakCount,
        maxStreak: newFlashcard.maxStreak,
        averageResponseTime: newFlashcard.averageResponseTime,
        // Metadata
        createdAt: new Date(newFlashcard.createdAt),
        updatedAt: new Date(newFlashcard.updatedAt),
      },
    });
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getDefaultCodeTemplate() {
  return `// Implement your solution here
function solution() {
    // Your code goes here
    console.log("Hello, World!");
}

// Test your implementation
solution();`;
}
