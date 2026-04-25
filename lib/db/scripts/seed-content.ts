import { db } from "../src";
import { dailyDropsTable, playbookModulesTable, playbookLessonsTable } from "../src/schema/content";

const dailyDrops = [
  {
    pillar: "scaling",
    title: "The Referral Multiplier: Engineering Word-of-Mouth",
    category: "Scaling Systems",
    categoryIcon: "📈",
    value: "1.2× viral coefficient",
    content: `The math behind referral growth: if every user brings in 1.2 new users, you have exponential growth. Below 1.0, you have a leaky bucket no ad budget can fix.

Engineer the referral loop: (1) deliver the 'aha moment' within the first 5 minutes of signup, (2) trigger the share prompt immediately after that moment — not after onboarding, not after 30 days, NOW, (3) make sharing feel like gifting, not promoting.

Dropbox's 'give 500MB, get 500MB' doubled their userbase in 15 months at near-zero cost. Your referral mechanic doesn't need to be clever. It needs to be frictionless and immediately valuable to the person being referred.`,
    actionLabel: "Copy Referral Framework",
    dayOfWeek: 0
  },
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
    actionLabel: "Copy the Weekly Breakdown",
    dayOfWeek: 1
  },
  {
    pillar: "mental",
    title: "The Founder's Decision Fatigue Protocol",
    category: "Mental Performance",
    categoryIcon: "🧠",
    value: "40% decision quality improvement",
    content: `Founders make 500+ decisions per day. By 3pm, your prefrontal cortex is running on fumes — and that's exactly when you're trying to close the important deals or write the important code.

The protocol: (1) Do your highest-leverage cognitive work before 11am — no meetings, no Slack, no email. (2) Use a 'decision menu' for recurring choices — your morning routine, your lunch, your meeting cadence. Willpower spent on low-stakes decisions is willpower stolen from high-stakes ones. (3) End each day with a 3-line brain dump: what worked, what didn't, what one decision do I need to make tomorrow. This clears cognitive load and primes your next morning.

Naval Ravikant: 'The most important decisions of your life are made in moments of clarity, not urgency.' Create the conditions for clarity deliberately.`,
    actionLabel: "Copy Decision Protocol",
    dayOfWeek: 2
  },
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
    actionLabel: "Copy the Training Split",
    dayOfWeek: 3
  },
  {
    pillar: "entrepreneur",
    title: "The Identity Shift: Thinking Like a CEO at $0 Revenue",
    category: "Entrepreneur Mindset",
    categoryIcon: "🎯",
    value: "Founder → CEO mental shift",
    content: `The biggest trap in the first year: operating as an employee in your own company. Employees optimize for output. CEOs optimize for leverage — systems that produce output without their direct involvement.

The 3 questions that CEOs ask that founders never do: (1) 'If I disappeared for 30 days, what would break?' — everything that breaks is a single point of failure you need to systematize. (2) 'Who is the one person who, if I hired them this month, would have the highest multiplier on revenue?' — hire that person before you hire anyone else. (3) 'What is my company's unfair advantage — the thing a well-funded competitor couldn't replicate in 18 months?'

The identity shift happens when you start making decisions not for what's best for you today, but what's best for the entity called your company 3 years from now.`,
    actionLabel: "Copy the CEO Questions",
    dayOfWeek: 4
  },
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
    actionLabel: "Open This Week's Issue",
    dayOfWeek: 5
  },
  {
    pillar: "endurance",
    title: "Building Founder Endurance: The Long Game",
    category: "Endurance & Resilience",
    categoryIcon: "🔥",
    value: "5-year founder stamina",
    content: `The average successful startup takes 7 years from founding to liquidity event. Most founders quit between years 2 and 3 — not because they ran out of money, but because they ran out of identity.

The endurance protocol that works: (1) Separate your identity from your company's metrics. Your MRR going up does not make you a good person. Your MRR going down does not make you a failure. You are a person who happens to be building a company. (2) Build a 'hard day' ritual — a non-negotiable activity you do when everything is going wrong. For some founders it's a 5km run. For others it's calling one mentor. Whatever it is, it must be something that costs you nothing emotionally and reliably resets your nervous system. (3) Celebrate the process, not the outcomes. The work itself — the clarity you're developing, the systems you're building, the customer conversations — is the reward. The exit is a side effect.

Endurance is not about willpower. It's about building a life around the work that is sustainable at low-revenue, because low-revenue is most of the journey.`,
    actionLabel: "Copy Endurance Protocol",
    dayOfWeek: 6
  }
];

const playbookModules = [
  {
    slug: "launch",
    title: "Zero to First Dollar",
    description: "The exact sequence top founders use to go from idea to paying customer in under 72 hours — without writing a single line of production code first.",
    order: 0,
    lessons: [
      {
        slug: "phantom-sale",
        title: "The 48-Hour Phantom Sale",
        isFree: true,
        order: 0,
        content: JSON.stringify({
          insight: "Every week you build without a paying customer is a bet you're making with your life savings. The Phantom Sale collapses that risk to 48 hours. Create a Stripe payment link. Write one paragraph describing the outcome you deliver. Send it to 50 people who have the problem. If 3 pay — you have a business. If zero pay — you saved 6 months.",
          tactic: "Your DM should describe pain, not product. Wrong: 'I built a tool that tracks X.' Right: 'I know you spend 4 hours/week doing X manually. I found a way to cut that to 20 minutes. Here's a link to join — 10 spots at founding price.' The difference is selling the after, not the during.",
          steps: [
            "Create a Stripe payment link for $49–$199 (use a founding-member price, never free)",
            "Write a single paragraph: the problem, the outcome, the price, the URL",
            "Find 50 people who have this problem right now — LinkedIn, Reddit, Slack communities",
            "Send 50 DMs. Personalize the first line with something specific about them",
            "If 3+ pay within 48 hours: start building. If not: change the problem or the audience, not the price"
          ],
          warning: "Do not offer a free trial. Free signals low value. A founding-member price of $49 tells them you're serious. People who won't pay $49 to solve a painful problem don't actually have a painful problem.",
          proTip: "The response that tells you more than a 'yes': someone who says 'I would pay for this but I need it to also do Y.' That Y is your real product."
        })
      }
    ]
  }
];

async function main() {
  console.log("Seeding daily drops...");
  for (const drop of dailyDrops) {
    await db.insert(dailyDropsTable).values(drop).onConflictDoUpdate({
      target: [dailyDropsTable.dayOfWeek],
      set: drop
    });
  }

  console.log("Seeding playbook...");
  for (const mod of playbookModules) {
    const [insertedMod] = await db.insert(playbookModulesTable).values({
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      order: mod.order
    }).onConflictDoUpdate({
      target: [playbookModulesTable.slug],
      set: { title: mod.title, description: mod.description, order: mod.order }
    }).returning();

    for (const lesson of mod.lessons) {
      await db.insert(playbookLessonsTable).values({
        moduleId: insertedMod.id,
        slug: lesson.slug,
        title: lesson.title,
        isFree: lesson.isFree,
        order: lesson.order,
        content: lesson.content
      }).onConflictDoUpdate({
        target: [playbookLessonsTable.slug],
        set: { title: lesson.title, isFree: lesson.isFree, order: lesson.order, content: lesson.content }
      });
    }
  }

  console.log("Seeding complete.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
