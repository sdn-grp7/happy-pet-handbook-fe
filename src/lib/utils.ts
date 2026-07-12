import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Vietnamese given name is the last word (e.g. "Công Định" → "Định"). */
export function getGivenName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? fullName;
}
