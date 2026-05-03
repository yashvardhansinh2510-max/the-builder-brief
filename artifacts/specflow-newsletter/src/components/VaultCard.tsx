import React from 'react';
import { Vault } from '@/lib/vault-types';

interface VaultCardProps {
  vault: Vault;
  showSignals?: boolean;
  onSelect?: (vaultId: string) => void;
  layout?: 'compact' | 'expanded';
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
}) => {
  const handleClick = () => {
    onSelect?.(vault.id);
  };

  if (layout === 'expanded') {
    return (
      <a
        href={`/vault/${vault.id}`}
        className="block h-full"
      >
        <div
          className="h-full p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={handleClick}
        >
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{vault.title}</h3>
              <ScoreBadge score={vault.scores.overall} />
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{vault.tagline}</p>
          </div>

          {/* Problem Statement */}
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{vault.problemStatement}</p>

          {/* Score Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded">
            <div>
              <span className="text-xs font-semibold text-gray-600">Opportunity</span>
              <p className="text-sm font-bold text-gray-900">{vault.scores.opportunity}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600">Problem</span>
              <p className="text-sm font-bold text-gray-900">{vault.scores.problem}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600">Feasibility</span>
              <p className="text-sm font-bold text-gray-900">{vault.scores.feasibility}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600">Why Now</span>
              <p className="text-sm font-bold text-gray-900">{vault.scores.whyNow}</p>
            </div>
          </div>

          {/* Signals */}
          {showSignals && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <div>
                  <span className="text-xs font-semibold text-gray-600">Community Signals</span>
                  <p className="text-sm font-bold text-gray-900">{vault.signalsCount}</p>
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
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
    <a
      href={`/vault/${vault.id}`}
      className="block"
    >
      <div
        className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{vault.title}</h3>
          <ScoreBadge score={vault.scores.overall} />
        </div>
        <p className="text-xs text-gray-600 line-clamp-1 mb-3">{vault.tagline}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{vault.signalsCount} signals</span>
          <span>{vault.daysActive}d active</span>
        </div>
      </div>
    </a>
  );
};

export default VaultCard;
