import { Link } from "react-router-dom";
import { User, LogOut, Shield, Star } from "lucide-react";
import { PageHero } from "@/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getAdoptionRequests, getReputation } from "@/lib/mockApi";
import type { AdoptionRequest, ReputationProfile } from "@/types/modules";

export function ProfilePage() {
  const { user, logout } = useAuth();
  // RequireAuth guarantees user; assert for TypeScript in child hooks.
  const account = user!;
  const [adoptions, setAdoptions] = useState<AdoptionRequest[]>([]);
  const [reputation, setReputation] = useState<ReputationProfile | undefined>();

  useEffect(() => {
    getAdoptionRequests(account.id).then(setAdoptions);
    getReputation(account.id).then(setReputation);
  }, [account.id]);

  return (
    <>
      <PageMeta
        title="Profile — PawPath"
        description="Your PawPath account and adoption activity."
      />
      <PageHero
        eyebrow="Account"
        title="Your profile"
        subtitle="Adoption requests, reputation, and shortcuts to your activity."
      />
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] flex items-start gap-4">
          {account.avatar ? (
            <img
              src={account.avatar}
              alt=""
              className="h-16 w-16 rounded-full border border-border"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
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
