import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PawPrint, MapPin, RotateCcw, ChevronDown, Search } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getPets, getPet } from "@/features/pets/api/petsApi";
import { PetImage } from "@/features/pets/components/PetImage";
import { PetDetailModal } from "@/features/pets/components/PetDetailModal";
import { ageMatchesBuckets, type AgeBucket } from "@/features/adoption/lib/ageFilter";
import { useI18n } from "@/i18n/I18nContext";
import type { ListingStatus, PetGender, PetListing, PetSpecies } from "@/features/pets/types";
import type { TranslationKey } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";

const STATUS_KEYS: Record<PetListing["status"], TranslationKey> = {
  available: "adoption.available",
  pending: "adoption.pending",
  adopted: "adoption.adopted",
};

type SpeciesFilter = "all" | PetSpecies;
type GenderFilter = "all" | PetGender;
type StatusFilter = "all" | ListingStatus;
type WeightFilter = "all" | "lt5" | "5to10" | "10to20" | "gt20";

const AGE_BUCKETS: { value: AgeBucket; labelKey: TranslationKey }[] = [
  { value: "lt6m", labelKey: "adoption.ageLt6m" },
  { value: "y1to4", labelKey: "adoption.age1to4" },
  { value: "y5to7", labelKey: "adoption.age5to7" },
  { value: "gt7", labelKey: "adoption.ageGt7" },
];

const WEIGHT_MATCH: Record<Exclude<WeightFilter, "all">, (w?: number) => boolean> = {
  lt5: (w) => w != null && w < 5,
  "5to10": (w) => w != null && w >= 5 && w <= 10,
  "10to20": (w) => w != null && w > 10 && w <= 20,
  gt20: (w) => w != null && w > 20,
};

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-1 focus:ring-ring";

export function AdoptionPage() {
  const { t, locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PetListing | null>(null);

  const [species, setSpecies] = useState<SpeciesFilter>("all");
  const [ageBuckets, setAgeBuckets] = useState<AgeBucket[]>([]);
  const [gender, setGender] = useState<GenderFilter>("all");
  const [weight, setWeight] = useState<WeightFilter>("all");
  const [breed, setBreed] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const petId = searchParams.get("pet");

  useEffect(() => {
    setLoading(true);
    getPets().then((data) => {
      setPets(data);
      setLoading(false);
    });
  }, [locale]);

  useEffect(() => {
    if (!petId) {
      setSelected(null);
      return;
    }
    const fromList = pets.find((p) => p.id === petId);
    if (fromList) {
      setSelected(fromList);
      return;
    }
    getPet(petId).then((p) => setSelected(p ?? null));
  }, [petId, pets]);

  const breedOptions = useMemo(
    () => [...new Set(pets.map((p) => p.breed).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [pets],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pets.filter((p) => {
      if (species !== "all" && p.species !== species) return false;
      if (!ageMatchesBuckets(p.age, ageBuckets)) return false;
      if (gender !== "all" && p.gender !== gender) return false;
      if (breed !== "all" && p.breed !== breed) return false;
      if (status !== "all" && p.status !== status) return false;
      if (weight !== "all" && !WEIGHT_MATCH[weight](p.weightKg)) return false;
      if (q) {
        const haystack = [p.name, p.code, p.breed, p.pickup?.address ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [pets, species, ageBuckets, gender, breed, status, weight, query]);

  const openPet = useCallback(
    (pet: PetListing) => {
      setSelected(pet);
      setSearchParams({ pet: pet.id }, { replace: false });
    },
    [setSearchParams],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSelected(null);
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams],
  );

  const toggleAgeBucket = (bucket: AgeBucket) => {
    setAgeBuckets((prev) =>
      prev.includes(bucket) ? prev.filter((b) => b !== bucket) : [...prev, bucket],
    );
  };

  const resetFilters = () => {
    setSpecies("all");
    setAgeBuckets([]);
    setGender("all");
    setWeight("all");
    setBreed("all");
    setStatus("all");
    setQuery("");
  };

  const speciesChips: { value: SpeciesFilter; label: string }[] = [
    { value: "all", label: t("adoption.filterAll") },
    { value: "dog", label: t("adoption.speciesDog") },
    { value: "cat", label: t("adoption.speciesCat") },
  ];

  return (
    <>
      <PageMeta title={t("adoption.metaTitle")} description={t("adoption.metaDesc")} />
      <PageHero
        eyebrow={t("adoption.eyebrow")}
        title={t("adoption.title")}
        subtitle={t("adoption.subtitle")}
      />
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{t("adoption.filters")}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={resetFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("adoption.resetFilters")}
            </Button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("adoption.searchPlaceholder")}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {speciesChips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setSpecies(chip.value)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition",
                  species === chip.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="block text-xs text-muted-foreground">
              {t("pet.age")}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      selectClass,
                      "mt-1 flex items-center justify-between gap-2 text-left text-foreground",
                    )}
                  >
                    <span className="truncate">
                      {ageBuckets.length === 0
                        ? t("pet.age")
                        : ageBuckets
                            .map((b) => t(AGE_BUCKETS.find((x) => x.value === b)!.labelKey))
                            .join(", ")}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-2"
                >
                  <ul className="space-y-1">
                    {AGE_BUCKETS.map((opt) => {
                      const checked = ageBuckets.includes(opt.value);
                      return (
                        <li key={opt.value}>
                          <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted/60">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleAgeBucket(opt.value)}
                            />
                            {t(opt.labelKey)}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </PopoverContent>
              </Popover>
            </div>

            <label className="block text-xs text-muted-foreground">
              {t("pet.gender")}
              <select
                className={cn(selectClass, "mt-1")}
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderFilter)}
              >
                <option value="all">{t("adoption.filterAll")}</option>
                <option value="male">{t("pet.male")}</option>
                <option value="female">{t("pet.female")}</option>
                <option value="unknown">{t("pet.unknown")}</option>
              </select>
            </label>

            <label className="block text-xs text-muted-foreground">
              {t("pet.weight")}
              <select
                className={cn(selectClass, "mt-1")}
                value={weight}
                onChange={(e) => setWeight(e.target.value as WeightFilter)}
              >
                <option value="all">{t("adoption.filterAll")}</option>
                <option value="lt5">{t("adoption.weightLt5")}</option>
                <option value="5to10">{t("adoption.weight5to10")}</option>
                <option value="10to20">{t("adoption.weight10to20")}</option>
                <option value="gt20">{t("adoption.weightGt20")}</option>
              </select>
            </label>

            <label className="block text-xs text-muted-foreground">
              {t("adoption.breed")}
              <select
                className={cn(selectClass, "mt-1")}
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              >
                <option value="all">{t("adoption.filterAll")}</option>
                {breedOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-muted-foreground">
              {t("pet.adoptionStatus")}
              <select
                className={cn(selectClass, "mt-1")}
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              >
                <option value="all">{t("adoption.filterAll")}</option>
                <option value="available">{t("adoption.available")}</option>
                <option value="pending">{t("adoption.pending")}</option>
                <option value="adopted">{t("adoption.adopted")}</option>
              </select>
            </label>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {t("adoption.resultCount", { count: filtered.length })}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">{t("adoption.loading")}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("adoption.emptyFiltered")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => openPet(pet)}
                className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <PetImage
                    src={pet.images[0]}
                    alt={pet.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.breed} · {pet.age}
                        {pet.weightKg != null ? ` · ${pet.weightKg} kg` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {t(STATUS_KEYS[pet.status])}
                    </span>
                  </div>
                  {pet.status === "adopted" && pet.adoptedBy && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {t("pet.adopter")}{" "}
                      <span className="font-medium text-foreground">{pet.adoptedBy.name}</span>
                    </p>
                  )}
                  {pet.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {pet.description}
                    </p>
                  ) : null}
                  {pet.pickup?.address && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {pet.pickup.address}
                    </div>
                  )}
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    <PawPrint className="h-4 w-4" /> {t("adoption.viewDetails")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <PetDetailModal pet={selected} open={Boolean(selected)} onOpenChange={handleOpenChange} />
    </>
  );
}
