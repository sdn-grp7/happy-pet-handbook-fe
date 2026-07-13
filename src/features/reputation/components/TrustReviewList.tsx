import { Link } from "react-router-dom";
import { PawPrint, Star } from "lucide-react";
import type { Review } from "@/features/reputation/types";
import { useI18n } from "@/i18n/I18nContext";

type TrustReviewListProps = {
  reviews: Review[];
};

/** One review per reviewer (most recent wins). */
function uniqueByReviewer(reviews: Review[]): Review[] {
  const seen = new Set<string>();
  const result: Review[] = [];
  for (const r of reviews) {
    if (seen.has(r.reviewerId)) continue;
    seen.add(r.reviewerId);
    result.push(r);
  }
  return result;
}

export function TrustReviewList({ reviews }: TrustReviewListProps) {
  const { t } = useI18n();
  const list = uniqueByReviewer(reviews);

  if (list.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">{t("publicProfile.noReviewsYet")}</p>
    );
  }

  return (
    <ul className="mt-4 space-y-4">
      {list.map((r) => (
        <li key={r.id} className="rounded-xl border border-border p-3 text-sm">
          <div className="flex gap-3">
            <Link
              to={`/users/${encodeURIComponent(r.reviewerId)}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted"
              aria-label={r.reviewerName}
            >
              {r.reviewerAvatar ? (
                <img
                  src={r.reviewerAvatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  {r.reviewerName.slice(0, 1)}
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={`/users/${encodeURIComponent(r.reviewerId)}`}
                className="text-base font-semibold text-foreground hover:text-primary hover:underline"
              >
                {r.reviewerName}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < r.rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>{t("reputation.aboutPet")}</span>
                <Link
                  to={`/adoption?pet=${encodeURIComponent(r.petId)}`}
                  className="inline-flex items-center gap-1 font-medium text-primary/90 hover:underline"
                >
                  {r.petImage ? (
                    <img
                      src={r.petImage}
                      alt=""
                      className="h-5 w-5 rounded object-cover"
                    />
                  ) : (
                    <PawPrint className="h-3.5 w-3.5" />
                  )}
                  {r.petName}
                  <span className="font-normal text-muted-foreground">#{r.petCode}</span>
                </Link>
              </p>
              {r.comment ? (
                <p className="mt-2 text-muted-foreground">{r.comment}</p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
