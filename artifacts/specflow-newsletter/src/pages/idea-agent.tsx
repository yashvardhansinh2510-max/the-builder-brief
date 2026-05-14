import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Redirect } from 'wouter';
import { Wand2, Clock } from 'lucide-react';
import { TierGate } from '@/components/TierGate';
import PublicNav from '@/components/PublicNav';

export default function IdeaAgent() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!loading && !user) return <Redirect to="/sign-in" />;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav activePage="agent" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <TierGate requiredTier="pro">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wand2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl mb-4">AI Idea Agent</h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-8">
              Instant market analysis, competitor intelligence, and GTM strategy — generated from your idea in seconds.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Clock className="w-4 h-4" />
              Shipping next release
            </div>
          </div>
        </TierGate>
      </main>
    </div>
  );
}
