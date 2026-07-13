export type PetSpecies = "dog" | "cat";
export type ListingStatus = "available" | "pending" | "adopted";
export type PetGender = "male" | "female" | "unknown";

/** Lightweight user attribution on pet history records. */
export type UserRef = {
  id: string;
  name: string;
  avatar?: string;
};

/** Manual fields and/or a photo of the vaccine booklet page. */
export interface PetVaccination {
  name: string;
  date: string;
  nextDue?: string;
  notes?: string;
  /** When set, this entry is a photo of the physical vaccine book. */
  photoUrl?: string;
  /** Who uploaded this vaccine entry. */
  uploadedBy: UserRef;
  uploadedAt?: string;
}

/** Check-in photo from a prior (or current) owner. */
export interface PriorCheckInPhoto {
  id: string;
  photoUrl: string;
  caption: string;
  date?: string;
  /** Who uploaded this photo — shown as the user name on the card. */
  uploadedBy: UserRef;
}

/** One ownership period for a pet (pets can have multiple prior owners). */
export interface PetOwnerRecord {
  id: string;
  user: UserRef;
  from: string;
  /** Missing = open-ended / most recent period. */
  to?: string;
  note?: string;
  checkIns: PriorCheckInPhoto[];
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
  /** Ownership history — 0..n prior/current owners over time */
  owners: PetOwnerRecord[];
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
