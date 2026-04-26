import { Shield, Wifi, Activity } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 lg:py-32 relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
              About Wavelength Infratech
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              A contractor that <span className="text-gradient-primary">runs on data.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              We're a civil contracting and design firm headquartered in Madhya Pradesh, executing residential, commercial,
              and smart-city projects across Central and Western India.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every site we run uses our own ConTech ERP — GPS-fenced attendance, PR/PO/GRN procurement, geo-tagged daily progress reports,
              and live profit &amp; loss visibility. That means transparent budgets, zero billing leakage, and on-time delivery for every client.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: "Audit-ready", desc: "Every entry timestamped, geo-tagged, and traceable." },
              { icon: Activity, title: "Live P&L", desc: "Owner sees every site's cost vs budget in real time." },
              { icon: Wifi, title: "Offline-first", desc: "Sites work without internet — sync when back online." },
              { icon: Shield, title: "Zero leakage", desc: "Vendor bill blocks until material receipt is verified." },
            ].map((c) => (
              <div key={c.title} className="surface-card rounded-2xl p-6">
                <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <c.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
