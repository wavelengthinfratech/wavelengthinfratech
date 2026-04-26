import { Sparkles, Camera, Calculator, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AIEdge = () => {
  return (
    <section id="ai" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30" style={{ background: "var(--gradient-glow)" }} />
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-secondary mb-5">
              <Sparkles className="size-3" /> Competitive Edge
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              AI-based <span className="text-gradient-amber">Quantity Estimation</span> from a single site photo.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Site supervisor sirf photo khinche — AI detect karega kitne cement bags stacked hain, kitna steel padda hai,
              kitna kaam baaki hai. No more manual stock counts. No more end-of-month reconciliation pain.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { icon: Camera, t: "Snap & Estimate", d: "Cement bags, steel rods, brick stacks — auto-counted from photo." },
                { icon: Calculator, t: "Earthwork volume", d: "Excavation depth measured via depth-aware vision models." },
                { icon: Zap, t: "Real-time variance alert", d: "Estimated vs actual mismatch? Owner gets a flag instantly." },
              ].map((f) => (
                <div key={f.t} className="flex gap-4">
                  <div className="size-10 shrink-0 rounded-lg bg-secondary/15 border border-secondary/30 flex items-center justify-center">
                    <f.icon className="size-4 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5">{f.t}</div>
                    <div className="text-sm text-muted-foreground">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="amber" size="lg">Join AI early access</Button>
          </div>

          <div className="relative">
            <div className="surface-card rounded-2xl p-6 relative">
              <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-primary/20 via-secondary/10 to-background border border-border relative overflow-hidden">
                <div className="absolute inset-0 blueprint-grid opacity-50" />
                {/* Simulated detection boxes */}
                <div className="absolute top-[15%] left-[10%] right-[15%] h-[35%] border-2 border-secondary rounded-lg">
                  <div className="absolute -top-7 left-0 bg-secondary text-secondary-foreground text-xs font-mono px-2 py-0.5 rounded">
                    Cement bags · 124
                  </div>
                </div>
                <div className="absolute bottom-[15%] left-[20%] right-[25%] h-[20%] border-2 border-primary rounded-lg">
                  <div className="absolute -top-7 left-0 bg-primary text-primary-foreground text-xs font-mono px-2 py-0.5 rounded">
                    Steel rods · 8.2 MT
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-20 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center animate-pulse-glow">
                    <Sparkles className="size-8 text-secondary" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="font-mono text-muted-foreground">site_photo_2847.jpg</span>
                <span className="text-[hsl(var(--success))] font-medium">✓ Analyzed in 2.1s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
