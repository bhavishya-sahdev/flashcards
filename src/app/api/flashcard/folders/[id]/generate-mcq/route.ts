import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

interface GenerateMCQRequest {
  questionCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  includeExplanations: boolean;
}

const mcqSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
      explanation: z.string().optional(),
      category: z.string(),
      difficulty: z.enum(["Easy", "Medium", "Hard"]),
    })
  ),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionCount, difficulty, includeExplanations }: GenerateMCQRequest = await request.json();

    if (!questionCount || questionCount < 1 || questionCount > 10) {
      return NextResponse.json(
        { error: "Question count must be between 1-10" },
        { status: 400 }
      );
    }

    // Verify user owns the folder and get folder with flashcards
    const folderWithCards = await db
      .select({
        folder: flashcardFolders,
        flashcard: flashcards,
      })
      .from(flashcardFolders)
      .leftJoin(flashcards, eq(flashcards.folderId, flashcardFolders.id))
      .where(
        and(
          eq(flashcardFolders.id, parseInt(id)),
          eq(flashcardFolders.ownerId, session.user.id)
        )
      );

    if (!folderWithCards.length) {
      return NextResponse.json(
        { error: "Folder not found or unauthorized" },
        { status: 404 }
      );
    }

    const folder = folderWithCards[0].folder;
    const flashcardsData = folderWithCards
      .filter(item => item.flashcard)
      .map(item => item.flashcard!);

    if (flashcardsData.length === 0) {
      return NextResponse.json(
        { error: "No flashcards found in this folder" },
        { status: 400 }
      );
    }

    // Generate MCQ quiz using AI
    const generatedQuiz = await generateMCQWithAI({
      folderName: folder.name,
      folderDescription: folder.description || "",
      flashcards: flashcardsData,
      questionCount,
      difficulty,
      includeExplanations,
    });

    return NextResponse.json({
      quiz: {
        title: `${folder.name} - MCQ Quiz`,
        description: `Multiple choice quiz generated from ${folder.name} folder`,
        questionCount: generatedQuiz.questions.length,
        difficulty,
        questions: generatedQuiz.questions,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error generating MCQ quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate MCQ quiz" },
      { status: 500 }
    );
  }
}

async function generateMCQWithAI({
  folderName,
  folderDescription,
  flashcards,
  questionCount,
  difficulty,
  includeExplanations,
}: {
  folderName: string;
  folderDescription: string;
  flashcards: any[];
  questionCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  includeExplanations: boolean;
}) {
  const flashcardsContent = flashcards
    .map((card, index) => `${index + 1}. Q: ${card.question}\n   A: ${card.answer}`)
    .join("\n\n");

  const difficultyInstruction = {
    Easy: "Create straightforward questions that test basic recall and understanding.",
    Medium: "Create questions that require some analysis and application of concepts.",
    Hard: "Create challenging questions that test deep understanding and critical thinking.",
  }[difficulty];

  const explanationInstruction = includeExplanations
    ? "Include detailed explanations for each answer that help reinforce learning."
    : "Focus on clear, concise questions without detailed explanations.";

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Create ${questionCount} multiple choice questions based on the flashcards from "${folderName}".

Folder Description: ${folderDescription}

Flashcards Content:
${flashcardsContent}

Requirements:
- ${difficultyInstruction}
- ${explanationInstruction}
- Each question should have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Questions should cover different concepts from the flashcards
- Avoid questions that are too similar to each other
- Make incorrect options plausible but clearly wrong
- Questions should test understanding, not just memorization
- Use clear, unambiguous language

Guidelines:
- correctAnswer should be the index (0-3) of the correct option
- Options should be in a logical order when possible
- Avoid "All of the above" or "None of the above" options
- Make sure questions are independent of each other

Difficulty Level: ${difficulty}
Question Count: ${questionCount}
Include Explanations: ${includeExplanations}`,
      schema: mcqSchema,
    });

    return result.object;
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate MCQ quiz with AI");
  }
}