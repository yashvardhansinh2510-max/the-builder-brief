import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useLocation } from "wouter";
import {
  Rocket, Brain, Heart, Dumbbell, TrendingUp, Flame,
  Lock, ChevronRight, Copy, ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PortalNav from "@/components/PortalNav";
import { toast } from "sonner";
import { getDailyEdge } from "@/lib/daily";

type DropCategory = "friday" | "mindset" | "mental" | "physical" | "scaling";

interface Drop {
  day: string;
  title: string;
  summary: string;
  content: string;
  category: DropCategory;
  tags: string[];
  product?: string;
}

const categoryMeta: Record<DropCategory, { label: string; icon: any; color: string; bg: string; border: string; description: string }> = {
  friday: {
    label: "Friday Startup Drop",
    icon: Rocket,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    description: "One startup opportunity deconstructed end-to-end. Market gap, build plan, first revenue path.",
  },
  mindset: {
    label: "Entrepreneur Mindset",
    icon: Brain,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    description: "The mental edge that separates founders who scale from those who stall.",
  },
  mental: {
    label: "Mental Health",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    description: "Psychological resilience protocols built for high-stakes builders.",
  },
  physical: {
    label: "Physical Health & Endurance",
    icon: Dumbbell,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    description: "Body as a performance system. Train like your company depends on it.",
  },
  scaling: {
    label: "Scaling & Business Growth",
    icon: TrendingUp,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    description: "Revenue architecture, growth loops, and systems that compound.",
  },
};

const drops: Drop[] = [
  // Friday
  {
    day: "This Friday",
    category: "friday",
    title: "The Compliance Arbitrage: $500M Market Going Live Q3 2025",
    summary: "A regulation going live in 6 months that will force 40,000 US mid-market companies to buy compliance software. Nobody has built the SMB-tier product.",
    content: `**The Gap:** The EU AI Act's transparency requirements go live Q3 2025. US companies doing business in Europe must comply. Current compliance vendors charge $50k+/year — priced entirely for Fortune 500.

**The Opportunity:** 40,000 US mid-market companies ($10M–$200M revenue) with EU operations have zero affordable option. Average fine for non-compliance: $7.5M. Average willingness to pay for compliance software: $500–$2,000/month.

**The Build (12 Weeks):**
1. AI model inventory tool — discovers and catalogs all AI systems in use (Week 1–3)
2. Auto-generates required documentation and transparency reports (Week 4–6)
3. Ongoing monitoring dashboard + alert system (Week 7–9)
4. Self-serve onboarding — no sales call required (Week 10–12)

**First Revenue Path:**
- Find 10 mid-market companies with EU operations on LinkedIn
- Subject line: "EU AI Act compliance — Q3 deadline is 6 months away"
- Offer a free "AI system audit" — 2-hour manual consultation
- Convert to $499/month SaaS after the audit

**Claude Prompt to Start:**
"I'm building a SaaS tool to help US mid-market companies comply with the EU AI Act. Generate a comprehensive checklist of all required documentation, transparency reports, and ongoing monitoring requirements. Format as a structured compliance framework."

**TAM:** $500M+ in first 2 years (US companies with EU exposure alone)
**Time to First Dollar:** 2 weeks if you move today.`,
    tags: ["Compliance", "AI Regulation", "SaaS", "B2B"],
  },
  // Mindset drops
  {
    day: "Monday",
    category: "mindset",
    title: "The Identity Shift: Stop Being a Founder. Start Being a CEO.",
    summary: "The single mental shift that separates $1M ARR businesses from $100k ARR side projects.",
    content: `The biggest trap in Year 1: you are still operating as an employee in your own company.

**The Founder Trap:**
Employees optimize for output. CEOs optimize for leverage — systems that produce output without their direct involvement.

Every week you are the bottleneck in your own business, you are the single point of failure. The business cannot grow beyond your personal bandwidth.

**The 3 CEO Questions:**
1. "If I disappeared for 30 days, what would break?" — Everything that breaks is a system you need to build or delegate before Q2.
2. "Who is the one person who, if hired this month, would have the highest multiplier on revenue?" — That is your next hire. Not a developer. Not a designer. The person who multiplies revenue.
3. "What is my company's unfair advantage — the thing a well-funded competitor could not replicate in 18 months?" — If you cannot answer this in 10 seconds, you do not have a moat. Build one.

**The Identity Shift Protocol:**
Each morning: "What is the ONE decision only I can make today?" Make that decision first. Delegate, automate, or delete everything else.

Naval Ravikant: "Specific knowledge cannot be trained. It can only be experienced." Your unique combination of domain knowledge + lived experience IS your unfair advantage. Operate from it ruthlessly.

**The Rule:** Never do the same task manually more than 3 times. If you have done it 3 times, you build the system for it on the 4th.`,
    tags: ["Mindset", "CEO", "Delegation"],
  },
  {
    day: "Thursday",
    category: "mindset",
    title: "The Contrarian Advantage: Why Most Founders Think Like Employees",
    summary: "Conventional thinking produces conventional results. Here is the mental framework that produces outlier outcomes.",
    content: `Paul Graham wrote: "The best ideas look bad from the outside." He was not being philosophical — he was describing market mechanics.

If an idea looks obviously good to everyone, it is already too late. The investors have funded it, the competitors have built it, and the market is crowded. Your edge as an early-stage founder is not having better information — it is having better judgment about *contrarian information*.

**The Contrarian Framework:**
1. **What does everyone in my market believe that I think is wrong?** Write this down. This is your positioning.
2. **What do the best customers in my space want that nobody is building because the market "too small"?** The best opportunities are dismissed by VCs as "not venture scale." They are perfect startup scale.
3. **What is the obvious move that everyone is doing? Do the opposite.** While everyone is building B2B AI tools for enterprise, build the $49/month SMB version. While everyone is going upmarket, go downmarket. While everyone is adding features, remove them.

**The Test:** Can you explain in one sentence why your company exists AND why a smart person would initially disagree with you?

If there is no initial disagreement — you are building in a crowded market with no moat.
If there is too much disagreement — you may be too early.
The sweet spot is the idea that makes smart people say: "Interesting. I am not sure that works." That is where the opportunity is.`,
    tags: ["Contrarian", "Positioning", "Strategy"],
  },
  // Mental Health drops
  {
    day: "Tuesday",
    category: "mental",
    title: "The Founder's Decision Fatigue Protocol",
    summary: "You make 500 decisions per day. By 3pm, your prefrontal cortex is running on fumes. Here is how to protect your highest-leverage hours.",
    content: `Stanford research: humans have approximately 35,000 decisions per day. Founders make an estimated 500+ conscious business decisions daily. Decision fatigue is not motivational — it is neurological.

**The Protocol:**

**Morning Block (7am–12pm):** Zero meetings. Zero Slack. Zero email. This is your Strategic Window — the only time your prefrontal cortex is at full capacity. Use it for: strategy decisions, product architecture, writing, investor conversations.

**The Decision Menu:** For every recurring choice — what to eat, when to exercise, what to wear — create a "decision menu" and remove the choice. Barack Obama's wardrobe: identical grey suits. Mark Zuckerberg: grey t-shirts. This is not fashion. It is cognitive resource management.

**The 3-Line End-of-Day Brain Dump:**
1. What worked today?
2. What did not work?
3. What one decision do I need to make tomorrow?

Write these down in < 3 minutes. This clears cognitive residue and eliminates the "mental tab" that keeps you awake at 2am.

**The Rule:** Your highest-leverage work goes in the first 4 hours of your day. Everything else — meetings, email, admin — is scheduled around that block. Never around it.

Naval Ravikant: "The most important decisions of your life are made in moments of clarity, not urgency." You must engineer the clarity deliberately. It does not happen by accident.`,
    tags: ["Mental Health", "Productivity", "Decision-Making"],
  },
  {
    day: "Saturday",
    category: "mental",
    title: "Building Founder Resilience: The Protocol That Actually Works",
    summary: "Most resilience advice is useless. Here is the evidence-based protocol for staying operational through the hard periods.",
    content: `The average successful startup takes 7 years from founding to liquidity event. The founders who make it do not have more willpower. They have better systems for managing the periods of low revenue, high uncertainty, and zero external validation.

**What Resilience Actually Is:**
It is not the ability to feel nothing. It is the ability to feel everything — including the fear, the doubt, the loneliness — and continue operating anyway. The goal is not to eliminate negative emotion. It is to reduce the time between the hard moment and the return to operational clarity.

**The 3-Component Resilience Stack:**

**Component 1: The Hard-Day Ritual**
A non-negotiable activity you perform on hard days. Not when you feel like it — specifically when you do not. For some founders: a 5km run. For others: calling one mentor. For others: 20 minutes of journaling. The activity is not important. The non-negotiability is. This one ritual teaches your nervous system that you can survive hard days — because you are doing it again.

**Component 2: The Identity Separation**
Your MRR going up does not make you a good person. Your MRR going down does not make you a failure. You are a person who happens to be building a company. The moment you attach your identity to your metrics, every down month becomes an existential crisis. Every down month is just data.

**Component 3: The Horizon Exercise**
Every Sunday: write down one thing you are proud of from the past week that has nothing to do with revenue or product. It can be as simple as "I had one genuinely good conversation." This builds a evidence-base of progress that exists independently of your cap table.

Endurance is not willpower. It is system design.`,
    tags: ["Resilience", "Mental Health", "Founder Psychology"],
  },
  // Physical drops
  {
    day: "Wednesday",
    category: "physical",
    title: "The Minimum Effective Dose: 3 Hours/Week That Changes Everything",
    summary: "Stanford research defines the exact exercise protocol that maximizes cognitive output and longevity. It fits in 3 hours/week.",
    content: `Andrew Huberman (Stanford neuroscientist): 180 minutes of Zone 2 cardio per week + 3 resistance training sessions produces the same cognitive and longevity outcomes as twice the volume at higher intensity.

**What Zone 2 Cardio Is:**
Conversational pace. You can speak in full sentences but are slightly breathless. Heart rate: approximately 60–70% of max. This is NOT the "go hard" gym session. It is a 20–30 minute morning walk at a brisk but sustainable pace.

**The Founder Stack (3 Hours/Week Total):**

**3× 20-min Zone 2 Sessions (Mon/Wed/Fri mornings):**
Brisk walk. Podcast or focused thinking. Non-negotiable.

**3× 30-min Resistance Sessions (Tue/Thu/Sat):**
4 compound movements only — squat, deadlift, press, row. Sets of 8–12. No isolation exercises. No fancy programming. Just the 4 movements, 3 sets each, progressive overload every week.

**The Cognitive Compound:**
Consistent low-intensity cardiovascular exercise grows new neurons in the hippocampus — the region responsible for pattern recognition and decision-making. You are literally growing your competitive advantage with each Zone 2 session.

**The Non-Negotiable Rule:**
Never cancel. Reduce intensity if needed. Never cancel.

A 10-minute walk at 70% effort beats a cancelled gym session at 100% intended effort every single time.

**Product Recommendation:**
Apple Watch or Garmin Forerunner — for heart rate zones. Knowing you are in Zone 2 (vs. Zone 3) is the difference between the right stimulus and wasted effort.`,
    tags: ["Physical Health", "Exercise", "Cognitive Performance"],
    product: "Garmin Forerunner 265 — tracks Zone 2 automatically",
  },
  {
    day: "Sunday",
    category: "physical",
    title: "Sleep as a Performance Stack: The Founder's Non-Negotiable",
    summary: "Matthew Walker's research is unambiguous. Insufficient sleep is the single highest-risk performance variable for founders.",
    content: `Matthew Walker (UC Berkeley sleep scientist, author of *Why We Sleep*): After 17 hours of wakefulness, your cognitive performance is equivalent to a 0.05% blood alcohol level. After 24 hours: equivalent to legally drunk.

Most founders operate at 5–6 hours/night and believe they are performing at capacity. They are not.

**The Founder Sleep Protocol:**

**The Non-Negotiable:** 7–9 hours. Non-negotiable. If your business requires consistently less than 7 hours of sleep to function, it is not a scaling problem — it is a systems problem. Fix the system.

**The Temperature Rule:** Your core body temperature needs to drop 1–2°C to initiate sleep. Keep your bedroom at 65–68°F (18–20°C). This single change improves sleep quality for most people within 3 nights.

**The 90-Minute Rule:** No caffeine within 90 minutes of waking (adenosine builds up during sleep — caffeine that early blocks the natural wakefulness signal and crashes you at 2pm). No screens within 60 minutes of sleep (blue light delays melatonin by 90+ minutes).

**The Recovery Metric:**
Track HRV (heart rate variability). When your HRV is high, your nervous system is recovered and you can push hard. When HRV is low, recover — reduce cognitive load, do Zone 2 only, no major decisions. Your data tells you when to sprint and when to rest. This is elite athlete methodology applied to knowledge work.

**Product Recommendation:**
Oura Ring — tracks HRV, sleep stages, and readiness score automatically. One number each morning tells you how hard you can push that day.`,
    tags: ["Sleep", "Recovery", "Performance"],
    product: "Oura Ring Gen 3 — HRV + sleep tracking",
  },
  // Scaling drops
  {
    day: "Tuesday",
    category: "scaling",
    title: "The $0 to $1M ARR Playbook: The Exact Sequence",
    summary: "The specific phases, metrics, and decision points between zero and $1M ARR. No fluff.",
    content: `Most founders know what $1M ARR looks like. Almost none know the exact decision tree to get there.

**Phase 1: $0 → $10k MRR (Months 1–3)**
*The only metric that matters: paying customers*
- 50 DMs/week targeting specific people with the exact problem
- Sell the outcome manually before writing code
- Founding member close: 50% lifetime discount + 30-min/month feedback call
- 10 paying customers = you have a business. Not a product. A business.

**Phase 2: $10k → $50k MRR (Months 4–8)**
*The only metric that matters: Day-30 retention*
- If 40%+ of users are still active at Day 30: scale acquisition
- If below 40%: stop all acquisition. Fix retention first.
- First hire: a CS person who becomes your customer intelligence pipeline
- Referral system launch: every customer gets a referral link + incentive at Day 30

**Phase 3: $50k → $100k MRR (Months 9–14)**
*The only metric that matters: CAC payback period*
- CAC payback < 6 months = aggressive growth mode
- CAC payback 6–12 months = optimize before scaling
- CAC payback 12+ months = do not run paid ads yet
- First paid channel test: $2k/month, 60 days, clear success metric

**Phase 4: $100k → $1M MRR (Months 15–30)**
*The only metric that matters: revenue per employee*
- Every new hire must increase revenue/employee or the hire is wrong
- Hire for roles where you are the bottleneck — not roles you enjoy doing
- Board formation: 2 independent directors minimum at $500k MRR

**The Rule That Governs All Phases:**
Fix retention before scaling acquisition. Every time. Without exception.`,
    tags: ["Scaling", "MRR", "Growth", "Revenue"],
  },
  {
    day: "Friday",
    category: "scaling",
    title: "The Growth Loop Architecture: Engineering Compounding Without Ads",
    summary: "The difference between a funnel and a loop. Funnels end. Loops compound.",
    content: `Most founders build funnels. Every marketing book teaches funnels. The problem with funnels: they require constant input (ad spend, content, cold outreach) to produce output. Remove the input, and the funnel produces nothing.

Loops are different. A properly engineered growth loop accelerates with scale — the more users you have, the more new users the system generates automatically.

**The 3 Core Loop Types:**

**Viral Loop:**
User gets value → Shares with relevant contact → Contact becomes user → Generates more shares
Benchmark: viral coefficient > 0.15 means meaningful organic amplification
Example: Slack — you can not use it alone, so every user who joins has an incentive to invite teammates

**Content Loop:**
Founder creates authoritative content → Content attracts ICP → ICP becomes customer → Customer case study becomes content
Example: The exact system we use at The Builder Brief

**Product Loop:**
User completes an action → Action generates an artifact worth sharing → Artifact is shared → Viewer becomes user
Example: Canva designs. Figma prototypes. Loom videos.

**Diagnose Your Current Loop:**
1. Is there any mechanism by which your current users bring in new users without you doing additional work?
2. If all acquisition spend stopped tomorrow, would the business still grow? By how much?

If the answer to #1 is no: you do not have a loop. You have a funnel. Build the loop before you scale the funnel.

**The Minimum Viable Loop:**
Day 30 trigger email → "Here is the result you achieved with [product]. If you know someone with the same problem, here is their link." 3-5% of users will share. At 1,000 users, that is 30–50 warm referrals per month at $0 ad spend.`,
    tags: ["Growth Loops", "Virality", "Compounding", "Zero CAC"],
  },
];

const CATEGORY_ORDER: DropCategory[] = ["friday", "mindset", "mental", "physical", "scaling"];

export default function DailyDrops() {
  const { tier, isPremium, tierLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<DropCategory>("friday");
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);

  const isPro = tierLoading ? true : isPremium;

  if (!isPro && !tierLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <PortalNav activePage="daily-drops" />
        <main className="max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">PRO & MAX EXCLUSIVE</Badge>
          <h1 className="font-serif text-4xl mb-4">Daily Drops</h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Five curated drops per week: startup intelligence, entrepreneur mindset, mental health, physical performance, and scaling systems. Pro and Max members only.
          </p>
          <button
            onClick={() => setLocation("/dashboard")}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Upgrade to Pro →
          </button>
        </main>
      </div>
    );
  }

  const categoryDrops = drops.filter(d => d.category === activeCategory);
  const meta = categoryMeta[activeCategory];
  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="daily-drops" />

      {/* Drop Fullscreen Viewer */}
      <AnimatePresence>
        {selectedDrop && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[100] bg-background/96 backdrop-blur-3xl overflow-y-auto"
          >
            <div className="max-w-[820px] mx-auto min-h-screen bg-card border-x border-border shadow-2xl">
              <div className="sticky top-0 bg-card/90 backdrop-blur-xl border-b border-border px-8 py-5 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-2 ${meta.bg} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg tracking-tight">{selectedDrop.title}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{meta.label}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDrop(null)} className="px-5 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest rounded-full hover:opacity-80">
                  Close
                </button>
              </div>

              <div className="p-10 md:p-16">
                <div className="flex gap-2 mb-8">
                  {selectedDrop.tags.map(t => (
                    <Badge key={t} className={`${meta.bg} ${meta.color} border-none text-[9px] tracking-[0.2em]`}>{t}</Badge>
                  ))}
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {selectedDrop.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("**") && para.endsWith("**")) {
                      return <h3 key={i} className="font-serif text-2xl mt-8 mb-4">{para.slice(2, -2)}</h3>;
                    }
                    return (
                      <p key={i} className="text-base leading-loose text-foreground/85 mb-4 font-sans"
                        dangerouslySetInnerHTML={{
                          __html: para
                            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            .replace(/`([^`]+)`/g, '<code class="bg-primary/10 text-primary px-1 rounded">$1</code>')
                        }}
                      />
                    );
                  })}
                </div>

                {selectedDrop.product && (
                  <div className={`mt-10 p-6 ${meta.bg} ${meta.border} border rounded-2xl`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Recommended Tool</p>
                    <p className={`font-medium ${meta.color}`}>{selectedDrop.product}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedDrop.content);
                    toast.success("Drop copied", { description: "Ready to deploy." });
                  }}
                  className={`mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${meta.color} hover:opacity-70 transition-opacity`}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Full Drop
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <button onClick={() => setLocation("/dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-5 h-5 text-primary" />
            <Badge className={`${tier === "max" || tier === "incubator" ? "bg-violet-500/10 text-violet-500 border-violet-500/20" : "bg-primary/10 text-primary border-primary/20"} text-[10px] tracking-[0.3em]`}>
              {tier === "max" || tier === "incubator" ? "MAX EXCLUSIVE" : "PRO EXCLUSIVE"}
            </Badge>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight mb-4">Daily <span className="italic text-primary">Drops.</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Five categories. One drop per day. Every signal curated for founders who are in the arena — not reading about it.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORY_ORDER.map(cat => {
            const m = categoryMeta[cat];
            const CatIcon = m.icon;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? `${m.bg} ${m.color} ${m.border}`
                    : "border-border/40 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <CatIcon className="w-3.5 h-3.5" />
                {m.label.split(" ")[0] === "Friday" ? "Friday Drop" : m.label.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Category header */}
        <div className={`p-8 rounded-2xl ${meta.bg} ${meta.border} border mb-8`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`w-6 h-6 ${meta.color}`} />
            <h2 className={`font-serif text-2xl ${meta.color}`}>{meta.label}</h2>
          </div>
          <p className="text-muted-foreground text-sm">{meta.description}</p>
        </div>

        {/* Drops grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryDrops.map((drop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedDrop(drop)}
              className={`p-8 rounded-[2rem] bg-card border cursor-pointer group hover:${meta.border} transition-all hover:shadow-lg border-border/30`}
            >
              <div className="flex items-start justify-between mb-4">
                <Badge className={`${meta.bg} ${meta.color} border-none text-[9px] tracking-[0.2em]`}>{drop.day}</Badge>
                <ChevronRight className={`w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:${meta.color} transition-all`} />
              </div>
              <h3 className={`font-serif text-xl mb-3 group-hover:${meta.color} transition-colors leading-snug`}>{drop.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{drop.summary}</p>
              {drop.product && (
                <div className="mt-4 pt-4 border-t border-border/20">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Recommended Tool</p>
                  <p className={`text-xs ${meta.color} mt-1 font-medium`}>{drop.product}</p>
                </div>
              )}
              <div className="mt-4 flex gap-1.5">
                {drop.tags.slice(0, 3).map(t => (
                  <Badge key={t} variant="secondary" className="text-[8px] uppercase tracking-wide">{t}</Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-12 p-8 rounded-2xl border border-border/20 bg-card/40 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">New drops unlock daily</p>
          <p className="text-muted-foreground text-sm">Every drop you miss is added to the archive. Access all past drops from your Vault.</p>
        </div>
      </main>
    </div>
  );
}
