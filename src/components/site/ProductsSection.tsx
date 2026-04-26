import { Grid3x3, Fence, Armchair, Lightbulb } from "lucide-react";

const products = [
  {
    icon: Grid3x3,
    badge: "01",
    title: "Paver Blocks",
    desc: "Interlocking concrete pavers for driveways, walkways, parking lots, and landscaping. Multiple shapes, thicknesses, and colors available.",
    bullets: ["Heavy-duty interlocking", "Multiple shapes & colors", "Bulk supply across MP"],
  },
  {
    icon: Fence,
    badge: "02",
    title: "Boundary Walls",
    desc: "Precast and cast-in-situ compound walls for plots, factories, farms, and societies. Quick to install, durable, and cost-efficient.",
    bullets: ["Precast panels", "Custom heights", "Plot · factory · farm"],
  },
  {
    icon: Armchair,
    badge: "03",
    title: "RCC Cover Blocks & Chairs",
    desc: "Precast concrete chairs and cover blocks for reinforcement spacing on slabs, columns, and beams. Manufactured to standard cover requirements.",
    bullets: ["Slab · column · beam", "Standard cover sizes", "Site-ready packs"],
  },
  {
    icon: Lightbulb,
    badge: "04",
    title: "Cement Poles",
    desc: "RCC fencing poles, electric poles, and farm boundary poles in standard heights. Reinforced for long outdoor life.",
    bullets: ["Fencing & farm poles", "Electric line poles", "Standard 8'–20' heights"],
  },
];

export const ProductsSection = () => {
  return (
    <section id="products-mfg" className="py-24 lg:py-32 relative bg-card/30">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="size-1.5 rounded-full bg-primary" /> What we manufacture
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Precast products, <span className="text-gradient-primary">straight from our yard.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Beyond construction services, Wavelength Infratech manufactures and supplies pavers, boundary walls, RCC chairs, and cement poles across MP.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.title} className="group surface-card rounded-2xl p-8 hover:border-primary/40 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-6">
                <div className="size-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <p.icon className="size-6 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{p.badge}</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{p.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{p.desc}</p>
              <ul className="space-y-2">
                {p.bullets.map((b) => (
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
