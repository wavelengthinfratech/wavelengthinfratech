import { Button } from "@/components/ui/button";
import heroImg from "@/assets/portfolio-hero.jpg";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const PortfolioHero = () => {
  return (
    <section id="top" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-50" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-primary mb-6">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              WAVELENGTH INFRATECH · BY DEVENDASINGH RATHORE DHANIYAKHEDI
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              Building tomorrow's{" "}
              <span className="text-gradient-primary">India.</span>{" "}
              <span className="block text-3xl sm:text-4xl lg:text-5xl text-muted-foreground font-medium mt-3">
                Construction · Design Studio · Elevation · Planning
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              End-to-end civil contracting and architectural services across Madhya Pradesh and Dholera Smart City.
              Backed by an in-house ConTech ERP that gives every site real-time control over labour, material, and cost.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Button asChild variant="hero" size="xl">
                <a href="#projects">Explore our work <ArrowRight className="size-4" /></a>
              </Button>
              <Button asChild variant="glass" size="xl">
                <a href="#contact">Request a quote</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Building2 className="size-4 text-primary" />{"\n"}</div>
              <div className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{"\n"}</div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden surface-card animate-float">
              <img
                src={heroImg}
                alt="Wavelength Infratech construction site at golden hour with tower crane and engineers"
                width={1600}
                height={1024}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
            <div className="absolute -left-4 top-8 surface-card rounded-xl px-4 py-3 backdrop-blur-md hidden md:block animate-float" style={{ animationDelay: "1s" }}>
              <div className="text-xs text-muted-foreground font-mono">ACTIVE SITES</div>
              <div className="text-2xl font-bold text-primary">10+</div>
            </div>
            <div className="absolute -right-4 bottom-8 surface-card rounded-xl px-4 py-3 backdrop-blur-md hidden md:block animate-float" style={{ animationDelay: "2s" }}>
              <div className="text-xs text-muted-foreground font-mono">ESTABLISHED</div>
              <div className="text-2xl font-bold text-[hsl(var(--success))]">2018</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
