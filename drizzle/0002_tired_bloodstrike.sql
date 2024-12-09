ALTER TABLE "justblue_post_media" ALTER COLUMN "media_size" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "justblue_post_media" ADD COLUMN "file_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "justblue_post_media" ADD COLUMN "file_key" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "justblue_post_media" DROP COLUMN IF EXISTS "media_width";--> statement-breakpoint
ALTER TABLE "justblue_post_media" DROP COLUMN IF EXISTS "media_height";