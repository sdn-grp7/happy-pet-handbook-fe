import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { getGuide } from "@/features/guides/api/guidesApi";
import { PdfBookReader } from "@/features/guides/components/PdfBookReader";
import { getGuideNav, pickL } from "@/features/guides/mocks/data";
import { useI18n } from "@/i18n/I18nContext";
import type { GuideBook } from "@/features/guides/types";

const GUIDE_SLUGS = ["basics", "nutrition", "training", "health"] as const;

export function GuidePage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, "");
  const { locale, t } = useI18n();
  const [book, setBook] = useState<GuideBook | null | undefined>(undefined);

  const nav = useMemo(() => getGuideNav(), []);
  const idx = nav.findIndex((n) => n.slug === slug);
  const prev = idx > 0 ? nav[idx - 1] : undefined;
  const next = idx >= 0 && idx < nav.length - 1 ? nav[idx + 1] : undefined;

  useEffect(() => {
    let cancelled = false;
    setBook(undefined);
    getGuide(slug).then((g) => {
      if (!cancelled) setBook(g ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!GUIDE_SLUGS.includes(slug as (typeof GUIDE_SLUGS)[number])) {
    return <Navigate to="/basics" replace />;
  }

  if (book === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!book) {
    return <Navigate to="/basics" replace />;
  }

  const title = pickL(book.title, locale);
  const subtitle = pickL(book.subtitle, locale);

  return (
    <>
      <PageMeta title={title} description={subtitle} />

      <div className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%), linear-gradient(180deg, color-mix(in oklch, var(--muted) 80%, transparent), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 pb-8 pt-12 text-center md:pt-14">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {t("guides.handbook")} · {t("guides.volume")} {book.chapter}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <PdfBookReader
          file={book.pdfUrl}
          pageLabel={t("guides.page")}
          ofLabel={t("guides.of")}
          prevLabel={t("guides.prevPage")}
          nextLabel={t("guides.nextPage")}
          zoomInLabel={t("guides.zoomIn")}
          zoomOutLabel={t("guides.zoomOut")}
          loadingLabel={t("guides.loadingPdf")}
          errorLabel={t("guides.pdfError")}
        />

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/80">{book.sourceTitle}</span>
          {" — "}
          {book.attribution}
          {book.sourceUrl ? (
            <>
              {" "}
              <a
                href={book.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 underline-offset-2 hover:underline"
              >
                {t("guides.source")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          ) : null}
        </p>

        <nav className="mx-auto mt-10 flex max-w-2xl items-stretch justify-between gap-4 border-t border-border pt-8">
          {prev ? (
            <Link
              to={prev.path}
              className="group flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-lg p-2 transition hover:bg-muted/60"
            >
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronLeft className="h-3.5 w-3.5" />
                {t("guides.prevChapter")}
              </span>
              <span className="truncate text-sm font-medium group-hover:text-primary">
                {pickL(prev.title, locale)}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {next ? (
            <Link
              to={next.path}
              className="group flex min-w-0 flex-1 flex-col items-end gap-0.5 rounded-lg p-2 text-right transition hover:bg-muted/60"
            >
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                {t("guides.nextChapter")}
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              <span className="truncate text-sm font-medium group-hover:text-primary">
                {pickL(next.title, locale)}
              </span>
            </Link>
          ) : (
            <Link
              to="/adoption"
              className="group flex min-w-0 flex-1 flex-col items-end gap-0.5 rounded-lg p-2 text-right transition hover:bg-muted/60"
            >
              <span className="text-xs text-muted-foreground">{t("guides.doneCta")}</span>
              <span className="text-sm font-medium group-hover:text-primary">{t("nav.adopt")}</span>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
