import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Vault } from '@/lib/vault-types';

interface VaultCardProps {
  vault: Vault;
  showSignals?: boolean;
  onSelect?: (vaultId: string) => void;
  layout?: 'compact' | 'expanded';
  displayIndex?: number;
  isBookmarked?: boolean;
  compareMode?: boolean;
  isCompareSelected?: boolean;
  onCompareToggle?: (vaultId: string, checked: boolean) => void;
}

const tierStyles: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  pro: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  max: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 52 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const stroke = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth={4} className="text-muted/30" />
        <motion.circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-foreground" style={{ fontSize: size < 52 ? '9px' : '11px' }}>
        {score}
      </span>
    </div>
  );
};

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

const SourceIcon: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded ${active ? 'text-primary bg-primary/10' : 'text-muted-foreground/30'}`}>
    {label}
  </span>
);

export const VaultCard: React.FC<VaultCardProps> = ({
  vault,
  showSignals = true,
  onSelect,
  layout = 'compact',
  displayIndex = 0,
  isBookmarked,
  compareMode = false,
  isCompareSelected = false,
  onCompareToggle,
}) => {
  const overall = vault.scores?.overall ?? 0;
  const hasMomentum = (vault.momentum ?? 0) > 70;
  const signals = vault.signalsSummary ?? { reddit: [], youtube: [], hn: [], ph: [] };
  const tierLabel = (vault.tier ?? 'free').toUpperCase();
  const tierStyle = tierStyles[vault.tier ?? 'free'] ?? tierStyles.free;

  const cardContent = (
    <motion.div
      className={`group relative rounded-2xl bg-gradient-to-br from-border/60 via-border/20 to-border/60 p-[1px] transition-all duration-300 hover:from-primary/40 hover:via-primary/10 hover:to-primary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${compareMode && isCompareSelected ? 'ring-2 ring-primary' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: displayIndex * 0.05 }}
      whileHover={{ y: -3 }}
      onClick={() => onSelect?.(vault.id)}
    >
      {compareMode && (
        <div className="absolute top-3 right-3 z-20" onClick={e => e.preventDefault()}>
          <input
            type="checkbox"
            checked={isCompareSelected}
            onChange={e => onCompareToggle?.(vault.id, e.target.checked)}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
        </div>
      )}
      <div className={`bg-card rounded-[calc(1rem-1px)] ${layout === 'expanded' ? 'p-5' : 'p-4'} h-full flex flex-col gap-3`}>

        {/* Top row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierStyle}`}>
            {tierLabel}
          </span>
          {hasMomentum && <span className="text-sm">🔥</span>}
          {showSignals && (
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {vault.signalsCount} signals
            </span>
          )}
        </div>

        {/* Title + score ring */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-serif font-bold text-foreground leading-tight line-clamp-2 ${layout === 'expanded' ? 'text-xl' : 'text-base'}`}>
            {vault.title}
          </h3>
          <div className="relative shrink-0">
            <ScoreRing score={overall} size={layout === 'expanded' ? 56 : 48} />
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {vault.tagline}
        </p>

        {/* Score bars — expanded only */}
        {layout === 'expanded' && vault.scores && (
          <div className="space-y-2 pt-1">
            <ScoreBar label="Opportunity" value={vault.scores.opportunity} />
            <ScoreBar label="Problem" value={vault.scores.problem} />
            <ScoreBar label="Feasibility" value={vault.scores.feasibility} />
            <ScoreBar label="Why Now" value={vault.scores.whyNow} />
          </div>
        )}

        {/* Source icons */}
        <div className="flex items-center gap-1 mt-auto pt-2">
          <SourceIcon label="r/" active={(signals.reddit?.length ?? 0) > 0} />
          <SourceIcon label="▶" active={(signals.youtube?.length ?? 0) > 0} />
          <SourceIcon label="Y" active={(signals.hn?.length ?? 0) > 0} />
          <SourceIcon label="PH" active={(signals.ph?.length ?? 0) > 0} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          <span>{vault.daysActive}d active</span>
          {vault.publishedAt && (
            <span>{new Date(vault.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          )}
          {layout === 'expanded' && (
            <span className="text-primary font-semibold">View Idea →</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <Link href={`/vault/${vault.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
};

export default VaultCard;
