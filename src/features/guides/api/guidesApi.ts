import { apiRequest, API_BASE_URL, ApiError } from "@/lib/api";
import type { GuideBook } from "@/features/guides/types";

type GuidesResponse = { guides: GuideBook[] };
type GuideResponse = { guide: GuideBook };

function resolvePdfUrl(pdfUrl: string) {
  if (!pdfUrl) return pdfUrl;
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  return `${API_BASE_URL}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`;
}

function normalizeGuide(g: GuideBook): GuideBook {
  return {
    ...g,
    pdfUrl: resolvePdfUrl(g.pdfUrl),
    sourceTitle: g.sourceTitle ?? "",
    attribution: g.attribution ?? "",
  };
}

export async function getGuides(): Promise<GuideBook[]> {
  const data = await apiRequest<GuidesResponse>("/api/guides");
  return (data.guides ?? []).map(normalizeGuide);
}

export async function getGuide(slug: string): Promise<GuideBook | undefined> {
  try {
    const data = await apiRequest<GuideResponse>(`/api/guides/${encodeURIComponent(slug)}`);
    return data.guide ? normalizeGuide(data.guide) : undefined;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export async function getGuidesAdmin(token: string): Promise<GuideBook[]> {
  const data = await apiRequest<GuidesResponse>("/api/guides/admin/all", { token });
  return (data.guides ?? []).map(normalizeGuide);
}

export async function createGuide(token: string, form: FormData): Promise<GuideBook> {
  const API_BASE =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
    "http://localhost:3001";
  const res = await fetch(`${API_BASE}/api/guides`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as {
    guide?: GuideBook;
    error?: string;
    message?: string;
  };
  if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
  return normalizeGuide(data.guide!);
}

export async function updateGuide(token: string, id: string, form: FormData): Promise<GuideBook> {
  const API_BASE =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
    "http://localhost:3001";
  const res = await fetch(`${API_BASE}/api/guides/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as {
    guide?: GuideBook;
    error?: string;
    message?: string;
  };
  if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
  return normalizeGuide(data.guide!);
}

export async function deleteGuide(token: string, id: string): Promise<void> {
  await apiRequest<{ ok: boolean }>(`/api/guides/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}
