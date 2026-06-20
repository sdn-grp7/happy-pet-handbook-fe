import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Article, Section, Checklist, TipCard } from "@/components/GuideBlocks";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition — PawPath" },
      { name: "description", content: "What, when, and how to feed your pet at every life stage." },
      { property: "og:title", content: "Pet Nutrition Guide" },
      { property: "og:description", content: "What, when, and how to feed your pet at every life stage." },
    ],
  }),
  component: NutritionPage,
});

function NutritionPage() {
  return (
    <>
      <PageHero
        eyebrow="Chapter 2"
        title="Nutrition"
        subtitle="Good food is the foundation of a long, energetic life. Here's how to get it right."
      />
      <Article>
        <Section title="Choose food for their life stage">
          <p>
            Puppies and kittens need calorie-dense, growth-formula food. Adults need balanced maintenance diets.
            Seniors often need fewer calories and more joint support. Always read the label — look for a complete
            and balanced statement from a recognized authority (AAFCO, FEDIAF).
          </p>
        </Section>

        <Section title="Portion and schedule">
          <p>
            Use the feeding guide on the bag as a starting point, then adjust based on body condition — you should
            feel ribs easily but not see them. Most adult dogs eat twice a day; cats often prefer smaller, more
            frequent meals.
          </p>
          <Checklist
            items={[
              "Measure with a cup, not by eye",
              "Keep treats under 10% of daily calories",
              "Fresh water available 24/7",
              "Transition new foods over 7 days",
            ]}
          />
        </Section>

        <Section title="Foods to avoid">
          <p>
            Some everyday human foods are dangerous: chocolate, grapes and raisins, onions and garlic, xylitol
            (sugar-free gum), macadamia nuts, alcohol, and cooked bones. When in doubt, skip it.
          </p>
        </Section>

        <div className="grid md:grid-cols-2 gap-5">
          <TipCard title="Hydration matters">
            Cats especially are prone to dehydration. Try a water fountain or add a splash of water to wet food.
          </TipCard>
          <TipCard title="Watch the waistline">
            Obesity shortens lives. Weigh monthly, adjust portions, and ask your vet for a target weight.
          </TipCard>
        </div>
      </Article>
    </>
  );
}
