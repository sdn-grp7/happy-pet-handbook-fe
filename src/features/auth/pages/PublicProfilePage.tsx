import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Shield, UserRound } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { fetchPublicProfile, type PublicUserProfile } from "@/features/auth/api/authApi";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { ApiError } from "@/lib/api";

export function PublicProfilePage() {
  const { id = "" } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetchPublicProfile(id)
      .then((u) => {
        if (!cancelled) setProfile(u);
      })
      .catch((err) => {
        if (cancelled) return;
        setProfile(null);
        setNotFound(err instanceof ApiError && err.status === 404);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isSelf = me?.id === profile?.id;

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

      <section className="mx-auto max-w-lg px-6 py-10">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">{t("publicProfile.loading")}</p>
        ) : notFound || !profile ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("publicProfile.notFound")}</p>
            <Link to="/adoption" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              {t("publicProfile.backAdoption")}
            </Link>
          </div>
        ) : (
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

            {memberSince ? (
              <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
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
        )}
      </section>
    </>
  );
}
