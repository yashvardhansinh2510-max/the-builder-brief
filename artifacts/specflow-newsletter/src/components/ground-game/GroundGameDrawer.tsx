import { motion } from "framer-motion";
import { X, Bookmark, Download, Lock } from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { GroundGameIdea } from "@/lib/ground-game-data";

const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Australia: "🇦🇺",
  UAE: "🇦🇪",
  "Southeast Asia": "🌏",
  "Rest of World": "🌍",
};

interface GroundGameDrawerProps {
  idea: GroundGameIdea;
  onClose: () => void;
  userTier: string;
  isPremium: boolean;
  isGated: boolean;
}

export function GroundGameDrawer({ idea, onClose, userTier, isPremium, isGated }: GroundGameDrawerProps) {
  const sectionsBlurred = userTier === "free";

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-foreground/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="relative w-full max-w-[480px] h-full bg-background shadow-2xl border-l border-border flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary flex-shrink-0">
              {idea.category}
            </span>
            <span className="text-xs text-muted-foreground font-medium truncate">
              {COUNTRY_FLAGS[idea.country]} {idea.country}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 no-scrollbar">

          {/* Section 1: Title */}
          <h2 className="font-serif text-2xl font-bold text-foreground leading-tight">
            {idea.title}
          </h2>

          {/* Section 2: The Gap */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
              The Gap
            </p>
            <p className="text-[15px] text-foreground leading-relaxed">
              {idea.theGap}
            </p>
          </div>

          {isGated ? (
            /* Gated idea — show upgrade CTA for everything below */
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
              <Lock className="w-5 h-5 text-primary mx-auto mb-3" />
              <p className="font-bold text-primary mb-1">
                {idea.tier === "max" ? "Inner Circle" : "Pro"} access required
              </p>
              <p className="text-sm text-primary/70 mb-5 leading-relaxed">
                Full market intelligence, AI angle, and go-to-market strategy.
              </p>
              <Link href="/pricing">
                <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold w-full hover:bg-primary/90 transition-colors">
                  Unlock full intelligence
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Section 3: Why 2026 */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
                  Why 2026
                </p>
                <p className="text-[15px] text-foreground leading-relaxed">
                  {idea.whyNow}
                </p>
              </div>

              {/* Section 4: Market Size chart */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                    Market Size
                  </p>
                  <span className="text-xs font-bold text-foreground font-mono">
                    {idea.marketSize.split(".")[0]}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={idea.trendChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${idea.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E9591C" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#E9591C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        interval={2}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                        itemStyle={{ color: "var(--foreground)" }}
                        cursor={{ stroke: "var(--border)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#E9591C"
                        fill={`url(#grad-${idea.id})`}
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sections 5–7: blurred for free users */}
              <div className="relative">
                <div className={sectionsBlurred ? "select-none" : ""}>
                  {/* Section 5: AI Integration Angle */}
                  <div
                    className={`bg-primary/5 border border-primary/15 rounded-lg p-5 mb-6 ${
                      sectionsBlurred ? "blur-[4px] pointer-events-none" : ""
                    }`}
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary mb-2">
                      The 10x Lever
                    </p>
                    <p className="text-[15px] text-foreground leading-relaxed">
                      {idea.aiAngle}
                    </p>
                  </div>

                  {/* Section 6: GTM in 3 Steps */}
                  <div className={`mb-6 ${sectionsBlurred ? "blur-[4px] pointer-events-none" : ""}`}>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                      GTM in 3 Steps
                    </p>
                    <ol className="space-y-3">
                      {idea.gtmSteps.slice(0, 3).map((step, i) => (
                        <li key={i} className="flex gap-3 text-[14px] text-foreground leading-relaxed">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Section 7: Revenue Model */}
                  <div className={sectionsBlurred ? "blur-[4px] pointer-events-none" : ""}>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
                      Revenue Model
                    </p>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="text-[14px] text-foreground leading-relaxed">
                        {idea.revenueModel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upgrade overlay for free users */}
                {sectionsBlurred && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="bg-card/95 border border-primary/20 rounded-xl p-6 text-center shadow-xl max-w-[280px] mx-auto">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-4 h-4 text-primary" />
                      </div>
                      <p className="font-bold text-foreground text-sm mb-1">
                        Full intelligence is Pro
                      </p>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        AI lever, go-to-market playbook, and revenue model.
                      </p>
                      <Link href="/pricing">
                        <button className="bg-primary text-white px-5 py-2 rounded-full text-xs font-bold w-full hover:bg-primary/90 transition-colors">
                          Unlock full intelligence — Go Pro
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer: Pro/Max only */}
        {!isGated && isPremium && (
          <div className="px-6 py-4 border-t border-border flex-shrink-0">
            <div className="flex gap-3">
              <button className="flex-1 bg-muted hover:bg-muted/80 text-foreground rounded-lg py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <Bookmark className="w-4 h-4" /> Save to Vault
              </button>
              <div className="relative group/export flex-1">
                <button
                  disabled={userTier !== "max" && userTier !== "incubator"}
                  className="w-full bg-muted text-muted-foreground/60 rounded-lg py-2.5 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded text-[10px] text-muted-foreground whitespace-nowrap opacity-0 group-hover/export:opacity-100 transition-opacity pointer-events-none z-10">
                  Coming soon
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
