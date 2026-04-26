import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-construction.jpg";
import { ArrowRight, PlayCircle, Wifi, ShieldCheck, MapPin } from "lucide-react";

export const Hero = () => {
  return (
    <section id="top" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 blueprint-grid opacity-60" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-primary mb-6">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Built for Indian Civil Contractors
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              Site se Office tak.{" "}
              <span className="text-gradient-primary">Zero Leakage.</span>{" "}
              <span className="block text-3xl sm:text-4xl lg:text-5xl text-muted-foreground font-medium mt-3">
                The ConTech ERP your supervisors will actually use.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Wavelength Infratech ka SaaS platform jo GPS attendance, material procurement, daily progress reports
              aur live P&amp;L — sab ek dashboard pe laata hai. Offline-first. Audit-ready. Made for Bharat's job sites.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Button variant="hero" size="xl">
                Book a Free Demo <ArrowRight className="size-4" />
              </Button>
              <Button variant="glass" size="xl">
                <PlayCircle className="size-4" /> Watch 90-sec walkthrough
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Wifi className="size-4 text-primary" /> Offline-first PWA</div>
              <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Audit trail on every entry</div>
              <div className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> Geo-fenced attendance</div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden surface-card animate-float">
              <img
                src={heroImg}
                alt="Site engineer using Wavelength Infratech ERP on tablet at construction site"
                width={1920}
                height={1080}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
            {/* Floating stat cards */}
            <div className="absolute -left-4 top-8 surface-card rounded-xl px-4 py-3 backdrop-blur-md hidden md:block animate-float" style={{ animationDelay: "1s" }}>
              <div className="text-xs text-muted-foreground font-mono">TODAY · HAZRI</div>
              <div className="text-2xl font-bold text-primary">124 / 138</div>
            </div>
            <div className="absolute -right-4 bottom-8 surface-card rounded-xl px-4 py-3 backdrop-blur-md hidden md:block animate-float" style={{ animationDelay: "2s" }}>
              <div className="text-xs text-muted-foreground font-mono">PROJECT P&amp;L</div>
              <div className="text-2xl font-bold text-[hsl(var(--success))]">+₹4.2L</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
