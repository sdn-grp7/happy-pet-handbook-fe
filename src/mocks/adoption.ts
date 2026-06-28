import type { AdoptionRequest } from "@/types/modules";

export const mockAdoptionRequests: AdoptionRequest[] = [
  {
    id: "ad1",
    petId: "pet3",
    petName: "Buddy",
    adopterId: "u1",
    adopterName: "Alex Nguyen",
    message: "We have a fenced yard and experience with large breeds. Happy to meet Buddy anytime.",
    status: "pending",
    createdAt: "2025-06-20T10:00:00Z",
    updatedAt: "2025-06-20T10:00:00Z",
  },
  {
    id: "ad2",
    petId: "pet4",
    petName: "Coco",
    adopterId: "u5",
    adopterName: "Sofia Nguyen",
    message: "Rescue parent — Coco will have daily beach walks and a calm home.",
    status: "completed",
    createdAt: "2025-04-01T09:00:00Z",
    updatedAt: "2025-04-15T14:30:00Z",
  },
  {
    id: "ad3",
    petId: "pet1",
    petName: "Luna",
    adopterId: "u4",
    adopterName: "Leo Tran",
    message: "Looking for a running companion. Luna seems perfect!",
    status: "approved",
    createdAt: "2025-06-25T08:00:00Z",
    updatedAt: "2025-06-26T11:00:00Z",
  },
];
