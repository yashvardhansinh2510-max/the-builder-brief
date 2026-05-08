import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useMode } from "@/lib/ModeContext";
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import VaultCard from '@/components/VaultCard';
import { useVaults } from '@/hooks/useVaults';
import { VaultFilter } from '@/lib/vault-types';
import { usePageTracking } from '@/hooks/useAnalytics';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

export default function VaultArchive() {
  usePageTracking('/vault-archive');
  const { mode } = useMode();
  const { vaults: rawVaults, loading, error, total, page, hasMore, fetchVaults, setPage } = useVaults();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'max' | 'all'>('all');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'momentum' | 'recent' | 'signals'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [layout, setLayout] = useState<'compact' | 'expanded'>('expanded');

  // Apply mode and filter processing
  const vaults = useMemo(() => {
    let result = rawVaults;
    if (mode === "offline") {
      result = result.filter(v => 
        v.tags?.some(tag => 
          tag.toLowerCase() === "offline" || tag.toLowerCase() === "hybrid"
        )
      );
    }
    return result;
  }, [rawVaults, mode]);

  // Apply API filters
  const handleFilterChange = async () => {
    const filter: VaultFilter = {
      searchQuery: searchQuery || undefined,
      tier: selectedTier === 'all' ? undefined : selectedTier,
      minScore: minScore > 0 ? minScore : undefined,
      sortBy,
      sortOrder,
    };
    await fetchVaults(filter, 1);
  };

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedTier, minScore, sortBy, sortOrder]);

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
          className="mb-8 space-y-6 bg-card p-6 rounded-2xl border border-border"
        >
          {/* Search Bar */}
          <div className="max-w-md">
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

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div
                key={i}
                className="h-80 bg-muted rounded-2xl animate-pulse"
              />
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
        {!loading && vaults.length === 0 && (
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
                  onClick={() => setPage(page + 1)}
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
