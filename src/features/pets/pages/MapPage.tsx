import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { GoongMap, type GoongMapMarker } from "@/features/pets/components/GoongMap";
import { PetImage } from "@/features/pets/components/PetImage";
import { getPet, getPetPickupLocations } from "@/features/pets/api/petsApi";
import type { PetListing } from "@/features/pets/types";
import { useI18n } from "@/i18n/I18nContext";
import { useMemo, useState, useEffect, useCallback, useRef, startTransition } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Search } from "lucide-react";

/** Warm PawPath palette — no green. */
const STATUS_META: Record<PetListing["status"], { color: string }> = {
  available: { color: "#ea580c" },
  pending: { color: "#d97706" },
  adopted: { color: "#78716c" },
};

function petMatches(p: PetListing, idOrCode: string) {
  return p.id === idOrCode || p.code === idOrCode;
}

export function MapPage() {
  const { t, locale } = useI18n();
  const [searchParams] = useSearchParams();
  const petFromUrl = searchParams.get("pet");
  const [pets, setPets] = useState<PetListing[]>([]);
  const [petsReady, setPetsReady] = useState(false);
  const [filter, setFilter] = useState<"All" | PetListing["species"]>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    setPetsReady(false);

    (async () => {
      const list = await getPetPickupLocations();
      let merged = list;

      // Deep-link may point at adopted (or otherwise excluded) pets — still show on map.
      if (petFromUrl && !list.some((p) => petMatches(p, petFromUrl))) {
        const extra = await getPet(petFromUrl);
        if (
          extra?.pickup?.address &&
          extra.pickup.lat != null &&
          extra.pickup.lng != null
        ) {
          merged = [...list, extra];
        }
      }

      if (cancelled) return;
      setPets(merged);
      setPetsReady(true);

      if (petFromUrl) {
        const match = merged.find((p) => petMatches(p, petFromUrl));
        setSelectedId(match?.id ?? null);
        setFilter("All");
        setQuery("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, petFromUrl]);

  const places = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pets
      .filter((p) => p.pickup?.address)
      .filter((p) => (filter === "All" ? true : p.species === filter))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.pickup?.address ?? "").toLowerCase().includes(q),
      );
  }, [pets, filter, query]);

  const mappable = useMemo(
    () => places.filter((p) => p.pickup?.lat != null && p.pickup?.lng != null),
    [places],
  );

  useEffect(() => {
    if (!petsReady || !selectedId) return;
    if (!places.some((p) => p.id === selectedId)) {
      if (pets.some((p) => p.id === selectedId)) return;
      setSelectedId(null);
    }
  }, [places, selectedId, petsReady, pets]);

  useEffect(() => {
    if (!selectedId || !petsReady) return;
    const timer = window.setTimeout(() => {
      listRefs.current[selectedId]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [selectedId, petsReady, places]);

  const mapMarkers: GoongMapMarker[] = useMemo(
    () =>
      mappable.map((p) => ({
        id: p.id,
        lng: p.pickup!.lng!,
        lat: p.pickup!.lat!,
        color: STATUS_META[p.status].color,
        label: p.name,
        address: p.pickup!.address,
        statusLabel: t(`adoption.${p.status}` as "adoption.available"),
        imageUrl: p.images[0] ?? "",
      })),
    [mappable, t],
  );

  const selected = useMemo(
    () => places.find((p) => p.id === selectedId) ?? null,
    [places, selectedId],
  );
  const filters: ("All" | PetListing["species"])[] = ["All", "dog", "cat"];

  const handleSelect = useCallback((id: string | null) => {
    startTransition(() => setSelectedId(id));
  }, []);

  return (
    <>
      <PageMeta title={`${t("map.title")} — ${t("brand.name")}`} description={t("map.subtitle")} />
      <PageHero eyebrow={t("map.eyebrow")} title={t("map.title")} subtitle={t("map.subtitle")} />

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("map.searchPlaceholder")}
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-sm border transition capitalize ${
                  filter === c
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "All" ? t("forum.all") : c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="relative min-h-[420px] min-w-0 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)] lg:col-span-8 lg:min-h-[640px]">
            <GoongMap
              markers={mapMarkers}
              selectedId={selectedId}
              onSelect={handleSelect}
              className="absolute inset-0 h-full w-full"
            />

            {selected && (
              <div className="pointer-events-auto absolute bottom-4 left-4 right-4 z-10 max-w-sm overflow-hidden rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur sm:right-auto">
                <PetImage
                  src={selected.images[0]}
                  alt={selected.name}
                  className="h-28 w-full object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t(`adoption.${selected.status}` as "adoption.available")}
                      </div>
                      <div className="mt-0.5 font-semibold">{selected.name}</div>
                    </div>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {selected.pickup?.address}
                  </div>
                  <Link
                    to={`/adoption?pet=${selected.id}`}
                    className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    {t("map.viewDetails")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="max-h-[640px] space-y-3 overflow-y-auto pr-1 lg:col-span-4">
            <p className="text-xs text-muted-foreground px-1">
              {t("map.pinCount", { count: mapMarkers.length, total: places.length })}
            </p>
            {places.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                {t("map.empty")}
              </div>
            )}
            {places.map((p) => {
              const isActive = selectedId === p.id;
              const hasPin = p.pickup?.lat != null && p.pickup?.lng != null;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    listRefs.current[p.id] = el;
                  }}
                  onClick={() => handleSelect(p.id)}
                  className={`w-full text-left rounded-xl border p-4 transition shadow-[var(--shadow-card)] ${
                    isActive
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <PetImage
                      src={p.images[0]}
                      alt={p.name}
                      className="h-12 w-12 rounded-lg object-cover shrink-0 border border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs shrink-0 text-muted-foreground capitalize">
                          {p.species}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {p.pickup?.address}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t(`adoption.${p.status}` as "adoption.available")}
                        {!hasPin ? ` · ${t("map.noCoords")}` : ""}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>
        </div>
      </section>
    </>
  );
}
