import { format } from "date-fns";
import { MessageCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/features/forum/types";

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
  topicLabel: (topic: string) => string;
  labels: {
    comments: string;
  };
  compact?: boolean;
};

export function ForumPostCard({ post, topicLabel, labels, compact }: ForumPostCardProps) {
  const tags = post.tags ?? [];
  const visibleImages = post.imageUrls.slice(0, 4);
  const hiddenImageCount = Math.max(post.imageUrls.length - visibleImages.length, 0);

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
        </header>

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
              <div key={`${src}-${index}`} className="relative overflow-hidden rounded-lg bg-muted">
                <img src={src} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                {index === visibleImages.length - 1 && hiddenImageCount > 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/65 text-sm font-semibold text-foreground">
                    +{hiddenImageCount}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            {post.likesCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {post.commentsCount} {labels.comments}
          </span>
        </div>
      </div>
    </article>
  );
}
