"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { type PostWithRelations } from "@/server/db/schema";

type Props = {
  post: PostWithRelations;
};

export const PostContent = ({ post }: Props) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  console.log("MEDIA", post);

  return (
    <div className="flex flex-col gap-4">
      {post.content && (
        <p className="whitespace-pre-wrap break-words text-sm">
          {post.content}
        </p>
      )}

      {post.media?.length && post.media?.length > 0 && (
        <div className="relative h-[400px] w-full">
          {post.media.length > 1 ? (
            <Carousel setApi={setApi}>
              <CarouselContent>
                {post.media.map((media, index) => (
                  <CarouselItem key={index} className="relative h-[400px]">
                    {media.mediaType === "image" ? (
                      <Image
                        src={media.mediaUrl ?? "/placeholder.webp"}
                        alt={`Media ${index + 1}`}
                        fill
                        className="rounded-md object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index === 0}
                      />
                    ) : (
                      <video
                        src={media.mediaUrl}
                        className="h-full w-full rounded-md object-cover"
                        controls
                        playsInline
                      />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="relative h-full w-full">
              {post.media[0]?.mediaType === "image" ? (
                <Image
                  src={post.media[0]?.mediaUrl}
                  alt="Media"
                  fill
                  className="rounded-md object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              ) : (
                <video
                  src={post.media[0]?.mediaUrl}
                  className="h-full w-full rounded-md object-cover"
                  controls
                  playsInline
                />
              )}
            </div>
          )}
          {post.media.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex justify-center gap-1">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      index === current ? "w-4 bg-white" : "bg-white/50",
                    )}
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
    </div>
  );
};
