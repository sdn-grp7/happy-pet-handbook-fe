import { mockAdoptionRequests } from "@/features/adoption/mocks/data";
import type { AdoptionRequest } from "@/features/adoption/types";
import type { User } from "@/features/auth/types";
import { getPet } from "@/features/pets/api/petsApi";
import { delay } from "@/shared/lib/delay";

export async function getAdoptionRequests(userId?: string): Promise<AdoptionRequest[]> {
  await delay();
  if (userId) return mockAdoptionRequests.filter((a) => a.adopterId === userId);
  return mockAdoptionRequests;
}

export async function submitAdoptionRequest(
  petId: string,
  adopter: User,
  message: string,
): Promise<AdoptionRequest> {
  await delay(300);
  const pet = await getPet(petId);
  const req: AdoptionRequest = {
    id: `ad${Date.now()}`,
    petId,
    petName: pet?.name ?? "Unknown",
    adopterId: adopter.id,
    adopterName: adopter.name,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAdoptionRequests.unshift(req);
  return req;
}
