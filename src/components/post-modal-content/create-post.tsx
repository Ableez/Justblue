"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useUser } from "@clerk/nextjs";
import { uploadFiles } from "@/lib/uploadthing";
import { api } from "@/trpc/react";
import { usePostStore } from "@/store/post-store";
import { ThreadItem } from "./thread-item";
import { useState } from "react";
import CheckCircle from "../ui/check";

export type ThreadPost = {
  id: string;
  content: string;
  media?: File[];
};

const MAX_TOTAL_MEDIA = 10;
const MAX_THREAD_MEDIA = 5;
const MAX_THREADS = 3;

const CreatePost = ({
  closeModal,
  action = "create",
  postId,
}: {
  closeModal: () => void;
  action: "create" | "comment";
  postId?: string;
}) => {
  const {
    posts,
    isSubmitting,
    uploadingFiles,
    setSubmitting,
    setUploadingFiles,
    addMedia,
    removeMedia,
    removePost,
    addPost,
    resetPosts,
  } = usePostStore();

  const { user } = useUser();
  const { mutate: createPost } = api.post.create.useMutation();
  const { mutate: createComment } = api.post.createComment.useMutation();

  const [checked, SetChecked] = useState(false);

  const handleAddThread = () => {
    if (posts.length >= MAX_THREADS) return;

    const newPost = {
      id: crypto.randomUUID(),
      content: "",
      media: [],
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
        const uploadedFiles =
          (post.media ? await uploadPostFiles() : []) ?? null;

        console.log("CREATION: ", {
          content: post.content,
          postType: post.media ? "carousel" : "text",
          media:
            uploadedFiles?.map((file) => ({
              mediaUrl: file.url,
              mediaType: file.type.includes("video") ? "video" : "image",
              mediaSize: file.size,
              fileHash: file.fileHash,
              fileKey: file.key,
              fileType: file.type,
            })) ?? null,
        });

        return;

        if (action === "create") {
          createPost({
            content: post.content,
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
        } else {
          createComment({
            postId: postId!,
            content: post.content,
          });
        }
      }

      closeModal();
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
    <div className="relative">
      <div className="h-full overflow-y-auto md:max-h-[60vh]">
        {posts.map((post, index) => (
          <ThreadItem
            key={post.id}
            post={post}
            action={action}
            postId={postId}
            index={index}
            onRemove={() => handleRemoveThread(index)}
            onMediaAdd={(files) => handleAddMedia(index, files)}
            onMediaRemove={(mediaIndex) => handleRemoveMedia(index, mediaIndex)}
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
              <AvatarImage className="object-cover" src={user?.imageUrl} />
              <AvatarFallback className="text-[10px]">
                {user?.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h4 className="text-xs text-black dark:text-white">
              Add to thread
            </h4>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 flex place-items-center items-center justify-between border-t px-4 py-2 dark:border-t-neutral-800 dark:bg-neutral-950">
        <CheckCircle
          checked={checked}
          onValueChange={SetChecked}
          label="Any one can reply and quote"
          disabled
        />

        <Button
          variant="outline"
          onClick={handleSubmit}
          disabled={isSubmitting || isFirstThreadEmpty || isLatestThreadEmpty}
        >
          {action === "comment"
            ? "Comment"
            : isSubmitting
              ? "Posting..."
              : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
