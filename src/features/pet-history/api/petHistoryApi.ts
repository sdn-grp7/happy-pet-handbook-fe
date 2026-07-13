import { getPet, getPets } from "@/features/pets/api/petsApi";
import type { PetListing } from "@/features/pets/types";
import type { PetHistoryEvent } from "@/features/pet-history/types";

function byDateDesc(a: { date: string }, b: { date: string }) {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return b.date.localeCompare(a.date);
}

function mapPetToHistoryEvents(pet: PetListing): PetHistoryEvent[] {
  const events: PetHistoryEvent[] = [];

  for (const v of pet.vaccinations ?? []) {
    events.push({
      id: `vax-${pet.id}-${v.name}-${v.date}`,
      petId: pet.id,
      type: "vaccination",
      title: v.name,
      description: v.notes ?? "",
      date: v.date || v.uploadedAt || "",
      recordedBy: v.uploadedBy.name,
      photoUrl: v.photoUrl,
    });
  }

  for (const o of pet.owners ?? []) {
    events.push({
      id: `own-${o.id}`,
      petId: pet.id,
      type: "ownership",
      title: o.note || o.user.name,
      description: o.note ?? "",
      date: o.from,
      recordedBy: o.user.name,
    });

    for (const c of o.checkIns ?? []) {
      events.push({
        id: c.id || `ci-${pet.id}-${c.photoUrl}`,
        petId: pet.id,
        type: "postAdoption",
        title: c.caption,
        titleKey: "petHistory.events.checkInSubmitted.title",
        description: c.caption,
        date: c.date ?? "",
        recordedBy: c.uploadedBy.name,
        photoUrl: c.photoUrl,
        healthReport: c.caption,
      });
    }
  }

  return events.sort(byDateDesc);
}

export async function getPetHistory(petId: string): Promise<PetHistoryEvent[]> {
  const pet = await getPet(petId);
  if (!pet) return [];
  return mapPetToHistoryEvents(pet);
}

export async function getAllPetHistory(): Promise<PetHistoryEvent[]> {
  const pets = await getPets();
  return pets.flatMap(mapPetToHistoryEvents).sort(byDateDesc);
}
