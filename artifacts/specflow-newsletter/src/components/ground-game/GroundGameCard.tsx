import { GroundGameIdea } from "@/lib/ground-game-data";

const EFFORT_STYLE: Record<GroundGameIdea["difficulty"], { label: string; cls: string }> = {
  "Founder-Friendly":       { label: "Low",    cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  "Requires Local Network": { label: "Medium", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  "Capital Intensive":      { label: "High",   cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
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

interface GroundGameCardProps {
  idea: GroundGameIdea;
  isGated: boolean;
  onClick: () => void;
}

export function GroundGameCard({ idea, isGated, onClick }: GroundGameCardProps) {
  const effort = EFFORT_STYLE[idea.difficulty];

  return (
    <div
      className="relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col gap-3 cursor-pointer"
      onClick={onClick}
    >
      {/* Top row: effort badge + country/mode */}
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${effort.cls}`}>
          {effort.label} effort
        </span>
        <span className="text-xs text-muted-foreground">
          {COUNTRY_FLAGS[idea.country]} {idea.mode}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif font-bold text-lg leading-snug text-foreground">
        {idea.title}
      </h3>

      {/* Hook — expected result */}
      <p className="text-sm text-foreground font-medium">{idea.hook}</p>

      {/* Why Now — supporting context */}
      <p className="text-xs text-muted-foreground italic line-clamp-1">{idea.whyNow}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {idea.category}
        </span>
        <button
          className="text-xs font-semibold text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Expand →
        </button>
      </div>

      {/* Gated overlay */}
      {isGated && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-2/5 backdrop-blur-[3px] bg-background/30 rounded-b-2xl z-10 pointer-events-none" />
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <div className="bg-card/95 border border-border rounded-md px-3 py-1.5 shadow-sm text-[11px] font-bold">
              {idea.tier === "max" ? "Inner Circle" : "Pro"} only
            </div>
          </div>
        </>
      )}
    </div>
  );
}
