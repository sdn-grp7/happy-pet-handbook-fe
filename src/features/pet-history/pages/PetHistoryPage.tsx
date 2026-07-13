import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { PetHistoryTabs } from "@/features/pet-history/components/PetHistoryTabs";
import { getPetHistory, getAllPetHistory } from "@/features/pet-history/api/petHistoryApi";
import { getPet } from "@/features/pets/api/petsApi";
import type { PetHistoryEvent } from "@/features/pet-history/types";
import type { PetListing } from "@/features/pets/types";
import { useI18n } from "@/i18n/I18nContext";

export function PetHistoryPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<PetHistoryEvent[]>([]);
  const [pet, setPet] = useState<PetListing | null>(null);
  const [loading, setLoading] = useState(true);

  const petId = searchParams.get("pet");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPet(null);

    const historyReq = petId ? getPetHistory(petId) : getAllPetHistory();
    const petReq = petId ? getPet(petId) : Promise.resolve(undefined);

    Promise.all([historyReq, petReq]).then(([history, listing]) => {
      if (!active) return;
      setEvents(history);
      setPet(listing ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [petId]);

  return (
    <>
      <PageMeta
        title={`${t("petHistory.title")} — PawPath`}
        description={t("petHistory.metaDescription")}
      />
      <PageHero
        eyebrow={t("reputation.eyebrow")}
        title={t("petHistory.title")}
        subtitle={
          pet ? t("petHistory.subtitleForPet", { name: pet.name }) : t("petHistory.subtitle")
        }
      />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("petHistory.loading")}</p>
          ) : (
            <PetHistoryTabs
              events={events}
              vaccinations={pet?.vaccinations}
              previousOwner={pet?.previousOwner}
            />
          )}
        </div>
      </section>
    </>
  );
}
