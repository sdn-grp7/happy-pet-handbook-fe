import { ApiError, apiRequest } from "@/lib/api";
import type {
  CommentPayload,
  FeedComment,
  FeedPost,
  PostPayload,
  ToggleLikeResult,
} from "@/features/forum/types";

const POSTS_ENDPOINT = "/api/v1/posts";
export const FEED_POSTS_ENDPOINT = `${POSTS_ENDPOINT}/feed`;

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RawRecord) : {};
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function unwrapArray(response: unknown, keys: string[]): unknown[] {
  if (Array.isArray(response)) return response;

  const record = asRecord(response);
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  const data = asRecord(record.data);
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function unwrapSingle(response: unknown, keys: string[]): unknown {
  const record = asRecord(response);
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }
  return response;
}

function readEntityId(value: unknown): string | undefined {
  const direct = asString(value);
  if (direct) return direct;

  const record = asRecord(value);
  return asString(record._id) ?? asString(record.id);
}

function readOwnerId(record: RawRecord): string | undefined {
  return (
    asString(record.authorId) ??
    asString(record.userId) ??
    asString(record.ownerId) ??
    readEntityId(record.author) ??
    readEntityId(record.user) ??
    readEntityId(record.createdBy) ??
    readEntityId(record.owner)
  );
}

function readDisplayName(record: RawRecord, fallback = "Member") {
  const author = asRecord(record.author);
  const user = asRecord(record.user);
  const createdBy = asRecord(record.createdBy);

  return (
    asString(record.authorDisplayName) ??
    asString(record.authorName) ??
    asString(author.displayName) ??
    asString(author.name) ??
    asString(user.displayName) ??
    asString(user.name) ??
    asString(createdBy.displayName) ??
    asString(createdBy.name) ??
    fallback
  );
}

function readLikedByMe(record: RawRecord): boolean | undefined {
  return (
    asBoolean(record.likedByMe) ??
    asBoolean(record.isLiked) ??
    asBoolean(record.liked) ??
    asBoolean(record.hasLiked) ??
    asBoolean(record.userLiked)
  );
}

export function normalizeFeedComment(raw: unknown, fallback?: Partial<FeedComment>): FeedComment {
  const record = asRecord(raw);
  const content = asString(record.content) ?? asString(record.body) ?? fallback?.content ?? "";
  const createdAt = asString(record.createdAt) ?? fallback?.createdAt ?? new Date().toISOString();
  const fallbackId = [fallback?.postId ?? "comment", createdAt, content].join("-");

  return {
    _id: asString(record._id) ?? asString(record.id) ?? fallback?._id ?? fallbackId,
    postId: asString(record.postId) ?? readEntityId(record.post) ?? fallback?.postId,
    authorId: readOwnerId(record) ?? fallback?.authorId,
    authorDisplayName: readDisplayName(record, fallback?.authorDisplayName ?? "Member"),
    content,
    createdAt,
    updatedAt: asString(record.updatedAt) ?? fallback?.updatedAt,
  };
}

export function normalizeFeedPost(raw: unknown, fallback?: Partial<FeedPost>): FeedPost {
  const record = asRecord(raw);
  const comments = unwrapArray(record.comments, ["comments", "data"]).map((comment) =>
    normalizeFeedComment(comment, {
      postId: asString(record._id) ?? asString(record.id) ?? fallback?._id,
    }),
  );

  return {
    _id: asString(record._id) ?? asString(record.id) ?? fallback?._id ?? "",
    authorId: readOwnerId(record) ?? fallback?.authorId,
    authorDisplayName: readDisplayName(record, fallback?.authorDisplayName ?? "Member"),
    content: asString(record.content) ?? asString(record.body) ?? fallback?.content ?? "",
    imageUrls:
      asStringArray(record.imageUrls).length > 0
        ? asStringArray(record.imageUrls)
        : asStringArray(record.images).length > 0
          ? asStringArray(record.images)
          : (fallback?.imageUrls ?? []),
    tags:
      asStringArray(record.tags).length > 0 ? asStringArray(record.tags) : (fallback?.tags ?? []),
    likesCount: asNumber(record.likesCount, fallback?.likesCount ?? 0),
    likedByMe: readLikedByMe(record) ?? fallback?.likedByMe,
    commentsCount: asNumber(record.commentsCount, fallback?.commentsCount ?? comments.length),
    createdAt: asString(record.createdAt) ?? fallback?.createdAt ?? new Date().toISOString(),
    updatedAt: asString(record.updatedAt) ?? fallback?.updatedAt,
    comments: comments.length > 0 ? comments : fallback?.comments,
  };
}

function timestamp(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

export async function getFeedPosts(signal?: AbortSignal): Promise<FeedPost[]> {
  const data = await apiRequest<unknown>(FEED_POSTS_ENDPOINT, { signal });
  return unwrapArray(data, ["posts", "data", "feed"])
    .map(normalizeFeedPost)
    .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt));
}

export async function createPost(token: string, payload: PostPayload): Promise<FeedPost> {
  const data = await apiRequest<unknown>(POSTS_ENDPOINT, {
    method: "POST",
    token,
    body: payload,
  });
  return normalizeFeedPost(unwrapSingle(data, ["post", "data"]));
}

export async function getPost(postId: string, signal?: AbortSignal): Promise<FeedPost> {
  const data = await apiRequest<unknown>(`${POSTS_ENDPOINT}/${encodeURIComponent(postId)}`, {
    signal,
  });
  return normalizeFeedPost(unwrapSingle(data, ["post", "data"]));
}

export async function updatePost(
  token: string,
  postId: string,
  payload: PostPayload,
  fallback?: FeedPost,
): Promise<FeedPost> {
  const data = await apiRequest<unknown>(`${POSTS_ENDPOINT}/${encodeURIComponent(postId)}`, {
    method: "PATCH",
    token,
    body: payload,
  });
  return normalizeFeedPost(unwrapSingle(data, ["post", "data"]), {
    ...fallback,
    ...payload,
    _id: postId,
  });
}

export async function deletePost(token: string, postId: string): Promise<void> {
  await apiRequest<unknown>(`${POSTS_ENDPOINT}/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    token,
  });
}

export async function togglePostLike(
  token: string,
  postId: string,
  nextLiked: boolean,
  fallback?: FeedPost,
): Promise<ToggleLikeResult> {
  const encodedPostId = encodeURIComponent(postId);
  const method = nextLiked ? "POST" : "DELETE";

  let data: unknown;
  try {
    data = await apiRequest<unknown>(`${POSTS_ENDPOINT}/${encodedPostId}/like`, {
      method,
      token,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 405)) {
      throw error;
    }

    data = await apiRequest<unknown>(`${POSTS_ENDPOINT}/${encodedPostId}/likes`, {
      method,
      token,
    });
  }

  const responseRecord = asRecord(data);
  const unwrapped = unwrapSingle(data, ["post", "data"]);
  const postRecord = asRecord(unwrapped);
  const hasPostPayload =
    postRecord._id !== undefined ||
    postRecord.id !== undefined ||
    postRecord.content !== undefined ||
    postRecord.authorDisplayName !== undefined;
  const post = hasPostPayload ? normalizeFeedPost(unwrapped, fallback) : undefined;

  return {
    post,
    likedByMe:
      readLikedByMe(responseRecord) ?? readLikedByMe(postRecord) ?? post?.likedByMe ?? nextLiked,
    likesCount:
      responseRecord.likesCount !== undefined
        ? asNumber(responseRecord.likesCount)
        : postRecord.likesCount !== undefined
          ? asNumber(postRecord.likesCount)
          : post?.likesCount,
  };
}

export async function getPostComments(
  postId: string,
  signal?: AbortSignal,
): Promise<FeedComment[]> {
  const data = await apiRequest<unknown>(
    `${POSTS_ENDPOINT}/${encodeURIComponent(postId)}/comments`,
    { signal },
  );
  return unwrapArray(data, ["comments", "data"]).map((comment) =>
    normalizeFeedComment(comment, { postId }),
  );
}

export async function createComment(
  token: string,
  postId: string,
  payload: CommentPayload,
): Promise<FeedComment> {
  const data = await apiRequest<unknown>(
    `${POSTS_ENDPOINT}/${encodeURIComponent(postId)}/comments`,
    {
      method: "POST",
      token,
      body: payload,
    },
  );
  return normalizeFeedComment(unwrapSingle(data, ["comment", "data"]), {
    postId,
    content: payload.content,
  });
}

export async function getComment(
  postId: string,
  commentId: string,
  signal?: AbortSignal,
): Promise<FeedComment> {
  const data = await apiRequest<unknown>(
    `${POSTS_ENDPOINT}/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
    { signal },
  );
  return normalizeFeedComment(unwrapSingle(data, ["comment", "data"]), { postId });
}

export async function updateComment(
  token: string,
  postId: string,
  commentId: string,
  payload: CommentPayload,
  fallback?: FeedComment,
): Promise<FeedComment> {
  const data = await apiRequest<unknown>(
    `${POSTS_ENDPOINT}/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PATCH",
      token,
      body: payload,
    },
  );
  return normalizeFeedComment(unwrapSingle(data, ["comment", "data"]), {
    ...fallback,
    ...payload,
    _id: commentId,
    postId,
  });
}

export async function deleteComment(
  token: string,
  postId: string,
  commentId: string,
): Promise<void> {
  await apiRequest<unknown>(
    `${POSTS_ENDPOINT}/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "DELETE",
      token,
    },
  );
}
