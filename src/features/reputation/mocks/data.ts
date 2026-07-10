import type { ReputationProfile } from "@/features/reputation/types";

export const mockReputationProfiles: ReputationProfile[] = [
  {
    userId: "u5",
    userName: "Sofia Nguyen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
    trustScore: 4.9,
    reviewCount: 12,
    reviews: [
      {
        id: "rev1",
        reviewerId: "u3",
        reviewerName: "PawPath Admin",
        rating: 5,
        comment: "Excellent post-adoption check-ins. Coco is thriving.",
        createdAt: "2025-05-20T00:00:00Z",
      },
      {
        id: "rev2",
        reviewerId: "u2",
        reviewerName: "Maya & Biscuit",
        rating: 5,
        comment: "Responsive and caring adopter. Highly recommend.",
        createdAt: "2025-04-18T00:00:00Z",
      },
    ],
  },
  {
    userId: "u2",
    userName: "Maya & Biscuit",
    trustScore: 4.7,
    reviewCount: 8,
    reviews: [
      {
        id: "rev3",
        reviewerId: "u4",
        reviewerName: "Leo Tran",
        rating: 5,
        comment: "Great foster experience — very transparent about Buddy's needs.",
        createdAt: "2025-06-01T00:00:00Z",
      },
    ],
  },
  {
    userId: "u1",
    userName: "Alex Nguyen",
    trustScore: 4.2,
    reviewCount: 3,
    reviews: [
      {
        id: "rev4",
        reviewerId: "u3",
        reviewerName: "PawPath Admin",
        rating: 4,
        comment: "Pending adoption — initial application looks promising.",
        createdAt: "2025-06-21T00:00:00Z",
      },
    ],
  },
  {
    userId: "u4",
    userName: "Leo Tran",
    trustScore: 4.5,
    reviewCount: 5,
    reviews: [
      {
        id: "rev5",
        reviewerId: "u5",
        reviewerName: "Sofia Nguyen",
        rating: 5,
        comment: "Reliable and kind — would adopt from again.",
        createdAt: "2025-05-05T00:00:00Z",
      },
    ],
  },
];

export function getReputationByUserId(userId: string) {
  return mockReputationProfiles.find((p) => p.userId === userId);
}
