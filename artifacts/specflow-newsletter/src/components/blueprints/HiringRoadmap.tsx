import React from "react";

const AGENTS = [
  {
    name: "Growth Intelligence Agent",
    description:
      "Monitors competitor moves, detects market signals, surfaces 3 opportunities/week.",
    deployVia:
      "SpecFlow Blueprints feed + Perplexity API + custom prompt layer.",
    humanEquivalent: "Head of Market Research",
  },
  {
    name: "Revenue Operations Agent",
    description:
      "Tracks your pipeline, sends follow-up sequences, flags churn signals.",
    deployVia: "CRM webhook + OpenAI + your outreach stack.",
    humanEquivalent: "Revenue Ops / Sales Enablement hire",
  },
  {
    name: "Content & Distribution Agent",
    description:
      "Turns your weekly insight into 5 distribution formats — newsletter, tweet thread, LinkedIn post, short video script, cold email.",
    deployVia: "Builder Brief + your distribution stack.",
    humanEquivalent: "Content Manager",
  },
];

export default function HiringRoadmap(): React.JSX.Element {
  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-2">Your First Agent Stack</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Before you hire a human, deploy these three agents. Each replaces a
        function that would otherwise cost you $8–15k/month.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AGENTS.map((agent) => (
          <div
            key={agent.name}
            className="border border-border rounded-lg p-6 bg-muted/30"
          >
            <h3 className="text-lg font-semibold">{agent.name}</h3>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  What it does
                </p>
                <p className="text-sm mt-1">{agent.description}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Deploy via
                </p>
                <p className="text-sm mt-1">{agent.deployVia}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Human equivalent replaced
                </p>
                <p className="text-sm mt-1 font-medium">{agent.humanEquivalent}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
        <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
          When to make your first human hire
        </p>
        <p className="text-sm">
          Hire your first human when agent output needs judgment you can't
          prompt-engineer. That's usually around $15–20k MRR. Until then, ship
          with agents.
        </p>
      </div>
    </section>
  );
}
