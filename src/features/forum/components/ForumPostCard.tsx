import type { FormEvent } from "react";
import { format } from "date-fns";
import { Edit3, Heart, MessageCircle, Save, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FeedComment, FeedPost } from "@/features/forum/types";

const TEXT = {
  edit: "S\u1eeda",
  delete: "X\u00f3a",
  save: "L\u01b0u",
  cancel: "H\u1ee7y",
  tags: "Tag, c\u00e1ch nhau b\u1eb1ng d\u1ea5u ph\u1ea9y",
  images: "URL \u1ea3nh, m\u1ed7i d\u00f2ng m\u1ed9t link",
  content: "N\u1ed9i dung b\u00e0i vi\u1ebft",
  comments: "B\u00ecnh lu\u1eadn",
  hideComments: "\u1ea8n b\u00ecnh lu\u1eadn",
  noComments: "Ch\u01b0a c\u00f3 b\u00ecnh lu\u1eadn n\u00e0o.",
  commentPlaceholder: "Vi\u1ebft b\u00ecnh lu\u1eadn...",
  signInToComment: "\u0110\u0103ng nh\u1eadp \u0111\u1ec3 b\u00ecnh lu\u1eadn.",
};

export type ForumPostDraft = {
  content: string;
  tagsText: string;
  imageUrlsText: string;
};

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
      )}
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function formatStamp(iso: string) {
  try {
    return format(new Date(iso), "HH:mm dd/MM/yyyy");
  } catch {
    return iso;
  }
}

type ForumPostCardProps = {
  post: FeedPost;
  comments: FeedComment[];
  commentsLoaded: boolean;
  commentsLoading: boolean;
  commentsError?: string;
  isCommentsOpen: boolean;
  canInteract: boolean;
  canEditPost: boolean;
  isEditingPost: boolean;
  postEditDraft: ForumPostDraft;
  postBusy: boolean;
  likeBusy: boolean;
  commentDraft: string;
  editingCommentId: string | null;
  commentEditDraft: string;
  commentBusyId: string | null;
  topicLabel: (topic: string) => string;
  canEditComment: (comment: FeedComment) => boolean;
  onToggleComments: () => void;
  onStartEditPost: () => void;
  onCancelEditPost: () => void;
  onPostEditDraftChange: (draft: ForumPostDraft) => void;
  onSavePost: () => void;
  onDeletePost: () => void;
  onToggleLike: () => void;
  onCommentDraftChange: (value: string) => void;
  onSubmitComment: () => void;
  onStartEditComment: (comment: FeedComment) => void;
  onCancelEditComment: () => void;
  onCommentEditDraftChange: (value: string) => void;
  onSaveComment: (comment: FeedComment) => void;
  onDeleteComment: (comment: FeedComment) => void;
  labels: {
    comments: string;
  };
  compact?: boolean;
};

export function ForumPostCard({
  post,
  comments,
  commentsLoaded,
  commentsLoading,
  commentsError,
  isCommentsOpen,
  canInteract,
  canEditPost,
  isEditingPost,
  postEditDraft,
  postBusy,
  likeBusy,
  commentDraft,
  editingCommentId,
  commentEditDraft,
  commentBusyId,
  topicLabel,
  canEditComment,
  onToggleComments,
  onStartEditPost,
  onCancelEditPost,
  onPostEditDraftChange,
  onSavePost,
  onDeletePost,
  onToggleLike,
  onCommentDraftChange,
  onSubmitComment,
  onStartEditComment,
  onCancelEditComment,
  onCommentEditDraftChange,
  onSaveComment,
  onDeleteComment,
  labels,
  compact,
}: ForumPostCardProps) {
  const tags = post.tags ?? [];
  const visibleImages = post.imageUrls.slice(0, 4);
  const hiddenImageCount = Math.max(post.imageUrls.length - visibleImages.length, 0);

  const submitPostEdit = (event: FormEvent) => {
    event.preventDefault();
    onSavePost();
  };

  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    onSubmitComment();
  };

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className={cn("p-5", compact && "p-4")}>
        <header className="flex items-start gap-3">
          <Avatar name={post.authorDisplayName} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-foreground">{post.authorDisplayName}</span>
              <span className="text-xs text-muted-foreground">{formatStamp(post.createdAt)}</span>
            </div>
          </div>

          {canEditPost ? (
            <div className="flex shrink-0 items-center gap-1">
              {isEditingPost ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onCancelEditPost}
                  aria-label={TEXT.cancel}
                  disabled={postBusy}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onStartEditPost}
                  aria-label={TEXT.edit}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDeletePost}
                aria-label={TEXT.delete}
                disabled={postBusy}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </header>

        {isEditingPost ? (
          <form onSubmit={submitPostEdit} className="mt-4 space-y-3">
            <Textarea
              value={postEditDraft.content}
              onChange={(event) =>
                onPostEditDraftChange({ ...postEditDraft, content: event.target.value })
              }
              placeholder={TEXT.content}
              className="min-h-[112px]"
            />
            <Input
              value={postEditDraft.tagsText}
              onChange={(event) =>
                onPostEditDraftChange({ ...postEditDraft, tagsText: event.target.value })
              }
              placeholder={TEXT.tags}
            />
            <Textarea
              value={postEditDraft.imageUrlsText}
              onChange={(event) =>
                onPostEditDraftChange({ ...postEditDraft, imageUrlsText: event.target.value })
              }
              placeholder={TEXT.images}
              className="min-h-[76px]"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onCancelEditPost}>
                <X className="h-3.5 w-3.5" />
                {TEXT.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={postBusy || !postEditDraft.content.trim()}>
                <Save className="h-3.5 w-3.5" />
                {TEXT.save}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {topicLabel(tag) !== tag ? topicLabel(tag) : tag}
                  </span>
                ))}
              </div>
            ) : null}

            <p
              className={cn(
                "mt-3 whitespace-pre-line leading-relaxed text-foreground/85",
                compact ? "line-clamp-3 text-sm" : "text-sm md:text-[15px]",
              )}
            >
              {post.content}
            </p>

            {visibleImages.length > 0 ? (
              <div
                className={cn(
                  "mt-4 grid gap-2",
                  visibleImages.length === 1 && "grid-cols-1",
                  visibleImages.length === 2 && "grid-cols-2",
                  visibleImages.length >= 3 && "grid-cols-2",
                )}
              >
                {visibleImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={src}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                    {index === visibleImages.length - 1 && hiddenImageCount > 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/65 text-sm font-semibold text-foreground">
                        +{hiddenImageCount}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={onToggleLike}
            disabled={!canInteract || likeBusy}
            className={cn(
              "inline-flex items-center gap-1.5 transition hover:text-foreground disabled:cursor-default disabled:opacity-60",
              post.likedByMe && "text-primary",
            )}
            aria-pressed={Boolean(post.likedByMe)}
          >
            <Heart className={cn("h-4 w-4", post.likedByMe && "fill-current")} />
            {post.likesCount}
          </button>
          <button
            type="button"
            onClick={onToggleComments}
            className="inline-flex items-center gap-1.5 transition hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentsCount} {labels.comments}
          </button>
        </div>
      </div>

      {isCommentsOpen ? (
        <div className="border-t border-border bg-muted/20 px-5 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">{TEXT.comments}</h3>
            <Button type="button" variant="ghost" size="sm" onClick={onToggleComments}>
              {TEXT.hideComments}
            </Button>
          </div>

          {commentsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-5/6" />
            </div>
          ) : commentsError ? (
            <p className="text-sm text-destructive">{commentsError}</p>
          ) : commentsLoaded && comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{TEXT.noComments}</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => {
                const canEdit = canEditComment(comment);
                const isEditing = editingCommentId === comment._id;
                const busy = commentBusyId === comment._id;

                return (
                  <li key={comment._id} className="flex gap-2.5">
                    <Avatar name={comment.authorDisplayName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-semibold">{comment.authorDisplayName}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatStamp(comment.createdAt)}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            value={commentEditDraft}
                            onChange={(event) => onCommentEditDraftChange(event.target.value)}
                            className="min-h-[72px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={onCancelEditComment}
                            >
                              <X className="h-3.5 w-3.5" />
                              {TEXT.cancel}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => onSaveComment(comment)}
                              disabled={busy || !commentEditDraft.trim()}
                            >
                              <Save className="h-3.5 w-3.5" />
                              {TEXT.save}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                          {comment.content}
                        </p>
                      )}
                    </div>

                    {canEdit && !isEditing ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onStartEditComment(comment)}
                          aria-label={TEXT.edit}
                          disabled={busy}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDeleteComment(comment)}
                          aria-label={TEXT.delete}
                          disabled={busy}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          {canInteract ? (
            <form onSubmit={submitComment} className={cn("flex gap-2", commentsLoaded && "mt-4")}>
              <Input
                value={commentDraft}
                onChange={(event) => onCommentDraftChange(event.target.value)}
                placeholder={TEXT.commentPlaceholder}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0"
                disabled={!commentDraft.trim() || Boolean(commentBusyId)}
                aria-label={TEXT.commentPlaceholder}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">{TEXT.signInToComment}</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
