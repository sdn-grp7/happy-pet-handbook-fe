import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import {
  confirmAdoptionRequest,
  deleteAdoptionRequest,
  getIncomingAdoptionRequests,
} from "@/features/adoption/api/adoptionApi";
import { AdoptionRequestCard } from "@/features/adoption/components/AdoptionRequestCard";
import type { AdoptionRequest } from "@/features/adoption/types";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { toast } from "@/shared/lib/toast";
import { useI18n } from "@/i18n/I18nContext";

export function IncomingAdoptionRequestsPage() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getIncomingAdoptionRequests(token)
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConfirm = async (id: string) => {
    if (!token) return;
    setBusyId(id);
    try {
      await confirmAdoptionRequest(token, id);
      toast.success(t("adoptionRequest.confirmed"));
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("adoptionRequest.confirmError"));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setBusyId(id);
    try {
      await deleteAdoptionRequest(token, id);
      toast.success(t("adoptionRequest.deleted"));
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("adoptionRequest.deleteError"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageMeta
        title={`${t("incomingAdoption.title")} — PawPath`}
        description={t("incomingAdoption.metaDesc")}
      />
      <PageHero
        eyebrow={t("incomingAdoption.eyebrow")}
        title={t("incomingAdoption.title")}
        subtitle={t("incomingAdoption.subtitle")}
      />
      <section className="mx-auto max-w-3xl space-y-4 px-6 py-12">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
            <Inbox className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <p className="mt-4 text-sm text-muted-foreground">{t("incomingAdoption.empty")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("incomingAdoption.emptyHint")}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t("incomingAdoption.count", { count: requests.length })}
            </p>
            <ul className="space-y-3">
              {requests.map((r) => (
                <AdoptionRequestCard
                  key={r.id}
                  request={r}
                  mode="incoming"
                  busyId={busyId}
                  onConfirm={handleConfirm}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
