import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

type RequireAuthProps = {
  children: ReactNode;
  /** Where to send guests. Defaults to /login with return URL. */
  redirectTo?: string;
};

export function RequireAuth({ children, redirectTo = "/login" }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname + location.search }} replace />
    );
  }

  return children;
}

/** Signed-in admin only. */
export function RequireAdmin({ children, redirectTo = "/" }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: "/admin" }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

/** Public site only — admins stay in /admin. */
export function RedirectAdminToPanel({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

/** Redirect signed-in users away from login/register. */
export function GuestOnly({ children, redirectTo = "/profile" }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }
  if (user) {
    const dest = user.role === "admin" ? "/admin" : redirectTo;
    return <Navigate to={dest} replace />;
  }
  return children;
}
