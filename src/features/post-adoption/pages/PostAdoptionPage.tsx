import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Camera, Loader2, Syringe } from "lucide-react";
import { toast } from "@/shared/lib/toast";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import {
  addPetCheckIn,
  addPetVaccination,
  getPetsAdoptedBy,
} from "@/features/pets/api/petsApi";
import { uploadCareImage } from "@/features/pets/api/uploadCareImage";
import { breedLabelKey } from "@/features/pets/breedLabel";
import { PetImage } from "@/features/pets/components/PetImage";
import type { PetListing } from "@/features/pets/types";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";

type CheckInDraft = { caption: string; date: string; file: File | null };
type VaccineDraft = {
  name: string;
  date: string;
  nextDue: string;
  notes: string;
  file: File | null;
};

const emptyCheckIn = (): CheckInDraft => ({
  caption: "",
  date: new Date().toISOString().slice(0, 10),
  file: null,
});

const emptyVaccine = (): VaccineDraft => ({
  name: "",
  date: new Date().toISOString().slice(0, 10),
  nextDue: "",
  notes: "",
  file: null,
});

export function PostAdoptionPage() {
  const { t } = useI18n();
  const { user, token } = useAuth();
  const [pets, setPets] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInDrafts, setCheckInDrafts] = useState<Record<string, CheckInDraft>>({});
  const [vaccineDrafts, setVaccineDrafts] = useState<Record<string, VaccineDraft>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    getPetsAdoptedBy(user.id)
      .then(setPets)
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const checkInDraft = (petId: string) => checkInDrafts[petId] ?? emptyCheckIn();
  const vaccineDraft = (petId: string) => vaccineDrafts[petId] ?? emptyVaccine();

  const handleCheckIn = async (pet: PetListing) => {
    if (!token) return;
    const draft = checkInDraft(pet.id);
    if (!draft.caption.trim()) {
      toast.error(t("postAdoption.checkInCaptionRequired"));
      return;
    }
    if (!draft.file) {
      toast.error(t("postAdoption.photoRequired"));
      return;
    }

    setBusyKey(`ci-${pet.id}`);
    try {
      const photoUrl = await uploadCareImage(token, draft.file, "pawpath/check-ins");
      await addPetCheckIn(token, pet.id, {
        photoUrl,
        caption: draft.caption.trim(),
        date: draft.date || undefined,
      });
      toast.success(t("postAdoption.checkInSaved"));
      setCheckInDrafts((prev) => ({ ...prev, [pet.id]: emptyCheckIn() }));
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("postAdoption.saveError"));
    } finally {
      setBusyKey(null);
    }
  };

  const handleVaccine = async (pet: PetListing) => {
    if (!token) return;
    const draft = vaccineDraft(pet.id);
    const name = draft.name.trim() || (draft.file ? t("postAdoption.vaccinePhotoDefault") : "");
    if (!name) {
      toast.error(t("postAdoption.vaccineNameRequired"));
      return;
    }
    if (!draft.date) {
      toast.error(t("postAdoption.vaccineDateRequired"));
      return;
    }

    setBusyKey(`vx-${pet.id}`);
    try {
      const photoUrl = draft.file
        ? await uploadCareImage(token, draft.file, "pawpath/vaccines")
        : undefined;
      await addPetVaccination(token, pet.id, {
        name,
        date: draft.date,
        ...(draft.nextDue ? { nextDue: draft.nextDue } : {}),
        ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
        ...(photoUrl ? { photoUrl } : {}),
      });
      toast.success(t("postAdoption.vaccineSaved"));
      setVaccineDrafts((prev) => ({ ...prev, [pet.id]: emptyVaccine() }));
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("postAdoption.saveError"));
    } finally {
      setBusyKey(null);
    }
  };

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
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-12">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : pets.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("postAdoption.emptyBefore")}{" "}
            <Link to="/adoption" className="text-primary hover:underline">
              {t("postAdoption.emptyLink")}
            </Link>{" "}
            {t("postAdoption.emptyAfter")}
          </p>
        ) : (
          pets.map((pet) => {
            const ci = checkInDraft(pet.id);
            const vx = vaccineDraft(pet.id);
            const ciBusy = busyKey === `ci-${pet.id}`;
            const vxBusy = busyKey === `vx-${pet.id}`;
            const myCheckIns =
              pet.owners.find((o) => !o.to)?.checkIns.length ??
              pet.owners.flatMap((o) => o.checkIns).length;

            return (
              <article
                key={pet.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
              >
                <div className="flex gap-4 border-b border-border p-4 sm:p-5">
                  <PetImage
                    src={pet.images[0]}
                    alt={pet.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      #{pet.code} · {t(breedLabelKey(pet.breed))}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("postAdoption.stats", {
                        vaccines: pet.vaccinations.length,
                        checkIns: myCheckIns,
                      })}
                    </p>
                    <Link
                      to={`/adoption?pet=${encodeURIComponent(pet.id)}`}
                      className="mt-1 inline-block text-sm text-primary hover:underline"
                    >
                      {t("postAdoption.viewPet")}
                    </Link>
                  </div>
                </div>

                <div className="grid gap-6 p-4 sm:grid-cols-2 sm:p-5">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleCheckIn(pet);
                    }}
                  >
                    <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                      <Camera className="h-4 w-4 text-primary" />
                      {t("postAdoption.checkInTitle")}
                    </h4>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">{t("postAdoption.checkInCaption")}</span>
                      <textarea
                        rows={3}
                        value={ci.caption}
                        onChange={(e) =>
                          setCheckInDrafts((prev) => ({
                            ...prev,
                            [pet.id]: { ...ci, caption: e.target.value },
                          }))
                        }
                        placeholder={t("postAdoption.healthPlaceholder")}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">{t("postAdoption.date")}</span>
                      <input
                        type="date"
                        value={ci.date}
                        onChange={(e) =>
                          setCheckInDrafts((prev) => ({
                            ...prev,
                            [pet.id]: { ...ci, date: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">{t("postAdoption.photo")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCheckInDrafts((prev) => ({
                            ...prev,
                            [pet.id]: { ...ci, file: e.target.files?.[0] ?? null },
                          }))
                        }
                        className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
                      />
                    </label>
                    <Button type="submit" disabled={ciBusy} className="w-full gap-2 sm:w-auto">
                      {ciBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      {ciBusy ? t("common.loading") : t("postAdoption.submitCheckIn")}
                    </Button>
                  </form>

                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleVaccine(pet);
                    }}
                  >
                    <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                      <Syringe className="h-4 w-4 text-primary" />
                      {t("postAdoption.vaccineTitle")}
                    </h4>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">{t("postAdoption.vaccineName")}</span>
                      <input
                        type="text"
                        value={vx.name}
                        onChange={(e) =>
                          setVaccineDrafts((prev) => ({
                            ...prev,
                            [pet.id]: { ...vx, name: e.target.value },
                          }))
                        }
                        placeholder={t("postAdoption.vaccineNamePlaceholder")}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">{t("postAdoption.date")}</span>
                        <input
                          type="date"
                          value={vx.date}
                          onChange={(e) =>
                            setVaccineDrafts((prev) => ({
                              ...prev,
                              [pet.id]: { ...vx, date: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">{t("postAdoption.nextDue")}</span>
                        <input
                          type="date"
                          value={vx.nextDue}
                          onChange={(e) =>
                            setVaccineDrafts((prev) => ({
                              ...prev,
                              [pet.id]: { ...vx, nextDue: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </label>
                    </div>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">{t("postAdoption.notes")}</span>
                      <input
                        type="text"
                        value={vx.notes}
                        onChange={(e) =>
                          setVaccineDrafts((prev) => ({
                            ...prev,
                            [pet.id]: { ...vx, notes: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">{t("postAdoption.vaccinePhoto")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setVaccineDrafts((prev) => ({
                            ...prev,
                            [pet.id]: { ...vx, file: e.target.files?.[0] ?? null },
                          }))
                        }
                        className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
                      />
                    </label>
                    <Button type="submit" disabled={vxBusy} variant="outline" className="w-full gap-2 sm:w-auto">
                      {vxBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Syringe className="h-4 w-4" />}
                      {vxBusy ? t("common.loading") : t("postAdoption.submitVaccine")}
                    </Button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
