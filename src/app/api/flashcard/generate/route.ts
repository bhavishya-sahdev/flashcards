import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders } from "@/db/schema/flashcards";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

interface GenerateFlashcardsRequest {
  topic: string;
  count: number;
  difficulty: "Easy" | "Medium" | "Hard";
  includeCode: boolean;
  folderId: string;
}

interface GeneratedFlashcard {
  question: string;
  answer: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  codeTemplate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, count, difficulty, includeCode, folderId }: GenerateFlashcardsRequest =
      await request.json();

    if (!topic?.trim() || !count || count < 1 || count > 10) {
      return NextResponse.json(
        { error: "Topic is required and count must be between 1-10" },
        { status: 400 }
      );
    }

    // Verify user owns the folder
    const folder = await db
      .select({ id: flashcardFolders.id })
      .from(flashcardFolders)
      .where(
        and(
          eq(flashcardFolders.id, parseInt(folderId)),
          eq(flashcardFolders.ownerId, session.user.id)
        )
      );

    if (!folder.length) {
      return NextResponse.json(
        { error: "Folder not found or unauthorized" },
        { status: 404 }
      );
    }

    // Generate flashcards using AI
    const generatedCards = await generateFlashcardsWithAI({
      topic,
      count,
      difficulty,
      includeCode,
    });

    return NextResponse.json({
      flashcards: generatedCards,
      success: true,
    });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}

const flashcardSchema = z.object({
  flashcards: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    category: z.string(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    codeTemplate: z.string().optional(),
  }))
});

async function generateFlashcardsWithAI({
  topic,
  count,
  difficulty,
  includeCode,
}: {
  topic: string;
  count: number;
  difficulty: "Easy" | "Medium" | "Hard";
  includeCode: boolean;
}): Promise<GeneratedFlashcard[]> {
  const codeInstruction = includeCode
    ? "Include relevant code examples, templates, or implementations where appropriate."
    : "Focus on conceptual questions without code examples.";

  const difficultyInstruction = {
    Easy: "Create beginner-friendly questions that test basic understanding.",
    Medium: "Create intermediate questions that require some problem-solving.",
    Hard: "Create advanced questions that test deep understanding and complex scenarios.",
  }[difficulty];

  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      prompt: `Generate ${count} flashcard(s) about "${topic}" with ${difficulty} difficulty level.

${difficultyInstruction}
${codeInstruction}

Guidelines:
- Questions should be clear and specific
- Answers should be comprehensive but concise
- Include time/space complexity for algorithms when relevant
- For code templates, provide meaningful examples or starting points
- Ensure questions test understanding, not just memorization
- Make each flashcard unique and valuable for learning

Topic: ${topic}
Count: ${count}
Difficulty: ${difficulty}
Include Code: ${includeCode}`,
      schema: flashcardSchema,
    });

    return result.object.flashcards.map((card) => ({
      question: card.question,
      answer: card.answer,
      category: card.category || topic,
      difficulty: card.difficulty,
      codeTemplate: card.codeTemplate || (includeCode ? getDefaultCodeTemplate() : getDefaultCodeTemplate()),
    }));
  } catch (error) {
    console.error("AI generation error:", error);
    // Fallback to template-based generation
    return generateFallbackFlashcards(topic, count, difficulty, includeCode);
  }
}

function generateFallbackFlashcards(
  topic: string,
  count: number,
  difficulty: "Easy" | "Medium" | "Hard",
  includeCode: boolean
): GeneratedFlashcard[] {
  const fallbackCards: GeneratedFlashcard[] = [];

  for (let i = 0; i < count; i++) {
    fallbackCards.push({
      question: `What is a key concept in ${topic}? (Question ${i + 1})`,
      answer: `This is a generated answer about ${topic}. The specific details would depend on the context and application of this topic in software engineering.`,
      category: topic,
      difficulty,
      codeTemplate: includeCode ? getDefaultCodeTemplate() : getDefaultCodeTemplate(),
    });
  }

  return fallbackCards;
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