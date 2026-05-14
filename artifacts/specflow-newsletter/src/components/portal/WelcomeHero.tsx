import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import type { Reward } from "@/lib/rewards";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.06,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

interface WelcomeHeroProps {
  tier: string;
  firstName: string;
  streak: number;
  chatUsageThisMonth: number;
  eligibleReward: Reward | null;
  nextReward: Reward | null;
  onClaimReward: (reward: Reward) => void;
}

export default function WelcomeHero({
  tier,
  firstName,
  streak,
  chatUsageThisMonth,
  eligibleReward,
  nextReward,
  onClaimReward,
}: WelcomeHeroProps) {
  return (
    <>
      {/* FREE TIER HERO */}
      {tier === "free" && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative p-10 rounded-[3rem] bg-card/30 border border-primary/5 overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-primary/60">
                System Operational • {new Date().toLocaleDateString()}
              </p>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1]">
              Good to have
              <br />
              you back,{" "}
              <span className="italic text-primary/90">{firstName}.</span>
            </h1>
            {/* Streak HERO */}
            <div className="flex items-center gap-6 mt-8 mb-2">
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Flame className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-3xl font-black text-primary leading-none">
                    {streak}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 mt-0.5">
                    Day Streak
                  </p>
                </div>
              </div>
              {nextReward && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">
                    {nextReward.day - streak} days
                  </span>{" "}
                  until {nextReward.title}
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                The next drop lands Friday. Your blueprints are waiting.
                The only question is — what are you building this week?
              </p>
              {eligibleReward && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-primary/95 backdrop-blur-xl p-8 rounded-[2.5rem] text-primary-foreground shadow-[0_0_50px_rgba(249,115,22,0.3)] relative overflow-hidden group/reward min-w-[300px] border border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  <Sparkles className="absolute top-6 right-6 w-6 h-6 text-white/40 group-hover/reward:rotate-90 transition-transform duration-500" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 opacity-70">
                      MILESTONE UNLOCKED: DAY {eligibleReward.day}
                    </p>
                    <h4 className="font-serif text-2xl mb-6 leading-tight">
                      {eligibleReward.title}
                    </h4>
                    <button
                      onClick={() => onClaimReward(eligibleReward)}
                      className="w-full bg-primary-foreground text-primary text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-primary-foreground/90 transition-all hover:translate-y-[-2px] active:translate-y-[0px] shadow-lg shadow-black/5"
                    >
                      {eligibleReward.actionLabel}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* PRO TIER HERO */}
      {tier === "pro" && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative p-10 rounded-2xl bg-card/80 border border-primary/10 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent h-10 w-full animate-scanline pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/70 font-mono">
                Operator Mode • {new Date().toLocaleDateString()}
              </p>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1]">
              Back at it,
              <br />
              <span className="italic text-primary">{firstName}.</span>
            </h1>
            <p className="text-muted-foreground text-base mt-4 max-w-xl leading-relaxed">
              Daily briefing is live. Vault is open. You've got signals to
              run through — let's go.
            </p>
            <div className="flex gap-6 p-6 mt-6 rounded-2xl bg-background/40 border border-primary/20 font-mono w-fit">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Streak
                </p>
                <p className="text-2xl font-bold text-primary">
                  {streak}d
                </p>
              </div>
              <div className="w-px bg-border/40" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Vault
                </p>
                <p className="text-2xl font-bold">OPEN</p>
              </div>
              <div className="w-px bg-border/40" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Briefings
                </p>
                <p className="text-2xl font-bold">DAILY</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* MAX / INCUBATOR TIER HERO */}
      {(tier === "max" || tier === "incubator") && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-16 px-2"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 mb-4">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-serif text-6xl md:text-8xl leading-[1.0] mb-8">
            Good morning,
            <br />
            <span className="italic text-primary">{firstName}.</span>
          </h1>
          <div className="flex gap-8 pt-8 border-t border-border/20">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-1">
                AI Advisor
              </p>
              <p className="font-serif text-lg">
                Active — {20 - chatUsageThisMonth} sessions remaining
              </p>
            </div>
            <div className="w-px bg-border/20" />
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-1">
                Next Call
              </p>
              <p className="font-serif text-lg italic">
                Book via Inner Circle
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
