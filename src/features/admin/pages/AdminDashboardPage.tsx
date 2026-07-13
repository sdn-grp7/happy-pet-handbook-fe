import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { useI18n } from "@/i18n/I18nContext";

const ADMIN_LINKS = [
  {
    to: "/admin/guides",
    icon: BookOpen,
    titleKey: "admin.guidesTitle" as const,
    descKey: "admin.guidesDesc" as const,
  },
];

export function AdminDashboardPage() {
  const { t } = useI18n();

  return (
    <>
      <PageMeta title={t("admin.title")} description={t("admin.subtitle")} />
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("admin.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
        <ul className="space-y-3">
          {ADMIN_LINKS.map(({ to, icon: Icon, titleKey, descKey }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/30"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{t(titleKey)}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{t(descKey)}</span>
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
