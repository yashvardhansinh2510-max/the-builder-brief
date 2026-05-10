import React from 'react';
import { SignalsSummary } from '@/lib/vault-types';

interface VaultSignalsProps {
  signals: SignalsSummary;
  totalCount: number;
  layout?: 'horizontal' | 'vertical';
  showTrendIndicator?: boolean;
}

const SignalBadge: React.FC<{
  platform: string;
  count: number;
  items: string[];
  icon: React.ReactNode;
}> = ({ platform, count, items, icon }) => {
  const truncatedItems = items.slice(0, 2);

  return (
    <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-xl border border-border hover:border-foreground/30 transition-colors">
      <div className="flex items-center gap-2">
        <div className="text-lg">{icon}</div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">{platform}</span>
          <span className="text-xs text-muted-foreground">{count} mentions</span>
        </div>
      </div>
      {truncatedItems.length > 0 && (
        <div className="flex flex-col gap-1">
          {truncatedItems.map((item, idx) => (
            <span key={idx} className="text-xs text-muted-foreground line-clamp-1">
              "{item}"
            </span>
          ))}
          {items.length > 2 && (
            <span className="text-xs text-muted-foreground font-medium">
              +{items.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const VaultSignals: React.FC<VaultSignalsProps> = ({
  signals,
  totalCount,
  layout = 'horizontal',
  showTrendIndicator = true,
}) => {
  const platformData = [
    { key: 'reddit', name: 'Reddit', icon: '🔥', color: 'bg-orange-50 border-orange-200' },
    { key: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-50 border-red-200' },
    { key: 'hn', name: 'Hacker News', icon: '⚙️', color: 'bg-amber-50 border-amber-200' },
    { key: 'ph', name: 'Product Hunt', icon: '🎯', color: 'bg-pink-50 border-pink-200' },
    { key: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-primary/5 border-primary/20' },
    { key: 'twitter', name: 'X/Twitter', icon: '𝕏', color: 'bg-muted/50 border-border' },
  ];

  const containerClass = layout === 'horizontal'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
    : 'flex flex-col gap-3';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Community Signals</h3>
          <p className="text-sm text-muted-foreground">{totalCount} total mentions across sources</p>
        </div>
        {showTrendIndicator && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">Trending</span>
          </div>
        )}
      </div>

      {/* Signal Badges */}
      <div className={containerClass}>
        {platformData.map(({ key, name, icon }) => (
          <SignalBadge
            key={key}
            platform={name}
            count={signals[key as keyof SignalsSummary]?.length || 0}
            items={signals[key as keyof SignalsSummary] || []}
            icon={icon}
          />
        ))}
      </div>

      {/* Signal Details */}
      <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <h4 className="text-sm font-semibold text-foreground mb-2">How we measure signals</h4>
        <ul className="text-xs text-foreground/70 space-y-1">
          <li>• Reddit: Mentions in startup & business subreddits</li>
          <li>• YouTube: View counts on relevant content</li>
          <li>• Hacker News: Post ranking & discussion activity</li>
          <li>• Product Hunt: Launch status & user votes</li>
          <li>• LinkedIn: Share counts & comment engagement</li>
          <li>• X/Twitter: Tweet mentions & engagement metrics</li>
        </ul>
      </div>
    </div>
  );
};

export default VaultSignals;
