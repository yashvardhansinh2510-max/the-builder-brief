import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, Lock, LayoutGrid, List, Columns3, GitCompare, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMode } from "@/lib/ModeContext";
import { useAuth } from "@/lib/AuthContext";
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import VaultCard from '@/components/VaultCard';
import { useVaults } from '@/hooks/useVaults';
import { VaultFilter } from '@/lib/vault-types';
import { usePageTracking } from '@/hooks/useAnalytics';

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, max: 2, incubator: 3 };

function EmptyState() {
  return (
    <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border">
      <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto mb-4 text-muted-foreground/40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="28" cy="28" r="18" />
        <line x1="41" y1="41" x2="56" y2="56" strokeLinecap="round" />
        <line x1="22" y1="28" x2="34" y2="28" />
        <line x1="28" y1="22" x2="28" y2="34" />
      </svg>
      <p className="font-serif text-2xl text-foreground mb-2">No ideas match your filters.</p>
      <p className="text-sm text-muted-foreground">Try widening the search.</p>
    </div>
  );
}

export default function VaultArchive() {
  usePageTracking('/vault-archive');
  const { mode } = useMode();
  const { tier: userTier } = useAuth();
  const { vaults: rawVaults, loading, error, total, page, hasMore, fetchVaults, setPage } = useVaults();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'momentum' | 'recent' | 'signals'>('score');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [layout, setLayout] = useState<'grid' | 'list' | 'compact'>('grid');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Fetch all unique tags once
  useEffect(() => {
    fetch(`${API_BASE}/vaults/tags`)
      .then(r => r.ok ? r.json() : [])
      .then((tags: string[]) => setAllTags(tags))
      .catch(() => {});
  }, [API_BASE]);

  // Mode filter
  const vaults = useMemo(() => {
    if (mode !== "offline") return rawVaults;
    return rawVaults.filter(v =>
      v.tags?.some(t => t.toLowerCase() === "offline" || t.toLowerCase() === "hybrid")
    );
  }, [rawVaults, mode]);

  const handleCompareToggle = useCallback((vaultId: string, checked: boolean, vaultTier: string) => {
    if (checked) {
      if (vaultTier !== 'free' && (TIER_RANK[userTier] ?? 0) === 0) {
        toast({ title: 'Upgrade required', description: 'Upgrade to Pro to compare this idea.' });
        return;
      }
      if (compareIds.length >= 3) {
        toast({ title: 'Maximum 3 ideas', description: 'Remove one idea before adding another.' });
        return;
      }
      setCompareIds(prev => [...prev, vaultId]);
    } else {
      setCompareIds(prev => prev.filter(id => id !== vaultId));
    }
  }, [compareIds, userTier, toast]);

  const handleFilterChange = useCallback(async () => {
    const filter: VaultFilter = {
      searchQuery: searchQuery || undefined,
      tier: (selectedTier !== 'all' ? selectedTier : undefined) as VaultFilter['tier'],
      minScore: minScore > 0 ? minScore : undefined,
      sortBy,
      sortOrder,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    };
    await fetchVaults(filter, 1);
  }, [searchQuery, selectedTier, minScore, sortBy, sortOrder, selectedCategory, fetchVaults]);

  useEffect(() => {
    const t = setTimeout(handleFilterChange, 500);
    return () => clearTimeout(t);
  }, [handleFilterChange]);

  // Scroll-collapsing header
  const { scrollY } = useScroll();
  const headerPaddingY = useTransform(scrollY, [0, 120], [48, 16]);
  const subtitleOpacity = useTransform(scrollY, [60, 110], [1, 0]);

  // Stats
  const avgScore = vaults.length
    ? Math.round(vaults.reduce((s, v) => s + (v.scores?.overall ?? 0), 0) / vaults.length)
    : 0;
  const topVault = [...vaults].sort((a, b) => (b.momentum ?? 0) - (a.momentum ?? 0))[0];
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCount = vaults.filter(v => v.publishedAt && new Date(v.publishedAt) >= sevenDaysAgo).length;

  // Trending tag counts for sidebar
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vaults.forEach(v => v.tags?.forEach(t => { counts[t] = (counts[t] ?? 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [vaults]);
  const maxTagCount = tagCounts[0]?.[1] ?? 1;

  const tiers = ['all', 'free', 'pro', 'max'];

  const gridCols = {
    grid: 'grid-cols-1 md:grid-cols-2',
    compact: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    list: 'grid-cols-1',
  }[layout];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNav activePage="archive" />
      <div aria-hidden="true" className="h-[104px]" />

      {/* Hero Header */}
      <motion.header
        className="border-b border-border bg-background/95 backdrop-blur-sm"
        style={{ paddingTop: headerPaddingY, paddingBottom: headerPaddingY }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">The Idea Vault</h1>
              <motion.p style={{ opacity: subtitleOpacity }} className="text-muted-foreground mt-1 max-w-xl">
                Every startup idea our AI has surfaced. Scored. Verified. Yours to build.
              </motion.p>
            </div>
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                {total} ideas
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                Avg score: {avgScore}
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                +{recentCount} this week
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filter Bar */}
      <div className="sticky top-[104px] z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 space-y-3">
          {/* Row 1: search + layout */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'score' | 'momentum' | 'recent' | 'signals')}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none"
            >
              <option value="score">Confidence Score</option>
              <option value="momentum">Momentum</option>
              <option value="recent">Recently Added</option>
              <option value="signals">Most Signals</option>
            </select>
            <div className="flex items-center gap-1 ml-auto">
              {([['grid', LayoutGrid], ['compact', Columns3], ['list', List]] as const).map(([k, Icon]) => (
                <button
                  key={k}
                  onClick={() => setLayout(k)}
                  className={`p-1.5 rounded ${layout === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: category pills + tier tabs + score slider */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1">
              {['All', ...allTags].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedCategory(tag)}
                  className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selectedCategory === tag
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Tier tabs */}
            <div className="flex items-center gap-1 shrink-0">
              {tiers.map(t => {
                const isLocked = t !== 'all' && t !== 'free' && (TIER_RANK[userTier] ?? 0) < (TIER_RANK[t] ?? 0);
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedTier === t
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isLocked && <Lock className="w-2.5 h-2.5" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Score slider */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">Min score:</span>
              <input
                type="range" min="0" max="100" step="5"
                value={minScore}
                onChange={e => setMinScore(parseInt(e.target.value))}
                className="w-20 h-1.5 accent-primary"
              />
              <span className="text-xs font-semibold text-foreground w-6">{minScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-28">
        <div className="flex gap-8">

          {/* Results area */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className={`grid ${gridCols} gap-5`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            )}

            {error && (
              <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive">
                <p className="font-semibold mb-1">Error loading vaults</p>
                <p className="text-sm">{error.message}</p>
              </div>
            )}

            {!loading && vaults.length === 0 && <EmptyState />}

            {!loading && vaults.length > 0 && (
              <>
                <div className={`grid ${gridCols} gap-5`}>
                  {vaults.map((vault, idx) => {
                    const isLocked = vault.isLocked || !!(
                      vault.tier &&
                      (TIER_RANK[userTier] ?? 0) < (TIER_RANK[vault.tier] ?? 0)
                    );

                    if (isLocked) {
                      return (
                        <div key={vault.id} className="relative">
                          <div className="pointer-events-none select-none blur-sm opacity-60">
                            <VaultCard vault={vault} layout={layout === 'list' ? 'compact' : layout === 'compact' ? 'compact' : 'expanded'} displayIndex={idx} />
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 rounded-2xl cursor-pointer">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground capitalize">
                              {vault.tier} tier required
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <motion.div
                        key={vault.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: (idx % 6) * 0.05 }}
                      >
                        <VaultCard
                          vault={vault}
                          layout={layout === 'list' ? 'compact' : layout === 'compact' ? 'compact' : 'expanded'}
                          displayIndex={idx}
                          compareMode={true}
                          isCompareSelected={compareIds.includes(vault.id)}
                          onCompareToggle={(id, checked) => handleCompareToggle(id, checked, vault.tier)}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setPage(page + 1)}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      Load More Ideas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:flex flex-col gap-6 w-72 shrink-0">
            {/* Top pick */}
            {topVault && !topVault.isLocked && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">This Week's Top Pick</p>
                <h4 className="font-serif font-bold text-foreground mb-1 leading-snug">{topVault.title}</h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{topVault.tagline}</p>
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="font-semibold text-foreground">Score: {topVault.scores?.overall ?? 0}</span>
                  <span className="text-muted-foreground">{topVault.momentum ?? 0} momentum</span>
                </div>
                <Link href={`/vault/${topVault.id}`} className="block text-xs font-semibold text-primary hover:underline">
                  View Idea →
                </Link>
              </div>
            )}

            {/* Trending categories */}
            {tagCounts.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Trending Categories</p>
                <div className="space-y-2">
                  {tagCounts.map(([tag, ct]) => (
                    <div key={tag}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-foreground">{tag}</span>
                        <span className="text-muted-foreground">{ct}</span>
                      </div>
                      <div className="h-1 bg-muted/40 rounded-full">
                        <div
                          className="h-full bg-primary/60 rounded-full transition-all"
                          style={{ width: `${(ct / maxTagCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            {(TIER_RANK[userTier] ?? 0) < TIER_RANK.max && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">Unlock Max Tier</p>
                <p className="text-sm text-amber-900 dark:text-amber-200 mb-3">
                  Get every idea, including pro & max vaults, execution playbooks, and first 10 customers strategy.
                </p>
                <Link href="/pricing" className="block text-center text-xs font-bold px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                  Upgrade Now
                </Link>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer variant="public" />

      {/* Sticky compare bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-foreground text-background rounded-2xl shadow-2xl"
          >
            <GitCompare className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">
              Comparing {compareIds.length} idea{compareIds.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setLocation(`/vault-compare?ids=${compareIds.join(',')}`)}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Compare →
            </button>
            <button
              onClick={() => setCompareIds([])}
              className="p-1 hover:opacity-70 transition-opacity"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
