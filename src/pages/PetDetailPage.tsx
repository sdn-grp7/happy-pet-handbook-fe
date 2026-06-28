import { Link, useParams, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin, ArrowLeft, Heart } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { PetImage } from "@/components/PetImage";
import { PetHistoryTimeline } from "@/components/PetHistoryTimeline";
import { getPet, getPetHistory, submitAdoptionRequest } from "@/lib/mockApi";
import { useAuth } from "@/contexts/AuthContext";
import type { PetHistoryEvent, PetListing } from "@/types/modules";

export function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const [pet, setPet] = useState<PetListing | undefined>();
  const [history, setHistory] = useState<PetHistoryEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPet(id).then((p) => {
      setPet(p);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !user) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    getPetHistory(id)
      .then(setHistory)
      .finally(() => setHistoryLoading(false));
  }, [id, user]);

  if (!id) return <Navigate to="/adoption" replace />;
  if (!loading && !pet) return <Navigate to="/adoption" replace />;

  const handleAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pet) return;
    await submitAdoptionRequest(pet.id, user, message);
    setSubmitted(true);
  };

  return (
    <>
      <PageMeta
        title={pet ? `${pet.name} — Adoption` : "Pet detail"}
        description={pet?.description}
      />
      <section className="max-w-4xl mx-auto px-6 py-10">
        <Link
          to="/adoption"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        {loading || !pet ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-card)]">
                <PetImage
                  src={pet.images[0]}
                  alt={pet.name}
                  className="w-full aspect-square object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{pet.name}</h1>
                <p className="mt-1 text-muted-foreground">
                  {pet.species} · {pet.breed} · {pet.age}
                </p>
                <p className="mt-4 leading-relaxed">{pet.description}</p>
                <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Pickup: {pet.pickup.address}
                    <Link to="/map" className="block text-primary hover:underline mt-1">
                      View on map →
                    </Link>
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Listed by {pet.postedByName}</p>

                {pet.status !== "available" ? (
                  <p className="mt-6 rounded-lg bg-muted p-4 text-sm">
                    This pet is no longer available for adoption.
                  </p>
                ) : submitted ? (
                  <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
                    <Heart className="h-8 w-8 mx-auto text-primary" />
                    <p className="mt-2 font-medium">Adoption request submitted!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The lister will review your application.
                    </p>
                  </div>
                ) : user ? (
                  <form onSubmit={handleAdopt} className="mt-6 space-y-3">
                    <label className="text-sm font-medium" htmlFor="message">
                      Why would {pet.name} be a good fit?
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:opacity-95 transition"
                      style={{ background: "var(--gradient-warm)" }}
                    >
                      Submit adoption request
                    </button>
                  </form>
                ) : (
                  <p className="mt-6 text-sm">
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </Link>{" "}
                    to submit an adoption request.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-lg font-semibold">Health & ownership history</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vaccinations, vet visits, ownership changes, and notes for {pet.name}.
              </p>
              <div className="mt-6">
                {user ? (
                  historyLoading ? (
                    <p className="text-sm text-muted-foreground">Loading history…</p>
                  ) : (
                    <PetHistoryTimeline events={history} />
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </Link>{" "}
                    to view this pet&apos;s medical and ownership timeline.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
