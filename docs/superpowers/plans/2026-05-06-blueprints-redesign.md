# Blueprints Redesign + Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Blueprints as a 3-stage founder execution workspace, fix TierGate auth bug, register /pricing route, and clean up vault numbering.

**Architecture:** Bug fixes are surgical single-file changes. Blueprints redesign rewrites `blueprints.tsx` with stage-based sections and inline tools, extracting `BlueprintStageSection` as a local component within the same file. All tools are data-driven from existing `issues` array in `data.ts` — no new API calls.

**Tech Stack:** React + Vite, wouter, framer-motion, Tailwind CSS, lucide-react, recharts, Clerk (AuthContext), existing `issues` data from `src/lib/data.ts`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/TierGate.tsx` | Modify | Use `useAuth()` from AuthContext instead of fetching `/api/user/tier` |
| `src/App.tsx` | Modify | Register `/pricing` route |
| `src/components/VaultCard.tsx` | Modify | Accept + render `displayIndex` prop |
| `src/pages/vault-archive.tsx` | Modify | Pass `displayIndex={idx + 1}` to VaultCard |
| `src/pages/blueprints.tsx` | Rewrite | 3-stage execution workspace with inline tools and vertical kits |

---

## Task 1: Fix TierGate — use AuthContext tier directly

**Files:**
- Modify: `src/components/TierGate.tsx`

The current code fetches `/api/user/tier` with no Authorization header → API returns 401 → tier always falls back to `free`. Fix: replace the fetch with `useAuth()` from the local AuthContext which already resolves tier correctly.

- [ ] **Step 1: Read the current file**

Read `src/components/TierGate.tsx` to confirm current state before editing.

- [ ] **Step 2: Rewrite TierGate**

Replace the entire file content with:

```tsx
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'wouter';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tier } from '@/lib/tiers';

interface TierGateProps {
  requiredTier: Tier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, max: 2, incubator: 2 };

export function TierGate({ requiredTier, children, fallback }: TierGateProps) {
  const { tier, tierLoading } = useAuth();

  if (tierLoading) return null;

  const requiredIndex = TIER_RANK[requiredTier] ?? 0;
  const userIndex = TIER_RANK[tier] ?? 0;

  if (userIndex >= requiredIndex) {
    return <>{children}</>;
  }

  return (
    fallback || (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-card border border-dashed border-border rounded-2xl">
        <Lock className="w-10 h-10 text-muted-foreground mb-4" />
        <h3 className="font-serif text-2xl mb-2">
          {requiredTier === 'max' ? 'Inner Circle Feature' : 'Pro Member Feature'}
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm text-sm leading-relaxed">
          {requiredTier === 'max' ? (
            <>Upgrade to the <span className="font-bold text-foreground">Inner Circle</span> plan to unlock this section and access the full execution toolkit.</>
          ) : (
            <>Upgrade to <span className="font-bold text-foreground">Pro</span> or the <span className="font-bold text-foreground">Inner Circle</span> plan to unlock this section and access the full execution toolkit.</>
          )}
        </p>
        <Button asChild className="rounded-full">
          <Link href="/pricing">Upgrade Now</Link>
        </Button>
      </div>
    )
  );
}
```

- [ ] **Step 3: Verify typecheck passes**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief" && pnpm run typecheck 2>&1 | grep -E "error|TierGate" | head -20
```

Expected: no errors mentioning TierGate.

- [ ] **Step 4: Commit**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief"
git add artifacts/specflow-newsletter/src/components/TierGate.tsx
git commit -m "fix: TierGate reads tier from AuthContext instead of unauthenticated fetch"
```

---

## Task 2: Register /pricing route in App.tsx

**Files:**
- Modify: `src/App.tsx`

`pricing.tsx` exists but has no route — clicking "Upgrade Now" in TierGate hits the NotFound handler.

- [ ] **Step 1: Read App.tsx imports section**

Read `src/App.tsx` lines 1–30 to see the current import block.

- [ ] **Step 2: Add PricingPage import**

After the existing `import NotFound from "@/pages/not-found";` line, add:

```tsx
import PricingPage from "@/pages/pricing";
```

- [ ] **Step 3: Add /pricing route**

In the `<Switch>` block in `src/App.tsx`, add the pricing route immediately before the `<Route component={NotFound} />` catch-all:

```tsx
<Route path="/pricing" component={PricingPage} />
<Route component={NotFound} />
```

- [ ] **Step 4: Verify typecheck**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief" && pnpm run typecheck 2>&1 | grep -E "error|App\." | head -10
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief"
git add artifacts/specflow-newsletter/src/App.tsx
git commit -m "fix: register /pricing route so TierGate upgrade link resolves"
```

---

## Task 3: Fix vault numbering

**Files:**
- Modify: `src/components/VaultCard.tsx`
- Modify: `src/pages/vault-archive.tsx`

VaultCards in the vault-archive page show no human-readable number. Archive/Blueprints pages already show `Vault #${issue.number}` but the string should be explicitly zero-padded to prevent any rendering edge cases.

- [ ] **Step 1: Update VaultCard to accept displayIndex prop**

Read `src/components/VaultCard.tsx` first, then update the `VaultCardProps` interface and render:

```tsx
interface VaultCardProps {
  vault: Vault;
  showSignals?: boolean;
  onSelect?: (vaultId: string) => void;
  layout?: 'compact' | 'expanded';
  displayIndex?: number;
}
```

In the **expanded layout** `<div className="mb-4">` header section, add the number badge before the title:

```tsx
{/* Header */}
<div className="mb-4">
  <div className="flex items-start justify-between gap-3 mb-2">
    <div className="flex-1">
      {displayIndex !== undefined && (
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase block mb-1">
          Vault #{String(displayIndex).padStart(3, '0')}
        </span>
      )}
      <h3 className="text-lg font-bold text-foreground line-clamp-2">{vault.title}</h3>
    </div>
    <ScoreBadge score={vault.scores.overall} />
  </div>
  <p className="text-sm text-muted-foreground line-clamp-2">{vault.tagline}</p>
</div>
```

In the **compact layout**, add number below the title line:

```tsx
<div className="flex items-start justify-between gap-3 mb-2">
  <div className="flex-1">
    {displayIndex !== undefined && (
      <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase block">
        #{String(displayIndex).padStart(3, '0')}
      </span>
    )}
    <h3 className="font-semibold text-foreground line-clamp-1">{vault.title}</h3>
  </div>
  <ScoreBadge score={vault.scores.overall} />
</div>
```

- [ ] **Step 2: Pass displayIndex in vault-archive.tsx**

Read `src/pages/vault-archive.tsx` lines 238–255, then update the VaultCard call:

```tsx
{vaults.map((vault, idx) => (
  <motion.div
    key={vault.id}
    custom={idx}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={fadeUp}
  >
    <VaultCard vault={vault} layout={layout} displayIndex={idx + 1} />
  </motion.div>
))}
```

- [ ] **Step 3: Ensure archive and blueprints cards use padded numbers**

In `src/pages/archive.tsx`, find the vault number span (line ~143) and ensure it uses explicit padding:

Change:
```tsx
Vault #{issue.number}
```
To:
```tsx
Vault #{String(issue.number).padStart(3, '0')}
```

In `src/pages/blueprints.tsx` BlueprintCard component (line ~82), same change:
```tsx
Vault #{String(issue.number).padStart(3, '0')}
```

- [ ] **Step 4: Typecheck**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief" && pnpm run typecheck 2>&1 | grep -E "error|VaultCard|vault-archive" | head -10
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief"
git add artifacts/specflow-newsletter/src/components/VaultCard.tsx \
        artifacts/specflow-newsletter/src/pages/vault-archive.tsx \
        artifacts/specflow-newsletter/src/pages/archive.tsx
git commit -m "fix: add zero-padded display numbers to vault cards"
```

---

## Task 4: Rewrite blueprints.tsx as a 3-stage execution workspace

**Files:**
- Rewrite: `src/pages/blueprints.tsx`

This is the main feature. The page is rewritten from a flat grid of cards into a 3-stage founder workspace with inline tools, vertical starter kits, and Pro/Max exclusive sections.

### Data helpers

The page uses `issues` from `@/lib/data`. We need filtering helpers:

```ts
// Stage 1: Ideation — easiest/fastest to validate
function getStage1Issues(issues: Issue[], vertical: string) {
  const pool = vertical === 'All' ? issues : issues.filter(i => i.category === vertical);
  const sorted = [...pool].sort((a, b) => {
    const diffScore = { 'Low': 0, 'Medium': 1, 'High': 2, 'Extreme': 3 };
    const devScore = { 'Days': 0, 'Weeks': 1, 'Months': 2 };
    return (diffScore[a.difficulty as keyof typeof diffScore] ?? 1) - (diffScore[b.difficulty as keyof typeof diffScore] ?? 1)
      || (devScore[a.devTime as keyof typeof devScore] ?? 1) - (devScore[b.devTime as keyof typeof devScore] ?? 1);
  });
  return sorted.slice(0, 3);
}

// Stage 2: Build — fastest to first revenue
function getStage2Issues(issues: Issue[], vertical: string) {
  const pool = vertical === 'All' ? issues : issues.filter(i => i.category === vertical);
  const parseRevenue = (r: string) => {
    if (!r) return 999;
    if (r.includes('day')) return parseInt(r) || 7;
    if (r.includes('week') || r.includes('21')) return 21;
    return 30;
  };
  return [...pool].sort((a, b) => parseRevenue(a.revenueIn) - parseRevenue(b.revenueIn)).slice(0, 3);
}

// Stage 3: Scale — has exit strategy or proven traction
function getStage3Issues(issues: Issue[], vertical: string) {
  const pool = vertical === 'All' ? issues : issues.filter(i => i.category === vertical);
  const withExit = pool.filter(i => i.exitStrategy);
  const result = withExit.length >= 3 ? withExit : [...withExit, ...pool.filter(i => !i.exitStrategy)];
  return result.slice(0, 3);
}
```

### Vertical Starter Kits

Compute kit stats from `issues`:

```ts
const VERTICALS = ['B2B SaaS', 'Fintech', 'Health', 'Climate Tech', 'Consumer', 'AI-Native'] as const;

function getVerticalStats(vertical: string) {
  const pool = issues.filter(i => i.category === vertical);
  const avgRevDays = pool.length
    ? Math.round(pool.reduce((sum, i) => {
        const d = parseInt(i.revenueIn) || 30;
        return sum + d;
      }, 0) / pool.length)
    : 30;
  return { count: pool.length, avgRevDays };
}
```

### Inline Tools

**MarketSignalTool** (Stage 1) — shows graphData sparkline + whyNow bullets for the top issue:
- Free users: shows chart + first 2 whyNow bullets, rest blurred
- Pro/Max: all 4 whyNow bullets + TAM detail

**FirstRevenueTool** (Stage 2) — shows blueprint steps 1-3 as checklist:
- Free users: steps 1-2 visible, step 3+ locked
- Pro/Max: all steps

**UnitEconomicsTool** (Stage 3) — shows unitEconomicsExpanded as stat grid:
- Wrapped in `<TierGate requiredTier="pro">` entirely

### Full blueprints.tsx rewrite

- [ ] **Step 1: Read the current blueprints.tsx**

Read `src/pages/blueprints.tsx` to understand all existing imports and patterns before overwriting.

- [ ] **Step 2: Write the new blueprints.tsx**

Replace the entire file with:

```tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  ArrowRight, Lock, Check, TrendingUp, DollarSign,
  Zap, Target, ChevronRight, Layers, BarChart3, Users2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { issues } from '@/lib/data';
import { useAuth } from '@/lib/AuthContext';
import { TierGate } from '@/components/TierGate';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

const VERTICALS = ['All', 'B2B SaaS', 'Fintech', 'Health', 'Climate Tech', 'Consumer', 'AI-Native'];

// ─── Filtering helpers ────────────────────────────────────────────────────────

function filterByVertical(vertical: string) {
  return vertical === 'All' ? issues : issues.filter(i => i.category === vertical);
}

function getStage1Issues(vertical: string) {
  const pool = filterByVertical(vertical);
  const diffRank: Record<string, number> = { Low: 0, Medium: 1, High: 2, Extreme: 3 };
  const devRank: Record<string, number> = { Days: 0, Weeks: 1, Months: 2 };
  return [...pool]
    .sort((a, b) =>
      (diffRank[a.difficulty ?? 'Medium'] ?? 1) - (diffRank[b.difficulty ?? 'Medium'] ?? 1) ||
      (devRank[a.devTime ?? 'Weeks'] ?? 1) - (devRank[b.devTime ?? 'Weeks'] ?? 1)
    )
    .slice(0, 3);
}

function getStage2Issues(vertical: string) {
  const pool = filterByVertical(vertical);
  const parseDay = (r: string) => {
    if (!r) return 999;
    const n = parseInt(r);
    return isNaN(n) ? (r.toLowerCase().includes('week') ? 21 : 30) : n;
  };
  return [...pool].sort((a, b) => parseDay(a.revenueIn) - parseDay(b.revenueIn)).slice(0, 3);
}

function getStage3Issues(vertical: string) {
  const pool = filterByVertical(vertical);
  const withExit = pool.filter(i => i.exitStrategy);
  const fill = pool.filter(i => !i.exitStrategy);
  return [...withExit, ...fill].slice(0, 3);
}

// ─── Mini blueprint card used within stage sections ───────────────────────────

function StageBlueprintCard({ issue, idx }: { issue: (typeof issues)[0]; idx: number }) {
  return (
    <motion.div custom={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
      <Link href={`/issue/${issue.slug}`} className="block group">
        <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Vault #{String(issue.number).padStart(3, '0')}
            </span>
            <Badge variant="secondary" className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider bg-primary/10 text-primary border-0">
              {issue.category}
            </Badge>
          </div>
          <h3 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors leading-snug">
            {issue.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {issue.tagline}
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-background rounded-lg p-3 border border-border">
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">TAM</p>
              <p className="font-sans font-bold text-xs text-foreground">{issue.tam}</p>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Revenue in</p>
              <p className="font-sans font-bold text-xs text-primary">{issue.revenueIn}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-primary text-sm group-hover:gap-2.5 transition-all">
            Open Blueprint <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Stage 1 inline tool: Market Signal Preview ───────────────────────────────

function MarketSignalTool({ issue }: { issue: (typeof issues)[0] }) {
  const { tier } = useAuth();
  const isPaid = tier === 'pro' || tier === 'max' || tier === 'incubator';
  const graphData = issue.graphData ?? [];
  const whyNow = issue.whyNow ?? [];
  const visibleBullets = isPaid ? whyNow : whyNow.slice(0, 2);

  return (
    <div className="bg-background border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Market Signal: {issue.title}</span>
      </div>
      {graphData.length > 0 && (
        <div className="h-32 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <RechartsTooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 11 }}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Why now</p>
      <ul className="space-y-2">
        {visibleBullets.map((bullet, i) => (
          <li key={i} className="flex gap-2 items-start text-xs text-foreground leading-relaxed">
            <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
            {bullet}
          </li>
        ))}
        {!isPaid && whyNow.length > 2 && (
          <li className="flex gap-2 items-start text-xs text-muted-foreground">
            <Lock className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="blur-[3px] select-none">{whyNow[2]}</span>
          </li>
        )}
      </ul>
      {!isPaid && (
        <Link href="/pricing">
          <p className="text-[10px] text-primary font-bold mt-3 hover:underline cursor-pointer">Unlock full signal analysis →</p>
        </Link>
      )}
    </div>
  );
}

// ─── Stage 2 inline tool: First Revenue Playbook ──────────────────────────────

function FirstRevenueTool({ issue }: { issue: (typeof issues)[0] }) {
  const { tier } = useAuth();
  const isPaid = tier === 'pro' || tier === 'max' || tier === 'incubator';
  const steps = issue.blueprint ?? [];
  const visible = isPaid ? steps : steps.slice(0, 2);

  return (
    <div className="bg-background border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Revenue Playbook: {issue.title}</span>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Build steps</p>
      <ul className="space-y-2">
        {visible.map((step, i) => (
          <li key={i} className="flex gap-2 items-start text-xs text-foreground leading-relaxed">
            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-[9px] font-bold text-primary">
              {i + 1}
            </div>
            {step}
          </li>
        ))}
        {!isPaid && steps.length > 2 && (
          <li className="flex gap-2 items-start text-xs text-muted-foreground">
            <Lock className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="blur-[3px] select-none">{steps[2]}</span>
          </li>
        )}
      </ul>
      {!isPaid && (
        <Link href="/pricing">
          <p className="text-[10px] text-primary font-bold mt-3 hover:underline cursor-pointer">Unlock full blueprint →</p>
        </Link>
      )}
    </div>
  );
}

// ─── Stage 3 inline tool: Unit Economics (Pro gate) ──────────────────────────

function UnitEconomicsTool({ issue }: { issue: (typeof issues)[0] }) {
  const ue = issue.unitEconomicsExpanded;
  if (!ue) return null;
  return (
    <TierGate requiredTier="pro">
      <div className="bg-background border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unit Economics: {issue.title}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Price', value: ue.price },
            { label: 'Gross Margin', value: ue.grossMarginPercent },
            { label: 'CAC', value: ue.cac },
            { label: 'LTV', value: ue.ltv },
            { label: 'COGS', value: ue.cogs },
            { label: 'Payback', value: ue.paybackPeriod },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card p-3 rounded-xl border border-border">
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{label}</p>
              <p className="font-sans font-bold text-sm text-foreground truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </TierGate>
  );
}

// ─── Stage section wrapper ────────────────────────────────────────────────────

interface StageSectionProps {
  stageNum: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  blueprints: (typeof issues);
  tool: React.ReactNode;
  animIdx: number;
}

function StageSection({ stageNum, title, subtitle, icon, blueprints, tool, animIdx }: StageSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={animIdx}
      variants={fadeUp}
      className="mb-20"
    >
      {/* Stage header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="w-px flex-1 bg-border mt-3 min-h-[24px]" />
        </div>
        <div className="pt-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Stage {stageNum}</p>
          <h2 className="font-serif text-3xl mb-1">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
      </div>

      {/* Tool + cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">{tool}</div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {blueprints.map((issue, idx) => (
            <StageBlueprintCard key={issue.slug} issue={issue} idx={idx} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ─── Vertical Starter Kit card ────────────────────────────────────────────────

function VerticalKitCard({
  vertical,
  count,
  active,
  onClick,
}: {
  vertical: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const ICONS: Record<string, React.ReactNode> = {
    'B2B SaaS': <BarChart3 className="w-5 h-5" />,
    'Fintech': <DollarSign className="w-5 h-5" />,
    'Health': <Target className="w-5 h-5" />,
    'Climate Tech': <TrendingUp className="w-5 h-5" />,
    'Consumer': <Users2 className="w-5 h-5" />,
    'AI-Native': <Zap className="w-5 h-5" />,
  };

  return (
    <button
      onClick={onClick}
      className={`flex-none w-40 text-left p-4 rounded-2xl border transition-all duration-200
        ${active
          ? 'bg-foreground text-background border-foreground shadow-lg'
          : 'bg-card border-border text-foreground hover:border-primary/30 hover:shadow-md'
        }`}
    >
      <div className={`mb-3 ${active ? 'text-background' : 'text-primary'}`}>
        {ICONS[vertical] ?? <Layers className="w-5 h-5" />}
      </div>
      <p className={`font-bold text-sm mb-1 ${active ? 'text-background' : 'text-foreground'}`}>
        {vertical}
      </p>
      <p className={`text-[10px] uppercase tracking-wider font-bold ${active ? 'text-background/70' : 'text-muted-foreground'}`}>
        {count} blueprint{count !== 1 ? 's' : ''}
      </p>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlueprintsPage() {
  usePageTracking('/blueprints');
  const { tier } = useAuth();
  const isPremium = tier === 'pro' || tier === 'max' || tier === 'incubator';

  const [selectedVertical, setSelectedVertical] = useState('All');

  const stage1 = useMemo(() => getStage1Issues(selectedVertical), [selectedVertical]);
  const stage2 = useMemo(() => getStage2Issues(selectedVertical), [selectedVertical]);
  const stage3 = useMemo(() => getStage3Issues(selectedVertical), [selectedVertical]);

  const stage1Tool = stage1[0];
  const stage2Tool = stage2[0];
  const stage3Tool = useMemo(() => {
    const pool = filterByVertical(selectedVertical);
    return pool.find(i => i.unitEconomicsExpanded) ?? pool[0];
  }, [selectedVertical]);

  const verticalCounts = useMemo(() =>
    VERTICALS.slice(1).map(v => ({
      vertical: v,
      count: issues.filter(i => i.category === v).length,
    })),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="blueprints" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">

        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Execution Workspace</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight mb-4">
            Build Your<br />
            <span className="text-primary">
              {selectedVertical === 'All' ? 'Billion-Dollar Company' : `${selectedVertical} Company`}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Three stages. Every tool. Exact playbooks. Pick where you are and start moving.
          </p>
        </motion.div>

        {/* Vertical Starter Kits */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Choose your vertical</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedVertical('All')}
              className={`flex-none px-5 py-3 rounded-2xl border font-bold text-sm transition-all duration-200
                ${selectedVertical === 'All'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
            >
              All ({issues.length})
            </button>
            {verticalCounts.map(({ vertical, count }) => (
              <VerticalKitCard
                key={vertical}
                vertical={vertical}
                count={count}
                active={selectedVertical === vertical}
                onClick={() => setSelectedVertical(vertical)}
              />
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Your Build Path</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Stage 1 — Ideation & Validation */}
        {stage1Tool && (
          <StageSection
            stageNum="01"
            title="Ideation & Validation"
            subtitle="Prove the market before you build anything. Pick the lowest-risk entry point."
            icon={<Target className="w-5 h-5 text-primary" />}
            blueprints={stage1}
            tool={<MarketSignalTool issue={stage1Tool} />}
            animIdx={2}
          />
        )}

        {/* Stage 2 — Build & Launch */}
        {stage2Tool && (
          <StageSection
            stageNum="02"
            title="Build & Launch"
            subtitle="Get to first revenue in 30 days or less. Execution over perfection."
            icon={<Zap className="w-5 h-5 text-primary" />}
            blueprints={stage2}
            tool={<FirstRevenueTool issue={stage2Tool} />}
            animIdx={3}
          />
        )}

        {/* Stage 3 — Scale & Exit */}
        {stage3Tool && (
          <StageSection
            stageNum="03"
            title="Scale & Exit"
            subtitle="Unit economics locked. Hire the right people. Plan the exit from day one."
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            blueprints={stage3}
            tool={<UnitEconomicsTool issue={stage3Tool} />}
            animIdx={4}
          />
        )}

        {/* Pro/Max Exclusive Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={5}
          variants={fadeUp}
          className="mt-4"
        >
          {isPremium ? (
            <div className="bg-card border border-primary/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Inner Circle</p>
                  <h3 className="font-serif text-2xl">Your Advanced Toolkit</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/investor-portal">
                  <div className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group">
                    <DollarSign className="w-5 h-5 text-primary mb-3" />
                    <h4 className="font-bold text-sm mb-1">Investor Matching</h4>
                    <p className="text-xs text-muted-foreground">500+ VCs matched to your exact vertical and stage.</p>
                    <p className="text-[10px] text-primary font-bold mt-2 group-hover:underline">Access →</p>
                  </div>
                </Link>
                <Link href="/issue/legal-owl#exit">
                  <div className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group">
                    <TrendingUp className="w-5 h-5 text-primary mb-3" />
                    <h4 className="font-bold text-sm mb-1">Exit Playbooks</h4>
                    <p className="text-xs text-muted-foreground">Acquirer lists, metrics needed, valuation targets.</p>
                    <p className="text-[10px] text-primary font-bold mt-2 group-hover:underline">Access →</p>
                  </div>
                </Link>
                <Link href="/vault-archive">
                  <div className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group">
                    <Layers className="w-5 h-5 text-primary mb-3" />
                    <h4 className="font-bold text-sm mb-1">Full Vault Archive</h4>
                    <p className="text-xs text-muted-foreground">Every idea. Every signal. Searchable and scored.</p>
                    <p className="text-[10px] text-primary font-bold mt-2 group-hover:underline">Access →</p>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">Inner Circle Toolkit</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Investor matching, exit playbooks, hiring roadmaps, and full vault access. Unlocked for Pro and Max members.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/pricing">
                  <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6">
                    Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/archive">
                  <Button variant="outline" className="rounded-full border-border">
                    Browse Archive Instead
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </motion.section>

      </main>

      <Footer variant="public" />
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief" && pnpm run typecheck 2>&1 | grep -E "error|blueprints" | head -20
```

Expected: no errors. If there are type errors about `issue.difficulty`, `issue.devTime`, or `issue.blueprint` being potentially undefined, those are handled by the `?? 'Medium'`, `?? 'Weeks'`, and `?? []` defaults already in the code. If any fields are typed as optional in the `Issue` type, add null guards as needed.

- [ ] **Step 4: Commit**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief"
git add artifacts/specflow-newsletter/src/pages/blueprints.tsx
git commit -m "feat: redesign blueprints as 3-stage founder execution workspace"
```

---

## Task 5: Final typecheck + smoke test

- [ ] **Step 1: Full typecheck**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief" && pnpm run typecheck 2>&1 | tail -10
```

Expected: `Found 0 errors.` (or equivalent clean output).

- [ ] **Step 2: Verify the dev server starts**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief" && pnpm --filter @workspace/specflow-newsletter run dev 2>&1 &
sleep 5 && curl -s http://localhost:5173 | grep -o '<title>[^<]*</title>' | head -1
```

Expected: page title in output (confirms server started).

- [ ] **Step 3: Kill dev server**

```bash
kill $(lsof -ti:5173) 2>/dev/null; true
```

- [ ] **Step 4: Final commit**

```bash
cd "/Users/yashvardhansinhjhala/the builder brief"
git add -A
git commit -m "chore: final typecheck pass — blueprints redesign + bug fixes complete"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] TierGate fix: Task 1 — reads from AuthContext, handles incubator tier
- [x] /pricing 404 fix: Task 2 — route registered in App.tsx
- [x] Vault numbering: Task 3 — VaultCard gets displayIndex, archive uses padStart
- [x] Blueprints 3-stage layout: Task 4 — StageSection × 3 with tools
- [x] Vertical Starter Kits: Task 4 — VerticalKitCard horizontal row
- [x] Inline tools (Market Signal, First Revenue, Unit Economics): Task 4
- [x] Pro/Max exclusive section: Task 4 — gated inner circle toolkit
- [x] Archive stays unchanged: archive.tsx only touched for number formatting

**No placeholders:** All code blocks contain complete, runnable code.

**Type consistency:**
- `useAuth()` used consistently from `@/lib/AuthContext` (not `@clerk/react`) across TierGate and blueprints
- `issues` type from `@/lib/data` used directly throughout
- `StageBlueprintCard`, `StageSection`, tools all accept `(typeof issues)[0]` — matches data shape
