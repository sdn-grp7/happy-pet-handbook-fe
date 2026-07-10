import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Shield } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { getReputationProfiles } from "@/features/reputation/api/reputationApi";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import type { ReputationProfile } from "@/features/reputation/types";
import { useI18n } from "@/i18n/I18nContext";

export function ReputationPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ReputationProfile[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getReputationProfiles().then(setProfiles);
  }, []);

  return (
    <>
      <PageMeta
        title="Reputation — PawPath"
        description="Adopter reviews, trust scores, and public profiles."
      />
      <PageHero
        eyebrow={t("reputation.eyebrow")}
        title={t("reputation.title")}
        subtitle={t("reputation.subtitle")}
      />
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        {profiles.map((p) => (
          <div
            key={p.userId}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <button
              type="button"
              onClick={() => setExpanded(expanded === p.userId ? null : p.userId)}
              className="w-full text-left flex items-center gap-4"
            >
              {p.avatar ? (
                <img
                  src={p.avatar}
                  alt=""
                  className="h-12 w-12 rounded-full border border-border"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Shield className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{p.userName}</div>
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <Star className="h-4 w-4 fill-current" />
                  {p.trustScore.toFixed(1)} · {p.reviewCount} reviews
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {expanded === p.userId ? "Hide" : "Show"} reviews
              </span>
            </button>
            {expanded === p.userId && (
              <ul className="mt-4 pt-4 border-t border-border space-y-3">
                {p.reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-muted"}`}
                        />
                      ))}
                      <span className="text-muted-foreground ml-1">— {r.reviewerName}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{r.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            {!user && (
              <Link to="/login" className="mt-3 inline-block text-sm text-primary hover:underline">
                Sign in to see your profile →
              </Link>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
