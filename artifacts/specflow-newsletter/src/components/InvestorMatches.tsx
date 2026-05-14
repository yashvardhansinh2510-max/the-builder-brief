import { useEffect, useState } from 'react';
import { TierGate } from './TierGate';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import investorsData from '@/lib/data/investors.json';
import { useAuth } from '@/lib/AuthContext';

interface Investor {
  id: number;
  name: string;
  investorName: string;
  stage: string;
  focus: string[];
  checkSize: string;
  thesis: string;
  matchScore: number;
  verified: boolean;
  bio: string;
  linkedinUrl: string;
  ticketSize: string;
  investmentThesis: string;
  focusGeography: string[];
  preferredStages: string[];
  preferredIndustries: string[];
  stageAlignment: number;
  industryMatch: number;
  reasons: string[];
}

export function InvestorMatches() {
  const { session } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Investor | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = session?.access_token;
        if (!token) {
          // Anonymous fallback — show mock data
          if (!cancelled) {
            setInvestors(investorsData as Investor[]);
            setLoading(false);
          }
          return;
        }
        const res = await fetch("/api/investor/founder-matches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();
        if (cancelled) return;
        // Fallback to mock if no matches exist in DB yet
        setInvestors(data.length > 0 ? data : (investorsData as Investor[]));
        setLoading(false);
      } catch {
        // On error, fall back to mock data so feature still shows for demo
        if (!cancelled) {
          setInvestors(investorsData as Investor[]);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-border rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-14" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : investors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No investor matches found yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investors.map((investor) => (
              <div
                key={investor.id}
                className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelected(selected?.id === investor.id ? null : investor)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{investor.name}</h3>
                    <p className="text-sm text-muted-foreground">{investor.investorName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{investor.stage} · {investor.checkSize}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {investor.matchScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stage Alignment</span>
                    <span className="font-medium">{investor.stageAlignment}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Industry Match</span>
                    <span className="font-medium">{investor.industryMatch}%</span>
                  </div>
                </div>

                {investor.reasons.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Why we matched:</p>
                    <ul className="text-sm space-y-1">
                      {investor.reasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="text-muted-foreground">• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full rounded-full flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Request Intro
                </Button>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-2xl">{selected.name}</h3>
                  {selected.verified && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{selected.investorName}</p>
                {selected.bio && (
                  <p className="text-sm mb-4 max-w-2xl">{selected.bio}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ticket Size</p>
                <p className="font-medium">{selected.ticketSize}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Investment Thesis</p>
                <p className="text-sm">{selected.investmentThesis}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {selected.preferredStages.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Preferred Stages</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.preferredStages.map((stage) => (
                      <div key={stage} className="bg-muted px-3 py-1 rounded text-sm">{stage}</div>
                    ))}
                  </div>
                </div>
              )}
              {selected.preferredIndustries.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Focus Industries</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.preferredIndustries.map((industry) => (
                      <div key={industry} className="bg-muted px-3 py-1 rounded text-sm">{industry}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selected.linkedinUrl && (
                <Button variant="outline" className="flex-1 rounded-full flex items-center gap-2" asChild>
                  <a href={selected.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    LinkedIn
                  </a>
                </Button>
              )}
              <Button className="flex-1 rounded-full flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Request Intro
              </Button>
            </div>
          </div>
        )}
      </div>
    </TierGate>
  );
}
