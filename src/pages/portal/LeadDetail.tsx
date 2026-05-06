import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PortalShell } from "@/components/portal/PortalShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Send, Loader2, Calculator } from "lucide-react";
import { LEAD_STATUSES, CALL_RESULTS, STATUS_COLOR } from "@/lib/leadHelpers";
import { toast } from "sonner";

const LeadDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user, role } = useAuth();
  const [callResult, setCallResult] = useState("Answered");
  const [duration, setDuration] = useState<number>(2);
  const [notes, setNotes] = useState("");
  const [statusAfter, setStatusAfter] = useState("");
  const [followup, setFollowup] = useState("");
  const [waSent, setWaSent] = useState(false);
  const [waTpl, setWaTpl] = useState<string>("");

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").eq("id", id!).maybeSingle();
      return data;
    },
  });
  const { data: calls = [] } = useQuery({
    queryKey: ["lead-calls", id],
    queryFn: async () => {
      const { data } = await supabase.from("lead_calls").select("*").eq("lead_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: templates = [] } = useQuery({
    queryKey: ["wa-templates"],
    queryFn: async () => {
      const { data } = await supabase.from("whatsapp_templates").select("*");
      return data ?? [];
    },
  });

  useEffect(() => { if (lead?.lead_status) setStatusAfter(lead.lead_status); }, [lead?.lead_status]);

  const logCall = useMutation({
    mutationFn: async () => {
      if (!user || !lead) throw new Error("Not ready");
      const { error: ce } = await supabase.from("lead_calls").insert({
        lead_id: lead.id, caller_id: user.id, call_result: callResult,
        duration_minutes: duration, notes, status_after: statusAfter || null,
        next_followup_date: followup ? new Date(followup).toISOString() : null,
        whatsapp_sent: waSent, whatsapp_template: waSent ? waTpl : null,
      });
      if (ce) throw ce;
      const updates: any = {
        call_count: (lead.call_count ?? 0) + 1,
        last_call_date: new Date().toISOString(),
      };
      if (statusAfter) updates.lead_status = statusAfter;
      if (followup) updates.next_followup_date = new Date(followup).toISOString();
      if (waSent) {
        updates.whatsapp_sent = true; updates.whatsapp_template_used = waTpl;
        updates.whatsapp_sent_at = new Date().toISOString();
        updates.whatsapp_total_sent = (lead.whatsapp_total_sent ?? 0) + 1;
      }
      const { error: ue } = await supabase.from("leads").update(updates).eq("id", lead.id);
      if (ue) throw ue;
      await supabase.from("activity_log").insert({
        actor_id: user.id, actor_name: user.email,
        action: "logged_call", entity_type: "lead", entity_id: lead.id,
        detail: `${lead.name} — ${callResult}${statusAfter ? " → " + statusAfter : ""}`,
      });
    },
    onSuccess: () => {
      toast.success("Call logged");
      setNotes(""); setFollowup(""); setWaSent(false); setWaTpl("");
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["lead-calls", id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <PortalShell><Loader2 className="size-6 animate-spin" /></PortalShell>;
  if (!lead) return <PortalShell><p>Lead not found.</p></PortalShell>;

  const overdue = lead.next_followup_date && new Date(lead.next_followup_date) < new Date();

  return (
    <PortalShell>
      <Button variant="ghost" onClick={() => nav(-1)} className="mb-4"><ArrowLeft className="size-4" /> Back</Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="surface-card lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{lead.name}</CardTitle>
              <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOR[lead.lead_status] || ""}`}>{lead.lead_status}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <a href={`tel:${lead.mobile_no}`} className="flex items-center gap-2 text-primary text-lg font-semibold"><Phone className="size-4" /> {lead.mobile_no}</a>
            <div><span className="text-muted-foreground">Type: </span><Badge variant="outline">{lead.lead_type}</Badge></div>
            <div><span className="text-muted-foreground">Village: </span>{lead.village_address || "—"}</div>
            <div><span className="text-muted-foreground">Area (sqft): </span>{lead.construction_area || "—"}</div>
            <div><span className="text-muted-foreground">Location: </span>{lead.location_area || "—"}</div>
            <div><span className="text-muted-foreground">Remark: </span>{lead.remark || "—"}</div>
            <div><span className="text-muted-foreground">Calls: </span>{lead.call_count}</div>
            <div><span className="text-muted-foreground">Last call: </span>{lead.last_call_date ? new Date(lead.last_call_date).toLocaleString() : "—"}</div>
            <div className={overdue ? "text-red-600 font-medium" : ""}>
              <span className="text-muted-foreground">Next followup: </span>{lead.next_followup_date ? new Date(lead.next_followup_date).toLocaleString() : "—"}
              {overdue && " ⚠️ Overdue"}
            </div>
            <div><span className="text-muted-foreground">WhatsApp sent: </span>{lead.whatsapp_total_sent}</div>
            {lead.whatsapp_opted_out && <Badge variant="destructive">Opted out</Badge>}
            {lead.lead_type === "CONSTRUCTION_LEAD" && (
              <Link to={`/portal/leads/${lead.id}/estimate`}>
                <Button variant="outline" size="sm" className="mt-2 w-full"><Calculator className="size-4" /> Generate Estimation PDF</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="surface-card">
            <CardHeader><CardTitle>Log a call</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Result</label>
                  <Select value={callResult} onValueChange={setCallResult}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CALL_RESULTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Duration min (self-reported)</label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">New status</label>
                  <Select value={statusAfter} onValueChange={setStatusAfter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea placeholder="Notes / remarks (Hindi OK)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Next followup</label>
                  <Input type="datetime-local" value={followup} onChange={(e) => setFollowup(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={waSent} onChange={(e) => setWaSent(e.target.checked)} /> WhatsApp sent
                  </label>
                  {waSent && (
                    <Select value={waTpl} onValueChange={setWaTpl}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Template" /></SelectTrigger>
                      <SelectContent>{(templates as any[]).map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <Button onClick={() => logCall.mutate()} disabled={logCall.isPending}><Send className="size-4" /> Save call log</Button>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader><CardTitle>Call history ({calls.length})</CardTitle></CardHeader>
            <CardContent>
              {calls.length === 0 && <p className="text-sm text-muted-foreground">No calls logged yet.</p>}
              <div className="space-y-3">
                {(calls as any[]).map((c) => (
                  <div key={c.id} className="border-l-2 border-primary pl-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{c.call_result} • {c.duration_minutes}m</span>
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    {c.status_after && <div className="text-xs">→ {c.status_after}</div>}
                    {c.notes && <div className="text-muted-foreground">{c.notes}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
};

export default LeadDetail;
