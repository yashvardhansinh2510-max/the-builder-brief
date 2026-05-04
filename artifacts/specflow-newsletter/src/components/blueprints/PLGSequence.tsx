import React from "react";

export interface PLGSequenceData {
  loops: Array<{
    trigger: string;
    ahaMoment: string;
    viralMechanic: string;
  }>;
}

export default function PLGSequence({ data }: { data: PLGSequenceData }): React.JSX.Element {
  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Product-Led Growth Loops</h2>
      <div className="space-y-6">
        {/* Array index is safe here: loops are server-defined, order-stable, and never reordered in the UI */}
        {data.loops.map((loop, idx) => (
          <div key={`loop-${idx}`} className="border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Growth Loop {idx + 1}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Trigger</p>
                <p className="text-sm">{loop.trigger}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Aha Moment</p>
                <p className="text-sm">{loop.ahaMoment}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Viral Mechanism</p>
                <p className="text-sm">{loop.viralMechanic}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
