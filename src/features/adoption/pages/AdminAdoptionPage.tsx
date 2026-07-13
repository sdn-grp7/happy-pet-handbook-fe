import { useCallback, useEffect, useState } from "react";
import { HeartHandshake } from "lucide-react";
import { toast } from "@/shared/lib/toast";
import { PageMeta } from "@/components/PageMeta";
import {
  confirmAdoptionRequest,
  deleteAdoptionRequest,
  getAllAdoptionRequests,
} from "@/features/adoption/api/adoptionApi";
import { AdoptionRequestCard } from "@/features/adoption/components/AdoptionRequestCard";
import type { AdoptionRequest } from "@/features/adoption/types";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";

export function AdminAdoptionPage() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getAllAdoptionRequests(token)
      .then(setRequests)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : t("adminAdoption.loadError"));
      })
      .finally(() => setLoading(false));
  }, [token, t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConfirm = async (id: string) => {
    if (!token) return;
    setBusyId(id);
    try {
      await confirmAdoptionRequest(token, id);
      toast.success(t("adminAdoption.confirmed"));
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("adminAdoption.confirmError"));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm(t("adminAdoption.deleteConfirm"))) return;
    setBusyId(id);
    try {
      await deleteAdoptionRequest(token, id);
      toast.success(t("adminAdoption.deleted"));
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("adminAdoption.deleteError"));
    } finally {
      setBusyId(null);
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

  return (
    <>
      <PageMeta title={t("adminAdoption.title")} description={t("adminAdoption.subtitle")} />
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <HeartHandshake className="h-6 w-6 text-primary" />
            {t("adminAdoption.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("adminAdoption.subtitle")}</p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("adminAdoption.empty")}</p>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("adminAdoption.pendingSection", { count: pending.length })}
              </h2>
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("adminAdoption.noPending")}</p>
              ) : (
                <ul className="space-y-3">
                  {pending.map((r) => (
                    <AdoptionRequestCard
                      key={r.id}
                      request={r}
                      mode="admin"
                      busyId={busyId}
                      onConfirm={handleConfirm}
                      onDelete={handleDelete}
                    />
                  ))}
                </ul>
              )}
            </section>

            {others.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("adminAdoption.historySection", { count: others.length })}
                </h2>
                <ul className="space-y-3">
                  {others.map((r) => (
                    <AdoptionRequestCard
                      key={r.id}
                      request={r}
                      mode="admin"
                      busyId={busyId}
                      onDelete={handleDelete}
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
