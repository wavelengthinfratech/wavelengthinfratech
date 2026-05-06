import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PortalShell } from "@/components/portal/PortalShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { downloadPdf, BRAND_HEADER, PDF_STYLES } from "@/lib/exportPdf";

const EstimationPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const { data: lead } = useQuery({
    queryKey: ["estim-lead", id],
    queryFn: async () => (await supabase.from("leads").select("*").eq("id", id!).maybeSingle()).data,
  });
  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => (await supabase.from("app_settings").select("*")).data ?? [],
  });

  const get = (k: string, d: number) => Number((settings as any[]).find((s) => s.key === k)?.value ?? d);

  const [area, setArea] = useState("");
  const [type, setType] = useState<"RCC" | "LOAD_BEARING">("RCC");

  const numericArea = Number(area || lead?.estimated_area_sqft || lead?.construction_area || 0);
  const baseRate = type === "RCC" ? get("BASE_RATE_RCC", 1200) : get("BASE_RATE_LOAD_BEARING", 900);
  const civil = numericArea * baseRate;
  const labour = civil * (get("LABOUR_PCT", 30) / 100);
  const material = civil * 0.6;
  const overhead = (civil + labour + material) * (get("OVERHEAD_PCT", 10) / 100);
  const profit = (civil + labour + material + overhead) * (get("PROFIT_PCT", 15) / 100);
  const total = civil + labour + material + overhead + profit;

  const fmt = (n: number) => "₹ " + Math.round(n).toLocaleString("en-IN");

  const save = async () => {
    if (!user || !lead || !numericArea) { toast.error("Enter area"); return; }
    const { error } = await supabase.from("lead_estimations").insert({
      lead_id: lead.id, client_name: lead.name, area_sqft: numericArea,
      construction_type: type, civil_cost: civil, labour_cost: labour,
      material_cost: material, overhead_cost: overhead, profit_cost: profit,
      total_cost: total, valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      payload: { baseRate, settings: settings as any[] }, created_by: user.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Estimation saved");
  };

  const exportPdf = () => {
    if (!lead) return;
    const validUntil = new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-IN");
    downloadPdf({
      content: [
        BRAND_HEADER("Construction Cost Estimation"),
        { columns: [
          { text: [{ text: "Client: ", bold: true }, lead.name + "\n", { text: "Mobile: ", bold: true }, lead.mobile_no + "\n", { text: "Village: ", bold: true }, lead.village_address || "—"] },
          { text: [{ text: "Date: ", bold: true }, new Date().toLocaleDateString("en-IN") + "\n", { text: "Valid until: ", bold: true }, validUntil + "\n", { text: "Type: ", bold: true }, type] },
        ], margin: [0, 0, 0, 16] },
        { table: { widths: ["*", 100], body: [
          [{ text: "Item", style: "th" }, { text: "Amount (₹)", style: "th", alignment: "right" }],
          [{ text: `Civil work (${numericArea} sqft × ₹${baseRate})`, style: "td" }, { text: fmt(civil), style: "td", alignment: "right" }],
          [{ text: `Labour (${get("LABOUR_PCT", 30)}%)`, style: "td" }, { text: fmt(labour), style: "td", alignment: "right" }],
          [{ text: "Material (estimated)", style: "td" }, { text: fmt(material), style: "td", alignment: "right" }],
          [{ text: `Overhead (${get("OVERHEAD_PCT", 10)}%)`, style: "td" }, { text: fmt(overhead), style: "td", alignment: "right" }],
          [{ text: `Profit (${get("PROFIT_PCT", 15)}%)`, style: "td" }, { text: fmt(profit), style: "td", alignment: "right" }],
          [{ text: "TOTAL", style: "totalRow" }, { text: fmt(total), style: "totalRow", alignment: "right" }],
        ] } },
        { text: "\n\nThis is an indicative estimate. Final cost may vary based on site conditions, material brands and market rates.", fontSize: 9, italics: true, color: "#666" },
        { text: "\n\n______________________\nWavelength Infratech\n(Authorised Signatory)", margin: [0, 40, 0, 0] },
      ],
      styles: PDF_STYLES,
      defaultStyle: { fontSize: 10 },
    }, `Estimation-${lead.name.replace(/\s+/g, "_")}.pdf`);
  };

  if (!lead) return <PortalShell><Loader2 className="size-6 animate-spin" /></PortalShell>;

  return (
    <PortalShell>
      <Button variant="ghost" onClick={() => nav(-1)} className="mb-4"><ArrowLeft className="size-4" /> Back</Button>
      <h1 className="text-3xl font-bold mb-6">Construction Estimation — {lead.name}</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="surface-card">
          <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Construction area (sqft)</label>
              <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder={lead.construction_area || "e.g. 1500"} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Construction type</label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RCC">RCC (₹{get("BASE_RATE_RCC", 1200)}/sqft)</SelectItem>
                  <SelectItem value="LOAD_BEARING">Load Bearing (₹{get("BASE_RATE_LOAD_BEARING", 900)}/sqft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={save}>Save</Button>
              <Button onClick={exportPdf} variant="outline" disabled={!numericArea}><Download className="size-4" /> PDF</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader><CardTitle>Breakdown</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2">Civil work</td><td className="py-2 text-right">{fmt(civil)}</td></tr>
                <tr className="border-b"><td className="py-2">Labour ({get("LABOUR_PCT", 30)}%)</td><td className="py-2 text-right">{fmt(labour)}</td></tr>
                <tr className="border-b"><td className="py-2">Material</td><td className="py-2 text-right">{fmt(material)}</td></tr>
                <tr className="border-b"><td className="py-2">Overhead ({get("OVERHEAD_PCT", 10)}%)</td><td className="py-2 text-right">{fmt(overhead)}</td></tr>
                <tr className="border-b"><td className="py-2">Profit ({get("PROFIT_PCT", 15)}%)</td><td className="py-2 text-right">{fmt(profit)}</td></tr>
                <tr className="font-bold text-lg bg-amber-50"><td className="py-3 px-2">TOTAL</td><td className="py-3 px-2 text-right text-primary">{fmt(total)}</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
};

export default EstimationPage;
