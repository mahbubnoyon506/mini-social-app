import { apiClient } from "./client";
import type { Comment, PaginatedPosts, Post } from "@/types";

export const postsApi = {
  list(params: { page?: number; limit?: number; username?: string }) {
    return apiClient
      .get<PaginatedPosts>("/posts", { params })
      .then((res) => res.data);
  },

  create(text: string) {
    return apiClient
      .post<{ post: Post }>("/posts", { text })
      .then((res) => res.data.post);
  },

  toggleLike(postId: string) {
    return apiClient
      .post<{ liked: boolean; likeCount: number }>(`/posts/${postId}/like`)
      .then((res) => res.data);
  },

  addComment(postId: string, text: string) {
    return apiClient
      .post<{ comment: Comment; commentCount: number }>(
        `/posts/${postId}/comment`,
        { text }
      )
      .then((res) => res.data);
  },
};
