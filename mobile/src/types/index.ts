export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Author {
  id: string;
  username: string;
}

export interface Comment {
  id: string;
  text: string;
  author: Author;
  createdAt: string;
}

export interface Post {
  id: string;
  text: string;
  author: Author;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  comments: Comment[];
  createdAt: string;
}

export interface PaginatedPosts {
  posts: Post[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  message: string;
  errors?: ApiFieldError[];
}
