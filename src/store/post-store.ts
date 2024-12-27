import { create } from "zustand";

interface ThreadPost {
  id: string;
  content: string;
  media?: File[];
}

interface PostStore {
  posts: ThreadPost[];
  isSubmitting: boolean;
  uploadingFiles: boolean;
  setSubmitting: (value: boolean) => void;
  setUploadingFiles: (value: boolean) => void;
  setPosts: (posts: ThreadPost[]) => void;
  addPost: (post: ThreadPost) => void;
  removePost: (index: number) => void;
  updatePostContent: (index: number, content: string) => void;
  addMedia: (index: number, files: File[]) => void;
  removeMedia: (threadIndex: number, mediaIndex: number) => void;
  resetPosts: () => void;
}

const initialPost: ThreadPost = {
  id: crypto.randomUUID(),
  content: "",
  media: [],
};

export const usePostStore = create<PostStore>()((set) => ({
  posts: [initialPost],
  isSubmitting: false,
  uploadingFiles: false,
  setSubmitting: (value: boolean) => set({ isSubmitting: value }),
  setUploadingFiles: (value: boolean) => set({ uploadingFiles: value }),
  setPosts: (posts: ThreadPost[]) => set({ posts }),
  addPost: (post: ThreadPost) =>
    set((state: PostStore) => ({ posts: [...state.posts, post] })),
  removePost: (index: number) =>
    set((state: PostStore) => ({
      posts: state.posts.filter((_, i) => i !== index),
    })),
  updatePostContent: (index: number, content: string) =>
    set((state: PostStore) => ({
      posts: state.posts.map((post, i) =>
        i === index ? { ...post, content } : post,
      ),
    })),
  addMedia: (index: number, files: File[]) =>
    set((state: PostStore) => ({
      posts: state.posts.map((post, i) =>
        i === index
          ? {
              ...post,
              media: [...(post.media ?? []), ...files],
            }
          : post,
      ),
    })),
  removeMedia: (threadIndex: number, mediaIndex: number) =>
    set((state: PostStore) => ({
      posts: state.posts.map((post, i) =>
        i === threadIndex
          ? {
              ...post,
              media: post.media?.filter((_, index) => index !== mediaIndex),
            }
          : post,
      ),
    })),
  resetPosts: () => set({ posts: [initialPost] }),
}));
