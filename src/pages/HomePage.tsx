import { Link } from "react-router-dom";
import {
  Heart,
  BookOpen,
  Apple,
  GraduationCap,
  Stethoscope,
  ArrowRight,
  PawPrint,
  MapPin,
  MessageSquare,
  Mail,
  Star,
  LogIn,
  Lock,
} from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { GUEST_CAPABILITIES, AUTH_CAPABILITIES } from "@/lib/access";

const heroImage =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1536&h=1024&fit=crop";

const pillars = [
  {
    to: "/basics",
    icon: BookOpen,
    title: "The Basics",
    desc: "Set up a safe home and build trust from day one.",
  },
  {
    to: "/nutrition",
    icon: Apple,
    title: "Nutrition",
    desc: "Feed the right food, the right way, at every life stage.",
  },
  {
    to: "/training",
    icon: GraduationCap,
    title: "Training",
    desc: "Positive habits and gentle commands that actually stick.",
  },
  {
    to: "/health",
    icon: Stethoscope,
    title: "Health & Wellness",
    desc: "Vet visits, grooming, and spotting trouble early.",
  },
] as const;

const exploreLinks = [
  {
    to: "/adoption",
    icon: PawPrint,
    title: "Adoption listings",
    desc: "Browse pets looking for a home",
  },
  { to: "/map", icon: MapPin, title: "Pickup map", desc: "See where to meet for pickup" },
  { to: "/forum", icon: MessageSquare, title: "Forum", desc: "Read community Q&A" },
  { to: "/reputation", icon: Star, title: "Reputation", desc: "Public adopter trust scores" },
  { to: "/contact", icon: Mail, title: "Contact", desc: "Ask our team for help" },
] as const;

export function HomePage() {
  const { user } = useAuth();

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
              {user
                ? `Welcome back, ${user.name.split(" ")[0]}! Browse guides, adopt a pet, join the forum, and track post-adoption check-ins.`
                : "Start with our free guides — no account needed. Sign in when you're ready to adopt, post, or submit check-ins."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/basics"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:opacity-95 transition"
                style={{ background: "var(--gradient-warm)" }}
              >
                Start the guide <ArrowRight className="h-4 w-4" />
              </Link>
              {user ? (
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-card border border-border font-medium hover:bg-muted transition"
                >
                  My profile
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-card border border-border font-medium hover:bg-muted transition"
                >
                  <LogIn className="h-4 w-4" /> Sign in to adopt
                </Link>
              )}
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
          <p className="mt-3 text-muted-foreground">
            Free for everyone — read anytime without signing in.
          </p>
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
                Read more{" "}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              Without signing in
            </p>
            <h2 className="mt-2 text-2xl font-bold">Browse & read</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {GUEST_CAPABILITIES.map((c) => (
                <li key={c.key} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                  {c.label}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {exploreLinks.map(({ to, icon: Icon, title }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm hover:border-primary/40 transition"
                >
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  {title}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium uppercase tracking-widest text-primary flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" /> After sign in
            </p>
            <h2 className="mt-2 text-2xl font-bold">Do more</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {AUTH_CAPABILITIES.map((c) => (
                <li key={c.key} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {c.label}
                </li>
              ))}
            </ul>
            {!user && (
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-primary-foreground font-medium"
                style={{ background: "var(--gradient-warm)" }}
              >
                <LogIn className="h-4 w-4" /> Sign in or register
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8 text-center">
        {[
          {
            n: "01",
            t: "Be patient",
            d: "Pets learn by repetition and trust. Small wins every day.",
          },
          {
            n: "02",
            t: "Be consistent",
            d: "Same words, same routine, same kind tone — every time.",
          },
          {
            n: "03",
            t: "Be present",
            d: "Time and attention are the most powerful gifts you can give.",
          },
        ].map((s) => (
          <div key={s.n}>
            <div className="text-sm font-mono text-primary">{s.n}</div>
            <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
            <p className="mt-2 text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </section>
    </>
  );
}
