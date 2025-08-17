import { auth } from "@/lib/auth";
import { db } from "@/db";
import { quizSessions } from "@/db/schema/flashcards";
import { eq, and, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get quiz history for the folder
    const quizHistory = await db
      .select({
        id: quizSessions.id,
        quizId: quizSessions.quizId,
        title: quizSessions.title,
        description: quizSessions.description,
        score: quizSessions.score,
        totalQuestions: quizSessions.totalQuestions,
        correctAnswers: quizSessions.correctAnswers,
        timeSpent: quizSessions.timeSpent,
        startedAt: quizSessions.startedAt,
        completedAt: quizSessions.completedAt,
        createdAt: quizSessions.createdAt,
      })
      .from(quizSessions)
      .where(
        and(
          eq(quizSessions.folderId, parseInt(folderId)),
          eq(quizSessions.ownerId, session.user.id)
        )
      )
      .orderBy(desc(quizSessions.completedAt));

    // Calculate statistics
    const stats = {
      totalQuizzes: quizHistory.length,
      averageScore: quizHistory.length > 0 
        ? Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / quizHistory.length)
        : 0,
      bestScore: quizHistory.length > 0 
        ? Math.max(...quizHistory.map(quiz => quiz.score))
        : 0,
      totalTimeSpent: quizHistory.reduce((sum, quiz) => sum + quiz.timeSpent, 0),
      recentQuizzes: quizHistory.slice(0, 5),
    };

    return NextResponse.json({
      success: true,
      quizHistory,
      stats,
    });
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz history" },
      { status: 500 }
    );
  }
}