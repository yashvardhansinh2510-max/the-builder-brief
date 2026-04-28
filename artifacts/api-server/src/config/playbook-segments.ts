export interface PlaybookSegment {
  id: string;
  title: string;
  description: string;
  stages: ("seed" | "series-a" | "series-b")[];
  markets: ("b2b-saas" | "marketplace" | "developer-tools" | "consumer")[];
  keyPoints: string[];
  templateUrl: string;
}

export const playbookSegments: PlaybookSegment[] = [
  {
    id: "segment_001",
    title: "Finding Product-Market Fit",
    description:
      "The playbook for discovering what founders at your stage actually want to build. Focus on customer conversations over optimization.",
    stages: ["seed"],
    markets: ["b2b-saas", "marketplace", "developer-tools", "consumer"],
    keyPoints: [
      "Talk to 50+ prospects before building",
      "Track feature requests in a spreadsheet, not a product roadmap",
      "Validate willingness to pay before feature work",
      "Pivot metrics: not DAU, but 'founders who came back'",
    ],
    templateUrl: "https://thebuilderbrief.com/playbooks/pmf",
  },
  {
    id: "segment_002",
    title: "B2B SaaS Go-to-Market on $0 Budget",
    description:
      "How to build your first $100k MRR without a sales team. Tactics that work for founders with no network and zero budget.",
    stages: ["seed", "series-a"],
    markets: ["b2b-saas"],
    keyPoints: [
      "Product-led growth playbook: make the free tier viral",
      "Community before press: build in public, get to 10k followers",
      "Sales playbook when product alone isn't enough",
      "Pricing strategy: $99/month vs. enterprise deals",
    ],
    templateUrl: "https://thebuilderbrief.com/playbooks/b2b-saas-gtm",
  },
  {
    id: "segment_003",
    title: "Marketplace Unit Economics",
    description:
      "How to think about supply & demand, avoid the chicken-egg problem, and hit profitability before capital runs out.",
    stages: ["seed", "series-a", "series-b"],
    markets: ["marketplace"],
    keyPoints: [
      "Fake supply-side first: bootstrap demand at 10:1 supply ratio",
      "Unit economics framework: LTV vs. CAC + commission",
      "Network effects aren't magic: track adoption curves",
      "Cohort analysis: which month's users are most profitable",
    ],
    templateUrl: "https://thebuilderbrief.com/playbooks/marketplace",
  },
  {
    id: "segment_004",
    title: "Developer Tools Distribution",
    description:
      "The playbook for tools. GitHub stars don't make money. This is about building a business developers actually pay for.",
    stages: ["seed", "series-a"],
    markets: ["developer-tools"],
    keyPoints: [
      "Build for yourself first: dogfood your own tool",
      "Open source as moat, not commodity: separate OSS from commercial",
      "Community as sales: Slack communities + Discord strategy",
      "Enterprise: when to hire first sales person (and why timing matters)",
    ],
    templateUrl: "https://thebuilderbrief.com/playbooks/dev-tools",
  },
  {
    id: "segment_005",
    title: "Consumer Growth Loops",
    description:
      "Building viral growth systematically. Tiktok, Snapchat, and Twitch all use this playbook. So do the 10M+ MAU apps.",
    stages: ["series-a"],
    markets: ["consumer"],
    keyPoints: [
      "Virality coefficient: how many users invite others",
      "Retention as prerequisite: 30-day retention matters more than DAU",
      "Creator economy: build for creators first, if that's your market",
      "Geographic arbitrage: build in US, scale globally",
    ],
    templateUrl: "https://thebuilderbrief.com/playbooks/consumer-growth",
  },
  {
    id: "segment_006",
    title: "Series A Fundraising Playbook",
    description:
      "How to actually close a Series A. What investors want to see. How to tell your story so they believe you.",
    stages: ["series-a"],
    markets: ["b2b-saas", "developer-tools", "marketplace"],
    keyPoints: [
      "Founder narrative: why you, why now, why this market",
      "Metrics that matter: MRR growth rate, CAC payback, net retention",
      "Pitch deck structure: problem, solution, market, team, traction",
      "Negotiation: term sheets, liquidation preferences, board seats",
    ],
    templateUrl: "https://thebuilderbrief.com/playbooks/series-a",
  },
  {
    id: "segment_007",
    title: "Enterprise Expansion (Series A→B)",
    description:
      "Your product works for SMBs. Now how do you build an enterprise business? This playbook covers sales, product, and operations changes.",
    stages: ["series-a", "series-b"],
    markets: ["b2b-saas", "developer-tools"],
    keyPoints: [
      "Enterprise CAC is different: expect 12-18 month sales cycles",
      "Product changes: compliance, security, integrations, SLAs",
      "Building an enterprise sales org: when to hire, what structure",
      "Customer success becomes revenue: net retention > 120%",
    ],
    templateUrl: "https://thebuilderbrief.com/playbooks/enterprise",
  },
  {
    id: "segment_008",
    title: "Profitability by Necessity",
    description:
      "How to build to profitability rather than waiting for a Series C. Unit economics playbook for sustainable growth.",
    stages: ["series-b"],
    markets: ["b2b-saas", "developer-tools", "marketplace"],
    keyPoints: [
      "Gross margin is everything: cost of goods sold per customer",
      "LTV:CAC ratio framework: what's sustainable at your stage",
      "Cash flow management: runway vs. growth rate tradeoffs",
      "Churn mitigation: keeping customers longer than CAC payback period",
    ],
    templateUrl: "https://thebuilderbrief.com/playbooks/profitability",
  },
];
