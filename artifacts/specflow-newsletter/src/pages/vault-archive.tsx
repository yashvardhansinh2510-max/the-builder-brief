import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import PortalNav from '@/components/PortalNav';
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
  const { vaults, loading, error, total, page, hasMore, fetchVaults, setPage } = useVaults();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'max' | 'all'>('all');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'momentum' | 'recent' | 'signals'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [layout, setLayout] = useState<'compact' | 'expanded'>('expanded');

  // Apply filters
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-28">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Vault Archive</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">All Ideas.</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Explore every startup idea discovered by our AI system. Each backed by real community signals, scored across 4 dimensions, verified for viability.
          </p>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="mb-8 space-y-6 bg-white p-6 rounded-lg border border-gray-200"
        >
          {/* Search Bar */}
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search ideas</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, problem, market..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Score: {minScore}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    sortOrder === 'desc'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Highest
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    sortOrder === 'asc'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Lowest
                </button>
              </div>
            </div>
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              {total} ideas found
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setLayout('compact')}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  layout === 'compact'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setLayout('expanded')}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  layout === 'expanded'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
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
                className="h-80 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold mb-1">Error loading vaults</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && vaults.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <p className="text-2xl font-semibold mb-2">No ideas found.</p>
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
                  <VaultCard vault={vault} layout={layout} />
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
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
          className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-3">New idea every Friday</h2>
          <p className="mb-6 max-w-md mx-auto text-blue-100">
            Get early access to validated startup ideas before they become trends.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Subscribe to updates
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">© {new Date().getFullYear()} The Build Brief</div>
          <div className="flex items-center gap-8 text-sm text-gray-600">
            <a href="/archive" className="hover:text-gray-900 transition-colors">Archive</a>
            <a href="/about" className="hover:text-gray-900 transition-colors">About</a>
            <a href="/contact" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
