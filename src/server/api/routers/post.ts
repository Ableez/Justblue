import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  posts,
  postMedia,
  likes,
  comments,
  favorites,
  type PostWithRelationsAndComments,
  type PostMediaSelect,
} from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().optional(),
        postType: z.enum(["text", "carousel"]),
        visibility: z
          .enum(["public", "followers", "close_friends"])
          .default("public"),
        media: z
          .array(
            z.object({
              mediaUrl: z.string().url(),
              mediaType: z.enum(["image", "video"]),
              mediaSize: z.number(),
              fileHash: z.string(),
              fileKey: z.string(),
              fileType: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { media, ...postData } = input;
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const post = await ctx.db.transaction(async (tx) => {
        const [newPost] = await tx
          .insert(posts)
          .values({
            ...postData,
            userId: ctx.userId!,
          })
          .returning();

        if (!newPost) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        if (media?.length) {
          await tx.insert(postMedia).values(
            (media as PostMediaSelect[]).map((m) => ({
              ...m,
              postId: newPost.id,
              mediaSize: m.mediaSize,
              fileHash: m.fileHash,
              fileKey: m.fileKey,
            })),
          );
        }

        return newPost;
      });

      return post;
    }),

  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input),
        with: {
          author: true,
          media: true,
          likes: {
            with: {
              user: true,
            },
          },
          comments: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      return post;
    }),

  getLatestFeed: publicProcedure.query(
    async ({ ctx }): Promise<PostWithRelationsAndComments[]> => {
      const post = await ctx.db.query.posts.findMany({
        orderBy: (posts, { desc }) => [desc(posts.createdAt), desc(posts.id)],
        with: {
          author: true,
          media: true,
          likes: true,
          comments: {
            with: {
              likes: true,
              user: true,
              replies: true,
              parentComments: true,
            },
          },
        },
      });

      return post ?? [];
    },
  ),

  like: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const like = await ctx.db
        .insert(likes)
        .values({
          userId: ctx.userId,
          entityId: input,
        })
        .returning();
      return like[0];
    }),

  unlike: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.db
        .delete(likes)
        .where(and(eq(likes.userId, ctx.userId), eq(likes.entityId, input)));
      return { success: true };
    }),

  createComment: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const comment = await ctx.db
        .insert(comments)
        .values({
          ...input,
          userId: ctx.userId,
        })
        .returning();
      return comment[0];
    }),

  toggleFavorite: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input: postId }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existing = await ctx.db
        .select()
        .from(favorites)
        .where(
          and(eq(favorites.userId, ctx.userId), eq(favorites.postId, postId)),
        )
        .limit(1);

      if (existing.length === 0) {
        await ctx.db.insert(favorites).values({
          userId: ctx.userId,
          postId,
        });
        return { favorited: true };
      }

      await ctx.db
        .delete(favorites)
        .where(
          and(eq(favorites.userId, ctx.userId), eq(favorites.postId, postId)),
        );
      return { favorited: false };
    }),

  toggleLike: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input: postId }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existing = await ctx.db
        .select()
        .from(likes)
        .where(and(eq(likes.userId, ctx.userId), eq(likes.entityId, postId)))
        .limit(1);

      if (existing.length === 0) {
        await ctx.db.insert(likes).values({
          userId: ctx.userId,
          entityId: postId,
        });
        return { liked: true } as const;
      }

      await ctx.db
        .delete(likes)
        .where(and(eq(likes.userId, ctx.userId), eq(likes.entityId, postId)));
      return { liked: false } as const;
    }),
});
