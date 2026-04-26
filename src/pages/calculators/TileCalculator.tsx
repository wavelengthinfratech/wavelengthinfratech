import { useState } from "react";
import { CalculatorLayout } from "@/components/calc/CalculatorLayout";
import { usePricing } from "@/hooks/usePricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TileCalculator = () => {
  const { data: tiles = [], isLoading } = usePricing("Tiles");
  const { data: labour = [] } = usePricing("Labour");
  const tileLayer = labour.find((l) => l.name.toLowerCase().includes("tile"));

  const [area, setArea] = useState(100);
  const [wastage, setWastage] = useState(10);
  const [tileId, setTileId] = useState<string>("");
  const [days, setDays] = useState(2);
  const [workers, setWorkers] = useState(2);

  const tile = tiles.find((t) => t.id === tileId) ?? tiles[0];
  const effectiveArea = area * (1 + wastage / 100);
  const tileCost = tile ? effectiveArea * tile.rate : 0;
  const labourCost = tileLayer ? days * workers * tileLayer.rate : 0;
  const total = tileCost + labourCost;

  return (
    <CalculatorLayout title="Tile Calculator" subtitle="Live tile rates × area + wastage + labour.">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="surface-card">
          <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tile</Label>
              <Select value={tileId || tile?.id} onValueChange={setTileId}>
                <SelectTrigger><SelectValue placeholder={isLoading ? "Loading…" : "Select tile"} /></SelectTrigger>
                <SelectContent>
                  {tiles.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — ₹{t.rate}/{t.unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Area (sqft)</Label>
              <Input type="number" value={area} onChange={(e) => setArea(Number(e.target.value))} />
            </div>
            <div>
              <Label>Wastage % (typical 10%)</Label>
              <Input type="number" value={wastage} onChange={(e) => setWastage(Number(e.target.value))} />
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
              <Row label="Effective area (with wastage)" value={`${effectiveArea.toFixed(0)} sqft`} />
              <Row label={`Tile (₹${tile?.rate ?? 0}/${tile?.unit ?? "sqft"})`} value={`₹${tileCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
              <Row label={`Labour — ${tileLayer?.name ?? "Tile Layer"} (₹${tileLayer?.rate ?? 0}/day)`} value={`₹${labourCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
              <div className="border-t border-border pt-3 mt-3">
                <Row label="Total estimate" value={`₹${total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} highlight />
              </div>
            </dl>
            <p className="text-xs text-muted-foreground mt-6">
              Rates fetched live from Pricing Master. When Admin updates ₹100 → ₹110, this estimate updates instantly.
            </p>
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

export default TileCalculator;
