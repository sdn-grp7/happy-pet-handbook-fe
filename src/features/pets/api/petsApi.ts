import {
  mockPets,
  getPetById,
  getAvailablePets,
  getPickupLocations,
} from "@/features/pets/mocks/data";
import type { PetListing } from "@/features/pets/types";
import { delay } from "@/shared/lib/delay";

export async function getPets(): Promise<PetListing[]> {
  await delay();
  return mockPets;
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
