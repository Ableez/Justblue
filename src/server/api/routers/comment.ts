import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { comments, users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const commentRouter = createTRPCRouter({
  byPostId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      try {
        const fetchedComments = await ctx.db.query.comments.findMany({
          where: eq(comments.postId, input),
          with: {
            user: true,
            replies: {
              with: {
                user: true,
              },
            },
          },
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        });

        return fetchedComments;
      } catch (error) {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [comment] = await ctx.db
        .insert(comments)
        .values({
          content: input.content,
          postId: input.postId,
          userId: ctx.userId,
        })
        .returning();

      return comment;
    }),
});
