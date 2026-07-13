import { Link, NavLink, Outlet } from "react-router-dom";
import { BookOpen, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", end: true, icon: LayoutDashboard, labelKey: "admin.navHome" as const },
  { to: "/admin/guides", end: false, icon: BookOpen, labelKey: "admin.navGuides" as const },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const { t } = useI18n();

  const handleLogout = () => {
    logout();
    // Hard navigate so stale admin session isn't bounced back to /admin.
    window.location.assign("/login");
  };

  return (
    <div className="flex min-h-svh bg-muted/40 text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{t("admin.title")}</p>
            <p className="truncate text-xs text-muted-foreground">{t("admin.panel")}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {NAV.map(({ to, end, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {t("nav.logOut")}
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center border-b border-border bg-card px-4 sm:px-6">
          <Link
            to="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            PawPath Admin
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
