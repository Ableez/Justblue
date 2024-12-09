"use client";
import { useState, useRef } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { PostComment } from "./post-comment";
import { useQueryClient } from "@tanstack/react-query";
import type {
  PostWithRelations,
  CommentWithRelations,
} from "@/server/db/schema";
import { Input } from "../ui/input";

type Props = {
  post: PostWithRelations;
  comments: CommentWithRelations[];
};

export const PostComments = ({ post, comments }: Props) => {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const focusRef = useRef<HTMLInputElement>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // comment.byposid returns 404 sometimes check why and fix
  // proceed to building all post related interactions

  console.log("COMMENTS", comments);

  const { mutate: addComment } = api.comment.create.useMutation({
    onSuccess: () => {
      setComment("");
      void queryClient.invalidateQueries({
        queryKey: [["comment", "byPostId"], { input: post.id }],
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!comment.trim()) return;
          if (replyTo) {
            // addReply({ postId: post.id, content: comment.trim(), replyTo });
          } else {
            addComment({ postId: post.id, content: comment.trim() });
          }
        }}
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-[500px] place-items-center justify-between gap-2 bg-white p-2 align-middle dark:bg-black"
      >
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="h-10"
          ref={focusRef}
        />
        <Button
          type="submit"
          disabled={!comment.trim()}
          className="ml-auto h-10 py-0"
        >
          Post
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <PostComment
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            focusRef={focusRef}
            key={comment.id}
            comment={comment}
          />
        ))}
      </div>
    </div>
  );
};
