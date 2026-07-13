import { mockPostAdoptionCheckIns, getCheckInsByPetId } from "@/features/post-adoption/mocks/data";
import type { PostAdoptionCheckIn } from "@/features/post-adoption/types";
import { delay } from "@/shared/lib/delay";

export async function getPostAdoptionCheckIns(petId?: string): Promise<PostAdoptionCheckIn[]> {
  await delay();
  if (petId) return getCheckInsByPetId(petId);
  return mockPostAdoptionCheckIns;
}

export async function getPostAdoptionCheckInsForUser(
  _userId: string,
): Promise<PostAdoptionCheckIn[]> {
  await delay();
  // Post-adoption scheduling still mock; real check-ins live on ownership history.
  return [];
}

export async function submitCheckIn(
  checkInId: string,
  healthReport: string,
  photoUrl?: string,
): Promise<PostAdoptionCheckIn | undefined> {
  await delay(300);
  const checkIn = mockPostAdoptionCheckIns.find((c) => c.id === checkInId);
  if (!checkIn) return undefined;
  checkIn.status = "submitted";
  checkIn.healthReport = healthReport;
  checkIn.photoUrl = photoUrl;
  checkIn.submittedAt = new Date().toISOString();
  return checkIn;
}
