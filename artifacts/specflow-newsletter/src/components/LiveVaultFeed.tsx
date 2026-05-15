import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Clock } from 'lucide-react';
import VaultCard from './VaultCard';
import { Vault } from '@/lib/vault-types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const PLATFORM_ICONS: Record<string, string> = {
  reddit: '🔴',
  youtube: '▶️',
  hn: '🟠',
  ph: '🐱',
  linkedin: '💼',
  twitter: '🐦',
};

function daysAgo(iso: string | Date): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function LiveVaultFeed() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVaults = async () => {
    try {
      const res = await fetch(`${API_BASE}/vaults?sort=recent&pageSize=6`);
      if (!res.ok) return;
      const data = await res.json();
      setVaults(data.vaults ?? []);
    } catch {
      // section stays empty on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
    const id = setInterval(fetchVaults, 60_000);
    return () => clearInterval(id);
  }, []);

  if (loading || vaults.length === 0) return null;

  return (
    <section className="py-20 bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Live from the Vault</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Ideas our engine is tracking</h2>
            <p className="text-muted-foreground mt-2 text-sm">Refreshes every 60 seconds. Free ideas visible to all.</p>
          </div>
          <Link
            href="/vault-archive"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0 mt-2"
          >
            Explore All 200+ Ideas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaults.map((vault, i) => {
              const isLocked = vault.tier === 'pro' || vault.tier === 'max';
              const platforms = (vault.sourceAttribution ?? [])
                .slice(0, 2)
                .map((s) => PLATFORM_ICONS[s.source] ?? '');

              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="relative"
                >
                  {isLocked && (
                    <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 backdrop-blur-sm bg-background/70" />
                      <Link
                        href="/pricing"
                        className="relative z-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity"
                      >
                        Unlock with {vault.tier === 'pro' ? 'Pro' : 'Max'} →
                      </Link>
                    </div>
                  )}
                  <div className={isLocked ? 'pointer-events-none' : ''}>
                    <VaultCard vault={vault} layout="compact" displayIndex={i + 1} />
                  </div>
                  <div className="flex items-center justify-between px-1 pb-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {vault.publishedAt ? daysAgo(vault.publishedAt) : 'Recently'}
                    </span>
                    {platforms.length > 0 && (
                      <span className="flex gap-1">{platforms.map((icon, j) => <span key={j}>{icon}</span>)}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        <div className="mt-10 flex justify-center">
          <Link
            href="/vault-archive"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Explore All 200+ Ideas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
