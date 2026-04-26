import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth, roleHomePath } from "@/hooks/useAuth";

const navItems = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Calculators", href: "/calculators/tiles" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const PortfolioHeader = () => {
  const [open, setOpen] = useState(false);
  const { user, role } = useAuth();
  const loc = useLocation();
  const onHome = loc.pathname === "/";

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Left: nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((n) =>
            n.href.startsWith("#") ? (
              <a key={n.href} href={onHome ? n.href : `/${n.href}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {n.label}
              </a>
            ) : (
              <Link key={n.href} to={n.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {n.label}
              </Link>
            ),
          )}
        </nav>

        <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Right: Login + Logo (logo always top-right per brand spec) */}
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex">
              <Link to={roleHomePath(role)}>Open Portal</Link>
            </Button>
          ) : (
            <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth"><LogIn className="size-4" /> Staff Login</Link>
            </Button>
          )}
          <AppLogo />
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-3">
            {navItems.map((n) =>
              n.href.startsWith("#") ? (
                <a key={n.href} href={onHome ? n.href : `/${n.href}`} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                  {n.label}
                </a>
              ) : (
                <Link key={n.href} to={n.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                  {n.label}
                </Link>
              ),
            )}
            <Button asChild variant="hero" size="sm" className="mt-2">
              <Link to={user ? roleHomePath(role) : "/auth"}>{user ? "Open Portal" : "Staff Login"}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
