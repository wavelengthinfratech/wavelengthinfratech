import { Users, Package, ClipboardCheck, TrendingUp, ArrowUpRight } from "lucide-react";

const modules = [
  {
    icon: Users,
    badge: "01 / Workforce",
    title: "Workforce Management",
    desc: "GPS-fenced attendance + Face-ID verification. Auto payroll for daily wagers aur subcontractors. No more fake hazri.",
    bullets: ["Geo-fenced punch-in/out", "Face-ID liveness check", "Auto wage calculation", "Subcontractor RA bills"],
  },
  {
    icon: Package,
    badge: "02 / Inventory",
    title: "Material & Procurement",
    desc: "PR → PO → GRN matching with automated stock deductions. Vendor bill tab tak block jab tak GRN approved nahi.",
    bullets: ["Purchase Requisition workflow", "PO with approval matrix", "GRN photo verification", "3-way invoice match"],
  },
  {
    icon: ClipboardCheck,
    badge: "03 / DPR",
    title: "Daily Progress Tracking",
    desc: "Geo-tagged photo uploads, activity-wise progress (Earthwork, RCC, Finishing). Auto WhatsApp report to owner at 6 PM.",
    bullets: ["Activity-wise % complete", "Geo-tagged site photos", "Delay flag triggers", "WhatsApp auto-report"],
  },
  {
    icon: TrendingUp,
    badge: "04 / Finance",
    title: "Financial Control",
    desc: "Real-time Project P&L. Subcontractor billing on 'Measured Work'. Tally aur Zoho Books me one-click sync.",
    bullets: ["Live project P&L", "Measured-work billing", "Tally / Zoho sync", "Cost code analytics"],
  },
];

export const Modules = () => {
  return (
    <section id="modules" className="py-24 lg:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="size-1.5 rounded-full bg-primary" /> Core Modules
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Char modules. Ek platform. <span className="text-gradient-primary">Zero leakage.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built around the four places where civil contractors lose money — labour, material, time, and billing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((m) => (
            <div key={m.title} className="group surface-card rounded-2xl p-8 hover:border-primary/40 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-6">
                <div className="size-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <m.icon className="size-6 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{m.badge}</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{m.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{m.desc}</p>
              <ul className="space-y-2 mb-6">
                {m.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span className="text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className="inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all">
                Explore module <ArrowUpRight className="size-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
