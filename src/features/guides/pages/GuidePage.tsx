import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { getGuide } from "@/features/guides/api/guidesApi";
import { PdfBookReader } from "@/features/guides/components/PdfBookReader";
import { useGuides } from "@/features/guides/contexts/GuidesContext";
import { pickL, guidePath } from "@/features/guides/types";
import { useI18n } from "@/i18n/I18nContext";
import type { GuideBook } from "@/features/guides/types";

export function GuidePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { locale, t } = useI18n();
  const { guides } = useGuides();
  const [book, setBook] = useState<GuideBook | null | undefined>(undefined);

  const nav = useMemo(
    () =>
      guides.map((b) => ({
        slug: b.slug,
        chapter: b.chapter,
        title: b.title,
        path: guidePath(b.slug),
      })),
    [guides],
  );
  const idx = nav.findIndex((n) => n.slug === slug);
  const prev = idx > 0 ? nav[idx - 1] : undefined;
  const next = idx >= 0 && idx < nav.length - 1 ? nav[idx + 1] : undefined;
  const firstPath = nav[0]?.path ?? "/";

  useEffect(() => {
    if (!slug) {
      setBook(null);
      return;
    }
    let cancelled = false;
    setBook(undefined);
    getGuide(slug).then((g) => {
      if (!cancelled) setBook(g ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) {
    return <Navigate to={firstPath} replace />;
  }

  if (book === undefined) {
    return (
      <div className="flex h-[calc(100svh-3rem)] items-center justify-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!book) {
    return <Navigate to={firstPath} replace />;
  }

  const title = pickL(book.title, locale);
  const subtitle = pickL(book.subtitle, locale);

  return (
    <>
      <PageMeta title={title} description={subtitle} />

      <div className="flex h-[calc(100svh-3rem)] flex-col overflow-hidden">
        <header className="shrink-0 border-b border-border/70 bg-background px-3 py-2.5 sm:px-5">
          <div className="mx-auto flex max-w-5xl items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                {t("guides.handbook")} · {t("guides.volume")} {book.chapter}
              </p>
              <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {title}
              </h1>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            </div>

            <nav className="flex shrink-0 items-center gap-1 pt-1">
              {prev ? (
                <Link
                  to={prev.path}
                  className="inline-flex h-8 items-center gap-0.5 rounded-md px-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  title={pickL(prev.title, locale)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("guides.prevChapter")}</span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  to={next.path}
                  className="inline-flex h-8 items-center gap-0.5 rounded-md px-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  title={pickL(next.title, locale)}
                >
                  <span className="hidden sm:inline">{t("guides.nextChapter")}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/adoption"
                  className="inline-flex h-8 items-center rounded-md px-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {t("nav.adopt")}
                </Link>
              )}
            </nav>
          </div>

          {(book.sourceTitle || book.attribution) && (
            <p className="mx-auto mt-1.5 max-w-5xl truncate text-[11px] text-muted-foreground">
              {book.sourceTitle}
              {book.sourceTitle && book.attribution ? " — " : null}
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
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </>
              ) : null}
            </p>
          )}
        </header>

        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-2 py-2 sm:px-4 sm:py-3">
          <PdfBookReader
            file={book.pdfUrl}
            fill
            pageLabel={t("guides.page")}
            ofLabel={t("guides.of")}
            prevLabel={t("guides.prevPage")}
            nextLabel={t("guides.nextPage")}
            zoomInLabel={t("guides.zoomIn")}
            zoomOutLabel={t("guides.zoomOut")}
            loadingLabel={t("guides.loadingPdf")}
            errorLabel={t("guides.pdfError")}
          />
        </div>
      </div>
    </>
  );
}
