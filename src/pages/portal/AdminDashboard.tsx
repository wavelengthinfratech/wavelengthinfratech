import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IndianRupee, Users as UsersIcon, Building2, Activity, ArrowRight } from "lucide-react";

const AdminDashboard = () => {
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [pricing, users, projects, audit] = await Promise.all([
        supabase.from("pricing_items").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("pricing_audit_log").select("*").order("changed_at", { ascending: false }).limit(5),
      ]);
      return {
        pricing: pricing.count ?? 0,
        users: users.count ?? 0,
        projects: projects.count ?? 0,
        audit: audit.data ?? [],
      };
    },
  });

  return (
    <RoleGate allow={["super_admin"]}>
      <PortalShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Yahan se aap pure system ko control karte hain.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: IndianRupee, label: "Pricing Items", value: counts?.pricing ?? "—", to: "/portal/admin/pricing" },
            { icon: UsersIcon, label: "Users", value: counts?.users ?? "—", to: "/portal/admin/users" },
            { icon: Building2, label: "Projects", value: counts?.projects ?? "—", to: "/portal/admin/projects" },
            { icon: Activity, label: "P&L (Demo)", value: "+₹4.2L", to: "#" },
          ].map((s) => (
            <Card key={s.label} className="surface-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <s.icon className="size-5 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground uppercase font-mono mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle>Pricing Master</CardTitle>
              <CardDescription>Update rates → poore MP &amp; Dholera ke estimates auto-update.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="hero">
                <Link to="/portal/admin/pricing">Open Pricing Master <ArrowRight className="size-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle>Recent rate changes</CardTitle>
              <CardDescription>Audit log — har rate change traceable hai.</CardDescription>
            </CardHeader>
            <CardContent>
              {counts?.audit.length === 0 ? (
                <p className="text-sm text-muted-foreground">No changes yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {counts?.audit.map((a) => (
                    <li key={a.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                      <span className="font-medium">{a.item_name}</span>
                      <span className="text-muted-foreground font-mono">
                        {a.old_rate ? `₹${a.old_rate} → ` : ""}₹{a.new_rate}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </PortalShell>
    </RoleGate>
  );
};

export default AdminDashboard;
