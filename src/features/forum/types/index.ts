export interface ForumReply {
  id: string;
  authorId: string;
  authorName: string;
  /** Optional photo URL; falls back to initials */
  avatarUrl?: string;
  /** Role / status chip, e.g. "Verified" */
  badge?: string;
  body: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  authorId: string;
  authorName: string;
  /** Emoji fallback when no avatarUrl */
  avatar: string;
  avatarUrl?: string;
  badge?: string;
  topic: string;
  /** Extra tags shown under the title */
  tags?: string[];
  title: string;
  body: string;
  images?: string[];
  upvotes: number;
  upvoted: boolean;
  promotedToGuide: boolean;
  createdAt: string;
  replies: ForumReply[];
}
