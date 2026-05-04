import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Wallet } from "lucide-react";

const LabourDashboard = () => {
  return (
    <RoleGate allow={["viewer"]}>
      <PortalShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Apni hazri aur payment status check karein.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="surface-card">
            <CardHeader>
              <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                <Calendar className="size-6 text-primary" />
              </div>
              <CardTitle>This month's hazri</CardTitle>
              <CardDescription>Days present this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">0 <span className="text-base text-muted-foreground font-normal">/ 30 days</span></div>
              <p className="text-sm text-muted-foreground mt-2">Attendance tracking comes in iteration 2.</p>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                <Wallet className="size-6 text-primary" />
              </div>
              <CardTitle>Payment status</CardTitle>
              <CardDescription>Pending wages and last payout.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[hsl(var(--success))]">₹0</div>
              <p className="text-sm text-muted-foreground mt-2">Auto-payroll comes in iteration 2.</p>
            </CardContent>
          </Card>
        </div>
      </PortalShell>
    </RoleGate>
  );
};

export default LabourDashboard;
