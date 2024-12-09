"use client";
import { formatCompactNumber } from "@/lib/utils";

type Props = {
  postCounts: {
    likes: number;
    comments: number;
  };
};

export const PostEngagement = ({ postCounts }: Props) => (
  <div className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
    <button className="hover:underline">
      {formatCompactNumber(postCounts.likes)} likes
    </button>
    <button className="hover:underline">
      {formatCompactNumber(postCounts.comments)} comments
    </button>
  </div>
);
