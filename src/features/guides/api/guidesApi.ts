import { mockGuides, getGuideBySlug } from "@/features/guides/mocks/data";
import type { GuideArticle } from "@/features/guides/types";
import { delay } from "@/shared/lib/delay";

export async function getGuides(): Promise<GuideArticle[]> {
  await delay();
  return mockGuides.filter((g) => g.published);
}

export async function getGuide(slug: string): Promise<GuideArticle | undefined> {
  await delay();
  return getGuideBySlug(slug);
}
