import { mockReputationProfiles, getReputationByUserId } from "@/features/reputation/mocks/data";
import type { ReputationProfile } from "@/features/reputation/types";
import { delay } from "@/shared/lib/delay";

export async function getReputationProfiles(): Promise<ReputationProfile[]> {
  await delay();
  return mockReputationProfiles;
}

export async function getReputation(userId: string): Promise<ReputationProfile | undefined> {
  await delay();
  return getReputationByUserId(userId);
}
