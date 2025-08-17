import { db } from "@/db";
import { sql } from "drizzle-orm";

async function createQuizTable() {
  try {
    console.log("Checking if quiz_sessions table exists...");
    
    // Check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_sessions'
      );
    `);
    
    console.log("Table exists check result:", tableExists.rows[0]);
    
    if (!tableExists.rows[0]?.exists) {
      console.log("Creating quiz_sessions table...");
      
      // Create the table
      await db.execute(sql`
        CREATE TABLE "quiz_sessions" (
          "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quiz_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
          "owner_id" text NOT NULL,
          "folder_id" integer NOT NULL,
          "quiz_id" text NOT NULL,
          "title" text NOT NULL,
          "description" text,
          "score" integer NOT NULL,
          "total_questions" integer NOT NULL,
          "correct_answers" integer NOT NULL,
          "time_spent" integer NOT NULL,
          "questions" json NOT NULL,
          "answers" json NOT NULL,
          "started_at" timestamp NOT NULL,
          "completed_at" timestamp NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      console.log("Adding foreign key constraints...");
      
      // Add foreign key constraints
      await db.execute(sql`
        ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_owner_id_user_id_fk" 
        FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
      `);
      
      await db.execute(sql`
        ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_folder_id_flashcard_folders_id_fk" 
        FOREIGN KEY ("folder_id") REFERENCES "public"."flashcard_folders"("id") ON DELETE cascade ON UPDATE no action;
      `);
      
      console.log("✅ quiz_sessions table created successfully!");
    } else {
      console.log("✅ quiz_sessions table already exists!");
    }
    
  } catch (error) {
    console.error("❌ Error creating quiz_sessions table:", error);
    throw error;
  }
}

// Run the script
createQuizTable()
  .then(() => {
    console.log("Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });