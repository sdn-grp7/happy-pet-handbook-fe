export type PetSpecies = "dog" | "cat" | "other";
export type ListingStatus = "available" | "pending" | "adopted";
export type PetGender = "male" | "female" | "unknown";

export interface PetVaccination {
  name: string;
  date: string;
  nextDue?: string;
  notes?: string;
}

/** Only present when a prior owner is known in the app (uncommon). */
export interface PreviousOwner {
  name: string;
  note?: string;
}

export interface PetListing {
  id: string;
  /** Public listing code shown to adopters */
  code: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  age: string;
  /** Omit when unknown on source */
  weightKg?: number;
  healthStatus: string;
  /** Omit when unknown on source */
  intakeYear?: number;
  /** Omit when source has no description */
  description?: string;
  /** Care notes — omit when unknown */
  notes?: string;
  images: string[];
  status: ListingStatus;
  /** Empty when source has no vaccine book */
  vaccinations: PetVaccination[];
  /** Rare — omit when unknown */
  previousOwner?: PreviousOwner | null;
  /** Zalo phone digits — omit when unknown on source */
  zaloPhone?: string;
  postedById: string;
  postedByName: string;
  pickup?: {
    address: string;
    lat?: number;
    lng?: number;
    x?: number;
    y?: number;
  };
}
