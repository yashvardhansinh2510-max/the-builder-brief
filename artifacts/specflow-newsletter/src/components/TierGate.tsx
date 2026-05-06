import { useAuth } from '@/lib/AuthContext';
import { Link } from 'wouter';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tier } from '@/lib/tiers';

interface TierGateProps {
  requiredTier: Tier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, max: 2, incubator: 2 };

export function TierGate({ requiredTier, children, fallback }: TierGateProps) {
  const { tier, tierLoading } = useAuth();

  if (tierLoading) return null;

  const requiredIndex = TIER_RANK[requiredTier] ?? 0;
  const userIndex = TIER_RANK[tier] ?? 0;

  if (userIndex >= requiredIndex) {
    return <>{children}</>;
  }

  return (
    fallback || (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-card border border-dashed border-border rounded-2xl">
        <Lock className="w-10 h-10 text-muted-foreground mb-4" />
        <h3 className="font-serif text-2xl mb-2">
          {requiredTier === 'max' ? 'Inner Circle Feature' : 'Pro Member Feature'}
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm text-sm leading-relaxed">
          {requiredTier === 'max' ? (
            <>Upgrade to the <span className="font-bold text-foreground">Inner Circle</span> plan to unlock this section and access the full execution toolkit.</>
          ) : (
            <>Upgrade to <span className="font-bold text-foreground">Pro</span> or the <span className="font-bold text-foreground">Inner Circle</span> plan to unlock this section and access the full execution toolkit.</>
          )}
        </p>
        <Button asChild className="rounded-full">
          <Link href="/pricing">Upgrade Now</Link>
        </Button>
      </div>
    )
  );
}
