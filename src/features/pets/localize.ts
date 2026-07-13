import { formatAgeLabel } from "@/features/pets/age";
import type { PetListing } from "@/features/pets/types";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "@/i18n/types";

function getCurrentLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === "vi" || stored === "en" ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function translateHealthStatus(healthStatus: string, locale: Locale) {
  if (locale !== "en") return healthStatus;
  const normalized = healthStatus.trim();
  const map: Record<string, string> = {
    Tốt: "Healthy",
    "Tốt; chưa triệt sản": "Healthy; not spayed/neutered",
    "Tốt;Đã tiêm đủ vắc xin": "Healthy; fully vaccinated",
    "Tốt;Đã tiêm đủ vắc xin; Đã triệt sản": "Healthy; fully vaccinated; spayed/neutered",
    "Ổn định": "Stable",
    "Cụt 1 chân": "Missing one leg",
    "Một bên mắt trái bị hỏng.": "Left eye damaged",
  };
  return map[normalized] ?? healthStatus;
}

function translateDescription(description: string | undefined, locale: Locale, pet: PetListing) {
  if (locale !== "en") return description;
  return `${pet.name || "This pet"} is looking for a loving home. Please contact the shelter for more details.`;
}

function translatePickupAddress(address: string | undefined, locale: Locale) {
  if (locale !== "en") return address;
  if (!address) return address;
  return "Shelter pickup location in Hanoi, Vietnam";
}

/** Breed stays as enum key — UI translates via `breeds.*` i18n. */
export function localizePet(pet: PetListing, locale: Locale = getCurrentLocale()): PetListing {
  const ageMonths = pet.ageMonths ?? 12;
  const age = formatAgeLabel(ageMonths, locale);

  if (locale === "vi") {
    return { ...pet, ageMonths, age };
  }

  return {
    ...pet,
    ageMonths,
    age,
    healthStatus: translateHealthStatus(pet.healthStatus, locale) ?? pet.healthStatus,
    description: translateDescription(pet.description, locale, pet),
    notes: pet.notes,
    pickup: pet.pickup
      ? {
          ...pet.pickup,
          address: translatePickupAddress(pet.pickup.address, locale) ?? pet.pickup.address,
        }
      : pet.pickup,
  };
}

export function localizePets(pets: PetListing[], locale?: Locale): PetListing[] {
  return pets.map((pet) => localizePet(pet, locale));
}
