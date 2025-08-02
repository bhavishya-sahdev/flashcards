import { auth } from "@/lib/auth";
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { initializeNewCard } from "@/lib/spaced-repetition";

interface GenerateFolderRequest {
  topic: string;
  cardCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  includeCode: boolean;
}

const folderSchema = z.object({
  folder: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
  }),
  flashcards: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    category: z.string(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    codeTemplate: z.string().optional(),
  }))
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, cardCount, difficulty, includeCode }: GenerateFolderRequest =
      await request.json();

    if (!topic?.trim() || !cardCount || cardCount < 3 || cardCount > 20) {
      return NextResponse.json(
        { error: "Topic is required and card count must be between 3-20" },
        { status: 400 }
      );
    }

    // Generate folder and flashcards using AI
    const generated = await generateFolderWithAI({
      topic,
      cardCount,
      difficulty,
      includeCode,
    });

    // Create the folder
    const [newFolder] = await db
      .insert(flashcardFolders)
      .values({
        name: generated.folder.name,
        description: generated.folder.description,
        ownerId: session.user.id,
      })
      .returning();

    // Create all flashcards for the folder
    const flashcardData = generated.flashcards.map((card) => ({
      question: card.question,
      answer: card.answer,
      category: card.category,
      difficulty: card.difficulty,
      codeTemplate: card.codeTemplate || getDefaultCodeTemplate(),
      folderId: newFolder.id,
      // Initialize spaced repetition fields
      ...initializeNewCard(),
    }));

    await db.insert(flashcards).values(flashcardData);

    return NextResponse.json({
      folder: {
        id: newFolder.id,
        name: newFolder.name,
        description: newFolder.description,
        flashcardCount: generated.flashcards.length,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error generating folder:", error);
    return NextResponse.json(
      { error: "Failed to generate folder" },
      { status: 500 }
    );
  }
}

async function generateFolderWithAI({
  topic,
  cardCount,
  difficulty,
  includeCode,
}: {
  topic: string;
  cardCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  includeCode: boolean;
}): Promise<{
  folder: { name: string; description: string };
  flashcards: Array<{
    question: string;
    answer: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
    codeTemplate?: string;
  }>;
}> {
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
      prompt: `Create a comprehensive study folder about "${topic}" with ${cardCount} flashcards at ${difficulty} difficulty level.

${difficultyInstruction}
${codeInstruction}

Guidelines for the folder:
- Create a clear, descriptive folder name (not just the topic)
- Write an engaging description that explains what the learner will master
- Generate ${cardCount} diverse flashcards that cover different aspects of the topic
- Questions should be clear and specific
- Answers should be comprehensive but concise
- Include time/space complexity for algorithms when relevant
- For code templates, provide meaningful examples or starting points
- Ensure questions test understanding, not just memorization
- Cover different subtopics within the main topic for comprehensive learning

Topic: ${topic}
Card Count: ${cardCount}
Difficulty: ${difficulty}
Include Code: ${includeCode}`,
      schema: folderSchema,
    });

    return {
      folder: result.object.folder,
      flashcards: result.object.flashcards.map((card) => ({
        question: card.question,
        answer: card.answer,
        category: card.category || topic,
        difficulty: card.difficulty,
        codeTemplate: card.codeTemplate || (includeCode ? getDefaultCodeTemplate() : getDefaultCodeTemplate()),
      })),
    };
  } catch (error) {
    console.error("AI generation error:", error);
    // Fallback to template-based generation
    return generateFallbackFolder(topic, cardCount, difficulty, includeCode);
  }
}

function generateFallbackFolder(
  topic: string,
  cardCount: number,
  difficulty: "Easy" | "Medium" | "Hard",
  includeCode: boolean
): {
  folder: { name: string; description: string };
  flashcards: Array<{
    question: string;
    answer: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
    codeTemplate?: string;
  }>;
} {
  const folder = {
    name: `${topic} Study Guide`,
    description: `A comprehensive collection of ${cardCount} flashcards covering key concepts in ${topic}. Perfect for mastering the fundamentals and testing your knowledge.`,
  };

  const flashcards = [];
  for (let i = 0; i < cardCount; i++) {
    flashcards.push({
      question: `What is a key concept in ${topic}? (Question ${i + 1})`,
      answer: `This is a generated answer about ${topic}. The specific details would depend on the context and application of this topic in software engineering.`,
      category: topic,
      difficulty,
      codeTemplate: includeCode ? getDefaultCodeTemplate() : getDefaultCodeTemplate(),
    });
  }

  return { folder, flashcards };
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