export type HistoryEventType = "vaccination" | "medical" | "ownership" | "note";

export interface PetHistoryEvent {
  id: string;
  petId: string;
  type: HistoryEventType;
  title: string;
  description: string;
  date: string;
  recordedBy: string;
}
