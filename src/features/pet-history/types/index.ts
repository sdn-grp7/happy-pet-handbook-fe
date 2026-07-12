export type HistoryEventType = "vaccination" | "medical" | "ownership" | "note" | "postAdoption";

export interface PetHistoryEvent {
  id: string;
  petId: string;
  type: HistoryEventType;
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  date: string;
  recordedBy: string;
  photoUrl?: string;
  healthReport?: string;
}
