import CreatePost from "./create-post";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import Image from "next/image";
import { useFeedStore } from "@/store/feed-store";
import { useEffect, useState } from "react";

const CommentPost = ({
  closeModal,
  postId,
}: {
  closeModal: () => void;
  postId: string;
}) => {
  const { getPost } = useFeedStore();
  const post = getPost(postId);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!post) return null;

  return (
    <div>
      {/* <CreatePost closeModal={closeModal} postId={postId} /> */}
      <div className="relative">
        <div className="absolute left-[38px] top-[70px] h-[83%] w-0.5 rounded-full bg-neutral-800" />

        <div className="flex gap-3 px-4 pt-4">
          <div className="flex h-full flex-col items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage
                className="object-cover"
                src={post?.author?.imageUrl ?? "https://github.com/shadcn.png"}
              />
              <AvatarFallback>
                {post?.author?.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex w-full flex-col">
            <div>{post?.content}</div>

            {post.media && post.media.length > 0 && (
              <Carousel setApi={setApi} className="mt-2 w-full">
                <CarouselContent>
                  {post.media.map((file, mediaIndex) => (
                    <CarouselItem key={mediaIndex} className="relative w-16">
                      <div>
                        <Image
                          src={file.mediaUrl}
                          alt={`Media ${mediaIndex + 1}`}
                          width={500}
                          height={500}
                          className="aspect-square w-full rounded-md border border-neutral-500 object-cover dark:border-neutral-700"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-1 py-2">
                  {post.media.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        current === index ? "w-3 bg-white" : "bg-neutral-600"
                      }`}
                    />
                  ))}
                </div>
              </Carousel>
            )}
          </div>
        </div>

        <div className="flex px-4 pt-1">
          <div className="flex w-12 place-items-center justify-center"></div>
        </div>
      </div>
      <CreatePost closeModal={closeModal} action="comment" postId={postId} />
    </div>
  );
};

export default CommentPost;
