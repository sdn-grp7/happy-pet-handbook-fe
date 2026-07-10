export interface ForumReply {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  authorId: string;
  authorName: string;
  avatar: string;
  topic: string;
  title: string;
  body: string;
  upvotes: number;
  upvoted: boolean;
  promotedToGuide: boolean;
  createdAt: string;
  replies: ForumReply[];
}
