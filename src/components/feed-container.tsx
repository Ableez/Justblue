"use client";

import FeedPost from "@/app/_components/feed-post";
import {
  type PostWithRelationsAndCommentsAndOptimistic,
  useFeedStore,
} from "@/store/feed-store";
import { useEffect } from "react";

const FeedContainer = ({
  initialPosts,
}: {
  initialPosts: PostWithRelationsAndCommentsAndOptimistic[];
}) => {
  const { setPosts, posts } = useFeedStore();

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts, setPosts]);

  return (
    <div className="mx-auto flex w-[40dvw] max-w-screen-sm flex-col">
      {posts.map((post) => (
        <FeedPost key={post.id} post={post} />
      ))}
    </div>
  );
};

export default FeedContainer;
