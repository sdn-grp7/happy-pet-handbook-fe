import type { Locale } from "@/i18n/types";

/** Format ageMonths into a display label for the active locale. */
export function formatAgeLabel(ageMonths: number, locale: Locale = "vi"): string {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) {
    return locale === "en" ? "Updating" : "Đang cập nhật";
  }
  const months = Math.round(ageMonths);
  if (months < 12) {
    if (months <= 0) return locale === "en" ? "Under 1 month" : "Dưới 1 tháng";
    return locale === "en" ? `${months} month${months === 1 ? "" : "s"}` : `${months} tháng`;
  }
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (locale === "en") {
    if (rem === 0) return `${years} year${years === 1 ? "" : "s"} old`;
    return `${years} year${years === 1 ? "" : "s"} ${rem} month${rem === 1 ? "" : "s"}`;
  }
  if (rem === 0) return `${years} tuổi`;
  return `${years} tuổi ${rem} tháng`;
}
