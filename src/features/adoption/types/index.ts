export type AdoptionStatus = "pending" | "approved" | "rejected" | "picked_up" | "completed";

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  adopterId: string;
  adopterName: string;
  message: string;
  status: AdoptionStatus;
  createdAt: string;
  updatedAt: string;
}
