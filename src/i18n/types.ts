export type Locale = "vi" | "en";

export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: "vi", label: "Tiếng Việt", short: "VI" },
  { code: "en", label: "English", short: "EN" },
];

export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_STORAGE_KEY = "pawpath-locale";
