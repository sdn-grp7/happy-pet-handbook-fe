import type { PostAdoptionCheckIn } from "@/features/post-adoption/types";

export const mockPostAdoptionCheckIns: PostAdoptionCheckIn[] = [
  {
    id: "ci1",
    adoptionId: "ad2",
    petId: "900255001490515",
    petName: "Hạt Tiêu",
    scheduledAt: "2025-04-22T10:00:00Z",
    status: "submitted",
    healthReport: "Eating well, energy high. Slight hesitation near water still.",
    photoUrl: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=300&fit=crop",
    submittedAt: "2025-04-22T11:30:00Z",
  },
  {
    id: "ci2",
    adoptionId: "ad2",
    petId: "900255001490515",
    petName: "Hạt Tiêu",
    scheduledAt: "2025-05-22T10:00:00Z",
    status: "submitted",
    healthReport: "Weight stable. Loves beach walks — still avoids deep water.",
    photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
    submittedAt: "2025-05-22T09:45:00Z",
  },
  {
    id: "ci3",
    adoptionId: "ad2",
    petId: "900255001490515",
    petName: "Hạt Tiêu",
    scheduledAt: "2025-06-22T10:00:00Z",
    status: "scheduled",
  },
  {
    id: "ci4",
    adoptionId: "ad1",
    petId: "900255001491931",
    petName: "Gạo",
    scheduledAt: "2025-07-01T10:00:00Z",
    status: "scheduled",
  },
];

export function getCheckInsByAdopter(adopterId: string, adoptionIds: string[]) {
  return mockPostAdoptionCheckIns.filter((c) => adoptionIds.includes(c.adoptionId));
}

export function getCheckInsByPetId(petId: string) {
  return mockPostAdoptionCheckIns.filter((c) => c.petId === petId);
}
