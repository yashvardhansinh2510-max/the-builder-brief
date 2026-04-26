import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Zap } from "lucide-react";

interface FounderProfile {
  name: string;
  exits: number;
  revenueShipped: string;
  tenure: string;
  latestCompany: string;
  sector: string;
  credibilityTier: "shipped" | "scaling" | "exited";
}

const founderProfiles: FounderProfile[] = [
  {
    name: "Sarah Chen",
    exits: 2,
    revenueShipped: "$4.2M ARR",
    tenure: "18 months in network",
    latestCompany: "Velocity (YC S24)",
    sector: "B2B SaaS",
    credibilityTier: "scaling"
  },
  {
    name: "Marcus Webb",
    exits: 1,
    revenueShipped: "$850K lifetime",
    tenure: "12 months in network",
    latestCompany: "PipelineAI",
    sector: "Developer Tools",
    credibilityTier: "shipped"
  },
  {
    name: "Alex Rodriguez",
    exits: 3,
    revenueShipped: "$18M+ aggregate",
    tenure: "24 months in network",
    latestCompany: "Advisor role",
    sector: "Multi-sector",
    credibilityTier: "exited"
  },
  {
    name: "Jordan Liu",
    exits: 0,
    revenueShipped: "$28K MRR",
    tenure: "6 months in network",
    latestCompany: "ContentShift",
    sector: "AI Tooling",
    credibilityTier: "shipped"
  },
  {
    name: "Emma Patel",
    exits: 1,
    revenueShipped: "$2.1M ARR",
    tenure: "14 months in network",
    latestCompany: "MetricsOS (Series A)",
    sector: "Analytics",
    credibilityTier: "scaling"
  },
  {
    name: "David Kim",
    exits: 4,
    revenueShipped: "$35M+ aggregate",
    tenure: "22 months in network",
    latestCompany: "Board member, 2 active",
    sector: "SaaS / Fintech",
    credibilityTier: "exited"
  }
];

const credibilityConfig = {
  shipped: { icon: Zap, label: "Shipping", color: "bg-blue-500/10 text-blue-500" },
  scaling: { icon: TrendingUp, label: "Scaling", color: "bg-green-500/10 text-green-500" },
  exited: { icon: Award, label: "Exited", color: "bg-primary/10 text-primary" }
};

export function FounderSocialLayer() {
  return (
    <section>
      <div className="mb-12">
        <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">
          THE FOUNDER NETWORK
        </Badge>
        <h2 className="font-serif text-5xl tracking-tight">
          You&apos;re joining <span className="italic text-primary">500+ builders</span> who ship.
        </h2>
        <p className="text-muted-foreground font-sans text-xl mt-6 max-w-3xl font-light">
          Real founders with real exits. Real revenue shipped. Real momentum. You learn from people who have already solved the problem you&apos;re facing right now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {founderProfiles.map((founder) => {
          const tierConfig = credibilityConfig[founder.credibilityTier];
          const TierIcon = tierConfig.icon;

          return (
            <div
              key={founder.name}
              className="p-6 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all group"
            >
              {/* Credibility Tier Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${tierConfig.color}`}>
                  <TierIcon className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{tierConfig.label}</span>
                </div>
              </div>

              {/* Founder Name */}
              <h3 className="font-serif text-xl mb-1 group-hover:text-primary transition-colors">{founder.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                {founder.latestCompany} · {founder.sector}
              </p>

              {/* Metrics */}
              <div className="space-y-3 mb-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Exits</span>
                  <span className="font-serif text-lg text-foreground">{founder.exits}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Revenue Shipped</span>
                  <span className="font-serif text-lg text-foreground">{founder.revenueShipped}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">In Network</span>
                  <span className="font-serif text-lg text-foreground">{founder.tenure}</span>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full py-2 text-xs font-bold text-primary uppercase tracking-widest hover:underline">
                View Profile →
              </button>
            </div>
          );
        })}
      </div>

      {/* Directory CTA */}
      <div className="p-10 bg-primary/5 border border-primary/20 rounded-2xl text-center">
        <p className="text-muted-foreground font-sans mb-6">
          These are 6 of 500+ active founders in the network. Each with proven track record. Each shipping this month.
        </p>
        <button className="px-8 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-opacity">
          View Full Founder Directory
        </button>
      </div>
    </section>
  );
}
