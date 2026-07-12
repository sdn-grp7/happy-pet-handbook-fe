import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { getAdoptionRequests } from "@/features/adoption/api/adoptionApi";
import { getReputation } from "@/features/reputation/api/reputationApi";
import { uploadAvatarToCloudinary } from "@/features/auth/api/avatarApi";
import type { AdoptionRequest } from "@/features/adoption/types";
import type { ReputationProfile } from "@/features/reputation/types";
import { useI18n } from "@/i18n/I18nContext";
import { Link } from "react-router-dom";
import { User, LogOut, Shield, Star, Camera, Loader2 } from "lucide-react";

export function ProfilePage() {
  const { t } = useI18n();
  const { user, logout, updateUser } = useAuth();
  const account = user!;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [adoptions, setAdoptions] = useState<AdoptionRequest[]>([]);
  const [reputation, setReputation] = useState<ReputationProfile | undefined>();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    getAdoptionRequests(account.id).then(setAdoptions);
    getReputation(account.id).then(setReputation);
  }, [account.id]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const avatarUrl = await uploadAvatarToCloudinary(file);
      const nextUser = { ...user, avatar: avatarUrl };
      updateUser(nextUser);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Unable to update avatar.");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
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
              className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm"
              aria-label="Upload avatar"
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
            {avatarError && <p className="mt-2 text-sm text-destructive">{avatarError}</p>}
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>

        {reputation && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Reputation</h3>
              <Link to="/reputation" className="text-sm text-primary hover:underline">
                View all profiles
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              <span className="text-2xl font-bold">{reputation.trustScore.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({reputation.reviewCount} reviews)
              </span>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">My adoption requests</h3>
            <Link to="/adoption" className="text-sm text-primary hover:underline">
              Browse pets
            </Link>
          </div>
          {adoptions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No adoption requests yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {adoptions.map((a) => (
                <li key={a.id} className="rounded-lg border border-border p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{a.petName}</span>
                    <span className="text-xs uppercase tracking-wide text-primary">{a.status}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground line-clamp-2">{a.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-sm">
          <Link to="/post-adoption" className="text-primary hover:underline">
            Post-adoption check-ins →
          </Link>
        </div>
      </section>
    </>
  );
}
