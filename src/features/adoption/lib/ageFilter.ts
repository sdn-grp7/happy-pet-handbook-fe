export type AgeBucket = "lt6m" | "y1to4" | "y5to7" | "gt7";

/** Match filter buckets using age in whole months (source of truth). */
export function ageMatchesBuckets(
  ageMonths: number | null | undefined,
  buckets: AgeBucket[],
): boolean {
  if (buckets.length === 0) return true;
  if (ageMonths == null || !Number.isFinite(ageMonths)) return false;
  const months = Math.round(ageMonths);

  return buckets.some((bucket) => {
    switch (bucket) {
      case "lt6m":
        return months < 6;
      case "y1to4":
        return months >= 12 && months <= 48;
      case "y5to7":
        return months >= 60 && months <= 84;
      case "gt7":
        return months > 84;
      default:
        return false;
    }
  });
}
