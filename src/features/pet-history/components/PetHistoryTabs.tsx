import { Camera, Syringe, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PetOwnerRecord, PetVaccination, UserRef } from "@/features/pets/types";
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

export function PetHistoryTabs({ vaccinations = [], owners = [] }: PetHistoryTabsProps) {
  const { t } = useI18n();

  const hasVaccineBook = vaccinations.length > 0;
  const checkIns = owners.flatMap((o) => o.checkIns);
  const hasCheckIns = checkIns.length > 0;

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
                      <img
                        src={v.photoUrl}
                        alt={v.name}
                        className="h-full w-full object-cover"
                      />
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
                      {v.notes ? (
                        <p className="text-xs text-muted-foreground">{v.notes}</p>
                      ) : null}
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

      <TabsContent value="ownership" className="mt-4 space-y-3">
        {!hasCheckIns ? (
          <p className="text-sm text-muted-foreground">{t("petHistory.emptyOwnership")}</p>
        ) : (
          <ul className="space-y-3">
            {checkIns.map((c) => (
              <li key={c.id}>
                <figure className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="relative aspect-[4/3] bg-muted">
                    <img
                      src={c.photoUrl}
                      alt={c.caption}
                      className="h-full w-full object-cover"
                    />
                    <Link
                      to={`/users/${encodeURIComponent(c.uploadedBy.id)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-2 top-2 inline-flex max-w-[85%] items-center gap-1 truncate rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium shadow-sm hover:bg-background hover:text-primary"
                    >
                      <UserRound className="h-3 w-3 shrink-0" />
                      {c.uploadedBy.name}
                    </Link>
                  </div>
                  <figcaption className="space-y-0.5 px-3 py-2.5 text-sm">
                    {c.date ? (
                      <time className="text-xs text-muted-foreground">{c.date}</time>
                    ) : null}
                    <p className="leading-relaxed text-foreground/90">{c.caption}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
