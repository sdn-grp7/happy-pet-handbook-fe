import { getGoongApiKey, goongRestUrl } from "@/lib/goong";

export type GoongPrediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

export type GoongPickup = {
  address: string;
  lat?: number;
  lng?: number;
};

type AutocompleteResponse = {
  status?: string;
  predictions?: GoongPrediction[];
};

type PlaceDetailResponse = {
  status?: string;
  result?: {
    formatted_address?: string;
    name?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  };
};

type GeocodeResponse = {
  status?: string;
  results?: Array<{
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  }>;
};

const HANOI_BIAS = "21.0278,105.8342";

export function hasGoongApiKey() {
  return Boolean(getGoongApiKey());
}

export async function goongAutocomplete(
  input: string,
  signal?: AbortSignal,
): Promise<GoongPrediction[]> {
  const q = input.trim();
  if (!q || !hasGoongApiKey()) return [];

  const url = goongRestUrl("/Place/AutoComplete", {
    input: q,
    location: HANOI_BIAS,
    limit: "6",
  });
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Goong autocomplete failed (${res.status})`);
  const data = (await res.json()) as AutocompleteResponse;
  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Goong autocomplete: ${data.status}`);
  }
  return data.predictions ?? [];
}

export async function goongPlaceDetail(placeId: string): Promise<GoongPickup | null> {
  if (!placeId || !hasGoongApiKey()) return null;

  const url = goongRestUrl("/Place/Detail", { place_id: placeId });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Goong place detail failed (${res.status})`);
  const data = (await res.json()) as PlaceDetailResponse;
  const loc = data.result?.geometry?.location;
  if (loc?.lat == null || loc?.lng == null) return null;

  const address =
    data.result?.formatted_address?.trim() ||
    data.result?.name?.trim() ||
    `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;

  return { address, lat: loc.lat, lng: loc.lng };
}

export async function goongReverseGeocode(lat: number, lng: number): Promise<GoongPickup> {
  if (!hasGoongApiKey()) {
    return {
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lat,
      lng,
    };
  }

  const url = goongRestUrl("/Geocode", { latlng: `${lat},${lng}` });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Goong geocode failed (${res.status})`);
  const data = (await res.json()) as GeocodeResponse;
  const first = data.results?.[0];
  const address =
    first?.formatted_address?.trim() || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  return { address, lat, lng };
}
