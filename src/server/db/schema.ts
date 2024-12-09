import {
  sql,
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  jsonb,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Create a multi-project table creator
export const createTable = pgTableCreator((name) => `justblue_${name}`);

// Enums for various types
export const accountTypeEnum = pgEnum("account_type", ["public", "private"]);
export const postVisibilityEnum = pgEnum("post_visibility", [
  "public",
  "followers",
  "close_friends",
]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const postTypeEnum = pgEnum("post_type", ["text", "carousel"]);
// =========================================
// Core Tables
// =========================================
export const users = createTable(
  "users",
  {
    id: varchar("id").primaryKey().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deleted: boolean("deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    deletedBy: varchar("deleted_by"),
    username: varchar("username", { length: 255 }).unique(),
    displayName: varchar("display_name", { length: 255 }),
    bio: text("bio"),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    imageUrl: varchar("image_url", { length: 255 }),
    profileImageUrl: varchar("profile_image_url", { length: 255 }),
    birthday: timestamp("birthday"),
    gender: varchar("gender", { length: 50 }),
    passwordEnabled: boolean("password_enabled").notNull().default(true),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    externalId: varchar("external_id", { length: 255 }),
    lastSignInAt: timestamp("last_sign_in_at"),
    disabled: boolean("disabled").notNull().default(false),
    metadata: jsonb("metadata"),
  },
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
    usernameIdx: index("user_username_idx").on(table.username),
    externalIdIdx: index("user_external_id_idx").on(table.externalId),
    nameSearchIdx: index("user_name_search_idx").on(table.displayName),
    activeUsersIdx: index("active_users_idx")
      .on(table.lastSignInAt)
      .where(sql`disabled = false AND deleted = false`),
  }),
);

// Posts Table
export const posts = createTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    content: text("content"),
    visibility: postVisibilityEnum("visibility").default("public"),
    postType: postTypeEnum("post_type").default("text"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  }),
);

// Post Media Table
export const postMedia = createTable(
  "post_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    mediaUrl: varchar("media_url", { length: 255 }).notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    mediaOrder: integer("media_order").default(0),
    mediaSize: integer("media_size").notNull().default(0),
    fileHash: varchar("file_hash").notNull(),
    fileKey: varchar("file_key").notNull(),
    fileType: varchar("file_type", { length: 255 }).notNull(),
  },
  (table) => ({
    postIdIdx: index("post_media_post_id_idx").on(table.postId),
  }),
);

// Likes Table
export const likes = createTable(
  "likes",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.userId, table.entityId] }),
  }),
);

// Comments Table (updated - removed parentCommentId)
export const comments = createTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    postIdIdx: index("comments_post_id_idx").on(table.postId),
    userIdIdx: index("comments_user_id_idx").on(table.userId),
  }),
);

// New Comment Replies Table
export const commentReplies = createTable(
  "comment_replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    replyId: uuid("reply_id")
      .notNull()
      .references(() => comments.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    content: text("content").notNull(),
  },
  (table) => ({
    commentIdIdx: index("comment_replies_comment_id_idx").on(table.commentId),
    replyIdIdx: index("comment_replies_reply_id_idx").on(table.replyId),
  }),
);

// Followers/Following Relationship Table
export const follows = createTable(
  "follows",
  {
    followerId: varchar("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    followedId: varchar("followed_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.followerId, table.followedId] }),
  }),
);

// Updated User Relations
export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts, {
    relationName: "user_posts",
  }),
  likes: many(likes, {
    relationName: "user_likes",
  }),
  comments: many(comments, {
    relationName: "user_comments",
  }),
  following: many(follows, {
    relationName: "user_following",
  }),
  followers: many(follows, {
    relationName: "user_followers",
  }),
  commentReplies: many(commentReplies, {
    relationName: "user_comment_replies",
  }),
}));

export const followRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    relationName: "user_following",
    fields: [follows.followerId],
    references: [users.id],
  }),
  followed: one(users, {
    relationName: "user_followers",
    fields: [follows.followedId],
    references: [users.id],
  }),
}));

// Relationship definitions
export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    relationName: "user_posts",
    fields: [posts.userId],
    references: [users.id],
  }),
  media: many(postMedia, {
    relationName: "post_media",
  }),
  likes: many(likes, {
    relationName: "post_likes",
  }),
  comments: many(comments, {
    relationName: "post_comments",
  }),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    relationName: "post_media",
    fields: [postMedia.postId],
    references: [posts.id],
  }),
}));

export const likeRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    relationName: "post_likes",
    fields: [likes.entityId],
    references: [posts.id],
  }),
  user: one(users, {
    relationName: "user_likes",
    fields: [likes.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    relationName: "liked_by_users",
    fields: [likes.entityId],
    references: [comments.id],
  }),
  commentReply: one(commentReplies, {
    relationName: "user_like_reply",
    fields: [likes.entityId],
    references: [commentReplies.id],
  }),
}));

export const commentRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    relationName: "post_comments",
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    relationName: "user_comments",
    fields: [comments.userId],
    references: [users.id],
  }),
  replies: many(commentReplies, {
    relationName: "comment_replies",
  }),
  parentComments: many(commentReplies, {
    relationName: "parent_comments",
  }),
  likes: many(likes, {
    relationName: "liked_by_users",
  }),
}));

export const commentReplyRelations = relations(
  commentReplies,
  ({ one, many }) => ({
    comment: one(comments, {
      relationName: "comment_replies",
      fields: [commentReplies.commentId],
      references: [comments.id],
    }),
    reply: one(comments, {
      relationName: "parent_comments",
      fields: [commentReplies.replyId],
      references: [comments.id],
    }),
    likes: many(likes, {
      relationName: "user_like_reply",
    }),
    user: one(users, {
      relationName: "user_comment_replies",
      fields: [commentReplies.userId],
      references: [users.id],
    }),
  }),
);

// Add to existing tables
export const favorites = createTable(
  "favorites",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.userId, table.postId] }),
    userIdIdx: index("favorites_user_id_idx").on(table.userId),
    postIdIdx: index("favorites_post_id_idx").on(table.postId),
  }),
);

// Add to existing relations
export const favoriteRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [favorites.postId],
    references: [posts.id],
  }),
}));

// Table Types
export type UserSelect = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UserWithRelations = UserSelect & {
  posts?: PostSelect[];
  likes?: LikeSelect[];
  comments?: CommentSelect[];
  following?: FollowSelect[];
  followers?: FollowSelect[];
  commentReplies?: CommentReplySelect[];
};

export type PostSelect = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
export type PostWithRelations = PostSelect & {
  author?: UserSelect;
  media?: PostMediaSelect[];
  likes?: LikeSelect[];
  comments?: CommentSelect[];
};
export type PostWithRelationsAndComments = PostWithRelations & {
  comments: CommentWithRelations[];
};

export type PostMediaSelect = InferSelectModel<typeof postMedia>;
export type NewPostMedia = InferInsertModel<typeof postMedia>;
export type PostMediaWithRelations = PostMediaSelect & {
  post?: PostSelect;
};

export type LikeSelect = InferSelectModel<typeof likes>;
export type NewLike = InferInsertModel<typeof likes>;
export type LikeWithRelations = LikeSelect & {
  post?: PostSelect;
  user?: UserSelect;
  comment?: CommentSelect;
  commentReply?: CommentReplySelect;
};

export type CommentSelect = InferSelectModel<typeof comments>;
export type NewComment = InferInsertModel<typeof comments>;
export type CommentWithRelations = CommentSelect & {
  user?: UserSelect;
  post?: PostSelect;
  replies?: CommentReplySelect[];
  parentComments?: CommentReplySelect[];
  likes?: LikeSelect[];
};

export type CommentReplySelect = InferSelectModel<typeof commentReplies>;
export type NewCommentReply = InferInsertModel<typeof commentReplies>;
export type CommentReplyWithRelations = CommentReplySelect & {
  comment?: CommentSelect;
  reply?: CommentSelect;
  user?: UserSelect;
};

export type FollowSelect = InferSelectModel<typeof follows>;
export type NewFollow = InferInsertModel<typeof follows>;
export type FollowWithRelations = FollowSelect & {
  follower?: UserSelect;
  followed?: UserSelect;
};

export type FavoriteSelect = InferSelectModel<typeof favorites>;
export type NewFavorite = InferInsertModel<typeof favorites>;
export type FavoriteWithRelations = FavoriteSelect & {
  user?: UserSelect;
  post?: PostSelect;
};
