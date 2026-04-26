const stack = [
  { layer: "Mobile App", items: ["Flutter", "Hive (offline)", "WorkManager sync"], color: "primary" },
  { layer: "Web Frontend", items: ["Next.js 14", "Tailwind", "TanStack Query", "PWA + IndexedDB"], color: "primary" },
  { layer: "Backend Services", items: ["Node.js (Fastify)", "Python (FastAPI for AI)", "BullMQ workers"], color: "secondary" },
  { layer: "Data Layer", items: ["PostgreSQL + PostGIS", "Redis", "Row-Level Security (RBAC)"], color: "secondary" },
  { layer: "Infra", items: ["AWS ECS Fargate", "S3 + CloudFront (photos)", "RDS Multi-AZ"], color: "primary" },
  { layer: "Integrations", items: ["WhatsApp Cloud API", "Tally Connector", "Zoho Books API", "Razorpay"], color: "secondary" },
];

export const TechStack = () => {
  return (
    <section id="stack" className="py-24 lg:py-32">
      <div className="container">
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            Tech Stack
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Boring tech. <span className="text-gradient-primary">High performance.</span> Low maintenance cost.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stack.map((s) => (
            <div key={s.layer} className="surface-card rounded-xl p-6 hover:border-primary/40 transition-all">
              <div className={`text-xs font-mono uppercase tracking-wider mb-3 ${s.color === "primary" ? "text-primary" : "text-secondary"}`}>
                {s.layer}
              </div>
              <ul className="space-y-1.5">
                {s.items.map((i) => (
                  <li key={i} className="text-foreground/90 text-sm flex items-center gap-2">
                    <span className={`size-1 rounded-full ${s.color === "primary" ? "bg-primary" : "bg-secondary"}`} />
                    {i}
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
