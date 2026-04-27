import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, AlertCircle, Lightbulb, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface MarketAnalysis {
  tam: { estimate: number; reasoning: string; source: string };
  sam: { estimate: number; reasoning: string; serviceable: string };
  som: { estimate: number; reasoning: string; firstYear: string };
  marketTrends: string;
  competitorAnalysis: string;
  growthOpportunities: string;
  risks: string;
  analysis: string;
}

interface AnalysisReport {
  reportId: number;
  analysis: MarketAnalysis;
}

export default function MarketSizingEngine() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const [formData, setFormData] = useState({
    productDescription: '',
    industry: '',
    targetMarket: '',
  });

  useEffect(() => {
    if (user?.email) {
      loadLatestReport();
    }
  }, [user?.email]);

  const loadLatestReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/market-sizing/latest/${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setReport({ reportId: data.id, analysis: data });
      }
    } catch (error) {
      console.error('Failed to load latest report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email || !formData.productDescription || !formData.industry || !formData.targetMarket) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/market-sizing/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate market analysis');
      }

      const data = await response.json();
      setReport(data);
      toast.success('Market analysis generated! 📊');
      setFormData({
        productDescription: '',
        industry: '',
        targetMarket: '',
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to generate market analysis');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-serif text-5xl mb-2">Market Sizing Engine</h1>
          <p className="text-muted-foreground text-lg">Analyze your market opportunity with TAM, SAM, and SOM</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="border border-border rounded-xl p-6 sticky top-6">
              <h2 className="font-serif text-2xl mb-6">Analyze Your Market</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Product Description</label>
                  <textarea
                    value={formData.productDescription}
                    onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                    placeholder="What does your product do?"
                    rows={3}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., SaaS, Healthcare, FinTech"
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Target Market</label>
                  <input
                    type="text"
                    value={formData.targetMarket}
                    onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                    placeholder="e.g., Enterprise, SMB, Individual"
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full p-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {submitting ? 'Analyzing...' : 'Generate Analysis'} {!submitting && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Report */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {loading ? (
              <div className="flex items-center justify-center min-h-screen">Loading...</div>
            ) : report ? (
              <div className="space-y-6">
                {/* TAM/SAM/SOM */}
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border rounded-lg p-4 bg-blue-500/5"
                  >
                    <p className="text-xs text-muted-foreground mb-1">TAM</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(report.analysis.tam.estimate)}
                    </p>
                    <p className="text-xs mt-3 text-foreground">{report.analysis.tam.reasoning}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border border-border rounded-lg p-4 bg-green-500/5"
                  >
                    <p className="text-xs text-muted-foreground mb-1">SAM</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(report.analysis.sam.estimate)}
                    </p>
                    <p className="text-xs mt-3 text-foreground">{report.analysis.sam.serviceable}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="border border-border rounded-lg p-4 bg-amber-500/5"
                  >
                    <p className="text-xs text-muted-foreground mb-1">SOM (Year 1)</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(report.analysis.som.estimate)}
                    </p>
                    <p className="text-xs mt-3 text-foreground">{report.analysis.som.firstYear}</p>
                  </motion.div>
                </div>

                {/* Market Trends */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border border-border rounded-lg p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Market Trends</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {report.analysis.marketTrends}
                  </p>
                </motion.div>

                {/* Competitor Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border border-border rounded-lg p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Competitive Landscape</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {report.analysis.competitorAnalysis}
                  </p>
                </motion.div>

                {/* Growth Opportunities */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border border-border rounded-lg p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold">Growth Opportunities</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {report.analysis.growthOpportunities}
                  </p>
                </motion.div>

                {/* Risks */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border border-border rounded-lg p-6 bg-red-500/5 border-red-200"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold">Risks & Challenges</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {report.analysis.risks}
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="border border-border rounded-lg p-12 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Generate your first market analysis to see detailed TAM, SAM, and SOM breakdown with market insights.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
