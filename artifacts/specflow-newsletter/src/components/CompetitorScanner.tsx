import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, DollarSign, Share2, Zap, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CompetitorAnalysis {
  strengths: string;
  weaknesses: string;
  vulnerabilities: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    opportunity: string;
  }>;
  overallVulnerabilityScore: number;
  marketPosition: string;
  pricingStrategy: string;
  productFeatures: string;
  technicalStack: string;
  estimatedFunding: number;
  fundingStage: string;
  marketShare: number;
  growthRate: number;
  customerSentiment: string;
  analysisNotes: string;
}

export default function CompetitorScanner() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'input' | 'results'>('input');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);

  const [formData, setFormData] = useState({
    competitorName: '',
    productName: '',
    website: '',
    industry: '',
    targetAudience: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnalyze = async () => {
    if (!user?.email) {
      toast.error('Sign in to run competitor analysis');
      return;
    }

    if (!formData.competitorName || !formData.productName || !formData.industry || !formData.targetAudience) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/competitive-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze competitor');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setActiveTab('results');
      toast.success('Competitor analysis complete');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze competitor');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-500/20 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-500/20 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Competitor Vulnerability Engine</h3>
            <p className="text-sm text-muted-foreground">Analyze competitor weaknesses and market gaps</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'input'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Analyze
        </button>
        {analysis && (
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'results'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Results
          </button>
        )}
      </div>

      {activeTab === 'input' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="space-y-4"
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Competitor Name *
                </label>
                <input
                  type="text"
                  name="competitorName"
                  value={formData.competitorName}
                  onChange={handleInputChange}
                  placeholder="e.g., Notion, Linear"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="e.g., All-in-one workspace"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Industry *
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g., Productivity SaaS"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Audience *
              </label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                placeholder="e.g., Startups, enterprises, teams"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white font-medium py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Analyzing...' : 'Analyze Competitor'}
            </button>
          </motion.div>
        </form>
      )}

      {activeTab === 'results' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                <p className="text-sm text-foreground">Analyzing competitor...</p>
              </div>
            </div>
          )}
          {analysis && (
            <>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Vulnerability Score</span>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-600">{analysis.overallVulnerabilityScore}/100</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${analysis.overallVulnerabilityScore}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase">Funding</span>
                  </div>
                  <p className="font-semibold text-foreground">{analysis.fundingStage}</p>
                  <p className="text-sm text-muted-foreground mt-1">${analysis.estimatedFunding}M estimated</p>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase">Market Share</span>
                  </div>
                  <p className="font-semibold text-foreground">{analysis.marketShare}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysis.growthRate}% annual growth
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Vulnerabilities</h4>
                <div className="space-y-3">
                  {analysis.vulnerabilities.map((vuln, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{vuln.category}</p>
                          <p className="text-sm text-muted-foreground mt-1">{vuln.description}</p>
                        </div>
                        <Badge className={`${getSeverityColor(vuln.severity)} border`}>
                          {vuln.severity}
                        </Badge>
                      </div>
                      <div className="bg-green-50 rounded p-2 mt-2">
                        <p className="text-xs font-medium text-green-700 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Opportunity: {vuln.opportunity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="font-semibold text-foreground text-sm mb-2">Strengths</h5>
                  <p className="text-sm text-foreground">{analysis.strengths}</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h5 className="font-semibold text-foreground text-sm mb-2">Weaknesses</h5>
                  <p className="text-sm text-foreground">{analysis.weaknesses}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">Actionable Insights</h5>
                    <p className="text-sm text-foreground">{analysis.analysisNotes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-4">
                <h5 className="font-semibold text-foreground text-sm mb-2">Market Position</h5>
                <p className="text-sm text-foreground">{analysis.marketPosition}</p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
