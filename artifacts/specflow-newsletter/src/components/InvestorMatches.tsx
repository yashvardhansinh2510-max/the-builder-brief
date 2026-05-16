import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Mail, CheckCircle, Lock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import investorsData from '@/lib/data/investors.json';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'wouter';

interface Investor {
  id: number;
  name: string;
  investorName: string;
  stage: string;
  focus: string[];
  checkSize: string;
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
  const { session, tier, isPremium } = useAuth();
  const isMax = tier === 'max' || tier === 'incubator';
  const isPro = tier === 'pro';

  const { data: investors = [], isLoading } = useQuery<Investor[]>({
    queryKey: ['investor-matches', session?.access_token],
    queryFn: async () => {
      const res = await fetch('/api/investor/founder-matches', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) return investorsData as Investor[];
      const data = await res.json();
      return data.length > 0 ? data : (investorsData as Investor[]);
    },
    enabled: !!session?.access_token && isPremium,
    staleTime: 10 * 60 * 1000,
    placeholderData: investorsData as Investor[],
  });

  // Pro: first 2 real, rest blurred. Max: all visible.
  const visibleCount = isMax ? investors.length : isPro ? 2 : 0;
  const visible = investors.slice(0, visibleCount);
  const locked = investors.slice(visibleCount);

  if (!isPremium) {
    return (
      <div className="border border-border/40 rounded-2xl bg-card p-8">
        <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-3">Investor Network</Badge>
        <h2 className="font-serif text-3xl tracking-tight mb-2">Investor <span className="italic text-primary">Intelligence</span></h2>
        <p className="text-muted-foreground text-sm mb-6">Access pre-vetted investors matched to your stage and sector.</p>
        <Link href="/pricing">
          <Button className="rounded-full">
            Upgrade to Pro <TrendingUp className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-border/40 rounded-2xl bg-card overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border/20">
        <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-3">Investor Network</Badge>
        <h2 className="font-serif text-3xl tracking-tight">Investor <span className="italic text-primary">Intelligence</span></h2>
        <p className="text-muted-foreground text-sm mt-2">Pre-vetted investors matched to your stage and sector.</p>
        {isPro && (
          <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Upgrade to Inner Circle to unlock all {investors.length} investor profiles
          </p>
        )}
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-border/40 rounded-xl p-6 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1.5"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /></div>
                  <Skeleton className="h-10 w-12" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visible cards */}
            {visible.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visible.map((investor) => (
                  <InvestorCard key={investor.id} investor={investor} />
                ))}
              </div>
            )}

            {/* Locked cards (blurred) */}
            {locked.length > 0 && (
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 blur-sm pointer-events-none select-none">
                  {locked.slice(0, 4).map((investor) => (
                    <InvestorCard key={investor.id} investor={investor} />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-background/60 to-background/90 rounded-xl">
                  <div className="text-center p-6">
                    <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="font-serif text-xl mb-1">{locked.length} more investors</p>
                    <p className="text-sm text-muted-foreground mb-4">Unlock the full network with Inner Circle</p>
                    <Link href="/pricing">
                      <Button className="rounded-full text-xs font-bold">
                        Upgrade to Inner Circle
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {investors.length === 0 && (
              <div className="border border-dashed border-border/40 rounded-xl p-12 text-center">
                <p className="text-muted-foreground">No investor matches yet. Complete your startup context to get matched.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InvestorCard({ investor }: { investor: Investor }) {
  return (
    <div className="border border-border/40 rounded-xl p-5 hover:border-primary/30 transition-all bg-card group">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-serif text-lg leading-tight truncate">{investor.name}</h3>
            {investor.verified && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
          </div>
          <p className="text-[11px] text-muted-foreground">{investor.investorName}</p>
          {investor.ticketSize && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{investor.stage} · {investor.ticketSize}</p>
          )}
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-xl font-black text-primary leading-none">{investor.matchScore}%</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Match</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Stage fit</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${investor.stageAlignment}%` }} />
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Industry fit</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${investor.industryMatch}%` }} />
          </div>
        </div>
      </div>

      {investor.reasons.length > 0 && (
        <ul className="mb-3 space-y-0.5">
          {investor.reasons.slice(0, 2).map((reason, i) => (
            <li key={i} className="text-[11px] text-muted-foreground">✓ {reason}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        {investor.linkedinUrl && (
          <Button variant="outline" size="sm" className="flex-1 rounded-full text-xs" asChild>
            <a href={investor.linkedinUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" /> LinkedIn
            </a>
          </Button>
        )}
        <Button size="sm" className="flex-1 rounded-full text-xs font-bold">
          <Mail className="w-3 h-3 mr-1" /> Request Intro
        </Button>
      </div>
    </div>
  );
}
