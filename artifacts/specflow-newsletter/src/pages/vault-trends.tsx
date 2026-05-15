import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Zap, Calendar, Radio, Lightbulb, Mail } from 'lucide-react';
import { Link } from 'wouter';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { usePageTracking } from '@/hooks/useAnalytics';
import { useAuth } from '@/lib/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const PIE_COLORS = ['#E9591C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const SOURCE_LABELS: Record<string, string> = {
  reddit: 'Reddit',
  youtube: 'YouTube',
  hn: 'Hacker News',
  ph: 'Product Hunt',
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
};

function HeatmapCell({ count, maxCount }: { count: number; maxCount: number }) {
  const intensity = maxCount > 0 ? count / maxCount : 0;
  const bg = intensity === 0
    ? 'bg-muted'
    : intensity < 0.33
    ? 'bg-primary/20'
    : intensity < 0.66
    ? 'bg-primary/50'
    : 'bg-primary';
  return <div className={`w-4 h-4 rounded-sm ${bg}`} title={`${count} vault${count !== 1 ? 's' : ''}`} />;
}

type TrendsData = {
  categoryCounts: { category: string; count: number; priorCount: number; growth: number }[];
  momentumLeaders: { id: string; title: string; momentum: number; tier: string }[];
  publishHeatmap: { date: string; count: number; avgConfidence: number }[];
  signalSources: { source: string; count: number; pct: number }[];
  opportunityGaps: { signal: string; signalCount: number }[];
};

export default function VaultTrends() {
  usePageTracking('/vault-trends');
  const { tier } = useAuth();
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAllowed = tier === 'pro' || tier === 'max' || tier === 'incubator';

  useEffect(() => {
    if (!isAllowed) { setLoading(false); return; }
    fetch(`${API_BASE}/analytics/vault-trends`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAllowed]);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <PortalNav activePage="vault-trends" />
        <div className="max-w-2xl mx-auto px-6 pt-40 text-center">
          <h1 className="font-serif text-3xl mb-4">Vault Trend Intelligence</h1>
          <p className="text-muted-foreground mb-6">
            Macro-level intelligence across the vault is available on Pro and Max plans.
          </p>
          <Link href="/pricing" className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90">
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    );
  }

  const maxHeatCount = Math.max(...(data?.publishHeatmap.map(d => d.count) ?? [1]), 1);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="vault-trends" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-2">Vault Intelligence</h1>
          <p className="text-muted-foreground">Macro trends across all published ideas. Updated daily.</p>
        </div>

        {loading && <p className="text-muted-foreground">Loading trends...</p>}

        {!loading && data && (
          <div className="space-y-8">

            {/* 1. Trending Categories */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Trending Categories</h2>
                <span className="text-xs text-muted-foreground ml-auto">Last 30 days vs. prior 30</span>
              </div>
              {data.categoryCounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No category data yet. Tag your vaults to see trends.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.categoryCounts} layout="vertical" margin={{ left: 100 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="This period" fill="#E9591C" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="priorCount" name="Prior period" fill="#E9591C33" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            {/* 2. Momentum Leaders */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Momentum Leaders</h2>
              </div>
              {data.momentumLeaders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No momentum data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.momentumLeaders.map((v, i) => (
                    <div key={v.id} className="flex items-center gap-4">
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/vault/${v.id}`} className="text-sm font-semibold hover:underline line-clamp-1">
                            {v.title}
                          </Link>
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                            {v.tier}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${v.momentum ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{v.momentum ?? 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Publish Heatmap */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Publish Activity</h2>
                <span className="text-xs text-muted-foreground ml-auto">Last 12 weeks</span>
              </div>
              {data.publishHeatmap.length === 0 ? (
                <p className="text-sm text-muted-foreground">No publish history yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {Array.from({ length: 12 }, (_, weekIdx) => {
                      const weekCells = data.publishHeatmap.slice(weekIdx * 7, weekIdx * 7 + 7);
                      return (
                        <div key={weekIdx} className="flex flex-col gap-1">
                          {Array.from({ length: 7 }, (_, dayIdx) => {
                            const cell = weekCells[dayIdx];
                            return <HeatmapCell key={dayIdx} count={cell?.count ?? 0} maxCount={maxHeatCount} />;
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span>Less</span>
                    {[0, 0.2, 0.5, 1].map((v, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${v === 0 ? 'bg-muted' : v < 0.33 ? 'bg-primary/20' : v < 0.66 ? 'bg-primary/50' : 'bg-primary'}`} />
                    ))}
                    <span>More</span>
                  </div>
                </div>
              )}
            </section>

            {/* 4. Signal Sources */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <Radio className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Signal Sources</h2>
              </div>
              {data.signalSources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No signal attribution data yet.</p>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width={240} height={240}>
                    <PieChart>
                      <Pie data={data.signalSources} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={100}>
                        {data.signalSources.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [val, SOURCE_LABELS[name as string] ?? name]} />
                      <Legend formatter={name => SOURCE_LABELS[name as string] ?? name} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {data.signalSources.map((s, i) => (
                      <div key={s.source} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-sm font-medium">{SOURCE_LABELS[s.source] ?? s.source}</span>
                        <span className="text-sm text-muted-foreground ml-auto">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 5. Opportunity Gaps */}
            <section className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Opportunity Gaps</h2>
                <span className="text-xs text-muted-foreground ml-auto">Signals with no matching vault yet</span>
              </div>
              <div className="space-y-3">
                {data.opportunityGaps.map((gap, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm font-semibold">{gap.signal}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{gap.signalCount} signals detected</p>
                    </div>
                    <a
                      href={`mailto:research@specflowai.com?subject=Vault+Opportunity+Gap&body=${encodeURIComponent(gap.signal)}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5" /> Suggest →
                    </a>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
