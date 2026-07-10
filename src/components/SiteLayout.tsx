import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  PawPrint,
  ChevronDown,
  Menu,
  BookOpen,
  Heart,
  MessageSquare,
  Mail,
  MapPin,
  Star,
  User,
  CalendarCheck,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/i18n/I18nContext";

const GUIDE_PATHS = ["/basics", "/nutrition", "/training", "/health"] as const;

function pathMatches(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function DesktopNavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteLayout() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const guideLinks = useMemo(
    () =>
      [
        {
          to: "/basics",
          labelKey: "nav.basics" as TranslationKey,
          descKey: "nav.basicsDesc" as TranslationKey,
        },
        {
          to: "/nutrition",
          labelKey: "nav.nutrition" as TranslationKey,
          descKey: "nav.nutritionDesc" as TranslationKey,
        },
        {
          to: "/training",
          labelKey: "nav.training" as TranslationKey,
          descKey: "nav.trainingDesc" as TranslationKey,
        },
        {
          to: "/health",
          labelKey: "nav.health" as TranslationKey,
          descKey: "nav.healthDesc" as TranslationKey,
        },
      ] as const,
    [],
  );

  const primaryLinks = useMemo(
    () =>
      [
        {
          to: "/adoption",
          labelKey: "nav.adopt" as TranslationKey,
          icon: Heart,
          match: ["/adoption"],
        },
        {
          to: "/forum",
          labelKey: "nav.community" as TranslationKey,
          icon: MessageSquare,
          match: ["/forum", "/community"],
        },
        {
          to: "/contact",
          labelKey: "nav.contact" as TranslationKey,
          icon: Mail,
          match: ["/contact"],
        },
      ] as const,
    [],
  );

  const secondaryLinks = useMemo(
    () =>
      [
        { to: "/map", labelKey: "nav.map" as TranslationKey, icon: MapPin },
        { to: "/reputation", labelKey: "nav.reputation" as TranslationKey, icon: Star },
      ] as const,
    [],
  );

  const onGuide = pathMatches(pathname, GUIDE_PATHS);
  const guidesActive = onGuide;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-soft)]"
              style={{ background: "var(--gradient-warm)" }}
            >
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="text-lg">{t("brand.name")}</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-0.5 lg:flex" aria-label="Main">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
                    guidesActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  {t("nav.guides")}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {t("nav.guidesHint")}
                </DropdownMenuLabel>
                {guideLinks.map((g) => (
                  <DropdownMenuItem key={g.to} asChild className="cursor-pointer rounded-md py-2.5">
                    <Link to={g.to}>
                      <div>
                        <div className="font-medium">{t(g.labelKey)}</div>
                        <div className="text-xs text-muted-foreground">{t(g.descKey)}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {primaryLinks.map((link) => (
              <DesktopNavLink
                key={link.to}
                to={link.to}
                label={t(link.labelKey)}
                active={pathMatches(pathname, link.match)}
              />
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
                    pathMatches(pathname, ["/map", "/reputation"])
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t("nav.more")}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 p-1.5">
                {secondaryLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild className="cursor-pointer gap-2">
                    <Link to={link.to}>
                      <link.icon className="h-4 w-4 text-muted-foreground" />
                      {t(link.labelKey)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hidden items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-medium shadow-sm transition hover:bg-muted sm:inline-flex"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="h-7 w-7 rounded-full bg-muted object-cover"
                      />
                    ) : (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <User className="h-4 w-4" />
                      </span>
                    )}
                    <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link to="/profile">
                      <User className="h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link to="/post-adoption">
                      <CalendarCheck className="h-4 w-4" />
                      {t("nav.checkIns")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.logOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="hidden shadow-[var(--shadow-soft)] sm:inline-flex"
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  {t("nav.signIn")}
                </Link>
              </Button>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label={t("nav.openMenu")}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[min(100%,20rem)] flex-col gap-0 p-0">
                <SheetHeader className="border-b border-border px-5 py-4 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
                      style={{ background: "var(--gradient-warm)" }}
                    >
                      <PawPrint className="h-4 w-4" />
                    </span>
                    {t("brand.name")}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("nav.explore")}
                  </p>
                  <nav className="flex flex-col gap-0.5">
                    <SheetClose asChild>
                      <Link
                        to="/"
                        className={cn(
                          "rounded-lg px-3 py-2.5 text-sm font-medium",
                          pathname === "/" ? "bg-primary/10 text-primary" : "hover:bg-muted",
                        )}
                      >
                        {t("nav.home")}
                      </Link>
                    </SheetClose>

                    <p className="mb-1 mt-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("nav.guides")}
                    </p>
                    {guideLinks.map((g) => (
                      <SheetClose key={g.to} asChild>
                        <Link
                          to={g.to}
                          className={cn(
                            "rounded-lg px-3 py-2.5 text-sm font-medium",
                            pathname === g.to ? "bg-primary/10 text-primary" : "hover:bg-muted",
                          )}
                        >
                          {t(g.labelKey)}
                        </Link>
                      </SheetClose>
                    ))}

                    <p className="mb-1 mt-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("nav.main")}
                    </p>
                    {primaryLinks.map((link) => (
                      <SheetClose key={link.to} asChild>
                        <Link
                          to={link.to}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                            pathMatches(pathname, link.match)
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted",
                          )}
                        >
                          <link.icon className="h-4 w-4 opacity-70" />
                          {t(link.labelKey)}
                        </Link>
                      </SheetClose>
                    ))}

                    {secondaryLinks.map((link) => (
                      <SheetClose key={link.to} asChild>
                        <Link
                          to={link.to}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                            pathname === link.to ? "bg-primary/10 text-primary" : "hover:bg-muted",
                          )}
                        >
                          <link.icon className="h-4 w-4 opacity-70" />
                          {t(link.labelKey)}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  {user && (
                    <>
                      <p className="mb-1 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("nav.account")}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        <SheetClose asChild>
                          <Link
                            to="/profile"
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                              pathname === "/profile"
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted",
                            )}
                          >
                            <User className="h-4 w-4 opacity-70" />
                            {t("nav.profile")}
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            to="/post-adoption"
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                              pathname === "/post-adoption"
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted",
                            )}
                          >
                            <CalendarCheck className="h-4 w-4 opacity-70" />
                            {t("nav.checkIns")}
                          </Link>
                        </SheetClose>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-3 border-t border-border p-4">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-sm text-muted-foreground">{t("common.language")}</span>
                    <LanguageSwitcher />
                  </div>
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-1">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <User className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                          <LogOut className="h-4 w-4" />
                          {t("nav.logOut")}
                        </Button>
                      </SheetClose>
                    </div>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild className="w-full shadow-[var(--shadow-soft)]">
                        <Link to="/login">
                          <LogIn className="h-4 w-4" />
                          {t("nav.signIn")}
                        </Link>
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {onGuide && (
          <div className="border-t border-border/60 bg-muted/40">
            <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 scrollbar-none sm:px-6">
              {guideLinks.map((chapter) => (
                <NavLink
                  key={chapter.to}
                  to={chapter.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                        : "text-muted-foreground hover:bg-background hover:text-foreground",
                    )
                  }
                >
                  {t(chapter.labelKey)}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 font-semibold">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
                style={{ background: "var(--gradient-warm)" }}
              >
                <PawPrint className="h-4 w-4" />
              </span>
              {t("brand.name")}
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t("brand.tagline")}</p>
          </div>

          <div>
            <p className="text-sm font-semibold">{t("footer.guides")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {guideLinks.map((g) => (
                <li key={g.to}>
                  <Link to={g.to} className="transition-colors hover:text-foreground">
                    {t(g.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">{t("footer.adoptConnect")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/adoption" className="transition-colors hover:text-foreground">
                  {t("footer.browsePets")}
                </Link>
              </li>
              <li>
                <Link to="/map" className="transition-colors hover:text-foreground">
                  {t("footer.pickupMap")}
                </Link>
              </li>
              <li>
                <Link to="/forum" className="transition-colors hover:text-foreground">
                  {t("footer.forum")}
                </Link>
              </li>
              <li>
                <Link to="/reputation" className="transition-colors hover:text-foreground">
                  {t("footer.trustScores")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">{t("footer.account")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {user ? (
                <>
                  <li>
                    <Link to="/profile" className="transition-colors hover:text-foreground">
                      {t("nav.profile")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/post-adoption" className="transition-colors hover:text-foreground">
                      {t("nav.checkIns")}
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="transition-colors hover:text-foreground">
                    {t("nav.signIn")}
                  </Link>
                </li>
              )}
              <li>
                <Link to="/contact" className="transition-colors hover:text-foreground">
                  {t("footer.contactSupport")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("brand.name")}. {t("brand.footerCopy")}
        </div>
      </footer>
    </div>
  );
}
