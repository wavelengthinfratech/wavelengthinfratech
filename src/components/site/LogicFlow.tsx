import { Wifi, Lock, Eye } from "lucide-react";

const principles = [
  {
    icon: Wifi,
    tag: "01",
    title: "Offline First",
    desc: "Site par network nahi hota. Hum local PWA + IndexedDB me data save karte hain. Net aate hi auto-sync, with conflict resolution.",
    code: `// Offline queue
db.dpr.add(report)
sync.when('online')`,
  },
  {
    icon: Lock,
    tag: "02",
    title: "Zero Leakage Logic",
    desc: "Vendor bill approve nahi hoga jab tak Site Engineer GRN upload na kare. 3-way match enforced at DB level.",
    code: `IF grn.status != 'verified'
  → block bill.approve
  → notify finance`,
  },
  {
    icon: Eye,
    tag: "03",
    title: "Role-Based Access",
    desc: "Labour ko sirf attendance. Supervisor ko DPR + Material. Owner ko P&L + dashboards. RBAC enforced via Postgres RLS.",
    code: `labour  → /attendance
super   → /dpr /material
owner   → /pnl /reports`,
  },
];

export const LogicFlow = () => {
  return (
    <section id="logic" className="py-24 lg:py-32 relative bg-card/30 border-y border-border/50">
      <div className="absolute inset-0 blueprint-grid opacity-40" />
      <div className="container relative">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-mono uppercase tracking-wider text-primary mb-4">
            System Logic
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Civil contracting ka asli problem? <span className="text-gradient-primary">Data integrity.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Three architectural rules baked into every workflow — taaki ek bhi rupee, ek bag cement, ek mazdoor untracked na ho.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {principles.map((p) => (
            <div key={p.tag} className="surface-card rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute -top-4 -right-2 text-7xl font-bold text-primary/5 font-mono select-none">{p.tag}</div>
              <div className="relative">
                <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <p.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{p.desc}</p>
                <pre className="text-xs font-mono bg-background/60 border border-border rounded-lg p-3 text-primary/90 overflow-x-auto">
{p.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
