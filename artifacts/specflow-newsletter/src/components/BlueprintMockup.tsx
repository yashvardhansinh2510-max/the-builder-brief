import { motion } from "framer-motion";
import { Lock, CheckCircle2, Circle, Terminal, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { issues } from "@/lib/data";

const issue = issues.find(i => i.number === "008")!;

export function BlueprintMockup() {
  const blueprintSteps = issue.blueprint ?? issue.buildBrief ?? [];

  return (
    <div className="w-full max-w-4xl mx-auto relative group">
      {/* Outer glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />

      {/* Document container */}
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/40 rounded-[2rem] shadow-2xl overflow-hidden">

        {/* Window chrome */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-background/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-2 bg-background/60 border border-border/40 rounded-lg px-3 py-1 mx-auto">
            <Terminal className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">
              vault / issues / 008_rentshield.md
            </span>
            <Lock className="w-3 h-3 text-primary/60" />
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />

          {/* Issue number badge */}
          <div className="absolute top-4 left-6 text-[10px] font-bold font-mono uppercase tracking-[0.4em] text-primary/60">
            ISSUE 008 · FREE TIER
          </div>

          {/* Category badges */}
          <div className="absolute top-4 right-6 flex gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/10 border border-primary/30 text-primary px-2.5 py-1 rounded-full">
              {issue.category}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-foreground/5 border border-border/40 text-muted-foreground px-2.5 py-1 rounded-full">
              {issue.tam}
            </span>
          </div>

          {/* Revenue badge */}
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-green-500">
              Revenue in {issue.revenueIn}
            </span>
          </div>
        </div>

        {/* Document body */}
        <div className="px-8 pb-8 pt-4 space-y-6 relative">

          {/* Blur overlay for locked content — bottom half */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10 pointer-events-none rounded-b-[2rem]" />
          <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md border border-primary/20 text-muted-foreground text-xs px-4 py-2 rounded-full shadow-lg">
              <Lock className="w-3.5 h-3.5 text-primary" />
              Full blueprint unlocked on Free signup
            </div>
            <Link href="/sign-up">
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group/cta">
                Start Reading Free
                <ExternalLink className="w-3 h-3 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-serif text-3xl md:text-4xl text-foreground leading-tight mb-2">
              {issue.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {issue.tagline}
            </p>
          </div>

          {/* Problem Statement */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
              The Problem
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {issue.problem}
            </p>
          </div>

          {/* Blueprint Checklist */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4">
              The Blueprint
            </p>
            <div className="space-y-3">
              {blueprintSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors group/step cursor-default ${
                    idx === 0
                      ? "bg-primary/5 border-primary/20 text-foreground"
                      : "bg-background/40 border-border/30 text-muted-foreground blur-[2px]"
                  }`}
                >
                  {idx === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm leading-snug">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
