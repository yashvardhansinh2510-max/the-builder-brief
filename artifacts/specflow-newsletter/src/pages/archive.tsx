import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';

interface FilterState {
  dateFrom: string;
  dateTo: string;
  sourceTypes: string[];
  strengthMin: number;
  trendDirection: 'All' | 'Rising' | 'Stable' | 'Declining';
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

export default function ArchivePage() {
  usePageTracking('/archive');

  const [filters, setFilters] = useState<FilterState>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    sourceTypes: [],
    strengthMin: 0,
    trendDirection: 'All',
  });

  // Mock data for stats - to be replaced with actual useVaultData hook
  const totalVaults = 42;
  const activeSignalsThisWeek = 156;
  const avgConfidence = '0.78';
  const loading = false;
  const error: string | null = null;
  const vaults: any[] = [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-28">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The vault</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-4">Vault Archive.</h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Explore signals, trends, and insights from your vault ecosystem.
          </p>
        </motion.div>

        <div className="archive-layout">
          {/* Filter Panel Placeholder */}
          <motion.aside
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="w-full md:w-80 space-y-6 mb-8 md:mb-0"
          >
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Filters</h3>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="flex-1 h-10 text-sm"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="flex-1 h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Trend Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Rising', 'Stable', 'Declining'].map(trend => (
                    <button
                      key={trend}
                      onClick={() => setFilters({ ...filters, trendDirection: trend as FilterState['trendDirection'] })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        filters.trendDirection === trend
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border hover:border-foreground/40'
                      }`}
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Min Strength</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.strengthMin}
                  onChange={(e) => setFilters({ ...filters, strengthMin: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{filters.strengthMin}%</span>
              </div>
            </div>
          </motion.aside>

          <main className="archive-main flex-1">
            {/* Stats Cards */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
              <div className="stat-card bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Vaults</h3>
                <p className="stat-value text-3xl font-semibold">{totalVaults}</p>
              </div>
              <div className="stat-card bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Signals (7d)</h3>
                <p className="stat-value text-3xl font-semibold">{activeSignalsThisWeek}</p>
              </div>
              <div className="stat-card bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg Confidence</h3>
                <p className="stat-value text-3xl font-semibold">{avgConfidence}</p>
              </div>
            </motion.section>

            {/* Charts Section Placeholder */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <div className="bg-card border border-border rounded-xl p-6 min-h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm font-medium mb-1">Trend Graph</p>
                  <p className="text-xs">VaultTrendGraph component pending</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 min-h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm font-medium mb-1">Source Chart</p>
                  <p className="text-xs">VaultSourceChart component pending</p>
                </div>
              </div>
            </motion.section>

            {/* Heatmap Section Placeholder */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="heatmap-section mb-8"
            >
              <div className="bg-card border border-border rounded-xl p-6 min-h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm font-medium mb-1">Heatmap</p>
                  <p className="text-xs">VaultHeatmap component pending</p>
                </div>
              </div>
            </motion.section>

            {/* Data Table Section Placeholder */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={5}
              variants={fadeUp}
              className="table-section"
            >
              {loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">Loading vaults...</p>
                </div>
              )}
              {error && (
                <div className="text-center py-12 text-red-500">
                  <p className="text-sm">Error: {error}</p>
                </div>
              )}
              {!loading && !error && (
                <div className="bg-card border border-border rounded-xl p-6 min-h-96 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm font-medium mb-1">Data Table</p>
                    <p className="text-xs">VaultDataTable component pending</p>
                  </div>
                </div>
              )}
            </motion.section>
          </main>
        </div>

        {/* CTA strip */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={6}
          variants={fadeUp}
          className="mt-20 bg-card border border-border rounded-2xl p-10 text-center"
        >
          <h2 className="font-serif text-3xl mb-3">Vault insights unlock opportunity.</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Analyze trends, identify signals, and build smarter.</p>
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12" asChild>
            <Link href="/" data-testid="button-archive-cta">Learn more</Link>
          </Button>
        </motion.div>
      </main>

      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-serif text-lg text-muted-foreground">The Build Brief</span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/archive" className="hover:text-foreground transition-colors">Archive</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} The Build Brief</p>
        </div>
      </footer>
    </div>
  );
}
