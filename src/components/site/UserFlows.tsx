import { HardHat, Briefcase } from "lucide-react";

const flows = {
  engineer: {
    icon: HardHat,
    title: "Site Engineer",
    subtitle: "Subah 7 AM — site pe pahunchte hi",
    steps: [
      { t: "Geo-fenced punch-in", d: "App opens → Face-ID → location verified within 50m radius of site." },
      { t: "Mark labour hazri", d: "Single-tap attendance for all 80+ workers. Photo verification for new joinees." },
      { t: "GRN entry on material arrival", d: "Truck aaya → photo + quantity → auto-match with PO. Variance flag if mismatch." },
      { t: "Activity progress update", d: "Earthwork 60% → RCC 35%. Geo-tagged photos uploaded automatically." },
      { t: "End of day: Submit DPR", d: "One-tap submit. Auto-WhatsApp to owner. Offline? Queues and syncs later." },
    ],
  },
  owner: {
    icon: Briefcase,
    title: "Business Owner",
    subtitle: "Office se ya phone se — anywhere",
    steps: [
      { t: "Morning P&L digest", d: "WhatsApp message at 8 AM: live margin, today's expected spend, alerts." },
      { t: "Approve high-value POs", d: "Push notification → review vendor quotes side-by-side → approve in 2 taps." },
      { t: "Review delay flags", d: "Activities running >10% behind schedule auto-surface with reasons + photos." },
      { t: "Subcontractor RA bills", d: "Measured-work billing — only verified quantities pass to finance." },
      { t: "Monthly Tally sync", d: "One click → all entries pushed to Tally with full audit trail." },
    ],
  },
};

const FlowColumn = ({ flow }: { flow: typeof flows.engineer }) => (
  <div className="surface-card rounded-2xl p-8">
    <div className="flex items-center gap-4 mb-8">
      <div className="size-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
        <flow.icon className="size-5 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold">{flow.title}</h3>
        <p className="text-xs text-muted-foreground font-mono">{flow.subtitle}</p>
      </div>
    </div>
    <ol className="relative">
      <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
      {flow.steps.map((s, i) => (
        <li key={s.t} className="relative pl-12 pb-7 last:pb-0">
          <span className="absolute left-0 top-0 size-8 rounded-full bg-background border border-primary/40 flex items-center justify-center text-xs font-mono text-primary font-semibold">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h4 className="font-semibold mb-1">{s.t}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
        </li>
      ))}
    </ol>
  </div>
);

export const UserFlows = () => {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            User Journeys
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Two roles. <span className="text-gradient-primary">Two distinct apps.</span> One source of truth.
          </h2>
          <p className="text-lg text-muted-foreground">
            Same data, completely different UX. Site supervisors get tap-first, low-literacy interfaces.
            Owners get analytics, approvals, and exports.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <FlowColumn flow={flows.engineer} />
          <FlowColumn flow={flows.owner} />
        </div>
      </div>
    </section>
  );
};
