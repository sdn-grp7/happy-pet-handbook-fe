import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  Users,
  TrendingUp,
  PawPrint,
  BookMarked,
} from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { LoginPrompt } from "@/features/auth/components/LoginPrompt";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { getForumThreads, FORUM_TOPICS } from "@/features/forum/api/forumApi";
import type { ForumThread } from "@/features/forum/types";
import { useI18n } from "@/i18n/I18nContext";

const TOPICS = FORUM_TOPICS;

type Post = {
  id: string;
  author: string;
  avatar: string;
  topic: string;
  title: string;
  body: string;
  createdAt: number;
  likes: number;
  liked: boolean;
  promotedToGuide: boolean;
  comments: { id: string; author: string; body: string; createdAt: number }[];
};

function threadToPost(t: ForumThread): Post {
  return {
    id: t.id,
    author: t.authorName,
    avatar: t.avatar,
    topic: t.topic,
    title: t.title,
    body: t.body,
    createdAt: new Date(t.createdAt).getTime(),
    likes: t.upvotes,
    liked: t.upvoted,
    promotedToGuide: t.promotedToGuide,
    comments: t.replies.map((r) => ({
      id: r.id,
      author: r.authorName,
      body: r.body,
      createdAt: new Date(r.createdAt).getTime(),
    })),
  };
}

const STORAGE_KEY = "pawpath-forum-v1";

function loadPosts(fallback: Post[]): Post[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as Post[];
  } catch {
    return fallback;
  }
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function CommunityPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const canInteract = Boolean(user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<(typeof TOPICS)[number] | "All">("All");
  const [draft, setDraft] = useState({
    author: "",
    topic: "Basics" as (typeof TOPICS)[number],
    title: "",
    body: "",
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    getForumThreads().then((threads) => {
      const mapped = threads.map(threadToPost);
      setPosts(loadPosts(mapped));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts, hydrated]);

  const filtered = useMemo(
    () =>
      (filter === "All" ? posts : posts.filter((p) => p.topic === filter))
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts, filter],
  );

  const stats = useMemo(() => {
    const members = new Set(posts.map((p) => p.author));
    posts.forEach((p) => p.comments.forEach((c) => members.add(c.author)));
    return {
      members: members.size + 1240,
      posts: posts.length,
      likes: posts.reduce((n, p) => n + p.likes, 0),
    };
  }, [posts]);

  const submitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInteract || !user) return;
    if (!draft.title.trim() || !draft.body.trim()) return;
    const post: Post = {
      id: `p${Date.now()}`,
      author: user.name,
      avatar: "🐾",
      topic: draft.topic,
      title: draft.title.trim(),
      body: draft.body.trim(),
      createdAt: Date.now(),
      likes: 0,
      liked: false,
      promotedToGuide: false,
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
    setDraft({ author: user.name, topic: draft.topic, title: "", body: "" });
  };

  const toggleLike = (id: string) => {
    if (!canInteract) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
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
              comments: [
                ...p.comments,
                {
                  id: `c${Date.now()}`,
                  author: user.name,
                  body,
                  createdAt: Date.now(),
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
        title="Forum — PawPath"
        description="Threads and replies, Q&A community, upvotes, and promote to guide."
        ogTitle="PawPath Forum"
        ogDescription="A friendly forum for pet parents to share, learn, and support each other."
      />
      <PageHero
        eyebrow={t("forum.eyebrow")}
        title={t("forum.title")}
        subtitle={t("forum.subtitle")}
      />

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Users, label: "Members", value: stats.members.toLocaleString() },
            { icon: MessageCircle, label: "Discussions", value: stats.posts.toLocaleString() },
            { icon: Heart, label: "Hearts shared", value: stats.likes.toLocaleString() },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 shadow-[var(--shadow-card)]"
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center text-primary-foreground"
                style={{ background: "var(--gradient-warm)" }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div>
            {canInteract ? (
              <form
                onSubmit={submitPost}
                className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold">Start a discussion</h2>
                </div>
                <select
                  className="w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={draft.topic}
                  onChange={(e) =>
                    setDraft({ ...draft, topic: e.target.value as (typeof TOPICS)[number] })
                  }
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Give your post a title…"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
                <textarea
                  className="mt-3 w-full min-h-[110px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Share your story, question, or tip…"
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Posting as {user!.name}</p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:opacity-95 transition disabled:opacity-50"
                    style={{ background: "var(--gradient-warm)" }}
                    disabled={!draft.title.trim() || !draft.body.trim()}
                  >
                    Post <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              <LoginPrompt
                className="mb-8"
                title="Want to join the conversation?"
                message="Sign in to start a thread, reply, or upvote posts."
              />
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {(["All", ...TOPICS] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    filter === t
                      ? "bg-primary text-primary-foreground border-transparent"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                  No posts in this topic yet — be the first!
                </div>
              )}
              {filtered.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
                      style={{ background: "var(--gradient-soft)" }}
                    >
                      <span aria-hidden>{post.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{post.author}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/60 text-accent-foreground">
                          {post.topic}
                        </span>
                        {post.promotedToGuide && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1">
                            <BookMarked className="h-3 w-3" /> Promoted to guide
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          · {timeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 text-foreground/85 leading-relaxed whitespace-pre-line">
                    {post.body}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-sm">
                    {canInteract ? (
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border transition ${
                          post.liked
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
                        {post.likes}
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        state={{ from: "/forum" }}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground"
                      >
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </Link>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments.length}
                    </span>
                  </div>

                  {post.comments.length > 0 && (
                    <ul className="mt-5 space-y-3 border-t border-border pt-4">
                      {post.comments.map((c) => (
                        <li key={c.id} className="text-sm">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{c.author}</span>
                            <span>· {timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-foreground/85">{c.body}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {canInteract ? (
                    <div className="mt-4 flex gap-2">
                      <input
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="Write a kind reply…"
                        value={commentDrafts[post.id] || ""}
                        onChange={(e) =>
                          setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            submitComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition"
                      >
                        Reply
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-muted-foreground">
                      <Link
                        to="/login"
                        state={{ from: "/forum" }}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to reply
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Trending topics</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {TOPICS.map((t) => {
                  const count = posts.filter((p) => p.topic === t).length;
                  return (
                    <li key={t}>
                      <button
                        onClick={() => setFilter(t)}
                        className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted transition"
                      >
                        <span className="text-foreground">#{t.toLowerCase()}</span>
                        <span className="text-xs text-muted-foreground">
                          {count} post{count === 1 ? "" : "s"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div
              className="rounded-2xl p-5 text-primary-foreground shadow-[var(--shadow-soft)]"
              style={{ background: "var(--gradient-warm)" }}
            >
              <PawPrint className="h-6 w-6" />
              <h3 className="mt-3 font-semibold text-lg">Community guidelines</h3>
              <ul className="mt-2 space-y-1.5 text-sm/relaxed opacity-95">
                <li>· Be kind — every parent started as a beginner.</li>
                <li>· Share experience, not medical advice.</li>
                <li>· Credit sources when you can.</li>
                <li>· Celebrate small wins. They count.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
