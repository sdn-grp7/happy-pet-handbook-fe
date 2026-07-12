import type { AdoptionRequest } from "@/features/adoption/types";

export const mockAdoptionRequests: AdoptionRequest[] = [
  {
    id: "ad1",
    petId: "900255001491931",
    petName: "Gạo",
    adopterId: "u1",
    adopterName: "Alex Nguyen",
    message: "We have a fenced yard and experience with large breeds. Happy to meet Gạo anytime.",
    status: "pending",
    createdAt: "2025-06-20T10:00:00Z",
    updatedAt: "2025-06-20T10:00:00Z",
  },
  {
    id: "ad2",
    petId: "900255001490515",
    petName: "Hạt Tiêu",
    adopterId: "u5",
    adopterName: "Sofia Nguyen",
    message: "Rescue parent — Hạt Tiêu will have daily beach walks and a calm home.",
    status: "completed",
    createdAt: "2025-04-01T09:00:00Z",
    updatedAt: "2025-04-15T14:30:00Z",
  },
  {
    id: "ad3",
    petId: "900255001486308",
    petName: "Nấm",
    adopterId: "u4",
    adopterName: "Leo Tran",
    message: "Looking for a running companion. Nấm seems perfect!",
    status: "approved",
    createdAt: "2025-06-25T08:00:00Z",
    updatedAt: "2025-06-26T11:00:00Z",
  },
];
