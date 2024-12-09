"use client";
import { useContext, useState } from "react";
import { api } from "@/trpc/react";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import {
  type PostWithRelationsAndComments,
  type LikeSelect,
} from "@/server/db/schema";
import { useUser } from "@clerk/nextjs";
import {
  type PostWithRelationsAndCommentsAndOptimistic,
  useFeedStore,
} from "@/store/feed-store";
import { motion } from "framer-motion";
import { LikeConfetti } from "@/components/ui/confetti";
import ModalContext from "@/lib/context/modal";
type Props = {
  post: PostWithRelationsAndCommentsAndOptimistic;
};

export const PostActions = ({ post: initPost }: Props) => {
  const { user, isLoaded } = useUser();
  const { optimisticUpdate, posts: storedPosts } = useFeedStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const post = storedPosts.find((post) => post.id === initPost.id) ?? initPost;
  const isLiked = post.likes?.some((like) => like.userId === user?.id);
  const [liked, setLiked] = useState(isLiked);

  const { mutate: toggleLike } = api.post.toggleLike.useMutation();
  const { mutate: toggleFavorite } = api.post.toggleFavorite.useMutation();

  const { setOpen } = useContext(ModalContext);

  const handleLike = async () => {
    if (!user?.id) return;
    const newLikedState = !liked;

    if (newLikedState) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }

    const updatedLikes = newLikedState
      ? [
          ...(post.likes ?? []),
          {
            userId: user.id,
            entityId: post.id,
            createdAt: new Date(),
          } as LikeSelect,
        ]
      : (post.likes?.filter((like) => like.userId !== user.id) ?? []);

    await optimisticUpdate(
      post.id,
      {
        likes: updatedLikes,
        _hasLiked: true,
        _count: {
          likes: updatedLikes.length,
          comments: post._count?.comments ?? 0,
        },
      },
      () =>
        new Promise<void>((resolve) => {
          toggleLike(post.id, {
            onSuccess: () => {
              setLiked(newLikedState);
              resolve();
            },
          });
        }),
    );
  };

  const handleFavorite = async () => {
    if (!user?.id) return;
    const newFavoritedState = !isFavorited;

    await optimisticUpdate(
      post.id,
      {
        favorites: newFavoritedState ? [{ userId: user.id }] : [],
      } as Partial<PostWithRelationsAndComments>,
      () =>
        new Promise<void>((resolve) => {
          toggleFavorite(post.id, {
            onSuccess: () => {
              setIsFavorited(newFavoritedState);
              resolve();
            },
          });
        }),
    );
  };

  if (!isLoaded) return null;

  const AuthenticatedActionButton = ({
    onClick,
    tooltip,
    icon: Icon,
    className = "",
    children,
  }: {
    onClick?: () => void;
    tooltip: string;
    icon: typeof Heart;
    className?: string;
    children?: React.ReactNode;
  }) => {
    if (!user) return null;

    const button = (
      <button
        className={`rounded-full p-2 px-3 transition-all duration-300 ease-in hover:bg-neutral-200 dark:hover:bg-neutral-800/60 ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    );

    return button;
  };

  return (
    <div className="mt-2 flex place-items-center justify-between align-middle">
      {user && (
        <div className="flex justify-between">
          <AuthenticatedActionButton
            tooltip="Like"
            icon={Heart}
            onClick={handleLike}
            className={`relative active:animate-like-animation ${
              liked ? "text-red-500" : ""
            }`}
          >
            <motion.div
              animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className={"flex place-items-center gap-2 align-middle"}
            >
              <Heart
                size={20}
                className={liked ? "fill-red-500 text-red-500" : ""}
              />

              {post.likes?.length && post.likes?.length > 0 ? (
                <h4 className="text-xs">{post.likes?.length}</h4>
              ) : null}
            </motion.div>
            <LikeConfetti isActive={showConfetti} />
          </AuthenticatedActionButton>
          <AuthenticatedActionButton
            onClick={() => {
              setOpen(true, "comment", post.id);
            }}
            tooltip="Comment"
            icon={MessageCircle}
          >
            <MessageCircle size={20} />
          </AuthenticatedActionButton>
          <AuthenticatedActionButton tooltip="Share" icon={Send}>
            <Send size={20} />
          </AuthenticatedActionButton>
        </div>
      )}

      {user && (
        <AuthenticatedActionButton
          tooltip="Save"
          icon={Bookmark}
          onClick={handleFavorite}
          className={isFavorited ? "fill-current" : ""}
        >
          <Bookmark size={20} className={isFavorited ? "fill-current" : ""} />
        </AuthenticatedActionButton>
      )}
    </div>
  );
};
