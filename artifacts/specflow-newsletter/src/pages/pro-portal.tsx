import { useState, useEffect } from "react";
import logoPath from "@assets/logo.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import {
  Terminal, Database,
  Users,
  Code2, Settings,
  Zap, FileText, ChevronRight, CheckCircle2,
  Crosshair, ShieldAlert, Cpu, Network, ArrowUpRight, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PortalNav from "@/components/PortalNav";
import FounderChat from "@/components/FounderChat";
import Footer from "@/components/Footer";
import { useSubscriberCount } from "@/hooks/useSubscriberCount";
import DailyBriefUI from "@/components/DailyBriefUI";
import PersonalizationUI from "@/components/PersonalizationUI";
import { FounderSocialLayer } from "@/components/FounderSocialLayer";
import CompetitorScanner from "@/components/CompetitorScanner";
import CoFounderMatcher from "@/components/CoFounderMatcher";


// --- Vault Structure (Placeholder) ---
// Actual vault content coming. For now, show titles only.
const vaultFiles = [
  {
    id: "gtm-1",
    title: "Cold Email Sequences",
    category: "GTM Architecture",
    type: "document",
    tags: ["Sales", "Outbound"],
  },
  {
    id: "tech-1",
    title: "Technical Scaffolding",
    category: "Technical Foundations",
    type: "code",
    tags: ["Backend", "Infrastructure"],
  },
  {
    id: "scale-1",
    title: "Scale Systems & Operations",
    category: "Operations",
    type: "document",
    tags: ["Operations", "Automation"],
  }
];

export default function ProPortal() {
  const { session } = useAuth();
  const [, setLocation] = useLocation();

  const user = session?.user;


  // State: Ticker
  const [tickerLines, setTickerLines] = useState<string[]>([]);

  // State: IdeaBrowser Tool 1 (Friction)
  const [audienceSize, setAudienceSize] = useState(10000);
  const [productComplexity, setProductComplexity] = useState(50);
  const difficultyScore = Math.min(100, Math.max(1, Math.round(((audienceSize / 100000) * 40) + (productComplexity * 0.6))));

  // State: IdeaBrowser Tool 2 (Niche Saturation)
  const [marketCategory, setMarketCategory] = useState("B2B SaaS");
  const [pricePoint, setPricePoint] = useState(99);

  // State: IdeaBrowser Tool 3 (Acquisition)
  const [channel, setChannel] = useState("Cold Email");

  // Platform stats (live from API)
  const [platformStats, setPlatformStats] = useState<{ total: number; weekSignups: number } | null>(null);
  useEffect(() => {
    fetch("/api/subscribers/stats").then(r => r.ok ? r.json() : null).then(d => d && setPlatformStats(d)).catch(() => { });
  }, []);

  // State: The Vault
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const activeFile = vaultFiles.find(f => f.id === activeFileId);
  const [chatUsage, setChatUsage] = useState(0);

  // Command Field tool state
  const [cmdInputs, setCmdInputs] = useState<Record<string, string>>({});
  const [cmdOutputs, setCmdOutputs] = useState<Record<string, string>>({});
  const [cmdLoading, setCmdLoading] = useState<Record<string, boolean>>({});

  const runTool = async (toolId: string, input: string, mockFn: (v: string) => string) => {
    setCmdLoading(p => ({ ...p, [toolId]: true }));
    setCmdOutputs(p => ({ ...p, [toolId]: "" }));
    await new Promise(r => setTimeout(r, 600 + Math.random() * 300));
    setCmdOutputs(p => ({ ...p, [toolId]: mockFn(input) }));
    setCmdLoading(p => ({ ...p, [toolId]: false }));
  };

  // Load chat usage
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


  // State: The Intelligence Engine (Backend)
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [engineReport, setEngineReport] = useState<any>(null);

  const runIntelligenceEngine = async () => {
    if (!user?.email) return;
    setIsEngineRunning(true);
    try {
      const res = await fetch("/api/engine/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          industry: marketCategory,
          audienceSize,
          complexity: productComplexity,
          currentMRR: 0,
          description: (document.getElementById("startup-description") as HTMLTextAreaElement)?.value || ""
        })
      });
      const data = await res.json();
      if (data.success) {
        setEngineReport(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEngineRunning(false);
    }
  };

  useEffect(() => {
    const lines = [
      "Signal loaded. 3 new market gaps flagged since your last session.",
      "Blueprint #4 deployed by 12 founders this month.",
      "Modules loaded. System ready."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setTickerLines(prev => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">

      <PortalNav activePage="pro" />

      {/* ── THE VAULT OVERLAY (FULLSCREEN NOTION STYLE) ── */}
      <AnimatePresence>
        {activeFile && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl overflow-y-auto"
          >
            <div className="max-w-[1000px] mx-auto min-h-screen bg-card border-x border-border shadow-2xl relative">
              <div className="sticky top-0 bg-card/80 backdrop-blur-xl border-b border-border p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {activeFile.type === 'code' ? <Code2 className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl tracking-tight">{activeFile.title}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{activeFile.category}</p>
                  </div>
                </div>
                <button onClick={() => setActiveFileId(null)} className="px-6 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest rounded-full hover:opacity-80">
                  Close
                </button>
              </div>

              <div className="p-12 md:p-20 flex flex-col items-center justify-center min-h-[500px] text-center">
                <div className="flex gap-2 mb-10">
                  {activeFile.tags.map(tag => (
                    <Badge key={tag} className="bg-primary/5 text-primary border-primary/20">{tag}</Badge>
                  ))}
                </div>
                <h2 className="font-serif text-3xl mb-4">{activeFile.title}</h2>
                <p className="text-muted-foreground max-w-2xl text-lg mb-8">Coming soon. Your growth partner will unlock this playbook once you're matched.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[1400px] mx-auto py-16 px-5 md:px-8 space-y-40">

        {/* ── 1. HERO ── */}
        <section className="pt-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center justify-center gap-3 mb-8">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The Execution Engine</span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-[6rem] tracking-tight leading-[0.9] mb-10">
              The Pro Vault. <br />
              <span className="italic text-primary">Your Infrastructure.</span>
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-sans mx-auto max-w-4xl font-light">
              Playbooks for the problems that actually kill startups. Cold email. Unit economics. Scaling the team without chaos.
            </p>
          </motion.div>
        </section>

        {/* ── 2. LIVE TICKER ── */}
        <section>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <Terminal className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              {tickerLines.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-muted-foreground">{'>'} {line}</motion.div>
              ))}
              <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-3 bg-primary mt-1" />
            </div>
          </div>
        </section>

        {/* ── 3. THE HIGH-END VAULT ── */}
        <section>
          <div className="mb-12">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">PLAYBOOKS</Badge>
            <h2 className="font-serif text-5xl tracking-tight">The <span className="italic text-primary">Vault.</span></h2>
            <p className="text-muted-foreground font-sans text-xl mt-6 max-w-2xl font-light">
              Frameworks for GTM, hiring, capital raises, and scaling operations. Your growth partner unlocks these once matched.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaultFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className="p-8 bg-card border border-border rounded-3xl hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between min-h-[250px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                      {file.type === 'code' ? <Code2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{file.category}</p>
                  <h3 className="font-serif text-2xl tracking-tight group-hover:text-primary transition-colors">{file.title}</h3>
                </div>
                <div className="mt-8 flex gap-2">
                  {file.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[9px] uppercase">{tag}</Badge>)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setLocation('/vault-archive')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              Full Vault Archive <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 4. THE COGNITIVE BRAIN ── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-6">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] uppercase">Today's Brief</Badge>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#d4af37]" />
              </div>
              <DailyBriefUI />
            </div>

            <div className="lg:col-span-4">
              <PersonalizationUI />
            </div>
          </div>
        </section>

        {/* ── 4.5 BOARD OF ADVISORS ── */}
        <section>
          <div className="p-12 md:p-16 rounded-3xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl relative overflow-hidden">
            {/* Subtle animated background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="text-center mb-16 relative z-10">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] tracking-[0.3em] mb-6">YOUR ADVISORS</Badge>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-4">Pick Your <span className="italic text-primary">Strike Team.</span></h2>
              <p className="text-zinc-400 font-sans text-lg max-w-2xl mx-auto font-light">
                Choose the three roles you need most. Tell your advisor your bottleneck. Get a response in 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {[
                { icon: Crosshair, name: "Fundraising Lead", desc: "Analyzes your fundraise readiness. Tells you what VCs actually want to see." },
                { icon: Zap, name: "GTM Lead", desc: "Focuses on customer acquisition. Specific channels, specific tactics for your market." },
                { icon: Code2, name: "Technical Lead", desc: "Evaluates tech debt and architecture. What to build in-house, what to outsource." },
              ].map((role) => (
                <div key={role.name} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center group hover:border-primary/50 transition-colors cursor-pointer">
                  <div className={`w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <role.icon className={`w-8 h-8 text-white`} />
                  </div>
                  <h3 className="font-serif text-2xl mb-2 text-white">{role.name}</h3>
                  <p className="text-sm text-zinc-400 mb-6 font-light">{role.desc}</p>
                  <button className="mt-auto text-xs font-bold text-primary uppercase tracking-widest hover:text-primary/80">
                    Select Advisor
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4.75 FOUNDER SOCIAL LAYER ── */}
        <FounderSocialLayer />

        {/* ── 5. TOOL 2: NICHE SATURATION SCANNER ── */}
        <section>
          <div className="p-10 md:p-16 rounded-2xl bg-card border border-border shadow-lg">
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">MARKET SIZING</Badge>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 tracking-tight">Market <span className="italic text-primary">Density Check.</span></h2>
              <p className="text-muted-foreground font-sans text-lg leading-relaxed max-w-2xl mx-auto font-light">
                Pick your sector. See how crowded it is. High saturation? Win on brand and brand-adjacent positioning. Low saturation? Win on volume and speed.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mb-12 bg-background p-4 rounded-2xl border border-border">
              {["B2B SaaS", "DTC E-commerce", "AI Tooling", "Developer Infrastructure"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setMarketCategory(cat)}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${marketCategory === cat ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-8 bg-background rounded-3xl border border-border">
                <Crosshair className="w-8 h-8 mx-auto mb-4 text-primary" />
                <p className="text-3xl font-serif mb-2">{marketCategory === "AI Tooling" ? "98%" : marketCategory === "B2B SaaS" ? "85%" : "60%"}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Saturation Index</p>
              </div>
              <div className="p-8 bg-background rounded-3xl border border-border">
                <Zap className="w-8 h-8 mx-auto mb-4 text-primary" />
                <p className="text-3xl font-serif mb-2">{marketCategory === "DTC E-commerce" ? "Low" : "High"}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tech Barrier to Entry</p>
              </div>
              <div className="p-8 bg-primary text-primary-foreground rounded-3xl shadow-xl">
                <ShieldAlert className="w-8 h-8 mx-auto mb-4" />
                <p className="text-xl font-serif italic mb-2 leading-tight">
                  {marketCategory === "AI Tooling" ? "Compete on UX/UI and proprietary data loops." : "Compete on aggressive cold outbound and specific verticalization."}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-4">Required Strategy</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. CORE FRAMEWORKS ── */}
        <section>
          <div className="mb-12">
            <h2 className="font-serif text-5xl tracking-tight">Core <span className="italic text-primary">Frameworks.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 md:row-span-2 p-12 bg-card border border-border rounded-3xl">
              <Network className="w-10 h-10 text-primary mb-6" />
              <h3 className="font-serif text-4xl mb-4">Unit Economics</h3>
              <p className="text-muted-foreground font-sans text-lg font-light">Break down your CAC, LTV, payback period, and churn. See exactly where you're losing money and what to fix first.</p>
            </div>
            <div className="md:col-span-2 p-10 bg-primary/5 border border-primary/20 rounded-3xl flex flex-col justify-center">
              <h3 className="font-serif text-3xl mb-3 text-primary">Cap Table Strategy</h3>
              <p className="text-sm text-foreground/80 font-light">Structure equity to survive Series A and beyond. Understand founder dilution before you raise.</p>
            </div>
            <div className="p-8 bg-card border border-border rounded-3xl text-center flex flex-col items-center justify-center">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-serif text-xl">First 5 Hires</h4>
            </div>
            <div className="p-8 bg-card border border-border rounded-3xl text-center flex flex-col items-center justify-center">
              <Cpu className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-serif text-xl">Tech Stack</h4>
            </div>
          </div>
        </section>

        {/* ── 7. TOOL 3: ACQUISITION CHANNEL MATRIX ── */}
        <section>
          <div className="p-10 md:p-16 rounded-2xl bg-card border border-border shadow-lg flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">CAC VS LTV</Badge>
              <h2 className="font-serif text-4xl mb-6 tracking-tight">Channel <span className="italic text-primary">Tradeoffs.</span></h2>
              <p className="text-muted-foreground font-sans text-lg leading-relaxed mb-8 font-light">
                Cold email is cheap to acquire but low LTV. Paid ads cost more upfront but bring better quality customers. See the real tradeoff for your channel.
              </p>
              <div className="space-y-4">
                {["Cold Email", "Paid Social (Meta)", "SEO / Content"].map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`w-full p-4 text-left border rounded-xl flex items-center justify-between transition-all ${channel === ch ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted text-foreground'}`}
                  >
                    <span className="font-mono text-sm">{ch}</span>
                    {channel === ch && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 w-full h-[300px] bg-background border border-border rounded-3xl p-8 relative flex items-end justify-between gap-4">
              {/* CSS Bar Chart for CAC vs LTV */}
              <div className="w-1/3 flex flex-col items-center justify-end h-full gap-2">
                <motion.div initial={{ height: 0 }} animate={{ height: channel === "SEO / Content" ? "20%" : channel === "Paid Social (Meta)" ? "80%" : "40%" }} transition={{ duration: 0.5 }} className="w-full bg-red-500/20 rounded-t-lg relative border border-red-500/50">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-red-500">CAC</span>
                </motion.div>
              </div>
              <div className="w-1/3 flex flex-col items-center justify-end h-full gap-2">
                <motion.div initial={{ height: 0 }} animate={{ height: channel === "SEO / Content" ? "90%" : channel === "Paid Social (Meta)" ? "60%" : "70%" }} transition={{ duration: 0.5 }} className="w-full bg-green-500/20 rounded-t-lg relative border border-green-500/50">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-green-500">LTV</span>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. LIVE TELEMETRY DATA ── */}
        <section>
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl tracking-tight">System <span className="italic text-primary">Telemetry.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Platform Members", val: platformStats ? platformStats.total.toLocaleString() : "—", spark: [20, 30, 45, 60, 85, 100] },
              { label: "New Members This Week", val: platformStats ? platformStats.weekSignups.toLocaleString() : "—", spark: [10, 15, 30, 50, 60, 90] },
              { label: "System Uptime", val: "99.9%", spark: [100, 100, 100, 98, 100, 100] }
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-card border border-border rounded-3xl flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{stat.label}</p>
                <p className="font-serif text-4xl text-foreground mb-8">{stat.val}</p>
                <div className="flex items-end gap-1 h-12 w-full mt-auto">
                  {stat.spark.map((h, j) => (
                    <div key={j} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 9. COMPETITOR VULNERABILITY ENGINE ── */}
        <section>
          <CompetitorScanner />
        </section>

        {/* ── 10. CO-FOUNDER MATCHER ── */}
        <section>
          <CoFounderMatcher />
        </section>

        {/* ── 11. COMMAND FIELD ── */}
        <section>
          <div className="mb-10">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-4">Command Field</Badge>
            <h2 className="font-serif text-5xl tracking-tight">Precision <span className="italic text-primary">Instruments.</span></h2>
            <p className="text-muted-foreground font-sans text-lg mt-4 max-w-2xl font-light">
              Four tools. Each one built to answer a question that costs you weeks without it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: "market-signal",
                name: "Market Signal Scanner",
                desc: "Scores a market by demand, timing, and competitive density.",
                placeholder: "Enter a market or keyword (e.g. 'AI scheduling tools')",
                mock: (v: string) =>
                  `MARKET: ${v || "Unspecified"}\n\nSignal Score: 78/100\nDemand Trend: ↑ +34% YoY\nCompetitor Density: Medium (12 active players)\nFunding Activity: $420M deployed in category last 12 months\n\nTop Signal: B2B buyers in this space increased search intent by 3× since Q4. Early-mover window is 6–9 months before category leaders consolidate. Recommended entry: vertical-specific niche with a PLG motion.`,
              },
              {
                id: "revenue-modeler",
                name: "Revenue Modeler",
                desc: "Projects MRR, ARR, and break-even from price and volume inputs.",
                placeholder: "Price per user/month × expected customers (e.g. '$49 × 200')",
                mock: (v: string) => {
                  const parts = v.match(/\$?([\d.]+)\s*[x×]\s*([\d,]+)/i);
                  const price = parts ? parseFloat(parts[1]) : 49;
                  const volume = parts ? parseInt(parts[2].replace(",", "")) : 200;
                  const mrr = price * volume;
                  const arr = mrr * 12;
                  const breakeven = Math.ceil(mrr / 5000);
                  return `INPUTS: $${price}/mo × ${volume} customers\n\nMRR: $${mrr.toLocaleString()}\nARR: $${arr.toLocaleString()}\nBreak-even: Month ${breakeven}\n\nAssumptions: 5% monthly churn, $5K fixed monthly opex, 20% CAC payback period. At current trajectory, you hit default-alive at month ${breakeven + 2}. To accelerate: reduce churn by 2pp or add 1 upsell tier at 30% premium.`;
                },
              },
              {
                id: "competitor-radar",
                name: "Competitor Radar",
                desc: "Surfaces funding stage, pricing signals, and a clear attack vector.",
                placeholder: "Enter a competitor name (e.g. 'Notion', 'Linear')",
                mock: (v: string) =>
                  `COMPETITOR: ${v || "Unnamed"}\n\nFunding Stage: Series B (est. $60–120M raised)\nPricing Signal: $8–$16/seat/month, usage-based upsell\nGrowth Mode: PLG with enterprise overlay\n\nWeakness: ${v || "They"} over-index on features, under-invest in onboarding. New users take 14+ days to see value. Your attack vector: compress time-to-value to under 72 hours and document every win publicly. Their churned users will find you.`,
              },
              {
                id: "pitch-stress",
                name: "Pitch Stress-Tester",
                desc: "Hits your pitch headline with the 3 objections every investor will raise.",
                placeholder: "Enter your pitch headline (e.g. 'AI-powered sales coaching for SDRs')",
                mock: (v: string) =>
                  `PITCH: "${v || "Your idea"}"\n\nOBJECTION 1: "Why won't [large competitor] just build this?"\nCOUNTER: They will — in 24 months, after you've locked in 500 customers and have the retention data they can't replicate. First-mover stickiness in this category is documented at 68% annual retention.\n\nOBJECTION 2: "The TAM is too small."\nCOUNTER: The serviceable market for your beachhead is $1.2B. Series A doesn't need a $10B TAM — it needs a $100M ARR path. Show the wedge, not the ceiling.\n\nOBJECTION 3: "Why is your team the one to win this?"\nCOUNTER: Lead with domain expertise and distribution insight. If you've done the job the product solves, say it explicitly. Founder-market fit is the #1 predictor of pre-PMF survival.`,
              },
            ].map(tool => (
              <div key={tool.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/70 font-mono mb-1">{tool.desc}</p>
                  <h3 className="font-mono text-lg font-bold text-white">{tool.name}</h3>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cmdInputs[tool.id] ?? ""}
                    onChange={e => setCmdInputs(p => ({ ...p, [tool.id]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === "Enter") runTool(tool.id, cmdInputs[tool.id] ?? "", tool.mock);
                    }}
                    placeholder={tool.placeholder}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/60"
                  />
                  <button
                    onClick={() => runTool(tool.id, cmdInputs[tool.id] ?? "", tool.mock)}
                    disabled={cmdLoading[tool.id]}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-40 hover:opacity-90 transition-opacity font-mono"
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
                    ) : (
                      cmdOutputs[tool.id]
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 12. FINAL LAUNCH SEQUENCE ── */}
        <section className="pb-24">
          <div className="p-16 md:p-32 rounded-2xl bg-card border border-border text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-6 font-sans">NEXT STEP</p>
              <h2 className="font-serif text-5xl md:text-7xl mb-8 tracking-tight leading-[0.95]">
                You know what <br />
                <span className="italic">to do now.</span>
              </h2>
              <p className="text-muted-foreground font-sans text-xl leading-relaxed mb-12 font-light">
                Your growth partner is waiting. When you're matched, they unlock the full vault and walk you through the frameworks that work.
              </p>

              <button
                onClick={() => setLocation("/dashboard")}
                className="h-16 px-12 rounded-full bg-foreground text-background font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all font-sans mx-auto shadow-2xl"
              >
                Return to Dashboard <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <Footer variant="authenticated" />
    </div>
  );
}
