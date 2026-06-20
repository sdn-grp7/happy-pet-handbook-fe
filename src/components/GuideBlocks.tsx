import { ReactNode } from "react";

export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <section style={{ background: "var(--gradient-soft)" }} className="border-b border-border">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
        <span className="text-xs font-medium uppercase tracking-widest text-primary">{eyebrow}</span>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
      </div>
    </section>
  );
}

export function Article({ children }: { children: ReactNode }) {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16 prose-custom">
      <div className="space-y-10">{children}</div>
    </article>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 text-foreground/85 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export function TipCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="mt-2 text-muted-foreground text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}
