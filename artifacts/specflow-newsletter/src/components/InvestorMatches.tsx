import { useEffect, useState } from 'react';
import { TierGate } from './TierGate';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail } from 'lucide-react';

interface InvestorMatch {
  id: number;
  overallScore: number;
  stageAlignment: number;
  industryMatch: number;
  reasons: string[];
  startupId: number;
  startupName: string;
  founderName: string;
}

interface InvestorProfile {
  id: number;
  subscriberId: number;
  firmName: string;
  investorName: string;
  bio?: string;
  linkedinUrl?: string;
  investmentThesis?: string;
  ticketSize?: string;
  focusGeography?: string[];
  verified?: boolean;
  profileImage?: string;
}

interface InvestorPreferences {
  preferredStages: string[];
  preferredIndustries: string[];
  checkSizeMin?: number;
  checkSizeMax?: number;
}

export function InvestorMatches() {
  const [matches, setMatches] = useState<InvestorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfile | null>(null);
  const [preferences, setPreferences] = useState<InvestorPreferences | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/investor/matches/1');

        if (!response.ok) {
          throw new Error('Failed to fetch investor matches');
        }

        const data = await response.json();
        setMatches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleInvestorClick = async (match: InvestorMatch) => {
    try {
      const response = await fetch(`/api/investor/profile/${match.startupId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedInvestor(data.profile);
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Failed to fetch investor profile:', err);
    }
  };

  const handleConnect = async (investorId: number) => {
    try {
      await fetch('/api/investor/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorId,
          startupSubscriberId: 1,
          initiatedBy: 'startup',
        }),
      });
      alert('Connection request sent!');
    } catch (err) {
      console.error('Failed to create connection:', err);
    }
  };

  return (
    <TierGate requiredTier="max">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-3xl mb-2">Investor Network</h2>
          <p className="text-muted-foreground">
            Connect with investors aligned with your stage and industry.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading investor matches...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No investor matches found yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleInvestorClick(match)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{match.founderName}</h3>
                    <p className="text-sm text-muted-foreground">{match.startupName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(match.overallScore)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stage Alignment</span>
                    <span className="font-medium">{Math.round(match.stageAlignment)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Industry Match</span>
                    <span className="font-medium">{Math.round(match.industryMatch)}%</span>
                  </div>
                </div>

                {match.reasons.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Why we matched:</p>
                    <ul className="text-sm space-y-1">
                      {match.reasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnect(match.startupId);
                  }}
                  className="w-full rounded-full flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}

        {selectedInvestor && (
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-2xl mb-2">{selectedInvestor.firmName}</h3>
                <p className="text-muted-foreground mb-2">{selectedInvestor.investorName}</p>
                {selectedInvestor.bio && (
                  <p className="text-sm mb-4 max-w-2xl">{selectedInvestor.bio}</p>
                )}
              </div>
              {selectedInvestor.verified && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Verified
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {selectedInvestor.ticketSize && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ticket Size</p>
                  <p className="font-medium">{selectedInvestor.ticketSize}</p>
                </div>
              )}
              {selectedInvestor.investmentThesis && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Investment Thesis</p>
                  <p className="text-sm">{selectedInvestor.investmentThesis}</p>
                </div>
              )}
            </div>

            {preferences && (
              <div className="space-y-3 mb-6">
                {preferences.preferredStages.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Preferred Stages</p>
                    <div className="flex flex-wrap gap-2">
                      {preferences.preferredStages.map((stage) => (
                        <div key={stage} className="bg-muted px-3 py-1 rounded text-sm">
                          {stage}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {preferences.preferredIndustries.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Focus Industries</p>
                    <div className="flex flex-wrap gap-2">
                      {preferences.preferredIndustries.map((industry) => (
                        <div key={industry} className="bg-muted px-3 py-1 rounded text-sm">
                          {industry}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {selectedInvestor.linkedinUrl && (
                <Button variant="outline" className="flex-1 rounded-full flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <a href={selectedInvestor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </Button>
              )}
              <Button
                onClick={() => handleConnect(selectedInvestor.id)}
                className="flex-1 rounded-full flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Connect
              </Button>
            </div>
          </div>
        )}
      </div>
    </TierGate>
  );
}
