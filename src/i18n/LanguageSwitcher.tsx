import { Languages } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { LOCALES, type Locale } from "@/i18n/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  /** Compact trigger for tight header space */
  compact?: boolean;
};

export function LanguageSwitcher({ className, compact }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon" : "sm"}
          className={cn("shrink-0", className)}
          aria-label={t("common.language")}
        >
          <Languages className="h-4 w-4" />
          {!compact && <span className="hidden sm:inline">{current.short}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {LOCALES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            className={cn("cursor-pointer", item.code === locale && "bg-primary/10 text-primary")}
            onClick={() => setLocale(item.code as Locale)}
          >
            <span className="font-medium">{item.short}</span>
            <span className="text-muted-foreground">{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
