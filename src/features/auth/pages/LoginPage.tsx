import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { LogIn, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/lib/api";

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

  const goAfterAuth = () => navigate(from, { replace: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        if (form.password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        await register(form.name, form.email, form.password);
        goAfterAuth();
        return;
      }
      await login(form.email, form.password);
      goAfterAuth();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
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
                <User className="h-4 w-4" /> Name
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
              <Mail className="h-4 w-4" /> Email
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
              <Lock className="h-4 w-4" /> Password
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
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-2">or</span>
            </div>
          </div>

          {googleClientId ? (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (cred) => {
                  if (!cred.credential) {
                    setError("Google did not return a credential.");
                    return;
                  }
                  try {
                    setError("");
                    await loginGoogle(cred.credential);
                    goAfterAuth();
                  } catch (err) {
                    setError(err instanceof ApiError ? err.message : "Google sign-in failed.");
                  }
                }}
                onError={() => setError("Google sign-in was cancelled or failed.")}
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
                No account?{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => setMode("login")}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            Continue browsing without signing in →
          </Link>
        </p>
      </section>
    </>
  );
}
