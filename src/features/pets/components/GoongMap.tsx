import { useEffect, useRef } from "react";
import maplibregl, {
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type Marker,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getGoongMapTilesKey, goongMapStyleUrl } from "@/lib/goong";

export type GoongMapMarker = {
  id: string;
  lng: number;
  lat: number;
  color: string;
  label: string;
  address: string;
  statusLabel: string;
  imageUrl: string;
};

type GoongMapProps = {
  markers: GoongMapMarker[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
};

type MarkerEntry = {
  marker: Marker;
  pin: HTMLElement;
  tag: HTMLElement;
  data: GoongMapMarker;
};

const DEFAULT_CENTER: [number, number] = [105.8342, 21.0278];
const DEFAULT_ZOOM = 11;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&h=200&fit=crop&q=80";

function applyActiveStyle(pin: HTMLElement, tag: HTMLElement, active: boolean) {
  pin.style.transform = active ? "scale(1.15)" : "scale(1)";
  pin.style.outline = active ? "3px solid rgba(234,88,12,0.55)" : "none";
  tag.style.borderColor = active ? "#ea580c" : "#e5e7eb";
  tag.style.color = active ? "#ea580c" : "#374151";
}

function createMarkerElement(
  marker: GoongMapMarker,
  active: boolean,
  onClick: () => void,
): { wrap: HTMLButtonElement; pin: HTMLElement; tag: HTMLElement } {
  const wrap = document.createElement("button");
  wrap.type = "button";
  wrap.className = "goong-marker-wrap";
  wrap.setAttribute("aria-label", marker.label);
  wrap.style.cssText =
    "display:flex;flex-direction:column;align-items:center;border:none;background:transparent;padding:0;cursor:pointer;will-change:transform;";
  wrap.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });

  const pin = document.createElement("span");
  pin.style.cssText = [
    "display:block",
    "width:40px",
    "height:40px",
    "border-radius:9999px",
    "border:3px solid white",
    "overflow:hidden",
    "box-shadow:0 4px 14px rgba(0,0,0,0.28)",
    "transform:scale(" + (active ? "1.15" : "1") + ")",
    "transition:transform 0.12s ease",
    active ? "outline:3px solid rgba(234,88,12,0.55)" : "outline:none",
    "background:" + marker.color,
  ].join(";");

  const img = document.createElement("img");
  img.src = marker.imageUrl || FALLBACK_IMAGE;
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
  img.onerror = () => {
    img.src = FALLBACK_IMAGE;
  };
  pin.appendChild(img);

  const tag = document.createElement("span");
  tag.textContent = marker.label;
  tag.style.cssText = [
    "margin-top:4px",
    "max-width:84px",
    "padding:2px 6px",
    "border-radius:6px",
    "background:white",
    "border:1px solid " + (active ? "#ea580c" : "#e5e7eb"),
    "font-size:10px",
    "font-weight:600",
    "color:" + (active ? "#ea580c" : "#374151"),
    "white-space:nowrap",
    "overflow:hidden",
    "text-overflow:ellipsis",
    "box-shadow:0 2px 6px rgba(0,0,0,0.12)",
    "pointer-events:none",
  ].join(";");

  wrap.appendChild(pin);
  wrap.appendChild(tag);
  return { wrap, pin, tag };
}

function markersSignature(markers: GoongMapMarker[]) {
  // Cheap identity for set/position changes — ignore selection-only updates.
  return markers.map((m) => `${m.id}:${m.lat}:${m.lng}`).join("|");
}

export function GoongMap({ markers, selectedId, onSelect, className = "" }: GoongMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const entriesRef = useRef<Map<string, MarkerEntry>>(new Map());
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);
  const markersSigRef = useRef("");
  const fittedSigRef = useRef("");
  const mapTilesKey = getGoongMapTilesKey();

  onSelectRef.current = onSelect;
  selectedIdRef.current = selectedId;

  useEffect(() => {
    if (!containerRef.current || !mapTilesKey) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: goongMapStyleUrl(mapTilesKey),
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      fadeDuration: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: "© Goong.io" }),
    );

    mapRef.current = map;
    const entries = entriesRef.current;

    const resize = () => map.resize();
    map.on("load", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);
    requestAnimationFrame(resize);
    const t = window.setTimeout(resize, 100);

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      entries.forEach((e) => e.marker.remove());
      entries.clear();
      map.remove();
      mapRef.current = null;
      markersSigRef.current = "";
      fittedSigRef.current = "";
    };
  }, [mapTilesKey]);

  // Create / remove / move markers only when the set changes — not on selection.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const focusSelected = (id: string | null, animate: boolean) => {
      if (!id) return false;
      const entry = entriesRef.current.get(id);
      if (!entry) return false;
      entriesRef.current.forEach((e, eid) => applyActiveStyle(e.pin, e.tag, eid === id));
      map.easeTo({
        center: [entry.data.lng, entry.data.lat],
        zoom: 16,
        duration: animate ? 500 : 0,
      });
      return true;
    };

    const sig = markersSignature(markers);
    const sync = () => {
      if (sig === markersSigRef.current && entriesRef.current.size === markers.length) {
        // Markers unchanged — still focus if deep-link selected before pins existed.
        focusSelected(selectedIdRef.current, true);
        return;
      }
      markersSigRef.current = sig;

      const nextIds = new Set(markers.map((m) => m.id));
      entriesRef.current.forEach((entry, id) => {
        if (!nextIds.has(id)) {
          entry.marker.remove();
          entriesRef.current.delete(id);
        }
      });

      const selected = selectedIdRef.current;
      markers.forEach((item) => {
        const existing = entriesRef.current.get(item.id);
        if (existing) {
          existing.data = item;
          existing.marker.setLngLat([item.lng, item.lat]);
          applyActiveStyle(existing.pin, existing.tag, item.id === selected);
          return;
        }

        const { wrap, pin, tag } = createMarkerElement(item, item.id === selected, () =>
          onSelectRef.current(item.id),
        );
        const marker = new maplibregl.Marker({ element: wrap, anchor: "bottom" })
          .setLngLat([item.lng, item.lat])
          .addTo(map);
        entriesRef.current.set(item.id, { marker, pin, tag, data: item });
      });

      if (focusSelected(selected, fittedSigRef.current !== sig)) {
        fittedSigRef.current = sig;
        return;
      }

      if (markers.length > 0 && fittedSigRef.current !== sig) {
        fittedSigRef.current = sig;
        const bounds = new maplibregl.LngLatBounds();
        markers.forEach((m) => bounds.extend([m.lng, m.lat]));
        map.fitBounds(bounds as LngLatBoundsLike, {
          padding: 64,
          maxZoom: 12,
          duration: 0,
        });
      }
    };

    if (map.isStyleLoaded()) sync();
    else map.once("load", sync);
  }, [markers]);

  // Selection: style pins + zoom in (also runs when markers appear after deep-link).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    entriesRef.current.forEach((entry, id) => {
      applyActiveStyle(entry.pin, entry.tag, id === selectedId);
    });

    if (!selectedId) return;
    const entry = entriesRef.current.get(selectedId);
    if (!entry) return;

    map.easeTo({
      center: [entry.data.lng, entry.data.lat],
      zoom: 16,
      duration: 500,
    });
  }, [selectedId, markers]);

  if (!mapTilesKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground ${className}`}
      >
        <p>
          Add <code className="text-foreground">VITE_GOONG_MAP_TILES_KEY</code> to{" "}
          <code className="text-foreground">.env</code>.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className={`h-full w-full min-h-[420px] ${className}`} />;
}
