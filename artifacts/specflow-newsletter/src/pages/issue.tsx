import { useRoute, Link } from "wouter";
import { useState } from "react";
import {
  ArrowLeft, Target, Compass, Zap, Code2, Server,
  TrendingDown, TrendingUp, Clock, DollarSign, Users2,
  Copy, Check, Share2, CheckCircle2, BarChart3, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PortalNav from "@/components/PortalNav";
import Footer from "@/components/Footer";
import { issues } from "@/lib/data";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import logoPath from "@assets/logo.jpg";
import ArchitectureDiagram from "@/components/blueprints/ArchitectureDiagram";
import ComplianceTimeline from "@/components/blueprints/ComplianceTimeline";
import HiringRoadmap from "@/components/blueprints/HiringRoadmap";
import GlobalArbitrageMap from "@/components/blueprints/GlobalArbitrageMap";
import PLGSequence from "@/components/blueprints/PLGSequence";
import ExitDashboard from "@/components/blueprints/ExitDashboard";
import UnitEconomicsCalculator from "@/components/blueprints/UnitEconomicsCalculator";
import TractioinProofSection from "@/components/blueprints/TractioinProofSection";
import { TierGate } from "@/components/TierGate";
import { InvestorMatches } from "@/components/InvestorMatches";

export default function IssuePage() {
  const [, params] = useRoute("/issue/:slug");
  const issue = issues.find((i) => i.slug === params?.slug);
  const [copied, setCopied] = useState(false);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);

  if (!issue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <h1 className="font-serif text-5xl text-foreground mb-4">Blueprint Not Found</h1>
          <p className="text-muted-foreground mb-8">This startup idea might have been moved or archived.</p>
          <Button asChild>
            <Link href="/archive">Return to Archive</Link>
          </Button>
        </div>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  const techStack = issue.techStack || [];
  const monetization = issue.monetization || [];
  const graphData = issue.graphData || [];
  const graphTitle = issue.graphTitle || "Market Growth Trend";
  const revenueMilestones = issue.revenueMilestones || [];
  const unitEconomics = issue.unitEconomicsExpanded ?? null;
  const risks = issue.risks || [];
  const growthLoops = issue.growthLoops || [];
  const competitors = issue.competitors || [];
  const marketingStrategy = issue.marketingStrategy || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="blueprints" />

      {/* Header */}
      <header className="pt-24 pb-10 px-4 sm:px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <Link
              href="/blueprints"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Execution Hub
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-sans text-[10px] px-3 py-1 rounded-lg text-muted-foreground uppercase tracking-wider">
                Vault #{issue.number}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 rounded-lg text-muted-foreground hover:text-foreground border-border"
                onClick={copyLink}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Share"}
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mb-8">
            <div className="flex items-center gap-3 mb-5">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
                {issue.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Revenue in {issue.revenueIn}
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight tracking-tight mb-5">
              {issue.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-light">
              {issue.tagline}
            </p>
          </div>

          {/* Key metrics bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
            <div className="bg-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Market Size</p>
              <p className="font-sans text-xl font-bold">{issue.tam}</p>
            </div>
            <div className="bg-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Difficulty</p>
              <p className="font-sans text-xl font-bold">
                {issue.difficulty === "Extreme" ? "⚠ Extreme" : issue.difficulty || "Medium"}
              </p>
            </div>
            <div className="bg-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Capital Needed</p>
              <p className="font-sans text-xl font-bold text-primary">{issue.capital || "Bootstrap"}</p>
            </div>
            <div className="bg-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Dev Time</p>
              <p className="font-sans text-xl font-bold">{issue.devTime || "Weeks"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-14 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-14">

            {/* The Problem */}
            <section>
              <h2 className="font-serif text-3xl mb-5 flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" /> The Friction
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{issue.problem}</p>
            </section>

            {/* Why Now */}
            <section>
              <h2 className="font-serif text-3xl mb-5 flex items-center gap-3">
                <Compass className="w-5 h-5 text-primary" /> Why Now?
              </h2>
              <div className="bg-card border border-border rounded-2xl p-7">
                <ul className="space-y-5">
                  {issue.whyNow.map((reason, idx) => (
                    <li key={idx} className="flex gap-4">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Market Trend Graph */}
            {graphData.length > 0 && (
              <section className="bg-card border border-border rounded-2xl p-7">
                <h3 className="font-serif text-2xl mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> {graphTitle}
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--primary))" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Blueprint steps */}
            <section>
              <h2 className="font-serif text-3xl mb-5 flex items-center gap-3">
                <Code2 className="w-5 h-5 text-primary" /> The Blueprint
              </h2>
              <div className="space-y-3">
                {issue.blueprint.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-5 bg-card rounded-xl border border-border">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-serif text-base font-bold shrink-0 text-primary">
                      {idx + 1}
                    </div>
                    <p className="text-foreground leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Prompts */}
            <section className="bg-foreground text-background rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -mr-28 -mt-28 pointer-events-none" />
              <h2 className="font-serif text-3xl mb-7 flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" /> AI Execution Prompts
              </h2>
              <div className="space-y-4 relative z-10">
                {issue.prompts.map((prompt, idx) => (
                  <div key={idx} className="bg-white/10 rounded-xl p-5 border border-white/10 group">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-sans text-sm leading-relaxed text-white/90">{prompt}</p>
                      <button
                        onClick={() => copyPrompt(prompt, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg shrink-0"
                      >
                        {copiedPromptIdx === idx
                          ? <Check className="w-4 h-4 text-primary" />
                          : <Copy className="w-4 h-4 text-white/70" />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Revenue Milestones */}
            {revenueMilestones.length > 0 && (
              <section>
                <h2 className="font-serif text-3xl mb-5 flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" /> The Path to $1,000,000
                </h2>
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="grid grid-cols-12 bg-muted/50 border-b border-border text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <div className="col-span-3 p-4 border-r border-border">ARR Target</div>
                    <div className="col-span-4 p-4 border-r border-border">Milestone</div>
                    <div className="col-span-5 p-4">Focus</div>
                  </div>
                  {revenueMilestones.map((ms, idx) => (
                    <div key={idx} className="grid grid-cols-12 border-b border-border last:border-0 text-sm">
                      <div className="col-span-3 p-4 border-r border-border font-sans font-bold text-primary flex items-center">{ms.target}</div>
                      <div className="col-span-4 p-4 border-r border-border text-foreground font-medium flex items-center">{ms.milestone}</div>
                      <div className="col-span-5 p-4 text-muted-foreground flex items-center">{ms.focus}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Risk Analysis */}
            {risks.length > 0 && (
              <section>
                <h2 className="font-serif text-3xl mb-6 flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-destructive" /> Risk Analysis
                </h2>
                <div className="space-y-4">
                  {risks.map((risk, idx) => (
                    <div key={idx} className="bg-card p-6 rounded-2xl border border-border relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-2xl" />
                      <div className="pl-4">
                        <Badge variant="outline" className="mb-3 border-border text-muted-foreground">{risk.type} Risk</Badge>
                        <h4 className="font-sans font-bold text-lg mb-3 text-foreground">{risk.description}</h4>
                        <div className="bg-muted/50 p-4 rounded-xl border border-border">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">Mitigation</span>
                          <p className="text-sm text-foreground leading-relaxed">{risk.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Growth Loops */}
            {growthLoops.length > 0 && (
              <section>
                <h2 className="font-serif text-3xl mb-5 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" /> Product-Led Growth Loops
                </h2>
                <ul className="space-y-3">
                  {growthLoops.map((loop, idx) => (
                    <li key={idx} className="flex gap-4 items-start p-5 bg-card rounded-xl border border-border">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed text-foreground">{loop}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Architecture Diagram */}
            {issue.architecture && (
              <ArchitectureDiagram
                mermaidCode={issue.architecture.mermaidCode}
                description={issue.architecture.description}
              />
            )}

            {/* Unit Economics Calculator */}
            {issue.unitEconomicsExpanded && (
              <TierGate requiredTier="pro">
                <UnitEconomicsCalculator
                  data={{
                    unitPrice: parseFloat(issue.unitEconomicsExpanded.price.replace(/[^0-9.]/g, "")) || 199,
                    cogs: parseFloat(issue.unitEconomicsExpanded.cogs.replace(/[^0-9.]/g, "")) || 8,
                    cac: parseFloat(issue.unitEconomicsExpanded.cac.replace(/[^0-9.]/g, "")) || 400,
                    assumptions: `Price: ${issue.unitEconomicsExpanded.price} | COGS: ${issue.unitEconomicsExpanded.cogs} | Payback: ${issue.unitEconomicsExpanded.paybackPeriod}`,
                  }}
                />
              </TierGate>
            )}

            {/* Traction Proof */}
            {issue.traction?.status === "added" && (
              <TractioinProofSection traction={issue.traction} />
            )}

            {/* PLG Sequence */}
            {issue.plgLoops && issue.plgLoops.length > 0 && (
              <TierGate requiredTier="pro">
                <PLGSequence data={{ loops: issue.plgLoops }} />
              </TierGate>
            )}

            {/* Compliance Timeline */}
            {issue.complianceRoadmap && issue.complianceRoadmap.length > 0 && (
              <TierGate requiredTier="max">
                <ComplianceTimeline data={{ items: issue.complianceRoadmap }} />
              </TierGate>
            )}

            {/* Agent Stack */}
            <TierGate requiredTier="max">
              <HiringRoadmap />
            </TierGate>

            {/* Global Arbitrage Map */}
            {issue.globalArbitrage && issue.globalArbitrage.length > 0 && (
              <TierGate requiredTier="max">
                <GlobalArbitrageMap data={{ regions: issue.globalArbitrage }} />
              </TierGate>
            )}

            {/* Exit Dashboard */}
            {issue.exitStrategy && (
              <TierGate requiredTier="max">
                <ExitDashboard data={issue.exitStrategy} />
              </TierGate>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* GTM */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-serif text-xl mb-5 flex items-center gap-2">
                <Users2 className="w-4 h-4 text-primary" /> Go-To-Market
              </h3>
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 tracking-widest">First Revenue</span>
                  <p className="text-sm text-foreground leading-relaxed">{issue.firstRevenue}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 tracking-widest">First 10 Customers</span>
                  <p className="text-sm text-foreground leading-relaxed">{issue.firstTen}</p>
                </div>
              </div>
            </div>

            {/* Unit Economics */}
            {unitEconomics && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl mb-5 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" /> Unit Economics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Target CAC", value: unitEconomics.cac },
                    { label: "Expected LTV", value: unitEconomics.ltv },
                    { label: "Gross Margin", value: unitEconomics.grossMarginPercent },
                    { label: "Payback Period", value: unitEconomics.paybackPeriod },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/40 p-3 rounded-xl border border-border">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1 tracking-wider">{label}</span>
                      <span className="font-sans font-bold text-foreground text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitors */}
            {competitors.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl mb-5">Competitor Weaknesses</h3>
                <div className="space-y-4">
                  {competitors.map((comp, idx) => (
                    <div key={idx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                      <h4 className="font-sans font-bold mb-1 text-muted-foreground line-through text-sm">{comp.name}</h4>
                      <p className="text-sm text-foreground leading-relaxed">{comp.weakness}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monetization */}
            {monetization.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl mb-5">Monetization</h3>
                <div className="space-y-3">
                  {monetization.map((tier, idx) => (
                    <div key={idx} className="bg-muted/40 p-4 rounded-xl border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-foreground">{tier.tier}</span>
                        <span className="font-sans font-bold text-primary text-sm">{tier.price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marketing Strategy */}
            {marketingStrategy.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl mb-5">Growth Hooks</h3>
                <div className="space-y-4">
                  {marketingStrategy.map((strat, idx) => (
                    <div key={idx} className="bg-muted/40 p-4 rounded-xl border border-border">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary block mb-2">{strat.platform}</span>
                      <p className="text-sm font-bold text-foreground mb-2">{strat.action}</p>
                      <p className="text-xs font-sans text-muted-foreground bg-background p-2.5 rounded-lg border border-border">
                        "{strat.hook}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {techStack.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl mb-5 flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" /> Tech Stack
                </h3>
                <div className="space-y-3">
                  {techStack.map((tech, idx) => (
                    <div key={idx} className="p-4 border border-border rounded-xl bg-muted/30">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary block mb-1">{tech.category}</span>
                      <h4 className="font-sans font-bold text-sm mb-1 text-foreground">{tech.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tech.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investor Matching */}
            <InvestorMatches />
          </div>
        </div>
      </main>

      <Footer variant="public" />
    </div>
  );
}
