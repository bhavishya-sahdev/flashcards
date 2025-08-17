import { auth } from "@/lib/auth";
import { db } from "@/db";
import { quizSessions } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizResultId: string }> }
) {
  try {
    const { quizResultId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get detailed quiz result
    const [quizResult] = await db
      .select()
      .from(quizSessions)
      .where(
        and(
          eq(quizSessions.id, parseInt(quizResultId)),
          eq(quizSessions.ownerId, session.user.id)
        )
      );

    if (!quizResult) {
      return NextResponse.json(
        { error: "Quiz result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quizResult,
    });
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz details" },
      { status: 500 }
    );
  }
}