export interface Tool {
  id: string;
  name: string;
  category: "Tech" | "GTM" | "Ops" | "AI";
  description: string;
  perk?: string;
  logo: string;
}

export const arsenalTools: Tool[] = [
  {
    id: "t1",
    name: "Supabase",
    category: "Tech",
    description: "The open source Firebase alternative. Build in a weekend, scale to millions.",
    perk: "Foundry Approved: 3 Months Pro Free",
    logo: "⚡"
  },
  {
    id: "t2",
    name: "Vercel",
    category: "Ops",
    description: "Framework-defined infrastructure. Ship faster with automatic previews.",
    perk: "Alliance Integration: Zero-Config Deploy",
    logo: "▲"
  },
  {
    id: "t3",
    name: "PostHog",
    category: "AI",
    description: "Product OS. Everything you need for building better products.",
    perk: "High-Tier: Founders Pack Included",
    logo: "🚀"
  },
  {
    id: "t4",
    name: "Stripe",
    category: "GTM",
    description: "Financial infrastructure for the internet. Start charging on Day 1.",
    perk: "Industrial Grade: Fee Credits Available",
    logo: "💳"
  },
  {
    id: "t5",
    name: "Linear",
    category: "Ops",
    description: "The better way to build products. Streamline issues, projects and product roadmaps.",
    perk: "Workforce Elite: Private Workspace Setup",
    logo: "⌘"
  },
  {
    id: "t6",
    name: "Claude API",
    category: "AI",
    description: "Next-generation AI for technical execution and product logic.",
    perk: "Prompts Pre-Engineered for Foundry",
    logo: "🤖"
  }
];
