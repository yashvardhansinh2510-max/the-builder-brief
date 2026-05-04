import React, { useState } from 'react';
import { useAuth } from '@clerk/react';
import { Redirect } from 'wouter';
import { Wand2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TierGate } from '@/components/TierGate';
import PublicNav from '@/components/PublicNav';

export default function IdeaAgent() {
  const { isLoaded, userId } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isLoaded) return null;
  if (!userId) return <Redirect to="/sign-in" />;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/idea-agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav activePage="agent" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <TierGate requiredTier="pro">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Wand2 className="w-8 h-8 text-primary" />
              <h1 className="font-serif text-4xl">AI Idea Agent</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Describe your idea or market opportunity. Get instant market analysis, competitor research, and GTM strategy.
            </p>
          </div>

          <Card className="p-8 mb-8">
            <div className="space-y-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g., A marketplace for indie hackers to sell their side projects... or a climate tech solution for carbon accounting..."
                className="w-full h-32 p-4 border border-border rounded-lg bg-background text-foreground font-mono text-sm resize-none"
              />
              <Button
                onClick={handleAnalyze}
                disabled={!query || loading}
                className="w-full h-12 rounded-lg"
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? 'Analyzing...' : 'Generate Market Analysis'}
              </Button>
            </div>
          </Card>

          {result && (
            <Card className="p-8 space-y-6">
              <div>
                <h3 className="font-serif text-2xl mb-3">Market Analysis</h3>
                <p className="text-muted-foreground whitespace-pre-line">{result.analysis}</p>
              </div>

              <div>
                <h3 className="font-serif text-2xl mb-3">Competitors</h3>
                <ul className="space-y-2">
                  {result.competitors?.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-2xl mb-3">Go-to-Market</h3>
                <p className="text-muted-foreground whitespace-pre-line">{result.gtm}</p>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="#" download>
                  Download Full Report
                </a>
              </Button>
            </Card>
          )}
        </TierGate>
      </main>
    </div>
  );
}
