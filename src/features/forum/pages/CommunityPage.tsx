import { useEffect, useMemo, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { LoginPrompt } from "@/features/auth/components/LoginPrompt";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { getForumThreads, FORUM_TOPICS } from "@/features/forum/api/forumApi";
import {
  ForumSidebar,
  type ForumFilter,
  type ForumViewMode,
} from "@/features/forum/components/ForumSidebar";
import { ForumPostCard } from "@/features/forum/components/ForumPostCard";
import type { ForumThread } from "@/features/forum/types";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pawpath-forum-v2";

const TOPIC_KEYS: Record<(typeof FORUM_TOPICS)[number], TranslationKey> = {
  Basics: "forum.topicBasics",
  Nutrition: "forum.topicNutrition",
  Training: "forum.topicTraining",
  Health: "forum.topicHealth",
  Stories: "forum.topicStories",
};

function loadPosts(fallback: ForumThread[]): ForumThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as ForumThread[];
  } catch {
    return fallback;
  }
}

export function CommunityPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const canInteract = Boolean(user);

  const [posts, setPosts] = useState<ForumThread[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<ForumFilter>("All");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ForumViewMode>("list");
  const [draft, setDraft] = useState({
    topic: "Basics" as (typeof FORUM_TOPICS)[number],
    title: "",
    body: "",
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const topicLabel = (topic: string) => {
    const key = TOPIC_KEYS[topic as (typeof FORUM_TOPICS)[number]];
    return key ? t(key) : topic;
  };

  useEffect(() => {
    getForumThreads().then((threads) => {
      setPosts(loadPosts(threads));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts, hydrated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => (filter === "All" ? true : p.topic === filter))
      .filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          (p.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
        );
      })
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [posts, filter, query]);

  const submitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInteract || !user) return;
    if (!draft.title.trim() || !draft.body.trim()) return;
    const post: ForumThread = {
      id: `p${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      avatar: "🐾",
      avatarUrl: user.avatar,
      badge: "Member",
      topic: draft.topic,
      tags: [draft.topic],
      title: draft.title.trim(),
      body: draft.body.trim(),
      upvotes: 0,
      upvoted: false,
      promotedToGuide: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setPosts((prev) => [post, ...prev]);
    setDraft({ topic: draft.topic, title: "", body: "" });
  };

  const toggleLike = (id: string) => {
    if (!canInteract) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, upvoted: !p.upvoted, upvotes: p.upvotes + (p.upvoted ? -1 : 1) } : p,
      ),
    );
  };

  const submitComment = (postId: string) => {
    if (!canInteract || !user) return;
    const body = (commentDrafts[postId] || "").trim();
    if (!body) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [
                ...p.replies,
                {
                  id: `c${Date.now()}`,
                  authorId: user.id,
                  authorName: user.name,
                  avatarUrl: user.avatar,
                  badge: "Member",
                  body,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : p,
      ),
    );
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
  };

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

          <div className="min-w-0 space-y-5">
            {canInteract ? (
              <form
                onSubmit={submitPost}
                className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">{t("forum.startDiscussion")}</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={draft.topic}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        topic: e.target.value as (typeof FORUM_TOPICS)[number],
                      })
                    }
                  >
                    {FORUM_TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topicLabel(topic)}
                      </option>
                    ))}
                  </select>
                  <Input
                    className="flex-1"
                    placeholder={t("forum.titlePlaceholder")}
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </div>
                <textarea
                  className="mt-3 min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder={t("forum.bodyPlaceholder")}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {t("forum.postingAs", { name: user!.name })}
                  </p>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5"
                    disabled={!draft.title.trim() || !draft.body.trim()}
                  >
                    {t("forum.post")} <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            ) : (
              <LoginPrompt title={t("forum.loginTitle")} message={t("forum.loginMessage")} />
            )}

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                {t("forum.empty")}
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
                    key={post.id}
                    post={post}
                    compact={viewMode === "grid"}
                    canInteract={canInteract}
                    commentDraft={commentDrafts[post.id] || ""}
                    onCommentDraftChange={(value) =>
                      setCommentDrafts((d) => ({ ...d, [post.id]: value }))
                    }
                    onSubmitComment={() => submitComment(post.id)}
                    onToggleLike={() => toggleLike(post.id)}
                    topicLabel={topicLabel}
                    labels={{
                      comments: t("forum.comments"),
                      commentPlaceholder: t("forum.commentPlaceholder"),
                      signInToReply: t("forum.signInToReply"),
                      signIn: t("forum.signIn"),
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
