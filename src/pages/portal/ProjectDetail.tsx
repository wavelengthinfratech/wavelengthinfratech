import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Building2, Sofa, MapPin, IndianRupee, Calendar, Upload, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [stageEdit, setStageEdit] = useState<{ id: string; progress: number; notes: string; status: string } | null>(null);
  const [roomDialog, setRoomDialog] = useState(false);
  const [roomForm, setRoomForm] = useState({ room_name: "", length_ft: "", height_ft: "", width_ft: "", doors: "0", windows: "0", notes: "" });

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").eq("id", id!).maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["project_stages", id],
    queryFn: async () => {
      const { data } = await supabase.from("project_stages").select("*").eq("project_id", id!).order("sort_order");
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["project_rooms", id],
    queryFn: async () => {
      const { data } = await supabase.from("project_rooms").select("*").eq("project_id", id!).order("created_at");
      return data ?? [];
    },
    enabled: !!id,
  });

  const updateStage = useMutation({
    mutationFn: async () => {
      if (!stageEdit) return;
      const updates: any = {
        progress: stageEdit.progress,
        notes: stageEdit.notes,
        status: stageEdit.status,
      };
      if (stageEdit.progress === 100 && stageEdit.status !== "done") {
        updates.status = "done";
        updates.completed_at = new Date().toISOString();
      }
      const { error } = await supabase.from("project_stages").update(updates).eq("id", stageEdit.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stage updated");
      qc.invalidateQueries({ queryKey: ["project_stages", id] });
      setStageEdit(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const uploadPhoto = async (stageId: string, file: File) => {
    const path = `${id}/${stageId}-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("project-photos").upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from("project-photos").getPublicUrl(path);
    await supabase.from("project_stages").update({ photo_url: pub.publicUrl }).eq("id", stageId);
    qc.invalidateQueries({ queryKey: ["project_stages", id] });
    toast.success("Photo uploaded");
  };

  const addRoom = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("project_rooms").insert({
        project_id: id,
        room_name: roomForm.room_name,
        length_ft: roomForm.length_ft ? Number(roomForm.length_ft) : null,
        height_ft: roomForm.height_ft ? Number(roomForm.height_ft) : null,
        width_ft: roomForm.width_ft ? Number(roomForm.width_ft) : null,
        doors: Number(roomForm.doors) || 0,
        windows: Number(roomForm.windows) || 0,
        notes: roomForm.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Room added");
      qc.invalidateQueries({ queryKey: ["project_rooms", id] });
      setRoomDialog(false);
      setRoomForm({ room_name: "", length_ft: "", height_ft: "", width_ft: "", doors: "0", windows: "0", notes: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteRoom = async (rid: string) => {
    await supabase.from("project_rooms").delete().eq("id", rid);
    qc.invalidateQueries({ queryKey: ["project_rooms", id] });
  };

  if (!project) {
    return (
      <RoleGate allow={["super_admin", "construction_head", "interior_head", "field_manager", "site_supervisor", "viewer"]}>
        <PortalShell><p className="text-muted-foreground">Loading project...</p></PortalShell>
      </RoleGate>
    );
  }

  const isInterior = project.type === "interior";
  const overallProgress = stages.length ? Math.round(stages.reduce((s: number, st: any) => s + (st.progress || 0), 0) / stages.length) : 0;

  return (
    <RoleGate allow={["super_admin", "construction_head", "interior_head", "field_manager", "site_supervisor", "viewer"]}>
      <PortalShell>
        <Link to="/portal/admin/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Back to projects
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isInterior ? <Sofa className="size-5 text-secondary" /> : <Building2 className="size-5 text-primary" />}
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant="outline" className="capitalize">{project.type}</Badge>
              <Badge>{project.status}</Badge>
            </div>
            {project.client_name && <p className="text-muted-foreground">{project.client_name}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-3 mb-6 text-sm">
          <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />Location</div><div className="font-medium">{project.location || project.address || "—"}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><IndianRupee className="size-3" />Budget</div><div className="font-medium">{project.budget ? `₹${(project.budget / 100000).toFixed(1)}L` : "—"}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Area</div><div className="font-medium">{project.area_sqft ? `${project.area_sqft} sqft` : "—"}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" />Timeline</div><div className="font-medium text-xs">{project.start_date || "—"} → {project.end_date || "—"}</div></CardContent></Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Stages</CardTitle>
              <div className="text-sm text-muted-foreground">Overall: <span className="font-bold text-foreground">{overallProgress}%</span></div>
            </div>
            <Progress value={overallProgress} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            {stages.map((s: any) => (
              <div key={s.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {s.status === "done" ? <CheckCircle2 className="size-5 text-[hsl(var(--success))]" /> : <Circle className="size-5 text-muted-foreground" />}
                    <div className="font-medium">{s.name}</div>
                    <Badge variant="outline" className="capitalize text-xs">{s.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{s.progress}%</span>
                    <Button size="sm" variant="outline" onClick={() => setStageEdit({ id: s.id, progress: s.progress, notes: s.notes || "", status: s.status })}>Update</Button>
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(s.id, e.target.files[0])} />
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-muted"><Upload className="size-3.5" />Photo</span>
                    </label>
                  </div>
                </div>
                <Progress value={s.progress} className="mt-2 h-1.5" />
                {s.notes && <p className="text-xs text-muted-foreground mt-2">{s.notes}</p>}
                {s.photo_url && <img src={s.photo_url} alt={s.name} className="mt-3 rounded-md max-h-48 object-cover" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {isInterior && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Room Measurements</CardTitle>
                <Dialog open={roomDialog} onOpenChange={setRoomDialog}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="size-4 mr-1" />Add Room</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Room Name *</Label><Input value={roomForm.room_name} onChange={(e) => setRoomForm({ ...roomForm, room_name: e.target.value })} placeholder="Master Bedroom" /></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div><Label>Length (ft)</Label><Input type="number" value={roomForm.length_ft} onChange={(e) => setRoomForm({ ...roomForm, length_ft: e.target.value })} /></div>
                        <div><Label>Width (ft)</Label><Input type="number" value={roomForm.width_ft} onChange={(e) => setRoomForm({ ...roomForm, width_ft: e.target.value })} /></div>
                        <div><Label>Height (ft)</Label><Input type="number" value={roomForm.height_ft} onChange={(e) => setRoomForm({ ...roomForm, height_ft: e.target.value })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Doors</Label><Input type="number" value={roomForm.doors} onChange={(e) => setRoomForm({ ...roomForm, doors: e.target.value })} /></div>
                        <div><Label>Windows</Label><Input type="number" value={roomForm.windows} onChange={(e) => setRoomForm({ ...roomForm, windows: e.target.value })} /></div>
                      </div>
                      <div><Label>Notes</Label><Textarea value={roomForm.notes} onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => addRoom.mutate()} disabled={!roomForm.room_name}>Add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? <p className="text-sm text-muted-foreground">No rooms added yet.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Room</TableHead><TableHead>L × W × H (ft)</TableHead>
                    <TableHead>Wall Area</TableHead><TableHead>Doors</TableHead><TableHead>Windows</TableHead>
                    <TableHead>Notes</TableHead><TableHead></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {rooms.map((r: any) => {
                      const wallArea = r.length_ft && r.width_ft && r.height_ft ? (2 * (Number(r.length_ft) + Number(r.width_ft)) * Number(r.height_ft)).toFixed(0) : "—";
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.room_name}</TableCell>
                          <TableCell>{r.length_ft ?? "—"} × {r.width_ft ?? "—"} × {r.height_ft ?? "—"}</TableCell>
                          <TableCell>{wallArea} sqft</TableCell>
                          <TableCell>{r.doors}</TableCell>
                          <TableCell>{r.windows}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.notes ?? "—"}</TableCell>
                          <TableCell><Button variant="ghost" size="sm" onClick={() => deleteRoom(r.id)}><Trash2 className="size-3.5" /></Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stage edit dialog */}
        <Dialog open={!!stageEdit} onOpenChange={(o) => !o && setStageEdit(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Update Stage</DialogTitle></DialogHeader>
            {stageEdit && (
              <div className="space-y-4">
                <div>
                  <Label>Progress: {stageEdit.progress}%</Label>
                  <Slider value={[stageEdit.progress]} max={100} step={5} onValueChange={(v) => setStageEdit({ ...stageEdit, progress: v[0] })} className="mt-2" />
                </div>
                <div>
                  <Label>Status</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={stageEdit.status} onChange={(e) => setStageEdit({ ...stageEdit, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div><Label>Notes</Label><Textarea value={stageEdit.notes} onChange={(e) => setStageEdit({ ...stageEdit, notes: e.target.value })} /></div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => updateStage.mutate()} disabled={updateStage.isPending}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PortalShell>
    </RoleGate>
  );
};

export default ProjectDetail;
