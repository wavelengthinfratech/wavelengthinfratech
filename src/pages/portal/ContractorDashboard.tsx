import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ClipboardCheck, Package, Users, Calculator } from "lucide-react";

const ContractorDashboard = () => {
  return (
    <RoleGate allow={["contractor"]}>
      <PortalShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contractor Dashboard</h1>
          <p className="text-muted-foreground">Site management, material requests, and DPR.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Today's Hazri", value: "—" },
            { icon: ClipboardCheck, label: "DPR pending", value: "0" },
            { icon: Package, label: "Open POs", value: "0" },
            { icon: Calculator, label: "Estimates", value: "—" },
          ].map((s) => (
            <Card key={s.label} className="surface-card">
              <CardContent className="pt-6">
                <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <s.icon className="size-5 text-primary" />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground uppercase font-mono mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Coming in iteration 2</CardTitle>
            <CardDescription>
              Material Request workflow, DPR with photos + WhatsApp auto-report, geo-tagged uploads, and offline-first sync.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="hero">
              <Link to="/calculators/tiles">Open Calculators</Link>
            </Button>
          </CardContent>
        </Card>
      </PortalShell>
    </RoleGate>
  );
};

export default ContractorDashboard;
