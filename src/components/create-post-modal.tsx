"use client";

import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Hash,
  MapPin,
  MoreHorizontal,
  Images,
  AlignEndHorizontal,
  X,
} from "lucide-react";
import LexicalEditor from "./editor";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import { uploadFiles } from "@/lib/uploadthing";
import { api } from "@/trpc/react";
import { usePostStore } from "@/store/post-store";

interface ThreadPost {
  id: string;
  content: string;
  media?: File[];
  editorState: string;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MAX_TOTAL_MEDIA = 10;
const MAX_THREAD_MEDIA = 5;
const MAX_THREADS = 3;

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

const ThreadItem = ({
  post,
  onRemove,
  onChange,
  index,
  editorState,
  onMediaAdd,
  onMediaRemove,
  disableMediaUpload,
}: {
  post: ThreadPost;
  onRemove: () => void;
  onChange: (content: string) => void;
  index: number;
  editorState: string;
  onMediaAdd: (files: File[]) => void;
  onMediaRemove: (indexToRemove: number) => void;
  disableMediaUpload: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
      <div className="absolute left-[38px] top-[70px] h-[83%] w-0.5 rounded-full bg-neutral-800" />

      <div className="flex gap-3 px-4 pt-4">
        <div className="flex h-full flex-col items-center">
          <Avatar className="h-12 w-12">
            <AvatarImage src="https://ui.shadcn.com/avatars/02.png" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex w-full flex-col">
          <div className="flex items-center justify-between">
            <span className="font-semibold">ableezz</span>
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
          <LexicalEditor onChange={onChange} editorState={editorState} />

          {post.media && post.media.length > 0 && (
            <Carousel setApi={setApi} className="mt-2 w-full">
              <CarouselContent>
                {post.media.map((file, mediaIndex) => (
                  <CarouselItem key={mediaIndex} className="relative w-16">
                    <div>
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Media ${mediaIndex + 1}`}
                        width={500}
                        height={500}
                        className="aspect-square w-full rounded-md border border-neutral-500 object-cover dark:border-neutral-700"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full bg-neutral-500 text-white"
                        onClick={() => onMediaRemove(mediaIndex)}
                      >
                        <X size={12} />
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
        <div className="flex w-12 place-items-center justify-center"></div>
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

const loadContent = () => {
  const value =
    '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  return value;
};

const CreateModal = ({ open, onOpenChange }: Props) => {
  const {
    posts,
    isSubmitting,
    uploadingFiles,
    setSubmitting,
    setUploadingFiles,
    updatePostContent,
    addMedia,
    removeMedia,
    removePost,
    addPost,
    resetPosts,
  } = usePostStore();

  const handleThreadContentChange = (index: number, content: string) => {
    updatePostContent(index, content);
  };

  const { mutate: createPost } = api.post.create.useMutation();

  const handleAddThread = () => {
    if (posts.length >= MAX_THREADS) return;

    const newPost = {
      id: crypto.randomUUID(),
      content: "",
      media: [],
      editorState: loadContent(),
    };
    addPost(newPost);
  };

  const handleRemoveThread = (index: number) => {
    if (posts.length <= 1) return;
    removePost(index);
  };

  const handleAddMedia = (index: number, files: File[]) => {
    const totalMediaCount = posts.reduce(
      (acc, post) => acc + (post.media?.length ?? 0),
      0,
    );

    const threadMediaCount = posts[index]?.media?.length ?? 0;

    const filteredFiles = files.filter(
      (_, fileIndex) =>
        totalMediaCount + fileIndex + 1 <= MAX_TOTAL_MEDIA &&
        threadMediaCount + fileIndex + 1 <= MAX_THREAD_MEDIA,
    );

    addMedia(index, filteredFiles);
  };

  const handleRemoveMedia = async (threadIndex: number, mediaIndex: number) => {
    removeMedia(threadIndex, mediaIndex);
  };

  const uploadPostFiles = async () => {
    setUploadingFiles(true);

    try {
      const response = await uploadFiles("imageUploader", {
        files: posts.flatMap((post) => post.media ?? []),
      });

      return response;
    } catch (error) {
      console.error("[ERROR UPLOADING FILES]", error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSubmit = async () => {
    const validPosts = posts.filter((post) => isThreadValid(post));

    if (isSubmitting || isFirstThreadEmpty) {
      console.log("STOPPED");
      return;
    }

    setSubmitting(true);
    try {
      for (const post of validPosts) {
        const uploadedFiles = post.media ? await uploadPostFiles() : [];

        createPost({
          content: validPosts.map((post) => post.content).join("\n"),
          postType: post.media ? "carousel" : "text",
          media: uploadedFiles?.map((file) => ({
            mediaUrl: file.url,
            mediaType: file.type.includes("video") ? "video" : "image",
            mediaSize: file.size,
            fileHash: file.fileHash,
            fileKey: file.key,
            fileType: file.type,
          })),
        });
      }

      onOpenChange(false);
      resetPosts();
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalMediaCount = () =>
    posts.reduce((acc, post) => acc + (post.media?.length ?? 0), 0);

  const isThreadValid = (post: ThreadPost) =>
    post.content.trim().length > 0 || (post.media && post.media.length > 0);

  const isLatestThreadEmpty = !isThreadValid(posts[posts.length - 1]!);
  const isFirstThreadEmpty = !isThreadValid(posts[0]!);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black p-2 text-white sm:max-w-[425px]">
        <ScrollArea className={"max-h-[80dvh] overflow-y-auto"}>
          <div className="relative flex place-items-center items-center justify-between border-b border-neutral-800">
            <Button variant="link" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <DialogTitle className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 place-items-center text-xl font-bold">
              New Post
            </DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={"icon"} variant="ghost">
                  <MoreHorizontal size={19} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark as paid sponsorship</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {posts.map((post, index) => (
              <ThreadItem
                key={post.id}
                post={post}
                index={index}
                onRemove={() => handleRemoveThread(index)}
                onChange={(content) =>
                  handleThreadContentChange(index, content)
                }
                editorState={post.editorState}
                onMediaAdd={(files) => handleAddMedia(index, files)}
                onMediaRemove={(mediaIndex) =>
                  handleRemoveMedia(index, mediaIndex)
                }
                disableMediaUpload={getTotalMediaCount() >= MAX_TOTAL_MEDIA}
              />
            ))}
          </div>

          {posts.length < MAX_THREADS && (
            <div
              className={`group flex cursor-pointer place-items-center gap-2 px-4 align-middle transition-all duration-300 ease-in ${
                isLatestThreadEmpty
                  ? "pointer-events-none opacity-30"
                  : "opacity-50 hover:opacity-70"
              }`}
              onClick={handleAddThread}
            >
              <div className="flex w-12 place-items-center justify-center">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://ui.shadcn.com/avatars/02.png" />
                  <AvatarFallback className="text-[10px]">AB</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h4 className="text-xs text-black dark:text-white">
                  Add to thread
                </h4>
              </div>
            </div>
          )}

          <div className="my-2 flex place-items-center items-center justify-between px-4">
            <h4 className="text-xs text-black dark:text-white">
              Any one can reply and quote
            </h4>
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={
                isSubmitting || isFirstThreadEmpty || isLatestThreadEmpty
              }
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModal;
