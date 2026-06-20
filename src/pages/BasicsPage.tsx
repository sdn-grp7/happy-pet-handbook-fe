import { PageHero, Article, Section, Checklist, TipCard } from "@/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";

export function BasicsPage() {
  return (
    <>
      <PageMeta
        title="The Basics — PawPath"
        description="Welcome your new pet home: safe space, routine, bonding, and first-week essentials."
        ogTitle="The Basics of Raising a Pet"
        ogDescription="Set up a safe home, build trust, and create a calm routine from day one."
      />
      <PageHero
        eyebrow="Chapter 1"
        title="The Basics"
        subtitle="Bringing a new pet home is exciting — and a little overwhelming. Here's how to start strong."
      />
      <Article>
        <Section title="Prepare a safe space">
          <p>
            Before your pet arrives, set aside one quiet room or corner that belongs to them. Add a soft bed, fresh
            water, a couple of toys, and the food they are already used to. A predictable space reduces stress and helps
            them settle in faster.
          </p>
          <Checklist
            items={[
              "Remove cables, toxic plants, and small swallowable objects",
              "Block off rooms you don't want them in (for now)",
              "Choose a feeding spot away from foot traffic",
              "Have an ID tag and microchip details ready",
            ]}
          />
        </Section>

        <Section title="Build trust slowly">
          <p>
            Let your pet come to you. Sit on the floor, speak softly, and offer treats from an open hand. Avoid picking
            them up in the first days unless necessary. Trust is built in small moments — and once earned, it lasts a
            lifetime.
          </p>
        </Section>

        <Section title="Create a daily routine">
          <p>
            Pets thrive on predictability. Try to feed, walk, play, and rest at roughly the same times each day. Routine
            reduces anxiety and prevents most behavior problems before they start.
          </p>
        </Section>

        <div className="grid md:grid-cols-2 gap-5">
          <TipCard title="Do">
            Give them their own quiet corner. Keep visitors to a minimum the first week. Praise calm behavior.
          </TipCard>
          <TipCard title="Don't">
            Don't overwhelm with handling, loud noises, or too many new faces. Don't change food abruptly.
          </TipCard>
        </div>
      </Article>
    </>
  );
}
