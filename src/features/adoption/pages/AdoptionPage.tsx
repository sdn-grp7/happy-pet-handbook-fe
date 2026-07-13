import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PawPrint, MapPin } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { getAvailablePetListings, getPet } from "@/features/pets/api/petsApi";
import { PetImage } from "@/features/pets/components/PetImage";
import { PetDetailModal } from "@/features/pets/components/PetDetailModal";
import { useI18n } from "@/i18n/I18nContext";
import type { PetListing } from "@/features/pets/types";
import type { TranslationKey } from "@/i18n/I18nContext";

const STATUS_KEYS: Record<PetListing["status"], TranslationKey> = {
  available: "adoption.available",
  pending: "adoption.pending",
  adopted: "adoption.adopted",
};

export function AdoptionPage() {
  const { t, locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PetListing | null>(null);

  const petId = searchParams.get("pet");

  useEffect(() => {
    setLoading(true);
    getAvailablePetListings().then((data) => {
      setPets(data);
      setLoading(false);
    });
  }, [locale]);

  useEffect(() => {
    if (!petId) {
      setSelected(null);
      return;
    }
    const fromList = pets.find((p) => p.id === petId);
    if (fromList) {
      setSelected(fromList);
      return;
    }
    getPet(petId).then((p) => setSelected(p ?? null));
  }, [petId, pets]);

  const openPet = useCallback(
    (pet: PetListing) => {
      setSelected(pet);
      setSearchParams({ pet: pet.id }, { replace: false });
    },
    [setSearchParams],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSelected(null);
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams],
  );

  const handlePetChange = useCallback((updatedPet: PetListing) => {
    // Keep the listing grid and the open modal pointed at the same local mock object.
    setPets((current) => current.map((pet) => (pet.id === updatedPet.id ? updatedPet : pet)));
    setSelected(updatedPet);
  }, []);

  return (
    <>
      <PageMeta title={t("adoption.metaTitle")} description={t("adoption.metaDesc")} />
      <PageHero
        eyebrow={t("adoption.eyebrow")}
        title={t("adoption.title")}
        subtitle={t("adoption.subtitle")}
      />
      <section className="mx-auto max-w-6xl px-6 py-12">
        {loading ? (
          <p className="text-center text-muted-foreground">{t("adoption.loading")}</p>
        ) : pets.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("adoption.empty")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => openPet(pet)}
                className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <PetImage
                    src={pet.images[0]}
                    alt={pet.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.breed} · {pet.age}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {t(STATUS_KEYS[pet.status])}
                    </span>
                  </div>
                  {pet.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {pet.description}
                    </p>
                  ) : null}
                  {pet.pickup?.address && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {pet.pickup.address}
                    </div>
                  )}
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    <PawPrint className="h-4 w-4" /> {t("adoption.viewDetails")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <PetDetailModal
        pet={selected}
        open={Boolean(selected)}
        onOpenChange={handleOpenChange}
        onPetChange={handlePetChange}
      />
    </>
  );
}
