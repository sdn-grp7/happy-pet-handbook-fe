import type { PetHistoryEvent } from "@/features/pet-history/types";

export const mockPetHistory: PetHistoryEvent[] = [
  {
    id: "h1",
    petId: "pet4",
    type: "ownership",
    title: "Adopted by Sofia Nguyen",
    description: "Successful home visit and adoption contract signed.",
    date: "2025-04-15",
    recordedBy: "PawPath Admin",
  },
  {
    id: "h2",
    petId: "pet4",
    type: "vaccination",
    title: "Rabies booster",
    description: "Annual rabies vaccination administered at Westside Animal Hospital.",
    date: "2025-04-20",
    recordedBy: "Dr. Nguyen",
  },
  {
    id: "h3",
    petId: "pet4",
    type: "medical",
    title: "Hip check — clear",
    description: "Routine orthopedic exam. No issues noted.",
    date: "2025-05-10",
    recordedBy: "Dr. Nguyen",
  },
  {
    id: "h4",
    petId: "pet4",
    type: "note",
    title: "First beach visit",
    description: "Owner notes: cautious near waves but loved sand zoomies afterward.",
    date: "2025-05-18",
    recordedBy: "Sofia Nguyen",
  },
  {
    id: "h5",
    petId: "pet1",
    type: "vaccination",
    title: "DHPP series complete",
    description: "Final puppy vaccination in series.",
    date: "2025-05-01",
    recordedBy: "PawPath Rescue",
  },
  {
    id: "h6",
    petId: "pet1",
    type: "ownership",
    title: "Listed for adoption",
    description: "Intake from municipal shelter transfer program.",
    date: "2025-03-12",
    recordedBy: "PawPath Admin",
  },
  {
    id: "h7",
    petId: "pet3",
    type: "medical",
    title: "Neuter surgery",
    description: "Routine neuter, recovery uneventful.",
    date: "2025-02-08",
    recordedBy: "Happy Paws Clinic",
  },
  {
    id: "h8",
    petId: "pet2",
    type: "vaccination",
    title: "FVRCP kitten series",
    description: "Second dose administered. One booster remaining.",
    date: "2025-06-10",
    recordedBy: "PawPath Rescue",
  },
];

export function getHistoryByPetId(petId: string) {
  return mockPetHistory
    .filter((e) => e.petId === petId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
