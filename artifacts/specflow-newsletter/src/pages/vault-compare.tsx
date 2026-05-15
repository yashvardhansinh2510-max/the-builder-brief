import { useState, useEffect } from 'react';
import { useSearch, Link } from 'wouter';
import { ArrowLeft, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { usePageTracking } from '@/hooks/useAnalytics';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SCORE_COLORS = ['#E9591C', '#3B82F6', '#10B981'];

type CompareVault = {
  id: string;
  title: string;
  tier: string;
  locked?: boolean;
  scores?: { opportunity: number; problem: number; feasibility: number; whyNow: number; overall: number };
  marketSize?: string;
  signalsCount?: number;
  sourceAttribution?: { source: string }[];
  tagline?: string;
};

function computeVerdict(vaults: CompareVault[]): string {
  const real = vaults.filter(v => !v.locked);
  if (real.length < 2) return '';
  const scores = real.map(v => v.scores?.overall ?? 0);
  const maxIdx = scores.indexOf(Math.max(...scores));
  const feasScores = real.map(v => v.scores?.feasibility ?? 0);
  const maxFeasIdx = feasScores.indexOf(Math.max(...feasScores));
  const bestOverall = real[maxIdx]?.title ?? `Idea ${maxIdx + 1}`;
  const mostFeasible = real[maxFeasIdx]?.title ?? `Idea ${maxFeasIdx + 1}`;
  if (maxIdx === maxFeasIdx) {
    return `${bestOverall} leads on overall opportunity and is the most feasible pick.`;
  }
  return `${bestOverall} scores higher on overall opportunity. ${mostFeasible} is the most feasible to execute.`;
}

export default function VaultCompare() {
  usePageTracking('/vault-compare');
  const search = useSearch();
  const [vaults, setVaults] = useState<CompareVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ids = params.get('ids') || '';
    if (!ids) { setLoading(false); setError('No vault IDs provided.'); return; }

    fetch(`${API_BASE}/vaults/compare?ids=${ids}`)
      .then(r => r.json())
      .then(data => setVaults(data.vaults ?? []))
      .catch(() => setError('Failed to load vaults.'))
      .finally(() => setLoading(false));
  }, [search]);

  const scoreChartData = ['Overall', 'Opportunity', 'Feasibility', 'Problem', 'Why Now'].map(label => {
    const row: Record<string, string | number> = { name: label };
    vaults.forEach((v, i) => {
      const key = label === 'Why Now' ? 'whyNow' : label.toLowerCase();
      row[`vault${i}`] = !v.locked ? (v.scores as Record<string, number> | undefined)?.[key] ?? 0 : 0;
    });
    return row;
  });

  const verdict = computeVerdict(vaults);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        <Link href="/vault-archive" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-2">Idea Comparison</h1>
        <p className="text-muted-foreground mb-10">Comparing {vaults.length} idea{vaults.length !== 1 ? 's' : ''} side by side.</p>

        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && vaults.length > 0 && (
          <div className="space-y-8">
            {/* Header cards */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${vaults.length}, 1fr)` }}>
              {vaults.map((v, i) => (
                <div key={v.id} className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: SCORE_COLORS[i] }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{v.tier}</span>
                  </div>
                  <h2 className="font-bold text-lg mb-1">{v.title}</h2>
                  {v.locked ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      🔒 Upgrade to Pro to view full comparison data for this idea.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground line-clamp-2">{v.tagline}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Score Chart */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="font-bold text-base mb-4">Score Comparison</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreChartData} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Legend />
                  {vaults.map((v, i) => (
                    <Bar key={v.id} dataKey={`vault${i}`} name={v.title} fill={SCORE_COLORS[i]} radius={[0, 4, 4, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison rows */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
              <h2 className="font-bold text-base mb-2">At a Glance</h2>
              <div className="grid gap-2 border-b border-border pb-2" style={{ gridTemplateColumns: `120px repeat(${vaults.length}, 1fr)` }}>
                <span />
                {vaults.map((v, i) => (
                  <span key={v.id} className="text-xs font-bold text-center" style={{ color: SCORE_COLORS[i] }}>
                    {v.title.length > 20 ? v.title.slice(0, 20) + '…' : v.title}
                  </span>
                ))}
              </div>
              {/* Signals count */}
              <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${vaults.length}, 1fr)` }}>
                <span className="text-sm font-medium text-muted-foreground self-center">Signals</span>
                {vaults.map(v => (
                  <div key={v.id} className="text-center">
                    <span className="text-sm font-bold">{v.locked ? '—' : (v.signalsCount ?? 0)}</span>
                  </div>
                ))}
              </div>
              {/* Sources */}
              <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${vaults.length}, 1fr)` }}>
                <span className="text-sm font-medium text-muted-foreground self-center">Sources</span>
                {vaults.map(v => (
                  <div key={v.id} className="text-center text-sm">
                    {v.locked ? '—' : (v.sourceAttribution ?? []).map(s => s.source).join(', ') || '—'}
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict */}
            {verdict && (
              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 flex items-start gap-3">
                <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">Verdict</p>
                  <p className="text-sm text-foreground">{verdict}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
