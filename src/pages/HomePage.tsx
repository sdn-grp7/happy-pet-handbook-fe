import { Link } from "react-router-dom";
import { Heart, BookOpen, Apple, GraduationCap, Stethoscope, ArrowRight } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";

const heroImage =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1536&h=1024&fit=crop";

const pillars = [
  { to: "/basics", icon: BookOpen, title: "The Basics", desc: "Set up a safe home and build trust from day one." },
  { to: "/nutrition", icon: Apple, title: "Nutrition", desc: "Feed the right food, the right way, at every life stage." },
  { to: "/training", icon: GraduationCap, title: "Training", desc: "Positive habits and gentle commands that actually stick." },
  { to: "/health", icon: Stethoscope, title: "Health & Wellness", desc: "Vet visits, grooming, and spotting trouble early." },
] as const;

export function HomePage() {
  return (
    <>
      <PageMeta
        title="PawPath — How to Raise Your Pet"
        description="Friendly, practical guide to raising a happy, healthy pet from day one."
        ogTitle="PawPath — How to Raise Your Pet"
        ogDescription="Friendly, practical guide to raising a happy, healthy pet from day one."
      />
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/60 text-accent-foreground text-xs font-medium">
              <Heart className="h-3.5 w-3.5" /> A guide made with love
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              How to raise a happy,{" "}
              <span
                style={{
                  background: "var(--gradient-warm)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                healthy pet
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              Everything a new pet parent needs — from the first day home to lifelong care. Simple steps, kind methods,
              expert-backed tips.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/basics"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:opacity-95 transition"
                style={{ background: "var(--gradient-warm)" }}
              >
                Start the guide <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-card border border-border font-medium hover:bg-muted transition"
              >
                Ask a question
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
              style={{ background: "var(--gradient-warm)" }}
            />
            <img
              src={heroImage}
              alt="A happy golden retriever puppy and curious tabby kitten together"
              width={1536}
              height={1024}
              className="relative rounded-3xl shadow-[var(--shadow-card)] w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Four pillars of pet parenting</h2>
          <p className="mt-3 text-muted-foreground">Master these and the rest will follow. Take it one chapter at a time.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] transition"
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center text-primary-foreground"
                style={{ background: "var(--gradient-warm)" }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">
                Read more <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8 text-center">
          {[
            { n: "01", t: "Be patient", d: "Pets learn by repetition and trust. Small wins every day." },
            { n: "02", t: "Be consistent", d: "Same words, same routine, same kind tone — every time." },
            { n: "03", t: "Be present", d: "Time and attention are the most powerful gifts you can give." },
          ].map((s) => (
            <div key={s.n}>
              <div className="text-sm font-mono text-primary">{s.n}</div>
              <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
