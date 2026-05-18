import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/GuideBlocks";
import { Mail, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PawPath" },
      { name: "description", content: "Have a question about raising your pet? Send us a note." },
      { property: "og:title", content: "Contact PawPath" },
      { property: "og:description", content: "Have a question about raising your pet? Send us a note." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Say hello"
        title="Ask us anything"
        subtitle="Stuck on a behavior question? Wondering about food? We love hearing from fellow pet parents."
      />
      <section className="max-w-3xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {sent ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
              <Heart className="h-8 w-8 mx-auto text-primary" />
              <h2 className="mt-3 text-xl font-semibold">Message received</h2>
              <p className="mt-2 text-muted-foreground">Thanks for reaching out. We'll be in touch soon.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-card)] space-y-4"
            >
              <div>
                <label className="text-sm font-medium" htmlFor="name">Your name</label>
                <input id="name" required className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input id="email" type="email" required className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="message">Your question</label>
                <textarea id="message" required rows={5} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:opacity-95 transition"
                style={{ background: "var(--gradient-warm)" }}
              >
                Send message
              </button>
            </form>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <Mail className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">hello@pawpath.guide</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <MessageCircle className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-medium">Community</p>
            <p className="text-sm text-muted-foreground">Join other pet parents and share what works.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
