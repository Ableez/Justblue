import { Hash, MapPin, Images, AlignEndHorizontal, X } from "lucide-react";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { MentionInput } from "./input";
import { type ThreadPost } from "./create-post";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const postActions = [
  {
    icon: (
      <Images
        className={"transition-all duration-300 group-hover:text-blue-600"}
        size={19}
      />
    ),
    label: "Attach media",
  },
  {
    icon: (
      <Hash
        className={"transition-all duration-300 group-hover:text-blue-600"}
        size={19}
      />
    ),
    label: "Add a tag",
  },
  {
    icon: (
      <AlignEndHorizontal
        className={"transition-all duration-300 group-hover:text-blue-600"}
        size={19}
      />
    ),
    label: "Add a poll",
  },
  {
    icon: (
      <MapPin
        className={"transition-all duration-300 group-hover:text-blue-600"}
        size={19}
      />
    ),
    label: "Add a location",
  },
];

export const ThreadItem = ({
  post,
  onRemove,
  index,
  onMediaAdd,
  onMediaRemove,
  disableMediaUpload,
  action,
  postId,
}: {
  post: ThreadPost;
  onRemove: () => void;
  index: number;
  onMediaAdd: (files: File[]) => void;
  onMediaRemove: (indexToRemove: number) => void;
  disableMediaUpload: boolean;
  action: "create" | "comment";
  postId?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onMediaAdd(Array.from(files));
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-[38px] top-[70px] h-fit w-0.5 rounded-full bg-neutral-800" />

      <div className="flex gap-3 px-4 pt-4">
        <div className="flex h-full flex-col items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage className="object-cover" src={user?.imageUrl} />
            <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="relative flex w-full flex-col">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{user?.username}</span>
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-neutral-500 hover:text-red-500"
                onClick={onRemove}
              >
                <X size={16} />
              </Button>
            )}
          </div>
          <MentionInput threadIndex={index} />
          {post.media && post.media.length > 0 && (
            <Carousel setApi={setApi} className="mt-2 w-full">
              <CarouselContent>
                {post.media.map((file, mediaIndex) => (
                  <CarouselItem
                    key={mediaIndex}
                    className="relative basis-[70%] border-white md:basis-[55%]"
                  >
                    <div className="h-full">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Media ${mediaIndex + 1}`}
                        width={500}
                        height={500}
                        className="h-full max-h-[300px] w-full rounded-md border border-neutral-500 object-cover dark:border-neutral-700"
                      />
                      <Button
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full bg-neutral-500/20 text-white shadow-none dark:bg-white/20"
                        onClick={() => onMediaRemove(mediaIndex)}
                      >
                        <X size={12} color={"#000000"} strokeWidth={2.4} />
                      </Button>
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
        <div className="flex place-items-center gap-2 align-middle">
          {postActions.map(({ icon, label }) => (
            <Button
              className="group"
              size="icon"
              key={label}
              variant="ghost"
              onClick={() => {
                if (label === "Attach media" && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              disabled={disableMediaUpload}
            >
              {icon}
            </Button>
          ))}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
          />
        </div>
      </div>
    </div>
  );
};
