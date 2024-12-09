import { api, HydrateClient } from "@/trpc/server";
import Image from "next/image";
import FeedContainer from "@/components/feed-container";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const feedPosts = await api.post.getLatestFeed();
  void api.post.getLatestFeed.prefetch();
  const user = await currentUser();

  if (!feedPosts || feedPosts.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col place-items-center gap-8 pt-16 text-center dark:text-white">
        <Image
          src={"/empty_search.webp"}
          width={700}
          height={700}
          alt="Empty state image"
        />
      </div>
    );
  }

  const modPosts = feedPosts.map((post) => ({
    ...post,
    _hasLiked: post.likes?.some((like) => like.userId === user?.id) ?? false,
    _hasCommented: post.comments?.some(
      (comment) => comment.userId === user?.id,
    ) ?? false,
    _hasFavorited: false, // TODO: Implement favoriting
  }));

  return (
    <HydrateClient>
      <FeedContainer initialPosts={modPosts} />
    </HydrateClient>
  );
}
