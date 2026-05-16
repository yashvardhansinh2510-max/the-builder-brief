import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Share2, Twitter, MessageCircle, Trophy, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  shareUrl: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  referralCount: number;
}

const REWARD_TIERS = [
  { count: 1, reward: "1 week free Pro", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { count: 5, reward: "1 month free Pro", color: "text-violet-600 bg-violet-50 border-violet-200" },
  { count: 10, reward: "1 month free Max", color: "text-primary bg-primary/5 border-primary/20" },
];

export default function ReferralTab() {
  const { session } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ["referrals", "me"],
    queryFn: () =>
      fetch("/api/referrals/me", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      }).then((r) => r.json()),
    enabled: !!session?.access_token,
    staleTime: 60 * 1000,
  });

  const { data: leaderboardData } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ["referrals", "leaderboard"],
    queryFn: () => fetch("/api/referrals/leaderboard").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const referralCount = stats?.referralCount ?? 0;
  const shareUrl = stats?.shareUrl ?? "";

  const nextTier = REWARD_TIERS.find((t) => t.count > referralCount);
  const currentTier = [...REWARD_TIERS].reverse().find((t) => t.count <= referralCount);
  const progressPct = nextTier
    ? Math.min(100, (referralCount / nextTier.count) * 100)
    : 100;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(
      `I've been building smarter with The Build Brief — AI-validated startup ideas every Friday. Join me: ${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out The Build Brief — AI-curated startup ideas: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero card */}
      <div className="p-8 rounded-2xl bg-card border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-3">
            Refer & Earn
          </p>
          <h2 className="font-serif text-3xl mb-2">
            Share the edge. Earn access.
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg">
            Every founder you bring in unlocks rewards for you. Copy your link, share it, watch the tiers unlock.
          </p>

          {/* Referral link */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border font-mono text-sm text-muted-foreground overflow-hidden">
              <span className="truncate">{shareUrl || "Loading..."}</span>
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={shareTwitter}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Twitter className="w-4 h-4" /> Share on X
            </button>
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Stats + Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
            Your Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold font-serif text-foreground">{referralCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Founders referred</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-serif text-primary">
                {currentTier ? "Unlocked" : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Current reward</p>
            </div>
          </div>
          {currentTier && (
            <div className={`px-3 py-2 rounded-lg border text-xs font-semibold ${currentTier.color}`}>
              {currentTier.reward} earned
            </div>
          )}
        </div>

        {/* Progress toward next tier */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Next Reward
          </h3>
          {nextTier ? (
            <>
              <p className="text-sm text-foreground mb-1 font-medium">{nextTier.reward}</p>
              <p className="text-xs text-muted-foreground mb-3">
                {referralCount} / {nextTier.count} referrals
              </p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {nextTier.count - referralCount} more to unlock
              </p>
            </>
          ) : (
            <p className="text-sm text-primary font-semibold">All tiers unlocked!</p>
          )}
        </div>
      </div>

      {/* Reward Tiers */}
      <div>
        <h3 className="font-serif text-xl mb-4">Reward Tiers</h3>
        <div className="space-y-3">
          {REWARD_TIERS.map((tier) => {
            const unlocked = referralCount >= tier.count;
            return (
              <div
                key={tier.count}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  unlocked
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {tier.count}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{tier.reward}</p>
                    <p className="text-xs text-muted-foreground">{tier.count} referral{tier.count > 1 ? "s" : ""}</p>
                  </div>
                </div>
                {unlocked ? (
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Earned</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Wall of Growth — Leaderboard */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-serif text-xl">Wall of Growth</h3>
          <span className="text-xs text-muted-foreground">Top 10 referrers</span>
        </div>
        <div className="space-y-2">
          {(leaderboardData?.leaderboard ?? []).map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border"
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  entry.rank === 1
                    ? "bg-amber-500 text-white"
                    : entry.rank === 2
                    ? "bg-zinc-400 text-white"
                    : entry.rank === 3
                    ? "bg-amber-700 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {entry.rank}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{entry.name}</span>
              <span className="text-sm font-bold text-primary tabular-nums">
                {entry.referralCount} {entry.referralCount === 1 ? "referral" : "referrals"}
              </span>
            </div>
          ))}
          {(leaderboardData?.leaderboard ?? []).length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No referrals yet — be the first on the board.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
