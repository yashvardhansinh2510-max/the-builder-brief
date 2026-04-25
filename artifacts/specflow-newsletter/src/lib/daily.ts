export interface DailyEdge {
  title: string;
  category: string;
  categoryIcon: string;
  value: string;
  content: string;
  actionLabel: string;
  pillar: "startup" | "mental" | "physical" | "entrepreneur" | "scaling" | "endurance" | "friday";
}

// 7-day rotation: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const dailyDrops: DailyEdge[] = [
  // Sunday — Scaling
  {
    pillar: "scaling",
    title: "The Referral Multiplier: Engineering Word-of-Mouth",
    category: "Scaling Systems",
    categoryIcon: "📈",
    value: "1.2× viral coefficient",
    content: `The math behind referral growth: if every user brings in 1.2 new users, you have exponential growth. Below 1.0, you have a leaky bucket no ad budget can fix.

Engineer the referral loop: (1) deliver the 'aha moment' within the first 5 minutes of signup, (2) trigger the share prompt immediately after that moment — not after onboarding, not after 30 days, NOW, (3) make sharing feel like gifting, not promoting.

Dropbox's 'give 500MB, get 500MB' doubled their userbase in 15 months at near-zero cost. Your referral mechanic doesn't need to be clever. It needs to be frictionless and immediately valuable to the person being referred.`,
    actionLabel: "Copy Referral Framework"
  },
  // Monday — Startup
  {
    pillar: "startup",
    title: "The $0 to $1k MRR Playbook: Week-by-Week",
    category: "Startup Execution",
    categoryIcon: "🚀",
    value: "First $1,000 MRR",
    content: `Week 1: Phantom Sale — 50 DMs, one paragraph, a Stripe link. Goal: 3 paying customers at $99–$199. If you get them, you have validation. If not, change the problem statement, not the price.

Week 2: Manual delivery — Deliver the promised outcome manually using tools you already have (spreadsheets, Notion, Loom videos). Charge for the outcome, not the software. This is how you learn what people actually need before you build anything.

Week 3: Founding member close — Offer your first 10 customers 50% lifetime discount in exchange for a 30-min monthly feedback call and a written testimonial at 60 days. This is your product roadmap and your first sales asset.

Week 4: First automation — Build the ONE thing that removes you from the manual delivery loop. Nothing else. Ship it to your 10 founding members. Fix what breaks.`,
    actionLabel: "Copy the Weekly Breakdown"
  },
  // Tuesday — Mental Health
  {
    pillar: "mental",
    title: "The Founder's Decision Fatigue Protocol",
    category: "Mental Performance",
    categoryIcon: "🧠",
    value: "40% decision quality improvement",
    content: `Founders make 500+ decisions per day. By 3pm, your prefrontal cortex is running on fumes — and that's exactly when you're trying to close the important deals or write the important code.

The protocol: (1) Do your highest-leverage cognitive work before 11am — no meetings, no Slack, no email. (2) Use a 'decision menu' for recurring choices — your morning routine, your lunch, your meeting cadence. Willpower spent on low-stakes decisions is willpower stolen from high-stakes ones. (3) End each day with a 3-line brain dump: what worked, what didn't, what one decision do I need to make tomorrow. This clears cognitive load and primes your next morning.

Naval Ravikant: 'The most important decisions of your life are made in moments of clarity, not urgency.' Create the conditions for clarity deliberately.`,
    actionLabel: "Copy Decision Protocol"
  },
  // Wednesday — Physical Health
  {
    pillar: "physical",
    title: "The Minimum Effective Dose: Exercise for Founders",
    category: "Physical Edge",
    categoryIcon: "💪",
    value: "30% cognitive output increase",
    content: `Stanford neuroscientist Andrew Huberman's research: 180 minutes of Zone 2 cardio per week (conversational pace — you can talk but are slightly breathless) + 3 resistance training sessions produces the same cognitive and longevity outcomes as 2× the volume at higher intensity.

For founders: 3× 20-min morning walks (Zone 2) + 3× 30-min resistance sessions (compound movements only: squat, deadlift, press, row). Total: 3 hours/week. Non-negotiable.

The compounding effect: consistent low-intensity cardiovascular exercise grows new neurons in the hippocampus — the part of your brain responsible for pattern recognition and decision-making. You are literally growing your competitive advantage.

One rule: Never cancel. Reduce intensity if needed. Never cancel.`,
    actionLabel: "Copy the Training Split"
  },
  // Thursday — Entrepreneur Journey
  {
    pillar: "entrepreneur",
    title: "The Identity Shift: Thinking Like a CEO at $0 Revenue",
    category: "Entrepreneur Mindset",
    categoryIcon: "🎯",
    value: "Founder → CEO mental shift",
    content: `The biggest trap in the first year: operating as an employee in your own company. Employees optimize for output. CEOs optimize for leverage — systems that produce output without their direct involvement.

The 3 questions that CEOs ask that founders never do: (1) 'If I disappeared for 30 days, what would break?' — everything that breaks is a single point of failure you need to systematize. (2) 'Who is the one person who, if I hired them this month, would have the highest multiplier on revenue?' — hire that person before you hire anyone else. (3) 'What is my company's unfair advantage — the thing a well-funded competitor couldn't replicate in 18 months?'

The identity shift happens when you start making decisions not for what's best for you today, but what's best for the entity called your company 3 years from now.`,
    actionLabel: "Copy the CEO Questions"
  },
  // Friday — Friday Signal (weekly startup drop)
  {
    pillar: "friday",
    title: "This Week's Signal: The Market Gap Intelligence Brief",
    category: "Friday Drop",
    categoryIcon: "⚡",
    value: "Weekly Blueprint",
    content: `Every Friday, The Builder Brief deconstructs one startup opportunity end-to-end: the market gap, why the window is open NOW, the 6-step build plan, the first revenue path, and the copy-paste Claude prompts to execute it this weekend.

Today's signal is live. Check your inbox for the full issue — or access it directly in your Vault Archive below.

If you haven't received it: check your spam folder and whitelist builder@thebuildbrief.com. Every issue is sent before 9:00 AM in your local timezone.

What makes the Builder Brief different: we don't cover trends. We cover specific, named opportunities with real TAM data, real competitive gaps, and real execution paths. No fluff. No generic advice. Just the blueprint.`,
    actionLabel: "Open This Week's Issue"
  },
  // Saturday — Endurance
  {
    pillar: "endurance",
    title: "Building Founder Endurance: The Long Game",
    category: "Endurance & Resilience",
    categoryIcon: "🔥",
    value: "5-year founder stamina",
    content: `The average successful startup takes 7 years from founding to liquidity event. Most founders quit between years 2 and 3 — not because they ran out of money, but because they ran out of identity.

The endurance protocol that works: (1) Separate your identity from your company's metrics. Your MRR going up does not make you a good person. Your MRR going down does not make you a failure. You are a person who happens to be building a company. (2) Build a 'hard day' ritual — a non-negotiable activity you do when everything is going wrong. For some founders it's a 5km run. For others it's calling one mentor. Whatever it is, it must be something that costs you nothing emotionally and reliably resets your nervous system. (3) Celebrate the process, not the outcomes. The work itself — the clarity you're developing, the systems you're building, the customer conversations — is the reward. The exit is a side effect.

Endurance is not about willpower. It's about building a life around the work that is sustainable at low-revenue, because low-revenue is most of the journey.`,
    actionLabel: "Copy Endurance Protocol"
  }
];

export function getDailyEdge(): DailyEdge {
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return dailyDrops[dayOfWeek];
}

export function getFridayDropProgress(): number {
  const day = new Date().getDay();
  const hour = new Date().getHours();
  // Mon=20, Tue=35, Wed=52, Thu=75, Fri=95, Sat/Sun=reset to building next
  const progressMap: Record<number, number> = {
    0: 8,   // Sunday — starting research
    1: 22,  // Monday — research phase
    2: 38,  // Tuesday — drafting begins
    3: 55,  // Wednesday — drafting deep
    4: 78,  // Thursday — editing
    5: day === 5 && hour >= 9 ? 100 : 95,  // Friday — live at 9am
    6: 12   // Saturday — next issue research starts
  };
  return progressMap[day] ?? 55;
}

export function getFridayDropTeaser(): { niche: string; hook: string } {
  // Returns only a teaser niche — full title revealed on Friday
  const teasers = [
    { niche: "Legal Tech", hook: "A $40B market still running on email and fax machines." },
    { niche: "B2B Automation", hook: "The $2M/year manual workflow that 3 people in every mid-market company still do by hand." },
    { niche: "Health Infrastructure", hook: "Why the $8B clinical trial recruitment problem is still unsolved — and how a solo founder can crack it." },
    { niche: "Fintech Compliance", hook: "A regulation going live in Q3 that will create a $500M compliance market overnight." },
    { niche: "EdTech", hook: "The $22B skills gap nobody is filling at the SMB level." }
  ];
  // Rotate by week number so it stays consistent within a week
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return teasers[week % teasers.length];
}
