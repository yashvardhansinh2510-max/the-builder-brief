import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, ThumbsUp } from 'lucide-react';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import VaultScorecard from '@/components/VaultScorecard';
import VaultSignals from '@/components/VaultSignals';
import VaultMarketChart from '@/components/VaultMarketChart';
import VaultCard from '@/components/VaultCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useVaultDetail } from '@/hooks/useVaults';
import { usePageTracking, useTrack } from '@/hooks/useAnalytics';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

export default function VaultDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { data, isLoading: loading, isError, error: queryError } = useVaultDetail(id);
  const vault = data?.vault;
  const relatedVaults = data?.relatedVaults ?? [];
  const userFeedback = data?.userFeedback;
  const error = isError ? (queryError as Error) : null;
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [shareToast, setShareToast] = React.useState(false);

  usePageTracking(`/vault-detail/${id}`);
  const { track } = useTrack();

  useEffect(() => {
    if (vault) {
      track('vault_viewed', { vaultId: id, tier: vault.tier });
    }
  }, [vault?.id]);

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
    track('vault_liked', { vaultId: id, liked: next });
  };

  const handleSave = () => {
    const next = !saved;
    setSaved(next);
    postFeedback('save', next);
    track('vault_bookmarked', { vaultId: id, saved: next });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: vault?.title, url });
        postFeedback('share', true);
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    postFeedback('share', true);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

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
      <div className="min-h-screen bg-background">
        <PortalNav activePage="archive" />
        <main className="max-w-6xl mx-auto px-6 pt-16 pb-28">
          <Skeleton className="w-24 h-4 mb-8" />
          <div className="mb-12">
            <Skeleton className="w-20 h-5 rounded-full mb-4" />
            <Skeleton className="w-3/4 h-14 mb-3" />
            <Skeleton className="w-1/2 h-6 mb-3" />
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-5/6 h-4 mb-6" />
            <div className="flex gap-3">
              <Skeleton className="w-24 h-9 rounded-lg" />
              <Skeleton className="w-24 h-9 rounded-lg" />
              <Skeleton className="w-24 h-9 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-64 rounded-2xl" />
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !vault) {
    return (
      <div className="min-h-screen bg-background">
        <PortalNav activePage="archive" />
        <main className="max-w-6xl mx-auto px-6 pt-16 pb-28">
          <button
            onClick={() => setLocation('/vault-archive')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to archive
          </button>
          <div className="text-center py-24">
            <p className="font-serif text-2xl font-semibold text-foreground mb-2">Vault not found</p>
            {error && <p className="text-muted-foreground mb-6">{error.message}</p>}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PortalNav activePage="archive" />

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-28">
        {/* Back Button */}
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          onClick={() => setLocation('/vault-archive')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to archive
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="mb-12"
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
                {vault.tier?.toUpperCase()} TIER
              </div>
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-4">{vault.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{vault.tagline}</p>
              <p className="text-muted-foreground leading-relaxed max-w-3xl">{vault.problemStatement}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              {liked ? 'Liked' : 'Like'}
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                saved
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:border-border/60 hover:text-foreground transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            {shareToast && (
              <span className="absolute -bottom-8 left-0 text-xs text-muted-foreground bg-card border border-border px-3 py-1 rounded-lg shadow-sm whitespace-nowrap">
                Link copied!
              </span>
            )}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Scorecard */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-1 bg-card p-6 rounded-2xl border border-border"
          >
            <VaultScorecard scores={vault.scores} layout="vertical" />
          </motion.div>

          {/* Center Column - Details */}
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-2 space-y-8"
          >
            {/* Market Opportunity */}
            {vault.marketSize && (
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Market Opportunity</h3>
                <VaultMarketChart
                  title=""
                  marketSize={vault.marketSize}
                  tam={vault.tam}
                  keywords={vault.keywordsTrending}
                  height={250}
                />
              </div>
            )}

            {/* Description */}
            {vault.description && (
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">{vault.description}</p>
              </div>
            )}

            {/* Signals — shown here on mobile (before unit economics); hidden below the grid on desktop */}
            {vault.signalsCount > 0 && (
              <div className="lg:hidden bg-card p-6 rounded-2xl border border-border">
                <VaultSignals
                  signals={vault.signalsSummary}
                  totalCount={vault.signalsCount}
                  layout="horizontal"
                />
              </div>
            )}

            {/* Unit Economics */}
            {vault.unitEconomics && (
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Unit Economics</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Narrative */}
                  <div className="flex-1">
                    <p className="text-muted-foreground leading-relaxed">{vault.unitEconomics}</p>
                  </div>

                  {/* Quick Metrics Snapshot */}
                  <div className="w-full md:w-56 shrink-0 flex flex-col gap-3">
                    {[
                      {
                        label: "Opportunity",
                        value: `${vault.scores?.opportunity ?? "—"}/100`,
                        color:
                          (vault.scores?.opportunity ?? 0) >= 70
                            ? "text-green-600"
                            : (vault.scores?.opportunity ?? 0) >= 40
                            ? "text-amber-600"
                            : "text-destructive",
                      },
                      {
                        label: "Feasibility",
                        value: `${vault.scores?.feasibility ?? "—"}/100`,
                        color:
                          (vault.scores?.feasibility ?? 0) >= 70
                            ? "text-green-600"
                            : (vault.scores?.feasibility ?? 0) >= 40
                            ? "text-amber-600"
                            : "text-destructive",
                      },
                      {
                        label: "Confidence",
                        value: vault.verificationData
                          ? `${vault.verificationData.confidenceScore}%`
                          : "—",
                        color: "text-foreground",
                      },
                      {
                        label: "Verdict",
                        value: vault.verificationData
                          ? vault.verificationData.confidenceScore >= 70
                            ? "Healthy"
                            : vault.verificationData.confidenceScore >= 40
                            ? "Tight"
                            : "Broken"
                          : "—",
                        color: vault.verificationData
                          ? vault.verificationData.confidenceScore >= 70
                            ? "text-green-600"
                            : vault.verificationData.confidenceScore >= 40
                            ? "text-amber-600"
                            : "text-destructive"
                          : "text-muted-foreground",
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="bg-background border border-border rounded-xl p-3"
                      >
                        <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
                          {m.label}
                        </p>
                        <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Signals Section — hidden on mobile (shown inside the col above for correct ordering) */}
        {vault.signalsCount > 0 && (
          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="hidden lg:block mb-12 bg-card p-6 rounded-2xl border border-border"
          >
            <VaultSignals
              signals={vault.signalsSummary}
              totalCount={vault.signalsCount}
              layout="horizontal"
            />
          </motion.div>
        )}

        {/* Verification Data */}
        {vault.verificationData && (
          <motion.div
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 bg-card p-6 rounded-2xl border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Verification Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-xs font-medium text-primary mb-1">Market Size</p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {vault.verificationData.marketSizeVerified}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-xs font-medium text-purple-600 mb-1">TAM</p>
                <p className="text-sm font-semibold text-purple-900 capitalize">
                  {vault.verificationData.tamVerified}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-xs font-medium text-green-600 mb-1">Unit Economics</p>
                <p className="text-sm font-semibold text-green-900 capitalize">
                  {vault.verificationData.unitEconomicsVerified}
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs font-medium text-amber-600 mb-1">Confidence</p>
                <p className="text-sm font-semibold text-amber-900">
                  {vault.verificationData.confidenceScore}%
                </p>
              </div>
            </div>

            {vault.verificationData.issues.length > 0 && (
              <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                <p className="text-xs font-semibold text-destructive mb-2">Issues Found:</p>
                <ul className="text-sm text-destructive/80 space-y-1">
                  {vault.verificationData.issues.map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Related Vaults */}
        {relatedVaults.length > 0 && (
          <motion.div
            custom={5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12"
          >
            <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Similar Ideas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedVaults.map((rv, idx) => (
                <VaultCard key={rv.id} vault={rv} displayIndex={idx + 1} layout="compact" />
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-card border border-border rounded-2xl p-12 text-center"
        >
          <h2 className="font-serif text-3xl font-bold mb-3 text-foreground">Ready to build this?</h2>
          <p className="mb-6 max-w-md mx-auto text-muted-foreground">
            Join thousands of founders who've turned validated ideas into profitable businesses.
          </p>
          <button
            onClick={() => track('upgrade_clicked', { from: 'vault_detail', tier: vault.tier })}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Start Building
          </button>
        </motion.div>
      </main>

      <Footer variant="public" />
    </div>
  );
}
