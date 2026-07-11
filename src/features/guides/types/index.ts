export type GuideCategory = "basics" | "nutrition" | "training" | "health";

export interface LocalizedString {
  vi: string;
  en: string;
}

/** A real PDF volume shown in the book-style reader. */
export interface GuideBook {
  id: string;
  category: GuideCategory;
  slug: string;
  chapter: number;
  /** Display title in the app chrome */
  title: LocalizedString;
  /** Short blurb under the title */
  subtitle: LocalizedString;
  /** Path under /public, e.g. /guides/pet-parent-guide.pdf */
  pdfUrl: string;
  /** Original publication title (for attribution) */
  sourceTitle: string;
  /** Publisher / author credit — required for redistributed guides */
  attribution: string;
  /** Link to the original source when available */
  sourceUrl?: string;
}
