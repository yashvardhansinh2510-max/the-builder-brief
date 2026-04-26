import { useState, useEffect } from "react";
import logoPath from "@assets/logo.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import {
  Terminal, Database,
  Users,
  Code2, Settings, AlertTriangle,
  Zap, FileText, ChevronRight, CheckCircle2,
  Crosshair, ShieldAlert, Cpu, Network, ArrowUpRight, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PortalNav from "@/components/PortalNav";
import FounderChat from "@/components/FounderChat";
import { useSubscriberCount } from "@/hooks/useSubscriberCount";
import { getStartupContext, type StartupContext } from "@/lib/startup-context";
import { toast } from "sonner";
import DailyBriefUI from "@/components/DailyBriefUI";
import PersonalizationUI from "@/components/PersonalizationUI";


// --- High-End Vault Data ---
const vaultFiles = [
  {
    id: "gtm-1",
    title: "Cold Email Sequence: The 'Quick Question' Frame",
    category: "GTM Architecture",
    type: "document",
    tags: ["Sales", "Outbound"],
    content: `# The 'Quick Question' Frame

Stop sending 5-paragraph essays. No founder has time to read your life story. The goal of the cold email is to solicit a binary response: Yes or No.

## The Structure:
**Subject:** quick question / {{company_name}}
**Body:**
Hey {{first_name}}, 
Noticed you're scaling the engineering team but you still don't have a dedicated DevOps hire. Are you currently handling deployment architecture yourself?
We built a scaffolding tool that reduces deployment times by 40% for lean teams. Worth a quick chat next week?
Best, 
Founder

## Why it works:
1. **Low Friction:** It takes 2 seconds to read.
2. **Observation:** Proves you actually looked at their hiring board.
3. **Binary Ask:** "Worth a chat?"`
  },
  {
    id: "tech-1",
    title: "Razorpay Payment Verification V3",
    category: "Technical Scaffolding",
    type: "code",
    tags: ["Backend", "Payments"],
    content: `// The exact high-performance payment verification we use in production.
import crypto from "crypto";
import { db, subscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function verifyRazorpayPayment(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, plan } = await req.json();

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    return { error: "Invalid signature", status: 400 };
  }

  // Update subscriber tier
  await db.update(subscribersTable)
    .set({
      tier: plan.toLowerCase().replace(" ", "_"),
      paymentProvider: "razorpay",
      lastPaymentAt: new Date()
    })
    .where(eq(subscribersTable.email, email));

  return { success: true, message: "Payment verified" };
}`
  },
  {
    id: "scale-1",
    title: "The Zero-Touch Onboarding Loop",
    category: "Scale Systems",
    type: "document",
    tags: ["Operations", "Automation"],
    content: `# The Zero-Touch Architecture

If you are manually onboarding customers past $10k MRR, you do not have a business; you have a consulting firm.

## The Stack:
1. **Razorpay Orders:** Captures payment in your region (INR/USD agnostic).
2. **Webhook Handler:** Verifies signature, updates subscription tier in real-time.
3. **Resend (Email):** Sends activation email with portal access.
4. **Zapier:** Pings Slack channel #new-revenue.

You literally sleep while the system provisions the environment.`
  }
];

export default function ProPortal() {
  const { session } = useAuth();
  const [, setLocation] = useLocation();

  const user = session?.user;

  // Startup context — personalizes CAC/LTV, competitor intel, board consult prompts
  const [startupCtx, setStartupCtx] = useState<StartupContext | null>(null);

  useEffect(() => {
    const stored = getStartupContext();
    if (stored) {
      setStartupCtx(stored);
      // Pre-select market category from context sector
      const sectorMap: Record<string, string> = {
        "B2B SaaS": "B2B SaaS",
        "AI Tooling": "AI Tooling",
        "Developer Infrastructure": "Developer Infrastructure",
        "DTC / E-commerce": "DTC E-commerce",
      };
      if (sectorMap[stored.sector]) setMarketCategory(sectorMap[stored.sector]);
    }
  }, []);

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

  // State: IdeaBrowser Tool 4 (Competitor Vulnerability)
  const [competitorSize, setCompetitorSize] = useState("Enterprise ($100M+)");

  // Platform stats (live from API)
  const [platformStats, setPlatformStats] = useState<{ total: number; weekSignups: number } | null>(null);
  useEffect(() => {
    fetch("/api/subscribers/stats").then(r => r.ok ? r.json() : null).then(d => d && setPlatformStats(d)).catch(() => { });
  }, []);

  // State: The Vault
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const activeFile = vaultFiles.find(f => f.id === activeFileId);
  const [chatUsage, setChatUsage] = useState(0);

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
                  Close Document
                </button>
              </div>

              <div className="p-12 md:p-20">
                <div className="flex gap-2 mb-10">
                  {activeFile.tags.map(tag => (
                    <Badge key={tag} className="bg-primary/5 text-primary border-primary/20">{tag}</Badge>
                  ))}
                </div>

                {activeFile.type === 'code' ? (
                  <div className="bg-foreground text-background/90 p-8 rounded-xl overflow-x-auto shadow-2xl border border-primary/20">
                    <pre className="font-mono text-sm leading-relaxed">{activeFile.content}</pre>
                  </div>
                ) : (
                  <div className="prose prose-lg dark:prose-invert max-w-none font-serif">
                    <pre className="font-sans text-lg leading-loose text-foreground whitespace-pre-wrap font-light">{activeFile.content}</pre>
                  </div>
                )}
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
              You stopped browsing. Good. Everything in here is built for founders who are already moving.
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
            <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">CORE ASSETS</Badge>
            <h2 className="font-serif text-5xl tracking-tight">The <span className="italic text-primary">Data Room.</span></h2>
            <p className="text-muted-foreground font-sans text-xl mt-6 max-w-2xl font-light">
              Click any blueprint below to mount the file into the immersive viewer. Do not share these assets outside the Pro Sanctum.
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
              <Badge className="bg-primary/20 text-primary border-none text-[10px] tracking-[0.3em] mb-6">EXCLUSIVE</Badge>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-4">Board of <span className="italic text-primary">Advisors.</span></h2>
              <p className="text-zinc-400 font-sans text-lg max-w-2xl mx-auto font-light">
                Your dedicated tactical strike team. They dissect the output from the Cognitive Brain and turn it into actionable execution code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {[
                {
                  icon: Crosshair,
                  name: "The VC",
                  desc: "Ruthlessly analyzes your TAM and monetization cap. Tells you exactly why you won't get funded.",
                  prompt: startupCtx
                    ? `I'm building ${startupCtx.name} — ${startupCtx.problem}. We're at ${startupCtx.stage} stage in ${startupCtx.sector}. Tell me exactly why a VC would pass on us right now and what we need to fix before the next raise.`
                    : "Tell me exactly why a VC would pass on my startup and what we need to fix.",
                  bg: "bg-zinc-800",
                },
                {
                  icon: Zap,
                  name: "The Growth Hacker",
                  desc: "Ignores product completely. Focuses 100% on exploiting distribution loops and slashing CAC.",
                  prompt: startupCtx
                    ? `I'm running ${startupCtx.name} in ${startupCtx.sector}, currently at ${startupCtx.stage}. My target customer: ${startupCtx.targetCustomer || "early-stage founders"}. Give me the top 3 distribution plays to slash CAC this week — specific channels, specific tactics.`
                    : "Give me 3 distribution plays to slash my CAC this week.",
                  bg: "bg-primary",
                  iconColor: "text-black",
                },
                {
                  icon: Code2,
                  name: "The CTO",
                  desc: "Evaluates technical debt and architectural choices. Gives you the exact stack you need to scale.",
                  prompt: startupCtx
                    ? `I'm building ${startupCtx.name} for ${startupCtx.targetCustomer || "founders"} in ${startupCtx.sector}. Team size: ${startupCtx.teamSize}. What's the lean tech stack I should be running right now, and what should I absolutely not build in-house?`
                    : "What lean tech stack should I run right now and what should I not build in-house?",
                  bg: "bg-zinc-800",
                },
              ].map((advisor) => (
                <div key={advisor.name} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
                  <div className={`w-16 h-16 rounded-full ${advisor.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <advisor.icon className={`w-8 h-8 ${advisor.iconColor || "text-white"}`} />
                  </div>
                  <h3 className="font-serif text-2xl mb-2 text-white">{advisor.name}</h3>
                  <p className="text-sm text-zinc-400 mb-6 font-light">{advisor.desc}</p>
                  {startupCtx && (
                    <p className="text-[9px] text-zinc-500 mb-4 italic">Context: {startupCtx.name} · {startupCtx.sector}</p>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(advisor.prompt);
                      toast.success(`${advisor.name} prompt copied`, { description: "Paste it into the AI Advisor below." });
                    }}
                    className="mt-auto text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                  >
                    Copy Prompt →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. TOOL 2: NICHE SATURATION SCANNER ── */}
        <section>
          <div className="p-10 md:p-16 rounded-2xl bg-card border border-border shadow-lg">
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">MARKET SCANNER</Badge>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 tracking-tight">Niche <span className="italic text-primary">Saturation Engine.</span></h2>
              <p className="text-muted-foreground font-sans text-lg leading-relaxed max-w-2xl mx-auto font-light">
                Input your sector to instantly visualize market density. High density means you must compete on brand; low density means you compete on raw distribution.
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

        {/* ── 6. THE MASTER PLAYBOOK (BENTO) ── */}
        <section>
          <div className="mb-12">
            <h2 className="font-serif text-5xl tracking-tight">Architectural <span className="italic text-primary">Systems.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 md:row-span-2 p-12 bg-card border border-border rounded-3xl">
              <Network className="w-10 h-10 text-primary mb-6" />
              <h3 className="font-serif text-4xl mb-4">The Growth Loop</h3>
              <p className="text-muted-foreground font-sans text-lg font-light">Most founders build funnels. Funnels end. You need to build loops. Learn how to architect a system where every new user brings in 1.2 additional users automatically.</p>
            </div>
            <div className="md:col-span-2 p-10 bg-primary/5 border border-primary/20 rounded-3xl flex flex-col justify-center">
              <h3 className="font-serif text-3xl mb-3 text-primary">Cap Table Defense</h3>
              <p className="text-sm text-foreground/80 font-light">Structure your equity to survive Series A dilution. Exact legal frameworks included.</p>
            </div>
            <div className="p-8 bg-card border border-border rounded-3xl text-center flex flex-col items-center justify-center">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-serif text-xl">Hiring Matrix</h4>
            </div>
            <div className="p-8 bg-card border border-border rounded-3xl text-center flex flex-col items-center justify-center">
              <Cpu className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-serif text-xl">Tech Scaffolding</h4>
            </div>
          </div>
        </section>

        {/* ── 7. TOOL 3: ACQUISITION CHANNEL MATRIX ── */}
        <section>
          <div className="p-10 md:p-16 rounded-2xl bg-card border border-border shadow-lg flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">CAC / LTV MODELER</Badge>
              <h2 className="font-serif text-4xl mb-6 tracking-tight">Acquisition <span className="italic text-primary">Matrix.</span></h2>
              <p className="text-muted-foreground font-sans text-lg leading-relaxed mb-8 font-light">
                Select an acquisition channel to visualize the projected Customer Acquisition Cost (CAC) against the Lifetime Value (LTV) decay curve.
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

        {/* ── 9. TOOL 4: COMPETITOR VULNERABILITY ENGINE ── */}
        <section>
          <div className="p-10 md:p-16 rounded-2xl bg-foreground text-background border border-primary/20 shadow-2xl flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] tracking-[0.3em] mb-6">COMPETITIVE INTELLIGENCE</Badge>
              <h2 className="font-serif text-4xl mb-6 tracking-tight">Vulnerability <span className="italic text-primary">Engine.</span></h2>
              <p className="text-background/60 font-sans text-lg leading-relaxed mb-8 font-light">
                How do you beat a $100M competitor? You don't build more features. You exploit their scale. Select your primary competitor tier to reveal their structural weaknesses.
              </p>
              <select
                className="w-full p-4 bg-background/5 border border-background/10 rounded-xl font-mono text-sm focus:outline-none focus:border-primary text-background"
                value={competitorSize}
                onChange={(e) => setCompetitorSize(e.target.value)}
              >
                <option>Legacy Enterprise ($1B+)</option>
                <option>Scale-Up ($100M+)</option>
                <option>VC-Backed Startup ($10M+)</option>
              </select>
            </div>
            <div className="flex-1 bg-background/5 p-8 rounded-xl border border-background/10 w-full">
              <AlertTriangle className="w-8 h-8 text-primary mb-6" />
              <h4 className="font-serif text-2xl mb-4">Identified Weakness</h4>
              {startupCtx && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-3">
                  For {startupCtx.name} · {startupCtx.sector}
                </p>
              )}
              <p className="font-mono text-sm leading-relaxed text-background/80">
                {competitorSize === "Legacy Enterprise ($1B+)"
                  ? `Extremely slow product cycles. Poor UI/UX. Compete by offering a hyper-specific, beautifully designed tool for a single workflow they ignore.${startupCtx ? ` In ${startupCtx.sector}, their enterprise contracts create 6-12 month implementation lag — your self-serve onboarding is your moat.` : ""}`
                  : competitorSize === "Scale-Up ($100M+)"
                    ? `Bloated pricing models to satisfy board expectations. Compete by undercutting price drastically and offering transparent, self-serve onboarding.${startupCtx ? ` Target the ${startupCtx.targetCustomer || "SMB"} segment they've abandoned to chase enterprise.` : ""}`
                    : `High burn rate. They must hit massive milestones. Compete by staying lean, profitable, and servicing the long-tail customers they are ignoring to chase whales.${startupCtx ? ` At ${startupCtx.stage} stage in ${startupCtx.sector}, your speed advantage is your only real moat — use it.` : ""}`}
              </p>
            </div>
          </div>
        </section>

        {/* ── 10. FINAL LAUNCH SEQUENCE ── */}
        <section className="pb-24">
          <div className="p-16 md:p-32 rounded-2xl bg-card border border-border text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-6 font-sans">DEPLOYMENT READY</p>
              <h2 className="font-serif text-5xl md:text-7xl mb-8 tracking-tight leading-[0.95]">
                Execute the <br />
                <span className="italic">Framework.</span>
              </h2>
              <p className="text-muted-foreground font-sans text-xl leading-relaxed mb-12 font-light">
                You have the tools. You have the blueprints. The market is saturated with tourists. It's time for the architects to build.
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
      <footer className="py-12 border-t border-border/40 bg-card">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover opacity-80" />
            <p className="text-sm font-serif tracking-tight">The Build Brief Pro</p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">Pro Execution Vault • Active</p>
        </div>
      </footer>
    </div>
  );
}
