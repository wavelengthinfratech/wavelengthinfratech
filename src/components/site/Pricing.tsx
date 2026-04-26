import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    desc: "1 active project, up to 25 workers",
    price: "₹4,999",
    period: "/month",
    features: ["Workforce + Attendance", "DPR with photos", "Basic P&L", "WhatsApp reports", "Email support"],
    cta: "Start free trial",
    variant: "glass" as const,
  },
  {
    name: "Builder",
    desc: "Most popular for growing contractors",
    price: "₹14,999",
    period: "/month",
    features: ["Up to 5 projects, 200 workers", "Full Procurement (PR/PO/GRN)", "Tally + Zoho sync", "Subcontractor billing", "AI Quantity Estimation (beta)", "Priority WhatsApp support"],
    cta: "Book demo",
    variant: "hero" as const,
    featured: true,
  },
  {
    name: "Enterprise",
    desc: "Unlimited scale with custom integrations",
    price: "Custom",
    period: "",
    features: ["Unlimited projects + workers", "On-prem deployment option", "Custom integrations", "Dedicated account manager", "SLA-backed uptime", "On-site training"],
    cta: "Talk to sales",
    variant: "glass" as const,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 lg:py-32 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            Pricing
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Pay for sites, <span className="text-gradient-primary">not for seats.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Predictable monthly pricing. Unlimited supervisor logins on every plan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-8 transition-all duration-500 ${
                t.featured
                  ? "surface-card border-primary/50 shadow-[var(--shadow-elegant)] md:scale-105 md:-translate-y-2"
                  : "surface-card hover:border-primary/30"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-[hsl(20_90%_55%)] text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{t.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t.price}</span>
                <span className="text-muted-foreground">{t.period}</span>
              </div>
              <Button variant={t.variant} className="w-full mb-6">{t.cta}</Button>
              <ul className="space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
