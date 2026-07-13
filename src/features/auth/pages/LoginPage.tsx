import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { LogIn, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/lib/api";
import { toast } from "@/shared/lib/toast";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export function LoginPage() {
  const { t } = useI18n();
  const { login, loginGoogle, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/profile";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const goAfterAuth = (role?: string) => {
    if (role === "admin" && (!from || from === "/profile" || from === "/")) {
      navigate("/admin", { replace: true });
      return;
    }
    navigate(from.startsWith("/") ? from : "/profile", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        if (form.password.length < 8) {
          const msg = t("auth.passwordMin");
          setError(msg);
          toast.error(msg);
          return;
        }
        const next = await register(form.name, form.email, form.password);
        toast.success(t("auth.registerSuccess"));
        goAfterAuth(next.role);
        return;
      }
      const next = await login(form.email, form.password);
      toast.success(t("auth.loginSuccess"));
      goAfterAuth(next.role);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t("auth.genericError");
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <PageMeta title="Sign in — PawPath" description="Login or register with PawPath." />
      <PageHero
        eyebrow={t("login.eyebrow")}
        title={t("login.title")}
        subtitle={t("login.subtitle")}
      />
      <section className="max-w-md mx-auto px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-card)] space-y-4"
        >
          {mode === "register" && (
            <div>
              <label className="text-sm font-medium flex items-center gap-2" htmlFor="name">
                <User className="h-4 w-4" /> {t("auth.name")}
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium flex items-center gap-2" htmlFor="email">
              <Mail className="h-4 w-4" /> {t("auth.email")}
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
            <label className="text-sm font-medium flex items-center gap-2" htmlFor="password">
              <Lock className="h-4 w-4" /> {t("auth.password")}
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:opacity-95 transition disabled:opacity-60"
            style={{ background: "var(--gradient-warm)" }}
          >
            <LogIn className="h-4 w-4" />
            {loading
              ? t("common.loading")
              : mode === "login"
                ? t("auth.signIn")
                : t("auth.register")}
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-2">{t("auth.or")}</span>
            </div>
          </div>

          {googleClientId ? (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (cred) => {
                  if (!cred.credential) {
                    const msg = t("auth.googleNoCredential");
                    setError(msg);
                    toast.error(msg);
                    return;
                  }
                  try {
                    setError("");
                    const next = await loginGoogle(cred.credential);
                    toast.success(t("auth.googleSuccess"));
                    goAfterAuth(next.role);
                  } catch (err) {
                    const msg = err instanceof ApiError ? err.message : t("auth.googleFailed");
                    setError(msg);
                    toast.error(msg);
                  }
                }}
                onError={() => {
                  const msg = t("auth.googleCancelled");
                  setError(msg);
                  toast.error(msg);
                }}
                useOneTap={false}
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Google sign-in chưa cấu hình. Thêm{" "}
              <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code> vào .env.
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => setMode("register")}
                >
                  {t("auth.register")}
                </button>
              </>
            ) : (
              <>
                {t("auth.haveAccount")}{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => setMode("login")}
                >
                  {t("auth.signIn")}
                </button>
              </>
            )}
          </p>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            {t("auth.continueBrowsing")}
          </Link>
        </p>
      </section>
    </>
  );
}
