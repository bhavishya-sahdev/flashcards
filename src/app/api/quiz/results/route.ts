import { auth } from "@/lib/auth";
import { db } from "@/db";
import { quizSessions } from "@/db/schema/flashcards";
import { NextRequest, NextResponse } from "next/server";

interface SaveQuizResultRequest {
  quizId: string;
  folderId: number;
  title: string;
  description?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  questions: any[];
  answers: any[];
  startedAt: string;
  completedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      quizId,
      folderId,
      title,
      description,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      questions,
      answers,
      startedAt,
      completedAt,
    }: SaveQuizResultRequest = await request.json();

    // Validate required fields
    if (!quizId || !folderId || !title || score === undefined || !totalQuestions || !correctAnswers === undefined || !timeSpent || !questions || !answers || !startedAt || !completedAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save quiz result to database
    const [quizResult] = await db
      .insert(quizSessions)
      .values({
        ownerId: session.user.id,
        folderId,
        quizId,
        title,
        description: description || "",
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        questions,
        answers,
        startedAt,
        completedAt,
      })
      .returning();

    return NextResponse.json({
      success: true,
      quizResultId: quizResult.id,
      message: "Quiz result saved successfully",
    });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json(
      { error: "Failed to save quiz result" },
      { status: 500 }
    );
  }
}