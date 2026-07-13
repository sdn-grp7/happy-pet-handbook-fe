import {
  mockPets,
  getLocalizedPets,
  getPetById,
  getAvailablePets,
  getPickupLocations,
  addPetVaccinationToMock,
  updatePetCareStatusInMock,
} from "@/features/pets/mocks/data";
import type { PetListing, PetVaccination } from "@/features/pets/types";
import { delay } from "@/shared/lib/delay";

export async function getPets(): Promise<PetListing[]> {
  await delay();
  return getLocalizedPets(mockPets);
}

export async function getAvailablePetListings(): Promise<PetListing[]> {
  await delay();
  return getAvailablePets();
}

export async function getPet(id: string): Promise<PetListing | undefined> {
  await delay();
  return getPetById(id);
}

export async function getPetPickupLocations(): Promise<PetListing[]> {
  await delay();
  return getPickupLocations();
}

export async function addPetVaccination(
  petId: string,
  vaccination: PetVaccination,
): Promise<PetListing | undefined> {
  await delay(200);
  return addPetVaccinationToMock(petId, vaccination);
}

export async function updatePetCareStatus(
  petId: string,
  update: {
    healthStatus?: string;
    weightKg?: number;
    notes?: string;
    photoUrl?: string;
  },
): Promise<PetListing | undefined> {
  await delay(200);
  return updatePetCareStatusInMock(petId, update);
}
