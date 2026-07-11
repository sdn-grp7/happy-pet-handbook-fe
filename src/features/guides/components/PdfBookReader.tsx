import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Served from /public — must match react-pdf's pdfjs-dist version (5.4.x).
pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`;

type PdfBookReaderProps = {
  file: string;
  pageLabel: string;
  ofLabel: string;
  prevLabel: string;
  nextLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  loadingLabel: string;
  errorLabel: string;
};

export function PdfBookReader({
  file,
  pageLabel,
  ofLabel,
  prevLabel,
  nextLabel,
  zoomInLabel,
  zoomOutLabel,
  loadingLabel,
  errorLabel,
}: PdfBookReaderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [pageWidth, setPageWidth] = useState(640);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPage(1);
    setNumPages(0);
    setLoadError(null);
    setReady(false);
  }, [file]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setPageWidth(Math.max(280, Math.min(720, w - 48)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
      if (e.key === "ArrowRight") setPage((p) => Math.min(numPages || 1, p + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages]);

  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setReady(true);
    setLoadError(null);
  }, []);

  const onLoadError = useCallback((err: Error) => {
    console.error("[PdfBookReader]", err);
    setLoadError(err?.message || "load failed");
    setReady(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          aria-label={prevLabel}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{prevLabel}</span>
        </Button>

        <span className="min-w-[8rem] text-center text-sm tabular-nums text-muted-foreground">
          {pageLabel} {page} {ofLabel} {numPages || "—"}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!numPages || page >= numPages}
          onClick={() => setPage((p) => Math.min(numPages, p + 1))}
          aria-label={nextLabel}
        >
          <span className="hidden sm:inline">{nextLabel}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={scale <= 0.7}
          onClick={() => setScale((s) => Math.max(0.7, +(s - 0.1).toFixed(1)))}
          aria-label={zoomOutLabel}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={scale >= 1.6}
          onClick={() => setScale((s) => Math.min(1.6, +(s + 0.1).toFixed(1)))}
          aria-label={zoomInLabel}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={stageRef}
        className={cn(
          "relative w-full max-w-[760px] overflow-hidden rounded-sm",
          "bg-[linear-gradient(145deg,#f7f1e6_0%,#efe6d6_45%,#e8dcc8_100%)]",
          "shadow-[0_25px_50px_-12px_rgba(60,40,20,0.35),inset_0_0_0_1px_rgba(90,60,30,0.12)]",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-3 bg-[linear-gradient(90deg,rgba(80,50,20,0.18),transparent)]"
        />

        <div className="relative flex min-h-[420px] items-center justify-center overflow-x-auto px-3 py-6 sm:px-8 sm:py-10">
          {!ready && !loadError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingLabel}
            </div>
          )}

          {loadError ? (
            <p className="max-w-sm px-4 text-center text-sm text-muted-foreground">
              {errorLabel}
              <span className="mt-2 block text-xs opacity-70">{loadError}</span>
            </p>
          ) : (
            <Document
              file={file}
              loading={null}
              onLoadSuccess={onLoadSuccess}
              onLoadError={onLoadError}
              className="flex justify-center"
            >
              <Page
                pageNumber={page}
                width={pageWidth * scale}
                renderTextLayer
                renderAnnotationLayer
                className={cn(
                  "overflow-hidden rounded-[2px] bg-white shadow-[0_8px_24px_rgba(40,25,10,0.2)]",
                  "transition-opacity duration-300",
                  ready ? "opacity-100" : "opacity-0",
                )}
              />
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}
