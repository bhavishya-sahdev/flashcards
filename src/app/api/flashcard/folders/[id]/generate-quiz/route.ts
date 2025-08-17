import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

interface GenerateMixedQuizRequest {
  questionCount: number;
}

const mixedQuizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["mcq", "fill_blank"]),
      question: z.string().min(1),
      difficulty: z.enum(["Easy", "Medium", "Hard"]),
      category: z.string(),
      // MCQ specific fields
      options: z.array(z.string()).optional(),
      correctAnswer: z.number().optional(),
      // Fill-in-the-blank specific fields
      text: z.string().optional(),
      blanks: z.array(
        z.object({
          answer: z.string().min(1),
          position: z.number(),
          hint: z.string().optional(),
          alternatives: z.array(z.string()).optional(),
        })
      ).optional(),
      // Common fields
      explanation: z.string().optional(),
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

    const { questionCount }: GenerateMixedQuizRequest = await request.json();

    if (!questionCount || questionCount < 1 || questionCount > 15) {
      return NextResponse.json(
        { error: "Question count must be between 1-15" },
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

    // Generate mixed quiz using AI
    const generatedQuiz = await generateMixedQuizWithAI({
      folderName: folder.name,
      folderDescription: folder.description || "",
      flashcards: flashcardsData,
      questionCount,
    });

    return NextResponse.json({
      quiz: {
        id: `quiz-${Date.now()}`,
        title: `${folder.name} - Mixed Quiz`,
        description: `Interactive quiz with ${generatedQuiz.questions.length} mixed questions from ${folder.name}`,
        folderId: folder.id,
        folderName: folder.name,
        questionCount: generatedQuiz.questions.length,
        questions: generatedQuiz.questions,
        createdAt: new Date().toISOString(),
      },
      success: true,
    });
  } catch (error) {
    console.error("Error generating mixed quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

async function generateMixedQuizWithAI({
  folderName,
  folderDescription,
  flashcards,
  questionCount,
}: {
  folderName: string;
  folderDescription: string;
  flashcards: any[];
  questionCount: number;
}) {
  const flashcardsContent = flashcards
    .map((card, index) => `${index + 1}. Q: ${card.question}\n   A: ${card.answer}`)
    .join("\n\n");

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Create ${questionCount} mixed quiz questions based on the flashcards from "${folderName}".

Folder Description: ${folderDescription}

Flashcards Content:
${flashcardsContent}

Requirements:
- Generate a mix of multiple choice (MCQ) and fill-in-the-blank questions
- Aim for roughly 60% MCQ and 40% fill-in-the-blank questions
- Mix difficulty levels (Easy, Medium, Hard) naturally based on content complexity
- Each question should have a unique ID for tracking

MCQ Questions should have:
- Exactly 4 options (A, B, C, D)
- One correct answer (index 0-3)
- Plausible but clearly incorrect distractors
- Optional explanation

Fill-in-the-blank Questions should have:
- Text with "______" (6 underscores) as placeholders
- 1-3 blanks per question depending on complexity
- Position numbers starting from 0
- Optional hints that guide without giving away answers
- Alternative acceptable answers when appropriate

Guidelines:
- Questions should test understanding, not just memorization
- Cover different concepts from the flashcards
- Make questions independent of each other
- Use clear, unambiguous language
- Ensure good variety in question types and difficulty
- For type field: use "mcq" for multiple choice, "fill_blank" for fill-in-the-blank

Question Count: ${questionCount}`,
      schema: mixedQuizSchema,
    });

    // Add unique IDs and validate structure
    const questionsWithIds = result.object.questions.map((question, index) => ({
      ...question,
      id: question.id || `q-${Date.now()}-${index}`,
    }));

    return {
      questions: questionsWithIds,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate mixed quiz with AI");
  }
}