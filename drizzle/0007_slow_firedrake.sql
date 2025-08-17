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
--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_folder_id_flashcard_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."flashcard_folders"("id") ON DELETE cascade ON UPDATE no action;