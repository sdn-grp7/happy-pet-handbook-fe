import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

type RequireAuthProps = {
  children: ReactNode;
  /** Where to send guests. Defaults to /login with return URL. */
  redirectTo?: string;
};

export function RequireAuth({ children, redirectTo = "/login" }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname + location.search }} replace />
    );
  }

  return children;
}

/** Redirect signed-in users away from login/register. */
export function GuestOnly({ children, redirectTo = "/profile" }: RequireAuthProps) {
  const { user } = useAuth();
  if (user) return <Navigate to={redirectTo} replace />;
  return children;
}
