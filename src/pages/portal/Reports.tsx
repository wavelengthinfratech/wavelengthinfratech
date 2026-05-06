import { useMemo } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { LEAD_STATUSES } from "@/lib/leadHelpers";

const COLORS = ["#1a237e", "#ff6f00", "#00838f", "#6a1b9a", "#2e7d32", "#c62828", "#ef6c00", "#5d4037"];

const Reports = () => {
  const { data: leads = [] } = useQuery({
    queryKey: ["reports-leads"],
    queryFn: async () => (await supabase.from("leads").select("*").limit(5000)).data ?? [],
  });
  const { data: calls = [] } = useQuery({
    queryKey: ["reports-calls"],
    queryFn: async () => (await supabase.from("lead_calls").select("caller_id, created_at").limit(5000)).data ?? [],
  });
  const { data: telecallers = [] } = useQuery({
    queryKey: ["reports-telecallers"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "telecaller");
      const ids = (roles ?? []).map((r: any) => r.user_id);
      if (!ids.length) return [];
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      return (profs ?? []).map((p: any) => ({ id: p.id, name: p.full_name }));
    },
  });

  const funnel = useMemo(() =>
    LEAD_STATUSES.map((s) => ({ name: s, value: (leads as any[]).filter((l) => l.lead_status === s).length })),
  [leads]);

  const villages = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads as any[]) {
      const v = (l.village_address || "Unknown").trim();
      counts[v] = (counts[v] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 12);
  }, [leads]);

  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads as any[]) counts[l.lead_type] = (counts[l.lead_type] ?? 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const trend = useMemo(() => {
    const now = new Date();
    const days: { name: string; leads: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = (leads as any[]).filter((l) => l.created_at.startsWith(key)).length;
      days.push({ name: key.slice(5), leads: count });
    }
    return days;
  }, [leads]);

  const teleCompare = useMemo(() => telecallers.map((t: any) => ({
    name: t.name,
    calls: (calls as any[]).filter((c) => c.caller_id === t.id).length,
  })), [telecallers, calls]);

  const exportAll = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(funnel), "Funnel");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(villages), "Villages");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(types), "Types");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trend), "Trend");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teleCompare), "Telecallers");
    XLSX.writeFile(wb, `wavelength-reports-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <RoleGate allow={["super_admin", "construction_head", "interior_head", "telecaller_manager", "viewer"]}>
      <PortalShell>
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <Button onClick={exportAll} variant="outline"><Download className="size-4" /> Export Excel</Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="surface-card">
            <CardHeader><CardTitle>Lead Funnel</CardTitle></CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer><BarChart data={funnel}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-30} textAnchor="end" height={70} fontSize={10} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#1a237e" /></BarChart></ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader><CardTitle>Top Villages</CardTitle></CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer><BarChart data={villages}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-30} textAnchor="end" height={70} fontSize={10} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#ff6f00" /></BarChart></ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader><CardTitle>Lead Types</CardTitle></CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer><PieChart><Pie data={types} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>{types.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader><CardTitle>Telecaller Calls</CardTitle></CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer><BarChart data={teleCompare}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="calls" fill="#2e7d32" /></BarChart></ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="surface-card lg:col-span-2">
            <CardHeader><CardTitle>Lead Trend (last 14 days)</CardTitle></CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="leads" stroke="#1a237e" strokeWidth={2} /></LineChart></ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </PortalShell>
    </RoleGate>
  );
};

export default Reports;
