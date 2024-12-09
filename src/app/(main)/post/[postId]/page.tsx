import { api } from "@/trpc/server";
import { PostHeader } from "@/components/post/post-header";
import { PostActions } from "@/components/post/post-actions";
import { PostEngagement } from "@/components/post/post-engagement";
import { PostComments } from "@/components/post/post-comments";
import { PostContent } from "@/components/post/post-content";

type Props = {
  params: Promise<{ postId: string }>;
};

async function Post({ params }: Readonly<Props>) {
  const { postId } = await params;
  const post = await api.post.getById(postId);
  const comments = await api.comment.byPostId(postId);

  void api.post.getById.prefetch(postId);
  void api.comment.byPostId.prefetch(postId);

  return (
    <div className="relative mx-auto flex w-full max-w-[500px] animate-slide-in flex-col gap-4 p-4 pb-16">
      <PostHeader post={post} />
      <PostContent post={post} />
      <PostActions post={post} />
      <PostEngagement
        postCounts={{
          likes: post.likes.length,
          comments: post.comments.length,
        }}
      />
      <PostComments post={post} comments={comments} />
    </div>
  );
}

export default Post;
