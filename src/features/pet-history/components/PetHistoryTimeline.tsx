import { Syringe, FileText, Users, StickyNote } from "lucide-react";
import type { PetHistoryEvent, HistoryEventType } from "@/features/pet-history/types";

const TYPE_META: Record<HistoryEventType, { icon: typeof Syringe; label: string; color: string }> =
  {
    vaccination: { icon: Syringe, label: "Vaccination", color: "#10b981" },
    medical: { icon: FileText, label: "Medical", color: "#ef4444" },
    ownership: { icon: Users, label: "Ownership", color: "#8b5cf6" },
    note: { icon: StickyNote, label: "Note", color: "#f59e0b" },
  };

type PetHistoryTimelineProps = {
  events: PetHistoryEvent[];
  emptyMessage?: string;
};

export function PetHistoryTimeline({
  events,
  emptyMessage = "No history records for this pet yet.",
}: PetHistoryTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ol className="relative border-l border-border ml-3 space-y-6">
      {events.map((e) => {
        const meta = TYPE_META[e.type];
        const Icon = meta.icon;
        return (
          <li key={e.id} className="ml-6">
            <span
              className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-white"
              style={{ background: meta.color }}
            >
              <Icon className="h-3 w-3" />
            </span>
            <time className="text-xs text-muted-foreground">{e.date}</time>
            <div className="mt-0.5 font-medium">{e.title}</div>
            <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
            <p className="text-xs text-muted-foreground mt-1">Recorded by {e.recordedBy}</p>
          </li>
        );
      })}
    </ol>
  );
}
