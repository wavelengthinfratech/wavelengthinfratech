import { useState } from "react";
import { Database, Code2 } from "lucide-react";

const tabs = {
  schema: {
    label: "Database Schema",
    icon: Database,
    blocks: [
      {
        title: "labour_attendance",
        code: `CREATE TABLE labour_attendance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id     UUID REFERENCES workers(id),
  project_id    UUID REFERENCES projects(id),
  punch_in_at   TIMESTAMPTZ NOT NULL,
  punch_out_at  TIMESTAMPTZ,
  geo_in        GEOGRAPHY(POINT, 4326),
  geo_out       GEOGRAPHY(POINT, 4326),
  face_match    NUMERIC(4,3),  -- 0.000–1.000
  verified_by   UUID REFERENCES users(id),
  wage_rate     NUMERIC(10,2),
  hours_worked  NUMERIC(5,2) GENERATED ALWAYS AS
                (EXTRACT(EPOCH FROM punch_out_at - punch_in_at)/3600) STORED,
  status        attendance_status NOT NULL DEFAULT 'pending',
  audit_log     JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON labour_attendance USING GIST (geo_in);`,
      },
      {
        title: "material_tracking",
        code: `CREATE TABLE purchase_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id         UUID REFERENCES purchase_requisitions(id),
  vendor_id     UUID REFERENCES vendors(id),
  project_id    UUID REFERENCES projects(id),
  total_amount  NUMERIC(14,2),
  status        po_status NOT NULL DEFAULT 'draft',
  approved_by   UUID, approved_at TIMESTAMPTZ
);

CREATE TABLE goods_received_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id         UUID REFERENCES purchase_orders(id),
  received_qty  NUMERIC(12,3) NOT NULL,
  variance_qty  NUMERIC(12,3) NOT NULL,
  photos        TEXT[] NOT NULL,         -- cloud URLs
  geo_point     GEOGRAPHY(POINT, 4326),
  verified_by   UUID REFERENCES users(id),
  status        grn_status NOT NULL DEFAULT 'pending'
);

-- Stock auto-deducted via trigger on GRN verify
CREATE TRIGGER grn_stock_sync
  AFTER UPDATE ON goods_received_notes
  FOR EACH ROW EXECUTE FUNCTION sync_stock_ledger();`,
      },
    ],
  },
  api: {
    label: "DPR API Endpoints",
    icon: Code2,
    blocks: [
      {
        title: "Daily Progress Report",
        code: `# Authentication: Bearer JWT (RBAC enforced via Postgres RLS)

POST   /api/v1/dpr                       # Create new DPR
GET    /api/v1/dpr?project_id&date       # List with filters
GET    /api/v1/dpr/:id                   # Single DPR detail
PATCH  /api/v1/dpr/:id                   # Update before submission
POST   /api/v1/dpr/:id/submit            # Lock + trigger WhatsApp

# Activity progress
POST   /api/v1/dpr/:id/activities        # Add activity entry
PATCH  /api/v1/dpr/:id/activities/:aid   # Update % complete

# Geo-tagged photos
POST   /api/v1/dpr/:id/photos            # multipart, with EXIF/GPS
DELETE /api/v1/dpr/:id/photos/:pid

# Delay management
POST   /api/v1/dpr/:id/flags             # Raise delay flag + reason
GET    /api/v1/dpr/:id/flags

# Sync (offline-first)
POST   /api/v1/sync/dpr/batch            # Bulk upsert from device queue
GET    /api/v1/sync/dpr/since?ts=...     # Delta pull for device

# Owner reports
GET    /api/v1/reports/dpr/weekly        # Aggregated PDF
POST   /api/v1/reports/dpr/whatsapp      # Trigger broadcast`,
      },
    ],
  },
};

export const ArchitectureDocs = () => {
  const [active, setActive] = useState<keyof typeof tabs>("schema");
  const current = tabs[active];

  return (
    <section className="py-24 lg:py-32 bg-card/30 border-y border-border/50">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            For your CTO
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Architecture, not <span className="text-gradient-primary">marketing fluff.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Real schema. Real endpoints. Built for scale, audit, and offline-first reality of Indian sites.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {(Object.keys(tabs) as (keyof typeof tabs)[]).map((k) => {
            const Icon = tabs[k].icon;
            return (
              <button
                key={k}
                onClick={() => setActive(k)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active === k
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" /> {tabs[k].label}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {current.blocks.map((b) => (
            <div key={b.title} className="surface-card rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-background/40 flex items-center justify-between">
                <span className="font-mono text-sm text-primary">{b.title}</span>
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive/60" />
                  <span className="size-2.5 rounded-full bg-secondary/60" />
                  <span className="size-2.5 rounded-full bg-[hsl(var(--success))]/60" />
                </div>
              </div>
              <pre className="p-5 text-xs leading-relaxed font-mono text-foreground/85 overflow-x-auto">
{b.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
