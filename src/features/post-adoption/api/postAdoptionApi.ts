import { mockAdoptionRequests } from "@/features/adoption/mocks/data";
import { mockPostAdoptionCheckIns, getCheckInsByPetId } from "@/features/post-adoption/mocks/data";
import { updatePetCareStatus } from "@/features/pets/api/petsApi";
import type { PetListing } from "@/features/pets/types";
import type {
  PostAdoptionCheckIn,
  PostAdoptionUpdateInput,
} from "@/features/post-adoption/types";
import { delay } from "@/shared/lib/delay";

export type SubmitCheckInResult = {
  checkIn: PostAdoptionCheckIn;
  pet?: PetListing;
};

function buildHealthReport(input: PostAdoptionUpdateInput) {
  const parts = [
    input.healthCondition.trim(),
    input.weightKg != null ? `Weight: ${input.weightKg} kg` : "",
    input.notes?.trim() ? `Notes: ${input.notes.trim()}` : "",
  ].filter(Boolean);

  return parts.join("\n");
}

export async function getPostAdoptionCheckIns(petId?: string): Promise<PostAdoptionCheckIn[]> {
  await delay();
  if (petId) return getCheckInsByPetId(petId);
  return mockPostAdoptionCheckIns;
}

export async function getPostAdoptionCheckInsForUser(
  userId: string,
): Promise<PostAdoptionCheckIn[]> {
  await delay();
  const adoptionIds = mockAdoptionRequests.filter((a) => a.adopterId === userId).map((a) => a.id);
  return mockPostAdoptionCheckIns.filter((c) => adoptionIds.includes(c.adoptionId));
}

export async function submitCheckIn(
  checkInId: string,
  input: PostAdoptionUpdateInput,
): Promise<SubmitCheckInResult | undefined> {
  await delay(300);
  const checkIn = mockPostAdoptionCheckIns.find((c) => c.id === checkInId);
  if (!checkIn) return undefined;

  const healthCondition = input.healthCondition.trim();
  const notes = input.notes?.trim();
  const photoUrl = input.photoUrl?.trim();

  // Mock-only update: submit the scheduled check-in and mirror its core fields onto the pet.
  checkIn.status = "submitted";
  checkIn.healthCondition = healthCondition;
  checkIn.weightKg = input.weightKg;
  checkIn.notes = notes;
  checkIn.healthReport = buildHealthReport({ ...input, healthCondition, notes, photoUrl });
  checkIn.photoUrl = photoUrl || undefined;
  checkIn.submittedAt = new Date().toISOString();

  const pet = await updatePetCareStatus(checkIn.petId, {
    healthStatus: healthCondition,
    weightKg: input.weightKg,
    notes,
    photoUrl,
  });

  return { checkIn, pet };
}
