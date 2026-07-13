import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Mail, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { getContactMessages, resolveContactMessage } from "@/features/contact/api/contactApi";
import type { ContactMessage } from "@/features/contact/types";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";
import { toast } from "@/shared/lib/toast";
import { cn } from "@/lib/utils";

function formatStamp(iso: string) {
  try {
    return format(new Date(iso), "HH:mm dd/MM/yyyy");
  } catch {
    return iso;
  }
}

export function AdminContactPage() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getContactMessages(token)
      .then(setMessages)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : t("adminContact.loadError"));
      })
      .finally(() => setLoading(false));
  }, [token, t]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: "new" | "resolved") => {
    if (!token) return;
    setBusyId(id);
    try {
      const updated = await resolveContactMessage(token, id, status);
      setMessages((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success(
        status === "resolved" ? t("adminContact.resolved") : t("adminContact.reopened"),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("adminContact.resolveError"));
    } finally {
      setBusyId(null);
    }
  };

  const open = messages.filter((m) => m.status !== "resolved");
  const done = messages.filter((m) => m.status === "resolved");

  return (
    <>
      <PageMeta title={t("adminContact.title")} description={t("adminContact.subtitle")} />
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Mail className="h-6 w-6 text-primary" />
            {t("adminContact.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("adminContact.subtitle")}</p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("adminContact.empty")}</p>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("adminContact.openSection", { count: open.length })}
              </h2>
              {open.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("adminContact.noOpen")}</p>
              ) : (
                <ul className="space-y-3">
                  {open.map((msg) => (
                    <ContactAdminCard
                      key={msg.id}
                      message={msg}
                      busy={busyId === msg.id}
                      resolveLabel={t("adminContact.markResolved")}
                      onResolve={() => void setStatus(msg.id, "resolved")}
                    />
                  ))}
                </ul>
              )}
            </section>

            {done.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("adminContact.resolvedSection", { count: done.length })}
                </h2>
                <ul className="space-y-3">
                  {done.map((msg) => (
                    <ContactAdminCard
                      key={msg.id}
                      message={msg}
                      busy={busyId === msg.id}
                      resolveLabel={t("adminContact.reopen")}
                      onResolve={() => void setStatus(msg.id, "new")}
                      resolved
                    />
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

function ContactAdminCard({
  message,
  busy,
  resolved,
  resolveLabel,
  onResolve,
}: {
  message: ContactMessage;
  busy: boolean;
  resolved?: boolean;
  resolveLabel: string;
  onResolve: () => void;
}) {
  return (
    <li
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]",
        resolved && "opacity-80",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{message.name}</p>
          <a href={`mailto:${message.email}`} className="text-sm text-primary hover:underline">
            {message.email}
          </a>
        </div>
        <span className="text-xs text-muted-foreground">{formatStamp(message.createdAt)}</span>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
        {message.message}
      </p>
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          size="sm"
          variant={resolved ? "outline" : "default"}
          disabled={busy}
          onClick={onResolve}
          className="gap-1.5"
        >
          {resolved ? (
            <RotateCcw className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {resolveLabel}
        </Button>
      </div>
    </li>
  );
}
