import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import {
  Shield, CheckCircle2, Clock, Rocket,
  Globe, ArrowRight, Lock, MessageSquare, Briefcase,
  Users, Zap, Target,
  ChevronRight, Award, Building2, BarChart3
} from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { Badge } from "@/components/ui/badge";

const timelinePhases = [
  {
    id: "applied",
    label: "File Received",
    status: "complete",
    desc: "Your application entered our private vault. Partners have been notified.",
    time: "Immediate",
  },
  {
    id: "reviewing",
    label: "Partner Review",
    status: "current",
    desc: "Our founding team is reviewing your market thesis, technical fit, and founder profile. This is not automated.",
    time: "24–48 Hours",
  },
  {
    id: "interview",
    label: "Discovery Call",
    status: "pending",
    desc: "A private 1-on-1 with a founding partner. No pitch deck required — this is a real conversation about your venture.",
    time: "Upon Selection",
  },
  {
    id: "final",
    label: "Inner Circle Access",
    status: "pending",
    desc: "Keys to the foundry. You're now a partner. The engineering team, sales systems, and network are yours.",
    time: "Upon Acceptance",
  },
];

const bentoPerks = [
  {
    icon: MessageSquare,
    title: "Partner Direct Line",
    desc: "Private Signal access to the founding team. Not a Slack community — a direct line to the people building with you.",
    size: "large",
  },
  {
    icon: Globe,
    title: "Executive Summits",
    desc: "Quarterly closed-door meetups in global hubs. The conversations that happen here don't happen anywhere else.",
    size: "medium",
  },
  {
    icon: Shield,
    title: "Equity Architecture",
    desc: "Cap table structuring, SAFE note strategy, and legal frameworks built for exits. Not templates — bespoke.",
    size: "medium",
  },
  {
    icon: Users,
    title: "Hiring Foundry",
    desc: "Access to a vetted bench of senior builders, GTM leads, and growth operators ready to join your team.",
    size: "small",
  },
  {
    icon: Target,
    title: "Exit Positioning",
    desc: "Every decision from Day 1 is made with the acquisition multiple in mind. We know what acquirers actually look for.",
    size: "small",
  },
  {
    icon: BarChart3,
    title: "Revenue Systems",
    desc: "Sales playbooks, outbound infrastructure, and distribution channels built for your first $100k.",
    size: "small",
  },
];


function StatusDot({ status }: { status: string }) {
  if (status === "complete") return <CheckCircle2 className="w-5 h-5 text-primary" />;
  if (status === "current") return <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />;
  return <div className="w-2.5 h-2.5 rounded-full bg-border" />;
}

export default function IncubatorDashboard() {
  const [, params] = useRoute("/incubator/status/:id");
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch(`/api/leads/${params?.id}`);
        const data = await res.json();
        if (data.success) setLead(data.lead);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [params?.id]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
        <Rocket className="w-7 h-7 text-primary" />
      </motion.div>
    </div>
  );

  const firstName = lead?.name?.split(" ")[0] || "Builder";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* NAV */}
      <nav className="border-b border-border/40 py-5 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-lg z-50">
        <div className="flex items-center gap-3">
          <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover" />
          <span className="font-serif text-lg tracking-tight">
            The Build Brief <span className="text-primary italic">Incubator</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hidden sm:flex">
            Private Member Area
          </Badge>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-16 px-5 md:px-6 space-y-32">

        {/* ── HERO ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main greeting */}
            <div className="lg:col-span-2 p-10 md:p-14 rounded-[2.5rem] bg-card border border-card-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-5 font-sans">Application Status — Under Review</p>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[0.92] mb-6">
                You're in the <br />
                <span className="italic">vault,</span> {firstName}.
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg leading-relaxed font-sans">
                Your file is with our partners. This isn't an automated system — real people are reading your application right now. Below is your live trajectory.
              </p>
            </div>

            {/* Status card */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 p-8 rounded-[2rem] bg-card border border-primary/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/[0.03] pointer-events-none" />
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative z-10">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-2 relative z-10">Current Phase</p>
                <p className="font-serif text-2xl text-primary relative z-10">Partner Review</p>
                <p className="text-[10px] text-muted-foreground mt-4 font-sans relative z-10">Response within 48 hours</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-card border border-card-border flex items-center gap-4">
                <Award className="w-8 h-8 text-primary opacity-60 shrink-0" />
                <div>
                  <p className="font-serif text-lg leading-tight">Only 5 partners<br />per quarter</p>
                  <p className="text-[10px] text-muted-foreground font-sans mt-1 uppercase tracking-widest">No exceptions.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-card border border-card-border text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-sans">Coming soon. Portfolio metrics unlock after you're matched with a partner.</p>
            </div>
          </motion.div>
        </section>

        {/* ── TIMELINE ── */}
        <section>
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 font-sans">Your Trajectory</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">The Path <span className="italic">In.</span></h2>
          </div>

          <div className="space-y-4">
            {timelinePhases.map((phase, i) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`p-7 md:p-8 rounded-2xl border transition-all ${
                  phase.status === "complete"
                    ? "bg-primary/[0.03] border-primary/20"
                    : phase.status === "current"
                    ? "bg-card border-primary/30 shadow-lg shadow-primary/5"
                    : "bg-card/50 border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 ${
                    phase.status === "complete"
                      ? "border-primary bg-primary/10"
                      : phase.status === "current"
                      ? "border-primary"
                      : "border-border"
                  }`}>
                    <StatusDot status={phase.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4 className="font-serif text-xl md:text-2xl tracking-tight">{phase.label}</h4>
                      <span className={`text-[9px] font-bold uppercase tracking-[0.25em] font-sans px-3 py-1 rounded-full ${
                        phase.status === "complete"
                          ? "bg-primary/10 text-primary"
                          : phase.status === "current"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {phase.status === "complete" ? "Done" : phase.status === "current" ? "Active" : phase.time}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed font-sans max-w-2xl">{phase.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── BENTO PERKS ── */}
        <section>
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 font-sans">What Awaits You</p>
            <h2 className="font-serif text-4xl md:text-6xl tracking-tight mb-4">The <span className="italic">Inner Circle</span><br />Experience.</h2>
            <p className="text-muted-foreground font-sans max-w-xl mx-auto text-lg">
              This isn't a cohort. This is a private alliance. We only accept founders we are willing to build with for 10+ years.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 p-10 rounded-[2rem] bg-card border border-card-border relative overflow-hidden group hover:border-primary/20 transition-all"
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-3xl md:text-4xl mb-3 tracking-tight relative z-10">Partner Direct Line</h3>
              <p className="text-muted-foreground leading-relaxed font-sans max-w-md relative z-10">
                Private Signal access to the founding team — not a Slack community, not a Discord server. A direct line to the operators building alongside you. Message us at 11pm on a Friday. We respond.
              </p>
              <div className="mt-8 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest font-sans relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Lock className="w-3 h-3" /> Unlocked upon acceptance
              </div>
            </motion.div>

            {/* Tall card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="p-8 rounded-[2rem] bg-card border border-card-border group hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-2xl mb-3 tracking-tight">Executive Summits</h3>
              <p className="text-muted-foreground leading-relaxed font-sans text-sm">
                Quarterly closed-door meetups in global hubs. Dubai, London, Bangalore, New York. The deals that happen at these tables don't happen anywhere else.
              </p>
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground font-sans">Next Summit</p>
                <p className="font-serif text-lg mt-1">August 2026 — TBA</p>
              </div>
            </motion.div>

            {/* Medium cards */}
            {[
              {
                icon: Shield,
                title: "Equity Architecture",
                desc: "Cap table structuring, SAFE strategy, and legal frameworks built for maximum exit multiple. Bespoke, not templated.",
              },
              {
                icon: Users,
                title: "Hiring Foundry",
                desc: "A vetted bench of senior builders, GTM leads, and growth operators. Interview-ready, founder-tested.",
              },
              {
                icon: Target,
                title: "Exit Positioning",
                desc: "Every decision from Day 1 is made with the acquisition multiple in mind. We know what acquirers actually look for.",
              },
            ].map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * (i + 1) }}
                className="p-7 rounded-[2rem] bg-card border border-card-border group hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center mb-5">
                  <perk.icon className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="font-serif text-xl mb-2 tracking-tight">{perk.title}</h4>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section>
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 font-sans">From the Foundry</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              Founders who <span className="italic">made it</span>.
            </h2>
          </div>

          <div className="p-10 rounded-[2rem] bg-card border border-card-border text-center flex items-center justify-center min-h-80">
            <div className="flex flex-col items-center gap-3">
              <Lock className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-sans max-w-md">Coming soon. Live founder outcomes and case studies unlock upon acceptance to the Inner Circle.</p>
            </div>
          </div>
        </section>

        {/* ── FOUNDRY RECORD ── */}
        <section>
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 font-sans">The Track Record</p>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight">Foundry <span className="italic">Alumni.</span></h2>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground font-sans opacity-60 border border-border rounded-full px-4 py-2">
              Verified Exits & Results
            </div>
          </div>

          <div className="p-10 rounded-[2rem] bg-card border border-card-border text-center flex items-center justify-center min-h-80">
            <div className="flex flex-col items-center gap-3">
              <Lock className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-sans max-w-md">Coming soon. Verified exit data and portfolio results unlock for Inner Circle members only.</p>
            </div>
          </div>
        </section>

        {/* ── VENTURE MATH ── */}
        <section>
          <div className="p-10 md:p-16 rounded-[3rem] bg-card border border-primary/15 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full group-hover:bg-primary/8 transition-colors duration-700 pointer-events-none" />

            <div className="relative z-10 mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 font-sans">The Investment Case</p>
              <h2 className="font-serif text-4xl md:text-6xl mb-4 tracking-tight">The <span className="italic">Venture Math.</span></h2>
              <p className="text-muted-foreground font-sans max-w-xl text-lg leading-relaxed">
                Building a multi-million dollar moat requires infrastructure most founders can't afford. We eliminate that overhead entirely.
              </p>
            </div>

            <div className="relative z-10 overflow-x-auto">
              <table className="w-full text-left text-sm font-sans border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-5 px-4 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">What You Need</th>
                    <th className="py-5 px-4 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Market Rate</th>
                    <th className="py-5 px-4 text-primary font-bold uppercase tracking-widest text-[10px]">Inner Circle Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[
                    { need: "Fractional CTO / Lead Architect", cost: "$150,000+", inc: "Partner Access — Included" },
                    { need: "Strategic GTM & Sales Systems", cost: "$60,000+", inc: "Internal Foundry — Included" },
                    { need: "VC / Equity Architecture", cost: "$30,000+", inc: "Verified Blueprints — Included" },
                    { need: "Sales & Distribution Rails", cost: "$80,000+", inc: "Direct Distribution — Included" },
                    { need: "Legal & Cap Table Defense", cost: "$25,000+", inc: "Partner Network — Included" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-primary/[0.015] transition-colors">
                      <td className="py-6 px-4 font-serif text-xl tracking-tight">{row.need}</td>
                      <td className="py-6 px-4 font-sans text-muted-foreground/50 line-through decoration-primary/30">{row.cost}</td>
                      <td className="py-6 px-4 font-bold text-primary">
                        <span className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 shrink-0" /> {row.inc}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="relative z-10 mt-12 flex flex-col md:flex-row items-start md:items-center justify-between border-t border-border pt-10 gap-6">
              <div>
                <p className="font-serif text-3xl md:text-4xl">
                  Real-World Value: <span className="italic text-primary">$345,000+</span>
                </p>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground mt-2 font-sans">
                  Pricing discussed on your discovery call only.
                </p>
              </div>
              <div className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 font-sans shrink-0">
                Calculated ROI: 12.5x Minimum
              </div>
            </div>
          </div>
        </section>

        {/* ── LOCKED FIREPOWER ── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-10 rounded-[2.5rem] bg-card border border-card-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              <h3 className="font-serif text-3xl mb-3 relative z-10">Locked <span className="italic">Firepower.</span></h3>
              <p className="text-sm text-muted-foreground font-sans mb-8 leading-relaxed relative z-10">
                Once accepted, these systems are transferred to your control. No waiting, no lag. You start building mid-interview if the alignment is right.
              </p>
              <div className="space-y-3 relative z-10">
                {[
                  { icon: Briefcase, label: "Venture Architecture Suite", desc: "Full V1 scaffolding, infrastructure blueprints, and CI/CD." },
                  { icon: MessageSquare, label: "Partner Capital Network", desc: "Direct warm intros to 40+ active investors." },
                  { icon: Zap, label: "Scaling Foundry", desc: "Sales automations and outbound rails for the first $100k." },
                  { icon: Building2, label: "Legal Entity Framework", desc: "Corp structure, IP assignment, and founder agreements." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-background/40 border border-border/60 grayscale opacity-50 select-none">
                    <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold tracking-tight font-sans">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground font-sans mt-0.5">{item.desc}</p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-card border border-primary/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-serif text-3xl mb-4 tracking-tight">Awaiting Partner Signal.</h4>
                <p className="text-muted-foreground font-sans leading-relaxed text-sm max-w-xs">
                  Our process is intentionally slow. We'd rather take 30 days to get the right partner than 3 days to get the wrong one. You'll know within 48 hours of submitting.
                </p>
              </div>
              <div className="relative z-10 mt-10 space-y-3">
                <a
                  href="mailto:yashvardhan@specflowai.com?subject=Incubator Application Follow-up"
                  className="w-full h-14 rounded-full bg-foreground text-background font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all font-sans"
                >
                  <MessageSquare className="w-4 h-4" /> Contact Partners Directly
                </a>
                <p className="text-center text-[10px] text-muted-foreground font-sans uppercase tracking-widest opacity-60">
                  Respond time: typically same-day
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PARTNER NETWORK ── */}
        <section className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 font-sans">Ecosystem Access</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-12 tracking-tight">The <span className="italic">Partner</span> Network.</h2>

          <div className="flex flex-wrap justify-center gap-10 md:gap-16 opacity-40 hover:opacity-70 transition-opacity duration-700">
            {["Sequoia Alumni", "YC Alumni Fund", "Foundry Group", "Index Partners", "Atlas Venture", "Emergent VC"].map((partner, i) => (
              <div key={i} className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="font-serif text-xl md:text-2xl tracking-tighter">{partner}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-bold">
            Direct Intros & Strategic Capital Pipes Reserved for Members Only
          </p>
        </section>

        {/* ── FINAL CTA ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-20 rounded-[3rem] bg-card border border-primary/20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-5 font-sans">While You Wait</p>
              <h2 className="font-serif text-4xl md:text-6xl mb-6 tracking-tight leading-[0.92]">
                The right answer<br />
                <span className="italic">is worth the wait.</span>
              </h2>
              <p className="text-muted-foreground font-sans max-w-xl mx-auto text-lg leading-relaxed mb-10">
                Every partner in the Inner Circle went through this same process. The ones who made it weren't the loudest — they were the most prepared. Use this time to sharpen your thesis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:yashvardhan@specflowai.com?subject=Incubator Application — {firstName}"
                  className="h-14 px-10 rounded-full bg-foreground text-background font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all font-sans"
                >
                  <MessageSquare className="w-4 h-4" /> Message the Partners
                </a>
                <a
                  href="/"
                  className="h-14 px-10 rounded-full border border-border font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-all font-sans"
                >
                  Read the Latest Issue <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      <footer className="py-10 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="The Build Brief" className="w-6 h-6 rounded-sm object-cover opacity-60" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 font-sans">The Build Brief Incubator</p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 font-sans">Private & Confidential • By Invitation Only</p>
        </div>
      </footer>
    </div>
  );
}
