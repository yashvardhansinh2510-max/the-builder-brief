import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useVaults } from "@/hooks/useVaults";

interface VaultTabProps {
  isPro: boolean;
  onUpgradeClick: () => void;
}

export default function VaultTab({ isPro: _isPro, onUpgradeClick: _onUpgradeClick }: VaultTabProps) {
  const { vaults, loading, fetchVaults } = useVaults();

  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    fetchVaults(
      { sortBy: 'momentum', sortOrder: 'desc', dateFrom: sevenDaysAgo, pageSizeOverride: 3 },
      1,
    );
  }, [fetchVaults]);

  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const isNew = (publishedAt?: Date) => {
    if (!publishedAt) return false;
    return new Date(publishedAt) >= fortyEightHoursAgo;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 bg-card border border-border rounded-2xl animate-pulse min-h-[96px]">
            <div className="h-4 bg-muted rounded mb-3 w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
          <p className="text-2xl mb-2">📅</p>
          <p className="font-semibold text-foreground">Next drop lands Friday.</p>
          <p className="text-sm text-muted-foreground mt-1">Come back then.</p>
        </div>
        <div className="flex justify-end">
          <Link href="/vault-archive" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            View Full Vault Archive <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">This Week's Top Ideas</p>

      <div className="space-y-4">
        {vaults.map((vault, i) => (
          <motion.div
            key={vault.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/vault/${vault.id}`} className="block">
              <div className="group p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {isNew(vault.publishedAt) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">NEW</span>
                      )}
                      {(vault.momentum ?? 0) > 70 && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                    </div>
                    <h4 className="font-serif font-bold text-foreground text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                      {vault.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{vault.tagline}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      (vault.momentum ?? 0) >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : (vault.momentum ?? 0) >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                      {vault.momentum ?? 0} momentum
                    </div>
                    <span className="text-[10px] text-muted-foreground">{vault.signalsCount} signals</span>
                  </div>
                </div>
                <div className="mt-3 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Dive In →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Link href="/vault-archive" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          View Full Vault Archive <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
