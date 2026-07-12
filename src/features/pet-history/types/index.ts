export type HistoryEventType = "vaccination" | "medical" | "ownership" | "note";

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
}
