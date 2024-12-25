"use client";

import { formatDistanceToNow } from "date-fns";
import { type CommentWithRelations } from "@/server/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Heart, MessageCircle, Send } from "lucide-react";

type Props = {
  comment: CommentWithRelations;
  focusRef: React.RefObject<HTMLInputElement>;
  setReplyTo: (replyTo: string | null) => void;
};

export const PostComment = ({ comment, focusRef, setReplyTo }: Props) => {
  const handleReply = () => {
    focusRef.current?.focus();
    setReplyTo(comment.id);
  };

  return (
    <div className="space-y-2">
      <div className="mt-2 flex items-start space-x-5 rounded-sm p-2 pl-1 hover:bg-neutral-50 dark:hover:bg-neutral-950/20">
        <Avatar className="h-7 w-7">
          <AvatarImage
            src={comment.user?.imageUrl ?? "https://github.com/shadcn.png"}
            alt={comment.user?.username ?? ""}
          />
          <AvatarFallback>
            <span className="text-sm">{comment.user?.username?.[0]}</span>
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-start space-x-2">
            <p className="text-sm font-semibold">@{comment.user?.username}</p>
            <p className="text-xs text-neutral-500">
              {formatDistanceToNow(comment.createdAt)} ago
            </p>
          </div>
          <p className="mt-1 text-sm">{comment.content}</p>
          <div className="mt-2 flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 px-2 hover:bg-transparent dark:hover:bg-blue-600/10"
                    onClick={handleReply}
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    <span className="text-xs">
                      {comment.replies?.length ?? 0}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 px-2 hover:bg-transparent dark:hover:bg-red-600/10"
                  >
                    <Heart className="mr-1 h-4 w-4" />
                    <span className="text-xs">
                      {comment.likes?.length ?? 0}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 px-2 hover:bg-transparent dark:hover:bg-green-600/10"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8">
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <div
                key={reply.id}
                className="flex items-start space-x-3 rounded-sm p-2 hover:bg-neutral-50 dark:hover:bg-neutral-950/20"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      reply.user?.imageUrl ?? "https://github.com/shadcn.png"
                    }
                    alt={reply.user?.username ?? ""}
                  />
                  <AvatarFallback>
                    <span className="text-xs">{reply.user?.username?.[0]}</span>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-semibold">
                      @{reply.user?.username}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDistanceToNow(reply.createdAt)} ago
                    </p>
                  </div>
                  <p className="mt-1 text-sm">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
