/** Approximate age in years from SNNC-style free-text age labels. */
export function parseAgeYears(age: string): { min: number; max: number } | null {
  const raw = age.trim().toLowerCase();
  if (!raw || raw.includes("cập nhật") || raw.includes("updating")) return null;

  // Months first (e.g. "dưới 6 tháng", "< 6 tháng", "8 tháng")
  if (raw.includes("tháng") || raw.includes("thang") || raw.includes("month")) {
    const m = raw.match(/(\d+(?:[.,]\d+)?)/);
    const months = m ? Number(m[1].replace(",", ".")) : NaN;
    if (!Number.isFinite(months)) return null;
    if (/dưới|duoi|<\s*|under|less/i.test(raw)) {
      return { min: 0, max: months / 12 };
    }
    return { min: months / 12, max: months / 12 };
  }

  // Under 1 year without months
  if (/dưới\s*1\s*tuổi|duoi\s*1\s*tuoi|under\s*1/i.test(raw)) {
    return { min: 0, max: 1 };
  }

  // Range "1-2 tuổi", "3–4 tuổi"
  const range = raw.match(/(\d+)\s*[-–~]\s*(\d+)/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  const single = raw.match(/(\d+(?:[.,]\d+)?)/);
  if (!single) return null;
  const y = Number(single[1].replace(",", "."));
  if (!Number.isFinite(y)) return null;
  return { min: y, max: y };
}

export type AgeBucket = "lt6m" | "y1to4" | "y5to7" | "gt7";

const BUCKET_RANGE: Record<AgeBucket, { min: number; max: number }> = {
  lt6m: { min: 0, max: 0.5 }, // < 6 months
  y1to4: { min: 1, max: 4 },
  y5to7: { min: 5, max: 7 },
  gt7: { min: 7.0001, max: 99 },
};

function rangesOverlap(a: { min: number; max: number }, b: { min: number; max: number }) {
  return a.min <= b.max && b.min <= a.max;
}

export function ageMatchesBuckets(age: string, buckets: AgeBucket[]) {
  if (buckets.length === 0) return true;
  const parsed = parseAgeYears(age);
  if (!parsed) return false;
  return buckets.some((b) => rangesOverlap(parsed, BUCKET_RANGE[b]));
}
