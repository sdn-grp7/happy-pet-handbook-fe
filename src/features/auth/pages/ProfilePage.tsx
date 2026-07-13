import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteAdoptionRequest,
  getMyAdoptionRequests,
} from "@/features/adoption/api/adoptionApi";
import { AdoptionRequestCard } from "@/features/adoption/components/AdoptionRequestCard";
import { getPetHistory } from "@/features/pet-history/api/petHistoryApi";
import type { PetHistoryEvent } from "@/features/pet-history/types";
import { getPetsAdoptedBy } from "@/features/pets/api/petsApi";
import { PetImage } from "@/features/pets/components/PetImage";
import type { PetListing } from "@/features/pets/types";
import {
  getPendingRatings,
  getReputation,
} from "@/features/reputation/api/reputationApi";
import { TrustRateForm } from "@/features/reputation/components/TrustRateForm";
import { uploadAvatarToCloudinary } from "@/features/auth/api/avatarApi";
import type { AdoptionRequest } from "@/features/adoption/types";
import type { PendingTrustRating, ReputationProfile } from "@/features/reputation/types";
import { useI18n } from "@/i18n/I18nContext";
import { Link } from "react-router-dom";
import { User, LogOut, Shield, Star, Camera, Loader2, Lock, Eye, EyeOff, Inbox } from "lucide-react";
import { ApiError } from "@/lib/api";
import { toast } from "@/shared/lib/toast";

export function ProfilePage() {
  const { t } = useI18n();
  const { user, token, logout, updateAvatar, changePassword } = useAuth();
  const account = user!;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [adoptions, setAdoptions] = useState<AdoptionRequest[]>([]);
  const [adoptedPets, setAdoptedPets] = useState<PetListing[]>([]);
  const [historyByPet, setHistoryByPet] = useState<Record<string, PetHistoryEvent[]>>({});
  const [reputation, setReputation] = useState<ReputationProfile | undefined>();
  const [pending, setPending] = useState<PendingTrustRating[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const hasPassword =
    account.hasPassword === true || (!account.googleId && account.hasPassword !== false);

  const refreshReputation = () => {
    getReputation(account.id).then(setReputation);
    if (token) getPendingRatings(token).then(setPending);
  };

  const refreshAdoptions = useCallback(() => {
    if (!token) {
      setAdoptions([]);
      return;
    }
    getMyAdoptionRequests(token).then(setAdoptions).catch(() => setAdoptions([]));
  }, [token]);

  const refreshAdoptedPets = useCallback(() => {
    getPetsAdoptedBy(account.id).then(setAdoptedPets).catch(() => setAdoptedPets([]));
  }, [account.id]);

  useEffect(() => {
    refreshAdoptions();
    refreshAdoptedPets();
    getReputation(account.id).then(setReputation);
    if (token) getPendingRatings(token).then(setPending).catch(() => setPending([]));
  }, [account.id, token, refreshAdoptions, refreshAdoptedPets]);

  useEffect(() => {
    let active = true;
    if (adoptions.length === 0) {
      setHistoryByPet({});
      return;
    }

    Promise.all(
      adoptions.map((adoption) =>
        getPetHistory(adoption.petId).then((events) => ({ petId: adoption.petId, events })),
      ),
    ).then((results) => {
      if (!active) return;
      setHistoryByPet(Object.fromEntries(results.map((item) => [item.petId, item.events])));
    });

    return () => {
      active = false;
    };
  }, [adoptions]);

  const handleDeleteRequest = async (id: string) => {
    if (!token) return;
    setBusyRequestId(id);
    try {
      await deleteAdoptionRequest(token, id);
      toast.success(t("adoptionRequest.deleted"));
      refreshAdoptions();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("adoptionRequest.deleteError"));
    } finally {
      setBusyRequestId(null);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !token) return;

    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const avatarUrl = await uploadAvatarToCloudinary(token, file);
      await updateAvatar(avatarUrl);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Unable to update avatar.");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(t("profile.passwordTooShort"));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t("profile.passwordMismatch"));
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(
        passwordForm.newPassword,
        hasPassword ? passwordForm.currentPassword : undefined,
      );
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess(hasPassword ? t("profile.passwordUpdated") : t("profile.passwordSet"));
    } catch (error) {
      setPasswordError(error instanceof ApiError ? error.message : "Unable to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Profile — PawPath"
        description="Your PawPath account and adoption activity."
      />
      <PageHero
        eyebrow={t("profile.eyebrow")}
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
      />
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] flex items-start gap-4">
          <div className="relative">
            {account.avatar ? (
              <img
                src={account.avatar}
                alt=""
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm disabled:opacity-60"
              aria-label={t("profile.uploadAvatar")}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label={t("profile.uploadAvatar")}
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold">{account.name}</h2>
            <p className="text-sm text-muted-foreground">{account.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                <Shield className="h-3 w-3" /> {account.role}
              </span>
              {account.googleId && (
                <span className="rounded-full bg-muted px-2 py-0.5">Google linked</span>
              )}
            </div>
            {account.role === "admin" && (
              <Link
                to="/admin"
                className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
              >
                {t("nav.admin")} →
              </Link>
            )}
            {avatarError && <p className="mt-2 text-sm text-destructive">{avatarError}</p>}
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-4"
        >
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {hasPassword ? t("profile.changePassword") : t("profile.setPassword")}
            </h3>
            {!hasPassword && (
              <p className="mt-1 text-sm text-muted-foreground">{t("profile.setPasswordHint")}</p>
            )}
          </div>

          {(
            [
              ...(hasPassword
                ? [
                    {
                      id: "currentPassword",
                      label: t("profile.currentPassword"),
                      value: passwordForm.currentPassword,
                      field: "currentPassword" as const,
                      visible: showPasswords.current,
                      toggleKey: "current" as const,
                      autoComplete: "current-password",
                    },
                  ]
                : []),
              {
                id: "newPassword",
                label: t("profile.newPassword"),
                value: passwordForm.newPassword,
                field: "newPassword" as const,
                visible: showPasswords.next,
                toggleKey: "next" as const,
                autoComplete: "new-password",
              },
              {
                id: "confirmPassword",
                label: t("profile.confirmPassword"),
                value: passwordForm.confirmPassword,
                field: "confirmPassword" as const,
                visible: showPasswords.confirm,
                toggleKey: "confirm" as const,
                autoComplete: "new-password",
              },
            ] as const
          ).map((field) => (
            <div key={field.id}>
              <label className="text-sm font-medium" htmlFor={field.id}>
                {field.label}
              </label>
              <div className="relative mt-1">
                <input
                  id={field.id}
                  type={field.visible ? "text" : "password"}
                  required
                  autoComplete={field.autoComplete}
                  value={field.value}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, [field.field]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((s) => ({ ...s, [field.toggleKey]: !s[field.toggleKey] }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition"
                  aria-label={field.visible ? "Hide password" : "Show password"}
                >
                  {field.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}

          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          {passwordSuccess && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{passwordSuccess}</p>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:opacity-95 transition disabled:opacity-60"
            style={{ background: "var(--gradient-warm)" }}
          >
            {passwordLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {hasPassword ? t("profile.updatePassword") : t("profile.savePassword")}
          </button>
        </form>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("profile.reputation")}</h3>
            <Link to="/reputation" className="text-sm text-primary hover:underline">
              {t("profile.viewAllProfiles")}
            </Link>
          </div>
          {reputation && reputation.reviewCount > 0 ? (
            <div className="mt-3 flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              <span className="text-2xl font-bold">{reputation.trustScore.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                {t("profile.reviewsCount", { count: reputation.reviewCount })}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t("profile.noReviewsYet")}</p>
          )}
          <Link
            to={`/users/${encodeURIComponent(account.id)}`}
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            {t("reputation.viewProfile")} →
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">{t("profile.pendingRatings")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("reputation.pendingHint")}</p>
          {pending.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("reputation.pendingEmpty")}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {pending.map((item) => (
                <TrustRateForm
                  key={`${item.petId}-${item.revieweeId}`}
                  item={item}
                  onSaved={refreshReputation}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{t("profile.myAdoptedPets")}</h3>
            <Link
              to={`/users/${encodeURIComponent(account.id)}`}
              className="text-sm text-primary hover:underline"
            >
              {t("profile.viewPublicProfile")}
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("profile.myAdoptedPetsHint")}</p>
          {adoptedPets.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("profile.noAdoptedPets")}</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 font-semibold">
                <Inbox className="h-4 w-4 text-primary" />
                {t("profile.incomingRequests")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("profile.incomingRequestsHint")}</p>
            </div>
            <Link
              to="/adoption-requests"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              {t("profile.openIncomingRequests")} →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("profile.myAdoptionRequests")}</h3>
            <Link to="/adoption" className="text-sm text-primary hover:underline">
              {t("profile.browsePets")}
            </Link>
          </div>
          {adoptions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("profile.noAdoptionRequests")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {adoptions.map((a) => (
                <AdoptionRequestCard
                  key={a.id}
                  request={a}
                  mode="mine"
                  busyId={busyRequestId}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </ul>
          )}
          {adoptions.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {adoptions.some((a) => historyByPet[a.petId]?.length)
                ? t("profile.trackUpdates")
                : t("profile.noHistoryYet")}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("profile.petHistory")}</h3>
            <Link to="/pet-history" className="text-sm text-primary hover:underline">
              {t("profile.openFullHistory")}
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("profile.petHistoryDescription")}</p>
        </div>

        <div className="text-sm">
          <Link to="/post-adoption" className="text-primary hover:underline">
            {t("profile.postAdoptionCheckIns")} →
          </Link>
        </div>
      </section>
    </>
  );
}
