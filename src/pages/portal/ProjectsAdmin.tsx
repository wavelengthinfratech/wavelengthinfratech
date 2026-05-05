import { useState } from "react";
import { Link } from "react-router-dom";
import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MapPin, Plus, Building2, Sofa, Calendar, IndianRupee } from "lucide-react";
import { toast } from "sonner";

const CONSTRUCTION_STAGES = ["Planning", "Foundation", "Structure", "Plaster", "Flooring", "Finishing", "Handover"];
const INTERIOR_STAGES = ["Measurement", "Concept", "Design", "Approval", "Execution", "Handover"];

type ProjectType = "construction" | "interior";

const ProjectsAdmin = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ProjectType>("construction");
  const [form, setForm] = useState({
    name: "", client_name: "", address: "", location: "",
    area_sqft: "", budget: "", start_date: "", end_date: "",
    assigned_thekedar: "", assigned_supervisor: "",
    property_type: "", style_preference: "", timeline_weeks: "",
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name,
        type,
        client_name: form.client_name || null,
        address: form.address || null,
        location: form.location || null,
        area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
        budget: form.budget ? Number(form.budget) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: "active",
      };
      if (type === "construction") {
        payload.assigned_thekedar = form.assigned_thekedar || null;
        payload.assigned_supervisor = form.assigned_supervisor || null;
      } else {
        payload.property_type = form.property_type || null;
        payload.style_preference = form.style_preference || null;
        payload.timeline_weeks = form.timeline_weeks ? Number(form.timeline_weeks) : null;
      }
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) throw error;

      // Auto-create default stages
      const stages = (type === "construction" ? CONSTRUCTION_STAGES : INTERIOR_STAGES).map((name, i) => ({
        project_id: data.id, name, sort_order: i, status: "pending", progress: 0,
      }));
      await supabase.from("project_stages").insert(stages);
      return data;
    },
    onSuccess: () => {
      toast.success("Project created");
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setForm({
        name: "", client_name: "", address: "", location: "",
        area_sqft: "", budget: "", start_date: "", end_date: "",
        assigned_thekedar: "", assigned_supervisor: "",
        property_type: "", style_preference: "", timeline_weeks: "",
      });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const renderGrid = (filter: ProjectType | "all") => {
    const list = filter === "all" ? projects : projects.filter((p: any) => (p.type ?? "construction") === filter);
    if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
    if (!list.length) return <p className="text-muted-foreground py-8 text-center">No projects yet.</p>;
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p: any) => (
          <Link to={`/portal/admin/projects/${p.id}`} key={p.id} className="block">
            <Card className="surface-card hover:border-primary/40 transition-colors h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {p.type === "interior" ? <Sofa className="size-4 text-secondary" /> : <Building2 className="size-4 text-primary" />}
                    {p.name}
                  </CardTitle>
                  <span className={`text-xs font-mono uppercase ${p.status === "active" ? "text-[hsl(var(--success))]" : "text-secondary"}`}>● {p.status}</span>
                </div>
                <CardDescription className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {p.location || p.address || "—"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {p.client_name && <div className="text-sm">{p.client_name}</div>}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><IndianRupee className="size-3" />{p.budget ? `${(p.budget / 100000).toFixed(1)}L` : "—"}</span>
                  {p.area_sqft && <span>{p.area_sqft} sqft</span>}
                  {p.start_date && <span className="flex items-center gap-1"><Calendar className="size-3" />{p.start_date}</span>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <RoleGate allow={["super_admin", "construction_head", "interior_head", "field_manager"]}>
      <PortalShell>
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-1">Projects</h1>
            <p className="text-muted-foreground text-sm">Construction & Interior projects with stage tracking and room measurements.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="size-4 mr-1" /> New Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="interior">Interior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Project Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Client Name</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
                </div>
                <div><Label>Site Address</Label><Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Location / Village</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                  <div><Label>Area (sqft)</Label><Input type="number" value={form.area_sqft} onChange={(e) => setForm({ ...form, area_sqft: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Budget (₹)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
                  <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                  <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
                </div>
                {type === "construction" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Assigned Thekedar</Label><Input value={form.assigned_thekedar} onChange={(e) => setForm({ ...form, assigned_thekedar: e.target.value })} /></div>
                    <div><Label>Site Supervisor</Label><Input value={form.assigned_supervisor} onChange={(e) => setForm({ ...form, assigned_supervisor: e.target.value })} /></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Property Type</Label><Input placeholder="2BHK / Villa..." value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} /></div>
                    <div><Label>Style</Label><Input placeholder="Modern / Classic..." value={form.style_preference} onChange={(e) => setForm({ ...form, style_preference: e.target.value })} /></div>
                    <div><Label>Timeline (weeks)</Label><Input type="number" value={form.timeline_weeks} onChange={(e) => setForm({ ...form, timeline_weeks: e.target.value })} /></div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
            <TabsTrigger value="construction"><Building2 className="size-3.5 mr-1" />Construction</TabsTrigger>
            <TabsTrigger value="interior"><Sofa className="size-3.5 mr-1" />Interior</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">{renderGrid("all")}</TabsContent>
          <TabsContent value="construction" className="mt-4">{renderGrid("construction")}</TabsContent>
          <TabsContent value="interior" className="mt-4">{renderGrid("interior")}</TabsContent>
        </Tabs>
      </PortalShell>
    </RoleGate>
  );
};

export default ProjectsAdmin;
