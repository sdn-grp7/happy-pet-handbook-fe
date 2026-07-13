import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, PawPrint, Upload } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import type { GoongPickup } from "@/features/pets/api/goongPlaces";
import { createPet } from "@/features/pets/api/petsApi";
import { uploadCareImage } from "@/features/pets/api/uploadCareImage";
import { breedLabelKey } from "@/features/pets/breedLabel";
import { breedsForSpecies, type PetBreed } from "@/features/pets/breeds";
import { PickupLocationPicker } from "@/features/pets/components/PickupLocationPicker";
import type { PetGender, PetSpecies } from "@/features/pets/types";
import { ApiError } from "@/lib/api";
import { toast } from "@/shared/lib/toast";
import { useI18n } from "@/i18n/I18nContext";

type FormState = {
  name: string;
  species: PetSpecies;
  breed: PetBreed;
  gender: PetGender;
  ageValue: string;
  ageUnit: "months" | "years";
  weightKg: string;
  healthStatus: string;
  description: string;
  notes: string;
  zaloPhone: string;
};

const INITIAL: FormState = {
  name: "",
  species: "dog",
  breed: "cho_lai",
  gender: "unknown",
  ageValue: "",
  ageUnit: "years",
  weightKg: "",
  healthStatus: "",
  description: "",
  notes: "",
  zaloPhone: "",
};

export function ListPetPage() {
  const { t } = useI18n();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [pickup, setPickup] = useState<GoongPickup | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const breedOptions = useMemo(() => breedsForSpecies(form.species), [form.species]);

  const handleSpeciesChange = (species: PetSpecies) => {
    const nextBreeds = breedsForSpecies(species);
    setForm((prev) => ({
      ...prev,
      species,
      breed: nextBreeds.includes(prev.breed) ? prev.breed : nextBreeds[0],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    if (!form.name.trim() || !form.breed || !form.ageValue.trim() || !form.healthStatus.trim()) {
      toast.error(t("listPet.requiredFields"));
      return;
    }

    const ageNum = Number(form.ageValue);
    if (!Number.isFinite(ageNum) || ageNum < 0) {
      toast.error(t("listPet.ageInvalid"));
      return;
    }
    const ageMonths =
      form.ageUnit === "years" ? Math.round(ageNum * 12) : Math.round(ageNum);
    if (ageMonths > 360) {
      toast.error(t("listPet.ageInvalid"));
      return;
    }
    if (files.length === 0) {
      toast.error(t("listPet.photoRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const images: string[] = [];
      for (const file of files.slice(0, 8)) {
        images.push(await uploadCareImage(token, file, "pawpath/care"));
      }

      const weight = form.weightKg.trim() ? Number(form.weightKg) : undefined;
      const pet = await createPet(token, {
        name: form.name.trim(),
        species: form.species,
        breed: form.breed,
        gender: form.gender,
        ageMonths,
        healthStatus: form.healthStatus.trim(),
        images,
        ...(weight && Number.isFinite(weight) && weight > 0 ? { weightKg: weight } : {}),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
        ...(form.zaloPhone.trim() ? { zaloPhone: form.zaloPhone.trim() } : {}),
        ...(pickup?.address.trim()
          ? {
              pickup: {
                address: pickup.address.trim(),
                ...(pickup.lat != null && Number.isFinite(pickup.lat) ? { lat: pickup.lat } : {}),
                ...(pickup.lng != null && Number.isFinite(pickup.lng) ? { lng: pickup.lng } : {}),
              },
            }
          : {}),
      });

      toast.success(t("listPet.saved"));
      navigate(`/adoption?pet=${encodeURIComponent(pet.id)}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("listPet.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title={`${t("listPet.title")} — PawPath`} description={t("listPet.metaDesc")} />
      <PageHero
        eyebrow={t("listPet.eyebrow")}
        title={t("listPet.title")}
        subtitle={t("listPet.subtitle")}
      />
      <section className="mx-auto max-w-2xl px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <p className="text-sm text-muted-foreground">{t("listPet.ownerHint")}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">{t("listPet.name")}</span>
              <input
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">{t("listPet.species")}</span>
              <select
                value={form.species}
                onChange={(e) => handleSpeciesChange(e.target.value as PetSpecies)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="dog">{t("adoption.speciesDog")}</option>
                <option value="cat">{t("adoption.speciesCat")}</option>
              </select>
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">{t("listPet.gender")}</span>
              <select
                value={form.gender}
                onChange={(e) => setField("gender", e.target.value as PetGender)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="male">{t("pet.male")}</option>
                <option value="female">{t("pet.female")}</option>
                <option value="unknown">{t("pet.unknown")}</option>
              </select>
            </label>

            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">{t("listPet.breed")}</span>
              <select
                required
                value={form.breed}
                onChange={(e) => setField("breed", e.target.value as PetBreed)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                {breedOptions.map((b) => (
                  <option key={b} value={b}>
                    {t(breedLabelKey(b))}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1 text-sm">
              <span className="font-medium">{t("listPet.age")}</span>
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.ageValue}
                  onChange={(e) => setField("ageValue", e.target.value)}
                  placeholder={t("listPet.agePlaceholder")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                />
                <select
                  value={form.ageUnit}
                  onChange={(e) => setField("ageUnit", e.target.value as "months" | "years")}
                  className="w-28 shrink-0 rounded-lg border border-input bg-background px-2 py-2 outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="years">{t("listPet.ageUnitYears")}</option>
                  <option value="months">{t("listPet.ageUnitMonths")}</option>
                </select>
              </div>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">{t("listPet.weight")}</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={form.weightKg}
                onChange={(e) => setField("weightKg", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">{t("listPet.health")}</span>
              <input
                required
                value={form.healthStatus}
                onChange={(e) => setField("healthStatus", e.target.value)}
                placeholder={t("listPet.healthPlaceholder")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">{t("listPet.description")}</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">{t("listPet.notes")}</span>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">{t("listPet.zalo")}</span>
              <input
                value={form.zaloPhone}
                onChange={(e) => setField("zaloPhone", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <div className="space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">{t("listPet.pickup")}</span>
              <PickupLocationPicker value={pickup} onChange={setPickup} />
            </div>

            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">{t("listPet.photos")}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
              />
              <span className="text-xs text-muted-foreground">
                {files.length > 0
                  ? t("listPet.photosSelected", { count: Math.min(files.length, 8) })
                  : t("listPet.photosHint")}
              </span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {submitting ? t("common.loading") : t("listPet.submit")}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/adoption-requests">{t("listPet.afterListLink")}</Link>
            </Button>
          </div>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <PawPrint className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t("listPet.approveHint")}
          </p>
        </form>
      </section>
    </>
  );
}
