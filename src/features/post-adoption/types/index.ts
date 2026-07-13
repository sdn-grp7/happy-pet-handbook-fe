export type CheckInStatus = "scheduled" | "submitted" | "overdue";

export interface PostAdoptionUpdateInput {
  healthCondition: string;
  weightKg?: number;
  notes?: string;
  photoUrl?: string;
}

export interface PostAdoptionCheckIn {
  id: string;
  adoptionId: string;
  petId: string;
  petName: string;
  scheduledAt: string;
  status: CheckInStatus;
  healthCondition?: string;
  weightKg?: number;
  notes?: string;
  healthReport?: string;
  photoUrl?: string;
  submittedAt?: string;
}
