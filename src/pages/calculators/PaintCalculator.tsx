import { useState } from "react";
import { CalculatorLayout } from "@/components/calc/CalculatorLayout";
import { usePricing } from "@/hooks/usePricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PaintCalculator = () => {
  const { data: paints = [] } = usePricing("Paint");
  const { data: labour = [] } = usePricing("Labour");
  const painter = labour.find((l) => l.name.toLowerCase().includes("painter"));
  const primer = paints.find((p) => p.name.toLowerCase().includes("primer"));
  const topcoats = paints.filter((p) => !p.name.toLowerCase().includes("primer"));

  const [wallArea, setWallArea] = useState(1000);
  const [coats, setCoats] = useState(2);
  const [coverage, setCoverage] = useState(120); // sqft per litre
  const [paintId, setPaintId] = useState<string>("");
  const [days, setDays] = useState(3);
  const [workers, setWorkers] = useState(2);

  const paint = topcoats.find((p) => p.id === paintId) ?? topcoats[0];
  const litresTopcoat = (wallArea * coats) / coverage;
  const litresPrimer = wallArea / 150;
  const topcoatCost = paint ? litresTopcoat * paint.rate : 0;
  const primerCost = primer ? litresPrimer * primer.rate : 0;
  const labourCost = painter ? days * workers * painter.rate : 0;
  const total = topcoatCost + primerCost + labourCost;

  return (
    <CalculatorLayout title="Paint Calculator" subtitle="Wall area × coats ÷ coverage × live paint rate + primer + labour.">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="surface-card">
          <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Topcoat paint</Label>
              <Select value={paintId || paint?.id} onValueChange={setPaintId}>
                <SelectTrigger><SelectValue placeholder="Select paint" /></SelectTrigger>
                <SelectContent>
                  {topcoats.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.rate}/{p.unit}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Wall area (sqft)</Label>
              <Input type="number" value={wallArea} onChange={(e) => setWallArea(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Coats</Label>
                <Input type="number" value={coats} onChange={(e) => setCoats(Number(e.target.value))} />
              </div>
              <div>
                <Label>Coverage (sqft/L)</Label>
                <Input type="number" value={coverage} onChange={(e) => setCoverage(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Workers</Label>
                <Input type="number" value={workers} onChange={(e) => setWorkers(Number(e.target.value))} />
              </div>
              <div>
                <Label>Days</Label>
                <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader><CardTitle>Estimate</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <Row label={`Primer (${litresPrimer.toFixed(1)} L × ₹${primer?.rate ?? 0})`} value={`₹${primerCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
              <Row label={`Topcoat (${litresTopcoat.toFixed(1)} L × ₹${paint?.rate ?? 0})`} value={`₹${topcoatCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
              <Row label={`Labour — Painter (₹${painter?.rate ?? 0}/day)`} value={`₹${labourCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
              <div className="border-t border-border pt-3 mt-3">
                <Row label="Total estimate" value={`₹${total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} highlight />
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
};

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="flex justify-between">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className={highlight ? "text-2xl font-bold text-gradient-primary" : "font-medium"}>{value}</dd>
  </div>
);

export default PaintCalculator;
