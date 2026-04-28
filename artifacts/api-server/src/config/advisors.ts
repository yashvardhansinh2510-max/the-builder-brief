export interface AdvisorProfile {
  id: string;
  name: string;
  bio: string;
  expertise: string[];
  experience: string[];
  stages: ("seed" | "series-a" | "series-b")[];
  markets: ("b2b-saas" | "marketplace" | "developer-tools" | "consumer")[];
  quarterlySlots: number;
}

export const advisorRoster: AdvisorProfile[] = [
  {
    id: "advisor_001",
    name: "Sarah Chen",
    bio: "Founder & exit of two B2B SaaS companies ($50M+ ARR). Now investor and operator focused on GTM.",
    expertise: ["B2B Go-to-Market", "Sales Playbooks", "Unit Economics", "Sales Team Scaling"],
    experience: ["2x founder (exits)", "HubSpot investor", "15+ advisor roles"],
    stages: ["seed", "series-a", "series-b"],
    markets: ["b2b-saas"],
    quarterlySlots: 3,
  },
  {
    id: "advisor_002",
    name: "Marcus Rodriguez",
    bio: "Built 3 marketplaces, exited to Uber/Amazon portfolio. Expert in network effects and unit economics.",
    expertise: ["Marketplace Dynamics", "Supply/Demand Balancing", "Network Effects", "Pricing Strategy"],
    experience: ["3x marketplace founder", "eBay advisor", "Y Combinator alum"],
    stages: ["seed", "series-a", "series-b"],
    markets: ["marketplace"],
    quarterlySlots: 2,
  },
  {
    id: "advisor_003",
    name: "James Liu",
    bio: "VP Product at Stripe. Early engineer at Twilio. Specializes in developer product strategy and community.",
    expertise: ["Developer Product", "API Design", "Community Growth", "Enterprise Expansion"],
    experience: ["Stripe (VP Product)", "Twilio (engineer/product)", "6+ exits in dev tools"],
    stages: ["seed", "series-a", "series-b"],
    markets: ["developer-tools"],
    quarterlySlots: 2,
  },
  {
    id: "advisor_004",
    name: "Priya Patel",
    bio: "Founder of TikTok creator platform (acquired). Scaled first consumer business to 10M MAU.",
    expertise: ["Viral Growth", "Content Creator Economics", "Retention & Engagement", "International Expansion"],
    experience: ["Creator platform founder (acquired)", "10M MAU at peak", "Sequoia portfolio"],
    stages: ["series-a", "series-b"],
    markets: ["consumer"],
    quarterlySlots: 2,
  },
  {
    id: "advisor_005",
    name: "David Kim",
    bio: "Serial founder, 4 exits. Now focuses on early-stage playbooks and founder psychology.",
    expertise: ["Founder Fundamentals", "Unit Economics", "Problem Definition", "Fundraising Strategy"],
    experience: ["4x founder/exits", "YC partner (3 years)", "100+ founder mentorships"],
    stages: ["seed", "series-a"],
    markets: ["b2b-saas", "marketplace", "developer-tools"],
    quarterlySlots: 4,
  },
  {
    id: "advisor_006",
    name: "Lisa Wu",
    bio: "CFO at 2 unicorns pre-IPO. Expert in scaling operations and Series B financials.",
    expertise: ["Financial Planning", "Series B Preparation", "Unit Economics Optimization", "Hiring & Scaling"],
    experience: ["2x unicorn CFO", "Stanford GSB instructor", "50+ board seats"],
    stages: ["series-a", "series-b"],
    markets: ["b2b-saas", "developer-tools"],
    quarterlySlots: 3,
  },
];
