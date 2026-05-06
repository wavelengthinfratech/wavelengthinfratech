import { useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Save, Trash2, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { downloadPdf, BRAND_HEADER, PDF_STYLES } from "@/lib/exportPdf";

interface Item {
  id: string;
  category_id: string;
  name: string;
  unit: string;
  rate: number;
  vendor: string | null;
  notes: string | null;
  updated_at: string;
}

const PricingMaster = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [newItem, setNewItem] = useState({ category_id: "", name: "", unit: "sqft", rate: 0, vendor: "" });

  const { data: categories = [] } = useQuery({
    queryKey: ["pricing_categories"],
    queryFn: async () => {
      const { data } = await supabase.from("pricing_categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["pricing_items"],
    queryFn: async () => {
      const { data } = await supabase.from("pricing_items").select("*").order("name");
      return (data ?? []) as Item[];
    },
  });

  const { data: audit = [] } = useQuery({
    queryKey: ["pricing_audit_recent"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase.from("pricing_audit_log").select("item_id, old_rate, new_rate, changed_at").gte("changed_at", since);
      return data ?? [];
    },
  });

  const changeMap = new Map<string, number>();
  for (const a of audit as any[]) {
    if (!a.old_rate || a.old_rate === 0) continue;
    const pct = Math.abs((a.new_rate - a.old_rate) / a.old_rate) * 100;
    const prev = changeMap.get(a.item_id) ?? 0;
    if (pct > prev) changeMap.set(a.item_id, pct);
  }


  const updateRate = useMutation({
    mutationFn: async ({ id, rate }: { id: string; rate: number }) => {
      const { error } = await supabase.from("pricing_items").update({ rate }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success("Rate updated");
      setDrafts((d) => {
        const n = { ...d };
        delete n[vars.id];
        return n;
      });
      qc.invalidateQueries({ queryKey: ["pricing_items"] });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item deleted");
      qc.invalidateQueries({ queryKey: ["pricing_items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addItem = useMutation({
    mutationFn: async () => {
      if (!newItem.category_id || !newItem.name) throw new Error("Category and name required");
      const { error } = await supabase.from("pricing_items").insert({
        category_id: newItem.category_id,
        name: newItem.name,
        unit: newItem.unit,
        rate: newItem.rate,
        vendor: newItem.vendor || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item added");
      setNewItem({ category_id: "", name: "", unit: "sqft", rate: 0, vendor: "" });
      qc.invalidateQueries({ queryKey: ["pricing_items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = items.filter((i) => {
    if (filterCat !== "all" && i.category_id !== filterCat) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportRateCard = () => {
    const cats: Record<string, { name: string; rows: Item[] }> = {};
    for (const c of categories as any[]) cats[c.id] = { name: c.name, rows: [] };
    for (const it of filtered) if (cats[it.category_id]) cats[it.category_id].rows.push(it);
    const content: any[] = [BRAND_HEADER(`Rate Card • ${new Date().toLocaleDateString("en-IN")}`)];
    for (const c of Object.values(cats)) {
      if (!c.rows.length) continue;
      content.push({ text: c.name, fontSize: 13, bold: true, margin: [0, 10, 0, 4], color: "#1a237e" });
      content.push({ table: { widths: ["*", 60, 80, "*"], body: [
        [{ text: "Item", style: "th" }, { text: "Unit", style: "th" }, { text: "Rate (₹)", style: "th", alignment: "right" }, { text: "Vendor", style: "th" }],
        ...c.rows.map((r) => [
          { text: r.name, style: "td" }, { text: r.unit, style: "td" },
          { text: "₹ " + Number(r.rate).toLocaleString("en-IN"), style: "td", alignment: "right" },
          { text: r.vendor || "—", style: "td" },
        ]),
      ] } });
    }
    content.push({ text: "\nRates are indicative and may vary based on market and quantity.", fontSize: 9, italics: true, color: "#666", margin: [0, 16, 0, 0] });
    downloadPdf({ content, styles: PDF_STYLES, defaultStyle: { fontSize: 10 } }, `wavelength-rate-card-${new Date().toISOString().slice(0, 10)}.pdf`);
  };


  return (
    <RoleGate allow={["super_admin", "material_manager", "accounts_manager"]}>
      <PortalShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pricing Master</h1>
          <p className="text-muted-foreground">
            Aap yahan rate update karenge — har calculator aur estimate use latest rate fetch karega.
          </p>
        </div>

        <Card className="surface-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Add new item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-5 gap-3">
              <Select value={newItem.category_id} onValueChange={(v) => setNewItem({ ...newItem, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <Input placeholder="Unit (sqft/kg/day…)" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} />
              <Input type="number" placeholder="Rate ₹" value={newItem.rate || ""} onChange={(e) => setNewItem({ ...newItem, rate: Number(e.target.value) })} />
              <Button onClick={() => addItem.mutate()} disabled={addItem.isPending}><Plus className="size-4" /> Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <div>
                <CardTitle>All items ({filtered.length})</CardTitle>
                <CardDescription>Inline edit. Save → audit log mein record ho jayega.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={filterCat} onValueChange={setFilterCat}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-mono uppercase text-muted-foreground">
                    <th className="py-2 pr-4">Item</th>
                    <th className="py-2 pr-4">Unit</th>
                    <th className="py-2 pr-4">Vendor</th>
                    <th className="py-2 pr-4">Rate (₹)</th>
                    <th className="py-2 pr-4 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it) => {
                    const draftVal = drafts[it.id];
                    const dirty = draftVal !== undefined && draftVal !== it.rate;
                    return (
                      <tr key={it.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-4 font-medium">{it.name}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{it.unit}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{it.vendor ?? "—"}</td>
                        <td className="py-2 pr-4">
                          <Input
                            type="number"
                            value={draftVal ?? it.rate}
                            onChange={(e) => setDrafts({ ...drafts, [it.id]: Number(e.target.value) })}
                            className="h-9 w-28"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-1">
                            {dirty && (
                              <Button size="sm" variant="hero" onClick={() => updateRate.mutate({ id: it.id, rate: draftVal })}>
                                <Save className="size-3.5" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${it.name}?`)) deleteItem.mutate(it.id); }}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No items match your filters.</p>}
            </div>
          </CardContent>
        </Card>
      </PortalShell>
    </RoleGate>
  );
};

export default PricingMaster;
