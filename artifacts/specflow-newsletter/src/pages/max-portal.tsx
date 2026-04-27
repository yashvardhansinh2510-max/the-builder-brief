import { useState, useEffect } from "react";
import logoPath from "@assets/logo.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import {
  Crown, Workflow, Shield, Target, Lock,
  Calendar, LineChart, Sparkles, Globe,
  MapPin, Activity, Brain, ArrowRight, Files, Zap
} from "lucide-react";
import PortalNav from "@/components/PortalNav";
import FounderChat from "@/components/FounderChat";
import { Badge } from "@/components/ui/badge";
import DottedMap from "dotted-map";
import RuixenSection from "@/components/ui/ruixen-feature-section";

// Site original theme — maps to CSS variables
const H = {
  bg: "hsl(var(--background))",
  card: "hsl(var(--card))",
  linen: "hsl(var(--muted))",
  border: "hsl(var(--border))",
  orange: "hsl(var(--primary))",
  gold: "hsl(var(--primary))",
  text: "hsl(var(--foreground))",
  cream: "hsl(var(--background))",
  muted: "hsl(var(--muted-foreground))",
  dim: "hsl(var(--muted-foreground))",
};

// Dotted map (created once outside component)
const dottedMap = new DottedMap({ height: 55, grid: "diagonal" });
const mapPoints = dottedMap.getPoints();


export default function MaxPortal() {
  const { session } = useAuth();
  const user = session?.user;

  const [visionScore, setVisionScore] = useState(5);
  const [leverageScore, setLeverageScore] = useState(5);
  const fitPercentage = Math.round(((visionScore + leverageScore) / 20) * 100);

  const [burnRate, setBurnRate] = useState(25000);
  const [mrrGrowth, setMrrGrowth] = useState(5000);
  const runwayMonths = burnRate > mrrGrowth ? Math.round(500000 / (burnRate - mrrGrowth)) : Infinity;
  const isDefaultAlive = mrrGrowth >= burnRate;

  const [networkEffects, setNetworkEffects] = useState(50);
  const [switchingCosts, setSwitchingCosts] = useState(50);
  const defensibilityScore = Math.round((networkEffects * 0.6) + (switchingCosts * 0.4));

  const [targetExit, setTargetExit] = useState(25);
  const [equity, setEquity] = useState(80);
  const payout = (targetExit * 1000000) * (equity / 100);

  const [activeToolTab, setActiveToolTab] = useState(0);
  const [specFlowState, setSpecFlowState] = useState<"idle" | "connecting" | "active">("idle");
  const [activeDay, setActiveDay] = useState(1);
  const [chatUsage, setChatUsage] = useState(0);

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/subscribers/me?email=${encodeURIComponent(user.email)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.portalState?.chatUsage) {
            const monthKey = new Date().toISOString().slice(0, 7);
            setChatUsage(data.portalState.chatUsage[monthKey] || 0);
          }
        });
    }
  }, [user]);

  const handleSpecFlow = () => {
    if (specFlowState !== "idle") return;
    setSpecFlowState("connecting");
    setTimeout(() => {
      setSpecFlowState("active");
      setTimeout(() => {
        window.location.href = "mailto:yashvardhan@specflowai.com?subject=White-Glove%20Concierge%20-%20Max%20Tier";
        setSpecFlowState("idle");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* Warm radial ambient */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: `radial-gradient(ellipse at 60% 30%, ${H.orange}22, transparent 65%)` }}
      />

      <div className="relative z-10">
        <PortalNav activePage="max" />

        <main className="max-w-[1200px] mx-auto pt-12 pb-28 px-5 md:px-12" style={{ display: "flex", flexDirection: "column", gap: "120px" }}>

          {/* ── 1. HERO ── */}
          <section className="min-h-[85vh] flex flex-col justify-center relative">
            <div style={{ position: "absolute", top: "20%", right: "-10%", width: "600px", height: "600px", background: `radial-gradient(circle, ${H.orange}12, transparent 65%)`, pointerEvents: "none" }} />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="flex items-center gap-3 mb-10"
              >
                <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.4em] px-0 uppercase">
                  The Builder Brief • Inner Circle
                </Badge>
              </motion.div>

              <h1 className="font-serif text-7xl md:text-8xl lg:text-[10rem] leading-[0.85] tracking-tighter mb-12 text-foreground">
                The Inner<br />
                <span className="italic text-primary">Circle.</span>
              </h1>

              <p className="text-muted-foreground text-xl md:text-2xl font-light leading-relaxed max-w-2xl mb-14">
                Most founders read. A few build. You're in the room where builders compare notes — and deals get done.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex gap-3 flex-wrap"
              >
                {[
                  { label: "Alignment Score", sym: "◎" },
                  { label: "Default Alive", sym: "⌁" },
                  { label: "Moat Matrix", sym: "⬡" },
                  { label: "Exit Wealth", sym: "◈" },
                ].map((tool, i) => (
                  <motion.div
                    key={tool.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-border bg-card/30 backdrop-blur-sm text-[11px] font-bold tracking-widest uppercase text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-default"
                  >
                    <span className="text-primary text-sm">{tool.sym}</span>
                    {tool.label}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </section>

          {/* ── 2. AI ADVISOR ── */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
              <div>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">Elite Intelligence</Badge>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] mb-6">
                  The Cognitive <span className="italic text-primary">Brain.</span>
                </h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md mb-10">
                  Input your MRR, burn rate, and product metrics. The Brain runs competitive positioning, TAM analysis, and capital efficiency scenarios in real-time.
                </p>
                <div className="p-8 border border-primary/20 bg-primary/5 rounded-3xl relative overflow-hidden">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4">
                    <Sparkles className="w-3 h-3" />
                    Max Tier • Uncapped Access
                  </div>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed italic">
                    "Linked to DeepSeek V3 and live web telemetry. Awaiting context payload from your startup profile."
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative">
                  <FounderChat usedThisMonth={chatUsage} onUsageUpdate={setChatUsage} />
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. INNER CIRCLE INTELLIGENCE GRID ── */}
          <section>
            <div className="mb-10">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-4">Inner Circle Intelligence</Badge>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
                Your Unfair <span className="italic text-primary">Advantage.</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg font-light max-w-xl">
                Four tools giving you the data — alignment scoring, financial modeling, defensibility analysis, wealth architecture — that separate $100M exits from failed acquires.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border border-border rounded-3xl overflow-hidden">

              {/* TOP LEFT — Global Network Map */}
              <div className="relative bg-card border-b border-r border-border p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  Inner Circle Network
                </div>
                <h3 className="font-serif text-xl mb-1 tracking-tight">
                  Joining <span className="italic text-primary">150+ founders at $1M+ ARR</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-4 font-light">Verified operators sharing cap table strategy, customer acquisition mechanics, and exit paths.</p>
                <div className="relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-background border border-border rounded-full text-xs font-medium shadow-sm flex items-center gap-2">
                    Coming soon
                  </div>
                  <svg viewBox="0 0 120 60" className="w-full h-auto text-primary/40">
                    {mapPoints.map((point: { x: number; y: number }, i: number) => (
                      <circle key={i} cx={point.x} cy={point.y} r={0.15} fill="currentColor" />
                    ))}
                  </svg>
                </div>
              </div>

              {/* TOP RIGHT — Live Updates Feed */}
              <div className="bg-background border-b border-border p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Live Activity
                </div>
                <h3 className="font-serif text-xl tracking-tight mb-2">
                  What the <span className="italic text-primary">Inner Circle</span> is building.
                </h3>
                <div className="relative h-[220px] overflow-hidden flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-light">Coming soon. Unlock real-time member activity once admitted.</p>
                  </div>
                </div>
              </div>

              {/* BOTTOM LEFT — Scale Trajectory */}
              <div className="bg-card border-r border-border p-6 flex flex-col justify-center items-center">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <LineChart className="w-4 h-4 text-primary" />
                  Scale Trajectory
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-light">Coming soon. Real trajectory data appears after admission.</p>
                </div>
              </div>

              {/* BOTTOM RIGHT — Two feature cards */}
              <div className="grid grid-cols-2 bg-background">
                {[
                  {
                    icon: <Brain className="w-4 h-4" />,
                    title: "Cognitive Brain",
                    subtitle: "Uncapped AI Access",
                    desc: "Unlimited advisor sessions powered by DeepSeek V3 with live web telemetry.",
                  },
                  {
                    icon: <Zap className="w-4 h-4" />,
                    title: "Private Deal Flow",
                    subtitle: "Exit Architecture",
                    desc: "Sanitized acquisition deals and PE introductions from our verified network.",
                  },
                ].map((card, i) => (
                  <div key={i} className="relative flex flex-col gap-3 p-5 border border-border group">
                    <div>
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        {card.icon} {card.title}
                      </span>
                      <h3 className="font-serif text-lg leading-tight">
                        {card.subtitle}{" "}
                        <span className="text-muted-foreground font-light text-sm">{card.desc}</span>
                      </h3>
                    </div>
                    <div className="mt-auto">
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary group-hover:gap-3 transition-all">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 3.5 DYNAMIC DISCOVERY SHOWCASE ── */}
          <section>
            <RuixenSection />
          </section>

          {/* ── 4. MAX COMMAND SUITE ── */}
          <section>
            <div className="mb-12">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-4 uppercase">Max Strategic Suite</Badge>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight">
                The Command <span className="italic text-primary">Suite.</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg font-light max-w-xl">
                Four precision instruments built for founders already in motion. Each tool delivers a calculated edge — no theory, only execution leverage.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-3xl overflow-hidden shadow-2xl">
              {[
                { sym: "◎", label: "Alignment Score", sub: "Qualification Matrix", desc: "Measure your readiness for the Inner Circle network and Concierge access." },
                { sym: "⌁", label: "Default Alive", sub: "Financial Modeling", desc: "Model your burn vs. MRR to visualize your real runway and capital leverage." },
                { sym: "⬡", label: "Moat Matrix", sub: "Defensibility Analysis", desc: "Score your network effects and switching costs to grade your acquisition valuation." },
                { sym: "◈", label: "Exit Wealth", sub: "Wealth Architecture", desc: "Calculate your personal liquid payout from your target exit and equity position." },
              ].map((tool, i) => (
                <motion.div
                  key={tool.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-card p-10 hover:bg-muted/50 transition-colors group cursor-default"
                >
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-3xl text-primary group-hover:scale-110 transition-transform duration-500">{tool.sym}</span>
                    <ArrowRight className="w-4 h-4 text-border group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase mb-2">{tool.sub}</p>
                  <h3 className="font-serif text-2xl mb-4 tracking-tight text-foreground">{tool.label}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-[280px]">{tool.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── 5. ALIGNMENT SCORE ── */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6">
                  <Target className="w-4 h-4" />
                  ◎ Qualification Matrix
                </div>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight mb-6">
                  Scale <span className="italic text-primary">Readiness.</span>
                </h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md mb-10">
                  The Max network is not an incubator — it is an accelerator for founders already in motion. Calculate your alignment score.
                </p>
                <div className="space-y-8">
                  {[
                    { label: "Architectural Vision", value: visionScore, setter: setVisionScore, max: 10 },
                    { label: "Capital Leverage", value: leverageScore, setter: setLeverageScore, max: 10 },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">{s.label}</label>
                        <span className="font-serif text-xl italic text-primary">{s.value}<span className="text-muted-foreground/30 text-sm not-italic ml-1">/ 10</span></span>
                      </div>
                      <input type="range" min="1" max={s.max} step="1" value={s.value} onChange={e => s.setter(Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-16 bg-card border border-border rounded-[3rem] flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 border-[0.5px] border-primary/10 rounded-full scale-150 -translate-y-1/2 pointer-events-none" />
                <div className="absolute inset-0 border-[0.5px] border-primary/5 rounded-full scale-125 translate-y-1/2 pointer-events-none" />

                <p className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase mb-8 relative z-10">Alignment Score</p>
                <motion.div key={fitPercentage} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10">
                  <span className="font-serif text-8xl md:text-9xl tracking-tighter text-primary leading-none">{fitPercentage}%</span>
                </motion.div>
                <p className="font-serif italic text-muted-foreground text-xl mt-8 max-w-[280px] leading-relaxed relative z-10">
                  {fitPercentage > 80 ? "Perfect alignment. You are ready for the Concierge." : fitPercentage > 50 ? "Strong potential. Strategic adjustments required." : "Building phase. Utilize the Pro Vault to increase leverage."}
                </p>
              </div>
            </div>
          </section>

          {/* ── 6. DEFAULT ALIVE ── */}
          <section>
            <div className="bg-muted/30 border border-border rounded-[3rem] p-12 md:p-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 width-[400px] height-[400px] bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6">
                  <Activity className="w-4 h-4" />
                  ⌁ Financial Modeling
                </div>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight mb-6 text-foreground">
                  Default <span className="italic text-primary">Alive.</span>
                </h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed mb-10 max-w-md">
                  A company that is Default Alive controls its own acquisition terms. Model burn against MRR growth to see your real runway.
                </p>
                <div className="space-y-8">
                  {[
                    { label: "Monthly Burn Rate", value: burnRate, setter: setBurnRate, min: 5000, max: 100000, step: 5000, fmt: (v: number) => `$${v.toLocaleString()}` },
                    { label: "New MRR / Month", value: mrrGrowth, setter: setMrrGrowth, min: 1000, max: 50000, step: 1000, fmt: (v: number) => `$${v.toLocaleString()}` },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">{s.label}</label>
                        <span className="font-serif text-xl italic text-primary">{s.fmt(s.value)}</span>
                      </div>
                      <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={e => s.setter(Number(e.target.value))}
                        className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-primary border border-border/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl relative group overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${isDefaultAlive ? "from-emerald-500/5" : "from-red-500/5"} to-transparent opacity-50`} />
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 border ${isDefaultAlive ? "border-emerald-500/20 bg-emerald-500/10" : "border-red-500/20 bg-red-500/10"}`}>
                    <LineChart className={`w-8 h-8 ${isDefaultAlive ? "text-emerald-500" : "text-red-500"}`} />
                  </div>
                  <motion.h3 key={runwayMonths} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-7xl md:text-8xl tracking-tighter text-foreground mb-4">
                    {isDefaultAlive ? "∞" : `${Math.max(0, runwayMonths)}mo`}
                  </motion.h3>
                  <p className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase mb-8">Runway Projection</p>
                  <div className={`px-6 py-2 rounded-full border text-[10px] font-bold tracking-[0.2em] uppercase ${isDefaultAlive ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-red-500/30 text-red-500 bg-red-500/5"}`}>
                    {isDefaultAlive ? "Default Alive" : "Default Dead"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 7. MOAT MATRIX ── */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-card border border-border rounded-[2.5rem] p-8 aspect-square relative overflow-hidden shadow-xl group">
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: `linear-gradient(${H.border} 1px, transparent 1px), linear-gradient(90deg, ${H.border} 1px, transparent 1px)`, backgroundSize: "25% 25%" }}
                  />

                  {/* Axes labels */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-[0.3em] text-muted-foreground uppercase flex items-center gap-2">
                    Switching Costs <ArrowRight className="w-3 h-3" />
                  </div>
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-bold tracking-[0.3em] text-muted-foreground uppercase flex items-center gap-2">
                    Network Effects <ArrowRight className="w-3 h-3" />
                  </div>

                  {/* The Point */}
                  <motion.div
                    className="absolute w-6 h-6 rounded-full bg-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] z-20"
                    animate={{ left: `calc(15% + ${switchingCosts * 0.7}% )`, bottom: `calc(15% + ${networkEffects * 0.7}% )` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                  </motion.div>

                  {/* Moat Rating Label */}
                  <div className="absolute top-8 right-8 bg-background/80 backdrop-blur-xl border border-border p-6 rounded-2xl z-10 shadow-lg group-hover:border-primary/30 transition-colors">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">Moat Rating</p>
                    <p className="font-serif text-2xl text-foreground tracking-tight italic">
                      {defensibilityScore > 80 ? "Monopoly" : defensibilityScore > 50 ? "Defensible" : "Vulnerable"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6">
                  <Shield className="w-4 h-4" />
                  ⬡ Moat Analysis
                </div>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight mb-6 text-foreground">
                  The Defensibility <span className="italic text-primary">Matrix.</span>
                </h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed mb-10 max-w-md">
                  High MRR with zero moat is a target for clones. Map your product's defensibility. Acquisitions are priced on replication difficulty.
                </p>
                <div className="space-y-8">
                  {[
                    { label: "Network Effects", value: networkEffects, setter: setNetworkEffects },
                    { label: "Switching Costs", value: switchingCosts, setter: setSwitchingCosts },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">{s.label}</label>
                        <span className="font-serif text-xl italic text-primary">{s.value}</span>
                      </div>
                      <input type="range" min="0" max="100" step="5" value={s.value} onChange={e => s.setter(Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary border border-border/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── 8. EXIT ARCHITECTURE ── */}
          <section>
            <div className="p-12 md:p-20 bg-card border border-border rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-16 items-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.4em] mb-6 uppercase">◈ Wealth Architecture</Badge>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight mb-6">
                  Exit <span className="italic text-primary">Architecture.</span>
                </h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed mb-10 max-w-md">
                  Most founders build a product. Max members build an asset. Calculate the wealth difference of optimizing your exit architecture.
                </p>
                <div className="space-y-8">
                  {[
                    { label: "Target Exit ($M)", value: targetExit, setter: setTargetExit, min: 5, max: 100, step: 5, fmt: (v: number) => `$${v}M` },
                    { label: "Equity Retained (%)", value: equity, setter: setEquity, min: 10, max: 100, step: 5, fmt: (v: number) => `${v}%` },
                  ].map(slider => (
                    <div key={slider.label}>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">{slider.label}</label>
                        <span className="font-serif text-xl italic text-primary">{slider.fmt(slider.value)}</span>
                      </div>
                      <input type="range" min={slider.min} max={slider.max} step={slider.step} value={slider.value} onChange={e => slider.setter(Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary border border-border/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center relative z-10">
                <p className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase mb-6">Personal Liquid Payout</p>
                <motion.div key={payout} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <span className="font-serif text-8xl md:text-9xl tracking-tighter text-foreground">${(payout / 1000000).toFixed(1)}M</span>
                </motion.div>
                <div className="mt-10 px-6 py-2 border border-primary/30 rounded-full text-primary text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 bg-primary/5">
                  <Shield className="w-3 h-3" /> Cap Table Defense Active
                </div>
              </div>
            </div>
          </section>

          {/* ── 9. 100-DAY ARC ── */}
          <section>
            <div className="mb-16">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.4em] mb-6 uppercase">Max Incubation Program</Badge>
              <h2 className="font-serif text-5xl md:text-6xl tracking-tight leading-tight text-foreground">
                The <span className="italic text-primary">100-Day</span> Arc.
              </h2>
              <p className="text-muted-foreground text-xl font-light leading-relaxed max-w-2xl mt-6">
                A structured operating system for scale. Each milestone unlocks the next phase of your architecture.
              </p>
            </div>

            {/* Timeline Wrapper */}
            <div className="relative mb-12 px-4">
              <div className="absolute top-7 left-0 right-0 h-px bg-border" />
              <motion.div
                className="absolute top-7 left-0 h-px bg-primary origin-left"
                animate={{ width: activeDay === 1 ? "0%" : activeDay === 30 ? "33%" : activeDay === 60 ? "66%" : "100%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="flex justify-between relative z-10">
                {[
                  { day: 1, label: "Architecture" },
                  { day: 30, label: "GTM" },
                  { day: 60, label: "Scale" },
                  { day: 100, label: "Exit" },
                ].map((step) => (
                  <button
                    key={step.day}
                    onClick={() => setActiveDay(step.day)}
                    className="flex flex-col items-center group outline-none"
                  >
                    <motion.div
                      animate={{
                        backgroundColor: activeDay >= step.day ? H.orange : H.card,
                        borderColor: activeDay >= step.day ? H.orange : H.border,
                        scale: activeDay === step.day ? 1.1 : 1
                      }}
                      className="w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xl transition-colors duration-500"
                      style={{ color: activeDay >= step.day ? H.cream : H.muted }}
                    >
                      {step.day}
                    </motion.div>
                    <span className={`mt-4 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors duration-300 ${activeDay === step.day ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {step.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="bg-card border border-border rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  {[{
                    key: "1", day: 1, title: "Deep Architecture Review",
                    body: "A 1-on-1 strategy call with our lead partners. We tear down your existing stack, remove technical debt, and map out the exact integration required to reach your first $1M ARR."
                  }, {
                    key: "30", day: 30, title: "GTM Deployment",
                    body: "Your outbound infrastructure is live. CRM mapped. Cold email sequences firing. You are no longer searching for leads — you are managing deal flow."
                  }, {
                    key: "60", day: 60, title: "Scale Automation",
                    body: "We implement zero-touch onboarding. The product now scales without additional human capital. Every new customer provisions themselves."
                  }, {
                    key: "100", day: 100, title: "Exit Positioning",
                    body: "Your data room is built. Cap table is defended. We begin soft-pitching your metrics to our private network of PE firms and strategic acquirers."
                  }].filter(s => s.day === activeDay).map(s => (
                    <motion.div
                      key={s.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="absolute -top-12 -right-8 font-serif italic text-[12rem] text-primary/5 leading-none pointer-events-none select-none">
                        {s.key}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-primary uppercase mb-6">
                        <Zap className="w-4 h-4" />
                        Milestone • Day {s.day}
                      </div>
                      <h3 className="font-serif text-4xl md:text-5xl mb-8 tracking-tight text-foreground">{s.title}</h3>
                      <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-3xl">{s.body}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* ── 10. PRIVATE DEAL FLOW ── */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.4em] mb-6 uppercase">Verified Network Exits</Badge>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight mb-6 text-foreground">
                  Private <span className="italic text-primary">Deal Flow.</span>
                </h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed mb-10 max-w-md">
                  Inner Circle members access verified acquisition paths, PE introductions, and strategic buyer intelligence from our network.
                </p>
              </div>
              <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-primary/60" />
                  </div>
                  <p className="text-sm text-muted-foreground font-light">Coming soon. Deal intelligence unlocks after you're matched with your growth partner.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 11. WHITE-GLOVE CONCIERGE ── */}
          <section>
            <div className="p-16 md:p-28 bg-muted/30 border border-border rounded-[3rem] text-center relative overflow-hidden shadow-2xl group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-primary/10" />
              <div className="absolute top-1/2 left-0 w-full h-px bg-primary/5" />

              <div className="relative z-10">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.5em] mb-8 uppercase px-6 py-1.5">White-Glove Integration</Badge>
                <h2 className="font-serif text-5xl md:text-7xl tracking-tighter leading-tight mb-8">
                  The Partner <span className="italic text-primary">Concierge.</span>
                </h2>
                <p className="text-muted-foreground text-xl font-light leading-relaxed max-w-2xl mx-auto mb-12 italic font-serif">
                  Deployed directly into your operations by our founding partners. No setup friction. Immediate execution. We build the architecture, you own the asset.
                </p>

                <motion.button
                  onClick={handleSpecFlow}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-12 py-6 rounded-full text-[11px] font-bold tracking-[0.4em] uppercase transition-all duration-500 shadow-xl flex items-center gap-4 mx-auto ${specFlowState === "idle" ? "bg-primary text-background hover:shadow-primary/20" :
                    specFlowState === "connecting" ? "bg-primary/80 text-background cursor-wait" :
                      "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                    }`}
                >
                  {specFlowState === "idle" ? (
                    <>
                      Initiate Secure Connection
                      <Workflow className="w-4 h-4" />
                    </>
                  ) : specFlowState === "connecting" ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Workflow className="w-4 h-4" />
                      </motion.div>
                      Securing Channel...
                    </>
                  ) : (
                    <>
                      Partner Notified. Check Email.
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </section>

          {/* ── 12. BOOK STRATEGY CALL ── */}
          <section className="pb-24">
            <div className="p-16 md:p-24 bg-card border border-border rounded-[3rem] text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-12 bg-primary/10 blur-2xl rounded-full" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mb-10">
                  <Crown className="w-8 h-8 text-primary/80" />
                </div>
                <h2 className="font-serif text-5xl md:text-7xl tracking-tighter leading-tight mb-8">
                  Claim your <span className="italic text-primary">seat.</span>
                </h2>
                <p className="text-muted-foreground text-xl font-light leading-relaxed max-w-lg mx-auto mb-12">
                  Your architecture is ready to be reviewed. Schedule your 1-on-1 strategy call with the founding team to finalize admission.
                </p>

                <a
                  href="mailto:yashvardhan@specflowai.com?subject=Schedule%20Max%20Tier%20Strategy%20Session"
                  className="inline-flex items-center gap-4 px-12 py-6 bg-background border border-border rounded-full text-[11px] font-bold tracking-[0.4em] uppercase text-foreground hover:border-primary hover:text-primary transition-all duration-300 shadow-lg group"
                >
                  <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Secure Your Allocation
                </a>
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-16 bg-card/60 backdrop-blur-xl">
          <div className="max-w-[1200px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-lg object-cover grayscale opacity-50" />
              <p className="font-serif text-lg text-muted-foreground tracking-tight italic">The Builder Brief — Inner Circle</p>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/50">
              © {new Date().getFullYear()} Max Tier • All Rights Reserved
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
