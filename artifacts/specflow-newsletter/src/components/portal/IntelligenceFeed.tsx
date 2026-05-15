import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Flame, RefreshCw, AlertTriangle } from "lucide-react";
import FounderChat from "@/components/FounderChat";
import DailyBriefUI from "@/components/DailyBriefUI";
import PersonalizationUI from "@/components/PersonalizationUI";
import type { StartupContext } from "@/lib/startup-context";

type Platform = "reddit" | "youtube" | "hn" | "ph" | "linkedin";
type FilterKey = "all" | Platform;

interface Signal {
  id: string;
  platform: Platform;
  headline: string;
  url: string;
  publishedAt: string;
  topic?: string;
  relevanceScore?: number;
}

interface IntelligenceFeedProps {
  tier: string;
  isPro: boolean;
  startupCtx: StartupContext | null;
  chatUsageThisMonth: number;
  onChatUsageUpdate: (next: number) => void;
  onShowContextModal: () => void;
  onUpgradeClick: () => void;
}

const MOCK_SIGNALS: Signal[] = [
  { id: "s1", platform: "reddit", headline: "Founders ditching SaaS tiers for usage-based pricing — thread explodes with 400 comments", url: "https://reddit.com/r/startups", publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(), topic: "pricing", relevanceScore: 0.88 },
  { id: "s2", platform: "hn", headline: "Ask HN: Has anyone successfully built a bootstrapped B2B product in 2025?", url: "https://news.ycombinator.com", publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(), topic: "bootstrapping", relevanceScore: 0.75 },
  { id: "s3", platform: "youtube", headline: "How I hit $10K MRR in 90 days with cold email — full breakdown", url: "https://youtube.com", publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(), topic: "cold-email", relevanceScore: 0.91 },
  { id: "s4", platform: "ph", headline: "LaunchKit — Ship your SaaS in 48 hours (featured on Product Hunt)", url: "https://producthunt.com", publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(), topic: "tools", relevanceScore: 0.62 },
  { id: "s5", platform: "linkedin", headline: "Why I turned down a $2M seed round and stayed default-alive", url: "https://linkedin.com", publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(), topic: "fundraising", relevanceScore: 0.79 },
  { id: "s6", platform: "reddit", headline: "What's the best tech stack for a solo founder in 2025? r/SaaS weekly thread", url: "https://reddit.com/r/SaaS", publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(), topic: "tech-stack", relevanceScore: 0.54 },
  { id: "s7", platform: "hn", headline: "Show HN: I automated my entire customer onboarding with n8n", url: "https://news.ycombinator.com", publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(), topic: "automation", relevanceScore: 0.68 },
  { id: "s8", platform: "reddit", headline: "Cold email open rates are down 40% — what's actually working now", url: "https://reddit.com/r/Entrepreneur", publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(), topic: "cold-email", relevanceScore: 0.87 },
  { id: "s9", platform: "youtube", headline: "The 'Wedge Strategy' — how to beat big competitors by going small first", url: "https://youtube.com", publishedAt: new Date(Date.now() - 14 * 3600000).toISOString(), topic: "gtm", relevanceScore: 0.73 },
  { id: "s10", platform: "ph", headline: "Notion-killer or niche tool? Founders debate the category-creation playbook", url: "https://producthunt.com", publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(), topic: "positioning", relevanceScore: 0.58 },
];

const PLATFORM_META: Record<Platform, { label: string; color: string; bg: string }> = {
  reddit:  { label: "Reddit",        color: "text-orange-600",  bg: "bg-orange-500/10 border-orange-500/20" },
  youtube: { label: "YouTube",       color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20" },
  hn:      { label: "HN",            color: "text-amber-600",   bg: "bg-amber-500/10 border-amber-500/20" },
  ph:      { label: "Product Hunt",  color: "text-orange-500",  bg: "bg-orange-400/10 border-orange-400/20" },
  linkedin:{ label: "LinkedIn",      color: "text-blue-500",    bg: "bg-blue-500/10 border-blue-500/20" },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "reddit",   label: "Reddit" },
  { key: "youtube",  label: "YouTube" },
  { key: "hn",       label: "HN" },
  { key: "ph",       label: "Product Hunt" },
  { key: "linkedin", label: "LinkedIn" },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function detectTrends(signals: Signal[]): string[] {
  const cutoff = Date.now() - 24 * 3600000;
  const recent = signals.filter((s) => new Date(s.publishedAt).getTime() > cutoff);
  const counts: Record<string, number> = {};
  for (const s of recent) {
    if (s.topic) counts[s.topic] = (counts[s.topic] ?? 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, n]) => n >= 3)
    .map(([topic]) => topic)
    .slice(0, 2);
}

export default function IntelligenceFeed({
  tier,
  isPro,
  startupCtx,
  chatUsageThisMonth,
  onChatUsageUpdate,
  onShowContextModal: _onShowContextModal,
  onUpgradeClick,
}: IntelligenceFeedProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch("/api/engine/signals");
      if (!res.ok) throw new Error("not ok");
      const data = await res.json();
      setSignals(data.signals ?? MOCK_SIGNALS);
    } catch {
      setSignals(MOCK_SIGNALS);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const id = setInterval(fetchSignals, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchSignals]);

  const filtered = filter === "all" ? signals : signals.filter((s) => s.platform === filter);
  const trendTopics = detectTrends(signals);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl tracking-tight">Market Intelligence</h2>
          {lastUpdated && (
            <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 uppercase tracking-widest">
              Updated {relativeTime(lastUpdated.toISOString())}
            </p>
          )}
        </div>
        <button
          onClick={fetchSignals}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all w-fit"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Source filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Trend spike alerts */}
      <AnimatePresence>
        {trendTopics.map((topic) => (
          <motion.div
            key={topic}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-0.5">
                TREND DETECTED
              </p>
              <p className="text-sm text-foreground capitalize">
                3+ signals on <span className="font-bold">{topic.replace("-", " ")}</span> in the last 24h. This category is heating up.
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-card/40 animate-pulse border border-border/20" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="py-20 text-center rounded-3xl border border-border/20 bg-card/20">
          <p className="font-serif text-2xl mb-3 text-muted-foreground">No signals yet.</p>
          <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto leading-relaxed">
            The AI is scanning Reddit, HN, YouTube, and Product Hunt. Check back in a few hours.
          </p>
        </div>
      )}

      {/* Feed items */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((signal, i) => {
            const meta = PLATFORM_META[signal.platform];
            const isRelevant = (signal.relevanceScore ?? 0) >= 0.7 && startupCtx !== null;
            return (
              <motion.a
                key={signal.id}
                href={signal.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-card/40 border border-border/20 hover:border-primary/20 hover:bg-card/60 transition-all group block"
              >
                <div className={`shrink-0 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {signal.headline}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {relativeTime(signal.publishedAt)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-mono truncate max-w-[180px]">
                      {new URL(signal.url).hostname}
                    </span>
                    {isRelevant && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        <Flame className="w-2.5 h-2.5" /> Relevant
                      </span>
                    )}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      )}

      {/* Pro-gated: DailyBriefUI + PersonalizationUI */}
      {isPro && (
        <div className="pt-4 border-t border-border/20 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">Today's Brief</p>
            <DailyBriefUI />
          </div>
          <div className="lg:col-span-4">
            <PersonalizationUI />
          </div>
        </div>
      )}

      {/* Free tier upgrade nudge */}
      {tier === "free" && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <p className="font-serif text-2xl mb-3 italic text-primary">Stop reading. Start building.</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            Pro gives you the full signal feed, personalized briefings, and competitive analysis.
          </p>
          <button
            onClick={onUpgradeClick}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            See What You're Missing →
          </button>
        </div>
      )}

      {/* AI Advisor chat — Pro/Max only */}
      {isPro && (
        <div id="ai-advisor-chat">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">AI Advisor</p>
          <FounderChat usedThisMonth={chatUsageThisMonth} onUsageUpdate={onChatUsageUpdate} />
        </div>
      )}
    </div>
  );
}
