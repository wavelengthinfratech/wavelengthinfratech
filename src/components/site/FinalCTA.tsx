import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const FinalCTA = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container">
        <div className="relative rounded-3xl overflow-hidden border border-primary/30 surface-card p-12 lg:p-20 text-center">
          <div className="absolute inset-0 blueprint-grid opacity-50" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
          <div className="relative max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Ready to plug the leakage in your <span className="text-gradient-primary">next project?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              30-minute demo. We bring a sample DPR, P&amp;L, and a live AI photo-estimation walkthrough.
              No commitment. No credit card.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="hero" size="xl">
                Book your demo <ArrowRight className="size-4" />
              </Button>
              <Button variant="glass" size="xl">Download brochure (PDF)</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
