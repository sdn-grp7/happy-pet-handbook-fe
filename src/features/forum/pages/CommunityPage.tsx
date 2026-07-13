import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeedPosts } from "@/features/forum/api/forumApi";
import {
  ForumSidebar,
  type ForumFilter,
  type ForumViewMode,
} from "@/features/forum/components/ForumSidebar";
import { ForumPostCard } from "@/features/forum/components/ForumPostCard";
import type { FeedPost } from "@/features/forum/types";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";

const KNOWN_TAG_KEYS: Record<string, TranslationKey> = {
  Basics: "forum.topicBasics",
  Nutrition: "forum.topicNutrition",
  Training: "forum.topicTraining",
  Health: "forum.topicHealth",
  Stories: "forum.topicStories",
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

export function CommunityPage() {
  const { t } = useI18n();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState<ForumFilter>("All");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ForumViewMode>("list");

  const loadFeed = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");

    try {
      const feedPosts = await getFeedPosts(signal);
      if (signal?.aborted) return;
      setPosts(feedPosts);
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

  const tagOptions = useMemo(
    () =>
      [...new Set(posts.flatMap((post) => post.tags ?? []).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [posts],
  );

  useEffect(() => {
    if (filter !== "All" && !tagOptions.includes(filter)) {
      setFilter("All");
    }
  }, [filter, tagOptions]);

  const topicLabel = (topic: string) => {
    const key = KNOWN_TAG_KEYS[topic];
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

  const showEmptyFiltered = !isLoading && !isError && posts.length > 0 && filtered.length === 0;
  const showEmptyFeed = !isLoading && !isError && posts.length === 0;

  return (
    <>
      <PageMeta
        title={`${t("forum.eyebrow")} — PawPath`}
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

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
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

          <div className="min-w-0">
            {isLoading ? (
              <FeedSkeleton viewMode={viewMode} />
            ) : isError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Không tải được Feed</AlertTitle>
                <AlertDescription>
                  <p>Backend chưa phản hồi hoặc endpoint Feed đang lỗi.</p>
                  {errorMessage ? <p className="mt-1 text-xs opacity-80">{errorMessage}</p> : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={() => void loadFeed()}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Thử lại
                  </Button>
                </AlertDescription>
              </Alert>
            ) : showEmptyFeed ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                {t("forum.empty")}
              </div>
            ) : showEmptyFiltered ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Không có bài viết nào khớp bộ lọc hiện tại.
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
                    compact={viewMode === "grid"}
                    topicLabel={topicLabel}
                    labels={{
                      comments: t("forum.comments"),
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
