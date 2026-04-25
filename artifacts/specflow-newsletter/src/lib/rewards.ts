export interface Reward {
  day: number;
  title: string;
  description: string;
  value: string;
  actionLabel: string;
  type: "zoom" | "resource" | "secret";
}

export const milestoneRewards: Reward[] = [
  {
    day: 16,
    title: "Scaling Sales & VC Pitch Masterclass",
    description: "You've hit Day 16 — the point where most founders stall. You've earned access to a live group session on how to pitch startup incubators, VC funds, and angel syndicates. Includes a battle-tested pitch deck template.",
    value: "$1,500 Strategic Value",
    actionLabel: "Book Your Seat",
    type: "zoom"
  },
  {
    day: 30,
    title: "The Strategic Advisor Loop",
    description: "30 consecutive days of builders discipline. You are now eligible for a private Zoom strategy session with the Foundry principal team — 30 minutes, your agenda, full candor.",
    value: "$2,500 Strategic Value",
    actionLabel: "Claim Call Access",
    type: "zoom"
  },
  {
    day: 60,
    title: "The $10,000 Private Growth Protocol",
    description: "60 days of relentless execution. We are unlocking the internal GTM protocol used to scale our Series B partners from $0 to $1M ARR. This is not public information.",
    value: "$10,000 Industrial Value",
    actionLabel: "Download Protocol",
    type: "resource"
  },
  {
    day: 90,
    title: "Founder CS Briefing — Exclusive Zoom",
    description: "90 days. You didn't quit. On the 90th day, you are invited to an exclusive Zoom briefing on your product — a deep-dive audit of your business model, positioning, and next-phase strategy. Conducted by the Foundry team.",
    value: "$5,000 Exclusive Access",
    actionLabel: "Reserve Your Spot",
    type: "zoom"
  }
];

export const getEligibleReward = (streak: number): Reward | null => {
  const reward = [...milestoneRewards].reverse().find(r => streak >= r.day);
  return reward || null;
};

export const getNextReward = (streak: number): Reward | null => {
  return milestoneRewards.find(r => streak < r.day) || null;
};
