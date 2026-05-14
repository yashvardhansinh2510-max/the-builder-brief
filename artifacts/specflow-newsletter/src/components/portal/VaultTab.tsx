import { ArrowRight, Lock, Sparkles } from "lucide-react";
import type { Issue } from "@/lib/data";

interface VaultTabProps {
  currentPastIssues: Issue[];
  isPro: boolean;
  onIssueOpen: (issue: Issue) => void;
  onUpgradeClick: () => void;
}

export default function VaultTab({
  currentPastIssues,
  isPro,
  onIssueOpen,
  onUpgradeClick,
}: VaultTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {currentPastIssues.map((issue) => (
        <div
          key={issue.number}
          className={`group relative p-8 rounded-[2.5rem] border transition-all overflow-hidden ${
            issue.isBonus
              ? "bg-primary/[0.03] border-primary/40 shadow-[0_0_40px_rgba(249,115,22,0.15)]"
              : "bg-card/40 border-border/20 hover:border-primary/20 backdrop-blur-sm shadow-xl shadow-primary/[0.02]"
          }`}
        >
          {issue.isBonus && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">
                Bonus Unlock
              </span>
            </div>
          )}
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold shrink-0 ${issue.isBonus ? "bg-primary text-white shadow-lg shadow-primary/20 text-[9px]" : "bg-primary/10 text-primary border border-primary/20 text-xs"}`}
            >
              {issue.isBonus ? "MB" : issue.number}
            </div>
            <div>
              <h3 className="font-serif text-xl group-hover:text-primary transition-colors leading-tight">
                {issue.title}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {issue.category}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6 opacity-60 line-clamp-2">
            {issue.tagline}
          </p>

          <button
            onClick={() => onIssueOpen(issue)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary group-hover:gap-3 transition-all"
          >
            Access Blueprint <ArrowRight className="w-3 h-3" />
          </button>

          {!isPro && !issue.isBonus && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <div className="bg-card border border-border/40 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-[220px]">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <p className="text-[10px] font-bold text-center uppercase tracking-widest mb-6 opacity-60">
                  Pro & Max access only
                </p>
                <button
                  onClick={onUpgradeClick}
                  className="w-full bg-primary text-white text-[10px] font-bold py-3.5 rounded-full uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.05] transition-transform"
                >
                  Unlock Full Archive
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
