"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
  DrawerHeader,
} from "@/components/ui/drawer";
import { VideoPlayer } from "@/components/post/video/video-player";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { PostActions } from "@/components/post/post-actions";
import {
  type PostWithRelationsAndCommentsAndOptimistic,
  useFeedStore,
} from "@/store/feed-store";

type Props = {
  post: PostWithRelationsAndCommentsAndOptimistic;
};

const FeedPost: React.FC<Props> = ({ post }) => {
  const router = useRouter();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const { updatePost } = useFeedStore();

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const renderPostContent = () => {
    return (
      <>
        {post.content && (
          <p className="mb-3 whitespace-pre-wrap break-words text-sm">
            {post.content}
          </p>
        )}
        {post.media && post.media.length > 0 && (
          <div className="relative">
            <Carousel setApi={setApi}>
              <CarouselContent>
                {post.media.map((media, index) => (
                  <CarouselItem key={media.id}>
                    {media.mediaType === "video" ? (
                      <VideoPlayer url={media.mediaUrl} />
                    ) : (
                      <Image
                        src={media.mediaUrl}
                        alt={`Media ${index + 1}`}
                        width={400}
                        height={400}
                        className="h-[70dvh] max-h-[80dvh] w-full rounded-md border object-cover dark:border-neutral-900"
                      />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {post.media.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0">
                <div className="flex justify-center gap-1">
                  {Array.from({ length: count }).map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 w-2 rounded-full transition-all ${
                        index === current ? "w-4 bg-white" : "bg-white/50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        api?.scrollTo(index);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <article className="relative border border-x border-b border-neutral-200 p-4 transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/20">
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={post.author?.imageUrl ?? ""}
            alt={post.author?.username ?? ""}
            className="object-cover"
          />
          <AvatarFallback>
            {post.author?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="">@{post.author?.username}</p>
              <p className="text-sm text-neutral-500">
                {formatDistanceToNow(post.createdAt)}
              </p>
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="mx-auto w-full max-w-md">
                <DrawerHeader>
                  <DrawerTitle className="sr-only">Post Options</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col space-y-3 p-4">
                  <Button variant="ghost" className="w-full justify-start">
                    Follow
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Share to...
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Copy link
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-800"
                  >
                    Report
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          <div
            className="mt-2"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/post/${post.id}`);
            }}
          >
            {renderPostContent()}
          </div>
          <PostActions post={post} />
        </div>
      </div>

      {post.comments && post.comments.length > 0 && (
        <div className="absolute left-8 top-1/2 z-[-1] h-[79%] -translate-y-1/2 border-r dark:border-neutral-900" />
      )}
      {post.comments && post.comments.length > 0 && (
        <Link
          href={`/post/${post.id}#${post.comments[0]?.id}`}
          className="mt-2 flex items-center space-x-5 rounded-sm p-2 pl-1 hover:bg-neutral-50 dark:hover:bg-neutral-950/20"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage
              src={post.comments[0]?.user?.imageUrl ?? ""}
              alt={post.comments[0]?.user?.username ?? ""}
            />
            <AvatarFallback>
              <span className="text-sm">
                {post.comments[0]?.user?.username?.[0]}
              </span>
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-start space-x-2">
              <p className="text-sm text-neutral-500">
                @{post.comments[0]?.user?.username}
              </p>
              <p className="text-sm text-neutral-500">
                {formatDistanceToNow(post.comments[0]?.createdAt ?? new Date())}
              </p>
            </div>
            <p className="text-sm">{post.comments[0]?.content}</p>
          </div>
        </Link>
      )}
    </article>
  );
};

export default FeedPost;
