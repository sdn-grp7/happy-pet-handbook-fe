import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { PetHistoryTabs } from "@/features/pet-history/components/PetHistoryTabs";
import { getPet } from "@/features/pets/api/petsApi";
import type { PetListing } from "@/features/pets/types";
import { useI18n } from "@/i18n/I18nContext";

export function PetHistoryPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [pet, setPet] = useState<PetListing | null>(null);
  const [loading, setLoading] = useState(true);

  const petId = searchParams.get("pet");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPet(null);

    if (!petId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    getPet(petId).then((listing) => {
      if (!active) return;
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
          ) : !petId ? (
            <p className="text-sm text-muted-foreground">{t("petHistory.empty")}</p>
          ) : !pet ? (
            <p className="text-sm text-muted-foreground">{t("petHistory.emptyMessage")}</p>
          ) : (
            <PetHistoryTabs vaccinations={pet.vaccinations} owners={pet.owners} />
          )}
        </div>
      </section>
    </>
  );
}
