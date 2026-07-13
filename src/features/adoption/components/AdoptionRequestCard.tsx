import { Link } from "react-router-dom";
import { Check, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdoptionRequest } from "@/features/adoption/types";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/I18nContext";

const STATUS_KEYS: Record<AdoptionRequest["status"], TranslationKey> = {
  pending: "adoptionRequest.statusPending",
  approved: "adoptionRequest.statusApproved",
  rejected: "adoptionRequest.statusRejected",
};

type AdoptionRequestCardProps = {
  request: AdoptionRequest;
  mode: "mine" | "incoming" | "admin";
  busyId?: string | null;
  onConfirm?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function AdoptionRequestCard({
  request,
  mode,
  busyId,
  onConfirm,
  onDelete,
}: AdoptionRequestCardProps) {
  const { t } = useI18n();
  const busy = busyId === request.id;
  const canAct = request.status === "pending";

  return (
    <li className="rounded-xl border border-border bg-card p-4 text-sm">
      <div className="flex gap-3">
        {request.petImage ? (
          <img
            src={request.petImage}
            alt={request.petName}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
            <UserRound className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{request.petName}</p>
              {request.petCode ? (
                <p className="text-xs text-muted-foreground">#{request.petCode}</p>
              ) : null}
            </div>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t(STATUS_KEYS[request.status])}
            </span>
          </div>

          {mode !== "mine" ? (
            <p className="mt-2 text-muted-foreground">
              <span className="font-medium text-foreground/80">
                {t("adoptionRequest.requester")}:{" "}
              </span>
              <Link
                to={`/users/${encodeURIComponent(request.adopterId)}`}
                className="text-primary hover:underline"
              >
                {request.adopterName}
              </Link>
            </p>
          ) : request.ownerName ? (
            <p className="mt-2 text-muted-foreground">
              <span className="font-medium text-foreground/80">{t("adoptionRequest.owner")}: </span>
              {request.ownerName}
            </p>
          ) : null}

          {request.message ? (
            <p className="mt-1.5 line-clamp-3 text-muted-foreground">{request.message}</p>
          ) : null}

          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(request.createdAt).toLocaleString()}
          </p>

          {request.status === "approved" ? (
            <p className="mt-2 text-xs text-primary">
              <Link
                to={`/adoption?pet=${encodeURIComponent(request.petId)}`}
                className="font-medium hover:underline"
              >
                {t("adoptionRequest.viewPet")}
              </Link>
              {" · "}
              <Link
                to={`/users/${encodeURIComponent(request.adopterId)}`}
                className="font-medium hover:underline"
              >
                {t("adoptionRequest.viewAdopter")}
              </Link>
            </p>
          ) : null}

          {(mode === "incoming" || mode === "admin") && canAct ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {onConfirm ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  className="gap-1.5"
                  onClick={() => onConfirm(request.id)}
                >
                  <Check className="h-3.5 w-3.5" />
                  {busy ? t("common.loading") : t("adoptionRequest.confirm")}
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  className="gap-1.5"
                  onClick={() => onDelete(request.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("adoptionRequest.delete")}
                </Button>
              ) : null}
            </div>
          ) : null}

          {mode === "mine" && canAct && onDelete ? (
            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                className="gap-1.5"
                onClick={() => onDelete(request.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("adoptionRequest.cancel")}
              </Button>
            </div>
          ) : null}

          {mode === "admin" && !canAct && onDelete ? (
            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                className="gap-1.5"
                onClick={() => onDelete(request.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("adoptionRequest.delete")}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
