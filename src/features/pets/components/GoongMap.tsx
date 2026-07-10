import { useEffect, useRef } from "react";
import maplibregl, {
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type Marker,
  type Popup,
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

const DEFAULT_CENTER: [number, number] = [106.6938, 10.785];
const DEFAULT_ZOOM = 11;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&h=200&fit=crop&q=80";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createMarkerElement(marker: GoongMapMarker, active: boolean, onClick: () => void) {
  const wrap = document.createElement("button");
  wrap.type = "button";
  wrap.className = "goong-marker-wrap";
  wrap.setAttribute("aria-label", marker.label);
  wrap.style.cssText =
    "display:flex;flex-direction:column;align-items:center;border:none;background:transparent;padding:0;cursor:pointer;";
  wrap.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });

  const pin = document.createElement("span");
  pin.style.cssText = [
    "display:block",
    "width:46px",
    "height:46px",
    "border-radius:9999px",
    "border:3px solid white",
    "overflow:hidden",
    "box-shadow:0 4px 14px rgba(0,0,0,0.28)",
    "transform:scale(" + (active ? "1.15" : "1") + ")",
    "transition:transform 0.15s ease",
    active ? "outline:3px solid rgba(234,88,12,0.55)" : "",
    "background:" + marker.color,
  ].join(";");

  const img = document.createElement("img");
  img.src = marker.imageUrl || FALLBACK_IMAGE;
  img.alt = marker.label;
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
    "max-width:92px",
    "padding:2px 6px",
    "border-radius:6px",
    "background:white",
    "border:1px solid #e5e7eb",
    "font-size:10px",
    "font-weight:600",
    "color:#374151",
    "white-space:nowrap",
    "overflow:hidden",
    "text-overflow:ellipsis",
    "box-shadow:0 2px 6px rgba(0,0,0,0.12)",
    active ? "border-color:#ea580c;color:#ea580c" : "",
  ].join(";");

  wrap.appendChild(pin);
  wrap.appendChild(tag);
  return wrap;
}

function buildPopupHtml(marker: GoongMapMarker) {
  const name = escapeHtml(marker.label);
  const status = escapeHtml(marker.statusLabel);
  const address = escapeHtml(marker.address);
  const image = escapeHtml(marker.imageUrl || FALLBACK_IMAGE);

  return `
    <div style="font-family:system-ui,sans-serif;min-width:180px;padding:0">
      <img
        src="${image}"
        alt="${name}"
        referrerpolicy="no-referrer"
        onerror="this.src='${FALLBACK_IMAGE}'"
        style="width:100%;height:96px;object-fit:cover;border-radius:8px;display:block;margin-bottom:8px"
      />
      <div style="font-weight:600;font-size:14px">${name}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px">${status}</div>
      <div style="font-size:12px;color:#374151;margin-top:6px;line-height:1.4">${address}</div>
    </div>
  `;
}

export function GoongMap({ markers, selectedId, onSelect, className = "" }: GoongMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef<Map<string, Marker>>(new Map());
  const popupRef = useRef<Popup | null>(null);
  const onSelectRef = useRef(onSelect);
  const mapTilesKey = getGoongMapTilesKey();

  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || !mapTilesKey) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: goongMapStyleUrl(mapTilesKey),
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: "© Goong.io" }),
    );

    mapRef.current = map;
    const markerStore = markerRefs.current;

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      markerStore.forEach((m) => m.remove());
      markerStore.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [mapTilesKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncMarkers = () => {
      const nextIds = new Set(markers.map((m) => m.id));

      markerRefs.current.forEach((marker, id) => {
        if (!nextIds.has(id)) {
          marker.remove();
          markerRefs.current.delete(id);
        }
      });

      markers.forEach((item) => {
        const active = item.id === selectedId;
        const existing = markerRefs.current.get(item.id);
        if (existing) existing.remove();

        const el = createMarkerElement(item, active, () => onSelectRef.current(item.id));
        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([item.lng, item.lat])
          .addTo(map);
        markerRefs.current.set(item.id, marker);
      });
    };

    if (map.isStyleLoaded()) syncMarkers();
    else map.once("load", syncMarkers);
  }, [markers, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || markers.length === 0) return;

    if (selectedId) {
      const target = markers.find((m) => m.id === selectedId);
      if (!target) return;

      popupRef.current?.remove();
      map.flyTo({ center: [target.lng, target.lat], zoom: 15, duration: 700 });
      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 20,
        maxWidth: "220px",
      })
        .setLngLat([target.lng, target.lat])
        .setHTML(buildPopupHtml(target))
        .addTo(map);

      popupRef.current.on("close", () => onSelectRef.current(null));
      return;
    }

    popupRef.current?.remove();
    popupRef.current = null;

    const bounds = new maplibregl.LngLatBounds();
    markers.forEach((m) => bounds.extend([m.lng, m.lat]));
    map.fitBounds(bounds as LngLatBoundsLike, { padding: 72, maxZoom: 13, duration: 700 });
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

  return <div ref={containerRef} className={`w-full min-h-[520px] ${className}`} />;
}
