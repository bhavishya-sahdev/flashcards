import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcards, flashcardFolders } from "@/db/schema/flashcards";
import { eq, inArray, and } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardIds }: { cardIds: string[] } = await request.json();
    
    if (!cardIds || cardIds.length === 0) {
      return NextResponse.json({ error: "No card IDs provided" }, { status: 400 });
    }

    // First, verify that all cards belong to folders owned by the user
    const userCards = await db
      .select({ id: flashcards.id })
      .from(flashcards)
      .innerJoin(flashcardFolders, eq(flashcards.folderId, flashcardFolders.id))
      .where(
        and(
          inArray(flashcards.id, cardIds.map((id: string) => parseInt(id))),
          eq(flashcardFolders.ownerId, session.user.id)
        )
      );

    const authorizedCardIds = userCards.map(card => card.id);
    
    if (authorizedCardIds.length === 0) {
      return NextResponse.json({ error: "No authorized cards found to delete" }, { status: 403 });
    }

    // Delete the authorized flashcards (cascading will handle reviews)
    await db
      .delete(flashcards)
      .where(inArray(flashcards.id, authorizedCardIds));

    return NextResponse.json({ 
      success: true, 
      deletedCount: authorizedCardIds.length,
      message: `Successfully deleted ${authorizedCardIds.length} flashcard${authorizedCardIds.length === 1 ? '' : 's'}`
    });

  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete flashcards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { operation, cardIds, data } = await request.json();
    
    if (!cardIds || cardIds.length === 0) {
      return NextResponse.json({ error: "No card IDs provided" }, { status: 400 });
    }

    switch (operation) {
      case 'duplicate': {
        // Get the original cards with authorization check
        const originalCards = await db
          .select()
          .from(flashcards)
          .innerJoin(flashcardFolders, eq(flashcards.folderId, flashcardFolders.id))
          .where(
            and(
              inArray(flashcards.id, cardIds.map((id: string) => parseInt(id))),
              eq(flashcardFolders.ownerId, session.user.id)
            )
          );

        if (originalCards.length === 0) {
          return NextResponse.json({ error: "No authorized cards found to duplicate" }, { status: 403 });
        }

        // Create duplicates
        const duplicatedCards = originalCards.map(row => ({
          question: `${row.flashcards.question} (Copy)`,
          answer: row.flashcards.answer,
          category: row.flashcards.category,
          difficulty: row.flashcards.difficulty,
          codeTemplate: row.flashcards.codeTemplate,
          folderId: row.flashcards.folderId,
          // Reset spaced repetition data for new cards
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: new Date().toISOString(),
          lastReviewDate: null,
          isLearning: true,
          learningStep: 0,
          totalReviews: 0,
          correctReviews: 0,
          streakCount: 0,
          maxStreak: 0,
          averageResponseTime: null,
        }));

        const newCards = await db
          .insert(flashcards)
          .values(duplicatedCards)
          .returning();

        return NextResponse.json({ 
          success: true, 
          duplicatedCount: newCards.length,
          newCards,
          message: `Successfully duplicated ${newCards.length} flashcard${newCards.length === 1 ? '' : 's'}`
        });
      }

      case 'move': {
        const { targetFolderId } = data;
        
        if (!targetFolderId) {
          return NextResponse.json({ error: "Target folder ID required for move operation" }, { status: 400 });
        }

        // Verify user owns both source cards and target folder
        const userCards = await db
          .select({ id: flashcards.id })
          .from(flashcards)
          .innerJoin(flashcardFolders, eq(flashcards.folderId, flashcardFolders.id))
          .where(
            and(
              inArray(flashcards.id, cardIds.map((id: string) => parseInt(id))),
              eq(flashcardFolders.ownerId, session.user.id)
            )
          );

        const targetFolder = await db
          .select({ id: flashcardFolders.id })
          .from(flashcardFolders)
          .where(
            and(
              eq(flashcardFolders.id, parseInt(targetFolderId)),
              eq(flashcardFolders.ownerId, session.user.id)
            )
          );

        if (userCards.length === 0) {
          return NextResponse.json({ error: "No authorized cards found to move" }, { status: 403 });
        }

        if (targetFolder.length === 0) {
          return NextResponse.json({ error: "Target folder not found or unauthorized" }, { status: 403 });
        }

        const authorizedCardIds = userCards.map(card => card.id);

        await db
          .update(flashcards)
          .set({ 
            folderId: parseInt(targetFolderId),
            updatedAt: new Date().toISOString()
          })
          .where(inArray(flashcards.id, authorizedCardIds));

        return NextResponse.json({ 
          success: true, 
          movedCount: authorizedCardIds.length,
          message: `Successfully moved ${authorizedCardIds.length} flashcard${authorizedCardIds.length === 1 ? '' : 's'}`
        });
      }

      case 'edit': {
        const { updates } = data;
        
        if (!updates) {
          return NextResponse.json({ error: "Updates required for edit operation" }, { status: 400 });
        }

        // Verify user owns the cards
        const userCards = await db
          .select({ id: flashcards.id })
          .from(flashcards)
          .innerJoin(flashcardFolders, eq(flashcards.folderId, flashcardFolders.id))
          .where(
            and(
              inArray(flashcards.id, cardIds.map((id: string) => parseInt(id))),
              eq(flashcardFolders.ownerId, session.user.id)
            )
          );

        if (userCards.length === 0) {
          return NextResponse.json({ error: "No authorized cards found to edit" }, { status: 403 });
        }

        const authorizedCardIds = userCards.map(card => card.id);

        const allowedFields = ['category', 'difficulty'];
        const sanitizedUpdates: any = {
          updatedAt: new Date().toISOString()
        };

        // Only allow specific fields to be updated
        Object.keys(updates).forEach(key => {
          if (allowedFields.includes(key)) {
            sanitizedUpdates[key] = updates[key];
          }
        });

        await db
          .update(flashcards)
          .set(sanitizedUpdates)
          .where(inArray(flashcards.id, authorizedCardIds));

        return NextResponse.json({ 
          success: true, 
          updatedCount: authorizedCardIds.length,
          updates: sanitizedUpdates,
          message: `Successfully updated ${authorizedCardIds.length} flashcard${authorizedCardIds.length === 1 ? '' : 's'}`
        });
      }

      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    }

  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}