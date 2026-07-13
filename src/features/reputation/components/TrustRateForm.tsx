import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Star } from "lucide-react";
import { submitRating } from "@/features/reputation/api/reputationApi";
import type { PendingTrustRating } from "@/features/reputation/types";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type TrustRateFormProps = {
  item: PendingTrustRating;
  onSaved?: () => void;
  compact?: boolean;
};

export function TrustRateForm({ item, onSaved, compact }: TrustRateFormProps) {
  const { t } = useI18n();
  const { token } = useAuth();
  const [rating, setRating] = useState(item.existingRating?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(item.existingRating?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || rating < 1) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await submitRating(token, {
        petId: item.petId,
        revieweeId: item.revieweeId,
        rating,
        comment: comment.trim() || undefined,
      });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("reputation.rateError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-xl border border-border bg-muted/20 p-4 space-y-3", compact && "p-3")}
    >
      <div className="text-sm">
        <p className="font-medium">
          {t("reputation.rateNewOwner")}{" "}
          <Link
            to={`/users/${encodeURIComponent(item.revieweeId)}`}
            className="text-primary hover:underline"
          >
            {item.revieweeName}
          </Link>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("reputation.forPet", { name: item.petName, code: item.petCode })}
        </p>
      </div>

      <div className="flex items-center gap-1" role="radiogroup" aria-label={t("reputation.stars")}>
        {[1, 2, 3, 4, 5].map((value) => {
          const active = (hover || rating) >= value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
              className="rounded p-0.5 text-amber-500 transition hover:scale-110"
            >
              <Star
                className={cn("h-6 w-6", active ? "fill-current" : "text-muted-foreground/40")}
              />
            </button>
          );
        })}
      </div>

      <textarea
        rows={compact ? 2 : 3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("reputation.commentPlaceholder")}
        maxLength={1000}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">{t("reputation.rateSaved")}</p>}

      <button
        type="submit"
        disabled={saving || rating < 1 || !token}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] disabled:opacity-60"
        style={{ background: "var(--gradient-warm)" }}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {item.existingRating ? t("reputation.updateRating") : t("reputation.submitRating")}
      </button>
    </form>
  );
}
