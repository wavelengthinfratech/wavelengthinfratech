import { useState } from "react";
import { CalculatorLayout } from "@/components/calc/CalculatorLayout";
import { usePricing } from "@/hooks/usePricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Row { tradeId: string; workers: number; days: number; }

const LabourCalculator = () => {
  const { data: trades = [] } = usePricing("Labour");
  const [rows, setRows] = useState<Row[]>([{ tradeId: "", workers: 1, days: 1 }]);

  const total = rows.reduce((sum, r) => {
    const t = trades.find((x) => x.id === r.tradeId);
    return sum + (t ? t.rate * r.workers * r.days : 0);
  }, 0);

  const update = (i: number, patch: Partial<Row>) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const add = () => setRows([...rows, { tradeId: "", workers: 1, days: 1 }]);

  return (
    <CalculatorLayout title="Labour Cost Calculator" subtitle="Trade × workers × days × live daily rate.">
      <Card className="surface-card">
        <CardHeader><CardTitle>Crew &amp; days</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rows.map((r, i) => {
              const trade = trades.find((t) => t.id === r.tradeId);
              const sub = trade ? trade.rate * r.workers * r.days : 0;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {i === 0 && <Label className="text-xs">Trade</Label>}
                    <Select value={r.tradeId} onValueChange={(v) => update(i, { tradeId: v })}>
                      <SelectTrigger><SelectValue placeholder="Pick trade" /></SelectTrigger>
                      <SelectContent>
                        {trades.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} — ₹{t.rate}/{t.unit}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <Label className="text-xs">Workers</Label>}
                    <Input type="number" value={r.workers} onChange={(e) => update(i, { workers: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <Label className="text-xs">Days</Label>}
                    <Input type="number" value={r.days} onChange={(e) => update(i, { days: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-2 text-right text-sm font-mono">
                    ₹{sub.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" onClick={() => remove(i)} disabled={rows.length === 1}>
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="glass" onClick={add} className="mt-4"><Plus className="size-4" /> Add row</Button>

          <div className="border-t border-border mt-6 pt-4 flex justify-between items-center">
            <span className="text-muted-foreground">Total labour cost</span>
            <span className="text-3xl font-bold text-gradient-primary">
              ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </CardContent>
      </Card>
    </CalculatorLayout>
  );
};

export default LabourCalculator;
