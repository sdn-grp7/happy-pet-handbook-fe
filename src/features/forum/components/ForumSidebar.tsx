import { RotateCcw, Search, LayoutList, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ForumFilter = "All" | string;
export type ForumViewMode = "list" | "grid";

type ForumSidebarProps = {
  topics: string[];
  filter: ForumFilter;
  onFilterChange: (f: ForumFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  viewMode: ForumViewMode;
  onViewModeChange: (m: ForumViewMode) => void;
  topicLabel: (topic: string) => string;
  labels: {
    filters: string;
    reset: string;
    search: string;
    all: string;
  };
};

export function ForumSidebar({
  topics,
  filter,
  onFilterChange,
  query,
  onQueryChange,
  viewMode,
  onViewModeChange,
  topicLabel,
  labels,
}: ForumSidebarProps) {
  const chips: ForumFilter[] = ["All", ...topics];

  const reset = () => {
    onFilterChange("All");
    onQueryChange("");
  };

  return (
    <aside className="w-full rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{labels.filters}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
          onClick={reset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {labels.reset}
        </Button>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={labels.search}
          className="pl-9"
        />
      </div>

      <div className="mt-4 flex max-h-64 flex-wrap content-start gap-1.5 overflow-y-auto pr-1">
        {chips.map((chip) => {
          const active = filter === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onFilterChange(chip)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {chip === "All" ? labels.all : topicLabel(chip)}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-1 border-t border-border pt-4">
        <Button
          type="button"
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onViewModeChange("list")}
          aria-label="List view"
        >
          <LayoutList className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onViewModeChange("grid")}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
