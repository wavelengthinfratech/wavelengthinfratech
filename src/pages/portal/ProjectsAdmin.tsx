import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const ProjectsAdmin = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at");
      return data ?? [];
    },
  });

  return (
    <RoleGate allow={["super_admin", "construction_head", "interior_head"]}>
      <PortalShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">All-site overview. Iteration 2: per-site live P&amp;L, DPR, attendance.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="surface-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <span className={`text-xs font-mono uppercase ${p.status === "active" ? "text-[hsl(var(--success))]" : "text-secondary"}`}>● {p.status}</span>
                </div>
                <CardDescription className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {p.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono uppercase text-muted-foreground">Budget</div>
                <div className="text-2xl font-bold">{p.budget ? `₹${(p.budget / 100000).toFixed(1)}L` : "—"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PortalShell>
    </RoleGate>
  );
};

export default ProjectsAdmin;
