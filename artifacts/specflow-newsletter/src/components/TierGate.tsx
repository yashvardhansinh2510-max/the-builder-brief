import { useAuth } from '@clerk/react';
import { Link } from 'wouter';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TIER_LIMITS, Tier } from '@/lib/tiers';
import { useEffect, useState } from 'react';

interface TierGateProps {
  requiredTier: Tier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function TierGate({ requiredTier, children, fallback }: TierGateProps) {
  const { userId } = useAuth();
  const [userTier, setUserTier] = useState<Tier>('free');

  useEffect(() => {
    if (!userId) {
      setUserTier('free');
      return;
    }

    const fetchUserTier = async () => {
      try {
        const response = await fetch('/api/user/tier');
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.tier || 'free');
        } else {
          setUserTier('free');
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error);
        setUserTier('free');
      }
    };

    fetchUserTier();
  }, [userId]);

  const tiers: Tier[] = ['free', 'pro', 'max'];
  const requiredIndex = tiers.indexOf(requiredTier);
  const userIndex = tiers.indexOf(userTier);

  if (userIndex >= requiredIndex) {
    return <>{children}</>;
  }

  return (
    fallback || (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-card border border-dashed border-border rounded-2xl">
        <Lock className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-serif text-2xl mb-2">
          {requiredTier === 'pro' ? 'Pro Feature' : 'Premium Feature'}
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Upgrade to {requiredTier === 'max' ? 'Max' : 'Pro'} to unlock this feature and access our full suite of execution tools.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/pricing">Upgrade Now</Link>
        </Button>
      </div>
    )
  );
}
