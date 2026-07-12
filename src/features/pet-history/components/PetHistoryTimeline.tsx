import { Syringe, FileText, Users, StickyNote, HeartPulse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { PetHistoryEvent, HistoryEventType } from "@/features/pet-history/types";
import { useI18n, type TranslationKey } from "@/i18n/I18nContext";
import { getPet } from "@/features/pets/api/petsApi";

const TYPE_META: Record<HistoryEventType, { icon: typeof Syringe; bgClass: string }> = {
  vaccination: { icon: Syringe, bgClass: "bg-emerald-500" },
  medical: { icon: FileText, bgClass: "bg-red-500" },
  ownership: { icon: Users, bgClass: "bg-violet-500" },
  note: { icon: StickyNote, bgClass: "bg-amber-500" },
  postAdoption: { icon: HeartPulse, bgClass: "bg-sky-500" },
};

type PetHistoryTimelineProps = {
  events: PetHistoryEvent[];
  emptyMessage?: string;
};

export function PetHistoryTimeline({
  events,
  emptyMessage,
}: PetHistoryTimelineProps) {
  const { t } = useI18n();
  const resolvedEmptyMessage = emptyMessage ?? t("petHistory.emptyMessage");

  const petIds = useMemo(() => Array.from(new Set(events.map((e) => e.petId).filter(Boolean))), [events]);
  const [petNames, setPetNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    if (petIds.length === 0) return;
    Promise.all(petIds.map((id) => getPet(id).then((p) => ({ id, name: p?.name ?? id }))))
      .then((results) => {
        if (!active) return;
        const map: Record<string, string> = {};
        for (const r of results) map[r.id] = r.name;
        setPetNames(map);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      active = false;
    };
  }, [petIds]);

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">{resolvedEmptyMessage}</p>;
  }

  return (
    <ol className="relative border-l border-border ml-3 space-y-6">
      {events.map((e) => {
        const meta = TYPE_META[e.type];
        const Icon = meta.icon;
        const title = e.titleKey ? t(e.titleKey as TranslationKey) : e.title;
        const description = e.descriptionKey ? t(e.descriptionKey as TranslationKey) : e.description;
        const typeLabel = t(`petHistory.types.${e.type}` as TranslationKey);
        return (
          <li key={e.id} className="ml-6">
            <span
              className={
                `absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-white ${meta.bgClass}`
              }
            >
              <Icon className="h-3 w-3" />
            </span>
            <time className="text-xs text-muted-foreground">{e.date}</time>
            <div className="mt-0.5 font-medium">
              {title}
              {events.length > 1 && e.petId && (
                <span className="ml-2 text-sm text-muted-foreground">—</span>
              )}
            </div>
            {events.length > 1 && e.petId && (
              <div className="text-sm mt-1">
                <Link to={`/adoption?pet=${encodeURIComponent(e.petId)}`} className="font-medium text-primary hover:underline">
                  {petNames[e.petId] ?? e.petId}
                </Link>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            {e.photoUrl ? (
              <div className="mt-2">
                <img
                  src={e.photoUrl}
                  alt={t("petHistory.checkInPhotoAlt", { pet: petNames[e.petId] ?? e.petId })}
                  className="rounded-2xl border border-border object-cover max-h-52 w-full"
                />
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground mt-1">{t("petHistory.recordedBy", { name: e.recordedBy })}</p>
            <p className="text-xs text-muted-foreground mt-1">{typeLabel}</p>
          </li>
        );
      })}
    </ol>
  );
}
