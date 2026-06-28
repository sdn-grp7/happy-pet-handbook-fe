/** Types aligned with BE Feature Modules (SDN Architecture) */

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  googleId?: string;
  createdAt: string;
}

export type GuideCategory = "basics" | "nutrition" | "training" | "health";

export interface GuideSection {
  title: string;
  paragraphs: string[];
  checklist?: string[];
  tips?: { do: string; dont: string };
}

export interface GuideArticle {
  id: string;
  category: GuideCategory;
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: GuideSection[];
  published: boolean;
  updatedAt: string;
}

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

export type PetSpecies = "dog" | "cat" | "other";
export type ListingStatus = "available" | "pending" | "adopted";

export interface PetListing {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  description: string;
  images: string[];
  status: ListingStatus;
  postedById: string;
  postedByName: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
    /** Percent position for preview map */
    x: number;
    y: number;
  };
}

export type AdoptionStatus = "pending" | "approved" | "rejected" | "picked_up" | "completed";

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  adopterId: string;
  adopterName: string;
  message: string;
  status: AdoptionStatus;
  createdAt: string;
  updatedAt: string;
}

export type HistoryEventType = "vaccination" | "medical" | "ownership" | "note";

export interface PetHistoryEvent {
  id: string;
  petId: string;
  type: HistoryEventType;
  title: string;
  description: string;
  date: string;
  recordedBy: string;
}

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

export type CheckInStatus = "scheduled" | "submitted" | "overdue";

export interface PostAdoptionCheckIn {
  id: string;
  adoptionId: string;
  petId: string;
  petName: string;
  scheduledAt: string;
  status: CheckInStatus;
  healthReport?: string;
  photoUrl?: string;
  submittedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: "new" | "resolved";
}
