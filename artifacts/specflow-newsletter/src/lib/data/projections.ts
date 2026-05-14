// TODO: Replace with /api/intelligence endpoint when backend is ready.
export type IntelligenceProjection = {
  id: string;
  codename: string;
  tagline: string;
  verticals: string[];
  timeHorizon: string;
  keyMetric: string;
  steps: string[];
  riskLevel: 'low' | 'medium' | 'high';
  issueRef?: string;
};

export const projections: IntelligenceProjection[] = [
  {
    id: 'foundry-path',
    codename: 'Foundry Path',
    tagline: 'Land your first 10 paying customers through direct founder outreach.',
    verticals: ['B2B SaaS', 'Consulting', 'Dev Tools'],
    timeHorizon: '90 days',
    keyMetric: '$10K MRR',
    steps: [
      'Identify 50 decision-makers in your ICP using Apollo or LinkedIn Sales Nav — filter by company size 10–200 employees.',
      'Write one hyper-personalized cold email per company referencing a specific pain point visible on their public channels.',
      'Follow up exactly once at day 5 with a 2-line nudge. No apology, no re-pitch — just "still relevant?"',
      'Get 3 discovery calls booked per week. Time-box calls to 20 minutes. End every call asking for one referral.',
      'Convert 2 of 10 discovery calls to paid pilots at $500–$1,000. Use pilots to sharpen pricing for month 2.',
    ],
    riskLevel: 'medium',
    issueRef: '/vault/compliance-as-code-startups',
  },
  {
    id: 'viral-growth',
    codename: 'Viral Growth',
    tagline: 'Engineer a referral loop that acquires users faster than you spend.',
    verticals: ['Consumer Apps', 'DTC', 'Social'],
    timeHorizon: '60 days',
    keyMetric: '10,000 signups',
    steps: [
      'Define the "aha moment" — the single action that makes a user feel the product is working. Shorten the path to it by 50%.',
      'Build a double-sided referral: inviter gets a feature unlock, invitee gets a head start. No cash — reduce CAC.',
      'Seed 5 micro-communities (Slack groups, subreddits, Discord servers) with 10–20 power users who post authentic use cases.',
      'Ship a shareable output — a generated report, certificate, or embed — that carries your brand into social feeds organically.',
      'Run a 7-day streak mechanic. Users who hit 7 days churn at 3× lower rates. Wire email reminders on days 2, 4, 6.',
    ],
    riskLevel: 'high',
    issueRef: '/vault/hyperlocal-logistics-mesh',
  },
  {
    id: 'revenue-wedge',
    codename: 'Revenue Wedge',
    tagline: 'Close 3 anchor contracts that fund your next 6 months of runway.',
    verticals: ['B2B SaaS', 'Enterprise', 'Professional Services'],
    timeHorizon: '90 days',
    keyMetric: '3 signed contracts',
    steps: [
      'Pick one beachhead segment — the narrowest slice of your ICP where you can win 80% of deals if you show up right.',
      'Build a one-page ROI calculator specific to that segment. Show the dollar value they lose per month without your product.',
      'Get warm intros through advisors, angels, or portfolio companies. Cold outreach has a 1–3% conversion rate; warm intros run 20–40%.',
      'Structure a 90-day pilot with a success metric defined upfront. Pilots that hit their metric convert to annual contracts 70% of the time.',
      'Use contract #1 as social proof for contracts #2 and #3. "We\'re working with [Name] on [outcome]" shortens every subsequent cycle.',
    ],
    riskLevel: 'low',
    issueRef: '/vault/payroll-fraud-detection-ai',
  },
  {
    id: 'category-maker',
    codename: 'Category Maker',
    tagline: "Own the language of your market before competitors name what you built.",
    verticals: ['SaaS', 'AI', 'Fintech', 'Health Tech'],
    timeHorizon: '6 months',
    keyMetric: '1,000 branded mentions',
    steps: [
      'Name the category you want to own. Not your product — the problem space. Coin a 2-word phrase that didn\'t exist before you.',
      'Publish a 3,000-word definitive guide on the category. SEO-optimize it for the exact phrase you\'re coining.',
      'Pitch the category narrative to 5 podcasts in your vertical. You\'re not pitching your product — you\'re explaining the shift in the market.',
      'Build a free micro-tool (a calculator, scorecard, or benchmark report) that generates leads and spreads the category name.',
      'Brief 3 analysts or journalists on the category. Offer exclusive data. Trade coverage for your category framing.',
    ],
    riskLevel: 'medium',
    issueRef: '/vault/supply-chain-traceability-luxury',
  },
  {
    id: 'network-effect',
    codename: 'Network Effect',
    tagline: 'Build a product that gets stickier with every new user who joins.',
    verticals: ['Marketplace', 'Social', 'Community', 'Data Platforms'],
    timeHorizon: '6 months',
    keyMetric: '500 DAU',
    steps: [
      'Map your liquidity threshold — the minimum number of active users on both sides before the product works. Build to that number first.',
      'Subsidize one side of the marketplace. Give suppliers free access, charge buyers. Or vice versa. Never charge both sides cold.',
      'Create a defensibility moat through data: the more users, the better the recommendations, the harder to replicate without your dataset.',
      'Identify your "power users" — the top 10% who generate 60% of the value. Give them early access, status, and direct founder access.',
      'Build cross-side virality: every transaction or interaction should generate a shareable moment visible to non-users.',
    ],
    riskLevel: 'high',
    issueRef: '/vault/precision-agriculture-water-ai',
  },
  {
    id: 'leverage-stack',
    codename: 'Leverage Stack',
    tagline: 'Cut operating costs 40% without cutting team or product quality.',
    verticals: ['B2B SaaS', 'E-commerce', 'Operations'],
    timeHorizon: '30 days',
    keyMetric: '40% cost reduction',
    steps: [
      'Run a full vendor audit: list every recurring tool, subscription, and contractor. Flag anything you haven\'t used in 30 days.',
      'Renegotiate the top 3 contracts by spend. Most vendors will offer 20–30% discounts to retain ARR — you just have to ask.',
      'Identify the 2 most repetitive internal workflows and automate them with no-code tools (Zapier, Make, or n8n).',
      'Move from per-seat to usage-based pricing on tools where your team is under-utilizing capacity by more than 50%.',
      'Replace 1 FTE-equivalent of manual work with an AI agent. Document the time saved. Use the saving to fund one growth experiment.',
    ],
    riskLevel: 'low',
    issueRef: '/vault/compliance-as-code-startups',
  },
  {
    id: 'exit-architecture',
    codename: 'Exit Architecture',
    tagline: 'Position your business for acquisition at 5–8× revenue before you need to.',
    verticals: ['SaaS', 'Fintech', 'Data', 'Vertical AI'],
    timeHorizon: '12 months',
    keyMetric: '5× revenue multiple',
    steps: [
      'Identify your 3 most likely acquirers by strategic fit. Study their last 5 acquisitions — price, ARR, growth rate, team size.',
      'Build a "strategic moat memo" — a 1-page document explaining why your product is 10× cheaper to acquire than to build.',
      'Get your financials acquisition-ready: 24-month P&L, clean cap table, documented IP ownership, no circular dependencies.',
      'Create reasons to have legitimate conversations with acquirers before you\'re selling: partnerships, API integrations, co-marketing.',
      'Brief your board and key investors 12 months before you plan to exit. Their network is your most valuable M&A channel.',
    ],
    riskLevel: 'medium',
    issueRef: '/vault/supply-chain-traceability-luxury',
  },
];
