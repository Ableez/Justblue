import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { type Post } from "@/server/db/schema";
import { PostOptionsDrawer } from "@/components/post/post-options-drawer";

type Props = {
  post: Post & {
    author: {
      username: string;
      profilePictureUrl: string | null;
    };
  };
};

export const PostHeader = ({ post }: Props) => (
  <div className="flex justify-between align-middle">
    <div className="flex items-center gap-2">
      <div className="aspect-square w-fit cursor-pointer rounded-full bg-gradient-to-tl from-red-500 via-purple-500 to-orange-500 p-0.5">
        <Image
          src={post.author.profilePictureUrl ?? ""}
          alt={post.author.username}
          width={36}
          height={36}
          className="rounded-full border-4 border-white dark:border-black"
        />
      </div>
      <div className="flex items-center gap-1">
        <p className="text-sm font-medium">{post.author.username}</p>
        <span className="text-lg opacity-50">·</span>
        <p className="text-sm opacity-50">
          {formatDistanceToNow(post.createdAt)}
        </p>
      </div>
    </div>
    <PostOptionsDrawer postId={post.id} />
  </div>
);
