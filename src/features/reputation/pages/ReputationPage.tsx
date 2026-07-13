import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Shield } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { getReputationProfiles } from "@/features/reputation/api/reputationApi";
import { TrustReviewList } from "@/features/reputation/components/TrustReviewList";
import type { ReputationProfile } from "@/features/reputation/types";
import { useI18n } from "@/i18n/I18nContext";

export function ReputationPage() {
  const { t } = useI18n();
  const [profiles, setProfiles] = useState<ReputationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReputationProfiles()
      .then((list) => {
        if (!cancelled) setProfiles(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageMeta title={t("reputation.metaTitle")} description={t("reputation.metaDesc")} />
      <PageHero
        eyebrow={t("reputation.eyebrow")}
        title={t("reputation.title")}
        subtitle={t("reputation.subtitle")}
      />
      <section className="mx-auto w-full max-w-6xl space-y-4 px-6 py-12">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">{t("reputation.loading")}</p>
        ) : profiles.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{t("reputation.empty")}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {profiles.map((p) => (
              <div
                key={p.userId}
                className={
                  expanded === p.userId
                    ? "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:col-span-2"
                    : "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                }
              >
                <div className="flex items-center gap-4">
                  <Link
                    to={`/users/${encodeURIComponent(p.userId)}`}
                    className="shrink-0"
                    aria-label={t("reputation.viewProfile")}
                  >
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt=""
                        className="h-12 w-12 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Shield className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/users/${encodeURIComponent(p.userId)}`}
                      className="font-semibold hover:text-primary hover:underline"
                    >
                      {p.userName}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-1 text-sm text-amber-600">
                      <Star className="h-4 w-4 fill-current" />
                      {p.trustScore.toFixed(1)} · {p.reviewCount} {t("reputation.reviews")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === p.userId ? null : p.userId)}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {expanded === p.userId
                      ? t("reputation.hideReviews")
                      : t("reputation.showReviews")}
                  </button>
                </div>
                {expanded === p.userId && <TrustReviewList reviews={p.reviews} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
