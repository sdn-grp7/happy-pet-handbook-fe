import type { PetBreed } from "@/features/pets/breeds";
import type { PetSpecies } from "@/features/pets/types";
import type { TranslationKey } from "@/i18n/I18nContext";

const BREED_KEYS: Record<PetBreed, TranslationKey> = {
  cho_ta: "breeds.cho_ta",
  cho_lai: "breeds.cho_lai",
  poodle: "breeds.poodle",
  corgi: "breeds.corgi",
  golden: "breeds.golden",
  husky: "breeds.husky",
  bec_gie: "breeds.bec_gie",
  bull_phap: "breeds.bull_phap",
  phoc_chihuahua: "breeds.phoc_chihuahua",
  doberman: "breeds.doberman",
  fox_huou: "breeds.fox_huou",
  cho_bac_ha: "breeds.cho_bac_ha",
  rottweiler: "breeds.rottweiler",
  meo_ta: "breeds.meo_ta",
  meo_lai: "breeds.meo_lai",
  other: "breeds.other",
};

export function breedLabelKey(breed: string): TranslationKey {
  return BREED_KEYS[breed as PetBreed] ?? "breeds.other";
}

export type { PetBreed, PetSpecies };
