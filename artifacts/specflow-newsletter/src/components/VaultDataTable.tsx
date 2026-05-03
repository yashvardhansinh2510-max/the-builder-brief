import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, TrendingUp, Minus, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Vault } from '@/hooks/useVaultData';
import VaultDetailView from './VaultDetailView';

type SortKey = 'title' | 'created_at' | 'signals_count' | 'avg_confidence';
type SortDir = 'asc' | 'desc';

interface VaultDataTableProps {
  vaults: Vault[];
  loading: boolean;
}

const PAGE_SIZE = 10;

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.7
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
      : value >= 0.5
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {pct}%
    </span>
  );
}

function TrendBadge({ trend }: { trend: Vault['trend_direction'] }) {
  const map: Record<'Rising' | 'Stable' | 'Declining', { icon: React.ReactNode; cls: string }> = {
    Rising: { icon: <TrendingUp className="w-3.5 h-3.5" />, cls: 'text-emerald-600 dark:text-emerald-400' },
    Stable: { icon: <Minus className="w-3.5 h-3.5" />, cls: 'text-muted-foreground' },
    Declining: { icon: <TrendingDown className="w-3.5 h-3.5" />, cls: 'text-red-500 dark:text-red-400' },
  };
  const { icon, cls } = map[trend as 'Rising' | 'Stable' | 'Declining'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cls}`}>
      {icon} {trend}
    </span>
  );
}

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
  return dir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
}

export default function VaultDataTable({ vaults, loading }: VaultDataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  }

  const sorted = useMemo(() => {
    return [...vaults].sort((a, b) => {
      let av: string | number = a[sortKey] as string | number;
      let bv: string | number = b[sortKey] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [vaults, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const thCls =
    'px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none';
  const sortableThCls = `${thCls} cursor-pointer hover:text-foreground transition-colors`;

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!loading && vaults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <div className="text-4xl mb-3">🔍</div>
        <p className="font-semibold text-base mb-1">No vaults match your filters</p>
        <p className="text-sm">Try widening your date range or clearing source filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th
                className={sortableThCls}
                onClick={() => handleSort('title')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Vault <SortIcon col="title" sortKey={sortKey} dir={sortDir} />
                </span>
              </th>
              <th
                className={sortableThCls}
                onClick={() => handleSort('created_at')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Date <SortIcon col="created_at" sortKey={sortKey} dir={sortDir} />
                </span>
              </th>
              <th
                className={sortableThCls}
                onClick={() => handleSort('signals_count')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Signals <SortIcon col="signals_count" sortKey={sortKey} dir={sortDir} />
                </span>
              </th>
              <th
                className={sortableThCls}
                onClick={() => handleSort('avg_confidence')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Confidence <SortIcon col="avg_confidence" sortKey={sortKey} dir={sortDir} />
                </span>
              </th>
              <th className={thCls}>Trend</th>
              <th className={thCls}>Sources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((vault) => {
              const isExpanded = expandedId === vault.id;
              return (
                <React.Fragment key={vault.id}>
                  <tr
                    className={`cursor-pointer transition-colors ${
                      isExpanded
                        ? 'bg-primary/5'
                        : 'hover:bg-muted/40'
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : vault.id)}
                    data-testid={`vault-row-${vault.id}`}
                  >
                    {/* Title */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </motion.div>
                        <span className="font-medium text-foreground line-clamp-1">{vault.title}</span>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(vault.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    {/* Signals */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold">{vault.signals_count}</span>
                    </td>
                    {/* Confidence */}
                    <td className="px-4 py-3.5">
                      <ConfidenceBadge value={vault.avg_confidence} />
                    </td>
                    {/* Trend */}
                    <td className="px-4 py-3.5">
                      <TrendBadge trend={vault.trend_direction} />
                    </td>
                    {/* Sources */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {vault.source_types.slice(0, 3).map((src: string) => (
                          <span
                            key={src}
                            className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                          >
                            {src}
                          </span>
                        ))}
                        {vault.source_types.length > 3 && (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                            +{vault.source_types.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline expand */}
                  <AnimatePresence>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="p-0 border-b border-primary/20 bg-primary/[0.03]">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <VaultDetailView
                              vault={vault}
                              onClose={() => setExpandedId(null)}
                            />
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} vaults
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              data-testid="table-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              // Show first, last, current ±1, and ellipsis
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    pg === page
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              data-testid="table-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
