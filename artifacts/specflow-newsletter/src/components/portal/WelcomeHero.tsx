import { motion } from "framer-motion";
import { Flame, Lock } from "lucide-react";
import type { Reward } from "@/lib/rewards";

interface WelcomeHeroProps {
  tier: string;
  firstName: string;
  streak: number;
  chatUsageThisMonth: number;
  eligibleReward: Reward | null;
  nextReward: Reward | null;
  onClaimReward: (reward: Reward) => void;
}

function getDateLine(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const month = now.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const day = now.getDate();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${weekday}, ${month} ${day} — WEEK ${week}`;
}

function daysUntilFriday(): number {
  const day = new Date().getDay();
  return day <= 5 ? 5 - day : 7 - day + 5;
}

const SUBTITLES: Record<string, string> = {
  free:      "Next drop lands Friday.",
  pro:       "Vault is live. Signals are in.",
  max:       "Your advisor is standing by.",
  incubator: "Your advisor is standing by.",
};

const ACTION_LINKS: Record<string, { label: string; href: string }[]> = {
  free: [
    { label: "Open the Vault →",  href: "/dashboard?tab=vault" },
    { label: "See Blueprints →",  href: "/blueprints" },
  ],
  pro: [
    { label: "Open Briefing →",   href: "/dashboard?tab=intel" },
    { label: "Full Vault →",      href: "/dashboard?tab=vault" },
  ],
  max: [
    { label: "Book AI Session →", href: "#ai-advisor-chat" },
    { label: "Inner Circle →",    href: "/dashboard?tab=alliance" },
  ],
  incubator: [
    { label: "Book AI Session →", href: "#ai-advisor-chat" },
    { label: "Inner Circle →",    href: "/dashboard?tab=alliance" },
  ],
};

export default function WelcomeHero({
  tier,
  firstName,
  streak,
  chatUsageThisMonth,
  eligibleReward,
  nextReward,
  onClaimReward,
}: WelcomeHeroProps) {
  const subtitle = SUBTITLES[tier] ?? SUBTITLES.free;
  const links = ACTION_LINKS[tier] ?? ACTION_LINKS.free;
  const isMax = tier === "max" || tier === "incubator";
  const isPro = tier === "pro" || isMax;
  const vaultStatus = isPro ? "LIVE" : "LOCKED";
  const dropDays = daysUntilFriday();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start"
    >
      {/* LEFT — 60% */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60 mb-5">
          {getDateLine()}
        </p>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-4">
          Good to have you back,{" "}
          <span className="italic text-primary">{firstName}.</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity border-b border-primary/30 hover:border-primary pb-0.5"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* RIGHT — 40% */}
      <div className="w-full lg:w-[40%] shrink-0 relative">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            {/* Streak */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Streak</p>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="font-serif text-3xl text-primary">{streak}</span>
              </div>
            </div>

            {/* Vault */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Vault</p>
              <div className="flex items-center gap-1.5">
                {!isPro && <Lock className="w-3.5 h-3.5 text-zinc-600" />}
                <span
                  className={`font-mono text-lg font-bold ${
                    isPro ? "text-emerald-400" : "text-zinc-600"
                  }`}
                >
                  {vaultStatus}
                </span>
              </div>
            </div>

            {/* Next Drop */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Next Drop</p>
              <p className="font-mono text-lg font-bold text-white">
                {dropDays === 0 ? "TODAY" : `${dropDays}d`}
              </p>
            </div>

            {/* AI Advisor (max only) or Next Reward */}
            {isMax ? (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">AI Advisor</p>
                <p className="font-mono text-lg font-bold text-white">
                  {Math.max(0, 20 - chatUsageThisMonth)}
                  <span className="text-xs text-zinc-500 ml-1">sess</span>
                </p>
              </div>
            ) : nextReward ? (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Next Reward</p>
                <p className="font-mono text-xs text-zinc-400">Day {nextReward.day}</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800" />
            )}
          </div>
        </div>

        {/* Reward overlay */}
        {eligibleReward && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 bg-primary/95 backdrop-blur-xl rounded-2xl p-6 text-primary-foreground shadow-[0_0_50px_rgba(249,115,22,0.3)] border border-white/20 flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70 mb-2">
                MILESTONE UNLOCKED: DAY {eligibleReward.day}
              </p>
              <h4 className="font-serif text-2xl leading-tight">{eligibleReward.title}</h4>
            </div>
            <button
              onClick={() => onClaimReward(eligibleReward)}
              className="w-full bg-primary-foreground text-primary text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-primary-foreground/90 transition-all"
            >
              {eligibleReward.actionLabel}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
