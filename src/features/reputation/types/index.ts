export interface Review {
  id: string;
  petId: string;
  petName: string;
  petCode: string;
  petImage?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  revieweeId: string;
  rating: number;
  comment?: string;
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

export interface PendingTrustRating {
  petId: string;
  petName: string;
  petCode: string;
  revieweeId: string;
  revieweeName: string;
  revieweeAvatar?: string;
  existingRating?: {
    id: string;
    rating: number;
    comment?: string;
  };
}
