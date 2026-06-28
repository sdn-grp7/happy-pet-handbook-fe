import type { GuideArticle } from "@/types/modules";

export const mockGuides: GuideArticle[] = [
  {
    id: "g1",
    category: "basics",
    slug: "basics",
    eyebrow: "Chapter 1",
    title: "The Basics",
    subtitle:
      "Bringing a new pet home is exciting — and a little overwhelming. Here's how to start strong.",
    published: true,
    updatedAt: "2025-05-01T00:00:00Z",
    sections: [
      {
        title: "Prepare a safe space",
        paragraphs: [
          "Before your pet arrives, set aside one quiet room or corner that belongs to them. Add a soft bed, fresh water, a couple of toys, and the food they are already used to.",
        ],
        checklist: [
          "Remove cables, toxic plants, and small swallowable objects",
          "Block off rooms you don't want them in (for now)",
          "Choose a feeding spot away from foot traffic",
          "Have an ID tag and microchip details ready",
        ],
      },
      {
        title: "Build trust slowly",
        paragraphs: [
          "Let your pet come to you. Sit on the floor, speak softly, and offer treats from an open hand. Avoid picking them up in the first days unless necessary.",
        ],
      },
      {
        title: "Create a daily routine",
        paragraphs: [
          "Pets thrive on predictability. Try to feed, walk, play, and rest at roughly the same times each day.",
        ],
        tips: {
          do: "Give them their own quiet corner. Keep visitors to a minimum the first week. Praise calm behavior.",
          dont: "Don't overwhelm with handling, loud noises, or too many new faces. Don't change food abruptly.",
        },
      },
    ],
  },
  {
    id: "g2",
    category: "nutrition",
    slug: "nutrition",
    eyebrow: "Chapter 2",
    title: "Nutrition",
    subtitle:
      "Good food fuels a long, happy life. Learn what to feed, how much, and when to adjust.",
    published: true,
    updatedAt: "2025-05-01T00:00:00Z",
    sections: [
      {
        title: "Choose quality food",
        paragraphs: [
          "Look for food labeled complete and balanced for your pet's life stage. When in doubt, ask your vet — they know your pet's specific needs.",
        ],
        checklist: [
          "Match food to species, age, and activity level",
          "Introduce new food gradually over 7–10 days",
          "Keep fresh water available at all times",
          "Avoid toxic human foods (chocolate, grapes, onions)",
        ],
      },
      {
        title: "Portions and schedule",
        paragraphs: [
          "Follow the package guidelines as a starting point, then adjust based on body condition. Most adult dogs do well with two meals a day; cats often prefer smaller, frequent meals.",
        ],
      },
      {
        title: "Treats and extras",
        paragraphs: [
          "Treats should make up no more than 10% of daily calories. Use them for training and bonding — not as meal replacements.",
        ],
        tips: {
          do: "Weigh portions if your pet tends to overeat. Use puzzle feeders for mental stimulation.",
          dont: "Don't feed from the table. Don't switch brands suddenly without a transition period.",
        },
      },
    ],
  },
  {
    id: "g3",
    category: "training",
    slug: "training",
    eyebrow: "Chapter 3",
    title: "Training",
    subtitle: "Kind, consistent training builds confidence — for both of you.",
    published: true,
    updatedAt: "2025-05-01T00:00:00Z",
    sections: [
      {
        title: "Start with the basics",
        paragraphs: [
          "Focus on name recognition, sit, come, and leash manners before advanced tricks. Short sessions (5–10 minutes) beat long marathons.",
        ],
        checklist: [
          "Use high-value treats for new skills",
          "Reward the behavior you want — ignore or redirect unwanted behavior",
          "Keep training fun; end on a success",
          "Practice in low-distraction environments first",
        ],
      },
      {
        title: "Positive reinforcement",
        paragraphs: [
          "Reward good behavior immediately. Dogs and cats learn best when they associate actions with something pleasant — never fear.",
        ],
      },
      {
        title: "Common challenges",
        paragraphs: [
          "Jumping, barking, and pulling on leash are normal. Stay patient, stay consistent, and celebrate small improvements.",
        ],
        tips: {
          do: "Exercise before training sessions. Use the same cue words every time.",
          dont: "Don't punish after the fact. Don't yell — it raises stress without teaching.",
        },
      },
    ],
  },
  {
    id: "g4",
    category: "health",
    slug: "health",
    eyebrow: "Chapter 4",
    title: "Health & Wellness",
    subtitle: "Prevention beats cure. Here's how to keep your pet thriving year-round.",
    published: true,
    updatedAt: "2025-05-01T00:00:00Z",
    sections: [
      {
        title: "Regular vet care",
        paragraphs: [
          "Annual check-ups catch problems early. Puppies and kittens need a vaccination series; seniors may need twice-yearly visits.",
        ],
        checklist: [
          "Keep vaccination records handy",
          "Use flea, tick, and heartworm prevention as recommended",
          "Brush teeth or use dental treats regularly",
          "Know your nearest emergency vet clinic",
        ],
      },
      {
        title: "Grooming and hygiene",
        paragraphs: [
          "Brush coat type appropriately, trim nails before they click on floors, and clean ears if your breed is prone to buildup.",
        ],
      },
      {
        title: "Know the warning signs",
        paragraphs: [
          "Lethargy, loss of appetite, vomiting, or sudden behavior changes warrant a vet call. Trust your instincts.",
        ],
        tips: {
          do: "Weigh your pet monthly. Track eating and bathroom habits.",
          dont: "Don't wait if breathing is labored or gums look pale. Don't self-medicate with human drugs.",
        },
      },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return mockGuides.find((g) => g.slug === slug);
}
