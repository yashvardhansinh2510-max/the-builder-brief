import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, ThumbsUp } from 'lucide-react';
import PortalNav from '@/components/PortalNav';
import VaultScorecard from '@/components/VaultScorecard';
import VaultSignals from '@/components/VaultSignals';
import VaultMarketChart from '@/components/VaultMarketChart';
import VaultCard from '@/components/VaultCard';
import { useVaults } from '@/hooks/useVaults';
import { usePageTracking } from '@/hooks/useAnalytics';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vault, loading, error, fetchVaultDetail } = useVaults();
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  usePageTracking(`/vault-detail/${id}`);

  useEffect(() => {
    if (id) {
      fetchVaultDetail(id);
    }
  }, [id, fetchVaultDetail]);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vault not found</p>
          <button
            onClick={() => navigate('/vault-archive')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading vault details...</p>
        </div>
      </div>
    );
  }

  if (error || !vault) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PortalNav activePage="archive" />
        <main className="max-w-6xl mx-auto px-6 pt-16 pb-28">
          <button
            onClick={() => navigate('/vault-archive')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to archive
          </button>
          <div className="text-center py-24">
            <p className="text-2xl font-semibold text-gray-900 mb-2">Vault not found</p>
            {error && <p className="text-gray-600 mb-6">{error.message}</p>}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav activePage="archive" />

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-28">
        {/* Back Button */}
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          onClick={() => navigate('/vault-archive')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
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
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                {vault.tier?.toUpperCase()} TIER
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">{vault.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{vault.tagline}</p>
              <p className="text-gray-700 leading-relaxed max-w-3xl">{vault.problemStatement}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              {liked ? 'Liked' : 'Like'}
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                saved
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
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
            className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200"
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
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Opportunity</h3>
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
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                <p className="text-gray-700 leading-relaxed">{vault.description}</p>
              </div>
            )}

            {/* Unit Economics */}
            {vault.unitEconomics && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Economics</h3>
                <p className="text-gray-700 leading-relaxed">{vault.unitEconomics}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Signals Section */}
        {vault.signalsCount > 0 && (
          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 bg-white p-6 rounded-lg border border-gray-200"
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
            className="mb-12 bg-white p-6 rounded-lg border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Verification Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs font-medium text-blue-600 mb-1">Market Size</p>
                <p className="text-sm font-semibold text-blue-900 capitalize">
                  {vault.verificationData.marketSizeVerified}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded border border-purple-200">
                <p className="text-xs font-medium text-purple-600 mb-1">TAM</p>
                <p className="text-sm font-semibold text-purple-900 capitalize">
                  {vault.verificationData.tamVerified}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="text-xs font-medium text-green-600 mb-1">Unit Economics</p>
                <p className="text-sm font-semibold text-green-900 capitalize">
                  {vault.verificationData.unitEconomicsVerified}
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs font-medium text-amber-600 mb-1">Confidence</p>
                <p className="text-sm font-semibold text-amber-900">
                  {vault.verificationData.confidenceScore}%
                </p>
              </div>
            </div>

            {vault.verificationData.issues.length > 0 && (
              <div className="p-4 bg-red-50 rounded border border-red-200">
                <p className="text-xs font-semibold text-red-600 mb-2">Issues Found:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {vault.verificationData.issues.map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Related Vaults - Placeholder */}
        <motion.div
          custom={5}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Similar Ideas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-3">Ready to build this?</h2>
          <p className="mb-6 max-w-md mx-auto text-blue-100">
            Join thousands of founders who've turned validated ideas into profitable businesses.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Start Building
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-6 bg-white mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">© {new Date().getFullYear()} The Build Brief</div>
          <div className="flex items-center gap-8 text-sm text-gray-600">
            <a href="/vault-archive" className="hover:text-gray-900 transition-colors">Archive</a>
            <a href="/about" className="hover:text-gray-900 transition-colors">About</a>
            <a href="/contact" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
