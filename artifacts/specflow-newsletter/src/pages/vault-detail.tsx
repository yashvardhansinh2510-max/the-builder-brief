import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, Heart, Copy, Lock } from 'lucide-react';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import VaultSignals from '@/components/VaultSignals';
import VaultMarketChart from '@/components/VaultMarketChart';
import VaultCard from '@/components/VaultCard';
import { useVaults } from '@/hooks/useVaults';
import { useAuth } from '@/lib/AuthContext';
import { usePageTracking } from '@/hooks/useAnalytics';
import { VerificationStatus } from '@/lib/vault-types';

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, max: 2, incubator: 3 };

const VERIFICATION_TOOLTIPS: Record<string, string> = {
  verified: 'Confirmed by multiple independent sources',
  unconfirmed: 'Data found but not cross-verified',
  contradicted: 'Conflicting data found across sources',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

function ScoreGauge({ score }: { score: number }) {
  const radius = 70;
  const arc = Math.PI * radius;
  const offset = arc - (score / 100) * arc;
  const stroke = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path
          d="M 10 90 A 70 70 0 0 1 170 90"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted/30"
          strokeLinecap="round"
        />
        <motion.path
          d="M 10 90 A 70 70 0 0 1 170 90"
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={arc}
          initial={{ strokeDashoffset: arc }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <span className="text-4xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground block">/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{value}</span>
      </div>
      <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function VaultDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { vault, relatedVaults, userFeedback, loading, error, fetchVaultDetail, bookmarkVault } = useVaults();
  const { tier: userTier } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  usePageTracking(`/vault-detail/${id}`);

  useEffect(() => {
    if (id) fetchVaultDetail(id);
  }, [id, fetchVaultDetail]);

  useEffect(() => {
    if (userFeedback) {
      setLiked(userFeedback.liked);
      setSaved(userFeedback.saved);
    }
  }, [userFeedback]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const postFeedback = (action: string, value: boolean) => {
    if (!id) return;
    fetch(`${API_BASE}/vaults/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, value }),
    }).catch(() => {});
  };

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    postFeedback('like', next);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const result = await bookmarkVault(id);
      setSaved(result.bookmarked);
    } catch {
      const next = !saved;
      setSaved(next);
      postFeedback('save', next);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: vault?.title, url });
        postFeedback('share', true);
        return;
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    postFeedback('share', true);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const canAccessExecution = (TIER_RANK[userTier] ?? 0) >= 1;

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Vault not found</p>
          <button
            onClick={() => setLocation('/vault-archive')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
          >
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (error || !vault) {
    return (
      <div className="min-h-screen bg-background">
        <PortalNav activePage="archive" />
        <main className="max-w-6xl mx-auto px-6 pt-36 pb-28">
          <button
            onClick={() => setLocation('/vault-archive')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to archive
          </button>
          <div className="text-center py-24">
            <p className="font-serif text-2xl font-semibold text-foreground mb-2">Vault not found</p>
            {error && <p className="text-muted-foreground">{error.message}</p>}
          </div>
        </main>
      </div>
    );
  }

  const vData = vault.verificationData as VerificationStatus | undefined;
  const tierStyles: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    pro: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    max: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };

  const executionSteps = [
    { n: 1, label: 'Validate the problem', detail: 'Interview 10 potential customers. Confirm they feel the pain described above.' },
    { n: 2, label: 'Define your ICP', detail: vault.tags?.length ? `Focus on: ${vault.tags.slice(0, 3).join(', ')} segment.` : 'Identify the specific customer who loses sleep over this problem.' },
    { n: 3, label: 'Build MVP', detail: (vault.scores?.feasibility ?? 0) >= 70 ? 'High feasibility score — a no-code MVP in 2 weeks is viable.' : 'Keep scope minimal. Validate before building the real thing.' },
    { n: 4, label: 'Price it', detail: vault.unitEconomics ? vault.unitEconomics.slice(0, 120) + '...' : 'Start at the top of your range. Founders almost always underprice.' },
    { n: 5, label: 'Find your first 10 customers', detail: vault.marketSize ? `Target the ${vault.marketSize} market. Go direct — cold email, communities, Twitter DMs.` : 'Manual outreach only. No ads until you have 10 paying customers.' },
    { n: 6, label: 'Ship and iterate', detail: "Weekly releases. Talk to every customer. Kill features that don't retain." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PortalNav activePage="archive" />

      <main className="max-w-6xl mx-auto px-6 pt-36 pb-28">

        {/* Back */}
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          onClick={() => setLocation('/vault-archive')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to archive
        </motion.button>

        {/* 1. Header Strip */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${tierStyles[vault.tier ?? 'free'] ?? tierStyles.free}`}>
              {(vault.tier ?? 'free').toUpperCase()}
            </span>
            {(vault.momentum ?? 0) > 70 && <span className="text-sm">🔥</span>}
            <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">
              {vault.daysActive} days active
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-4 leading-tight">
            {vault.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">{vault.tagline}</p>

          {vault.problemStatement && (
            <div className="border-l-4 border-primary pl-4 mb-6">
              <p className="text-muted-foreground leading-relaxed">{vault.problemStatement}</p>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-2 relative flex-wrap">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                saved
                  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Saved' : 'Save'}
              {(vault.bookmarkCount ?? 0) > 0 && (
                <span className="text-xs opacity-60">{vault.bookmarkCount}</span>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href).catch(() => {});
                setShareToast(true);
                setTimeout(() => setShareToast(false), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
            {shareToast && (
              <span className="absolute -bottom-8 left-0 text-xs bg-card border border-border px-3 py-1 rounded-lg shadow-sm whitespace-nowrap text-muted-foreground">
                Link copied!
              </span>
            )}
          </div>
        </motion.div>

        {/* 2. Scorecard Hero */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          variants={fadeUp}
          className="mb-10 bg-card border border-border rounded-2xl p-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Overall Score</p>
              <ScoreGauge score={vault.scores?.overall ?? 0} />
              {vData && (
                <span className={`mt-3 text-xs font-bold px-3 py-1 rounded-full ${
                  vData.confidenceScore >= 70
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : vData.confidenceScore >= 40
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                }`}>
                  Data Quality: {vData.confidenceScore}%
                </span>
              )}
            </div>
            {vault.scores && (
              <div className="flex-1 space-y-4 w-full">
                <ScoreBar label="Opportunity" value={vault.scores.opportunity} />
                <ScoreBar label="Problem Severity" value={vault.scores.problem} />
                <ScoreBar label="Feasibility" value={vault.scores.feasibility} />
                <ScoreBar label="Why Now" value={vault.scores.whyNow} />
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. Three-column layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={2}
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10"
        >

          {/* Left — Market Intelligence */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Market Intelligence</h3>
            {(vault.marketSize || vault.tam) && (
              <div className="space-y-2">
                {vault.marketSize && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Market Size</p>
                    <p className="text-2xl font-bold text-foreground">{vault.marketSize}</p>
                  </div>
                )}
                {vault.tam && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">TAM</p>
                    <p className="text-xl font-semibold text-foreground">{vault.tam}</p>
                  </div>
                )}
              </div>
            )}
            {vault.marketSize && (
              <VaultMarketChart
                title=""
                marketSize={vault.marketSize}
                tam={vault.tam}
                keywords={vault.keywordsTrending}
                height={160}
              />
            )}
            {vault.keywordsTrending && vault.keywordsTrending.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {vault.keywordsTrending.map(kw => (
                  <span key={kw} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{kw}</span>
                ))}
              </div>
            )}
          </div>

          {/* Center — The Thesis */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">The Thesis</h3>
            {vault.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{vault.description}</p>
            )}
            {vault.problemStatement && (
              <div className="border-l-4 border-primary pl-3">
                <p className="text-xs font-semibold text-primary mb-1">The Problem</p>
                <p className="text-sm text-muted-foreground">{vault.problemStatement}</p>
              </div>
            )}
            {vault.unitEconomics && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Unit Economics</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{vault.unitEconomics}</p>
              </div>
            )}
          </div>

          {/* Right — Signal Dashboard */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Signal Dashboard</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">{vault.signalsCount}</span>
              <span className="text-xs text-muted-foreground">total community signals</span>
            </div>
            {vault.signalsSummary && (
              <VaultSignals
                signals={vault.signalsSummary}
                totalCount={vault.signalsCount}
                layout="vertical"
              />
            )}
          </div>
        </motion.div>

        {/* 4. Verification */}
        {vData && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={3}
            variants={fadeUp}
            className="mb-10 bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">Verification Status</h3>
              <span className="text-xs text-muted-foreground">
                Last verified: {new Date(vault.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {([
                { label: 'Market Size', status: vData.marketSizeVerified },
                { label: 'TAM', status: vData.tamVerified },
                { label: 'Unit Economics', status: vData.unitEconomicsVerified },
                { label: 'Confidence', status: `${vData.confidenceScore}%` },
              ] as { label: string; status: string }[]).map(({ label, status }) => {
                const isNamedStatus = status === 'verified' || status === 'unconfirmed' || status === 'contradicted';
                const bg = status === 'verified'
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : status === 'contradicted'
                  ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  : 'bg-muted/50 border-border';
                const textColor = status === 'verified'
                  ? 'text-green-700 dark:text-green-400'
                  : status === 'contradicted'
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-foreground';
                return (
                  <div
                    key={label}
                    className={`p-4 rounded-xl border ${bg}`}
                    title={isNamedStatus ? VERIFICATION_TOOLTIPS[status] : ''}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                    <p className={`text-sm font-semibold capitalize ${textColor}`}>{status}</p>
                  </div>
                );
              })}
            </div>
            {vData.issues.length > 0 && (
              <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                <p className="text-xs font-semibold text-destructive mb-2">Issues Found:</p>
                <ul className="space-y-1 text-sm text-destructive/80">
                  {vData.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* 5. Execution Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={4}
          variants={fadeUp}
          className="mb-10 bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Build This</h3>
            <p className="text-xs text-muted-foreground mt-0.5">6-step execution playbook</p>
          </div>

          {canAccessExecution ? (
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {executionSteps.map(step => (
                  <div key={step.n} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              {vault.unitEconomics && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-primary mb-1">First Revenue Path</p>
                  <p className="text-sm text-foreground">{vault.unitEconomics}</p>
                </div>
              )}
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs font-bold text-foreground mb-1">First 10 Customers</p>
                <p className="text-sm text-muted-foreground">
                  {vault.marketSize
                    ? `In a ${vault.marketSize} market, your first 10 customers are reachable through direct outreach in niche communities, founder networks, and cold email to the ICP list you built in Step 2.`
                    : 'Manual outreach to your ICP. No ads, no growth hacks — just conversations. Aim for 10 paying customers before writing a single line of marketing copy.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative p-6 overflow-hidden">
              <div className="blur-sm select-none pointer-events-none space-y-4 opacity-60">
                {executionSteps.slice(0, 3).map(step => (
                  <div key={step.n} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-xs font-bold flex items-center justify-center shrink-0">
                      {step.n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                <Lock className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Pro & Max access required</p>
                <Link href="/pricing" className="px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Upgrade to unlock execution playbook
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* 6. Related Ideas */}
        {relatedVaults.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={5}
            variants={fadeUp}
            className="mb-10"
          >
            <h3 className="font-serif text-2xl font-bold text-foreground mb-5">Similar Ideas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedVaults.map((rv, idx) => (
                <VaultCard key={rv.id} vault={rv} layout="compact" displayIndex={idx} />
              ))}
            </div>
          </motion.div>
        )}

        {/* 7. Bottom CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={6}
          variants={fadeUp}
          className="bg-card border border-border rounded-2xl p-10 text-center"
        >
          {canAccessExecution ? (
            <>
              <h2 className="font-serif text-3xl font-bold mb-3 text-foreground">Ready to build this?</h2>
              <p className="mb-6 max-w-md mx-auto text-muted-foreground">Add it to your build list and start executing the playbook above.</p>
              <Link href="/blueprints" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                Add to Build List →
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-serif text-3xl font-bold mb-3 text-foreground">Want the full playbook?</h2>
              <p className="mb-6 max-w-md mx-auto text-muted-foreground">Upgrade to Pro or Max to unlock the 6-step execution checklist, first revenue path, and first 10 customers strategy for every idea.</p>
              <Link href="/pricing" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                Upgrade Now →
              </Link>
            </>
          )}
        </motion.div>
      </main>

      <Footer variant="public" />
    </div>
  );
}
