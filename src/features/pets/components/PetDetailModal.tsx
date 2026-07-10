import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, MapPin, Syringe, StickyNote, UserRound, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PetImage } from "@/features/pets/components/PetImage";
import { submitAdoptionRequest } from "@/features/adoption/api/adoptionApi";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/I18nContext";
import type { PetListing } from "@/features/pets/types";
import { cn } from "@/lib/utils";

const STATUS_KEYS: Record<PetListing["status"], TranslationKey> = {
  available: "pet.statusAvailable",
  pending: "pet.statusPending",
  adopted: "pet.statusAdopted",
};

const GENDER_KEYS: Record<PetListing["gender"], TranslationKey> = {
  male: "pet.male",
  female: "pet.female",
  unknown: "pet.unknown",
};

function zaloUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://zalo.me/${digits}`;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-dashed border-border py-2.5 text-sm last:border-0">
      <dt className="w-[42%] shrink-0 font-semibold text-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-muted-foreground">{value}</dd>
    </div>
  );
}

type PetDetailModalProps = {
  pet: PetListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PetDetailModal({ pet, open, onOpenChange }: PetDetailModalProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [activeImage, setActiveImage] = useState(0);
  const [showAdoptForm, setShowAdoptForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveImage(0);
    setShowAdoptForm(false);
    setMessage("");
    setSubmitted(false);
    setSubmitting(false);
  }, [open, pet?.id]);

  if (!pet) return null;

  const images = pet.images.length > 0 ? pet.images : [""];
  const hasPreviousOwner = Boolean(pet.previousOwner?.name);

  const handleAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await submitAdoptionRequest(pet.id, user, message);
      setSubmitted(true);
      setShowAdoptForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92vh,900px)] w-[min(96vw,920px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{pet.name}</DialogTitle>
          <DialogDescription>{t("pet.detailsFor", { name: pet.name })}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-3 bg-muted/40 p-4 sm:p-5">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              <PetImage
                src={images[activeImage]}
                alt={pet.name}
                className="aspect-[4/5] w-full object-cover sm:aspect-[3/4]"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                      i === activeImage
                        ? "border-primary shadow-[var(--shadow-soft)]"
                        : "border-transparent opacity-80 hover:opacity-100",
                    )}
                  >
                    <PetImage src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-col overflow-y-auto p-5 sm:p-6">
            <div className="pr-8">
              <h2 className="text-3xl font-bold tracking-tight">{pet.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {pet.breed} · {t("pet.listedBy", { name: pet.postedByName })}
              </p>
            </div>

            <dl className="mt-5">
              <InfoRow label={t("pet.id")} value={pet.code} />
              <InfoRow label={t("pet.gender")} value={t(GENDER_KEYS[pet.gender])} />
              <InfoRow label={t("pet.age")} value={pet.age} />
              {pet.weightKg != null && (
                <InfoRow label={t("pet.weight")} value={`${pet.weightKg} kg`} />
              )}
              <InfoRow label={t("pet.health")} value={pet.healthStatus} />
              <InfoRow label={t("pet.adoptionStatus")} value={t(STATUS_KEYS[pet.status])} />
              {pet.intakeYear != null && (
                <InfoRow label={t("pet.received")} value={String(pet.intakeYear)} />
              )}
              {pet.pickup?.address && (
                <InfoRow
                  label={t("pet.pickup")}
                  value={
                    <span className="inline-flex items-start gap-1">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {pet.pickup.address}
                    </span>
                  }
                />
              )}
            </dl>

            {pet.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {pet.description}
              </p>
            )}

            {pet.vaccinations.length > 0 && (
              <section className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Syringe className="h-4 w-4 text-primary" />
                  {t("pet.vaccines")}
                </h3>
                <ul className="mt-3 space-y-2">
                  {pet.vaccinations.map((v, i) => (
                    <li
                      key={`${v.name}-${v.date}-${i}`}
                      className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{v.name}</span>
                        <time className="text-xs text-muted-foreground">{v.date}</time>
                      </div>
                      {v.nextDue && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t("pet.nextDue", { date: v.nextDue })}
                        </p>
                      )}
                      {v.notes && <p className="mt-0.5 text-xs text-muted-foreground">{v.notes}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {pet.notes && (
              <section className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <StickyNote className="h-4 w-4 text-primary" />
                  {t("pet.notes")}
                </h3>
                <p className="mt-2 rounded-xl border border-border bg-accent/30 px-3 py-2.5 text-sm leading-relaxed">
                  {pet.notes}
                </p>
              </section>
            )}

            {hasPreviousOwner && pet.previousOwner && (
              <section className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <UserRound className="h-4 w-4 text-primary" />
                  {t("pet.previousOwner")}
                </h3>
                <div className="mt-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm">
                  <p className="font-medium">{pet.previousOwner.name}</p>
                  {pet.previousOwner.note && (
                    <p className="mt-1 text-muted-foreground">{pet.previousOwner.note}</p>
                  )}
                </div>
              </section>
            )}

            <div className="mt-auto space-y-3 border-t border-border pt-5">
              {submitted ? (
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <Heart className="mx-auto h-7 w-7 text-primary" />
                  <p className="mt-2 font-medium">{t("pet.requestSent")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("pet.requestSentDesc")}</p>
                </div>
              ) : showAdoptForm && user ? (
                <form onSubmit={handleAdopt} className="space-y-3">
                  <label className="text-sm font-medium" htmlFor="adopt-message">
                    {t("pet.whyFit", { name: pet.name })}
                  </label>
                  <textarea
                    id="adopt-message"
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="shadow-[var(--shadow-soft)]"
                    >
                      {submitting ? t("pet.sending") : t("pet.submitRequest")}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAdoptForm(false)}>
                      {t("pet.cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  {pet.status === "available" ? (
                    user ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-primary text-primary hover:bg-primary/5"
                        onClick={() => setShowAdoptForm(true)}
                      >
                        <Heart className="h-4 w-4" />
                        {t("pet.adopt")}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 border-primary text-primary"
                      >
                        <Link to="/login" state={{ from: location.pathname + location.search }}>
                          <Heart className="h-4 w-4" />
                          {t("pet.signInToAdopt")}
                        </Link>
                      </Button>
                    )
                  ) : (
                    <Button type="button" variant="outline" className="flex-1" disabled>
                      {t("pet.notAvailable")}
                    </Button>
                  )}

                  {pet.zaloPhone && (
                    <Button asChild className="flex-1 shadow-[var(--shadow-soft)]">
                      <a href={zaloUrl(pet.zaloPhone)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        {t("pet.chatZalo")}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
