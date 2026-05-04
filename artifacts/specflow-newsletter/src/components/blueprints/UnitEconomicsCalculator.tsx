import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

export interface UnitEconomicsData {
  unitPrice: number;
  cogs: number;
  cac: number;
  assumptions?: string;
}

export default function UnitEconomicsCalculator({ data }: { data: UnitEconomicsData }): JSX.Element {
  const [price, setPrice] = useState(data.unitPrice);
  const [cogs, setCogs] = useState(data.cogs);
  const [cac, setCac] = useState(data.cac);

  // Sync state when data prop changes
  useEffect(() => {
    setPrice(data.unitPrice);
    setCogs(data.cogs);
    setCac(data.cac);
  }, [data.unitPrice, data.cogs, data.cac]);

  // Financial calculations:
  // - Gross Margin: (Price - COGS) / Price * 100%
  // - Payback Period: CAC ÷ Monthly Contribution Margin (assumes 1 customer/month, or 1 unit sold)
  // - LTV (12-month): Price × 12 (simplified, no churn assumed)
  // - LTV:CAC Ratio: Annual revenue / CAC (12-month revenue per customer acquired)
  const grossMargin = price > 0 ? ((price - cogs) / price) * 100 : 0;
  // Payback = CAC ÷ Monthly Contribution Margin (assuming 1 customer/month generates revenue = price)
  const paybackMonths = cac > 0 && price > cogs ? Math.ceil(cac / (price - cogs)) : 0;

  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Unit Economics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="price-input" className="block text-sm font-medium mb-2">
              Unit Price: ${price.toFixed(0)}
            </label>
            <input
              id="price-input"
              aria-label="Unit price slider"
              type="range"
              min="10"
              max="1000"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="cogs-input" className="block text-sm font-medium mb-2">
              COGS: ${cogs.toFixed(0)}
            </label>
            <input
              id="cogs-input"
              aria-label="Cost of goods sold slider"
              type="range"
              min="0"
              max={price * 0.8}
              value={cogs}
              onChange={(e) => setCogs(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="cac-input" className="block text-sm font-medium mb-2">
              CAC: ${cac.toFixed(0)}
            </label>
            <input
              id="cac-input"
              aria-label="Customer acquisition cost slider"
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
