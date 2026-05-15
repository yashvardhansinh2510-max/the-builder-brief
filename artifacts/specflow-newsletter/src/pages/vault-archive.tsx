import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useMode } from "@/lib/ModeContext";
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import VaultCard from '@/components/VaultCard';
import { useVaultList } from '@/hooks/useVaults';
import { VaultFilter } from '@/lib/vault-types';
import { usePageTracking, useTrack } from '@/hooks/useAnalytics';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

export default function VaultArchive() {
  usePageTracking('/vault-archive');
  const { track } = useTrack();
  const { mode } = useMode();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'max' | 'all'>('all');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'momentum' | 'recent' | 'signals'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [layout, setLayout] = useState<'compact' | 'expanded'>('expanded');
  const [page, setPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const activeFilterCount = [
    selectedTier !== 'all',
    minScore > 0,
    sortBy !== 'score',
    sortOrder !== 'desc',
  ].filter(Boolean).length;

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      if (searchQuery) track('search_performed', { query: searchQuery });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset page when filters change + track
  useEffect(() => {
    setPage(1);
    track('filter_changed', { tier: selectedTier, minScore, sortBy, sortOrder });
  }, [selectedTier, minScore, sortBy, sortOrder]);

  const filters: VaultFilter = useMemo(() => ({
    searchQuery: debouncedSearch || undefined,
    tier: selectedTier === 'all' ? undefined : selectedTier,
    minScore: minScore > 0 ? minScore : undefined,
    sortBy,
    sortOrder,
  }), [debouncedSearch, selectedTier, minScore, sortBy, sortOrder]);

  const { data, isLoading: loading, isError, error: queryError } = useVaultList(filters, page);
  const rawVaults = data?.vaults ?? [];
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;
  const error = isError ? (queryError as Error) : null;

  const vaults = useMemo(() => {
    if (mode === "offline") {
      return rawVaults.filter(v =>
        v.tags?.some(tag => tag.toLowerCase() === "offline" || tag.toLowerCase() === "hybrid")
      );
    }
    return rawVaults;
  }, [rawVaults, mode]);

  const tiers = [
    { value: 'all', label: 'All Tiers', count: total },
    { value: 'free', label: 'Free Tier', count: vaults.filter(v => v.tier === 'free').length },
    { value: 'pro', label: 'Pro Tier', count: vaults.filter(v => v.tier === 'pro').length },
    { value: 'max', label: 'Max Tier', count: vaults.filter(v => v.tier === 'max').length },
  ];

  const sortOptions = [
    { value: 'score', label: 'Confidence Score' },
    { value: 'momentum', label: 'Momentum' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'signals', label: 'Signal Count' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-28">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Vault Archive</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">All Ideas.</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore every startup idea discovered by our AI system. Each backed by real community signals, scored across 4 dimensions, verified for viability.
          </p>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="mb-8 space-y-4 bg-card p-4 sm:p-6 rounded-2xl border border-border"
        >
          {/* Search + mobile filter trigger row */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Search ideas</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title, problem, market..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Mobile-only filters button */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:border-primary/50 transition-colors relative">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center justify-between">
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => { setSelectedTier('all'); setMinScore(0); setSortBy('score'); setSortOrder('desc'); }}
                        className="text-xs text-primary font-semibold flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Clear all
                      </button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-6 pb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subscription Tier</label>
                    <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none">
                      {tiers.map(t => <option key={t.value} value={t.value}>{t.label} ({t.count})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Minimum Score: {minScore}</label>
                    <input type="range" min="0" max="100" step="5" value={minScore} onChange={(e) => setMinScore(parseInt(e.target.value))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0</span><span>100</span></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none">
                      {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                    <div className="flex gap-2">
                      <button onClick={() => setSortOrder('desc')} className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${sortOrder === 'desc' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>Highest</button>
                      <button onClick={() => setSortOrder('asc')} className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${sortOrder === 'asc' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>Lowest</button>
                    </div>
                  </div>
                  <button onClick={() => setFilterSheetOpen(false)} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold">Apply Filters</button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters Grid — hidden on mobile */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Subscription Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                {tiers.map(tier => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label} ({tier.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Score Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Minimum Score: {minScore}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Order</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    sortOrder === 'desc'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
                  }`}
                >
                  Highest
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    sortOrder === 'asc'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
                  }`}
                >
                  Lowest
                </button>
              </div>
            </div>
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">
              {total} ideas found
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setLayout('compact')}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  layout === 'compact'
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setLayout('expanded')}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  layout === 'expanded'
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive">
            <p className="font-semibold mb-1">Error loading vaults</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && vaults.length === 0 && !error && (
          <div className="text-center py-24 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
            <p className="font-serif text-3xl mb-2 text-foreground">No ideas found.</p>
            <p className="text-sm">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Vaults Grid */}
        {!loading && vaults.length > 0 && (
          <>
            <div className={layout === 'expanded' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {vaults.map((vault, idx) => (
                <motion.div
                  key={vault.id}
                  custom={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                >
                  <VaultCard vault={vault} layout={layout} displayIndex={idx + 1} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {hasMore && (
              <motion.div
                custom={vaults.length}
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                className="mt-12 text-center"
              >
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
                >
                  Load More Ideas
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-20 bg-card border border-border rounded-2xl p-12 text-center"
        >
          <h2 className="font-serif text-3xl font-bold mb-3 text-foreground">New idea every Friday</h2>
          <p className="mb-6 max-w-md mx-auto text-muted-foreground">
            Get early access to validated startup ideas before they become trends.
          </p>
          <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            Subscribe to updates
          </button>
        </motion.div>
      </main>

      <Footer variant="public" />
    </div>
  );
}
