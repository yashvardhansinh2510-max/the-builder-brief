import { useRoute, Link } from "wouter";
import { useState } from "react";
import {
  ArrowLeft, Target, Compass, Zap, Code2, Server,
  TrendingDown, TrendingUp, Clock, DollarSign, Users2,
  Copy, Check, Share2, CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/PublicNav";
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
  const unitEconomics = issue.unitEconomics;
  const risks = issue.risks || [];
  const growthLoops = issue.growthLoops || [];
  const competitors = issue.competitors || [];
  const marketingStrategy = issue.marketingStrategy || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <PublicNav />

      <header className="pt-24 pb-12 px-6 md:px-12 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <Link href="/blueprints" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Execution Hub
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-mono text-xs px-3 py-1 rounded-lg text-muted-foreground uppercase">
                Vault #{issue.number}
              </Badge>
              <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg text-muted-foreground hover:text-foreground" onClick={copyLink}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Share"}
              </Button>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                {issue.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Revenue in {issue.revenueIn}
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-8">
              {issue.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light max-w-4xl">
              {issue.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-border">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Market Size</p>
              <p className="font-mono text-2xl font-bold">{issue.tam}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Difficulty</p>
              <p className="font-mono text-xl font-bold">
                {issue.difficulty === "Extreme" ? "⚠️ Extreme" : issue.difficulty || "Medium"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Capital Needed</p>
              <p className="font-mono text-xl font-bold text-emerald-600">{issue.capital || "Bootstrap"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Dev Time</p>
              <p className="font-mono text-xl font-bold">{issue.devTime || "Weeks"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">

            {/* The Problem */}
            <section>
              <h2 className="font-serif text-3xl mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" /> The Friction
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{issue.problem}</p>
            </section>

            {/* Why Now */}
            <section>
              <h2 className="font-serif text-3xl mb-6 flex items-center gap-3">
                <Compass className="w-6 h-6 text-primary" /> Why Now?
              </h2>
              <div className="bg-card border border-border rounded-[2rem] p-8">
                <ul className="space-y-5">
                  {issue.whyNow.map((reason, idx) => (
                    <li key={idx} className="flex gap-4">
                      <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-foreground leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Market Trend Graph */}
            {graphData.length > 0 && (
              <section className="bg-card border border-border rounded-[2rem] p-8">
                <h3 className="font-serif text-2xl mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> {graphTitle}
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Blueprint */}
            <section>
              <h2 className="font-serif text-3xl mb-6 flex items-center gap-3">
                <Code2 className="w-6 h-6 text-primary" /> The Blueprint
              </h2>
              <div className="space-y-4">
                {issue.blueprint.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-5 bg-card rounded-2xl border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-serif text-lg font-bold shrink-0 text-primary">
                      {idx + 1}
                    </div>
                    <p className="text-foreground leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Prompts */}
            <section className="bg-primary text-primary-foreground rounded-[2rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 pointer-events-none" />
              <h2 className="font-serif text-3xl mb-8 flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-300" /> AI Execution Prompts
              </h2>
              <div className="space-y-5 relative z-10">
                {issue.prompts.map((prompt, idx) => (
                  <div key={idx} className="bg-black/20 rounded-2xl p-5 border border-white/10 group">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-mono text-sm leading-relaxed text-white/90">{prompt}</p>
                      <button
                        onClick={() => copyPrompt(prompt, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg shrink-0"
                      >
                        {copiedPromptIdx === idx
                          ? <Check className="w-4 h-4 text-green-400" />
                          : <Copy className="w-4 h-4 text-white" />
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
                <h2 className="font-serif text-3xl mb-6 flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-emerald-600" /> The Path to $1,000,000
                </h2>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="grid grid-cols-12 bg-muted/50 border-b border-border text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    <div className="col-span-3 p-4 border-r border-border">ARR Target</div>
                    <div className="col-span-4 p-4 border-r border-border">Milestone</div>
                    <div className="col-span-5 p-4">Focus</div>
                  </div>
                  {revenueMilestones.map((ms, idx) => (
                    <div key={idx} className="grid grid-cols-12 border-b border-border last:border-0 text-sm">
                      <div className="col-span-3 p-4 border-r border-border font-mono font-bold text-emerald-700 bg-emerald-50/30 flex items-center">{ms.target}</div>
                      <div className="col-span-4 p-4 border-r border-border text-foreground font-medium flex items-center">{ms.milestone}</div>
                      <div className="col-span-5 p-4 text-muted-foreground flex items-center">{ms.focus}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Risk Analysis */}
            {risks.length > 0 && (
              <section className="bg-red-50/50 dark:bg-red-950/20 rounded-[2rem] border border-red-100 dark:border-red-900 p-8">
                <h2 className="font-serif text-3xl mb-8 flex items-center gap-3 text-red-900 dark:text-red-400">
                  <TrendingDown className="w-6 h-6 text-red-600" /> Risk Analysis
                </h2>
                <div className="space-y-6">
                  {risks.map((risk, idx) => (
                    <div key={idx} className="bg-white dark:bg-card p-6 rounded-2xl border border-red-100 dark:border-red-900 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
                      <div className="pl-4">
                        <Badge variant="outline" className="mb-3 border-red-200 text-red-700 bg-red-50">{risk.type} Risk</Badge>
                        <h4 className="font-bold text-lg mb-3">{risk.description}</h4>
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 block mb-1">Mitigation</span>
                          <p className="text-sm text-emerald-900 leading-relaxed">{risk.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Growth Loops */}
            {growthLoops.length > 0 && (
              <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-[2rem] border border-purple-100 dark:border-purple-900 p-8">
                <h2 className="font-serif text-3xl mb-6 flex items-center gap-3 text-purple-900 dark:text-purple-300">
                  <Zap className="w-6 h-6 text-purple-600" /> Product-Led Growth Loops
                </h2>
                <ul className="space-y-4">
                  {growthLoops.map((loop, idx) => (
                    <li key={idx} className="flex gap-4 items-start p-4 bg-white/60 dark:bg-card/60 rounded-xl border border-purple-100 dark:border-purple-900">
                      <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{loop}</span>
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

            {/* Unit Economics Calculator (expanded) */}
            {issue.unitEconomicsExpanded && (
              <UnitEconomicsCalculator
                data={{
                  unitPrice: parseFloat(issue.unitEconomicsExpanded.price.replace(/[^0-9.]/g, "")) || 199,
                  cogs: parseFloat(issue.unitEconomicsExpanded.cogs.replace(/[^0-9.]/g, "")) || 8,
                  grossMarginPercent: parseFloat(issue.unitEconomicsExpanded.grossMarginPercent.replace(/[^0-9.]/g, "")) || 96,
                  cac: parseFloat(issue.unitEconomicsExpanded.cac.replace(/[^0-9.]/g, "")) || 400,
                  ltv: parseFloat(issue.unitEconomicsExpanded.ltv.replace(/[^0-9.]/g, "")) || 4776,
                  paybackMonths: parseFloat(issue.unitEconomicsExpanded.paybackPeriod.replace(/[^0-9.]/g, "")) || 3,
                  assumptions: `Price: ${issue.unitEconomicsExpanded.price} | COGS: ${issue.unitEconomicsExpanded.cogs} | Payback: ${issue.unitEconomicsExpanded.paybackPeriod}`,
                }}
              />
            )}

            {/* PLG Sequence */}
            {issue.plgLoops && issue.plgLoops.length > 0 && (
              <PLGSequence data={{ loops: issue.plgLoops }} />
            )}

            {/* Compliance Timeline */}
            {issue.complianceRoadmap && issue.complianceRoadmap.length > 0 && (
              <ComplianceTimeline data={{ items: issue.complianceRoadmap }} />
            )}

            {/* Hiring Roadmap */}
            {issue.hiringRoadmap && issue.hiringRoadmap.length > 0 && (
              <HiringRoadmap data={{ roles: issue.hiringRoadmap }} />
            )}

            {/* Global Arbitrage Map */}
            {issue.globalArbitrage && issue.globalArbitrage.length > 0 && (
              <GlobalArbitrageMap data={{ regions: issue.globalArbitrage }} />
            )}

            {/* Exit Dashboard */}
            {issue.exitStrategy && (
              <ExitDashboard data={issue.exitStrategy} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* GTM */}
            <div className="bg-card rounded-3xl border border-border p-8">
              <h3 className="font-serif text-2xl mb-6 flex items-center gap-3">
                <Users2 className="w-5 h-5 text-blue-500" /> Go-To-Market
              </h3>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 tracking-widest">First Revenue</span>
                  <p className="text-sm text-foreground leading-relaxed">{issue.firstRevenue}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 tracking-widest">First 10 Customers</span>
                  <p className="text-sm text-foreground leading-relaxed">{issue.firstTen}</p>
                </div>
              </div>
            </div>

            {/* Unit Economics */}
            {unitEconomics && (
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6">
                <h3 className="font-serif text-xl mb-5 text-emerald-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" /> Unit Economics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Target CAC", value: unitEconomics.cac },
                    { label: "Expected LTV", value: unitEconomics.ltv },
                    { label: "Gross Margin", value: unitEconomics.margin },
                    { label: "Payback Period", value: unitEconomics.paybackPeriod },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">{label}</span>
                      <span className="font-mono font-bold text-emerald-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitors */}
            {competitors.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl mb-5">Competitor Weakness</h3>
                <div className="space-y-4">
                  {competitors.map((comp, idx) => (
                    <div key={idx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                      <h4 className="font-bold mb-1 text-muted-foreground line-through">{comp.name}</h4>
                      <p className="text-sm text-foreground">{comp.weakness}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monetization */}
            {monetization.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl mb-5">Monetization</h3>
                <div className="space-y-4">
                  {monetization.map((tier, idx) => (
                    <div key={idx} className="bg-muted/50 p-4 rounded-xl border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm uppercase tracking-wider">{tier.tier}</span>
                        <span className="font-mono text-primary font-bold">{tier.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marketing Strategy */}
            {marketingStrategy.length > 0 && (
              <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6">
                <h3 className="font-serif text-xl mb-5 text-blue-900">Growth Hooks</h3>
                <div className="space-y-4">
                  {marketingStrategy.map((strat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-blue-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-2">{strat.platform}</span>
                      <p className="text-sm font-bold text-blue-900 mb-2">{strat.action}</p>
                      <p className="text-xs font-mono text-blue-700 bg-blue-50 p-2 rounded-lg">"{strat.hook}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {techStack.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl mb-5 flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-500" /> Tech Stack
                </h3>
                <div className="space-y-3">
                  {techStack.map((tech, idx) => (
                    <div key={idx} className="p-4 border border-border rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 block mb-1">{tech.category}</span>
                      <h4 className="font-bold mb-1">{tech.name}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tech.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-12 px-6 bg-card">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoPath} alt="The Build Brief" className="w-6 h-6 rounded-sm opacity-60 grayscale" />
            <span className="font-serif text-xl">The Build Brief</span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/blueprints" className="hover:text-foreground transition-colors">Execution Hub</Link>
            <Link href="/archive" className="hover:text-foreground transition-colors">Archive</Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} The Build Brief</p>
        </div>
      </footer>
    </div>
  );
}
