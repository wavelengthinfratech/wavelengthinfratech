import { HardHat, Palette, Building, Map } from "lucide-react";

const services = [
  {
    icon: HardHat,
    badge: "01",
    title: "Construction",
    desc: "Civil contracting for residential, commercial, and infrastructure projects. RCC, finishing, MEP coordination — all delivered on schedule with audit-ready documentation.",
    bullets: ["Turnkey civil execution", "Quality + safety compliance", "On-time delivery"],
  },
  {
    icon: Palette,
    badge: "02",
    title: "Design Studio",
    desc: "In-house architectural and interior design. Concept to construction drawings — every detail thought through before the first brick is laid.",
    bullets: ["Architectural concepts", "Interior design", "Working drawings"],
  },
  {
    icon: Building,
    badge: "03",
    title: "Elevation",
    desc: "Modern, distinctive façades engineered for India's climate. 3D renders, material selection, and value engineering to keep budgets in check.",
    bullets: ["3D elevation renders", "Façade engineering", "Material specs"],
  },
  {
    icon: Map,
    badge: "04",
    title: "Planning",
    desc: "Site planning, master layouts, and approvals coordination. From RERA filing to municipal sanctions, we handle the paperwork while you focus on the build.",
    bullets: ["Master planning", "Statutory approvals", "RERA + sanctions"],
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="py-24 lg:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="size-1.5 rounded-full bg-primary" /> What we do
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Four disciplines. <span className="text-gradient-primary">One vendor.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From the first concept sketch to the final handover photo — Wavelength Infratech keeps every stage under one roof.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div key={s.title} className="group surface-card rounded-2xl p-8 hover:border-primary/40 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-6">
                <div className="size-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <s.icon className="size-6 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{s.badge}</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{s.desc}</p>
              <ul className="space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span className="text-foreground/80">{b}</span>
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
