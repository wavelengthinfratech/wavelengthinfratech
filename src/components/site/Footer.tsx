import logo from "@/assets/logo.png";

const cols = [
  { title: "Product", links: ["Workforce", "Inventory", "DPR", "Finance", "AI Estimation"] },
  { title: "Resources", links: ["Documentation", "API Reference", "Case Studies", "Help Center", "Status"] },
  { title: "Company", links: ["About Wavelength", "Careers", "Contact", "Privacy", "Terms"] },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container py-16">
        <div className="grid lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <img src={logo} alt="Wavelength Infratech" className="h-10 w-auto mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              ConTech ERP built for Indian civil contractors. Site-to-office, zero leakage.
            </p>
            <p className="text-xs font-mono text-muted-foreground/70 mt-6">
              Made in India · For Bharat's job sites
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Wavelength Infratech. All rights reserved.</span>
          <span className="font-mono">v1.0 · Built with offline-first architecture</span>
        </div>
      </div>
    </footer>
  );
};
