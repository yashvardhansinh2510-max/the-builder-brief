import React, { useMemo } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  sourceTypes: string[];
  strengthMin: number;
  trendDirection: 'All' | 'Rising' | 'Stable' | 'Declining';
}

const DEFAULT_FILTERS: FilterState = {
  dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dateTo: new Date().toISOString().split('T')[0],
  sourceTypes: [],
  strengthMin: 0,
  trendDirection: 'All',
};

interface VaultFilterPanelProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  availableSources: string[];
  resultCount: number;
}

export default function VaultFilterPanel({
  filters,
  onFiltersChange,
  availableSources,
  resultCount,
}: VaultFilterPanelProps) {
  const isDirty = useMemo(() => {
    return (
      filters.dateFrom !== DEFAULT_FILTERS.dateFrom ||
      filters.dateTo !== DEFAULT_FILTERS.dateTo ||
      filters.sourceTypes.length > 0 ||
      filters.strengthMin > 0 ||
      filters.trendDirection !== 'All'
    );
  }, [filters]);

  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  function toggleSource(src: string) {
    const next = filters.sourceTypes.includes(src)
      ? filters.sourceTypes.filter(s => s !== src)
      : [...filters.sourceTypes, src];
    set('sourceTypes', next);
  }

  function reset() {
    onFiltersChange({ ...DEFAULT_FILTERS });
  }

  const TRENDS = ['All', 'Rising', 'Stable', 'Declining'] as const;

  return (
    <aside className="space-y-6" data-testid="vault-filter-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </div>
        {isDirty && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="filter-clear"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground -mt-2">
        <span className="font-semibold text-foreground">{resultCount}</span> vault{resultCount !== 1 ? 's' : ''} match
      </p>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Date Range
        </label>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo}
            onChange={e => set('dateFrom', e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            data-testid="filter-date-from"
          />
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom}
            onChange={e => set('dateTo', e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            data-testid="filter-date-to"
          />
        </div>
      </div>

      {/* Trend Direction */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Trend Direction
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {TRENDS.map(trend => (
            <button
              key={trend}
              onClick={() => set('trendDirection', trend)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filters.trendDirection === trend
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border hover:border-foreground/30 text-foreground'
              }`}
              data-testid={`filter-trend-${trend.toLowerCase()}`}
            >
              {trend}
            </button>
          ))}
        </div>
      </div>

      {/* Min Confidence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Min Confidence
          </label>
          <span className="text-xs font-semibold text-foreground">{filters.strengthMin}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.strengthMin}
          onChange={e => set('strengthMin', parseInt(e.target.value))}
          className="w-full accent-primary"
          data-testid="filter-strength"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Source Types */}
      {availableSources.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sources
          </label>
          <div className="space-y-1.5">
            {availableSources.map(src => {
              const checked = filters.sourceTypes.includes(src);
              return (
                <label
                  key={src}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  data-testid={`filter-source-${src}`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                      checked
                        ? 'bg-primary border-primary'
                        : 'border-border group-hover:border-foreground/40'
                    }`}
                    onClick={() => toggleSource(src)}
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm text-foreground capitalize"
                    onClick={() => toggleSource(src)}
                  >
                    {src}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
