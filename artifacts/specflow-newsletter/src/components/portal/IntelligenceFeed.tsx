import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle,
  Copy,
  Cpu,
  Lock,
  Map,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FounderChat from "@/components/FounderChat";
import { roadmapSteps } from "@/lib/roadmap";
import { getFridayDropProgress, getFridayDropTeaser } from "@/lib/daily";
import type { StartupContext } from "@/lib/startup-context";

interface DailyEdge {
  title: string;
  category: string;
  value: string;
  content: string;
  actionLabel: string;
}

interface IntelligenceFeedProps {
  tier: string;
  isPro: boolean;
  telemetryLogs: string[];
  dailyEdge: DailyEdge;
  personalizedBrief: string | null;
  roadmapSteps?: typeof roadmapSteps;
  completedSteps: string[];
  startupCtx: StartupContext | null;
  chatUsageThisMonth: number;
  onCopyHack: () => void;
  onToggleStep: (title: string) => void;
  onUpgradeClick: () => void;
  onShowContextModal: () => void;
  onChatUsageUpdate: (next: number) => void;
}

export default function IntelligenceFeed({
  tier,
  isPro,
  telemetryLogs,
  dailyEdge,
  personalizedBrief,
  completedSteps,
  startupCtx,
  chatUsageThisMonth,
  onCopyHack,
  onToggleStep,
  onUpgradeClick,
  onShowContextModal,
  onChatUsageUpdate,
}: IntelligenceFeedProps) {
  return (
    <div className="lg:col-span-4 space-y-10">
      {/* The Intelligence Feed (formerly Daily Edge) */}
      <div className="sticky top-28 space-y-8">
        {/* Redesigned Foundry Terminal Widget - Premium Industrial Cream */}
        <div className="p-8 rounded-[2.5rem] bg-card/40 border border-primary/20 relative overflow-hidden group shadow-2xl shadow-primary/[0.03] backdrop-blur-xl hover:border-primary/40 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl animate-pulse" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/20" />
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                </div>
                <Activity className="w-3.5 h-3.5 text-primary ml-2 animate-telemetry" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/70">
                  FOUNDRY_TELEMETRY
                </span>
              </div>
              <Badge className="bg-primary/5 text-primary text-[8px] border-primary/20 px-3">
                ACTIVE_SYNC
              </Badge>
            </div>

            <div className="space-y-4 font-mono text-[10px] text-muted-foreground leading-relaxed min-h-[120px]">
              {telemetryLogs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3"
                >
                  <span className="text-primary/30">
                    [
                    {new Date().toLocaleTimeString([], { hour12: false })}
                    ]
                  </span>
                  <span>{log}</span>
                </motion.div>
              ))}
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-3 bg-primary/50"
              />
            </div>
          </div>
          {/* Digital scanline effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.05] to-transparent h-10 w-full animate-scanline pointer-events-none" />
        </div>

        <div className="p-8 rounded-[2.5rem] bg-card border border-primary/20 relative overflow-hidden group shadow-2xl shadow-primary/[0.05]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400/20" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/20" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/20" />
                </div>
                <Terminal className="w-3.5 h-3.5 text-primary ml-2" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                  Signals_Feed
                </span>
              </div>
              <Badge className="bg-primary/10 text-primary text-[8px] tracking-tight border-primary/20">
                LIVE_24H
              </Badge>
            </div>

            <div className="space-y-6 relative">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent h-2 w-full animate-scanline pointer-events-none" />

              <div>
                <h3 className="font-serif text-2xl mb-2 group-hover:text-primary transition-colors">
                  {dailyEdge.title}
                </h3>
                <p className="text-[9px] uppercase font-bold tracking-widest text-primary/60 mb-6 flex items-center gap-2">
                  {dailyEdge.category}{" "}
                  <span className="w-1 h-1 rounded-full bg-primary/30" />{" "}
                  {dailyEdge.value}
                </p>

                {/* AI Personalized Application */}
                {personalizedBrief && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-5 rounded-2xl bg-primary/10 border border-primary/20 relative overflow-hidden group/ai"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/ai:rotate-12 transition-transform">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                        Founder_Alignment
                      </p>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed italic text-foreground">
                      "{personalizedBrief}"
                    </p>
                  </motion.div>
                )}

                <div className="p-5 rounded-2xl bg-background/60 border border-primary/20 font-mono text-xs leading-relaxed text-foreground/80 mb-6 relative group overflow-hidden">
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="absolute left-5 top-5 text-primary"
                  >
                    _
                  </motion.span>
                  <div className="pl-4">{dailyEdge.content}</div>
                </div>
                <button
                  onClick={onCopyHack}
                  className="group/btn flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] hover:translate-x-1 transition-all"
                >
                  {dailyEdge.actionLabel}
                  <div className="relative overflow-hidden w-3 h-3">
                    <Copy className="w-3 h-3 transition-transform group-hover/btn:-translate-y-full" />
                    <Copy className="w-3 h-3 absolute top-full transition-transform group-hover/btn:-translate-y-full" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Momentum & Goal Rail */}
        <div className="p-8 rounded-[2.5rem] bg-primary/[0.03] border border-border/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Map className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Roadmap Status
            </span>
          </div>
          <div className="space-y-8 relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border/40" />
            {roadmapSteps.map((step, idx) => {
              const isLockedForUser = (step as any).proOnly && !isPro;
              return (
                <div
                  key={idx}
                  className={`relative pl-10 group cursor-pointer`}
                  onClick={() =>
                    !isLockedForUser && onToggleStep(step.title)
                  }
                >
                  <div
                    className={`absolute left-0 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                      completedSteps.includes(step.title)
                        ? "bg-primary border-primary"
                        : isLockedForUser
                          ? "bg-background border-border/30"
                          : "bg-background border-border"
                    }`}
                  >
                    {completedSteps.includes(step.title) ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : isLockedForUser ? (
                      <Lock className="w-3 h-3 text-muted-foreground/40" />
                    ) : (
                      <span className="text-[10px] font-bold">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  <div
                    className={`transition-transform group-hover:translate-x-1 ${isLockedForUser ? "select-none" : ""}`}
                  >
                    <h4
                      className={`text-xs font-bold uppercase tracking-widest mb-1 ${completedSteps.includes(step.title) ? "text-primary" : isLockedForUser ? "text-muted-foreground/40" : "text-foreground"}`}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={`text-[10px] mb-2 ${isLockedForUser ? "text-muted-foreground/30" : "text-muted-foreground"}`}
                    >
                      {step.day}
                    </p>
                    {isLockedForUser ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpgradeClick();
                        }}
                        className="text-[8px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                      >
                        Unlock with Pro →
                      </button>
                    ) : (
                      completedSteps.includes(step.title) && (
                        <Badge className="bg-primary/10 text-primary text-[8px] py-0 border-none">
                          COMPLETE
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isPro && (
            <button
              onClick={onUpgradeClick}
              className="mt-10 w-full py-4 rounded-2xl bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all"
            >
              Unlock Days 11–21 →
            </button>
          )}
        </div>

        {/* Friday Drop Teaser — Free + Pro only */}
        {(tier === "free" || tier === "pro") &&
          (() => {
            const dropPct = getFridayDropProgress();
            const teaser = getFridayDropTeaser();
            const isFriday = new Date().getDay() === 5;
            return (
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-card to-card/40 border border-primary/30 relative overflow-hidden group shadow-2xl shadow-primary/[0.08]">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Friday Drop
                      </span>
                    </div>
                    {isFriday ? (
                      <Badge className="bg-primary text-white text-[8px] border-none">
                        LIVE NOW
                      </Badge>
                    ) : (
                      <Badge className="bg-primary/20 text-primary text-[8px] animate-pulse border-primary/30">
                        IN PROGRESS
                      </Badge>
                    )}
                  </div>

                  {/* Tease the niche only — full title on Friday */}
                  <p className="text-[9px] uppercase font-bold tracking-widest text-primary/60 mb-2">
                    {teaser.niche} // This Week's Signal
                  </p>
                  <h3
                    className={`font-serif text-2xl mb-2 group-hover:text-primary transition-colors ${!isFriday ? "blur-[3px] select-none" : ""}`}
                  >
                    {isFriday
                      ? "This Week's Blueprint — Full Access"
                      : "Classified Until Friday 09:00 AM"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic mb-6">
                    "{teaser.hook}"
                  </p>

                  <div className="flex items-center gap-3 opacity-60 mb-6">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-medium">
                      Technical Audit Status: PASS — Ready for Release
                    </span>
                  </div>

                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dropPct}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-primary h-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                    />
                  </div>
                  <p className="text-[8px] text-right font-bold text-primary/60 uppercase tracking-widest">
                    {dropPct}% Architected
                  </p>
                </div>
              </div>
            );
          })()}

        {/* AI Advisor — Pro/Max only */}
        {isPro && (
          <div id="ai-advisor-chat">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              AI Advisor
            </p>
            <FounderChat
              usedThisMonth={chatUsageThisMonth}
              onUsageUpdate={onChatUsageUpdate}
            />
          </div>
        )}

        {/* Context Engine Widget */}
        <div className="p-8 rounded-[2.5rem] bg-card border border-border/30 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
              Context Engine
            </span>
            {startupCtx && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse ml-auto" />
            )}
          </div>
          {startupCtx ? (
            <>
              <p className="text-sm font-serif mb-1 line-clamp-2">
                {startupCtx.whatBuilding}
              </p>
              <p className="text-[10px] text-muted-foreground mb-4">
                {startupCtx.sector} · {startupCtx.stage}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mb-4 italic">
                "{startupCtx.biggestChallenge}"
              </p>
              <button
                onClick={onShowContextModal}
                className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline"
              >
                Update Context →
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                Set your startup context. Every signal, metric, and
                blueprint becomes specific to your build.
              </p>
              <button
                onClick={onShowContextModal}
                className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
              >
                Activate Context →
              </button>
            </>
          )}
        </div>

        {/* FREE: Weekly Insight + Upgrade CTA */}
        {tier === "free" && (
          <>
            <div className="p-8 rounded-2xl bg-card/80 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
                  Weekly Insight
                </span>
              </div>
              <h3 className="font-serif text-xl mb-2">{dailyEdge.title}</h3>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                {dailyEdge.content}
              </p>
              <button
                onClick={onCopyHack}
                className="w-full py-3 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
              >
                Copy Insight →
              </button>
            </div>

            <div className="p-8 rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Zap className="w-5 h-5 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Ready to Move Faster?
                </span>
              </div>
              <h3 className="font-serif text-2xl mb-3 italic text-primary">
                Stop reading. Start building.
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Pro gives you the playbook, market intel, and competitive
                analysis. Max adds calls with founders who've raised and
                exited.
              </p>
              <button
                onClick={onUpgradeClick}
                className="w-full py-3 bg-primary/10 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
              >
                See What You're Missing →
              </button>
            </div>
          </>
        )}

        {/* PRO: Today's Briefing */}
        {tier === "pro" && (
          <div className="p-8 rounded-2xl bg-card/80 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
                Today's Briefing
              </span>
            </div>
            <h3 className="font-serif text-xl mb-2">{dailyEdge.title}</h3>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed line-clamp-4 mb-4">
              {dailyEdge.content}
            </p>
            <button
              onClick={onCopyHack}
              className="w-full py-3 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
            >
              Copy Tactic →
            </button>
          </div>
        )}

        {/* MAX: Your 100-Day Arc + AI Advisor CTA */}
        {(tier === "max" || tier === "incubator") && (
          <>
            <div className="p-8 border border-border/20 rounded-none">
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-6">
                Your 100-Day Arc
              </p>
              <div className="space-y-3">
                {roadmapSteps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => onToggleStep(step.title)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${completedSteps.includes(step.title) ? "bg-primary border-primary" : "border-border/40 group-hover:border-primary/40"}`}
                    >
                      {completedSteps.includes(step.title) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-xs ${completedSteps.includes(step.title) ? "text-primary line-through" : "text-foreground"}`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">
                        {step.day}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="ai-advisor"
              className="p-8 border border-primary/20 rounded-none bg-primary/5"
            >
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-3">
                Your AI Advisor
              </p>
              <p className="font-serif text-lg mb-4">
                You have {20 - chatUsageThisMonth} sessions this month.
                Use them.
              </p>
              <a
                href="#ai-advisor-chat"
                className="block w-full py-3 border border-primary/30 text-center text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
              >
                Open Advisor →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
