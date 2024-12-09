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
  replyTo: string | null;
  setReplyTo: (replyTo: string | null) => void;
};

export const PostComment = ({
  comment,
  focusRef,
  setReplyTo,
}: Props) => {
  return (
    <div>
      <div className="mt-2 flex items-center space-x-5 rounded-sm p-2 pl-1 hover:bg-neutral-50 dark:hover:bg-neutral-950/20">
        <Avatar className="h-7 w-7">
          <AvatarImage
            src={comment.user?.profilePictureUrl ?? ""}
            alt={comment.user?.username ?? ""}
          />
          <AvatarFallback>
            <span className="text-sm">{comment.user?.username?.[0]}</span>
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-start space-x-2">
            <p className="text-sm text-neutral-500">
              @{comment.user?.username}
            </p>
            <p className="text-sm text-neutral-500">
              {formatDistanceToNow(comment.createdAt)}
            </p>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
      </div>
      <div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 px-4 hover:bg-transparent dark:hover:bg-blue-600/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusRef.current?.focus();
                    setReplyTo(comment.id);
                  }}
                >
                  <MessageCircle className="mr-1 h-8 w-8" size={20} />
                  <span className="text-sm">
                    {comment.replies?.length ?? 0}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Comment</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 px-4 hover:bg-transparent dark:hover:bg-red-600/10"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Heart className="mr-1 h-8 w-8" size={20} />
                  <span className="text-sm">{comment.likes?.length ?? 0}</span>
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
                  className="p-0 px-4 hover:bg-transparent dark:hover:bg-green-600/10"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Send className="h-8 w-8" size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
