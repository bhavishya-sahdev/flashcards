import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, answer, category, difficulty, codeTemplate } =
      await request.json();
    const flashcardId = parseInt(id);

    if (!question?.trim() || !answer?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: "Question, answer, and category are required" },
        { status: 400 }
      );
    }

    // Verify user owns the flashcard (through folder ownership)
    const existingFlashcard = await db
      .select({
        id: flashcards.id,
        folderId: flashcards.folderId,
      })
      .from(flashcards)
      .innerJoin(flashcardFolders, eq(flashcards.folderId, flashcardFolders.id))
      .where(
        and(
          eq(flashcards.id, flashcardId),
          eq(flashcardFolders.ownerId, session.user.id)
        )
      );

    if (!existingFlashcard.length) {
      return NextResponse.json(
        { error: "Flashcard not found or unauthorized" },
        { status: 404 }
      );
    }

    const [updatedFlashcard] = await db
      .update(flashcards)
      .set({
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        difficulty: difficulty || "Medium",
        codeTemplate: codeTemplate?.trim() || getDefaultCodeTemplate(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(flashcards.id, flashcardId))
      .returning();

    return NextResponse.json({
      flashcard: {
        id: updatedFlashcard.id.toString(),
        question: updatedFlashcard.question,
        answer: updatedFlashcard.answer,
        category: updatedFlashcard.category,
        difficulty: updatedFlashcard.difficulty,
        codeTemplate: updatedFlashcard.codeTemplate,
      },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flashcardId = parseInt(id);

    // Verify user owns the flashcard (through folder ownership)
    const deletedFlashcard = await db
      .delete(flashcards)
      .where(
        and(
          eq(flashcards.id, flashcardId),
          eq(
            flashcards.folderId,
            db
              .select({ id: flashcardFolders.id })
              .from(flashcardFolders)
              .where(eq(flashcardFolders.ownerId, session.user.id))
          )
        )
      )
      .returning();

    if (!deletedFlashcard.length) {
      return NextResponse.json(
        { error: "Flashcard not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
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
