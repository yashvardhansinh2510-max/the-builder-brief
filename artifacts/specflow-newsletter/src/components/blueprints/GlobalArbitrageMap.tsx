import React from "react";

export interface GlobalArbitrageData {
  regions: Array<{
    region: string;
    demandScore: number;
    regulatoryEase: number;
    entryStrategy: string;
  }>;
}

export default function GlobalArbitrageMap({ data }: { data: GlobalArbitrageData }): React.JSX.Element {
  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Global Arbitrage Opportunities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.regions.map((region) => (
          <div key={region.region} className="p-6 border border-border rounded-lg">
            <h3 className="font-semibold text-lg mb-4">{region.region}</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Unmet Demand</span>
                  <span className="font-semibold">{region.demandScore}/10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(region.demandScore / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Regulatory Ease</span>
                  <span className="font-semibold">{region.regulatoryEase}/10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(region.regulatoryEase / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-xs font-medium text-muted-foreground uppercase">Entry Strategy</p>
              <p className="text-sm mt-2">{region.entryStrategy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
