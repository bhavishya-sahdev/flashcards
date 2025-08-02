// scripts/seed.ts
import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema/flashcards";
import { user } from "@/db/schema/user";
import { defaultFolders } from "@/lib/Flashcards";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create a demo user (optional - remove if you don't want demo data)
    const [demoUser] = await db
      .insert(user)
      .values({
        id: "demo-user-id",
        name: "Demo User",
        email: "demo@example.com",
        emailVerified: true,
      })
      .onConflictDoNothing()
      .returning();

    if (demoUser) {
      console.log("📝 Created demo user");

      // Create default folders for demo user
      for (const defaultFolder of defaultFolders) {
        const [newFolder] = await db
          .insert(flashcardFolders)
          .values({
            ownerId: demoUser.id,
            name: defaultFolder.name,
            description: defaultFolder.description,
          })
          .returning();

        console.log(`📁 Created folder: ${newFolder.name}`);

        // Create flashcards for this folder
        const flashcardData = defaultFolder.flashcards.map((flashcard) => ({
          question: flashcard.question,
          answer: flashcard.answer,
          category: flashcard.category,
          difficulty: flashcard.difficulty,
          codeTemplate: flashcard.codeTemplate,
          folderId: newFolder.id,
        }));

        const createdFlashcards = await db
          .insert(flashcards)
          .values(flashcardData)
          .returning();

        console.log(
          `💡 Created ${createdFlashcards.length} flashcards for ${newFolder.name}`
        );
      }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
