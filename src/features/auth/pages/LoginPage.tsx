import { PageHero } from "@/features/guides/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { DEMO_CREDENTIALS, mockUsers } from "@/features/auth/mocks/data";
import { useI18n } from "@/i18n/I18nContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LogIn, Mail, Lock, User, Zap } from "lucide-react";

const quickLoginUser = mockUsers[0];

export function LoginPage() {
  const { t } = useI18n();
  const { login, loginGoogle, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/profile";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const goAfterAuth = () => navigate(from, { replace: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register") {
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      await register(form.name, form.email, form.password);
      goAfterAuth();
      return;
    }
    const ok = await login(form.email, form.password);
    if (!ok) setError("Invalid email or password.");
    else goAfterAuth();
  };

  const handleGoogle = async () => {
    await loginGoogle();
    goAfterAuth();
  };

  const handleQuickLogin = async () => {
    setError("");
    const ok = await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    if (!ok) setError("Could not sign in. Please try again.");
    else goAfterAuth();
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
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
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
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition disabled:opacity-60"
          >
            Continue with Google
          </button>
          {mode === "login" && (
            <>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-card px-2">or</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-primary/25 bg-primary/5 px-6 py-3 text-sm font-medium hover:bg-primary/10 transition disabled:opacity-60"
              >
                {quickLoginUser.avatar ? (
                  <img
                    src={quickLoginUser.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full border border-border"
                  />
                ) : (
                  <Zap className="h-4 w-4 text-primary" />
                )}
                Continue as {quickLoginUser.name}
              </button>
            </>
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
