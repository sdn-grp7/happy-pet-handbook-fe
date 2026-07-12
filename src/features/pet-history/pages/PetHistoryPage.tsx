import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { PetHistoryTimeline } from "@/features/pet-history/components/PetHistoryTimeline";
import { getPetHistory, getAllPetHistory } from "@/features/pet-history/api/petHistoryApi";
import type { PetHistoryEvent } from "@/features/pet-history/types";
import { useI18n } from "@/i18n/I18nContext";

export function PetHistoryPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<PetHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const petId = searchParams.get("pet");

  useEffect(() => {
    let active = true;
    setLoading(true);

    const request = petId ? getPetHistory(petId) : getAllPetHistory();
    request.then((data) => {
      if (active) {
        setEvents(data);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [petId]);

  const title = useMemo(() => {
    if (petId) return "Lịch sử thú cưng";
    return "Lịch sử thú cưng";
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
        subtitle={t("petHistory.subtitle")}
      />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("petHistory.loading")}</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("petHistory.empty")}</p>
          ) : (
            <PetHistoryTimeline events={events} />
          )}
        </div>
      </section>
    </>
  );
}
