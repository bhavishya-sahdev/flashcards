CREATE TABLE IF NOT EXISTS "posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"description" varchar,
	"slug" varchar,
	"title" varchar(256),
	"author" varchar DEFAULT 'Bhavishya Sahdev',
	"keywords" varchar[] DEFAULT '{}'::text[],
	"category" varchar,
	"tags" varchar[] DEFAULT '{}'::text[],
	"content" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "slug_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "title_idx" ON "posts" USING btree ("title");