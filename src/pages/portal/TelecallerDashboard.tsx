import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Search } from "lucide-react";
import { LEAD_STATUSES, STATUS_COLOR } from "@/lib/leadHelpers";

const TelecallerDashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: leads = [] } = useQuery({
    queryKey: ["my-leads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").eq("assigned_to", user!.id).order("next_followup_date", { ascending: true, nullsFirst: false });
      return data ?? [];
    },
  });

  const { data: target } = useQuery({
    queryKey: ["target", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("daily_targets").select("*").eq("user_id", user!.id).eq("target_date", today).maybeSingle();
      return data;
    },
  });

  const { data: todayCalls = 0 } = useQuery({
    queryKey: ["today-calls", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const { count } = await supabase.from("lead_calls").select("id", { count: "exact", head: true }).eq("caller_id", user!.id).gte("created_at", start.toISOString());
      return count ?? 0;
    },
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads as any[]) c[l.lead_status] = (c[l.lead_status] ?? 0) + 1;
    const now = Date.now();
    const today = new Date(); today.setHours(23, 59, 59, 999);
    let pending = 0, overdue = 0;
    for (const l of leads as any[]) {
      if (!l.next_followup_date) continue;
      const t = new Date(l.next_followup_date).getTime();
      if (t < now) overdue++;
      else if (t <= today.getTime()) pending++;
    }
    return { byStatus: c, pending, overdue };
  }, [leads]);

  const filtered = (leads as any[]).filter((l) => {
    if (filter !== "all" && l.lead_status !== filter) return false;
    if (search && !`${l.name} ${l.mobile_no} ${l.village_address ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tgt = target?.target_calls ?? 30;

  return (
    <RoleGate allow={["telecaller", "telecaller_manager", "super_admin"]}>
      <PortalShell>
        <h1 className="text-3xl font-bold mb-6">My Leads</h1>

        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card className="surface-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Today's Target</div><div className="text-2xl font-bold">{todayCalls} / {tgt}</div></CardContent></Card>
          <Card className="surface-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Total Leads</div><div className="text-2xl font-bold">{leads.length}</div></CardContent></Card>
          <Card className="surface-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Pending today</div><div className="text-2xl font-bold text-amber-600">{counts.pending}</div></CardContent></Card>
          <Card className="surface-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Overdue</div><div className="text-2xl font-bold text-red-600">{counts.overdue}</div></CardContent></Card>
        </div>

        <Card className="surface-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <CardTitle>Leads ({filtered.length})</CardTitle>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s} ({counts.byStatus[s] ?? 0})</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or mobile…" className="pl-9 w-56" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs font-mono uppercase text-muted-foreground"><th className="p-2">Name</th><th className="p-2">Mobile</th><th className="p-2">Village</th><th className="p-2">Type</th><th className="p-2">Status</th><th className="p-2">Followup</th><th></th></tr></thead>
                <tbody>
                  {filtered.map((l) => {
                    const fu = l.next_followup_date ? new Date(l.next_followup_date) : null;
                    const now = Date.now();
                    let cls = "";
                    if (fu) {
                      if (fu.getTime() < now) cls = "bg-red-500/5";
                      else if (fu.toDateString() === new Date().toDateString()) cls = "bg-amber-500/5";
                    }
                    return (
                      <tr key={l.id} className={`border-b border-border/50 ${cls}`}>
                        <td className="p-2 font-medium">{l.name}</td>
                        <td className="p-2"><a href={`tel:${l.mobile_no}`} className="text-primary inline-flex items-center gap-1"><Phone className="size-3" />{l.mobile_no}</a></td>
                        <td className="p-2 text-muted-foreground">{l.village_address || "—"}</td>
                        <td className="p-2"><Badge variant="outline" className="text-[10px]">{l.lead_type}</Badge></td>
                        <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOR[l.lead_status]}`}>{l.lead_status}</span></td>
                        <td className="p-2 text-xs">{fu ? fu.toLocaleString() : "—"}</td>
                        <td className="p-2"><Link to={`/portal/leads/${l.id}`} className="text-primary text-xs">Open →</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aapko abhi tak koi lead assign nahi hua hai.</p>}
            </div>
          </CardContent>
        </Card>
      </PortalShell>
    </RoleGate>
  );
};

export default TelecallerDashboard;
