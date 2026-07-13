import { apiRequest } from "@/lib/api";
import type { PendingTrustRating, ReputationProfile, Review } from "@/features/reputation/types";

type ProfilesResponse = { profiles: ReputationProfile[] };
type ProfileResponse = { profile: ReputationProfile };
type PendingResponse = { pending: PendingTrustRating[] };
type ReviewResponse = { review: Review };

export async function getReputationProfiles(): Promise<ReputationProfile[]> {
  const data = await apiRequest<ProfilesResponse>("/api/reputation");
  return data.profiles ?? [];
}

export async function getReputation(userId: string): Promise<ReputationProfile | undefined> {
  try {
    const data = await apiRequest<ProfileResponse>(
      `/api/reputation/users/${encodeURIComponent(userId)}`,
    );
    return data.profile;
  } catch {
    return undefined;
  }
}

export async function getPendingRatings(token: string): Promise<PendingTrustRating[]> {
  const data = await apiRequest<PendingResponse>("/api/reputation/pending", { token });
  return data.pending ?? [];
}

export async function submitRating(
  token: string,
  body: { petId: string; revieweeId: string; rating: number; comment?: string },
): Promise<Review> {
  const data = await apiRequest<ReviewResponse>("/api/reputation/ratings", {
    method: "POST",
    token,
    body,
  });
  return data.review;
}
