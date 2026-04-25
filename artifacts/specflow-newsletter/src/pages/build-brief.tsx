import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useLocation } from "wouter";
import {
  FileText, Zap, ArrowLeft, Lock, Target,
  TrendingUp, Users, Globe, ChevronRight, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PortalNav from "@/components/PortalNav";
import {
  getStartupContext,
  deriveMetrics,
  getCompetitiveSignals,
  stageLabels,
} from "@/lib/startup-context";
import StartupContextModal from "@/components/StartupContextModal";
import type { StartupContext } from "@/lib/startup-context";

export default function BuildBrief() {
  const { tier, isPremium, tierLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [ctx, setCtx] = useState<StartupContext | null>(null);
  const [showModal, setShowModal] = useState(false);

  const isMax = tier === "max" || tier === "incubator";
  const isPro = tierLoading ? true : isPremium;

  useEffect(() => {
    const stored = getStartupContext();
    if (stored) setCtx(stored);
    else if (isPremium) setShowModal(true);
  }, [isPremium]);

  if (!isPro && !tierLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <PortalNav activePage="build-brief" />
        <main className="max-w-2xl mx-auto px-6 py-32 text-center">
          <Lock className="w-10 h-10 text-primary mx-auto mb-6" />
          <h1 className="font-serif text-4xl mb-4">Build Brief</h1>
          <p className="text-muted-foreground mb-8">Your personalized founder brief is a Pro & Max exclusive.</p>
          <button onClick={() => setLocation("/dashboard")} className="px-8 py-4 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-widest">
            Upgrade to Pro →
          </button>
        </main>
      </div>
    );
  }

  const metrics = ctx ? deriveMetrics(ctx) : null;
  const signals = ctx ? getCompetitiveSignals(ctx) : null;

  // Standard light theme — matches max-portal and site original theme
  const s = {
    wrapper: "bg-background text-foreground",
    accent: "text-primary",
    card: "bg-card border-border",
    badge: "bg-primary/10 text-primary border-primary/20",
    label: "text-primary",
    btn: "bg-primary hover:bg-primary/90 text-primary-foreground",
    heading: "text-foreground",
    muted: "text-muted-foreground",
    border: "border-border",
    progress: "bg-primary",
    glow: "shadow-2xl shadow-primary/5",
  };

  return (
    <div className={`min-h-screen font-sans ${s.wrapper}`}>
      {showModal && (
        <StartupContextModal
          onComplete={c => { setCtx(c); setShowModal(false); }}
          onDismiss={() => setShowModal(false)}
        />
      )}

      <PortalNav activePage="build-brief" />

      <main className="max-w-[1100px] mx-auto px-6 py-14">
        <button
          onClick={() => setLocation(isMax ? "/max-portal" : "/pro-portal")}
          className={`flex items-center gap-1.5 text-sm mb-8 transition-colors ${s.muted} hover:text-foreground`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </button>

        {/* Hero */}
        <div className="mb-14">
          {isMax ? (
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary">
                Max Tier — Exclusive Brief
              </span>
            </div>
          ) : (
            <Badge className={`${s.badge} text-[10px] tracking-[0.3em] mb-6`}>PRO BRIEF</Badge>
          )}

          <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-[1.0] mb-6 text-foreground">
            {ctx ? (
              <>Your <span className="italic text-primary">Build Brief.</span></>
            ) : (
              <>The Build <span className="italic text-primary">Brief.</span></>
            )}
          </h1>

          {ctx ? (
            <p className={`text-lg max-w-2xl leading-relaxed ${s.muted}`}>
              Personalized for <strong className="text-foreground">{ctx.name}</strong> — {stageLabels[ctx.stage]} · {ctx.sector}
            </p>
          ) : (
            <p className={`text-lg max-w-2xl leading-relaxed ${s.muted}`}>
              Set your startup context to unlock your personalized brief — metrics, competitive signals, and your exact go-to-market path.
            </p>
          )}

          {!ctx && (
            <button
              onClick={() => setShowModal(true)}
              className={`mt-6 flex items-center gap-2 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${s.btn}`}
            >
              <Sparkles className="w-4 h-4" /> Activate Context Engine
            </button>
          )}

          {ctx && (
            <button
              onClick={() => setShowModal(true)}
              className={`mt-4 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70 ${s.muted}`}
            >
              Update Context →
            </button>
          )}
        </div>

        {ctx && metrics && signals ? (
          <div className="space-y-8">
            {/* Context Summary */}
            <div className={`p-8 rounded-2xl border ${s.card} ${s.glow}`}>
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-6 ${s.label}`}>Startup Profile</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Startup", val: ctx.name },
                  { label: "Stage", val: stageLabels[ctx.stage] },
                  { label: "Sector", val: ctx.sector },
                  { label: "Team Size", val: `${ctx.teamSize} ${ctx.teamSize === 1 ? "person" : "people"}` },
                ].map(item => (
                  <div key={item.label}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${s.muted}`}>{item.label}</p>
                    <p className="font-serif text-lg text-foreground">{item.val}</p>
                  </div>
                ))}
              </div>
              {ctx.problem && (
                <div className={`mt-6 pt-6 border-t ${s.border}`}>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${s.muted}`}>Problem Statement</p>
                  <p className={`text-sm leading-relaxed italic ${s.muted}`}>"{ctx.problem}"</p>
                </div>
              )}
            </div>

            {/* Unit Economics */}
            <div className={`p-8 rounded-2xl border ${s.card}`}>
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className={`w-5 h-5 ${s.label}`} />
                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${s.label}`}>Unit Economics — {ctx.sector}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    label: "Benchmark CAC",
                    val: `$${metrics.benchmarkCAC.toLocaleString()}`,
                    sub: "Sector average cost per customer",
                    color: "text-rose-500",
                  },
                  {
                    label: "Estimated LTV",
                    val: `$${metrics.estimatedLTV.toLocaleString()}`,
                    sub: "12-month revenue per customer",
                    color: "text-primary",
                  },
                  {
                    label: "LTV:CAC Ratio",
                    val: `${metrics.ltvCacRatio}×`,
                    sub: metrics.isHealthyUnit ? "Healthy (> 3× is the benchmark)" : "Below benchmark — optimize before scaling",
                    color: metrics.isHealthyUnit ? "text-emerald-500" : "text-amber-500",
                  },
                ].map(item => (
                  <div key={item.label} className={`p-6 rounded-xl border ${s.border} bg-background/5`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-3 ${s.muted}`}>{item.label}</p>
                    <p className={`font-serif text-4xl mb-2 ${item.color}`}>{item.val}</p>
                    <p className={`text-[10px] leading-relaxed ${s.muted}`}>{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className={`p-5 rounded-xl border ${s.border} bg-primary/5`}>
                <p className={`text-xs font-bold mb-1 ${s.label}`}>Strategic Verdict</p>
                <p className={`text-sm leading-relaxed ${s.muted}`}>
                  {metrics.isHealthyUnit
                    ? `Your sector's LTV:CAC benchmark is ${metrics.ltvCacRatio}×. This is above the 3× threshold — you are in scale mode. Every $1 in acquisition spend returns $${metrics.ltvCacRatio} in lifetime revenue. Increase acquisition budget and optimize for payback period.`
                    : `Your sector's current LTV:CAC ratio of ${metrics.ltvCacRatio}× is below the 3× threshold. Do not scale acquisition yet. Focus on reducing churn and increasing average contract value before increasing CAC.`}
                </p>
              </div>
            </div>

            {/* Competitive Intelligence */}
            <div className={`p-8 rounded-2xl border ${s.card}`}>
              <div className="flex items-center gap-3 mb-8">
                <Target className={`w-5 h-5 ${s.label}`} />
                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${s.label}`}>Competitive Intelligence — {ctx.sector}</p>
              </div>

              <div className="space-y-5">
                {signals.map((sig, i) => (
                  <div key={i} className={`p-6 rounded-xl border ${s.border}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${s.muted}`}>{sig.name}</p>
                        <p className={`text-sm mb-3 ${s.muted}`}><strong className="text-foreground">Weakness:</strong> {sig.weakness}</p>
                        <div className={`p-3 rounded-lg bg-primary/5 border ${s.border}`}>
                          <p className={`text-xs font-medium ${s.label}`}>Your Opportunity: {sig.opportunity}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${s.muted}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Go-To-Market Path */}
            <div className={`p-8 rounded-2xl border ${s.card}`}>
              <div className="flex items-center gap-3 mb-8">
                <Globe className={`w-5 h-5 ${s.label}`} />
                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${s.label}`}>Your 90-Day GTM Path</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    phase: "Week 1–2",
                    title: "Phantom Sale",
                    action: `Send 50 DMs to ${ctx.targetCustomer || "your ICP"} who have the problem. No product. Just a Stripe link and one paragraph.`,
                    metric: "Goal: 3 paying customers at $49–$199",
                  },
                  {
                    phase: "Week 3–4",
                    title: "Founding Member Close",
                    action: "Offer 10 founding memberships at 50% lifetime discount in exchange for monthly feedback + testimonial.",
                    metric: "Goal: 10 founding members",
                  },
                  {
                    phase: "Month 2",
                    title: "Distribution Rail",
                    action: `Build your ${ctx.sector === "B2B SaaS" || ctx.sector === "Developer Infrastructure" ? "LinkedIn + newsletter" : "content"} audience. Post about the problem — not the product.`,
                    metric: "Goal: 500 email subscribers",
                  },
                  {
                    phase: "Month 3",
                    title: "First Revenue Architecture",
                    action: "Convert top 20% of free users to paid. Add referral trigger at Day 30.",
                    metric: `Goal: $${ctx.stage === "scaling" ? "10k" : "3k"}+ MRR`,
                  },
                ].map((step, i) => (
                  <div key={i} className={`flex gap-6 p-5 rounded-xl border ${s.border}`}>
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${s.muted}`}>{step.phase}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${s.label}`}>{step.title}</p>
                      </div>
                      <p className={`text-sm mb-2 ${s.muted}`}>{step.action}</p>
                      <p className={`text-[10px] font-bold ${s.label}`}>{step.metric}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Max-only: Inner Circle CTA */}
            {isMax && (
              <div className={`p-10 rounded-2xl ${s.card}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className={`w-5 h-5 ${s.label}`} />
                  <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${s.label}`}>Max — Inner Circle</p>
                </div>
                <h3 className="font-serif text-3xl mb-3 text-foreground">Book Your Strategy Session</h3>
                <p className={`${s.muted} text-sm leading-relaxed mb-6`}>30 minutes. Your agenda. The Foundry principal team will review this brief live with you and give you the exact next move for your specific situation.</p>
                <a
                  href="mailto:yashvardhan@specflowai.com?subject=Max%20Strategy%20Session%20Request"
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${s.btn}`}
                >
                  Request Session <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        ) : (
          // No context yet
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Unit Economics", desc: "CAC, LTV, and LTV:CAC ratio benchmarked for your specific sector and stage." },
              { icon: Target, title: "Competitive Intel", desc: "Three competitors' weaknesses and your exact entry angle — specific to your sector." },
              { icon: Globe, title: "90-Day GTM Path", desc: "Week-by-week execution plan from zero to first paying customers." },
            ].map((card, i) => (
              <div key={i} className={`p-8 rounded-2xl border ${s.card} text-center`}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center bg-primary/10">
                  <card.icon className={`w-6 h-6 ${s.label}`} />
                </div>
                <h3 className="font-serif text-xl mb-2 text-foreground">{card.title}</h3>
                <p className={`text-xs leading-relaxed ${s.muted}`}>{card.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
