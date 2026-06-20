import { useMemo, useState } from "react";
import { MapPin, Phone, Star, Search, Stethoscope, Scissors, Bone, Home } from "lucide-react";
import { PageHero } from "@/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";

type Category = "Vet" | "Groomer" | "Store" | "Boarding";

type Place = {
  id: string;
  name: string;
  category: Category;
  address: string;
  phone: string;
  rating: number;
  x: number;
  y: number;
};

const CATEGORY_META: Record<Category, { icon: typeof Stethoscope; color: string }> = {
  Vet: { icon: Stethoscope, color: "#ef4444" },
  Groomer: { icon: Scissors, color: "#8b5cf6" },
  Store: { icon: Bone, color: "#f59e0b" },
  Boarding: { icon: Home, color: "#10b981" },
};

const PLACES: Place[] = [
  { id: "1", name: "Happy Paws Veterinary Clinic", category: "Vet", address: "12 Maple Ave", phone: "(555) 123-4410", rating: 4.8, x: 28, y: 34 },
  { id: "2", name: "Fluffy Tails Grooming", category: "Groomer", address: "88 Oak St", phone: "(555) 220-9931", rating: 4.6, x: 55, y: 22 },
  { id: "3", name: "PetMart Supplies", category: "Store", address: "201 Pine Rd", phone: "(555) 770-1188", rating: 4.4, x: 70, y: 55 },
  { id: "4", name: "Cozy Kennels Boarding", category: "Boarding", address: "5 Riverbend Ln", phone: "(555) 442-3320", rating: 4.9, x: 40, y: 70 },
  { id: "5", name: "Westside Animal Hospital", category: "Vet", address: "300 Cedar Blvd", phone: "(555) 998-1100", rating: 4.7, x: 18, y: 60 },
  { id: "6", name: "Bark & Brush Salon", category: "Groomer", address: "47 Birch Way", phone: "(555) 311-7722", rating: 4.5, x: 62, y: 78 },
  { id: "7", name: "The Treat Shop", category: "Store", address: "9 Elm Court", phone: "(555) 660-4422", rating: 4.3, x: 82, y: 30 },
  { id: "8", name: "Pawsome Stays", category: "Boarding", address: "150 Willow Dr", phone: "(555) 880-2244", rating: 4.8, x: 33, y: 50 },
];

const CATEGORIES: ("All" | Category)[] = ["All", "Vet", "Groomer", "Store", "Boarding"];

export function MapPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const places = useMemo(() => {
    return PLACES.filter((p) => (filter === "All" ? true : p.category === filter)).filter(
      (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.address.toLowerCase().includes(query.toLowerCase()),
    );
  }, [filter, query]);

  const selected = places.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <PageMeta
        title="Pet Care Map — PawPath"
        description="Find vets, groomers, pet stores, and boarding nearby on the PawPath pet care map."
        ogTitle="Pet Care Map — PawPath"
        ogDescription="Discover trusted pet care places near you."
      />
      <PageHero
        eyebrow="Find Care"
        title="Pet care places near you"
        subtitle="Vets, groomers, supply shops, and boarding — all in one friendly map."
      />

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or address…"
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
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
          <div
            className="relative rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-card)] aspect-[4/3] lg:aspect-auto lg:min-h-[520px]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px), var(--gradient-soft)",
              backgroundSize: "40px 40px, 40px 40px, cover",
            }}
          >
            <div className="absolute top-3 left-3 rounded-md bg-background/80 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground border border-border">
              Preview map · connect Google Maps for live data
            </div>

            {places.map((p) => {
              const meta = CATEGORY_META[p.category];
              const Icon = meta.icon;
              const isActive = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className="absolute -translate-x-1/2 -translate-y-full group"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  aria-label={p.name}
                >
                  <div
                    className={`flex items-center justify-center h-9 w-9 rounded-full shadow-md text-white transition-transform ${
                      isActive ? "scale-125 ring-4 ring-white/60" : "group-hover:scale-110"
                    }`}
                    style={{ background: meta.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="mx-auto h-2 w-2 rotate-45 -mt-1" style={{ background: meta.color }} />
                </button>
              );
            })}

            {selected && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm rounded-xl bg-card border border-border p-4 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{selected.category}</div>
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
                  <MapPin className="h-3.5 w-3.5" /> {selected.address}
                </div>
                <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {selected.phone}
                </div>
                <div className="mt-1 text-sm flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-current text-amber-500" /> {selected.rating.toFixed(1)}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {places.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                No places match your search.
              </div>
            )}
            {places.map((p) => {
              const meta = CATEGORY_META[p.category];
              const Icon = meta.icon;
              const isActive = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left rounded-xl border p-4 transition shadow-[var(--shadow-card)] ${
                    isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ background: meta.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs flex items-center gap-1 text-amber-600 shrink-0">
                          <Star className="h-3 w-3 fill-current" />
                          {p.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{p.address}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {p.category} · {p.phone}
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
