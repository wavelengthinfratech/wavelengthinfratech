import { useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Download, Activity } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/leadHelpers";

const TelecallerManager = () => {
  const qc = useQueryClient();
  const [bulkTo, setBulkTo] = useState("");
  const [bulkStatus, setBulkStatus] = useState("NEW");

  const { data: telecallers = [] } = useQuery({
    queryKey: ["telecallers-mgr"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "telecaller");
      const ids = (roles ?? []).map((r: any) => r.user_id);
      if (!ids.length) return [];
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      return (profs ?? []).map((p: any) => ({ user_id: p.id, full_name: p.full_name }));
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["all-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("id, assigned_to, lead_status").limit(2000);
      return data ?? [];
    },
  });
  const { data: callsToday = [] } = useQuery({
    queryKey: ["calls-today"],
    queryFn: async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const { data } = await supabase.from("lead_calls").select("caller_id").gte("created_at", start.toISOString());
      return data ?? [];
    },
  });
  const { data: targets = [] } = useQuery({
    queryKey: ["targets-today"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("daily_targets").select("*").eq("target_date", today);
      return data ?? [];
    },
  });
  const { data: feed = [] } = useQuery({
    queryKey: ["activity"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const stats = useMemo(() => telecallers.map((t: any) => {
    const myLeads = (leads as any[]).filter((l) => l.assigned_to === t.user_id);
    const tgt = (targets as any[]).find((x) => x.user_id === t.user_id)?.target_calls ?? 30;
    const done = (callsToday as any[]).filter((c) => c.caller_id === t.user_id).length;
    const interested = myLeads.filter((l) => l.lead_status === "INTERESTED").length;
    const won = myLeads.filter((l) => l.lead_status === "WON").length;
    return { ...t, tgt, done, interested, won, total: myLeads.length };
  }), [telecallers, leads, targets, callsToday]);

  const setTarget = useMutation({
    mutationFn: async ({ user_id, target_calls }: { user_id: string; target_calls: number }) => {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("daily_targets").upsert({ user_id, target_date: today, target_calls }, { onConflict: "user_id,target_date" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Target updated"); qc.invalidateQueries({ queryKey: ["targets-today"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const bulkAssign = useMutation({
    mutationFn: async () => {
      if (!bulkTo) throw new Error("Pick a telecaller");
      const { error, count } = await supabase.from("leads").update({ assigned_to: bulkTo }, { count: "exact" }).eq("lead_status", bulkStatus).is("assigned_to", null);
      if (error) throw error;
      return count ?? 0;
    },
    onSuccess: (n) => { toast.success(`Assigned ${n} leads`); qc.invalidateQueries({ queryKey: ["all-leads"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(stats.map((s: any) => ({
      Telecaller: s.full_name, Target: s.tgt, Done: s.done, Interested: s.interested, Won: s.won, "Total Leads": s.total,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Performance");
    XLSX.writeFile(wb, `telecaller-performance-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <RoleGate allow={["super_admin", "telecaller_manager"]}>
      <PortalShell>
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Telecaller Manager</h1>
          <Button onClick={exportExcel} variant="outline"><Download className="size-4" /> Export Excel</Button>
        </div>

        <Card className="surface-card mb-6">
          <CardHeader><CardTitle>Performance — Today</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs font-mono uppercase text-muted-foreground"><th className="p-2">Telecaller</th><th className="p-2">Target</th><th className="p-2">Done</th><th className="p-2">Interested</th><th className="p-2">Won</th><th className="p-2">Total Leads</th></tr></thead>
              <tbody>
                {stats.map((s: any) => (
                  <tr key={s.user_id} className="border-b border-border/50">
                    <td className="p-2 font-medium">{s.full_name}</td>
                    <td className="p-2">
                      <Input type="number" defaultValue={s.tgt} className="h-8 w-20" onBlur={(e) => { const v = +e.target.value; if (v !== s.tgt) setTarget.mutate({ user_id: s.user_id, target_calls: v }); }} />
                    </td>
                    <td className="p-2 font-bold text-primary">{s.done}</td>
                    <td className="p-2"><Badge variant="secondary">{s.interested}</Badge></td>
                    <td className="p-2"><Badge className="bg-green-600">{s.won}</Badge></td>
                    <td className="p-2">{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="surface-card">
            <CardHeader><CardTitle>Bulk assign unassigned leads</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={bulkTo} onValueChange={setBulkTo}>
                <SelectTrigger><SelectValue placeholder="Assign to telecaller…" /></SelectTrigger>
                <SelectContent>{telecallers.map((t: any) => <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={() => bulkAssign.mutate()} disabled={bulkAssign.isPending}>Assign</Button>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="size-4" /> Live activity (30s polling)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
                {(feed as any[]).map((f) => (
                  <div key={f.id} className="border-l-2 border-primary pl-3 py-1">
                    <div className="font-medium">{f.detail}</div>
                    <div className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleString()}</div>
                  </div>
                ))}
                {feed.length === 0 && <p className="text-muted-foreground">No activity yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </PortalShell>
    </RoleGate>
  );
};

export default TelecallerManager;
