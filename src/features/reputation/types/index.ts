export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReputationProfile {
  userId: string;
  userName: string;
  avatar?: string;
  trustScore: number;
  reviewCount: number;
  reviews: Review[];
}
