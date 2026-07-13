import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, Camera, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import {
  getPostAdoptionCheckInsForUser,
  submitCheckIn,
} from "@/features/post-adoption/api/postAdoptionApi";
import type { PostAdoptionCheckIn } from "@/features/post-adoption/types";
import { useI18n, type TranslationKey } from "@/i18n/I18nContext";

const STATUS_STYLE: Record<PostAdoptionCheckIn["status"], string> = {
  scheduled: "bg-amber-500/10 text-amber-800",
  submitted: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive",
};

const STATUS_KEYS: Record<PostAdoptionCheckIn["status"], TranslationKey> = {
  scheduled: "postAdoption.statusScheduled",
  submitted: "postAdoption.statusSubmitted",
  overdue: "postAdoption.statusOverdue",
};

export function PostAdoptionPage() {
  const { t, locale } = useI18n();
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

  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <>
      <PageMeta
        title={`${t("postAdoption.title")} — PawPath`}
        description={t("postAdoption.metaDesc")}
      />
      <PageHero
        eyebrow={t("postAdoption.eyebrow")}
        title={t("postAdoption.title")}
        subtitle={t("postAdoption.subtitle")}
      />
      <section className="mx-auto max-w-3xl space-y-4 px-6 py-12">
        {checkIns.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("postAdoption.emptyBefore")}{" "}
            <Link to="/adoption" className="text-primary hover:underline">
              {t("postAdoption.emptyLink")}
            </Link>{" "}
            {t("postAdoption.emptyAfter")}
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
                  {t("postAdoption.due", {
                    date: new Date(c.scheduledAt).toLocaleDateString(dateLocale),
                  })}
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${STATUS_STYLE[c.status]}`}
              >
                {t(STATUS_KEYS[c.status])}
              </span>
            </div>

            {c.status === "submitted" && c.healthReport && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm">
                <div className="mb-1 flex items-center gap-1 font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" /> {t("postAdoption.submittedLabel")}
                  {c.submittedAt && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      · {new Date(c.submittedAt).toLocaleDateString(dateLocale)}
                    </span>
                  )}
                </div>
                <p>{c.healthReport}</p>
                {c.photoUrl && (
                  <img src={c.photoUrl} alt="" className="mt-3 max-h-40 rounded-lg object-cover" />
                )}
              </div>
            )}

            {c.status === "scheduled" && (
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium">
                  <Camera className="h-4 w-4" /> {t("postAdoption.healthReport")}
                </label>
                <textarea
                  rows={3}
                  placeholder={t("postAdoption.healthPlaceholder")}
                  value={drafts[c.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => handleSubmit(c.id)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-primary-foreground"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  {t("postAdoption.submit")}
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
