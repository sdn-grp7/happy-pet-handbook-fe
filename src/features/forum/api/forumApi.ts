import { apiRequest } from "@/lib/api";
import type { FeedPost } from "@/features/forum/types";

export const FEED_POSTS_ENDPOINT = "/api/v1/posts/feed";

type FeedPostsResponse =
  | FeedPost[]
  | {
      posts?: FeedPost[];
      data?: FeedPost[];
      feed?: FeedPost[];
    };

function unwrapFeedPosts(response: FeedPostsResponse): FeedPost[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.posts)) return response.posts;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.feed)) return response.feed;
  return [];
}

function normalizeFeedPost(post: FeedPost): FeedPost {
  return {
    _id: post._id,
    authorDisplayName: post.authorDisplayName,
    content: post.content,
    imageUrls: Array.isArray(post.imageUrls) ? post.imageUrls : [],
    tags: Array.isArray(post.tags) ? post.tags : [],
    likesCount: Number(post.likesCount ?? 0),
    commentsCount: Number(post.commentsCount ?? 0),
    createdAt: post.createdAt,
  };
}

function timestamp(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

export async function getFeedPosts(signal?: AbortSignal): Promise<FeedPost[]> {
  const data = await apiRequest<FeedPostsResponse>(FEED_POSTS_ENDPOINT, { signal });
  return unwrapFeedPosts(data)
    .map(normalizeFeedPost)
    .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt));
}
