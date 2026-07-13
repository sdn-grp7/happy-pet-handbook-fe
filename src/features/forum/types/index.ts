export interface FeedComment {
  _id: string;
  postId?: string;
  authorId?: string;
  authorDisplayName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedPost {
  _id: string;
  authorId?: string;
  authorDisplayName: string;
  content: string;
  imageUrls: string[];
  tags: string[];
  likesCount: number;
  likedByMe?: boolean;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
  comments?: FeedComment[];
}

export type PostPayload = {
  content: string;
  imageUrls: string[];
  tags: string[];
};

export type CommentPayload = {
  content: string;
};

export type ToggleLikeResult = {
  post?: FeedPost;
  likedByMe?: boolean;
  likesCount?: number;
};
