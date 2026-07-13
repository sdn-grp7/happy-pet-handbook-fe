import { Link } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import {
  Calendar,
  Camera,
  CheckCircle2,
  HeartPulse,
  ImagePlus,
  Scale,
  StickyNote,
} from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { getPet } from "@/features/pets/api/petsApi";
import type { PetListing } from "@/features/pets/types";
import {
  getPostAdoptionCheckInsForUser,
  submitCheckIn,
} from "@/features/post-adoption/api/postAdoptionApi";
import type {
  PostAdoptionCheckIn,
  PostAdoptionUpdateInput,
} from "@/features/post-adoption/types";
import { useI18n } from "@/i18n/I18nContext";

const STATUS_STYLE: Record<PostAdoptionCheckIn["status"], string> = {
  scheduled: "bg-amber-500/10 text-amber-800",
  submitted: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive",
};

type CheckInDraft = {
  healthCondition: string;
  weightKg: string;
  notes: string;
  photoUrl: string;
};

const EMPTY_CHECK_IN_DRAFT: CheckInDraft = {
  healthCondition: "",
  weightKg: "",
  notes: "",
  photoUrl: "",
};

function draftFromCheckIn(checkIn: PostAdoptionCheckIn, pet?: PetListing): CheckInDraft {
  return {
    healthCondition: checkIn.healthCondition ?? pet?.healthStatus ?? "",
    weightKg: String(checkIn.weightKg ?? pet?.weightKg ?? ""),
    notes: checkIn.notes ?? pet?.notes ?? "",
    photoUrl: checkIn.photoUrl ?? "",
  };
}

function normalizeDraft(draft: CheckInDraft): PostAdoptionUpdateInput | null {
  const healthCondition = draft.healthCondition.trim();
  const weight = draft.weightKg.trim();
  const weightKg = weight ? Number(weight) : undefined;

  if (!healthCondition) return null;
  if (weightKg != null && (!Number.isFinite(weightKg) || weightKg <= 0)) return null;

  return {
    healthCondition,
    weightKg,
    notes: draft.notes.trim() || undefined,
    photoUrl: draft.photoUrl.trim() || undefined,
  };
}

export function PostAdoptionPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<PostAdoptionCheckIn[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CheckInDraft>>({});
  const [petProfiles, setPetProfiles] = useState<Record<string, PetListing>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      setCheckIns([]);
      setDrafts({});
      setPetProfiles({});
      return;
    }

    let active = true;

    getPostAdoptionCheckInsForUser(user.id).then(async (data) => {
      const uniquePetIds = Array.from(new Set(data.map((checkIn) => checkIn.petId)));
      const pets = await Promise.all(uniquePetIds.map((petId) => getPet(petId)));
      if (!active) return;

      const profiles = pets.reduce<Record<string, PetListing>>((acc, pet) => {
        if (pet) acc[pet.id] = pet;
        return acc;
      }, {});

      // Local mock state: initialize each form from the latest pet profile snapshot.
      setCheckIns(data);
      setPetProfiles(profiles);
      setDrafts(
        Object.fromEntries(
          data.map((checkIn) => [
            checkIn.id,
            draftFromCheckIn(checkIn, profiles[checkIn.petId]),
          ]),
        ),
      );
    });

    return () => {
      active = false;
    };
  }, [user]);

  const updateDraft = (id: string, field: keyof CheckInDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] ?? EMPTY_CHECK_IN_DRAFT), [field]: value },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();

    const draft = drafts[id] ?? EMPTY_CHECK_IN_DRAFT;
    const payload = normalizeDraft(draft);

    if (!payload) {
      setFormErrors((current) => ({ ...current, [id]: t("postAdoption.invalidForm") }));
      return;
    }

    setFormErrors((current) => ({ ...current, [id]: "" }));
    setSubmittingIds((current) => ({ ...current, [id]: true }));

    try {
      const result = await submitCheckIn(id, payload);
      if (!result) return;

      // Update both local collections so the submitted card and pet snapshot stay in sync.
      setCheckIns((prev) => prev.map((checkIn) => (checkIn.id === id ? result.checkIn : checkIn)));
      if (result.pet) {
        setPetProfiles((current) => ({ ...current, [result.pet!.id]: result.pet! }));
      }
      setDrafts((current) => ({
        ...current,
        [id]: draftFromCheckIn(result.checkIn, result.pet ?? petProfiles[result.checkIn.petId]),
      }));
    } finally {
      setSubmittingIds((current) => ({ ...current, [id]: false }));
    }
  };

  return (
    <>
      <PageMeta
        title="Post-Adoption - PawPath"
        description="Scheduled check-ins, health reports, and follow-up after pickup."
      />
      <PageHero
        eyebrow={t("postAdoption.eyebrow")}
        title={t("postAdoption.title")}
        subtitle={t("postAdoption.subtitle")}
      />
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        {checkIns.length === 0 && (
          <p className="text-center text-muted-foreground text-sm rounded-2xl border border-dashed border-border p-8">
            {t("postAdoption.empty")}{" "}
            <Link to="/adoption" className="text-primary hover:underline">
              {t("postAdoption.browseAdoption")}
            </Link>{" "}
            {t("postAdoption.emptySuffix")}
          </p>
        )}

        {checkIns.map((checkIn) => {
          const draft = drafts[checkIn.id] ?? EMPTY_CHECK_IN_DRAFT;
          const petProfile = petProfiles[checkIn.petId];
          const canSubmit = checkIn.status !== "submitted";

          return (
            <div
              key={checkIn.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{checkIn.petName}</h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {t("postAdoption.due", {
                      date: new Date(checkIn.scheduledAt).toLocaleDateString(),
                    })}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${STATUS_STYLE[checkIn.status]}`}
                >
                  {checkIn.status}
                </span>
              </div>

              {petProfile && (
                <div className="mt-4 grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="flex items-center gap-1 font-medium">
                      <HeartPulse className="h-4 w-4 text-primary" />
                      {t("postAdoption.currentHealth")}
                    </p>
                    <p className="mt-1 text-muted-foreground">{petProfile.healthStatus}</p>
                  </div>
                  {petProfile.weightKg != null && (
                    <div>
                      <p className="flex items-center gap-1 font-medium">
                        <Scale className="h-4 w-4 text-primary" />
                        {t("postAdoption.currentWeight")}
                      </p>
                      <p className="mt-1 text-muted-foreground">{petProfile.weightKg} kg</p>
                    </div>
                  )}
                  {petProfile.notes && (
                    <div className="sm:col-span-2">
                      <p className="flex items-center gap-1 font-medium">
                        <StickyNote className="h-4 w-4 text-primary" />
                        {t("postAdoption.currentNotes")}
                      </p>
                      <p className="mt-1 text-muted-foreground">{petProfile.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {checkIn.status === "submitted" && checkIn.healthReport && (
                <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm">
                  <div className="flex items-center gap-1 text-primary font-medium mb-1">
                    <CheckCircle2 className="h-4 w-4" /> {t("postAdoption.submitted")}
                    {checkIn.submittedAt && (
                      <span className="font-normal text-muted-foreground ml-1">
                        {t("postAdoption.submittedOn", {
                          date: new Date(checkIn.submittedAt).toLocaleDateString(),
                        })}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-line">{checkIn.healthReport}</p>
                  {checkIn.photoUrl && (
                    <img
                      src={checkIn.photoUrl}
                      alt={t("postAdoption.checkInPhotoAlt", { pet: checkIn.petName })}
                      className="mt-3 max-h-40 rounded-lg object-cover"
                    />
                  )}
                </div>
              )}

              {canSubmit && (
                <form
                  onSubmit={(event) => handleSubmit(event, checkIn.id)}
                  className="mt-4 space-y-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={`health-${checkIn.id}`} className="flex items-center gap-1">
                        <Camera className="h-4 w-4" /> {t("postAdoption.healthCondition")}
                      </Label>
                      <Input
                        id={`health-${checkIn.id}`}
                        value={draft.healthCondition}
                        onChange={(event) =>
                          updateDraft(checkIn.id, "healthCondition", event.target.value)
                        }
                        placeholder={t("postAdoption.healthPlaceholder")}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`weight-${checkIn.id}`}>{t("postAdoption.weight")}</Label>
                      <Input
                        id={`weight-${checkIn.id}`}
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={draft.weightKg}
                        onChange={(event) =>
                          updateDraft(checkIn.id, "weightKg", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`photo-${checkIn.id}`} className="flex items-center gap-1">
                        <ImagePlus className="h-4 w-4" /> {t("postAdoption.photoUrl")}
                      </Label>
                      <Input
                        id={`photo-${checkIn.id}`}
                        type="url"
                        value={draft.photoUrl}
                        onChange={(event) =>
                          updateDraft(checkIn.id, "photoUrl", event.target.value)
                        }
                        placeholder={t("postAdoption.photoUrlPlaceholder")}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={`notes-${checkIn.id}`}>{t("postAdoption.notes")}</Label>
                      <Textarea
                        id={`notes-${checkIn.id}`}
                        rows={3}
                        value={draft.notes}
                        onChange={(event) => updateDraft(checkIn.id, "notes", event.target.value)}
                        placeholder={t("postAdoption.notesPlaceholder")}
                      />
                    </div>
                  </div>

                  {formErrors[checkIn.id] && (
                    <p className="text-xs text-destructive">{formErrors[checkIn.id]}</p>
                  )}

                  <Button type="submit" disabled={submittingIds[checkIn.id]}>
                    {submittingIds[checkIn.id]
                      ? t("postAdoption.submitting")
                      : t("postAdoption.submit")}
                  </Button>
                </form>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
