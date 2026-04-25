export interface RoadmapStep {
  day: string;
  title: string;
  description: string;
  tip: string;
  locked: boolean;   // true = locked for everyone (unused now, kept for compat)
  proOnly?: boolean; // true = only locked for free-tier users
}

export const roadmapSteps: RoadmapStep[] = [
  {
    day: "Day 01–02",
    title: "The Phantom Sale",
    description: "Don't build a thing. Create a Stripe link, write one paragraph describing the outcome you deliver, and send it to 50 people who have the problem. If 3 pay — you have a business. If zero pay — you saved 6 months of the wrong work.",
    tip: "Response rate under 3%? Your problem statement isn't painful enough. Reframe around the cost of NOT solving it.",
    locked: false
  },
  {
    day: "Day 03–05",
    title: "Distribution Rail Setup",
    description: "Build your content-to-customer pipeline before you write a line of code. LinkedIn post → newsletter thread → automated DM sequence → Calendly. This system will run your sales engine for the next 12 months at zero cost.",
    tip: "Authority comes from specificity. Don't post 'I help founders grow.' Post '3 B2B founders, $0 to $10k MRR in 60 days using one channel. Here's how.'",
    locked: false
  },
  {
    day: "Day 06–10",
    title: "MVP: The Minimum Valuable Unit",
    description: "Launch the smallest thing that delivers the core value. No auth, no dashboard, no settings — just the one job it does, done manually if needed. Get it in front of 10 people who paid or committed to pay in the Phantom Sale.",
    tip: "Building the 'perfect' v1 is the fastest path to zero customers. Ship the ugly thing. The beautiful thing comes from what users tell you they actually need.",
    locked: false
  },
  {
    day: "Day 11–14",
    title: "The Pivot Calculus",
    description: "Your first 10 users will tell you what they actually bought — which is almost never what you thought you sold. Deep-dive into usage data. Find your 'super users' (top 20% by engagement). Strip everything else. Double down on what they love. Use the metric-to-growth calculators and churn kill matrix to make data-driven decisions.",
    tip: "The data doesn't lie. If your best users love one feature 10× more than everything else — that IS the product. Kill everything else.",
    locked: false,
    proOnly: true
  },
  {
    day: "Day 15–21",
    title: "The First Revenue Architecture",
    description: "Convert your early users into founding members (50% lifetime discount + testimonial exchange). Then close your first 3 enterprise accounts using the term-sheet-ready pitch deck and direct advisor guidance. Structured correctly, this phase alone can take you from $0 to $5k MRR.",
    tip: "Enterprise buyers don't buy products — they buy risk reduction. Your pitch should answer: 'Why is the cost of NOT buying this greater than the cost of buying it?'",
    locked: false,
    proOnly: true
  }
];
