/** Goong map style endpoints — requires Map Tiles Key in query string. */
export const GOONG_MAP_STYLES = {
  street: "https://tiles.goong.io/assets/goong_map_web.json",
  highlight: "https://tiles.goong.io/assets/goong_map_highlight.json",
  satellite: "https://tiles.goong.io/assets/goong_satellite.json",
} as const;

export function goongMapStyleUrl(
  mapTilesKey: string,
  style: keyof typeof GOONG_MAP_STYLES = "street",
) {
  return `${GOONG_MAP_STYLES[style]}?api_key=${mapTilesKey}`;
}

export function getGoongMapTilesKey() {
  return import.meta.env.VITE_GOONG_MAP_TILES_KEY?.trim() ?? "";
}

export function getGoongApiKey() {
  return import.meta.env.VITE_GOONG_API_KEY?.trim() ?? "";
}

/** REST API base — Geocoding, Autocomplete, Place, Directions, etc. */
export const GOONG_REST_BASE = "https://rsapi.goong.io";

export function goongRestUrl(path: string, params: Record<string, string>) {
  const apiKey = getGoongApiKey();
  const search = new URLSearchParams({ api_key: apiKey, ...params });
  return `${GOONG_REST_BASE}${path}?${search.toString()}`;
}
