import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { GoongMap, type GoongMapMarker } from "@/features/pets/components/GoongMap";
import { PetImage } from "@/features/pets/components/PetImage";
import { getPetPickupLocations } from "@/features/pets/api/petsApi";
import type { PetListing } from "@/features/pets/types";
import { useI18n } from "@/i18n/I18nContext";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";

const STATUS_LABEL: Record<PetListing["status"], { label: string; color: string }> = {
  available: { label: "Available", color: "#10b981" },
  pending: { label: "Pending pickup", color: "#f59e0b" },
  adopted: { label: "Adopted", color: "#6b7280" },
};

export function MapPage() {
  const { t } = useI18n();
  const [pets, setPets] = useState<PetListing[]>([]);
  const [filter, setFilter] = useState<"All" | PetListing["species"]>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    getPetPickupLocations().then(setPets);
  }, []);

  const places = useMemo(() => {
    return pets
      .filter((p) => p.pickup?.address)
      .filter((p) => (filter === "All" ? true : p.species === filter))
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.pickup?.address ?? "").toLowerCase().includes(query.toLowerCase()),
      );
  }, [pets, filter, query]);

  useEffect(() => {
    if (selectedId && !places.some((p) => p.id === selectedId)) {
      setSelectedId(null);
    }
  }, [places, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    listRefs.current[selectedId]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  const mapMarkers: GoongMapMarker[] = useMemo(
    () =>
      places
        .filter((p) => p.pickup?.lat != null && p.pickup?.lng != null)
        .map((p) => ({
          id: p.id,
          lng: p.pickup!.lng!,
          lat: p.pickup!.lat!,
          color: STATUS_LABEL[p.status].color,
          label: p.name,
          address: p.pickup!.address,
          statusLabel: STATUS_LABEL[p.status].label,
          imageUrl: p.images[0] ?? "",
        })),
    [places],
  );

  const selected = places.find((p) => p.id === selectedId) ?? null;
  const filters: ("All" | PetListing["species"])[] = ["All", "dog", "cat", "other"];

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
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
              placeholder="Tìm theo tên pet hoặc địa chỉ…"
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
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="relative rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-card)] aspect-[4/3] lg:aspect-auto">
            <GoongMap
              markers={mapMarkers}
              selectedId={selectedId}
              onSelect={handleSelect}
              className="h-full min-h-[420px] lg:min-h-[520px]"
            />

            {selected && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm rounded-xl bg-card/95 backdrop-blur border border-border overflow-hidden shadow-lg z-10 pointer-events-auto">
                <PetImage
                  src={selected.images[0]}
                  alt={selected.name}
                  className="w-full h-28 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {STATUS_LABEL[selected.status].label}
                      </div>
                      <div className="font-semibold mt-0.5">{selected.name}</div>
                    </div>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-muted-foreground hover:text-foreground text-sm"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {selected.pickup?.address}
                  </div>
                  <Link
                    to={`/adoption?pet=${selected.id}`}
                    className="mt-3 inline-block text-sm text-primary font-medium hover:underline"
                  >
                    {t("map.viewDetails")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            <p className="text-xs text-muted-foreground px-1">
              {places.length} điểm hẹn · click để zoom bản đồ
            </p>
            {places.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                Không có điểm hẹn phù hợp.
              </div>
            )}
            {places.map((p) => {
              const meta = STATUS_LABEL[p.status];
              const isActive = selectedId === p.id;
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
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {p.pickup?.address}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{meta.label}</div>
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
