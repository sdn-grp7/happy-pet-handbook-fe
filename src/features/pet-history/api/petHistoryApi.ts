import { mockPetHistory, getHistoryByPetId } from "@/features/pet-history/mocks/data";
import type { PetHistoryEvent } from "@/features/pet-history/types";
import { delay } from "@/shared/lib/delay";

export async function getPetHistory(petId: string): Promise<PetHistoryEvent[]> {
  await delay();
  return getHistoryByPetId(petId);
}

export async function getAllPetHistory(): Promise<PetHistoryEvent[]> {
  await delay();
  return mockPetHistory;
}
