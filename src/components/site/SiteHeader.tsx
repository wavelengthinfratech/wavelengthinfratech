import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Modules", href: "#modules" },
  { label: "Logic Flow", href: "#logic" },
  { label: "AI Edge", href: "#ai" },
  { label: "Tech Stack", href: "#stack" },
  { label: "Pricing", href: "#pricing" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="Wavelength Infratech logo" className="h-9 w-auto" />
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button variant="hero" size="sm">Book Demo</Button>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-3">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                {n.label}
              </a>
            ))}
            <Button variant="hero" size="sm" className="mt-2">Book Demo</Button>
          </div>
        </div>
      )}
    </header>
  );
};
