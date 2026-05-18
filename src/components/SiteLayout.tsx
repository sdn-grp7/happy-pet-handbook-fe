import { Link, Outlet } from "@tanstack/react-router";
import { PawPrint } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/basics", label: "Basics" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/training", label: "Training" },
  { to: "/health", label: "Health" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground" style={{ background: "var(--gradient-warm)" }}>
              <PawPrint className="h-5 w-5" />
            </span>
            PawPath
          </Link>
          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  activeProps={{ className: "px-3 py-2 rounded-md text-sm text-foreground bg-muted font-medium" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-muted/40">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PawPath. Made with love for pets and their people.</p>
          <div className="flex gap-4">
            {navItems.slice(1).map((i) => (
              <Link key={i.to} to={i.to} className="hover:text-foreground transition-colors">{i.label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
