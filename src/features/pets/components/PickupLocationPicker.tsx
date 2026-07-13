import { useEffect, useId, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Loader2, MapPin, X } from "lucide-react";
import {
  goongAutocomplete,
  goongPlaceDetail,
  goongReverseGeocode,
  hasGoongApiKey,
  type GoongPickup,
  type GoongPrediction,
} from "@/features/pets/api/goongPlaces";
import { getGoongMapTilesKey, goongMapStyleUrl } from "@/lib/goong";
import { useI18n } from "@/i18n/I18nContext";

const DEFAULT_CENTER: [number, number] = [105.8342, 21.0278];
const DEFAULT_ZOOM = 12;

type Props = {
  value: GoongPickup | null;
  onChange: (value: GoongPickup | null) => void;
};

export function PickupLocationPicker({ value, onChange }: Props) {
  const { t } = useI18n();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const reverseSeq = useRef(0);

  const [query, setQuery] = useState(value?.address ?? "");
  const [suggestions, setSuggestions] = useState<GoongPrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapTilesKey = getGoongMapTilesKey();
  const apiReady = hasGoongApiKey() && Boolean(mapTilesKey);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!value) return;
    setQuery(value.address);
  }, [value?.address, value?.lat, value?.lng]);

  useEffect(() => {
    if (!containerRef.current || !mapTilesKey) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: goongMapStyleUrl(mapTilesKey),
      center: value?.lng != null && value?.lat != null ? [value.lng, value.lat] : DEFAULT_CENTER,
      zoom: value?.lng != null && value?.lat != null ? 15 : DEFAULT_ZOOM,
      attributionControl: false,
      fadeDuration: 0,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: "© Goong.io" }),
    );

    const marker = new maplibregl.Marker({ color: "#ea580c", draggable: true });
    if (value?.lng != null && value?.lat != null) {
      marker.setLngLat([value.lng, value.lat]).addTo(map);
    }
    markerRef.current = marker;
    mapRef.current = map;

    const applyPoint = async (lat: number, lng: number) => {
      marker.setLngLat([lng, lat]).addTo(map);
      map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15), duration: 400 });
      setResolving(true);
      setError(null);
      const seq = ++reverseSeq.current;
      try {
        const pickup = await goongReverseGeocode(lat, lng);
        if (seq !== reverseSeq.current) return;
        setQuery(pickup.address);
        setSuggestions([]);
        setOpen(false);
        onChangeRef.current(pickup);
      } catch {
        if (seq !== reverseSeq.current) return;
        setError(t("listPet.pickupLookupError"));
        const fallback = {
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng,
        };
        setQuery(fallback.address);
        onChangeRef.current(fallback);
      } finally {
        if (seq === reverseSeq.current) setResolving(false);
      }
    };

    map.on("click", (e) => {
      void applyPoint(e.lngLat.lat, e.lngLat.lng);
    });

    marker.on("dragend", () => {
      const ll = marker.getLngLat();
      void applyPoint(ll.lat, ll.lng);
    });

    const resize = () => map.resize();
    map.on("load", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);
    requestAnimationFrame(resize);

    return () => {
      ro.disconnect();
      marker.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // Map boots once; later value sync is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTilesKey]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || value?.lat == null || value?.lng == null) return;
    marker.setLngLat([value.lng, value.lat]).addTo(map);
    map.easeTo({
      center: [value.lng, value.lat],
      zoom: Math.max(map.getZoom(), 15),
      duration: 350,
    });
  }, [value?.lat, value?.lng]);

  useEffect(() => {
    if (!apiReady) return;
    const q = query.trim();
    if (q.length < 2 || (value && q === value.address)) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const list = await goongAutocomplete(q, ctrl.signal);
        setSuggestions(list);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSuggestions([]);
        setError(t("listPet.pickupLookupError"));
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [apiReady, query, t, value]);

  const pickPrediction = async (item: GoongPrediction) => {
    setOpen(false);
    setResolving(true);
    setError(null);
    try {
      const detail = await goongPlaceDetail(item.place_id);
      if (!detail) {
        setError(t("listPet.pickupLookupError"));
        return;
      }
      setQuery(detail.address);
      onChange(detail);
    } catch {
      setError(t("listPet.pickupLookupError"));
    } finally {
      setResolving(false);
    }
  };

  const clear = () => {
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    setError(null);
    onChange(null);
    markerRef.current?.remove();
  };

  if (!apiReady) {
    return (
      <div className="space-y-2">
        <input
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            if (!next.trim()) onChange(null);
            else onChange({ address: next.trim() });
          }}
          placeholder={t("listPet.pickupPlaceholder")}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">{t("listPet.pickupMapMissingKey")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              onBlur={() => window.setTimeout(() => setOpen(false), 150)}
              placeholder={t("listPet.pickupSearchPlaceholder")}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              autoComplete="off"
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-9 outline-none focus:ring-2 focus:ring-ring"
            />
            {(searching || resolving) && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            {!searching && !resolving && query && (
              <button
                type="button"
                onClick={clear}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("listPet.pickupClear")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {open && suggestions.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg"
          >
            {suggestions.map((item) => (
              <li key={item.place_id}>
                <button
                  type="button"
                  role="option"
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void pickPrediction(item)}
                >
                  <span className="font-medium text-foreground">
                    {item.structured_formatting?.main_text ?? item.description}
                  </span>
                  {item.structured_formatting?.secondary_text && (
                    <span className="text-xs text-muted-foreground">
                      {item.structured_formatting.secondary_text}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        ref={containerRef}
        className="h-52 w-full overflow-hidden rounded-xl border border-border bg-muted"
      />
      <p className="text-xs text-muted-foreground">{t("listPet.pickupMapHint")}</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
