export type CheckInStatus = "scheduled" | "submitted" | "overdue";

export interface PostAdoptionCheckIn {
  id: string;
  adoptionId: string;
  petId: string;
  petName: string;
  scheduledAt: string;
  status: CheckInStatus;
  healthReport?: string;
  photoUrl?: string;
  submittedAt?: string;
}
