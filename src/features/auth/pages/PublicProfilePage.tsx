import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Shield, Star, UserRound } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { fetchPublicProfile, type PublicUserProfile } from "@/features/auth/api/authApi";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { getPetsAdoptedBy } from "@/features/pets/api/petsApi";
import { PetImage } from "@/features/pets/components/PetImage";
import type { PetListing } from "@/features/pets/types";
import { getPendingRatings, getReputation } from "@/features/reputation/api/reputationApi";
import { TrustRateForm } from "@/features/reputation/components/TrustRateForm";
import { TrustReviewList } from "@/features/reputation/components/TrustReviewList";
import type { PendingTrustRating, ReputationProfile } from "@/features/reputation/types";
import { useI18n } from "@/i18n/I18nContext";
import { ApiError } from "@/lib/api";

export function PublicProfilePage() {
  const { id = "" } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const { user: me, token } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [reputation, setReputation] = useState<ReputationProfile | null>(null);
  const [adoptedPets, setAdoptedPets] = useState<PetListing[]>([]);
  const [rateItems, setRateItems] = useState<PendingTrustRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const refreshPendingForUser = useCallback(async () => {
    if (!token || !id || me?.id === id) {
      setRateItems([]);
      return;
    }
    const pending = await getPendingRatings(token);
    setRateItems(pending.filter((p) => p.revieweeId === id));
  }, [token, id, me?.id]);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    Promise.all([fetchPublicProfile(id), getReputation(id), getPetsAdoptedBy(id)])
      .then(([u, rep, pets]) => {
        if (cancelled) return;
        setProfile(u);
        setReputation(rep ?? null);
        setAdoptedPets(pets);
      })
      .catch((err) => {
        if (cancelled) return;
        setProfile(null);
        setReputation(null);
        setAdoptedPets([]);
        setNotFound(err instanceof ApiError && err.status === 404);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    refreshPendingForUser().catch(() => setRateItems([]));
  }, [refreshPendingForUser]);

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isSelf = me?.id === profile?.id;
  const trustScore = reputation?.trustScore ?? profile?.trustScore ?? 0;
  const reviews = reputation?.reviews ?? [];
  const reviewCount = new Set(reviews.map((r) => r.reviewerId)).size || profile?.reviewCount || 0;

  return (
    <>
      <PageMeta
        title={
          profile
            ? `${profile.name} — ${t("brand.name")}`
            : `${t("publicProfile.title")} — ${t("brand.name")}`
        }
        description={t("publicProfile.metaDesc")}
      />
      <PageHero
        eyebrow={t("publicProfile.eyebrow")}
        title={profile?.name ?? t("publicProfile.title")}
        subtitle={t("publicProfile.subtitle")}
      />

      <section className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">{t("publicProfile.loading")}</p>
        ) : notFound || !profile ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("publicProfile.notFound")}</p>
            <Link
              to="/adoption"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              {t("publicProfile.backAdoption")}
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-4">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt=""
                    className="h-16 w-16 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <UserRound className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold">{profile.name}</h2>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    {profile.role === "admin"
                      ? t("publicProfile.roleAdmin")
                      : t("publicProfile.roleUser")}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                <span className="text-2xl font-bold">{trustScore.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  {t("publicProfile.reviewsCount", { count: reviewCount })}
                </span>
              </div>

              {memberSince ? (
                <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  {t("publicProfile.memberSince", { date: memberSince })}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                {isSelf ? (
                  <Link
                    to="/profile"
                    className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    {t("publicProfile.editOwn")}
                  </Link>
                ) : null}
                <Link
                  to="/reputation"
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted/60"
                >
                  {t("publicProfile.viewReputation")}
                </Link>
              </div>
            </div>

            {adoptedPets.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold">{t("publicProfile.adoptedPets")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("publicProfile.adoptedPetsHint")}
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {adoptedPets.map((pet) => (
                    <li key={pet.id}>
                      <Link
                        to={`/adoption?pet=${encodeURIComponent(pet.id)}`}
                        className="group block overflow-hidden rounded-xl border border-border bg-muted/20 transition hover:border-primary/40"
                      >
                        <PetImage
                          src={pet.images[0]}
                          alt={pet.name}
                          className="aspect-square w-full object-cover transition group-hover:scale-105"
                        />
                        <div className="px-2 py-2">
                          <p className="truncate text-sm font-medium group-hover:text-primary">
                            {pet.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">#{pet.code}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {rateItems.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{t("publicProfile.rateThisOwner")}</h3>
                {rateItems.map((item) => (
                  <TrustRateForm
                    key={`${item.petId}-${item.revieweeId}`}
                    item={item}
                    onSaved={() => {
                      refreshPendingForUser();
                      getReputation(id).then((rep) => setReputation(rep ?? null));
                      fetchPublicProfile(id).then(setProfile);
                    }}
                  />
                ))}
              </div>
            ) : null}

            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold">{t("publicProfile.reviewsFromPriors")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("publicProfile.reviewsFromPriorsHint")}
              </p>
              <TrustReviewList reviews={reviews} />
            </div>
          </>
        )}
      </section>
    </>
  );
}
