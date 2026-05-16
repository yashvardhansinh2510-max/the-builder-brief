# Portal Unification + UX Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse pro-portal and max-portal into one tier-aware dashboard, redesign PortalNav (tabs-in-nav with framer-motion), WelcomeHero (single render, mission-control layout), and IntelligenceFeed (Bloomberg-style signal feed).

**Architecture:** `user-portal.tsx` becomes the single source of truth; all tier-conditional content lives inside six named tabs (`intel | vault | playbook | arsenal | path | alliance`). `PortalNav` owns the tab switching UI and passes `activeTab`/`onTabChange` as props to the parent, which holds the state. `IntelligenceFeed` is a self-contained data component that fetches `/api/engine/signals` and auto-refreshes.

**Tech Stack:** React + Vite, Framer Motion, Tailwind CSS, Clerk (`UserButton`), shadcn/ui Sheet, Wouter (`Redirect`), Express (api-server).

---

## File Map

| Action | Path |
|--------|------|
| **Modify** | `artifacts/api-server/src/routes/engine.ts` |
| **Rewrite** | `artifacts/specflow-newsletter/src/components/portal/IntelligenceFeed.tsx` |
| **Rewrite** | `artifacts/specflow-newsletter/src/components/portal/WelcomeHero.tsx` |
| **Rewrite** | `artifacts/specflow-newsletter/src/components/PortalNav.tsx` |
| **Modify** | `artifacts/specflow-newsletter/src/pages/user-portal.tsx` |
| **Modify** | `artifacts/specflow-newsletter/src/App.tsx` |
| **Delete** | `artifacts/specflow-newsletter/src/pages/pro-portal.tsx` |
| **Delete** | `artifacts/specflow-newsletter/src/pages/max-portal.tsx` |

---

## Task 1: Add `/signals` endpoint to engine.ts

**Files:**
- Modify: `artifacts/api-server/src/routes/engine.ts` — add GET `/signals` returning mock signal data

- [ ] **Step 1: Add the signals endpoint after existing routes**

Open `artifacts/api-server/src/routes/engine.ts`. Before the final `export default router;` line, add:

```ts
router.get("/signals", async (_req: Request, res: Response): Promise<void> => {
  const now = Date.now();
  const h = (n: number) => new Date(now - n * 60 * 60 * 1000).toISOString();
  const signals = [
    { id: "s1", platform: "reddit", headline: "Founders ditching SaaS tiers for usage-based pricing — thread explodes with 400 comments", url: "https://reddit.com/r/startups", publishedAt: h(1), topic: "pricing", relevanceScore: 0.88 },
    { id: "s2", platform: "hn", headline: "Ask HN: Has anyone successfully built a bootstrapped B2B product in 2025?", url: "https://news.ycombinator.com", publishedAt: h(2), topic: "bootstrapping", relevanceScore: 0.75 },
    { id: "s3", platform: "youtube", headline: "How I hit $10K MRR in 90 days with cold email — full breakdown", url: "https://youtube.com", publishedAt: h(3), topic: "cold-email", relevanceScore: 0.91 },
    { id: "s4", platform: "ph", headline: "LaunchKit — Ship your SaaS in 48 hours (featured on Product Hunt)", url: "https://producthunt.com", publishedAt: h(5), topic: "tools", relevanceScore: 0.62 },
    { id: "s5", platform: "linkedin", headline: "Why I turned down a $2M seed round and stayed default-alive", url: "https://linkedin.com", publishedAt: h(6), topic: "fundraising", relevanceScore: 0.79 },
    { id: "s6", platform: "reddit", headline: "What's the best tech stack for a solo founder in 2025? r/SaaS weekly thread", url: "https://reddit.com/r/SaaS", publishedAt: h(8), topic: "tech-stack", relevanceScore: 0.54 },
    { id: "s7", platform: "hn", headline: "Show HN: I automated my entire customer onboarding with n8n", url: "https://news.ycombinator.com", publishedAt: h(10), topic: "automation", relevanceScore: 0.68 },
    { id: "s8", platform: "reddit", headline: "Cold email open rates are down 40% — what's actually working now", url: "https://reddit.com/r/Entrepreneur", publishedAt: h(12), topic: "cold-email", relevanceScore: 0.87 },
    { id: "s9", platform: "youtube", headline: "The 'Wedge Strategy' — how to beat big competitors by going small first", url: "https://youtube.com", publishedAt: h(14), topic: "gtm", relevanceScore: 0.73 },
    { id: "s10", platform: "ph", headline: "Notion-killer or niche tool? Founders debate the category-creation playbook", url: "https://producthunt.com", publishedAt: h(20), topic: "positioning", relevanceScore: 0.58 },
  ];
  res.json({ signals });
});
```

- [ ] **Step 2: Restart api-server and verify endpoint**

```bash
cd "artifacts/api-server" && curl -s http://localhost:3001/api/engine/signals | head -c 200
```
Expected: JSON with `signals` array containing 10 items.

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/engine.ts
git commit -m "feat: add GET /api/engine/signals stub endpoint with mock data"
```

---

## Task 2: Rewrite IntelligenceFeed.tsx

**Files:**
- Rewrite: `artifacts/specflow-newsletter/src/components/portal/IntelligenceFeed.tsx`

- [ ] **Step 1: Replace the entire file with the Bloomberg-style feed**

```tsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Flame, RefreshCw, AlertTriangle } from "lucide-react";
import FounderChat from "@/components/FounderChat";
import DailyBriefUI from "@/components/DailyBriefUI";
import PersonalizationUI from "@/components/PersonalizationUI";
import type { StartupContext } from "@/lib/startup-context";

type Platform = "reddit" | "youtube" | "hn" | "ph" | "linkedin";
type FilterKey = "all" | Platform;

interface Signal {
  id: string;
  platform: Platform;
  headline: string;
  url: string;
  publishedAt: string;
  topic?: string;
  relevanceScore?: number;
}

interface IntelligenceFeedProps {
  tier: string;
  isPro: boolean;
  startupCtx: StartupContext | null;
  chatUsageThisMonth: number;
  onChatUsageUpdate: (next: number) => void;
  onShowContextModal: () => void;
  onUpgradeClick: () => void;
}

const MOCK_SIGNALS: Signal[] = [
  { id: "s1", platform: "reddit", headline: "Founders ditching SaaS tiers for usage-based pricing — thread explodes with 400 comments", url: "https://reddit.com/r/startups", publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(), topic: "pricing", relevanceScore: 0.88 },
  { id: "s2", platform: "hn", headline: "Ask HN: Has anyone successfully built a bootstrapped B2B product in 2025?", url: "https://news.ycombinator.com", publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(), topic: "bootstrapping", relevanceScore: 0.75 },
  { id: "s3", platform: "youtube", headline: "How I hit $10K MRR in 90 days with cold email — full breakdown", url: "https://youtube.com", publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(), topic: "cold-email", relevanceScore: 0.91 },
  { id: "s4", platform: "ph", headline: "LaunchKit — Ship your SaaS in 48 hours (featured on Product Hunt)", url: "https://producthunt.com", publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(), topic: "tools", relevanceScore: 0.62 },
  { id: "s5", platform: "linkedin", headline: "Why I turned down a $2M seed round and stayed default-alive", url: "https://linkedin.com", publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(), topic: "fundraising", relevanceScore: 0.79 },
  { id: "s6", platform: "reddit", headline: "What's the best tech stack for a solo founder in 2025? r/SaaS weekly thread", url: "https://reddit.com/r/SaaS", publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(), topic: "tech-stack", relevanceScore: 0.54 },
  { id: "s7", platform: "hn", headline: "Show HN: I automated my entire customer onboarding with n8n", url: "https://news.ycombinator.com", publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(), topic: "automation", relevanceScore: 0.68 },
  { id: "s8", platform: "reddit", headline: "Cold email open rates are down 40% — what's actually working now", url: "https://reddit.com/r/Entrepreneur", publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(), topic: "cold-email", relevanceScore: 0.87 },
  { id: "s9", platform: "youtube", headline: "The 'Wedge Strategy' — how to beat big competitors by going small first", url: "https://youtube.com", publishedAt: new Date(Date.now() - 14 * 3600000).toISOString(), topic: "gtm", relevanceScore: 0.73 },
  { id: "s10", platform: "ph", headline: "Notion-killer or niche tool? Founders debate the category-creation playbook", url: "https://producthunt.com", publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(), topic: "positioning", relevanceScore: 0.58 },
];

const PLATFORM_META: Record<Platform, { label: string; color: string; bg: string }> = {
  reddit:  { label: "Reddit",        color: "text-orange-600",  bg: "bg-orange-500/10 border-orange-500/20" },
  youtube: { label: "YouTube",       color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20" },
  hn:      { label: "HN",            color: "text-amber-600",   bg: "bg-amber-500/10 border-amber-500/20" },
  ph:      { label: "Product Hunt",  color: "text-orange-500",  bg: "bg-orange-400/10 border-orange-400/20" },
  linkedin:{ label: "LinkedIn",      color: "text-blue-500",    bg: "bg-blue-500/10 border-blue-500/20" },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "reddit",   label: "Reddit" },
  { key: "youtube",  label: "YouTube" },
  { key: "hn",       label: "HN" },
  { key: "ph",       label: "Product Hunt" },
  { key: "linkedin", label: "LinkedIn" },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function detectTrends(signals: Signal[]): string[] {
  const cutoff = Date.now() - 24 * 3600000;
  const recent = signals.filter((s) => new Date(s.publishedAt).getTime() > cutoff);
  const counts: Record<string, number> = {};
  for (const s of recent) {
    if (s.topic) counts[s.topic] = (counts[s.topic] ?? 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, n]) => n >= 3)
    .map(([topic]) => topic)
    .slice(0, 2);
}

export default function IntelligenceFeed({
  tier,
  isPro,
  startupCtx,
  chatUsageThisMonth,
  onChatUsageUpdate,
  onShowContextModal,
  onUpgradeClick,
}: IntelligenceFeedProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch("/api/engine/signals");
      if (!res.ok) throw new Error("not ok");
      const data = await res.json();
      setSignals(data.signals ?? MOCK_SIGNALS);
    } catch {
      setSignals(MOCK_SIGNALS);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const id = setInterval(fetchSignals, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchSignals]);

  const filtered = filter === "all" ? signals : signals.filter((s) => s.platform === filter);
  const trendTopics = detectTrends(signals);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl tracking-tight">Market Intelligence</h2>
          {lastUpdated && (
            <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 uppercase tracking-widest">
              Updated {relativeTime(lastUpdated.toISOString())}
            </p>
          )}
        </div>
        <button
          onClick={fetchSignals}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all w-fit"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Source filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Trend spike alerts */}
      <AnimatePresence>
        {trendTopics.map((topic) => (
          <motion.div
            key={topic}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-0.5">
                TREND DETECTED
              </p>
              <p className="text-sm text-foreground capitalize">
                3+ signals on <span className="font-bold">{topic.replace("-", " ")}</span> in the last 24h. This category is heating up.
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Feed list */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-card/40 animate-pulse border border-border/20" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-20 text-center rounded-3xl border border-border/20 bg-card/20">
          <p className="font-serif text-2xl mb-3 text-muted-foreground">No signals yet.</p>
          <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto leading-relaxed">
            The AI is scanning Reddit, HN, YouTube, and Product Hunt. Check back in a few hours.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((signal, i) => {
            const meta = PLATFORM_META[signal.platform];
            const isRelevant = (signal.relevanceScore ?? 0) >= 0.7 && startupCtx !== null;
            return (
              <motion.a
                key={signal.id}
                href={signal.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-card/40 border border-border/20 hover:border-primary/20 hover:bg-card/60 transition-all group block"
              >
                <div className={`shrink-0 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {signal.headline}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {relativeTime(signal.publishedAt)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-mono truncate max-w-[180px]">
                      {new URL(signal.url).hostname}
                    </span>
                    {isRelevant && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        <Flame className="w-2.5 h-2.5" /> Relevant
                      </span>
                    )}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      )}

      {/* Pro-gated: DailyBriefUI + PersonalizationUI */}
      {isPro && (
        <div className="pt-4 border-t border-border/20 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">Today's Brief</p>
            <DailyBriefUI />
          </div>
          <div className="lg:col-span-4">
            <PersonalizationUI />
          </div>
        </div>
      )}

      {/* Free: upgrade nudge */}
      {tier === "free" && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <p className="font-serif text-2xl mb-3 italic text-primary">Stop reading. Start building.</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            Pro gives you the full signal feed, personalized briefings, and competitive analysis.
          </p>
          <button
            onClick={onUpgradeClick}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            See What You're Missing →
          </button>
        </div>
      )}

      {/* AI Advisor chat — Pro/Max only */}
      {isPro && (
        <div id="ai-advisor-chat">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">AI Advisor</p>
          <FounderChat usedThisMonth={chatUsageThisMonth} onUsageUpdate={onChatUsageUpdate} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "artifacts/specflow-newsletter" && npx tsc --noEmit 2>&1 | grep IntelligenceFeed
```
Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/portal/IntelligenceFeed.tsx
git commit -m "feat: redesign IntelligenceFeed as Bloomberg-style market signal feed"
```

---

## Task 3: Rewrite WelcomeHero.tsx

**Files:**
- Rewrite: `artifacts/specflow-newsletter/src/components/portal/WelcomeHero.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import { motion } from "framer-motion";
import { Flame, Lock } from "lucide-react";
import type { Reward } from "@/lib/rewards";

interface WelcomeHeroProps {
  tier: string;
  firstName: string;
  streak: number;
  chatUsageThisMonth: number;
  eligibleReward: Reward | null;
  nextReward: Reward | null;
  onClaimReward: (reward: Reward) => void;
}

function getDateLine(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const month = now.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const day = now.getDate();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${weekday}, ${month} ${day} — WEEK ${week}`;
}

function daysUntilFriday(): number {
  const day = new Date().getDay(); // 0=Sun ... 5=Fri
  return day <= 5 ? 5 - day : 7 - day + 5;
}

const SUBTITLES: Record<string, string> = {
  free:       "Next drop lands Friday.",
  pro:        "Vault is live. Signals are in.",
  max:        "Your advisor is standing by.",
  incubator:  "Your advisor is standing by.",
};

const ACTION_LINKS: Record<string, { label: string; href: string }[]> = {
  free: [
    { label: "Open the Vault →",   href: "/dashboard?tab=vault" },
    { label: "See Blueprints →",   href: "/blueprints" },
  ],
  pro: [
    { label: "Open Briefing →",    href: "/dashboard?tab=intel" },
    { label: "Full Vault →",       href: "/dashboard?tab=vault" },
  ],
  max: [
    { label: "Book AI Session →",  href: "#ai-advisor-chat" },
    { label: "Inner Circle →",     href: "/dashboard?tab=alliance" },
  ],
  incubator: [
    { label: "Book AI Session →",  href: "#ai-advisor-chat" },
    { label: "Inner Circle →",     href: "/dashboard?tab=alliance" },
  ],
};

export default function WelcomeHero({
  tier,
  firstName,
  streak,
  chatUsageThisMonth,
  eligibleReward,
  nextReward,
  onClaimReward,
}: WelcomeHeroProps) {
  const subtitle = SUBTITLES[tier] ?? SUBTITLES.free;
  const links = ACTION_LINKS[tier] ?? ACTION_LINKS.free;
  const isMax = tier === "max" || tier === "incubator";
  const isPro = tier === "pro" || isMax;
  const vaultStatus = isPro ? "LIVE" : "LOCKED";
  const dropDays = daysUntilFriday();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start"
    >
      {/* LEFT — 60% */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60 mb-5">
          {getDateLine()}
        </p>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-4">
          Good to have you back,{" "}
          <span className="italic text-primary">{firstName}.</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity border-b border-primary/30 hover:border-primary pb-0.5"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* RIGHT — 40% */}
      <div className="w-full lg:w-[40%] shrink-0 relative">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Streak */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Streak</p>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="font-serif text-3xl text-primary">{streak}</span>
              </div>
            </div>

            {/* Vault */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Vault</p>
              <div className="flex items-center gap-1.5">
                {!isPro && <Lock className="w-3.5 h-3.5 text-zinc-600" />}
                <span className={`font-mono text-lg font-bold ${isPro ? "text-emerald-400" : "text-zinc-600"}`}>
                  {vaultStatus}
                </span>
              </div>
            </div>

            {/* Next Drop */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Next Drop</p>
              <p className="font-mono text-lg font-bold text-white">
                {dropDays === 0 ? "TODAY" : `${dropDays}d`}
              </p>
            </div>

            {/* AI Advisor (max only) or empty slot */}
            {isMax ? (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">AI Advisor</p>
                <p className="font-mono text-lg font-bold text-white">
                  {Math.max(0, 20 - chatUsageThisMonth)}
                  <span className="text-xs text-zinc-500 ml-1">sess</span>
                </p>
              </div>
            ) : (
              nextReward && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Next Reward</p>
                  <p className="font-mono text-xs text-zinc-400">
                    Day {nextReward.day}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Reward overlay */}
        {eligibleReward && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 bg-primary/95 backdrop-blur-xl rounded-2xl p-6 text-primary-foreground shadow-[0_0_50px_rgba(249,115,22,0.3)] border border-white/20 flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70 mb-2">
                MILESTONE UNLOCKED: DAY {eligibleReward.day}
              </p>
              <h4 className="font-serif text-2xl leading-tight">{eligibleReward.title}</h4>
            </div>
            <button
              onClick={() => onClaimReward(eligibleReward)}
              className="w-full bg-primary-foreground text-primary text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-primary-foreground/90 transition-all"
            >
              {eligibleReward.actionLabel}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "artifacts/specflow-newsletter" && npx tsc --noEmit 2>&1 | grep WelcomeHero
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/portal/WelcomeHero.tsx
git commit -m "feat: redesign WelcomeHero as unified mission-control header"
```

---

## Task 4: Rewrite PortalNav.tsx

**Files:**
- Rewrite: `artifacts/specflow-newsletter/src/components/PortalNav.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useAuth as useClerkAuth } from "@clerk/react";
import { UserButton } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Flame, Menu, MapPin, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoPath from "@assets/logo.jpg";

export type PortalTab = "intel" | "vault" | "playbook" | "arsenal" | "path" | "alliance";

interface PortalNavProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  streak: number;
  /** Pass activePage for non-dashboard pages that still use PortalNav */
  activePage?: string;
}

const TAB_DEFS: { id: PortalTab; label: string }[] = [
  { id: "intel",    label: "Intel" },
  { id: "vault",    label: "Vault" },
  { id: "playbook", label: "Playbook" },
  { id: "arsenal",  label: "Arsenal" },
  { id: "path",     label: "Path" },
  { id: "alliance", label: "Alliance" },
];

const TIER_COLORS: Record<string, string> = {
  free:      "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  pro:       "bg-amber-500/10 text-amber-600 border-amber-500/20",
  max:       "bg-primary/10 text-primary border-primary/30",
  incubator: "bg-primary/10 text-primary border-primary/30",
};

export default function PortalNav({ activeTab, onTabChange, streak, activePage }: PortalNavProps) {
  const { tier, isPremium } = useAuth();
  const { isSignedIn } = useClerkAuth();
  const [, setLocation] = useLocation();
  const [solid, setSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isTabLocked(id: PortalTab): boolean {
    if (id === "playbook" || id === "arsenal") return !isPremium;
    if (id === "alliance") return tier !== "max" && tier !== "incubator";
    return false;
  }

  function handleTabClick(id: PortalTab) {
    if (isTabLocked(id)) {
      setLocation("/pricing");
      return;
    }
    onTabChange(id);
    setMobileOpen(false);
  }

  const tierColor = TIER_COLORS[tier] ?? TIER_COLORS.free;
  const showUpgrade = tier === "free" || tier === "pro";

  return (
    <>
      {/* Main nav bar */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-[60px] flex items-center px-4 sm:px-6 md:px-10 transition-all duration-200 ${
          solid
            ? "bg-background border-b border-border/40"
            : "bg-background/80 backdrop-blur-xl"
        }`}
      >
        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src={logoPath}
            alt="The Builder Brief"
            className="w-8 h-8 rounded-sm object-cover group-hover:scale-105 transition-transform"
          />
          <span className="font-serif text-lg font-medium tracking-tight hidden sm:block">
            The Builder Brief
          </span>
        </Link>

        {/* CENTER: Tab nav (desktop only) */}
        <div className="hidden lg:flex items-center gap-1 mx-auto relative">
          {TAB_DEFS.map((tab) => {
            const locked = isTabLocked(tab.id);
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                  locked
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {locked && <Lock className="w-2.5 h-2.5" />}
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="portal-tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT: Tier + streak + avatar + upgrade */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Tier badge */}
          {isSignedIn && (
            <Badge
              variant="outline"
              className={`hidden sm:flex px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${tierColor}`}
            >
              {tier.toUpperCase()}
            </Badge>
          )}

          {/* Streak */}
          {isSignedIn && streak > 0 && (
            <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-primary">
              <Flame className="w-3.5 h-3.5 fill-primary" />
              {streak}
            </div>
          )}

          {/* Clerk user button (avatar + dropdown) */}
          {isSignedIn && (
            <UserButton afterSignOutUrl="/" />
          )}

          {/* Upgrade CTA */}
          {isSignedIn && showUpgrade && (
            <button
              onClick={() => setLocation("/pricing")}
              className="hidden md:flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm"
            >
              Upgrade
            </button>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 rounded-lg hover:bg-card transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-6">
              <div className="flex items-center gap-2.5 mb-8">
                <img src={logoPath} alt="" className="w-8 h-8 rounded-sm object-cover" />
                <span className="font-serif text-lg font-medium">The Builder Brief</span>
              </div>

              <div className="space-y-1 mb-6">
                {TAB_DEFS.map((tab) => {
                  const locked = isTabLocked(tab.id);
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-left transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : locked
                          ? "text-muted-foreground/30"
                          : "text-muted-foreground hover:bg-card hover:text-foreground"
                      }`}
                    >
                      {locked && <Lock className="w-3 h-3" />}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {isSignedIn && (
                <div className="pt-4 border-t border-border/20 space-y-3">
                  <Badge variant="outline" className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest ${tierColor}`}>
                    {tier.toUpperCase()}
                  </Badge>
                  {showUpgrade && (
                    <button
                      onClick={() => { setLocation("/pricing"); setMobileOpen(false); }}
                      className="w-full py-3 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Secondary nav — page-level links (below fixed bar) */}
      <div className="fixed top-[60px] inset-x-0 z-40 border-b border-border/20 bg-card/30 backdrop-blur-xl px-4 sm:px-6 md:px-10 py-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <Link href="/blueprints">
          <button className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
            activePage === "blueprints"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
          }`}>
            <BookOpen className="w-3 h-3" /> Build
          </button>
        </Link>
        <Link href="/ground-game">
          <button className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
            activePage === "ground-game"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
          }`}>
            <MapPin className="w-3 h-3" /> Ground Game
          </button>
        </Link>
        <Link href="/archive">
          <button className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
            activePage === "archive"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
          }`}>
            Library
          </button>
        </Link>
        {isSignedIn && isPremium && (
          <>
            <Link href="/daily-drops">
              <button className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activePage === "daily-drops"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
              }`}>
                Daily Drops
              </button>
            </Link>
            <Link href="/build-brief">
              <button className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activePage === "build-brief"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
              }`}>
                Build Brief
              </button>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Fix top padding in user-portal to account for double fixed bar (60px nav + ~40px secondary)**

In `artifacts/specflow-newsletter/src/pages/user-portal.tsx`, update the main element's top padding from `py-12` to `pt-[120px] pb-12`:

```tsx
// Find this line:
<main className="max-w-[1400px] mx-auto px-6 py-12">
// Replace with:
<main className="max-w-[1400px] mx-auto px-6 pt-[120px] pb-12">
```

Also update all other pages that use `PortalNav` (blueprints.tsx, archive.tsx, etc.) to add `pt-[120px]` if they don't already have it. Check with:
```bash
grep -rn "PortalNav" artifacts/specflow-newsletter/src/pages/ | grep -v ".tsx:"
grep -rn "<PortalNav" artifacts/specflow-newsletter/src/pages/
```

For each page using `PortalNav`, change the `py-` or `pt-` on the main wrapper from its current value to at minimum `pt-[120px]`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "artifacts/specflow-newsletter" && npx tsc --noEmit 2>&1 | grep PortalNav
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/PortalNav.tsx artifacts/specflow-newsletter/src/pages/
git commit -m "feat: redesign PortalNav — 60px fixed bar, framer-motion tab indicator, Clerk UserButton"
```

---

## Task 5: Restructure user-portal.tsx

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/user-portal.tsx`

This task has multiple sub-steps. Read the current file carefully before each edit.

### 5a — Update tab state type and default

- [ ] **Step 1: Change `activeTab` state declaration**

Find the current `useState` for `activeTab` (around line 265). Replace it:

```tsx
// BEFORE (current, multi-value type with legacy tabs):
const [activeTab, setActiveTab] = useState<
  | "playbook" | "path" | "vault" | "alliance" | "arsenal" | "performance"
  | "terminal" | "growth" | "engine" | "strategy"
>(tier === "free" ? "performance" : "playbook");

// AFTER:
const [activeTab, setActiveTab] = useState<
  "intel" | "vault" | "playbook" | "arsenal" | "path" | "alliance"
>("intel");
```

- [ ] **Step 2: Update the URL-param tab reader effect**

Find the `useEffect` that reads `?tab=` from URL params and update the valid tab list:

```tsx
// BEFORE:
if (tab && ["playbook","path","vault","alliance","arsenal","performance","terminal","engine","growth","strategy"].includes(tab)) {
  setActiveTab(tab as any);
}

// AFTER:
if (tab && ["intel","vault","playbook","arsenal","path","alliance"].includes(tab)) {
  setActiveTab(tab as any);
}
```

- [ ] **Step 3: Update the PortalNav call in the context gate screen and main render**

Find both `<PortalNav activePage="dashboard" />` calls (one in the context gate, one in main render). Replace both with:

```tsx
<PortalNav
  activeTab={activeTab}
  onTabChange={setActiveTab}
  streak={streak}
  activePage="dashboard"
/>
```

Note: `PortalNav` now accepts `activePage` as an optional secondary-nav prop, so passing it here is fine.

### 5b — Restructure main layout from two-column to full-width

- [ ] **Step 4: Change the outer grid to full-width**

Find:
```tsx
<main className="max-w-[1400px] mx-auto px-6 py-12">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
    {/* Main Content Area (8 columns) */}
    <div className="lg:col-span-8 space-y-12">
```

Replace with:
```tsx
<main className="max-w-[1400px] mx-auto px-6 pt-[120px] pb-12">
  <div className="space-y-12">
    <div className="space-y-12">
```

Then find the closing tags of the old two-column structure. The `<IntelligenceFeed .../>` call (which had `lg:col-span-4`) will be removed from here — it will live inside the Intel tab panel instead. The `</div>` closing the 12-col grid and the outer div need to be cleaned up. The structure becomes:

```tsx
<main className="max-w-[1400px] mx-auto px-6 pt-[120px] pb-12 space-y-12">
  <WelcomeHero ... />
  {/* Venture Hall of Fame */}
  <motion.section ...> ... </motion.section>
  {/* Tab panel */}
  <AnimatePresence mode="wait">
    <motion.div key={activeTab} ...>
      {/* tab content — see 5c */}
    </motion.div>
  </AnimatePresence>
</main>
```

### 5c — Remove legacy tab buttons and build new tab panel

- [ ] **Step 5: Remove the old tab button UI**

Find the tab button row (around `{/* Content Discovery Tabs */}`, line ~897). Remove the entire `<div className="space-y-8">` block that contains:
- The tier-conditional tab button container (`flex items-center gap-2 p-1.5...`)
- All the `<button>` elements for playbook/path/vault/alliance/arsenal/performance/terminal/engine/strategy/growth

Keep the `<AnimatePresence mode="wait">` and the `<motion.div key={activeTab}>` wrapper.

- [ ] **Step 6: Update the tab panel content**

Inside the `<AnimatePresence>/<motion.div key={activeTab}>` block, replace all existing tab conditions with:

```tsx
{/* INTEL TAB */}
{activeTab === "intel" && (
  <IntelligenceFeed
    tier={tier}
    isPro={isPro}
    startupCtx={startupCtx}
    chatUsageThisMonth={chatUsageThisMonth}
    onChatUsageUpdate={(n) => {
      setChatUsageThisMonth(n);
      syncPortalState({ streak, lastVisit: new Date().toDateString(), unlockedItems: isBonusUnlocked ? ["master-blueprint"] : [], completedSteps, deployedArsenal, chatUsage: { [new Date().toISOString().slice(0, 7)]: n } });
    }}
    onShowContextModal={() => setShowContextModal(true)}
    onUpgradeClick={handleUpgradeClick}
  />
)}

{/* VAULT TAB */}
{activeTab === "vault" && (
  <VaultTab isPro={isPro} onUpgradeClick={handleUpgradeClick} />
)}

{/* PLAYBOOK TAB */}
{activeTab === "playbook" && (
  <>
    {!isPro ? (
      <div className="py-24 text-center rounded-[3rem] border border-border/20 bg-card/20">
        <Lock className="w-10 h-10 mx-auto mb-6 text-primary/20" />
        <h3 className="font-serif text-4xl mb-4">Pro & Max only.</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">The Playbook is the execution layer — frameworks for GTM, hiring, and raising capital.</p>
        <button onClick={handleUpgradeClick} className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">Unlock Playbook →</button>
      </div>
    ) : (
      <>
        <PlaybookTab activePlaybook={activePlaybook} isPro={isPro} onLessonOpen={handleLessonOpen} />
        {/* Max-only calculators */}
        {(tier === "max" || tier === "incubator") && (
          <MaxCalculators />
        )}
      </>
    )}
  </>
)}

{/* ARSENAL TAB */}
{activeTab === "arsenal" && (
  <>
    {!isPro ? (
      <div className="py-24 text-center rounded-[3rem] border border-border/20 bg-card/20">
        <Lock className="w-10 h-10 mx-auto mb-6 text-primary/20" />
        <h3 className="font-serif text-4xl mb-4">Pro & Max only.</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">The Arsenal gives you competitive scanning, co-founder matching, and precision execution tools.</p>
        <button onClick={handleUpgradeClick} className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">Unlock Arsenal →</button>
      </div>
    ) : (
      <>
        <ArsenalTab
          products={products}
          ownedProducts={ownedProducts}
          isPro={isPro}
          onDeploy={handleDeploy}
          onUpgradeClick={handleUpgradeClick}
        />
        <CompetitorScanner />
        <CoFounderMatcher />
        <ProCommandField />
      </>
    )}
  </>
)}

{/* PATH TAB */}
{activeTab === "path" && <PathTab />}

{/* ALLIANCE TAB */}
{activeTab === "alliance" && (
  <>
    {tier !== "max" && tier !== "incubator" ? (
      <div className="py-24 text-center rounded-[3rem] border border-border/20 bg-card/20">
        <Lock className="w-10 h-10 mx-auto mb-6 text-primary/20" />
        <h3 className="font-serif text-4xl mb-4">Max only.</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">The Alliance is the inner circle — founders who've raised, exited, and operate at the highest level.</p>
        <button onClick={handleUpgradeClick} className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">Unlock Alliance →</button>
      </div>
    ) : (
      <>
        <AllianceTab
          activeAlliance={activeAlliance}
          myWallProfile={myWallProfile}
          setMyWallProfile={setMyWallProfile}
          setWallMembers={setWallMembers}
          setSelectedMember={setSelectedMember}
          setShowJoinAlliance={setShowJoinAlliance}
          scorecard={scorecard}
          wallMembers={wallMembers}
          session={session}
          user={user}
        />
        <FounderSocialLayer />
      </>
    )}
  </>
)}
```

- [ ] **Step 7: Add MaxCalculators and ProCommandField as inline components above UserPortal**

Add these two local components just above the `export default function UserPortal()` line:

```tsx
// Burn rate / defensibility / exit payout calculators (migrated from max-portal.tsx)
function MaxCalculators() {
  const [burnRate, setBurnRate] = useState(25000);
  const [mrrGrowth, setMrrGrowth] = useState(5000);
  const runwayMonths = burnRate > mrrGrowth ? Math.round(500000 / (burnRate - mrrGrowth)) : Infinity;
  const isDefaultAlive = mrrGrowth >= burnRate;
  const [networkEffects, setNetworkEffects] = useState(50);
  const [switchingCosts, setSwitchingCosts] = useState(50);
  const defensibilityScore = Math.round((networkEffects * 0.6) + (switchingCosts * 0.4));
  const [targetExit, setTargetExit] = useState(25);
  const [equity, setEquity] = useState(80);
  const payout = (targetExit * 1_000_000) * (equity / 100);

  return (
    <div className="space-y-8 pt-8 border-t border-border/20">
      <h3 className="font-serif text-3xl tracking-tight">Max <span className="italic text-primary">Calculators.</span></h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Runway */}
        <div className="p-8 bg-card border border-border rounded-2xl space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Runway Calculator</p>
          <div>
            <label className="text-xs text-muted-foreground">Monthly Burn (₹)</label>
            <input type="number" value={burnRate} onChange={(e) => setBurnRate(+e.target.value)}
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Monthly MRR Growth (₹)</label>
            <input type="number" value={mrrGrowth} onChange={(e) => setMrrGrowth(+e.target.value)}
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div className="pt-2 border-t border-border/30">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Runway</p>
            <p className={`font-serif text-3xl ${isDefaultAlive ? "text-emerald-500" : "text-primary"}`}>
              {isDefaultAlive ? "∞ Default Alive" : `${runwayMonths}mo`}
            </p>
          </div>
        </div>
        {/* Defensibility */}
        <div className="p-8 bg-card border border-border rounded-2xl space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Defensibility Score</p>
          <div>
            <label className="text-xs text-muted-foreground">Network Effects ({networkEffects})</label>
            <input type="range" min={0} max={100} value={networkEffects} onChange={(e) => setNetworkEffects(+e.target.value)} className="w-full mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Switching Costs ({switchingCosts})</label>
            <input type="range" min={0} max={100} value={switchingCosts} onChange={(e) => setSwitchingCosts(+e.target.value)} className="w-full mt-1" />
          </div>
          <div className="pt-2 border-t border-border/30">
            <p className="font-serif text-4xl text-primary">{defensibilityScore}<span className="text-base text-muted-foreground">/100</span></p>
          </div>
        </div>
        {/* Exit payout */}
        <div className="p-8 bg-card border border-border rounded-2xl space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Exit Payout</p>
          <div>
            <label className="text-xs text-muted-foreground">Exit Valuation (${targetExit}M)</label>
            <input type="range" min={1} max={500} value={targetExit} onChange={(e) => setTargetExit(+e.target.value)} className="w-full mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Your Equity ({equity}%)</label>
            <input type="range" min={1} max={100} value={equity} onChange={(e) => setEquity(+e.target.value)} className="w-full mt-1" />
          </div>
          <div className="pt-2 border-t border-border/30">
            <p className="font-serif text-3xl text-primary">
              ${(payout / 1_000_000).toFixed(1)}M
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Command Field tools (migrated from pro-portal.tsx)
function ProCommandField() {
  const [cmdInputs, setCmdInputs] = useState<Record<string, string>>({});
  const [cmdOutputs, setCmdOutputs] = useState<Record<string, string>>({});
  const [cmdLoading, setCmdLoading] = useState<Record<string, boolean>>({});

  const runTool = async (toolId: string, input: string, mockFn: (v: string) => string) => {
    setCmdLoading(p => ({ ...p, [toolId]: true }));
    setCmdOutputs(p => ({ ...p, [toolId]: "" }));
    await new Promise(r => setTimeout(r, 700 + Math.random() * 300));
    setCmdOutputs(p => ({ ...p, [toolId]: mockFn(input) }));
    setCmdLoading(p => ({ ...p, [toolId]: false }));
  };

  const tools = [
    {
      id: "market-signal",
      name: "Market Signal Scanner",
      desc: "Scores a market by demand, timing, and competitive density.",
      placeholder: "Enter a market or keyword (e.g. 'AI scheduling tools')",
      mock: (v: string) =>
        `MARKET: ${v || "Unspecified"}\n\nSignal Score: 78/100\nDemand Trend: ↑ +34% YoY\nCompetitor Density: Medium (12 active players)\n\nTop Signal: B2B buyers in this space increased search intent 3× since Q4. Early-mover window is 6–9 months.`,
    },
    {
      id: "revenue-modeler",
      name: "Revenue Modeler",
      desc: "Projects MRR, ARR, and break-even from price and volume inputs.",
      placeholder: "Price × customers (e.g. '$49 × 200')",
      mock: (v: string) => {
        const parts = v.match(/\$?([\d.]+)\s*[x×]\s*([\d,]+)/i);
        const price = parts ? parseFloat(parts[1]) : 49;
        const vol = parts ? parseInt(parts[2].replace(",", "")) : 200;
        const mrr = price * vol;
        return `INPUTS: $${price}/mo × ${vol} customers\n\nMRR: $${mrr.toLocaleString()}\nARR: $${(mrr * 12).toLocaleString()}\nBreak-even: Month ${Math.ceil(mrr / 5000)}\n\nAt current trajectory, you hit default-alive at month ${Math.ceil(mrr / 5000) + 2}.`;
      },
    },
    {
      id: "competitor-radar",
      name: "Competitor Radar",
      desc: "Surfaces funding stage, pricing signals, and a clear attack vector.",
      placeholder: "Enter a competitor name (e.g. 'Notion', 'Linear')",
      mock: (v: string) =>
        `COMPETITOR: ${v || "Unnamed"}\n\nFunding Stage: Series B\nPricing Signal: $8–$16/seat/month\n\nWeakness: ${v || "They"} over-index on features, under-invest in onboarding. Your attack vector: compress time-to-value to under 72h and document every win publicly.`,
    },
    {
      id: "pitch-stress",
      name: "Pitch Stress-Tester",
      desc: "Hits your pitch headline with the 3 objections every investor will raise.",
      placeholder: "Enter your pitch headline",
      mock: (v: string) =>
        `PITCH: "${v || "Your idea"}"\n\nOBJECTION 1: "Why won't a large player just build this?"\nCOUNTER: They will — in 24 months. First-mover stickiness is documented at 68% annual retention.\n\nOBJECTION 2: "The TAM is too small."\nCOUNTER: Show the wedge, not the ceiling. Series A needs a $100M ARR path.\n\nOBJECTION 3: "Why is your team the one to win this?"\nCOUNTER: Lead with founder-market fit. If you've done the job the product solves, say it.`,
    },
  ];

  return (
    <div className="pt-8 border-t border-border/20 space-y-6">
      <div>
        <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-3">Command Field</Badge>
        <h3 className="font-serif text-3xl tracking-tight">Precision <span className="italic text-primary">Instruments.</span></h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map(tool => (
          <div key={tool.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/70 font-mono mb-1">{tool.desc}</p>
              <h4 className="font-mono text-lg font-bold text-white">{tool.name}</h4>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={cmdInputs[tool.id] ?? ""}
                onChange={e => setCmdInputs(p => ({ ...p, [tool.id]: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") runTool(tool.id, cmdInputs[tool.id] ?? "", tool.mock); }}
                placeholder={tool.placeholder}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/60"
              />
              <button
                onClick={() => runTool(tool.id, cmdInputs[tool.id] ?? "", tool.mock)}
                disabled={cmdLoading[tool.id]}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-40 font-mono"
              >
                {cmdLoading[tool.id] ? "···" : "Run →"}
              </button>
            </div>
            {(cmdLoading[tool.id] || cmdOutputs[tool.id]) && (
              <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs text-green-400 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                {cmdLoading[tool.id] ? (
                  <motion.span animate={{ opacity: [1, 0.2] }} transition={{ repeat: Infinity, duration: 0.7 }}>
                    {">"} Running analysis...
                  </motion.span>
                ) : cmdOutputs[tool.id]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5d — Add missing imports

- [ ] **Step 8: Add imports at top of user-portal.tsx**

Add these imports (if not already present):

```tsx
import CompetitorScanner from "@/components/CompetitorScanner";
import CoFounderMatcher from "@/components/CoFounderMatcher";
import { FounderSocialLayer } from "@/components/FounderSocialLayer";
import DailyBriefUI from "@/components/DailyBriefUI";
import PersonalizationUI from "@/components/PersonalizationUI";
import { Lock } from "lucide-react"; // if not already imported
```

Remove these imports if they were only used by the old IntelligenceFeed sidebar call and legacy tabs:
```tsx
// Remove if no longer used:
import MarketPulseFeed from "@/components/MarketPulseFeed";
```

- [ ] **Step 9: Remove the old IntelligenceFeed call from the 12-col grid**

Find and remove:
```tsx
<IntelligenceFeed
  tier={tier}
  isPro={isPro}
  telemetryLogs={telemetryLogs}
  ...
/>
```
(the old 4-col sidebar call with all the old props). The new IntelligenceFeed is called inside the Intel tab panel (step 6 above).

Also remove state variables that are now fully handled inside `IntelligenceFeed` itself:
- `telemetryLogs` / `setTelemetryLogs` state and its `useEffect`
- The old `engineBusy` state if it was only used in the old "performance" tab (scorecard is now in Path)

Wait — `engineBusy` and `milestoneBusy` are used for the scorecard generate button. If you move the scorecard to PathTab or keep it in the intel area, keep those. For now, keep `engineBusy` since the scorecard UI still exists (it's just inside a tab rather than a dedicated tab). Actually, looking at the spec, there's no "performance" tab anymore. The scorecard content can move into PathTab. Pass `scorecard`, `engineBusy`, `setEngineBusy`, `session` to PathTab or render it inline in the path tab panel. For simplicity, keep `engineBusy`/`milestoneBusy` state in user-portal.

- [ ] **Step 10: Verify TypeScript and check for obvious errors**

```bash
cd "artifacts/specflow-newsletter" && npx tsc --noEmit 2>&1 | head -40
```
Fix any type errors (commonly: prop mismatches after removing old IntelligenceFeed props).

- [ ] **Step 11: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/user-portal.tsx
git commit -m "feat: unify portals into single tier-aware dashboard with 6-tab system"
```

---

## Task 6: Update App.tsx and delete old portal files

**Files:**
- Modify: `artifacts/specflow-newsletter/src/App.tsx`
- Delete: `artifacts/specflow-newsletter/src/pages/pro-portal.tsx`
- Delete: `artifacts/specflow-newsletter/src/pages/max-portal.tsx`

- [ ] **Step 1: Update App.tsx imports — remove ProPortal and MaxPortal**

Find and remove these lines in App.tsx:
```tsx
import ProPortal from "@/pages/pro-portal";
import MaxPortal from "@/pages/max-portal";
```

- [ ] **Step 2: Remove the ProtectedProPortal and ProtectedMaxPortal wrappers**

Find and remove:
```tsx
const ProtectedProPortal = (props: any) => <TierProtectedRoute component={ProPortal} allowedTiers={['pro', 'max', 'incubator']} {...props} />;
const ProtectedMaxPortal = (props: any) => <TierProtectedRoute component={MaxPortal} allowedTiers={['max', 'incubator']} {...props} />;
```

- [ ] **Step 3: Replace the route declarations with Redirect**

Find:
```tsx
<Route path="/pro-portal" component={ProtectedProPortal} />
<Route path="/max-portal" component={ProtectedMaxPortal} />
```

Replace with:
```tsx
<Route path="/pro-portal"><Redirect to="/dashboard" /></Route>
<Route path="/max-portal"><Redirect to="/dashboard" /></Route>
```

Verify `Redirect` is already imported from `wouter` (it is — it's used in the existing `HomeRedirect`).

- [ ] **Step 4: Delete the old portal files**

```bash
rm "artifacts/specflow-newsletter/src/pages/pro-portal.tsx"
rm "artifacts/specflow-newsletter/src/pages/max-portal.tsx"
```

- [ ] **Step 5: Final TypeScript check**

```bash
cd "artifacts/specflow-newsletter" && npx tsc --noEmit 2>&1 | head -40
```
Expected: no output (no errors).

- [ ] **Step 6: Commit**

```bash
git add artifacts/specflow-newsletter/src/App.tsx
git rm artifacts/specflow-newsletter/src/pages/pro-portal.tsx artifacts/specflow-newsletter/src/pages/max-portal.tsx
git commit -m "feat: remove pro-portal and max-portal, redirect to /dashboard"
```

---

## Task 7: Smoke test in browser

- [ ] **Step 1: Start dev server**

```bash
cd "artifacts/specflow-newsletter" && pnpm dev
```

- [ ] **Step 2: Verify each scenario**

Test these paths and interactions:
1. Visit `/dashboard` as free user → Intel tab active, PortalNav shows 6 tabs, Playbook/Arsenal/Alliance show locks
2. Click Playbook tab (locked) → redirects to `/pricing`
3. Click Intel → IntelligenceFeed renders with signal list, source filter pills work
4. Visit `/pro-portal` → redirects to `/dashboard`
5. Visit `/max-portal` → redirects to `/dashboard`
6. Scroll past 100px → PortalNav becomes solid (bg-background, border-b visible)
7. Resize to mobile → hamburger appears, clicking opens Sheet with tab list
8. WelcomeHero shows: date line in mono, greeting in serif, stats card on right, correct subtitle for tier

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: smoke test complete — portal unification shipped"
```
