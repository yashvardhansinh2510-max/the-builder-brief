import { useEffect, useState } from 'react';
import { Vault } from '@/lib/vault-types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface VaultTeaserCardProps {
  blurScore?: boolean;
}

const SCORE_LABELS = [
  { key: 'opportunity' as const, label: 'Opportunity' },
  { key: 'problem' as const, label: 'Problem' },
  { key: 'feasibility' as const, label: 'Feasibility' },
  { key: 'whyNow' as const, label: 'Why Now' },
];

function ScorePill({ label, score, blur }: { label: string; score: number; blur: boolean }) {
  const color =
    score >= 75 ? 'bg-green-100 text-green-700' :
    score >= 50 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} ${blur ? 'blur-sm select-none' : ''}`}>
        {score}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function VaultTeaserCard({ blurScore = false }: VaultTeaserCardProps) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/vaults?pageSize=1&order=desc`)
      .then(r => r.json())
      .then(data => {
        const v = data?.vaults?.[0];
        if (v) setVault(v);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm animate-pulse">
        <div className="h-5 bg-muted rounded w-3/4 mb-3" />
        <div className="h-4 bg-muted rounded w-full mb-6" />
        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-6 w-10 bg-muted rounded-full" />
              <div className="h-3 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!vault) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
      <h3 className="font-serif font-bold text-lg leading-snug mb-1">{vault.title}</h3>
      <p className="text-sm text-muted-foreground mb-5 line-clamp-2">{vault.tagline}</p>
      <div className="flex gap-4 justify-center mb-5">
        {SCORE_LABELS.map(({ key, label }) => (
          <ScorePill
            key={key}
            label={label}
            score={vault.scores[key]}
            blur={blurScore}
          />
        ))}
      </div>
      {blurScore && (
        <p className="text-center text-xs text-muted-foreground italic">
          Sign in to see the full breakdown
        </p>
      )}
    </div>
  );
}
