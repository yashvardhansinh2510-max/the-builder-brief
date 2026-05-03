import React from "react";

export interface ComplianceTimelineData {
  items: Array<{
    requirement: string;
    timeline: string;
    effortLevel: "Low" | "Medium" | "High";
    whyMatters: string;
  }>;
}

export default function ComplianceTimeline({ data }: { data: ComplianceTimelineData }): React.JSX.Element {
  const effortColor = (effortLevel: string) => {
    switch (effortLevel) {
      case "Low": return "bg-green-50 border-green-200";
      case "Medium": return "bg-yellow-50 border-yellow-200";
      case "High": return "bg-red-50 border-red-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Compliance Roadmap</h2>
      <div className="space-y-4">
        {data.items.map((item) => (
          <div key={item.requirement} className={`p-4 rounded-lg border-l-4 border-l-blue-500 ${effortColor(item.effortLevel)}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.requirement}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.whyMatters}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{item.timeline}</p>
                <p className="text-xs bg-white px-2 py-1 rounded mt-1 text-muted-foreground">
                  {item.effortLevel} effort
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
