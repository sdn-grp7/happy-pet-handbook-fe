export type AdoptionStatus = "pending" | "approved" | "rejected";

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  petCode?: string;
  petImage?: string;
  adopterId: string;
  adopterName: string;
  adopterAvatar?: string;
  message: string;
  status: AdoptionStatus;
  ownerId?: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
}
