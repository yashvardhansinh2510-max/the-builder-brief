import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLocation } from 'wouter';
import CompetitorScanner from '@/components/CompetitorScanner';

export default function CompetitorScannerPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/sign-in');
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <CompetitorScanner />;
}
