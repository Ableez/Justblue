DO $$ BEGIN
 CREATE TYPE "public"."account_type" AS ENUM('public', 'private');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."media_type" AS ENUM('image', 'video');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."post_type" AS ENUM('text', 'carousel');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."post_visibility" AS ENUM('public', 'followers', 'close_friends');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "justblue_comment_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"reply_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "justblue_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_reply" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "justblue_favorites" (
	"user_id" varchar NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "justblue_favorites_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "justblue_follows" (
	"follower_id" varchar NOT NULL,
	"followed_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "justblue_follows_follower_id_followed_id_pk" PRIMARY KEY("follower_id","followed_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "justblue_likes" (
	"user_id" varchar NOT NULL,
	"entity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "justblue_likes_user_id_entity_id_pk" PRIMARY KEY("user_id","entity_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "justblue_post_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"media_url" varchar(255) NOT NULL,
	"media_type" "media_type" NOT NULL,
	"media_order" integer DEFAULT 0,
	"media_size" integer DEFAULT 0 NOT NULL,
	"file_hash" varchar NOT NULL,
	"file_key" varchar NOT NULL,
	"file_type" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "justblue_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text,
	"visibility" "post_visibility" DEFAULT 'public',
	"post_type" "post_type" DEFAULT 'text',
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "justblue_users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" varchar,
	"username" varchar(255),
	"display_name" varchar(255),
	"bio" text,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image_url" varchar(255),
	"profile_image_url" varchar(255),
	"birthday" timestamp,
	"gender" varchar(50),
	"password_enabled" boolean DEFAULT true NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"external_id" varchar(255),
	"last_sign_in_at" timestamp,
	"disabled" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "justblue_users_username_unique" UNIQUE("username"),
	CONSTRAINT "justblue_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_comment_replies" ADD CONSTRAINT "justblue_comment_replies_comment_id_justblue_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."justblue_comments"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_comment_replies" ADD CONSTRAINT "justblue_comment_replies_reply_id_justblue_comments_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."justblue_comments"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_comment_replies" ADD CONSTRAINT "justblue_comment_replies_user_id_justblue_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."justblue_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_comments" ADD CONSTRAINT "justblue_comments_post_id_justblue_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."justblue_posts"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_comments" ADD CONSTRAINT "justblue_comments_user_id_justblue_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."justblue_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_favorites" ADD CONSTRAINT "justblue_favorites_user_id_justblue_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."justblue_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_favorites" ADD CONSTRAINT "justblue_favorites_post_id_justblue_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."justblue_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_follows" ADD CONSTRAINT "justblue_follows_follower_id_justblue_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."justblue_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_follows" ADD CONSTRAINT "justblue_follows_followed_id_justblue_users_id_fk" FOREIGN KEY ("followed_id") REFERENCES "public"."justblue_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_likes" ADD CONSTRAINT "justblue_likes_user_id_justblue_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."justblue_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_likes" ADD CONSTRAINT "justblue_likes_entity_id_justblue_posts_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."justblue_posts"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_post_media" ADD CONSTRAINT "justblue_post_media_post_id_justblue_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."justblue_posts"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "justblue_posts" ADD CONSTRAINT "justblue_posts_user_id_justblue_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."justblue_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_replies_comment_id_idx" ON "justblue_comment_replies" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_replies_reply_id_idx" ON "justblue_comment_replies" USING btree ("reply_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_post_id_idx" ON "justblue_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "justblue_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_user_id_idx" ON "justblue_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_post_id_idx" ON "justblue_favorites" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_media_post_id_idx" ON "justblue_post_media" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "justblue_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "justblue_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "justblue_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username_idx" ON "justblue_users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_external_id_idx" ON "justblue_users" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_name_search_idx" ON "justblue_users" USING btree ("display_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_users_idx" ON "justblue_users" USING btree ("last_sign_in_at") WHERE disabled = false AND deleted = false;