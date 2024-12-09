import { create } from "zustand";
import { type PostWithRelationsAndComments } from "@/server/db/schema";

type OptimisticOperation = () => Promise<void>;

export type PostWithRelationsAndCommentsAndOptimistic =
  PostWithRelationsAndComments & {
    _count?: {
      likes: number;
      comments: number;
    };
    _hasLiked?: boolean;
    _hasFavorited?: boolean;
    _hasCommented?: boolean;
  };

interface FeedStore {
  posts: PostWithRelationsAndCommentsAndOptimistic[];
  setPosts: (posts: PostWithRelationsAndCommentsAndOptimistic[]) => void;
  addPost: (post: PostWithRelationsAndCommentsAndOptimistic) => void;
  removePost: (postId: string) => void;
  updatePost: (
    postId: string,
    updates: Partial<PostWithRelationsAndCommentsAndOptimistic>,
  ) => void;
  optimisticUpdate: (
    postId: string,
    updates: Partial<PostWithRelationsAndCommentsAndOptimistic>,
    operation: OptimisticOperation,
  ) => Promise<void>;
  optimisticAdd: (
    post: PostWithRelationsAndCommentsAndOptimistic,
    operation: OptimisticOperation,
  ) => Promise<void>;
  optimisticRemove: (
    postId: string,
    operation: OptimisticOperation,
  ) => Promise<void>;
}

export const useFeedStore = create<FeedStore>()((set, get) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, ...updates } : post,
      ),
    })),
  optimisticUpdate: async (postId, updates, operation) => {
    const previousState = get().posts;
    get().updatePost(postId, updates);

    console.log("optimisticUpdate", postId, updates);

    console.log(
      "previousState",
      previousState.find((post) => post.id === postId),
    );
    console.log(
      "currentState",
      get().posts.find((post) => post.id === postId),
    );

    try {
      await operation();
    } catch (error) {
      set({ posts: previousState });
      throw error;
    }
  },
  optimisticAdd: async (post, operation) => {
    const previousState = get().posts;
    get().addPost(post);

    try {
      await operation();
    } catch (error) {
      set({ posts: previousState });
      throw error;
    }
  },
  optimisticRemove: async (postId, operation) => {
    const previousState = get().posts;
    get().removePost(postId);

    try {
      await operation();
    } catch (error) {
      set({ posts: previousState });
      throw error;
    }
  },
}));
