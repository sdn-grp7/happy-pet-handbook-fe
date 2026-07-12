export type GuideCategory = "basics" | "nutrition" | "training" | "health";

export interface GuideSection {
  title: string;
  paragraphs: string[];
  checklist?: string[];
  tips?: { do: string; dont: string };
}

export interface GuideArticle {
  id: string;
  category: GuideCategory;
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: GuideSection[];
  published: boolean;
  updatedAt: string;
}
