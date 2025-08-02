import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { defaultFolders } from "@/lib/Flashcards";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has folders
    const existingFolders = await db
      .select({ id: flashcardFolders.id })
      .from(flashcardFolders)
      .where(eq(flashcardFolders.ownerId, session.user.id));

    if (existingFolders.length > 0) {
      return NextResponse.json(
        { error: "User already has folders" },
        { status: 400 }
      );
    }

    // Create default folders with flashcards
    const createdFolders = [];

    for (const defaultFolder of defaultFolders) {
      // Create folder
      const [newFolder] = await db
        .insert(flashcardFolders)
        .values({
          ownerId: session.user.id,
          name: defaultFolder.name,
          description: defaultFolder.description,
        })
        .returning();

      // Create flashcards for this folder
      const flashcardData = defaultFolder.flashcards.map((flashcard) => ({
        question: flashcard.question,
        answer: flashcard.answer,
        category: flashcard.category,
        difficulty: flashcard.difficulty,
        codeTemplate: flashcard.codeTemplate,
        folderId: newFolder.id,
      }));

      const createdFlashcards = await db
        .insert(flashcards)
        .values(flashcardData)
        .returning();

      createdFolders.push({
        id: newFolder.id.toString(),
        name: newFolder.name,
        description: newFolder.description,
        createdAt: new Date(newFolder.createdAt),
        flashcards: createdFlashcards.map((fc) => ({
          id: fc.id.toString(),
          question: fc.question,
          answer: fc.answer,
          category: fc.category,
          difficulty: fc.difficulty,
          codeTemplate: fc.codeTemplate,
        })),
      });
    }

    return NextResponse.json({ folders: createdFolders });
  } catch (error) {
    console.error("Error initializing folders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
