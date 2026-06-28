import type { ForumThread } from "@/types/modules";

const now = Date.now();

export const mockForumThreads: ForumThread[] = [
  {
    id: "t1",
    authorId: "u2",
    authorName: "Maya & Biscuit",
    avatar: "🐕",
    topic: "Training",
    title: "Crate training week 1 — small wins!",
    body: "Biscuit went from whining for 30 min to settling in under 5. The trick: a frozen Kong and a worn t-shirt. Anyone else have favorite calm-down rituals?",
    upvotes: 24,
    upvoted: false,
    promotedToGuide: false,
    createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
    replies: [
      {
        id: "r1",
        authorId: "u4",
        authorName: "Leo",
        body: "Lavender spray near the crate worked wonders for us.",
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "r2",
        authorId: "u5",
        authorName: "Priya",
        body: "Same — frozen Kong is magic. Try peanut butter + banana.",
        createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      },
    ],
  },
  {
    id: "t2",
    authorId: "u4",
    authorName: "Tom",
    avatar: "🐈",
    topic: "Nutrition",
    title: "Switching kitten to adult food — when?",
    body: "Vet said around 12 months for my domestic shorthair. Curious how others timed the transition and what brands you trust.",
    upvotes: 11,
    upvoted: false,
    promotedToGuide: false,
    createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
    replies: [],
  },
  {
    id: "t3",
    authorId: "u5",
    authorName: "Sofia",
    avatar: "🐾",
    topic: "Stories",
    title: "Our rescue's first beach day",
    body: "Two years of patience and Coco finally put paws in sand. She didn't love the waves but the zoomies after were everything.",
    upvotes: 87,
    upvoted: true,
    promotedToGuide: true,
    createdAt: new Date(now - 1000 * 60 * 60 * 50).toISOString(),
    replies: [
      {
        id: "r3",
        authorId: "u2",
        authorName: "Maya & Biscuit",
        body: "This made my whole day 🥹",
        createdAt: new Date(now - 1000 * 60 * 60 * 40).toISOString(),
      },
    ],
  },
  {
    id: "t4",
    authorId: "u1",
    authorName: "Alex Nguyen",
    avatar: "🐶",
    topic: "Health",
    title: "Best flea prevention for indoor cats?",
    body: "Our vet recommended topical but I'm curious what others use for strictly indoor cats in humid climates.",
    upvotes: 6,
    upvoted: false,
    promotedToGuide: false,
    createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    replies: [
      {
        id: "r4",
        authorId: "u3",
        authorName: "PawPath Admin",
        body: "We published a health chapter update on this — check the Health guide. Topical still works well indoors if you have other pets going outside.",
        createdAt: new Date(now - 1000 * 60 * 60 * 60).toISOString(),
      },
    ],
  },
];

export const FORUM_TOPICS = ["Basics", "Nutrition", "Training", "Health", "Stories"] as const;
