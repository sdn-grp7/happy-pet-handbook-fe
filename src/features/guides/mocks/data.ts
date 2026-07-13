import type { GuideBook, LocalizedString } from "@/features/guides/types";
import { pickL, guidePath } from "@/features/guides/types";

export { pickL, guidePath };

/**
 * Offline fallback if the API is down — mirrors the seeded handbook volumes.
 * PDF paths are local until seed:guides has run.
 */
export const guideBooks: GuideBook[] = [
  {
    id: "book-basics",
    slug: "basics",
    chapter: 1,
    title: { vi: "Cẩm nang chủ nuôi", en: "Pet Parent Guide" },
    subtitle: {
      vi: "Chào đón thú cưng mới — checklist nhận nuôi và chăm sóc cơ bản.",
      en: "Welcoming a new pet — adoption checklist and everyday care basics.",
    },
    pdfUrl: "/guides/pet-parent-guide.pdf",
    sourceTitle: "Pet Parent Guide",
    attribution: "American Humane Society — shared for non-commercial use with credit.",
    sourceUrl:
      "https://www.americanhumane.org/wp-content/uploads/2025/03/AmericanHumaneSociety-PetParentGuide.pdf",
  },
  {
    id: "book-nutrition",
    slug: "nutrition",
    chapter: 2,
    title: { vi: "Đọc nhãn thức ăn", en: "Reading Pet Food Labels" },
    subtitle: {
      vi: "Hiểu nhãn AAFCO, thành phần và khẩu phần — chọn thức ăn đúng.",
      en: "Understand AAFCO statements, ingredients, and feeding amounts.",
    },
    pdfUrl: "/guides/pet-food-labels.pdf",
    sourceTitle: "A Consumer's Guide: Overview of Pet Food Labels",
    attribution: "Virginia Cooperative Extension (Virginia Tech).",
    sourceUrl: "https://www.pubs.ext.vt.edu/content/dam/pubs_ext_vt_edu/FST/fst-434/fst-434.pdf",
  },
  {
    id: "book-training",
    slug: "training",
    chapter: 3,
    title: { vi: "Huấn luyện tích cực", en: "Positive Reinforcement" },
    subtitle: {
      vi: "Dạy chó bằng thưởng và khen — không dùng hình phạt.",
      en: "Train with rewards and praise — not punishment.",
    },
    pdfUrl: "/guides/positive-reinforcement-dog.pdf",
    sourceTitle: "Positive Reinforcement Dog Training",
    attribution: "Government of South Australia — Animal Welfare.",
    sourceUrl:
      "https://www.sa.gov/files/assets/main/v/1/acs/documents/positive-reinforcement-dog.pdf",
  },
  {
    id: "book-health",
    slug: "health",
    chapter: 4,
    title: { vi: "Sẵn sàng khi khẩn cấp", en: "Pet Preparedness" },
    subtitle: {
      vi: "Kit cứu hộ, sơ tán và giữ thú cưng an toàn khi thiên tai.",
      en: "Emergency kits, evacuation plans, and keeping pets safe in disasters.",
    },
    pdfUrl: "/guides/pet-preparedness.pdf",
    sourceTitle: "The Ultimate Pet Preparedness Toolkit",
    attribution: "American Humane Society — free for personal and educational use.",
    sourceUrl:
      "https://www.americanhumane.org/wp-content/uploads/2025/08/Ultimate-Pet-Preparedness-Toolkit.pdf",
  },
];

export function getBookBySlug(slug: string): GuideBook | undefined {
  return guideBooks.find((b) => b.slug === slug);
}

export function getGuideNav(books: GuideBook[] = guideBooks) {
  return books.map((b) => ({
    slug: b.slug,
    chapter: b.chapter,
    title: b.title as LocalizedString,
    path: guidePath(b.slug),
  }));
}

/** @deprecated Use guideBooks */
export const mockGuides = guideBooks;
