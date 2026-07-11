import { guideBooks, getBookBySlug } from "@/features/guides/mocks/data";
import type { GuideBook } from "@/features/guides/types";
import { delay } from "@/shared/lib/delay";

export async function getGuides(): Promise<GuideBook[]> {
  await delay(80);
  return guideBooks;
}

export async function getGuide(slug: string): Promise<GuideBook | undefined> {
  await delay(80);
  return getBookBySlug(slug);
}
