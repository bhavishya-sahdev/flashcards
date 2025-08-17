import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

interface GenerateFillBlankRequest {
  questionCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  includeHints: boolean;
  blankType: "single" | "multiple";
}

const fillBlankSchema = z.object({
  questions: z.array(
    z.object({
      text: z.string().min(1),
      blanks: z.array(
        z.object({
          answer: z.string().min(1),
          position: z.number(),
          hint: z.string().optional(),
          alternatives: z.array(z.string()).optional(),
        })
      ),
      category: z.string(),
      difficulty: z.enum(["Easy", "Medium", "Hard"]),
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

    const { questionCount, difficulty, includeHints, blankType }: GenerateFillBlankRequest = await request.json();

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

    // Generate fill-in-the-blank quiz using AI
    const generatedQuiz = await generateFillBlankWithAI({
      folderName: folder.name,
      folderDescription: folder.description || "",
      flashcards: flashcardsData,
      questionCount,
      difficulty,
      includeHints,
      blankType,
    });

    return NextResponse.json({
      quiz: {
        title: `${folder.name} - Fill in the Blanks`,
        description: `Fill-in-the-blank quiz generated from ${folder.name} folder`,
        questionCount: generatedQuiz.questions.length,
        difficulty,
        blankType,
        questions: generatedQuiz.questions,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error generating fill-in-the-blank quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate fill-in-the-blank quiz" },
      { status: 500 }
    );
  }
}

async function generateFillBlankWithAI({
  folderName,
  folderDescription,
  flashcards,
  questionCount,
  difficulty,
  includeHints,
  blankType,
}: {
  folderName: string;
  folderDescription: string;
  flashcards: any[];
  questionCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  includeHints: boolean;
  blankType: "single" | "multiple";
}) {
  const flashcardsContent = flashcards
    .map((card, index) => `${index + 1}. Q: ${card.question}\n   A: ${card.answer}`)
    .join("\n\n");

  const difficultyInstruction = {
    Easy: "Create straightforward fill-in-the-blank questions with obvious key terms missing.",
    Medium: "Create questions with moderately challenging blanks that require understanding of concepts.",
    Hard: "Create complex questions with multiple blanks or challenging technical terms.",
  }[difficulty];

  const blankTypeInstruction = blankType === "single"
    ? "Each question should have only one blank to fill in."
    : "Questions can have multiple blanks (2-4 blanks per question) to test comprehensive understanding.";

  const hintInstruction = includeHints
    ? "Provide helpful hints for each blank that guide the learner without giving away the answer."
    : "Focus on clear context clues within the sentence itself.";

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Create ${questionCount} fill-in-the-blank questions based on the flashcards from "${folderName}".

Folder Description: ${folderDescription}

Flashcards Content:
${flashcardsContent}

Requirements:
- ${difficultyInstruction}
- ${blankTypeInstruction}
- ${hintInstruction}
- Use "______" (6 underscores) as placeholder for blanks in the text
- The 'position' field should indicate the order of blanks (0-indexed)
- Include alternative acceptable answers when appropriate
- Questions should test key concepts and terminology
- Blanks should be for important words/phrases, not trivial articles or prepositions
- Context should provide enough clues for educated guessing

Format Guidelines:
- 'text' should contain the sentence with "______" where blanks go
- 'blanks' array should have one object per blank with:
  - 'answer': the primary correct answer
  - 'position': numerical order of this blank (0 for first blank, 1 for second, etc.)
  - 'hint': optional hint text (if includeHints is true)
  - 'alternatives': array of other acceptable answers (synonyms, abbreviations, etc.)

Example format:
"The ______ algorithm has a time complexity of ______."
blanks: [
  {answer: "quicksort", position: 0, hint: "A divide-and-conquer sorting algorithm"},
  {answer: "O(n log n)", position: 1, alternatives: ["O(nlogn)", "n log n"]}
]

Difficulty Level: ${difficulty}
Question Count: ${questionCount}
Blank Type: ${blankType}
Include Hints: ${includeHints}`,
      schema: fillBlankSchema,
    });

    return result.object;
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate fill-in-the-blank quiz with AI");
  }
}