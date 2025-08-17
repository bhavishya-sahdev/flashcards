import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Checking if notifications tables exist...");
    
    // Check if notifications table exists
    const notificationsTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);
    
    console.log("Notifications table exists check result:", notificationsTableExists.rows[0]);
    
    // Check if notification_preferences table exists
    const preferencesTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notification_preferences'
      );
    `);
    
    console.log("Notification preferences table exists check result:", preferencesTableExists.rows[0]);
    
    let created = false;
    
    if (!notificationsTableExists.rows[0]?.exists) {
      console.log("Creating notifications table...");
      
      // Create the notifications table
      await db.execute(sql`
        CREATE TABLE "notifications" (
          "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
          "user_id" text NOT NULL,
          "type" text NOT NULL,
          "title" text NOT NULL,
          "message" text NOT NULL,
          "read" boolean DEFAULT false NOT NULL,
          "action_url" text,
          "metadata" jsonb,
          "priority" text DEFAULT 'normal' NOT NULL,
          "category" text DEFAULT 'general' NOT NULL,
          "expires_at" timestamp,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      console.log("Adding foreign key constraint for notifications...");
      
      try {
        await db.execute(sql`
          ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" 
          FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
        `);
      } catch (error) {
        console.log("Notifications FK constraint may already exist:", error);
      }
      
      created = true;
    }
    
    if (!preferencesTableExists.rows[0]?.exists) {
      console.log("Creating notification_preferences table...");
      
      // Create the notification_preferences table
      await db.execute(sql`
        CREATE TABLE "notification_preferences" (
          "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notification_preferences_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
          "user_id" text NOT NULL UNIQUE,
          "study_reminders_enabled" boolean DEFAULT true NOT NULL,
          "daily_reminder_time" text DEFAULT '09:00',
          "weekend_reminders" boolean DEFAULT false NOT NULL,
          "achievement_notifications" boolean DEFAULT true NOT NULL,
          "streak_notifications" boolean DEFAULT true NOT NULL,
          "due_cards_notifications" boolean DEFAULT true NOT NULL,
          "due_cards_threshold" integer DEFAULT 5 NOT NULL,
          "system_notifications" boolean DEFAULT true NOT NULL,
          "email_notifications" boolean DEFAULT false NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      console.log("Adding foreign key constraint for notification_preferences...");
      
      try {
        await db.execute(sql`
          ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_user_id_fk" 
          FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
        `);
      } catch (error) {
        console.log("Notification preferences FK constraint may already exist:", error);
      }
      
      created = true;
    }
    
    if (created) {
      return NextResponse.json({
        success: true,
        message: "Notification tables created successfully!",
        created: true
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Notification tables already exist!",
        created: false
      });
    }
    
  } catch (error) {
    console.error("Error creating notification tables:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create notification tables",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}