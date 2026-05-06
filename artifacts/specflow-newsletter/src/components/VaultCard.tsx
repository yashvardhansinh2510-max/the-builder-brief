import React from 'react';
import { Vault } from '@/lib/vault-types';

interface VaultCardProps {
  vault: Vault;
  showSignals?: boolean;
  onSelect?: (vaultId: string) => void;
  layout?: 'compact' | 'expanded';
  displayIndex?: number;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 75 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {score}
    </span>
  );
};

export const VaultCard: React.FC<VaultCardProps> = ({
  vault,
  showSignals = true,
  onSelect,
  layout = 'compact',
  displayIndex,
}) => {
  const handleClick = () => {
    onSelect?.(vault.id);
  };

  const displayNum = displayIndex !== undefined
    ? String(displayIndex).padStart(3, '0')
    : null;

  if (layout === 'expanded') {
    return (
      <a href={`/vault/${vault.id}`} className="block h-full">
        <div
          className="h-full p-6 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={handleClick}
        >
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                {displayNum && (
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase block mb-1">
                    Vault #{displayNum}
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground line-clamp-2">{vault.title}</h3>
              </div>
              <ScoreBadge score={vault.scores.overall} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{vault.tagline}</p>
          </div>

          {/* Problem Statement */}
          <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{vault.problemStatement}</p>

          {/* Score Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/50 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Opportunity</span>
              <p className="text-sm font-bold text-foreground">{vault.scores.opportunity}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Problem</span>
              <p className="text-sm font-bold text-foreground">{vault.scores.problem}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Feasibility</span>
              <p className="text-sm font-bold text-foreground">{vault.scores.feasibility}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Why Now</span>
              <p className="text-sm font-bold text-foreground">{vault.scores.whyNow}</p>
            </div>
          </div>

          {/* Signals */}
          {showSignals && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Community Signals</span>
                  <p className="text-sm font-bold text-foreground">{vault.signalsCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {vault.signalsSummary && (
                  <>
                    {vault.signalsSummary.reddit?.length > 0 && <span className="text-xs">🔥</span>}
                    {vault.signalsSummary.youtube?.length > 0 && <span className="text-xs">📺</span>}
                    {vault.signalsSummary.hn?.length > 0 && <span className="text-xs">⚙️</span>}
                    {vault.signalsSummary.ph?.length > 0 && <span className="text-xs">🎯</span>}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            <span>{vault.daysActive} days active</span>
            {vault.publishedAt && (
              <span>{new Date(vault.publishedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </a>
    );
  }

  // Compact layout
  return (
    <a href={`/vault/${vault.id}`} className="block">
      <div
        className="p-4 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            {displayNum && (
              <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase block">
                #{displayNum}
              </span>
            )}
            <h3 className="font-semibold text-foreground line-clamp-1">{vault.title}</h3>
          </div>
          <ScoreBadge score={vault.scores.overall} />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{vault.tagline}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{vault.signalsCount} signals</span>
          <span>{vault.daysActive}d active</span>
        </div>
      </div>
    </a>
  );
};

export default VaultCard;
