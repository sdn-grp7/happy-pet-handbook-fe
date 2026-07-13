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
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useGuides } from "@/features/guides/contexts/GuidesContext";
import { pickL, guidePath } from "@/features/guides/types";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/I18nContext";
import { getGivenName } from "@/lib/utils";

const heroImage =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1536&h=1024&fit=crop";

const PILLAR_ICONS = [BookOpen, Apple, GraduationCap, Stethoscope];

const exploreLinks = [
  {
    to: "/adoption",
    icon: PawPrint,
    titleKey: "home.exploreAdopt" as TranslationKey,
    descKey: "home.exploreAdoptDesc" as TranslationKey,
  },
  {
    to: "/map",
    icon: MapPin,
    titleKey: "home.exploreMap" as TranslationKey,
    descKey: "home.exploreMapDesc" as TranslationKey,
  },
  {
    to: "/forum",
    icon: MessageSquare,
    titleKey: "home.exploreForum" as TranslationKey,
    descKey: "home.exploreForumDesc" as TranslationKey,
  },
  {
    to: "/reputation",
    icon: Star,
    titleKey: "home.exploreTrust" as TranslationKey,
    descKey: "home.exploreTrustDesc" as TranslationKey,
  },
] as const;

export function HomePage() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const { guides } = useGuides();
  const firstGuidePath = guides[0] ? guidePath(guides[0].slug) : "/guides/basics";

  return (
    <>
      <PageMeta
        title={t("home.metaTitle")}
        description={t("home.metaDesc")}
        ogTitle={t("home.metaTitle")}
        ogDescription={t("home.metaDesc")}
      />
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-soft)" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-3 py-1 text-xs font-medium text-accent-foreground">
              <Heart className="h-3.5 w-3.5" /> {t("home.badge")}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              {t("home.titleBefore")}{" "}
              <span
                style={{
                  background: "var(--gradient-warm)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t("home.titleHighlight")}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              {user
                ? t("home.welcomeBack", { name: getGivenName(user.name) })
                : t("home.guestIntro")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={firstGuidePath}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-95"
                style={{ background: "var(--gradient-warm)" }}
              >
                {t("home.ctaGuide")} <ArrowRight className="h-4 w-4" />
              </Link>
              {user ? (
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-medium transition hover:bg-muted"
                >
                  {t("home.ctaProfile")}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-medium transition hover:bg-muted"
                >
                  <LogIn className="h-4 w-4" /> {t("home.ctaSignIn")}
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
              alt=""
              width={1536}
              height={1024}
              className="relative h-auto w-full rounded-3xl object-cover shadow-[var(--shadow-card)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("home.pillarsTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("home.pillarsSubtitle")}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide, i) => {
            const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
            const to = guidePath(guide.slug);
            return (
              <Link
                key={guide.id}
                to={to}
                className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{pickL(guide.title, locale)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pickL(guide.subtitle, locale)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {t("home.readMore")}{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{t("home.exploreTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("home.exploreSubtitle")}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exploreLinks.map(({ to, icon: Icon, titleKey, descKey }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-soft)]"
              >
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{t(titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(descKey)}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {t("home.open")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          {!user && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 text-center sm:text-left">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 shrink-0 text-primary" />
                {t("home.readyPrompt")}
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)]"
                style={{ background: "var(--gradient-warm)" }}
              >
                <LogIn className="h-4 w-4" /> {t("nav.signIn")}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" /> {t("home.contactUs")}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 text-center md:grid-cols-3">
        {[
          {
            n: "01",
            titleKey: "home.tipPatience" as TranslationKey,
            descKey: "home.tipPatienceDesc" as TranslationKey,
          },
          {
            n: "02",
            titleKey: "home.tipConsistent" as TranslationKey,
            descKey: "home.tipConsistentDesc" as TranslationKey,
          },
          {
            n: "03",
            titleKey: "home.tipPresent" as TranslationKey,
            descKey: "home.tipPresentDesc" as TranslationKey,
          },
        ].map((s) => (
          <div key={s.n}>
            <div className="font-mono text-sm text-primary">{s.n}</div>
            <h3 className="mt-2 text-xl font-semibold">{t(s.titleKey)}</h3>
            <p className="mt-2 text-muted-foreground">{t(s.descKey)}</p>
          </div>
        ))}
      </section>
    </>
  );
}
