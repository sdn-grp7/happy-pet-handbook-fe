import { Camera, Syringe, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  PetOwnerRecord,
  PetVaccination,
  PriorCheckInPhoto,
  UserRef,
} from "@/features/pets/types";
import { useI18n } from "@/i18n/I18nContext";

type PetHistoryTabsProps = {
  vaccinations?: PetVaccination[];
  owners?: PetOwnerRecord[];
};

function UserNameLink({ user, className }: { user: UserRef; className?: string }) {
  return (
    <Link
      to={`/users/${encodeURIComponent(user.id)}`}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {user.name}
    </Link>
  );
}

function UploaderLine({ user, prefix }: { user: UserRef; prefix: string }) {
  return (
    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <UserRound className="h-3 w-3 shrink-0" />
      <span>
        {prefix}{" "}
        <UserNameLink
          user={user}
          className="font-medium text-foreground/80 underline-offset-2 hover:text-primary hover:underline"
        />
      </span>
    </p>
  );
}

function CheckInCard({ checkIn }: { checkIn: PriorCheckInPhoto }) {
  const { t } = useI18n();
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[4/3] bg-muted">
        <img src={checkIn.photoUrl} alt={checkIn.caption} className="h-full w-full object-cover" />
        <Link
          to={`/users/${encodeURIComponent(checkIn.uploadedBy.id)}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-2 top-2 inline-flex max-w-[85%] items-center gap-1 truncate rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium shadow-sm hover:bg-background hover:text-primary"
        >
          <UserRound className="h-3 w-3 shrink-0" />
          {checkIn.uploadedBy.name}
        </Link>
      </div>
      <figcaption className="space-y-0.5 px-3 py-2.5 text-sm">
        {checkIn.date ? (
          <time className="text-xs text-muted-foreground">{checkIn.date}</time>
        ) : null}
        <p className="leading-relaxed text-foreground/90">{checkIn.caption}</p>
        <UploaderLine user={checkIn.uploadedBy} prefix={t("petHistory.uploadedBy")} />
      </figcaption>
    </figure>
  );
}

export function PetHistoryTabs({ vaccinations = [], owners = [] }: PetHistoryTabsProps) {
  const { t } = useI18n();

  const hasVaccineBook = vaccinations.length > 0;
  const checkIns = owners
    .flatMap((o) => o.checkIns.map((c) => ({ ...c, ownerName: o.user.name })))
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
  const hasCheckIns = checkIns.length > 0;
  const defaultTab = hasCheckIns ? "checkins" : hasVaccineBook ? "vaccines" : "ownership";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1">
        <TabsTrigger value="vaccines" className="gap-1.5 text-xs sm:text-sm">
          <Syringe className="h-3.5 w-3.5" />
          {t("petHistory.tabVaccines")}
        </TabsTrigger>
        <TabsTrigger value="ownership" className="gap-1.5 text-xs sm:text-sm">
          <UserRound className="h-3.5 w-3.5" />
          {t("petHistory.tabOwnership")}
        </TabsTrigger>
        <TabsTrigger value="checkins" className="gap-1.5 text-xs sm:text-sm">
          <Camera className="h-3.5 w-3.5" />
          {t("petHistory.tabCheckIns")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="vaccines" className="mt-4 space-y-3">
        {!hasVaccineBook ? (
          <p className="text-sm text-muted-foreground">{t("pet.noVaccines")}</p>
        ) : (
          <ul className="space-y-3">
            {vaccinations.map((v, i) => (
              <li key={`${v.name}-${v.date}-${i}`}>
                {v.photoUrl ? (
                  <figure className="overflow-hidden rounded-xl border border-border bg-muted/20">
                    <div className="relative aspect-[4/3] bg-muted">
                      <img src={v.photoUrl} alt={v.name} className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                        <Camera className="h-3 w-3" />
                        {t("petHistory.vaccinePhoto")}
                      </span>
                    </div>
                    <figcaption className="space-y-0.5 px-3 py-2.5 text-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{v.name}</span>
                        {v.date ? (
                          <time className="text-xs text-muted-foreground">{v.date}</time>
                        ) : null}
                      </div>
                      {v.notes ? <p className="text-xs text-muted-foreground">{v.notes}</p> : null}
                      <UploaderLine user={v.uploadedBy} prefix={t("petHistory.uploadedBy")} />
                    </figcaption>
                  </figure>
                ) : (
                  <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm">
                    <div className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <Syringe className="h-3 w-3" />
                      {t("petHistory.vaccineManual")}
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{v.name}</span>
                      <time className="text-xs text-muted-foreground">{v.date}</time>
                    </div>
                    {v.nextDue ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t("pet.nextDue", { date: v.nextDue })}
                      </p>
                    ) : null}
                    {v.notes ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{v.notes}</p>
                    ) : null}
                    <UploaderLine user={v.uploadedBy} prefix={t("petHistory.uploadedBy")} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="ownership" className="mt-4 space-y-4">
        {owners.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("petHistory.emptyOwnership")}</p>
        ) : (
          <ol className="space-y-3">
            {[...owners].reverse().map((o, idx) => {
              const isCurrent = !o.to;
              const orderFromOldest = owners.length - idx;
              return (
                <li
                  key={o.id || `${o.user.id}-${o.from}`}
                  className="rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {isCurrent
                          ? t("petHistory.currentOwner")
                          : t("petHistory.priorOwner", { n: orderFromOldest })}
                      </p>
                      <UserNameLink
                        user={o.user}
                        className="font-medium text-primary hover:underline"
                      />
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {o.to
                        ? t("petHistory.ownerPeriod", { from: o.from, to: o.to })
                        : t("petHistory.ownerPeriodOpen", { from: o.from })}
                    </time>
                  </div>
                  {o.note ? <p className="mt-1 text-xs text-muted-foreground">{o.note}</p> : null}
                  {o.checkIns.length > 0 ? (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {t("petHistory.ownerCheckInCount", { count: o.checkIns.length })}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </TabsContent>

      <TabsContent value="checkins" className="mt-4 space-y-3">
        {!hasCheckIns ? (
          <p className="text-sm text-muted-foreground">{t("petHistory.emptyCheckIns")}</p>
        ) : (
          <ul className="space-y-3">
            {checkIns.map((c) => (
              <li key={c.id || `${c.photoUrl}-${c.date}`}>
                <CheckInCard checkIn={c} />
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
