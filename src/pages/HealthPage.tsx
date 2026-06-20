import { PageHero, Article, Section, Checklist, TipCard } from "@/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";

export function HealthPage() {
  return (
    <>
      <PageMeta
        title="Health & Wellness — PawPath"
        description="Vet visits, grooming, exercise, and how to spot trouble early."
        ogTitle="Pet Health & Wellness"
        ogDescription="Vet visits, grooming, exercise, and how to spot trouble early."
      />
      <PageHero
        eyebrow="Chapter 4"
        title="Health & Wellness"
        subtitle="A healthy pet is a happy pet. Prevention is always easier than treatment."
      />
      <Article>
        <Section title="Regular vet care">
          <p>
            Schedule a wellness check at least once a year — twice a year for seniors. Keep vaccinations, parasite
            prevention, and dental care up to date. Find a vet you trust before you actually need one.
          </p>
          <Checklist
            items={[
              "Annual exam and core vaccines",
              "Monthly flea, tick, and heartworm prevention",
              "Dental cleaning as recommended",
              "Spay or neuter when appropriate",
            ]}
          />
        </Section>

        <Section title="Exercise and enrichment">
          <p>
            Physical activity keeps muscles strong and minds sharp. Dogs need daily walks and play; cats need climbing,
            hunting games, and scratching surfaces. A bored pet is often a destructive one.
          </p>
        </Section>

        <Section title="Spot trouble early">
          <p>
            You know your pet best. Watch for changes in appetite, energy, bathroom habits, or behavior. When something
            feels off, call your vet — even if you can't explain why. Early visits save lives and money.
          </p>
        </Section>

        <div className="grid md:grid-cols-2 gap-5">
          <TipCard title="Grooming is health care">
            Regular brushing prevents matting, catches skin issues, and is wonderful bonding time.
          </TipCard>
          <TipCard title="Mental health matters">
            Separation anxiety, fear, and aggression are medical issues too. Ask your vet about behavioral support.
          </TipCard>
        </div>
      </Article>
    </>
  );
}
