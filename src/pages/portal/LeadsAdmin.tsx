import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, ArrowLeft, Search } from "lucide-react";
import { cleanMobile, fuzzyMapHeaders, normalizeLeadType, LEAD_STATUSES, STATUS_COLOR } from "@/lib/leadHelpers";
import { Link } from "react-router-dom";

interface Telecaller { user_id: string; full_name: string | null }

const LeadsAdmin = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [assignTo, setAssignTo] = useState<string>("__none__");
  const [dedupe, setDedupe] = useState<"skip" | "keep">("skip");
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: telecallers = [] } = useQuery<Telecaller[]>({
    queryKey: ["telecallers"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").in("role", ["telecaller", "telecaller_manager"]);
      const ids = (roles ?? []).map((r: any) => r.user_id);
      if (!ids.length) return [];
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      return (profs ?? []).map((p: any) => ({ user_id: p.id, full_name: p.full_name }));
    },
  });

  const { data: leads = [], refetch } = useQuery({
    queryKey: ["leads-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
      return data ?? [];
    },
  });

  const onDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
      if (!json.length) return toast.error("Empty file");
      const hdrs = Object.keys(json[0]);
      setHeaders(hdrs);
      setMapping(fuzzyMapHeaders(hdrs));
      setRows(json);
      toast.success(`${json.length} rows loaded`);
    };
    reader.readAsArrayBuffer(file);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "text/csv": [".csv"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] } });

  const doImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    try {
      const existing = new Set((leads as any[]).map((l) => l.mobile_no));
      const payload: any[] = [];
      let skipped = 0;
      for (const r of rows) {
        const item: any = { source: "CSV_IMPORT", lead_status: "NEW" };
        for (const [src, dst] of Object.entries(mapping)) {
          if (!dst) continue;
          item[dst] = r[src]?.toString().trim();
        }
        if (!item.mobile_no || !item.name) continue;
        item.mobile_no = cleanMobile(item.mobile_no);
        if (item.mobile_no.length < 10) continue;
        item.lead_type = normalizeLeadType(item.lead_type || "");
        if (assignTo !== "__none__") item.assigned_to = assignTo;
        if (dedupe === "skip" && existing.has(item.mobile_no)) { skipped++; continue; }
        existing.add(item.mobile_no);
        payload.push(item);
      }
      if (!payload.length) { toast.error("No valid rows to import"); return; }
      // batched insert
      const chunks: any[][] = [];
      for (let i = 0; i < payload.length; i += 200) chunks.push(payload.slice(i, i + 200));
      let inserted = 0;
      for (const c of chunks) {
        const { error } = await supabase.from("leads").insert(c);
        if (error) throw error;
        inserted += c.length;
      }
      toast.success(`Imported ${inserted}, skipped ${skipped}`);
      setRows([]); setHeaders([]); setMapping({});
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setImporting(false); }
  };

  const filtered = (leads as any[]).filter((l) => {
    if (filterStatus !== "all" && l.lead_status !== filterStatus) return false;
    if (search && !`${l.name} ${l.mobile_no} ${l.village_address ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const FIELD_OPTIONS = [
    "", "timestamp_text", "lead_type", "mobile_no", "name", "village_address",
    "construction_area", "experience", "remark", "location_area",
  ];

  return (
    <RoleGate allow={["super_admin", "construction_head", "interior_head", "telecaller_manager"]}>
      <PortalShell>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground">CSV/Excel upload, assign to telecallers</p>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="size-4" /> Back</Button>
        </div>

        {!rows.length ? (
          <Card className="surface-card mb-6">
            <CardHeader><CardTitle>Upload CSV / Excel</CardTitle></CardHeader>
            <CardContent>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${isDragActive ? "border-primary bg-primary/5" : "border-border"}`}>
                <input {...getInputProps()} />
                <Upload className="size-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Drag & drop CSV or .xlsx here</p>
                <p className="text-sm text-muted-foreground">Columns auto-detected (fuzzy match)</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="surface-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="size-5" /> Map columns ({rows.length} rows)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                {headers.map((h) => (
                  <div key={h}>
                    <label className="text-xs text-muted-foreground">{h}</label>
                    <Select value={mapping[h] || ""} onValueChange={(v) => setMapping({ ...mapping, [h]: v })}>
                      <SelectTrigger><SelectValue placeholder="-- skip --" /></SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map((f) => <SelectItem key={f || "__skip"} value={f || "__skip__"}>{f || "-- skip --"}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Assign all to</label>
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">-- unassigned --</SelectItem>
                      {telecallers.map((t) => <SelectItem key={t.user_id} value={t.user_id}>{t.full_name || t.user_id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Duplicate mobile</label>
                  <Select value={dedupe} onValueChange={(v: any) => setDedupe(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="keep">Keep all</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-muted">{headers.map((h) => <th key={h} className="p-2 text-left">{h} {mapping[h] && mapping[h] !== "__skip__" && <Badge variant="secondary" className="ml-1">{mapping[h]}</Badge>}</th>)}</tr></thead>
                  <tbody>{rows.slice(0, 10).map((r, i) => <tr key={i} className="border-t">{headers.map((h) => <td key={h} className="p-2">{String(r[h] ?? "")}</td>)}</tr>)}</tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Button onClick={doImport} disabled={importing}>{importing ? "Importing…" : `Import ${rows.length} leads`}</Button>
                <Button variant="ghost" onClick={() => { setRows([]); setHeaders([]); setMapping({}); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="surface-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <CardTitle>All leads ({filtered.length})</CardTitle>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                <thead><tr className="border-b text-left text-xs font-mono uppercase text-muted-foreground"><th className="p-2">Name</th><th className="p-2">Mobile</th><th className="p-2">Type</th><th className="p-2">Village</th><th className="p-2">Status</th><th className="p-2">Assigned</th><th className="p-2"></th></tr></thead>
                <tbody>
                  {filtered.map((l: any) => {
                    const tc = telecallers.find((t) => t.user_id === l.assigned_to);
                    return (
                      <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2 font-medium">{l.name}</td>
                        <td className="p-2"><a href={`tel:${l.mobile_no}`} className="text-primary">{l.mobile_no}</a></td>
                        <td className="p-2"><Badge variant="outline">{l.lead_type}</Badge></td>
                        <td className="p-2 text-muted-foreground">{l.village_address || "—"}</td>
                        <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOR[l.lead_status] || ""}`}>{l.lead_status}</span></td>
                        <td className="p-2 text-muted-foreground">{tc?.full_name || "—"}</td>
                        <td className="p-2"><Link to={`/portal/leads/${l.id}`} className="text-primary text-xs">Open →</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No leads.</p>}
            </div>
          </CardContent>
        </Card>
      </PortalShell>
    </RoleGate>
  );
};

export default LeadsAdmin;
