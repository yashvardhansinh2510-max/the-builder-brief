import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';
import VaultFilterPanel, { type FilterState } from '@/components/VaultFilterPanel';
import VaultDataTable from '@/components/VaultDataTable';
import VaultTrendGraph from '@/components/VaultTrendGraph';
import VaultSourceChart from '@/components/VaultSourceChart';
import VaultHeatmap from '@/components/VaultHeatmap';
import { useVaultData, type Vault, type Signal } from '@/hooks/useVaultData';

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

  // Fetch all vaults (no server-side filter — filter client-side like vault-archive.tsx)
  const { vaults: allVaults, loading, error } = useVaultData({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  // Client-side filter by source type, strength, trend
  const vaults = useMemo(() => {
    return allVaults.filter((v: Vault) => {
      if (filters.sourceTypes.length > 0) {
        const hasSource = filters.sourceTypes.some((s: string) => v.source_types.includes(s));
        if (!hasSource) return false;
      }
      if (filters.strengthMin > 0 && v.avg_confidence * 100 < filters.strengthMin) return false;
      if (filters.trendDirection !== 'All' && v.trend_direction !== filters.trendDirection) return false;
      return true;
    });
  }, [allVaults, filters.sourceTypes, filters.strengthMin, filters.trendDirection]);

  // Available source types for filter sidebar
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    allVaults.forEach((v: Vault) => v.source_types.forEach((s: string) => set.add(s)));
    return Array.from(set).sort();
  }, [allVaults]);

  // Derived stats
  const totalVaults = vaults.length;
  const activeSignalsThisWeek = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return vaults.flatMap((v: Vault) => v.signals).filter((s: Signal) => new Date(s.timestamp).getTime() > cutoff).length;
  }, [vaults]);
  const avgConfidence = useMemo(() => {
    if (vaults.length === 0) return '—';
    const avg = vaults.reduce((s: number, v: Vault) => s + v.avg_confidence, 0) / vaults.length;
    return (avg * 100).toFixed(0) + '%';
  }, [vaults]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-28">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The vault</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-4">Vault Archive.</h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Explore signals, trends, and insights from your vault ecosystem.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.section
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          data-testid="archive-stats"
        >
          {[
            { label: 'Total Vaults', value: loading ? '…' : totalVaults },
            { label: 'Active Signals (7d)', value: loading ? '…' : activeSignalsThisWeek },
            { label: 'Avg Confidence', value: loading ? '…' : avgConfidence },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{label}</h3>
              <p className="text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </motion.section>

        {/* Main layout: sidebar + content */}
        <div className="archive-layout">
          {/* Filter sidebar */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="archive-sidebar"
          >
            <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
              <VaultFilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                availableSources={availableSources}
                resultCount={vaults.length}
              />
            </div>
          </motion.div>

          {/* Main content */}
          <div className="archive-main">
            {/* Charts row */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
              data-testid="archive-charts"
            >
              <div className="bg-card border border-border rounded-xl p-6">
                <VaultTrendGraph vaults={vaults} />
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <VaultSourceChart vaults={vaults} />
              </div>
            </motion.section>

            {/* Heatmap */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="bg-card border border-border rounded-xl p-6 mb-6"
              data-testid="archive-heatmap"
            >
              <VaultHeatmap vaults={vaults} />
            </motion.section>

            {/* Data table */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={5}
              variants={fadeUp}
              data-testid="archive-table"
            >
              {error && (
                <div className="text-center py-12 text-red-500">
                  <p className="text-sm">Error: {error}</p>
                </div>
              )}
              <VaultDataTable vaults={vaults} loading={loading} />
            </motion.section>
          </div>
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
