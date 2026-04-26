import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 lg:py-32 relative bg-card/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            Get in touch
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Let's build <span className="text-gradient-primary">together.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Have a site to plan, a façade to design, or a project to execute? Reach out — we'll respond within 24 hours.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Mail, label: "Email", value: "info@wavelengthinfratech.com" },
              { icon: Phone, label: "Phone", value: "+91 98XXX XXXXX" },
              { icon: MapPin, label: "Office", value: "Indore, Madhya Pradesh" },
            ].map((c) => (
              <div key={c.label} className="surface-card rounded-2xl p-6">
                <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <c.icon className="size-5 text-primary" />
                </div>
                <div className="text-xs font-mono uppercase text-muted-foreground mb-1">{c.label}</div>
                <div className="text-sm font-medium">{c.value}</div>
              </div>
            ))}
          </div>

          <Button asChild variant="hero" size="xl">
            <a href="mailto:info@wavelengthinfratech.com">Send us a message</a>
          </Button>
        </div>
      </div>
    </section>
  );
};
