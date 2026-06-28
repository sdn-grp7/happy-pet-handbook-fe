import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PawPrint, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_CREDENTIALS, mockUsers } from "@/mocks/auth";

const quickLoginUser = mockUsers[0];

const GUIDE_PATHS = ["/basics", "/nutrition", "/training", "/health"] as const;

const guideChapterTabs = [
  { to: "/basics", label: "Basics" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/training", label: "Training" },
  { to: "/health", label: "Health" },
] as const;

type NavTab = {
  to: string;
  label: string;
  /** Path prefixes that mark this tab active (defaults to [to]) */
  activePrefixes?: string[];
};

const guestTabs: NavTab[] = [
  { to: "/", label: "Home", activePrefixes: ["/"] },
  { to: "/basics", label: "Guide", activePrefixes: [...GUIDE_PATHS] },
  { to: "/adoption", label: "Adoption", activePrefixes: ["/adoption"] },
  { to: "/map", label: "Map", activePrefixes: ["/map"] },
  { to: "/forum", label: "Forum", activePrefixes: ["/forum", "/community"] },
  { to: "/reputation", label: "Reputation", activePrefixes: ["/reputation"] },
  { to: "/contact", label: "Contact", activePrefixes: ["/contact"] },
];

const authTabs: NavTab[] = [
  { to: "/", label: "Home", activePrefixes: ["/"] },
  { to: "/basics", label: "Guide", activePrefixes: [...GUIDE_PATHS] },
  { to: "/adoption", label: "Adoption", activePrefixes: ["/adoption"] },
  { to: "/map", label: "Map", activePrefixes: ["/map"] },
  { to: "/forum", label: "Forum", activePrefixes: ["/forum", "/community"] },
  { to: "/reputation", label: "Reputation", activePrefixes: ["/reputation"] },
  { to: "/post-adoption", label: "Check-ins", activePrefixes: ["/post-adoption"] },
  { to: "/profile", label: "Profile", activePrefixes: ["/profile"] },
  { to: "/contact", label: "Contact", activePrefixes: ["/contact"] },
];

function isTabActive(pathname: string, tab: NavTab) {
  const prefixes = tab.activePrefixes ?? [tab.to];
  if (tab.to === "/") {
    return pathname === "/";
  }
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function tabClass(active: boolean) {
  return [
    "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
    active
      ? "text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-primary"
      : "text-muted-foreground hover:text-foreground",
  ].join(" ");
}

function subTabClass(active: boolean) {
  return [
    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
    active
      ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ");
}

export function SiteLayout() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = user ? authTabs : guestTabs;
  const onGuideSection = GUIDE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const handleQuickLogin = async () => {
    const ok = await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    if (ok) navigate("/profile");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/95 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg shrink-0">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground"
              style={{ background: "var(--gradient-warm)" }}
            >
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">PawPath</span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <span className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground max-w-[120px] truncate">
                  <User className="h-4 w-4 shrink-0" />
                  {user.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleQuickLogin}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 transition"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  {quickLoginUser.avatar && (
                    <img src={quickLoginUser.avatar} alt="" className="h-5 w-5 rounded-full" />
                  )}
                  <span className="hidden sm:inline">Quick sign in</span>
                  <span className="sm:hidden">Quick</span>
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        <nav
          className="max-w-6xl mx-auto overflow-x-auto px-4 sm:px-6 scrollbar-none"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-1 min-w-max border-t border-border/60">
            {tabs.map((tab) => {
              const active = isTabActive(pathname, tab);
              return (
                <Link key={tab.to} to={tab.to} className={tabClass(active)}>
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {onGuideSection && (
          <nav
            className="max-w-6xl mx-auto overflow-x-auto px-4 sm:px-6 pb-2 pt-1 scrollbar-none bg-muted/30"
            aria-label="Guide chapters"
          >
            <div className="flex items-center gap-2 min-w-max">
              {guideChapterTabs.map((chapter) => (
                <NavLink
                  key={chapter.to}
                  to={chapter.to}
                  end
                  className={({ isActive }) => subTabClass(isActive)}
                >
                  {chapter.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-muted/40">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PawPath. Made with love for pets and their people.</p>
        </div>
      </footer>
    </div>
  );
}
