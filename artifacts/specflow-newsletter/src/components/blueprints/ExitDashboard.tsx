import React from "react";

export interface ExitStrategyData {
  acquirers: string[];
  metricsNeeded: string[];
  timeline: string;
  valuationTarget: string;
}

export default function ExitDashboard({ data }: { data: ExitStrategyData }): React.JSX.Element {
  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Exit Strategy</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Potential Acquirers</h3>
            <div className="space-y-2">
              {data.acquirers.map((acquirer, idx) => (
                <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                  {acquirer}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Timeline</h3>
            <div className="p-4 border border-border rounded-lg bg-muted/30">
              <p className="text-sm">{data.timeline}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Valuation Target</h3>
            <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-900">{data.valuationTarget}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Key Metrics Needed</h3>
            <ul className="space-y-2">
              {data.metricsNeeded.map((metric, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  <span>{metric}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
