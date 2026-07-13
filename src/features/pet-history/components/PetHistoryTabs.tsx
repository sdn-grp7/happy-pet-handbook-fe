import { Syringe, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PetHistoryTimeline } from "@/features/pet-history/components/PetHistoryTimeline";
import type { PetHistoryEvent } from "@/features/pet-history/types";
import type { PetVaccination, PreviousOwner } from "@/features/pets/types";
import { useI18n } from "@/i18n/I18nContext";

type PetHistoryTabsProps = {
  events: PetHistoryEvent[];
  vaccinations?: PetVaccination[];
  previousOwner?: PreviousOwner | null;
  /** Hide pet name links in timeline (single-pet modal context). */
  compact?: boolean;
};

export function PetHistoryTabs({
  events,
  vaccinations = [],
  previousOwner,
  compact = false,
}: PetHistoryTabsProps) {
  const { t } = useI18n();

  const vaccineEvents = events.filter((e) => e.type === "vaccination");
  const ownershipEvents = events.filter((e) => e.type === "ownership" || e.type === "postAdoption");

  const hasVaccineBook = vaccinations.length > 0 || vaccineEvents.length > 0;
  const hasOwnership = Boolean(previousOwner?.name) || ownershipEvents.length > 0;

  return (
    <Tabs defaultValue="vaccines" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
        <TabsTrigger value="vaccines" className="gap-1.5 text-xs sm:text-sm">
          <Syringe className="h-3.5 w-3.5" />
          {t("petHistory.tabVaccines")}
        </TabsTrigger>
        <TabsTrigger value="ownership" className="gap-1.5 text-xs sm:text-sm">
          <UserRound className="h-3.5 w-3.5" />
          {t("petHistory.tabOwnership")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="vaccines" className="mt-4 space-y-4">
        {!hasVaccineBook ? (
          <p className="text-sm text-muted-foreground">{t("pet.noVaccines")}</p>
        ) : (
          <>
            {vaccinations.length > 0 && (
              <ul className="space-y-2">
                {vaccinations.map((v, i) => (
                  <li
                    key={`${v.name}-${v.date}-${i}`}
                    className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{v.name}</span>
                      <time className="text-xs text-muted-foreground">{v.date}</time>
                    </div>
                    {v.nextDue && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t("pet.nextDue", { date: v.nextDue })}
                      </p>
                    )}
                    {v.notes && <p className="mt-0.5 text-xs text-muted-foreground">{v.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
            {vaccineEvents.length > 0 && (
              <PetHistoryTimeline
                events={compact ? vaccineEvents.slice(0, 5) : vaccineEvents}
                emptyMessage={t("pet.noVaccines")}
              />
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="ownership" className="mt-4 space-y-4">
        {!hasOwnership ? (
          <p className="text-sm text-muted-foreground">{t("petHistory.emptyOwnership")}</p>
        ) : (
          <>
            {previousOwner?.name && (
              <div className="rounded-xl border border-dashed border-border px-3 py-2.5 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("pet.previousOwner")}
                </p>
                <p className="mt-1 font-medium">{previousOwner.name}</p>
                {previousOwner.note && (
                  <p className="mt-1 text-muted-foreground">{previousOwner.note}</p>
                )}
              </div>
            )}
            {ownershipEvents.length > 0 && (
              <PetHistoryTimeline
                events={compact ? ownershipEvents.slice(0, 5) : ownershipEvents}
                emptyMessage={t("petHistory.emptyOwnership")}
              />
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
