import { FormEvent, useEffect, useState } from "react";
import { Heart, Loader2, Mail, MessageCircle } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { submitContactMessage } from "@/features/contact/api/contactApi";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { ApiError } from "@/lib/api";
import { toast } from "@/shared/lib/toast";

export function ContactPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.name || "",
      email: f.email || user.email || "",
    }));
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContactMessage(form.name.trim(), form.email.trim(), form.message.trim());
      setSent(true);
      toast.success(t("contact.sentToast"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("contact.sendError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`${t("nav.contact")} — ${t("brand.name")}`}
        description={t("contact.subtitle")}
      />
      <PageHero
        eyebrow={t("contact.eyebrow")}
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
      />
      <section className="mx-auto grid max-w-3xl gap-6 px-6 py-16 md:grid-cols-3">
        <div className="md:col-span-2">
          {sent ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
              <Heart className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-3 text-xl font-semibold">{t("contact.sentTitle")}</h2>
              <p className="mt-2 text-muted-foreground">{t("contact.sentBody")}</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8"
            >
              <div>
                <label className="text-sm font-medium" htmlFor="name">
                  {t("contact.name")}
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
                  {t("contact.email")}
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
                  {t("contact.message")}
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
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-95 disabled:opacity-60"
                style={{ background: "var(--gradient-warm)" }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? t("contact.sending") : t("contact.send")}
              </button>
            </form>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <Mail className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-medium">{t("contact.formHintLabel")}</p>
            <p className="text-sm text-muted-foreground">{t("contact.formHintBody")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <MessageCircle className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-medium">{t("contact.communityLabel")}</p>
            <p className="text-sm text-muted-foreground">{t("contact.communityBody")}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
