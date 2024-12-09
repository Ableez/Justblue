DO $$ BEGIN
 CREATE TYPE "public"."post_type" AS ENUM('text', 'carousel');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "justblue_post_media" ADD COLUMN "media_size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "justblue_post_media" ADD COLUMN "media_width" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "justblue_post_media" ADD COLUMN "media_height" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "justblue_posts" ADD COLUMN "post_type" "post_type" DEFAULT 'text';--> statement-breakpoint
ALTER TABLE "justblue_posts" DROP COLUMN IF EXISTS "location_latitude";--> statement-breakpoint
ALTER TABLE "justblue_posts" DROP COLUMN IF EXISTS "location_longitude";--> statement-breakpoint
ALTER TABLE "justblue_posts" DROP COLUMN IF EXISTS "location_name";