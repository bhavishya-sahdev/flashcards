import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders } from "@/db/schema/flashcards";
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

    const { name, description } = await request.json();
    const folderId = parseInt(id);

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const [updatedFolder] = await db
      .update(flashcardFolders)
      .set({
        name: name.trim(),
        description: description?.trim() || "",
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(flashcardFolders.id, folderId),
          eq(flashcardFolders.ownerId, session.user.id)
        )
      )
      .returning();

    if (!updatedFolder) {
      return NextResponse.json(
        { error: "Folder not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      folder: {
        id: updatedFolder.id.toString(),
        name: updatedFolder.name,
        description: updatedFolder.description,
        createdAt: new Date(updatedFolder.createdAt),
      },
    });
  } catch (error) {
    console.error("Error updating folder:", error);
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

    const folderId = parseInt(id);

    // Check if user owns the folder and if it's not their last folder
    const userFolders = await db
      .select({ id: flashcardFolders.id })
      .from(flashcardFolders)
      .where(eq(flashcardFolders.ownerId, session.user.id));

    if (userFolders.length <= 1) {
      return NextResponse.json(
        { error: "Cannot delete your last folder" },
        { status: 400 }
      );
    }

    const deletedFolder = await db
      .delete(flashcardFolders)
      .where(
        and(
          eq(flashcardFolders.id, folderId),
          eq(flashcardFolders.ownerId, session.user.id)
        )
      )
      .returning();

    if (!deletedFolder.length) {
      return NextResponse.json(
        { error: "Folder not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
