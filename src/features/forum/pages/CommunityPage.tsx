import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, RefreshCw, Send } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { LoginPrompt } from "@/features/auth/components/LoginPrompt";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getFeedPosts,
  getPostComments,
  togglePostLike,
  updateComment,
  updatePost,
} from "@/features/forum/api/forumApi";
import {
  ForumSidebar,
  type ForumFilter,
  type ForumViewMode,
} from "@/features/forum/components/ForumSidebar";
import { ForumPostCard, type ForumPostDraft } from "@/features/forum/components/ForumPostCard";
import { ForumImageUploader } from "@/features/forum/components/ForumImageUploader";
import {
  FORUM_TAG_I18N,
  FORUM_TAG_OPTIONS,
  ForumTagPicker,
} from "@/features/forum/components/ForumTagPicker";
import type { FeedComment, FeedPost, PostPayload } from "@/features/forum/types";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";
import { toast } from "@/shared/lib/toast";

const EMPTY_POST_DRAFT: ForumPostDraft = {
  content: "",
  tags: [],
  imageUrls: [],
};

const TEXT = {
  composerTitle: "T\u1ea1o b\u00e0i vi\u1ebft",
  contentPlaceholder:
    "Chia s\u1ebb c\u00e2u chuy\u1ec7n, c\u00e2u h\u1ecfi ho\u1eb7c m\u1eb9o c\u1ee7a b\u1ea1n...",
  tagsLabel: "Tag",
  addImages: "Th\u00eam \u1ea3nh",
  uploading: "\u0110ang t\u1ea3i l\u00ean...",
  imageHint: "T\u1ed1i \u0111a 4 \u1ea3nh, upload qua Cloudinary.",
  removeImage: "X\u00f3a \u1ea3nh",
  createPost: "\u0110\u0103ng b\u00e0i",
  creatingPost: "\u0110ang \u0111\u0103ng...",
  feedErrorTitle: "Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c Feed",
  feedErrorBody: "Backend ch\u01b0a ph\u1ea3n h\u1ed3i ho\u1eb7c endpoint Feed \u0111ang l\u1ed7i.",
  retry: "Th\u1eed l\u1ea1i",
  emptyFiltered:
    "Kh\u00f4ng c\u00f3 b\u00e0i vi\u1ebft n\u00e0o kh\u1edbp b\u1ed9 l\u1ecdc hi\u1ec7n t\u1ea1i.",
  deletePostConfirm: "X\u00f3a b\u00e0i vi\u1ebft n\u00e0y?",
  deleteCommentConfirm: "X\u00f3a b\u00ecnh lu\u1eadn n\u00e0y?",
  loadCommentsError: "Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c b\u00ecnh lu\u1eadn.",
  savedPost: "\u0110\u00e3 l\u01b0u b\u00e0i vi\u1ebft.",
  createdPost: "\u0110\u00e3 \u0111\u0103ng b\u00e0i vi\u1ebft.",
  deletedPost: "\u0110\u00e3 x\u00f3a b\u00e0i vi\u1ebft.",
  createdComment: "\u0110\u00e3 th\u00eam b\u00ecnh lu\u1eadn.",
  savedComment: "\u0110\u00e3 l\u01b0u b\u00ecnh lu\u1eadn.",
  deletedComment: "\u0110\u00e3 x\u00f3a b\u00ecnh lu\u1eadn.",
  likeError: "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt n\u00fat tim.",
  liked: "\u0110\u00e3 th\u1ea3 tym.",
  unliked: "\u0110\u00e3 b\u1ecf tym.",
  genericError: "C\u00f3 l\u1ed7i x\u1ea3y ra. Vui l\u00f2ng th\u1eed l\u1ea1i.",
};

function FeedSkeleton({ viewMode }: { viewMode: ForumViewMode }) {
  const items = Array.from({ length: viewMode === "grid" ? 4 : 3 });

  return (
    <div className={cn("gap-5", viewMode === "grid" ? "grid sm:grid-cols-2" : "flex flex-col")}>
      {items.map((_, index) => (
        <article
          key={index}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="mt-4 aspect-[4/3] w-full" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
          </div>
        </article>
      ))}
    </div>
  );
}

function draftToPayload(draft: ForumPostDraft): PostPayload {
  return {
    content: draft.content.trim(),
    tags: draft.tags,
    imageUrls: draft.imageUrls,
  };
}

function postToDraft(post: FeedPost): ForumPostDraft {
  return {
    content: post.content,
    tags: post.tags.filter((tag) => (FORUM_TAG_OPTIONS as readonly string[]).includes(tag)),
    imageUrls: post.imageUrls.slice(0, 4),
  };
}

function timestamp(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function sortPosts(posts: FeedPost[]) {
  return [...posts].sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt));
}

function omitKey<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

export function CommunityPage() {
  const { t } = useI18n();
  const { user, token } = useAuth();
  const canInteract = Boolean(user && token);

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState<ForumFilter>("All");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ForumViewMode>("list");

  const [postDraft, setPostDraft] = useState<ForumPostDraft>(EMPTY_POST_DRAFT);
  const [creatingPost, setCreatingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postEditDraft, setPostEditDraft] = useState<ForumPostDraft>(EMPTY_POST_DRAFT);
  const [postBusyId, setPostBusyId] = useState<string | null>(null);
  const [likeBusyIds, setLikeBusyIds] = useState<Record<string, boolean>>({});

  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, FeedComment[]>>({});
  const [commentsLoaded, setCommentsLoaded] = useState<Record<string, boolean>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [commentsError, setCommentsError] = useState<Record<string, string>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [editingComment, setEditingComment] = useState<{
    postId: string;
    commentId: string;
  } | null>(null);
  const [commentEditDraft, setCommentEditDraft] = useState("");
  const [commentBusyId, setCommentBusyId] = useState<string | null>(null);

  const loadFeed = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");

    try {
      const feedPosts = await getFeedPosts(signal);
      if (signal?.aborted) return;

      const seededComments: Record<string, FeedComment[]> = {};
      const seededLoaded: Record<string, boolean> = {};
      feedPosts.forEach((post) => {
        if (post.comments) {
          seededComments[post._id] = post.comments;
          seededLoaded[post._id] = post.commentsCount <= post.comments.length;
        }
      });

      setPosts(feedPosts);
      setCommentsByPost((prev) => ({ ...prev, ...seededComments }));
      setCommentsLoaded((prev) => ({ ...prev, ...seededLoaded }));
      setIsLoading(false);

      // Prefetch up to 3 comments per post for card preview (non-blocking).
      const previewTargets = feedPosts.filter(
        (post) => post.commentsCount > 0 && !seededComments[post._id],
      );
      void Promise.all(
        previewTargets.map(async (post) => {
          try {
            const comments = await getPostComments(post._id, { signal, limit: 3 });
            if (signal?.aborted) return;
            setCommentsByPost((prev) => ({ ...prev, [post._id]: comments }));
            if (post.commentsCount <= comments.length) {
              setCommentsLoaded((prev) => ({ ...prev, [post._id]: true }));
            }
          } catch {
            // Preview is best-effort; full list still loads on expand.
          }
        }),
      );
    } catch (error) {
      if (signal?.aborted) return;
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      setPosts([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadFeed(controller.signal);

    return () => controller.abort();
  }, [loadFeed]);

  const loadComments = useCallback(
    async (postId: string, force = false) => {
      if (!force && (commentsLoaded[postId] || commentsLoading[postId])) return;

      setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
      setCommentsError((prev) => omitKey(prev, postId));

      try {
        const comments = await getPostComments(postId);
        setCommentsByPost((prev) => ({ ...prev, [postId]: comments }));
        setCommentsLoaded((prev) => ({ ...prev, [postId]: true }));
      } catch (error) {
        setCommentsError((prev) => ({
          ...prev,
          [postId]: error instanceof Error ? error.message : TEXT.loadCommentsError,
        }));
      } finally {
        setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [commentsLoaded, commentsLoading],
  );

  const tagOptions = useMemo(
    () =>
      [
        ...new Set([
          ...FORUM_TAG_OPTIONS,
          ...posts.flatMap((post) => post.tags ?? []).filter(Boolean),
        ]),
      ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    [posts],
  );

  useEffect(() => {
    if (filter !== "All" && !tagOptions.includes(filter)) {
      setFilter("All");
    }
  }, [filter, tagOptions]);

  const topicLabel = (topic: string) => {
    const key = FORUM_TAG_I18N[topic as keyof typeof FORUM_TAG_I18N];
    return key ? t(key) : topic;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (filter !== "All" && !post.tags.includes(filter)) return false;
      if (!q) return true;

      const haystack = [post.authorDisplayName, post.content, ...post.tags, post.createdAt]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [posts, filter, query]);

  const isOwnPost = useCallback(
    (post: FeedPost) => Boolean(user && post.authorId && post.authorId === user.id),
    [user],
  );

  const isOwnComment = useCallback(
    (comment: FeedComment) => Boolean(user && comment.authorId && comment.authorId === user.id),
    [user],
  );

  const patchPost = (postId: string, updater: (post: FeedPost) => FeedPost) => {
    setPosts((prev) => prev.map((post) => (post._id === postId ? updater(post) : post)));
  };

  const handleCreatePost = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !user) return;

    const payload = draftToPayload(postDraft);
    if (!payload.content) return;

    setCreatingPost(true);
    try {
      const created = await createPost(token, payload);
      const hydrated = {
        ...created,
        authorId: created.authorId ?? user.id,
        authorDisplayName: created.authorDisplayName || user.name,
        ...(created.authorAvatar || user.avatar
          ? { authorAvatar: created.authorAvatar || user.avatar }
          : {}),
      };
      setPosts((prev) => sortPosts([hydrated, ...prev]));
      setPostDraft(EMPTY_POST_DRAFT);
      toast.success(TEXT.createdPost);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : TEXT.genericError);
    } finally {
      setCreatingPost(false);
    }
  };

  const startEditPost = (post: FeedPost) => {
    if (!isOwnPost(post)) return;
    setEditingPostId(post._id);
    setPostEditDraft(postToDraft(post));
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setPostEditDraft(EMPTY_POST_DRAFT);
  };

  const savePost = async (post: FeedPost) => {
    if (!token || !isOwnPost(post)) return;

    const payload = draftToPayload(postEditDraft);
    if (!payload.content) return;

    setPostBusyId(post._id);
    try {
      const updated = await updatePost(token, post._id, payload, post);
      patchPost(post._id, () => ({
        ...updated,
        _id: updated._id || post._id,
        authorId: updated.authorId ?? post.authorId,
      }));
      cancelEditPost();
      toast.success(TEXT.savedPost);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : TEXT.genericError);
    } finally {
      setPostBusyId(null);
    }
  };

  const removePost = async (post: FeedPost) => {
    if (!token || !isOwnPost(post)) return;
    if (!window.confirm(TEXT.deletePostConfirm)) return;

    setPostBusyId(post._id);
    try {
      await deletePost(token, post._id);
      setPosts((prev) => prev.filter((item) => item._id !== post._id));
      setCommentsByPost((prev) => omitKey(prev, post._id));
      setCommentsLoaded((prev) => omitKey(prev, post._id));
      setExpandedPosts((prev) => omitKey(prev, post._id));
      toast.success(TEXT.deletedPost);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : TEXT.genericError);
    } finally {
      setPostBusyId(null);
    }
  };

  const toggleComments = (postId: string) => {
    const nextOpen = !expandedPosts[postId];
    setExpandedPosts((prev) => ({ ...prev, [postId]: nextOpen }));

    if (nextOpen) {
      const previewOnly =
        !commentsLoaded[postId] ||
        (posts.find((p) => p._id === postId)?.commentsCount ?? 0) >
          (commentsByPost[postId]?.length ?? 0);
      void loadComments(postId, previewOnly);
    }
  };

  const toggleLike = async (post: FeedPost) => {
    if (!user || likeBusyIds[post._id]) return;
    if (!token) {
      toast.error(t("forum.loginMessage"));
      return;
    }

    const nextLiked = !post.likedByMe;
    const optimisticPost: FeedPost = {
      ...post,
      likedByMe: nextLiked,
      likesCount: Math.max(post.likesCount + (nextLiked ? 1 : -1), 0),
    };

    setLikeBusyIds((prev) => ({ ...prev, [post._id]: true }));
    patchPost(post._id, () => optimisticPost);

    try {
      const result = await togglePostLike(token, post._id, nextLiked, post);
      patchPost(post._id, (current) => {
        const updated = result.post ?? current;
        return {
          ...current,
          ...updated,
          _id: updated._id || current._id,
          authorId: updated.authorId ?? current.authorId,
          authorAvatar: updated.authorAvatar ?? current.authorAvatar,
          likedByMe: result.likedByMe ?? updated.likedByMe ?? optimisticPost.likedByMe,
          likesCount: result.likesCount ?? updated.likesCount ?? optimisticPost.likesCount,
        };
      });
      toast.success(nextLiked ? TEXT.liked : TEXT.unliked);
    } catch (error) {
      patchPost(post._id, () => post);
      toast.error(error instanceof Error ? error.message : TEXT.likeError);
    } finally {
      setLikeBusyIds((prev) => omitKey(prev, post._id));
    }
  };

  const createPostComment = async (post: FeedPost) => {
    if (!token || !user) return;

    const content = (commentDrafts[post._id] ?? "").trim();
    if (!content) return;

    setCommentBusyId(`new:${post._id}`);
    try {
      const created = await createComment(token, post._id, { content });
      const hydrated: FeedComment = {
        ...created,
        postId: created.postId ?? post._id,
        authorId: created.authorId ?? user.id,
        authorDisplayName: created.authorDisplayName || user.name,
        ...(created.authorAvatar || user.avatar
          ? { authorAvatar: created.authorAvatar || user.avatar }
          : {}),
        content: created.content || content,
      };

      setCommentsByPost((prev) => ({
        ...prev,
        [post._id]: [...(prev[post._id] ?? []), hydrated],
      }));
      setCommentsLoaded((prev) => ({ ...prev, [post._id]: true }));
      setExpandedPosts((prev) => ({ ...prev, [post._id]: true }));
      setCommentDrafts((prev) => ({ ...prev, [post._id]: "" }));
      patchPost(post._id, (item) => ({
        ...item,
        commentsCount: item.commentsCount + 1,
      }));
      toast.success(TEXT.createdComment);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : TEXT.genericError);
    } finally {
      setCommentBusyId(null);
    }
  };

  const startEditComment = (postId: string, comment: FeedComment) => {
    if (!isOwnComment(comment)) return;
    setEditingComment({ postId, commentId: comment._id });
    setCommentEditDraft(comment.content);
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setCommentEditDraft("");
  };

  const saveComment = async (postId: string, comment: FeedComment) => {
    if (!token || !isOwnComment(comment)) return;

    const content = commentEditDraft.trim();
    if (!content) return;

    setCommentBusyId(comment._id);
    try {
      const updated = await updateComment(token, postId, comment._id, { content }, comment);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).map((item) =>
          item._id === comment._id
            ? {
                ...updated,
                _id: updated._id || comment._id,
                authorId: updated.authorId ?? comment.authorId,
              }
            : item,
        ),
      }));
      cancelEditComment();
      toast.success(TEXT.savedComment);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : TEXT.genericError);
    } finally {
      setCommentBusyId(null);
    }
  };

  const removeComment = async (postId: string, comment: FeedComment) => {
    if (!token || !isOwnComment(comment)) return;
    if (!window.confirm(TEXT.deleteCommentConfirm)) return;

    setCommentBusyId(comment._id);
    try {
      await deleteComment(token, postId, comment._id);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter((item) => item._id !== comment._id),
      }));
      patchPost(postId, (item) => ({
        ...item,
        commentsCount: Math.max(item.commentsCount - 1, 0),
      }));
      toast.success(TEXT.deletedComment);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : TEXT.genericError);
    } finally {
      setCommentBusyId(null);
    }
  };

  const showEmptyFiltered = !isLoading && !isError && posts.length > 0 && filtered.length === 0;
  const showEmptyFeed = !isLoading && !isError && posts.length === 0;

  return (
    <>
      <PageMeta
        title={`${t("forum.eyebrow")} \u2014 PawPath`}
        description={t("forum.subtitle")}
        ogTitle={t("forum.title")}
        ogDescription={t("forum.subtitle")}
      />

      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {t("forum.eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {t("forum.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            {t("forum.subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ForumSidebar
              topics={tagOptions}
              filter={filter}
              onFilterChange={setFilter}
              query={query}
              onQueryChange={setQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              topicLabel={topicLabel}
              labels={{
                filters: t("forum.filters"),
                reset: t("forum.reset"),
                search: t("forum.search"),
                all: t("forum.all"),
              }}
            />
          </div>

          <div className="min-w-0 space-y-5">
            {canInteract ? (
              <form
                onSubmit={handleCreatePost}
                className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">{TEXT.composerTitle}</h2>
                  <p className="truncate text-xs text-muted-foreground">{user?.name}</p>
                </div>
                <Textarea
                  value={postDraft.content}
                  onChange={(event) =>
                    setPostDraft((prev) => ({ ...prev, content: event.target.value }))
                  }
                  placeholder={TEXT.contentPlaceholder}
                  className="min-h-[108px] resize-y"
                />
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs text-muted-foreground">{TEXT.tagsLabel}</p>
                  <ForumTagPicker
                    value={postDraft.tags}
                    onChange={(tags) => setPostDraft((prev) => ({ ...prev, tags }))}
                    topicLabel={topicLabel}
                    disabled={creatingPost}
                  />
                </div>
                <div className="mt-3">
                  <ForumImageUploader
                    token={token}
                    value={postDraft.imageUrls}
                    onChange={(imageUrls) => setPostDraft((prev) => ({ ...prev, imageUrls }))}
                    disabled={creatingPost}
                    labels={{
                      add: TEXT.addImages,
                      uploading: TEXT.uploading,
                      hint: TEXT.imageHint,
                      remove: TEXT.removeImage,
                    }}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={creatingPost || !postDraft.content.trim()}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {creatingPost ? TEXT.creatingPost : TEXT.createPost}
                  </Button>
                </div>
              </form>
            ) : (
              <LoginPrompt title={t("forum.loginTitle")} message={t("forum.loginMessage")} />
            )}

            <div className="min-h-[280px]">
              {isLoading ? (
                <FeedSkeleton viewMode={viewMode} />
              ) : isError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{TEXT.feedErrorTitle}</AlertTitle>
                  <AlertDescription>
                    <p>{TEXT.feedErrorBody}</p>
                    {errorMessage ? (
                      <p className="mt-1 text-xs opacity-80">{errorMessage}</p>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-1.5"
                      onClick={() => void loadFeed()}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {TEXT.retry}
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : showEmptyFeed ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  {t("forum.empty")}
                </div>
              ) : showEmptyFiltered ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  {TEXT.emptyFiltered}
                </div>
              ) : (
                <div
                  className={cn(
                    "gap-5",
                    viewMode === "grid" ? "grid sm:grid-cols-2" : "flex flex-col",
                  )}
                >
                  {filtered.map((post) => (
                    <ForumPostCard
                      key={post._id}
                      post={post}
                      comments={commentsByPost[post._id] ?? []}
                      commentsLoaded={Boolean(commentsLoaded[post._id])}
                      commentsLoading={Boolean(commentsLoading[post._id])}
                      commentsError={commentsError[post._id]}
                      isCommentsOpen={Boolean(expandedPosts[post._id])}
                      canInteract={canInteract}
                      canEditPost={isOwnPost(post)}
                      isEditingPost={editingPostId === post._id}
                      postEditDraft={postEditDraft}
                      postBusy={postBusyId === post._id}
                      likeBusy={Boolean(likeBusyIds[post._id])}
                      commentDraft={commentDrafts[post._id] ?? ""}
                      editingCommentId={
                        editingComment?.postId === post._id ? editingComment.commentId : null
                      }
                      commentEditDraft={commentEditDraft}
                      commentBusyId={commentBusyId}
                      uploadToken={token}
                      compact={viewMode === "grid"}
                      topicLabel={topicLabel}
                      canEditComment={isOwnComment}
                      onToggleComments={() => toggleComments(post._id)}
                      onStartEditPost={() => startEditPost(post)}
                      onCancelEditPost={cancelEditPost}
                      onPostEditDraftChange={setPostEditDraft}
                      onSavePost={() => void savePost(post)}
                      onDeletePost={() => void removePost(post)}
                      onToggleLike={() => void toggleLike(post)}
                      onCommentDraftChange={(value) =>
                        setCommentDrafts((prev) => ({ ...prev, [post._id]: value }))
                      }
                      onSubmitComment={() => void createPostComment(post)}
                      onStartEditComment={(comment) => startEditComment(post._id, comment)}
                      onCancelEditComment={cancelEditComment}
                      onCommentEditDraftChange={setCommentEditDraft}
                      onSaveComment={(comment) => void saveComment(post._id, comment)}
                      onDeleteComment={(comment) => void removeComment(post._id, comment)}
                      labels={{
                        comments: t("forum.comments"),
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
