import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { AppLogo } from "@/components/AppLogo";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/calculators/tiles", label: "Tiles" },
  { to: "/calculators/paint", label: "Paint" },
  { to: "/calculators/labour", label: "Labour" },
];

export const CalculatorLayout = ({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) => {
  return (
    <main className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Wavelength Infratech</Link>
          <AppLogo />
        </div>
      </header>

      <div className="pt-24 pb-16">
        <div className="container max-w-5xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-mono uppercase tracking-wider text-primary mb-3">
              Live rates from Pricing Master
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-2">{title}</h1>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          </div>

          <nav className="flex gap-2 mb-8 border-b border-border">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                    isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          {children}
        </div>
      </div>
    </main>
  );
};
