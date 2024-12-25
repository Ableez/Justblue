import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { PostOptionsDrawer } from "@/components/post/post-options-drawer";
import { type PostWithRelationsAndComments } from "@/server/db/schema";

type Props = {
  post: PostWithRelationsAndComments;
};

export const PostHeader = ({ post }: Props) => (
  <div className="flex justify-between align-middle">
    <div className="flex items-center gap-2">
      {/* <div className="aspect-square w-fit cursor-pointer rounded-full bg-gradient-to-tl from-red-500 via-purple-500 to-orange-500 p-0.5"> */}
      <Image
        src={post.author?.imageUrl ?? "https://github.com/shadcn.png"}
        alt={post.author?.username ?? ""}
        width={36}
        height={36}
        className="rounded-full border-4 border-white dark:border-black"
      />
      {/* </div> */}
      <div className="flex items-center gap-1">
        <p className="text-sm font-medium">
          {post.author?.username ?? "unknown"}
        </p>
        <span className="text-lg opacity-50">·</span>
        <p className="text-sm opacity-50">
          {formatDistanceToNow(post.createdAt)}
        </p>
      </div>
    </div>
    <PostOptionsDrawer postId={post.id} />
  </div>
);
