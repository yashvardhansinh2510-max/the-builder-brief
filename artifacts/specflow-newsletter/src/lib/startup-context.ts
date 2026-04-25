export type StartupStage = "idea" | "pre-revenue" | "revenue" | "scaling";
export type StartupSector =
  | "B2B SaaS"
  | "Consumer"
  | "Fintech"
  | "Health Tech"
  | "Deep Tech"
  | "Developer Infrastructure"
  | "AI Tooling"
  | "EdTech"
  | "Marketplace"
  | "Other";
export type BiggestChallenge =
  | "Validation"
  | "Building"
  | "Distribution"
  | "Fundraising"
  | "Hiring";

export interface StartupContext {
  name?: string;           // startup/company name
  problem?: string;        // problem statement
  whatBuilding: string;
  stage: StartupStage;
  sector: StartupSector;
  targetCustomer: string;
  biggestChallenge: BiggestChallenge;
  teamSize?: number;       // number of team members
  updatedAt: string;
}

const STORAGE_KEY = "bb_startup_context";

export function getStartupContext(): StartupContext | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStartupContext(ctx: StartupContext): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...ctx, updatedAt: new Date().toISOString() }));
}

export function clearStartupContext(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const stageLabels: Record<StartupStage, string> = {
  "idea": "Idea — haven't built anything yet",
  "pre-revenue": "Pre-revenue — building, no paying customers",
  "revenue": "Revenue — paying customers, proving the model",
  "scaling": "Scaling — model works, growing fast",
};

export const challengeLabels: Record<BiggestChallenge, string> = {
  "Validation": "Validation — not sure the problem is real",
  "Building": "Building — product isn't where it needs to be",
  "Distribution": "Distribution — can't crack customer acquisition",
  "Fundraising": "Fundraising — need capital to move faster",
  "Hiring": "Hiring — team isn't keeping up with the company",
};

// CAC benchmarks by sector — used in Build Brief
export function getCACSector(sector: StartupSector): number {
  const map: Record<StartupSector, number> = {
    "B2B SaaS": 800,
    "Consumer": 30,
    "Fintech": 600,
    "Health Tech": 1500,
    "Deep Tech": 2000,
    "Developer Infrastructure": 1200,
    "AI Tooling": 350,
    "EdTech": 120,
    "Marketplace": 85,
    "Other": 500,
  };
  return map[sector];
}

export function getCompetitiveSignals(ctx: StartupContext): Array<{ name: string; weakness: string; opportunity: string }> {
  const signalsBySector: Record<string, Array<{ name: string; weakness: string; opportunity: string }>> = {
    "B2B SaaS": [
      { name: "Enterprise Incumbents", weakness: "18–24 month sales cycles. Complex onboarding. Opaque pricing.", opportunity: "Self-serve at 1/10th the price. Ship in days, not quarters." },
      { name: "VC-Backed Competitors", weakness: "Burning cash chasing whales. Ignoring SMB segment entirely.", opportunity: "Own the mid-market. Profitable at lower ACV. Compounding NPS." },
      { name: "Open Source Alternatives", weakness: "Require dedicated DevOps to run. Poor UX. No support SLA.", opportunity: "Managed hosted version. Premium UX. Founder-level support at early stage." },
    ],
    "AI Tooling": [
      { name: "ChatGPT / Claude / Gemini", weakness: "Generic. No domain context. No workflow integration.", opportunity: "Domain-specific, deeply integrated. Charge for outcomes not tokens." },
      { name: "Vertical AI Startups", weakness: "Over-engineered. VC-funded bloat. 90-day onboarding.", opportunity: "Ship in 48 hours. Instant value. Prove it works before asking for a contract." },
      { name: "No-Code AI Builders", weakness: "Break at scale. Poor output quality. Steep learning curve past demos.", opportunity: "Code-first reliability with no-code UX. Pro results, consumer simplicity." },
    ],
    "Consumer": [
      { name: "Category Leaders", weakness: "Zero brand relationship. No niche ownership. Race to bottom on price.", opportunity: "Own a micro-category. Community-led. Subscription + LTV focus." },
      { name: "Direct Competitors", weakness: "Same sourcing, same creatives, same channels.", opportunity: "Niche vertical domination before expanding. Own one customer type deeply." },
    ],
    "Fintech": [
      { name: "Legacy Banks", weakness: "12-month compliance cycles. Poor UX. No API access.", opportunity: "API-first. BaaS rails. Ship in weeks. Embed in existing workflows." },
      { name: "Neobanks", weakness: "Burning cash on CAC. No moat. Commodity product.", opportunity: "Niche vertical banking — creators, freelancers, SMBs in a specific sector." },
      { name: "Compliance SaaS", weakness: "One-size-fits-all. Enterprise pricing. No SMB tier.", opportunity: "SMB-first compliance at $99/month. Regulatory arbitrage." },
    ],
    "Health Tech": [
      { name: "EHR Monopolies", weakness: "$150k+ implementations. 2-year ROI. Doctors hate them.", opportunity: "Vertical EHR for one specialty. Fast onboarding. NPS above 50." },
      { name: "Consumer Health Apps", weakness: "No clinical validity. Engagement collapses after week 3.", opportunity: "Evidence-based. Outcomes-tied. B2B2C through employers or payers." },
    ],
    "Developer Infrastructure": [
      { name: "AWS / GCP / Azure", weakness: "Complex pricing. Over-engineered for early-stage. Lock-in.", opportunity: "Single-use-case abstraction layer. One command. Works in 5 minutes." },
      { name: "Funded DevTools", weakness: "Solving the enterprise problem, ignoring indie devs.", opportunity: "Serve the long tail. OSS core + paid hosting. Developer-led growth." },
    ],
  };
  return signalsBySector[ctx.sector] || signalsBySector["B2B SaaS"];
}

export interface DerivedMetrics {
  benchmarkCAC: number;
  estimatedLTV: number;
  ltvCacRatio: number;
  isHealthyUnit: boolean;
}

/** Derives key unit-economics metrics from a startup's sector. */
export function deriveMetrics(ctx: StartupContext): DerivedMetrics {
  const benchmarkCAC = getCACSector(ctx.sector);
  // LTV heuristic: CAC * 5 as a conservative estimate for the sector
  const estimatedLTV = benchmarkCAC * 5;
  const ltvCacRatio = Math.round((estimatedLTV / benchmarkCAC) * 10) / 10;
  return {
    benchmarkCAC,
    estimatedLTV,
    ltvCacRatio,
    isHealthyUnit: ltvCacRatio >= 3,
  };
}
