import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, Camera, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { getPostAdoptionCheckInsForUser, submitCheckIn } from "@/lib/mockApi";
import type { PostAdoptionCheckIn } from "@/types/modules";

const STATUS_STYLE: Record<PostAdoptionCheckIn["status"], string> = {
  scheduled: "bg-amber-500/10 text-amber-700",
  submitted: "bg-emerald-500/10 text-emerald-700",
  overdue: "bg-red-500/10 text-red-700",
};

export function PostAdoptionPage() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<PostAdoptionCheckIn[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    getPostAdoptionCheckInsForUser(user.id).then(setCheckIns);
  }, [user]);

  const handleSubmit = async (id: string) => {
    const report = drafts[id]?.trim();
    if (!report) return;
    const updated = await submitCheckIn(id, report);
    if (updated) {
      setCheckIns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  };

  return (
    <>
      <PageMeta
        title="Post-Adoption — PawPath"
        description="Scheduled check-ins, health reports, and follow-up after pickup."
      />
      <PageHero
        eyebrow="Stay in touch"
        title="Follow-up after adoption"
        subtitle="Share quick health updates and photos so we know your new companion is settling in well."
      />
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        {checkIns.length === 0 && (
          <p className="text-center text-muted-foreground text-sm rounded-2xl border border-dashed border-border p-8">
            No check-ins yet. They appear after an adoption is completed — browse{" "}
            <Link to="/adoption" className="text-primary hover:underline">
              adoption listings
            </Link>{" "}
            to get started.
          </p>
        )}
        {checkIns.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{c.petName}</h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due {new Date(c.scheduledAt).toLocaleDateString()}
                </div>
              </div>
              <span
                className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}
              >
                {c.status}
              </span>
            </div>

            {c.status === "submitted" && c.healthReport && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm">
                <div className="flex items-center gap-1 text-emerald-700 font-medium mb-1">
                  <CheckCircle2 className="h-4 w-4" /> Submitted
                  {c.submittedAt && (
                    <span className="font-normal text-muted-foreground ml-1">
                      · {new Date(c.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p>{c.healthReport}</p>
                {c.photoUrl && (
                  <img src={c.photoUrl} alt="" className="mt-3 rounded-lg max-h-40 object-cover" />
                )}
              </div>
            )}

            {c.status === "scheduled" && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Camera className="h-4 w-4" /> Health report
                </label>
                <textarea
                  rows={3}
                  placeholder="How is your pet doing? Eating, energy, behavior…"
                  value={drafts[c.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => handleSubmit(c.id)}
                  className="rounded-full px-4 py-2 text-sm text-primary-foreground font-medium"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  Submit check-in
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
