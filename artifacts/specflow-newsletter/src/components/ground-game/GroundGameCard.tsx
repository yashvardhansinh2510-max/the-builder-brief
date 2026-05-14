import { Lock } from "lucide-react";
import { GroundGameIdea } from "@/lib/ground-game-data";

const DIFFICULTY_COLOR: Record<GroundGameIdea["difficulty"], string> = {
  "Founder-Friendly": "bg-emerald-500",
  "Requires Local Network": "bg-amber-500",
  "Capital Intensive": "bg-red-500",
};

const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Australia: "🇦🇺",
  UAE: "🇦🇪",
  "Southeast Asia": "🌏",
  "Rest of World": "🌍",
};

function shortMarketSize(raw: string): string {
  const match = raw.match(/[₹$£€][\d,.]+[KMBCrTL]+/);
  if (match) return match[0];
  const words = raw.split(/[.·]/)[0].trim();
  return words.length > 18 ? words.slice(0, 18) + "…" : words;
}

interface GroundGameCardProps {
  idea: GroundGameIdea;
  isGated: boolean;
  onClick: () => void;
}

export function GroundGameCard({ idea, isGated, onClick }: GroundGameCardProps) {
  const sparkMax = Math.max(...idea.trendSparkline, 1);
  const points = idea.trendSparkline
    .map((v, i) => `${i * (56 / 7)},${22 - (v / sparkMax) * 18}`)
    .join(" ");

  return (
    <div
      onClick={onClick}
      className="group relative bg-card border border-border border-l-[3px] border-l-transparent hover:border-l-primary rounded-lg p-5 cursor-pointer transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 overflow-hidden flex flex-col h-[260px]"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary w-fit">
            {idea.category}
          </span>
          <span className="text-[11px] text-muted-foreground/70 font-medium">
            {COUNTRY_FLAGS[idea.country]} {idea.mode}
          </span>
        </div>
        {isGated && (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Lock className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Title + Hook — always visible */}
      <h3 className="font-serif font-bold text-[17px] leading-snug mb-1.5 text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {idea.title}
      </h3>
      <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed flex-1">
        {idea.hook}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
        <div className="flex items-center gap-2">
          {/* Difficulty dot */}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${DIFFICULTY_COLOR[idea.difficulty]}`}
            title={idea.difficulty}
          />
          {/* Market size */}
          <span className="text-[10px] font-mono text-muted-foreground/80 font-semibold">
            {shortMarketSize(idea.marketSize)}
          </span>
        </div>
        {/* Sparkline */}
        <svg viewBox="0 0 56 22" className="w-14 h-[22px] overflow-visible flex-shrink-0">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            points={points}
          />
        </svg>
      </div>

      {/* Locked bottom blur */}
      {isGated && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-2/5 backdrop-blur-[3px] bg-background/30 z-10 pointer-events-none" />
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <div className="bg-card/95 border border-border rounded-md px-3 py-1.5 text-center shadow-sm">
              <p className="text-[11px] font-bold text-foreground">
                {idea.tier === "max" ? "Inner Circle" : "Pro"} only
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
