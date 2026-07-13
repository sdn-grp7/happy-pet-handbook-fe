import { apiRequest } from "@/lib/api";
import { localizePet, localizePets } from "@/features/pets/localize";
import type { PetListing } from "@/features/pets/types";

type PetsResponse = { pets: PetListing[] };
type PetResponse = { pet: PetListing };

export async function getPets(): Promise<PetListing[]> {
  const data = await apiRequest<PetsResponse>("/api/pets");
  return localizePets(data.pets ?? []);
}

export async function getPetsAdoptedBy(userId: string): Promise<PetListing[]> {
  const data = await apiRequest<PetsResponse>(
    `/api/pets?adoptedBy=${encodeURIComponent(userId)}`,
  );
  return localizePets(data.pets ?? []);
}

export async function getAvailablePetListings(): Promise<PetListing[]> {
  const data = await apiRequest<PetsResponse>("/api/pets?status=available");
  return localizePets(data.pets ?? []);
}

export async function getPet(id: string): Promise<PetListing | undefined> {
  try {
    const data = await apiRequest<PetResponse>(`/api/pets/${encodeURIComponent(id)}`);
    return data.pet ? localizePet(data.pet) : undefined;
  } catch {
    return undefined;
  }
}

export async function getPetPickupLocations(): Promise<PetListing[]> {
  const data = await apiRequest<PetsResponse>("/api/pets/pickups");
  return localizePets(data.pets ?? []);
}

export async function createPet(
  token: string,
  body: {
    name: string;
    species: PetListing["species"];
    breed: PetListing["breed"];
    gender: PetListing["gender"];
    ageMonths: number;
    healthStatus: string;
    images: string[];
    weightKg?: number;
    intakeYear?: number;
    description?: string;
    notes?: string;
    zaloPhone?: string;
    pickup?: { address: string; lat?: number; lng?: number };
    code?: string;
  },
): Promise<PetListing> {
  const data = await apiRequest<PetResponse>("/api/pets", {
    method: "POST",
    token,
    body,
  });
  return localizePet(data.pet);
}

export async function addPetCheckIn(
  token: string,
  petId: string,
  body: { photoUrl: string; caption: string; date?: string },
): Promise<PetListing> {
  const data = await apiRequest<PetResponse>(`/api/pets/${encodeURIComponent(petId)}/check-ins`, {
    method: "POST",
    token,
    body,
  });
  return localizePet(data.pet);
}

export async function addPetVaccination(
  token: string,
  petId: string,
  body: {
    name: string;
    date: string;
    nextDue?: string;
    notes?: string;
    photoUrl?: string;
  },
): Promise<PetListing> {
  const data = await apiRequest<PetResponse>(
    `/api/pets/${encodeURIComponent(petId)}/vaccinations`,
    { method: "POST", token, body },
  );
  return localizePet(data.pet);
}
