import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {
  PageHero,
  Article,
  Section,
  Checklist,
  TipCard,
} from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { getGuide } from "@/features/guides/api/guidesApi";
import type { GuideArticle } from "@/features/guides/types";

const GUIDE_SLUGS = ["basics", "nutrition", "training", "health"] as const;

export function GuidePage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, "");
  const [guide, setGuide] = useState<GuideArticle | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!GUIDE_SLUGS.includes(slug as (typeof GUIDE_SLUGS)[number])) return;
    getGuide(slug).then((g) => {
      setGuide(g);
      setLoading(false);
    });
  }, [slug]);

  if (!GUIDE_SLUGS.includes(slug as (typeof GUIDE_SLUGS)[number]))
    return <Navigate to="/basics" replace />;
  if (!loading && !guide) return <Navigate to="/" replace />;

  if (loading || !guide) {
    return <p className="text-center py-20 text-muted-foreground">Loading guide…</p>;
  }

  return (
    <>
      <PageMeta title={`${guide.title} — PawPath`} description={guide.subtitle} />
      <PageHero eyebrow={guide.eyebrow} title={guide.title} subtitle={guide.subtitle} />
      <Article>
        {guide.sections.map((sec) => (
          <Section key={sec.title} title={sec.title}>
            {sec.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {sec.checklist && <Checklist items={sec.checklist} />}
          </Section>
        ))}
        {guide.sections.find((s) => s.tips) && (
          <div className="grid md:grid-cols-2 gap-5">
            {guide.sections
              .filter((s) => s.tips)
              .map((s) => (
                <div key={s.title} className="contents">
                  <TipCard title="Do">{s.tips!.do}</TipCard>
                  <TipCard title="Don't">{s.tips!.dont}</TipCard>
                </div>
              ))}
          </div>
        )}
      </Article>
    </>
  );
}
