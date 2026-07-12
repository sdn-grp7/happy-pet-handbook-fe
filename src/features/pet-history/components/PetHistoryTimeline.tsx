import { Syringe, FileText, Users, StickyNote } from "lucide-react";
import type { PetHistoryEvent, HistoryEventType } from "@/features/pet-history/types";
import { useI18n, type TranslationKey } from "@/i18n/I18nContext";

const TYPE_META: Record<HistoryEventType, { icon: typeof Syringe; color: string }> = {
  vaccination: { icon: Syringe, color: "#10b981" },
  medical: { icon: FileText, color: "#ef4444" },
  ownership: { icon: Users, color: "#8b5cf6" },
  note: { icon: StickyNote, color: "#f59e0b" },
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
              className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-white"
              style={{ background: meta.color }}
            >
              <Icon className="h-3 w-3" />
            </span>
            <time className="text-xs text-muted-foreground">{e.date}</time>
            <div className="mt-0.5 font-medium">{title}</div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("petHistory.recordedBy", { name: e.recordedBy })}</p>
            <p className="text-xs text-muted-foreground mt-1">{typeLabel}</p>
          </li>
        );
      })}
    </ol>
  );
}
