import { format } from "date-fns";
import { MessageCircle, Send, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ForumThread } from "@/features/forum/types";

function Avatar({
  name,
  url,
  emoji,
  size = "md",
}: {
  name: string;
  url?: string;
  emoji?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  if (url) {
    return (
      <img src={url} alt="" className={cn(dim, "shrink-0 rounded-full object-cover bg-muted")} />
    );
  }
  return (
    <div
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
      )}
      aria-hidden
    >
      {emoji || name.slice(0, 1)}
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
  post: ForumThread;
  canInteract: boolean;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onSubmitComment: () => void;
  onToggleLike: () => void;
  topicLabel: (topic: string) => string;
  labels: {
    comments: string;
    commentPlaceholder: string;
    signInToReply: string;
    signIn: string;
  };
  compact?: boolean;
};

export function ForumPostCard({
  post,
  canInteract,
  commentDraft,
  onCommentDraftChange,
  onSubmitComment,
  onToggleLike,
  topicLabel,
  labels,
  compact,
}: ForumPostCardProps) {
  const tags = post.tags?.length ? post.tags : [post.topic];

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className={cn("p-5", compact && "p-4")}>
        <header className="flex items-start gap-3">
          <Avatar name={post.authorName} url={post.avatarUrl} emoji={post.avatar} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-foreground">{post.authorName}</span>
              {post.badge ? (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {post.badge}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">{formatStamp(post.createdAt)}</span>
            </div>
          </div>
        </header>

        <h3
          className={cn(
            "mt-3 font-semibold tracking-tight text-foreground",
            compact ? "text-base" : "text-lg",
          )}
        >
          {post.title}
        </h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {topicLabel(tag) !== tag ? topicLabel(tag) : tag}
            </span>
          ))}
        </div>

        <p
          className={cn(
            "mt-3 whitespace-pre-line leading-relaxed text-foreground/85",
            compact ? "line-clamp-3 text-sm" : "text-sm md:text-[15px]",
          )}
        >
          {post.body}
        </p>

        {post.images && post.images.length > 0 ? (
          <div
            className={cn(
              "mt-4 grid gap-2",
              post.images.length === 1 && "grid-cols-1",
              post.images.length === 2 && "grid-cols-2",
              post.images.length >= 3 && "grid-cols-3",
            )}
          >
            {post.images.slice(0, 3).map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="aspect-[4/3] w-full rounded-lg object-cover bg-muted"
                loading="lazy"
              />
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          {canInteract ? (
            <button
              type="button"
              onClick={onToggleLike}
              className={cn(
                "inline-flex items-center gap-1.5 transition hover:text-foreground",
                post.upvoted && "text-primary",
              )}
            >
              <Heart className={cn("h-4 w-4", post.upvoted && "fill-current")} />
              {post.upvotes}
            </button>
          ) : (
            <Link
              to="/login"
              state={{ from: "/forum" }}
              className="inline-flex items-center gap-1.5 hover:text-foreground"
            >
              <Heart className="h-4 w-4" />
              {post.upvotes}
            </Link>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {post.replies.length} {labels.comments}
          </span>
        </div>
      </div>

      {(post.replies.length > 0 || canInteract) && (
        <div className="border-t border-border bg-muted/20 px-5 py-4">
          {post.replies.length > 0 && (
            <ul className="space-y-4">
              {post.replies.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Avatar name={c.authorName} url={c.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold">{c.authorName}</span>
                      {c.badge ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {c.badge}
                        </span>
                      ) : null}
                      <span className="text-[11px] text-muted-foreground">
                        {formatStamp(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/85">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {canInteract ? (
            <div className={cn("flex gap-2", post.replies.length > 0 && "mt-4")}>
              <Input
                value={commentDraft}
                onChange={(e) => onCommentDraftChange(e.target.value)}
                placeholder={labels.commentPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSubmitComment();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                className="shrink-0"
                onClick={onSubmitComment}
                disabled={!commentDraft.trim()}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className={cn("text-xs text-muted-foreground", post.replies.length > 0 && "mt-3")}>
              <Link to="/login" state={{ from: "/forum" }} className="text-primary hover:underline">
                {labels.signIn}
              </Link>{" "}
              {labels.signInToReply}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
