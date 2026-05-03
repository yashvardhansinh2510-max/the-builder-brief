import { useState } from "react";
import { Card } from "@/components/ui/card";

export interface UnitEconomicsData {
  unitPrice: number;
  cogs: number;
  grossMarginPercent: number;
  cac: number;
  ltv: number;
  paybackMonths: number;
  assumptions?: string;
}

export default function UnitEconomicsCalculator({ data }: { data: UnitEconomicsData }): JSX.Element {
  const [price, setPrice] = useState(data.unitPrice);
  const [cogs, setCogs] = useState(data.cogs);
  const [cac, setCac] = useState(data.cac);

  const grossMargin = ((price - cogs) / price) * 100;
  const paybackMonths = cac > 0 ? Math.ceil(cac / ((price - cogs) * 5)) : 0;

  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Unit Economics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Unit Price: ${price.toFixed(0)}
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              COGS: ${cogs.toFixed(0)}
            </label>
            <input
              type="range"
              min="0"
              max={price * 0.8}
              value={cogs}
              onChange={(e) => setCogs(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              CAC: ${cac.toFixed(0)}
            </label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={cac}
              onChange={(e) => setCac(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Gross Margin</p>
            <p className="text-3xl font-bold">{grossMargin.toFixed(1)}%</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Payback Period</p>
            <p className="text-3xl font-bold">{paybackMonths} months</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">LTV (12-month)</p>
            <p className="text-3xl font-bold">${(price * 12).toFixed(0)}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
            <p className="text-3xl font-bold">{((price * 12) / (cac || 1)).toFixed(1)}:1</p>
          </Card>
        </div>
      </div>

      {data.assumptions && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground"><strong>Assumptions:</strong> {data.assumptions}</p>
        </div>
      )}
    </section>
  );
}
