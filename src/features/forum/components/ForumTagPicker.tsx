import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/i18n/I18nContext";

export const FORUM_TAG_OPTIONS = ["Basics", "Nutrition", "Training", "Health", "Stories"] as const;

export type ForumTag = (typeof FORUM_TAG_OPTIONS)[number];

export const FORUM_TAG_I18N: Record<ForumTag, TranslationKey> = {
  Basics: "forum.topicBasics",
  Nutrition: "forum.topicNutrition",
  Training: "forum.topicTraining",
  Health: "forum.topicHealth",
  Stories: "forum.topicStories",
};

type ForumTagPickerProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  topicLabel: (tag: string) => string;
  disabled?: boolean;
  className?: string;
};

export function ForumTagPicker({
  value,
  onChange,
  topicLabel,
  disabled,
  className,
}: ForumTagPickerProps) {
  const selected = new Set(value);

  const toggle = (tag: ForumTag) => {
    if (disabled) return;
    if (selected.has(tag)) {
      onChange(value.filter((item) => item !== tag));
      return;
    }
    onChange([...value, tag]);
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="group">
      {FORUM_TAG_OPTIONS.map((tag) => {
        const active = selected.has(tag);
        return (
          <button
            key={tag}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => toggle(tag)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {topicLabel(tag)}
          </button>
        );
      })}
    </div>
  );
}
