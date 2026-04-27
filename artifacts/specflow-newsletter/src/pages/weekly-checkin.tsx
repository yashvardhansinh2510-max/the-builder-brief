import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLocation } from 'wouter';
import WeeklyCheckIn from '@/components/WeeklyCheckIn';

export default function WeeklyCheckInPage() {
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

  return <WeeklyCheckIn />;
}
