import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
      
      try {
        // Add foreign key constraints (these might fail if constraints already exist)
        await db.execute(sql`
          ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_owner_id_user_id_fk" 
          FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
        `);
      } catch (error) {
        console.log("Owner FK constraint may already exist:", error);
      }
      
      try {
        await db.execute(sql`
          ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_folder_id_flashcard_folders_id_fk" 
          FOREIGN KEY ("folder_id") REFERENCES "public"."flashcard_folders"("id") ON DELETE cascade ON UPDATE no action;
        `);
      } catch (error) {
        console.log("Folder FK constraint may already exist:", error);
      }
      
      return NextResponse.json({
        success: true,
        message: "quiz_sessions table created successfully!",
        created: true
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "quiz_sessions table already exists!",
        created: false
      });
    }
    
  } catch (error) {
    console.error("Error creating quiz_sessions table:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create quiz_sessions table",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}