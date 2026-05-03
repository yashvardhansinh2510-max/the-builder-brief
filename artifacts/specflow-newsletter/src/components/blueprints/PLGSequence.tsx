import React from "react";

export interface PLGSequenceData {
  loops: Array<{
    loop: string;
    trigger: string;
    aha: string;
    viral: string;
  }>;
}

export default function PLGSequence({ data }: { data: PLGSequenceData }): React.JSX.Element {
  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Product-Led Growth Loops</h2>
      <div className="space-y-6">
        {data.loops.map((loop) => (
          <div key={loop.loop} className="border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">{loop.loop}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Trigger</p>
                <p className="text-sm">{loop.trigger}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Aha Moment</p>
                <p className="text-sm">{loop.aha}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Viral Mechanism</p>
                <p className="text-sm">{loop.viral}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
