import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";
import { toast } from "sonner";

const SubcontractorDashboard = () => {
  const punchIn = () => {
    if (!navigator.geolocation) return toast.error("Location not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => toast.success(`Punched at ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (demo — saves in iteration 2)`),
      () => toast.error("Location permission required for GPS attendance"),
    );
  };

  return (
    <RoleGate allow={["subcontractor"]}>
      <PortalShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subcontractor Dashboard</h1>
          <p className="text-muted-foreground">Worker hazri aur task logs.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="surface-card">
            <CardHeader>
              <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                <MapPin className="size-6 text-primary" />
              </div>
              <CardTitle>GPS Attendance</CardTitle>
              <CardDescription>Site par hi punch-in hoga (geo-fence iteration 2 mein).</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={punchIn} variant="hero" className="w-full">Punch In Now (Demo)</Button>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                <Users className="size-6 text-primary" />
              </div>
              <CardTitle>Today's Workers</CardTitle>
              <CardDescription>Aaj ki team list.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0 / 0</div>
              <p className="text-sm text-muted-foreground mt-2">Worker registry comes in iteration 2.</p>
            </CardContent>
          </Card>
        </div>
      </PortalShell>
    </RoleGate>
  );
};

export default SubcontractorDashboard;
