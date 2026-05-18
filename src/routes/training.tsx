import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Article, Section, Checklist, TipCard } from "@/components/GuideBlocks";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training — PawPath" },
      { name: "description", content: "Gentle, positive training that builds confident, well-behaved pets." },
      { property: "og:title", content: "Positive Pet Training" },
      { property: "og:description", content: "Gentle, positive training that builds confident, well-behaved pets." },
    ],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  return (
    <>
      <PageHero
        eyebrow="Chapter 3"
        title="Training"
        subtitle="Kind, consistent training builds a lifelong friendship — not just obedience."
      />
      <Article>
        <Section title="Reward what you want to see">
          <p>
            Positive reinforcement is the gold standard. When your pet does something right — sits calmly, comes
            when called, uses the litter box — reward immediately with a treat, praise, or play. Behavior that gets
            rewarded gets repeated.
          </p>
        </Section>

        <Section title="Keep sessions short and fun">
          <p>
            Five-minute sessions, two or three times a day, beat one long lecture. End on a success, even if it's
            small. Pets, like kids, learn best when they're enjoying themselves.
          </p>
          <Checklist
            items={[
              "One cue word per behavior (sit, stay, come)",
              "Mark the moment with a clicker or short 'yes!'",
              "Treats should be tiny and delicious",
              "Practice in different rooms and environments",
            ]}
          />
        </Section>

        <Section title="Socialize early and gently">
          <p>
            Expose young pets to new people, sounds, surfaces, and other vaccinated animals during their critical
            socialization window (roughly 3–14 weeks). Keep experiences positive — let them retreat if scared.
          </p>
        </Section>

        <div className="grid md:grid-cols-2 gap-5">
          <TipCard title="Never punish fear">
            Yelling or physical corrections damage trust and create anxiety. Redirect to a behavior you can reward.
          </TipCard>
          <TipCard title="Be the calm one">
            Pets mirror your energy. If you're tense, they're tense. Breathe, smile, and try again tomorrow.
          </TipCard>
        </div>
      </Article>
    </>
  );
}
