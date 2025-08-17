CREATE TABLE "roadmap_study_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roadmap_study_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"user_roadmap_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"session_type" text DEFAULT 'study' NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"problems_attempted" integer DEFAULT 0 NOT NULL,
	"problems_completed" integer DEFAULT 0 NOT NULL,
	"average_score" real,
	"notes" text,
	"mood" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_templates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roadmap_templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"total_estimated_time" integer,
	"difficulty_level" text DEFAULT 'Beginner' NOT NULL,
	"tags" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_topics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roadmap_topics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"template_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text DEFAULT 'Beginner' NOT NULL,
	"estimated_time_hours" integer DEFAULT 8 NOT NULL,
	"order_index" integer NOT NULL,
	"subtopics" json DEFAULT '[]'::json,
	"practice_problems_count" integer DEFAULT 0 NOT NULL,
	"key_learning_points" json DEFAULT '[]'::json,
	"prerequisite_topic_ids" json DEFAULT '[]'::json,
	"linked_folder_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roadmaps" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_roadmaps_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"template_id" integer NOT NULL,
	"is_customized" boolean DEFAULT false NOT NULL,
	"custom_name" text,
	"custom_description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"target_completion_date" timestamp,
	"total_time_spent" integer DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_topic_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_topic_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"user_roadmap_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"status" text DEFAULT 'locked' NOT NULL,
	"progress_percentage" real DEFAULT 0 NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_studied_at" timestamp,
	"user_notes" text,
	"is_bookmarked" boolean DEFAULT false NOT NULL,
	"practice_problems_completed" integer DEFAULT 0 NOT NULL,
	"average_score" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roadmap_study_sessions" ADD CONSTRAINT "roadmap_study_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_study_sessions" ADD CONSTRAINT "roadmap_study_sessions_user_roadmap_id_user_roadmaps_id_fk" FOREIGN KEY ("user_roadmap_id") REFERENCES "public"."user_roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_study_sessions" ADD CONSTRAINT "roadmap_study_sessions_topic_id_roadmap_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."roadmap_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_topics" ADD CONSTRAINT "roadmap_topics_template_id_roadmap_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."roadmap_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_topics" ADD CONSTRAINT "roadmap_topics_linked_folder_id_flashcard_folders_id_fk" FOREIGN KEY ("linked_folder_id") REFERENCES "public"."flashcard_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_template_id_roadmap_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."roadmap_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_user_roadmap_id_user_roadmaps_id_fk" FOREIGN KEY ("user_roadmap_id") REFERENCES "public"."user_roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_topic_id_roadmap_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."roadmap_topics"("id") ON DELETE cascade ON UPDATE no action;