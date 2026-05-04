import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const MistriDashboard = () => {
  const [material, setMaterial] = useState("");
  const [qty, setQty] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!material || !qty) return;
    toast.success(`${qty} ${material} logged for today (demo — saves in iteration 2)`);
    setMaterial("");
    setQty("");
  };

  return (
    <RoleGate allow={["site_supervisor"]}>
      <PortalShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mistri Dashboard</h1>
          <p className="text-muted-foreground">Aaj ka material kharcha enter karein.</p>
        </div>

        <Card className="surface-card max-w-xl">
          <CardHeader>
            <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
              <Hammer className="size-6 text-primary" />
            </div>
            <CardTitle>Daily Material Log</CardTitle>
            <CardDescription>Example: "Cement, 5 bags".</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="m">Material</Label>
                <Input id="m" placeholder="e.g. OPC Cement" value={material} onChange={(e) => setMaterial(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="q">Quantity used today</Label>
                <Input id="q" placeholder="e.g. 5 bags" value={qty} onChange={(e) => setQty(e.target.value)} />
              </div>
              <Button type="submit" variant="hero" className="w-full">Save Log (Demo)</Button>
            </form>
          </CardContent>
        </Card>
      </PortalShell>
    </RoleGate>
  );
};

export default MistriDashboard;
