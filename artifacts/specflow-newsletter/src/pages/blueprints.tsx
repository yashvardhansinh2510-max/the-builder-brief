import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useMode } from '@/lib/ModeContext';
import {
  ArrowRight, Lock, Check, TrendingUp, DollarSign,
  Zap, Target, Layers, BarChart3, Users2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { issues, Issue } from '@/lib/data';
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

function filterByVertical(vertical: string): Issue[] {
  return vertical === 'All' ? issues : issues.filter(i => i.category === vertical);
}

const DIFF_RANK: Record<string, number> = { Low: 0, Medium: 1, High: 2, Extreme: 3 };
const DEV_RANK: Record<string, number> = { Days: 0, Weeks: 1, Months: 2 };

function getStage1Issues(vertical: string): Issue[] {
  const pool = filterByVertical(vertical);
  return [...pool]
    .sort((a, b) =>
      (DIFF_RANK[a.difficulty ?? 'Medium'] ?? 1) - (DIFF_RANK[b.difficulty ?? 'Medium'] ?? 1) ||
      (DEV_RANK[a.devTime ?? 'Weeks'] ?? 1) - (DEV_RANK[b.devTime ?? 'Weeks'] ?? 1)
    )
    .slice(0, 3);
}

function getStage2Issues(vertical: string): Issue[] {
  const pool = filterByVertical(vertical);
  const parseDay = (r: string) => {
    const lower = r.toLowerCase();
    const n = parseInt(r);
    if (lower.includes('week')) return (isNaN(n) ? 1 : n) * 7;
    if (lower.includes('month')) return (isNaN(n) ? 1 : n) * 30;
    return isNaN(n) ? 30 : n;
  };
  return [...pool].sort((a, b) => parseDay(a.revenueIn) - parseDay(b.revenueIn)).slice(0, 3);
}

function getStage3Issues(vertical: string): Issue[] {
  const pool = filterByVertical(vertical);
  const withExit = pool.filter(i => i.exitStrategy);
  const fill = pool.filter(i => !i.exitStrategy);
  return [...withExit, ...fill].slice(0, 3);
}

// ─── Mini blueprint card ──────────────────────────────────────────────────────

function StageBlueprintCard({ issue, idx }: { issue: Issue; idx: number }) {
  return (
    <motion.div custom={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
      <Link href={`/issue/${issue.slug}`} className="block group h-full">
        <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col">
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
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
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

// ─── Stage 1 tool: Market Signal Preview ─────────────────────────────────────

function MarketSignalTool({ issue }: { issue: Issue }) {
  const { tier } = useAuth();
  const isPaid = tier === 'pro' || tier === 'max' || tier === 'incubator';
  const graphData = issue.graphData ?? [];
  const whyNow = issue.whyNow ?? [];
  const visibleBullets = isPaid ? whyNow : whyNow.slice(0, 2);

  return (
    <div className="bg-background border border-border rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Signal: {issue.title}</span>
      </div>
      {graphData.length > 0 && (
        <div className="h-28 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis hide />
              <RechartsTooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 10 }}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Why now</p>
      <ul className="space-y-2">
        {visibleBullets.map((bullet, i) => (
          <li key={i} className="flex gap-2 items-start text-[11px] text-foreground leading-relaxed">
            <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
            {bullet}
          </li>
        ))}
        {!isPaid && whyNow.length > 2 && (
          <li className="flex gap-2 items-start text-[11px] text-muted-foreground">
            <Lock className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="blur-[3px] select-none">{whyNow[2]}</span>
          </li>
        )}
      </ul>
      {!isPaid && (
        <Link href="/pricing">
          <p className="text-[10px] text-primary font-bold mt-3 hover:underline cursor-pointer">Unlock full analysis →</p>
        </Link>
      )}
    </div>
  );
}

// ─── Stage 2 tool: First Revenue Playbook ────────────────────────────────────

function FirstRevenueTool({ issue }: { issue: Issue }) {
  const { tier } = useAuth();
  const isPaid = tier === 'pro' || tier === 'max' || tier === 'incubator';
  const steps = issue.blueprint ?? [];
  const visible = isPaid ? steps : steps.slice(0, 2);

  return (
    <div className="bg-background border border-border rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Playbook: {issue.title}</span>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Build steps</p>
      <ul className="space-y-2">
        {visible.map((step, i) => (
          <li key={i} className="flex gap-2 items-start text-[11px] text-foreground leading-relaxed">
            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-[9px] font-bold text-primary">
              {i + 1}
            </div>
            {step}
          </li>
        ))}
        {!isPaid && steps.length > 2 && (
          <li className="flex gap-2 items-start text-[11px] text-muted-foreground">
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

// ─── Stage 3 tool: Unit Economics (Pro gate) ─────────────────────────────────

function UnitEconomicsTool({ issue }: { issue: Issue }) {
  if (!issue) return null;
  const ue = issue.unitEconomicsExpanded;
  if (!ue) return null;
  return (
    <TierGate requiredTier="pro">
      <div className="bg-background border border-border rounded-2xl p-5 h-full">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Economics: {issue.title}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            { label: 'Price', value: ue.price },
            { label: 'Gross Margin', value: ue.grossMarginPercent },
            { label: 'CAC', value: ue.cac },
            { label: 'LTV', value: ue.ltv },
            { label: 'COGS', value: ue.cogs },
            { label: 'Payback', value: ue.paybackPeriod },
          ] as { label: string; value: string }[]).map(({ label, value }) => (
            <div key={label} className="bg-card p-2.5 rounded-xl border border-border">
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">{label}</p>
              <p className="font-sans font-bold text-xs text-foreground truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </TierGate>
  );
}

// ─── Stage section ────────────────────────────────────────────────────────────

interface StageSectionProps {
  stageNum: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  blueprints: Issue[];
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
      <header className="flex items-start gap-4 mb-8">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="w-px h-6 bg-border mt-3" />
        </div>
        <div className="pt-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Stage {stageNum}</p>
          <h2 className="font-serif text-3xl mb-1">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
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

// ─── Vertical kit card ────────────────────────────────────────────────────────

const VERTICAL_ICONS: Record<string, React.ReactNode> = {
  'B2B SaaS': <BarChart3 className="w-5 h-5" />,
  'Fintech': <DollarSign className="w-5 h-5" />,
  'Health': <Target className="w-5 h-5" />,
  'Climate Tech': <TrendingUp className="w-5 h-5" />,
  'Consumer': <Users2 className="w-5 h-5" />,
  'AI-Native': <Zap className="w-5 h-5" />,
};

function VerticalKitCard({ vertical, count, active, onClick }: { vertical: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Filter by ${vertical}`}
      className={`flex-none w-40 text-left p-4 rounded-2xl border transition-all duration-200
        ${active
          ? 'bg-foreground text-background border-foreground shadow-lg'
          : 'bg-card border-border text-foreground hover:border-primary/30 hover:shadow-md'
        }`}
    >
      <div className={`mb-3 ${active ? 'text-background' : 'text-primary'}`}>
        {VERTICAL_ICONS[vertical] ?? <Layers className="w-5 h-5" />}
      </div>
      <p className={`font-bold text-sm mb-1 ${active ? 'text-background' : 'text-foreground'}`}>{vertical}</p>
      <p className={`text-[10px] uppercase tracking-wider font-bold ${active ? 'text-background/70' : 'text-muted-foreground'}`}>
        {count} blueprint{count !== 1 ? 's' : ''}
      </p>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlueprintsPage() {
  usePageTracking('/blueprints');
  const { mode } = useMode();
  const { tier } = useAuth();
  const isPremium = tier === 'pro' || tier === 'max' || tier === 'incubator';

  const [selectedVertical, setSelectedVertical] = useState('All');

  const stage1 = useMemo(() => getStage1Issues(selectedVertical), [selectedVertical]);
  const stage2 = useMemo(() => getStage2Issues(selectedVertical), [selectedVertical]);
  const stage3 = useMemo(() => getStage3Issues(selectedVertical), [selectedVertical]);

  const stage3UETool = useMemo(() => {
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
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedVertical('All')}
              aria-pressed={selectedVertical === 'All'}
              aria-label="Show all verticals"
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
        {stage1.length > 0 && (
          <StageSection
            stageNum="01"
            title="Ideation & Validation"
            subtitle="Prove the market before you build anything. Pick the lowest-risk entry point."
            icon={<Target className="w-5 h-5 text-primary" />}
            blueprints={stage1}
            tool={<MarketSignalTool key={stage1[0]?.slug} issue={stage1[0]} />}
            animIdx={2}
          />
        )}

        {/* Stage 2 — Build & Launch */}
        {stage2.length > 0 && (
          <StageSection
            stageNum="02"
            title="Build & Launch"
            subtitle="Get to first revenue in 30 days or less. Execution over perfection."
            icon={<Zap className="w-5 h-5 text-primary" />}
            blueprints={stage2}
            tool={<FirstRevenueTool key={stage2[0]?.slug} issue={stage2[0]} />}
            animIdx={3}
          />
        )}

        {/* Stage 3 — Scale & Exit */}
        {stage3.length > 0 && stage3UETool && (
          <StageSection
            stageNum="03"
            title="Scale & Exit"
            subtitle="Unit economics locked. Hire the right people. Plan the exit from day one."
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            blueprints={stage3}
            tool={<UnitEconomicsTool key={stage3UETool?.slug} issue={stage3UETool!} />}
            animIdx={4}
          />
        )}

        {stage1.length === 0 && stage2.length === 0 && stage3.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Layers className="w-10 h-10 text-muted-foreground mb-4" />
            <h3 className="font-serif text-2xl mb-2">No blueprints yet for {selectedVertical}</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              We're adding new verticals every week. Browse all blueprints in the meantime.
            </p>
            <button
              onClick={() => setSelectedVertical('All')}
              className="mt-6 text-sm font-bold text-primary hover:underline"
            >
              Show all blueprints →
            </button>
          </div>
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
                <Link href="/build-brief">
                  <div className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group">
                    <BarChart3 className="w-5 h-5 text-primary mb-3" />
                    <h4 className="font-bold text-sm mb-1">Build Brief</h4>
                    <p className="text-xs text-muted-foreground">Your personalised weekly brief. Built for your stage.</p>
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
              </div>
            </div>
          )}
        </motion.section>

      </main>

      <Footer variant="authenticated" />
    </div>
  );
}
