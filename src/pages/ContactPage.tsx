import { useState } from "react";
import { PageHero } from "@/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { Mail, MessageCircle, Heart } from "lucide-react";
import { submitContactMessage } from "@/lib/mockApi";

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await submitContactMessage(form.name, form.email, form.message);
    setLoading(false);
    setSent(true);
  };

  return (
    <>
      <PageMeta
        title="Contact — PawPath"
        description="Have a question about raising your pet? Send us a note."
        ogTitle="Contact PawPath"
        ogDescription="Have a question about raising your pet? Send us a note."
      />
      <PageHero
        eyebrow="We're here to help"
        title="Ask us anything"
        subtitle="Questions about care, adoption, or your account? Send us a note and we'll get back to you."
      />
      <section className="max-w-3xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {sent ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
              <Heart className="h-8 w-8 mx-auto text-primary" />
              <h2 className="mt-3 text-xl font-semibold">Message received</h2>
              <p className="mt-2 text-muted-foreground">
                Thanks for reaching out. We'll be in touch soon.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-card)] space-y-4"
            >
              <div>
                <label className="text-sm font-medium" htmlFor="name">
                  Your name
                </label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="message">
                  Your question
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:opacity-95 transition disabled:opacity-60"
                style={{ background: "var(--gradient-warm)" }}
              >
                {loading ? "Sending…" : "Send message"}
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
            <p className="text-sm text-muted-foreground">
              Join other pet parents and share what works.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
