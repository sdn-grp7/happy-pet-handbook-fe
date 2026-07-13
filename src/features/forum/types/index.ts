export interface FeedPost {
  _id: string;
  authorDisplayName: string;
  content: string;
  imageUrls: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}
