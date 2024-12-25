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
import { XIcon } from "lucide-react";

type Props = {
  post: PostWithRelations;
  comments: CommentWithRelations[];
};

export const PostComments = ({ post, comments }: Props) => {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const focusRef = useRef<HTMLInputElement>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { mutate: addReply } = api.post.createReply.useMutation({
    onSuccess: () => {
      setComment("");
      setReplyTo(null);
      void queryClient.invalidateQueries({
        queryKey: [["comment", "byPostId"], { input: post.id }],
      });
    },
  });

  const { mutate: addComment } = api.comment.create.useMutation({
    onSuccess: () => {
      setComment("");
      void queryClient.invalidateQueries({
        queryKey: [["comment", "byPostId"], { input: post.id }],
      });
    },
  });

  const replyToData = comments.find((comment) => comment.id === replyTo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (replyTo) {
      addReply({
        postId: post.id,
        content: comment.trim(),
        commentId: replyTo,
      });
    } else {
      addComment({ postId: post.id, content: comment.trim() });
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      <div className="space-y-4">
        {comments.map((comment) => (
          <PostComment
            key={comment.id}
            comment={comment}
            setReplyTo={setReplyTo}
            focusRef={focusRef}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex w-full max-w-screen-sm flex-col place-items-center justify-between align-middle"
      >
        {replyTo && (
          <div className="relative flex w-[90%] items-center justify-center gap-2 rounded-t-xl px-8 py-1 dark:bg-neutral-950">
            <p className="text-xs font-semibold">Replying to</p>
            <p className="text-sm text-neutral-500">
              @{replyToData?.user?.username}
            </p>
            <p className="max-w-[200px] truncate text-sm text-neutral-500">
              {replyToData?.content}
            </p>

            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={() => setReplyTo(null)}
            >
              <XIcon className="text-neutral-500" width={16} />
            </button>
          </div>
        )}
        <div className="flex w-full place-items-center justify-between gap-2 rounded-t-2xl border bg-white p-2 dark:border-neutral-800 dark:bg-black">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="h-10 focus-within:outline-none"
            ref={focusRef}
          />
          <Button
            type="submit"
            disabled={!comment.trim()}
            className="ml-auto h-10 py-0"
          >
            {replyTo ? "Reply" : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};
