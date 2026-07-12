import { getPostAdoptionCheckIns } from "@/features/post-adoption/api/postAdoptionApi";
import { mockPetHistory, getHistoryByPetId } from "@/features/pet-history/mocks/data";
import type { PetHistoryEvent } from "@/features/pet-history/types";
import type { PostAdoptionCheckIn } from "@/features/post-adoption/types";
import { delay } from "@/shared/lib/delay";

function mapCheckInToHistoryEvent(checkIn: PostAdoptionCheckIn): PetHistoryEvent {
  const isSubmitted = checkIn.status === "submitted";
  return {
    id: `ci-${checkIn.id}`,
    petId: checkIn.petId,
    type: "postAdoption",
    title: isSubmitted ? "Check-in submitted" : "Scheduled check-in",
    titleKey: isSubmitted
      ? "petHistory.events.checkInSubmitted.title"
      : "petHistory.events.checkInScheduled.title",
    description: isSubmitted ? (checkIn.healthReport ?? "") : "",
    descriptionKey: isSubmitted ? undefined : "petHistory.events.checkInScheduled.description",
    date: checkIn.submittedAt ?? checkIn.scheduledAt,
    recordedBy: "Adopter",
    photoUrl: checkIn.photoUrl,
    healthReport: checkIn.healthReport,
  };
}

export async function getPetHistory(petId: string): Promise<PetHistoryEvent[]> {
  await delay();
  const history = getHistoryByPetId(petId);
  const checkIns = (await getPostAdoptionCheckIns(petId)).map(mapCheckInToHistoryEvent);
  return [...history, ...checkIns].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getAllPetHistory(): Promise<PetHistoryEvent[]> {
  await delay();
  const checkIns = (await getPostAdoptionCheckIns()).map(mapCheckInToHistoryEvent);
  return [...mockPetHistory, ...checkIns].sort((a, b) => b.date.localeCompare(a.date));
}
