export interface LocalizedString {
  vi: string;
  en: string;
}

/** A PDF volume shown in the book-style reader (from API / Cloudinary). */
export interface GuideBook {
  id: string;
  slug: string;
  chapter: number;
  title: LocalizedString;
  subtitle: LocalizedString;
  pdfUrl: string;
  sourceTitle?: string;
  attribution?: string;
  sourceUrl?: string;
  published?: boolean;
}

export function pickL(value: LocalizedString, locale: "vi" | "en"): string {
  return value[locale] || value.en || value.vi;
}

export function guidePath(slug: string) {
  return `/guides/${slug}`;
}
