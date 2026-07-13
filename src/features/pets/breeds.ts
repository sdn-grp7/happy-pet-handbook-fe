/** Canonical pet breed keys (must match BE `PET_BREEDS`). */
export const PET_BREEDS = [
  "cho_ta",
  "cho_lai",
  "poodle",
  "corgi",
  "golden",
  "husky",
  "bec_gie",
  "bull_phap",
  "phoc_chihuahua",
  "doberman",
  "fox_huou",
  "cho_bac_ha",
  "rottweiler",
  "meo_ta",
  "meo_lai",
  "other",
] as const;

export type PetBreed = (typeof PET_BREEDS)[number];

export const DOG_BREEDS: PetBreed[] = [
  "cho_ta",
  "cho_lai",
  "poodle",
  "corgi",
  "golden",
  "husky",
  "bec_gie",
  "bull_phap",
  "phoc_chihuahua",
  "doberman",
  "fox_huou",
  "cho_bac_ha",
  "rottweiler",
  "other",
];

export const CAT_BREEDS: PetBreed[] = ["meo_ta", "meo_lai", "other"];

export function breedsForSpecies(species: "dog" | "cat"): PetBreed[] {
  return species === "cat" ? CAT_BREEDS : DOG_BREEDS;
}

export function isPetBreed(value: string): value is PetBreed {
  return (PET_BREEDS as readonly string[]).includes(value);
}
